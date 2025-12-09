package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工单主表实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ops_ticket")
public class OpsTicket {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 工单编号
     */
    @TableField("ticket_no")
    private String ticketNo;

    /**
     * 工单标题
     */
    @TableField("title")
    private String title;

    /**
     * 工单描述
     */
    @TableField("description")
    private String description;

    /**
     * 优先级key
     */
    @TableField("priority_key")
    private String priorityKey;

    /**
     * 类型key
     */
    @TableField("type_key")
    private String typeKey;

    /**
     * 来源key
     */
    @TableField("source_key")
    private String sourceKey;

    /**
     * 状态: pending,processing,resolved,closed
     */
    @TableField("status")
    private String status;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private String creatorId;

    /**
     * 创建人姓名
     */
    @TableField("creator_name")
    private String creatorName;

    /**
     * 处理人ID
     */
    @TableField("assignee_id")
    private String assigneeId;

    /**
     * 处理人姓名
     */
    @TableField("assignee_name")
    private String assigneeName;

    /**
     * 关联资产ID
     */
    @TableField("asset_id")
    private Long assetId;

    /**
     * 关联设备ID
     */
    @TableField("device_id")
    private Long deviceId;

    /**
     * 关联设备名称（手动输入）
     */
    @TableField("device_name")
    private String deviceName;

    /**
     * 附件URL列表(JSON格式)
     */
    @TableField("attachment_urls")
    private String attachmentUrls;

    /**
     * 解决方案
     */
    @TableField("resolution")
    private String resolution;

    /**
     * 解决时间
     */
    @TableField("resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * 关闭时间
     */
    @TableField("closed_at")
    private LocalDateTime closedAt;

    /**
     * 逻辑删除标记（0-未删除, 1-已删除）
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

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
