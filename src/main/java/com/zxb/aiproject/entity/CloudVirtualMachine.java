package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 云平台虚拟机实体类
 */
@Data
@TableName("cloud_virtual_machine")
public class CloudVirtualMachine {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 虚拟机名称
     */
    private String vmName;

    /**
     * 虚拟机ID（云平台返回）
     */
    private String vmId;

    /**
     * 云平台提供商：huawei/aliyun
     */
    private String provider;

    /**
     * 状态：running/stopped/error
     */
    private String status;

    /**
     * 规格类型
     */
    private String specType;

    /**
     * CPU核数
     */
    private Integer cpuCores;

    /**
     * 内存大小（GB）
     */
    private Integer memoryGb;

    /**
     * 磁盘大小（GB）
     */
    private Integer diskGb;

    /**
     * IP地址
     */
    private String ipAddress;

    /**
     * 所属区域
     */
    private String region;

    /**
     * 创建时间
     */
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    private LocalDateTime updatedTime;

    // ==================== 资源监控字段 ====================

    /**
     * CPU使用率
     */
    private BigDecimal cpuUsage;

    /**
     * CPU负载
     */
    private BigDecimal cpuLoad;

    /**
     * 内存使用率
     */
    private BigDecimal memoryUsage;

    /**
     * 已用内存(GB)
     */
    private BigDecimal memoryUsed;

    /**
     * 网络使用率
     */
    private BigDecimal networkUsage;

    /**
     * 网络入流量(Gbps)
     */
    private BigDecimal networkIn;

    /**
     * 网络出流量(Gbps)
     */
    private BigDecimal networkOut;

    /**
     * 存储使用率
     */
    private BigDecimal storageUsage;
}
