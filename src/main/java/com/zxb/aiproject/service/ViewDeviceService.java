package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.ViewDevice;

import java.util.List;
import java.util.Map;

/**
 * 视图设备服务接口
 */
public interface ViewDeviceService {
    
    /**
     * 获取设备统计数据（用于顶部卡片）
     */
    Map<String, Object> getDeviceStatistics();
    
    /**
     * 获取设备类型分布（用于饼图）
     */
    List<Map<String, Object>> getDeviceTypeDistribution();
    
    /**
     * 获取故障设备统计（用于右侧列表）
     */
    Map<String, Object> getFaultDeviceStatistics();
    
    /**
     * 获取最近添加的设备
     */
    List<ViewDevice> getRecentDevices(Integer limit);
    
    /**
     * 获取设备列表（支持筛选）
     */
    List<ViewDevice> getDeviceList(String deviceType, String status, String location);
    
    /**
     * 获取设备详情
     */
    ViewDevice getDeviceById(Long id);
    
    /**
     * 添加设备
     */
    boolean addDevice(ViewDevice device);
    
    /**
     * 更新设备
     */
    boolean updateDevice(ViewDevice device);
    
    /**
     * 删除设备
     */
    boolean deleteDevice(Long id);
    
    /**
     * 获取近N天异常设备趋势
     */
    List<Map<String, Object>> getAbnormalTrend(int days);
    
    /**
     * 获取近N天设备可用性趋势
     */
    List<Map<String, Object>> getAvailabilityTrend(int days);
}
