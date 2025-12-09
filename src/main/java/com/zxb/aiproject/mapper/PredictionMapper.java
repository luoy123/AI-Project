package com.zxb.aiproject.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PredictionMapper {

    // ==================== 概览页面 ====================

    /**
     * 统计启用的服务数量
     */
    Integer countEnabledServices();

    /**
     * 统计总训练对象数（模型设备组合数）
     */
    Integer countTotalTrainingObjects();

    /**
     * 统计总训练记录数
     */
    Integer countTotalTrainingRecords();

    /**
     * 统计总训练次数
     */
    Integer countTotalTrainCount();

    /**
     * 统计总预测次数
     */
    Integer countTotalPredictionCount();

    /**
     * 获取设备故障占比数据
     */
    List<Map<String, Object>> getDeviceFaultRatio(@Param("predictionTime") Integer predictionTime);

    /**
     * 获取设备总数（包括正常、警告、故障）
     */
    Integer getTotalDeviceCount(@Param("predictionTime") Integer predictionTime);

    /**
     * 获取告警统计数据
     */
    Map<String, Object> getAlertStats(@Param("predictionTime") Integer predictionTime);

    /**
     * 获取设备分类故障率列表
     */
    List<Map<String, Object>> getCategoryFaultRates(@Param("predictionTime") Integer predictionTime);

    /**
     * 获取服务器故障预测统计
     */
    Map<String, Object> getServerFaultStats(@Param("predictionTime") Integer predictionTime);

    /**
     * 获取其他设备故障预测统计
     */
    Map<String, Object> getOtherDeviceFaultStats(@Param("predictionTime") Integer predictionTime);

    // ==================== 预测报告页面 ====================

    /**
     * 获取预测报告分类列表
     */
    List<Map<String, Object>> getReportCategories();

    /**
     * 获取预测报告列表
     */
    List<Map<String, Object>> getReports(@Param("categoryId") Long categoryId,
                                         @Param("brand") String brand,
                                         @Param("predictionTime") Integer predictionTime,
                                         @Param("status") String status);

    /**
     * 获取预测报告详情
     */
    Map<String, Object> getReportDetail(@Param("reportId") Long reportId);

    // ==================== 预测风险页面 ====================

    /**
     * 获取预测风险列表
     */
    List<Map<String, Object>> getRisks(@Param("predictionTime") Integer predictionTime,
                                       @Param("riskLevel") String riskLevel,
                                       @Param("monitoringCategory") String monitoringCategory,
                                       @Param("keyword") String keyword,
                                       @Param("alertStatus") String alertStatus);

    /**
     * 获取预测风险历史
     */
    List<Map<String, Object>> getRiskHistory(@Param("alertId") Long alertId);

    // ==================== 智能分析页面 ====================

    /**
     * 获取时间序列数据
     */
    List<Map<String, Object>> getTimeSeriesData(@Param("deviceId") Long deviceId,
                                                 @Param("metricName") String metricName,
                                                 @Param("startTime") String startTime,
                                                 @Param("endTime") String endTime);

    /**
     * 获取监测数据统计
     */
    Map<String, Object> getMonitoringStats(@Param("startTime") String startTime,
                                           @Param("endTime") String endTime);

    // ==================== 算法模型服务页面 ====================

    /**
     * 获取算法模型服务列表
     */
    List<Map<String, Object>> getAlgorithmServices(@Param("serviceName") String serviceName,
                                                   @Param("status") String status,
                                                   @Param("algorithmType") String algorithmType,
                                                   @Param("keyword") String keyword);
}
