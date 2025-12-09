package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.entity.UserGroupRelation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户-用户组关联Mapper接口
 */
@Mapper
public interface UserGroupRelationMapper extends BaseMapper<UserGroupRelation> {

    /**
     * 根据用户组ID查询该组下的所有用户
     * @param groupId 用户组ID
     * @return 用户列表
     */
    @Select("SELECT u.* FROM sys_user u " +
            "INNER JOIN sys_user_group_relation r ON u.id = r.user_id " +
            "WHERE r.group_id = #{groupId} AND u.deleted = 0 AND r.deleted = 0 " +
            "ORDER BY u.create_time DESC")
    List<User> selectUsersByGroupId(@Param("groupId") Long groupId);
}
