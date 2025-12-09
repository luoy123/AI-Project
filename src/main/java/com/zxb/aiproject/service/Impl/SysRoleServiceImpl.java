package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.SysRole;
import com.zxb.aiproject.entity.SysRolePermission;
import com.zxb.aiproject.entity.SysUserRole;
import com.zxb.aiproject.mapper.SysRoleMapper;
import com.zxb.aiproject.mapper.SysRolePermissionMapper;
import com.zxb.aiproject.mapper.SysUserRoleMapper;
import com.zxb.aiproject.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 系统角色Service实现类
 */
@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {
    
    @Autowired
    private SysRolePermissionMapper rolePermissionMapper;
    
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    
    @Override
    public List<SysRole> getAllRoles() {
        QueryWrapper<SysRole> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1)
               .orderByAsc("sort_order");
        return list(wrapper);
    }
    
    @Override
    public SysRole getRoleByCode(String roleCode) {
        QueryWrapper<SysRole> wrapper = new QueryWrapper<>();
        wrapper.eq("role_code", roleCode);
        return getOne(wrapper);
    }
    
    @Override
    public boolean createRole(SysRole role) {
        return save(role);
    }
    
    @Override
    public boolean updateRole(SysRole role) {
        return updateById(role);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRole(Long roleId) {
        // 删除角色-权限关联
        QueryWrapper<SysRolePermission> rpWrapper = new QueryWrapper<>();
        rpWrapper.eq("role_id", roleId);
        rolePermissionMapper.delete(rpWrapper);
        
        // 删除用户-角色关联
        QueryWrapper<SysUserRole> urWrapper = new QueryWrapper<>();
        urWrapper.eq("role_id", roleId);
        userRoleMapper.delete(urWrapper);
        
        // 删除角色
        return removeById(roleId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignPermissions(Long roleId, List<Long> permissionIds) {
        // 先删除原有权限
        QueryWrapper<SysRolePermission> wrapper = new QueryWrapper<>();
        wrapper.eq("role_id", roleId);
        rolePermissionMapper.delete(wrapper);
        
        // 添加新权限
        if (permissionIds != null && !permissionIds.isEmpty()) {
            List<SysRolePermission> rolePermissions = permissionIds.stream()
                .map(permissionId -> {
                    SysRolePermission rp = new SysRolePermission();
                    rp.setRoleId(roleId);
                    rp.setPermissionId(permissionId);
                    return rp;
                })
                .collect(Collectors.toList());
            
            rolePermissions.forEach(rolePermissionMapper::insert);
        }
        
        return true;
    }
    
    @Override
    public List<SysRole> getUserRoles(Long userId) {
        // 查询用户的角色ID列表
        QueryWrapper<SysUserRole> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        List<SysUserRole> userRoles = userRoleMapper.selectList(wrapper);
        
        if (userRoles.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 查询角色详情
        List<Long> roleIds = userRoles.stream()
            .map(SysUserRole::getRoleId)
            .collect(Collectors.toList());
        
        return listByIds(roleIds);
    }
}
