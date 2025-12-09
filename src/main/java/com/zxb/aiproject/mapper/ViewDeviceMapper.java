package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.ViewDevice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 视图设备Mapper接口
 */
@Mapper
public interface ViewDeviceMapper extends BaseMapper<ViewDevice> {
    
    /**
     * 统计各类型设备数量
     */
    @Select("SELECT device_type, COUNT(*) as count " +
            "FROM view_device " +
            "WHERE deleted = 0 " +
            "GROUP BY device_type")
    List<Map<String, Object>> countByDeviceType();
    
    /**
     * 统计各状态设备数量
     */
    @Select("SELECT status, COUNT(*) as count " +
            "FROM view_device " +
            "WHERE deleted = 0 " +
            "GROUP BY status")
    List<Map<String, Object>> countByStatus();
    
    /**
     * 统计各位置设备数量
     */
    @Select("SELECT location, COUNT(*) as count " +
            "FROM view_device " +
            "WHERE deleted = 0 " +
            "GROUP BY location " +
            "ORDER BY count DESC " +
            "LIMIT 10")
    List<Map<String, Object>> countByLocation();
    
    /**
     * 统计近N天每天的异常设备数量
     * 注意：这里使用created_at作为示例，实际应该有一个记录设备状态变化的历史表
     */
    @Select("SELECT DATE(created_at) as date, " +
            "COUNT(CASE WHEN status IN ('offline', 'fault', 'warning') THEN 1 END) as abnormal_count " +
            "FROM view_device " +
            "WHERE deleted = 0 AND created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY date")
    List<Map<String, Object>> getAbnormalTrend(int days);
    
    /**
     * 统计近N天每天的设备可用性
     */
    @Select("SELECT DATE(created_at) as date, " +
            "COUNT(*) as total, " +
            "COUNT(CASE WHEN status = 'online' THEN 1 END) as online_count " +
            "FROM view_device " +
            "WHERE deleted = 0 AND created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY date")
    List<Map<String, Object>> getAvailabilityTrend(int days);
}
