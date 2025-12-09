package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.CloudStorage;

import java.util.List;

/**
 * 云平台存储Service接口
 */
public interface CloudStorageService extends IService<CloudStorage> {
    
    /**
     * 根据云平台提供商获取存储列表
     */
    List<CloudStorage> listByProvider(String provider);
    
    /**
     * 根据存储类型筛选
     */
    List<CloudStorage> listByProviderAndType(String provider, String storageType);
    
    /**
     * 搜索存储
     */
    List<CloudStorage> searchStorage(String provider, String keyword);
    
    /**
     * 创建存储
     */
    boolean createStorage(CloudStorage storage);
}
