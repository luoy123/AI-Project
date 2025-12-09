package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 增强预测报告实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("prediction_report_enhanced")
public class PredictionReportEnhanced implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 服务ID
     */
    @TableField("service_id")
    private Long serviceId;

    /**
     * 设备ID (NULL表示服务级别报告)
     */
    @TableField("device_id")
    private Long deviceId;

    /**
     * 报告类型 (HEALTH/TREND/SUMMARY/ANOMALY)
     */
    @TableField("report_type")
    private String reportType;

    /**
     * 报告周期 (DAILY/WEEKLY/MONTHLY/EVENT)
     */
    @TableField("report_period")
    private String reportPeriod;

    /**
     * 报告标题
     */
    @TableField("report_title")
    private String reportTitle;

    // ==================== 数据统计字段 ====================

    /**
     * 总预测次数
     */
    @TableField("total_predictions")
    private Integer totalPredictions;

    /**
     * 异常预测次数
     */
    @TableField("anomaly_count")
    private Integer anomalyCount;

    /**
     * 预测准确率
     */
    @TableField("accuracy_rate")
    private BigDecimal accuracyRate;

    /**
     * 健康度评分
     */
    @TableField("health_score")
    private BigDecimal healthScore;

    // ==================== 告警统计字段 ====================

    /**
     * 严重告警数
     */
    @TableField("critical_alerts")
    private Integer criticalAlerts;

    /**
     * 警告告警数
     */
    @TableField("warning_alerts")
    private Integer warningAlerts;

    /**
     * 信息告警数
     */
    @TableField("info_alerts")
    private Integer infoAlerts;

    // ==================== 趋势分析字段 ====================

    /**
     * 趋势方向 (IMPROVING/STABLE/DECLINING)
     */
    @TableField("trend_direction")
    private String trendDirection;

    /**
     * 趋势置信度
     */
    @TableField("trend_confidence")
    private BigDecimal trendConfidence;

    // ==================== 结构化报告内容 ====================

    /**
     * 摘要
     */
    @TableField("summary")
    private String summary;

    /**
     * 关键发现 (JSON格式)
     */
    @TableField("key_findings")
    private String keyFindings;

    /**
     * 建议措施 (JSON格式)
     */
    @TableField("recommendations")
    private String recommendations;

    /**
     * 详细分析
     */
    @TableField("detailed_analysis")
    private String detailedAnalysis;

    // ==================== 时间范围 ====================

    /**
     * 报告周期开始时间
     */
    @TableField("period_start")
    private LocalDateTime periodStart;

    /**
     * 报告周期结束时间
     */
    @TableField("period_end")
    private LocalDateTime periodEnd;

    /**
     * 报告生成时间
     */
    @TableField("report_time")
    private LocalDateTime reportTime;

    // ==================== 元数据 ====================

    /**
     * 生成方式 (SYSTEM/MANUAL)
     */
    @TableField("generated_by")
    private String generatedBy;

    /**
     * 报告模板版本
     */
    @TableField("template_version")
    private String templateVersion;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 删除标记 (0-未删除, 1-已删除)
     */
    @TableField("deleted")
    @TableLogic
    private Integer deleted;

    // ==================== 辅助方法 ====================

    /**
     * 获取总告警数
     */
    public Integer getTotalAlerts() {
        return (criticalAlerts != null ? criticalAlerts : 0) + 
               (warningAlerts != null ? warningAlerts : 0) + 
               (infoAlerts != null ? infoAlerts : 0);
    }

    /**
     * 获取异常率
     */
    public BigDecimal getAnomalyRate() {
        if (totalPredictions == null || totalPredictions == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(anomalyCount != null ? anomalyCount : 0)
                .divide(BigDecimal.valueOf(totalPredictions), 4, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * 获取健康度等级
     */
    public String getHealthLevel() {
        if (healthScore == null) return "未知";
        
        BigDecimal score = healthScore.multiply(BigDecimal.valueOf(100));
        if (score.compareTo(BigDecimal.valueOf(90)) >= 0) return "优秀";
        if (score.compareTo(BigDecimal.valueOf(80)) >= 0) return "良好";
        if (score.compareTo(BigDecimal.valueOf(70)) >= 0) return "一般";
        if (score.compareTo(BigDecimal.valueOf(60)) >= 0) return "较差";
        return "危险";
    }

    /**
     * 是否为设备级别报告
     */
    public boolean isDeviceLevel() {
        return deviceId != null;
    }

    /**
     * 是否为服务级别报告
     */
    public boolean isServiceLevel() {
        return deviceId == null;
    }
}
