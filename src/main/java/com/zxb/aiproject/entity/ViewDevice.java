package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 视图设备实体类
 */
@Data
@TableName("view_device")
public class ViewDevice {
    
    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 设备名称
     */
    private String name;
    
    /**
     * 设备类型：camera-摄像头, nvr-录像机, monitor-显示器, switch-交换机, 
     * server-服务器, storage-存储设备, gateway-网关, other-其他
     */
    private String deviceType;
    
    /**
     * IP地址
     */
    private String ipAddress;
    
    /**
     * 设备状态：online-在线, offline-离线, warning-警告, fault-故障
     */
    private String status;
    
    /**
     * 设备位置/机房
     */
    private String location;
    
    /**
     * 制造商
     */
    private String manufacturer;
    
    /**
     * 设备型号
     */
    private String model;
    
    /**
     * 设备描述
     */
    private String description;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    /**
     * 逻辑删除：0-未删除, 1-已删除
     */
    @TableLogic
    private Integer deleted;
}
