package com.zxb.aiproject.service;

import java.util.List;
import java.util.Map;

/**
 * 智能预测管理Service接口
 */
public interface PredictionService {
    
    /**
     * 获取概览页面统计数据
     * @return 统计数据
     */
    Map<String, Object> getOverviewStats();
    
    /**
     * 获取设备分类故障占比
     * @param predictionTime 预测时间(天)
     * @return 故障占比数据
     */
    Map<String, Object> getDeviceFaultRatio(Integer predictionTime);
    
    /**
     * 获取设备分类故障率列表
     * @param predictionTime 预测时间(天)
     * @return 分类故障率数据
     */
    Map<String, Object> getCategoryFaultRates(Integer predictionTime);
    
    /**
     * 获取预测告警统计
     * @param predictionTime 预测时间(天)
     * @return 告警统计数据
     */
    Map<String, Object> getAlertStats(Integer predictionTime);
    
    /**
     * 获取服务器故障预测统计
     * @param predictionTime 预测时间(天)
     * @return 服务器故障统计数据
     */
    Map<String, Object> getServerFaultStats(Integer predictionTime);
    
    /**
     * 获取其他设备故障预测统计
     * @param predictionTime 预测时间(天)
     * @return 其他设备故障统计数据
     */
    Map<String, Object> getOtherDeviceFaultStats(Integer predictionTime);
    
    /**
     * 获取预测报告分类列表
     * @return 分类列表
     */
    List<Map<String, Object>> getReportCategories();
    
    /**
     * 获取预测报告列表
     * @param categoryId 分类ID
     * @param brand 品牌
     * @param predictionTime 预测时间
     * @param status 状态
     * @return 报告列表
     */
    Map<String, Object> getReports(Long categoryId, String brand, Integer predictionTime, String status);
    
    /**
     * 获取预测风险列表
     * @param predictionTime 预测时间
     * @param riskZone 风险时区
     * @param monitoringCategory 监控类别
     * @param keyword 关键字
     * @return 风险列表
     */
    Map<String, Object> getRisks(Integer predictionTime, String riskZone, String monitoringCategory, String keyword);
    
    /**
     * 获取监测数据
     * @param timeRangeStart 时间范围开始
     * @param timeRangeEnd 时间范围结束
     * @param timeRangeMinutes 时间范围(分钟)
     * @return 监测数据
     */
    Map<String, Object> getMonitoringData(String timeRangeStart, String timeRangeEnd, Integer timeRangeMinutes);
    
    /**
     * 获取算法模型服务列表
     * @param serviceName 服务名
     * @param status 状态
     * @param algorithmType 算法类型
     * @param keyword 关键字
     * @return 服务列表
     */
    Map<String, Object> getAlgorithmServices(String serviceName, String status, String algorithmType, String keyword);
    
    /**
     * 获取服务详情
     * @param id 服务ID
     * @return 服务详情
     */
    Map<String, Object> getServiceDetail(Long id);
    
    /**
     * 创建服务
     * @param dto 服务DTO
     * @return 服务ID
     */
    Long createService(com.zxb.aiproject.dto.PredictionModelServiceDTO dto);
    
    /**
     * 更新服务
     * @param dto 服务DTO
     * @return 是否成功
     */
    boolean updateService(com.zxb.aiproject.dto.PredictionModelServiceDTO dto);
    
    /**
     * 删除服务
     * @param id 服务ID
     * @return 是否成功
     */
    boolean deleteService(Long id);
    
    /**
     * 切换服务状态
     * @param id 服务ID
     * @param status 状态
     * @return 是否成功
     */
    boolean toggleServiceStatus(Long id, Integer status);
    
    /**
     * 处理告警
     * @param id 告警ID
     * @param action 操作
     * @param remark 备注
     * @return 是否成功
     */
    boolean handleAlert(Long id, String action, String remark);
    
    /**
     * 获取风险历史
     * @param deviceId 设备ID
     * @return 风险历史列表
     */
    List<Map<String, Object>> getRiskHistory(Long deviceId);
    
    /**
     * 获取报告详情
     * @param id 报告ID
     * @return 报告详情
     */
    Map<String, Object> getReportDetail(Long id);
    
    /**
     * 获取时间序列数据
     * @param deviceId 设备ID
     * @param metric 指标
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 时间序列数据列表
     */
    List<Map<String, Object>> getTimeSeriesData(Long deviceId, String metric, String startTime, String endTime);
    
    /**
     * 发现阈值
     * @param deviceId 设备ID
     * @param metric 指标
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 阈值数据
     */
    Map<String, Object> discoverThreshold(Long deviceId, String metric, String startTime, String endTime);
    
    /**
     * 获取服务的训练历史
     * @param serviceId 服务ID
     * @return 训练历史列表
     */
    List<?> getTrainingHistory(Long serviceId);
    
    /**
     * 开始训练模型
     * @param serviceId 服务ID
     * @return 训练结果消息
     */
    String startTraining(Long serviceId);

    /**
     * 开始训练单个模型设备组合
     * @param modelId 模型设备组合ID
     * @return 训练结果消息
     */
    String startSingleModelTraining(Long modelId);
    
    /**
     * 获取服务的模型组合列表
     * @param serviceId 服务ID
     * @return 模型组合列表
     */
    List<Map<String, Object>> getServiceModels(Long serviceId);
}
