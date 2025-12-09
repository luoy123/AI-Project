package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.TicketSource;

import java.util.List;

/**
 * 工单来源服务接口
 */
public interface TicketSourceService extends IService<TicketSource> {
    
    /**
     * 获取所有来源
     */
    List<TicketSource> getAllSources();
    
    /**
     * 根据来源key获取来源
     */
    TicketSource getBySourceKey(String sourceKey);
    
    /**
     * 创建来源
     */
    boolean createSource(TicketSource ticketSource);
    
    /**
     * 更新来源
     */
    boolean updateSource(TicketSource ticketSource);
    
    /**
     * 删除来源
     */
    boolean deleteSource(Long id);
    
    /**
     * 检查来源key是否存在
     */
    boolean existsBySourceKey(String sourceKey);
}
