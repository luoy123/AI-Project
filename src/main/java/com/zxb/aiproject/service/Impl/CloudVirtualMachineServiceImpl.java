package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.CloudVirtualMachine;
import com.zxb.aiproject.mapper.CloudVirtualMachineMapper;
import com.zxb.aiproject.service.CloudVirtualMachineService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 云平台虚拟机Service实现类
 */
@Service
public class CloudVirtualMachineServiceImpl extends ServiceImpl<CloudVirtualMachineMapper, CloudVirtualMachine> 
        implements CloudVirtualMachineService {
    
    @Override
    public List<CloudVirtualMachine> listByProvider(String provider) {
        LambdaQueryWrapper<CloudVirtualMachine> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .orderByDesc(CloudVirtualMachine::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudVirtualMachine> listByProviderAndStatus(String provider, String status) {
        LambdaQueryWrapper<CloudVirtualMachine> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .eq(CloudVirtualMachine::getStatus, status)
               .orderByDesc(CloudVirtualMachine::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public List<CloudVirtualMachine> searchVMs(String provider, String keyword) {
        LambdaQueryWrapper<CloudVirtualMachine> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .like(CloudVirtualMachine::getVmName, keyword)
               .orderByDesc(CloudVirtualMachine::getCreatedTime);
        return list(wrapper);
    }
    
    @Override
    public boolean createVM(CloudVirtualMachine vm) {
        vm.setCreatedTime(LocalDateTime.now());
        vm.setUpdatedTime(LocalDateTime.now());
        return save(vm);
    }
    
    @Override
    public boolean startVM(Long id) {
        CloudVirtualMachine vm = getById(id);
        if (vm != null) {
            vm.setStatus("running");
            vm.setUpdatedTime(LocalDateTime.now());
            return updateById(vm);
        }
        return false;
    }
    
    @Override
    public boolean stopVM(Long id) {
        CloudVirtualMachine vm = getById(id);
        if (vm != null) {
            vm.setStatus("stopped");
            vm.setUpdatedTime(LocalDateTime.now());
            return updateById(vm);
        }
        return false;
    }
    
    @Override
    public Map<String, Object> getOverviewStats(String provider) {
        Map<String, Object> stats = new HashMap<>();
        
        // 统计总数
        LambdaQueryWrapper<CloudVirtualMachine> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider);
        long totalCount = count(wrapper);
        stats.put("totalCount", totalCount);
        
        // 统计运行中的数量
        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .eq(CloudVirtualMachine::getStatus, "running");
        long runningCount = count(wrapper);
        stats.put("runningCount", runningCount);
        
        // 统计已停止的数量
        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .eq(CloudVirtualMachine::getStatus, "stopped");
        long stoppedCount = count(wrapper);
        stats.put("stoppedCount", stoppedCount);
        
        // 统计异常的数量
        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CloudVirtualMachine::getProvider, provider)
               .eq(CloudVirtualMachine::getStatus, "error");
        long errorCount = count(wrapper);
        stats.put("errorCount", errorCount);
        
        // 统计总CPU核数
        List<CloudVirtualMachine> vms = listByProvider(provider);
        int totalCpu = vms.stream().mapToInt(vm -> vm.getCpuCores() != null ? vm.getCpuCores() : 0).sum();
        stats.put("totalCpu", totalCpu);
        
        // 统计总内存
        int totalMemory = vms.stream().mapToInt(vm -> vm.getMemoryGb() != null ? vm.getMemoryGb() : 0).sum();
        stats.put("totalMemory", totalMemory);
        
        // 统计总存储
        int totalStorage = vms.stream().mapToInt(vm -> vm.getDiskGb() != null ? vm.getDiskGb() : 0).sum();
        stats.put("totalStorage", totalStorage);
        
        return stats;
    }
}
