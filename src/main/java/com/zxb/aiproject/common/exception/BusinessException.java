package com.zxb.aiproject.common.exception;

import com.zxb.aiproject.common.constant.ResultCode;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class BusinessException extends RuntimeException{

    private Integer code;

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }


    public BusinessException(String message) {
        super(message);
        this.code = ResultCode.ERROR.getCode();
    }

}
