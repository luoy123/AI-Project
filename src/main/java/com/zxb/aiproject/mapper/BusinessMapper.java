package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.Business;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 业务Mapper接口
 */
@Mapper
public interface BusinessMapper extends BaseMapper<Business> {

    /**
     * 查询所有业务（包含层级结构）
     */
    @Select("SELECT * FROM business WHERE deleted = 0 ORDER BY parent_id, id")
    List<Business> selectAllBusiness();

    /**
     * 根据父业务ID查询子业务
     */
    @Select("SELECT * FROM business WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY id")
    List<Business> selectByParentId(Long parentId);

    /**
     * 查询根业务（顶级业务）
     */
    @Select("SELECT * FROM business WHERE parent_id IS NULL AND deleted = 0 ORDER BY id")
    List<Business> selectRootBusiness();
}
