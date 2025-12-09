package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.mapper.AssetCategoryMapper;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.service.AssetCategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 资产分类服务实现类
 */
@Service
@Slf4j
public class AssetCategoryServiceImpl implements AssetCategoryService {

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    @Autowired
    private AssetMapper assetMapper;

    @Override
    public List<AssetCategory> getTopLevelCategories() {
        log.info("获取所有一级分类（排除云平台）");
        try {
            QueryWrapper<AssetCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            queryWrapper.eq("level", 1);
            // 修复查询条件：parent_id为null或0的都是一级分类
            queryWrapper.and(wrapper -> wrapper.isNull("parent_id").or().eq("parent_id", 0));
            // 排除云平台分类（云平台只用于数字大屏的资源监控）
            queryWrapper.ne("category_code", "CLOUD");
            queryWrapper.orderByAsc("sort_order", "id");

            List<AssetCategory> categories = assetCategoryMapper.selectList(queryWrapper);
            log.info("获取到{}个一级分类（已排除云平台）", categories.size());

            return categories;
        } catch (Exception e) {
            log.error("获取一级分类失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<AssetCategory> getCategoriesByParentId(Long parentId) {
        log.info("根据父分类ID获取子分类: {}", parentId);
        try {
            QueryWrapper<AssetCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            queryWrapper.eq("parent_id", parentId);
            queryWrapper.orderByAsc("sort_order", "id");

            List<AssetCategory> categories = assetCategoryMapper.selectList(queryWrapper);
            log.info("父分类ID={}的子分类有{}个", parentId, categories.size());
            return categories;
        } catch (Exception e) {
            log.error("获取子分类失败: parentId={}", parentId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        log.info("获取分类树（排除云平台）");

        try {
            // 获取所有分类数据
            QueryWrapper<AssetCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            queryWrapper.orderByAsc("level", "sort_order", "id");

            List<AssetCategory> allCategoriesFromDB = assetCategoryMapper.selectList(queryWrapper);

            // 过滤掉云平台分类（云平台只用于数字大屏的资源监控）
            List<AssetCategory> allCategories = allCategoriesFromDB.stream()
                    .filter(category -> {
                        // 排除云平台一级分类
                        if ("云平台".equals(category.getCategoryName()) || "CLOUD".equals(category.getCategoryCode())) {
                            return false;
                        }
                        // 排除云平台的子分类
                        if (category.getParentId() != null && category.getParentId().equals(23L)) {
                            return false;
                        }
                        return true;
                    })
                    .collect(java.util.stream.Collectors.toList());

            log.info("从数据库获取到{}个分类（已排除云平台）", allCategories.size());

            if (allCategories.isEmpty()) {
                log.warn("数据库中没有找到分类数据");
                return new ArrayList<>();
            }

            // 构建分类树
            List<Map<String, Object>> tree = buildFullCategoryTree(allCategories);

            log.info("生成分类树，共{}个一级分类", tree.size());
            return tree;

        } catch (Exception e) {
            log.error("获取分类树失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getDeviceCategoryTree() {
        log.info("获取设备管理用的分类树（过滤掉视频管理和云平台）");

        try {
            // 从数据库获取所有分类数据
            List<AssetCategory> allCategoriesFromDB = assetCategoryMapper.selectList(
                    new QueryWrapper<AssetCategory>()
                            .orderByAsc("level", "sort_order"));

            // 手动过滤掉视频管理和云平台相关分类
            List<AssetCategory> allCategories = allCategoriesFromDB.stream()
                    .filter(category -> {
                        // 排除视频管理一级分类
                        if ("视频管理".equals(category.getCategoryName())) {
                            return false;
                        }
                        // 排除云平台分类（只用于数字大屏的资源监控）
                        if ("云平台".equals(category.getCategoryName()) || "CLOUD".equals(category.getCategoryCode())) {
                            return false;
                        }
                        // 排除parent_id为4的所有子分类（视频管理的子分类）
                        if (category.getParentId() != null && category.getParentId().equals(4L)) {
                            return false;
                        }
                        // 排除parent_id为23的所有子分类（云平台的子分类）
                        if (category.getParentId() != null && category.getParentId().equals(23L)) {
                            return false;
                        }
                        return true;
                    })
                    .collect(java.util.stream.Collectors.toList());

            log.info("从数据库获取到 {} 个分类（已过滤视频管理和云平台）", allCategories.size());

            if (allCategories.isEmpty()) {
                log.warn("数据库中没有找到资产分类数据，返回默认分类");
                return getDefaultDeviceCategoryTree();
            }

            // 构建分类树
            List<Map<String, Object>> tree = buildCategoryTree(allCategories);

            log.info("从数据库生成设备分类树，共{}个一级分类", tree.size());
            return tree;

        } catch (Exception e) {
            log.error("从数据库获取分类数据失败，返回默认分类", e);
            return getDefaultDeviceCategoryTree();
        }
    }

    /**
     * 构建完整分类树结构（包含所有分类）
     */
    private List<Map<String, Object>> buildFullCategoryTree(List<AssetCategory> categories) {
        List<Map<String, Object>> tree = new ArrayList<>();
        Map<Long, List<AssetCategory>> parentChildMap = new HashMap<>();

        // 按父ID分组
        for (AssetCategory category : categories) {
            Long parentId = category.getParentId();
            parentChildMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(category);
        }

        // 构建一级分类
        List<AssetCategory> rootCategories = parentChildMap.get(null);
        if (rootCategories == null) {
            rootCategories = parentChildMap.get(0L); // 有些系统用0表示根节点
        }

        if (rootCategories != null) {
            for (AssetCategory rootCategory : rootCategories) {
                Map<String, Object> categoryMap = convertCategoryToFullMap(rootCategory);

                // 添加子分类
                List<AssetCategory> children = parentChildMap.get(rootCategory.getId());
                if (children != null && !children.isEmpty()) {
                    List<Map<String, Object>> childrenMaps = new ArrayList<>();
                    for (AssetCategory child : children) {
                        childrenMaps.add(convertCategoryToFullMap(child));
                    }
                    categoryMap.put("children", childrenMaps);
                }

                tree.add(categoryMap);
            }
        }

        return tree;
    }

    /**
     * 构建分类树结构（设备管理专用，过滤视频管理）
     */
    private List<Map<String, Object>> buildCategoryTree(List<AssetCategory> categories) {
        List<Map<String, Object>> tree = new ArrayList<>();
        Map<Long, List<AssetCategory>> parentChildMap = new HashMap<>();

        // 按父ID分组
        for (AssetCategory category : categories) {
            Long parentId = category.getParentId();
            parentChildMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(category);
        }

        // 构建一级分类
        List<AssetCategory> rootCategories = parentChildMap.get(null);
        if (rootCategories == null) {
            rootCategories = parentChildMap.get(0L); // 有些系统用0表示根节点
        }

        if (rootCategories != null) {
            for (AssetCategory rootCategory : rootCategories) {
                Map<String, Object> categoryMap = convertCategoryToMap(rootCategory);

                // 添加子分类
                List<AssetCategory> children = parentChildMap.get(rootCategory.getId());
                if (children != null && !children.isEmpty()) {
                    List<Map<String, Object>> childrenMaps = new ArrayList<>();
                    for (AssetCategory child : children) {
                        childrenMaps.add(convertCategoryToMap(child));
                    }
                    categoryMap.put("children", childrenMaps);
                }

                tree.add(categoryMap);
            }
        }

        return tree;
    }

    /**
     * 将AssetCategory转换为完整Map（包含所有字段和资产数量）
     */
    private Map<String, Object> convertCategoryToFullMap(AssetCategory category) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", category.getId());
        map.put("categoryName", category.getCategoryName());
        map.put("category_name", category.getCategoryName()); // 兼容前端
        map.put("parentId", category.getParentId());
        map.put("parent_id", category.getParentId()); // 兼容前端
        map.put("level", category.getLevel());
        map.put("code", category.getCategoryCode());
        map.put("icon", category.getIcon());
        map.put("color", category.getColor());
        map.put("sortOrder", category.getSortOrder());
        map.put("sort_order", category.getSortOrder()); // 兼容前端
        map.put("description", category.getDescription());

        // 计算该分类下的资产数量
        try {
            QueryWrapper<com.zxb.aiproject.entity.Asset> assetQuery = new QueryWrapper<>();
            assetQuery.eq("category_id", category.getId());
            assetQuery.eq("deleted", 0);
            Long count = assetMapper.selectCount(assetQuery);
            map.put("count", count);
        } catch (Exception e) {
            log.warn("计算分类{}的资产数量失败", category.getCategoryName(), e);
            map.put("count", 0);
        }

        // 根据分类名称推断类型
        String categoryName = category.getCategoryName();
        if (categoryName != null) {
            if (categoryName.contains("服务器")) {
                map.put("type", "server");
            } else if (categoryName.contains("网络") || categoryName.contains("交换") || categoryName.contains("路由")) {
                map.put("type", "network");
            } else if (categoryName.contains("存储")) {
                map.put("type", "storage");
            } else if (categoryName.contains("视频")) {
                map.put("type", "video");
            } else {
                map.put("type", "other");
            }
        }

        return map;
    }

    /**
     * 将AssetCategory转换为Map（设备管理专用）
     */
    private Map<String, Object> convertCategoryToMap(AssetCategory category) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", category.getId());
        map.put("name", category.getCategoryName());
        map.put("parentId", category.getParentId());
        map.put("level", category.getLevel());
        map.put("code", category.getCategoryCode());
        map.put("icon", category.getIcon());
        map.put("color", category.getColor());
        map.put("sortOrder", category.getSortOrder());

        // 根据分类名称推断类型
        String categoryName = category.getCategoryName();
        if (categoryName != null) {
            if (categoryName.contains("服务器")) {
                map.put("type", "server");
            } else if (categoryName.contains("网络") || categoryName.contains("交换") || categoryName.contains("路由")) {
                map.put("type", "network");
            } else if (categoryName.contains("存储")) {
                map.put("type", "storage");
            } else {
                map.put("type", "other");
            }
        }

        return map;
    }

    /**
     * 获取默认的设备分类树（当数据库没有数据时使用）
     */
    private List<Map<String, Object>> getDefaultDeviceCategoryTree() {
        List<Map<String, Object>> tree = new ArrayList<>();

        // 服务器分类
        Map<String, Object> serverCategory = new HashMap<>();
        serverCategory.put("id", 1);
        serverCategory.put("name", "服务器");
        serverCategory.put("parentId", null);
        serverCategory.put("level", 1);
        serverCategory.put("type", "server");

        List<Map<String, Object>> serverChildren = new ArrayList<>();

        Map<String, Object> webServer = new HashMap<>();
        webServer.put("id", 11);
        webServer.put("name", "Web服务器");
        webServer.put("parentId", 1);
        webServer.put("level", 2);
        webServer.put("type", "server");
        serverChildren.add(webServer);

        Map<String, Object> dbServer = new HashMap<>();
        dbServer.put("id", 12);
        dbServer.put("name", "数据库服务器");
        dbServer.put("parentId", 1);
        dbServer.put("level", 2);
        dbServer.put("type", "server");
        serverChildren.add(dbServer);

        serverCategory.put("children", serverChildren);
        tree.add(serverCategory);

        // 网络设备分类
        Map<String, Object> networkCategory = new HashMap<>();
        networkCategory.put("id", 2);
        networkCategory.put("name", "网络设备");
        networkCategory.put("parentId", null);
        networkCategory.put("level", 1);
        networkCategory.put("type", "network");

        List<Map<String, Object>> networkChildren = new ArrayList<>();

        Map<String, Object> switchDevice = new HashMap<>();
        switchDevice.put("id", 21);
        switchDevice.put("name", "交换机");
        switchDevice.put("parentId", 2);
        switchDevice.put("level", 2);
        switchDevice.put("type", "network");
        networkChildren.add(switchDevice);

        networkCategory.put("children", networkChildren);
        tree.add(networkCategory);

        // 存储设备分类
        Map<String, Object> storageCategory = new HashMap<>();
        storageCategory.put("id", 3);
        storageCategory.put("name", "存储设备");
        storageCategory.put("parentId", null);
        storageCategory.put("level", 1);
        storageCategory.put("type", "storage");
        tree.add(storageCategory);

        return tree;
    }

    @Override
    public AssetCategory getCategoryById(Long id) {
        log.info("根据ID获取分类: {}", id);
        // TODO: 实现根据ID获取分类逻辑
        return null;
    }

    @Override
    public List<Map<String, Object>> getCategoryDeviceStats() {
        log.info("获取大类设备统计");
        List<Map<String, Object>> result = new ArrayList<>();

        try {
            // 1. 获取所有一级分类（大类）
            QueryWrapper<AssetCategory> parentQuery = new QueryWrapper<>();
            parentQuery.eq("deleted", 0);
            parentQuery.eq("level", 1);
            parentQuery.and(wrapper -> wrapper.isNull("parent_id").or().eq("parent_id", 0));
            parentQuery.orderByAsc("sort_order", "id");
            List<AssetCategory> parentCategories = assetCategoryMapper.selectList(parentQuery);

            // 2. 为每个大类统计设备数量
            for (AssetCategory parent : parentCategories) {
                Map<String, Object> stat = new HashMap<>();
                stat.put("id", parent.getId());
                stat.put("name", parent.getCategoryName());
                stat.put("color", parent.getColor());
                stat.put("icon", parent.getIcon());

                // 获取该大类下的所有小类ID
                QueryWrapper<AssetCategory> childQuery = new QueryWrapper<>();
                childQuery.eq("deleted", 0);
                childQuery.eq("parent_id", parent.getId());
                List<AssetCategory> children = assetCategoryMapper.selectList(childQuery);

                // 统计所有小类下的设备总数
                long totalCount = 0;
                for (AssetCategory child : children) {
                    QueryWrapper<com.zxb.aiproject.entity.Asset> assetQuery = new QueryWrapper<>();
                    assetQuery.eq("category_id", child.getId());
                    assetQuery.eq("deleted", 0);
                    totalCount += assetMapper.selectCount(assetQuery);
                }

                stat.put("count", totalCount);
                result.add(stat);
            }

            // 3. 按设备数量降序排序
            result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));

            log.info("获取到{}个大类的设备统计", result.size());
            return result;

        } catch (Exception e) {
            log.error("获取大类设备统计失败", e);
            return result;
        }
    }

    @Override
    public List<Map<String, Object>> getCategoryDeviceUsage() {
        log.info("获取大类设备使用情况（在线/离线）");
        List<Map<String, Object>> result = new ArrayList<>();

        try {
            // 1. 获取所有一级分类（大类）
            QueryWrapper<AssetCategory> parentQuery = new QueryWrapper<>();
            parentQuery.eq("deleted", 0);
            parentQuery.eq("level", 1);
            parentQuery.and(wrapper -> wrapper.isNull("parent_id").or().eq("parent_id", 0));
            parentQuery.orderByAsc("sort_order", "id");
            List<AssetCategory> parentCategories = assetCategoryMapper.selectList(parentQuery);

            // 2. 为每个大类统计在线/离线设备数量
            for (AssetCategory parent : parentCategories) {
                Map<String, Object> stat = new HashMap<>();
                stat.put("id", parent.getId());
                stat.put("name", parent.getCategoryName());

                // 获取该大类下的所有小类ID
                QueryWrapper<AssetCategory> childQuery = new QueryWrapper<>();
                childQuery.eq("deleted", 0);
                childQuery.eq("parent_id", parent.getId());
                List<AssetCategory> children = assetCategoryMapper.selectList(childQuery);

                // 统计在线和离线设备数量
                long onlineCount = 0;
                long offlineCount = 0;

                for (AssetCategory child : children) {
                    // 在线设备（asset_status = 'online' 或 'running'）
                    QueryWrapper<com.zxb.aiproject.entity.Asset> onlineQuery = new QueryWrapper<>();
                    onlineQuery.eq("category_id", child.getId());
                    onlineQuery.eq("deleted", 0);
                    onlineQuery.in("asset_status", "online", "running");
                    onlineCount += assetMapper.selectCount(onlineQuery);

                    // 离线设备（其他状态）
                    QueryWrapper<com.zxb.aiproject.entity.Asset> offlineQuery = new QueryWrapper<>();
                    offlineQuery.eq("category_id", child.getId());
                    offlineQuery.eq("deleted", 0);
                    offlineQuery.notIn("asset_status", "online", "running");
                    offlineCount += assetMapper.selectCount(offlineQuery);
                }

                stat.put("online", onlineCount); // 已用（在线）
                stat.put("offline", offlineCount); // 空闲（离线）
                stat.put("total", onlineCount + offlineCount);
                result.add(stat);
            }

            log.info("获取到{}个大类的设备使用情况", result.size());
            return result;

        } catch (Exception e) {
            log.error("获取大类设备使用情况失败", e);
            return result;
        }
    }

    @Override
    public List<Map<String, Object>> getDevicesByCategoryId(Long categoryId, String status) {
        log.info("获取大类{}下的设备，状态过滤: {}", categoryId, status);
        List<Map<String, Object>> result = new ArrayList<>();

        try {
            // 获取该大类下的所有小类
            QueryWrapper<AssetCategory> childQuery = new QueryWrapper<>();
            childQuery.eq("deleted", 0);
            childQuery.eq("parent_id", categoryId);
            List<AssetCategory> children = assetCategoryMapper.selectList(childQuery);

            // 获取所有小类下的设备
            for (AssetCategory child : children) {
                QueryWrapper<com.zxb.aiproject.entity.Asset> assetQuery = new QueryWrapper<>();
                assetQuery.eq("category_id", child.getId());
                assetQuery.eq("deleted", 0);

                // 根据状态过滤
                if ("online".equalsIgnoreCase(status)) {
                    // 在线设备：status = online 或 running
                    assetQuery.in("asset_status", "online", "running");
                } else if ("offline".equalsIgnoreCase(status)) {
                    // 离线设备：其他状态
                    assetQuery.notIn("asset_status", "online", "running");
                }
                // status = "all" 时不添加状态过滤条件

                assetQuery.orderByDesc("create_time");

                List<com.zxb.aiproject.entity.Asset> assets = assetMapper.selectList(assetQuery);

                for (com.zxb.aiproject.entity.Asset asset : assets) {
                    Map<String, Object> deviceInfo = new HashMap<>();
                    deviceInfo.put("id", asset.getId());
                    deviceInfo.put("name", asset.getAssetName());
                    deviceInfo.put("deviceName", asset.getDeviceName());
                    deviceInfo.put("categoryName", child.getCategoryName());
                    deviceInfo.put("status", asset.getAssetStatus());
                    deviceInfo.put("ipAddress", asset.getIpAddress());
                    deviceInfo.put("location", asset.getLocation());
                    deviceInfo.put("manufacturer", asset.getManufacturer());
                    deviceInfo.put("model", asset.getModel());
                    result.add(deviceInfo);
                }
            }

            log.info("获取到{}台设备", result.size());
            return result;

        } catch (Exception e) {
            log.error("获取大类设备列表失败", e);
            return result;
        }
    }
}
