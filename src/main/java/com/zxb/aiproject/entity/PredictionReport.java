package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 预测报告实体类 - 匹配prediction_report表结构
 */
@Data
@TableName("prediction_report")
public class PredictionReport implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    // ========== 分类信息 ==========
    @TableField("category_id")
    private Long categoryId;

    @TableField("category_name")
    private String categoryName;

    @TableField("category_type")
    private String categoryType;

    // ========== 预测时间范围 ==========
    @TableField("predict_days")
    private Integer predictDays;

    @TableField("predict_date")
    private LocalDate predictDate;

    // ========== 设备统计 ==========
    @TableField("total_devices")
    private Integer totalDevices;

    @TableField("normal_devices")
    private Integer normalDevices;

    @TableField("warning_devices")
    private Integer warningDevices;

    @TableField("risk_devices")
    private Integer riskDevices;

    // ========== 故障预测 ==========
    @TableField("predicted_failures")
    private Integer predictedFailures;

    @TableField("failure_probability")
    private BigDecimal failureProbability;

    @TableField("confidence_level")
    private BigDecimal confidenceLevel;

    // ========== 关键指标 ==========
    @TableField("avg_cpu_usage")
    private BigDecimal avgCpuUsage;

    @TableField("avg_memory_usage")
    private BigDecimal avgMemoryUsage;

    @TableField("avg_disk_usage")
    private BigDecimal avgDiskUsage;

    @TableField("avg_network_traffic")
    private BigDecimal avgNetworkTraffic;

    // ========== 健康评分 ==========
    @TableField("health_score")
    private Integer healthScore;

    @TableField("health_status")
    private String healthStatus;

    // ========== 趋势分析 ==========
    @TableField("trend")
    private String trend;

    @TableField("trend_description")
    private String trendDescription;

    // ========== 风险分析 ==========
    @TableField("risk_level")
    private String riskLevel;

    @TableField("risk_factors")
    private String riskFactors;

    // ========== 建议措施 ==========
    @TableField("recommendations")
    private String recommendations;

    // ========== 详细报告 ==========
    @TableField("detailed_report")
    private String detailedReport;

    @TableField("report_summary")
    private String reportSummary;

    // ========== 元数据 ==========
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField("generated_by")
    private String generatedBy;
}
