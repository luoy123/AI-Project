package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.service.AssetCategoryService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 资产分类Controller
 */
@Slf4j
@RestController
@RequestMapping("/asset-category")
@Api(tags = "资产分类管理")
public class AssetCategoryController {

    @Autowired
    private AssetCategoryService assetCategoryService;

    /**
     * 获取所有一级分类
     */
    @GetMapping("/top-level")
    @ApiOperation("获取所有一级分类")
    public Result<List<AssetCategory>> getTopLevelCategories() {
        try {
            List<AssetCategory> categories = assetCategoryService.getTopLevelCategories();
            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取一级分类失败", e);
            return Result.error("获取一级分类失败: " + e.getMessage());
        }
    }

    /**
     * 根据父分类ID获取子分类
     */
    @GetMapping("/children/{parentId}")
    @ApiOperation("根据父分类ID获取子分类")
    public Result<List<AssetCategory>> getCategoriesByParentId(@PathVariable Long parentId) {
        try {
            List<AssetCategory> categories = assetCategoryService.getCategoriesByParentId(parentId);
            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取子分类失败: parentId={}", parentId, e);
            return Result.error("获取子分类失败: " + e.getMessage());
        }
    }

    /**
     * 获取分类树
     */
    @GetMapping("/tree")
    @ApiOperation("获取分类树")
    public Result<List<Map<String, Object>>> getCategoryTree() {
        try {
            List<Map<String, Object>> tree = assetCategoryService.getCategoryTree();
            return Result.success(tree);
        } catch (Exception e) {
            log.error("获取分类树失败", e);
            return Result.error("获取分类树失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备管理用的分类树（过滤掉视频管理）
     */
    @GetMapping("/device-tree")
    @ApiOperation("获取设备管理用的分类树")
    public Result<List<Map<String, Object>>> getDeviceCategoryTree() {
        try {
            List<Map<String, Object>> tree = assetCategoryService.getDeviceCategoryTree();
            return Result.success(tree);
        } catch (Exception e) {
            log.error("获取设备分类树失败", e);
            return Result.error("获取设备分类树失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取分类
     */
    @GetMapping("/{id}")
    @ApiOperation("根据ID获取分类")
    public Result<AssetCategory> getCategoryById(@PathVariable Long id) {
        try {
            AssetCategory category = assetCategoryService.getCategoryById(id);
            if (category == null) {
                return Result.error("分类不存在");
            }
            return Result.success(category);
        } catch (Exception e) {
            log.error("获取分类失败: id={}", id, e);
            return Result.error("获取分类失败: " + e.getMessage());
        }
    }

    /**
     * 获取大类设备统计（用于大屏展示）
     */
    @GetMapping("/device-stats")
    @ApiOperation("获取大类设备统计")
    public Result<List<Map<String, Object>>> getCategoryDeviceStats() {
        try {
            List<Map<String, Object>> stats = assetCategoryService.getCategoryDeviceStats();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取大类设备统计失败", e);
            return Result.error("获取大类设备统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取大类设备使用情况（在线/离线统计，用于大屏展示）
     */
    @GetMapping("/device-usage")
    @ApiOperation("获取大类设备使用情况")
    public Result<List<Map<String, Object>>> getCategoryDeviceUsage() {
        try {
            List<Map<String, Object>> usage = assetCategoryService.getCategoryDeviceUsage();
            return Result.success(usage);
        } catch (Exception e) {
            log.error("获取大类设备使用情况失败", e);
            return Result.error("获取大类设备使用情况失败: " + e.getMessage());
        }
    }

    /**
     * 获取指定大类下的设备列表
     * @param categoryId 大类ID
     * @param status 状态过滤：online-在线设备, offline-离线设备, all-全部（默认）
     */
    @GetMapping("/{categoryId}/devices")
    @ApiOperation("获取大类下的设备列表")
    public Result<List<Map<String, Object>>> getDevicesByCategoryId(
            @PathVariable Long categoryId,
            @RequestParam(required = false, defaultValue = "all") String status) {
        try {
            List<Map<String, Object>> devices = assetCategoryService.getDevicesByCategoryId(categoryId, status);
            return Result.success(devices);
        } catch (Exception e) {
            log.error("获取大类设备列表失败: categoryId={}, status={}", categoryId, status, e);
            return Result.error("获取大类设备列表失败: " + e.getMessage());
        }
    }
}
