package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.entity.SyslogEntry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Syslog日志Mapper
 */
@Mapper
public interface SyslogEntryMapper extends BaseMapper<SyslogEntry> {

    /**
     * 分页查询Syslog日志（带关联信息）
     */
    @Select("<script>" +
            "SELECT s.*, " +
            "r.rule_name, " +
            "e.event_name, e.event_color " +
            "FROM t_log_syslog s " +
            "LEFT JOIN t_log_rules r ON s.matched_rule_id = r.id " +
            "LEFT JOIN t_log_events e ON s.matched_event_id = e.id " +
            "WHERE 1=1 " +
            "<if test='startTime != null'> AND s.received_at >= #{startTime} </if>" +
            "<if test='endTime != null'> AND s.received_at &lt;= #{endTime} </if>" +
            "<if test='keyword != null and keyword != \"\"'> " +
            "AND (s.message LIKE CONCAT('%', #{keyword}, '%') " +
            "OR s.source_ip LIKE CONCAT('%', #{keyword}, '%') " +
            "OR s.hostname LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "<if test='sourceIps != null and sourceIps.size() > 0'> " +
            "AND s.source_ip IN " +
            "<foreach item='ip' collection='sourceIps' open='(' separator=',' close=')'>" +
            "#{ip}" +
            "</foreach>" +
            "</if>" +
            "<if test='facilities != null and facilities.size() > 0'> " +
            "AND s.facility IN " +
            "<foreach item='facility' collection='facilities' open='(' separator=',' close=')'>" +
            "#{facility}" +
            "</foreach>" +
            "</if>" +
            "<if test='severities != null and severities.size() > 0'> " +
            "AND s.severity IN " +
            "<foreach item='severity' collection='severities' open='(' separator=',' close=')'>" +
            "#{severity}" +
            "</foreach>" +
            "</if>" +
            "<if test='alertOnly != null and alertOnly == true'> AND s.is_alert = true </if>" +
            "<if test='eventIds != null and eventIds.size() > 0'> " +
            "AND s.matched_event_id IN " +
            "<foreach item='eventId' collection='eventIds' open='(' separator=',' close=')'>" +
            "#{eventId}" +
            "</foreach>" +
            "</if>" +
            "<if test='ruleIds != null and ruleIds.size() > 0'> " +
            "AND s.matched_rule_id IN " +
            "<foreach item='ruleId' collection='ruleIds' open='(' separator=',' close=')'>" +
            "#{ruleId}" +
            "</foreach>" +
            "</if>" +
            "<if test='hostname != null and hostname != \"\"'> " +
            "AND s.hostname LIKE CONCAT('%', #{hostname}, '%') " +
            "</if>" +
            "<if test='deviceTypes != null and deviceTypes.size() > 0'> " +
            "AND s.device_type IN " +
            "<foreach item='deviceType' collection='deviceTypes' open='(' separator=',' close=')'>" +
            "#{deviceType}" +
            "</foreach>" +
            "</if>" +
            "ORDER BY s.received_at DESC" +
            "</script>")
    IPage<SyslogEntry> selectSyslogPage(Page<SyslogEntry> page,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime,
                                       @Param("keyword") String keyword,
                                       @Param("sourceIps") List<String> sourceIps,
                                       @Param("facilities") List<Integer> facilities,
                                       @Param("severities") List<Integer> severities,
                                       @Param("alertOnly") Boolean alertOnly,
                                       @Param("eventIds") List<Integer> eventIds,
                                       @Param("ruleIds") List<Integer> ruleIds,
                                       @Param("hostname") String hostname,
                                       @Param("deviceTypes") List<String> deviceTypes);

    /**
     * 统计日志趋势（按小时分组）
     */
    @Select("SELECT " +
            "DATE_FORMAT(received_at, '%Y-%m-%d %H:00:00') as time_hour, " +
            "severity, " +
            "COUNT(*) as log_count " +
            "FROM t_log_syslog " +
            "WHERE received_at >= #{startTime} AND received_at <= #{endTime} " +
            "GROUP BY DATE_FORMAT(received_at, '%Y-%m-%d %H:00:00'), severity " +
            "ORDER BY time_hour")
    List<Map<String, Object>> selectLogTrend(@Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);

    /**
     * 统计日志来源Top N
     */
    @Select("SELECT source_ip, COUNT(*) as log_count " +
            "FROM t_log_syslog " +
            "WHERE received_at >= #{startTime} AND received_at <= #{endTime} " +
            "GROUP BY source_ip " +
            "ORDER BY log_count DESC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> selectTopSources(@Param("startTime") LocalDateTime startTime,
                                             @Param("endTime") LocalDateTime endTime,
                                             @Param("limit") Integer limit);

    /**
     * 统计严重性分布
     */
    @Select("SELECT severity, COUNT(*) as log_count " +
            "FROM t_log_syslog " +
            "WHERE received_at >= #{startTime} AND received_at <= #{endTime} " +
            "GROUP BY severity " +
            "ORDER BY severity")
    List<Map<String, Object>> selectSeverityDistribution(@Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);

    /**
     * 统计Facility分布
     */
    @Select("SELECT facility, COUNT(*) as log_count " +
            "FROM t_log_syslog " +
            "WHERE received_at >= #{startTime} AND received_at <= #{endTime} " +
            "GROUP BY facility " +
            "ORDER BY log_count DESC")
    List<Map<String, Object>> selectFacilityDistribution(@Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);

    /**
     * 统计匹配事件Top N
     */
    @Select("SELECT s.matched_event_id as event_id, e.event_name, e.event_color, COUNT(*) as match_count " +
            "FROM t_log_syslog s " +
            "INNER JOIN t_log_events e ON s.matched_event_id = e.id " +
            "WHERE s.received_at >= #{startTime} AND s.received_at <= #{endTime} " +
            "AND s.matched_event_id IS NOT NULL " +
            "GROUP BY s.matched_event_id, e.event_name, e.event_color " +
            "ORDER BY match_count DESC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> selectTopMatchedEvents(@Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime,
                                                    @Param("limit") Integer limit);
    
    /**
     * 统计匹配规则Top N
     */
    @Select("SELECT s.matched_rule_id as rule_id, r.rule_name, COUNT(*) as match_count " +
            "FROM t_log_syslog s " +
            "INNER JOIN t_log_rules r ON s.matched_rule_id = r.id " +
            "WHERE s.received_at >= #{startTime} AND s.received_at <= #{endTime} " +
            "AND s.matched_rule_id IS NOT NULL " +
            "GROUP BY s.matched_rule_id, r.rule_name " +
            "ORDER BY match_count DESC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> selectTopMatchedRules(@Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime,
                                                    @Param("limit") Integer limit);

    /**
     * 统计时间范围内的日志数量
     */
    @Select("SELECT COUNT(*) FROM t_log_syslog WHERE received_at >= #{startTime} AND received_at <= #{endTime}")
    long countLogsByTimeRange(@Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    /**
     * 统计时间范围内不同来源IP数量
     */
    @Select("SELECT COUNT(DISTINCT source_ip) FROM t_log_syslog WHERE received_at >= #{startTime} AND received_at <= #{endTime}")
    long countDistinctSourcesByTimeRange(@Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);

    /**
     * 统计设备类型分布
     */
    @Select("SELECT device_type, COUNT(*) as log_count " +
            "FROM t_log_syslog " +
            "WHERE received_at >= #{startTime} AND received_at <= #{endTime} " +
            "GROUP BY device_type " +
            "ORDER BY log_count DESC")
    List<Map<String, Object>> selectDeviceTypeDistribution(@Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);
}
