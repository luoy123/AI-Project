package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.Alert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

@Mapper
public interface AlertMapper extends BaseMapper<Alert> {

    /**
     * 获取告警统计信息
     */
    @Select("SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical, " +
            "SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning, " +
            "SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info, " +
            "SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCount, " +
            "SUM(CASE WHEN status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledgedCount, " +
            "SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolvedCount " +
            "FROM alert WHERE deleted = 0")
    Map<String, Object> getAlertStatistics();

}
