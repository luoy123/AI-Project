package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.dto.PredictionModelServiceDTO;
import com.zxb.aiproject.entity.PredictionModelDevice;
import com.zxb.aiproject.entity.PredictionModelService;
import com.zxb.aiproject.entity.PredictionTrainHistory;
import com.zxb.aiproject.mapper.PredictionModelServiceMapper;
import com.zxb.aiproject.mapper.PredictionTrainHistoryMapper;
import com.zxb.aiproject.service.PredictionModelServiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * 算法模型服务Service实现类
 */
@Slf4j
@Service
public class PredictionServiceImpl extends ServiceImpl<PredictionModelServiceMapper, PredictionModelService>
        implements PredictionModelServiceService {

    @Autowired(required = false)
    private PredictionTrainHistoryMapper trainHistoryMapper;

    @Autowired(required = false)
    private com.zxb.aiproject.mapper.PredictionModelDeviceMapper predictionModelDeviceMapper;

    @Autowired(required = false)
    private com.zxb.aiproject.mapper.PredictionResultMapper predictionResultMapper;

    @Autowired(required = false)
    private com.zxb.aiproject.mapper.PredictionAlertMapper predictionAlertMapper;

    @Autowired(required = false)
    private com.zxb.aiproject.mapper.PredictionReportMapper predictionReportMapper;

    @Autowired(required = false)
    private PredictionTrainHistoryMapper predictionTrainHistoryMapper;

    @Override
    public List<Map<String, Object>> getServiceListWithStats(String serviceName, Integer status,
                                                              String deviceType, String keyword) {
        return baseMapper.selectServiceListWithStats(serviceName, status, deviceType, keyword);
    }


    @Override
    public Map<String, Object> getServiceDetail(Long serviceId) {
        // 由于当前环境尚未完全接入预测结果/告警等统计表，这里先主要返回服务自身信息，
        // 同时补充该服务下的模型组合列表，供前端编辑时回填设备和指标使用。
        PredictionModelService service = getById(serviceId);
        if (service == null) {
            return null;
        }

        Map<String, Object> detail = new HashMap<>();
        
        // 将服务信息直接放在根级别，前端期望这种结构
        detail.put("id", service.getId());
        detail.put("serviceName", service.getServiceName());
        detail.put("serviceCode", service.getServiceCode());
        detail.put("algorithmType", service.getAlgorithmType());
        detail.put("status", service.getStatus());
        detail.put("updateCycle", service.getUpdateCycle());
        detail.put("predictionCycle", service.getPredictionCycle());
        detail.put("predictionDuration", service.getPredictionDuration());
        detail.put("autoPrediction", service.getAutoPrediction());
        detail.put("notes", service.getNotes());
        detail.put("createTime", service.getCreateTime());
        detail.put("updateTime", service.getUpdateTime());

        // 附带返回该服务的设备关联列表（来自 prediction_model_device 表）
        if (predictionModelDeviceMapper != null) {
            try {
                List<Map<String, Object>> models = predictionModelDeviceMapper.selectByServiceIdWithDetails(serviceId);
                detail.put("models", models);  // 前端仍用 models 字段名保持兼容
                log.info("获取服务详情 - 设备关联: serviceId={}, count={}", serviceId, models.size());
            } catch (Exception e) {
                log.error("获取服务详情 - 查询模型组合失败: serviceId={}", serviceId, e);
                detail.put("models", new ArrayList<>());
            }
        } else {
            detail.put("models", new ArrayList<>());
        }

        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createService(PredictionModelServiceDTO dto) {
        // 1. 创建服务主记录
        PredictionModelService service = new PredictionModelService();
        BeanUtils.copyProperties(dto, service);

        // 生成服务编码
        if (dto.getServiceCode() == null || dto.getServiceCode().isEmpty()) {
            String serviceCode = generateServiceCode(dto.getAlgorithmType(), null);
            service.setServiceCode(serviceCode);
        } else {
            if (checkServiceCodeExists(dto.getServiceCode(), null)) {
                throw new RuntimeException("服务编码已存在: " + dto.getServiceCode());
            }
            service.setServiceCode(dto.getServiceCode());
        }

        // 设置默认值
        if (service.getStatus() == null) {
            service.setStatus(1);
        }
        if (service.getAutoPrediction() == null) {
            service.setAutoPrediction(1);
        }
        if (service.getTrainCount() == null) {
            service.setTrainCount(0);
        }
        if (service.getPredictionCount() == null) {
            service.setPredictionCount(0);
        }

        save(service);
        log.info("创建算法模型服务成功: id={}, name={}, code={}",
                service.getId(), service.getServiceName(), service.getServiceCode());

        // 2. 批量插入设备关联（直接从 modelDevices，不再需要 prediction_model 表）
        if (predictionModelDeviceMapper != null 
                && dto.getModelDevices() != null 
                && !dto.getModelDevices().isEmpty()) {
            
            List<PredictionModelDevice> devices = new ArrayList<>();

            for (PredictionModelServiceDTO.ModelDeviceCombination devDto : dto.getModelDevices()) {
                if (devDto == null || devDto.getDeviceId() == null) {
                    continue;
                }

                PredictionModelDevice device = new PredictionModelDevice();
                device.setServiceId(service.getId());
                device.setDeviceId(devDto.getDeviceId());
                device.setCategoryId(devDto.getCategoryId());
                device.setMonitoringType(devDto.getMonitoringType());
                device.setMonitoringMetric(devDto.getMonitoringMetric());
                device.setStatus(1);
                devices.add(device);
            }

            if (!devices.isEmpty()) {
                predictionModelDeviceMapper.batchInsert(devices);
                log.info("保存设备关联成功: serviceId={}, count={}", service.getId(), devices.size());
            }
        }

        return service.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateService(PredictionModelServiceDTO dto) {
        if (dto.getId() == null) {
            throw new RuntimeException("服务ID不能为空");
        }

        PredictionModelService service = getById(dto.getId());
        if (service == null) {
            throw new RuntimeException("服务不存在: " + dto.getId());
        }

        // 检查服务编码是否重复
        if (dto.getServiceCode() != null && !dto.getServiceCode().equals(service.getServiceCode())) {
            if (checkServiceCodeExists(dto.getServiceCode(), dto.getId())) {
                throw new RuntimeException("服务编码已存在: " + dto.getServiceCode());
            }
        }

        BeanUtils.copyProperties(dto, service, "id", "createTime", "trainCount",
                "predictionCount", "lastTrainTime", "lastPredictionTime", "accuracyRate");

        boolean result = updateById(service);
        log.info("更新算法模型服务成功: id={}, name={}", service.getId(), service.getServiceName());

        // 更新设备关联：智能增删改，保留训练状态
        if (predictionModelDeviceMapper != null && dto.getModelDevices() != null) {
            // 1. 获取现有的设备关联
            List<PredictionModelDevice> existingDevices = predictionModelDeviceMapper.selectList(
                new QueryWrapper<PredictionModelDevice>().eq("service_id", service.getId()).eq("deleted", 0)
            );
            
            // 2. 构建现有设备的映射 (key = deviceId|monitoringType|monitoringMetric)
            Map<String, PredictionModelDevice> existingMap = new HashMap<>();
            for (PredictionModelDevice existing : existingDevices) {
                String key = existing.getDeviceId() + "|" + existing.getMonitoringType() + "|" + existing.getMonitoringMetric();
                existingMap.put(key, existing);
            }
            
            // 3. 构建新的设备映射
            Set<String> newKeys = new HashSet<>();
            List<PredictionModelDevice> devicesToInsert = new ArrayList<>();
            
            for (PredictionModelServiceDTO.ModelDeviceCombination devDto : dto.getModelDevices()) {
                if (devDto == null || devDto.getDeviceId() == null) {
                    continue;
                }
                
                String key = devDto.getDeviceId() + "|" + devDto.getMonitoringType() + "|" + devDto.getMonitoringMetric();
                newKeys.add(key);
                
                if (!existingMap.containsKey(key)) {
                    // 新增的设备关联
                    PredictionModelDevice device = new PredictionModelDevice();
                    device.setServiceId(service.getId());
                    device.setDeviceId(devDto.getDeviceId());
                    device.setCategoryId(devDto.getCategoryId());
                    device.setMonitoringType(devDto.getMonitoringType());
                    device.setMonitoringMetric(devDto.getMonitoringMetric());
                    device.setStatus(1);
                    devicesToInsert.add(device);
                    log.info("新增设备关联: deviceId={}, type={}, metric={}", 
                            devDto.getDeviceId(), devDto.getMonitoringType(), devDto.getMonitoringMetric());
                } else {
                    log.info("保留现有设备关联: deviceId={}, type={}, metric={}, status={}", 
                            devDto.getDeviceId(), devDto.getMonitoringType(), devDto.getMonitoringMetric(),
                            existingMap.get(key).getTrainStatus());
                }
            }
            
            // 4. 删除不再需要的设备关联
            for (String existingKey : existingMap.keySet()) {
                if (!newKeys.contains(existingKey)) {
                    PredictionModelDevice toDelete = existingMap.get(existingKey);
                    predictionModelDeviceMapper.deleteById(toDelete.getId());
                    log.info("删除设备关联: id={}, deviceId={}", toDelete.getId(), toDelete.getDeviceId());
                }
            }
            
            // 5. 插入新的设备关联
            if (!devicesToInsert.isEmpty()) {
                predictionModelDeviceMapper.batchInsert(devicesToInsert);
                log.info("插入新设备关联: count={}", devicesToInsert.size());
            }
            
            log.info("设备关联更新完成: serviceId={}, 保留={}, 新增={}, 删除={}", 
                    service.getId(), 
                    newKeys.size() - devicesToInsert.size(),
                    devicesToInsert.size(),
                    existingMap.size() - (newKeys.size() - devicesToInsert.size()));
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteService(Long serviceId) {
        PredictionModelService service = getById(serviceId);
        if (service == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }

        log.info("开始级联删除算法模型服务: id={}, name={}", serviceId, service.getServiceName());

        try {
            // 1. 删除预测结果数据
            deletePredictionResults(serviceId);
            
            // 2. 删除预测告警数据
            deletePredictionAlerts(serviceId);
            
            // 3. 删除预测报告数据
            deletePredictionReports(serviceId);
            
            // 4. 删除训练历史数据
            deletePredictionTrainHistory(serviceId);
            
            // 5. 删除模型设备组合数据
            deletePredictionModelDevices(serviceId);
            
            // 6. 最后删除服务本身
            boolean result = removeById(serviceId);
            
            log.info("级联删除算法模型服务成功: id={}, name={}", serviceId, service.getServiceName());
            return result;
            
        } catch (Exception e) {
            log.error("级联删除算法模型服务失败: id={}, name={}, error={}", 
                     serviceId, service.getServiceName(), e.getMessage(), e);
            throw new RuntimeException("删除服务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 删除预测结果数据
     */
    private void deletePredictionResults(Long serviceId) {
        try {
            if (predictionResultMapper != null) {
                int count = predictionResultMapper.deleteByServiceId(serviceId);
                log.info("删除预测结果数据: serviceId={}, count={}", serviceId, count);
            }
        } catch (Exception e) {
            log.warn("删除预测结果数据失败: serviceId={}, error={}", serviceId, e.getMessage());
            // 不抛出异常，继续执行其他删除操作
        }
    }

    /**
     * 删除预测告警数据
     */
    private void deletePredictionAlerts(Long serviceId) {
        try {
            if (predictionAlertMapper != null) {
                int count = predictionAlertMapper.deleteByServiceId(serviceId);
                log.info("删除预测告警数据: serviceId={}, count={}", serviceId, count);
            }
        } catch (Exception e) {
            log.warn("删除预测告警数据失败: serviceId={}, error={}", serviceId, e.getMessage());
        }
    }

    /**
     * 删除预测报告数据
     */
    private void deletePredictionReports(Long serviceId) {
        try {
            if (predictionReportMapper != null) {
                int count = predictionReportMapper.deleteByServiceId(serviceId);
                log.info("删除预测报告数据: serviceId={}, count={}", serviceId, count);
            }
        } catch (Exception e) {
            log.warn("删除预测报告数据失败: serviceId={}, error={}", serviceId, e.getMessage());
        }
    }

    /**
     * 删除训练历史数据
     */
    private void deletePredictionTrainHistory(Long serviceId) {
        try {
            if (predictionTrainHistoryMapper != null) {
                int count = predictionTrainHistoryMapper.deleteByServiceId(serviceId);
                log.info("删除训练历史数据: serviceId={}, count={}", serviceId, count);
            }
        } catch (Exception e) {
            log.warn("删除训练历史数据失败: serviceId={}, error={}", serviceId, e.getMessage());
        }
    }

    /**
     * 删除模型设备组合数据
     */
    private void deletePredictionModelDevices(Long serviceId) {
        try {
            if (predictionModelDeviceMapper != null) {
                int count = predictionModelDeviceMapper.deleteByServiceId(serviceId);
                log.info("删除模型设备组合数据: serviceId={}, count={}", serviceId, count);
            }
        } catch (Exception e) {
            log.error("删除模型设备组合数据失败: serviceId={}, error={}", serviceId, e.getMessage());
            throw new RuntimeException("删除模型设备组合数据失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean toggleServiceStatus(Long serviceId, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new RuntimeException("状态值无效: " + status);
        }

        int result = baseMapper.updateServiceStatus(serviceId, status);
        log.info("更新服务状态成功: id={}, status={}", serviceId, status);

        return result > 0;
    }

    @Override
    public String generateServiceCode(String algorithmType, String deviceType) {
        // 生成格式: ALG_DEV_YYYYMMDD_RANDOM
        // 例如: KNN_SRV_20250111_A3F2

        String algPrefix = algorithmType != null ? algorithmType.toUpperCase() : "ALG";
        String devPrefix = deviceType != null ? deviceType.substring(0, Math.min(3, deviceType.length())).toUpperCase() : "DEV";

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 生成4位随机字符串
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder randomStr = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            randomStr.append(chars.charAt(random.nextInt(chars.length())));
        }

        String serviceCode = String.format("%s_%s_%s_%s", algPrefix, devPrefix, dateStr, randomStr);

        // 检查是否重复,如果重复则重新生成
        int maxRetries = 10;
        int retries = 0;
        while (checkServiceCodeExists(serviceCode, null) && retries < maxRetries) {
            randomStr = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                randomStr.append(chars.charAt(random.nextInt(chars.length())));
            }
            serviceCode = String.format("%s_%s_%s_%s", algPrefix, devPrefix, dateStr, randomStr);
            retries++;
        }

        return serviceCode;
    }

    @Override
    public boolean checkServiceCodeExists(String serviceCode, Long excludeId) {
        int count = baseMapper.checkServiceCodeExists(serviceCode, excludeId);
        return count > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTrainStats(Long serviceId) {
        int result = baseMapper.updateTrainStats(serviceId);
        
        // 同时更新最后训练时间
        PredictionModelService service = getById(serviceId);
        if (service != null) {
            service.setLastTrainTime(LocalDateTime.now());
            updateById(service);
        }
        
        log.info("更新训练统计信息成功: serviceId={}", serviceId);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePredictionStats(Long serviceId) {
        int result = baseMapper.updatePredictionStats(serviceId);
        log.info("更新预测统计信息成功: serviceId={}", serviceId);
        return result > 0;
    }
    
    @Override
    public List<?> getTrainingHistory(Long serviceId) {
        log.info("获取训练历史: serviceId={}", serviceId);
        
        if (trainHistoryMapper == null) {
            log.warn("trainHistoryMapper未注入，返回空列表");
            return new ArrayList<>();
        }
        
        try {
            List<Map<String, Object>> history = trainHistoryMapper.selectTrainingHistoryByServiceId(serviceId);
            log.info("获取训练历史成功: serviceId={}, 记录数={}", serviceId, history.size());
            
            // 确保字段名为驼峰格式，兼容MyBatis的不同配置
            for (Map<String, Object> record : history) {
                // 处理detectionType字段
                if (!record.containsKey("detectionType")) {
                    Object value = record.get("detection_type");
                    if (value == null) {
                        value = record.get("detectiontype");
                    }
                    if (value != null) {
                        record.put("detectionType", value);
                    }
                }
                
                // 处理deviceName字段
                if (!record.containsKey("deviceName")) {
                    Object value = record.get("device_name");
                    if (value == null) {
                        value = record.get("devicename");
                    }
                    if (value != null) {
                        record.put("deviceName", value);
                    }
                }
                
                log.debug("训练记录: {}", record);
            }
            
            return history;
        } catch (Exception e) {
            log.error("获取训练历史失败: serviceId={}", serviceId, e);
            return new ArrayList<>();
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public String startTraining(Long serviceId) {
        log.info("开始训练模型: serviceId={}", serviceId);
        
        // 1. 获取服务信息
        PredictionModelService service = getById(serviceId);
        if (service == null) {
            throw new RuntimeException("服务不存在");
        }
        
        if (trainHistoryMapper == null) {
            throw new RuntimeException("训练历史Mapper未注入");
        }
        
        // 2. 创建训练历史记录
        PredictionTrainHistory trainHistory = new PredictionTrainHistory();
        trainHistory.setServiceId(serviceId);
        trainHistory.setTrainStartTime(LocalDateTime.now());
        trainHistory.setTrainStatus("running");
        
        // 3. 模拟训练过程（实际应该是异步任务）
        log.info("训练服务: {}, 算法: {}", 
                service.getServiceName(), 
                service.getAlgorithmType());
        
        try {
            // 先插入训练中状态的记录
            trainHistoryMapper.insert(trainHistory);
            Long trainHistoryId = trainHistory.getId();
            
            // 更新所有相关模型设备的状态为"训练中"
            if (predictionModelDeviceMapper != null) {
                try {
                    List<PredictionModelDevice> models = predictionModelDeviceMapper.selectList(
                        new QueryWrapper<PredictionModelDevice>()
                            .eq("service_id", serviceId)
                            .eq("deleted", 0)
                    );
                    
                    for (PredictionModelDevice model : models) {
                        model.setTrainStatus("running");
                        predictionModelDeviceMapper.updateById(model);
                    }
                    
                    log.info("已将 {} 个模型设备状态设置为训练中", models.size());
                } catch (Exception e) {
                    log.warn("更新模型设备状态失败", e);
                }
            }
            
            log.info("训练记录已创建，开始异步训练: trainHistoryId={}", trainHistoryId);
            
            // 异步执行训练过程
            CompletableFuture.runAsync(() -> {
                try {
                    Random random = new Random();
                    
                    // 模拟训练耗时（30-90秒）
                    int durationSeconds = 30 + random.nextInt(61);
                    log.info("模拟训练过程，预计耗时: {}秒", durationSeconds);
                    
                    // 模拟训练过程
                    Thread.sleep(durationSeconds * 1000);
                    
                    // 模拟数据量（5000-15000）
                    int dataCount = 5000 + random.nextInt(10000);
                    
                    // 模拟准确率（85-95%）
                    double accuracy = 85.0 + random.nextDouble() * 10.0;
                    
                    // 生成模型版本号
                    int versionNum = trainHistoryMapper.countSuccessTrains(serviceId) + 1;
                    String modelVersion = "v1." + versionNum + ".30";
                    
                    // 更新训练记录为成功
                    PredictionTrainHistory updateHistory = new PredictionTrainHistory();
                    updateHistory.setId(trainHistoryId);
                    updateHistory.setTrainEndTime(LocalDateTime.now());
                    updateHistory.setTrainStatus("success");
                    updateHistory.setTrainDuration(durationSeconds);
                    updateHistory.setDataCount(dataCount);
                    updateHistory.setModelVersion(modelVersion);
                    updateHistory.setAccuracyRate(BigDecimal.valueOf(accuracy).setScale(2, BigDecimal.ROUND_HALF_UP));
                    
                    trainHistoryMapper.updateById(updateHistory);
                    
                    // 更新所有相关模型设备的状态为"训练完成"
                    if (predictionModelDeviceMapper != null) {
                        try {
                            List<PredictionModelDevice> models = predictionModelDeviceMapper.selectList(
                                new QueryWrapper<PredictionModelDevice>()
                                    .eq("service_id", serviceId)
                                    .eq("deleted", 0)
                            );
                            
                            for (PredictionModelDevice model : models) {
                                model.setTrainStatus("success");
                                model.setLastTrainTime(LocalDateTime.now());
                                predictionModelDeviceMapper.updateById(model);
                            }
                            
                            log.info("已将 {} 个模型设备状态设置为训练完成", models.size());
                        } catch (Exception e) {
                            log.warn("更新模型设备完成状态失败", e);
                        }
                    }
                    
                    log.info("异步训练完成: serviceId={}, version={}, accuracy={}%, duration={}s", 
                            serviceId, modelVersion, accuracy, durationSeconds);
                    
                    // 更新服务的训练统计
                    updateTrainStats(serviceId);
                    
                } catch (Exception e) {
                    log.error("异步训练失败: serviceId={}", serviceId, e);
                    
                    // 更新训练记录为失败
                    PredictionTrainHistory failedHistory = new PredictionTrainHistory();
                    failedHistory.setId(trainHistoryId);
                    failedHistory.setTrainEndTime(LocalDateTime.now());
                    failedHistory.setTrainStatus("failed");
                    failedHistory.setErrorMessage(e.getMessage());
                    
                    trainHistoryMapper.updateById(failedHistory);
                    
                    // 更新所有相关模型设备的状态为"训练失败"
                    if (predictionModelDeviceMapper != null) {
                        try {
                            List<PredictionModelDevice> models = predictionModelDeviceMapper.selectList(
                                new QueryWrapper<PredictionModelDevice>()
                                    .eq("service_id", serviceId)
                                    .eq("deleted", 0)
                            );
                            
                            for (PredictionModelDevice model : models) {
                                model.setTrainStatus("failed");
                                model.setLastTrainTime(LocalDateTime.now());
                                predictionModelDeviceMapper.updateById(model);
                            }
                            
                            log.info("已将 {} 个模型设备状态设置为训练失败", models.size());
                        } catch (Exception ex) {
                            log.warn("更新模型设备失败状态失败", ex);
                        }
                    }
                }
            });
            
            return "训练已启动，预计需要30-90秒完成，请稍后查看训练历史";
            
        } catch (Exception e) {
            // 训练失败，更新记录
            trainHistory.setTrainEndTime(LocalDateTime.now());
            trainHistory.setTrainStatus("failed");
            trainHistory.setErrorMessage(e.getMessage());
            
            try {
                trainHistoryMapper.insert(trainHistory);
            } catch (Exception ex) {
                log.error("插入失败训练记录异常", ex);
            }
            
            log.error("训练失败: serviceId={}", serviceId, e);
            throw new RuntimeException("训练失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String startSingleModelTraining(Long modelId) {
        log.info("开始训练单个模型: modelId={}", modelId);
        
        if (predictionModelDeviceMapper == null) {
            throw new RuntimeException("PredictionModelDeviceMapper未注入");
        }
        
        // 1. 获取模型设备组合信息
        PredictionModelDevice modelDevice = predictionModelDeviceMapper.selectById(modelId);
        if (modelDevice == null) {
            throw new RuntimeException("模型设备组合不存在");
        }
        
        // 2. 获取服务信息
        PredictionModelService service = getById(modelDevice.getServiceId());
        if (service == null) {
            throw new RuntimeException("关联服务不存在");
        }
        
        if (trainHistoryMapper == null) {
            throw new RuntimeException("训练历史Mapper未注入");
        }
        
        // 3. 创建训练历史记录
        PredictionTrainHistory trainHistory = new PredictionTrainHistory();
        trainHistory.setServiceId(modelDevice.getServiceId());
        trainHistory.setModelDeviceId(modelId); // 记录具体的模型设备组合ID
        trainHistory.setTrainStartTime(LocalDateTime.now());
        trainHistory.setTrainStatus("running");
        
        try {
            // 先插入训练中状态的记录
            trainHistoryMapper.insert(trainHistory);
            Long trainHistoryId = trainHistory.getId();
            
            // 立即更新模型设备状态为"训练中"
            modelDevice.setTrainStatus("running");
            predictionModelDeviceMapper.updateById(modelDevice);
            
            log.info("单个模型训练记录已创建，开始异步训练: modelId={}, trainHistoryId={}", modelId, trainHistoryId);
            
            // 异步执行训练过程
            CompletableFuture.runAsync(() -> {
                try {
                    Random random = new Random();
                    
                    // 模拟训练耗时（15-30秒，让用户能看到过渡）
                    int durationSeconds = 15 + random.nextInt(16);
                    log.info("单个模型训练过程，预计耗时: {}秒", durationSeconds);
                    
                    // 模拟训练过程
                    Thread.sleep(durationSeconds * 1000);
                    
                    // 模拟数据量（2000-8000，单个模型数据量较少）
                    int dataCount = 2000 + random.nextInt(6000);
                    
                    // 模拟准确率（80-95%）
                    double accuracy = 80.0 + random.nextDouble() * 15.0;
                    
                    // 生成模型版本号
                    int versionNum = trainHistoryMapper.countSuccessTrains(modelDevice.getServiceId()) + 1;
                    String modelVersion = "v1." + versionNum + "." + modelId;
                    
                    // 更新训练记录为成功
                    PredictionTrainHistory updateHistory = new PredictionTrainHistory();
                    updateHistory.setId(trainHistoryId);
                    updateHistory.setTrainEndTime(LocalDateTime.now());
                    updateHistory.setTrainStatus("success");
                    updateHistory.setTrainDuration(durationSeconds);
                    updateHistory.setDataCount(dataCount);
                    updateHistory.setModelVersion(modelVersion);
                    updateHistory.setAccuracyRate(BigDecimal.valueOf(accuracy).setScale(2, BigDecimal.ROUND_HALF_UP));
                    
                    trainHistoryMapper.updateById(updateHistory);
                    
                    // 更新模型设备组合的训练信息为成功
                    modelDevice.setLastTrainTime(LocalDateTime.now());
                    modelDevice.setTrainStatus("success");
                    predictionModelDeviceMapper.updateById(modelDevice);
                    
                    log.info("异步单个模型训练完成: modelId={}, version={}, accuracy={}%, duration={}s", 
                            modelId, modelVersion, accuracy, durationSeconds);
                    
                } catch (Exception e) {
                    log.error("异步单个模型训练失败: modelId={}", modelId, e);
                    
                    // 更新训练记录为失败
                    PredictionTrainHistory failedHistory = new PredictionTrainHistory();
                    failedHistory.setId(trainHistoryId);
                    failedHistory.setTrainEndTime(LocalDateTime.now());
                    failedHistory.setTrainStatus("failed");
                    failedHistory.setErrorMessage(e.getMessage());
                    
                    trainHistoryMapper.updateById(failedHistory);
                    
                    // 更新模型设备状态为失败
                    modelDevice.setTrainStatus("failed");
                    modelDevice.setLastTrainTime(LocalDateTime.now());
                    predictionModelDeviceMapper.updateById(modelDevice);
                }
            });
            
            return String.format("模型训练已启动！设备: %s, 监控类型: %s, 预计需要15-30秒完成", 
                    modelDevice.getDeviceId(), 
                    modelDevice.getMonitoringType());
            
        } catch (Exception e) {
            // 训练失败，更新记录
            trainHistory.setTrainEndTime(LocalDateTime.now());
            trainHistory.setTrainStatus("failed");
            trainHistory.setErrorMessage(e.getMessage());
            
            try {
                trainHistoryMapper.insert(trainHistory);
                
                // 更新模型设备组合状态
                modelDevice.setLastTrainTime(LocalDateTime.now());
                modelDevice.setTrainStatus("failed");
                predictionModelDeviceMapper.updateById(modelDevice);
            } catch (Exception ex) {
                log.error("插入失败训练记录异常", ex);
            }
            
            log.error("单个模型训练失败: modelId={}", modelId, e);
            throw new RuntimeException("训练失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getServiceModels(Long serviceId) {
        if (predictionModelDeviceMapper == null) {
            log.warn("PredictionModelDeviceMapper未注入，返回空列表");
            return new ArrayList<>();
        }

        try {
            List<Map<String, Object>> models = predictionModelDeviceMapper.selectByServiceIdWithDetails(serviceId);
            log.info("获取服务设备关联成功: serviceId={}, count={}", serviceId, models.size());
            return models;
        } catch (Exception e) {
            log.error("获取服务设备关联失败: serviceId={}", serviceId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getModelDetails(Long modelId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取模型基本信息
            PredictionModelDevice model = predictionModelDeviceMapper.selectById(modelId);
            if (model == null) {
                throw new RuntimeException("模型不存在: " + modelId);
            }
            
            // 获取设备名称 - 使用与模型列表相同的查询方式
            String deviceName = "设备" + model.getDeviceId(); // 默认名称
            try {
                // 通过SQL查询获取真实的设备名称
                List<Map<String, Object>> modelDetails = predictionModelDeviceMapper.selectByServiceIdWithDetails(model.getServiceId());
                for (Map<String, Object> detail : modelDetails) {
                    if (modelId.equals(detail.get("id"))) {
                        Object deviceNameObj = detail.get("device_name");
                        if (deviceNameObj != null) {
                            deviceName = deviceNameObj.toString();
                        }
                        break;
                    }
                }
            } catch (Exception e) {
                log.warn("获取设备名称失败，使用默认名称: {}", e.getMessage());
            }
            
            Map<String, Object> modelInfo = new HashMap<>();
            modelInfo.put("id", model.getId());
            modelInfo.put("deviceId", model.getDeviceId());
            modelInfo.put("deviceName", deviceName);
            modelInfo.put("monitoringType", model.getMonitoringType());
            modelInfo.put("monitoringMetric", model.getMonitoringMetric());
            modelInfo.put("trainStatus", model.getTrainStatus());
            modelInfo.put("lastTrainTime", model.getLastTrainTime());
            modelInfo.put("createTime", model.getCreateTime());
            
            result.put("model", modelInfo);
            
            // 获取真实的训练历史记录
            List<Map<String, Object>> trainingHistory = new ArrayList<>();
            if (trainHistoryMapper != null) {
                try {
                    List<PredictionTrainHistory> historyList = trainHistoryMapper.selectList(
                        new QueryWrapper<PredictionTrainHistory>()
                            .eq("model_device_id", modelId)
                            .orderByDesc("train_start_time")
                    );
                    
                    for (PredictionTrainHistory history : historyList) {
                        Map<String, Object> historyMap = new HashMap<>();
                        historyMap.put("id", history.getId());
                        historyMap.put("startTime", history.getTrainStartTime());
                        historyMap.put("endTime", history.getTrainEndTime());
                        historyMap.put("status", history.getTrainStatus());
                        historyMap.put("modelVersion", history.getModelVersion() != null ? history.getModelVersion() : "v1.0.0");
                        historyMap.put("accuracy", history.getAccuracyRate() != null ? history.getAccuracyRate().toString() + "%" : "95.2%");
                        
                        // 计算训练时长
                        String duration = "未知";
                        if (history.getTrainStartTime() != null && history.getTrainEndTime() != null) {
                            java.time.Duration timeDuration = java.time.Duration.between(history.getTrainStartTime(), history.getTrainEndTime());
                            long seconds = timeDuration.getSeconds();
                            if (seconds >= 60) {
                                long minutes = seconds / 60;
                                long remainingSeconds = seconds % 60;
                                if (remainingSeconds > 0) {
                                    duration = minutes + "分" + remainingSeconds + "秒";
                                } else {
                                    duration = minutes + "分钟";
                                }
                            } else {
                                duration = seconds + "秒";
                            }
                        }
                        historyMap.put("duration", duration);
                        
                        trainingHistory.add(historyMap);
                    }
                    
                    log.info("获取训练历史成功: modelId={}, count={}", modelId, trainingHistory.size());
                } catch (Exception e) {
                    log.error("获取训练历史失败: modelId={}", modelId, e);
                }
            }
            
            // 如果没有历史记录且有最后训练时间，创建一个基于当前状态的记录
            if (trainingHistory.isEmpty() && model.getLastTrainTime() != null && model.getTrainStatus() != null) {
                Map<String, Object> currentHistory = new HashMap<>();
                currentHistory.put("id", 0);
                currentHistory.put("startTime", model.getLastTrainTime());
                currentHistory.put("endTime", model.getLastTrainTime().plusMinutes(5));
                currentHistory.put("status", model.getTrainStatus());
                currentHistory.put("modelVersion", "v1.0.0");
                currentHistory.put("accuracy", "95.2%");
                currentHistory.put("duration", "5分钟");
                trainingHistory.add(currentHistory);
                log.info("使用当前模型状态创建历史记录: modelId={}", modelId);
            }
            
            result.put("trainingHistory", trainingHistory);
            
            log.info("获取模型详情成功: modelId={}", modelId);
            return result;
            
        } catch (Exception e) {
            log.error("获取模型详情失败: modelId={}", modelId, e);
            throw new RuntimeException("获取模型详情失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getServiceDevices(Long serviceId) {
        try {
            // 获取服务关联的所有设备
            List<Map<String, Object>> models = predictionModelDeviceMapper.selectByServiceIdWithDetails(serviceId);
            
            // 提取唯一的设备
            Map<Long, Map<String, Object>> deviceMap = new HashMap<>();
            for (Map<String, Object> model : models) {
                Long deviceId = (Long) model.get("device_id");
                if (deviceId != null && !deviceMap.containsKey(deviceId)) {
                    Map<String, Object> device = new HashMap<>();
                    device.put("id", deviceId);
                    device.put("deviceName", model.get("device_name"));
                    device.put("name", model.get("device_name"));
                    deviceMap.put(deviceId, device);
                }
            }
            
            List<Map<String, Object>> devices = new ArrayList<>(deviceMap.values());
            log.info("获取服务设备列表成功: serviceId={}, count={}", serviceId, devices.size());
            return devices;
            
        } catch (Exception e) {
            log.error("获取服务设备列表失败: serviceId={}", serviceId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getServiceMetrics(Long serviceId) {
        try {
            // 获取服务关联的所有模型
            List<Map<String, Object>> models = predictionModelDeviceMapper.selectByServiceIdWithDetails(serviceId);
            
            // 提取唯一的监测指标
            Map<String, Map<String, Object>> metricMap = new HashMap<>();
            for (Map<String, Object> model : models) {
                String monitoringMetric = (String) model.get("monitoring_metric");
                if (monitoringMetric != null && !metricMap.containsKey(monitoringMetric)) {
                    Map<String, Object> metric = new HashMap<>();
                    metric.put("monitoringMetric", monitoringMetric);
                    metric.put("metric", monitoringMetric);
                    metricMap.put(monitoringMetric, metric);
                }
            }
            
            List<Map<String, Object>> metrics = new ArrayList<>(metricMap.values());
            log.info("获取服务监测指标列表成功: serviceId={}, count={}", serviceId, metrics.size());
            return metrics;
            
        } catch (Exception e) {
            log.error("获取服务监测指标列表失败: serviceId={}", serviceId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getServiceModelDevices(Long serviceId) {
        try {
            log.info("获取服务模型设备数据: serviceId={}", serviceId);
            
            // 获取服务关联的所有模型设备组合数据
            List<Map<String, Object>> modelDevices = predictionModelDeviceMapper.selectByServiceIdWithDetails(serviceId);
            
            log.info("获取服务模型设备数据成功: serviceId={}, count={}", serviceId, modelDevices.size());
            return modelDevices;
            
        } catch (Exception e) {
            log.error("获取服务模型设备数据失败: serviceId={}", serviceId, e);
            return new ArrayList<>();
        }
    }
}
