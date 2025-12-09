package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.NetworkLine;

import java.util.Map;

/**
 * 专线管理服务接口
 */
public interface NetworkLineService {
    
    /**
     * 获取专线列表
     */
    Map<String, Object> getLinesList(String provider, String status, String keyword);
    
    /**
     * 获取专线详情
     */
    NetworkLine getLineDetail(Long id);
    
    /**
     * 添加专线
     */
    boolean addLine(NetworkLine line);
    
    /**
     * 更新专线
     */
    boolean updateLine(NetworkLine line);
    
    /**
     * 删除专线
     */
    boolean deleteLine(Long id);
}
