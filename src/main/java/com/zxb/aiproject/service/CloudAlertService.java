package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.CloudAlert;

import java.util.List;

/**
 * 云平台告警Service接口
 */
public interface CloudAlertService extends IService<CloudAlert> {
    
    /**
     * 根据云平台提供商获取告警列表
     */
    List<CloudAlert> listByProvider(String provider);
    
    /**
     * 根据告警级别筛选
     */
    List<CloudAlert> listByProviderAndLevel(String provider, String alertLevel);
    
    /**
     * 根据告警状态筛选
     */
    List<CloudAlert> listByProviderAndStatus(String provider, String alertStatus);
    
    /**
     * 解决告警
     */
    boolean resolveAlert(Long id);
    
    /**
     * 获取活跃告警数量
     */
    long countActiveAlerts(String provider);
}
