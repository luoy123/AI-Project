package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.DeviceConfigBackup;
import com.zxb.aiproject.entity.DeviceVersionHistory;

import java.util.List;
import java.util.Map;

/**
 * 设备配置备份Service
 */
public interface DeviceConfigBackupService {
    
    /**
     * 备份设备配置
     * @param deviceId 设备ID
     * @param operator 操作人
     * @return 备份结果
     */
    Map<String, Object> backupDeviceConfig(Long deviceId, String operator);
    
    /**
     * 获取配置管理列表（每个设备只显示最新版本）
     * @param keyword 关键字
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 配置列表
     */
    List<Map<String, Object>> getConfigList(String keyword, String startDate, String endDate);
    
    /**
     * 获取设备版本历史
     * @param deviceId 设备ID
     * @return 版本历史列表
     */
    List<DeviceVersionHistory> getVersionHistory(Long deviceId);
    
    /**
     * 获取指定版本的设备快照
     * @param backupId 备份ID
     * @return 设备快照信息
     */
    Map<String, Object> getDeviceSnapshot(Long backupId);
    
    /**
     * 获取设备的下一个版本号
     * @param deviceId 设备ID
     * @return 下一个版本号（如v1.0, v1.1, v1.2）
     */
    String getNextVersion(Long deviceId);
    
    /**
     * 获取设备的最新备份记录
     * @param deviceId 设备ID
     * @return 最新备份记录
     */
    DeviceConfigBackup getLatestBackup(Long deviceId);
    
    /**
     * 获取所有设备的最新备份列表
     * @return 每个设备的最新备份记录
     */
    List<DeviceConfigBackup> getAllLatestBackups();
}
