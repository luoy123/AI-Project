package com.zxb.aiproject.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 创建工单DTO
 */
@Data
public class CreateTicketDTO {

    /**
     * 工单标题
     */
    @NotBlank(message = "工单标题不能为空")
    private String title;

    /**
     * 工单描述
     */
    private String description;

    /**
     * 优先级ID
     */
    private Long priorityId;
    
    /**
     * 优先级Key（可选，用于导入时通过key指定）
     */
    private String priorityKey;

    /**
     * 类型ID
     */
    private Long typeId;
    
    /**
     * 类型Key（可选，用于导入时通过key指定）
     */
    private String typeKey;

    /**
     * 来源ID
     */
    private Long sourceId;
    
    /**
     * 来源Key（可选，用于导入时通过key指定）
     */
    private String sourceKey;
    
    /**
     * 工单状态
     */
    private String status;

    /**
     * 创建人ID
     */
    @NotNull(message = "创建人不能为空")
    private Long creatorId;
    
    /**
     * 创建人姓名
     */
    private String creatorName;

    /**
     * 期望完成时间
     */
    private LocalDateTime expectedDate;
    
    /**
     * 关联设备名称（手动输入）
     */
    private String deviceName;
    
    /**
     * 附件URL列表（JSON格式）
     */
    private String attachmentUrls;
}
