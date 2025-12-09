package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.IntegrationConfig;

import java.util.List;

/**
 * 对接配置Service接口
 */
public interface IntegrationConfigService extends IService<IntegrationConfig> {
    
    /**
     * 获取所有对接配置列表
     */
    List<IntegrationConfig> getAllConfigs();
    
    /**
     * 根据ID获取对接配置
     */
    IntegrationConfig getConfigById(Long id);
    
    /**
     * 添加对接配置
     */
    boolean addConfig(IntegrationConfig config);
    
    /**
     * 更新对接配置
     */
    boolean updateConfig(IntegrationConfig config);
    
    /**
     * 删除对接配置
     */
    boolean deleteConfig(Long id);
}
