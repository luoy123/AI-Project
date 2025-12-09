package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 设备预测报告实体类
 */
@Data
@TableName("device_prediction_report")
public class DevicePredictionReport {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    // 设备信息
    private Long deviceId;
    private String deviceName;
    private String deviceIp;
    
    // 分类信息
    private Long categoryId;
    private String categoryName;
    
    // 预测时间
    private Integer predictDays;
    private LocalDate predictDate;
    
    // 设备状态
    private String currentStatus;
    private BigDecimal healthScore;
    
    // 预测结果
    private BigDecimal failureProbability;
    private String riskLevel;
    private LocalDateTime predictedFailureTime;
    
    // 性能指标
    private BigDecimal cpuUsage;
    private BigDecimal memoryUsage;
    private BigDecimal diskUsage;
    private BigDecimal networkTraffic;
    private BigDecimal temperature;
    
    // 趋势分析
    private String trend;
    private String trendDescription;
    
    // 风险因素（JSON字符串）
    private String riskFactors;
    
    // 建议措施（JSON字符串）
    private String recommendations;
    
    // 时序数据（JSON字符串，用于图表）
    private String metricsHistory;
    
    // 元数据
    private BigDecimal confidenceLevel;
    private String generatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
