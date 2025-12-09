package com.zxb.aiproject.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 用户更新DTO
 */
@Data
@ApiModel("用户更新DTO")
public class UserUpdateDto {

    @ApiModelProperty(value = "用户ID", required = true)
    @NotNull(message = "用户ID不能为空")
    private Long id;

    @ApiModelProperty(value = "用户名", required = true)
    @NotBlank(message = "用户名不能为空")
    private String username;

    @ApiModelProperty(value = "真实姓名", required = true)
    @NotBlank(message = "真实姓名不能为空")
    private String realName;

    @ApiModelProperty("邮箱")
    @Email(message = "邮箱格式不正确")
    private String email;

    @ApiModelProperty("手机号")
    private String phone;

    @ApiModelProperty("密码（留空则不修改）")
    private String password;

    @ApiModelProperty("头像URL")
    private String avatar;

    @ApiModelProperty("角色")
    private String role;

    @ApiModelProperty("状态：0-禁用, 1-启用")
    private Integer status;
}
