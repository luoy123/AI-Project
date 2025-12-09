package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.TicketSource;
import com.zxb.aiproject.mapper.TicketSourceMapper;
import com.zxb.aiproject.service.TicketSourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 工单来源服务实现类
 */
@Service
@Slf4j
public class TicketSourceServiceImpl extends ServiceImpl<TicketSourceMapper, TicketSource> implements TicketSourceService {

    @Autowired
    private TicketSourceMapper ticketSourceMapper;

    @Override
    public List<TicketSource> getAllSources() {
        try {
            QueryWrapper<TicketSource> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0)
                       .orderByAsc("sort_order");
            
            List<TicketSource> sources = ticketSourceMapper.selectList(queryWrapper);
            log.info("获取所有来源成功，数量: {}", sources.size());
            return sources;
        } catch (Exception e) {
            log.error("获取所有来源失败", e);
            throw new RuntimeException("获取所有来源失败", e);
        }
    }

    @Override
    public TicketSource getBySourceKey(String sourceKey) {
        try {
            QueryWrapper<TicketSource> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("source_key", sourceKey)
                       .eq("deleted", 0);
            
            TicketSource source = ticketSourceMapper.selectOne(queryWrapper);
            log.info("根据key获取来源: {}", sourceKey);
            return source;
        } catch (Exception e) {
            log.error("根据key获取来源失败: {}", sourceKey, e);
            throw new RuntimeException("根据key获取来源失败", e);
        }
    }

    @Override
    public boolean createSource(TicketSource ticketSource) {
        try {
            // 检查来源key是否已存在
            if (existsBySourceKey(ticketSource.getSourceKey())) {
                log.warn("来源key已存在: {}", ticketSource.getSourceKey());
                throw new RuntimeException("来源key已存在");
            }
            
            ticketSource.setCreatedAt(LocalDateTime.now());
            ticketSource.setUpdatedAt(LocalDateTime.now());
            ticketSource.setDeleted(0);
            
            int result = ticketSourceMapper.insert(ticketSource);
            if (result > 0) {
                log.info("创建来源成功: {}", ticketSource.getSourceKey());
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("创建来源失败", e);
            throw new RuntimeException("创建来源失败", e);
        }
    }

    @Override
    public boolean updateSource(TicketSource ticketSource) {
        try {
            // 检查来源是否存在
            TicketSource existingSource = ticketSourceMapper.selectById(ticketSource.getId());
            if (existingSource == null || existingSource.getDeleted() == 1) {
                log.warn("来源不存在或已删除: {}", ticketSource.getId());
                throw new RuntimeException("来源不存在或已删除");
            }
            
            // 如果修改了key，检查新key是否已存在
            if (!existingSource.getSourceKey().equals(ticketSource.getSourceKey())) {
                if (existsBySourceKey(ticketSource.getSourceKey())) {
                    log.warn("来源key已存在: {}", ticketSource.getSourceKey());
                    throw new RuntimeException("来源key已存在");
                }
            }
            
            ticketSource.setUpdatedAt(LocalDateTime.now());
            
            int result = ticketSourceMapper.updateById(ticketSource);
            if (result > 0) {
                log.info("更新来源成功: {}", ticketSource.getSourceKey());
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新来源失败", e);
            throw new RuntimeException("更新来源失败", e);
        }
    }

    @Override
    public boolean deleteSource(Long id) {
        try {
            log.info("=== 开始删除来源，ID: {} ===", id);
            
            // 先获取要删除的记录
            TicketSource existing = this.getById(id);
            if (existing == null || existing.getDeleted() == 1) {
                log.warn("来源不存在或已删除: {}", id);
                return false;
            }
            
            log.info("删除前状态 - ID: {}, deleted: {}, deletedAt: {}", 
                    existing.getId(), existing.getDeleted(), existing.getDeletedAt());
            
            // 使用UpdateWrapper直接更新deleted字段，绕过MyBatis-Plus的逻辑删除机制
            UpdateWrapper<TicketSource> updateWrapper = new UpdateWrapper<>();
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
                log.info("删除来源成功: {}", id);
            } else {
                log.warn("删除来源失败: {}", id);
            }
            return result;
        } catch (Exception e) {
            log.error("删除来源失败", e);
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
    public boolean existsBySourceKey(String sourceKey) {
        try {
            QueryWrapper<TicketSource> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("source_key", sourceKey)
                       .eq("deleted", 0);
            
            Long count = ticketSourceMapper.selectCount(queryWrapper);
            boolean exists = count > 0;
            log.debug("检查来源key是否存在: {} -> {}", sourceKey, exists);
            return exists;
        } catch (Exception e) {
            log.error("检查来源key是否存在失败: {}", sourceKey, e);
            throw new RuntimeException("检查来源key是否存在失败", e);
        }
    }
}
