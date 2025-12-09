package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统权限实体类
 */
@Data
@TableName("sys_permission")
public class SysPermission {
    
    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 权限名称
     */
    private String permissionName;
    
    /**
     * 权限代码（唯一标识）
     */
    private String permissionCode;
    
    /**
     * 父权限ID
     */
    private Long parentId;
    
    /**
     * 权限类型（menu-菜单，button-按钮，api-接口）
     */
    private String type;
    
    /**
     * 路径
     */
    private String path;
    
    /**
     * 图标
     */
    private String icon;
    
    /**
     * 排序顺序
     */
    private Integer sortOrder;
    
    /**
     * 状态（1-启用，0-禁用）
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
     * 删除标记（0-未删除，1-已删除）
     */
    @TableLogic
    private Integer deleted;
}
