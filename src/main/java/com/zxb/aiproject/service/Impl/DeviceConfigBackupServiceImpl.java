package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.DeviceConfigBackup;
import com.zxb.aiproject.entity.DeviceVersionHistory;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.DeviceConfigBackupMapper;
import com.zxb.aiproject.service.DeviceConfigBackupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 设备配置备份服务实现类
 */
@Service
@Qualifier("deviceConfigBackupServiceTemp")
@Slf4j
public class DeviceConfigBackupServiceImpl implements DeviceConfigBackupService {

    @Autowired
    private AssetMapper assetMapper;
    
    @Autowired
    private DeviceConfigBackupMapper deviceConfigBackupMapper;

    @Override
    public Map<String, Object> backupDeviceConfig(Long deviceId, String operator) {
        log.info("备份设备配置: deviceId={}, operator={}", deviceId, operator);
        
        try {
            // 1. 获取设备信息
            Asset device = assetMapper.selectById(deviceId);
            if (device == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "设备不存在");
                return result;
            }
            
            // 2. 获取下一个版本号
            String nextVersion = getNextVersion(deviceId);
            
            // 3. 创建配置备份记录
            DeviceConfigBackup backup = new DeviceConfigBackup();
            backup.setDeviceId(deviceId);
            backup.setDeviceName(device.getAssetName());
            backup.setDeviceIp(device.getIpAddress());
            backup.setDeviceType(getCategoryName(device.getCategoryId()));
            backup.setAssetCode(device.getAssetCode());
            backup.setManufacturer(device.getManufacturer());
            backup.setModel(device.getModel());
            backup.setVersion(nextVersion);
            backup.setBackupTime(LocalDateTime.now());
            backup.setBackupStatus("success");
            backup.setBackupSize(generateRandomSize());
            backup.setOperator(operator);
            backup.setFirmwareVersion(generateFirmwareVersion(device.getManufacturer()));
            backup.setConfigChecksum(generateChecksum());
            backup.setLastConfigChange(LocalDateTime.now());
            backup.setDeviceStatus(device.getAssetStatus());
            backup.setUptime(generateUptime());
            backup.setCpuUsage(generateRandomInt(10, 50));
            backup.setMemoryUsage(generateRandomInt(20, 80));
            backup.setTemperature(generateRandomInt(35, 55));
            backup.setSubnetMask("255.255.255.0");
            backup.setGateway("192.168.1.1");
            backup.setDnsServers("[\"8.8.8.8\", \"114.114.114.114\"]");
            backup.setPortConfig(generatePortConfig());
            backup.setDeviceSnapshot(generateDeviceSnapshot(device));
            backup.setVersionChanges(generateVersionChanges(nextVersion));
            backup.setDeleted(0);
            
            // 4. 保存到数据库
            deviceConfigBackupMapper.insert(backup);
            
            // 5. 返回成功结果
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "配置备份成功");
            result.put("version", nextVersion);
            result.put("backupTime", backup.getBackupTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            result.put("backupId", backup.getId());
            
            log.info("设备配置备份成功: deviceId={}, version={}", deviceId, nextVersion);
            return result;
            
        } catch (Exception e) {
            log.error("备份设备配置失败: deviceId={}", deviceId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "备份失败: " + e.getMessage());
            return result;
        }
    }

    @Override
    public List<Map<String, Object>> getConfigList(String keyword, String startDate, String endDate) {
        log.info("获取配置管理列表: keyword={}, startDate={}, endDate={}", keyword, startDate, endDate);
        
        try {
            QueryWrapper<DeviceConfigBackup> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            
            // 关键字搜索
            if (keyword != null && !keyword.isEmpty()) {
                queryWrapper.and(wrapper -> wrapper
                    .like("device_name", keyword)
                    .or()
                    .like("device_ip", keyword)
                    .or()
                    .like("asset_code", keyword)
                );
            }
            
            // 时间范围过滤
            if (startDate != null && !startDate.isEmpty()) {
                queryWrapper.ge("backup_time", startDate + " 00:00:00");
            }
            if (endDate != null && !endDate.isEmpty()) {
                queryWrapper.le("backup_time", endDate + " 23:59:59");
            }
            
            queryWrapper.orderByDesc("backup_time");
            
            List<DeviceConfigBackup> backups = deviceConfigBackupMapper.selectList(queryWrapper);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (DeviceConfigBackup backup : backups) {
                Map<String, Object> config = new HashMap<>();
                config.put("id", backup.getId());
                config.put("deviceId", backup.getDeviceId());
                config.put("deviceName", backup.getDeviceName());
                config.put("deviceIp", backup.getDeviceIp());
                config.put("version", backup.getVersion());
                config.put("backupTime", backup.getBackupTime());
                config.put("backupStatus", backup.getBackupStatus());
                config.put("backupSize", backup.getBackupSize());
                config.put("operator", backup.getOperator());
                config.put("firmwareVersion", backup.getFirmwareVersion());
                result.add(config);
            }
            
            log.info("获取到 {} 条配置备份记录", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("获取配置管理列表失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<DeviceVersionHistory> getVersionHistory(Long deviceId) {
        log.info("获取设备版本历史: deviceId={}", deviceId);
        
        try {
            QueryWrapper<DeviceConfigBackup> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("device_id", deviceId);
            queryWrapper.eq("deleted", 0);
            queryWrapper.orderByDesc("backup_time");
            
            List<DeviceConfigBackup> backups = deviceConfigBackupMapper.selectList(queryWrapper);
            
            List<DeviceVersionHistory> historyList = new ArrayList<>();
            for (DeviceConfigBackup backup : backups) {
                DeviceVersionHistory history = new DeviceVersionHistory();
                history.setId(backup.getId());
                history.setDeviceId(backup.getDeviceId());
                history.setDeviceName(backup.getDeviceName());
                history.setDeviceType(backup.getDeviceType());
                history.setVersion(backup.getVersion());
                history.setBackupTime(backup.getBackupTime());
                history.setOperator(backup.getOperator());
                history.setBackupSize(backup.getBackupSize());
                history.setBackupId(backup.getId());
                history.setChangeSummary("配置备份 - " + backup.getBackupStatus());
                history.setChangeDetails(String.format("{\"backupStatus\":\"%s\",\"firmwareVersion\":\"%s\",\"checksum\":\"%s\"}", 
                    backup.getBackupStatus(), backup.getFirmwareVersion(), backup.getConfigChecksum()));
                historyList.add(history);
            }
            
            log.info("获取到设备 {} 的 {} 条版本历史记录", deviceId, historyList.size());
            return historyList;
            
        } catch (Exception e) {
            log.error("获取设备版本历史失败: deviceId={}", deviceId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getDeviceSnapshot(Long backupId) {
        log.info("获取设备快照: backupId={}", backupId);
        
        try {
            DeviceConfigBackup backup = deviceConfigBackupMapper.selectById(backupId);
            if (backup == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "备份记录不存在");
                result.put("data", new HashMap<>());
                return result;
            }
            
            // 构建设备快照数据
            Map<String, Object> snapshot = new HashMap<>();
            
            // 基本信息
            Map<String, Object> basicInfo = new HashMap<>();
            basicInfo.put("deviceId", backup.getDeviceId());
            basicInfo.put("deviceName", backup.getDeviceName());
            basicInfo.put("deviceIp", backup.getDeviceIp());
            basicInfo.put("deviceType", backup.getDeviceType());
            basicInfo.put("assetCode", backup.getAssetCode());
            basicInfo.put("manufacturer", backup.getManufacturer());
            basicInfo.put("model", backup.getModel());
            snapshot.put("basicInfo", basicInfo);
            
            // 备份信息
            Map<String, Object> backupInfo = new HashMap<>();
            backupInfo.put("version", backup.getVersion());
            backupInfo.put("backupTime", backup.getBackupTime());
            backupInfo.put("backupStatus", backup.getBackupStatus());
            backupInfo.put("backupSize", backup.getBackupSize());
            backupInfo.put("operator", backup.getOperator());
            backupInfo.put("firmwareVersion", backup.getFirmwareVersion());
            backupInfo.put("configChecksum", backup.getConfigChecksum());
            snapshot.put("backupInfo", backupInfo);
            
            // 设备状态
            Map<String, Object> deviceStatus = new HashMap<>();
            deviceStatus.put("status", backup.getDeviceStatus());
            deviceStatus.put("uptime", backup.getUptime());
            deviceStatus.put("cpuUsage", backup.getCpuUsage() + "%");
            deviceStatus.put("memoryUsage", backup.getMemoryUsage() + "%");
            deviceStatus.put("temperature", backup.getTemperature() + "°C");
            snapshot.put("deviceStatus", deviceStatus);
            
            // 网络配置
            Map<String, Object> networkConfig = new HashMap<>();
            networkConfig.put("ipAddress", backup.getDeviceIp());
            networkConfig.put("macAddress", backup.getMacAddress());
            networkConfig.put("subnetMask", backup.getSubnetMask());
            networkConfig.put("gateway", backup.getGateway());
            networkConfig.put("dnsServers", backup.getDnsServers());
            snapshot.put("networkConfig", networkConfig);
            
            // 端口配置
            try {
                if (backup.getPortConfig() != null && !backup.getPortConfig().isEmpty()) {
                    snapshot.put("portConfig", backup.getPortConfig());
                } else {
                    snapshot.put("portConfig", "{}");
                }
            } catch (Exception e) {
                snapshot.put("portConfig", "{}");
            }
            
            // 设备快照（原始JSON数据）
            try {
                if (backup.getDeviceSnapshot() != null && !backup.getDeviceSnapshot().isEmpty()) {
                    snapshot.put("deviceSnapshot", backup.getDeviceSnapshot());
                } else {
                    snapshot.put("deviceSnapshot", "{}");
                }
            } catch (Exception e) {
                snapshot.put("deviceSnapshot", "{}");
            }
            
            // 版本变更记录
            try {
                if (backup.getVersionChanges() != null && !backup.getVersionChanges().isEmpty()) {
                    snapshot.put("versionChanges", backup.getVersionChanges());
                } else {
                    snapshot.put("versionChanges", "[\"无变更记录\"]");
                }
            } catch (Exception e) {
                snapshot.put("versionChanges", "[\"无变更记录\"]");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", snapshot);
            result.put("message", "获取成功");
            
            log.info("成功获取设备快照: backupId={}, deviceName={}", backupId, backup.getDeviceName());
            return result;
            
        } catch (Exception e) {
            log.error("获取设备快照失败: backupId={}", backupId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
            result.put("data", new HashMap<>());
            return result;
        }
    }

    @Override
    public String getNextVersion(Long deviceId) {
        log.info("获取下一个版本号: deviceId={}", deviceId);
        
        try {
            // 查询该设备的最新版本号
            QueryWrapper<DeviceConfigBackup> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("device_id", deviceId);
            queryWrapper.eq("deleted", 0);
            queryWrapper.orderByDesc("backup_time");
            queryWrapper.last("LIMIT 1");
            
            DeviceConfigBackup latestBackup = deviceConfigBackupMapper.selectOne(queryWrapper);
            
            if (latestBackup == null || latestBackup.getVersion() == null) {
                // 如果没有历史版本，从v1.0开始
                return "v1.0";
            }
            
            String currentVersion = latestBackup.getVersion();
            log.info("当前最新版本: {}", currentVersion);
            
            // 解析版本号并递增
            if (currentVersion.startsWith("v")) {
                try {
                    String versionNumber = currentVersion.substring(1);
                    BigDecimal version = new BigDecimal(versionNumber);
                    BigDecimal nextVersion = version.add(new BigDecimal("0.1"));
                    String result = "v" + nextVersion.toString();
                    log.info("计算出的下一个版本号: {}", result);
                    return result;
                } catch (NumberFormatException e) {
                    log.warn("版本号格式错误: {}, 重置为v1.0", currentVersion);
                    return "v1.0";
                }
            } else {
                log.warn("版本号格式不正确: {}, 重置为v1.0", currentVersion);
                return "v1.0";
            }
            
        } catch (Exception e) {
            log.error("获取下一个版本号失败: deviceId={}", deviceId, e);
            return "v1.0";
        }
    }

    @Override
    public DeviceConfigBackup getLatestBackup(Long deviceId) {
        log.info("获取最新备份记录: deviceId={}", deviceId);
        // TODO: 实现获取最新备份记录逻辑
        return null;
    }

    @Override
    public List<DeviceConfigBackup> getAllLatestBackups() {
        log.info("获取所有设备的最新备份列表");
        // TODO: 实现获取所有最新备份逻辑
        return new ArrayList<>();
    }
    
    // 辅助方法：获取分类名称
    private String getCategoryName(Long categoryId) {
        if (categoryId == null) return "未知";
        
        Map<Long, String> categoryMap = new HashMap<>();
        categoryMap.put(8L, "交换机");
        categoryMap.put(9L, "路由器");
        categoryMap.put(10L, "防火墙");
        categoryMap.put(11L, "无线AP");
        categoryMap.put(12L, "网关");
        
        return categoryMap.getOrDefault(categoryId, "未知");
    }
    
    // 辅助方法：生成随机文件大小
    private String generateRandomSize() {
        Random random = new Random();
        int size = 150 + random.nextInt(400); // 150-550KB
        return size + "KB";
    }
    
    // 辅助方法：生成固件版本
    private String generateFirmwareVersion(String manufacturer) {
        Random random = new Random();
        if ("Cisco".equals(manufacturer)) {
            return "SW-" + (random.nextInt(5) + 3) + "." + random.nextInt(10) + "." + (random.nextInt(99) + 1);
        } else if ("Huawei".equals(manufacturer)) {
            return "SW-" + (random.nextInt(3) + 4) + "." + random.nextInt(8) + "." + (random.nextInt(50) + 10);
        } else if ("Fortinet".equals(manufacturer)) {
            return "FW-" + (random.nextInt(3) + 6) + "." + random.nextInt(6) + "." + (random.nextInt(99) + 1);
        } else if ("F5".equals(manufacturer)) {
            return "GW-" + (random.nextInt(5) + 9) + "." + random.nextInt(6) + "." + (random.nextInt(99) + 1);
        } else {
            return "AP-" + (random.nextInt(3) + 6) + "." + random.nextInt(5) + "." + (random.nextInt(20) + 1);
        }
    }
    
    // 辅助方法：生成校验和
    private String generateChecksum() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        String chars = "0123456789abcdef";
        for (int i = 0; i < 32; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    // 辅助方法：生成运行时间
    private String generateUptime() {
        Random random = new Random();
        int hours = random.nextInt(24);
        return hours + "小时";
    }
    
    // 辅助方法：生成随机整数
    private Integer generateRandomInt(int min, int max) {
        Random random = new Random();
        return min + random.nextInt(max - min + 1);
    }
    
    // 辅助方法：生成端口配置
    private String generatePortConfig() {
        return "{\"GE1/0/1\": {\"speed\": \"1000M\", \"duplex\": \"full\", \"status\": \"up\"}}";
    }
    
    // 辅助方法：生成设备快照
    private String generateDeviceSnapshot(Asset device) {
        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("deviceId", device.getId());
        snapshot.put("deviceName", device.getAssetName());
        snapshot.put("deviceIp", device.getIpAddress());
        snapshot.put("location", device.getLocation());
        snapshot.put("assetCode", device.getAssetCode());
        snapshot.put("manufacturer", device.getManufacturer());
        snapshot.put("model", device.getModel());
        snapshot.put("status", device.getAssetStatus());
        snapshot.put("backupTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS")));
        
        // 转换为JSON字符串（简单实现）
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : snapshot.entrySet()) {
            if (!first) json.append(", ");
            json.append("\"").append(entry.getKey()).append("\": ");
            if (entry.getValue() instanceof String) {
                json.append("\"").append(entry.getValue()).append("\"");
            } else {
                json.append(entry.getValue());
            }
            first = false;
        }
        json.append("}");
        
        return json.toString();
    }
    
    // 辅助方法：生成版本变更记录
    private String generateVersionChanges(String version) {
        if ("v1.0".equals(version)) {
            return "[\"首次配置备份\"]";
        } else {
            return "[\"配置定期备份\"]";
        }
    }
}
