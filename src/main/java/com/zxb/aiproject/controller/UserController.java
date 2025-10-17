package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.LoginDto;
import com.zxb.aiproject.service.UserService;
import com.zxb.aiproject.utils.CaptchaGenerator;
import com.zxb.aiproject.vo.CaptchaVO;
import com.zxb.aiproject.vo.LoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


/**
 * 用户服务
 */
@Slf4j
@RestController
@RequestMapping("/user")
@Api("用户管理")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private CaptchaGenerator captchaGenerator;

    /**
     * 获取验证码
     * @return
     */
    @GetMapping("/captcha")
    @ApiOperation("获取验证码")
    public Result<CaptchaVO> getCaptcha(){
        return Result.success(captchaGenerator.generateCaptcha());
    }

    /**
     * 登录
     * @param loginDto
     * @return
     */
    @PostMapping("/login")
    @ApiOperation("登录")
    public Result<LoginVO> login(@RequestBody @Validated LoginDto loginDto){
        log.info("用户登录：{}",loginDto.getUsername());
        LoginVO login = userService.login(loginDto);
        return Result.success(login);
    }

    @GetMapping("/logout")
    @ApiOperation("登出")
    public Result logout(){
        return Result.success("登出成功");
    }

}
