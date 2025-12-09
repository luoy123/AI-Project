package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.dto.UserGroupDto;
import com.zxb.aiproject.entity.UserGroup;
import com.zxb.aiproject.vo.UserGroupVO;

import java.util.List;

/**
 * 用户组Service接口
 */
public interface UserGroupService {

    /**
     * 创建用户组
     * @param dto 用户组DTO
     * @return 用户组ID
     */
    Long createUserGroup(UserGroupDto dto);

    /**
     * 更新用户组
     * @param dto 用户组DTO
     * @return 是否成功
     */
    boolean updateUserGroup(UserGroupDto dto);

    /**
     * 删除用户组（逻辑删除）
     * @param id 用户组ID
     * @return 是否成功
     */
    boolean deleteUserGroup(Long id);

    /**
     * 根据ID查询用户组
     * @param id 用户组ID
     * @return 用户组VO
     */
    UserGroupVO getUserGroupById(Long id);

    /**
     * 分页查询用户组列表
     * @param page 分页对象
     * @param groupName 用户组名称（可选）
     * @param status 状态（可选）
     * @return 分页结果
     */
    Page<UserGroupVO> getUserGroupPage(Page<UserGroup> page, String groupName, Integer status);

    /**
     * 查询所有用户组列表
     * @return 用户组列表
     */
    List<UserGroupVO> getAllUserGroups();

    /**
     * 根据用户ID查询用户所属的用户组列表
     * @param userId 用户ID
     * @return 用户组列表
     */
    List<UserGroupVO> getUserGroupsByUserId(Long userId);
}
