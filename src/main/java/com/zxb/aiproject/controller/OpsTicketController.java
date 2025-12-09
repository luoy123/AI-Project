package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.AssignTicketDTO;
import com.zxb.aiproject.dto.CreateTicketDTO;
import com.zxb.aiproject.entity.OpsTicket;
import com.zxb.aiproject.service.OpsTicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 工单管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/tickets")
public class OpsTicketController {

    @Autowired
    private OpsTicketService ticketService;
    
    @org.springframework.beans.factory.annotation.Value("${file.upload-path}")
    private String uploadPath;

    /**
     * 创建工单
     */
    @PostMapping("/create")
    public Result<OpsTicket> createTicket(@Valid @RequestBody CreateTicketDTO createTicketDTO) {
        OpsTicket ticket = ticketService.createTicket(createTicketDTO);
        return Result.success(ticket);
    }

    /**
     * 分页查询工单列表
     */
    @GetMapping("/list")
    public Result<IPage<OpsTicket>> getTicketList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String typeKey,
            @RequestParam(required = false) String priorityKey,
            @RequestParam(required = false) String createdDate,
            @RequestParam(required = false) String keyword) {
        
        Page<OpsTicket> page = new Page<>(current, size);
        IPage<OpsTicket> result = ticketService.getTicketPage(page, status, creatorId, assigneeId, typeKey, priorityKey, createdDate, keyword);
        return Result.success(result);
    }

    /**
     * 查询未派发工单列表（支持筛选和搜索）
     */
    @GetMapping("/unassigned")
    public Result<IPage<OpsTicket>> getUnassignedTickets(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) String typeKey,
            @RequestParam(required = false) String priorityKey,
            @RequestParam(required = false) String createdDate,
            @RequestParam(required = false) String keyword) {
        
        Page<OpsTicket> page = new Page<>(current, size);
        IPage<OpsTicket> result = ticketService.getUnassignedTickets(page, creatorId, typeKey, priorityKey, createdDate, keyword);
        return Result.success(result);
    }

    /**
     * 查询我的工单列表（支持筛选）
     */
    @GetMapping("/my")
    public Result<IPage<OpsTicket>> getMyTickets(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam Long assigneeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String typeKey,
            @RequestParam(required = false) String priorityKey,
            @RequestParam(required = false) String keyword) {
        
        Page<OpsTicket> page = new Page<>(current, size);
        IPage<OpsTicket> result = ticketService.getMyTickets(page, assigneeId, status, typeKey, priorityKey, keyword);
        return Result.success(result);
    }

    /**
     * 派发工单
     */
    @PostMapping("/{ticketId}/assign")
    public Result<Boolean> assignTicket(@PathVariable Long ticketId, 
                                       @Valid @RequestBody AssignTicketDTO assignTicketDTO) {
        assignTicketDTO.setTicketId(ticketId);
        boolean success = ticketService.assignTicket(assignTicketDTO);
        return Result.success(success);
    }

    /**
     * 批量派发工单
     */
    @PostMapping("/batch-assign")
    public Result<Boolean> batchAssignTickets(@Valid @RequestBody AssignTicketDTO assignTicketDTO) {
        boolean success = ticketService.batchAssignTickets(assignTicketDTO);
        return Result.success(success);
    }

    /**
     * 开始处理工单
     */
    @PostMapping("/{ticketId}/start")
    public Result<Boolean> startProcessing(@PathVariable Long ticketId, 
                                          @RequestParam Long operatorId) {
        boolean success = ticketService.startProcessing(ticketId, operatorId);
        return Result.success(success);
    }

    /**
     * 完成工单
     */
    @PostMapping("/{ticketId}/complete")
    public Result<Boolean> completeTicket(@PathVariable Long ticketId, 
                                         @RequestParam Long operatorId) {
        boolean success = ticketService.completeTicket(ticketId, operatorId);
        return Result.success(success);
    }

    /**
     * 关闭工单
     */
    @PostMapping("/{ticketId}/close")
    public Result<Boolean> closeTicket(@PathVariable Long ticketId, 
                                      @RequestParam Long operatorId) {
        boolean success = ticketService.closeTicket(ticketId, operatorId);
        return Result.success(success);
    }

    /**
     * 获取工单详情
     */
    @GetMapping("/{ticketId}")
    public Result<OpsTicket> getTicketById(@PathVariable Long ticketId) {
        OpsTicket ticket = ticketService.getTicketById(ticketId);
        return Result.success(ticket);
    }
    
    /**
     * 更新工单
     */
    @PutMapping("/{ticketId}")
    public Result<Boolean> updateTicket(@PathVariable Long ticketId, 
                                        @RequestBody CreateTicketDTO updateTicketDTO) {
        log.info("更新工单: ticketId={}, data={}", ticketId, updateTicketDTO);
        boolean success = ticketService.updateTicket(ticketId, updateTicketDTO);
        return Result.success(success);
    }
    
    /**
     * 删除工单（逻辑删除）
     */
    @DeleteMapping("/{ticketId}")
    public Result<Boolean> deleteTicket(@PathVariable Long ticketId) {
        log.info("删除工单: ticketId={}", ticketId);
        boolean success = ticketService.deleteTicket(ticketId);
        if (success) {
            return Result.success(true);
        } else {
            return Result.error("删除失败");
        }
    }
    
    /**
     * 上传工单附件（批量）
     */
    @PostMapping("/upload")
    public Result<List<String>> uploadAttachments(@RequestParam("files") MultipartFile[] files) {
        log.info("=== 开始上传工单附件 ===");
        log.info("上传路径配置: {}", uploadPath);
        log.info("接收到文件数量: {}", files == null ? 0 : files.length);
        
        if (files == null || files.length == 0) {
            return Result.error("请选择要上传的文件");
        }
        
        if (files.length > 5) {
            return Result.error("最多只能上传5个文件");
        }
        
        List<String> fileUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            
            // 检查文件大小（10MB）
            if (file.getSize() > 10 * 1024 * 1024) {
                return Result.error("单个文件大小不能超过10MB");
            }
            
            try {
                // 生成文件名
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null) {
                    int lastDotIndex = originalFilename.lastIndexOf(".");
                    if (lastDotIndex > 0) {
                        extension = originalFilename.substring(lastDotIndex);
                    }
                }
                
                String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
                String datePath = new SimpleDateFormat("yyyy/MM/dd").format(new Date());
                String fullPath = uploadPath + datePath;
                
                // 创建目录
                Path directoryPath = Paths.get(fullPath);
                if (!Files.exists(directoryPath)) {
                    Files.createDirectories(directoryPath);
                }
                
                // 保存文件
                String filePath = fullPath + File.separator + newFilename;
                File destFile = new File(filePath);
                file.transferTo(destFile);
                
                // 生成访问URL
                String fileUrl = "/api/upload/" + datePath + "/" + newFilename;
                fileUrls.add(fileUrl);
                log.info("文件上传成功: {}", fileUrl);
                
            } catch (IOException e) {
                log.error("文件上传失败", e);
                return Result.error("文件上传失败: " + e.getMessage());
            }
        }
        
        return Result.success(fileUrls);
    }
}
