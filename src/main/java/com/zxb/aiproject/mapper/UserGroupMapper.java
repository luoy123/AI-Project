package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.UserGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户组Mapper接口
 */
@Mapper
public interface UserGroupMapper extends BaseMapper<UserGroup> {

    /**
     * 根据用户ID查询用户所属的用户组列表
     * @param userId 用户ID
     * @return 用户组列表
     */
    @Select("SELECT g.* FROM sys_user_group g " +
            "INNER JOIN sys_user_group_relation r ON g.id = r.group_id " +
            "WHERE r.user_id = #{userId} AND g.deleted = 0 AND r.deleted = 0 " +
            "ORDER BY g.sort_order ASC, g.create_time DESC")
    List<UserGroup> selectGroupsByUserId(@Param("userId") Long userId);
}
