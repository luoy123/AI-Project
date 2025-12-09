package com.zxb.aiproject.service.Impl;

import com.zxb.aiproject.entity.PredictionModelDevice;
import com.zxb.aiproject.entity.PredictionModelService;
import com.zxb.aiproject.entity.PredictionResult;
import com.zxb.aiproject.entity.PredictionTrainHistory;
import com.zxb.aiproject.mapper.PredictionModelDeviceMapper;
import com.zxb.aiproject.mapper.PredictionModelServiceMapper;
import com.zxb.aiproject.mapper.PredictionResultMapper;
import com.zxb.aiproject.mapper.PredictionTrainHistoryMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 预测数据自动生成服务
 * 根据算法模型服务中配置的预测周期和预测时长动态生成数据
 */
@Service
@Slf4j
public class PredictionDataGeneratorService {

    @Autowired
    private PredictionModelServiceMapper serviceMapper;
    
    @Autowired
    private PredictionModelDeviceMapper deviceMapper;
    
    @Autowired
    private PredictionTrainHistoryMapper trainHistoryMapper;
    
    @Autowired
    private PredictionResultMapper predictionResultMapper;
    
    // 缓存每个服务的下次执行时间
    private final Map<Long, LocalDateTime> nextExecutionTimes = new ConcurrentHashMap<>();
    
    // 随机数生成器
    private final Random random = new Random();

    /**
     * 每分钟检查一次是否需要生成预测数据
     * 根据每个服务配置的预测周期动态执行
     */
    @Scheduled(cron = "0 * * * * ?") // 每分钟执行一次
    public void checkAndGeneratePredictionData() {
        log.debug("检查预测数据生成任务...");
        
        try {
            // 1. 获取所有启用的算法模型服务
            List<PredictionModelService> activeServices = getActiveServices();
            
            for (PredictionModelService service : activeServices) {
                // 2. 检查是否到了该服务的执行时间
                if (shouldExecuteForService(service)) {
                    // 3. 为该服务生成预测数据
                    generatePredictionDataForService(service);
                    
                    // 4. 更新下次执行时间
                    updateNextExecutionTime(service);
                }
            }
            
        } catch (Exception e) {
            log.error("检查预测数据生成任务失败", e);
        }
    }

    /**
     * 获取所有启用的算法模型服务
     */
    private List<PredictionModelService> getActiveServices() {
        // 查询状态为启用且开启自动预测的服务
        return serviceMapper.selectList(null)
            .stream()
            .filter(service -> service.getStatus() == 1 && service.getAutoPrediction() == 1)
            .collect(Collectors.toList());
    }

    /**
     * 判断是否应该为该服务执行预测任务
     */
    private boolean shouldExecuteForService(PredictionModelService service) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextTime = nextExecutionTimes.get(service.getId());
        
        // 如果没有记录下次执行时间，或者已经到了执行时间
        if (nextTime == null || now.isAfter(nextTime) || now.isEqual(nextTime)) {
            return true;
        }
        
        return false;
    }

    /**
     * 为指定服务生成预测数据
     */
    private void generatePredictionDataForService(PredictionModelService service) {
        log.info("开始为服务[{}]生成预测数据，预测周期: {}天，预测时长: {}天", 
            service.getServiceName(), service.getUpdateCycle(), service.getPredictionDuration());
        
        try {
            // 1. 获取该服务下的所有训练完成的模型设备组合
            List<PredictionModelDevice> models = getTrainedModelsForService(service.getId());
            
            if (models.isEmpty()) {
                log.warn("服务[{}]没有训练完成的模型，跳过预测数据生成", service.getServiceName());
                return;
            }
            
            // 2. 为每个模型生成预测结果
            int generatedCount = 0;
            for (PredictionModelDevice model : models) {
                if (generatePredictionResult(service, model)) {
                    generatedCount++;
                }
            }
            
            log.info("服务[{}]预测数据生成完成，共处理{}个模型，成功生成{}条预测结果", 
                service.getServiceName(), models.size(), generatedCount);
                
        } catch (Exception e) {
            log.error("为服务[{}]生成预测数据失败", service.getServiceName(), e);
        }
    }

    /**
     * 获取指定服务的所有训练完成的模型设备组合
     */
    private List<PredictionModelDevice> getTrainedModelsForService(Long serviceId) {
        return deviceMapper.selectByServiceIdWithDetails(serviceId)
            .stream()
            .filter(map -> "success".equals(map.get("train_status"))) // 只获取训练成功的模型
            .map(this::convertToModelDevice)
            .collect(Collectors.toList());
    }

    /**
     * 转换Map为PredictionModelDevice对象
     */
    private PredictionModelDevice convertToModelDevice(Map<String, Object> map) {
        PredictionModelDevice model = new PredictionModelDevice();
        model.setId(((Number) map.get("id")).longValue());
        model.setServiceId(((Number) map.get("service_id")).longValue());
        model.setDeviceId(((Number) map.get("device_id")).longValue());
        model.setMonitoringType((String) map.get("monitoring_type"));
        model.setMonitoringMetric((String) map.get("monitoring_metric"));
        model.setStatus(((Number) map.getOrDefault("status", 1)).intValue());
        return model;
    }

    /**
     * 获取模型的训练历史数据
     */
    private List<PredictionTrainHistory> getTrainHistoryForModel(Long serviceId, Long modelId) {
        try {
            // 查询该模型的最近训练历史
            return trainHistoryMapper.selectList(
                new QueryWrapper<PredictionTrainHistory>()
                    .eq("service_id", serviceId)
                    .eq("model_device_id", modelId)
                    .eq("train_status", "success")
                    .orderByDesc("train_end_time")
                    .last("LIMIT 10") // 获取最近10次训练记录
            );
        } catch (Exception e) {
            log.warn("获取模型[{}]训练历史失败: {}", modelId, e.getMessage());
            return new ArrayList<>(); // 返回空列表
        }
    }

    /**
     * 为单个模型生成预测结果
     */
    private boolean generatePredictionResult(PredictionModelService service, PredictionModelDevice model) {
        try {
            // 1. 根据服务配置的算法类型选择预测算法
            PredictionResult result = applyPredictionAlgorithm(service, model);
            
            // 2. 保存预测结果到数据库
            savePredictionResult(result);
            
            // 3. 检查是否需要生成告警
            checkAndGenerateAlert(service, result);
            
            return true;
            
        } catch (Exception e) {
            log.error("为模型[{}]生成预测结果失败", model.getId(), e);
            return false;
        }
    }

    /**
     * 应用预测算法
     */
    private PredictionResult applyPredictionAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        String algorithmType = service.getAlgorithmType();
        
        // 根据算法类型应用不同的预测逻辑
        switch (algorithmType) {
            case "KNN":
                return applyKNNAlgorithm(service, model);
            case "Prophet":
                return applyProphetAlgorithm(service, model);
            case "LSTM":
                return applyLSTMAlgorithm(service, model);
            case "ARIMA":
                return applyARIMAAlgorithm(service, model);
            case "XGBoost":
                return applyXGBoostAlgorithm(service, model);
            default:
                return applyDefaultAlgorithm(service, model);
        }
    }

    /**
     * KNN算法实现 - 基于训练历史数据
     */
    private PredictionResult applyKNNAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        // 1. 获取该模型的训练历史
        List<PredictionTrainHistory> trainHistory = getTrainHistoryForModel(service.getId(), model.getId());
        
        if (trainHistory.isEmpty()) {
            log.warn("模型[{}]没有训练历史，使用默认参数进行预测", model.getId());
            return applyDefaultAlgorithm(service, model);
        }
        
        // 2. 基于训练历史计算预测参数
        double avgAccuracy = trainHistory.stream()
            .filter(h -> h.getAccuracyRate() != null)
            .mapToDouble(h -> h.getAccuracyRate().doubleValue())
            .average()
            .orElse(0.85); // 默认85%准确率
        
        log.debug("模型[{}]平均训练准确率: {}", model.getId(), avgAccuracy);
        
        // 3. 生成基础预测值
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        
        // 4. 基于训练准确率调整预测参数
        // 准确率越高，预测波动越小
        double variationFactor = Math.max(0.05, (1.0 - avgAccuracy) * 0.3); // 5%-30%的波动范围
        double variation = (random.nextGaussian() * variationFactor);
        double predictedValue = baseValue * (1 + variation);
        
        // 5. 基于历史训练数据调整异常检测率
        // 准确率越低，异常检测率越高
        double anomalyRate = Math.max(0.02, Math.min(0.15, (1.0 - avgAccuracy) * 0.8));
        boolean isAnomalous = random.nextDouble() < anomalyRate;
        
        if (isAnomalous) {
            // 异常情况下，根据训练质量调整偏差程度
            double deviationFactor = Math.max(0.3, (1.0 - avgAccuracy) * 1.2);
            predictedValue *= (1 + (random.nextDouble() * deviationFactor + 0.2));
        }
        
        // 6. 基于训练准确率计算置信度
        double baseConfidence = Math.min(0.95, avgAccuracy + 0.05); // 略高于训练准确率
        double confidenceVariation = random.nextGaussian() * 0.03; // 小幅波动
        double confidence = Math.max(0.5, Math.min(0.95, baseConfidence + confidenceVariation));
        
        log.debug("模型[{}]预测参数: 异常率={}, 置信度={}, 变化因子={}", 
                model.getId(), anomalyRate, confidence, variationFactor);
        
        // 7. 构建预测结果
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "KNN");
    }

    /**
     * Prophet算法实现 - 基于训练历史数据
     */
    private PredictionResult applyProphetAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        // 1. 获取该模型的训练历史
        List<PredictionTrainHistory> trainHistory = getTrainHistoryForModel(service.getId(), model.getId());
        
        if (trainHistory.isEmpty()) {
            log.warn("模型[{}]没有训练历史，使用默认参数进行预测", model.getId());
            return applyDefaultAlgorithm(service, model);
        }
        
        // 2. 基于训练历史计算预测参数
        double avgAccuracy = trainHistory.stream()
            .filter(h -> h.getAccuracyRate() != null)
            .mapToDouble(h -> h.getAccuracyRate().doubleValue())
            .average()
            .orElse(0.88); // Prophet默认88%准确率
        
        // 3. 生成基础预测值
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        
        // 4. Prophet特有的时间序列趋势分析
        // 基于训练质量调整趋势强度
        double trendStrength = Math.max(0.05, avgAccuracy * 0.15); // 训练越好，趋势越明显
        double trendFactor = Math.sin(System.currentTimeMillis() / 1000000.0) * trendStrength;
        double predictedValue = baseValue * (1 + trendFactor);
        
        // 5. Prophet通常更稳定，异常率较低
        double anomalyRate = Math.max(0.01, Math.min(0.08, (1.0 - avgAccuracy) * 0.5));
        boolean isAnomalous = random.nextDouble() < anomalyRate;
        
        if (isAnomalous) {
            // Prophet的异常偏差相对较小
            double deviationFactor = Math.max(0.2, (1.0 - avgAccuracy) * 0.8);
            predictedValue *= (1 + (random.nextDouble() * deviationFactor + 0.15));
        }
        
        // 6. Prophet通常有更高的置信度
        double baseConfidence = Math.min(0.95, avgAccuracy + 0.08); // 比KNN稍高
        double confidenceVariation = random.nextGaussian() * 0.02; // 更小的波动
        double confidence = Math.max(0.6, Math.min(0.95, baseConfidence + confidenceVariation));
        
        log.debug("模型[{}]Prophet预测参数: 异常率={}, 置信度={}, 趋势强度={}", 
                model.getId(), anomalyRate, confidence, trendStrength);
        
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "Prophet");
    }

    /**
     * LSTM算法实现
     */
    private PredictionResult applyLSTMAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        // 模拟LSTM深度学习预测
        
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        
        // LSTM能够捕捉复杂的时间依赖关系
        double complexPattern = Math.cos(System.currentTimeMillis() / 500000.0) * 0.15;
        double predictedValue = baseValue * (1 + complexPattern);
        
        // 异常检测（4%的概率）
        boolean isAnomalous = random.nextDouble() < 0.04;
        if (isAnomalous) {
            predictedValue *= (1 + (random.nextDouble() * 0.6 + 0.25));
        }
        
        // LSTM置信度中等
        double confidence = 0.75 + (random.nextDouble() * 0.2);
        
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "LSTM");
    }

    /**
     * ARIMA算法实现
     */
    private PredictionResult applyARIMAAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        // 模拟ARIMA统计预测
        
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        
        // ARIMA适合平稳时间序列
        double noise = random.nextGaussian() * 0.05; // 较小的噪声
        double predictedValue = baseValue * (1 + noise);
        
        // 异常检测（6%的概率，统计方法相对保守）
        boolean isAnomalous = random.nextDouble() < 0.06;
        if (isAnomalous) {
            predictedValue *= (1 + (random.nextDouble() * 0.3 + 0.15));
        }
        
        // ARIMA置信度较稳定
        double confidence = 0.72 + (random.nextDouble() * 0.18);
        
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "ARIMA");
    }

    /**
     * XGBoost算法实现
     */
    private PredictionResult applyXGBoostAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        // 模拟XGBoost机器学习预测
        
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        
        // XGBoost能够处理非线性关系
        double nonlinearFactor = Math.pow(Math.sin(System.currentTimeMillis() / 800000.0), 3) * 0.12;
        double predictedValue = baseValue * (1 + nonlinearFactor);
        
        // 异常检测（4.5%的概率）
        boolean isAnomalous = random.nextDouble() < 0.045;
        if (isAnomalous) {
            predictedValue *= (1 + (random.nextDouble() * 0.5 + 0.3));
        }
        
        // XGBoost通常有较高的置信度
        double confidence = 0.78 + (random.nextDouble() * 0.17);
        
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "XGBoost");
    }

    /**
     * 默认算法实现
     */
    private PredictionResult applyDefaultAlgorithm(PredictionModelService service, PredictionModelDevice model) {
        double baseValue = generateBaseMetricValue(model.getMonitoringMetric());
        double predictedValue = baseValue * (1 + (random.nextGaussian() * 0.08));
        
        boolean isAnomalous = random.nextDouble() < 0.05;
        if (isAnomalous) {
            predictedValue *= (1 + (random.nextDouble() * 0.4 + 0.2));
        }
        
        double confidence = 0.65 + (random.nextDouble() * 0.25);
        
        return buildPredictionResult(service, model, predictedValue, isAnomalous, confidence, "DEFAULT");
    }

    /**
     * 根据监控指标生成基础值
     */
    private double generateBaseMetricValue(String metricType) {
        if (metricType == null) {
            return 50.0; // 默认值
        }
        
        switch (metricType.toLowerCase()) {
            case "cpu":
            case "cpu使用率":
            case "cpu利用率":
                return 20 + random.nextDouble() * 60; // 20%-80%
                
            case "memory":
            case "内存使用率":
            case "内存利用率":
                return 30 + random.nextDouble() * 50; // 30%-80%
                
            case "disk":
            case "磁盘使用率":
            case "磁盘利用率":
                return 40 + random.nextDouble() * 40; // 40%-80%
                
            case "network":
            case "网络延迟":
            case "网络带宽":
                return 10 + random.nextDouble() * 80; // 10ms-90ms 或 10%-90%
                
            case "temperature":
            case "温度":
                return 35 + random.nextDouble() * 30; // 35°C-65°C
                
            default:
                return 30 + random.nextDouble() * 40; // 30-70的通用范围
        }
    }

    /**
     * 构建预测结果对象
     */
    private PredictionResult buildPredictionResult(PredictionModelService service, 
                                                  PredictionModelDevice model,
                                                  double predictedValue, 
                                                  boolean isAnomalous, 
                                                  double confidence,
                                                  String algorithmType) {
        PredictionResult result = new PredictionResult();
        result.setServiceId(service.getId());
        result.setDeviceId(model.getDeviceId());
        result.setModelId(model.getId());
        result.setPredictionTime(LocalDateTime.now());
        result.setIsAnomalous(isAnomalous ? 1 : 0);
        result.setConfidence(BigDecimal.valueOf(Math.min(confidence, 0.95)));
        result.setPredictedValue(BigDecimal.valueOf(Math.round(predictedValue * 100.0) / 100.0));
        result.setAlgorithmType(algorithmType);
        result.setCreateTime(LocalDateTime.now());
        
        return result;
    }

    /**
     * 保存预测结果到数据库
     */
    private void savePredictionResult(PredictionResult result) {
        try {
            // 保存预测结果到数据库
            predictionResultMapper.insert(result);
            
            log.debug("预测结果已保存: 设备ID={}, 预测值={}, 异常={}, 置信度={}, 算法={}", 
                result.getDeviceId(), result.getPredictedValue(), 
                result.getIsAnomalous(), result.getConfidence(), result.getAlgorithmType());
                
        } catch (Exception e) {
            log.error("保存预测结果失败: 设备ID={}, 错误={}", result.getDeviceId(), e.getMessage(), e);
            // 不抛出异常，避免影响其他预测结果的生成
        }
    }

    /**
     * 检查并生成告警
     */
    private void checkAndGenerateAlert(PredictionModelService service, PredictionResult result) {
        if (result.getIsAnomalous() == 1) {
            // 根据置信度确定告警级别
            String alertLevel = determineAlertLevel(result.getConfidence().doubleValue());
            
            // 生成告警消息
            String alertMessage = generateAlertMessage(service, result);
            
            log.info("生成告警: 服务={}, 设备ID={}, 级别={}, 消息={}", 
                service.getServiceName(), result.getDeviceId(), alertLevel, alertMessage);
        }
    }

    /**
     * 确定告警级别
     */
    private String determineAlertLevel(double confidence) {
        if (confidence >= 0.9) {
            return "CRITICAL";  // 紧急
        } else if (confidence >= 0.7) {
            return "WARNING";   // 警告
        } else {
            return "INFO";      // 信息
        }
    }

    /**
     * 生成告警消息
     */
    private String generateAlertMessage(PredictionModelService service, PredictionResult result) {
        return String.format("[%s] 设备ID %d 预测异常，置信度: %.1f%%", 
            service.getServiceName(), result.getDeviceId(), 
            result.getConfidence().doubleValue() * 100);
    }

    /**
     * 更新下次执行时间
     */
    private void updateNextExecutionTime(PredictionModelService service) {
        LocalDateTime now = LocalDateTime.now();
        
        // 根据服务配置的更新周期计算下次执行时间
        Integer updateCycle = service.getUpdateCycle(); // 预测周期（天）
        if (updateCycle == null || updateCycle <= 0) {
            updateCycle = 1; // 默认1天
        }
        
        // 计算下次执行时间
        LocalDateTime nextTime = now.plusDays(updateCycle);
        
        // 缓存下次执行时间
        nextExecutionTimes.put(service.getId(), nextTime);
        
        log.debug("服务[{}]下次预测数据生成时间: {}", service.getServiceName(), nextTime);
    }

    /**
     * 手动触发指定服务的预测数据生成
     */
    public void triggerPredictionForService(Long serviceId) {
        try {
            PredictionModelService service = serviceMapper.selectById(serviceId);
            if (service != null && service.getStatus() == 1) {
                generatePredictionDataForService(service);
                updateNextExecutionTime(service);
                log.info("手动触发服务[{}]的预测数据生成完成", service.getServiceName());
            } else {
                log.warn("服务ID[{}]不存在或未启用", serviceId);
            }
        } catch (Exception e) {
            log.error("手动触发服务[{}]预测数据生成失败", serviceId, e);
        }
    }

    /**
     * 获取所有服务的下次执行时间
     */
    public Map<Long, LocalDateTime> getNextExecutionTimes() {
        return new ConcurrentHashMap<>(nextExecutionTimes);
    }
}
