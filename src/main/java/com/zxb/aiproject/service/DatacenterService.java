package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zxb.aiproject.entity.Datacenter;
import com.zxb.aiproject.entity.DatacenterCabinet;
import com.zxb.aiproject.mapper.DatacenterCabinetMapper;
import com.zxb.aiproject.mapper.DatacenterMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据中心服务
 */
@Slf4j
@Service
public class DatacenterService {

    @Autowired
    private DatacenterMapper datacenterMapper;

    @Autowired
    private DatacenterCabinetMapper cabinetMapper;

    /**
     * 获取所有机房列表
     */
    public List<Datacenter> getAllDatacenters() {
        LambdaQueryWrapper<Datacenter> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Datacenter::getStatus, "active")
               .orderByAsc(Datacenter::getCode);
        return datacenterMapper.selectList(wrapper);
    }

    /**
     * 根据机房ID获取机柜列表
     */
    public List<DatacenterCabinet> getCabinetsByDatacenterId(Long datacenterId) {
        LambdaQueryWrapper<DatacenterCabinet> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DatacenterCabinet::getDatacenterId, datacenterId)
               .eq(DatacenterCabinet::getStatus, "active")
               .orderByAsc(DatacenterCabinet::getCabinetNumber);
        return cabinetMapper.selectList(wrapper);
    }

    /**
     * 根据机柜ID获取可用U位列表
     */
    public List<Map<String, Object>> getAvailableUPositions(Long cabinetId) {
        DatacenterCabinet cabinet = cabinetMapper.selectById(cabinetId);
        if (cabinet == null) {
            return new ArrayList<>();
        }

        List<Map<String, Object>> uPositions = new ArrayList<>();
        int totalU = cabinet.getUCount() != null ? cabinet.getUCount() : 42;
        
        // 生成U01到U42的列表（从上到下）
        for (int i = 1; i <= totalU; i++) {
            Map<String, Object> position = new HashMap<>();
            String uNumber = String.format("U%02d", i);
            position.put("value", uNumber);
            position.put("label", uNumber);
            position.put("available", true); // TODO: 后续可以检查是否已被占用
            uPositions.add(position);
        }

        return uPositions;
    }
}
