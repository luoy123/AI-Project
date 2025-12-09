package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.CloudStorage;
import com.zxb.aiproject.mapper.CloudStorageMapper;
import com.zxb.aiproject.service.CloudStorageService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 云平台存储Service实现类
 */
@Service
public class CloudStorageServiceImpl extends ServiceImpl<CloudStorageMapper, CloudStorage> 
        implements CloudStorageService {
    
    @Override
    public List<CloudStorage> listByProvider(String provider) {
        LambdaQueryWrapper<CloudStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudStorage::getProvider, provider)
               .orderByDesc(CloudStorage::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudStorage> listByProviderAndType(String provider, String storageType) {
        LambdaQueryWrapper<CloudStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudStorage::getProvider, provider)
               .eq(CloudStorage::getStorageType, storageType)
               .orderByDesc(CloudStorage::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudStorage> searchStorage(String provider, String keyword) {
        LambdaQueryWrapper<CloudStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudStorage::getProvider, provider)
               .like(CloudStorage::getStorageName, keyword)
               .orderByDesc(CloudStorage::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public boolean createStorage(CloudStorage storage) {
        storage.setCreatedTime(LocalDateTime.now());
        storage.setUpdatedTime(LocalDateTime.now());
        return save(storage);
    }
}
