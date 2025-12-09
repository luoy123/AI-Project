package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 专线实体类
 */
@Data
@TableName("network_line")
public class NetworkLine {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    
    private String circuitId;
    
    private String provider;
    
    private String lineType;
    
    private String bandwidth;
    
    private String endpointA;
    
    private String endpointB;
    
    private Long endpointADeviceId;
    
    private Long endpointBDeviceId;
    
    private String status;
    
    private LocalDate activationDate;
    
    private LocalDate expiryDate;
    
    private BigDecimal slaLatency;
    
    private BigDecimal slaJitter;
    
    private BigDecimal slaPacketLoss;
    
    private BigDecimal slaAvailability;
    
    private String contactPerson;
    
    private String contactPhone;
    
    private BigDecimal monthlyCost;
    
    private String notes;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
