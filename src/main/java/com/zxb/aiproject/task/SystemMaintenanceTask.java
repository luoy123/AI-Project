package com.zxb.aiproject.task;

import com.zxb.aiproject.service.SystemBackupService;
import com.zxb.aiproject.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;

/**
 * 系统维护定时任务
 * 包括：自动备份、历史数据清理
 */
@Slf4j
@Component
public class SystemMaintenanceTask {

    @Autowired
    private SystemBackupService systemBackupService;
    
    @Autowired
    private SystemConfigService systemConfigService;
    
    // 记录上次备份日期
    private LocalDate lastBackupDate = null;

    /**
     * 每天凌晨2点检查是否需要备份
     * 根据配置的备份间隔天数决定是否执行备份
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledBackup() {
        log.info("========== 开始检查系统备份任务 ==========");
        
        try {
            // 获取备份间隔配置
            String intervalStr = systemConfigService.getConfigValue("system.backupInterval");
            int backupInterval = intervalStr != null ? Integer.parseInt(intervalStr) : 7;
            
            LocalDate today = LocalDate.now();
            
            // 判断是否需要备份
            boolean needBackup = false;
            if (lastBackupDate == null) {
                // 首次运行，执行备份
                needBackup = true;
            } else {
                // 检查距离上次备份的天数
                long daysSinceLastBackup = java.time.temporal.ChronoUnit.DAYS.between(lastBackupDate, today);
                if (daysSinceLastBackup >= backupInterval) {
                    needBackup = true;
                }
            }
            
            if (needBackup) {
                log.info("执行系统自动备份，备份间隔: {}天", backupInterval);
                Map<String, Object> result = systemBackupService.executeBackup();
                
                if ((Integer) result.get("code") == 200) {
                    lastBackupDate = today;
                    log.info("系统自动备份成功: {}", result.get("data"));
                    
                    // 检查是否配置了推送地址
                    String pushUrl = systemConfigService.getConfigValue("system.backupPushUrl");
                    if (pushUrl != null && !pushUrl.isEmpty()) {
                        Map<String, Object> data = (Map<String, Object>) result.get("data");
                        String filename = (String) data.get("filename");
                        systemBackupService.pushBackup(filename, pushUrl);
                    }
                } else {
                    log.error("系统自动备份失败: {}", result.get("message"));
                }
            } else {
                log.info("未到备份时间，上次备份: {}, 间隔: {}天", lastBackupDate, backupInterval);
            }
            
        } catch (Exception e) {
            log.error("系统备份任务执行异常", e);
        }
        
        log.info("========== 系统备份任务检查完成 ==========");
    }

    /**
     * 每天凌晨3点执行历史数据清理
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduledCleanup() {
        log.info("========== 开始执行历史数据清理任务 ==========");
        
        try {
            Map<String, Object> result = systemBackupService.cleanupHistoryData();
            
            if ((Integer) result.get("code") == 200) {
                log.info("历史数据清理成功: {}", result.get("data"));
            } else {
                log.error("历史数据清理失败: {}", result.get("message"));
            }
            
        } catch (Exception e) {
            log.error("历史数据清理任务执行异常", e);
        }
        
        log.info("========== 历史数据清理任务完成 ==========");
    }

    /**
     * 每小时检查一次会话超时（可选）
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void checkSessionTimeout() {
        try {
            String enabledStr = systemConfigService.getConfigValue("security.enableSessionTimeout");
            boolean enabled = "true".equals(enabledStr);
            
            if (enabled) {
                String timeoutStr = systemConfigService.getConfigValue("security.sessionTimeout");
                int timeoutHours = timeoutStr != null ? Integer.parseInt(timeoutStr) : 1;
                log.debug("会话超时检查，超时时间: {}小时", timeoutHours);
                // 实际的会话清理由Spring Security或Session管理器处理
            }
        } catch (Exception e) {
            log.error("会话超时检查异常", e);
        }
    }
}
