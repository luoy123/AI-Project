package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.UserGroupRelationDto;
import com.zxb.aiproject.vo.UserInfoVO;

import java.util.List;

/**
 * 用户-用户组关联Service接口
 */
public interface UserGroupRelationService {

    /**
     * 批量添加用户到用户组
     * @param dto 关联DTO
     * @return 是否成功
     */
    boolean addUsersToGroup(UserGroupRelationDto dto);

    /**
     * 从用户组中移除用户
     * @param groupId 用户组ID
     * @param userId 用户ID
     * @return 是否成功
     */
    boolean removeUserFromGroup(Long groupId, Long userId);

    /**
     * 根据用户组ID查询该组下的所有用户
     * @param groupId 用户组ID
     * @return 用户列表
     */
    List<UserInfoVO> getUsersByGroupId(Long groupId);

    /**
     * 清空用户组下的所有用户
     * @param groupId 用户组ID
     * @return 是否成功
     */
    boolean clearGroupUsers(Long groupId);
}
