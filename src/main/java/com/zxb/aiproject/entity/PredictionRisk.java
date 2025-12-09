package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预测风险实体类 - 匹配prediction_risk表结构
 */
@Data
@TableName("prediction_risk")
public class PredictionRisk implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    // ========== 监测对象 ==========
    @TableField("target_type")
    private String targetType;

    @TableField("target_id")
    private Long targetId;

    @TableField("target_name")
    private String targetName;

    // ========== 分类信息 ==========
    @TableField("category_id")
    private Long categoryId;

    @TableField("category_name")
    private String categoryName;

    // ========== 风险信息 ==========
    @TableField("risk_type")
    private String riskType;

    @TableField("risk_level")
    private String riskLevel;

    @TableField("risk_score")
    private Integer riskScore;

    // ========== 故障预测 ==========
    @TableField("failure_type")
    private String failureType;

    @TableField("failure_description")
    private String failureDescription;

    @TableField("failure_probability")
    private BigDecimal failureProbability;

    // ========== 时间信息 ==========
    @TableField("predict_days")
    private Integer predictDays;

    @TableField("predicted_time")
    private LocalDateTime predictedTime;

    @TableField("detected_time")
    private LocalDateTime detectedTime;

    // ========== 影响范围 ==========
    @TableField("impact_level")
    private String impactLevel;

    @TableField("impact_description")
    private String impactDescription;

    @TableField("affected_services")
    private String affectedServices;

    // ========== 根因分析 ==========
    @TableField("root_cause")
    private String rootCause;

    @TableField("related_metrics")
    private String relatedMetrics;

    // ========== 建议措施 ==========
    @TableField("recommendations")
    private String recommendations;

    @TableField("auto_fix_available")
    private Boolean autoFixAvailable;

    // ========== 状态管理 ==========
    @TableField("status")
    private String status;

    @TableField("acknowledged_by")
    private String acknowledgedBy;

    @TableField("acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @TableField("resolved_at")
    private LocalDateTime resolvedAt;

    @TableField("resolution_notes")
    private String resolutionNotes;

    // ========== 告警信息 ==========
    @TableField("alert_sent")
    private Boolean alertSent;

    @TableField("alert_channels")
    private String alertChannels;

    // ========== 元数据 ==========
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField("deleted")
    @TableLogic
    private Integer deleted;
}
