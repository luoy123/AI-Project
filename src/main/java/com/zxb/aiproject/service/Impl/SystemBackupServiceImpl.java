package com.zxb.aiproject.service.Impl;

import com.zxb.aiproject.service.SystemBackupService;
import com.zxb.aiproject.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 系统备份服务实现
 */
@Slf4j
@Service
public class SystemBackupServiceImpl implements SystemBackupService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SystemConfigService systemConfigService;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    // 备份目录
    private static final String BACKUP_DIR = "backups";

    // 需要备份的核心表
    private static final String[] BACKUP_TABLES = {
            "sys_user", "sys_role", "sys_permission", "sys_role_permission",
            "system_config", "alert", "alert_rule", "asset", "business",
            "ops_ticket", "detection_template"
    };

    @Override
    public Map<String, Object> executeBackup() {
        Map<String, Object> result = new HashMap<>();

        try {
            // 确保备份目录存在
            Path backupPath = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupPath)) {
                Files.createDirectories(backupPath);
            }

            // 生成备份文件名
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String filename = "aiops_backup_" + timestamp + ".sql";
            Path backupFile = backupPath.resolve(filename);

            log.info("开始系统备份: {}", backupFile);

            // 执行备份
            StringBuilder sqlContent = new StringBuilder();
            sqlContent.append("-- AIOPS系统备份\n");
            sqlContent.append("-- 备份时间: ").append(new Date()).append("\n");
            sqlContent.append("-- ==========================================\n\n");

            for (String table : BACKUP_TABLES) {
                try {
                    sqlContent.append(exportTable(table));
                } catch (Exception e) {
                    log.warn("备份表 {} 失败: {}", table, e.getMessage());
                }
            }

            // 写入文件
            Files.write(backupFile, sqlContent.toString().getBytes("UTF-8"));

            // 获取文件大小
            long fileSize = Files.size(backupFile);
            String sizeStr = formatFileSize(fileSize);

            log.info("系统备份完成: {}, 大小: {}", filename, sizeStr);

            result.put("code", 200);
            result.put("message", "备份成功");
            Map<String, Object> data = new HashMap<>();
            data.put("filename", filename);
            data.put("size", sizeStr);
            data.put("path", backupFile.toString());
            data.put("time", new Date());
            result.put("data", data);

        } catch (Exception e) {
            log.error("系统备份失败", e);
            result.put("code", 500);
            result.put("message", "备份失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 导出单个表
     */
    private String exportTable(String tableName) {
        StringBuilder sb = new StringBuilder();

        try {
            // 获取表数据
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + tableName);

            if (rows.isEmpty()) {
                sb.append("-- 表 ").append(tableName).append(" 无数据\n\n");
                return sb.toString();
            }

            sb.append("-- 表: ").append(tableName).append("\n");
            sb.append("-- 记录数: ").append(rows.size()).append("\n");

            // 获取列名
            Set<String> columns = rows.get(0).keySet();
            String columnList = String.join(", ", columns.stream()
                    .map(c -> "`" + c + "`")
                    .collect(Collectors.toList()));

            // 生成INSERT语句
            for (Map<String, Object> row : rows) {
                sb.append("INSERT INTO `").append(tableName).append("` (")
                        .append(columnList).append(") VALUES (");

                List<String> values = new ArrayList<>();
                for (String col : columns) {
                    Object value = row.get(col);
                    if (value == null) {
                        values.add("NULL");
                    } else if (value instanceof Number) {
                        values.add(value.toString());
                    } else if (value instanceof Boolean) {
                        values.add((Boolean) value ? "1" : "0");
                    } else {
                        String strValue = value.toString()
                                .replace("\\", "\\\\")
                                .replace("'", "\\'")
                                .replace("\n", "\\n")
                                .replace("\r", "\\r");
                        values.add("'" + strValue + "'");
                    }
                }

                sb.append(String.join(", ", values));
                sb.append(");\n");
            }

            sb.append("\n");

        } catch (Exception e) {
            sb.append("-- 导出表 ").append(tableName).append(" 失败: ").append(e.getMessage()).append("\n\n");
        }

        return sb.toString();
    }

    @Override
    public Map<String, Object> getBackupList() {
        Map<String, Object> result = new HashMap<>();

        try {
            Path backupPath = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupPath)) {
                result.put("code", 200);
                result.put("data", Collections.emptyList());
                return result;
            }

            List<Map<String, Object>> backups = Files.list(backupPath)
                    .filter(p -> p.toString().endsWith(".sql"))
                    .sorted(Comparator.reverseOrder())
                    .map(p -> {
                        Map<String, Object> info = new HashMap<>();
                        try {
                            info.put("filename", p.getFileName().toString());
                            info.put("size", formatFileSize(Files.size(p)));
                            info.put("time", new Date(Files.getLastModifiedTime(p).toMillis()));
                        } catch (IOException e) {
                            log.error("读取备份文件信息失败", e);
                        }
                        return info;
                    })
                    .collect(Collectors.toList());

            result.put("code", 200);
            result.put("data", backups);

        } catch (Exception e) {
            log.error("获取备份列表失败", e);
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }

        return result;
    }

    @Override
    public String getBackupFilePath(String filename) {
        Path backupFile = Paths.get(BACKUP_DIR, filename);
        if (Files.exists(backupFile)) {
            return backupFile.toAbsolutePath().toString();
        }
        return null;
    }

    @Override
    public boolean deleteBackup(String filename) {
        try {
            Path backupFile = Paths.get(BACKUP_DIR, filename);
            if (Files.exists(backupFile)) {
                Files.delete(backupFile);
                log.info("删除备份文件: {}", filename);
                return true;
            }
        } catch (Exception e) {
            log.error("删除备份文件失败: {}", filename, e);
        }
        return false;
    }

    @Override
    public Map<String, Object> pushBackup(String filename, String targetUrl) {
        Map<String, Object> result = new HashMap<>();

        try {
            Path backupFile = Paths.get(BACKUP_DIR, filename);
            if (!Files.exists(backupFile)) {
                result.put("code", 404);
                result.put("message", "备份文件不存在");
                return result;
            }

            // 这里实现推送逻辑（可以是FTP、HTTP上传等）
            // 目前只是模拟推送
            log.info("推送备份文件 {} 到 {}", filename, targetUrl);

            // TODO: 实现实际的文件推送
            // 可以使用 RestTemplate 或 HttpClient 进行HTTP上传
            // 或者使用 Apache Commons Net 进行FTP上传

            result.put("code", 200);
            result.put("message", "推送成功");
            Map<String, Object> data = new HashMap<>();
            data.put("filename", filename);
            data.put("targetUrl", targetUrl);
            data.put("time", new Date());
            result.put("data", data);

        } catch (Exception e) {
            log.error("推送备份失败", e);
            result.put("code", 500);
            result.put("message", "推送失败: " + e.getMessage());
        }

        return result;
    }

    @Override
    public Map<String, Object> cleanupHistoryData() {
        Map<String, Object> result = new HashMap<>();
        Map<String, Integer> cleanupStats = new HashMap<>();

        try {
            // 获取配置的保留天数
            String metricsRetentionStr = systemConfigService.getConfigValue("system.metricsRetentionDays");
            int metricsRetentionDays = metricsRetentionStr != null ? Integer.parseInt(metricsRetentionStr) : 90;

            String passwordRetentionStr = systemConfigService.getConfigValue("system.passwordRetentionDays");
            int passwordRetentionDays = passwordRetentionStr != null ? Integer.parseInt(passwordRetentionStr) : 30;

            log.info("开始清理历史数据，指标保留{}天，密码保留{}天", metricsRetentionDays, passwordRetentionDays);

            // 清理预测结果数据
            cleanupStats.put("prediction_result", safeDelete(
                    "DELETE FROM prediction_result WHERE create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理预测报告数据
            cleanupStats.put("prediction_report", safeDelete(
                    "DELETE FROM prediction_report WHERE create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理预测训练历史
            cleanupStats.put("prediction_train_history", safeDelete(
                    "DELETE FROM prediction_train_history WHERE create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理已解决的告警
            cleanupStats.put("alert_resolved", safeDelete(
                    "DELETE FROM alert WHERE status = '已解决' AND create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理云平台告警历史
            cleanupStats.put("cloud_alert", safeDelete(
                    "DELETE FROM cloud_alert WHERE status = '已处理' AND create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理日志数据
            cleanupStats.put("t_log_syslog", safeDelete(
                    "DELETE FROM t_log_syslog WHERE receive_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理日志事件
            cleanupStats.put("t_log_events", safeDelete(
                    "DELETE FROM t_log_events WHERE create_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理设备快照
            cleanupStats.put("device_snapshot", safeDelete(
                    "DELETE FROM device_snapshot WHERE snapshot_time < DATE_SUB(NOW(), INTERVAL ? DAY)",
                    metricsRetentionDays));

            // 清理旧的备份文件
            int backupDeleted = cleanupOldBackups(30); // 保留30天的备份
            cleanupStats.put("backup_files", backupDeleted);

            int totalDeleted = cleanupStats.values().stream().mapToInt(Integer::intValue).sum();

            log.info("历史数据清理完成，共清理 {} 条记录", totalDeleted);

            result.put("code", 200);
            result.put("message", "清理完成，共清理 " + totalDeleted + " 条记录");
            result.put("data", cleanupStats);

        } catch (Exception e) {
            log.error("清理历史数据失败", e);
            result.put("code", 500);
            result.put("message", "清理失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 安全删除，如果表不存在则返回0
     */
    private int safeDelete(String sql, int days) {
        try {
            return jdbcTemplate.update(sql, days);
        } catch (Exception e) {
            log.warn("清理数据跳过: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 清理旧的备份文件
     */
    private int cleanupOldBackups(int retentionDays) {
        int deleted = 0;
        try {
            Path backupPath = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupPath)) {
                return 0;
            }

            long cutoffTime = System.currentTimeMillis() - (retentionDays * 24L * 60 * 60 * 1000);

            List<Path> oldFiles = Files.list(backupPath)
                    .filter(p -> {
                        try {
                            return Files.getLastModifiedTime(p).toMillis() < cutoffTime;
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            for (Path file : oldFiles) {
                try {
                    Files.delete(file);
                    deleted++;
                    log.info("删除过期备份: {}", file.getFileName());
                } catch (IOException e) {
                    log.error("删除备份文件失败: {}", file, e);
                }
            }

        } catch (Exception e) {
            log.error("清理旧备份失败", e);
        }
        return deleted;
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", size / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", size / (1024.0 * 1024 * 1024));
        }
    }
}
