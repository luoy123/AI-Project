package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对接配置实体类
 */
@Data
@TableName("integration_config")
public class IntegrationConfig {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 名称
     */
    private String name;
    
    /**
     * 对接类型
     */
    private String integrationType;
    
    /**
     * 数据类型
     */
    private String dataType;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 对接配置类型
     */
    private String dockingType;
    
    /**
     * 对接配置ID
     */
    private String dockingId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 密码
     */
    private String password;
    
    /**
     * 数据同步周期
     */
    private String syncSchedule;
    
    /**
     * 性能采集频率
     */
    private String syncFrequency;
    
    /**
     * 状态：1=启用，0=禁用
     */
    private Integer status;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedTime;
}
