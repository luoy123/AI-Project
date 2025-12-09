package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.AlertStats;
import com.zxb.aiproject.dto.PredictionStats;
import com.zxb.aiproject.entity.PredictionReportEnhanced;
import com.zxb.aiproject.mapper.PredictionReportEnhancedMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 趋势分析服务
 * 负责分析预测数据的时间序列趋势
 */
@Slf4j
@Service
public class TrendAnalysisService {
    
    @Autowired
    private PredictionReportEnhancedMapper reportMapper;
    
    /**
     * 分析健康度趋势
     * @param serviceId 服务ID
     * @param days 分析天数
     * @return 趋势分析结果
     */
    public TrendAnalysisResult analyzeHealthTrend(Long serviceId, int days) {
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);
            
            // 获取历史健康度报告
            List<PredictionReportEnhanced> reports = reportMapper.getHealthReportsInPeriod(
                    serviceId, startTime, endTime);
            
            if (reports.isEmpty()) {
                return TrendAnalysisResult.builder()
                        .direction("UNKNOWN")
                        .confidence(BigDecimal.ZERO)
                        .description("无足够历史数据进行趋势分析")
                        .build();
            }
            
            // 提取健康度数据序列
            List<BigDecimal> healthScores = new ArrayList<>();
            for (PredictionReportEnhanced report : reports) {
                if (report.getHealthScore() != null) {
                    healthScores.add(report.getHealthScore());
                }
            }
            
            if (healthScores.size() < 2) {
                return TrendAnalysisResult.builder()
                        .direction("STABLE")
                        .confidence(BigDecimal.valueOf(0.5))
                        .description("数据点不足，假设趋势稳定")
                        .build();
            }
            
            // 计算趋势
            return calculateTrend(healthScores, "健康度");
            
        } catch (Exception e) {
            log.error("分析健康度趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return TrendAnalysisResult.builder()
                    .direction("ERROR")
                    .confidence(BigDecimal.ZERO)
                    .description("趋势分析失败: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * 分析准确率趋势
     * @param serviceId 服务ID
     * @param days 分析天数
     * @return 趋势分析结果
     */
    public TrendAnalysisResult analyzeAccuracyTrend(Long serviceId, int days) {
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);
            
            List<PredictionReportEnhanced> reports = reportMapper.getHealthReportsInPeriod(
                    serviceId, startTime, endTime);
            
            List<BigDecimal> accuracyRates = new ArrayList<>();
            for (PredictionReportEnhanced report : reports) {
                if (report.getAccuracyRate() != null) {
                    accuracyRates.add(report.getAccuracyRate());
                }
            }
            
            if (accuracyRates.size() < 2) {
                return TrendAnalysisResult.builder()
                        .direction("STABLE")
                        .confidence(BigDecimal.valueOf(0.5))
                        .description("准确率数据不足")
                        .build();
            }
            
            return calculateTrend(accuracyRates, "预测准确率");
            
        } catch (Exception e) {
            log.error("分析准确率趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return TrendAnalysisResult.builder()
                    .direction("ERROR")
                    .confidence(BigDecimal.ZERO)
                    .description("准确率趋势分析失败")
                    .build();
        }
    }
    
    /**
     * 分析异常率趋势
     * @param serviceId 服务ID
     * @param days 分析天数
     * @return 趋势分析结果
     */
    public TrendAnalysisResult analyzeAnomalyTrend(Long serviceId, int days) {
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);
            
            List<PredictionReportEnhanced> reports = reportMapper.getHealthReportsInPeriod(
                    serviceId, startTime, endTime);
            
            List<BigDecimal> anomalyRates = new ArrayList<>();
            for (PredictionReportEnhanced report : reports) {
                if (report.getTotalPredictions() != null && report.getTotalPredictions() > 0) {
                    int anomalyCount = report.getAnomalyCount() != null ? report.getAnomalyCount() : 0;
                    BigDecimal anomalyRate = BigDecimal.valueOf(anomalyCount)
                            .divide(BigDecimal.valueOf(report.getTotalPredictions()), 4, RoundingMode.HALF_UP);
                    anomalyRates.add(anomalyRate);
                }
            }
            
            if (anomalyRates.size() < 2) {
                return TrendAnalysisResult.builder()
                        .direction("STABLE")
                        .confidence(BigDecimal.valueOf(0.5))
                        .description("异常率数据不足")
                        .build();
            }
            
            return calculateTrend(anomalyRates, "异常检测率");
            
        } catch (Exception e) {
            log.error("分析异常率趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return TrendAnalysisResult.builder()
                    .direction("ERROR")
                    .confidence(BigDecimal.ZERO)
                    .description("异常率趋势分析失败")
                    .build();
        }
    }
    
    /**
     * 综合趋势分析
     * @param serviceId 服务ID
     * @param days 分析天数
     * @return 综合趋势分析结果
     */
    public ComprehensiveTrendResult analyzeComprehensiveTrend(Long serviceId, int days) {
        try {
            TrendAnalysisResult healthTrend = analyzeHealthTrend(serviceId, days);
            TrendAnalysisResult accuracyTrend = analyzeAccuracyTrend(serviceId, days);
            TrendAnalysisResult anomalyTrend = analyzeAnomalyTrend(serviceId, days);
            
            // 综合评估趋势方向
            String overallDirection = determineOverallTrend(healthTrend, accuracyTrend, anomalyTrend);
            
            // 计算综合置信度
            BigDecimal overallConfidence = calculateOverallConfidence(healthTrend, accuracyTrend, anomalyTrend);
            
            // 生成综合描述
            String description = generateComprehensiveDescription(healthTrend, accuracyTrend, anomalyTrend, overallDirection);
            
            return ComprehensiveTrendResult.builder()
                    .overallDirection(overallDirection)
                    .overallConfidence(overallConfidence)
                    .healthTrend(healthTrend)
                    .accuracyTrend(accuracyTrend)
                    .anomalyTrend(anomalyTrend)
                    .description(description)
                    .analysisDate(LocalDateTime.now())
                    .build();
            
        } catch (Exception e) {
            log.error("综合趋势分析失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return ComprehensiveTrendResult.builder()
                    .overallDirection("ERROR")
                    .overallConfidence(BigDecimal.ZERO)
                    .description("综合趋势分析失败: " + e.getMessage())
                    .analysisDate(LocalDateTime.now())
                    .build();
        }
    }
    
    /**
     * 计算单一指标的趋势
     */
    private TrendAnalysisResult calculateTrend(List<BigDecimal> values, String metricName) {
        if (values.size() < 2) {
            return TrendAnalysisResult.builder()
                    .direction("STABLE")
                    .confidence(BigDecimal.valueOf(0.5))
                    .description(metricName + "数据不足")
                    .build();
        }
        
        // 使用线性回归计算趋势
        double slope = calculateLinearRegressionSlope(values);
        
        // 计算趋势强度（基于斜率的绝对值）
        double trendStrength = Math.abs(slope);
        
        // 确定趋势方向
        String direction;
        if (Math.abs(slope) < 0.001) { // 阈值可调整
            direction = "STABLE";
        } else if (slope > 0) {
            direction = "IMPROVING";
        } else {
            direction = "DECLINING";
        }
        
        // 计算置信度（基于数据点数量和趋势强度）
        double confidence = Math.min(0.95, 0.3 + (values.size() * 0.1) + (trendStrength * 2));
        
        // 生成描述
        String description = generateTrendDescription(metricName, direction, slope, values.size());
        
        return TrendAnalysisResult.builder()
                .direction(direction)
                .confidence(BigDecimal.valueOf(confidence).setScale(4, RoundingMode.HALF_UP))
                .slope(BigDecimal.valueOf(slope).setScale(6, RoundingMode.HALF_UP))
                .description(description)
                .dataPoints(values.size())
                .build();
    }
    
    /**
     * 计算线性回归斜率
     */
    private double calculateLinearRegressionSlope(List<BigDecimal> values) {
        int n = values.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (int i = 0; i < n; i++) {
            double x = i; // 时间点
            double y = values.get(i).doubleValue();
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        
        // 斜率 = (n*∑xy - ∑x*∑y) / (n*∑x² - (∑x)²)
        double denominator = n * sumX2 - sumX * sumX;
        if (Math.abs(denominator) < 1e-10) {
            return 0; // 避免除零
        }
        
        return (n * sumXY - sumX * sumY) / denominator;
    }
    
    /**
     * 确定综合趋势方向
     */
    private String determineOverallTrend(TrendAnalysisResult health, TrendAnalysisResult accuracy, TrendAnalysisResult anomaly) {
        // 权重：健康度50%，准确率30%，异常率20%
        double healthWeight = 0.5;
        double accuracyWeight = 0.3;
        double anomalyWeight = 0.2;
        
        double score = 0;
        
        // 健康度和准确率提升为正，异常率下降为正
        if ("IMPROVING".equals(health.getDirection())) {
            score += healthWeight * health.getConfidence().doubleValue();
        } else if ("DECLINING".equals(health.getDirection())) {
            score -= healthWeight * health.getConfidence().doubleValue();
        }
        
        if ("IMPROVING".equals(accuracy.getDirection())) {
            score += accuracyWeight * accuracy.getConfidence().doubleValue();
        } else if ("DECLINING".equals(accuracy.getDirection())) {
            score -= accuracyWeight * accuracy.getConfidence().doubleValue();
        }
        
        // 异常率下降是好事
        if ("DECLINING".equals(anomaly.getDirection())) {
            score += anomalyWeight * anomaly.getConfidence().doubleValue();
        } else if ("IMPROVING".equals(anomaly.getDirection())) {
            score -= anomalyWeight * anomaly.getConfidence().doubleValue();
        }
        
        if (score > 0.1) {
            return "IMPROVING";
        } else if (score < -0.1) {
            return "DECLINING";
        } else {
            return "STABLE";
        }
    }
    
    /**
     * 计算综合置信度
     */
    private BigDecimal calculateOverallConfidence(TrendAnalysisResult health, TrendAnalysisResult accuracy, TrendAnalysisResult anomaly) {
        double avgConfidence = (health.getConfidence().doubleValue() + 
                               accuracy.getConfidence().doubleValue() + 
                               anomaly.getConfidence().doubleValue()) / 3.0;
        
        return BigDecimal.valueOf(avgConfidence).setScale(4, RoundingMode.HALF_UP);
    }
    
    /**
     * 生成趋势描述
     */
    private String generateTrendDescription(String metricName, String direction, double slope, int dataPoints) {
        String directionDesc;
        switch (direction) {
            case "IMPROVING":
                directionDesc = "呈上升趋势";
                break;
            case "DECLINING":
                directionDesc = "呈下降趋势";
                break;
            default:
                directionDesc = "保持稳定";
        }
        
        return String.format("%s在过去%d个数据点中%s，变化率为%.4f", 
                metricName, dataPoints, directionDesc, slope);
    }
    
    /**
     * 生成综合描述
     */
    private String generateComprehensiveDescription(TrendAnalysisResult health, TrendAnalysisResult accuracy, 
                                                  TrendAnalysisResult anomaly, String overallDirection) {
        StringBuilder desc = new StringBuilder();
        desc.append("综合趋势分析显示系统整体").append(getTrendDescription(overallDirection)).append("。");
        
        desc.append("具体表现为：");
        desc.append("健康度").append(getTrendDescription(health.getDirection())).append("；");
        desc.append("预测准确率").append(getTrendDescription(accuracy.getDirection())).append("；");
        desc.append("异常检测率").append(getTrendDescription(anomaly.getDirection())).append("。");
        
        return desc.toString();
    }
    
    private String getTrendDescription(String direction) {
        switch (direction) {
            case "IMPROVING": return "持续改善";
            case "DECLINING": return "有所下降";
            case "STABLE": return "保持稳定";
            default: return "状态未知";
        }
    }
    
    /**
     * 趋势分析结果
     */
    @Data
    public static class TrendAnalysisResult {
        private String direction;        // IMPROVING/STABLE/DECLINING/ERROR
        private BigDecimal confidence;   // 置信度 0.0-1.0
        private BigDecimal slope;        // 趋势斜率
        private String description;      // 描述
        private Integer dataPoints;     // 数据点数量
        
        public static TrendAnalysisResultBuilder builder() {
            return new TrendAnalysisResultBuilder();
        }
        
        public static class TrendAnalysisResultBuilder {
            private String direction;
            private BigDecimal confidence;
            private BigDecimal slope;
            private String description;
            private Integer dataPoints;
            
            public TrendAnalysisResultBuilder direction(String direction) {
                this.direction = direction;
                return this;
            }
            
            public TrendAnalysisResultBuilder confidence(BigDecimal confidence) {
                this.confidence = confidence;
                return this;
            }
            
            public TrendAnalysisResultBuilder slope(BigDecimal slope) {
                this.slope = slope;
                return this;
            }
            
            public TrendAnalysisResultBuilder description(String description) {
                this.description = description;
                return this;
            }
            
            public TrendAnalysisResultBuilder dataPoints(Integer dataPoints) {
                this.dataPoints = dataPoints;
                return this;
            }
            
            public TrendAnalysisResult build() {
                TrendAnalysisResult result = new TrendAnalysisResult();
                result.direction = this.direction;
                result.confidence = this.confidence;
                result.slope = this.slope;
                result.description = this.description;
                result.dataPoints = this.dataPoints;
                return result;
            }
        }
    }
    
    /**
     * 综合趋势分析结果
     */
    @Data
    public static class ComprehensiveTrendResult {
        private String overallDirection;
        private BigDecimal overallConfidence;
        private TrendAnalysisResult healthTrend;
        private TrendAnalysisResult accuracyTrend;
        private TrendAnalysisResult anomalyTrend;
        private String description;
        private LocalDateTime analysisDate;
        
        public static ComprehensiveTrendResultBuilder builder() {
            return new ComprehensiveTrendResultBuilder();
        }
        
        public static class ComprehensiveTrendResultBuilder {
            private String overallDirection;
            private BigDecimal overallConfidence;
            private TrendAnalysisResult healthTrend;
            private TrendAnalysisResult accuracyTrend;
            private TrendAnalysisResult anomalyTrend;
            private String description;
            private LocalDateTime analysisDate;
            
            public ComprehensiveTrendResultBuilder overallDirection(String overallDirection) {
                this.overallDirection = overallDirection;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder overallConfidence(BigDecimal overallConfidence) {
                this.overallConfidence = overallConfidence;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder healthTrend(TrendAnalysisResult healthTrend) {
                this.healthTrend = healthTrend;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder accuracyTrend(TrendAnalysisResult accuracyTrend) {
                this.accuracyTrend = accuracyTrend;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder anomalyTrend(TrendAnalysisResult anomalyTrend) {
                this.anomalyTrend = anomalyTrend;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder description(String description) {
                this.description = description;
                return this;
            }
            
            public ComprehensiveTrendResultBuilder analysisDate(LocalDateTime analysisDate) {
                this.analysisDate = analysisDate;
                return this;
            }
            
            public ComprehensiveTrendResult build() {
                ComprehensiveTrendResult result = new ComprehensiveTrendResult();
                result.overallDirection = this.overallDirection;
                result.overallConfidence = this.overallConfidence;
                result.healthTrend = this.healthTrend;
                result.accuracyTrend = this.accuracyTrend;
                result.anomalyTrend = this.anomalyTrend;
                result.description = this.description;
                result.analysisDate = this.analysisDate;
                return result;
            }
        }
    }
}
