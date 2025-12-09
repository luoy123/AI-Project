package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 专线性能数据实体类
 */
@Data
@TableName("line_performance")
public class LinePerformance {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long lineId;
    
    private BigDecimal latency;
    
    private BigDecimal jitter;
    
    private BigDecimal packetLoss;
    
    private Long bandwidthIn;
    
    private Long bandwidthOut;
    
    private BigDecimal bandwidthUsage;
    
    private LocalDateTime probeTime;
}
