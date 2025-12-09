package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionModelService;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 算法模型服务Mapper
 */
@Mapper
public interface PredictionModelServiceMapper extends BaseMapper<PredictionModelService> {

    /**
     * 查询算法模型服务列表(带统计信息)
     */
    List<Map<String, Object>> selectServiceListWithStats(@Param("serviceName") String serviceName,
                                                          @Param("status") Integer status,
                                                          @Param("deviceType") String deviceType,
                                                          @Param("keyword") String keyword);

    /**
     * 获取服务统计信息
     */
    Map<String, Object> selectServiceStats(@Param("serviceId") Long serviceId);

    /**
     * 检查服务编码是否存在
     */
    int checkServiceCodeExists(@Param("serviceCode") String serviceCode, @Param("excludeId") Long excludeId);

    /**
     * 更新服务状态
     */
    int updateServiceStatus(@Param("serviceId") Long serviceId, @Param("status") Integer status);

    /**
     * 更新训练统计信息
     */
    int updateTrainStats(@Param("serviceId") Long serviceId);

    /**
     * 更新预测统计信息
     */
    int updatePredictionStats(@Param("serviceId") Long serviceId);
}
