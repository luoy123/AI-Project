package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.IntegrationConfig;
import com.zxb.aiproject.service.IntegrationConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 对接配置Controller
 */
@RestController
@RequestMapping("/integration-config")
@CrossOrigin
public class IntegrationConfigController {
    
    @Autowired
    private IntegrationConfigService integrationConfigService;
    
    /**
     * 获取所有对接配置列表
     */
    @GetMapping("/list")
    public Map<String, Object> list() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<IntegrationConfig> configs = integrationConfigService.getAllConfigs();
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", configs);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 根据ID获取对接配置
     */
    @GetMapping("/get/{id}")
    public Map<String, Object> getById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            IntegrationConfig config = integrationConfigService.getConfigById(id);
            if (config != null) {
                result.put("code", 200);
                result.put("message", "获取成功");
                result.put("data", config);
            } else {
                result.put("code", 404);
                result.put("message", "配置不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 添加对接配置
     */
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody IntegrationConfig config) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = integrationConfigService.addConfig(config);
            if (success) {
                result.put("code", 200);
                result.put("message", "添加成功");
            } else {
                result.put("code", 500);
                result.put("message", "添加失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 更新对接配置
     */
    @PutMapping("/update/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody IntegrationConfig config) {
        Map<String, Object> result = new HashMap<>();
        try {
            config.setId(id);
            boolean success = integrationConfigService.updateConfig(config);
            if (success) {
                result.put("code", 200);
                result.put("message", "更新成功");
            } else {
                result.put("code", 500);
                result.put("message", "更新失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除对接配置
     */
    @DeleteMapping("/delete/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = integrationConfigService.deleteConfig(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
}
