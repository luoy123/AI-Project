package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设备配置实体类
 */
@Data
@TableName("device_config")
public class DeviceConfig {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long deviceId;
    
    private Long baselineVersionId;
    
    private LocalDateTime lastBackupTime;
    
    private String backupStatus;
    
    private String changeStatus;
    
    private Integer autoBackupEnabled;
    
    private String backupSchedule;
    
    private Integer sshPort;
    
    private String sshUsername;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
