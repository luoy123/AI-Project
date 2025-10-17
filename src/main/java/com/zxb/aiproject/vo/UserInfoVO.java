package com.zxb.aiproject.vo;

import lombok.Data;

@Data
public class UserInfoVO {

    /**
     * 主键ID
     */
    private Long Id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 角色：admin-管理员, user-普通用户
     */
    private String role;

    /**
     * 头像URL
     */
    private String avatar;
}
