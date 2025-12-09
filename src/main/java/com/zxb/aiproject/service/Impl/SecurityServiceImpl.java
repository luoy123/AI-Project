package com.zxb.aiproject.service.Impl;

import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.mapper.UserMapper;
import com.zxb.aiproject.service.SecurityService;
import com.zxb.aiproject.service.SystemConfigService;
import com.zxb.aiproject.utils.PasswordValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;

/**
 * 安全服务实现类
 */
@Slf4j
@Service
public class SecurityServiceImpl implements SecurityService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private PasswordValidator passwordValidator;

    @Override
    public boolean isUserLocked(User user) {
        if (user.getLockedUntil() == null) {
            return false;
        }
        
        // 检查锁定是否已过期
        Date now = new Date();
        if (now.after(user.getLockedUntil())) {
            // 锁定已过期，自动解锁
            unlockUser(user);
            return false;
        }
        
        return true;
    }

    @Override
    @Transactional
    public void recordLoginFailure(User user) {
        Integer maxAttempts = systemConfigService.getIntegerValue("security.maxLoginAttempts", 3);
        
        // 增加失败次数
        int attempts = (user.getLoginAttempts() == null ? 0 : user.getLoginAttempts()) + 1;
        user.setLoginAttempts(attempts);
        
        log.warn("用户 {} 登录失败，失败次数：{}/{}", user.getUsername(), attempts, maxAttempts);
        
        // 如果达到最大次数，锁定账号
        if (attempts >= maxAttempts) {
            lockUser(user);
        } else {
            userMapper.updateById(user);
        }
    }

    @Override
    @Transactional
    public void resetLoginAttempts(User user) {
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        userMapper.updateById(user);
        log.info("用户 {} 登录成功，重置失败次数", user.getUsername());
    }

    @Override
    @Transactional
    public void lockUser(User user) {
        Integer lockoutDuration = systemConfigService.getIntegerValue("security.lockoutDuration", 10);
        
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, lockoutDuration);
        Date lockedUntil = calendar.getTime();
        
        user.setLockedUntil(lockedUntil);
        userMapper.updateById(user);
        
        log.warn("用户 {} 因登录失败次数过多被锁定，锁定到：{}", user.getUsername(), lockedUntil);
    }

    @Override
    @Transactional
    public void unlockUser(User user) {
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        userMapper.updateById(user);
        log.info("用户 {} 已解锁", user.getUsername());
    }

    @Override
    public boolean isPasswordExpired(User user) {
        return passwordValidator.isPasswordExpired(user.getPasswordUpdatedAt());
    }
}
