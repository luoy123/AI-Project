package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 云平台云主机实体类
 */
@Data
@TableName("cloud_host")
public class CloudHost {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 云主机名称
     */
    private String hostName;

    /**
     * 云主机ID
     */
    private String hostId;

    /**
     * 云平台提供商
     */
    private String provider;

    /**
     * 状态
     */
    private String status;

    /**
     * 实例类型
     */
    private String instanceType;

    /**
     * CPU核数
     */
    private Integer cpuCores;

    /**
     * 内存大小（GB）
     */
    private Integer memoryGb;

    /**
     * 公网IP
     */
    private String publicIp;

    /**
     * 私网IP
     */
    private String privateIp;

    /**
     * 操作系统类型
     */
    private String osType;

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

    /**
     * 已用存储(GB)
     */
    private BigDecimal storageUsed;

    /**
     * 总存储(GB)
     */
    private BigDecimal storageTotal;
}
