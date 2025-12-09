package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.DeviceGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DeviceGroupMapper extends BaseMapper<DeviceGroup> {

    /**
     * 查询所有根分组（父分组为空）
     */
    @Select("SELECT * FROM device_group WHERE parent_id IS NULL AND deleted = 0 ORDER BY sort_order ASC")
    List<DeviceGroup> selectRootGroups();

    /**
     * 根据父分组ID查询子分组
     */
    @Select("SELECT * FROM device_group WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order ASC")
    List<DeviceGroup> selectByParentId(@Param("parentId") Long parentId);

    /**
     * 查询所有分组（树形结构）
     */
    @Select("SELECT * FROM device_group WHERE deleted = 0 ORDER BY sort_order ASC")
    List<DeviceGroup> selectAllGroups();
}
