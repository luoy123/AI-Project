package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预测结果实体类
 */
@Data
@TableName("prediction_result")
public class PredictionResult {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 服务ID
     */
    private Long serviceId;
    
    /**
     * 设备ID
     */
    private Long deviceId;

    /**
     * 模型ID
     */
    private Long modelId;

    /**
     * 设备分类ID
     */
    private Long categoryId;

    /**
     * 指标名称（CPU、内存、磁盘等）
     */
    private String metricName;

    /**
     * 算法类型 (KNN/LSTM/Prophet/ARIMA/XGBoost)
     */
    private String algorithmType;
    
    /**
     * 预测值
     */
    private BigDecimal predictedValue;
    
    /**
     * 实际值（用于计算准确率）
     */
    private BigDecimal actualValue;
    
    /**
     * 是否异常 (1=异常, 0=正常)
     */
    private Integer isAnomalous;
    
    /**
     * 置信度 (0.0-1.0)
     */
    private BigDecimal confidence;
    
    /**
     * 预测执行时间
     */
    private LocalDateTime predictionTime;
    
    /**
     * 预测的目标时间
     */
    private LocalDateTime predictionForTime;
    
    /**
     * 使用的模型版本
     */
    private String modelVersion;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
