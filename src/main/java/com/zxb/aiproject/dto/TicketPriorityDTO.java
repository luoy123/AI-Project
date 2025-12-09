package com.zxb.aiproject.dto;

import lombok.Data;

/**
 * 工单优先级DTO
 */
@Data
public class TicketPriorityDTO {
    private Long id;
    private String priorityKey;
    private String priorityName;
    private String priorityDesc;  // 前端使用的字段名
    private Integer priorityLevel;
    private String colorCode;
    private Boolean isDefault;
    private Boolean isActive;
    private Integer sortOrder;
}
