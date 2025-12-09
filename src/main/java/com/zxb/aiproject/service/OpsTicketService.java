package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.dto.AssignTicketDTO;
import com.zxb.aiproject.dto.CreateTicketDTO;
import com.zxb.aiproject.entity.OpsTicket;

/**
 * 工单服务接口
 */
public interface OpsTicketService {

    /**
     * 创建工单
     */
    OpsTicket createTicket(CreateTicketDTO createTicketDTO);

    /**
     * 分页查询工单列表
     */
    IPage<OpsTicket> getTicketPage(Page<OpsTicket> page, String status, Long creatorId, Long assigneeId, String typeKey, String priorityKey, String createdDate, String keyword);

    /**
     * 查询未派发工单列表（支持筛选和搜索）
     */
    IPage<OpsTicket> getUnassignedTickets(Page<OpsTicket> page, Long creatorId, String typeKey, String priorityKey, String createdDate, String keyword);

    /**
     * 查询我的工单列表（支持筛选）
     */
    IPage<OpsTicket> getMyTickets(Page<OpsTicket> page, Long assigneeId, String status, String typeKey, String priorityKey, String keyword);

    /**
     * 派发工单
     */
    boolean assignTicket(AssignTicketDTO assignTicketDTO);

    /**
     * 批量派发工单
     */
    boolean batchAssignTickets(AssignTicketDTO assignTicketDTO);

    /**
     * 开始处理工单
     */
    boolean startProcessing(Long ticketId, Long operatorId);

    /**
     * 完成工单
     */
    boolean completeTicket(Long ticketId, Long operatorId);

    /**
     * 关闭工单
     */
    boolean closeTicket(Long ticketId, Long operatorId);

    /**
     * 获取工单详情
     */
    OpsTicket getTicketById(Long id);
    
    /**
     * 更新工单
     */
    boolean updateTicket(Long ticketId, CreateTicketDTO updateTicketDTO);
    
    /**
     * 删除工单（逻辑删除）
     */
    boolean deleteTicket(Long ticketId);

    /**
     * 生成工单编号
     */
    String generateTicketNo();
}
