package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 业务组件实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("business_component")
public class BusinessComponent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 组件ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 所属业务ID
     */
    @TableField("business_id")
    private Long businessId;

    /**
     * 组件名称
     */
    @TableField("name")
    private String name;

    /**
     * 组件类型 (api, web, microservice, database, cache, queue, etc.)
     */
    @TableField("type")
    private String type;

    /**
     * 组件状态 (running, stopped, error, maintenance)
     */
    @TableField("status")
    private String status;

    /**
     * 服务端口
     */
    @TableField("port")
    private Integer port;

    /**
     * 服务URL
     */
    @TableField("url")
    private String url;

    /**
     * 运行环境 (dev, test, prod)
     */
    @TableField("environment")
    private String environment;

    /**
     * 版本号
     */
    @TableField("version")
    private String version;

    /**
     * 组件描述
     */
    @TableField("description")
    private String description;

    /**
     * 健康检查URL
     */
    @TableField("health_check_url")
    private String healthCheckUrl;

    /**
     * 是否启用监控
     */
    @TableField("monitoring_enabled")
    private Boolean monitoringEnabled;

    /**
     * CPU使用率 (%)
     */
    @TableField("cpu_usage")
    private Double cpuUsage;

    /**
     * 内存使用量 (MB)
     */
    @TableField("memory_usage")
    private Long memoryUsage;

    /**
     * 运行时长
     */
    @TableField("uptime")
    private String uptime;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 是否删除 (0-未删除, 1-已删除)
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    // 关联的业务信息（非数据库字段）
    @TableField(exist = false)
    private Business business;
}
