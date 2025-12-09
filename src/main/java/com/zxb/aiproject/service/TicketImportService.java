package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.TicketImportResultDTO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 工单导入服务接口
 */
public interface TicketImportService {
    
    /**
     * 从Excel/CSV文件批量导入工单
     * 
     * @param file 上传的文件
     * @param creatorId 创建人ID
     * @return 导入结果
     */
    TicketImportResultDTO importTicketsFromFile(MultipartFile file, Long creatorId);
    
    /**
     * 从文本内容智能提取并创建工单
     * 
     * @param content 文本内容
     * @param creatorId 创建人ID
     * @return 导入结果
     */
    TicketImportResultDTO importTicketsFromText(String content, Long creatorId);
}
