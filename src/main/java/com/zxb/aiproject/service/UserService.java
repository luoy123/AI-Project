package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.LoginDto;
import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.vo.LoginVO;

import java.util.Map;

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

    /**
     * 验证管理员密码
     * @param password 输入的密码
     * @return 验证结果
     */
    boolean verifyAdminPassword(String password);

    /**
     * 新增用户
     * @param dto 用户新增DTO
     * @return 新增结果
     */
    boolean addUser(com.zxb.aiproject.dto.UserAddDto dto);

    /**
     * 更新用户
     * @param dto 用户更新DTO
     * @return 更新结果
     */
    boolean updateUser(com.zxb.aiproject.dto.UserUpdateDto dto);

    /**
     * 获取所有用户列表（用于派发工单时选择处理人）
     * @return 用户列表
     */
    java.util.List<User> getAllUsers();

}
