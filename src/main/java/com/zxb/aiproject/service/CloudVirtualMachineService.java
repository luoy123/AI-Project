package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.CloudVirtualMachine;

import java.util.List;
import java.util.Map;

/**
 * 云平台虚拟机Service接口
 */
public interface CloudVirtualMachineService extends IService<CloudVirtualMachine> {
    
    /**
     * 根据云平台提供商获取虚拟机列表
     */
    List<CloudVirtualMachine> listByProvider(String provider);
    
    /**
     * 根据状态筛选虚拟机
     */
    List<CloudVirtualMachine> listByProviderAndStatus(String provider, String status);
    
    /**
     * 搜索虚拟机
     */
    List<CloudVirtualMachine> searchVMs(String provider, String keyword);
    
    /**
     * 创建虚拟机
     */
    boolean createVM(CloudVirtualMachine vm);
    
    /**
     * 启动虚拟机
     */
    boolean startVM(Long id);
    
    /**
     * 停止虚拟机
     */
    boolean stopVM(Long id);
    
    /**
     * 获取概览统计数据
     */
    Map<String, Object> getOverviewStats(String provider);
}
