package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.DeviceGroup;

import java.util.List;

public interface DeviceGroupService extends IService<DeviceGroup> {

    /**
     * 获取设备分组树
     */
    List<DeviceGroup> getDeviceGroupTree();

    /**
     * 根据父分组ID获取子分组
     */
    List<DeviceGroup> getChildGroups(Long parentId);

    /**
     * 添加设备分组
     */
    boolean addDeviceGroup(DeviceGroup deviceGroup);

    /**
     * 更新设备分组
     */
    boolean updateDeviceGroup(DeviceGroup deviceGroup);

    /**
     * 删除设备分组
     */
    boolean deleteDeviceGroup(Long id);
}
