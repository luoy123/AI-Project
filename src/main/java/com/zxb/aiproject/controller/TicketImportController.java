package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.TicketImportResultDTO;
import com.zxb.aiproject.entity.TicketUploadHistory;
import com.zxb.aiproject.mapper.TicketUploadHistoryMapper;
import com.zxb.aiproject.service.TicketImportService;
import com.zxb.aiproject.service.TicketTemplateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * 工单导入控制器
 */
@Slf4j
@RestController
@RequestMapping("/tickets/import")
public class TicketImportController {

    @Autowired
    private TicketImportService ticketImportService;
    
    @Autowired
    private TicketUploadHistoryMapper uploadHistoryMapper;
    
    @Autowired
    private TicketTemplateService templateService;

    /**
     * 从文件导入工单
     * 支持 Excel(.xlsx,.xls)、CSV(.csv)、文本(.txt) 格式
     */
    @PostMapping("/file")
    public Result<TicketImportResultDTO> importFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long creatorId) {
        
        try {
            log.info("开始导入工单，文件名: {}, 创建人ID: {}", file.getOriginalFilename(), creatorId);
            
            TicketImportResultDTO result = ticketImportService.importTicketsFromFile(file, creatorId);
            
            log.info("工单导入完成，总数: {}, 成功: {}, 失败: {}", 
                    result.getTotalCount(), result.getSuccessCount(), result.getFailCount());
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("导入工单失败", e);
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 从文本内容智能导入工单
     */
    @PostMapping("/text")
    public Result<TicketImportResultDTO> importFromText(
            @RequestParam String content,
            @RequestParam Long creatorId) {
        
        try {
            log.info("开始从文本导入工单，创建人ID: {}", creatorId);
            
            TicketImportResultDTO result = ticketImportService.importTicketsFromText(content, creatorId);
            
            log.info("文本导入完成，总数: {}, 成功: {}, 失败: {}", 
                    result.getTotalCount(), result.getSuccessCount(), result.getFailCount());
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("从文本导入工单失败", e);
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 获取上传历史记录（分页）
     */
    @GetMapping("/history")
    public Result<IPage<TicketUploadHistory>> getUploadHistory(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Long uploaderId) {
        
        try {
            Page<TicketUploadHistory> page = new Page<>(current, size);
            QueryWrapper<TicketUploadHistory> queryWrapper = new QueryWrapper<>();
            
            if (uploaderId != null) {
                queryWrapper.eq("uploader_id", uploaderId);
            }
            
            queryWrapper.orderByDesc("created_at");
            
            IPage<TicketUploadHistory> result = uploadHistoryMapper.selectPage(page, queryWrapper);
            return Result.success(result);
        } catch (Exception e) {
            log.error("查询上传历史失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取最近的上传历史记录
     */
    @GetMapping("/history/recent")
    public Result<List<TicketUploadHistory>> getRecentHistory(
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(required = false) Long uploaderId) {
        
        try {
            QueryWrapper<TicketUploadHistory> queryWrapper = new QueryWrapper<>();
            
            if (uploaderId != null) {
                queryWrapper.eq("uploader_id", uploaderId);
            }
            
            queryWrapper.orderByDesc("created_at").last("LIMIT " + limit);
            
            List<TicketUploadHistory> records = uploadHistoryMapper.selectList(queryWrapper);
            return Result.success(records);
        } catch (Exception e) {
            log.error("查询最近上传历史失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 下载Excel模板
     */
    @GetMapping("/template/excel")
    public void downloadExcelTemplate(HttpServletResponse response) {
        try {
            log.info("下载Excel导入模板");
            templateService.downloadExcelTemplate(response);
        } catch (Exception e) {
            log.error("下载Excel模板失败", e);
        }
    }
    
    /**
     * 下载CSV模板
     */
    @GetMapping("/template/csv")
    public void downloadCsvTemplate(HttpServletResponse response) {
        try {
            log.info("下载CSV导入模板");
            templateService.downloadCsvTemplate(response);
        } catch (Exception e) {
            log.error("下载CSV模板失败", e);
        }
    }
    
    /**
     * 下载文本示例模板
     */
    @GetMapping("/template/text")
    public void downloadTextTemplate(HttpServletResponse response) {
        try {
            log.info("下载文本导入示例");
            templateService.downloadTextTemplate(response);
        } catch (Exception e) {
            log.error("下载文本模板失败", e);
        }
    }

    /**
     * 获取模板说明信息
     */
    @GetMapping("/template/info")
    public Result<String> getTemplateInfo() {
        // 返回模板下载说明
        String info = "工单导入模板说明：\n\n" +
                "Excel/CSV格式：\n" +
                "列1: 标题(必填)\n" +
                "列2: 描述\n" +
                "列3: 优先级(urgent/high/medium/low)\n" +
                "列4: 类型(incident/change/service/consultation/maintenance)\n" +
                "列5: 来源(user_report/system_monitor/api/email等)\n\n" +
                "文本格式：\n" +
                "每个工单用空行分隔\n" +
                "第一行为标题，后续行为描述\n" +
                "系统会自动识别关键词（紧急、故障、变更等）";
        
        return Result.success(info);
    }
}
