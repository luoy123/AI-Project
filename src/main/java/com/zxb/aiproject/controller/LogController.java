package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.LogEvent;
import com.zxb.aiproject.entity.LogRule;
import com.zxb.aiproject.entity.LogSavedFilter;
import com.zxb.aiproject.entity.LogSettings;
import com.zxb.aiproject.entity.SyslogEntry;
import com.zxb.aiproject.mapper.LogEventMapper;
import com.zxb.aiproject.mapper.LogRuleMapper;
import com.zxb.aiproject.mapper.LogSavedFilterMapper;
import com.zxb.aiproject.mapper.LogSettingsMapper;
import com.zxb.aiproject.mapper.SyslogEntryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 日志管理控制器 - 使用真实数据库数据
 */
@RestController
@RequestMapping("/logs")
public class LogController {

    @Autowired
    private SyslogEntryMapper syslogEntryMapper;
    
    @Autowired
    private LogRuleMapper logRuleMapper;
    
    @Autowired
    private LogEventMapper logEventMapper;
    
    @Autowired
    private LogSettingsMapper logSettingsMapper;

    @Autowired
    private LogSavedFilterMapper logSavedFilterMapper;

    /**
     * 测试端点
     */
    @GetMapping("/test")
    public Result<String> test() {
        return Result.success("Real LogController is working!");
    }

    /**
     * 获取所有日志规则
     */
    @GetMapping("/rules")
    public Result<List<LogRule>> getAllRules(@RequestParam(defaultValue = "Syslog") String logType) {
        try {
            List<LogRule> rules = logRuleMapper.selectRulesWithEvents(logType);
            return Result.success(rules);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取日志规则失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询Syslog日志 - 使用真实数据库数据
     */
    @GetMapping("/syslog")
    public Result<Map<String, Object>> getSyslogPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "15") Integer pageSize,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> sourceIps,
            @RequestParam(required = false) List<Integer> facilities,
            @RequestParam(required = false) List<Integer> severities,
            @RequestParam(required = false) Boolean alertOnly,
            @RequestParam(required = false) List<Integer> eventIds,
            @RequestParam(required = false) List<Integer> ruleIds,
            @RequestParam(required = false) String hostname,
            @RequestParam(required = false) List<String> deviceTypes) {
        try {
            System.out.println("=== 真实数据库查询Syslog ===");
            System.out.println("Page: " + page + ", PageSize: " + pageSize);
            System.out.println("StartTime: " + startTime + ", EndTime: " + endTime);
            System.out.println("Keyword: " + keyword);
            System.out.println("DeviceTypes: " + deviceTypes);
            System.out.println("Severities: " + severities);
            
            // 解析时间参数
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            
            if (startTime != null && !startTime.isEmpty()) {
                startDateTime = LocalDateTime.parse(startTime, formatter);
            }
            if (endTime != null && !endTime.isEmpty()) {
                endDateTime = LocalDateTime.parse(endTime, formatter);
            }
            
            // 转换设备类型筛选参数
            List<String> dbDeviceTypes = null;
            if (deviceTypes != null && !deviceTypes.isEmpty()) {
                dbDeviceTypes = new ArrayList<>();
                for (String deviceType : deviceTypes) {
                    // 前端传来的是中文或英文小写，需要转换为数据库中的大写英文
                    switch (deviceType.toLowerCase()) {
                        case "server":
                        case "服务器":
                            dbDeviceTypes.add("SERVER");
                            break;
                        case "network":
                        case "网络设备":
                            dbDeviceTypes.add("NETWORK");
                            break;
                        case "storage":
                        case "存储设备":
                            dbDeviceTypes.add("STORAGE");
                            break;
                        case "video":
                        case "视频设备":
                            dbDeviceTypes.add("VIDEO");
                            break;
                        default:
                            dbDeviceTypes.add(deviceType.toUpperCase());
                    }
                }
            }
            
            // 创建分页对象
            Page<SyslogEntry> pageObj = new Page<>(page, pageSize);
            
            // 查询数据库
            IPage<SyslogEntry> result = syslogEntryMapper.selectSyslogPage(
                pageObj, startDateTime, endDateTime, keyword, sourceIps, 
                facilities, severities, alertOnly, eventIds, ruleIds, 
                hostname, dbDeviceTypes
            );
            
            System.out.println("数据库查询结果: 总记录数=" + result.getTotal() + ", 当前页记录数=" + result.getRecords().size());
            
            // 处理返回数据，添加严重程度名称
            List<SyslogEntry> records = result.getRecords();
            for (SyslogEntry entry : records) {
                entry.setSeverityName(getSeverityName(entry.getSeverity()));
                // 如果没有规则名称，设置默认值
                if (entry.getRuleName() == null || entry.getRuleName().isEmpty()) {
                    entry.setRuleName("规则" + (entry.getMatchedRuleId() != null ? entry.getMatchedRuleId() : "未知"));
                }
            }
            
            // 构建返回结果
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("records", records);
            resultMap.put("total", result.getTotal());
            resultMap.put("size", result.getSize());
            resultMap.put("current", result.getCurrent());
            resultMap.put("pages", result.getPages());
            
            return Result.success(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询日志失败: " + e.getMessage());
        }
    }

    /**
     * 获取统计汇总数据
     */
    @GetMapping("/statistics/summary")
    public Result<Map<String, Object>> getStatisticsSummary(
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(defaultValue = "received_at") String timeField) {
        try {
            Map<String, Object> summary = new HashMap<>();
            
            // 解析时间
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            
            long totalLogs = syslogEntryMapper.countLogsByTimeRange(startDateTime, endDateTime);
            long totalDevices = syslogEntryMapper.countDistinctSourcesByTimeRange(startDateTime, endDateTime);
            List<Map<String, Object>> severityDistribution = syslogEntryMapper.selectSeverityDistribution(startDateTime, endDateTime);
            long alertCount = severityDistribution.stream()
                    .filter(item -> {
                        Integer severity = (Integer) item.get("severity");
                        return severity != null && severity <= 2; // 紧急、告警、严重
                    })
                    .mapToLong(item -> ((Number) item.get("log_count")).longValue())
                    .sum();
            long errorCount = severityDistribution.stream()
                    .filter(item -> {
                        Integer severity = (Integer) item.get("severity");
                        return severity != null && severity <= 3; // 包含错误级别
                    })
                    .mapToLong(item -> ((Number) item.get("log_count")).longValue())
                    .sum();
            
            summary.put("totalLogs", totalLogs);
            summary.put("totalDevices", totalDevices);
            summary.put("alertCount", alertCount);
            summary.put("errorCount", errorCount);
            
            return Result.success(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取统计汇总失败: " + e.getMessage());
        }
    }

    /**
     * 获取日志趋势数据
     */
    @GetMapping("/statistics/trend")
    public Result<Map<String, Object>> getLogTrend(
            @RequestParam String startTime,
            @RequestParam String endTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            
            List<Map<String, Object>> trendData = syslogEntryMapper.selectLogTrend(startDateTime, endDateTime);
            
            Map<String, Object> trend = new HashMap<>();
            trend.put("hourlyData", trendData);
            
            return Result.success(trend);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取趋势数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取来源TOP5
     */
    @GetMapping("/statistics/sources")
    public Result<Map<String, Object>> getTopSources(@RequestParam String startTime,
                                                     @RequestParam String endTime,
                                                     @RequestParam(defaultValue = "5") Integer limit) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            List<Map<String, Object>> rows = syslogEntryMapper.selectTopSources(startDateTime, endDateTime, limit);
            List<String> labels = new ArrayList<>();
            List<Long> values = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                labels.add((String) row.getOrDefault("source_ip", "未知"));
                values.add(((Number) row.getOrDefault("log_count", 0)).longValue());
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("labels", labels);
            payload.put("values", values);
            return Result.success(payload);
        } catch (Exception e) {
            return Result.error("获取来源统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取严重性分布
     */
    @GetMapping("/statistics/severity")
    public Result<Map<String, Object>> getSeverityDistribution(@RequestParam String startTime,
                                                               @RequestParam String endTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            List<Map<String, Object>> rows = syslogEntryMapper.selectSeverityDistribution(startDateTime, endDateTime);
            List<String> labels = new ArrayList<>();
            List<Long> values = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                Integer severity = (Integer) row.get("severity");
                labels.add(getSeverityEnglishName(severity));
                values.add(((Number) row.getOrDefault("log_count", 0)).longValue());
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("labels", labels);
            payload.put("values", values);
            return Result.success(payload);
        } catch (Exception e) {
            return Result.error("获取严重性分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备类型分布
     */
    @GetMapping("/statistics/device-types")
    public Result<Map<String, Object>> getDeviceTypeDistribution(@RequestParam String startTime,
                                                                 @RequestParam String endTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            List<Map<String, Object>> rows = syslogEntryMapper.selectDeviceTypeDistribution(startDateTime, endDateTime);
            List<String> labels = new ArrayList<>();
            List<Long> values = new ArrayList<>();
            List<String> deviceTypes = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                String deviceType = (String) row.getOrDefault("device_type", "UNKNOWN");
                labels.add(getDeviceTypeName(deviceType));
                deviceTypes.add(deviceType);
                values.add(((Number) row.getOrDefault("log_count", 0)).longValue());
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("labels", labels);
            payload.put("values", values);
            payload.put("deviceTypes", deviceTypes);
            return Result.success(payload);
        } catch (Exception e) {
            return Result.error("获取设备类型分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取匹配规则Top N
     */
    @GetMapping("/statistics/rules")
    public Result<Map<String, Object>> getTopRules(@RequestParam String startTime,
                                                   @RequestParam String endTime,
                                                   @RequestParam(defaultValue = "5") Integer limit) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(endTime, formatter);
            List<Map<String, Object>> rows = syslogEntryMapper.selectTopMatchedRules(startDateTime, endDateTime, limit);
            List<String> labels = new ArrayList<>();
            List<Long> values = new ArrayList<>();
            List<Integer> ruleIds = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                labels.add((String) row.getOrDefault("rule_name", "未命名规则"));
                values.add(((Number) row.getOrDefault("match_count", 0)).longValue());
                ruleIds.add((Integer) row.get("rule_id"));
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("labels", labels);
            payload.put("values", values);
            payload.put("ruleIds", ruleIds);
            return Result.success(payload);
        } catch (Exception e) {
            return Result.error("获取规则统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取保存的过滤器列表
     */
    @GetMapping("/filters")
    public Result<List<LogSavedFilter>> getSavedFilters(@RequestParam(required = false, defaultValue = "admin") String createdBy) {
        try {
            return Result.success(logSavedFilterMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<LogSavedFilter>()
                            .eq("created_by", createdBy)
                            .eq("log_type", "Syslog")
                            .orderByDesc("created_at")));
        } catch (Exception e) {
            return Result.error("获取过滤器失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取过滤器
     */
    @GetMapping("/filters/{id}")
    public Result<LogSavedFilter> getSavedFilter(@PathVariable Integer id) {
        try {
            LogSavedFilter filter = logSavedFilterMapper.selectById(id);
            if (filter == null) {
                return Result.error("过滤器不存在");
            }
            return Result.success(filter);
        } catch (Exception e) {
            return Result.error("获取过滤器失败: " + e.getMessage());
        }
    }

    /**
     * 保存过滤器
     */
    @PostMapping("/filters")
    public Result<LogSavedFilter> saveFilter(@RequestBody LogSavedFilter filter) {
        try {
            filter.setLogType(Optional.ofNullable(filter.getLogType()).orElse("Syslog"));
            filter.setCreatedBy(Optional.ofNullable(filter.getCreatedBy()).orElse("admin"));
            filter.setCreatedAt(LocalDateTime.now());
            filter.setUpdatedAt(LocalDateTime.now());
            logSavedFilterMapper.insert(filter);
            return Result.success(filter);
        } catch (Exception e) {
            return Result.error("保存过滤器失败: " + e.getMessage());
        }
    }

    /**
     * 更新过滤器
     */
    @PutMapping("/filters/{id}")
    public Result<LogSavedFilter> updateFilter(@PathVariable Integer id, @RequestBody LogSavedFilter filter) {
        try {
            LogSavedFilter existing = logSavedFilterMapper.selectById(id);
            if (existing == null) {
                return Result.error("过滤器不存在");
            }
            filter.setId(id);
            filter.setCreatedAt(existing.getCreatedAt());
            filter.setUpdatedAt(LocalDateTime.now());
            filter.setCreatedBy(Optional.ofNullable(filter.getCreatedBy()).orElse(existing.getCreatedBy()));
            filter.setLogType(Optional.ofNullable(filter.getLogType()).orElse(existing.getLogType()));
            logSavedFilterMapper.updateById(filter);
            return Result.success(filter);
        } catch (Exception e) {
            return Result.error("更新过滤器失败: " + e.getMessage());
        }
    }

    /**
     * 删除过滤器
     */
    @DeleteMapping("/filters/{id}")
    public Result<String> deleteFilter(@PathVariable Integer id) {
        try {
            LogSavedFilter existing = logSavedFilterMapper.selectById(id);
            if (existing == null) {
                return Result.error("过滤器不存在");
            }
            logSavedFilterMapper.deleteById(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error("删除过滤器失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有日志事件
     */
    @GetMapping("/events")
    public Result<List<LogEvent>> getAllEvents() {
        try {
            List<LogEvent> events = logEventMapper.selectList(null);
            return Result.success(events);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取日志事件失败: " + e.getMessage());
        }
    }

    /**
     * 根据严重程度级别获取中文名称
     */
    private String getSeverityName(Integer severity) {
        if (severity == null) return "未知";
        switch (severity) {
            case 0: return "紧急";
            case 1: return "告警";
            case 2: return "严重";
            case 3: return "错误";
            case 4: return "警告";
            case 5: return "通知";
            case 6: return "信息";
            case 7: return "调试";
            default: return "未知";
        }
    }

    private String getSeverityEnglishName(Integer severity) {
        if (severity == null) return "Unknown";
        switch (severity) {
            case 0: return "Emergency";
            case 1: return "Alert";
            case 2: return "Critical";
            case 3: return "Error";
            case 4: return "Warning";
            case 5: return "Notice";
            case 6: return "Info";
            case 7: return "Debug";
            default: return "Unknown";
        }
    }

    private String getDeviceTypeName(String deviceType) {
        if (deviceType == null) return "未知设备";
        switch (deviceType.toUpperCase()) {
            case "SERVER":
                return "服务器";
            case "NETWORK":
                return "网络设备";
            case "STORAGE":
                return "存储设备";
            case "VIDEO":
                return "视频设备";
            default:
                return deviceType;
        }
    }
    
    /**
     * 获取日志设置
     */
    @GetMapping("/settings")
    public Result<LogSettings> getSettings() {
        try {
            // 获取第一条设置记录，如果没有则创建默认设置
            LogSettings settings = logSettingsMapper.selectById(1);
            if (settings == null) {
                settings = new LogSettings();
                settings.setId(1);
                settings.setRetentionDays(180);
                settings.setForwardServerIp("");
                settings.setForwardServerPort(514);
                settings.setIsForwardEnabled(false);
                settings.setCreatedAt(LocalDateTime.now());
                settings.setUpdatedAt(LocalDateTime.now());
                logSettingsMapper.insert(settings);
            }
            return Result.success(settings);
        } catch (Exception e) {
            return Result.error("获取设置失败: " + e.getMessage());
        }
    }
    
    /**
     * 保存日志设置
     */
    @PostMapping("/settings")
    public Result<String> saveSettings(@RequestBody LogSettings settings) {
        try {
            settings.setUpdatedAt(LocalDateTime.now());
            
            // 检查是否存在记录
            LogSettings existingSettings = logSettingsMapper.selectById(1);
            if (existingSettings == null) {
                // 新增
                settings.setId(1);
                settings.setCreatedAt(LocalDateTime.now());
                logSettingsMapper.insert(settings);
            } else {
                // 更新
                settings.setId(1);
                settings.setCreatedAt(existingSettings.getCreatedAt());
                logSettingsMapper.updateById(settings);
            }
            
            return Result.success("设置保存成功");
        } catch (Exception e) {
            return Result.error("保存设置失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建新规则
     */
    @PostMapping("/rules")
    public Result<String> createRule(@RequestBody LogRule rule) {
        try {
            rule.setCreatedAt(LocalDateTime.now());
            rule.setUpdatedAt(LocalDateTime.now());
            rule.setIsEnabled(true); // 默认启用
            
            logRuleMapper.insert(rule);
            return Result.success("规则创建成功");
        } catch (Exception e) {
            return Result.error("创建规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取单个规则详情
     */
    @GetMapping("/rules/{id}")
    public Result<LogRule> getRule(@PathVariable Integer id) {
        try {
            LogRule rule = logRuleMapper.selectById(id);
            if (rule == null) {
                return Result.error("规则不存在");
            }
            return Result.success(rule);
        } catch (Exception e) {
            return Result.error("获取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新规则
     */
    @PutMapping("/rules/{id}")
    public Result<String> updateRule(@PathVariable Integer id, @RequestBody LogRule rule) {
        try {
            LogRule existingRule = logRuleMapper.selectById(id);
            if (existingRule == null) {
                return Result.error("规则不存在");
            }
            
            rule.setId(id);
            rule.setUpdatedAt(LocalDateTime.now());
            rule.setCreatedAt(existingRule.getCreatedAt());
            
            logRuleMapper.updateById(rule);
            return Result.success("规则更新成功");
        } catch (Exception e) {
            return Result.error("更新规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除规则
     */
    @DeleteMapping("/rules/{id}")
    public Result<String> deleteRule(@PathVariable Integer id) {
        try {
            LogRule existingRule = logRuleMapper.selectById(id);
            if (existingRule == null) {
                return Result.error("规则不存在");
            }
            
            logRuleMapper.deleteById(id);
            return Result.success("规则删除成功");
        } catch (Exception e) {
            return Result.error("删除规则失败: " + e.getMessage());
        }
    }
}
