package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备版本管理实体类
 */
@Data
@TableName("device_version_info")
public class DeviceVersionInfo {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 设备ID
     */
    private Long deviceId;
    
    /**
     * 当前版本号（如：1.0, 1.1, 1.2）
     */
    private BigDecimal currentVersion;
    
    /**
     * 最新备份ID
     */
    private Long latestBackupId;
    
    /**
     * 最新备份时间
     */
    private LocalDateTime latestBackupTime;
    
    /**
     * 总备份次数
     */
    private Integer totalBackupCount;
    
    /**
     * 首次备份时间
     */
    private LocalDateTime firstBackupTime;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
