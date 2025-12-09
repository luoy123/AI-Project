package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.zxb.aiproject.entity.BusinessComponent;
import com.zxb.aiproject.service.BusinessComponentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/business-component")
public class BusinessComponentController {

    @Autowired
    private BusinessComponentService businessComponentService;

    /**
     * 获取所有业务组件
     */
    @GetMapping("/list")
    public Map<String, Object> getAllComponents() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<BusinessComponent> components = businessComponentService.getAllComponents();
            result.put("success", true);
            result.put("data", components);
            result.put("count", components.size());
            result.put("message", "获取业务组件列表成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取业务组件列表失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 根据业务ID获取组件
     */
    @GetMapping("/business/{businessId}")
    public Map<String, Object> getComponentsByBusinessId(@PathVariable Long businessId) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 开始处理请求 ===");
            System.out.println("请求获取业务组件，businessId: " + businessId);
            
            // 检查service是否注入成功
            if (businessComponentService == null) {
                System.err.println("ERROR: businessComponentService 为 null!");
                result.put("success", false);
                result.put("message", "服务未正确注入");
                return result;
            }
            
            System.out.println("Service注入成功，开始查询数据库...");
            List<BusinessComponent> components = businessComponentService.getComponentsByBusinessId(businessId);
            System.out.println("数据库查询完成，结果: " + (components != null ? components.size() : "null"));
            
            if (components != null) {
                for (int i = 0; i < Math.min(components.size(), 3); i++) {
                    BusinessComponent comp = components.get(i);
                    System.out.println("组件 " + (i+1) + ": " + comp.getName() + " - " + comp.getType());
                }
            }
            
            result.put("success", true);
            result.put("data", components != null ? components : new ArrayList<>());
            result.put("count", components != null ? components.size() : 0);
            result.put("message", "获取业务组件成功");
            System.out.println("=== 请求处理完成 ===");
        } catch (Exception e) {
            System.err.println("=== 发生异常 ===");
            System.err.println("异常类型: " + e.getClass().getName());
            System.err.println("异常消息: " + e.getMessage());
            System.err.println("异常堆栈:");
            e.printStackTrace();
            
            result.put("success", false);
            result.put("data", new ArrayList<>());
            result.put("count", 0);
            result.put("message", "获取业务组件失败: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        return result;
    }

    /**
     * 根据ID获取单个组件
     */
    @GetMapping("/{id}")
    public Map<String, Object> getComponentById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            BusinessComponent component = businessComponentService.getComponentById(id);
            if (component != null) {
                result.put("success", true);
                result.put("data", component);
                result.put("message", "获取组件详情成功");
            } else {
                result.put("success", false);
                result.put("message", "组件不存在");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取组件详情失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 创建新组件
     */
    @PostMapping("/create")
    public Map<String, Object> createComponent(@RequestBody BusinessComponent component) {
        Map<String, Object> result = new HashMap<>();
        try {
            BusinessComponent savedComponent = businessComponentService.saveComponent(component);
            result.put("success", true);
            result.put("data", savedComponent);
            result.put("message", "创建组件成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "创建组件失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 更新组件
     */
    @PutMapping("/update/{id}")
    public Map<String, Object> updateComponent(@PathVariable Long id, @RequestBody BusinessComponent component) {
        Map<String, Object> result = new HashMap<>();
        try {
            component.setId(id);
            BusinessComponent updatedComponent = businessComponentService.saveComponent(component);
            result.put("success", true);
            result.put("data", updatedComponent);
            result.put("message", "更新组件成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "更新组件失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 删除组件
     */
    @DeleteMapping("/delete/{id}")
    public Map<String, Object> deleteComponent(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            businessComponentService.deleteComponent(id);
            result.put("success", true);
            result.put("message", "删除组件成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "删除组件失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 更新组件状态
     */
    @PutMapping("/status/{id}")
    public Map<String, Object> updateComponentStatus(@PathVariable Long id, @RequestParam String status) {
        Map<String, Object> result = new HashMap<>();
        try {
            businessComponentService.updateComponentStatus(id, status);
            result.put("success", true);
            result.put("message", "更新组件状态成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "更新组件状态失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 测试数据库连接和查询
     */
    @GetMapping("/test")
    public Map<String, Object> testDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 测试基本查询
            long totalCount = businessComponentService.count();
            System.out.println("数据库中总组件数量: " + totalCount);
            
            // 测试business_id=1的查询
            List<BusinessComponent> components = businessComponentService.list();
            System.out.println("所有组件: " + components.size());
            
            // 手动查询business_id=1
            List<BusinessComponent> business1Components = businessComponentService.getComponentsByBusinessId(1L);
            System.out.println("business_id=1的组件数量: " + (business1Components != null ? business1Components.size() : 0));
            
            result.put("success", true);
            result.put("totalCount", totalCount);
            result.put("allComponents", components.size());
            result.put("business1Components", business1Components != null ? business1Components.size() : 0);
            result.put("message", "数据库测试完成");
        } catch (Exception e) {
            System.err.println("数据库测试失败: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "数据库测试失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 修复组件的businessId，使其与前端业务树ID匹配
     */
    @PostMapping("/fix-business-ids")
    public Map<String, Object> fixBusinessIds() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("开始修复组件businessId...");
            
            // 修复用户管理组件 (businessId: 29 -> 2)
            UpdateWrapper<BusinessComponent> userUpdateWrapper = new UpdateWrapper<>();
            userUpdateWrapper.eq("business_id", 29);
            BusinessComponent userUpdate = new BusinessComponent();
            userUpdate.setBusinessId(2L);
            int userCount = businessComponentService.getBaseMapper().update(userUpdate, userUpdateWrapper);
            System.out.println("修复用户管理组件: " + userCount + " 个");
            
            // 修复订单管理组件 (businessId: 30 -> 3)
            UpdateWrapper<BusinessComponent> orderUpdateWrapper = new UpdateWrapper<>();
            orderUpdateWrapper.eq("business_id", 30);
            BusinessComponent orderUpdate = new BusinessComponent();
            orderUpdate.setBusinessId(3L);
            int orderCount = businessComponentService.getBaseMapper().update(orderUpdate, orderUpdateWrapper);
            System.out.println("修复订单管理组件: " + orderCount + " 个");
            
            // 修复支付管理组件 (businessId: 31 -> 4)
            UpdateWrapper<BusinessComponent> paymentUpdateWrapper = new UpdateWrapper<>();
            paymentUpdateWrapper.eq("business_id", 31);
            BusinessComponent paymentUpdate = new BusinessComponent();
            paymentUpdate.setBusinessId(4L);
            int paymentCount = businessComponentService.getBaseMapper().update(paymentUpdate, paymentUpdateWrapper);
            System.out.println("修复支付管理组件: " + paymentCount + " 个");
            
            // 修复库存管理组件 (businessId: 32 -> 5)
            UpdateWrapper<BusinessComponent> inventoryUpdateWrapper = new UpdateWrapper<>();
            inventoryUpdateWrapper.eq("business_id", 32);
            BusinessComponent inventoryUpdate = new BusinessComponent();
            inventoryUpdate.setBusinessId(5L);
            int inventoryCount = businessComponentService.getBaseMapper().update(inventoryUpdate, inventoryUpdateWrapper);
            System.out.println("修复库存管理组件: " + inventoryCount + " 个");
            
            int totalFixed = userCount + orderCount + paymentCount + inventoryCount;
            
            result.put("success", true);
            result.put("message", "BusinessId修复完成");
            result.put("totalFixed", totalFixed);
            Map<String, Integer> details = new HashMap<>();
            details.put("userComponents", userCount);
            details.put("orderComponents", orderCount);
            details.put("paymentComponents", paymentCount);
            details.put("inventoryComponents", inventoryCount);
            result.put("details", details);
            
            System.out.println("BusinessId修复完成，总计修复: " + totalFixed + " 个组件");
            
        } catch (Exception e) {
            System.err.println("修复BusinessId失败: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "修复失败: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 创建business表的临时API
     */
    @PostMapping("/create-business-table")
    public Map<String, Object> createBusinessTable() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 使用原生SQL创建business表
            String createTableSql = "CREATE TABLE IF NOT EXISTS `business` (" +
                "`id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID'," +
                "`name` VARCHAR(100) NOT NULL COMMENT '业务名称'," +
                "`code` VARCHAR(50) NOT NULL COMMENT '业务编码'," +
                "`parent_id` BIGINT(20) DEFAULT NULL COMMENT '父业务ID'," +
                "`type` VARCHAR(50) DEFAULT 'service' COMMENT '业务类型'," +
                "`status` VARCHAR(20) DEFAULT 'active' COMMENT '状态'," +
                "`description` TEXT DEFAULT NULL COMMENT '业务描述'," +
                "`owner` VARCHAR(100) DEFAULT NULL COMMENT '负责人'," +
                "`priority` VARCHAR(20) DEFAULT 'medium' COMMENT '优先级'," +
                "`create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'," +
                "`update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'," +
                "`deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除'," +
                "PRIMARY KEY (`id`)," +
                "UNIQUE KEY `uk_business_code` (`code`)," +
                "KEY `idx_parent_id` (`parent_id`)," +
                "KEY `idx_status` (`status`)," +
                "KEY `idx_deleted` (`deleted`)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务表'";
            
            result.put("success", true);
            result.put("message", "Business表创建功能暂时禁用，请手动执行SQL脚本");
            
        } catch (Exception e) {
            System.err.println("创建Business表失败: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "创建失败: " + e.getMessage());
        }
        
        return result;
    }
}
