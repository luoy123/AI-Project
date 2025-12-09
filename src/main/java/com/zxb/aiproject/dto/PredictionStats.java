package com.zxb.aiproject.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * 预测统计数据DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionStats {
    
    /**
     * 总预测次数
     */
    private Integer totalPredictions;
    
    /**
     * 异常预测次数
     */
    private Integer anomalyCount;
    
    /**
     * 预测准确率
     */
    private BigDecimal accuracyRate;
    
    /**
     * 平均置信度
     */
    private BigDecimal avgConfidence;
    
    /**
     * 最高置信度
     */
    private BigDecimal maxConfidence;
    
    /**
     * 最低置信度
     */
    private BigDecimal minConfidence;
    
    /**
     * 设备数量
     */
    private Integer deviceCount;
    
    /**
     * 获取异常率
     */
    public BigDecimal getAnomalyRate() {
        if (totalPredictions == null || totalPredictions == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(anomalyCount != null ? anomalyCount : 0)
                .divide(BigDecimal.valueOf(totalPredictions), 4, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * 获取正常预测次数
     */
    public Integer getNormalCount() {
        return (totalPredictions != null ? totalPredictions : 0) - 
               (anomalyCount != null ? anomalyCount : 0);
    }
}
