package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 配置版本实体类
 */
@Data
@TableName("config_version")
public class ConfigVersion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long deviceId;
    
    private String version;
    
    private String content;
    
    private Integer fileSize;
    
    private String backupType;
    
    private String changeType;
    
    private Integer isBaseline;
    
    private String backupUser;
    
    private LocalDateTime backupTime;
    
    private String notes;
}
