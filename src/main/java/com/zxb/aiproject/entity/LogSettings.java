package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 日志配置实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_log_settings")
public class LogSettings {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 日志存储天数
     */
    @TableField("retention_days")
    private Integer retentionDays;

    /**
     * 日志转发服务器IP
     */
    @TableField("forward_server_ip")
    private String forwardServerIp;

    /**
     * 日志转发服务器端口
     */
    @TableField("forward_server_port")
    private Integer forwardServerPort;

    /**
     * 是否启用日志转发
     */
    @TableField("is_forward_enabled")
    private Boolean isForwardEnabled;

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
