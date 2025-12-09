package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.CloudHost;

import java.util.List;

/**
 * 云平台云主机Service接口
 */
public interface CloudHostService extends IService<CloudHost> {
    
    /**
     * 根据云平台提供商获取云主机列表
     */
    List<CloudHost> listByProvider(String provider);
    
    /**
     * 根据状态筛选云主机
     */
    List<CloudHost> listByProviderAndStatus(String provider, String status);
    
    /**
     * 搜索云主机
     */
    List<CloudHost> searchHosts(String provider, String keyword);
    
    /**
     * 创建云主机
     */
    boolean createHost(CloudHost host);
    
    /**
     * 重启云主机
     */
    boolean rebootHost(Long id);
}
