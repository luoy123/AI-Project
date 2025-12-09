package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检测模板实体类
 */
@Data
@TableName("detection_template")
public class DetectionTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * 检测类型：CPU监控、内存监控、磁盘监控、网络监控
     */
    private String detectionType;

    /**
     * 警告阈值
     */
    private BigDecimal warningThreshold;

    /**
     * 严重阈值
     */
    private BigDecimal criticalThreshold;

    /**
     * 检查间隔
     */
    private Integer checkInterval;

    /**
     * 间隔单位：minutes, hours
     */
    private String intervalUnit;

    /**
     * 描述
     */
    private String description;

    /**
     * 状态：1-启用，0-停用
     */
    private Integer status;

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
     * 逻辑删除：0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
