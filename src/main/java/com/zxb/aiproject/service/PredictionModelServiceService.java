package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.dto.PredictionModelServiceDTO;
import com.zxb.aiproject.entity.PredictionModelService;

import java.util.List;
import java.util.Map;

/**
 * 算法模型服务Service接口
 */
public interface PredictionModelServiceService extends IService<PredictionModelService> {

    /**
     * 查询算法模型服务列表(带统计信息)
     */
    List<Map<String, Object>> getServiceListWithStats(String serviceName, Integer status,
                                                       String deviceType, String keyword);

    /**
     * 获取服务详情(带统计信息)
     */
    Map<String, Object> getServiceDetail(Long serviceId);

    /**
     * 创建算法模型服务
     */
    Long createService(PredictionModelServiceDTO dto);

    /**
     * 更新算法模型服务
     */
    boolean updateService(PredictionModelServiceDTO dto);

    /**
     * 删除算法模型服务
     */
    boolean deleteService(Long serviceId);

    /**
     * 启用/停用服务
     */
    boolean toggleServiceStatus(Long serviceId, Integer status);

    /**
     * 生成唯一服务编码
     */
    String generateServiceCode(String algorithmType, String deviceType);

    /**
     * 检查服务编码是否存在
     */
    boolean checkServiceCodeExists(String serviceCode, Long excludeId);

    /**
     * 更新训练统计信息
     */
    boolean updateTrainStats(Long serviceId);

    /**
     * 更新预测统计信息
     */
    boolean updatePredictionStats(Long serviceId);
    
    /**
     * 获取服务的训练历史
     */
    List<?> getTrainingHistory(Long serviceId);
    
    /**
     * 开始训练模型
     */
    String startTraining(Long serviceId);

    /**
     * 开始训练单个模型设备组合
     */
    String startSingleModelTraining(Long modelId);
    
    /**
     * 获取服务的模型组合列表
     */
    List<Map<String, Object>> getServiceModels(Long serviceId);
    
    /**
     * 获取模型详情和训练历史
     */
    Map<String, Object> getModelDetails(Long modelId);
    
    /**
     * 获取服务的设备列表
     */
    List<Map<String, Object>> getServiceDevices(Long serviceId);
    
    /**
     * 获取服务的监测指标列表
     */
    List<Map<String, Object>> getServiceMetrics(Long serviceId);
    
    /**
     * 获取服务的模型设备组合数据（用于编辑回填）
     */
    List<Map<String, Object>> getServiceModelDevices(Long serviceId);
}
