package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 保存的过滤器实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_log_saved_filters")
public class LogSavedFilter {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 过滤器名称
     */
    @TableField("filter_name")
    private String filterName;

    /**
     * 日志类型
     */
    @TableField("log_type")
    private String logType;

    /**
     * 数据来源 (IP/网段, JSON格式)
     */
    @TableField(value = "source_ips", updateStrategy = FieldStrategy.IGNORED)
    private String sourceIps;

    /**
     * Facility (逗号分隔)
     */
    @TableField(value = "facilities", updateStrategy = FieldStrategy.IGNORED)
    private String facilities;

    /**
     * Severity (逗号分隔)
     */
    @TableField(value = "severities", updateStrategy = FieldStrategy.IGNORED)
    private String severities;

    /**
     * 包含关键字 (分号分隔)
     */
    @TableField(value = "include_keywords", updateStrategy = FieldStrategy.IGNORED)
    private String includeKeywords;

    /**
     * 排除关键字 (分号分隔)
     */
    @TableField(value = "exclude_keywords", updateStrategy = FieldStrategy.IGNORED)
    private String excludeKeywords;

    /**
     * 时间范围 (today, week, month, custom)
     */
    @TableField("time_range")
    private String timeRange;

    /**
     * 自定义开始时间
     */
    @TableField(value = "start_time", updateStrategy = FieldStrategy.IGNORED)
    private String startTime;

    /**
     * 自定义结束时间
     */
    @TableField(value = "end_time", updateStrategy = FieldStrategy.IGNORED)
    private String endTime;

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
}
