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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.Date;
import java.util.List;

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

    @Autowired
    private com.zxb.aiproject.service.SecurityService securityService;

    @Autowired
    private com.zxb.aiproject.utils.PasswordValidator passwordValidator;

    @Autowired
    private com.zxb.aiproject.service.SystemConfigService systemConfigService;

    @Override
    public LoginVO login(LoginDto loginDto) {
        // 1.验证验证码 - 根据系统配置决定是否验证
        Boolean requireCaptcha = systemConfigService.getBooleanValue("system.requireLoginReason", true);
        if (requireCaptcha) {
            log.debug("验证码验证: key={}, input={}", loginDto.getCaptchaKey(), loginDto.getCaptcha());
            if (!captchaGenerator.verifyCaptcha(loginDto.getCaptchaKey(), loginDto.getCaptcha())) {
                log.warn("验证码验证失败: key={}, input={}", loginDto.getCaptchaKey(), loginDto.getCaptcha());
                throw new BusinessException(ResultCode.CAPTCHA_ERROR);
            }
        } else {
            log.debug("系统配置已关闭验证码验证");
        }

        // 2.查询用户名
        User userByUserName = getUserByUserName(loginDto.getUsername());
        if (userByUserName == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        // 3.检查用户是否被锁定
        if (securityService.isUserLocked(userByUserName)) {
            throw new BusinessException("账号已被锁定，请稍后再试或联系管理员");
        }

        log.info("loginDto.getpassword():{},userByUserName:{}", Md5Util.encrypt(loginDto.getPassword()),
                userByUserName.getPassword());

        // 4.验证密码
        if (!Md5Util.verify(loginDto.getPassword(), userByUserName.getPassword())) {
            // 记录登录失败
            securityService.recordLoginFailure(userByUserName);
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 5.检查密码是否过期
        if (securityService.isPasswordExpired(userByUserName)) {
            throw new BusinessException("密码已过期，请修改密码后再登录");
        }

        // 6.查看用户状态
        if (userByUserName.getStatus() != 1) {
            throw new BusinessException("用户被禁用");
        }

        // 7.登录成功，重置失败次数
        securityService.resetLoginAttempts(userByUserName);

        // 8.生成token
        String token = jwtTokenUtil.generateToken(userByUserName.getUsername());

        UserInfoVO userInfoVO = BeanUtil.copyProperties(userByUserName, UserInfoVO.class);

        // 9.返回登录的结果
        return new LoginVO(token, jwtProperties.getExpiration(), userInfoVO);
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

    @Override
    public boolean verifyAdminPassword(String password) {
        // 获取管理员用户
        User admin = getUserByUserName("admin");
        if (admin == null) {
            return false;
        }
        // 验证密码
        return Md5Util.verify(password, admin.getPassword());
    }

    @Override
    public boolean addUser(com.zxb.aiproject.dto.UserAddDto dto) {
        log.info("添加用户: {}", dto);

        try {
            // 1. 检查用户名是否已存在
            User existingUser = getUserByUserName(dto.getUsername());
            if (existingUser != null) {
                log.error("用户名已存在: {}", dto.getUsername());
                throw new RuntimeException("用户名已存在");
            }

            // 2. 验证密码强度（根据安全设置）
            if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
                throw new RuntimeException("密码不能为空");
            }

            String passwordError = passwordValidator.validatePassword(dto.getPassword());
            if (passwordError != null) {
                log.error("密码不符合安全要求: {}", passwordError);
                throw new RuntimeException(passwordError);
            }

            // 3. 创建用户对象
            User user = new User();
            user.setUsername(dto.getUsername());
            user.setRealName(dto.getRealName());
            user.setEmail(dto.getEmail());
            user.setPhone(dto.getPhone());
            user.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
            user.setAvatar(dto.getAvatar());
            user.setRole(dto.getRole() != null ? dto.getRole() : "user");

            // 4. 加密密码
            String encryptedPassword = DigestUtils.md5DigestAsHex(dto.getPassword().getBytes());
            user.setPassword(encryptedPassword);
            user.setPasswordUpdatedAt(new Date());

            // 5. 保存用户（createTime和updateTime由MyBatis-Plus自动填充）
            int result = userMapper.insert(user);

            log.info("用户添加成功: {}", dto.getUsername());
            return result > 0;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("添加用户失败", e);
            throw new RuntimeException("添加用户失败: " + e.getMessage());
        }
    }

    @Override
    public boolean updateUser(com.zxb.aiproject.dto.UserUpdateDto dto) {
        log.info("更新用户: {}", dto);

        try {
            // 1. 查询用户是否存在
            User existingUser = userMapper.selectById(dto.getId());
            if (existingUser == null) {
                log.error("用户不存在: {}", dto.getId());
                throw new RuntimeException("用户不存在");
            }

            // 2. 检查用户名是否被其他用户占用
            User userWithSameName = getUserByUserName(dto.getUsername());
            if (userWithSameName != null && !userWithSameName.getId().equals(dto.getId())) {
                log.error("用户名已被占用: {}", dto.getUsername());
                throw new RuntimeException("用户名已被占用");
            }

            // 3. 如果修改了密码，需要验证密码强度
            if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
                log.info("用户修改密码，验证密码强度");

                // 验证密码强度
                String passwordError = passwordValidator.validatePassword(dto.getPassword());
                if (passwordError != null) {
                    log.error("密码不符合要求: {}", passwordError);
                    throw new RuntimeException(passwordError);
                }

                // 加密新密码
                String encryptedPassword = DigestUtils.md5DigestAsHex(dto.getPassword().getBytes());
                existingUser.setPassword(encryptedPassword);

                // 更新密码更新时间
                existingUser.setPasswordUpdatedAt(new Date());
                log.info("密码已更新并加密");
            }

            // 4. 更新其他字段
            existingUser.setUsername(dto.getUsername());
            existingUser.setRealName(dto.getRealName());

            if (dto.getEmail() != null) {
                existingUser.setEmail(dto.getEmail());
            }

            if (dto.getPhone() != null) {
                existingUser.setPhone(dto.getPhone());
            }

            if (dto.getAvatar() != null) {
                existingUser.setAvatar(dto.getAvatar());
            }

            if (dto.getRole() != null) {
                existingUser.setRole(dto.getRole());
            }

            if (dto.getStatus() != null) {
                existingUser.setStatus(dto.getStatus());
            }

            // 5. 更新到数据库
            int result = userMapper.updateById(existingUser);

            if (result > 0) {
                log.info("用户更新成功: {}", dto.getUsername());
                return true;
            } else {
                log.error("用户更新失败: {}", dto.getUsername());
                return false;
            }

        } catch (Exception e) {
            log.error("更新用户异常: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public List<User> getAllUsers() {
        // 获取所有启用状态的用户
        return userMapper.selectList(null);
    }
}
