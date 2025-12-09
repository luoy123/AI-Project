package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.SysPermission;
import com.zxb.aiproject.service.SysPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 系统权限Controller
 */
@RestController
@RequestMapping("/permission")
@CrossOrigin
public class SysPermissionController {
    
    @Autowired
    private SysPermissionService permissionService;
    
    /**
     * 获取所有权限列表
     */
    @GetMapping("/list")
    public Map<String, Object> list() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SysPermission> permissions = permissionService.getAllPermissions();
            result.put("code", 200);
            result.put("data", permissions);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取权限树
     */
    @GetMapping("/tree")
    public Map<String, Object> getTree() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SysPermission> tree = permissionService.getPermissionTree();
            result.put("code", 200);
            result.put("data", tree);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取用户权限
     */
    @GetMapping("/user/{userId}")
    public Map<String, Object> getUserPermissions(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SysPermission> permissions = permissionService.getUserPermissions(userId);
            Set<String> permissionCodes = permissionService.getUserPermissionCodes(userId);
            
            result.put("code", 200);
            result.put("data", permissions);
            result.put("permissionCodes", permissionCodes);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 检查用户是否有指定权限
     */
    @GetMapping("/check")
    public Map<String, Object> checkPermission(@RequestParam Long userId, @RequestParam String permissionCode) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean hasPermission = permissionService.hasPermission(userId, permissionCode);
            result.put("code", 200);
            result.put("data", hasPermission);
            result.put("message", "检查成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "检查失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 创建权限
     */
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody SysPermission permission) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = permissionService.createPermission(permission);
            if (success) {
                result.put("code", 200);
                result.put("message", "创建成功");
            } else {
                result.put("code", 500);
                result.put("message", "创建失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "创建失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 更新权限
     */
    @PutMapping("/update")
    public Map<String, Object> update(@RequestBody SysPermission permission) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = permissionService.updatePermission(permission);
            if (success) {
                result.put("code", 200);
                result.put("message", "更新成功");
            } else {
                result.put("code", 500);
                result.put("message", "更新失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "更新失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除权限
     */
    @DeleteMapping("/delete/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = permissionService.deletePermission(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败：" + e.getMessage());
        }
        return result;
    }
}
