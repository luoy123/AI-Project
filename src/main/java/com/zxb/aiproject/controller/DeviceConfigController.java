package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.DeviceVersionHistory;
import com.zxb.aiproject.service.DeviceConfigBackupService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 设备配置管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/config-backup")
@Api(tags = "设备配置管理")
public class DeviceConfigController {
    
    @Autowired
    @Qualifier("deviceConfigBackupServiceTemp")
    private DeviceConfigBackupService configBackupService;
    
    /**
     * 备份设备配置
     */
    @PostMapping("/backup/{deviceId}")
    @ApiOperation("备份设备配置")
    public Map<String, Object> backupDeviceConfig(
            @ApiParam("设备ID") @PathVariable Long deviceId,
            @ApiParam("操作员") @RequestParam(defaultValue = "admin") String operator) {
        
        log.info("备份设备配置请求: deviceId={}, operator={}", deviceId, operator);
        
        try {
            Map<String, Object> result = configBackupService.backupDeviceConfig(deviceId, operator);
            log.info("备份设备配置响应: {}", result);
            return result;
        } catch (Exception e) {
            log.error("备份设备配置失败: deviceId={}", deviceId, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "备份失败: " + e.getMessage());
            return errorResult;
        }
    }
    
    /**
     * 获取配置管理列表
     */
    @GetMapping("/list")
    @ApiOperation("获取配置管理列表")
    public Map<String, Object> getConfigList(
            @ApiParam("关键字") @RequestParam(required = false) String keyword,
            @ApiParam("开始日期") @RequestParam(required = false) String startDate,
            @ApiParam("结束日期") @RequestParam(required = false) String endDate) {
        
        log.info("获取配置管理列表: keyword={}, startDate={}, endDate={}", keyword, startDate, endDate);
        
        try {
            List<Map<String, Object>> configList = configBackupService.getConfigList(keyword, startDate, endDate);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", configList);
            result.put("total", configList.size());
            result.put("message", "获取成功");
            
            return result;
        } catch (Exception e) {
            log.error("获取配置管理列表失败", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("data", new ArrayList<>());
            return errorResult;
        }
    }
    
    /**
     * 获取设备版本历史
     */
    @GetMapping("/history/{deviceId}")
    @ApiOperation("获取设备版本历史")
    public Map<String, Object> getVersionHistory(@ApiParam("设备ID") @PathVariable Long deviceId) {
        
        log.info("获取设备版本历史: deviceId={}", deviceId);
        
        try {
            List<DeviceVersionHistory> historyList = configBackupService.getVersionHistory(deviceId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", historyList);
            result.put("total", historyList.size());
            result.put("message", "获取成功");
            
            return result;
        } catch (Exception e) {
            log.error("获取设备版本历史失败: deviceId={}", deviceId, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("data", new ArrayList<>());
            return errorResult;
        }
    }
    
    /**
     * 获取设备快照
     */
    @GetMapping("/snapshot/{backupId}")
    @ApiOperation("获取设备快照")
    public Map<String, Object> getDeviceSnapshot(@ApiParam("备份ID") @PathVariable Long backupId) {
        
        log.info("获取设备快照: backupId={}", backupId);
        
        try {
            // Service已经返回完整的响应结构，直接返回即可
            return configBackupService.getDeviceSnapshot(backupId);
        } catch (Exception e) {
            log.error("获取设备快照失败: backupId={}", backupId, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("data", new HashMap<>());
            return errorResult;
        }
    }
    
    /**
     * 获取设备下一个版本号
     */
    @GetMapping("/next-version/{deviceId}")
    @ApiOperation("获取设备下一个版本号")
    public Map<String, Object> getNextVersion(@ApiParam("设备ID") @PathVariable Long deviceId) {
        
        log.info("获取设备下一个版本号: deviceId={}", deviceId);
        
        try {
            String nextVersion = configBackupService.getNextVersion(deviceId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("version", nextVersion);
            result.put("message", "获取成功");
            
            return result;
        } catch (Exception e) {
            log.error("获取设备下一个版本号失败: deviceId={}", deviceId, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("version", "v1.0");
            return errorResult;
        }
    }
    
    /**
     * 获取设备最新备份
     */
    @GetMapping("/latest/{deviceId}")
    @ApiOperation("获取设备最新备份")
    public Map<String, Object> getLatestBackup(@ApiParam("设备ID") @PathVariable Long deviceId) {
        
        log.info("获取设备最新备份: deviceId={}", deviceId);
        
        try {
            Object latestBackup = configBackupService.getLatestBackup(deviceId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", latestBackup);
            result.put("message", "获取成功");
            
            return result;
        } catch (Exception e) {
            log.error("获取设备最新备份失败: deviceId={}", deviceId, e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("data", null);
            return errorResult;
        }
    }
    
    /**
     * 获取所有设备最新备份列表
     */
    @GetMapping("/latest-all")
    @ApiOperation("获取所有设备最新备份列表")
    public Map<String, Object> getAllLatestBackups() {
        
        log.info("获取所有设备最新备份列表");
        
        try {
            List<?> latestBackups = configBackupService.getAllLatestBackups();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", latestBackups);
            result.put("total", latestBackups.size());
            result.put("message", "获取成功");
            
            return result;
        } catch (Exception e) {
            log.error("获取所有设备最新备份列表失败", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "获取失败: " + e.getMessage());
            errorResult.put("data", new ArrayList<>());
            return errorResult;
        }
    }
}
