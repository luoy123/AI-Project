package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.User;

/**
 * 安全服务接口
 */
public interface SecurityService {
    
    /**
     * 检查用户是否被锁定
     * @param user 用户
     * @return true表示已锁定
     */
    boolean isUserLocked(User user);
    
    /**
     * 记录登录失败
     * @param user 用户
     */
    void recordLoginFailure(User user);
    
    /**
     * 重置登录失败次数
     * @param user 用户
     */
    void resetLoginAttempts(User user);
    
    /**
     * 锁定用户账号
     * @param user 用户
     */
    void lockUser(User user);
    
    /**
     * 解锁用户账号
     * @param user 用户
     */
    void unlockUser(User user);
    
    /**
     * 检查密码是否过期
     * @param user 用户
     * @return true表示已过期
     */
    boolean isPasswordExpired(User user);
}
