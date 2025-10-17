package com.zxb.aiproject.vo;

import lombok.Data;

@Data
public class LoginVO {

    /**
     * token
     */
    private String token;

    /**
     * token类型
     */
    private String tokenType="Bearer";

    /**
     * 过期时间
     */
    private Long expireIn;

    /**
     * 用户信息
     */
    private UserInfoVO userInfo;

    public LoginVO(String Token,Long expireIn,UserInfoVO user){
        this.token=Token;
        this.expireIn=expireIn;
        this.userInfo=user;
    }
}
