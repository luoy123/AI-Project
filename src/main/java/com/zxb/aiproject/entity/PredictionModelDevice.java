package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 预测模型设备关联实体（合并后）
 * 合并了原 prediction_model 和 prediction_model_device 表
 * 直接存储服务ID、设备ID、分类ID、监测类型和指标
 */
@Data
@TableName("prediction_model_device")
public class PredictionModelDevice {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 服务ID（关联 prediction_model_service 表）
     */
    private Long serviceId;

    /**
     * 设备ID（关联 asset 表）
     */
    private Long deviceId;

    /**
     * 设备分类ID（关联 asset_category 表）
     */
    private Long categoryId;

    /**
     * 监测类型（如：网络监控、性能监控）
     */
    private String monitoringType;

    /**
     * 监测指标（如：网络丢包率异常）
     */
    private String monitoringMetric;

    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;

    /**
     * 最近一次训练时间
     */
    private LocalDateTime lastTrainTime;

    /**
     * 训练状态：success-成功，failed-失败，running-训练中
     */
    private String trainStatus;

    /**
     * 备注
     */
    private String notes;

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
     * 逻辑删除标志：0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
