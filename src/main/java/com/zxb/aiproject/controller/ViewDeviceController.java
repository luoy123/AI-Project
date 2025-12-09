package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.ViewDevice;
import com.zxb.aiproject.service.ViewDeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 视图设备控制器
 */
@Slf4j
@RestController
@RequestMapping("/view")
public class ViewDeviceController {
    
    @Autowired
    private ViewDeviceService viewDeviceService;
    
    /**
     * 获取设备统计数据（用于顶部卡片）
     * GET /api/view/statistics
     */
    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        log.info("获取设备统计数据");
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> statistics = viewDeviceService.getDeviceStatistics();
            result.put("success", true);
            result.put("data", statistics);
        } catch (Exception e) {
            log.error("获取设备统计数据失败", e);
            result.put("success", false);
            result.put("message", "获取统计数据失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取设备类型分布（用于饼图）
     * GET /api/view/type-distribution
     */
    @GetMapping("/type-distribution")
    public Map<String, Object> getTypeDistribution() {
        log.info("获取设备类型分布");
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> distribution = viewDeviceService.getDeviceTypeDistribution();
            result.put("success", true);
            result.put("data", distribution);
        } catch (Exception e) {
            log.error("获取设备类型分布失败", e);
            result.put("success", false);
            result.put("message", "获取类型分布失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取故障设备统计（用于右侧列表）
     * GET /api/view/fault-statistics
     */
    @GetMapping("/fault-statistics")
    public Map<String, Object> getFaultStatistics() {
        log.info("获取故障设备统计");
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> faultStats = viewDeviceService.getFaultDeviceStatistics();
            result.put("success", true);
            result.put("data", faultStats);
        } catch (Exception e) {
            log.error("获取故障设备统计失败", e);
            result.put("success", false);
            result.put("message", "获取故障统计失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取最近添加的设备
     * GET /api/view/recent?limit=10
     */
    @GetMapping("/recent")
    public Map<String, Object> getRecentDevices(@RequestParam(defaultValue = "10") Integer limit) {
        log.info("获取最近{}条设备", limit);
        Map<String, Object> result = new HashMap<>();
        try {
            List<ViewDevice> devices = viewDeviceService.getRecentDevices(limit);
            result.put("success", true);
            result.put("data", devices);
        } catch (Exception e) {
            log.error("获取最近设备失败", e);
            result.put("success", false);
            result.put("message", "获取最近设备失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取设备列表（支持筛选和分页）
     * GET /api/view/devices?page=1&size=10&deviceType=camera&status=online
     */
    @GetMapping("/devices")
    public Map<String, Object> getDevices(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location) {
        log.info("获取设备列表 - page: {}, size: {}, type: {}, status: {}, location: {}", 
                page, size, deviceType, status, location);
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取所有符合条件的设备
            List<ViewDevice> allDevices = viewDeviceService.getDeviceList(deviceType, status, location);
            
            // 计算分页
            int total = allDevices.size();
            int totalPages = (int) Math.ceil((double) total / size);
            int startIndex = (page - 1) * size;
            int endIndex = Math.min(startIndex + size, total);
            
            // 获取当前页的数据
            List<ViewDevice> pageDevices = startIndex < total ? 
                    allDevices.subList(startIndex, endIndex) : new ArrayList<>();
            
            // 构建分页数据
            Map<String, Object> pageData = new HashMap<>();
            pageData.put("records", pageDevices);
            pageData.put("total", total);
            pageData.put("pages", totalPages);
            pageData.put("current", page);
            pageData.put("size", size);
            
            result.put("success", true);
            result.put("data", pageData);
            
            log.info("返回设备列表: 总数={}, 当前页={}/{}, 当前页记录数={}", 
                    total, page, totalPages, pageDevices.size());
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
            result.put("success", false);
            result.put("message", "获取设备列表失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取设备详情
     * GET /api/view/devices/{id}
     */
    @GetMapping("/devices/{id}")
    public Map<String, Object> getDeviceById(@PathVariable Long id) {
        log.info("获取设备详情 - id: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            ViewDevice device = viewDeviceService.getDeviceById(id);
            if (device != null) {
                result.put("success", true);
                result.put("data", device);
            } else {
                result.put("success", false);
                result.put("message", "设备不存在");
            }
        } catch (Exception e) {
            log.error("获取设备详情失败", e);
            result.put("success", false);
            result.put("message", "获取设备详情失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 添加设备
     * POST /api/view/devices
     */
    @PostMapping("/devices")
    public Map<String, Object> addDevice(@RequestBody ViewDevice device) {
        log.info("添加设备 - name: {}", device.getName());
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = viewDeviceService.addDevice(device);
            result.put("success", success);
            if (success) {
                result.put("message", "添加成功");
            } else {
                result.put("message", "添加失败");
            }
        } catch (Exception e) {
            log.error("添加设备失败", e);
            result.put("success", false);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 更新设备
     * PUT /api/view/devices/{id}
     */
    @PutMapping("/devices/{id}")
    public Map<String, Object> updateDevice(@PathVariable Long id, @RequestBody ViewDevice device) {
        log.info("更新设备 - id: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            device.setId(id);
            boolean success = viewDeviceService.updateDevice(device);
            result.put("success", success);
            if (success) {
                result.put("message", "更新成功");
            } else {
                result.put("message", "更新失败");
            }
        } catch (Exception e) {
            log.error("更新设备失败", e);
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除设备
     * DELETE /api/view/devices/{id}
     */
    @DeleteMapping("/devices/{id}")
    public Map<String, Object> deleteDevice(@PathVariable Long id) {
        log.info("删除设备 - id: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = viewDeviceService.deleteDevice(id);
            result.put("success", success);
            if (success) {
                result.put("message", "删除成功");
            } else {
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            log.error("删除设备失败", e);
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取异常设备趋势
     * GET /api/view/abnormal-trend?days=7
     */
    @GetMapping("/abnormal-trend")
    public Map<String, Object> getAbnormalTrend(@RequestParam(defaultValue = "7") Integer days) {
        log.info("获取{}天异常设备趋势", days);
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> trend = viewDeviceService.getAbnormalTrend(days);
            result.put("success", true);
            result.put("data", trend);
        } catch (Exception e) {
            log.error("获取异常设备趋势失败", e);
            result.put("success", false);
            result.put("message", "获取异常设备趋势失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取设备可用性趋势
     * GET /api/view/availability-trend?days=7
     */
    @GetMapping("/availability-trend")
    public Map<String, Object> getAvailabilityTrend(@RequestParam(defaultValue = "7") Integer days) {
        log.info("获取{}天设备可用性趋势", days);
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> trend = viewDeviceService.getAvailabilityTrend(days);
            result.put("success", true);
            result.put("data", trend);
        } catch (Exception e) {
            log.error("获取设备可用性趋势失败", e);
            result.put("success", false);
            result.put("message", "获取设备可用性趋势失败: " + e.getMessage());
        }
        return result;
    }
}
