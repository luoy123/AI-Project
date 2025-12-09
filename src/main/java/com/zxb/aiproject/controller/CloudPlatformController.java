package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.CloudAlert;
import com.zxb.aiproject.entity.CloudHost;
import com.zxb.aiproject.entity.CloudStorage;
import com.zxb.aiproject.entity.CloudVirtualMachine;
import com.zxb.aiproject.service.CloudAlertService;
import com.zxb.aiproject.service.CloudHostService;
import com.zxb.aiproject.service.CloudStorageService;
import com.zxb.aiproject.service.CloudVirtualMachineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 云平台管理Controller
 */
@RestController
@RequestMapping("/cloud")
public class CloudPlatformController {
    
    @Autowired
    private CloudVirtualMachineService vmService;
    
    @Autowired
    private CloudHostService hostService;
    
    @Autowired
    private CloudStorageService storageService;
    
    @Autowired
    private CloudAlertService alertService;
    
    /**
     * 获取虚拟机列表
     */
    @GetMapping("/vm/list")
    public Map<String, Object> getVMList(
            @RequestParam String provider,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        Map<String, Object> result = new HashMap<>();
        try {
            List<CloudVirtualMachine> list;
            
            if (keyword != null && !keyword.isEmpty()) {
                // 关键字搜索
                list = vmService.searchVMs(provider, keyword);
            } else if (status != null && !status.isEmpty()) {
                // 按状态筛选
                list = vmService.listByProviderAndStatus(provider, status);
            } else {
                // 获取全部
                list = vmService.listByProvider(provider);
            }
            
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", list);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取虚拟机详情
     */
    @GetMapping("/vm/{id}")
    public Map<String, Object> getVMDetail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            CloudVirtualMachine vm = vmService.getById(id);
            if (vm != null) {
                result.put("code", 200);
                result.put("message", "获取成功");
                result.put("data", vm);
            } else {
                result.put("code", 404);
                result.put("message", "虚拟机不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 创建虚拟机
     */
    @PostMapping("/vm/create")
    public Map<String, Object> createVM(@RequestBody CloudVirtualMachine vm) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = vmService.createVM(vm);
            if (success) {
                result.put("code", 200);
                result.put("message", "创建成功");
            } else {
                result.put("code", 500);
                result.put("message", "创建失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "创建失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 启动虚拟机
     */
    @PutMapping("/vm/{id}/start")
    public Map<String, Object> startVM(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = vmService.startVM(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "启动成功");
            } else {
                result.put("code", 500);
                result.put("message", "启动失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "启动失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 停止虚拟机
     */
    @PutMapping("/vm/{id}/stop")
    public Map<String, Object> stopVM(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = vmService.stopVM(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "停止成功");
            } else {
                result.put("code", 500);
                result.put("message", "停止失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "停止失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除虚拟机
     */
    @DeleteMapping("/vm/{id}")
    public Map<String, Object> deleteVM(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = vmService.removeById(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取概览统计数据
     */
    @GetMapping("/overview/{provider}")
    public Map<String, Object> getOverview(@PathVariable String provider) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> stats = vmService.getOverviewStats(provider);
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", stats);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    // ==================== 云主机管理接口 ====================
    
    /**
     * 获取云主机列表
     */
    @GetMapping("/host/list")
    public Map<String, Object> getHostList(
            @RequestParam String provider,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        Map<String, Object> result = new HashMap<>();
        try {
            List<CloudHost> list;
            
            if (keyword != null && !keyword.isEmpty()) {
                list = hostService.searchHosts(provider, keyword);
            } else if (status != null && !status.isEmpty()) {
                list = hostService.listByProviderAndStatus(provider, status);
            } else {
                list = hostService.listByProvider(provider);
            }
            
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", list);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取云主机详情
     */
    @GetMapping("/host/{id}")
    public Map<String, Object> getHostDetail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            CloudHost host = hostService.getById(id);
            if (host != null) {
                result.put("code", 200);
                result.put("message", "获取成功");
                result.put("data", host);
            } else {
                result.put("code", 404);
                result.put("message", "云主机不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 重启云主机
     */
    @PutMapping("/host/{id}/reboot")
    public Map<String, Object> rebootHost(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = hostService.rebootHost(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "重启成功");
            } else {
                result.put("code", 500);
                result.put("message", "重启失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "重启失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除云主机
     */
    @DeleteMapping("/host/{id}")
    public Map<String, Object> deleteHost(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = hostService.removeById(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
    
    // ==================== 云存储管理接口 ====================
    
    /**
     * 获取云存储列表
     */
    @GetMapping("/storage/list")
    public Map<String, Object> getStorageList(
            @RequestParam String provider,
            @RequestParam(required = false) String storageType,
            @RequestParam(required = false) String keyword) {
        
        Map<String, Object> result = new HashMap<>();
        try {
            List<CloudStorage> list;
            
            if (keyword != null && !keyword.isEmpty()) {
                list = storageService.searchStorage(provider, keyword);
            } else if (storageType != null && !storageType.isEmpty()) {
                list = storageService.listByProviderAndType(provider, storageType);
            } else {
                list = storageService.listByProvider(provider);
            }
            
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", list);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取云存储详情
     */
    @GetMapping("/storage/{id}")
    public Map<String, Object> getStorageDetail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            CloudStorage storage = storageService.getById(id);
            if (storage != null) {
                result.put("code", 200);
                result.put("message", "获取成功");
                result.put("data", storage);
            } else {
                result.put("code", 404);
                result.put("message", "存储不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 删除云存储
     */
    @DeleteMapping("/storage/{id}")
    public Map<String, Object> deleteStorage(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = storageService.removeById(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
    
    // ==================== 监控告警接口 ====================
    
    /**
     * 获取告警列表
     */
    @GetMapping("/alert/list")
    public Map<String, Object> getAlertList(
            @RequestParam String provider,
            @RequestParam(required = false) String alertLevel,
            @RequestParam(required = false) String alertStatus) {
        
        Map<String, Object> result = new HashMap<>();
        try {
            List<CloudAlert> list;
            
            if (alertLevel != null && !alertLevel.isEmpty()) {
                list = alertService.listByProviderAndLevel(provider, alertLevel);
            } else if (alertStatus != null && !alertStatus.isEmpty()) {
                list = alertService.listByProviderAndStatus(provider, alertStatus);
            } else {
                list = alertService.listByProvider(provider);
            }
            
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", list);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取告警详情
     */
    @GetMapping("/alert/{id}")
    public Map<String, Object> getAlertDetail(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            CloudAlert alert = alertService.getById(id);
            if (alert != null) {
                result.put("code", 200);
                result.put("message", "获取成功");
                result.put("data", alert);
            } else {
                result.put("code", 404);
                result.put("message", "告警不存在");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }
    
    /**
     * 解决告警
     */
    @PutMapping("/alert/{id}/resolve")
    public Map<String, Object> resolveAlert(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = alertService.resolveAlert(id);
            if (success) {
                result.put("code", 200);
                result.put("message", "告警已解决");
            } else {
                result.put("code", 500);
                result.put("message", "操作失败");
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "操作失败: " + e.getMessage());
        }
        return result;
    }
}
