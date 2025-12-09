package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.TicketSource;
import com.zxb.aiproject.service.TicketSourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工单来源控制器
 */
@Slf4j
@RestController
@RequestMapping("/ticket/config/source")
public class TicketSourceController {

    @Autowired
    private TicketSourceService ticketSourceService;

    /**
     * 获取所有来源
     */
    @GetMapping
    public Result<List<TicketSource>> getAllSources() {
        try {
            List<TicketSource> sources = ticketSourceService.getAllSources();
            return Result.success(sources);
        } catch (Exception e) {
            log.error("获取来源列表失败", e);
            return Result.error("获取来源列表失败: " + e.getMessage());
        }
    }

    /**
     * 创建来源
     */
    @PostMapping
    public Result<String> createSource(@RequestBody TicketSource ticketSource) {
        try {
            boolean success = ticketSourceService.createSource(ticketSource);
            if (success) {
                log.info("创建来源成功: {}", ticketSource.getSourceKey());
                return Result.success("创建成功");
            } else {
                return Result.error("创建失败，来源key可能已存在");
            }
        } catch (Exception e) {
            log.error("创建来源失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    /**
     * 更新来源
     */
    @PutMapping("/{id}")
    public Result<String> updateSource(@PathVariable Long id, @RequestBody TicketSource ticketSource) {
        try {
            ticketSource.setId(id);
            boolean success = ticketSourceService.updateSource(ticketSource);
            if (success) {
                log.info("更新来源成功: {}", id);
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新来源失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除来源
     */
    @DeleteMapping("/{sourceKey}")
    public Result<String> deleteSource(@PathVariable String sourceKey) {
        try {
            TicketSource existing = ticketSourceService.getBySourceKey(sourceKey);
            if (existing == null) {
                return Result.error("来源不存在");
            }

            boolean success = ticketSourceService.deleteSource(existing.getId());
            if (success) {
                log.info("删除来源成功: {}", sourceKey);
                return Result.success("删除成功");
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            log.error("删除来源失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
