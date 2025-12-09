package com.zxb.aiproject.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 用户组DTO
 */
@Data
public class UserGroupDto {

    /**
     * 主键ID（更新时需要）
     */
    private Long id;

    /**
     * 用户组名称
     */
    @NotBlank(message = "用户组名称不能为空")
    private String groupName;

    /**
     * 用户组编码（唯一）
     */
    @NotBlank(message = "用户组编码不能为空")
    private String groupCode;

    /**
     * 用户组描述
     */
    private String description;

    /**
     * 状态：0-禁用, 1-启用
     */
    @NotNull(message = "状态不能为空")
    private Integer status;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 备注
     */
    private String remark;
}
