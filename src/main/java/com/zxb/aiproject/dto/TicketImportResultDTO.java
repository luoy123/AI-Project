package com.zxb.aiproject.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 工单导入结果DTO
 */
@Data
public class TicketImportResultDTO {
    
    /**
     * 总记录数
     */
    private int totalCount;
    
    /**
     * 成功导入数
     */
    private int successCount;
    
    /**
     * 失败记录数
     */
    private int failCount;
    
    /**
     * 失败详情列表
     */
    private List<FailedRecord> failedRecords = new ArrayList<>();
    
    /**
     * 失败记录详情
     */
    @Data
    public static class FailedRecord {
        /**
         * 行号
         */
        private int rowNumber;
        
        /**
         * 工单标题
         */
        private String title;
        
        /**
         * 失败原因
         */
        private String reason;
    }
}
