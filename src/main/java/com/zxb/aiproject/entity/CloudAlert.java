package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 云平台监控告警实体类
 */
@Data
@TableName("cloud_alert")
public class CloudAlert {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 告警ID
     */
    private String alertId;
    
    /**
     * 云平台提供商
     */
    private String provider;
    
    /**
     * 资源类型：vm/host/storage
     */
    private String resourceType;
    
    /**
     * 资源ID
     */
    private String resourceId;
    
    /**
     * 资源名称
     */
    private String resourceName;
    
    /**
     * 告警级别：info/warning/error/critical
     */
    private String alertLevel;
    
    /**
     * 告警信息
     */
    private String alertMessage;
    
    /**
     * 状态：active/resolved
     */
    private String alertStatus;
    
    /**
     * 告警时间
     */
    private LocalDateTime alertTime;
    
    /**
     * 解决时间
     */
    private LocalDateTime resolvedTime;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdTime;
}
