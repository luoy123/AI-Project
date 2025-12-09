package com.zxb.aiproject.service;

import java.util.Map;

/**
 * 网络设备服务接口
 */
public interface NetworkDeviceService {
    
    /**
     * 获取设备统计数据
     */
    Map<String, Object> getDeviceStats();
    
    /**
     * 获取设备列表
     */
    Map<String, Object> getDeviceList(String type, String status, String keyword);
    
    /**
     * 获取设备详情
     */
    Map<String, Object> getDeviceDetail(Long id);
}
