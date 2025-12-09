package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备快照实体类
 */
@Data
@TableName("device_snapshot")
public class DeviceSnapshot {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 备份ID（关联device_config_backup表）
     */
    private Long backupId;
    
    /**
     * 设备ID
     */
    private Long deviceId;
    
    /**
     * 设备名称（快照）
     */
    private String deviceName;
    
    /**
     * 设备IP（快照）
     */
    private String deviceIp;
    
    /**
     * 设备类型（快照）
     */
    private String deviceType;
    
    /**
     * 设备状态（快照）：online-在线, offline-离线
     */
    private String deviceStatus;
    
    /**
     * 设备型号（快照）
     */
    private String deviceModel;
    
    /**
     * 分组ID（快照）
     */
    private Long groupId;
    
    /**
     * 分组名称（快照）
     */
    private String groupName;
    
    /**
     * CPU使用率（快照）
     */
    private BigDecimal cpuUsage;
    
    /**
     * 内存使用率（快照）
     */
    private BigDecimal memoryUsage;
    
    /**
     * 磁盘使用率（快照）
     */
    private BigDecimal diskUsage;
    
    /**
     * 运行时长（秒）
     */
    private Long uptime;
    
    /**
     * MAC地址
     */
    private String macAddress;
    
    /**
     * 接口数量
     */
    private Integer interfaceCount;
    
    /**
     * 序列号
     */
    private String serialNumber;
    
    /**
     * 制造商
     */
    private String manufacturer;
    
    /**
     * 物理位置
     */
    private String location;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 完整快照数据（JSON格式）
     */
    private String snapshotData;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
