package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.SysPermission;
import com.zxb.aiproject.entity.SysRole;
import com.zxb.aiproject.service.SysPermissionService;
import com.zxb.aiproject.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 系统角色Controller
 */
@RestController
@RequestMapping("/role")
@CrossOrigin
public class SysRoleController {
    
    @Autowired
    private SysRoleService roleService;
    
    @Autowired
    private SysPermissionService permissionService;
    
    /**
     * 获取所有角色列表（包含权限数量）
     */
    @GetMapping("/list")
    public Map<String, Object> list() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SysRole> roles = roleService.getAllRoles();
            
            // 为每个角色添加权限数量
            for (SysRole role : roles) {
                List<SysPermission> permissions = permissionService.getRolePermissions(role.getId());
                role.setPermissionCount(permissions != null ? permissions.size() : 0);
            }
            
            result.put("code", 200);
            result.put("data", roles);
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 根据ID获取角色详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            SysRole role = roleService.getById(id);
            if (role != null) {
                result.put("code", 200);
                result.put("data", role);
                result.put("message", "获取成功");
            } else {
                result.put("code", 404);
                result.put("message", "角色不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 创建角色
     */
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody SysRole role) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = roleService.createRole(role);
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
     * 更新角色
     */
    @PutMapping("/update")
    public Map<String, Object> update(@RequestBody SysRole role) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = roleService.updateRole(role);
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
     * 删除角色
     */
    @DeleteMapping("/delete/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = roleService.deleteRole(id);
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
    
    /**
     * 获取角色的权限列表
     */
    @GetMapping("/{id}/permissions")
    public Map<String, Object> getRolePermissions(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SysPermission> permissions = permissionService.getRolePermissions(id);
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
     * 为角色分配权限
     */
    @PostMapping("/{id}/assign-permissions")
    public Map<String, Object> assignPermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = roleService.assignPermissions(id, permissionIds);
            if (success) {
                result.put("code", 200);
                result.put("message", "分配成功");
            } else {
                result.put("code", 500);
                result.put("message", "分配失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "分配失败：" + e.getMessage());
        }
        return result;
    }
}
