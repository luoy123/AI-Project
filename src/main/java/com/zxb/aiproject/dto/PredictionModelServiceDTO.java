package com.zxb.aiproject.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 算法模型服务DTO
 */
@Data
public class PredictionModelServiceDTO {

    private Long id;

    /**
     * 算法模型服务名称
     */
    @NotBlank(message = "服务名称不能为空")
    private String serviceName;

    /**
     * 服务编码(唯一标识)
     */
    private String serviceCode;

    /**
     * 算法类型: KNN, Prophet, LSTM, ARIMA等
     */
    @NotBlank(message = "算法类型不能为空")
    private String algorithmType;

    /**
     * 状态: 0-停用, 1-启用
     */
    private Integer status;

    /**
     * 模型更新周期(天)
     */
    @NotNull(message = "模型更新周期不能为空")
    @Min(value = 1, message = "模型更新周期至少为1天")
    private Integer updateCycle;

    /**
     * 自动预测: 0-否, 1-是
     */
    private Integer autoPrediction;

    /**
     * 预测周期时间(天)
     */
    @NotNull(message = "预测周期时间不能为空")
    @Min(value = 1, message = "预测周期时间至少为1天")
    private Integer predictionCycle;

    /**
     * 预测时长(天)
     */
    @NotNull(message = "预测时长不能为空")
    @Min(value = 1, message = "预测时长至少为1天")
    private Integer predictionDuration;

    /**
     * 备注说明
     */
    private String notes;

    /**
     * 模型组合列表（按设备分类+指标的抽象组合）
     */
    private List<ModelCombination> models;

    /**
     * 具体设备维度的模型组合（每一行：设备 + 监测类型 + 指标）
     */
    private List<ModelDeviceCombination> modelDevices;

    /**
     * 模型组合内部类
     */
    @Data
    public static class ModelCombination {
        /**
         * 设备分类ID（关联asset_category表的id）
         */
        private Long categoryId;

        /**
         * 监控类型
         */
        private String monitoringType;

        /**
         * 监控指标
         */
        private String monitoringMetric;
    }

    @Data
    public static class ModelDeviceCombination {
        /**
         * 设备ID（关联asset表的id）
         */
        private Long deviceId;

        /**
         * 设备分类ID（冗余一份，便于与ModelCombination匹配）
         */
        private Long categoryId;

        /**
         * 监控类型
         */
        private String monitoringType;

        /**
         * 监控指标
         */
        private String monitoringMetric;
    }
}
