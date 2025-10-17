package com.zxb.aiproject.common.exception;

import com.zxb.aiproject.common.constant.ResultCode;
import com.zxb.aiproject.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Constants;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.validation.ConstraintViolationException;


@Slf4j
public class ClobalExceptionHandler {

    //处理自定义的异常
    @ExceptionHandler(BusinessException.class)
    public Result handleBusinessException(BusinessException e){
        log.error("业务异常:{}",e.getMessage());
        return Result.error(e.getCode(),e.getMessage());
    }

    //处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleMethodArgumentNotValidException(MethodArgumentNotValidException e){
        log.error("参数校验异常:{}",e.getMessage());
        return Result.error(ResultCode.PRAM_ERROR.getCode(),e.getBindingResult().getFieldError().getDefaultMessage());
    }

    //处理参数绑定异常
    @ExceptionHandler(BindException.class)
    public Result handleBindException(BindException e){
        log.error("参数绑定异常:{}",e.getMessage());
        return Result.error(ResultCode.PRAM_ERROR.getCode(),e.getBindingResult().getFieldError().getDefaultMessage());
    }

    //处理约束违反异常
    @ExceptionHandler(ConstraintViolationException.class)
    public Result handleConstraintViolationException(ConstraintViolationException e){
        log.error("参数约束违反异常:{}",e.getMessage());
        return Result.error(ResultCode.PRAM_ERROR.getCode(),e.getConstraintViolations().iterator().next().getMessage());
    }

    //处理其他自定义异常
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e){
        log.error("其他异常:{}",e.getMessage());
        return Result.error("系统异常，请联系管理员");
    }
}
