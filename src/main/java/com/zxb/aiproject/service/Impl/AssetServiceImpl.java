package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.AssetCategoryMapper;
import com.zxb.aiproject.service.AssetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 资产服务实现类
 */
@Service
@Slf4j
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetMapper assetMapper;

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    @Override
    public List<Map<String, Object>> getAssetStatisticsByCategory() {
        log.info("获取资产统计数据（按分类）");
        // TODO: 实现资产统计逻辑
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getCategoryStatistics() {
        log.info("获取所有一级分类及其资产数量");

        try {
            // 获取所有一级分类
            QueryWrapper<AssetCategory> categoryQuery = new QueryWrapper<>();
            categoryQuery.isNull("parent_id").or().eq("parent_id", 0);
            categoryQuery.eq("deleted", 0);
            categoryQuery.orderBy(true, true, "sort_order", "id");

            List<AssetCategory> topCategories = assetCategoryMapper.selectList(categoryQuery);
            log.info("找到{}个一级分类", topCategories.size());

            List<Map<String, Object>> result = new ArrayList<>();

            for (AssetCategory category : topCategories) {
                // 获取该分类下的所有子分类ID
                List<Long> categoryIds = new ArrayList<>();
                categoryIds.add(category.getId());

                // 获取子分类
                QueryWrapper<AssetCategory> subCategoryQuery = new QueryWrapper<>();
                subCategoryQuery.eq("parent_id", category.getId());
                subCategoryQuery.eq("deleted", 0);
                List<AssetCategory> subCategories = assetCategoryMapper.selectList(subCategoryQuery);

                for (AssetCategory subCategory : subCategories) {
                    categoryIds.add(subCategory.getId());
                }

                // 统计该分类及其子分类下的资产数量
                QueryWrapper<Asset> assetQuery = new QueryWrapper<>();
                assetQuery.in("category_id", categoryIds);
                assetQuery.eq("deleted", 0);
                Long count = assetMapper.selectCount(assetQuery);

                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("id", category.getId());
                categoryData.put("categoryName", category.getCategoryName());
                categoryData.put("category_name", category.getCategoryName()); // 兼容前端
                categoryData.put("count", count);
                categoryData.put("parentId", category.getParentId());
                categoryData.put("parent_id", category.getParentId()); // 兼容前端

                result.add(categoryData);
                log.info("分类[{}]下有{}台资产", category.getCategoryName(), count);
            }

            log.info("分类统计完成，共{}个分类", result.size());
            return result;

        } catch (Exception e) {
            log.error("获取分类统计数据失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Asset> getAssetList(Long categoryId, String assetStatus, String deviceStatus, String keyword) {
        log.info("获取资产列表: categoryId={}, assetStatus={}, deviceStatus={}, keyword={}",
                categoryId, assetStatus, deviceStatus, keyword);

        try {
            QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();

            // 基本过滤条件
            queryWrapper.eq("deleted", 0);

            // 分类过滤
            if (categoryId != null) {
                queryWrapper.eq("category_id", categoryId);
            }

            // 资产状态过滤
            if (StringUtils.hasText(assetStatus)) {
                queryWrapper.eq("asset_status", assetStatus);
            }

            // 关键字搜索
            if (StringUtils.hasText(keyword)) {
                queryWrapper.and(wrapper -> wrapper
                        .like("asset_name", keyword)
                        .or()
                        .like("device_name", keyword)
                        .or()
                        .like("asset_code", keyword)
                        .or()
                        .like("ip_address", keyword));
            }

            // 按更新时间倒序
            queryWrapper.orderByDesc("update_time");

            List<Asset> assets = assetMapper.selectList(queryWrapper);
            log.info("查询到 {} 条资产记录", assets.size());

            return assets;

        } catch (Exception e) {
            log.error("获取资产列表失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Asset> getAssetsByCategoryId(Long categoryId) {
        log.info("根据分类ID获取资产列表: {}", categoryId);

        try {
            if (categoryId == null) {
                log.error("获取资产失败：分类ID不能为空");
                return new ArrayList<>();
            }

            return getAssetList(categoryId, null, null, null);

        } catch (Exception e) {
            log.error("根据分类ID获取资产列表失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Asset> getAssetsByStatus(String status) {
        log.info("根据状态获取资产列表: {}", status);

        try {
            if (!StringUtils.hasText(status)) {
                log.error("获取资产失败：状态不能为空");
                return new ArrayList<>();
            }

            return getAssetList(null, status, null, null);

        } catch (Exception e) {
            log.error("根据状态获取资产列表失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getWarrantyExpiringAssets() {
        log.info("获取即将到期保修的资产");
        // TODO: 实现获取即将到期保修资产逻辑
        return new ArrayList<>();
    }

    @Override
    public Map<String, Object> getAssetOverview() {
        log.info("获取资产总览数据");

        try {
            // 统计各种状态的资产数量
            QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);

            // 总数量
            Long totalCount = assetMapper.selectCount(queryWrapper);

            // 在线数量
            QueryWrapper<Asset> onlineQuery = new QueryWrapper<>();
            onlineQuery.eq("deleted", 0);
            onlineQuery.eq("asset_status", "online");
            Long onlineCount = assetMapper.selectCount(onlineQuery);

            // 离线数量
            QueryWrapper<Asset> offlineQuery = new QueryWrapper<>();
            offlineQuery.eq("deleted", 0);
            offlineQuery.eq("asset_status", "offline");
            Long offlineCount = assetMapper.selectCount(offlineQuery);

            // 维护中数量
            QueryWrapper<Asset> maintenanceQuery = new QueryWrapper<>();
            maintenanceQuery.eq("deleted", 0);
            maintenanceQuery.eq("asset_status", "maintenance");
            Long maintenanceCount = assetMapper.selectCount(maintenanceQuery);

            // 计算使用率和闲置率
            // 使用率 = 在线设备数量 / 总设备数量
            // 闲置率 = 非在线设备数量（离线+维护中）/ 总设备数量
            Long inUseCount = onlineCount; // 在线即为使用中
            Long idleCount = offlineCount + maintenanceCount; // 离线+维护中即为闲置

            Map<String, Object> overview = new HashMap<>();
            overview.put("totalCount", totalCount);
            overview.put("onlineCount", onlineCount);
            overview.put("offlineCount", offlineCount);
            overview.put("maintenanceCount", maintenanceCount);
            overview.put("inUseCount", inUseCount); // 使用中数量（在线）
            overview.put("idleCount", idleCount); // 闲置数量（离线+维护中）

            // 兼容旧字段名
            overview.put("activeCount", onlineCount);
            overview.put("inactiveCount", offlineCount);

            log.info("资产总览统计完成: 总数={}, 在线={}, 离线={}, 维护中={}, 使用中={}, 闲置={}",
                    totalCount, onlineCount, offlineCount, maintenanceCount, inUseCount, idleCount);

            return overview;

        } catch (Exception e) {
            log.error("获取资产总览数据失败", e);

            // 返回默认值
            Map<String, Object> overview = new HashMap<>();
            overview.put("totalCount", 0);
            overview.put("onlineCount", 0);
            overview.put("offlineCount", 0);
            overview.put("maintenanceCount", 0);
            overview.put("inUseCount", 0);
            overview.put("idleCount", 0);
            overview.put("activeCount", 0);
            overview.put("inactiveCount", 0);
            return overview;
        }
    }

    @Override
    public Asset getAssetById(Long id) {
        log.info("根据ID获取资产详情: {}", id);

        try {
            if (id == null) {
                log.error("获取资产失败：ID不能为空");
                return null;
            }

            Asset asset = assetMapper.selectById(id);
            if (asset != null && asset.getDeleted() != null && asset.getDeleted() == 1) {
                // 已删除的资产不返回
                return null;
            }

            return asset;

        } catch (Exception e) {
            log.error("获取资产详情失败", e);
            return null;
        }
    }

    @Override
    public boolean addAsset(Asset asset) {
        log.info("添加资产: {}", asset);

        try {
            // 设置默认值
            if (asset.getAssetStatus() == null) {
                asset.setAssetStatus("online");
            }
            if (asset.getDeleted() == null) {
                asset.setDeleted(0);
            }

            // 生成资产编码（如果没有提供）
            if (asset.getAssetCode() == null || asset.getAssetCode().trim().isEmpty()) {
                asset.setAssetCode(generateAssetCode());
            }

            // 插入数据库
            int result = assetMapper.insert(asset);
            log.info("资产插入结果: {}, 生成的ID: {}", result, asset.getId());

            return result > 0;

        } catch (Exception e) {
            log.error("添加资产失败", e);
            return false;
        }
    }

    /**
     * 生成资产编码
     */
    private String generateAssetCode() {
        // 生成格式：AST-YYYYMMDD-HHMMSS
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
        return "AST-" + now.format(formatter);
    }

    @Override
    public boolean updateAsset(Asset asset) {
        log.info("更新资产: {}", asset);

        try {
            if (asset.getId() == null) {
                log.error("更新资产失败：ID不能为空");
                return false;
            }

            int result = assetMapper.updateById(asset);
            log.info("资产更新结果: {}", result);

            return result > 0;

        } catch (Exception e) {
            log.error("更新资产失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteAsset(Long id) {
        log.info("=== 开始删除资产，ID: {} ===", id);

        try {
            if (id == null) {
                log.error("删除资产失败：ID不能为空");
                return false;
            }

            // 先检查资产是否存在
            log.info("步骤1: 检查资产是否存在");
            Asset existingAsset = assetMapper.selectById(id);
            if (existingAsset == null) {
                log.error("删除资产失败：资产不存在，ID: {}", id);
                return false;
            }

            log.info("步骤2: 找到资产 - 名称: {}, 当前deleted状态: {}", existingAsset.getAssetName(), existingAsset.getDeleted());

            // 检查Asset实体的deleted字段
            log.info("步骤3: 检查Asset实体字段");
            log.info("Asset ID: {}", existingAsset.getId());
            log.info("Asset Name: {}", existingAsset.getAssetName());
            log.info("Asset Deleted: {}", existingAsset.getDeleted());
            log.info("Asset UpdateTime: {}", existingAsset.getUpdateTime());

            // 使用MyBatis Plus的逻辑删除（@TableLogic自动处理）
            log.info("步骤4: 执行逻辑删除");
            int deleteResult = assetMapper.deleteById(id);
            log.info("逻辑删除结果: {}, 影响行数: {}", deleteResult > 0 ? "成功" : "失败", deleteResult);

            if (deleteResult > 0) {
                log.info("=== 资产删除成功 ===");
                return true;
            } else {
                log.error("=== 资产删除失败：影响行数为0 ===");
                return false;
            }

        } catch (Exception e) {
            log.error("=== 删除资产异常，ID: {} ===", id, e);
            log.error("异常类型: {}", e.getClass().getName());
            log.error("异常消息: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("根本原因: {}", e.getCause().getMessage());
            }
            return false;
        }
    }

    @Override
    public List<Asset> searchAssets(String keyword) {
        log.info("搜索资产: {}", keyword);

        try {
            if (!StringUtils.hasText(keyword)) {
                // 如果关键字为空，返回所有资产
                return getAssetList(null, null, null, null);
            }

            return getAssetList(null, null, null, keyword);

        } catch (Exception e) {
            log.error("搜索资产失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<String> getVideoDeviceLocations() {
        log.info("获取视频设备位置选项");

        try {
            // 查询视频管理分类下的所有资产的位置信息
            QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            // 视频管理分类ID范围：15-22
            queryWrapper.between("category_id", 15, 22);
            queryWrapper.isNotNull("location");
            queryWrapper.ne("location", "");
            queryWrapper.select("DISTINCT location");

            List<Asset> assets = assetMapper.selectList(queryWrapper);

            // 提取位置信息并去重
            List<String> locations = new ArrayList<>();
            for (Asset asset : assets) {
                String location = asset.getLocation();
                if (StringUtils.hasText(location) && !locations.contains(location)) {
                    locations.add(location);
                }
            }

            // 添加一些常见的视频设备位置选项
            if (!locations.contains("大厅"))
                locations.add("大厅");
            if (!locations.contains("会议室"))
                locations.add("会议室");
            if (!locations.contains("走廊"))
                locations.add("走廊");
            if (!locations.contains("停车场"))
                locations.add("停车场");
            if (!locations.contains("门口"))
                locations.add("门口");
            if (!locations.contains("楼梯间"))
                locations.add("楼梯间");
            if (!locations.contains("办公区"))
                locations.add("办公区");
            if (!locations.contains("机房"))
                locations.add("机房");

            // 按字母顺序排序
            locations.sort(String::compareTo);

            log.info("获取到{}个视频设备位置选项", locations.size());
            return locations;

        } catch (Exception e) {
            log.error("获取视频设备位置选项失败", e);

            // 返回默认位置选项
            List<String> defaultLocations = new ArrayList<>();
            defaultLocations.add("大厅");
            defaultLocations.add("会议室");
            defaultLocations.add("走廊");
            defaultLocations.add("停车场");
            defaultLocations.add("门口");
            defaultLocations.add("楼梯间");
            defaultLocations.add("办公区");
            defaultLocations.add("机房");
            return defaultLocations;
        }
    }

    @Override
    public boolean batchDeleteAssets(List<Long> ids) {
        log.info("批量删除资产，IDs: {}", ids);
        try {
            if (ids == null || ids.isEmpty()) {
                return false;
            }

            for (Long id : ids) {
                Asset asset = assetMapper.selectById(id);
                if (asset != null) {
                    asset.setDeleted(1);
                    asset.setUpdateTime(LocalDateTime.now());
                    assetMapper.updateById(asset);
                }
            }

            log.info("批量删除{}个资产成功", ids.size());
            return true;
        } catch (Exception e) {
            log.error("批量删除资产失败", e);
            return false;
        }
    }

    @Override
    public boolean updateAssetStatus(Long id, String status) {
        log.info("更新资产状态，ID: {}, 状态: {}", id, status);
        try {
            Asset asset = assetMapper.selectById(id);
            if (asset == null) {
                log.warn("资产不存在，ID: {}", id);
                return false;
            }

            asset.setAssetStatus(status);
            asset.setUpdateTime(LocalDateTime.now());
            int result = assetMapper.updateById(asset);

            if (result > 0) {
                log.info("资产状态更新成功，ID: {}", id);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新资产状态失败", e);
            return false;
        }
    }
}
