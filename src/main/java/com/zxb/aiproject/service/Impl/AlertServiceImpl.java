package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.Alert;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.entity.CloudHost;
import com.zxb.aiproject.entity.CloudVirtualMachine;
import com.zxb.aiproject.entity.CloudStorage;
import com.zxb.aiproject.mapper.AlertMapper;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.mapper.CloudHostMapper;
import com.zxb.aiproject.mapper.CloudVirtualMachineMapper;
import com.zxb.aiproject.mapper.CloudStorageMapper;
import com.zxb.aiproject.service.AlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 告警服务实现类
 */
@Service
@Slf4j
public class AlertServiceImpl implements AlertService {

    @Autowired
    private AlertMapper alertMapper;

    @Autowired
    private AssetMapper assetMapper;

    @Autowired
    private CloudHostMapper cloudHostMapper;

    @Autowired
    private CloudVirtualMachineMapper cloudVirtualMachineMapper;

    @Autowired
    private CloudStorageMapper cloudStorageMapper;

    @Override
    public List<Alert> filterAlerts(String severity, String status, String deviceType, String keyword, String alertCategory, String startTime, String endTime) {
        log.info("筛选告警信息: severity={}, status={}, deviceType={}, keyword={}, alertCategory={}, startTime={}, endTime={}",
                severity, status, deviceType, keyword, alertCategory, startTime, endTime);

        try {
            QueryWrapper<Alert> queryWrapper = new QueryWrapper<>();

            // 基本过滤条件
            queryWrapper.eq("deleted", 0);

            // 严重程度过滤
            if (severity != null && !severity.trim().isEmpty() && !"全部".equals(severity)) {
                queryWrapper.eq("severity", severity);
            }

            // 状态过滤（支持多状态，用逗号分隔）
            if (status != null && !status.trim().isEmpty() && !"全部".equals(status)) {
                // 检查是否包含多个状态（用逗号分隔）
                if (status.contains(",")) {
                    // 多状态筛选
                    String[] statusArray = status.split(",");
                    List<String> dbStatusList = new ArrayList<>();
                    for (String s : statusArray) {
                        dbStatusList.add(mapStatusToDb(s.trim()));
                    }
                    queryWrapper.in("status", dbStatusList);
                } else {
                    // 单状态筛选
                    String dbStatus = mapStatusToDb(status);
                    queryWrapper.eq("status", dbStatus);
                }
            }

            // 设备类型过滤
            if (deviceType != null && !deviceType.trim().isEmpty() && !"全部".equals(deviceType)) {
                // 设备类型映射：前端中文 -> 数据库英文
                String dbDeviceType = deviceType;
                switch (deviceType) {
                    case "服务器":
                        dbDeviceType = "server";
                        break;
                    case "网络设备":
                        dbDeviceType = "network";
                        break;
                    case "存储设备":
                        dbDeviceType = "storage";
                        break;
                }
                queryWrapper.eq("device_type", dbDeviceType);
            }

            // 告警分类过滤
            if (alertCategory != null && !alertCategory.trim().isEmpty()) {
                queryWrapper.eq("alert_category", alertCategory);
            }

            // 关键字搜索
            if (keyword != null && !keyword.trim().isEmpty()) {
                queryWrapper.and(wrapper -> wrapper
                    .like("message", keyword)
                    .or()
                    .like("device_name", keyword)
                    .or()
                    .like("description", keyword)
                );
            }

            // 时间范围过滤
            if (startTime != null && !startTime.trim().isEmpty()) {
                queryWrapper.ge("occurred_time", startTime + " 00:00:00");
            }
            if (endTime != null && !endTime.trim().isEmpty()) {
                queryWrapper.le("occurred_time", endTime + " 23:59:59");
            }

            // 按发生时间倒序
            queryWrapper.orderByDesc("occurred_time");
            
            List<Alert> alerts = alertMapper.selectList(queryWrapper);
            log.info("查询到 {} 条告警记录", alerts.size());
            
            return alerts;
            
        } catch (Exception e) {
            log.error("筛选告警信息失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getStatistics() {
        log.info("获取告警统计信息");
        
        try {
            // 1. 获取告警统计数据
            Map<String, Object> alertStats = alertMapper.getAlertStatistics();
            
            // 2. 获取设备统计数据（只统计设备管理页面显示的三大类设备）
            QueryWrapper<Asset> deviceQuery = new QueryWrapper<>();
            deviceQuery.eq("deleted", 0)
                      .in("category_id", 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);  // 只统计三大类设备
            
            // 总设备数（只包含设备管理页面的三大类）
            Long totalDevices = assetMapper.selectCount(deviceQuery);
            
            // 在线设备数（状态为online或正常的设备，只统计三大类设备）
            QueryWrapper<Asset> onlineQuery = new QueryWrapper<>();
            onlineQuery.eq("deleted", 0)
                      .in("category_id", 5, 6, 7, 8, 9, 10, 11, 12, 13, 14)  // 只统计三大类设备
                      .in("asset_status", "online", "normal", "运行中", "正常");
            Long onlineDevices = assetMapper.selectCount(onlineQuery);
            
            // 异常设备数
            Long abnormalDevices = totalDevices - onlineDevices;
            
            // 3. 按设备类型统计（只统计设备管理页面显示的三大类设备）
            // 服务器类设备 (category_id 5-7: Web服务器、数据库服务器、应用服务器)
            QueryWrapper<Asset> serverQuery = new QueryWrapper<>();
            serverQuery.eq("deleted", 0)
                      .in("category_id", 5, 6, 7);  // Web服务器、数据库服务器、应用服务器
            Long serverDevices = assetMapper.selectCount(serverQuery);
            
            QueryWrapper<Asset> serverOnlineQuery = new QueryWrapper<>();
            serverOnlineQuery.eq("deleted", 0)
                            .in("category_id", 5, 6, 7)
                            .in("asset_status", "online", "normal", "运行中", "正常");
            Long serverOnlineDevices = assetMapper.selectCount(serverOnlineQuery);
            
            // 网络设备 (category_id 8-12: 交换机、路由器、防火墙、无线AP、网关)
            QueryWrapper<Asset> networkQuery = new QueryWrapper<>();
            networkQuery.eq("deleted", 0)
                       .in("category_id", 8, 9, 10, 11, 12);  // 交换机、路由器、防火墙、无线AP、网关
            Long networkDevices = assetMapper.selectCount(networkQuery);
            
            QueryWrapper<Asset> networkOnlineQuery = new QueryWrapper<>();
            networkOnlineQuery.eq("deleted", 0)
                             .in("category_id", 8, 9, 10, 11, 12)
                             .in("asset_status", "online", "normal", "运行中", "正常");
            Long networkOnlineDevices = assetMapper.selectCount(networkOnlineQuery);
            
            // 存储设备 (parent_id = 3: NAS存储、SAN存储)
            QueryWrapper<Asset> storageQuery = new QueryWrapper<>();
            storageQuery.eq("deleted", 0)
                       .in("category_id", 13, 14);  // NAS存储、SAN存储
            Long storageDevices = assetMapper.selectCount(storageQuery);
            
            QueryWrapper<Asset> storageOnlineQuery = new QueryWrapper<>();
            storageOnlineQuery.eq("deleted", 0)
                             .in("category_id", 13, 14)
                             .in("asset_status", "online", "normal", "运行中", "正常");
            Long storageOnlineDevices = assetMapper.selectCount(storageOnlineQuery);

            // 云平台设备统计（从独立的云平台表中获取）
            // 云主机
            QueryWrapper<CloudHost> cloudHostQuery = new QueryWrapper<>();
            Long cloudHostTotal = cloudHostMapper.selectCount(cloudHostQuery);

            QueryWrapper<CloudHost> cloudHostOnlineQuery = new QueryWrapper<>();
            cloudHostOnlineQuery.eq("status", "running");
            Long cloudHostOnline = cloudHostMapper.selectCount(cloudHostOnlineQuery);

            // 虚拟机
            QueryWrapper<CloudVirtualMachine> vmQuery = new QueryWrapper<>();
            Long vmTotal = cloudVirtualMachineMapper.selectCount(vmQuery);

            QueryWrapper<CloudVirtualMachine> vmOnlineQuery = new QueryWrapper<>();
            vmOnlineQuery.eq("status", "running");
            Long vmOnline = cloudVirtualMachineMapper.selectCount(vmOnlineQuery);

            // 云存储
            QueryWrapper<CloudStorage> cloudStorageQuery = new QueryWrapper<>();
            Long cloudStorageTotal = cloudStorageMapper.selectCount(cloudStorageQuery);

            QueryWrapper<CloudStorage> cloudStorageOnlineQuery = new QueryWrapper<>();
            cloudStorageOnlineQuery.eq("status", "in-use");
            Long cloudStorageOnline = cloudStorageMapper.selectCount(cloudStorageOnlineQuery);

            // 云平台汇总
            Long cloudDevices = cloudHostTotal + vmTotal + cloudStorageTotal;
            Long cloudOnlineDevices = cloudHostOnline + vmOnline + cloudStorageOnline;
            
            // 4. 构建返回结果
            Map<String, Object> statistics = new HashMap<>();
            
            // 告警统计
            statistics.put("total", alertStats.get("total"));
            statistics.put("critical", alertStats.get("critical"));
            statistics.put("warning", alertStats.get("warning"));
            statistics.put("info", alertStats.get("info"));
            statistics.put("activeCount", alertStats.get("activeCount"));
            statistics.put("acknowledgedCount", alertStats.get("acknowledgedCount"));
            statistics.put("resolvedCount", alertStats.get("resolvedCount"));
            
            // 设备统计
            statistics.put("totalDevices", totalDevices);
            statistics.put("onlineDevices", onlineDevices);
            statistics.put("abnormalDevices", abnormalDevices);
            
            // 分类设备统计
            statistics.put("networkDevices", networkDevices);
            statistics.put("networkOnlineDevices", networkOnlineDevices);
            statistics.put("serverDevices", serverDevices);
            statistics.put("serverOnlineDevices", serverOnlineDevices);
            statistics.put("storageDevices", storageDevices);
            statistics.put("storageOnlineDevices", storageOnlineDevices);

            // 云平台统计
            statistics.put("cloudDevices", cloudDevices);
            statistics.put("cloudOnlineDevices", cloudOnlineDevices);
            statistics.put("cloudHostTotal", cloudHostTotal);
            statistics.put("cloudHostOnline", cloudHostOnline);
            statistics.put("vmTotal", vmTotal);
            statistics.put("vmOnline", vmOnline);
            statistics.put("cloudStorageTotal", cloudStorageTotal);
            statistics.put("cloudStorageOnline", cloudStorageOnline);
            
            // 5. 授权管理信息
            // 假设最大授权设备数为215台（可以从配置文件或数据库读取）
            Long maxLicensedDevices = 215L;
            Long remainingDevices = Math.max(0, maxLicensedDevices - totalDevices);
            
            // 假设授权到期时间为3年后（可以从配置文件或数据库读取）
            java.time.LocalDate currentDate = java.time.LocalDate.now();
            java.time.LocalDate licenseEndDate = currentDate.plusYears(3);
            long remainingDays = java.time.temporal.ChronoUnit.DAYS.between(currentDate, licenseEndDate);
            
            statistics.put("maxLicensedDevices", maxLicensedDevices);
            statistics.put("remainingDevices", remainingDevices);
            statistics.put("remainingDays", remainingDays);
            statistics.put("licenseEndDate", licenseEndDate.toString());
            
            log.info("告警统计结果: {}", statistics);
            log.info("授权管理信息: 最大设备数={}, 当前设备数={}, 剩余设备数={}, 剩余天数={}", 
                    maxLicensedDevices, totalDevices, remainingDevices, remainingDays);
            return statistics;
            
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            // 返回默认值
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("total", 0);
            statistics.put("critical", 0);
            statistics.put("warning", 0);
            statistics.put("info", 0);
            statistics.put("activeCount", 0);
            statistics.put("acknowledgedCount", 0);
            statistics.put("resolvedCount", 0);
            statistics.put("totalDevices", 0);
            statistics.put("onlineDevices", 0);
            statistics.put("abnormalDevices", 0);
            statistics.put("networkDevices", 0);
            statistics.put("networkOnlineDevices", 0);
            statistics.put("serverDevices", 0);
            statistics.put("serverOnlineDevices", 0);
            statistics.put("storageDevices", 0);
            statistics.put("storageOnlineDevices", 0);
            return statistics;
        }
    }

    @Override
    public List<Alert> getAllAlerts() {
        log.info("获取所有告警信息");
        // TODO: 实现获取所有告警逻辑
        return new ArrayList<>();
    }

    @Override
    public Alert getAlertById(String id) {
        log.info("根据ID获取告警信息: {}", id);
        
        try {
            Long alertId = Long.parseLong(id);
            Alert alert = alertMapper.selectById(alertId);
            if (alert == null) {
                log.warn("告警不存在: id={}", id);
                return null;
            }
            return alert;
        } catch (NumberFormatException e) {
            log.error("告警ID格式错误: id={}", id, e);
            return null;
        } catch (Exception e) {
            log.error("获取告警详情异常: id={}", id, e);
            return null;
        }
    }

    @Override
    public boolean addAlert(Alert alert) {
        log.info("添加告警信息: {}", alert);
        // TODO: 实现添加告警逻辑
        return true;
    }

    @Override
    public boolean updateAlert(Alert alert) {
        log.info("修改告警信息: {}", alert);
        // TODO: 实现修改告警逻辑
        return true;
    }

    @Override
    public boolean deleteAlert(Long id) {
        log.info("删除告警信息: {}", id);
        // TODO: 实现删除告警逻辑
        return true;
    }

    @Override
    public boolean acknowledgeAlert(Long id, String username) {
        log.info("确认告警信息: id={}, username={}", id, username);
        
        try {
            // 查询告警是否存在
            Alert alert = alertMapper.selectById(id);
            if (alert == null) {
                log.warn("告警不存在: id={}", id);
                return false;
            }
            
            // 检查告警状态，只有活跃状态的告警才能被确认
            if (!"active".equals(alert.getStatus())) {
                log.warn("告警状态不是活跃状态，无法确认: id={}, status={}", id, alert.getStatus());
                return false;
            }
            
            // 更新告警状态为已确认
            Alert updateAlert = new Alert();
            updateAlert.setId(id);
            updateAlert.setStatus("acknowledged");
            updateAlert.setAcknowledgedBy(username);
            updateAlert.setAcknowledgedTime(java.time.LocalDateTime.now());
            
            int result = alertMapper.updateById(updateAlert);
            
            if (result > 0) {
                log.info("告警确认成功: id={}, username={}", id, username);
                return true;
            } else {
                log.error("告警确认失败: id={}, username={}", id, username);
                return false;
            }
            
        } catch (Exception e) {
            log.error("确认告警异常: id={}, username={}", id, username, e);
            return false;
        }
    }

    @Override
    public boolean resolveAlert(Long id, String username) {
        log.info("解决告警信息: id={}, username={}", id, username);
        
        try {
            // 查询告警是否存在
            Alert alert = alertMapper.selectById(id);
            if (alert == null) {
                log.warn("告警不存在: id={}", id);
                return false;
            }
            
            // 检查告警状态，已解决的告警不能重复解决
            if ("resolved".equals(alert.getStatus())) {
                log.warn("告警已经是解决状态，无法重复解决: id={}, status={}", id, alert.getStatus());
                return false;
            }
            
            // 更新告警状态为已解决
            Alert updateAlert = new Alert();
            updateAlert.setId(id);
            updateAlert.setStatus("resolved");
            updateAlert.setResolvedBy(username);
            updateAlert.setResolvedTime(java.time.LocalDateTime.now());
            
            int result = alertMapper.updateById(updateAlert);
            
            if (result > 0) {
                log.info("告警解决成功: id={}, username={}", id, username);
                return true;
            } else {
                log.error("告警解决失败: id={}, username={}", id, username);
                return false;
            }
            
        } catch (Exception e) {
            log.error("解决告警异常: id={}, username={}", id, username, e);
            return false;
        }
    }

    @Override
    public Map<String, Object> getAlertTrend() {
        log.info("获取告警趋势");
        
        try {
            // 生成近7天的日期
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            List<String> dates = new ArrayList<>();
            List<Integer> counts = new ArrayList<>();
            
            // 查询最近7天的真实告警数据
            for (int i = 6; i >= 0; i--) {
                java.time.LocalDate date = today.minusDays(i);
                String dateStr = date.format(formatter);
                dates.add(dateStr);
                
                // 查询当天的告警数量
                QueryWrapper<Alert> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("deleted", 0);
                
                // 设置日期范围：当天00:00:00到23:59:59
                String startTime = dateStr + " 00:00:00";
                String endTime = dateStr + " 23:59:59";
                queryWrapper.between("occurred_time", startTime, endTime);
                
                Long dayCount = alertMapper.selectCount(queryWrapper);
                counts.add(dayCount.intValue());
                
                log.debug("日期: {}, 告警数量: {}", dateStr, dayCount);
            }
            
            Map<String, Object> trend = new HashMap<>();
            trend.put("dates", dates);
            trend.put("counts", counts);
            
            log.info("获取7天真实告警趋势数据: dates={}, counts={}", dates, counts);
            return trend;
            
        } catch (Exception e) {
            log.error("获取告警趋势数据失败，使用默认数据", e);
            
            // 如果查询失败，返回默认数据
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            List<String> dates = new ArrayList<>();
            List<Integer> counts = new ArrayList<>();
            
            for (int i = 6; i >= 0; i--) {
                java.time.LocalDate date = today.minusDays(i);
                dates.add(date.format(formatter));
                counts.add(0); // 默认为0
            }
            
            Map<String, Object> trend = new HashMap<>();
            trend.put("dates", dates);
            trend.put("counts", counts);
            
            return trend;
        }
    }

    @Override
    public List<Alert> getRecentAlerts(Integer limit) {
        log.info("获取最近的告警列表: limit={}", limit);
        
        try {
            // 设置默认限制数量
            if (limit == null || limit <= 0) {
                limit = 10;
            }
            
            QueryWrapper<Alert> queryWrapper = new QueryWrapper<>();
            
            // 基本过滤条件
            queryWrapper.eq("deleted", 0);
            
            // 按发生时间倒序，获取最近的告警
            queryWrapper.orderByDesc("occurred_time");
            
            // 限制返回数量
            queryWrapper.last("LIMIT " + limit);
            
            List<Alert> alerts = alertMapper.selectList(queryWrapper);
            log.info("查询到 {} 条最近告警记录", alerts.size());
            
            return alerts;
            
        } catch (Exception e) {
            log.error("获取最近告警列表失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 状态映射：前端值 -> 数据库值
     */
    private String mapStatusToDb(String status) {
        if (status == null) return status;
        switch (status) {
            case "活跃":
                return "active";
            case "已确认":
                return "acknowledged";
            case "已解决":
                return "resolved";
            default:
                return status; // 如果已经是英文状态值，直接返回
        }
    }
}