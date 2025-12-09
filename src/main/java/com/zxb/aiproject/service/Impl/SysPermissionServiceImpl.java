package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.SysPermission;
import com.zxb.aiproject.entity.SysRolePermission;
import com.zxb.aiproject.mapper.SysPermissionMapper;
import com.zxb.aiproject.mapper.SysRolePermissionMapper;
import com.zxb.aiproject.service.SysPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 系统权限Service实现类
 */
@Service
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionMapper, SysPermission> implements SysPermissionService {
    
    @Autowired
    private SysPermissionMapper permissionMapper;
    
    @Autowired
    private SysRolePermissionMapper rolePermissionMapper;
    
    @Override
    public List<SysPermission> getAllPermissions() {
        // 查询所有权限（平铺列表）
        QueryWrapper<SysPermission> wrapper = new QueryWrapper<>();
        wrapper.eq("deleted", 0)
               .orderByAsc("sort_order");
        return list(wrapper);
    }
    
    @Override
    public List<SysPermission> getPermissionTree() {
        // 查询所有权限
        QueryWrapper<SysPermission> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1)
               .orderByAsc("sort_order");
        List<SysPermission> allPermissions = list(wrapper);
        
        // 构建树形结构（只返回一级菜单，前端可以根据parentId自行构建树）
        return allPermissions.stream()
            .filter(p -> p.getParentId() == null)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<SysPermission> getUserPermissions(Long userId) {
        return permissionMapper.selectByUserId(userId);
    }
    
    @Override
    public Set<String> getUserPermissionCodes(Long userId) {
        List<SysPermission> permissions = getUserPermissions(userId);
        return permissions.stream()
            .map(SysPermission::getPermissionCode)
            .collect(Collectors.toSet());
    }
    
    @Override
    public List<SysPermission> getRolePermissions(Long roleId) {
        return permissionMapper.selectByRoleId(roleId);
    }
    
    @Override
    public boolean hasPermission(Long userId, String permissionCode) {
        Set<String> permissionCodes = getUserPermissionCodes(userId);
        return permissionCodes.contains(permissionCode);
    }
    
    @Override
    public boolean createPermission(SysPermission permission) {
        return save(permission);
    }
    
    @Override
    public boolean updatePermission(SysPermission permission) {
        return updateById(permission);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deletePermission(Long permissionId) {
        // 删除角色-权限关联
        QueryWrapper<SysRolePermission> wrapper = new QueryWrapper<>();
        wrapper.eq("permission_id", permissionId);
        rolePermissionMapper.delete(wrapper);
        
        // 删除权限
        return removeById(permissionId);
    }
}
