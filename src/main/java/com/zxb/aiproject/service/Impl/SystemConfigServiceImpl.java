package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.SystemConfig;
import com.zxb.aiproject.mapper.SystemConfigMapper;
import com.zxb.aiproject.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 系统配置服务实现类
 */
@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    @Autowired
    private SystemConfigMapper systemConfigMapper;

    @Override
    public List<SystemConfig> getAllConfigs() {
        return systemConfigMapper.selectList(null);
    }

    @Override
    public List<SystemConfig> getConfigsByCategory(String category) {
        QueryWrapper<SystemConfig> wrapper = new QueryWrapper<>();
        wrapper.eq("category", category);
        return systemConfigMapper.selectList(wrapper);
    }

    @Override
    public String getConfigValue(String key) {
        return getConfigValue(key, null);
    }

    @Override
    public String getConfigValue(String key, String defaultValue) {
        QueryWrapper<SystemConfig> wrapper = new QueryWrapper<>();
        wrapper.eq("config_key", key);
        SystemConfig config = systemConfigMapper.selectOne(wrapper);
        return config != null ? config.getConfigValue() : defaultValue;
    }

    @Override
    public Boolean getBooleanValue(String key, Boolean defaultValue) {
        String value = getConfigValue(key);
        if (value == null) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value);
    }

    @Override
    public Integer getIntegerValue(String key, Integer defaultValue) {
        String value = getConfigValue(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @Override
    @Transactional
    public void saveConfig(SystemConfig config) {
        QueryWrapper<SystemConfig> wrapper = new QueryWrapper<>();
        wrapper.eq("config_key", config.getConfigKey());
        SystemConfig existingConfig = systemConfigMapper.selectOne(wrapper);
        
        if (existingConfig != null) {
            // 更新现有配置
            config.setId(existingConfig.getId());
            config.setUpdateTime(LocalDateTime.now());
            systemConfigMapper.updateById(config);
        } else {
            // 插入新配置
            config.setCreateTime(LocalDateTime.now());
            config.setUpdateTime(LocalDateTime.now());
            systemConfigMapper.insert(config);
        }
    }

    @Override
    @Transactional
    public void batchSaveConfigs(Map<String, Object> configMap) {
        // 从configMap中提取category
        String category = (String) configMap.get("category");
        
        // 遍历配置项并保存
        for (Map.Entry<String, Object> entry : configMap.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // 跳过category字段
            if ("category".equals(key)) {
                continue;
            }
            
            SystemConfig config = new SystemConfig();
            config.setConfigKey(key);
            config.setConfigValue(value != null ? value.toString() : "");
            config.setCategory(category);
            
            // 根据值类型设置configType
            if (value instanceof Boolean) {
                config.setConfigType("boolean");
            } else if (value instanceof Number) {
                config.setConfigType("number");
            } else {
                config.setConfigType("string");
            }
            
            saveConfig(config);
        }
    }

    @Override
    @Transactional
    public void deleteConfig(String key) {
        QueryWrapper<SystemConfig> wrapper = new QueryWrapper<>();
        wrapper.eq("config_key", key);
        systemConfigMapper.delete(wrapper);
    }
}
