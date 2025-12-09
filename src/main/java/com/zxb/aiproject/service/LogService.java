package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zxb.aiproject.dto.LogQueryDTO;
import com.zxb.aiproject.entity.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 日志服务接口
 */
public interface LogService {

    /**
     * 分页查询Syslog日志
     */
    IPage<SyslogEntry> getSyslogPage(LogQueryDTO queryDTO);

    /**
     * 导出Syslog日志
     */
    List<SyslogEntry> exportSyslogData(LogQueryDTO queryDTO);

    /**
     * 获取日志趋势统计
     */
    List<Map<String, Object>> getLogTrend(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取日志来源Top统计
     */
    List<Map<String, Object>> getTopSources(LocalDateTime startTime, LocalDateTime endTime, Integer limit);

    /**
     * 获取严重性分布统计
     */
    List<Map<String, Object>> getSeverityDistribution(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取Facility分布统计
     */
    List<Map<String, Object>> getFacilityDistribution(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取匹配事件Top统计
     */
    List<Map<String, Object>> getTopMatchedEvents(LocalDateTime startTime, LocalDateTime endTime, Integer limit);

    /**
     * 获取告警日志
     */
    List<Object> getAlertLogs(String createdBy);

    /**
     * 获取统计汇总数据
     */
    Map<String, Object> getStatisticsSummary(String startTime, String endTime);
    
    /**
     * 获取统计汇总数据（支持时间字段选择）
     */
    Map<String, Object> getStatisticsSummary(String startTime, String endTime, String timeField);

    /**
     * 获取日志趋势数据
     */
    Map<String, Object> getLogTrend(String startTime, String endTime);

    /**
     * 获取日志来源统计
     */
    Map<String, Object> getLogSources(String startTime, String endTime, Integer limit);

    /**
     * 获取严重性分布统计
     */
    Map<String, Object> getSeverityDistribution(String startTime, String endTime);

    /**
     * 获取Facility分布统计
     */
    Map<String, Object> getFacilityDistribution(String startTime, String endTime);

    /**
     * 获取设备类型分布统计
     */
    Map<String, Object> getDeviceTypeDistribution(String startTime, String endTime);

    /**
     * 获取匹配事件统计
     */
    Map<String, Object> getEventsStatistics(String startTime, String endTime, Integer limit);

    /**
     * 获取匹配规则统计
     */
    Map<String, Object> getRulesStatistics(String startTime, String endTime, Integer limit);

    /**
     * 获取所有日志规则
     */
    List<LogRule> getAllRules(String logType);

    /**
     * 根据ID获取日志规则
     */
    LogRule getRuleById(Integer ruleId);

    /**
     * 保存日志规则
     */
    LogRule saveRule(LogRule rule);

    /**
     * 删除日志规则
     */
    boolean deleteRule(Integer ruleId);

    /**
     * 切换规则状态
     */
    boolean toggleRuleStatus(Integer ruleId, Boolean enabled);

    /**
     * 获取所有日志事件
     */
    List<LogEvent> getAllEvents();

    /**
     * 保存日志事件
     */
    LogEvent saveEvent(LogEvent event);

    /**
     * 删除日志事件
     */
    boolean deleteEvent(Integer eventId);

    /**
     * 获取日志配置
     */
    LogSettings getLogSettings();

    /**
     * 保存日志配置
     */
    LogSettings saveLogSettings(LogSettings settings);

    /**
     * 获取保存的过滤器
     */
    List<LogSavedFilter> getSavedFilters(String createdBy);

    /**
     * 保存过滤器
     */
    LogSavedFilter saveFilter(LogSavedFilter filter);

    /**
     * 根据ID获取过滤器
     */
    LogSavedFilter getFilterById(Integer filterId);

    /**
     * 更新过滤器
     */
    LogSavedFilter updateFilter(LogSavedFilter filter);

    /**
     * 删除过滤器
     */
    boolean deleteFilter(Integer filterId);

    /**
     * 根据过滤器ID查询日志
     */
    IPage<SyslogEntry> getSyslogByFilter(Integer filterId, Integer page, Integer pageSize);
}
