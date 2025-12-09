package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionResult;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 预测结果数据访问层
 */
@Mapper
public interface PredictionResultMapper extends BaseMapper<PredictionResult> {

    /**
     * 根据时间范围查询预测结果统计
     */
    @Select("SELECT " +
            "COUNT(*) as total_predictions, " +
            "SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) as anomaly_count, " +
            "AVG(confidence) as avg_confidence, " +
            "COUNT(DISTINCT device_id) as device_count " +
            "FROM prediction_result " +
            "WHERE prediction_time >= #{startTime} AND prediction_time <= #{endTime}")
    Map<String, Object> getStatsByTimeRange(@Param("startTime") LocalDateTime startTime, 
                                          @Param("endTime") LocalDateTime endTime);

    /**
     * 根据服务ID和时间范围查询预测结果
     */
    @Select("SELECT * FROM prediction_result " +
            "WHERE service_id = #{serviceId} " +
            "AND prediction_time >= #{startTime} AND prediction_time <= #{endTime} " +
            "ORDER BY prediction_time DESC")
    List<PredictionResult> getByServiceIdAndTimeRange(@Param("serviceId") Long serviceId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime);

    /**
     * 获取最近的预测结果
     */
    @Select("SELECT * FROM prediction_result " +
            "WHERE device_id = #{deviceId} " +
            "ORDER BY prediction_time DESC " +
            "LIMIT #{limit}")
    List<PredictionResult> getRecentByDeviceId(@Param("deviceId") Long deviceId, 
                                             @Param("limit") Integer limit);

    /**
     * 清理过期的预测结果（保留最近30天）
     */
    @Select("DELETE FROM prediction_result " +
            "WHERE prediction_time < DATE_SUB(NOW(), INTERVAL 30 DAY)")
    int cleanupOldResults();

    /**
     * 根据服务ID删除预测结果数据
     * @param serviceId 服务ID
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_result WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);

    /**
     * 动态聚合查询：按设备ID和时间范围统计
     */
    @Select("SELECT " +
            "device_id, " +
            "category_id, " +
            "COUNT(*) as total_predictions, " +
            "SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) as anomaly_count, " +
            "AVG(CASE WHEN actual_value IS NOT NULL AND actual_value > 0 " +
            "    THEN (1 - ABS(predicted_value - actual_value) / actual_value) " +
            "    ELSE NULL END) as accuracy_rate, " +
            "(1 - SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) / COUNT(*)) as health_score, " +
            "MIN(prediction_time) as period_start, " +
            "MAX(prediction_time) as period_end " +
            "FROM prediction_result " +
            "WHERE device_id = #{deviceId} " +
            "AND prediction_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "GROUP BY device_id, category_id")
    Map<String, Object> getDeviceStatsByDays(@Param("deviceId") Long deviceId, 
                                           @Param("days") Integer days);

    /**
     * 动态聚合查询：按分类ID和时间范围统计
     */
    @Select("SELECT " +
            "category_id, " +
            "COUNT(DISTINCT device_id) as device_count, " +
            "COUNT(*) as total_predictions, " +
            "SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) as anomaly_count, " +
            "AVG(CASE WHEN actual_value IS NOT NULL AND actual_value > 0 " +
            "    THEN (1 - ABS(predicted_value - actual_value) / actual_value) " +
            "    ELSE NULL END) as accuracy_rate, " +
            "(1 - SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) / COUNT(*)) as health_score " +
            "FROM prediction_result " +
            "WHERE category_id = #{categoryId} " +
            "AND prediction_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "GROUP BY category_id")
    Map<String, Object> getCategoryStatsByDays(@Param("categoryId") Long categoryId, 
                                             @Param("days") Integer days);

    /**
     * 获取分类下的设备列表及其统计信息
     */
    @Select("SELECT " +
            "device_id, " +
            "category_id, " +
            "COUNT(*) as total_predictions, " +
            "SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) as anomaly_count, " +
            "AVG(CASE WHEN actual_value IS NOT NULL AND actual_value > 0 " +
            "    THEN (1 - ABS(predicted_value - actual_value) / actual_value) " +
            "    ELSE NULL END) as accuracy_rate, " +
            "(1 - SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) / COUNT(*)) as health_score, " +
            "MIN(prediction_time) as period_start, " +
            "MAX(prediction_time) as period_end " +
            "FROM prediction_result " +
            "WHERE category_id = #{categoryId} " +
            "AND prediction_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "GROUP BY device_id, category_id " +
            "ORDER BY device_id")
    List<Map<String, Object>> getDeviceListByCategoryAndDays(@Param("categoryId") Long categoryId, 
                                                            @Param("days") Integer days);

    /**
     * 获取健康度统计（按分类）
     */
    @Select("SELECT " +
            "category_id, " +
            "COUNT(DISTINCT device_id) as total_devices, " +
            "COUNT(DISTINCT CASE WHEN health_score >= 0.7 THEN device_id END) as normal_devices, " +
            "COUNT(DISTINCT CASE WHEN health_score < 0.7 THEN device_id END) as abnormal_devices " +
            "FROM (" +
            "  SELECT device_id, category_id, " +
            "  (1 - SUM(CASE WHEN is_anomalous = 1 THEN 1 ELSE 0 END) / COUNT(*)) as health_score " +
            "  FROM prediction_result " +
            "  WHERE category_id = #{categoryId} " +
            "  AND prediction_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "  GROUP BY device_id, category_id" +
            ") device_health " +
            "GROUP BY category_id")
    Map<String, Object> getHealthStatsByCategory(@Param("categoryId") Long categoryId, 
                                               @Param("days") Integer days);
}
