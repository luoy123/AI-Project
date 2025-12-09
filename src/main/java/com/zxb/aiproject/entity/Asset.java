package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 资产实体类
 */
@Data
@TableName("asset")
public class Asset {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 资产编号
     */
    @TableField("asset_code")
    private String assetCode;

    /**
     * 资产名称
     */
    @TableField("asset_name")
    private String assetName;

    /**
     * 设备名称（设备页面必填，资产管理页面可选）
     */
    @TableField("device_name")
    private String deviceName;

    /**
     * 分类ID
     */
    @TableField("category_id")
    private Long categoryId;

    /**
     * 制造商/厂商
     */
    private String manufacturer;

    /**
     * 型号
     */
    private String model;

    /**
     * 序列号
     */
    @TableField("serial_number")
    private String serialNumber;

    /**
     * 采购日期
     */
    @TableField("purchase_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;

    /**
     * 采购价格（元）
     */
    @TableField("purchase_price")
    private BigDecimal purchasePrice;

    /**
     * 供应商
     */
    private String supplier;

    /**
     * 保修期（月）
     */
    @TableField("warranty_period")
    private Integer warrantyPeriod;

    /**
     * 保修到期日期
     */
    @TableField("warranty_expire_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate warrantyExpireDate;

    /**
     * 设备状态：online-在线, offline-离线, maintenance-维护中
     */
    @TableField("asset_status")
    private String assetStatus;

    /**
     * 使用人/责任人
     */
    private String owner;

    /**
     * 使用部门
     */
    private String department;

    /**
     * 存放位置
     */
    private String location;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * MAC地址
     */
    @TableField("mac_address")
    private String macAddress;

    /**
     * 折旧年限（年）
     */
    @TableField("depreciation_years")
    private Integer depreciationYears;

    /**
     * 当前价值（元）
     */
    @TableField("current_value")
    private BigDecimal currentValue;

    /**
     * 备注说明
     */
    private String description;

    // ==================== 资源监控字段 ====================

    /**
     * CPU使用率
     */
    @TableField("cpu_usage")
    private BigDecimal cpuUsage;

    /**
     * CPU核心数
     */
    @TableField("cpu_cores")
    private Integer cpuCores;

    /**
     * CPU负载
     */
    @TableField("cpu_load")
    private BigDecimal cpuLoad;

    /**
     * 内存使用率
     */
    @TableField("memory_usage")
    private BigDecimal memoryUsage;

    /**
     * 已用内存(GB)
     */
    @TableField("memory_used")
    private BigDecimal memoryUsed;

    /**
     * 总内存(GB)
     */
    @TableField("memory_total")
    private BigDecimal memoryTotal;

    /**
     * 网络使用率
     */
    @TableField("network_usage")
    private BigDecimal networkUsage;

    /**
     * 网络入流量(Gbps)
     */
    @TableField("network_in")
    private BigDecimal networkIn;

    /**
     * 网络出流量(Gbps)
     */
    @TableField("network_out")
    private BigDecimal networkOut;

    /**
     * 存储使用率
     */
    @TableField("storage_usage")
    private BigDecimal storageUsage;

    /**
     * 已用存储(TB)
     */
    @TableField("storage_used")
    private BigDecimal storageUsed;

    /**
     * 总存储(TB)
     */
    @TableField("storage_total")
    private BigDecimal storageTotal;

    /**
     * 带宽(Gbps)
     */
    private BigDecimal bandwidth;

    // ==================== 资源监控字段结束 ====================

    /**
     * 标签（逗号分隔）
     */
    private String tags;

    /**
     * 创建时间
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

    /**
     * 逻辑删除：0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
