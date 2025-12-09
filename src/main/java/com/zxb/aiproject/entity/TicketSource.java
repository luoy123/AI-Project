package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工单来源实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ticket_source")
public class TicketSource {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 来源标识key
     */
    @TableField("source_key")
    private String sourceKey;

    /**
     * 来源名称
     */
    @TableField("source_name")
    private String sourceName;

    /**
     * 来源描述
     */
    @TableField("source_desc")
    private String sourceDesc;

    /**
     * 图标CSS类名
     */
    @TableField("icon_class")
    private String iconClass;

    /**
     * 是否启用
     */
    @TableField("is_active")
    private Integer isActive;

    /**
     * 逻辑删除标记
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    /**
     * 排序顺序
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 创建人
     */
    @TableField(value = "created_by", fill = FieldFill.INSERT)
    private String createdBy;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新人
     */
    @TableField(value = "updated_by", fill = FieldFill.UPDATE)
    private String updatedBy;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 删除人
     */
    @TableField("deleted_by")
    private String deletedBy;

    /**
     * 删除时间
     */
    @TableField("deleted_at")
    private LocalDateTime deletedAt;
}
