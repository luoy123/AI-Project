package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日志规则实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_log_rules")
public class LogRule {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 规则名称
     */
    @TableField("rule_name")
    private String ruleName;

    /**
     * 日志类型
     */
    @TableField("log_type")
    private String logType;

    /**
     * 日志来源类型
     */
    @TableField("source_type")
    private String sourceType;

    /**
     * 来源起始IP
     */
    @TableField("source_ip_start")
    private String sourceIpStart;

    /**
     * 来源结束IP
     */
    @TableField("source_ip_end")
    private String sourceIpEnd;

    /**
     * 日志条目过滤类型
     */
    @TableField("filter_type")
    private String filterType;

    /**
     * Syslog Facility (逗号分隔的数字)
     */
    @TableField("filter_facility")
    private String filterFacility;

    /**
     * Syslog Severity (逗号分隔的数字)
     */
    @TableField("filter_severity")
    private String filterSeverity;

    /**
     * 关键字 (分号分隔, 支持正则)
     */
    @TableField("filter_keywords")
    private String filterKeywords;

    /**
     * 生效时间类型
     */
    @TableField("effective_time_type")
    private String effectiveTimeType;

    /**
     * 生效开始时间
     */
    @TableField("effective_start_time")
    private LocalDateTime effectiveStartTime;

    /**
     * 生效结束时间
     */
    @TableField("effective_end_time")
    private LocalDateTime effectiveEndTime;

    /**
     * 是否启用
     */
    @TableField("is_enabled")
    private Boolean isEnabled;

    /**
     * 创建人
     */
    @TableField("created_by")
    private String createdBy;

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
    private List<LogEvent> events;

    @TableField(exist = false)
    private String filterSummary;
}
