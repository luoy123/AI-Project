package com.zxb.aiproject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zxb.aiproject.dto.AlertStats;
import com.zxb.aiproject.dto.PredictionStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 报告内容生成器
 * 负责根据统计数据生成结构化的报告内容
 */
@Slf4j
@Component
public class ReportContentGenerator {
    
    @Autowired
    private HealthScoreCalculator healthScoreCalculator;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * 生成健康度报告内容
     */
    public ReportContent generateHealthReportContent(PredictionStats predictionStats, 
                                                   AlertStats alertStats, 
                                                   BigDecimal healthScore,
                                                   LocalDateTime periodStart,
                                                   LocalDateTime periodEnd) {
        
        // 生成摘要
        String summary = generateHealthSummary(healthScore, predictionStats, alertStats, periodStart, periodEnd);
        
        // 生成关键发现
        List<String> keyFindings = generateKeyFindings(predictionStats, alertStats, healthScore);
        
        // 生成建议措施
        List<String> recommendations = generateRecommendations(healthScore, predictionStats, alertStats);
        
        // 生成详细分析
        String detailedAnalysis = generateDetailedAnalysis(predictionStats, alertStats, healthScore);
        
        return ReportContent.builder()
                .summary(summary)
                .keyFindings(convertListToJson(keyFindings))
                .recommendations(convertListToJson(recommendations))
                .detailedAnalysis(detailedAnalysis)
                .build();
    }
    
    /**
     * 生成健康度摘要
     */
    private String generateHealthSummary(BigDecimal healthScore, PredictionStats predictionStats, 
                                       AlertStats alertStats, LocalDateTime periodStart, LocalDateTime periodEnd) {
        
        String healthLevel = healthScoreCalculator.getHealthLevel(healthScore);
        String periodDesc = generatePeriodDescription(periodStart, periodEnd);
        
        int totalPredictions = predictionStats.getTotalPredictions() != null ? predictionStats.getTotalPredictions() : 0;
        int anomalyCount = predictionStats.getAnomalyCount() != null ? predictionStats.getAnomalyCount() : 0;
        double accuracyRate = predictionStats.getAccuracyRate() != null ? 
                predictionStats.getAccuracyRate().doubleValue() * 100 : 0.0;
        
        int totalAlerts = alertStats.getTotalAlerts();
        int criticalAlerts = alertStats.getCriticalAlerts() != null ? alertStats.getCriticalAlerts() : 0;
        int warningAlerts = alertStats.getWarningAlerts() != null ? alertStats.getWarningAlerts() : 0;
        
        return String.format(
            "设备健康度评分为 %.1f 分，处于%s状态。" +
            "在%s内，共进行了 %d 次预测，其中 %d 次检测到异常，预测准确率为 %.1f%%。" +
            "共产生 %d 条告警，其中严重告警 %d 条，警告告警 %d 条。",
            healthScore.doubleValue() * 100, healthLevel, periodDesc,
            totalPredictions, anomalyCount, accuracyRate,
            totalAlerts, criticalAlerts, warningAlerts
        );
    }
    
    /**
     * 生成关键发现
     */
    private List<String> generateKeyFindings(PredictionStats predictionStats, AlertStats alertStats, BigDecimal healthScore) {
        List<String> findings = new ArrayList<>();
        
        // 健康度分析
        double score = healthScore.doubleValue() * 100;
        if (score >= 90) {
            findings.add("设备健康度优秀，运行状态良好");
        } else if (score >= 80) {
            findings.add("设备健康度良好，整体运行稳定");
        } else if (score >= 70) {
            findings.add("设备健康度一般，需要关注运行状态");
        } else {
            findings.add("设备健康度较差，需要立即关注和处理");
        }
        
        // 异常率分析
        if (predictionStats.getTotalPredictions() != null && predictionStats.getTotalPredictions() > 0) {
            double anomalyRate = predictionStats.getAnomalyRate().doubleValue();
            if (anomalyRate > 0.15) {
                findings.add(String.format("异常检测率较高 (%.1f%%)，设备可能存在潜在问题", anomalyRate * 100));
            } else if (anomalyRate > 0.05) {
                findings.add(String.format("异常检测率适中 (%.1f%%)，需要持续监控", anomalyRate * 100));
            } else {
                findings.add(String.format("异常检测率较低 (%.1f%%)，设备运行稳定", anomalyRate * 100));
            }
        }
        
        // 准确率分析
        if (predictionStats.getAccuracyRate() != null) {
            double accuracyRate = predictionStats.getAccuracyRate().doubleValue();
            if (accuracyRate < 0.7) {
                findings.add("预测准确率偏低，建议重新训练模型或调整参数");
            } else if (accuracyRate < 0.85) {
                findings.add("预测准确率中等，有进一步优化空间");
            } else {
                findings.add("预测准确率表现优秀，模型效果良好");
            }
        }
        
        // 告警分析
        if (alertStats.hasCriticalAlerts()) {
            findings.add(String.format("发现 %d 条严重告警，需要立即处理", alertStats.getCriticalAlerts()));
        }
        
        if (alertStats.getTotalAlerts() == 0) {
            findings.add("统计周期内无告警产生，系统运行平稳");
        }
        
        // 置信度分析
        if (predictionStats.getAvgConfidence() != null) {
            double avgConfidence = predictionStats.getAvgConfidence().doubleValue();
            if (avgConfidence >= 0.9) {
                findings.add("预测置信度很高，模型预测结果可信度强");
            } else if (avgConfidence >= 0.7) {
                findings.add("预测置信度良好，模型预测结果较为可信");
            } else {
                findings.add("预测置信度偏低，建议检查模型训练质量");
            }
        }
        
        return findings;
    }
    
    /**
     * 生成建议措施
     */
    private List<String> generateRecommendations(BigDecimal healthScore, PredictionStats predictionStats, AlertStats alertStats) {
        List<String> recommendations = new ArrayList<>();
        
        double score = healthScore.doubleValue() * 100;
        
        // 基于健康度的建议
        if (score < 60) {
            recommendations.add("设备健康度危险，建议立即进行全面检查和维护");
            recommendations.add("考虑设备升级或更换关键组件");
        } else if (score < 70) {
            recommendations.add("设备健康度较差，建议加强监控频率");
            recommendations.add("制定设备维护计划，定期检查关键指标");
        } else if (score < 80) {
            recommendations.add("设备健康度一般，建议优化运行参数");
            recommendations.add("关注异常趋势，及时调整监控策略");
        } else if (score < 90) {
            recommendations.add("设备健康度良好，保持当前监控策略");
            recommendations.add("可适当优化监控参数，提升效率");
        } else {
            recommendations.add("设备健康度优秀，可作为标杆配置推广");
            recommendations.add("保持当前优秀的运维策略");
        }
        
        // 基于预测准确率的建议
        if (predictionStats.getAccuracyRate() != null && predictionStats.getAccuracyRate().doubleValue() < 0.8) {
            recommendations.add("重新训练预测模型，增加训练数据量");
            recommendations.add("调整模型参数，优化预测算法");
            recommendations.add("检查数据质量，清理异常数据");
        }
        
        // 基于异常率的建议
        if (predictionStats.getAnomalyRate().doubleValue() > 0.1) {
            recommendations.add("分析异常模式，识别潜在故障原因");
            recommendations.add("调整异常检测阈值，减少误报");
            recommendations.add("加强对异常频发时段的监控");
        }
        
        // 基于告警的建议
        if (alertStats.hasCriticalAlerts()) {
            recommendations.add("立即处理所有严重告警");
            recommendations.add("分析告警根因，制定预防措施");
            recommendations.add("建立告警响应流程，提高处理效率");
        }
        
        if (alertStats.getTotalAlerts() > 10) {
            recommendations.add("告警数量较多，建议优化告警规则");
            recommendations.add("设置告警优先级，避免告警疲劳");
        }
        
        // 通用建议
        recommendations.add("定期备份设备配置，确保快速恢复");
        recommendations.add("建立设备性能基线，便于异常对比");
        
        return recommendations;
    }
    
    /**
     * 生成详细分析
     */
    private String generateDetailedAnalysis(PredictionStats predictionStats, AlertStats alertStats, BigDecimal healthScore) {
        StringBuilder analysis = new StringBuilder();
        
        analysis.append("## 详细分析报告\n\n");
        
        // 健康度分析
        analysis.append("### 健康度评分分析\n");
        analysis.append(String.format("当前健康度评分：%.1f分 (%s)\n", 
                healthScore.doubleValue() * 100, healthScoreCalculator.getHealthLevel(healthScore)));
        analysis.append(healthScoreCalculator.getHealthImprovementSuggestion(healthScore, predictionStats, alertStats));
        analysis.append("\n\n");
        
        // 预测性能分析
        analysis.append("### 预测性能分析\n");
        if (predictionStats.getTotalPredictions() != null && predictionStats.getTotalPredictions() > 0) {
            analysis.append(String.format("- 总预测次数：%d次\n", predictionStats.getTotalPredictions()));
            analysis.append(String.format("- 异常检测次数：%d次\n", predictionStats.getAnomalyCount()));
            analysis.append(String.format("- 异常检测率：%.2f%%\n", predictionStats.getAnomalyRate().doubleValue() * 100));
            analysis.append(String.format("- 预测准确率：%.2f%%\n", predictionStats.getAccuracyRate().doubleValue() * 100));
            
            if (predictionStats.getAvgConfidence() != null) {
                analysis.append(String.format("- 平均置信度：%.2f%%\n", predictionStats.getAvgConfidence().doubleValue() * 100));
            }
        } else {
            analysis.append("统计周期内无预测数据。\n");
        }
        analysis.append("\n");
        
        // 告警分析
        analysis.append("### 告警情况分析\n");
        if (alertStats.getTotalAlerts() > 0) {
            analysis.append(String.format("- 总告警数：%d条\n", alertStats.getTotalAlerts()));
            analysis.append(String.format("- 严重告警：%d条\n", alertStats.getCriticalAlerts()));
            analysis.append(String.format("- 警告告警：%d条\n", alertStats.getWarningAlerts()));
            analysis.append(String.format("- 信息告警：%d条\n", alertStats.getInfoAlerts()));
            analysis.append(String.format("- 严重告警比例：%.1f%%\n", alertStats.getCriticalAlertRate() * 100));
        } else {
            analysis.append("统计周期内无告警产生，系统运行平稳。\n");
        }
        analysis.append("\n");
        
        // 趋势分析
        analysis.append("### 趋势分析\n");
        analysis.append("基于当前数据，建议持续关注以下指标的变化趋势：\n");
        analysis.append("- 预测准确率变化\n");
        analysis.append("- 异常检测频率\n");
        analysis.append("- 告警产生模式\n");
        analysis.append("- 设备性能指标\n");
        
        return analysis.toString();
    }
    
    /**
     * 生成时间段描述
     */
    private String generatePeriodDescription(LocalDateTime start, LocalDateTime end) {
        if (start.toLocalDate().equals(end.toLocalDate())) {
            return start.format(DATE_FORMATTER) + "当日";
        } else {
            return start.format(DATE_FORMATTER) + " 至 " + end.format(DATE_FORMATTER);
        }
    }
    
    /**
     * 将List转换为JSON字符串
     */
    private String convertListToJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("转换List到JSON失败: {}", e.getMessage());
            return "[]";
        }
    }
    
    /**
     * 报告内容构建器
     */
    public static class ReportContent {
        private String summary;
        private String keyFindings;
        private String recommendations;
        private String detailedAnalysis;
        
        public static ReportContentBuilder builder() {
            return new ReportContentBuilder();
        }
        
        public static class ReportContentBuilder {
            private String summary;
            private String keyFindings;
            private String recommendations;
            private String detailedAnalysis;
            
            public ReportContentBuilder summary(String summary) {
                this.summary = summary;
                return this;
            }
            
            public ReportContentBuilder keyFindings(String keyFindings) {
                this.keyFindings = keyFindings;
                return this;
            }
            
            public ReportContentBuilder recommendations(String recommendations) {
                this.recommendations = recommendations;
                return this;
            }
            
            public ReportContentBuilder detailedAnalysis(String detailedAnalysis) {
                this.detailedAnalysis = detailedAnalysis;
                return this;
            }
            
            public ReportContent build() {
                ReportContent content = new ReportContent();
                content.summary = this.summary;
                content.keyFindings = this.keyFindings;
                content.recommendations = this.recommendations;
                content.detailedAnalysis = this.detailedAnalysis;
                return content;
            }
        }
        
        // Getters
        public String getSummary() { return summary; }
        public String getKeyFindings() { return keyFindings; }
        public String getRecommendations() { return recommendations; }
        public String getDetailedAnalysis() { return detailedAnalysis; }
    }
}
