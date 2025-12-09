package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.zxb.aiproject.entity.BusinessComponent;
import com.zxb.aiproject.service.BusinessComponentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 数据修复控制器 - 临时使用
 */
@Slf4j
@RestController
@RequestMapping("/api/data-fix")
public class DataFixController {

    @Autowired
    private BusinessComponentService businessComponentService;

    /**
     * 修复组件的businessId，使其与前端业务树ID匹配
     */
    @PostMapping("/fix-business-ids")
    public Map<String, Object> fixBusinessIds() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("开始修复组件businessId...");
            
            // 修复用户管理组件 (businessId: 29 -> 2)
            UpdateWrapper<BusinessComponent> userUpdateWrapper = new UpdateWrapper<>();
            userUpdateWrapper.eq("business_id", 29);
            BusinessComponent userUpdate = new BusinessComponent();
            userUpdate.setBusinessId(2L);
            int userCount = businessComponentService.getBaseMapper().update(userUpdate, userUpdateWrapper);
            log.info("修复用户管理组件: {} 个", userCount);
            
            // 修复订单管理组件 (businessId: 30 -> 3)
            UpdateWrapper<BusinessComponent> orderUpdateWrapper = new UpdateWrapper<>();
            orderUpdateWrapper.eq("business_id", 30);
            BusinessComponent orderUpdate = new BusinessComponent();
            orderUpdate.setBusinessId(3L);
            int orderCount = businessComponentService.getBaseMapper().update(orderUpdate, orderUpdateWrapper);
            log.info("修复订单管理组件: {} 个", orderCount);
            
            // 修复支付管理组件 (businessId: 31 -> 4)
            UpdateWrapper<BusinessComponent> paymentUpdateWrapper = new UpdateWrapper<>();
            paymentUpdateWrapper.eq("business_id", 31);
            BusinessComponent paymentUpdate = new BusinessComponent();
            paymentUpdate.setBusinessId(4L);
            int paymentCount = businessComponentService.getBaseMapper().update(paymentUpdate, paymentUpdateWrapper);
            log.info("修复支付管理组件: {} 个", paymentCount);
            
            // 修复库存管理组件 (businessId: 32 -> 5)
            UpdateWrapper<BusinessComponent> inventoryUpdateWrapper = new UpdateWrapper<>();
            inventoryUpdateWrapper.eq("business_id", 32);
            BusinessComponent inventoryUpdate = new BusinessComponent();
            inventoryUpdate.setBusinessId(5L);
            int inventoryCount = businessComponentService.getBaseMapper().update(inventoryUpdate, inventoryUpdateWrapper);
            log.info("修复库存管理组件: {} 个", inventoryCount);
            
            int totalFixed = userCount + orderCount + paymentCount + inventoryCount;
            
            result.put("success", true);
            result.put("message", "BusinessId修复完成");
            result.put("totalFixed", totalFixed);
            Map<String, Object> details = new HashMap<>();
            details.put("userComponents", userCount);
            details.put("orderComponents", orderCount);
            details.put("paymentComponents", paymentCount);
            details.put("inventoryComponents", inventoryCount);
            result.put("details", details);
            
            log.info("BusinessId修复完成，总计修复: {} 个组件", totalFixed);
            
        } catch (Exception e) {
            log.error("修复BusinessId失败", e);
            result.put("success", false);
            result.put("message", "修复失败: " + e.getMessage());
        }
        
        return result;
    }
}
