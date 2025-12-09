package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.PredictionReportEnhanced;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 预测报告服务测试
 */
@Slf4j
@SpringBootTest
public class PredictionReportServiceTest {
    
    @Autowired(required = false)
    private PredictionReportService reportService;
    
    @Test
    public void testGenerateHealthReport() {
        if (reportService == null) {
            log.warn("PredictionReportService未注入，跳过测试");
            return;
        }
        
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(1);
            
            // 生成设备级别健康度报告
            PredictionReportEnhanced report = reportService.generateHealthReport(30L, 28L, startTime, endTime);
            
            if (report != null) {
                log.info("健康度报告生成成功:");
                log.info("报告ID: {}", report.getId());
                log.info("报告标题: {}", report.getReportTitle());
                log.info("健康度评分: {}", report.getHealthScore());
                log.info("摘要: {}", report.getSummary());
            } else {
                log.info("报告已存在，跳过生成");
            }
            
        } catch (Exception e) {
            log.error("测试生成健康度报告失败: {}", e.getMessage(), e);
        }
    }
    
    @Test
    public void testGetLatestReports() {
        if (reportService == null) {
            log.warn("PredictionReportService未注入，跳过测试");
            return;
        }
        
        try {
            // 获取最新的健康度报告
            List<PredictionReportEnhanced> reports = reportService.getLatestReports(30L, "HEALTH", 5);
            
            log.info("获取到 {} 条健康度报告", reports.size());
            for (PredictionReportEnhanced report : reports) {
                log.info("报告: {} - 健康度: {} - 生成时间: {}", 
                        report.getReportTitle(), 
                        report.getHealthScore(), 
                        report.getReportTime());
            }
            
        } catch (Exception e) {
            log.error("测试获取最新报告失败: {}", e.getMessage(), e);
        }
    }
}
