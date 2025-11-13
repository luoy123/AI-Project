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

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;


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
        try {
            log.info("收到获取验证码请求");
            CaptchaVO captchaVO = captchaGenerator.generateCaptcha();
            log.info("验证码生成成功，key={}", captchaVO.getKey());
            return Result.success(captchaVO);
        } catch (Exception e) {
            log.error("生成验证码失败", e);
            return Result.error("生成验证码失败: " + e.getMessage());
        }
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
    public Result<String> logout(){
        return Result.success("登出成功");
    }


    /**
     * 获取当前用户信息（测试拦截器）
     * @return
     */
    @GetMapping("/info")
    @ApiOperation("获取当前用户信息")
    public Result<String> getUserInfo(HttpServletRequest request){
        // 从request中获取拦截器设置的username
        String username = (String) request.getAttribute("username");
        log.info("获取用户信息：{}", username);
        return Result.success("当前登录用户: " + username);
    }

    /**
     * 验证管理员密码（用于新增用户前的验证）
     * @param request 包含密码的请求体
     * @return 验证结果
     */
    @PostMapping("/verify-admin-password")
    @ApiOperation("验证管理员密码")
    public Result<Boolean> verifyAdminPassword(@RequestBody java.util.Map<String, String> request) {
        String password = request.get("password");
        log.info("验证管理员密码");
        
        if (password == null || password.trim().isEmpty()) {
            return Result.error("密码不能为空");
        }
        
        boolean isValid = userService.verifyAdminPassword(password);
        return Result.success(isValid);
    }

    /**
     * 新增用户
     * @param dto 用户新增DTO
     * @return 新增结果
     */
    @PostMapping("/add")
    @ApiOperation("新增用户")
    public Result<Boolean> addUser(@RequestBody @Validated com.zxb.aiproject.dto.UserAddDto dto) {
        log.info("新增用户: {}", dto.getUsername());
        boolean success = userService.addUser(dto);
        return success ? Result.success(true) : Result.error("新增用户失败");
    }

    /**
     * 更新用户
     * @param dto 用户更新DTO
     * @return 更新结果
     */
    @PutMapping("/update")
    @ApiOperation("更新用户")
    public Result<Boolean> updateUser(@RequestBody @Validated com.zxb.aiproject.dto.UserUpdateDto dto) {
        log.info("更新用户: {}", dto.getUsername());
        boolean success = userService.updateUser(dto);
        return success ? Result.success(true) : Result.error("更新用户失败");
    }

    /**
     * 获取所有用户列表（用于派发工单选择处理人）
     * @return 用户列表
     */
    @GetMapping("/list")
    @ApiOperation("获取所有用户列表")
    public Result<java.util.List<com.zxb.aiproject.entity.User>> getAllUsers() {
        log.info("获取所有用户列表");
        java.util.List<com.zxb.aiproject.entity.User> users = userService.getAllUsers();
        return Result.success(users);
    }
}
