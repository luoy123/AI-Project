package com.zxb.aiproject.service.Impl;

import cn.hutool.core.bean.BeanUtil;
import com.zxb.aiproject.common.constant.ResultCode;
import com.zxb.aiproject.common.exception.BusinessException;
import com.zxb.aiproject.config.JwtProperties;
import com.zxb.aiproject.dto.LoginDto;
import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.mapper.UserMapper;
import com.zxb.aiproject.service.UserService;
import com.zxb.aiproject.utils.CaptchaGenerator;
import com.zxb.aiproject.utils.JwtTokenUtil;
import com.zxb.aiproject.utils.Md5Util;
import com.zxb.aiproject.vo.LoginVO;
import com.zxb.aiproject.vo.UserInfoVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private CaptchaGenerator captchaGenerator;

    @Autowired
    private PasswordEncoder passwordEncoder;



    @Override
    public LoginVO login(LoginDto loginDto) {
        //1.验证验证码
        log.debug("验证码验证: key={}, input={}", loginDto.getCaptchaKey(), loginDto.getCaptcha());
        if(!captchaGenerator.verifyCaptcha(loginDto.getCaptchaKey(),loginDto.getCaptcha())){
            log.warn("验证码验证失败: key={}, input={}", loginDto.getCaptchaKey(), loginDto.getCaptcha());
            throw new BusinessException(ResultCode.CAPTCHA_ERROR);
        }


        //2.查询用户名
        User userByUserName = getUserByUserName(loginDto.getUsername());
        if(userByUserName == null){
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        log.info("loginDto.getpassword():{},userByUserName:{}",Md5Util.encrypt(loginDto.getPassword()),userByUserName.getPassword());
        //3.验证密码
        if(!Md5Util.verify(loginDto.getPassword(),userByUserName.getPassword())){
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }
        //4.查看用户状态
        if(userByUserName.getStatus() != 1){
            throw new BusinessException("用户被禁用");
        }
        //5.生成token
        String token = jwtTokenUtil.generateToken(userByUserName.getUsername());

        UserInfoVO userInfoVO = BeanUtil.copyProperties(userByUserName,UserInfoVO.class);

        //6.返回登录的结果
        return new LoginVO(token,jwtProperties.getExpiration(),userInfoVO);
    }



    @Override
    public User getUserByUserName(String username) {
        return userMapper.getUserByUserName(username);
    }

    @Override
    public void updateLastLoginInfo(Long userId, String ip) {
        User user = new User();
        user.setId(userId);
        user.setLastLoginIp(ip);
        user.setLastLoginTime(new Date());
        userMapper.updateById(user);
    }
}
