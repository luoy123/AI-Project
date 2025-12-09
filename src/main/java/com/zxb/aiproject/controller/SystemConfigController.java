package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.SystemConfig;
import com.zxb.aiproject.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 系统配置控制器
 */
@RestController
@RequestMapping("/system-config")
@CrossOrigin
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    /**
     * 获取所有配置
     */
    @GetMapping("/list")
    public Map<String, Object> getAllConfigs() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SystemConfig> configs = systemConfigService.getAllConfigs();
            result.put("code", 200);
            result.put("data", configs);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 根据分类获取配置
     */
    @GetMapping("/category/{category}")
    public Map<String, Object> getConfigsByCategory(@PathVariable String category) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SystemConfig> configs = systemConfigService.getConfigsByCategory(category);
            result.put("code", 200);
            result.put("data", configs);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 获取单个配置值
     */
    @GetMapping("/get/{key}")
    public Map<String, Object> getConfigValue(@PathVariable String key) {
        Map<String, Object> result = new HashMap<>();
        try {
            String value = systemConfigService.getConfigValue(key);
            result.put("code", 200);
            result.put("data", value);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 批量保存配置
     */
    @PostMapping("/batch-save")
    public Map<String, Object> batchSaveConfigs(@RequestBody Map<String, Object> configMap) {
        Map<String, Object> result = new HashMap<>();
        try {
            systemConfigService.batchSaveConfigs(configMap);
            result.put("code", 200);
            result.put("message", "保存成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "保存失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 保存单个配置
     */
    @PostMapping("/save")
    public Map<String, Object> saveConfig(@RequestBody SystemConfig config) {
        Map<String, Object> result = new HashMap<>();
        try {
            systemConfigService.saveConfig(config);
            result.put("code", 200);
            result.put("message", "保存成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "保存失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 删除配置
     */
    @DeleteMapping("/delete/{key}")
    public Map<String, Object> deleteConfig(@PathVariable String key) {
        Map<String, Object> result = new HashMap<>();
        try {
            systemConfigService.deleteConfig(key);
            result.put("code", 200);
            result.put("message", "删除成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败：" + e.getMessage());
        }
        return result;
    }
}
