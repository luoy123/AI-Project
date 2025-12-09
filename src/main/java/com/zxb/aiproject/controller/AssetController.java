package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.service.AssetService;
import com.zxb.aiproject.service.AssetCategoryService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 资产管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/asset")
@Api(tags = "资产管理")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private AssetCategoryService assetCategoryService;

    /**
     * 获取资产总览数据
     */
    @GetMapping("/overview")
    @ApiOperation("获取资产总览数据")
    public Result<Map<String, Object>> getAssetOverview() {
        try {
            Map<String, Object> overview = assetService.getAssetOverview();
            return Result.success(overview);
        } catch (Exception e) {
            log.error("获取资产总览数据失败", e);
            return Result.error("获取资产总览数据失败");
        }
    }

    /**
     * 获取资产统计数据（按分类）
     */
    @GetMapping("/statistics/category")
    @ApiOperation("获取资产统计数据（按分类）")
    public Result<List<Map<String, Object>>> getAssetStatisticsByCategory() {
        try {
            List<Map<String, Object>> statistics = assetService.getAssetStatisticsByCategory();
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取资产统计数据失败", e);
            return Result.error("获取资产统计数据失败");
        }
    }

    /**
     * 获取分类统计数据
     */
    @GetMapping("/statistics/category-count")
    @ApiOperation("获取分类统计数据")
    public Result<List<Map<String, Object>>> getCategoryStatistics() {
        try {
            List<Map<String, Object>> statistics = assetService.getCategoryStatistics();
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取分类统计数据失败", e);
            return Result.error("获取分类统计数据失败");
        }
    }

    /**
     * 获取分类树
     */
    @GetMapping("/category/tree")
    @ApiOperation("获取分类树")
    public Result<List<Map<String, Object>>> getCategoryTree() {
        try {
            List<Map<String, Object>> tree = assetCategoryService.getCategoryTree();
            return Result.success(tree);
        } catch (Exception e) {
            log.error("获取分类树失败", e);
            return Result.error("获取分类树失败");
        }
    }

    /**
     * 获取设备管理用的分类树（过滤掉视频管理）
     */
    @GetMapping("/category/device-tree")
    @ApiOperation("获取设备管理用的分类树")
    public Result<List<Map<String, Object>>> getDeviceCategoryTree() {
        try {
            System.out.println("=== DEBUG: Controller getDeviceCategoryTree 被调用 ===");
            List<Map<String, Object>> tree = assetCategoryService.getDeviceCategoryTree();
            System.out.println("=== DEBUG: Service返回的数据大小: " + tree.size() + " ===");
            return Result.success(tree);
        } catch (Exception e) {
            log.error("获取设备分类树失败", e);
            System.out.println("=== DEBUG: 发生异常: " + e.getMessage() + " ===");
            return Result.error("获取设备分类树失败");
        }
    }

    /**
     * 测试端点
     */
    @GetMapping("/test")
    @ApiOperation("测试端点")
    public Result<String> test() {
        return Result.success("测试成功 - 修改已生效！时间: " + System.currentTimeMillis());
    }

    /**
     * 获取所有一级分类
     */
    @GetMapping("/category/top")
    @ApiOperation("获取所有一级分类")
    public Result<List<AssetCategory>> getTopLevelCategories() {
        try {
            List<AssetCategory> categories = assetCategoryService.getTopLevelCategories();
            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取一级分类失败", e);
            return Result.error("获取一级分类失败");
        }
    }

    /**
     * 获取资产列表（支持多种过滤条件）
     */
    @GetMapping("/list")
    @ApiOperation("获取资产列表")
    public Result<List<Asset>> getAssetList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String assetStatus,
            @RequestParam(required = false) String deviceStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "false") Boolean deviceManagementOnly,
            @RequestParam(required = false, defaultValue = "false") Boolean videoDevicesOnly) {
        try {
            log.info("获取资产列表请求参数: categoryId={}, assetStatus={}, deviceStatus={}, keyword={}, deviceManagementOnly={}, videoDevicesOnly={}", 
                    categoryId, assetStatus, deviceStatus, keyword, deviceManagementOnly, videoDevicesOnly);
            
            List<Asset> assets = assetService.getAssetList(categoryId, assetStatus, deviceStatus, keyword);
            log.info("从数据库获取到{}台资产", assets.size());
            
            // 如果是设备管理页面调用，只返回三类设备（服务器、网络设备、存储设备）
            if (deviceManagementOnly != null && deviceManagementOnly) {
                assets = assets.stream()
                    .filter(asset -> {
                        Long catId = asset.getCategoryId();
                        return catId != null && catId >= 5 && catId <= 14; // 只包含三类设备
                    })
                    .collect(java.util.stream.Collectors.toList());
                log.info("设备管理页面过滤后返回{}台设备", assets.size());
            }
            
            // 如果是视频管理页面调用，只返回视频设备（categoryId: 15-22）
            if (videoDevicesOnly != null && videoDevicesOnly) {
                log.info("视频管理页面调用，开始过滤视频设备...");
                long videoDeviceCount = assets.stream()
                    .filter(asset -> {
                        Long catId = asset.getCategoryId();
                        boolean isVideoDevice = catId != null && catId >= 15 && catId <= 22;
                        if (isVideoDevice) {
                            log.info("找到视频设备: id={}, name={}, categoryId={}", asset.getId(), asset.getAssetName(), catId);
                        }
                        return isVideoDevice;
                    })
                    .count();
                log.info("过滤前总资产数: {}, 视频设备数: {}", assets.size(), videoDeviceCount);
                
                assets = assets.stream()
                    .filter(asset -> {
                        Long catId = asset.getCategoryId();
                        return catId != null && catId >= 15 && catId <= 22; // 只包含视频设备
                    })
                    .collect(java.util.stream.Collectors.toList());
                log.info("视频管理页面过滤后返回{}台视频设备", assets.size());
            }
            
            return Result.success(assets);
        } catch (Exception e) {
            log.error("获取资产列表失败", e);
            return Result.error("获取资产列表失败");
        }
    }

    /**
     * 根据分类ID获取资产列表
     */
    @GetMapping("/list/category/{categoryId}")
    @ApiOperation("根据分类ID获取资产列表")
    public Result<List<Asset>> getAssetsByCategoryId(@PathVariable Long categoryId) {
        try {
            List<Asset> assets = assetService.getAssetsByCategoryId(categoryId);
            return Result.success(assets);
        } catch (Exception e) {
            log.error("根据分类ID获取资产列表失败", e);
            return Result.error("根据分类ID获取资产列表失败");
        }
    }

    /**
     * 根据资产状态获取资产列表
     */
    @GetMapping("/list/status/{status}")
    @ApiOperation("根据资产状态获取资产列表")
    public Result<List<Asset>> getAssetsByStatus(@PathVariable String status) {
        try {
            List<Asset> assets = assetService.getAssetsByStatus(status);
            return Result.success(assets);
        } catch (Exception e) {
            log.error("根据状态获取资产列表失败", e);
            return Result.error("根据状态获取资产列表失败");
        }
    }

    /**
     * 获取即将到期保修的资产
     */
    @GetMapping("/warranty/expiring")
    @ApiOperation("获取即将到期保修的资产")
    public Result<List<Map<String, Object>>> getWarrantyExpiringAssets() {
        try {
            List<Map<String, Object>> assets = assetService.getWarrantyExpiringAssets();
            return Result.success(assets);
        } catch (Exception e) {
            log.error("获取即将到期保修资产失败", e);
            return Result.error("获取即将到期保修资产失败");
        }
    }

    /**
     * 根据ID获取资产详情
     */
    @GetMapping("/{id}")
    @ApiOperation("根据ID获取资产详情")
    public Result<Asset> getAssetById(@PathVariable Long id) {
        try {
            Asset asset = assetService.getAssetById(id);
            if (asset == null) {
                return Result.error("资产不存在");
            }
            return Result.success(asset);
        } catch (Exception e) {
            log.error("获取资产详情失败", e);
            return Result.error("获取资产详情失败");
        }
    }

    /**
     * 测试新增资产（简化版本）
     */
    @PostMapping("/test")
    @ApiOperation("测试新增资产")
    public Result<String> testAddAsset(@RequestBody Asset asset) {
        try {
            log.info("收到测试新增资产请求: {}", asset);
            
            // 创建一个最简单的Asset对象
            Asset testAsset = new Asset();
            testAsset.setAssetName(asset.getAssetName());
            testAsset.setDeviceName(asset.getDeviceName());
            testAsset.setCategoryId(asset.getCategoryId());
            testAsset.setAssetStatus("online");
            testAsset.setDeleted(0);
            
            log.info("准备插入测试资产: {}", testAsset);
            
            boolean success = assetService.addAsset(testAsset);
            if (success) {
                return Result.success("测试新增成功");
            } else {
                return Result.error("测试新增失败");
            }
        } catch (Exception e) {
            log.error("测试新增资产失败: ", e);
            return Result.error("测试新增失败: " + e.getMessage());
        }
    }

    /**
     * 新增资产
     */
    @PostMapping
    @ApiOperation("新增资产")
    public Result<String> addAsset(@RequestBody Asset asset) {
        try {
            // 基本参数校验
            if (asset.getAssetName() == null || asset.getAssetName().trim().isEmpty()) {
                return Result.error("资产名称不能为空");
            }
            if (asset.getDeviceName() == null || asset.getDeviceName().trim().isEmpty()) {
                return Result.error("设备名称不能为空");
            }
            if (asset.getCategoryId() == null) {
                return Result.error("设备分组不能为空");
            }
            
            boolean success = assetService.addAsset(asset);
            if (success) {
                return Result.success("新增成功");
            } else {
                return Result.error("新增失败");
            }
        } catch (Exception e) {
            log.error("新增资产失败，详细错误信息: ", e);
            e.printStackTrace(); // 打印完整堆栈跟踪
            return Result.error("新增资产失败: " + e.getMessage());
        }
    }

    /**
     * 更新资产
     */
    @PutMapping("/{id}")
    @ApiOperation("更新资产")
    public Result<String> updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        try {
            // 基本参数校验
            if (asset.getAssetName() == null || asset.getAssetName().trim().isEmpty()) {
                return Result.error("资产名称不能为空");
            }
            if (asset.getDeviceName() == null || asset.getDeviceName().trim().isEmpty()) {
                return Result.error("设备名称不能为空");
            }
            if (asset.getCategoryId() == null) {
                return Result.error("设备分组不能为空");
            }
            
            asset.setId(id);
            boolean success = assetService.updateAsset(asset);
            if (success) {
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新资产失败", e);
            return Result.error("更新资产失败: " + e.getMessage());
        }
    }

    /**
     * 删除资产
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除资产")
    public Result<String> deleteAsset(@PathVariable Long id) {
        try {
            boolean success = assetService.deleteAsset(id);
            if (success) {
                return Result.success("删除成功");
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            log.error("删除资产失败", e);
            return Result.error("删除资产失败: " + e.getMessage());
        }
    }

    /**
     * 搜索资产
     */
    @GetMapping("/search")
    @ApiOperation("搜索资产")
    public Result<List<Asset>> searchAssets(@RequestParam(required = false) String keyword) {
        try {
            List<Asset> assets = assetService.searchAssets(keyword);
            return Result.success(assets);
        } catch (Exception e) {
            log.error("搜索资产失败", e);
            return Result.error("搜索资产失败");
        }
    }

    /**
     * 获取活跃设备列表（临时实现，直接在Controller中处理）
     */
    @GetMapping("/active")
    @ApiOperation("获取活跃设备列表")
    public Result<List<Map<String, Object>>> getActiveAssets() {
        try {
            // 临时实现：获取在线状态的资产
            List<Asset> assets = assetService.getAssetsByStatus("online");
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            
            // 只取前10个，并转换为前端需要的格式
            int count = 0;
            for (Asset asset : assets) {
                if (count >= 10) break;
                
                // 只包含三类设备
                Long categoryId = asset.getCategoryId();
                if (categoryId == null || 
                    !(categoryId >= 5 && categoryId <= 14)) {
                    continue;
                }
                
                Map<String, Object> deviceInfo = new java.util.HashMap<>();
                deviceInfo.put("id", asset.getId());
                deviceInfo.put("name", asset.getDeviceName() != null ? asset.getDeviceName() : asset.getAssetName());
                deviceInfo.put("assetName", asset.getAssetName());
                deviceInfo.put("deviceName", asset.getDeviceName());
                deviceInfo.put("status", asset.getAssetStatus());
                deviceInfo.put("ipAddress", asset.getIpAddress());
                deviceInfo.put("location", asset.getLocation());
                deviceInfo.put("categoryId", asset.getCategoryId());
                deviceInfo.put("manufacturer", asset.getManufacturer());
                deviceInfo.put("model", asset.getModel());
                deviceInfo.put("department", asset.getDepartment());
                deviceInfo.put("owner", asset.getOwner());
                deviceInfo.put("updateTime", asset.getUpdateTime());
                deviceInfo.put("createTime", asset.getCreateTime());
                
                // 根据分类ID确定设备类型和图标
                String deviceType = "unknown";
                String icon = "fas fa-server";
                if (categoryId >= 5 && categoryId <= 7) {
                    deviceType = "server";
                    icon = "fas fa-server";
                } else if (categoryId >= 8 && categoryId <= 12) {
                    deviceType = "network";
                    icon = "fas fa-network-wired";
                } else if (categoryId >= 13 && categoryId <= 14) {
                    deviceType = "storage";
                    icon = "fas fa-hdd";
                }
                deviceInfo.put("type", deviceType);
                deviceInfo.put("icon", icon);
                
                result.add(deviceInfo);
                count++;
            }
            
            log.info("获取活跃设备列表成功，共{}台设备", result.size());
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取活跃设备列表失败", e);
            return Result.error("获取活跃设备列表失败");
        }
    }

    /**
     * 获取视频设备位置选项
     */
    @GetMapping("/video-locations")
    @ApiOperation("获取视频设备位置选项")
    public Result<List<String>> getVideoDeviceLocations() {
        try {
            List<String> locations = assetService.getVideoDeviceLocations();
            return Result.success(locations);
        } catch (Exception e) {
            log.error("获取视频设备位置选项失败", e);
            return Result.error("获取视频设备位置选项失败");
        }
    }
}
