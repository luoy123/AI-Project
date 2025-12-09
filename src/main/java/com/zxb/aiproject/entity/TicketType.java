package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工单类型实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ticket_type")
public class TicketType {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 类型标识key
     */
    @TableField("type_key")
    private String typeKey;

    /**
     * 类型名称
     */
    @TableField("type_name")
    private String typeName;

    /**
     * 类型描述
     */
    @TableField("type_desc")
    private String typeDesc;

    /**
     * 图标CSS类名
     */
    @TableField("icon_class")
    private String iconClass;

    /**
     * 显示颜色代码
     */
    @TableField("color_code")
    private String colorCode;

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
