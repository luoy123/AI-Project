package com.zxb.aiproject.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 动态预测报告DTO
 * 用于前端显示动态聚合的报告数据
 */
@Data
@Builder
public class DynamicReportDTO {
    
    /**
     * 设备ID
     */
    private Long deviceId;
    
    /**
     * 分类ID
     */
    private Long categoryId;
    
    /**
     * 分类名称
     */
    private String categoryName;
    
    /**
     * 报告标题
     */
    private String reportTitle;
    
    /**
     * 总预测次数
     */
    private Integer totalPredictions;
    
    /**
     * 异常次数
     */
    private Integer anomalyCount;
    
    /**
     * 预测准确率
     */
    private BigDecimal accuracyRate;
    
    /**
     * 健康度评分
     */
    private BigDecimal healthScore;
    
    /**
     * 健康度状态（正常/异常）
     */
    private String healthStatus;
    
    /**
     * 统计开始时间
     */
    private LocalDateTime periodStart;
    
    /**
     * 统计结束时间
     */
    private LocalDateTime periodEnd;
    
    /**
     * 时间范围（天数）
     */
    private Integer timeDays;
    
    /**
     * 报告生成时间
     */
    private LocalDateTime reportTime;
}
