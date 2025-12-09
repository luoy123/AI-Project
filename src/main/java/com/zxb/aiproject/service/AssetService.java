package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.AssetCategory;

import java.util.List;
import java.util.Map;

/**
 * 资产服务接口
 */
public interface AssetService {

    /**
     * 获取资产统计数据（按分类）
     */
    List<Map<String, Object>> getAssetStatisticsByCategory();

    /**
     * 获取所有一级分类及其资产数量
     */
    List<Map<String, Object>> getCategoryStatistics();

    /**
     * 获取资产列表（支持多种过滤条件）
     */
    List<Asset> getAssetList(Long categoryId, String assetStatus, String deviceStatus, String keyword);

    /**
     * 根据分类ID获取资产列表
     */
    List<Asset> getAssetsByCategoryId(Long categoryId);

    /**
     * 根据资产状态获取资产列表
     */
    List<Asset> getAssetsByStatus(String status);

    /**
     * 获取即将到期保修的资产
     */
    List<Map<String, Object>> getWarrantyExpiringAssets();

    /**
     * 获取资产总览数据
     */
    Map<String, Object> getAssetOverview();

    /**
     * 根据ID获取资产
     */
    Asset getAssetById(Long id);

    /**
     * 新增资产
     */
    boolean addAsset(Asset asset);

    /**
     * 更新资产
     */
    boolean updateAsset(Asset asset);

    /**
     * 删除资产
     */
    boolean deleteAsset(Long id);

    /**
     * 搜索资产
     */
    List<Asset> searchAssets(String keyword);

    /**
     * 获取视频设备位置选项
     */
    List<String> getVideoDeviceLocations();

    /**
     * 批量删除资产
     */
    boolean batchDeleteAssets(List<Long> ids);

    /**
     * 更新资产状态
     */
    boolean updateAssetStatus(Long id, String status);
}
