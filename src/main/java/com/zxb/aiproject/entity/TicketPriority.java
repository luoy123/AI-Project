package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工单优先级实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ticket_priority")
public class TicketPriority {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 优先级键值
     */
    @TableField("priority_key")
    private String priorityKey;

    /**
     * 优先级名称
     */
    @TableField("priority_name")
    private String priorityName;

    /**
     * 优先级描述
     */
    @TableField("priority_desc")
    private String description;

    /**
     * 优先级级别 (数字越小优先级越高)
     */
    @TableField("priority_level")
    private Integer priorityLevel;


    /**
     * 显示颜色代码
     */
    @TableField("color_code")
    private String colorCode;

    /**
     * 是否启用
     */
    @TableField("is_active")
    private Integer enabled;

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

    /**
     * 逻辑删除标记
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}
