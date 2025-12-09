package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.SystemConfig;

import java.util.List;
import java.util.Map;

/**
 * 系统配置服务接口
 */
public interface SystemConfigService {
    
    /**
     * 获取所有配置
     */
    List<SystemConfig> getAllConfigs();
    
    /**
     * 根据分类获取配置
     */
    List<SystemConfig> getConfigsByCategory(String category);
    
    /**
     * 获取配置值
     */
    String getConfigValue(String key);
    
    /**
     * 获取配置值（带默认值）
     */
    String getConfigValue(String key, String defaultValue);
    
    /**
     * 获取布尔类型配置值
     */
    Boolean getBooleanValue(String key, Boolean defaultValue);
    
    /**
     * 获取整数类型配置值
     */
    Integer getIntegerValue(String key, Integer defaultValue);
    
    /**
     * 保存配置
     */
    void saveConfig(SystemConfig config);
    
    /**
     * 批量保存配置
     */
    void batchSaveConfigs(Map<String, Object> configMap);
    
    /**
     * 删除配置
     */
    void deleteConfig(String key);
}
