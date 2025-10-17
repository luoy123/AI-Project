package com.zxb.aiproject.common.constant;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.web.client.HttpClientErrorException;

@AllArgsConstructor
@Getter
public enum ResultCode {

    SUCCESS(200,"操作成功"),
    ERROR(500,"操作失败"),

    PRAM_ERROR(400,"参数错误"),

    UNAUTHORIZED(401,"未授权，请先登录"),

    FORBIDDEN(403,"禁止访问"),

    NOT_FOUND(404,"未找到该资源"),

    LOGIN_ERROR(1001,"用户名或密码错误"),

    CAPTCHA_ERROR(1002,"验证码错误"),



    TOKEN_EXPIRED(1003,"登录过期"),

    TOKEN_INVALID(1004,"无效的token"),

    PASSWORD_ERROR(1005,"密码错误" ),

    USER_EXIST(2001,"用户已经存在"),

    USER_NOT_EXIST(2002,"用户不存在"),

    DEVICE_NOT_EXIST(3001,"设备不存在"),

    DEVICE_IP_EXIST(3002,"设备IP已经存在"),
    ;




    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 消息
     */
    private final String message;


}
