package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.Business;
import com.zxb.aiproject.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 业务管理控制器
 */
@RestController
@RequestMapping("/api/business")
public class BusinessController {

    @Autowired
    private BusinessService businessService;

    /**
     * 获取业务树结构
     */
    @GetMapping("/tree")
    public Map<String, Object> getBusinessTree() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> tree = businessService.getBusinessTree();
            result.put("success", true);
            result.put("data", tree);
            result.put("message", "获取业务树成功");
        } catch (Exception e) {
            e.printStackTrace(); // 添加异常堆栈打印
            result.put("success", false);
            result.put("message", "获取业务树失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 获取所有业务列表
     */
    @GetMapping("/list")
    public Map<String, Object> getBusinessList() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Business> businessList = businessService.getAllBusiness();
            result.put("success", true);
            result.put("data", businessList);
            result.put("count", businessList.size());
            result.put("message", "获取业务列表成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取业务列表失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 获取根业务列表（用于父业务选择）
     */
    @GetMapping("/root")
    public Map<String, Object> getRootBusiness() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Business> rootBusiness = businessService.getRootBusiness();
            result.put("success", true);
            result.put("data", rootBusiness);
            result.put("message", "获取根业务成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取根业务失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 智能新增业务
     */
    @PostMapping("/add")
    public Map<String, Object> addBusiness(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 解析请求数据
            String businessType = (String) requestData.get("businessType"); // "root" 或 "child"
            Long parentId = null;
            
            if ("child".equals(businessType)) {
                Object parentIdObj = requestData.get("parentId");
                if (parentIdObj != null) {
                    parentId = Long.valueOf(parentIdObj.toString());
                }
            }

            // 构建业务对象
            Business business = new Business();
            business.setName((String) requestData.get("name"));
            business.setCode((String) requestData.get("code"));
            business.setType((String) requestData.get("type"));
            business.setDescription((String) requestData.get("description"));
            business.setOwner((String) requestData.get("owner"));

            // 调用智能新增服务
            Business savedBusiness = businessService.smartAddBusiness(business, parentId);

            result.put("success", true);
            result.put("data", savedBusiness);
            result.put("message", "业务创建成功");
            
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "业务创建失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 验证业务编码唯一性
     */
    @GetMapping("/check-code")
    public Map<String, Object> checkCode(@RequestParam String code, 
                                        @RequestParam(required = false) Long excludeId) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean isUnique = businessService.isCodeUnique(code, excludeId);
            result.put("success", true);
            result.put("isUnique", isUnique);
            result.put("message", isUnique ? "编码可用" : "编码已存在");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "验证失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 获取业务详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> getBusinessDetail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            Business business = businessService.getById(id);
            if (business != null) {
                result.put("success", true);
                result.put("data", business);
                result.put("message", "获取业务详情成功");
            } else {
                result.put("success", false);
                result.put("message", "业务不存在");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取业务详情失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 更新业务信息
     */
    @PutMapping("/{id}")
    public Map<String, Object> updateBusiness(@PathVariable Long id, 
                                             @RequestBody Business business) {
        Map<String, Object> result = new HashMap<>();
        try {
            business.setId(id);
            boolean updated = businessService.updateById(business);
            if (updated) {
                result.put("success", true);
                result.put("message", "业务更新成功");
            } else {
                result.put("success", false);
                result.put("message", "业务更新失败");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "业务更新失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 删除业务
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteBusiness(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean deleted = businessService.deleteBusiness(id);
            if (deleted) {
                result.put("success", true);
                result.put("message", "业务删除成功");
            } else {
                result.put("success", false);
                result.put("message", "业务删除失败");
            }
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "业务删除失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 更新业务状态
     */
    @PutMapping("/{id}/status")
    public Map<String, Object> updateBusinessStatus(@PathVariable Long id, 
                                                   @RequestParam String status) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean updated = businessService.updateBusinessStatus(id, status);
            if (updated) {
                result.put("success", true);
                result.put("message", "状态更新成功");
            } else {
                result.put("success", false);
                result.put("message", "状态更新失败");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "状态更新失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 获取业务统计信息
     */
    @GetMapping("/stats")
    public Map<String, Object> getBusinessStats() {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> stats = businessService.getBusinessStats();
            result.put("success", true);
            result.put("data", stats);
            result.put("message", "获取统计信息成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取统计信息失败: " + e.getMessage());
        }
        return result;
    }
}
