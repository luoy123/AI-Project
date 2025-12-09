package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.entity.ViewDevice;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.AssetCategoryMapper;
import com.zxb.aiproject.service.ViewDeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 视图设备服务实现类
 * 从asset表获取视频管理相关的设备数据
 */
@Slf4j
@Service
public class ViewDeviceServiceImpl implements ViewDeviceService {

    @Autowired
    private AssetMapper assetMapper;

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    // 视频设备分类ID范围（父分类4及其子分类15-22）
    // 15-摄像头, 16-录像机, 17-显示器, 18-视频交换机, 19-视频服务器, 20-视频存储, 21-视频网关, 22-其他视频设备
    private static final List<Long> VIDEO_CATEGORY_IDS = Arrays.asList(15L, 16L, 17L, 18L, 19L, 20L, 21L, 22L);

    @Override
    public Map<String, Object> getDeviceStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        try {
            // 获取视频设备分类下的所有资产
            LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Asset::getCategoryId, VIDEO_CATEGORY_IDS)
                    .eq(Asset::getDeleted, 0);
            List<Asset> assets = assetMapper.selectList(wrapper);

            int total = assets.size();
            int online = 0;
            int offline = 0;
            int warning = 0;
            int fault = 0;

            for (Asset asset : assets) {
                String status = asset.getAssetStatus();
                if ("online".equals(status)) {
                    online++;
                } else if ("offline".equals(status)) {
                    offline++;
                } else if ("warning".equals(status)) {
                    warning++;
                } else if ("fault".equals(status)) {
                    fault++;
                } else {
                    offline++; // 默认离线
                }
            }

            statistics.put("total", total);
            statistics.put("online", online);
            statistics.put("offline", offline);
            statistics.put("warning", warning);
            statistics.put("fault", fault);
            statistics.put("onlineRate", total > 0 ? String.format("%.1f", (online * 100.0 / total)) : "0");

        } catch (Exception e) {
            log.error("获取设备统计失败", e);
            statistics.put("total", 0);
            statistics.put("online", 0);
            statistics.put("offline", 0);
            statistics.put("warning", 0);
            statistics.put("fault", 0);
            statistics.put("onlineRate", "0");
        }

        return statistics;
    }

    @Override
    public List<Map<String, Object>> getDeviceTypeDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();

        try {
            // 获取视频设备分类
            LambdaQueryWrapper<AssetCategory> categoryWrapper = new LambdaQueryWrapper<>();
            categoryWrapper.in(AssetCategory::getId, VIDEO_CATEGORY_IDS)
                    .eq(AssetCategory::getDeleted, 0);
            List<AssetCategory> categories = assetCategoryMapper.selectList(categoryWrapper);

            for (AssetCategory category : categories) {
                LambdaQueryWrapper<Asset> assetWrapper = new LambdaQueryWrapper<>();
                assetWrapper.eq(Asset::getCategoryId, category.getId())
                        .eq(Asset::getDeleted, 0);
                Long count = assetMapper.selectCount(assetWrapper);

                if (count > 0) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", category.getCategoryName());
                    item.put("value", count);
                    item.put("type", getDeviceTypeCode(category.getCategoryName()));
                    distribution.add(item);
                }
            }
        } catch (Exception e) {
            log.error("获取设备类型分布失败", e);
        }

        return distribution;
    }

    @Override
    public Map<String, Object> getFaultDeviceStatistics() {
        Map<String, Object> faultStats = new HashMap<>();
        List<Map<String, Object>> faultDevices = new ArrayList<>();

        try {
            // 获取故障和警告状态的视频设备
            LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Asset::getCategoryId, VIDEO_CATEGORY_IDS)
                    .in(Asset::getAssetStatus, Arrays.asList("fault", "warning", "offline"))
                    .eq(Asset::getDeleted, 0)
                    .orderByDesc(Asset::getUpdateTime)
                    .last("LIMIT 10");
            List<Asset> assets = assetMapper.selectList(wrapper);

            for (Asset asset : assets) {
                Map<String, Object> device = new HashMap<>();
                device.put("id", asset.getId());
                device.put("name", asset.getDeviceName() != null ? asset.getDeviceName() : asset.getAssetName());
                device.put("status", asset.getAssetStatus());
                device.put("location", asset.getLocation());
                device.put("ip", asset.getIpAddress());
                faultDevices.add(device);
            }

            faultStats.put("count", faultDevices.size());
            faultStats.put("devices", faultDevices);

        } catch (Exception e) {
            log.error("获取故障设备统计失败", e);
            faultStats.put("count", 0);
            faultStats.put("devices", new ArrayList<>());
        }

        return faultStats;
    }

    @Override
    public List<ViewDevice> getRecentDevices(Integer limit) {
        List<ViewDevice> devices = new ArrayList<>();

        try {
            LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Asset::getCategoryId, VIDEO_CATEGORY_IDS)
                    .eq(Asset::getDeleted, 0)
                    .orderByDesc(Asset::getCreateTime)
                    .last("LIMIT " + limit);
            List<Asset> assets = assetMapper.selectList(wrapper);

            for (Asset asset : assets) {
                devices.add(convertAssetToViewDevice(asset));
            }
        } catch (Exception e) {
            log.error("获取最近设备失败", e);
        }

        return devices;
    }

    @Override
    public List<ViewDevice> getDeviceList(String deviceType, String status, String location) {
        List<ViewDevice> devices = new ArrayList<>();

        try {
            LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(Asset::getCategoryId, VIDEO_CATEGORY_IDS)
                    .eq(Asset::getDeleted, 0);

            // 根据设备类型过滤
            if (deviceType != null && !deviceType.isEmpty()) {
                Long categoryId = getCategoryIdByType(deviceType);
                if (categoryId != null) {
                    wrapper.eq(Asset::getCategoryId, categoryId);
                }
            }

            // 根据状态过滤
            if (status != null && !status.isEmpty()) {
                wrapper.eq(Asset::getAssetStatus, status);
            }

            // 根据位置过滤
            if (location != null && !location.isEmpty()) {
                wrapper.like(Asset::getLocation, location);
            }

            wrapper.orderByDesc(Asset::getCreateTime);
            List<Asset> assets = assetMapper.selectList(wrapper);

            for (Asset asset : assets) {
                devices.add(convertAssetToViewDevice(asset));
            }
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
        }

        return devices;
    }

    @Override
    public ViewDevice getDeviceById(Long id) {
        try {
            Asset asset = assetMapper.selectById(id);
            if (asset != null && asset.getDeleted() == 0) {
                return convertAssetToViewDevice(asset);
            }
        } catch (Exception e) {
            log.error("获取设备详情失败", e);
        }
        return null;
    }

    @Override
    public boolean addDevice(ViewDevice device) {
        try {
            Asset asset = convertViewDeviceToAsset(device);
            asset.setCreateTime(LocalDateTime.now());
            asset.setUpdateTime(LocalDateTime.now());
            asset.setDeleted(0);
            return assetMapper.insert(asset) > 0;
        } catch (Exception e) {
            log.error("添加设备失败", e);
            return false;
        }
    }

    @Override
    public boolean updateDevice(ViewDevice device) {
        try {
            Asset asset = assetMapper.selectById(device.getId());
            if (asset == null) {
                return false;
            }

            // 更新字段
            if (device.getName() != null) {
                asset.setDeviceName(device.getName());
                asset.setAssetName(device.getName());
            }
            if (device.getDeviceType() != null) {
                asset.setCategoryId(getCategoryIdByType(device.getDeviceType()));
            }
            if (device.getIpAddress() != null) {
                asset.setIpAddress(device.getIpAddress());
            }
            if (device.getStatus() != null) {
                asset.setAssetStatus(device.getStatus());
            }
            if (device.getLocation() != null) {
                asset.setLocation(device.getLocation());
            }
            if (device.getManufacturer() != null) {
                asset.setManufacturer(device.getManufacturer());
            }
            if (device.getModel() != null) {
                asset.setModel(device.getModel());
            }
            if (device.getDescription() != null) {
                asset.setDescription(device.getDescription());
            }

            asset.setUpdateTime(LocalDateTime.now());
            return assetMapper.updateById(asset) > 0;
        } catch (Exception e) {
            log.error("更新设备失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteDevice(Long id) {
        try {
            Asset asset = assetMapper.selectById(id);
            if (asset != null) {
                asset.setDeleted(1);
                asset.setUpdateTime(LocalDateTime.now());
                return assetMapper.updateById(asset) > 0;
            }
            return false;
        } catch (Exception e) {
            log.error("删除设备失败", e);
            return false;
        }
    }

    @Override
    public List<Map<String, Object>> getAbnormalTrend(int days) {
        List<Map<String, Object>> trend = new ArrayList<>();

        // 生成模拟趋势数据
        LocalDateTime now = LocalDateTime.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toLocalDate().toString());
            item.put("count", (int) (Math.random() * 5)); // 模拟数据
            trend.add(item);
        }

        return trend;
    }

    @Override
    public List<Map<String, Object>> getAvailabilityTrend(int days) {
        List<Map<String, Object>> trend = new ArrayList<>();

        // 生成模拟趋势数据
        LocalDateTime now = LocalDateTime.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toLocalDate().toString());
            item.put("rate", 95 + Math.random() * 5); // 模拟95%-100%的可用性
            trend.add(item);
        }

        return trend;
    }

    /**
     * 将Asset转换为ViewDevice
     */
    private ViewDevice convertAssetToViewDevice(Asset asset) {
        ViewDevice device = new ViewDevice();
        device.setId(asset.getId());
        device.setName(asset.getDeviceName() != null ? asset.getDeviceName() : asset.getAssetName());
        device.setDeviceType(getDeviceTypeByCategory(asset.getCategoryId()));
        device.setIpAddress(asset.getIpAddress());
        device.setStatus(asset.getAssetStatus() != null ? asset.getAssetStatus() : "offline");
        device.setLocation(asset.getLocation());
        device.setManufacturer(asset.getManufacturer());
        device.setModel(asset.getModel());
        device.setDescription(asset.getDescription());
        device.setCreatedAt(asset.getCreateTime());
        device.setUpdatedAt(asset.getUpdateTime());
        device.setDeleted(asset.getDeleted());
        return device;
    }

    /**
     * 将ViewDevice转换为Asset
     */
    private Asset convertViewDeviceToAsset(ViewDevice device) {
        Asset asset = new Asset();
        asset.setId(device.getId());
        asset.setDeviceName(device.getName());
        asset.setAssetName(device.getName());
        asset.setCategoryId(getCategoryIdByType(device.getDeviceType()));
        asset.setIpAddress(device.getIpAddress());
        asset.setAssetStatus(device.getStatus());
        asset.setLocation(device.getLocation());
        asset.setManufacturer(device.getManufacturer());
        asset.setModel(device.getModel());
        asset.setDescription(device.getDescription());
        return asset;
    }

    /**
     * 根据分类ID获取设备类型代码
     */
    private String getDeviceTypeByCategory(Long categoryId) {
        if (categoryId == null)
            return "other";

        // 根据实际分类ID映射
        switch (categoryId.intValue()) {
            case 15:
                return "camera"; // 摄像头
            case 16:
                return "nvr"; // 录像机
            case 17:
                return "monitor"; // 显示器
            case 18:
                return "switch"; // 视频交换机
            case 19:
                return "server"; // 视频服务器
            case 20:
                return "storage"; // 视频存储
            default:
                return "other";
        }
    }

    /**
     * 根据设备类型获取分类ID
     */
    private Long getCategoryIdByType(String type) {
        if (type == null)
            return null;

        switch (type.toLowerCase()) {
            case "camera":
                return 15L;
            case "nvr":
                return 16L;
            case "monitor":
                return 17L;
            case "switch":
                return 18L;
            case "server":
                return 19L;
            case "storage":
                return 20L;
            default:
                return null;
        }
    }

    /**
     * 根据分类名称获取设备类型代码
     */
    private String getDeviceTypeCode(String categoryName) {
        if (categoryName == null)
            return "other";

        if (categoryName.contains("摄像"))
            return "camera";
        if (categoryName.contains("录像"))
            return "nvr";
        if (categoryName.contains("显示"))
            return "monitor";
        if (categoryName.contains("交换"))
            return "switch";
        if (categoryName.contains("服务器"))
            return "server";
        if (categoryName.contains("存储"))
            return "storage";

        return "other";
    }
}
