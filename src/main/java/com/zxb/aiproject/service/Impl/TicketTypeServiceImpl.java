package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.TicketType;
import com.zxb.aiproject.mapper.TicketTypeMapper;
import com.zxb.aiproject.service.TicketTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工单类型服务实现类
 */
@Slf4j
@Service
public class TicketTypeServiceImpl extends ServiceImpl<TicketTypeMapper, TicketType> implements TicketTypeService {

    @Override
    public List<TicketType> getAllTypes() {
        try {
            QueryWrapper<TicketType> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0); // 只查询未删除的记录
            queryWrapper.orderByAsc("sort_order", "id"); // 按排序顺序排序
            
            List<TicketType> types = this.list(queryWrapper);
            log.info("查询到 {} 条类型记录", types.size());
            
            return types;
        } catch (Exception e) {
            log.error("获取类型列表失败", e);
            throw new RuntimeException("获取类型列表失败", e);
        }
    }

    @Override
    public TicketType getByTypeKey(String typeKey) {
        try {
            QueryWrapper<TicketType> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("type_key", typeKey);
            queryWrapper.eq("deleted", 0);
            
            return this.getOne(queryWrapper);
        } catch (Exception e) {
            log.error("根据键值获取类型失败: {}", typeKey, e);
            return null;
        }
    }

    @Override
    public boolean createType(TicketType ticketType) {
        try {
            // 检查类型key是否已存在
            if (existsByTypeKey(ticketType.getTypeKey())) {
                log.warn("类型key已存在: {}", ticketType.getTypeKey());
                return false;
            }
            
            // 设置创建时间和更新时间
            LocalDateTime now = LocalDateTime.now();
            ticketType.setCreatedAt(now);
            ticketType.setUpdatedAt(now);
            ticketType.setCreatedBy("admin"); // 可以从当前用户上下文获取
            ticketType.setDeleted(0); // 设置为未删除
            ticketType.setIsActive(1); // 默认启用
            
            boolean result = this.save(ticketType);
            if (result) {
                log.info("创建类型成功: {}", ticketType.getTypeKey());
            }
            return result;
        } catch (Exception e) {
            log.error("创建类型失败", e);
            return false;
        }
    }

    @Override
    public boolean updateType(TicketType ticketType) {
        try {
            // 设置更新时间
            ticketType.setUpdatedAt(LocalDateTime.now());
            ticketType.setUpdatedBy("admin"); // 可以从当前用户上下文获取
            
            boolean result = this.updateById(ticketType);
            if (result) {
                log.info("更新类型成功: {}", ticketType.getId());
            }
            return result;
        } catch (Exception e) {
            log.error("更新类型失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteType(Long id) {
        try {
            log.info("=== 开始删除类型，ID: {} ===", id);
            
            // 先获取要删除的记录
            TicketType existing = this.getById(id);
            if (existing == null || existing.getDeleted() == 1) {
                log.warn("类型不存在或已删除: {}", id);
                return false;
            }
            
            log.info("删除前状态 - ID: {}, deleted: {}, deletedAt: {}", 
                    existing.getId(), existing.getDeleted(), existing.getDeletedAt());
            
            // 使用UpdateWrapper直接更新deleted字段，绕过MyBatis-Plus的逻辑删除机制
            UpdateWrapper<TicketType> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("id", id)
                         .set("deleted", 1)
                         .set("deleted_at", LocalDateTime.now())
                         .set("deleted_by", "admin")
                         .set("updated_at", LocalDateTime.now())
                         .set("updated_by", "admin");
            int rows = this.baseMapper.update(null, updateWrapper);
            
            boolean result = rows > 0;
            log.info("UpdateWrapper执行结果 - 影响行数: {}, 删除成功: {}", rows, result);
            
            if (result) {
                log.info("删除类型成功: {}", id);
            } else {
                log.warn("删除类型失败: {}", id);
            }
            return result;
        } catch (Exception e) {
            log.error("删除类型失败", e);
            // 如果UpdateWrapper失败，回退到MyBatis-Plus的removeById方法
            try {
                log.info("回退到MyBatis-Plus的removeById方法");
                return this.removeById(id);
            } catch (Exception e2) {
                log.error("removeById也失败", e2);
                return false;
            }
        }
    }

    @Override
    public boolean existsByTypeKey(String typeKey) {
        try {
            QueryWrapper<TicketType> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("type_key", typeKey);
            queryWrapper.eq("deleted", 0);
            
            long count = this.count(queryWrapper);
            return count > 0;
        } catch (Exception e) {
            log.error("检查类型键值是否存在失败: {}", typeKey, e);
            return false;
        }
    }
}
