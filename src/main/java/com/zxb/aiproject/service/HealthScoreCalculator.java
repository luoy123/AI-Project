package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.AlertStats;
import com.zxb.aiproject.dto.PredictionStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 健康度评分计算器
 * 基于预测统计和告警统计计算设备/服务的健康度评分
 */
@Slf4j
@Component
public class HealthScoreCalculator {
    
    // 评分权重配置
    private static final double ACCURACY_WEIGHT = 0.40;    // 预测准确率权重 40%
    private static final double ANOMALY_WEIGHT = 0.35;     // 异常率权重 35%
    private static final double ALERT_WEIGHT = 0.25;       // 告警权重 25%
    
    // 告警严重度权重
    private static final double CRITICAL_ALERT_WEIGHT = 3.0;
    private static final double WARNING_ALERT_WEIGHT = 1.5;
    private static final double INFO_ALERT_WEIGHT = 0.5;
    
    /**
     * 计算健康度评分
     * @param predictionStats 预测统计数据
     * @param alertStats 告警统计数据
     * @return 健康度评分 (0.0-1.0)
     */
    public BigDecimal calculateHealthScore(PredictionStats predictionStats, AlertStats alertStats) {
        try {
            // 基础分数 100分
            double score = 100.0;
            
            // 1. 根据预测准确率调整 (权重: 40%)
            double accuracyImpact = calculateAccuracyImpact(predictionStats);
            score -= accuracyImpact;
            
            // 2. 根据异常率调整 (权重: 35%)
            double anomalyImpact = calculateAnomalyImpact(predictionStats);
            score -= anomalyImpact;
            
            // 3. 根据告警严重程度调整 (权重: 25%)
            double alertImpact = calculateAlertImpact(alertStats);
            score -= alertImpact;
            
            // 确保分数在 0-100 范围内
            score = Math.max(0, Math.min(100, score));
            
            // 转换为 0.0-1.0 范围
            BigDecimal healthScore = BigDecimal.valueOf(score / 100.0)
                    .setScale(4, RoundingMode.HALF_UP);
            
            log.debug("健康度评分计算完成: 准确率影响={}, 异常率影响={}, 告警影响={}, 最终评分={}", 
                     accuracyImpact, anomalyImpact, alertImpact, healthScore);
            
            return healthScore;
            
        } catch (Exception e) {
            log.error("计算健康度评分失败: {}", e.getMessage(), e);
            return BigDecimal.valueOf(0.5); // 默认返回中等评分
        }
    }
    
    /**
     * 计算预测准确率对健康度的影响
     */
    private double calculateAccuracyImpact(PredictionStats predictionStats) {
        if (predictionStats == null || predictionStats.getAccuracyRate() == null) {
            return ACCURACY_WEIGHT * 100; // 无数据时扣满分
        }
        
        // 准确率越低，扣分越多
        double accuracyRate = predictionStats.getAccuracyRate().doubleValue();
        double impact = (1.0 - accuracyRate) * ACCURACY_WEIGHT * 100;
        
        log.debug("准确率影响计算: 准确率={}, 影响分数={}", accuracyRate, impact);
        return impact;
    }
    
    /**
     * 计算异常率对健康度的影响
     */
    private double calculateAnomalyImpact(PredictionStats predictionStats) {
        if (predictionStats == null || predictionStats.getTotalPredictions() == null || 
            predictionStats.getTotalPredictions() == 0) {
            return 0; // 无预测数据时不扣分
        }
        
        // 计算异常率
        int totalPredictions = predictionStats.getTotalPredictions();
        int anomalyCount = predictionStats.getAnomalyCount() != null ? predictionStats.getAnomalyCount() : 0;
        double anomalyRate = (double) anomalyCount / totalPredictions;
        
        // 异常率越高，扣分越多
        double impact = anomalyRate * ANOMALY_WEIGHT * 100;
        
        log.debug("异常率影响计算: 异常数={}, 总预测数={}, 异常率={}, 影响分数={}", 
                 anomalyCount, totalPredictions, anomalyRate, impact);
        return impact;
    }
    
    /**
     * 计算告警对健康度的影响
     */
    private double calculateAlertImpact(AlertStats alertStats) {
        if (alertStats == null) {
            return 0; // 无告警数据时不扣分
        }
        
        int criticalAlerts = alertStats.getCriticalAlerts() != null ? alertStats.getCriticalAlerts() : 0;
        int warningAlerts = alertStats.getWarningAlerts() != null ? alertStats.getWarningAlerts() : 0;
        int infoAlerts = alertStats.getInfoAlerts() != null ? alertStats.getInfoAlerts() : 0;
        
        // 按严重程度加权计算告警影响
        double weightedAlertScore = criticalAlerts * CRITICAL_ALERT_WEIGHT + 
                                   warningAlerts * WARNING_ALERT_WEIGHT + 
                                   infoAlerts * INFO_ALERT_WEIGHT;
        
        // 归一化告警影响 (假设10个严重告警为满分扣除)
        double maxAlertScore = 10 * CRITICAL_ALERT_WEIGHT;
        double normalizedScore = Math.min(1.0, weightedAlertScore / maxAlertScore);
        
        double impact = normalizedScore * ALERT_WEIGHT * 100;
        
        log.debug("告警影响计算: 严重={}, 警告={}, 信息={}, 加权分数={}, 影响分数={}", 
                 criticalAlerts, warningAlerts, infoAlerts, weightedAlertScore, impact);
        return impact;
    }
    
    /**
     * 获取健康度等级描述
     */
    public String getHealthLevel(BigDecimal healthScore) {
        if (healthScore == null) return "未知";
        
        double score = healthScore.doubleValue() * 100;
        if (score >= 90) return "优秀";
        if (score >= 80) return "良好";
        if (score >= 70) return "一般";
        if (score >= 60) return "较差";
        return "危险";
    }
    
    /**
     * 获取健康度等级颜色
     */
    public String getHealthLevelColor(BigDecimal healthScore) {
        if (healthScore == null) return "gray";
        
        double score = healthScore.doubleValue() * 100;
        if (score >= 90) return "green";
        if (score >= 80) return "blue";
        if (score >= 70) return "orange";
        if (score >= 60) return "red";
        return "darkred";
    }
    
    /**
     * 获取健康度改善建议
     */
    public String getHealthImprovementSuggestion(BigDecimal healthScore, PredictionStats predictionStats, AlertStats alertStats) {
        if (healthScore == null) return "数据不足，无法提供建议";
        
        double score = healthScore.doubleValue() * 100;
        StringBuilder suggestion = new StringBuilder();
        
        if (score < 70) {
            suggestion.append("设备健康度较低，建议：");
            
            // 分析主要问题
            if (predictionStats != null && predictionStats.getAccuracyRate() != null && 
                predictionStats.getAccuracyRate().doubleValue() < 0.8) {
                suggestion.append("1. 重新训练预测模型，提高准确率；");
            }
            
            if (predictionStats != null && predictionStats.getAnomalyRate().doubleValue() > 0.1) {
                suggestion.append("2. 分析异常原因，优化设备运行参数；");
            }
            
            if (alertStats != null && alertStats.hasCriticalAlerts()) {
                suggestion.append("3. 立即处理严重告警，制定预防措施；");
            }
            
            suggestion.append("4. 加强设备监控和维护。");
        } else if (score < 90) {
            suggestion.append("设备健康度良好，建议保持当前监控策略，持续优化。");
        } else {
            suggestion.append("设备健康度优秀，可作为标杆配置推广。");
        }
        
        return suggestion.toString();
    }
}
