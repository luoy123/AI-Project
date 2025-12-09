package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 业务实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("business")
public class Business {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 业务名称
     */
    @TableField("name")
    private String name;

    /**
     * 业务编码
     */
    @TableField("code")
    private String code;

    /**
     * 父业务ID
     */
    @TableField("parent_id")
    private Long parentId;

    /**
     * 业务类型
     */
    @TableField("type")
    private String type;

    /**
     * 状态
     */
    @TableField("status")
    private String status;

    /**
     * 描述
     */
    @TableField("description")
    private String description;

    /**
     * 负责人
     */
    @TableField("owner")
    private String owner;

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
     * 逻辑删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}
