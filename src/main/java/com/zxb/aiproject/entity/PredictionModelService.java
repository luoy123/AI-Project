package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 算法模型服务实体类
 */
@Data
@TableName("prediction_model_service")
public class PredictionModelService {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 算法模型服务名称
     */
    private String serviceName;

    /**
     * 服务编码(唯一标识)
     */
    private String serviceCode;

    /**
     * 算法类型: KNN, Prophet, LSTM, ARIMA等
     */
    private String algorithmType;

    /**
     * 状态: 0-停用, 1-启用
     */
    private Integer status;

    /**
     * 模型更新周期(天)
     */
    private Integer updateCycle;

    /**
     * 自动预测: 0-否, 1-是
     */
    private Integer autoPrediction;

    /**
     * 预测周期时间(天)
     */
    private Integer predictionCycle;

    /**
     * 预测时长(天)
     */
    private Integer predictionDuration;

    /**
     * 备注说明
     */
    private String notes;

    /**
     * 最后训练时间
     */
    private LocalDateTime lastTrainTime;

    /**
     * 最后预测时间
     */
    private LocalDateTime lastPredictionTime;

    /**
     * 训练次数
     */
    private Integer trainCount;

    /**
     * 预测次数
     */
    private Integer predictionCount;

    /**
     * 准确率(%)
     */
    private BigDecimal accuracyRate;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 逻辑删除: 0-未删除, 1-已删除
     */
    @TableLogic
    private Integer deleted;
}
