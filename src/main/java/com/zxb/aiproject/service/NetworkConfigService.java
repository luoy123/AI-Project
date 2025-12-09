package com.zxb.aiproject.service;

import java.util.Map;

/**
 * 网络配置管理服务接口
 */
public interface NetworkConfigService {
    
    /**
     * 获取配置统计数据
     */
    Map<String, Object> getConfigStats();
    
    /**
     * 获取设备配置列表
     */
    Map<String, Object> getDeviceConfigs();
    
    /**
     * 获取设备配置列表（支持搜索和筛选）
     */
    Map<String, Object> getDeviceConfigs(String keyword, String timeFilter);
}
