package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.IntegrationConfig;
import com.zxb.aiproject.mapper.IntegrationConfigMapper;
import com.zxb.aiproject.service.IntegrationConfigService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 对接配置Service实现类
 */
@Service
public class IntegrationConfigServiceImpl extends ServiceImpl<IntegrationConfigMapper, IntegrationConfig> 
        implements IntegrationConfigService {
    
    @Override
    public List<IntegrationConfig> getAllConfigs() {
        return list();
    }
    
    @Override
    public IntegrationConfig getConfigById(Long id) {
        return getById(id);
    }
    
    @Override
    public boolean addConfig(IntegrationConfig config) {
        config.setCreatedTime(LocalDateTime.now());
        config.setUpdatedTime(LocalDateTime.now());
        return save(config);
    }
    
    @Override
    public boolean updateConfig(IntegrationConfig config) {
        config.setUpdatedTime(LocalDateTime.now());
        return updateById(config);
    }
    
    @Override
    public boolean deleteConfig(Long id) {
        return removeById(id);
    }
}
