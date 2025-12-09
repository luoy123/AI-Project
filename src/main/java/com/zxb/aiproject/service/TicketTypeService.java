package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.TicketType;

import java.util.List;

/**
 * 工单类型服务接口
 */
public interface TicketTypeService extends IService<TicketType> {
    
    /**
     * 获取所有类型
     */
    List<TicketType> getAllTypes();
    
    /**
     * 根据类型key获取类型
     */
    TicketType getByTypeKey(String typeKey);
    
    /**
     * 创建类型
     */
    boolean createType(TicketType ticketType);
    
    /**
     * 更新类型
     */
    boolean updateType(TicketType ticketType);
    
    /**
     * 删除类型
     */
    boolean deleteType(Long id);
    
    /**
     * 检查类型key是否存在
     */
    boolean existsByTypeKey(String typeKey);
}
