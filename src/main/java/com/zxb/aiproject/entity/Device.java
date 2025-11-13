package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("device")
public class Device {

    private static final long serialVersionUID = 1L;
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 设备名称
     */
    private String name;

    /**
     * IP地址
     */
    private String ip;

    /**
     * 设备类型：server-服务器, network-网络设备 storage-存储设备
     */
    private String type;

    /**
     * 设备状态：online-在线, offline-离线, maintenance-维护中
     */
    private String status;

    /**
     * 分组ID
     */
    @TableField("group_id")
    private Long groupId;

    /**
     * 物理位置
     */
    private String location;

    /**
     * 描述
     */
    private String description;

    /**
     * 厂商
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
     * 操作系统版本
     */
    @TableField("os_version")
    private String osVersion;

    /**
     * CPU核数
     */
    @TableField("cpu_cores")
    private Integer cpuCores;

    /**
     * 内存大小（GB）
     */
    @TableField("memory_size")
    private Integer memorySize;

    /**
     * 磁盘大小（GB）
     */
    @TableField("disk_size")
    private Integer diskSize;

    /**
     * 最后更新时间
     */
    @TableField("last_update")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdate;

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
     * 逻辑删除（0-未删除，1-已删除）
     */
    @TableLogic
    private Integer deleted;
}
