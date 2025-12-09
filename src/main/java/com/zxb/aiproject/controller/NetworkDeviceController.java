package com.zxb.aiproject.controller;

import com.zxb.aiproject.service.NetworkDeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 网络设备管理Controller
 */
@RestController
@RequestMapping("/network")
@Slf4j
@CrossOrigin
public class NetworkDeviceController {

    @Autowired
    private NetworkDeviceService networkDeviceService;

    /**
     * 获取网络设备统计数据
     */
    @GetMapping("/devices/stats")
    public Map<String, Object> getDeviceStats() {
        log.info("获取网络设备统计数据");
        return networkDeviceService.getDeviceStats();
    }

    /**
     * 获取网络设备列表（支持过滤）
     */
    @GetMapping("/devices")
    public Map<String, Object> getDeviceList(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        log.info("获取网络设备列表 - type: {}, status: {}, keyword: {}", type, status, keyword);
        return networkDeviceService.getDeviceList(type, status, keyword);
    }

    /**
     * 获取设备详情
     */
    @GetMapping("/devices/{id}")
    public Map<String, Object> getDeviceDetail(@PathVariable Long id) {
        log.info("获取设备详情 - id: {}", id);
        return networkDeviceService.getDeviceDetail(id);
    }
}
