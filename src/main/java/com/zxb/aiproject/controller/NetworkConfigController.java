package com.zxb.aiproject.controller;

import com.zxb.aiproject.service.NetworkConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 网络配置管理Controller
 */
@RestController
@RequestMapping("/network/config")
@Slf4j
@CrossOrigin
public class NetworkConfigController {

    @Autowired
    private NetworkConfigService networkConfigService;

    /**
     * 获取配置统计数据
     */
    @GetMapping("/stats")
    public Map<String, Object> getConfigStats() {
        log.info("获取配置统计数据");
        return networkConfigService.getConfigStats();
    }

    /**
     * 获取设备配置列表
     */
    @GetMapping("/devices")
    public Map<String, Object> getDeviceConfigs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String timeFilter) {
        log.info("获取设备配置列表: keyword={}, timeFilter={}", keyword, timeFilter);
        return networkConfigService.getDeviceConfigs(keyword, timeFilter);
    }
}
