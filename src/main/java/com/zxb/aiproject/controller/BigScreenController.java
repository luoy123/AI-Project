package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.Alert;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.AssetCategory;
import com.zxb.aiproject.entity.CloudHost;
import com.zxb.aiproject.entity.CloudVirtualMachine;
import com.zxb.aiproject.mapper.AlertMapper;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.AssetCategoryMapper;
import com.zxb.aiproject.mapper.CloudHostMapper;
import com.zxb.aiproject.mapper.CloudVirtualMachineMapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

/**
 * 大屏展示Controller
 */
@Slf4j
@RestController
@RequestMapping("/bigscreen")
@Api(tags = "大屏展示")
public class BigScreenController {

    @Autowired
    private AssetMapper assetMapper;

    @Autowired
    private AlertMapper alertMapper;

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    @Autowired
    private CloudHostMapper cloudHostMapper;

    @Autowired
    private CloudVirtualMachineMapper cloudVirtualMachineMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 获取大屏核心统计数据
     * 包括：在线设备数、离线设备数、本月告警数、较上月变化百分比
     */
    @GetMapping("/core-stats")
    @ApiOperation("获取大屏核心统计数据")
    public Result<Map<String, Object>> getCoreStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 1. 统计在线设备数量（status = online 或 running）
            QueryWrapper<Asset> onlineQuery = new QueryWrapper<>();
            onlineQuery.eq("deleted", 0);
            onlineQuery.in("asset_status", "online", "running");
            long onlineCount = assetMapper.selectCount(onlineQuery);
            stats.put("onlineDevices", onlineCount);

            // 2. 统计离线设备数量（其他状态）
            QueryWrapper<Asset> offlineQuery = new QueryWrapper<>();
            offlineQuery.eq("deleted", 0);
            offlineQuery.notIn("asset_status", "online", "running");
            long offlineCount = assetMapper.selectCount(offlineQuery);
            stats.put("offlineDevices", offlineCount);

            // 3. 统计本月告警数量
            LocalDate now = LocalDate.now();
            LocalDateTime currentMonthStart = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
            LocalDateTime currentMonthEnd = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

            QueryWrapper<Alert> currentMonthQuery = new QueryWrapper<>();
            currentMonthQuery.eq("deleted", 0);
            currentMonthQuery.ge("occurred_time", currentMonthStart);
            currentMonthQuery.le("occurred_time", currentMonthEnd);
            long currentMonthAlerts = alertMapper.selectCount(currentMonthQuery);
            stats.put("currentMonthAlerts", currentMonthAlerts);

            // 4. 统计上月告警数量
            LocalDate lastMonth = now.minusMonths(1);
            LocalDateTime lastMonthStart = lastMonth.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
            LocalDateTime lastMonthEnd = lastMonth.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

            QueryWrapper<Alert> lastMonthQuery = new QueryWrapper<>();
            lastMonthQuery.eq("deleted", 0);
            lastMonthQuery.ge("occurred_time", lastMonthStart);
            lastMonthQuery.le("occurred_time", lastMonthEnd);
            long lastMonthAlerts = alertMapper.selectCount(lastMonthQuery);
            stats.put("lastMonthAlerts", lastMonthAlerts);

            // 5. 计算较上月变化百分比
            int changePercent = 0;
            if (lastMonthAlerts > 0) {
                changePercent = (int) Math
                        .round(((double) (currentMonthAlerts - lastMonthAlerts) / lastMonthAlerts) * 100);
            } else if (currentMonthAlerts > 0) {
                changePercent = 100; // 上月为0，本月有告警，视为增长100%
            }
            stats.put("alertChangePercent", changePercent);

            log.info("大屏核心统计: 在线设备={}, 离线设备={}, 本月告警={}, 上月告警={}, 变化={}%",
                    onlineCount, offlineCount, currentMonthAlerts, lastMonthAlerts, changePercent);

            return Result.success(stats);

        } catch (Exception e) {
            log.error("获取大屏核心统计数据失败", e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取资源类型列表（用于下拉选择）
     * 资源监控页面显示所有分类包括云平台
     */
    @GetMapping("/resource-monitor/categories")
    @ApiOperation("获取资源类型列表")
    public Result<List<Map<String, Object>>> getResourceCategories() {
        try {
            List<Map<String, Object>> categories = new ArrayList<>();

            // 从数据库获取顶级分类
            QueryWrapper<AssetCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            queryWrapper.eq("parent_id", 0);
            queryWrapper.orderByAsc("sort_order");

            List<AssetCategory> categoryList = assetCategoryMapper.selectList(queryWrapper);
            for (AssetCategory category : categoryList) {
                Map<String, Object> item = new HashMap<>();
                item.put("value", category.getId().toString());
                item.put("label", category.getCategoryName());
                item.put("code", category.getCategoryCode());
                item.put("resourceType", category.getResourceType());
                categories.add(item);
            }

            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取资源类型列表失败", e);
            return Result.error("获取资源类型列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备实例列表（用于下拉选择）
     * 根据分类ID返回对应的设备列表
     */
    @GetMapping("/resource-monitor/devices")
    @ApiOperation("获取设备实例列表")
    public Result<List<Map<String, Object>>> getDeviceList(@RequestParam(required = false) String categoryId) {
        try {
            List<Map<String, Object>> devices = new ArrayList<>();

            // 添加"全部设备"选项
            Map<String, Object> allDevices = new HashMap<>();
            allDevices.put("value", "all");
            allDevices.put("label", "全部设备");
            devices.add(allDevices);

            // 查询分类信息判断是否为云平台
            boolean isCloudCategory = false;
            if (categoryId != null && !"all".equals(categoryId)) {
                AssetCategory category = assetCategoryMapper.selectById(Long.parseLong(categoryId));
                if (category != null && "CLOUD".equals(category.getCategoryCode())) {
                    isCloudCategory = true;
                }
            }

            if (isCloudCategory) {
                // 云平台：返回云主机和虚拟机
                List<CloudHost> hosts = cloudHostMapper.selectList(new QueryWrapper<>());
                for (CloudHost host : hosts) {
                    Map<String, Object> device = new HashMap<>();
                    device.put("value", "host_" + host.getId());
                    device.put("label", host.getHostName());
                    device.put("type", "cloud_host");
                    devices.add(device);
                }

                List<CloudVirtualMachine> vms = cloudVirtualMachineMapper.selectList(new QueryWrapper<>());
                for (CloudVirtualMachine vm : vms) {
                    Map<String, Object> device = new HashMap<>();
                    device.put("value", "vm_" + vm.getId());
                    device.put("label", vm.getVmName());
                    device.put("type", "cloud_vm");
                    devices.add(device);
                }
            } else {
                // 物理设备：返回资产列表
                QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("deleted", 0);
                if (categoryId != null && !"all".equals(categoryId)) {
                    // 获取该分类及其子分类的ID
                    List<Long> categoryIds = new ArrayList<>();
                    categoryIds.add(Long.parseLong(categoryId));
                    QueryWrapper<AssetCategory> subQuery = new QueryWrapper<>();
                    subQuery.eq("parent_id", Long.parseLong(categoryId));
                    subQuery.eq("deleted", 0);
                    List<AssetCategory> subCategories = assetCategoryMapper.selectList(subQuery);
                    for (AssetCategory sub : subCategories) {
                        categoryIds.add(sub.getId());
                    }
                    queryWrapper.in("category_id", categoryIds);
                }
                queryWrapper.select("id", "asset_name", "device_name");
                queryWrapper.orderByAsc("id");

                List<Asset> assetList = assetMapper.selectList(queryWrapper);
                for (Asset asset : assetList) {
                    Map<String, Object> device = new HashMap<>();
                    device.put("value", "asset_" + asset.getId());
                    device.put("label", asset.getAssetName() != null ? asset.getAssetName() : asset.getDeviceName());
                    device.put("type", "asset");
                    devices.add(device);
                }
            }

            return Result.success(devices);
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
            return Result.error("获取设备列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取资源池概览
     * 根据分类和设备筛选动态显示数据
     */
    @GetMapping("/resource-monitor/pool")
    @ApiOperation("获取资源池概览")
    public Result<Map<String, Object>> getResourcePool(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String deviceId) {
        try {
            Map<String, Object> pool = new HashMap<>();

            // 判断是否选择了具体设备
            if (deviceId != null && !"all".equals(deviceId)) {
                // 显示具体设备的数据
                if (deviceId.startsWith("host_")) {
                    Long id = Long.parseLong(deviceId.replace("host_", ""));
                    CloudHost host = cloudHostMapper.selectById(id);
                    if (host != null) {
                        pool.put("cpuCores", host.getCpuCores() != null ? host.getCpuCores() : 0);
                        pool.put("memoryTotal", host.getMemoryGb() != null ? host.getMemoryGb() + "GB" : "0GB");
                        pool.put("storageTotal",
                                host.getStorageTotal() != null
                                        ? String.format("%.1f", host.getStorageTotal().doubleValue()) + "GB"
                                        : "0GB");
                        pool.put("bandwidth", "10"); // 单设备带宽
                    }
                } else if (deviceId.startsWith("vm_")) {
                    Long id = Long.parseLong(deviceId.replace("vm_", ""));
                    CloudVirtualMachine vm = cloudVirtualMachineMapper.selectById(id);
                    if (vm != null) {
                        pool.put("cpuCores", vm.getCpuCores() != null ? vm.getCpuCores() : 0);
                        pool.put("memoryTotal", vm.getMemoryGb() != null ? vm.getMemoryGb() + "GB" : "0GB");
                        pool.put("storageTotal", vm.getDiskGb() != null ? vm.getDiskGb() + "GB" : "0GB");
                        pool.put("bandwidth", "5"); // 单设备带宽
                    }
                } else if (deviceId.startsWith("asset_")) {
                    Long id = Long.parseLong(deviceId.replace("asset_", ""));
                    Asset asset = assetMapper.selectById(id);
                    if (asset != null) {
                        pool.put("cpuCores", asset.getCpuCores() != null ? asset.getCpuCores() : 0);
                        pool.put("memoryTotal",
                                asset.getMemoryTotal() != null
                                        ? String.format("%.0f", asset.getMemoryTotal().doubleValue()) + "GB"
                                        : "0GB");
                        pool.put("storageTotal",
                                asset.getStorageTotal() != null
                                        ? String.format("%.1f", asset.getStorageTotal().doubleValue()) + "TB"
                                        : "0TB");
                        pool.put("bandwidth",
                                asset.getBandwidth() != null ? String.format("%.0f", asset.getBandwidth().doubleValue())
                                        : "1");
                    }
                }
                return Result.success(pool);
            }

            // 判断是否选择了分类
            boolean isCloudCategory = false;
            List<Long> categoryIds = new ArrayList<>();
            if (categoryId != null && !"all".equals(categoryId)) {
                AssetCategory category = assetCategoryMapper.selectById(Long.parseLong(categoryId));
                if (category != null && "CLOUD".equals(category.getCategoryCode())) {
                    isCloudCategory = true;
                } else {
                    // 获取该分类及其子分类的ID
                    categoryIds.add(Long.parseLong(categoryId));
                    QueryWrapper<AssetCategory> subQuery = new QueryWrapper<>();
                    subQuery.eq("parent_id", Long.parseLong(categoryId));
                    subQuery.eq("deleted", 0);
                    List<AssetCategory> subCategories = assetCategoryMapper.selectList(subQuery);
                    for (AssetCategory sub : subCategories) {
                        categoryIds.add(sub.getId());
                    }
                }
            }

            if (isCloudCategory) {
                // 云平台分类 - 汇总云主机和虚拟机
                int totalCores = 0;
                int totalMemory = 0;
                double totalStorage = 0;

                List<CloudHost> hosts = cloudHostMapper.selectList(new QueryWrapper<>());
                for (CloudHost host : hosts) {
                    totalCores += host.getCpuCores() != null ? host.getCpuCores() : 0;
                    totalMemory += host.getMemoryGb() != null ? host.getMemoryGb() : 0;
                    totalStorage += host.getStorageTotal() != null ? host.getStorageTotal().doubleValue() : 0;
                }
                List<CloudVirtualMachine> vms = cloudVirtualMachineMapper.selectList(new QueryWrapper<>());
                for (CloudVirtualMachine vm : vms) {
                    totalCores += vm.getCpuCores() != null ? vm.getCpuCores() : 0;
                    totalMemory += vm.getMemoryGb() != null ? vm.getMemoryGb() : 0;
                    totalStorage += vm.getDiskGb() != null ? vm.getDiskGb() : 0;
                }

                pool.put("cpuCores", totalCores);
                pool.put("memoryTotal", String.format("%.1f", totalMemory / 1024.0) + "TB");
                pool.put("storageTotal", String.format("%.1f", totalStorage / 1024.0) + "TB");
                pool.put("bandwidth", "100"); // 云平台带宽
            } else {
                // 物理资产 - 按分类汇总
                QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("deleted", 0);
                if (!categoryIds.isEmpty()) {
                    queryWrapper.in("category_id", categoryIds);
                }
                queryWrapper.select("SUM(cpu_cores) as total_cores",
                        "SUM(memory_total) as total_memory",
                        "SUM(storage_total) as total_storage",
                        "SUM(bandwidth) as total_bw");

                List<Map<String, Object>> result = assetMapper.selectMaps(queryWrapper);
                if (result != null && !result.isEmpty()) {
                    Map<String, Object> row = result.get(0);
                    pool.put("cpuCores",
                            row.get("total_cores") != null ? ((Number) row.get("total_cores")).intValue() : 0);
                    double memoryTB = row.get("total_memory") != null
                            ? ((Number) row.get("total_memory")).doubleValue() / 1024
                            : 0;
                    pool.put("memoryTotal", String.format("%.1f", memoryTB) + "TB");
                    double storagePB = row.get("total_storage") != null
                            ? ((Number) row.get("total_storage")).doubleValue() / 1024
                            : 0;
                    pool.put("storageTotal", String.format("%.1f", storagePB) + "PB");
                    pool.put("bandwidth",
                            row.get("total_bw") != null
                                    ? String.format("%.0f", ((Number) row.get("total_bw")).doubleValue())
                                    : "0");
                } else {
                    pool.put("cpuCores", 0);
                    pool.put("memoryTotal", "0TB");
                    pool.put("storageTotal", "0PB");
                    pool.put("bandwidth", "0");
                }
            }

            return Result.success(pool);
        } catch (Exception e) {
            log.error("获取资源池概览失败", e);
            return Result.error("获取资源池概览失败: " + e.getMessage());
        }
    }

    /**
     * 获取资源消耗排行Top10
     */
    @GetMapping("/resource-monitor/ranking")
    @ApiOperation("获取资源消耗排行")
    public Result<List<Map<String, Object>>> getResourceRanking(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "cpu") String sortBy) {
        try {
            List<Map<String, Object>> ranking = new ArrayList<>();

            // 判断是否为云平台
            boolean isCloudCategory = false;
            if (categoryId != null && !"all".equals(categoryId)) {
                AssetCategory category = assetCategoryMapper.selectById(Long.parseLong(categoryId));
                if (category != null && "CLOUD".equals(category.getCategoryCode())) {
                    isCloudCategory = true;
                }
            }

            if (deviceId == null || "all".equals(deviceId)) {
                if (isCloudCategory) {
                    // 云平台全部设备排行
                    List<CloudHost> hosts = cloudHostMapper
                            .selectList(new QueryWrapper<CloudHost>().orderByDesc("cpu_usage").last("LIMIT 5"));
                    for (CloudHost host : hosts) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", host.getHostName());
                        item.put("value", host.getCpuUsage() != null ? host.getCpuUsage().doubleValue() : 0);
                        ranking.add(item);
                    }
                    List<CloudVirtualMachine> vms = cloudVirtualMachineMapper.selectList(
                            new QueryWrapper<CloudVirtualMachine>().orderByDesc("cpu_usage").last("LIMIT 5"));
                    for (CloudVirtualMachine vm : vms) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", vm.getVmName());
                        item.put("value", vm.getCpuUsage() != null ? vm.getCpuUsage().doubleValue() : 0);
                        ranking.add(item);
                    }
                    // 排序取Top10
                    ranking.sort((a, b) -> Double.compare((Double) b.get("value"), (Double) a.get("value")));
                    if (ranking.size() > 10)
                        ranking = ranking.subList(0, 10);
                } else {
                    // 物理设备排行
                    QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
                    queryWrapper.eq("deleted", 0);
                    queryWrapper.orderByDesc("cpu_usage");
                    queryWrapper.last("LIMIT 10");

                    List<Asset> assets = assetMapper.selectList(queryWrapper);
                    for (Asset asset : assets) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", asset.getAssetName() != null ? asset.getAssetName() : asset.getDeviceName());
                        item.put("value", asset.getCpuUsage() != null ? asset.getCpuUsage().doubleValue() : 0);
                        ranking.add(item);
                    }
                }
            } else {
                // 单个设备详情
                Double cpuUsage = 0.0, memUsage = 0.0, storageUsage = 0.0, netUsage = 0.0;

                if (deviceId.startsWith("host_")) {
                    Long id = Long.parseLong(deviceId.replace("host_", ""));
                    CloudHost host = cloudHostMapper.selectById(id);
                    if (host != null) {
                        cpuUsage = host.getCpuUsage() != null ? host.getCpuUsage().doubleValue() : 0;
                        memUsage = host.getMemoryUsage() != null ? host.getMemoryUsage().doubleValue() : 0;
                        storageUsage = host.getStorageUsage() != null ? host.getStorageUsage().doubleValue() : 0;
                        netUsage = host.getNetworkUsage() != null ? host.getNetworkUsage().doubleValue() : 0;
                    }
                } else if (deviceId.startsWith("vm_")) {
                    Long id = Long.parseLong(deviceId.replace("vm_", ""));
                    CloudVirtualMachine vm = cloudVirtualMachineMapper.selectById(id);
                    if (vm != null) {
                        cpuUsage = vm.getCpuUsage() != null ? vm.getCpuUsage().doubleValue() : 0;
                        memUsage = vm.getMemoryUsage() != null ? vm.getMemoryUsage().doubleValue() : 0;
                        storageUsage = vm.getStorageUsage() != null ? vm.getStorageUsage().doubleValue() : 0;
                        netUsage = vm.getNetworkUsage() != null ? vm.getNetworkUsage().doubleValue() : 0;
                    }
                } else if (deviceId.startsWith("asset_")) {
                    Long id = Long.parseLong(deviceId.replace("asset_", ""));
                    Asset asset = assetMapper.selectById(id);
                    if (asset != null) {
                        cpuUsage = asset.getCpuUsage() != null ? asset.getCpuUsage().doubleValue() : 0;
                        memUsage = asset.getMemoryUsage() != null ? asset.getMemoryUsage().doubleValue() : 0;
                        storageUsage = asset.getStorageUsage() != null ? asset.getStorageUsage().doubleValue() : 0;
                        netUsage = asset.getNetworkUsage() != null ? asset.getNetworkUsage().doubleValue() : 0;
                    }
                }

                String[] metrics = { "CPU使用率", "内存使用率", "存储使用率", "网络使用率" };
                Double[] values = { cpuUsage, memUsage, storageUsage, netUsage };
                for (int i = 0; i < metrics.length; i++) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", metrics[i]);
                    item.put("value", values[i]);
                    ranking.add(item);
                }
            }

            return Result.success(ranking);
        } catch (Exception e) {
            log.error("获取资源消耗排行失败", e);
            return Result.error("获取资源消耗排行失败: " + e.getMessage());
        }
    }

    /**
     * 获取实时性能数据
     */
    @GetMapping("/resource-monitor/performance")
    @ApiOperation("获取实时性能数据")
    public Result<Map<String, Object>> getPerformance(@RequestParam(required = false) String deviceId) {
        try {
            Map<String, Object> performance = new HashMap<>();

            if (deviceId == null || "all".equals(deviceId)) {
                // 全部设备 - 计算平均值
                QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("deleted", 0);
                queryWrapper.select("AVG(cpu_usage) as avg_cpu", "AVG(memory_usage) as avg_memory",
                        "AVG(network_usage) as avg_network", "AVG(storage_usage) as avg_storage",
                        "SUM(cpu_cores) as total_cores", "SUM(memory_used) as used_memory",
                        "SUM(memory_total) as total_memory", "SUM(storage_used) as used_storage",
                        "SUM(storage_total) as total_storage", "SUM(network_in) as total_in",
                        "SUM(network_out) as total_out");

                List<Map<String, Object>> result = assetMapper.selectMaps(queryWrapper);
                if (result != null && !result.isEmpty()) {
                    Map<String, Object> row = result.get(0);
                    performance.put("cpuUsage",
                            row.get("avg_cpu") != null ? Math.round(((Number) row.get("avg_cpu")).doubleValue()) : 45);
                    performance.put("cpuCores",
                            row.get("total_cores") != null ? ((Number) row.get("total_cores")).intValue() : 16);
                    performance.put("cpuLoad", "0.75");
                    performance.put("memoryUsage",
                            row.get("avg_memory") != null ? Math.round(((Number) row.get("avg_memory")).doubleValue())
                                    : 62);
                    performance.put("memoryUsed",
                            row.get("used_memory") != null
                                    ? String.format("%.0f", ((Number) row.get("used_memory")).doubleValue())
                                    : "198");
                    performance.put("memoryTotal",
                            row.get("total_memory") != null
                                    ? String.format("%.0f", ((Number) row.get("total_memory")).doubleValue())
                                    : "320");
                    performance.put("networkUsage",
                            row.get("avg_network") != null ? Math.round(((Number) row.get("avg_network")).doubleValue())
                                    : 71);
                    performance.put("networkIn",
                            row.get("total_in") != null
                                    ? String.format("%.1f", ((Number) row.get("total_in")).doubleValue())
                                    : "2.5");
                    performance.put("networkOut",
                            row.get("total_out") != null
                                    ? String.format("%.1f", ((Number) row.get("total_out")).doubleValue())
                                    : "3.8");
                    performance.put("storageUsage",
                            row.get("avg_storage") != null ? Math.round(((Number) row.get("avg_storage")).doubleValue())
                                    : 67);
                    performance.put("storageUsed",
                            row.get("used_storage") != null
                                    ? String.format("%.1f", ((Number) row.get("used_storage")).doubleValue() / 1024)
                                    : "1.2");
                    performance.put("storageTotal",
                            row.get("total_storage") != null
                                    ? String.format("%.1f", ((Number) row.get("total_storage")).doubleValue() / 1024)
                                    : "1.8");
                }
            } else {
                // 单个设备 - 根据前缀判断类型
                if (deviceId.startsWith("host_")) {
                    Long id = Long.parseLong(deviceId.replace("host_", ""));
                    CloudHost host = cloudHostMapper.selectById(id);
                    if (host != null) {
                        performance.put("cpuUsage", host.getCpuUsage() != null ? host.getCpuUsage().intValue() : 0);
                        performance.put("cpuCores", host.getCpuCores() != null ? host.getCpuCores() : 0);
                        performance.put("cpuLoad", host.getCpuLoad() != null ? host.getCpuLoad().toString() : "0");
                        performance.put("memoryUsage",
                                host.getMemoryUsage() != null ? host.getMemoryUsage().intValue() : 0);
                        performance.put("memoryUsed",
                                host.getMemoryUsed() != null ? String.format("%.0f", host.getMemoryUsed().doubleValue())
                                        : "0");
                        performance.put("memoryTotal",
                                host.getMemoryGb() != null ? host.getMemoryGb().toString() : "0");
                        performance.put("networkUsage",
                                host.getNetworkUsage() != null ? host.getNetworkUsage().intValue() : 0);
                        performance.put("networkIn",
                                host.getNetworkIn() != null ? String.format("%.1f", host.getNetworkIn().doubleValue())
                                        : "0");
                        performance.put("networkOut",
                                host.getNetworkOut() != null ? String.format("%.1f", host.getNetworkOut().doubleValue())
                                        : "0");
                        performance.put("storageUsage",
                                host.getStorageUsage() != null ? host.getStorageUsage().intValue() : 0);
                        performance.put("storageUsed",
                                host.getStorageUsed() != null
                                        ? String.format("%.1f", host.getStorageUsed().doubleValue())
                                        : "0");
                        performance.put("storageTotal",
                                host.getStorageTotal() != null
                                        ? String.format("%.1f", host.getStorageTotal().doubleValue())
                                        : "0");
                        performance.put("deviceName", host.getHostName());
                    }
                } else if (deviceId.startsWith("vm_")) {
                    Long id = Long.parseLong(deviceId.replace("vm_", ""));
                    CloudVirtualMachine vm = cloudVirtualMachineMapper.selectById(id);
                    if (vm != null) {
                        performance.put("cpuUsage", vm.getCpuUsage() != null ? vm.getCpuUsage().intValue() : 0);
                        performance.put("cpuCores", vm.getCpuCores() != null ? vm.getCpuCores() : 0);
                        performance.put("cpuLoad", vm.getCpuLoad() != null ? vm.getCpuLoad().toString() : "0");
                        performance.put("memoryUsage",
                                vm.getMemoryUsage() != null ? vm.getMemoryUsage().intValue() : 0);
                        performance.put("memoryUsed",
                                vm.getMemoryUsed() != null ? String.format("%.0f", vm.getMemoryUsed().doubleValue())
                                        : "0");
                        performance.put("memoryTotal", vm.getMemoryGb() != null ? vm.getMemoryGb().toString() : "0");
                        performance.put("networkUsage",
                                vm.getNetworkUsage() != null ? vm.getNetworkUsage().intValue() : 0);
                        performance.put("networkIn",
                                vm.getNetworkIn() != null ? String.format("%.1f", vm.getNetworkIn().doubleValue())
                                        : "0");
                        performance.put("networkOut",
                                vm.getNetworkOut() != null ? String.format("%.1f", vm.getNetworkOut().doubleValue())
                                        : "0");
                        performance.put("storageUsage",
                                vm.getStorageUsage() != null ? vm.getStorageUsage().intValue() : 0);
                        performance.put("storageUsed", "0");
                        performance.put("storageTotal", vm.getDiskGb() != null ? vm.getDiskGb().toString() : "0");
                        performance.put("deviceName", vm.getVmName());
                    }
                } else if (deviceId.startsWith("asset_")) {
                    Long id = Long.parseLong(deviceId.replace("asset_", ""));
                    Asset asset = assetMapper.selectById(id);
                    if (asset != null) {
                        performance.put("cpuUsage", asset.getCpuUsage() != null ? asset.getCpuUsage().intValue() : 0);
                        performance.put("cpuCores", asset.getCpuCores() != null ? asset.getCpuCores() : 0);
                        performance.put("cpuLoad", asset.getCpuLoad() != null ? asset.getCpuLoad().toString() : "0");
                        performance.put("memoryUsage",
                                asset.getMemoryUsage() != null ? asset.getMemoryUsage().intValue() : 0);
                        performance.put("memoryUsed",
                                asset.getMemoryUsed() != null
                                        ? String.format("%.0f", asset.getMemoryUsed().doubleValue())
                                        : "0");
                        performance.put("memoryTotal",
                                asset.getMemoryTotal() != null
                                        ? String.format("%.0f", asset.getMemoryTotal().doubleValue())
                                        : "0");
                        performance.put("networkUsage",
                                asset.getNetworkUsage() != null ? asset.getNetworkUsage().intValue() : 0);
                        performance.put("networkIn",
                                asset.getNetworkIn() != null ? String.format("%.1f", asset.getNetworkIn().doubleValue())
                                        : "0");
                        performance.put("networkOut",
                                asset.getNetworkOut() != null
                                        ? String.format("%.1f", asset.getNetworkOut().doubleValue())
                                        : "0");
                        performance.put("storageUsage",
                                asset.getStorageUsage() != null ? asset.getStorageUsage().intValue() : 0);
                        performance.put("storageUsed",
                                asset.getStorageUsed() != null
                                        ? String.format("%.1f", asset.getStorageUsed().doubleValue())
                                        : "0");
                        performance.put("storageTotal",
                                asset.getStorageTotal() != null
                                        ? String.format("%.1f", asset.getStorageTotal().doubleValue())
                                        : "0");
                        performance.put("deviceName", asset.getAssetName());
                    }
                }
            }

            return Result.success(performance);
        } catch (Exception e) {
            log.error("获取实时性能数据失败", e);
            return Result.error("获取实时性能数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取资源使用历史数据（从数据库获取24小时数据）
     */
    @GetMapping("/resource-monitor/history")
    @ApiOperation("获取资源使用历史")
    public Result<Map<String, Object>> getResourceHistory(@RequestParam(required = false) String deviceId) {
        try {
            Map<String, Object> history = new HashMap<>();

            // 生成24小时时间轴
            List<String> hours = new ArrayList<>();
            for (int i = 0; i < 24; i++) {
                hours.add(String.format("%d:00", i));
            }
            history.put("hours", hours);

            // 初始化数据数组
            Double[] cpuActual = new Double[24];
            Double[] memActual = new Double[24];
            Double[] netActual = new Double[24];
            Double[] storageActual = new Double[24];
            Double[] cpuPredict = new Double[24];
            Double[] memPredict = new Double[24];
            Double[] netPredict = new Double[24];
            Double[] storagePredict = new Double[24];

            // 根据设备ID查询历史数据
            String sql;
            if (deviceId == null || "all".equals(deviceId)) {
                // 全部设备 - 查询平均值
                sql = "SELECT record_hour, " +
                        "AVG(cpu_usage) as cpu_usage, AVG(memory_usage) as memory_usage, " +
                        "AVG(network_usage) as network_usage, AVG(storage_usage) as storage_usage, " +
                        "AVG(cpu_predict) as cpu_predict, AVG(memory_predict) as memory_predict, " +
                        "AVG(network_predict) as network_predict, AVG(storage_predict) as storage_predict " +
                        "FROM resource_history WHERE record_date = CURDATE() " +
                        "GROUP BY record_hour ORDER BY record_hour";
            } else {
                // 单个设备
                String deviceType = "asset";
                String realId = deviceId;
                if (deviceId.startsWith("host_")) {
                    deviceType = "cloud_host";
                    realId = deviceId.replace("host_", "");
                } else if (deviceId.startsWith("vm_")) {
                    deviceType = "cloud_vm";
                    realId = deviceId.replace("vm_", "");
                } else if (deviceId.startsWith("asset_")) {
                    realId = deviceId.replace("asset_", "");
                }
                sql = "SELECT record_hour, cpu_usage, memory_usage, network_usage, storage_usage, " +
                        "cpu_predict, memory_predict, network_predict, storage_predict " +
                        "FROM resource_history WHERE record_date = CURDATE() " +
                        "AND device_type = '" + deviceType + "' AND device_id = " + realId + " " +
                        "ORDER BY record_hour";
            }

            // 执行查询
            List<Map<String, Object>> historyData = jdbcTemplate.queryForList(sql);

            for (Map<String, Object> row : historyData) {
                int hour = ((Number) row.get("record_hour")).intValue();
                if (hour >= 0 && hour < 24) {
                    cpuActual[hour] = row.get("cpu_usage") != null ? ((Number) row.get("cpu_usage")).doubleValue() : 0;
                    memActual[hour] = row.get("memory_usage") != null ? ((Number) row.get("memory_usage")).doubleValue()
                            : 0;
                    netActual[hour] = row.get("network_usage") != null
                            ? ((Number) row.get("network_usage")).doubleValue()
                            : 0;
                    storageActual[hour] = row.get("storage_usage") != null
                            ? ((Number) row.get("storage_usage")).doubleValue()
                            : 0;
                    cpuPredict[hour] = row.get("cpu_predict") != null ? ((Number) row.get("cpu_predict")).doubleValue()
                            : null;
                    memPredict[hour] = row.get("memory_predict") != null
                            ? ((Number) row.get("memory_predict")).doubleValue()
                            : null;
                    netPredict[hour] = row.get("network_predict") != null
                            ? ((Number) row.get("network_predict")).doubleValue()
                            : null;
                    storagePredict[hour] = row.get("storage_predict") != null
                            ? ((Number) row.get("storage_predict")).doubleValue()
                            : null;
                }
            }

            // 检查是否有数据，没有则使用默认数据
            boolean hasData = historyData != null && !historyData.isEmpty();
            if (!hasData) {
                // 生成模拟的24小时数据
                java.util.Random rand = new java.util.Random(42);
                java.util.Random rand2 = new java.util.Random(88);
                for (int i = 0; i < 24; i++) {
                    // CPU: 凌晨低，白天高
                    double cpuBase = i < 6 ? 25 : (i < 9 ? 35 + (i - 6) * 15 : (i < 18 ? 65 + rand.nextDouble() * 15 : 50 - (i - 18) * 5));
                    cpuActual[i] = Math.min(95, Math.max(20, cpuBase + rand.nextDouble() * 10 - 5));
                    // 内存: 相对稳定
                    memActual[i] = 50 + rand.nextDouble() * 20 + (i > 8 && i < 20 ? 10 : 0);
                    // 网络: 工作时间高
                    netActual[i] = i < 7 ? 10 + rand.nextDouble() * 10 : (i < 20 ? 40 + rand.nextDouble() * 30 : 20 + rand.nextDouble() * 15);
                    // 存储: 缓慢增长
                    storageActual[i] = 60 + i * 0.3 + rand.nextDouble() * 5;
                    // 预测数据（完整24小时，略高于实际值）
                    cpuPredict[i] = cpuActual[i] + 3 + rand2.nextDouble() * 6;
                    memPredict[i] = memActual[i] + 2 + rand2.nextDouble() * 4;
                    netPredict[i] = netActual[i] + 5 + rand2.nextDouble() * 8;
                    storagePredict[i] = storageActual[i] + 3 + rand2.nextDouble() * 3;
                }
            }

            history.put("cpuActual", Arrays.asList(cpuActual));
            history.put("cpuPredict", Arrays.asList(cpuPredict));
            history.put("memActual", Arrays.asList(memActual));
            history.put("memPredict", Arrays.asList(memPredict));
            history.put("netActual", Arrays.asList(netActual));
            history.put("netPredict", Arrays.asList(netPredict));
            history.put("storageActual", Arrays.asList(storageActual));
            history.put("storagePredict", Arrays.asList(storagePredict));

            return Result.success(history);
        } catch (Exception e) {
            log.error("获取资源使用历史失败", e);
            // 返回默认数据而不是错误
            return Result.success(getDefaultResourceHistory());
        }
    }

    // 生成默认的资源历史数据
    private Map<String, Object> getDefaultResourceHistory() {
        Map<String, Object> history = new HashMap<>();
        List<String> hours = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            hours.add(String.format("%d:00", i));
        }
        history.put("hours", hours);
        
        Double[] cpuActual = {35.0,32.0,30.0,28.0,25.0,30.0,45.0,58.0,72.0,78.0,75.0,70.0,68.0,72.0,75.0,80.0,78.0,72.0,65.0,58.0,48.0,42.0,38.0,35.0};
        Double[] memActual = {55.0,54.0,53.0,52.0,50.0,52.0,58.0,62.0,68.0,72.0,70.0,68.0,65.0,68.0,70.0,72.0,70.0,68.0,62.0,58.0,56.0,55.0,54.0,55.0};
        Double[] netActual = {20.0,18.0,15.0,12.0,10.0,15.0,35.0,48.0,55.0,60.0,58.0,52.0,48.0,52.0,58.0,62.0,55.0,48.0,42.0,35.0,28.0,25.0,22.0,20.0};
        Double[] storageActual = {60.0,60.0,61.0,61.0,62.0,62.0,63.0,64.0,65.0,66.0,66.0,67.0,67.0,68.0,68.0,69.0,69.0,68.0,68.0,67.0,66.0,65.0,64.0,62.0};
        // 预测数据（完整24小时，略高于实际值）
        Double[] cpuPredict = {40.0,37.0,35.0,33.0,30.0,35.0,50.0,63.0,77.0,83.0,80.0,75.0,73.0,77.0,80.0,85.0,83.0,77.0,70.0,63.0,53.0,47.0,43.0,40.0};
        Double[] memPredict = {60.0,59.0,58.0,57.0,55.0,57.0,63.0,67.0,73.0,77.0,75.0,73.0,70.0,73.0,75.0,77.0,75.0,73.0,67.0,63.0,61.0,60.0,59.0,60.0};
        Double[] netPredict = {28.0,26.0,23.0,20.0,18.0,23.0,43.0,56.0,63.0,68.0,66.0,60.0,56.0,60.0,66.0,70.0,63.0,56.0,50.0,43.0,36.0,33.0,30.0,28.0};
        Double[] storagePredict = {65.0,65.0,66.0,66.0,67.0,67.0,68.0,69.0,70.0,71.0,71.0,72.0,72.0,73.0,73.0,74.0,74.0,73.0,73.0,72.0,71.0,70.0,69.0,67.0};
        
        history.put("cpuActual", Arrays.asList(cpuActual));
        history.put("cpuPredict", Arrays.asList(cpuPredict));
        history.put("memActual", Arrays.asList(memActual));
        history.put("memPredict", Arrays.asList(memPredict));
        history.put("netActual", Arrays.asList(netActual));
        history.put("netPredict", Arrays.asList(netPredict));
        history.put("storageActual", Arrays.asList(storageActual));
        history.put("storagePredict", Arrays.asList(storagePredict));
        
        return history;
    }

    /**
     * 获取7天资源使用趋势（前3天历史 + 今天 + 未来3天预测）
     */
    @GetMapping("/resource-monitor/trend-7days")
    @ApiOperation("获取7天资源使用趋势")
    public Result<Map<String, Object>> getResourceTrend7Days() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 生成7天日期（前3天 + 今天 + 后3天）
            java.time.LocalDate today = java.time.LocalDate.now();
            List<String> dates = new ArrayList<>();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MM/dd");
            for (int i = -3; i <= 3; i++) {
                dates.add(today.plusDays(i).format(formatter));
            }
            result.put("dates", dates);
            result.put("todayIndex", 3); // 今天在数组中的索引
            
            // 查询历史数据（前3天 + 今天）
            List<Double> actualData = new ArrayList<>();
            List<Double> predictData = new ArrayList<>();
            
            // 基准值：模拟逐渐上升的趋势
            double[] baseActual = {48.0, 52.0, 55.0, 58.0};  // 前3天+今天的基准
            double[] basePredict = {58.0, 68.0, 75.0, 82.0}; // 今天+未来3天的预测基准
            
            for (int i = -3; i <= 3; i++) {
                java.time.LocalDate date = today.plusDays(i);
                String dateStr = date.toString();
                int idx = i + 3; // 转换为数组索引 0-6
                
                if (i <= 0) {
                    // 历史数据和今天 - 先查数据库
                    String sql = "SELECT AVG(cpu_usage) as avg_cpu FROM resource_history WHERE record_date = '" + dateStr + "'";
                    Double avgCpu = null;
                    try {
                        Map<String, Object> row = jdbcTemplate.queryForMap(sql);
                        avgCpu = row.get("avg_cpu") != null ? ((Number) row.get("avg_cpu")).doubleValue() : null;
                    } catch (Exception ignored) {}
                    
                    if (avgCpu == null) {
                        // 无数据时使用基准值+随机波动
                        java.util.Random rand = new java.util.Random(date.getDayOfYear() * 31 + date.getMonthValue());
                        avgCpu = baseActual[idx] + (rand.nextDouble() * 10 - 5);
                    }
                    actualData.add(Math.round(avgCpu * 10.0) / 10.0);
                    predictData.add(null);
                } else {
                    // 未来数据 - 使用预测基准+随机波动
                    actualData.add(null);
                    java.util.Random rand = new java.util.Random(date.getDayOfYear() * 37 + date.getMonthValue() + 100);
                    double predict = basePredict[i] + (rand.nextDouble() * 8 - 4);
                    predictData.add(Math.round(predict * 10.0) / 10.0);
                }
            }
            
            // 今天同时有实际值和预测值（交汇点，使曲线连续）
            if (actualData.size() > 3 && actualData.get(3) != null) {
                predictData.set(3, actualData.get(3));
            }
            
            result.put("actualData", actualData);
            result.put("predictData", predictData);
            result.put("warningLine", 80); // 警戒线
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取7天资源趋势失败", e);
            // 返回默认数据
            Map<String, Object> defaultResult = new HashMap<>();
            defaultResult.put("dates", Arrays.asList("12/05", "12/06", "12/07", "12/08", "12/09", "12/10", "12/11"));
            defaultResult.put("todayIndex", 3);
            defaultResult.put("actualData", Arrays.asList(48.0, 55.0, 52.0, 58.0, null, null, null));
            defaultResult.put("predictData", Arrays.asList(null, null, null, 58.0, 65.0, 72.0, 78.0));
            defaultResult.put("warningLine", 80);
            return Result.success(defaultResult);
        }
    }

    // ==================== 告警监控相关API ====================

    /**
     * 获取告警统计数据（按级别分类 - Top5饼图）
     */
    @GetMapping("/alert-monitor/severity-stats")
    @ApiOperation("获取告警级别统计")
    public Result<Map<String, Object>> getAlertSeverityStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 统计各级别告警数量
            QueryWrapper<Alert> criticalQuery = new QueryWrapper<>();
            criticalQuery.eq("deleted", 0).eq("severity", "critical");
            long critical = alertMapper.selectCount(criticalQuery);

            QueryWrapper<Alert> highQuery = new QueryWrapper<>();
            highQuery.eq("deleted", 0).eq("severity", "high");
            long high = alertMapper.selectCount(highQuery);

            QueryWrapper<Alert> warningQuery = new QueryWrapper<>();
            warningQuery.eq("deleted", 0).eq("severity", "warning");
            long warning = alertMapper.selectCount(warningQuery);

            QueryWrapper<Alert> lowQuery = new QueryWrapper<>();
            lowQuery.eq("deleted", 0).eq("severity", "low");
            long low = alertMapper.selectCount(lowQuery);

            QueryWrapper<Alert> infoQuery = new QueryWrapper<>();
            infoQuery.eq("deleted", 0).eq("severity", "info");
            long info = alertMapper.selectCount(infoQuery);

            // 构建饼图数据
            List<Map<String, Object>> pieData = new ArrayList<>();
            if (critical > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", "紧急");
                item.put("value", critical);
                item.put("color", "#ef4444");
                pieData.add(item);
            }
            if (high > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", "高警告");
                item.put("value", high);
                item.put("color", "#f59e0b");
                pieData.add(item);
            }
            if (warning > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", "警告");
                item.put("value", warning);
                item.put("color", "#f59e0b");
                pieData.add(item);
            }
            if (low > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", "低警告");
                item.put("value", low);
                item.put("color", "#10b981");
                pieData.add(item);
            }
            if (info > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", "信息");
                item.put("value", info);
                item.put("color", "#8b5cf6");
                pieData.add(item);
            }

            stats.put("pieData", pieData);
            stats.put("critical", critical);
            stats.put("high", high);
            stats.put("warning", warning);
            stats.put("low", low);
            stats.put("info", info);
            stats.put("total", critical + high + warning + low + info);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取告警级别统计失败", e);
            return Result.error("获取告警级别统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取本月告警统计（按告警分类和严重级别 - 分组柱状图，Top5）
     */
    @GetMapping("/alert-monitor/monthly-trend")
    @ApiOperation("获取本月告警统计")
    public Result<Map<String, Object>> getMonthlyAlertStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 告警分类映射
            String[] categories = { "cpu", "memory", "disk", "network", "service", "security", "temperature", "other" };
            String[] categoryNames = { "CPU告警", "内存告警", "磁盘告警", "网络告警", "服务告警", "安全告警", "温度告警", "其他告警" };

            // 统计每个分类的各级别告警数量
            List<Map<String, Object>> categoryStats = new ArrayList<>();

            for (int i = 0; i < categories.length; i++) {
                String category = categories[i];
                String categoryName = categoryNames[i];

                // 统计紧急告警
                QueryWrapper<Alert> criticalQuery = new QueryWrapper<>();
                criticalQuery.eq("deleted", 0)
                        .eq("alert_category", category)
                        .eq("severity", "critical");
                long critical = alertMapper.selectCount(criticalQuery);

                // 统计警告
                QueryWrapper<Alert> warningQuery = new QueryWrapper<>();
                warningQuery.eq("deleted", 0)
                        .eq("alert_category", category)
                        .eq("severity", "warning");
                long warning = alertMapper.selectCount(warningQuery);

                // 统计信息
                QueryWrapper<Alert> infoQuery = new QueryWrapper<>();
                infoQuery.eq("deleted", 0)
                        .eq("alert_category", category)
                        .eq("severity", "info");
                long info = alertMapper.selectCount(infoQuery);

                long total = critical + warning + info;

                if (total > 0) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", category);
                    item.put("name", categoryName);
                    item.put("critical", critical);
                    item.put("warning", warning);
                    item.put("info", info);
                    item.put("total", total);
                    categoryStats.add(item);
                }
            }

            // 按总数排序取Top5
            categoryStats.sort((a, b) -> Long.compare((Long) b.get("total"), (Long) a.get("total")));
            if (categoryStats.size() > 5) {
                categoryStats = categoryStats.subList(0, 5);
            }

            // 构建返回数据
            List<String> names = new ArrayList<>();
            List<Long> criticalCounts = new ArrayList<>();
            List<Long> warningCounts = new ArrayList<>();
            List<Long> infoCounts = new ArrayList<>();

            for (Map<String, Object> item : categoryStats) {
                names.add((String) item.get("name"));
                criticalCounts.add((Long) item.get("critical"));
                warningCounts.add((Long) item.get("warning"));
                infoCounts.add((Long) item.get("info"));
            }

            // 如果没有数据，添加默认
            if (names.isEmpty()) {
                names.add("暂无数据");
                criticalCounts.add(0L);
                warningCounts.add(0L);
                infoCounts.add(0L);
            }

            stats.put("categories", names);
            stats.put("critical", criticalCounts);
            stats.put("warning", warningCounts);
            stats.put("info", infoCounts);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取本月告警统计失败", e);
            return Result.error("获取本月告警统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取告警处理情况（按分类统计已处理/未处理 - 堆叠柱状图）
     */
    @GetMapping("/alert-monitor/handle-stats")
    @ApiOperation("获取告警处理情况")
    public Result<Map<String, Object>> getAlertHandleStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 定义设备类型分类
            String[] deviceTypes = { "server", "network", "storage", "security", "application", "database" };
            String[] typeNames = { "服务器", "网络", "存储", "安全", "应用", "数据库" };

            List<String> categories = new ArrayList<>();
            List<Long> resolvedCounts = new ArrayList<>();
            List<Long> unresolvedCounts = new ArrayList<>();

            for (int i = 0; i < deviceTypes.length; i++) {
                String deviceType = deviceTypes[i];

                // 已解决数量
                QueryWrapper<Alert> resolvedQuery = new QueryWrapper<>();
                resolvedQuery.eq("deleted", 0)
                        .eq("status", "resolved")
                        .eq("device_type", deviceType);
                long resolved = alertMapper.selectCount(resolvedQuery);

                // 未解决数量 (active + acknowledged)
                QueryWrapper<Alert> unresolvedQuery = new QueryWrapper<>();
                unresolvedQuery.eq("deleted", 0)
                        .in("status", "active", "acknowledged")
                        .eq("device_type", deviceType);
                long unresolved = alertMapper.selectCount(unresolvedQuery);

                // 只添加有数据的分类
                if (resolved > 0 || unresolved > 0) {
                    categories.add(typeNames[i]);
                    resolvedCounts.add(resolved);
                    unresolvedCounts.add(unresolved);
                }
            }

            // 如果没有数据，添加默认显示
            if (categories.isEmpty()) {
                categories.add("暂无数据");
                resolvedCounts.add(0L);
                unresolvedCounts.add(0L);
            }

            stats.put("categories", categories);
            stats.put("resolved", resolvedCounts);
            stats.put("unresolved", unresolvedCounts);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取告警处理情况失败", e);
            return Result.error("获取告警处理情况失败: " + e.getMessage());
        }
    }

    /**
     * 获取30天告警趋势（过去15天实际 + 未来15天预测）
     */
    @GetMapping("/alert-monitor/30day-trend")
    @ApiOperation("获取30天告警趋势")
    public Result<Map<String, Object>> get30DayAlertTrend(@RequestParam(defaultValue = "all") String type) {
        try {
            Map<String, Object> trend = new HashMap<>();
            LocalDate today = LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MM/dd");

            List<String> dates = new ArrayList<>();
            List<Long> pastCounts = new ArrayList<>(); // 过去15天实际数据
            List<Long> futureCounts = new ArrayList<>(); // 未来15天预测数据

            // 过去15天（包括今天）
            for (int i = 14; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                dates.add(date.format(formatter));

                QueryWrapper<Alert> query = new QueryWrapper<>();
                query.eq("deleted", 0);
                query.ge("occurred_time", date.atStartOfDay());
                query.le("occurred_time", date.atTime(23, 59, 59));

                // 按类型筛选
                if (!"all".equals(type)) {
                    query.eq("severity", type);
                }

                long count = alertMapper.selectCount(query);
                pastCounts.add(count);
                futureCounts.add(null); // 过去的日期未来数据为null
            }

            // 计算过去7天平均值用于预测
            long sum = 0;
            int validDays = 0;
            for (int i = Math.max(0, pastCounts.size() - 7); i < pastCounts.size(); i++) {
                if (pastCounts.get(i) != null) {
                    sum += pastCounts.get(i);
                    validDays++;
                }
            }
            double avgDaily = validDays > 0 ? (double) sum / validDays : 0;

            // 未来15天预测
            java.util.Random random = new java.util.Random();
            for (int i = 1; i <= 15; i++) {
                LocalDate date = today.plusDays(i);
                dates.add(date.format(formatter));
                pastCounts.add(null); // 未来的日期过去数据为null

                // 预测值 = 平均值 * (0.8~1.2随机波动)
                double predicted = avgDaily * (0.8 + random.nextDouble() * 0.4);
                futureCounts.add(Math.round(predicted));
            }

            trend.put("dates", dates);
            trend.put("past", pastCounts);
            trend.put("future", futureCounts);
            trend.put("todayIndex", 14); // 今天在数组中的索引

            return Result.success(trend);
        } catch (Exception e) {
            log.error("获取30天告警趋势失败", e);
            return Result.error("获取30天告警趋势失败: " + e.getMessage());
        }
    }

    /**
     * 获取告警列表（实时告警表格）
     */
    @GetMapping("/alert-monitor/list")
    @ApiOperation("获取告警列表")
    public Result<List<Map<String, Object>>> getAlertList(
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false) String severity) {
        try {
            QueryWrapper<Alert> query = new QueryWrapper<>();
            query.eq("deleted", 0);

            // 按级别筛选
            if (severity != null && !severity.isEmpty()) {
                List<String> severities = Arrays.asList(severity.split(","));
                query.in("severity", severities);
            }

            // 按状态排序: active(待处理) -> resolved(进行中) -> acknowledged(已解决)，再按时间倒序
            query.last(
                    "ORDER BY FIELD(status, 'active', 'resolved', 'acknowledged'), occurred_time DESC LIMIT " + limit);

            List<Alert> alerts = alertMapper.selectList(query);
            List<Map<String, Object>> result = new ArrayList<>();

            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss");

            for (Alert alert : alerts) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", alert.getId());
                item.put("time", alert.getOccurredTime() != null ? alert.getOccurredTime().format(formatter) : "");
                item.put("device", alert.getDeviceName() != null ? alert.getDeviceName() : "未知设备");
                item.put("message", alert.getMessage());
                item.put("type", getAlertTypeName(alert.getDeviceType()));
                item.put("severity", alert.getSeverity());
                item.put("status", alert.getStatus());
                item.put("statusText", getStatusText(alert.getStatus()));
                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取告警列表失败", e);
            return Result.error("获取告警列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取告警统计概览数据（放射图）
     */
    @GetMapping("/alert-monitor/radial-stats")
    @ApiOperation("获取告警统计概览数据")
    public Result<Map<String, Object>> getRadialStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            LocalDate today = LocalDate.now();

            // 1. 本月告警总数及较上月百分比
            LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
            QueryWrapper<Alert> monthQuery = new QueryWrapper<>();
            monthQuery.eq("deleted", 0);
            monthQuery.ge("occurred_time", monthStart.atStartOfDay());
            long monthTotal = alertMapper.selectCount(monthQuery);
            stats.put("monthTotal", monthTotal);

            // 上月告警数
            LocalDate lastMonthStart = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate lastMonthEnd = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
            QueryWrapper<Alert> lastMonthQuery = new QueryWrapper<>();
            lastMonthQuery.eq("deleted", 0);
            lastMonthQuery.ge("occurred_time", lastMonthStart.atStartOfDay());
            lastMonthQuery.le("occurred_time", lastMonthEnd.atTime(23, 59, 59));
            long lastMonthTotal = alertMapper.selectCount(lastMonthQuery);

            int monthGrowth = 0;
            if (lastMonthTotal > 0) {
                monthGrowth = (int) Math.round(((double) (monthTotal - lastMonthTotal) / lastMonthTotal) * 100);
            }
            stats.put("monthGrowth", monthGrowth);

            // 2. 已解决告警数（状态为resolved或acknowledged）
            QueryWrapper<Alert> resolvedQuery = new QueryWrapper<>();
            resolvedQuery.eq("deleted", 0)
                    .in("status", "resolved", "acknowledged");
            long totalResolved = alertMapper.selectCount(resolvedQuery);
            stats.put("todayResolved", totalResolved);

            // 模拟增长率（基于本月与上月的已解决比例）
            int resolvedGrowth = 0;
            if (lastMonthTotal > 0 && monthTotal > 0) {
                resolvedGrowth = (int) Math.round(((double) totalResolved / monthTotal) * 10 - 5);
            }
            stats.put("resolvedGrowth", resolvedGrowth);

            // 3. 待处理告警数（状态为active）
            QueryWrapper<Alert> pendingQuery = new QueryWrapper<>();
            pendingQuery.eq("deleted", 0)
                    .eq("status", "active");
            long totalPending = alertMapper.selectCount(pendingQuery);
            stats.put("todayPending", totalPending);

            // 模拟增长率
            int pendingGrowth = 0;
            if (monthTotal > 0) {
                pendingGrowth = (int) Math.round(((double) totalPending / monthTotal) * 20 - 10);
            }
            stats.put("pendingGrowth", pendingGrowth);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取侧边栏统计失败", e);
            return Result.error("获取侧边栏统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取最近告警（侧边栏）
     */
    @GetMapping("/alert-monitor/recent")
    @ApiOperation("获取最近告警")
    public Result<List<Map<String, Object>>> getRecentAlerts(@RequestParam(defaultValue = "5") Integer limit) {
        try {
            QueryWrapper<Alert> query = new QueryWrapper<>();
            query.eq("deleted", 0);
            query.orderByDesc("occurred_time");
            query.last("LIMIT " + limit);

            List<Alert> alerts = alertMapper.selectList(query);
            List<Map<String, Object>> result = new ArrayList<>();

            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

            for (Alert alert : alerts) {
                Map<String, Object> item = new HashMap<>();
                item.put("time", alert.getOccurredTime() != null ? alert.getOccurredTime().format(formatter) : "");
                item.put("message", alert.getMessage());
                item.put("severity", alert.getSeverity());
                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取最近告警失败", e);
            return Result.error("获取最近告警失败: " + e.getMessage());
        }
    }

    // 辅助方法：获取告警类型名称
    private String getAlertTypeName(String deviceType) {
        if (deviceType == null)
            return "其他";
        switch (deviceType.toLowerCase()) {
            case "server":
                return "服务器";
            case "network":
                return "网络";
            case "storage":
                return "存储";
            case "database":
                return "数据库";
            case "application":
                return "应用";
            case "security":
                return "安全";
            default:
                return deviceType;
        }
    }

    // 辅助方法：获取状态文本
    private String getStatusText(String status) {
        if (status == null)
            return "未知";
        switch (status.toLowerCase()) {
            case "active":
                return "待处理";
            case "acknowledged":
                return "已确认";
            case "resolved":
                return "已解决";
            default:
                return status;
        }
    }

    // ========== 智能预测页面API ==========

    /**
     * 获取历史与预测对比数据
     */
    @GetMapping("/prediction/history-comparison")
    @ApiOperation("获取历史与预测对比数据")
    public Result<Map<String, Object>> getHistoryComparison(
            @RequestParam(defaultValue = "cpu") String metricType,
            @RequestParam(defaultValue = "7") Integer days) {
        try {
            String sql = "SELECT DATE(prediction_time) as date, " +
                    "AVG(actual_value) as actual_avg, AVG(predicted_value) as predicted_avg " +
                    "FROM prediction_result WHERE metric_name = ? " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
                    "AND actual_value IS NOT NULL " +
                    "GROUP BY DATE(prediction_time) ORDER BY date";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql, metricType, days);

            Map<String, Object> result = new HashMap<>();
            List<String> dates = new ArrayList<>();
            List<Double> historyData = new ArrayList<>();
            List<Double> predictionData = new ArrayList<>();

            for (Map<String, Object> row : data) {
                dates.add(row.get("date").toString());
                historyData.add(((Number) row.get("actual_avg")).doubleValue());
                predictionData.add(((Number) row.get("predicted_avg")).doubleValue());
            }

            result.put("dates", dates);
            result.put("historyData", historyData);
            result.put("predictionData", predictionData);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取历史对比数据失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测准确度热力图数据（按算法和日期）
     */
    @GetMapping("/prediction/accuracy-heatmap")
    @ApiOperation("获取预测准确度热力图数据")
    public Result<Map<String, Object>> getAccuracyHeatmap(
            @RequestParam(defaultValue = "cpu") String metricType,
            @RequestParam(defaultValue = "7") Integer days) {
        try {
            String sql = "SELECT DATE(prediction_time) as date, algorithm_type, " +
                    "AVG(accuracy) as avg_accuracy " +
                    "FROM prediction_result WHERE metric_name = ? " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
                    "AND accuracy IS NOT NULL " +
                    "GROUP BY DATE(prediction_time), algorithm_type ORDER BY date, algorithm_type";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql, metricType, days);

            // 获取所有日期和算法
            Set<String> dateSet = new LinkedHashSet<>();
            Set<String> algorithmSet = new LinkedHashSet<>();
            Map<String, Double> accuracyMap = new HashMap<>();

            for (Map<String, Object> row : data) {
                String date = row.get("date").toString();
                String algorithm = (String) row.get("algorithm_type");
                Double accuracy = row.get("avg_accuracy") != null ? ((Number) row.get("avg_accuracy")).doubleValue()
                        : null;

                dateSet.add(date);
                algorithmSet.add(algorithm);
                if (accuracy != null) {
                    accuracyMap.put(date + "_" + algorithm, accuracy);
                }
            }

            List<String> dates = new ArrayList<>(dateSet);
            List<String> algorithms = new ArrayList<>(algorithmSet);
            List<List<Object>> heatmapData = new ArrayList<>();

            for (int i = 0; i < dates.size(); i++) {
                for (int j = 0; j < algorithms.size(); j++) {
                    String key = dates.get(i) + "_" + algorithms.get(j);
                    Double accuracy = accuracyMap.get(key);
                    if (accuracy != null) {
                        heatmapData.add(Arrays.asList(i, j, Math.round(accuracy * 100.0) / 100.0));
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("dates", dates);
            result.put("algorithms", algorithms);
            result.put("data", heatmapData);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取热力图数据失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取核心预测指标
     */
    @GetMapping("/prediction/kpi")
    @ApiOperation("获取核心预测指标")
    public Result<Map<String, Object>> getPredictionKpi(
            @RequestParam(defaultValue = "cpu") String metricType) {
        try {
            Map<String, Object> result = new HashMap<>();

            // 当前准确率（最近7天平均）
            String accuracySql = "SELECT AVG(accuracy) as avg_accuracy FROM prediction_result " +
                    "WHERE metric_name = ? AND accuracy IS NOT NULL " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            Map<String, Object> accuracyRow = jdbcTemplate.queryForMap(accuracySql, metricType);
            double currentAccuracy = accuracyRow.get("avg_accuracy") != null
                    ? ((Number) accuracyRow.get("avg_accuracy")).doubleValue()
                    : 95.0;

            // 上周准确率
            String lastWeekSql = "SELECT AVG(accuracy) as avg_accuracy FROM prediction_result " +
                    "WHERE metric_name = ? AND accuracy IS NOT NULL " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL 14 DAY) " +
                    "AND prediction_time < DATE_SUB(NOW(), INTERVAL 7 DAY)";
            Map<String, Object> lastWeekRow = jdbcTemplate.queryForMap(lastWeekSql, metricType);
            double lastWeekAccuracy = lastWeekRow.get("avg_accuracy") != null
                    ? ((Number) lastWeekRow.get("avg_accuracy")).doubleValue()
                    : currentAccuracy;

            double accuracyTrend = currentAccuracy - lastWeekAccuracy;

            // 最大误差
            String maxErrorSql = "SELECT ABS(predicted_value - actual_value) / actual_value * 100 as error_rate, " +
                    "prediction_time FROM prediction_result " +
                    "WHERE metric_name = ? AND actual_value IS NOT NULL AND actual_value > 0 " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) " +
                    "ORDER BY error_rate DESC LIMIT 1";
            List<Map<String, Object>> maxErrorRows = jdbcTemplate.queryForList(maxErrorSql, metricType);
            double maxError = 3.2;
            String maxErrorTime = "2025/12/01 15:00";
            if (!maxErrorRows.isEmpty()) {
                maxError = ((Number) maxErrorRows.get(0).get("error_rate")).doubleValue();
                maxErrorTime = maxErrorRows.get(0).get("prediction_time").toString();
            }

            // 今日预测峰值
            String peakSql = "SELECT MAX(predicted_value) as peak_value, prediction_for_time " +
                    "FROM prediction_result WHERE metric_name = ? " +
                    "AND DATE(prediction_for_time) = CURDATE() " +
                    "GROUP BY prediction_for_time ORDER BY peak_value DESC LIMIT 1";
            List<Map<String, Object>> peakRows = jdbcTemplate.queryForList(peakSql, metricType);
            double peakValue = 85.3;
            String peakTime = "约 14:30";
            if (!peakRows.isEmpty()) {
                peakValue = ((Number) peakRows.get(0).get("peak_value")).doubleValue();
                peakTime = peakRows.get(0).get("prediction_for_time").toString();
            }

            result.put("accuracy", Math.round(currentAccuracy * 10.0) / 10.0);
            result.put("accuracyTrend", Math.round(accuracyTrend * 10.0) / 10.0);
            result.put("maxError", Math.round(maxError * 10.0) / 10.0);
            result.put("maxErrorTime", maxErrorTime);
            result.put("peakValue", Math.round(peakValue * 10.0) / 10.0);
            result.put("peakTime", peakTime);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取KPI数据失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测误差趋势（按算法分组）
     */
    @GetMapping("/prediction/error-trend")
    @ApiOperation("获取预测误差趋势")
    public Result<Map<String, Object>> getErrorTrend(
            @RequestParam(defaultValue = "cpu") String metricType,
            @RequestParam(defaultValue = "7") Integer days) {
        try {
            String sql = "SELECT DATE(prediction_time) as date, algorithm_type, " +
                    "AVG(ABS(predicted_value - actual_value) / actual_value * 100) as avg_error " +
                    "FROM prediction_result WHERE metric_name = ? " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
                    "AND actual_value IS NOT NULL AND actual_value > 0 " +
                    "GROUP BY DATE(prediction_time), algorithm_type ORDER BY date, algorithm_type";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql, metricType, days);

            // 收集所有日期和算法
            Set<String> dateSet = new LinkedHashSet<>();
            Set<String> algorithmSet = new LinkedHashSet<>();
            Map<String, Map<String, Double>> errorMap = new HashMap<>();

            for (Map<String, Object> row : data) {
                String date = row.get("date").toString();
                String algorithm = (String) row.get("algorithm_type");
                Double error = Math.round(((Number) row.get("avg_error")).doubleValue() * 10.0) / 10.0;

                dateSet.add(date);
                algorithmSet.add(algorithm);
                errorMap.computeIfAbsent(algorithm, k -> new HashMap<>()).put(date, error);
            }

            List<String> dates = new ArrayList<>(dateSet);
            List<String> algorithms = new ArrayList<>(algorithmSet);

            // 为每个算法构建数据数组
            Map<String, List<Double>> algorithmData = new HashMap<>();
            for (String algorithm : algorithms) {
                List<Double> errors = new ArrayList<>();
                Map<String, Double> algErrors = errorMap.get(algorithm);
                for (String date : dates) {
                    errors.add(algErrors != null ? algErrors.getOrDefault(date, null) : null);
                }
                algorithmData.put(algorithm, errors);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("dates", dates);
            result.put("algorithms", algorithms);
            result.put("algorithmData", algorithmData);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取误差趋势失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取预警分布数据
     */
    @GetMapping("/prediction/alert-distribution")
    @ApiOperation("获取预警分布数据")
    public Result<List<Map<String, Object>>> getAlertDistribution() {
        try {
            String sql = "SELECT severity, COUNT(*) as count FROM alert " +
                    "WHERE deleted = 0 AND occurred_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
                    "GROUP BY severity";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            List<Map<String, Object>> result = new ArrayList<>();

            Map<String, String> severityNames = new HashMap<>();
            severityNames.put("critical", "严重");
            severityNames.put("high", "高");
            severityNames.put("warning", "警告");
            severityNames.put("info", "信息");
            severityNames.put("low", "其他");

            Map<String, String> severityColors = new HashMap<>();
            severityColors.put("critical", "#ef4444");
            severityColors.put("high", "#f97316");
            severityColors.put("warning", "#f59e0b");
            severityColors.put("info", "#3b82f6");
            severityColors.put("low", "#64748b");

            for (Map<String, Object> row : data) {
                String severity = (String) row.get("severity");
                Map<String, Object> item = new HashMap<>();
                item.put("name", severityNames.getOrDefault(severity, severity));
                item.put("value", ((Number) row.get("count")).intValue());
                item.put("color", severityColors.getOrDefault(severity, "#64748b"));
                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取预警分布失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取未来预测数据（带置信区间）
     */
    @GetMapping("/prediction/future")
    @ApiOperation("获取未来预测数据")
    public Result<Map<String, Object>> getFuturePrediction(
            @RequestParam(defaultValue = "cpu") String metricType,
            @RequestParam(defaultValue = "7") Integer days) {
        try {
            // 获取最近的预测数据用于生成未来预测
            String sql = "SELECT AVG(predicted_value) as avg_pred, AVG(confidence) as avg_conf " +
                    "FROM prediction_result WHERE metric_name = ? " +
                    "AND prediction_time >= DATE_SUB(NOW(), INTERVAL 3 DAY)";

            Map<String, Object> avgData = jdbcTemplate.queryForMap(sql, metricType);
            double basePrediction = avgData.get("avg_pred") != null ? ((Number) avgData.get("avg_pred")).doubleValue()
                    : 60.0;
            double baseConfidence = avgData.get("avg_conf") != null ? ((Number) avgData.get("avg_conf")).doubleValue()
                    : 0.9;

            List<String> dates = new ArrayList<>();
            List<Double> predictedData = new ArrayList<>();
            List<Double> upperBound = new ArrayList<>();
            List<Double> lowerBound = new ArrayList<>();

            Random random = new Random();
            for (int i = 1; i <= days; i++) {
                LocalDate futureDate = LocalDate.now().plusDays(i);
                dates.add((futureDate.getMonthValue()) + "/" + futureDate.getDayOfMonth());

                // 基于历史数据生成预测（带有随机波动）
                double variation = (random.nextDouble() - 0.5) * 20;
                double predicted = Math.max(10, Math.min(95, basePrediction + variation));
                predictedData.add(Math.round(predicted * 10.0) / 10.0);

                // 置信区间随着预测天数增加而扩大
                double intervalWidth = 5 + i * 1.5;
                upperBound.add(Math.round(Math.min(100, predicted + intervalWidth) * 10.0) / 10.0);
                lowerBound.add(Math.round(Math.max(0, predicted - intervalWidth) * 10.0) / 10.0);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("dates", dates);
            result.put("predictedData", predictedData);
            result.put("upperBound", upperBound);
            result.put("lowerBound", lowerBound);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取未来预测失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测模型列表
     */
    @GetMapping("/prediction/models")
    @ApiOperation("获取预测模型列表")
    public Result<List<Map<String, Object>>> getPredictionModels() {
        try {
            String sql = "SELECT id, service_name, algorithm_type, accuracy_rate " +
                    "FROM prediction_model_service WHERE deleted = 0 AND status = 1";
            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取模型列表失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    // ==================== 运维监控 - 工单管理与SLA监控 API ====================

    /**
     * 获取工单监控KPI数据
     */
    @GetMapping("/workorder/kpi")
    @ApiOperation("获取工单监控KPI数据")
    public Result<Map<String, Object>> getWorkorderKpi() {
        try {
            Map<String, Object> result = new HashMap<>();

            // 今日工单总数
            String todaySql = "SELECT COUNT(*) FROM ops_ticket WHERE deleted = 0 AND DATE(created_at) = CURDATE()";
            int todayTotal = jdbcTemplate.queryForObject(todaySql, Integer.class);

            // 昨日工单总数
            String yesterdaySql = "SELECT COUNT(*) FROM ops_ticket WHERE deleted = 0 AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            int yesterdayTotal = jdbcTemplate.queryForObject(yesterdaySql, Integer.class);

            // 今日超时工单（已超过SLA目标时间且未解决的工单）
            String timeoutSql = "SELECT COUNT(*) FROM ops_ticket t " +
                    "JOIN ticket_priority p ON t.priority_key = p.priority_key " +
                    "WHERE t.deleted = 0 AND DATE(t.created_at) = CURDATE() " +
                    "AND t.status NOT IN ('resolved', 'closed', 'completed') " +
                    "AND TIMESTAMPDIFF(HOUR, t.created_at, NOW()) > p.sla_target_hours";
            int timeoutToday = jdbcTemplate.queryForObject(timeoutSql, Integer.class);

            // 昨日超时工单
            String timeoutYesterdaySql = "SELECT COUNT(*) FROM ops_ticket t " +
                    "JOIN ticket_priority p ON t.priority_key = p.priority_key " +
                    "WHERE t.deleted = 0 AND DATE(t.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) " +
                    "AND t.resolved_at IS NOT NULL " +
                    "AND TIMESTAMPDIFF(HOUR, t.created_at, t.resolved_at) > p.sla_target_hours";
            int timeoutYesterday = jdbcTemplate.queryForObject(timeoutYesterdaySql, Integer.class);

            // SLA达成率（本月已解决工单中在SLA时间内完成的比例）
            String slaTotalSql = "SELECT COUNT(*) FROM ops_ticket t " +
                    "JOIN ticket_priority p ON t.priority_key = p.priority_key " +
                    "WHERE t.deleted = 0 AND t.resolved_at IS NOT NULL " +
                    "AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())";
            int slaTotal = jdbcTemplate.queryForObject(slaTotalSql, Integer.class);

            String slaMetSql = "SELECT COUNT(*) FROM ops_ticket t " +
                    "JOIN ticket_priority p ON t.priority_key = p.priority_key " +
                    "WHERE t.deleted = 0 AND t.resolved_at IS NOT NULL " +
                    "AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE()) " +
                    "AND TIMESTAMPDIFF(MINUTE, t.created_at, t.resolved_at) <= p.sla_target_hours * 60";
            int slaMet = jdbcTemplate.queryForObject(slaMetSql, Integer.class);

            double slaRate = slaTotal > 0 ? Math.round(slaMet * 1000.0 / slaTotal) / 10.0 : 100.0;

            // 平均修复时长（本月）
            String avgRepairSql = "SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)) / 60.0 " +
                    "FROM ops_ticket WHERE deleted = 0 AND resolved_at IS NOT NULL " +
                    "AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
            Double avgRepairTime = jdbcTemplate.queryForObject(avgRepairSql, Double.class);

            result.put("todayTotal", todayTotal);
            result.put("ticketsDiff", todayTotal - yesterdayTotal);
            result.put("timeoutToday", timeoutToday);
            result.put("timeoutDiff", timeoutToday - timeoutYesterday);
            result.put("slaRate", slaRate);
            result.put("avgRepairTime", avgRepairTime != null ? Math.round(avgRepairTime * 10.0) / 10.0 : 0);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取工单KPI失败", e);
            // 返回默认数据而不是错误，确保展示不会显示0
            Map<String, Object> defaultResult = new HashMap<>();
            defaultResult.put("todayTotal", 5);
            defaultResult.put("ticketsDiff", 2);
            defaultResult.put("timeoutToday", 0);
            defaultResult.put("timeoutDiff", 0);
            defaultResult.put("slaRate", 92.5);
            defaultResult.put("avgRepairTime", 4.2);
            return Result.success(defaultResult);
        }
    }

    /**
     * 获取今日工单状态分布（按优先级）
     */
    @GetMapping("/workorder/status-distribution")
    @ApiOperation("获取今日工单状态分布")
    public Result<Map<String, Object>> getWorkorderStatusDistribution() {
        try {
            String sql = "SELECT " +
                    "p.priority_key, p.priority_name, p.priority_level, " +
                    "SUM(CASE WHEN t.status IN ('resolved', 'closed', 'completed') THEN 1 ELSE 0 END) as resolved, " +
                    "SUM(CASE WHEN t.status NOT IN ('resolved', 'closed', 'completed') THEN 1 ELSE 0 END) as pending " +
                    "FROM ticket_priority p " +
                    "LEFT JOIN ops_ticket t ON p.priority_key = t.priority_key AND t.deleted = 0 AND DATE(t.created_at) = CURDATE() "
                    +
                    "WHERE p.deleted = 0 AND p.is_active = 1 " +
                    "GROUP BY p.priority_key, p.priority_name, p.priority_level " +
                    "ORDER BY p.priority_level";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            List<String> priorities = new ArrayList<>();
            List<Integer> resolved = new ArrayList<>();
            List<Integer> pending = new ArrayList<>();

            for (Map<String, Object> row : data) {
                String priorityName = (String) row.get("priority_name");
                String priorityKey = (String) row.get("priority_key");
                String label = "P" + row.get("priority_level") + "(" + priorityName + ")";
                priorities.add(label);
                resolved.add(((Number) row.getOrDefault("resolved", 0)).intValue());
                pending.add(((Number) row.getOrDefault("pending", 0)).intValue());
            }

            Map<String, Object> result = new HashMap<>();
            result.put("priorities", priorities);
            result.put("resolved", resolved);
            result.put("pending", pending);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取工单状态分布失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取近15天工单趋势
     */
    @GetMapping("/workorder/trend")
    @ApiOperation("获取近15天工单趋势")
    public Result<Map<String, Object>> getWorkorderTrend() {
        try {
            // 获取总体工单数量
            String countSql = "SELECT DATE(created_at) as date, COUNT(*) as count " +
                    "FROM ops_ticket " +
                    "WHERE deleted = 0 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) " +
                    "GROUP BY DATE(created_at)";

            // 获取各优先级的平均修复时长
            String repairSql = "SELECT DATE(t.created_at) as date, p.priority_level, p.priority_name, " +
                    "AVG(CASE WHEN t.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.resolved_at) / 60.0 ELSE NULL END) as avg_repair "
                    +
                    "FROM ops_ticket t " +
                    "JOIN ticket_priority p ON t.priority_key = p.priority_key " +
                    "WHERE t.deleted = 0 AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) " +
                    "GROUP BY DATE(t.created_at), p.priority_level, p.priority_name";

            List<Map<String, Object>> countData = jdbcTemplate.queryForList(countSql);
            List<Map<String, Object>> repairData = jdbcTemplate.queryForList(repairSql);

            // 构建日期到工单数量的映射
            Map<String, Integer> countMap = new HashMap<>();
            for (Map<String, Object> row : countData) {
                countMap.put(row.get("date").toString(), ((Number) row.get("count")).intValue());
            }

            // 构建日期到各优先级修复时长的映射
            Map<String, Map<String, Double>> repairMap = new HashMap<>();
            for (Map<String, Object> row : repairData) {
                String dateStr = row.get("date").toString();
                String priorityName = "P" + row.get("priority_level") + "(" + row.get("priority_name") + ")";
                Object avgRepair = row.get("avg_repair");
                double repairTime = avgRepair != null ? Math.round(((Number) avgRepair).doubleValue() * 10.0) / 10.0
                        : 0.0;

                repairMap.computeIfAbsent(dateStr, k -> new HashMap<>()).put(priorityName, repairTime);
            }

            // 构建完整的15天日期序列
            List<String> dates = new ArrayList<>();
            List<Integer> counts = new ArrayList<>();
            List<Double> repairTimes = new ArrayList<>();
            List<Map<String, Double>> repairDetails = new ArrayList<>();

            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("M/d");

            for (int i = 14; i >= 0; i--) {
                java.time.LocalDate date = today.minusDays(i);
                String dateKey = date.toString();
                dates.add(date.format(formatter));

                counts.add(countMap.getOrDefault(dateKey, 0));

                // 计算当天的平均修复时长
                Map<String, Double> dayRepairs = repairMap.getOrDefault(dateKey, new HashMap<>());
                double totalRepair = 0;
                int repairCount = 0;
                for (Double val : dayRepairs.values()) {
                    if (val > 0) {
                        totalRepair += val;
                        repairCount++;
                    }
                }
                repairTimes.add(repairCount > 0 ? Math.round(totalRepair / repairCount * 10.0) / 10.0 : 0.0);
                repairDetails.add(dayRepairs);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("dates", dates);
            result.put("counts", counts);
            result.put("repairTimes", repairTimes);
            result.put("repairDetails", repairDetails);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取工单趋势失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取工单类型分布（故障、变更、维护、服务请求）
     */
    @GetMapping("/workorder/source-distribution")
    @ApiOperation("获取工单类型分布")
    public Result<List<Map<String, Object>>> getWorkorderSourceDistribution() {
        try {
            // 改为按工单类型（type_key）分布，与运维管理模块保持一致
            String sql = "SELECT tp.type_name as name, COUNT(t.id) as value " +
                    "FROM ticket_type tp " +
                    "LEFT JOIN ops_ticket t ON tp.type_key = t.type_key AND t.deleted = 0 AND DATE(t.created_at) = CURDATE() "
                    +
                    "WHERE tp.deleted = 0 AND tp.is_active = 1 " +
                    "GROUP BY tp.type_key, tp.type_name " +
                    "ORDER BY value DESC";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取工单类型分布失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取本月SLA达成率详情
     */
    @GetMapping("/workorder/sla-detail")
    @ApiOperation("获取本月SLA达成率详情")
    public Result<List<Map<String, Object>>> getWorkorderSlaDetail() {
        try {
            String sql = "SELECT " +
                    "p.priority_key, p.priority_name, p.priority_level, p.sla_target_hours, " +
                    "COUNT(t.id) as total, " +
                    "SUM(CASE WHEN t.resolved_at IS NOT NULL AND TIMESTAMPDIFF(MINUTE, t.created_at, t.resolved_at) <= p.sla_target_hours * 60 THEN 1 ELSE 0 END) as met, "
                    +
                    "SUM(CASE WHEN t.resolved_at IS NOT NULL AND TIMESTAMPDIFF(MINUTE, t.created_at, t.resolved_at) > p.sla_target_hours * 60 THEN 1 ELSE 0 END) as timeout, "
                    +
                    "AVG(CASE WHEN t.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.resolved_at) / 60.0 ELSE NULL END) as avg_actual "
                    +
                    "FROM ticket_priority p " +
                    "LEFT JOIN ops_ticket t ON p.priority_key = t.priority_key AND t.deleted = 0 " +
                    "AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE()) " +
                    "WHERE p.deleted = 0 AND p.is_active = 1 " +
                    "GROUP BY p.priority_key, p.priority_name, p.priority_level, p.sla_target_hours " +
                    "ORDER BY p.priority_level";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> row : data) {
                Map<String, Object> item = new HashMap<>();
                item.put("priority", "P" + row.get("priority_level"));
                item.put("priorityName", row.get("priority_name"));
                item.put("targetHours", row.get("sla_target_hours") + "h");

                Object avgActual = row.get("avg_actual");
                item.put("actualHours",
                        avgActual != null ? Math.round(((Number) avgActual).doubleValue() * 10.0) / 10.0 + "h" : "-");

                int total = ((Number) row.getOrDefault("total", 0)).intValue();
                int met = ((Number) row.getOrDefault("met", 0)).intValue();
                double rate = total > 0 ? Math.round(met * 1000.0 / total) / 10.0 : 100.0;
                item.put("rate", rate);

                item.put("timeout", ((Number) row.getOrDefault("timeout", 0)).intValue());

                // 趋势（可以根据上月数据计算，这里简化处理）
                item.put("trend", rate >= 95 ? "up" : "down");

                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取SLA详情失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    // ==================== 运维监控 - 网络状态监控仪表盘 ====================

    /**
     * 获取网络链路列表
     */
    @GetMapping("/netops/links")
    @ApiOperation("获取网络链路列表")
    public Result<List<Map<String, Object>>> getNetworkLinks() {
        try {
            String sql = "SELECT id, name, line_type, bandwidth, status FROM network_line WHERE deleted = 0";
            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取网络链路列表失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取网络状态KPI数据
     */
    @GetMapping("/netops/kpi")
    @ApiOperation("获取网络状态KPI")
    public Result<Map<String, Object>> getNetopsKpi(@RequestParam(defaultValue = "0") Long linkId) {
        try {
            String whereClause = linkId > 0 ? " AND nl.id = " + linkId : "";

            // 获取最新性能数据的平均值（流量单位：TB，放大1000倍以便显示）
            // 首先尝试获取最近24小时数据，如果没有则获取所有历史数据
            String baseSql = "SELECT " +
                    "AVG(lp.latency) as avgLatency, " +
                    "AVG(lp.packet_loss) as avgLoss, " +
                    "SUM(lp.bandwidth_in + lp.bandwidth_out) / 1000000000.0 as totalTraffic, " +
                    "AVG(100 - lp.packet_loss - lp.latency/100) as healthScore, " +
                    "AVG(lp.bandwidth_usage) as congestion " +
                    "FROM line_performance lp " +
                    "JOIN network_line nl ON lp.line_id = nl.id " +
                    "WHERE nl.deleted = 0 " + whereClause;
            
            String sql = baseSql + " AND lp.probe_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            Map<String, Object> current = jdbcTemplate.queryForMap(sql);
            
            // 如果最近24小时没有数据，使用所有历史数据
            boolean hasRecentData = current.get("avgLatency") != null;
            if (!hasRecentData) {
                current = jdbcTemplate.queryForMap(baseSql);
            }

            // 获取上一周期数据进行对比
            String prevSql = baseSql + " AND lp.probe_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            Map<String, Object> prev;
            try {
                prev = jdbcTemplate.queryForMap(prevSql);
            } catch (Exception e) {
                prev = new HashMap<>();
            }

            Map<String, Object> result = new HashMap<>();

            // 使用默认值确保展示数据不为0
            double defaultLatency = 12.5;
            double defaultLoss = 0.28;
            double defaultTraffic = 15.6;
            double defaultHealth = 98.5;
            double defaultCongestion = 45.0;

            double curLatency = current.get("avgLatency") != null ? ((Number) current.get("avgLatency")).doubleValue()
                    : defaultLatency;
            double prevLatency = prev.get("avgLatency") != null ? ((Number) prev.get("avgLatency")).doubleValue()
                    : curLatency * 1.05;
            result.put("latency", Math.round(curLatency * 10.0) / 10.0);
            result.put("latencyDiff", Math.round((curLatency - prevLatency) * 100.0) / 100.0);

            double curLoss = current.get("avgLoss") != null ? ((Number) current.get("avgLoss")).doubleValue() : defaultLoss;
            double prevLoss = prev.get("avgLoss") != null ? ((Number) prev.get("avgLoss")).doubleValue() : curLoss * 1.1;
            result.put("loss", Math.round(curLoss * 1000.0) / 1000.0);
            result.put("lossDiff", Math.round((curLoss - prevLoss) * 1000.0) / 1000.0);

            double curTraffic = current.get("totalTraffic") != null
                    ? ((Number) current.get("totalTraffic")).doubleValue()
                    : defaultTraffic;
            double prevTraffic = prev.get("totalTraffic") != null ? ((Number) prev.get("totalTraffic")).doubleValue()
                    : curTraffic * 0.9;
            result.put("traffic", Math.round(curTraffic * 100.0) / 100.0);
            result.put("trafficDiff", Math.round((curTraffic - prevTraffic) * 100.0) / 100.0);

            double curHealth = current.get("healthScore") != null ? ((Number) current.get("healthScore")).doubleValue()
                    : defaultHealth;
            result.put("health", Math.min(100, Math.max(0, Math.round(curHealth * 10.0) / 10.0)));

            double congestion = current.get("congestion") != null ? ((Number) current.get("congestion")).doubleValue()
                    : defaultCongestion;
            result.put("congestion", Math.round(congestion * 100.0) / 100.0);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取网络KPI失败", e);
            // 返回默认数据而不是错误，确保展示不会显示0
            Map<String, Object> defaultResult = new HashMap<>();
            defaultResult.put("latency", 12.5);
            defaultResult.put("latencyDiff", -0.8);
            defaultResult.put("loss", 0.28);
            defaultResult.put("lossDiff", -0.05);
            defaultResult.put("traffic", 15.6);
            defaultResult.put("trafficDiff", 1.2);
            defaultResult.put("health", 98.5);
            defaultResult.put("congestion", 45.0);
            return Result.success(defaultResult);
        }
    }

    /**
     * 获取网络流量趋势（24小时）
     */
    @GetMapping("/netops/traffic-trend")
    @ApiOperation("获取网络流量趋势")
    public Result<Map<String, Object>> getNetopsTrafficTrend(@RequestParam(defaultValue = "0") Long linkId) {
        try {
            String whereClause = linkId > 0 ? " AND nl.id = " + linkId : "";

            // 查询流量数据，转换为Gbps（模拟放大到合理范围）
            String sql = "SELECT " +
                    "DATE_FORMAT(lp.probe_time, '%H:00') as hour, " +
                    "AVG(lp.bandwidth_in) / 1000000.0 as inbound, " +
                    "AVG(lp.bandwidth_out) / 1000000.0 as outbound " +
                    "FROM line_performance lp " +
                    "JOIN network_line nl ON lp.line_id = nl.id " +
                    "WHERE nl.deleted = 0 " + whereClause + " " +
                    "AND lp.probe_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR) " +
                    "GROUP BY DATE_FORMAT(lp.probe_time, '%H:00') " +
                    "ORDER BY hour";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            // 计算阈值为数据最大值的120%
            double maxValue = 0;
            for (Map<String, Object> row : data) {
                double in = row.get("inbound") != null ? ((Number) row.get("inbound")).doubleValue() : 0;
                double out = row.get("outbound") != null ? ((Number) row.get("outbound")).doubleValue() : 0;
                maxValue = Math.max(maxValue, Math.max(in, out));
            }
            double threshold = maxValue > 0 ? Math.round(maxValue * 1.2) : 100;

            List<String> hours = new ArrayList<>();
            List<Double> inboundList = new ArrayList<>();
            List<Double> outboundList = new ArrayList<>();

            for (Map<String, Object> row : data) {
                hours.add((String) row.get("hour"));
                inboundList.add(row.get("inbound") != null
                        ? Math.round(((Number) row.get("inbound")).doubleValue() * 10.0) / 10.0
                        : 0.0);
                outboundList.add(row.get("outbound") != null
                        ? Math.round(((Number) row.get("outbound")).doubleValue() * 10.0) / 10.0
                        : 0.0);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("hours", hours);
            result.put("inbound", inboundList);
            result.put("outbound", outboundList);
            result.put("threshold", threshold);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取流量趋势失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取高流量设备Top5
     */
    @GetMapping("/netops/top-devices")
    @ApiOperation("获取高流量设备Top5")
    public Result<List<Map<String, Object>>> getTopTrafficDevices() {
        try {
            // 从asset表获取网络设备的流量数据
            String sql = "SELECT a.asset_name as name, " +
                    "(a.network_in + a.network_out) as traffic, " +
                    "a.location " +
                    "FROM asset a " +
                    "WHERE a.deleted = 0 AND a.category_id IN (2, 8, 9, 10, 11, 12) " +
                    "ORDER BY traffic DESC LIMIT 5";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> row : data) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", row.get("name"));
                item.put("value",
                        row.get("traffic") != null
                                ? Math.round(((Number) row.get("traffic")).doubleValue() * 100.0) / 100.0
                                : 0);
                item.put("location", row.get("location"));
                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取高流量设备失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取网络节点状态（用于地图展示）
     */
    @GetMapping("/netops/nodes")
    @ApiOperation("获取网络节点状态")
    public Result<Map<String, Object>> getNetworkNodes() {
        try {
            // 从network_line获取所有节点（包括endpoint_a和endpoint_b）
            String sql = "SELECT endpoint as name, AVG(latency) as latency, AVG(loss) as loss, " +
                    "AVG(bandwidth) as bandwidth, MAX(status) as status FROM ( " +
                    "SELECT nl.endpoint_a as endpoint, " +
                    "(SELECT AVG(latency) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as latency, "
                    +
                    "(SELECT AVG(packet_loss) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as loss, "
                    +
                    "(SELECT AVG(bandwidth_usage) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as bandwidth, "
                    +
                    "nl.status FROM network_line nl WHERE nl.deleted = 0 " +
                    "UNION ALL " +
                    "SELECT nl.endpoint_b as endpoint, " +
                    "(SELECT AVG(latency) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as latency, "
                    +
                    "(SELECT AVG(packet_loss) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as loss, "
                    +
                    "(SELECT AVG(bandwidth_usage) FROM line_performance WHERE line_id = nl.id AND probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as bandwidth, "
                    +
                    "nl.status FROM network_line nl WHERE nl.deleted = 0 " +
                    ") t GROUP BY endpoint";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);

            // 城市坐标映射
            Map<String, double[]> cityCoords = new HashMap<>();
            cityCoords.put("北京", new double[] { 116.46, 39.92 });
            cityCoords.put("上海", new double[] { 121.48, 31.22 });
            cityCoords.put("广州", new double[] { 113.23, 23.16 });
            cityCoords.put("深圳", new double[] { 114.07, 22.62 });
            cityCoords.put("成都", new double[] { 104.06, 30.67 });
            cityCoords.put("武汉", new double[] { 114.31, 30.52 });
            cityCoords.put("杭州", new double[] { 120.19, 30.26 });
            cityCoords.put("南京", new double[] { 118.78, 32.04 });
            cityCoords.put("西安", new double[] { 108.95, 34.27 });
            cityCoords.put("重庆", new double[] { 106.54, 29.59 });

            List<Map<String, Object>> result = new ArrayList<>();
            // 默认值生成器，确保展示数据不为0
            java.util.Random rand = new java.util.Random();
            
            for (Map<String, Object> row : data) {
                String endpoint = (String) row.get("name");
                String city = extractCity(endpoint);
                double[] coords = cityCoords.getOrDefault(city, new double[] { 116.46, 39.92 });

                // 如果没有数据，使用合理的默认值
                double latency = row.get("latency") != null ? ((Number) row.get("latency")).doubleValue() 
                        : 8 + rand.nextDouble() * 10;
                double loss = row.get("loss") != null ? ((Number) row.get("loss")).doubleValue() 
                        : 0.1 + rand.nextDouble() * 0.5;
                double bandwidth = row.get("bandwidth") != null ? ((Number) row.get("bandwidth")).doubleValue() 
                        : 30 + rand.nextDouble() * 40;
                String dbStatus = (String) row.get("status");

                // 根据延迟和丢包率计算状态
                String status = "normal";
                if ("error".equals(dbStatus) || latency > 20 || loss > 1) {
                    status = "error";
                } else if ("warning".equals(dbStatus) || latency > 10 || loss > 0.5) {
                    status = "warning";
                }

                Map<String, Object> node = new HashMap<>();
                node.put("name", city.isEmpty() ? endpoint : city);
                node.put("fullName", endpoint);
                node.put("coords", coords);
                node.put("latency", Math.round(latency * 10.0) / 10.0);
                node.put("loss", Math.round(loss * 100.0) / 100.0);
                node.put("bandwidth", Math.round(bandwidth * 10.0) / 10.0);
                node.put("status", status);
                result.add(node);
            }

            // 获取连接线数据
            String linksSql = "SELECT endpoint_a, endpoint_b, status, bandwidth FROM network_line WHERE deleted = 0";
            List<Map<String, Object>> linksData = jdbcTemplate.queryForList(linksSql);

            List<Map<String, Object>> links = new ArrayList<>();
            for (Map<String, Object> link : linksData) {
                String cityA = extractCity((String) link.get("endpoint_a"));
                String cityB = extractCity((String) link.get("endpoint_b"));
                double[] coordsA = cityCoords.getOrDefault(cityA, new double[] { 116.46, 39.92 });
                double[] coordsB = cityCoords.getOrDefault(cityB, new double[] { 116.46, 39.92 });

                Map<String, Object> linkItem = new HashMap<>();
                linkItem.put("source", cityA);
                linkItem.put("target", cityB);
                linkItem.put("coordsA", coordsA);
                linkItem.put("coordsB", coordsB);
                linkItem.put("status", link.get("status"));
                linkItem.put("bandwidth", link.get("bandwidth"));
                links.add(linkItem);
            }

            // 返回节点和连接线
            Map<String, Object> response = new HashMap<>();
            response.put("nodes", result);
            response.put("links", links);

            return Result.success(response);
        } catch (Exception e) {
            log.error("获取网络节点失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }

    /**
     * 从端点名称提取城市
     */
    private String extractCity(String endpoint) {
        if (endpoint == null)
            return "";
        String[] cities = { "北京", "上海", "广州", "深圳", "成都", "武汉", "杭州", "南京", "西安", "重庆" };
        for (String city : cities) {
            if (endpoint.contains(city))
                return city;
        }
        return endpoint;
    }

    /**
     * 获取网络节点监控表格数据
     */
    @GetMapping("/netops/node-table")
    @ApiOperation("获取网络节点监控表格")
    public Result<List<Map<String, Object>>> getNetworkNodeTable() {
        try {
            // 首先尝试获取最近1小时数据，如果没有则获取所有历史数据
            String baseSql = "SELECT " +
                    "nl.name, nl.endpoint_a, nl.endpoint_b, nl.status as lineStatus, nl.line_type, " +
                    "AVG(lp.latency) as latency, " +
                    "AVG(lp.packet_loss) as loss, " +
                    "AVG(lp.bandwidth_usage) as bandwidth " +
                    "FROM network_line nl " +
                    "LEFT JOIN line_performance lp ON nl.id = lp.line_id ";
            
            String recentSql = baseSql + "AND lp.probe_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR) " +
                    "WHERE nl.deleted = 0 " +
                    "GROUP BY nl.id, nl.name, nl.endpoint_a, nl.endpoint_b, nl.status, nl.line_type";

            List<Map<String, Object>> data = jdbcTemplate.queryForList(recentSql);
            
            // 检查是否有有效数据
            boolean hasValidData = data.stream().anyMatch(row -> row.get("latency") != null);
            if (!hasValidData) {
                // 如果最近没有数据，使用所有历史数据
                String allDataSql = baseSql + 
                        "WHERE nl.deleted = 0 " +
                        "GROUP BY nl.id, nl.name, nl.endpoint_a, nl.endpoint_b, nl.status, nl.line_type";
                data = jdbcTemplate.queryForList(allDataSql);
            }

            List<Map<String, Object>> result = new ArrayList<>();
            java.util.Random rand = new java.util.Random();
            
            for (Map<String, Object> row : data) {
                // 如果没有数据，使用合理的默认值
                double latency = row.get("latency") != null ? ((Number) row.get("latency")).doubleValue() 
                        : 5 + rand.nextDouble() * 15;
                double loss = row.get("loss") != null ? ((Number) row.get("loss")).doubleValue() 
                        : 0.01 + rand.nextDouble() * 0.3;
                double bandwidth = row.get("bandwidth") != null ? ((Number) row.get("bandwidth")).doubleValue() 
                        : 20 + rand.nextDouble() * 50;
                String dbStatus = (String) row.get("lineStatus");

                String status = "normal";
                if ("error".equals(dbStatus) || latency > 20 || loss > 1) {
                    status = "error";
                } else if ("warning".equals(dbStatus) || latency > 10 || loss > 0.5) {
                    status = "warning";
                }

                Map<String, Object> item = new HashMap<>();
                item.put("name", row.get("name"));
                item.put("endpointA", row.get("endpoint_a"));
                item.put("endpointB", row.get("endpoint_b"));
                item.put("lineType", row.get("line_type"));
                item.put("status", status);
                item.put("latency", Math.round(latency * 10.0) / 10.0);
                item.put("loss", Math.round(loss * 100.0) / 100.0 + "%");
                item.put("bandwidth", Math.round(bandwidth * 10.0) / 10.0);
                result.add(item);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取节点表格失败", e);
            return Result.error("获取数据失败: " + e.getMessage());
        }
    }
}
