package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Syslog日志实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_log_syslog")
public class SyslogEntry {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 监控系统收到日志的时间
     */
    @TableField("received_at")
    private LocalDateTime receivedAt;

    /**
     * 日志本身记录的事件时间
     */
    @TableField("event_time")
    private LocalDateTime eventTime;

    /**
     * 日志来源IP地址
     */
    @TableField("source_ip")
    private String sourceIp;

    /**
     * 设备类型
     */
    @TableField("device_type")
    private String deviceType;

    /**
     * Syslog Facility Code (0-23)
     */
    @TableField("facility")
    private Integer facility;

    /**
     * Syslog Severity Code (0-7)
     */
    @TableField("severity")
    private Integer severity;

    /**
     * 日志中的主机名
     */
    @TableField("hostname")
    private String hostname;

    /**
     * 日志内容
     */
    @TableField("message")
    private String message;

    /**
     * 匹配到的规则ID
     */
    @TableField("matched_rule_id")
    private Integer matchedRuleId;

    /**
     * 匹配到的事件ID
     */
    @TableField("matched_event_id")
    private Integer matchedEventId;

    /**
     * 是否已生成告警
     */
    @TableField("is_alert")
    private Boolean isAlert;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 非数据库字段，用于关联查询
    @TableField(exist = false)
    private String ruleName;

    @TableField(exist = false)
    private String eventName;

    @TableField(exist = false)
    private String eventColor;

    @TableField(exist = false)
    private String facilityName;

    @TableField(exist = false)
    private String severityName;
}
