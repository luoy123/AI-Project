package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    User getUserByUserName(String username);

    //BaseMapper中存在了基本的的增删改查
    //需要自定义的sql，可以添加方法来进行实现。

}
