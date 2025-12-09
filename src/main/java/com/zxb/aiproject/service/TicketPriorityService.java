package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.TicketPriority;

import java.util.List;

/**
 * 工单优先级服务接口
 */
public interface TicketPriorityService extends IService<TicketPriority> {

    /**
     * 获取所有优先级列表
     * @return 优先级列表
     */
    List<TicketPriority> getAllPriorities();

    /**
     * 根据优先级键值获取优先级
     * @param priorityKey 优先级键值
     * @return 优先级对象
     */
    TicketPriority getByPriorityKey(String priorityKey);

    /**
     * 创建新的优先级
     * @param ticketPriority 优先级对象
     * @return 创建结果
     */
    boolean createPriority(TicketPriority ticketPriority);

    /**
     * 更新优先级
     * @param ticketPriority 优先级对象
     * @return 更新结果
     */
    boolean updatePriority(TicketPriority ticketPriority);

    /**
     * 删除优先级
     * @param id 优先级ID
     * @return 删除结果
     */
    boolean deletePriority(Long id);

    /**
     * 检查优先级键值是否已存在
     * @param priorityKey 优先级键值
     * @return 是否存在
     */
    boolean existsByPriorityKey(String priorityKey);
}
