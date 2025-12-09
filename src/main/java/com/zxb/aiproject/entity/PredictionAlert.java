package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预测告警实体类（统一表）
 */
@Data
@TableName("prediction_alert")
public class PredictionAlert {

    @TableId(type = IdType.AUTO)
    private Long id;

    // ========== 告警基本信息 ==========
    /**
     * 告警标题
     */
    private String alertTitle;

    /**
     * 告警描述信息
     */
    private String alertMessage;

    /**
     * 告警级别: HIGH-高风险, MEDIUM-中风险, LOW-低风险
     */
    private String alertLevel;

    /**
     * 告警类型: PREDICTION-预测告警, THRESHOLD-阈值告警
     */
    private String alertType;

    // ========== 设备和资产信息 ==========
    /**
     * 关联资产ID
     */
    private Long assetId;

    /**
     * 资产名称（冗余字段）
     */
    private String assetName;

    /**
     * 设备分类ID
     */
    private Long categoryId;

    /**
     * 设备分类名称（冗余字段）
     */
    private String categoryName;

    // ========== 预测相关信息 ==========
    /**
     * 监测指标名称
     */
    private String metricName;

    /**
     * 当前指标值
     */
    private BigDecimal metricValue;

    /**
     * 预测值
     */
    private BigDecimal predictedValue;

    /**
     * 阈值
     */
    private BigDecimal thresholdValue;

    /**
     * 预测时间范围（天）
     */
    private Integer predictionTime;

    /**
     * 预测发生时间
     */
    private LocalDateTime predictedAt;

    // ========== 风险信息 ==========
    /**
     * 风险评分（0-100）
     */
    private BigDecimal riskScore;

    /**
     * 置信度（0-100）
     */
    private BigDecimal confidence;

    /**
     * 风险描述
     */
    private String riskDescription;

    // ========== 处理状态 ==========
    /**
     * 处理状态: PENDING-待处理, PROCESSING-处理中, RESOLVED-已解决, IGNORED-已忽略
     */
    private String status;

    /**
     * 处理人
     */
    private String handleUser;

    /**
     * 处理时间
     */
    private LocalDateTime handleTime;

    /**
     * 处理备注
     */
    private String handleNotes;

    // ========== 模型服务信息 ==========
    /**
     * 预测服务ID
     */
    private Long serviceId;

    /**
     * 预测服务名称
     */
    private String serviceName;

    /**
     * 算法类型
     */
    private String algorithmType;

    // ========== 时间戳 ==========
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除: 0-未删除, 1-已删除
     */
    @TableLogic
    private Integer deleted;
}
