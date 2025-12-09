package com.zxb.aiproject.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 派发工单DTO
 */
@Data
public class AssignTicketDTO {

    /**
     * 工单ID列表（批量派发时使用）
     */
    private List<Long> ticketIds;

    /**
     * 单个工单ID（单个派发时使用）
     */
    private Long ticketId;

    /**
     * 处理人ID
     */
    @NotNull(message = "请选择处理人")
    private Long assigneeId;

    /**
     * 处理人姓名
     */
    private String assigneeName;

    /**
     * 派发备注
     */
    private String assignNote;

    /**
     * 期望完成时间
     */
    private LocalDateTime expectedDate;

    /**
     * 操作人ID
     */
    @NotNull(message = "操作人不能为空")
    private Long operatorId;
}
