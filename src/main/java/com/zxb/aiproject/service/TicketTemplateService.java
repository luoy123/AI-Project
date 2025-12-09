package com.zxb.aiproject.service;

import javax.servlet.http.HttpServletResponse;

/**
 * 工单导入模板服务
 */
public interface TicketTemplateService {
    
    /**
     * 下载Excel模板
     */
    void downloadExcelTemplate(HttpServletResponse response) throws Exception;
    
    /**
     * 下载CSV模板
     */
    void downloadCsvTemplate(HttpServletResponse response) throws Exception;
    
    /**
     * 下载文本示例模板
     */
    void downloadTextTemplate(HttpServletResponse response) throws Exception;
}
