package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.DeviceConfigBackup;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.DeviceConfigBackupMapper;
import com.zxb.aiproject.service.NetworkConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 网络配置服务实现类
 */
@Service
@Slf4j
public class NetworkConfigServiceImpl implements NetworkConfigService {

    @Autowired
    private AssetMapper assetMapper;
    
    @Autowired
    private DeviceConfigBackupMapper deviceConfigBackupMapper;

    // 网络设备分类ID
    private static final List<Long> NETWORK_CATEGORY_IDS = Arrays.asList(2L, 8L, 9L, 10L, 11L, 12L);

    @Override
    public Map<String, Object> getDeviceConfigs() {
        return getDeviceConfigs(null, null);
    }
    
    @Override
    public Map<String, Object> getDeviceConfigs(String keyword, String timeFilter) {
        log.info("获取网络设备配置列表: keyword={}, timeFilter={}", keyword, timeFilter);
        
        try {
            // 获取网络设备列表
            QueryWrapper<Asset> assetQuery = new QueryWrapper<>();
            assetQuery.in("category_id", NETWORK_CATEGORY_IDS);
            assetQuery.eq("deleted", 0);
            
            // 添加关键字搜索
            if (keyword != null && !keyword.trim().isEmpty()) {
                assetQuery.and(wrapper -> wrapper
                    .like("device_name", keyword.trim())
                    .or()
                    .like("asset_name", keyword.trim())
                    .or()
                    .like("ip_address", keyword.trim())
                );
            }
            
            List<Asset> networkDevices = assetMapper.selectList(assetQuery);
            
            List<Map<String, Object>> deviceConfigs = new ArrayList<>();
            
            for (Asset device : networkDevices) {
                // 获取每个设备的最新配置备份
                QueryWrapper<DeviceConfigBackup> configQuery = new QueryWrapper<>();
                configQuery.eq("device_id", device.getId());
                configQuery.eq("deleted", 0);
                
                // 添加时间筛选
                if (timeFilter != null && !timeFilter.trim().isEmpty()) {
                    LocalDateTime now = LocalDateTime.now();
                    switch (timeFilter.trim()) {
                        case "今天":
                            configQuery.ge("backup_time", now.toLocalDate().atStartOfDay());
                            break;
                        case "最近一周":
                            configQuery.ge("backup_time", now.minusWeeks(1));
                            break;
                        case "最近一月":
                            configQuery.ge("backup_time", now.minusMonths(1));
                            break;
                    }
                }
                
                configQuery.orderByDesc("backup_time");
                configQuery.last("LIMIT 1");
                
                DeviceConfigBackup latestConfig = deviceConfigBackupMapper.selectOne(configQuery);
                
                // 只显示有备份记录的设备
                if (latestConfig != null) {
                    Map<String, Object> deviceConfig = new HashMap<>();
                    deviceConfig.put("deviceId", device.getId());
                    deviceConfig.put("deviceName", device.getDeviceName());
                    deviceConfig.put("deviceIp", device.getIpAddress());
                    deviceConfig.put("assetCode", device.getAssetCode());
                    deviceConfig.put("manufacturer", device.getManufacturer());
                    deviceConfig.put("model", device.getModel());
                    deviceConfig.put("status", device.getAssetStatus());
                    deviceConfig.put("location", device.getLocation());
                    deviceConfig.put("hasBackup", true);
                    deviceConfig.put("lastBackupTime", latestConfig.getBackupTime());
                    deviceConfig.put("version", latestConfig.getVersion());
                    deviceConfig.put("backupStatus", latestConfig.getBackupStatus());
                    deviceConfig.put("firmwareVersion", latestConfig.getFirmwareVersion());
                    deviceConfig.put("backupSize", latestConfig.getBackupSize());
                    
                    deviceConfigs.add(deviceConfig);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", deviceConfigs);
            result.put("total", deviceConfigs.size());
            
            log.info("获取到 {} 个网络设备配置", deviceConfigs.size());
            return result;
            
        } catch (Exception e) {
            log.error("获取设备配置失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "获取设备配置失败");
            result.put("data", new ArrayList<>());
            return result;
        }
    }

    @Override
    public Map<String, Object> getConfigStats() {
        log.info("获取配置统计");
        
        try {
            // 统计网络设备总数
            QueryWrapper<Asset> assetQuery = new QueryWrapper<>();
            assetQuery.in("category_id", NETWORK_CATEGORY_IDS);
            assetQuery.eq("deleted", 0);
            long totalDevices = assetMapper.selectCount(assetQuery);
            
            // 统计有配置备份的设备数量
            QueryWrapper<DeviceConfigBackup> configQuery = new QueryWrapper<>();
            configQuery.select("DISTINCT device_id");
            List<DeviceConfigBackup> backupDevices = deviceConfigBackupMapper.selectList(configQuery);
            long configuredDevices = backupDevices.size();
            
            // 统计配置备份总数
            QueryWrapper<DeviceConfigBackup> totalBackupQuery = new QueryWrapper<>();
            long totalBackups = deviceConfigBackupMapper.selectCount(totalBackupQuery);
            
            // 统计最近24小时的备份数量
            QueryWrapper<DeviceConfigBackup> recentQuery = new QueryWrapper<>();
            recentQuery.apply("backup_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
            long recentBackups = deviceConfigBackupMapper.selectCount(recentQuery);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDevices", totalDevices);
            stats.put("configuredDevices", configuredDevices);
            stats.put("unconfiguredDevices", totalDevices - configuredDevices);
            stats.put("totalBackups", totalBackups);
            stats.put("recentBackups", recentBackups);
            stats.put("configurationRate", totalDevices > 0 ? (double) configuredDevices / totalDevices * 100 : 0);
            
            log.info("配置统计 - 总设备: {}, 已配置: {}, 总备份: {}, 近期备份: {}", 
                totalDevices, configuredDevices, totalBackups, recentBackups);
            
            return stats;
            
        } catch (Exception e) {
            log.error("获取配置统计失败", e);
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDevices", 0);
            stats.put("configuredDevices", 0);
            stats.put("unconfiguredDevices", 0);
            stats.put("totalBackups", 0);
            stats.put("recentBackups", 0);
            stats.put("configurationRate", 0);
            return stats;
        }
    }
}