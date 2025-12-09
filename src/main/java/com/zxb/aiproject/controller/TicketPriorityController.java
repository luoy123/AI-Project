package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.TicketPriorityDTO;
import com.zxb.aiproject.entity.TicketPriority;
import com.zxb.aiproject.service.TicketPriorityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工单优先级控制器
 */
@Slf4j
@RestController
@RequestMapping("/ticket/config/priority")
public class TicketPriorityController {

    @Autowired
    private TicketPriorityService ticketPriorityService;

    /**
     * 获取所有优先级列表
     */
    @GetMapping
    public Result<List<TicketPriority>> getAllPriorities() {
        try {
            List<TicketPriority> priorities = ticketPriorityService.getAllPriorities();
            return Result.success(priorities);
        } catch (Exception e) {
            log.error("获取优先级列表失败", e);
            return Result.error("获取优先级列表失败");
        }
    }

    /**
     * 根据ID获取优先级详情
     */
    @GetMapping("/{id}")
    public Result<TicketPriority> getPriorityById(@PathVariable Long id) {
        try {
            TicketPriority priority = ticketPriorityService.getById(id);
            if (priority == null) {
                return Result.error("优先级不存在");
            }
            return Result.success(priority);
        } catch (Exception e) {
            log.error("获取优先级详情失败", e);
            return Result.error("获取优先级详情失败");
        }
    }

    /**
     * 根据优先级键值获取优先级
     */
    @GetMapping("/key/{priorityKey}")
    public Result<TicketPriority> getPriorityByKey(@PathVariable String priorityKey) {
        try {
            TicketPriority priority = ticketPriorityService.getByPriorityKey(priorityKey);
            if (priority == null) {
                return Result.error("优先级不存在");
            }
            return Result.success(priority);
        } catch (Exception e) {
            log.error("获取优先级详情失败", e);
            return Result.error("获取优先级详情失败");
        }
    }

    /**
     * 创建新的优先级
     */
    @PostMapping
    public Result<String> createPriority(@RequestBody TicketPriorityDTO dto) {
        try {
            // 参数验证
            if (dto.getPriorityKey() == null || dto.getPriorityKey().trim().isEmpty()) {
                return Result.error("优先级键值不能为空");
            }
            if (dto.getPriorityName() == null || dto.getPriorityName().trim().isEmpty()) {
                return Result.error("优先级名称不能为空");
            }
            if (dto.getPriorityLevel() == null) {
                return Result.error("优先级级别不能为空");
            }

            // 检查键值是否已存在
            if (ticketPriorityService.existsByPriorityKey(dto.getPriorityKey())) {
                return Result.error("优先级键值已存在");
            }

            // 转换DTO到实体
            TicketPriority ticketPriority = new TicketPriority();
            ticketPriority.setPriorityKey(dto.getPriorityKey());
            ticketPriority.setPriorityName(dto.getPriorityName());
            
            // 确保description不为空
            String description = dto.getPriorityDesc();
            if (description == null || description.trim().isEmpty()) {
                description = dto.getPriorityName() + "优先级"; // 使用名称作为默认描述
            }
            ticketPriority.setDescription(description);
            
            ticketPriority.setPriorityLevel(dto.getPriorityLevel());
            ticketPriority.setColorCode(dto.getColorCode());
            ticketPriority.setEnabled(dto.getIsActive() ? 1 : 0);
            // 移除is_default字段设置，因为数据库表中可能不存在此字段
            
            log.info("创建优先级数据: key={}, name={}, desc={}, level={}", 
                    dto.getPriorityKey(), dto.getPriorityName(), description, dto.getPriorityLevel());

            boolean success = ticketPriorityService.createPriority(ticketPriority);
            if (success) {
                log.info("创建优先级成功: {}", dto.getPriorityKey());
                return Result.success("创建成功");
            } else {
                return Result.error("创建失败");
            }
        } catch (Exception e) {
            log.error("创建优先级失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    /**
     * 更新优先级
     */
    @PutMapping("/{id}")
    public Result<String> updatePriority(@PathVariable Long id, @RequestBody TicketPriorityDTO dto) {
        try {
            // 检查优先级是否存在
            TicketPriority existing = ticketPriorityService.getById(id);
            if (existing == null) {
                return Result.error("优先级不存在");
            }

            // 转换DTO到实体
            TicketPriority ticketPriority = new TicketPriority();
            ticketPriority.setId(id);
            ticketPriority.setPriorityKey(dto.getPriorityKey());
            ticketPriority.setPriorityName(dto.getPriorityName());
            
            // 处理description字段
            String description = dto.getPriorityDesc();
            if (description == null || description.trim().isEmpty()) {
                description = dto.getPriorityName() + "优先级";
            }
            ticketPriority.setDescription(description);
            
            ticketPriority.setPriorityLevel(dto.getPriorityLevel());
            ticketPriority.setColorCode(dto.getColorCode());
            ticketPriority.setEnabled(dto.getIsActive() ? 1 : 0);

            boolean success = ticketPriorityService.updatePriority(ticketPriority);
            if (success) {
                log.info("更新优先级成功: {}", id);
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新优先级失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除优先级
     */
    @DeleteMapping("/{id}")
    public Result<String> deletePriority(@PathVariable Long id) {
        try {
            // 根据ID查找优先级
            TicketPriority existing = ticketPriorityService.getById(id);
            if (existing == null || existing.getDeleted() == 1) {
                return Result.error("优先级不存在");
            }

            // 移除默认优先级限制，所有优先级都可以删除
            boolean success = ticketPriorityService.deletePriority(id);
            if (success) {
                log.info("删除优先级成功: ID={}, Key={}", id, existing.getPriorityKey());
                return Result.success("删除成功");
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            log.error("删除优先级失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    /**
     * 测试端点
     */
    @GetMapping("/test")
    public Result<String> test() {
        return Result.success("优先级控制器工作正常");
    }

    /**
     * 测试PUT端点
     */
    @PutMapping("/test")
    public Result<String> testPut() {
        return Result.success("优先级控制器PUT测试正常");
    }

    /**
     * 检查数据库中的数据
     */
    @GetMapping("/debug")
    public Result<List<TicketPriority>> debugData() {
        try {
            // 查询所有数据，包括被逻辑删除的
            List<TicketPriority> allData = ticketPriorityService.list();
            log.info("数据库中共有 {} 条优先级数据", allData.size());
            for (TicketPriority priority : allData) {
                log.info("优先级数据: id={}, key={}, name={}, deleted={}", 
                        priority.getId(), priority.getPriorityKey(), 
                        priority.getPriorityName(), priority.getDeleted());
            }
            return Result.success(allData);
        } catch (Exception e) {
            log.error("查询数据失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 初始化测试数据
     */
    @PostMapping("/init-data")
    public Result<String> initTestData() {
        try {
            // 创建一些测试优先级数据
            TicketPriority p1 = new TicketPriority();
            p1.setPriorityKey("urgent");
            p1.setPriorityName("P1");
            p1.setDescription("紧急 - 严重影响业务，需要立即处理");
            p1.setPriorityLevel(1);
            p1.setColorCode("#ff4757");
            p1.setEnabled(1);
            
            TicketPriority p2 = new TicketPriority();
            p2.setPriorityKey("high");
            p2.setPriorityName("P2");
            p2.setDescription("高 - 影响业务正常运行");
            p2.setPriorityLevel(2);
            p2.setColorCode("#ffa502");
            p2.setEnabled(1);
            
            boolean success1 = ticketPriorityService.createPriority(p1);
            boolean success2 = ticketPriorityService.createPriority(p2);
            
            if (success1 && success2) {
                return Result.success("测试数据初始化成功");
            } else {
                return Result.error("测试数据初始化失败");
            }
        } catch (Exception e) {
            log.error("初始化测试数据失败", e);
            return Result.error("初始化失败: " + e.getMessage());
        }
    }
}
