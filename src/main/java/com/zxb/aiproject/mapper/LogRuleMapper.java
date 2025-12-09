package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.LogRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 日志规则Mapper
 */
@Mapper
public interface LogRuleMapper extends BaseMapper<LogRule> {

    /**
     * 查询规则及其关联的事件
     */
    @Select("SELECT r.*, " +
            "GROUP_CONCAT(e.event_name) as event_names, " +
            "GROUP_CONCAT(e.event_color) as event_colors " +
            "FROM t_log_rules r " +
            "LEFT JOIN t_log_rule_event_map m ON r.id = m.rule_id " +
            "LEFT JOIN t_log_events e ON m.event_id = e.id " +
            "WHERE r.log_type = #{logType} " +
            "GROUP BY r.id " +
            "ORDER BY r.created_at DESC")
    List<LogRule> selectRulesWithEvents(@Param("logType") String logType);

    /**
     * 查询启用的规则
     */
    @Select("SELECT * FROM t_log_rules " +
            "WHERE is_enabled = true " +
            "AND log_type = #{logType} " +
            "ORDER BY id")
    List<LogRule> selectEnabledRules(@Param("logType") String logType);
}
