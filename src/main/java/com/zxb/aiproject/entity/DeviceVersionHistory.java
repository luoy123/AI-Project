package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 设备版本历史实体类
 */
@Data
@TableName("device_version_history")
public class DeviceVersionHistory {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 设备ID
     */
    private Long deviceId;
    
    /**
     * 设备名称
     */
    private String deviceName;
    
    /**
     * 设备类型
     */
    private String deviceType;
    
    /**
     * 版本号
     */
    private String version;
    
    /**
     * 备份时间
     */
    private LocalDateTime backupTime;
    
    /**
     * 备份大小
     */
    private String backupSize;
    
    /**
     * 操作员
     */
    private String operator;
    
    /**
     * 变更摘要
     */
    private String changeSummary;
    
    /**
     * 详细变更内容（JSON格式）
     */
    private String changeDetails;
    
    /**
     * 关联的备份记录ID
     */
    private Long backupId;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 逻辑删除：0-未删除, 1-已删除
     */
    @TableLogic
    private Integer deleted;
}
