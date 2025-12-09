package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 云平台存储实体类
 */
@Data
@TableName("cloud_storage")
public class CloudStorage {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 存储名称
     */
    private String storageName;
    
    /**
     * 存储ID
     */
    private String storageId;
    
    /**
     * 云平台提供商
     */
    private String provider;
    
    /**
     * 存储类型：block/object/file
     */
    private String storageType;
    
    /**
     * 容量（GB）
     */
    private Integer capacityGb;
    
    /**
     * 已使用（GB）
     */
    private Integer usedGb;
    
    /**
     * 状态
     */
    private String status;
    
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
}
