package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zxb.aiproject.entity.LinePerformance;
import com.zxb.aiproject.entity.NetworkLine;
import com.zxb.aiproject.mapper.LinePerformanceMapper;
import com.zxb.aiproject.mapper.NetworkLineMapper;
import com.zxb.aiproject.service.NetworkLineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 网络线路服务实现类
 */
@Service
@Slf4j
public class NetworkLineServiceImpl implements NetworkLineService {

    @Autowired
    private NetworkLineMapper networkLineMapper;
    
    @Autowired
    private LinePerformanceMapper linePerformanceMapper;

    @Override
    public Map<String, Object> getLinesList(String provider, String status, String keyword) {
        log.info("获取线路列表: provider={}, status={}, keyword={}", provider, status, keyword);
        
        try {
            // 构建查询条件
            QueryWrapper<NetworkLine> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("deleted", 0);
            
            // 运营商筛选
            if (provider != null && !provider.trim().isEmpty() && !"全部运营商".equals(provider)) {
                queryWrapper.eq("provider", provider);
            }
            
            // 状态筛选
            if (status != null && !status.trim().isEmpty() && !"全部状态".equals(status)) {
                queryWrapper.eq("status", status);
            }
            
            // 关键字搜索
            if (keyword != null && !keyword.trim().isEmpty()) {
                queryWrapper.and(wrapper -> wrapper
                    .like("name", keyword.trim())
                    .or()
                    .like("circuit_id", keyword.trim())
                    .or()
                    .like("endpoint_a", keyword.trim())
                    .or()
                    .like("endpoint_b", keyword.trim())
                );
            }
            
            queryWrapper.orderByDesc("create_time");
            
            // 查询专线列表
            List<NetworkLine> lines = networkLineMapper.selectList(queryWrapper);
            
            // 为每条专线获取最新的性能数据
            List<Map<String, Object>> result = new ArrayList<>();
            for (NetworkLine line : lines) {
                Map<String, Object> lineData = new HashMap<>();
                lineData.put("id", line.getId());
                lineData.put("name", line.getName());
                lineData.put("circuitId", line.getCircuitId());
                lineData.put("provider", line.getProvider());
                lineData.put("lineType", line.getLineType());
                lineData.put("bandwidth", line.getBandwidth());
                lineData.put("endpointA", line.getEndpointA());
                lineData.put("endpointB", line.getEndpointB());
                lineData.put("status", line.getStatus());
                lineData.put("activationDate", line.getActivationDate());
                lineData.put("expiryDate", line.getExpiryDate());
                lineData.put("contactPerson", line.getContactPerson());
                lineData.put("contactPhone", line.getContactPhone());
                lineData.put("monthlyCost", line.getMonthlyCost());
                lineData.put("notes", line.getNotes());
                
                // 获取最新性能数据
                QueryWrapper<LinePerformance> perfQuery = new QueryWrapper<>();
                perfQuery.eq("line_id", line.getId());
                perfQuery.orderByDesc("probe_time");
                perfQuery.last("LIMIT 1");
                
                LinePerformance latestPerf = linePerformanceMapper.selectOne(perfQuery);
                if (latestPerf != null) {
                    lineData.put("latency", latestPerf.getLatency());
                    lineData.put("jitter", latestPerf.getJitter());
                    lineData.put("packetLoss", latestPerf.getPacketLoss());
                    lineData.put("bandwidthUsage", latestPerf.getBandwidthUsage());
                } else {
                    lineData.put("latency", BigDecimal.ZERO);
                    lineData.put("jitter", BigDecimal.ZERO);
                    lineData.put("packetLoss", BigDecimal.ZERO);
                    lineData.put("bandwidthUsage", BigDecimal.ZERO);
                }
                
                result.add(lineData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("list", result);
            response.put("total", result.size());
            return response;
            
        } catch (Exception e) {
            log.error("获取专线列表失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("list", new ArrayList<>());
            result.put("total", 0);
            return result;
        }
    }

    @Override
    public NetworkLine getLineDetail(Long id) {
        log.info("获取线路详情: {}", id);
        try {
            return networkLineMapper.selectById(id);
        } catch (Exception e) {
            log.error("获取线路详情失败", e);
            return null;
        }
    }

    @Override
    public boolean addLine(NetworkLine line) {
        log.info("添加线路: {}", line);
        try {
            return networkLineMapper.insert(line) > 0;
        } catch (Exception e) {
            log.error("添加线路失败", e);
            return false;
        }
    }

    @Override
    public boolean updateLine(NetworkLine line) {
        log.info("更新线路: {}", line);
        try {
            return networkLineMapper.updateById(line) > 0;
        } catch (Exception e) {
            log.error("更新线路失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteLine(Long id) {
        log.info("删除线路: {}", id);
        try {
            return networkLineMapper.deleteById(id) > 0;
        } catch (Exception e) {
            log.error("删除线路失败", e);
            return false;
        }
    }
}
