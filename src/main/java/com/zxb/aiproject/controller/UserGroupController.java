package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.UserGroupDto;
import com.zxb.aiproject.dto.UserGroupRelationDto;
import com.zxb.aiproject.entity.UserGroup;
import com.zxb.aiproject.service.UserGroupRelationService;
import com.zxb.aiproject.service.UserGroupService;
import com.zxb.aiproject.vo.UserGroupVO;
import com.zxb.aiproject.vo.UserInfoVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户组管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/userGroup")
@Api(tags = "用户组管理")
public class UserGroupController {

    @Autowired
    private UserGroupService userGroupService;

    @Autowired
    private UserGroupRelationService userGroupRelationService;

    /**
     * 创建用户组
     */
    @PostMapping("/create")
    @ApiOperation("创建用户组")
    public Result<Long> createUserGroup(@RequestBody @Validated UserGroupDto dto) {
        log.info("创建用户组：{}", dto.getGroupName());
        Long groupId = userGroupService.createUserGroup(dto);
        return Result.success(groupId);
    }

    /**
     * 更新用户组
     */
    @PutMapping("/update")
    @ApiOperation("更新用户组")
    public Result<Boolean> updateUserGroup(@RequestBody @Validated UserGroupDto dto) {
        log.info("更新用户组：{}", dto.getId());
        boolean result = userGroupService.updateUserGroup(dto);
        return Result.success(result);
    }

    /**
     * 删除用户组
     */
    @DeleteMapping("/delete/{id}")
    @ApiOperation("删除用户组")
    public Result<Boolean> deleteUserGroup(@PathVariable Long id) {
        log.info("删除用户组：{}", id);
        boolean result = userGroupService.deleteUserGroup(id);
        return Result.success(result);
    }

    /**
     * 根据ID查询用户组
     */
    @GetMapping("/get/{id}")
    @ApiOperation("根据ID查询用户组")
    public Result<UserGroupVO> getUserGroupById(@PathVariable Long id) {
        log.info("查询用户组：{}", id);
        UserGroupVO vo = userGroupService.getUserGroupById(id);
        return Result.success(vo);
    }

    /**
     * 分页查询用户组列表
     */
    @GetMapping("/page")
    @ApiOperation("分页查询用户组列表")
    public Result<Page<UserGroupVO>> getUserGroupPage(
            @ApiParam("当前页") @RequestParam(defaultValue = "1") Long current,
            @ApiParam("每页大小") @RequestParam(defaultValue = "10") Long size,
            @ApiParam("用户组名称") @RequestParam(required = false) String groupName,
            @ApiParam("状态") @RequestParam(required = false) Integer status) {
        
        log.info("分页查询用户组，页码：{}，大小：{}", current, size);
        Page<UserGroup> page = new Page<>(current, size);
        Page<UserGroupVO> result = userGroupService.getUserGroupPage(page, groupName, status);
        return Result.success(result);
    }

    /**
     * 查询所有用户组列表
     */
    @GetMapping("/list")
    @ApiOperation("查询所有用户组列表")
    public Result<List<UserGroupVO>> getAllUserGroups() {
        log.info("查询所有用户组");
        List<UserGroupVO> list = userGroupService.getAllUserGroups();
        return Result.success(list);
    }

    /**
     * 根据用户ID查询用户所属的用户组列表
     */
    @GetMapping("/listByUserId/{userId}")
    @ApiOperation("根据用户ID查询用户所属的用户组列表")
    public Result<List<UserGroupVO>> getUserGroupsByUserId(@PathVariable Long userId) {
        log.info("查询用户所属的用户组，用户ID：{}", userId);
        List<UserGroupVO> list = userGroupService.getUserGroupsByUserId(userId);
        return Result.success(list);
    }

    /**
     * 批量添加用户到用户组
     */
    @PostMapping("/addUsers")
    @ApiOperation("批量添加用户到用户组")
    public Result<Boolean> addUsersToGroup(@RequestBody @Validated UserGroupRelationDto dto) {
        log.info("批量添加用户到用户组，用户组ID：{}", dto.getGroupId());
        boolean result = userGroupRelationService.addUsersToGroup(dto);
        return Result.success(result);
    }

    /**
     * 从用户组中移除用户
     */
    @DeleteMapping("/removeUser")
    @ApiOperation("从用户组中移除用户")
    public Result<Boolean> removeUserFromGroup(
            @ApiParam("用户组ID") @RequestParam Long groupId,
            @ApiParam("用户ID") @RequestParam Long userId) {
        
        log.info("从用户组中移除用户，用户组ID：{}，用户ID：{}", groupId, userId);
        boolean result = userGroupRelationService.removeUserFromGroup(groupId, userId);
        return Result.success(result);
    }

    /**
     * 根据用户组ID查询该组下的所有用户
     */
    @GetMapping("/users/{groupId}")
    @ApiOperation("根据用户组ID查询该组下的所有用户")
    public Result<List<UserInfoVO>> getUsersByGroupId(@PathVariable Long groupId) {
        log.info("查询用户组下的所有用户，用户组ID：{}", groupId);
        List<UserInfoVO> list = userGroupRelationService.getUsersByGroupId(groupId);
        return Result.success(list);
    }

    /**
     * 清空用户组下的所有用户
     */
    @DeleteMapping("/clearUsers/{groupId}")
    @ApiOperation("清空用户组下的所有用户")
    public Result<Boolean> clearGroupUsers(@PathVariable Long groupId) {
        log.info("清空用户组下的所有用户，用户组ID：{}", groupId);
        boolean result = userGroupRelationService.clearGroupUsers(groupId);
        return Result.success(result);
    }
}
