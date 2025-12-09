package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 模型训练历史实体类
 */
@Data
@TableName("prediction_train_history")
public class PredictionTrainHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 服务ID
     */
    private Long serviceId;

    /**
     * 模型设备组合ID (可选，用于单独训练某个模型)
     */
    private Long modelDeviceId;

    /**
     * 训练开始时间
     */
    private LocalDateTime trainStartTime;

    /**
     * 训练结束时间
     */
    private LocalDateTime trainEndTime;

    /**
     * 训练状态: running, success, failed
     */
    private String trainStatus;

    /**
     * 训练耗时(秒)
     */
    private Integer trainDuration;

    /**
     * 训练数据量
     */
    private Integer dataCount;

    /**
     * 模型版本号
     */
    private String modelVersion;

    /**
     * 准确率(%)
     */
    private BigDecimal accuracyRate;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 训练参数(JSON格式)
     */
    private String trainParams;

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
}
