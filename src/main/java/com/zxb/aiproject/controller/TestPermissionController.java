package com.zxb.aiproject.controller;

import com.zxb.aiproject.annotation.RequirePermission;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 权限测试Controller
 * 演示如何使用@RequirePermission注解
 */
@RestController
@RequestMapping("/test/permission")
@CrossOrigin
public class TestPermissionController {
    
    /**
     * 测试单个权限
     * 需要设备查看权限
     */
    @GetMapping("/device-view")
    @RequirePermission("device:view")
    public Map<String, Object> testDeviceView() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "设备查看权限验证通过");
        result.put("data", "这是设备列表数据");
        return result;
    }
    
    /**
     * 测试多个权限（OR逻辑）
     * 满足任意一个权限即可
     */
    @GetMapping("/device-manage")
    @RequirePermission({"device:add", "device:edit", "device:delete"})
    public Map<String, Object> testDeviceManage() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "设备管理权限验证通过");
        result.put("data", "可以进行设备管理操作");
        return result;
    }
    
    /**
     * 测试多个权限（AND逻辑）
     * 需要同时满足所有权限
     */
    @GetMapping("/device-full")
    @RequirePermission(value = {"device:view", "device:edit"}, requireAll = true)
    public Map<String, Object> testDeviceFull() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "设备完整权限验证通过");
        result.put("data", "拥有设备查看和编辑权限");
        return result;
    }
    
    /**
     * 测试用户管理权限
     */
    @GetMapping("/user-manage")
    @RequirePermission("user:view")
    public Map<String, Object> testUserManage() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "用户管理权限验证通过");
        result.put("data", "可以查看用户列表");
        return result;
    }
    
    /**
     * 测试角色管理权限
     */
    @GetMapping("/role-manage")
    @RequirePermission("role:view")
    public Map<String, Object> testRoleManage() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "角色管理权限验证通过");
        result.put("data", "可以查看角色列表");
        return result;
    }
    
    /**
     * 无需权限的接口
     */
    @GetMapping("/public")
    public Map<String, Object> testPublic() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "公开接口，无需权限");
        result.put("data", "任何人都可以访问");
        return result;
    }
}
