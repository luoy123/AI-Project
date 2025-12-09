package com.zxb.aiproject.util;

import java.util.HashMap;
import java.util.Map;

/**
 * Syslog Facility 工具类
 * 统一管理 Facility 代码和名称的映射关系
 */
public class SyslogFacilityUtil {
    
    private static final Map<Integer, String> FACILITY_MAP = new HashMap<>();
    
    static {
        // 标准 Syslog Facility 映射 (RFC 3164)
        FACILITY_MAP.put(0, "Kernel");          // 内核消息
        FACILITY_MAP.put(1, "User");            // 用户级消息
        FACILITY_MAP.put(2, "Mail");            // 邮件系统
        FACILITY_MAP.put(3, "Daemon");          // 系统守护进程
        FACILITY_MAP.put(4, "Security");        // 安全/授权消息
        FACILITY_MAP.put(5, "Syslogd");         // syslogd内部消息
        FACILITY_MAP.put(6, "Line Printer");    // 行式打印机子系统
        FACILITY_MAP.put(7, "Network News");    // 网络新闻子系统
        FACILITY_MAP.put(8, "UUCP");            // UUCP子系统
        FACILITY_MAP.put(9, "Clock");           // 时钟守护进程
        FACILITY_MAP.put(10, "Security");       // 安全/授权消息
        FACILITY_MAP.put(11, "FTP");            // FTP守护进程
        FACILITY_MAP.put(12, "NTP");            // NTP子系统
        FACILITY_MAP.put(13, "Log Audit");      // 日志审计
        FACILITY_MAP.put(14, "Log Alert");      // 日志告警
        FACILITY_MAP.put(15, "Clock");          // 时钟守护进程
        FACILITY_MAP.put(16, "Local0");         // 本地使用0
        FACILITY_MAP.put(17, "Local1");         // 本地使用1
        FACILITY_MAP.put(18, "Local2");         // 本地使用2
        FACILITY_MAP.put(19, "Local3");         // 本地使用3
        FACILITY_MAP.put(20, "Local4");         // 本地使用4
        FACILITY_MAP.put(21, "Local5");         // 本地使用5
        FACILITY_MAP.put(22, "Local6");         // 本地使用6
        FACILITY_MAP.put(23, "Local7");         // 本地使用7
    }
    
    /**
     * 根据 facility 代码获取名称
     * @param facility facility 代码 (0-23)
     * @return facility 名称
     */
    public static String getFacilityName(int facility) {
        return FACILITY_MAP.getOrDefault(facility, "Unknown(" + facility + ")");
    }
    
    /**
     * 获取所有 facility 映射
     * @return facility 映射表
     */
    public static Map<Integer, String> getAllFacilities() {
        return new HashMap<>(FACILITY_MAP);
    }
    
    /**
     * 检查 facility 代码是否有效
     * @param facility facility 代码
     * @return 是否有效
     */
    public static boolean isValidFacility(int facility) {
        return facility >= 0 && facility <= 23;
    }
}
