package com.zxb.aiproject.controller;

import com.zxb.aiproject.service.SystemBackupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统备份控制器
 */
@Slf4j
@RestController
@RequestMapping("/system-backup")
@CrossOrigin
public class SystemBackupController {

    @Autowired
    private SystemBackupService systemBackupService;

    /**
     * 执行系统备份
     */
    @PostMapping("/execute")
    public Map<String, Object> executeBackup() {
        log.info("手动执行系统备份");
        return systemBackupService.executeBackup();
    }

    /**
     * 获取备份列表
     */
    @GetMapping("/list")
    public Map<String, Object> getBackupList() {
        return systemBackupService.getBackupList();
    }

    /**
     * 下载备份文件
     */
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String filename) {
        String filePath = systemBackupService.getBackupFilePath(filename);
        
        if (filePath == null) {
            return ResponseEntity.notFound().build();
        }
        
        File file = new File(filePath);
        Resource resource = new FileSystemResource(file);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(resource);
    }

    /**
     * 删除备份文件
     */
    @DeleteMapping("/delete/{filename}")
    public Map<String, Object> deleteBackup(@PathVariable String filename) {
        Map<String, Object> result = new HashMap<>();
        
        boolean success = systemBackupService.deleteBackup(filename);
        if (success) {
            result.put("code", 200);
            result.put("message", "删除成功");
        } else {
            result.put("code", 500);
            result.put("message", "删除失败");
        }
        
        return result;
    }

    /**
     * 推送备份到远程地址
     */
    @PostMapping("/push")
    public Map<String, Object> pushBackup(@RequestBody Map<String, String> params) {
        String filename = params.get("filename");
        String targetUrl = params.get("targetUrl");
        
        if (filename == null || targetUrl == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("code", 400);
            result.put("message", "参数不完整");
            return result;
        }
        
        return systemBackupService.pushBackup(filename, targetUrl);
    }

    /**
     * 手动执行历史数据清理
     */
    @PostMapping("/cleanup")
    public Map<String, Object> cleanupHistoryData() {
        log.info("手动执行历史数据清理");
        return systemBackupService.cleanupHistoryData();
    }
}
