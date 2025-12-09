package com.zxb.aiproject.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 用户新增DTO
 */
@Data
@ApiModel("用户新增DTO")
public class UserAddDto {

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

    @ApiModelProperty(value = "密码", required = true)
    @NotBlank(message = "密码不能为空")
    private String password;

    @ApiModelProperty("头像URL")
    private String avatar;

    @ApiModelProperty("角色：admin-管理员, user-普通用户")
    private String role;

    @ApiModelProperty("状态：0-禁用, 1-启用")
    @NotNull(message = "状态不能为空")
    private Integer status;
}
