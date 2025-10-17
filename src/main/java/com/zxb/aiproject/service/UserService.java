package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.LoginDto;
import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.vo.LoginVO;

public interface UserService {

    /**
     * 用户登录
     * @param loginDto
     * @return
     */
    LoginVO login(LoginDto loginDto);

    /**
     * 根据用户名查询用户
     * @param username
     * @return
     */
    User getUserByUserName(String username);

    /**
     * 更新用户最后登录信息
     * @param userId
     * @param ip
     */
    void updateLastLoginInfo(Long userId,String ip);
}
