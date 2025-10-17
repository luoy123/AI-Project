package com.zxb.aiproject.common.result;

import com.zxb.aiproject.common.constant.ResultCode;
import lombok.Data;

import java.io.Serializable;

@Data
public class Result <T> implements Serializable{

    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 返回消息
     */
    private String message;

    /**
     * 返回数据
     */
    private T data;

    /**
     * 时间戳
     */
    private Long timestamp;

    public Result() {
        this.timestamp = System.currentTimeMillis();
    }

    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功返回，没有数据
     */
    public static <T> Result<T> success(){
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), null);
    }

    /**
     * 成功返回有数据
     */
    public static <T> Result<T> success(T data){
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data);
    }

    /**
     * 陈工返回自定义消息
     */
    public static <T> Result<T> success(String message, T data){
        return new Result<>(ResultCode.SUCCESS.getCode(), message, data);
    }

    /**
     * 失败返回
     */
    public static <T> Result<T> error(){
        return new Result<>(ResultCode.ERROR.getCode(), ResultCode.ERROR.getMessage(), null);
    }

    /**
     * 错误返回:自定义消息
     */
    public static <T> Result<T> error(String message){
        return new Result<>(ResultCode.ERROR.getCode(), message, null);
    }

    /**
     * 错误返回：自定义状态吗和消息
     */
    public static <T> Result<T> error(Integer code, String message){
        return new Result<>(code, message, null);
    }

    /**
     * 错误返回：根据ResultCode返回
     */
    public static <T> Result<T> error(ResultCode resultCode){
        return new Result<>(resultCode.getCode(), resultCode.getMessage(), null);
    }

    /**
     * 根据result 返回并带数据
     * @param resultCode
     * @param data
     * @return
     * @param <T>
     */
    public static <T> Result<T> error(ResultCode resultCode, T data){
        return new Result<>(resultCode.getCode(), resultCode.getMessage(), data);
    }


}
