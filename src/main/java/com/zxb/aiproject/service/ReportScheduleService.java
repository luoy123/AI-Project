package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.PredictionReportEnhanced;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * 报告定时调度服务
 * 负责自动生成各类定时报告
 */
@Slf4j
@Service
public class ReportScheduleService {
    
    @Autowired
    private PredictionReportService reportService;
    
    // 活跃服务ID列表（实际项目中应该从数据库获取）
    private final List<Long> activeServiceIds = Arrays.asList(30L, 31L, 32L);
    
    /**
     * 每日健康度报告生成
     * 每天凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void generateDailyHealthReports() {
        log.info("开始生成每日健康度报告...");
        
        try {
            LocalDateTime endTime = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime startTime = endTime.minusDays(1);
            
            int successCount = 0;
            int totalCount = activeServiceIds.size();
            
            for (Long serviceId : activeServiceIds) {
                try {
                    // 生成服务级别健康度报告
                    PredictionReportEnhanced report = reportService.generateHealthReport(
                            serviceId, null, startTime, endTime);
                    
                    if (report != null) {
                        successCount++;
                        log.debug("服务 {} 每日健康度报告生成成功", serviceId);
                    }
                    
                } catch (Exception e) {
                    log.error("服务 {} 每日健康度报告生成失败: {}", serviceId, e.getMessage());
                }
            }
            
            log.info("每日健康度报告生成完成: 成功 {}/{} 个服务", successCount, totalCount);
            
        } catch (Exception e) {
            log.error("每日健康度报告生成任务执行失败: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 每周趋势分析报告生成
     * 每周一凌晨3点执行
     */
    @Scheduled(cron = "0 0 3 ? * MON")
    public void generateWeeklyTrendReports() {
        log.info("开始生成每周趋势分析报告...");
        
        try {
            LocalDateTime endTime = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime startTime = endTime.minusDays(7);
            
            int successCount = 0;
            int totalCount = activeServiceIds.size();
            
            for (Long serviceId : activeServiceIds) {
                try {
                    PredictionReportEnhanced report = reportService.generateTrendReport(
                            serviceId, startTime, endTime);
                    
                    if (report != null) {
                        successCount++;
                        log.debug("服务 {} 每周趋势报告生成成功", serviceId);
                    }
                    
                } catch (Exception e) {
                    log.error("服务 {} 每周趋势报告生成失败: {}", serviceId, e.getMessage());
                }
            }
            
            log.info("每周趋势分析报告生成完成: 成功 {}/{} 个服务", successCount, totalCount);
            
        } catch (Exception e) {
            log.error("每周趋势分析报告生成任务执行失败: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 每月综合摘要报告生成
     * 每月1号凌晨4点执行
     */
    @Scheduled(cron = "0 0 4 1 * ?")
    public void generateMonthlySummaryReports() {
        log.info("开始生成每月综合摘要报告...");
        
        try {
            LocalDateTime endTime = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime startTime = endTime.minusMonths(1);
            
            int successCount = 0;
            int totalCount = activeServiceIds.size();
            
            for (Long serviceId : activeServiceIds) {
                try {
                    PredictionReportEnhanced report = reportService.generateSummaryReport(
                            serviceId, startTime, endTime);
                    
                    if (report != null) {
                        successCount++;
                        log.debug("服务 {} 每月摘要报告生成成功", serviceId);
                    }
                    
                } catch (Exception e) {
                    log.error("服务 {} 每月摘要报告生成失败: {}", serviceId, e.getMessage());
                }
            }
            
            log.info("每月综合摘要报告生成完成: 成功 {}/{} 个服务", successCount, totalCount);
            
        } catch (Exception e) {
            log.error("每月综合摘要报告生成任务执行失败: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 手动触发报告生成
     * @param serviceId 服务ID
     * @param reportType 报告类型
     * @param days 天数（向前推算）
     */
    public void generateReportManually(Long serviceId, String reportType, int days) {
        log.info("手动触发报告生成: serviceId={}, reportType={}, days={}", serviceId, reportType, days);
        
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);
            
            PredictionReportEnhanced report = null;
            
            switch (reportType.toUpperCase()) {
                case "HEALTH":
                    report = reportService.generateHealthReport(serviceId, null, startTime, endTime);
                    break;
                case "TREND":
                    report = reportService.generateTrendReport(serviceId, startTime, endTime);
                    break;
                case "SUMMARY":
                    report = reportService.generateSummaryReport(serviceId, startTime, endTime);
                    break;
                default:
                    throw new IllegalArgumentException("不支持的报告类型: " + reportType);
            }
            
            if (report != null) {
                log.info("手动报告生成成功: reportId={}", report.getId());
            } else {
                log.warn("报告已存在或生成失败");
            }
            
        } catch (Exception e) {
            log.error("手动报告生成失败: {}", e.getMessage(), e);
            throw new RuntimeException("手动报告生成失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取调度任务状态
     */
    public String getScheduleStatus() {
        return String.format(
            "定时任务调度状态:\n" +
            "- 每日健康度报告: 每天02:00执行\n" +
            "- 每周趋势分析: 每周一03:00执行\n" +
            "- 每月综合摘要: 每月1号04:00执行\n" +
            "- 当前时间: %s", 
            LocalDateTime.now()
        );
    }
}
