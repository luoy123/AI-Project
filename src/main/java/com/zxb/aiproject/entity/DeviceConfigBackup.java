package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设备配置备份实体类
 */
@Data
@TableName("device_config_backup")
public class DeviceConfigBackup {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 设备ID，关联asset表
     */
    private Long deviceId;
    
    /**
     * 设备名称
     */
    private String deviceName;
    
    /**
     * 设备IP地址
     */
    private String deviceIp;
    
    /**
     * 设备类型（交换机、路由器、防火墙等）
     */
    private String deviceType;
    
    /**
     * 资产编码
     */
    private String assetCode;
    
    /**
     * 厂商
     */
    private String manufacturer;
    
    /**
     * 型号
     */
    private String model;
    
    /**
     * 版本号（如：v1.0, v1.1, v1.2）
     */
    private String version;
    
    /**
     * 备份时间
     */
    private LocalDateTime backupTime;
    
    /**
     * 备份状态：success-成功, failed-失败
     */
    private String backupStatus;
    
    /**
     * 备份文件大小
     */
    private String backupSize;
    
    /**
     * 操作员
     */
    private String operator;
    
    /**
     * 固件版本
     */
    private String firmwareVersion;
    
    /**
     * 配置文件校验和
     */
    private String configChecksum;
    
    /**
     * 最后配置变更时间
     */
    private LocalDateTime lastConfigChange;
    
    /**
     * 设备状态（online/offline/maintenance）
     */
    private String deviceStatus;
    
    /**
     * 运行时间
     */
    private String uptime;
    
    /**
     * CPU使用率（百分比）
     */
    private Integer cpuUsage;
    
    /**
     * 内存使用率（百分比）
     */
    private Integer memoryUsage;
    
    /**
     * 设备温度（摄氏度）
     */
    private Integer temperature;
    
    /**
     * MAC地址
     */
    private String macAddress;
    
    /**
     * 子网掩码
     */
    private String subnetMask;
    
    /**
     * 网关地址
     */
    private String gateway;
    
    /**
     * DNS服务器列表（JSON格式）
     */
    private String dnsServers;
    
    /**
     * 端口配置信息（JSON格式）
     */
    private String portConfig;
    
    /**
     * 完整设备快照信息（JSON格式）
     */
    private String deviceSnapshot;
    
    /**
     * 版本变更内容（JSON格式）
     */
    private String versionChanges;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 逻辑删除：0-未删除, 1-已删除
     */
    @TableLogic
    private Integer deleted;
}
