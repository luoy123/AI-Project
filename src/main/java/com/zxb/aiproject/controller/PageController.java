package com.zxb.aiproject.controller;

import org.springframework.stereotype.Controller;


import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 页面控制器
 * 处理页面跳转请求
 */
@Controller
public class PageController extends BaseController {

    /**
     * 总览页面
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "总览");
        return "dashboard";
    }

    /**
     * 告警中心页面
     */
    @GetMapping("/alert-center")
    public String alertCenter(Model model) {
        model.addAttribute("pageTitle", "告警中心");
        return "alert-center";
    }

    /**
     * 视图页面
     */
    @GetMapping("/view")
    public String view(Model model) {
        model.addAttribute("pageTitle", "视图");
        return "view";
    }

    /**
     * 设备管理页面
     */
    @GetMapping("/device-management")
    public String deviceManagement(Model model) {
        model.addAttribute("pageTitle", "设备管理");
        return "device-management";
    }

    /**
     * 网络拓扑页面
     */
    @GetMapping("/network-topology")
    public String networkTopology(Model model) {
        model.addAttribute("pageTitle", "网络拓扑");
        return "network-topology";
    }

    /**
     * 统计报表页面
     */
    @GetMapping("/statistics")
    public String statistics(Model model) {
        model.addAttribute("pageTitle", "统计报表");
        return "statistics";
    }

    /**
     * 运维工具页面
     */
    @GetMapping("/ops-tools")
    public String opsTools(Model model) {
        model.addAttribute("pageTitle", "运维工具");
        return "ops-tools";
    }

    /**
     * 测试页面 - 验证Thymeleaf和用户下拉菜单
     */
    @GetMapping("/test")
    public String test(Model model) {
        model.addAttribute("pageTitle", "Thymeleaf测试页面");
        return "test";
    }
}
