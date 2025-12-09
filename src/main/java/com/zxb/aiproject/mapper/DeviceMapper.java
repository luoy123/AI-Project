package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.Device;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DeviceMapper extends BaseMapper<Device> {

    /**
     * 根据分组ID查询设备列表
     */
    @Select("SELECT * FROM device WHERE group_id = #{groupId} AND deleted = 0 ORDER BY create_time DESC")
    List<Device> selectByGroupId(@Param("groupId") Long groupId);

    /**
     * 根据设备类型查询设备列表
     */
    @Select("SELECT * FROM device WHERE type = #{type} AND deleted = 0 ORDER BY create_time DESC")
    List<Device> selectByType(@Param("type") String type);

    /**
     * 搜索设备（按名称、IP、描述）
     */
    @Select("SELECT * FROM device WHERE deleted = 0 AND (name LIKE CONCAT('%', #{keyword}, '%') OR ip LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) ORDER BY create_time DESC")
    List<Device> searchDevices(@Param("keyword") String keyword);

    /**
     * 统计各状态设备数量
     */
    @Select("SELECT status, COUNT(*) as count FROM device WHERE deleted = 0 GROUP BY status")
    List<java.util.Map<String, Object>> countByStatus();

    /**
     * 统计各类型设备数量
     */
    @Select("SELECT type, COUNT(*) as count FROM device WHERE deleted = 0 GROUP BY type")
    List<java.util.Map<String, Object>> countByType();

    /**
     * 根据分组统计设备数量
     */
    @Select("SELECT group_id, COUNT(*) as count FROM device WHERE deleted = 0 GROUP BY group_id")
    List<java.util.Map<String, Object>> countByGroup();
}
