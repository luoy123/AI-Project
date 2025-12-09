package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.CloudAlert;
import com.zxb.aiproject.mapper.CloudAlertMapper;
import com.zxb.aiproject.service.CloudAlertService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 云平台告警Service实现类
 */
@Service
public class CloudAlertServiceImpl extends ServiceImpl<CloudAlertMapper, CloudAlert> 
        implements CloudAlertService {
    
    @Override
    public List<CloudAlert> listByProvider(String provider) {
        LambdaQueryWrapper<CloudAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudAlert::getProvider, provider)
               .orderByDesc(CloudAlert::getAlertTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudAlert> listByProviderAndLevel(String provider, String alertLevel) {
        LambdaQueryWrapper<CloudAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudAlert::getProvider, provider)
               .eq(CloudAlert::getAlertLevel, alertLevel)
               .orderByDesc(CloudAlert::getAlertTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudAlert> listByProviderAndStatus(String provider, String alertStatus) {
        LambdaQueryWrapper<CloudAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudAlert::getProvider, provider)
               .eq(CloudAlert::getAlertStatus, alertStatus)
               .orderByDesc(CloudAlert::getAlertTime);
        return list(wrapper);
    }
    
    @Override
    public boolean resolveAlert(Long id) {
        CloudAlert alert = getById(id);
        if (alert != null) {
            alert.setAlertStatus("resolved");
            alert.setResolvedTime(LocalDateTime.now());
            return updateById(alert);
        }
        return false;
    }
    
    @Override
    public long countActiveAlerts(String provider) {
        LambdaQueryWrapper<CloudAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudAlert::getProvider, provider)
               .eq(CloudAlert::getAlertStatus, "active");
        return count(wrapper);
    }
}
