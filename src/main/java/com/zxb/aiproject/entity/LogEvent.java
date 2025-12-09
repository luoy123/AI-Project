package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 日志事件实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_log_events")
public class LogEvent {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 事件名称
     */
    @TableField("event_name")
    private String eventName;

    /**
     * 事件颜色
     */
    @TableField("event_color")
    private String eventColor;

    /**
     * 事件描述
     */
    @TableField("event_desc")
    private String eventDesc;

    /**
     * 是否启用
     */
    @TableField("is_active")
    private Boolean isActive;

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
