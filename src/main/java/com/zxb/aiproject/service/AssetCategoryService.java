package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.AssetCategory;

import java.util.List;
import java.util.Map;

/**
 * 资产分类服务接口
 */
public interface AssetCategoryService {

    /**
     * 获取所有一级分类
     */
    List<AssetCategory> getTopLevelCategories();

    /**
     * 根据父分类ID获取子分类
     */
    List<AssetCategory> getCategoriesByParentId(Long parentId);

    /**
     * 获取分类树
     */
    List<Map<String, Object>> getCategoryTree();
    
    /**
     * 获取设备管理用的分类树（过滤掉视频管理）
     */
    List<Map<String, Object>> getDeviceCategoryTree();

    /**
     * 根据ID获取分类
     */
    AssetCategory getCategoryById(Long id);

    /**
     * 获取大类设备统计（统计每个大类下所有小类的设备总数）
     * 用于大屏展示的设备类型统计图表
     */
    List<Map<String, Object>> getCategoryDeviceStats();

    /**
     * 获取大类设备使用情况（在线/离线统计）
     * 用于大屏展示的设备使用情况图表
     */
    List<Map<String, Object>> getCategoryDeviceUsage();

    /**
     * 获取指定大类下的所有设备列表
     * @param categoryId 大类ID
     * @param status 状态过滤：online-在线设备, offline-离线设备, all-全部
     */
    List<Map<String, Object>> getDevicesByCategoryId(Long categoryId, String status);
}
