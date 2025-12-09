package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.TicketPriority;
import com.zxb.aiproject.mapper.TicketPriorityMapper;
import com.zxb.aiproject.service.TicketPriorityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工单优先级服务实现类
 */
@Slf4j
@Service
public class TicketPriorityServiceImpl extends ServiceImpl<TicketPriorityMapper, TicketPriority> implements TicketPriorityService {

    @Override
    public List<TicketPriority> getAllPriorities() {
        try {
            QueryWrapper<TicketPriority> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0); // 只查询未删除的记录
            queryWrapper.orderByAsc("priority_level", "id"); // 按优先级级别排序
            
            List<TicketPriority> priorities = this.list(queryWrapper);
            log.info("查询到 {} 条优先级记录", priorities.size());
            
            return priorities;
        } catch (Exception e) {
            log.error("获取优先级列表失败", e);
            throw new RuntimeException("获取优先级列表失败", e);
        }
    }

    @Override
    public TicketPriority getByPriorityKey(String priorityKey) {
        try {
            QueryWrapper<TicketPriority> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("priority_key", priorityKey);
            queryWrapper.eq("deleted", 0);
            
            return this.getOne(queryWrapper);
        } catch (Exception e) {
            log.error("根据键值获取优先级失败: {}", priorityKey, e);
            return null;
        }
    }

    @Override
    public boolean createPriority(TicketPriority ticketPriority) {
        try {
            // 设置创建时间和更新时间
            LocalDateTime now = LocalDateTime.now();
            ticketPriority.setCreatedAt(now);
            ticketPriority.setUpdatedAt(now);
            ticketPriority.setCreatedBy("admin"); // 可以从当前用户上下文获取
            ticketPriority.setDeleted(0); // 设置为未删除
            
            boolean result = this.save(ticketPriority);
            if (result) {
                log.info("创建优先级成功: {}", ticketPriority.getPriorityKey());
            }
            return result;
        } catch (Exception e) {
            log.error("创建优先级失败", e);
            return false;
        }
    }

    @Override
    public boolean updatePriority(TicketPriority ticketPriority) {
        try {
            // 设置更新时间
            ticketPriority.setUpdatedAt(LocalDateTime.now());
            ticketPriority.setUpdatedBy("admin"); // 可以从当前用户上下文获取
            
            boolean result = this.updateById(ticketPriority);
            if (result) {
                log.info("更新优先级成功: {}", ticketPriority.getId());
            }
            return result;
        } catch (Exception e) {
            log.error("更新优先级失败", e);
            return false;
        }
    }

    @Override
    public boolean deletePriority(Long id) {
        try {
            log.info("=== 开始删除优先级，ID: {} ===", id);

            // 先获取要删除的记录
            TicketPriority existing = this.getById(id);
            if (existing == null) {
                log.warn("优先级不存在: {}", id);
                return false;
            }

            log.info("删除前状态 - ID: {}, level: {}, deleted: {}, deletedAt: {}",
                    existing.getId(), existing.getPriorityLevel(), existing.getDeleted(), existing.getDeletedAt());

            // 为了解决 uk_priority_level_deleted 唯一索引冲突：
            // 对被逻辑删除的记录，将 priority_level 修改为唯一值（使用 id 保证唯一），
            // 同时设置逻辑删除标记及审计字段。
            Integer newLevel = existing.getId() != null ? existing.getId().intValue() : existing.getPriorityLevel();

            UpdateWrapper<TicketPriority> wrapper = new UpdateWrapper<>();
            wrapper.eq("id", id)
                    .set("priority_level", newLevel)
                    .set("deleted", 1)
                    .set("deleted_at", LocalDateTime.now())
                    .set("deleted_by", "admin")
                    .set("updated_at", LocalDateTime.now())
                    .set("updated_by", "admin");

            int rows = this.baseMapper.update(null, wrapper);
            boolean result = rows > 0;

            log.info("逻辑删除执行结果 - 影响行数: {}, 删除成功: {}", rows, result);
            return result;
        } catch (Exception e) {
            log.error("删除优先级失败", e);
            return false;
        }
    }

    @Override
    public boolean existsByPriorityKey(String priorityKey) {
        try {
            QueryWrapper<TicketPriority> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("priority_key", priorityKey);
            queryWrapper.eq("deleted", 0);
            
            long count = this.count(queryWrapper);
            return count > 0;
        } catch (Exception e) {
            log.error("检查优先级键值是否存在失败: {}", priorityKey, e);
            return false;
        }
    }
}
