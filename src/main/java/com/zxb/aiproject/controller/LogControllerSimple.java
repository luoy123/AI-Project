package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 简化的日志管理控制器 - 用于测试
 */
// @RestController  // 禁用模拟数据控制器
// @RequestMapping("/logs")
public class LogControllerSimple {

    /**
     * 测试端点
     */
    @GetMapping("/test")
    public Result<String> test() {
        return Result.success("LogController is working!");
    }

    /**
     * 获取所有日志规则
     */
    @GetMapping("/rules")
    public Result<List<Map<String, Object>>> getAllRules(@RequestParam(defaultValue = "Syslog") String logType) {
        try {
            List<Map<String, Object>> rules = new ArrayList<>();
            
            // 创建一些模拟规则数据
            for (int i = 1; i <= 5; i++) {
                Map<String, Object> rule = new HashMap<>();
                rule.put("id", i);
                rule.put("ruleName", "规则" + i);
                rule.put("logType", logType);
                rule.put("isEnabled", true);
                rule.put("description", "这是测试规则" + i);
                rules.add(rule);
            }
            
            return Result.success(rules);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取日志规则失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询Syslog日志
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
            System.out.println("=== Syslog查询参数 ===");
            System.out.println("Page: " + page);
            System.out.println("PageSize: " + pageSize);
            System.out.println("StartTime: " + startTime);
            System.out.println("EndTime: " + endTime);
            System.out.println("Keyword: " + keyword);
            System.out.println("DeviceTypes: " + deviceTypes);
            System.out.println("Severities: " + severities);
            
            // 创建模拟分页数据
            Map<String, Object> result = new HashMap<>();
            List<Map<String, Object>> records = new ArrayList<>();
            
            // 定义设备类型数组
            String[] allDeviceTypes = {"SERVER", "NETWORK", "STORAGE", "VIDEO"};
            String[] hostnamePrefixes = {"srv", "sw", "nas", "cam"};
            
            // 创建一些模拟日志数据
            for (int i = 1; i <= pageSize; i++) {
                Map<String, Object> log = new HashMap<>();
                int deviceIndex = i % 4; // 循环使用4种设备类型
                
                log.put("id", (page - 1) * pageSize + i);
                log.put("eventTime", "2025-11-14 16:30:0" + (i % 10));
                log.put("sourceIp", "192.168.1." + (i % 100 + 1));
                log.put("hostname", hostnamePrefixes[deviceIndex] + String.format("%02d", (i % 20 + 1)));
                
                // 如果有设备类型筛选，只返回筛选的类型；否则返回多样化的设备类型
                if (deviceTypes != null && !deviceTypes.isEmpty()) {
                    // 如果筛选了特定设备类型，所有记录都应该是该类型
                    String filteredType = deviceTypes.get(0);
                    if ("server".equals(filteredType)) {
                        log.put("deviceType", "SERVER");
                        log.put("hostname", "srv" + String.format("%02d", (i % 20 + 1)));
                    } else if ("network".equals(filteredType)) {
                        log.put("deviceType", "NETWORK");
                        log.put("hostname", "sw" + String.format("%02d", (i % 20 + 1)));
                    } else if ("storage".equals(filteredType)) {
                        log.put("deviceType", "STORAGE");
                        log.put("hostname", "nas" + String.format("%02d", (i % 20 + 1)));
                    } else if ("video".equals(filteredType)) {
                        log.put("deviceType", "VIDEO");
                        log.put("hostname", "cam" + String.format("%02d", (i % 20 + 1)));
                    } else {
                        log.put("deviceType", allDeviceTypes[deviceIndex]);
                    }
                } else {
                    // 没有筛选时，显示多样化的设备类型
                    log.put("deviceType", allDeviceTypes[deviceIndex]);
                }
                
                log.put("severity", severities != null && !severities.isEmpty() ? severities.get(0) : 3);
                log.put("severityName", getSeverityName(severities != null && !severities.isEmpty() ? severities.get(0) : 3));
                log.put("message", "这是模拟日志消息 " + i + (keyword != null ? " 包含关键字: " + keyword : ""));
                log.put("ruleName", "规则" + (i % 5 + 1));
                records.add(log);
            }
            
            result.put("records", records);
            result.put("total", 1200L);
            result.put("size", pageSize);
            result.put("current", page);
            result.put("pages", (1200 + pageSize - 1) / pageSize);
            
            return Result.success(result);
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
            @RequestParam(defaultValue = "event_time") String timeField) {
        try {
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalLogs", 1200);
            summary.put("totalDevices", 45);
            summary.put("alertCount", 23);
            summary.put("errorCount", 156);
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
            Map<String, Object> trend = new HashMap<>();
            List<Map<String, Object>> hourlyData = new ArrayList<>();
            for (int i = 0; i < 24; i++) {
                Map<String, Object> hourData = new HashMap<>();
                hourData.put("hour", String.format("%02d:00", i));
                hourData.put("count", (int)(Math.random() * 100));
                hourlyData.add(hourData);
            }
            trend.put("hourlyData", hourlyData);
            return Result.success(trend);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取趋势数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有日志事件
     */
    @GetMapping("/events")
    public Result<List<Map<String, Object>>> getAllEvents() {
        try {
            List<Map<String, Object>> events = new ArrayList<>();
            String[] eventNames = {"系统启动", "用户登录", "文件访问", "网络连接", "错误报告"};
            String[] eventColors = {"#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"};
            
            for (int i = 0; i < eventNames.length; i++) {
                Map<String, Object> event = new HashMap<>();
                event.put("id", i + 1);
                event.put("eventName", eventNames[i]);
                event.put("eventColor", eventColors[i]);
                event.put("description", "这是" + eventNames[i] + "事件");
                events.add(event);
            }
            
            return Result.success(events);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取日志事件失败: " + e.getMessage());
        }
    }

    /**
     * 根据严重程度级别获取中文名称
     */
    private String getSeverityName(int severity) {
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
}
