package com.zxb.aiproject.service.Impl;

import com.zxb.aiproject.dto.TicketImportResultDTO;
import com.zxb.aiproject.entity.OpsTicket;
import com.zxb.aiproject.entity.TicketUploadHistory;
import com.zxb.aiproject.mapper.OpsTicketMapper;
import com.zxb.aiproject.mapper.TicketUploadHistoryMapper;
import com.zxb.aiproject.service.OpsTicketService;
import com.zxb.aiproject.service.TicketImportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * 工单导入服务实现（基于当前前端CSV模板的最小可用实现）
 */
@Slf4j
@Service
public class TicketImportServiceImpl implements TicketImportService {

    @Autowired
    private OpsTicketMapper opsTicketMapper;

    @Autowired
    private OpsTicketService opsTicketService;

    @Autowired
    private TicketUploadHistoryMapper uploadHistoryMapper;

    @Override
    public TicketImportResultDTO importTicketsFromFile(MultipartFile file, Long creatorId) {
        TicketImportResultDTO result = new TicketImportResultDTO();

        if (file == null || file.isEmpty()) {
            log.warn("导入文件为空");
            return result;
        }

        int total = 0;
        int success = 0;
        int fail = 0;

        String fileName = file.getOriginalFilename();
        long fileSize = file.getSize();
        String fileType = resolveFileType(fileName);

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int rowNumber = 0;
            boolean headerSkipped = false;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                // 第一行视为表头，直接跳过
                if (!headerSkipped) {
                    headerSkipped = true;
                    continue;
                }

                total++;

                try {
                    String[] cols = line.split(",", -1);
                    if (cols.length < 6) {
                        log.warn("第{}行列数不足，实际={}", rowNumber, cols.length);
                        addFailedRecord(result, rowNumber, safeGet(cols, 0), "列数不足，至少需要6列（标题,描述,优先级,类型,来源,创建人）");
                        fail++;
                        continue;
                    }

                    String title = safeGet(cols, 0);
                    String description = safeGet(cols, 1);
                    String priorityKey = safeGet(cols, 2);
                    String typeKey = safeGet(cols, 3);
                    String sourceKey = safeGet(cols, 4);
                    String creatorName = safeGet(cols, 5);

                    if (isBlank(title)) {
                        addFailedRecord(result, rowNumber, title, "标题不能为空");
                        fail++;
                        continue;
                    }
                    if (isBlank(priorityKey) || isBlank(typeKey) || isBlank(sourceKey)) {
                        addFailedRecord(result, rowNumber, title, "优先级/类型/来源不能为空");
                        fail++;
                        continue;
                    }

                    OpsTicket ticket = new OpsTicket();
                    // 使用既有的工单编号生成逻辑
                    String ticketNo = opsTicketService.generateTicketNo();
                    ticket.setTicketNo(ticketNo);
                    ticket.setTitle(title);
                    ticket.setDescription(description);
                    ticket.setPriorityKey(priorityKey);
                    ticket.setTypeKey(typeKey);
                    ticket.setSourceKey(sourceKey);
                    ticket.setStatus("pending");
                    ticket.setCreatorId(creatorId != null ? String.valueOf(creatorId) : "1");
                    ticket.setCreatorName(creatorName);
                    ticket.setCreatedAt(LocalDateTime.now());
                    ticket.setUpdatedAt(LocalDateTime.now());
                    ticket.setDeleted(0);

                    int rows = opsTicketMapper.insert(ticket);
                    if (rows > 0) {
                        success++;
                    } else {
                        addFailedRecord(result, rowNumber, title, "数据库插入失败");
                        fail++;
                    }
                } catch (Exception ex) {
                    log.error("解析第{}行数据失败", rowNumber, ex);
                    addFailedRecord(result, rowNumber, null, "解析或保存失败: " + ex.getMessage());
                    fail++;
                }
            }
        } catch (Exception e) {
            log.error("读取导入文件失败", e);
            // 整体失败时，记录一条总失败信息
            addFailedRecord(result, 0, fileName, "读取文件失败: " + e.getMessage());
        }

        result.setTotalCount(total);
        result.setSuccessCount(success);
        result.setFailCount(fail);

        // 写入上传历史记录（尽量不影响导入结果）
        try {
            TicketUploadHistory history = new TicketUploadHistory();
            history.setFileName(fileName);
            history.setFileSize(fileSize);
            history.setFileType(fileType);
            history.setUploaderId(creatorId);
            history.setUploaderName(null); // 如需可后续通过用户表补充
            history.setTotalCount(total);
            history.setSuccessCount(success);
            history.setFailCount(fail);
            history.setStatus(fail > 0 ? "failed" : "completed");
            if (fail > 0 && !result.getFailedRecords().isEmpty()) {
                history.setErrorMessage(result.getFailedRecords().get(0).getReason());
            }
            history.setCreatedAt(LocalDateTime.now());
            history.setUpdatedAt(LocalDateTime.now());
            uploadHistoryMapper.insert(history);
        } catch (Exception e) {
            log.error("写入上传历史失败", e);
        }

        return result;
    }

    @Override
    public TicketImportResultDTO importTicketsFromText(String content, Long creatorId) {
        // 目前暂不实现文本智能导入，只返回空结果，避免后端报错
        log.warn("importTicketsFromText 暂未实现，直接返回空结果");
        return new TicketImportResultDTO();
    }

    private void addFailedRecord(TicketImportResultDTO result, int rowNumber, String title, String reason) {
        TicketImportResultDTO.FailedRecord record = new TicketImportResultDTO.FailedRecord();
        record.setRowNumber(rowNumber);
        record.setTitle(title);
        record.setReason(reason);
        result.getFailedRecords().add(record);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String safeGet(String[] arr, int idx) {
        if (idx < 0 || idx >= arr.length) {
            return "";
        }
        String v = arr[idx];
        if (v == null) {
            return "";
        }
        // 去掉UTF-8 BOM等不可见字符
        return v.replace("\uFEFF", "").trim();
    }

    private String resolveFileType(String fileName) {
        if (fileName == null) {
            return "";
        }
        int dot = fileName.lastIndexOf('.');
        if (dot == -1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase();
    }
}
