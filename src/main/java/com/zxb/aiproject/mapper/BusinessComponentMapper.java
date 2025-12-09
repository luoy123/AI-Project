package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.BusinessComponent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 业务组件Mapper接口
 */
@Mapper
public interface BusinessComponentMapper extends BaseMapper<BusinessComponent> {

    /**
     * 根据业务ID查询组件列表
     */
    @Select("SELECT * FROM business_component WHERE business_id = #{businessId} AND deleted = 0 ORDER BY id DESC")
    List<BusinessComponent> selectByBusinessId(@Param("businessId") Long businessId);

    /**
     * 根据组件类型查询
     */
    @Select("SELECT * FROM business_component WHERE type = #{type} AND deleted = 0 ORDER BY id DESC")
    List<BusinessComponent> selectByType(@Param("type") String type);

    /**
     * 根据状态查询
     */
    @Select("SELECT * FROM business_component WHERE status = #{status} AND deleted = 0 ORDER BY id DESC")
    List<BusinessComponent> selectByStatus(@Param("status") String status);

    /**
     * 统计各业务的组件数量
     */
    @Select("SELECT business_id, COUNT(*) as count FROM business_component " +
            "WHERE deleted = 0 GROUP BY business_id")
    List<Object> countByBusiness();
}
