package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.SysRole;

import java.util.List;

/**
 * 系统角色Service接口
 */
public interface SysRoleService extends IService<SysRole> {
    
    /**
     * 获取所有角色列表
     */
    List<SysRole> getAllRoles();
    
    /**
     * 根据角色代码获取角色
     */
    SysRole getRoleByCode(String roleCode);
    
    /**
     * 创建角色
     */
    boolean createRole(SysRole role);
    
    /**
     * 更新角色
     */
    boolean updateRole(SysRole role);
    
    /**
     * 删除角色
     */
    boolean deleteRole(Long roleId);
    
    /**
     * 为角色分配权限
     */
    boolean assignPermissions(Long roleId, List<Long> permissionIds);
    
    /**
     * 获取用户的角色列表
     */
    List<SysRole> getUserRoles(Long userId);
}
