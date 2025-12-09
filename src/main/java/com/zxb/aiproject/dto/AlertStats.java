package com.zxb.aiproject.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 告警统计数据DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertStats {
    
    /**
     * 严重告警数
     */
    private Integer criticalAlerts;
    
    /**
     * 警告告警数
     */
    private Integer warningAlerts;
    
    /**
     * 信息告警数
     */
    private Integer infoAlerts;
    
    /**
     * 获取总告警数
     */
    public Integer getTotalAlerts() {
        return (criticalAlerts != null ? criticalAlerts : 0) + 
               (warningAlerts != null ? warningAlerts : 0) + 
               (infoAlerts != null ? infoAlerts : 0);
    }
    
    /**
     * 获取严重告警比例
     */
    public double getCriticalAlertRate() {
        int total = getTotalAlerts();
        if (total == 0) return 0.0;
        return (double) (criticalAlerts != null ? criticalAlerts : 0) / total;
    }
    
    /**
     * 获取告警严重度评分 (0-100, 分数越高越严重)
     */
    public double getAlertSeverityScore() {
        int critical = criticalAlerts != null ? criticalAlerts : 0;
        int warning = warningAlerts != null ? warningAlerts : 0;
        int info = infoAlerts != null ? infoAlerts : 0;
        
        // 严重告警权重3，警告告警权重1.5，信息告警权重0.5
        double weightedScore = critical * 3.0 + warning * 1.5 + info * 0.5;
        
        // 归一化到0-100范围 (假设10个严重告警为满分)
        return Math.min(100.0, weightedScore / 30.0 * 100.0);
    }
    
    /**
     * 是否有严重告警
     */
    public boolean hasCriticalAlerts() {
        return criticalAlerts != null && criticalAlerts > 0;
    }
    
    /**
     * 是否有任何告警
     */
    public boolean hasAnyAlerts() {
        return getTotalAlerts() > 0;
    }
}
