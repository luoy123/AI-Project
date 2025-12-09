package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.CloudHost;
import com.zxb.aiproject.mapper.CloudHostMapper;
import com.zxb.aiproject.service.CloudHostService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 云平台云主机Service实现类
 */
@Service
public class CloudHostServiceImpl extends ServiceImpl<CloudHostMapper, CloudHost> 
        implements CloudHostService {
    
    @Override
    public List<CloudHost> listByProvider(String provider) {
        LambdaQueryWrapper<CloudHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudHost::getProvider, provider)
               .orderByDesc(CloudHost::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudHost> listByProviderAndStatus(String provider, String status) {
        LambdaQueryWrapper<CloudHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudHost::getProvider, provider)
               .eq(CloudHost::getStatus, status)
               .orderByDesc(CloudHost::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudHost> searchHosts(String provider, String keyword) {
        LambdaQueryWrapper<CloudHost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudHost::getProvider, provider)
               .like(CloudHost::getHostName, keyword)
               .orderByDesc(CloudHost::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public boolean createHost(CloudHost host) {
        host.setCreatedTime(LocalDateTime.now());
        host.setUpdatedTime(LocalDateTime.now());
        return save(host);
    }
    
    @Override
    public boolean rebootHost(Long id) {
        CloudHost host = getById(id);
        if (host != null) {
            host.setUpdatedTime(LocalDateTime.now());
            return updateById(host);
        }
        return false;
    }
}
