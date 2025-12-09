package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.SysPermission;

import java.util.List;
import java.util.Set;

/**
 * 系统权限Service接口
 */
public interface SysPermissionService extends IService<SysPermission> {
    
    /**
     * 获取所有权限（平铺列表）
     */
    List<SysPermission> getAllPermissions();
    
    /**
     * 获取所有权限（树形结构）
     */
    List<SysPermission> getPermissionTree();
    
    /**
     * 根据用户ID获取权限列表
     */
    List<SysPermission> getUserPermissions(Long userId);
    
    /**
     * 根据用户ID获取权限代码集合
     */
    Set<String> getUserPermissionCodes(Long userId);
    
    /**
     * 根据角色ID获取权限列表
     */
    List<SysPermission> getRolePermissions(Long roleId);
    
    /**
     * 检查用户是否有指定权限
     */
    boolean hasPermission(Long userId, String permissionCode);
    
    /**
     * 创建权限
     */
    boolean createPermission(SysPermission permission);
    
    /**
     * 更新权限
     */
    boolean updatePermission(SysPermission permission);
    
    /**
     * 删除权限
     */
    boolean deletePermission(Long permissionId);
}
