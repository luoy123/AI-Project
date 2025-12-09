package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.TicketType;
import com.zxb.aiproject.service.TicketTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工单类型控制器
 */
@Slf4j
@RestController
@RequestMapping("/ticket/config/type")
public class TicketTypeController {

    @Autowired
    private TicketTypeService ticketTypeService;

    /**
     * 获取所有类型
     */
    @GetMapping
    public Result<List<TicketType>> getAllTypes() {
        try {
            List<TicketType> types = ticketTypeService.getAllTypes();
            return Result.success(types);
        } catch (Exception e) {
            log.error("获取类型列表失败", e);
            return Result.error("获取类型列表失败: " + e.getMessage());
        }
    }

    /**
     * 创建类型
     */
    @PostMapping
    public Result<String> createType(@RequestBody TicketType ticketType) {
        try {
            boolean success = ticketTypeService.createType(ticketType);
            if (success) {
                log.info("创建类型成功: {}", ticketType.getTypeKey());
                return Result.success("创建成功");
            } else {
                return Result.error("创建失败，类型key可能已存在");
            }
        } catch (Exception e) {
            log.error("创建类型失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    /**
     * 更新类型
     */
    @PutMapping("/{id}")
    public Result<String> updateType(@PathVariable Long id, @RequestBody TicketType ticketType) {
        try {
            ticketType.setId(id);
            boolean success = ticketTypeService.updateType(ticketType);
            if (success) {
                log.info("更新类型成功: {}", id);
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新类型失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除类型
     */
    @DeleteMapping("/{typeKey}")
    public Result<String> deleteType(@PathVariable String typeKey) {
        try {
            TicketType existing = ticketTypeService.getByTypeKey(typeKey);
            if (existing == null) {
                return Result.error("类型不存在");
            }

            boolean success = ticketTypeService.deleteType(existing.getId());
            if (success) {
                log.info("删除类型成功: {}", typeKey);
                return Result.success("删除成功");
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            log.error("删除类型失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
