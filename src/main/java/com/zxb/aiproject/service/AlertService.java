package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.Alert;

import java.util.List;
import java.util.Map;

public interface AlertService {

    /**
     * 根据条件筛选告警信息
     * @param severity
     * @param status
     * @param deviceType
     * @param keyword
     * @param alertCategory
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return
     */
    List<Alert> filterAlerts(String severity, String status,String deviceType,String keyword,String alertCategory,String startTime,String endTime);

    /**
     * 获取告警信息
     * @return
     */
    Map<String,Object> getStatistics();

    /**
     * 获取所有的告警信息
     * @return
     */
    List<Alert> getAllAlerts();

    /**
     * 根据Id获取告警信息
     */
    Alert getAlertById(String id);

    /**
     * 添加告警信息
     */
    boolean addAlert(Alert alert);

    /**
     * 修改告警信息
     */
    boolean updateAlert(Alert alert);

    /**
     * 删除告警信息
     */
    boolean deleteAlert(Long id);

    /**
     * 确认告警信息
     * @param id
     * @param username 确认人
     * @return
     */
    boolean acknowledgeAlert(Long id ,String username);

    /**
     * 解决告警信息
     * @param id
     * @param username
     * @return
     */
    boolean resolveAlert(Long id,String username);

    Map<String,Object> getAlertTrend();

    /**
     * 获取最近的告警列表
     * @param limit 限制数量
     * @return 最近告警列表
     */
    List<Alert> getRecentAlerts(Integer limit);

}
