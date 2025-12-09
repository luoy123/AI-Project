package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.dto.AssignTicketDTO;
import com.zxb.aiproject.dto.CreateTicketDTO;
import com.zxb.aiproject.entity.OpsTicket;
import com.zxb.aiproject.mapper.OpsTicketMapper;
import com.zxb.aiproject.service.OpsTicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.time.format.DateTimeFormatter;

/**
 * 工单服务实现类
 */
@Slf4j
@Service
public class OpsTicketServiceImpl implements OpsTicketService {

    @Autowired
    private OpsTicketMapper opsTicketMapper;

    @Override
    public OpsTicket createTicket(CreateTicketDTO createTicketDTO) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setTicketNo(generateTicketNo());
            ticket.setTitle(createTicketDTO.getTitle());
            ticket.setDescription(createTicketDTO.getDescription());
            ticket.setPriorityKey(createTicketDTO.getPriorityKey());
            ticket.setTypeKey(createTicketDTO.getTypeKey());
            ticket.setSourceKey(createTicketDTO.getSourceKey());
            ticket.setStatus(createTicketDTO.getStatus() != null ? createTicketDTO.getStatus() : "pending");
            ticket.setDeviceName(createTicketDTO.getDeviceName());
            ticket.setAttachmentUrls(createTicketDTO.getAttachmentUrls());
            ticket.setCreatorId(createTicketDTO.getCreatorId() != null ? createTicketDTO.getCreatorId().toString() : "1");
            ticket.setCreatorName(createTicketDTO.getCreatorName());
            ticket.setCreatedAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            ticket.setDeleted(0);
            
            int result = opsTicketMapper.insert(ticket);
            if (result > 0) {
                log.info("创建工单成功: {}", ticket.getTicketNo());
                return ticket;
            }
            return null;
        } catch (Exception e) {
            log.error("创建工单失败", e);
            throw new RuntimeException("创建工单失败", e);
        }
    }

    @Override
    public IPage<OpsTicket> getTicketPage(Page<OpsTicket> page, String status, Long creatorId, Long assigneeId, String typeKey, String priorityKey, String createdDate, String keyword) {
        try {
            QueryWrapper<OpsTicket> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            
            if (StringUtils.hasText(status)) {
                queryWrapper.eq("status", status);
            }
            if (creatorId != null) {
                queryWrapper.eq("created_by", creatorId);
            }
            if (assigneeId != null) {
                queryWrapper.eq("assignee_id", assigneeId);
            }
            if (StringUtils.hasText(typeKey)) {
                queryWrapper.eq("type_key", typeKey);
            }
            if (StringUtils.hasText(priorityKey)) {
                queryWrapper.eq("priority_key", priorityKey);
            }
            if (StringUtils.hasText(createdDate)) {
                queryWrapper.like("created_at", createdDate);
            }
            if (StringUtils.hasText(keyword)) {
                queryWrapper.and(wrapper -> wrapper
                    .like("title", keyword)
                    .or()
                    .like("description", keyword)
                );
            }
            
            queryWrapper.orderByDesc("created_at");
            
            return opsTicketMapper.selectPage(page, queryWrapper);
        } catch (Exception e) {
            log.error("查询工单列表失败", e);
            throw new RuntimeException("查询工单列表失败", e);
        }
    }

    @Override
    public IPage<OpsTicket> getUnassignedTickets(Page<OpsTicket> page, Long creatorId, String typeKey, String priorityKey, String createdDate, String keyword) {
        try {
            QueryWrapper<OpsTicket> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            // 未派发的工单：assignee_id为空或为null
            queryWrapper.isNull("assignee_id");
            
            if (creatorId != null) {
                queryWrapper.eq("created_by", creatorId);
            }
            if (StringUtils.hasText(typeKey)) {
                queryWrapper.eq("type_key", typeKey);
            }
            if (StringUtils.hasText(priorityKey)) {
                queryWrapper.eq("priority_key", priorityKey);
            }
            if (StringUtils.hasText(createdDate)) {
                queryWrapper.like("created_at", createdDate);
            }
            if (StringUtils.hasText(keyword)) {
                queryWrapper.and(wrapper -> wrapper
                    .like("title", keyword)
                    .or()
                    .like("description", keyword)
                );
            }
            
            queryWrapper.orderByDesc("created_at");
            
            return opsTicketMapper.selectPage(page, queryWrapper);
        } catch (Exception e) {
            log.error("查询未派发工单失败", e);
            throw new RuntimeException("查询未派发工单失败", e);
        }
    }

    @Override
    public IPage<OpsTicket> getMyTickets(Page<OpsTicket> page, Long assigneeId, String status, String typeKey, String priorityKey, String keyword) {
        try {
            // 使用自定义SQL，列名与实际表结构（type_key/priority_key）保持一致，避免列名不匹配导致的SQL异常
            return opsTicketMapper.selectMyTickets(page, assigneeId, status, typeKey, priorityKey, keyword);
        } catch (Exception e) {
            log.error("查询我的工单失败", e);
            throw new RuntimeException("查询我的工单失败", e);
        }
    }

    @Override
    public boolean assignTicket(AssignTicketDTO assignTicketDTO) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(assignTicketDTO.getTicketId());
            ticket.setAssigneeId(assignTicketDTO.getAssigneeId().toString());
            ticket.setAssigneeName(assignTicketDTO.getAssigneeName());
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("派发工单失败", e);
            return false;
        }
    }

    @Override
    public boolean batchAssignTickets(AssignTicketDTO assignTicketDTO) {
        try {
            log.info("=== 开始批量派发工单 ===");
            log.info("接收到的DTO: {}", assignTicketDTO);
            
            List<Long> ticketIds = assignTicketDTO.getTicketIds();
            log.info("工单ID列表: {}", ticketIds);
            
            if (ticketIds == null || ticketIds.isEmpty()) {
                log.warn("工单ID列表为空，批量派发失败");
                return false;
            }
            
            log.info("处理人ID: {}, 处理人姓名: {}", assignTicketDTO.getAssigneeId(), assignTicketDTO.getAssigneeName());
            
            // 批量更新工单的处理人信息
            int successCount = 0;
            for (Long ticketId : ticketIds) {
                log.info("正在更新工单ID: {}", ticketId);
                
                OpsTicket ticket = new OpsTicket();
                ticket.setId(ticketId);
                ticket.setAssigneeId(assignTicketDTO.getAssigneeId().toString());
                ticket.setAssigneeName(assignTicketDTO.getAssigneeName());
                ticket.setUpdatedAt(LocalDateTime.now());
                
                log.info("准备更新的工单对象: {}", ticket);
                
                int result = opsTicketMapper.updateById(ticket);
                log.info("工单ID {} 更新结果: {}", ticketId, result);
                
                if (result > 0) {
                    successCount++;
                } else {
                    log.error("工单ID {} 更新失败", ticketId);
                    return false;
                }
            }
            
            log.info("批量派发完成，成功更新 {} 个工单", successCount);
            return true;
        } catch (Exception e) {
            log.error("批量派发工单异常", e);
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean startProcessing(Long ticketId, Long operatorId) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(ticketId);
            ticket.setStatus("processing");
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("开始处理工单失败", e);
            return false;
        }
    }

    @Override
    public boolean completeTicket(Long ticketId, Long operatorId) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(ticketId);
            ticket.setStatus("resolved");
            ticket.setResolvedAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("完成工单失败", e);
            return false;
        }
    }

    @Override
    public boolean closeTicket(Long ticketId, Long operatorId) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(ticketId);
            ticket.setStatus("closed");
            ticket.setClosedAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("关闭工单失败", e);
            return false;
        }
    }

    @Override
    public OpsTicket getTicketById(Long id) {
        try {
            QueryWrapper<OpsTicket> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("id", id);
            queryWrapper.eq("deleted", 0);
            
            return opsTicketMapper.selectOne(queryWrapper);
        } catch (Exception e) {
            log.error("获取工单详情失败", e);
            return null;
        }
    }

    @Override
    public boolean updateTicket(Long ticketId, CreateTicketDTO updateTicketDTO) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(ticketId);
            ticket.setTitle(updateTicketDTO.getTitle());
            ticket.setDescription(updateTicketDTO.getDescription());
            ticket.setPriorityKey(updateTicketDTO.getPriorityKey());
            ticket.setTypeKey(updateTicketDTO.getTypeKey());
            ticket.setSourceKey(updateTicketDTO.getSourceKey());
            ticket.setStatus(updateTicketDTO.getStatus());
            ticket.setDeviceName(updateTicketDTO.getDeviceName());
            ticket.setAttachmentUrls(updateTicketDTO.getAttachmentUrls());
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("更新工单失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteTicket(Long ticketId) {
        try {
            OpsTicket ticket = new OpsTicket();
            ticket.setId(ticketId);
            ticket.setDeleted(1);
            ticket.setDeletedAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            
            int result = opsTicketMapper.updateById(ticket);
            return result > 0;
        } catch (Exception e) {
            log.error("删除工单失败", e);
            return false;
        }
    }

    @Override
    public String generateTicketNo() {
        // 生成工单编号：TK + 年月日 + 4位序号
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "TK" + dateStr;
        
        // 查询当天已有的工单数量
        QueryWrapper<OpsTicket> queryWrapper = new QueryWrapper<>();
        queryWrapper.likeRight("ticket_no", prefix);
        queryWrapper.eq("deleted", 0);
        
        long count = opsTicketMapper.selectCount(queryWrapper);
        String sequence = String.format("%04d", count + 1);
        
        return prefix + sequence;
    }
}
