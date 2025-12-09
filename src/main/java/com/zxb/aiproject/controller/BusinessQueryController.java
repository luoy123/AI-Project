package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.Business;
import com.zxb.aiproject.mapper.BusinessMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 业务查询控制器
 */
@RestController
@RequestMapping("/business-query")
public class BusinessQueryController {

    @Autowired
    private BusinessMapper businessMapper;

    /**
     * 查询所有业务
     */
    @GetMapping("/all")
    public Map<String, Object> getAllBusiness() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Business> businessList = businessMapper.selectAllBusiness();
            result.put("success", true);
            result.put("data", businessList);
            result.put("count", businessList.size());
            result.put("message", "查询成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
            result.put("data", null);
            result.put("count", 0);
        }
        return result;
    }

    /**
     * 查询根业务（顶级业务）
     */
    @GetMapping("/root")
    public Map<String, Object> getRootBusiness() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Business> rootBusinessList = businessMapper.selectRootBusiness();
            result.put("success", true);
            result.put("data", rootBusinessList);
            result.put("count", rootBusinessList.size());
            result.put("message", "查询根业务成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询根业务失败: " + e.getMessage());
            result.put("data", null);
            result.put("count", 0);
        }
        return result;
    }

    /**
     * 查询业务树结构
     */
    @GetMapping("/tree")
    public Map<String, Object> getBusinessTree() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Business> allBusiness = businessMapper.selectAllBusiness();
            
            // 构建树形结构
            List<Business> tree = buildBusinessTree(allBusiness);
            
            result.put("success", true);
            result.put("data", tree);
            result.put("count", allBusiness.size());
            result.put("message", "查询业务树成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询业务树失败: " + e.getMessage());
            result.put("data", null);
            result.put("count", 0);
        }
        return result;
    }

    /**
     * 检查数据库连接和表是否存在
     */
    @GetMapping("/check")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 尝试查询业务表
            List<Business> businessList = businessMapper.selectAllBusiness();
            
            result.put("success", true);
            result.put("database_connected", true);
            result.put("table_exists", true);
            result.put("business_count", businessList.size());
            result.put("message", "数据库连接正常，业务表存在");
            
            if (businessList.isEmpty()) {
                result.put("note", "业务表为空，可能需要先执行SQL初始化脚本");
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("database_connected", false);
            result.put("table_exists", false);
            result.put("business_count", 0);
            result.put("message", "数据库检查失败: " + e.getMessage());
            result.put("error_detail", e.getClass().getSimpleName());
        }
        return result;
    }

    /**
     * 构建业务树形结构
     */
    private List<Business> buildBusinessTree(List<Business> allBusiness) {
        // 这里可以实现树形结构构建逻辑
        // 为简化，直接返回所有业务
        return allBusiness;
    }
}
