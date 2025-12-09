package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.mapper.AssetMapper;
import com.zxb.aiproject.service.NetworkDeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 网络设备服务实现类
 */
@Service
@Slf4j
public class NetworkDeviceServiceImpl implements NetworkDeviceService {

    @Autowired
    private AssetMapper assetMapper;

    // 网络设备分类ID：2是网络设备，8-12是具体的网络设备子类
    private static final List<Long> NETWORK_CATEGORY_IDS = Arrays.asList(2L, 8L, 9L, 10L, 11L, 12L);

    @Override
    public Map<String, Object> getDeviceList(String deviceType, String status, String keyword) {
        log.info("获取设备列表: deviceType={}, status={}, keyword={}", deviceType, status, keyword);
        
        try {
            QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
            
            // 只查询网络设备
            queryWrapper.in("category_id", NETWORK_CATEGORY_IDS);
            
            // 状态过滤
            if (status != null && !status.isEmpty()) {
                queryWrapper.eq("asset_status", status);
            }
            
            // 关键字搜索
            if (keyword != null && !keyword.isEmpty()) {
                queryWrapper.and(wrapper -> wrapper
                    .like("asset_name", keyword)
                    .or()
                    .like("ip_address", keyword)
                    .or()
                    .like("location", keyword)
                );
            }
            
            // 设备类型过滤（根据category_id）
            if (deviceType != null && !deviceType.isEmpty()) {
                switch (deviceType) {
                    case "switch":
                        queryWrapper.eq("category_id", 8L); // 交换机
                        break;
                    case "router":
                        queryWrapper.eq("category_id", 9L); // 路由器
                        break;
                    case "firewall":
                        queryWrapper.eq("category_id", 10L); // 防火墙
                        break;
                    case "ap":
                        queryWrapper.eq("category_id", 11L); // 无线AP
                        break;
                    case "gateway":
                        queryWrapper.eq("category_id", 12L); // 网关
                        break;
                }
            }
            
            // 排除已删除的
            queryWrapper.eq("deleted", 0);
            
            List<Asset> devices = assetMapper.selectList(queryWrapper);
            
            Map<String, Object> result = new HashMap<>();
            result.put("records", devices);
            result.put("total", devices.size());
            
            log.info("查询到网络设备数量: {}", devices.size());
            return result;
            
        } catch (Exception e) {
            log.error("获取网络设备列表失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("records", new ArrayList<>());
            result.put("total", 0);
            return result;
        }
    }

    @Override
    public Map<String, Object> getDeviceDetail(Long id) {
        log.info("获取设备详情: {}", id);
        
        try {
            Asset device = assetMapper.selectById(id);
            if (device != null && NETWORK_CATEGORY_IDS.contains(device.getCategoryId())) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("data", device);
                return result;
            } else {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "设备不存在或不是网络设备");
                return result;
            }
        } catch (Exception e) {
            log.error("获取设备详情失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "获取设备详情失败");
            return result;
        }
    }

    @Override
    public Map<String, Object> getDeviceStats() {
        log.info("获取设备统计");
        
        try {
            QueryWrapper<Asset> queryWrapper = new QueryWrapper<>();
            queryWrapper.in("category_id", NETWORK_CATEGORY_IDS);
            queryWrapper.eq("deleted", 0);
            
            log.info("查询条件 - category_id in: {}, deleted: 0", NETWORK_CATEGORY_IDS);
            
            List<Asset> allDevices = assetMapper.selectList(queryWrapper);
            log.info("查询到的设备数量: {}", allDevices.size());
            
            if (!allDevices.isEmpty()) {
                log.info("设备列表: {}", allDevices.stream()
                    .map(d -> d.getAssetName() + "(" + d.getCategoryId() + ")")
                    .toArray());
            }
            
            long totalCount = allDevices.size();
            long onlineCount = allDevices.stream()
                .filter(device -> "online".equals(device.getAssetStatus()))
                .count();
            long offlineCount = totalCount - onlineCount;
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCount", totalCount);
            stats.put("onlineCount", onlineCount);
            stats.put("offlineCount", offlineCount);
            
            log.info("网络设备统计 - 总数: {}, 在线: {}, 离线: {}", totalCount, onlineCount, offlineCount);
            return stats;
            
        } catch (Exception e) {
            log.error("获取设备统计失败", e);
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCount", 0);
            stats.put("onlineCount", 0);
            stats.put("offlineCount", 0);
            return stats;
        }
    }
}
