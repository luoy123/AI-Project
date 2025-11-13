package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 告警信息实体类
 */
@Data
@TableName("alert")
public class Alert implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 严重级别：critical-严重, warning-警告, info-信息
     */
    private String severity;

    /**
     * 告警消息
     */
    private String message;

    /**
     * 设备ID
     */
    private Long deviceId;

    /**
     * 设备名称
     */
    private String deviceName;

    /**
     * 设备类型
     */
    private String deviceType;

    /**
     * 状态：active-活动, acknowledged-已确认, resolved-已解决
     */
    private String status;

    /**
     * 详细描述
     */
    private String description;

    /**
     * 指标名称
     */
    private String metricName;

    /**
     * 指标值
     */
    private String metricValue;

    /**
     * 阈值
     */
    private String threshold;

    /**
     * 发生时间
     */
    private LocalDateTime occurredTime;

    /**
     * 确认时间
     */
    private LocalDateTime acknowledgedTime;

    /**
     * 解决时间
     */
    private LocalDateTime resolvedTime;

    /**
     * 确认人
     */
    private String acknowledgedBy;

    /**
     * 解决人
     */
    private String resolvedBy;

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
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
