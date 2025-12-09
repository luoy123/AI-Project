package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.AlertStats;
import com.zxb.aiproject.dto.PredictionStats;
import com.zxb.aiproject.entity.PredictionAlert;
import com.zxb.aiproject.entity.PredictionResult;
import com.zxb.aiproject.mapper.PredictionAlertMapper;
import com.zxb.aiproject.mapper.PredictionResultMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 报告数据收集器
 * 负责从各个数据源收集和统计预测相关数据
 */
@Slf4j
@Component
public class ReportDataCollector {
    
    @Autowired(required = false)
    private PredictionResultMapper predictionResultMapper;
    
    @Autowired(required = false)
    private PredictionAlertMapper predictionAlertMapper;
    
    private Long serviceId;
    private Long deviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    /**
     * 初始化数据收集器
     */
    public ReportDataCollector init(Long serviceId, Long deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        this.serviceId = serviceId;
        this.deviceId = deviceId;
        this.startTime = startTime;
        this.endTime = endTime;
        return this;
    }
    
    /**
     * 收集预测统计数据
     */
    public PredictionStats collectPredictionStats() {
        try {
            if (predictionResultMapper == null) {
                log.warn("PredictionResultMapper未注入，返回空统计数据");
                return createEmptyPredictionStats();
            }
            
            // 查询时间范围内的预测结果
            List<PredictionResult> results = getFilteredPredictionResults();
            
            if (results.isEmpty()) {
                log.info("时间范围内无预测结果数据: serviceId={}, deviceId={}, startTime={}, endTime={}", 
                        serviceId, deviceId, startTime, endTime);
                return createEmptyPredictionStats();
            }
            
            // 统计分析
            int totalPredictions = results.size();
            int anomalyCount = (int) results.stream()
                    .filter(r -> r.getIsAnomalous() != null && r.getIsAnomalous() == 1)
                    .count();
            
            // 计算置信度统计
            List<BigDecimal> confidences = results.stream()
                    .filter(r -> r.getConfidence() != null)
                    .map(PredictionResult::getConfidence)
                    .collect(Collectors.toList());
            
            BigDecimal avgConfidence = confidences.isEmpty() ? BigDecimal.ZERO :
                    confidences.stream()
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(confidences.size()), 4, RoundingMode.HALF_UP);
            
            BigDecimal maxConfidence = confidences.isEmpty() ? BigDecimal.ZERO :
                    confidences.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            
            BigDecimal minConfidence = confidences.isEmpty() ? BigDecimal.ZERO :
                    confidences.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            
            // 计算设备数量
            int deviceCount = (int) results.stream()
                    .filter(r -> r.getDeviceId() != null)
                    .map(PredictionResult::getDeviceId)
                    .distinct()
                    .count();
            
            // 计算准确率 (这里简化处理，实际应该与真实结果对比)
            BigDecimal accuracyRate = calculateAccuracyRate(results);
            
            PredictionStats stats = PredictionStats.builder()
                    .totalPredictions(totalPredictions)
                    .anomalyCount(anomalyCount)
                    .accuracyRate(accuracyRate)
                    .avgConfidence(avgConfidence)
                    .maxConfidence(maxConfidence)
                    .minConfidence(minConfidence)
                    .deviceCount(deviceCount)
                    .build();
            
            log.info("预测统计数据收集完成: {}", stats);
            return stats;
            
        } catch (Exception e) {
            log.error("收集预测统计数据失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return createEmptyPredictionStats();
        }
    }
    
    /**
     * 收集告警统计数据
     */
    public AlertStats collectAlertStats() {
        try {
            if (predictionAlertMapper == null) {
                log.warn("PredictionAlertMapper未注入，返回空告警统计");
                return createEmptyAlertStats();
            }
            
            // 查询时间范围内的告警数据
            List<PredictionAlert> alerts = getFilteredAlerts();
            
            if (alerts.isEmpty()) {
                log.info("时间范围内无告警数据: serviceId={}, deviceId={}, startTime={}, endTime={}", 
                        serviceId, deviceId, startTime, endTime);
                return createEmptyAlertStats();
            }
            
            // 按级别统计告警
            Map<String, Long> alertCounts = alerts.stream()
                    .filter(alert -> alert.getAlertLevel() != null)
                    .collect(Collectors.groupingBy(PredictionAlert::getAlertLevel, Collectors.counting()));
            
            AlertStats stats = AlertStats.builder()
                    .criticalAlerts(alertCounts.getOrDefault("CRITICAL", 0L).intValue())
                    .warningAlerts(alertCounts.getOrDefault("WARNING", 0L).intValue())
                    .infoAlerts(alertCounts.getOrDefault("INFO", 0L).intValue())
                    .build();
            
            log.info("告警统计数据收集完成: {}", stats);
            return stats;
            
        } catch (Exception e) {
            log.error("收集告警统计数据失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return createEmptyAlertStats();
        }
    }
    
    /**
     * 获取过滤后的预测结果
     */
    private List<PredictionResult> getFilteredPredictionResults() {
        // 这里需要实现具体的查询逻辑
        // 由于当前PredictionResultMapper可能没有完整的查询方法，先返回空列表
        // TODO: 实现具体的查询逻辑
        return Collections.emptyList();
    }
    
    /**
     * 获取过滤后的告警数据
     */
    private List<PredictionAlert> getFilteredAlerts() {
        // 这里需要实现具体的查询逻辑
        // 由于当前PredictionAlertMapper可能没有完整的查询方法，先返回空列表
        // TODO: 实现具体的查询逻辑
        return Collections.emptyList();
    }
    
    /**
     * 计算预测准确率
     * 这里简化处理，实际应该与真实结果进行对比
     */
    private BigDecimal calculateAccuracyRate(List<PredictionResult> results) {
        // 简化算法：基于置信度和异常检测情况估算准确率
        if (results.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // 基础准确率从平均置信度开始
        BigDecimal avgConfidence = results.stream()
                .filter(r -> r.getConfidence() != null)
                .map(PredictionResult::getConfidence)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(results.size()), 4, RoundingMode.HALF_UP);
        
        // 根据异常检测情况调整
        long anomalyCount = results.stream()
                .filter(r -> r.getIsAnomalous() != null && r.getIsAnomalous() == 1)
                .count();
        
        double anomalyRate = (double) anomalyCount / results.size();
        
        // 如果异常率过高，适当降低准确率评估
        BigDecimal adjustment = BigDecimal.valueOf(Math.max(0, 1.0 - anomalyRate * 0.2));
        
        return avgConfidence.multiply(adjustment).setScale(4, RoundingMode.HALF_UP);
    }
    
    /**
     * 创建空的预测统计数据
     */
    private PredictionStats createEmptyPredictionStats() {
        return PredictionStats.builder()
                .totalPredictions(0)
                .anomalyCount(0)
                .accuracyRate(BigDecimal.ZERO)
                .avgConfidence(BigDecimal.ZERO)
                .maxConfidence(BigDecimal.ZERO)
                .minConfidence(BigDecimal.ZERO)
                .deviceCount(0)
                .build();
    }
    
    /**
     * 创建空的告警统计数据
     */
    private AlertStats createEmptyAlertStats() {
        return AlertStats.builder()
                .criticalAlerts(0)
                .warningAlerts(0)
                .infoAlerts(0)
                .build();
    }
}
