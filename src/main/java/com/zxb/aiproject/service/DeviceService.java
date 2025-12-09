package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.Device;

import java.util.List;
import java.util.Map;

public interface DeviceService extends IService<Device> {

    /**
     * 根据分组ID查询设备列表
     */
    List<Device> getDevicesByGroupId(Long groupId);

    /**
     * 根据设备类型查询设备列表
     */
    List<Device> getDevicesByType(String type);

    /**
     * 搜索设备
     */
    List<Device> searchDevices(String keyword);

    /**
     * 获取设备统计信息
     */
    Map<String, Object> getDeviceStatistics();

    /**
     * 添加设备
     */
    boolean addDevice(Device device);

    /**
     * 更新设备
     */
    boolean updateDevice(Device device);

    /**
     * 删除设备
     */
    boolean deleteDevice(Long id);

    /**
     * 批量删除设备
     */
    boolean batchDeleteDevices(List<Long> ids);

    /**
     * 更新设备状态
     */
    boolean updateDeviceStatus(Long id, String status);

    /**
     * 检查IP是否已存在
     */
    boolean isIpExists(String ip, Long excludeId);
}
