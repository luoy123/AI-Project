package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionTrainHistory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 模型训练历史Mapper接口
 */
@Mapper
public interface PredictionTrainHistoryMapper extends BaseMapper<PredictionTrainHistory> {

    /**
     * 获取服务的训练历史（带设备、指标和算法类型信息）
     * 每个训练记录与每个设备形成一行，多个设备会产生多行
     */
    @Select("SELECT " +
            "    pth.id AS id, " +
            "    pth.service_id AS serviceId, " +
            "    pth.train_start_time AS trainStartTime, " +
            "    pth.train_end_time AS trainEndTime, " +
            "    pth.train_status AS trainStatus, " +
            "    pth.train_duration AS trainDuration, " +
            "    pth.data_count AS dataCount, " +
            "    pth.model_version AS modelVersion, " +
            "    pth.accuracy_rate AS accuracyRate, " +
            "    pth.error_message AS errorMessage, " +
            "    pth.create_time AS createTime, " +
            "    pms.monitoring_metric AS monitoringMetric, " +
            "    pms.monitoring_type AS detectionType, " +
            "    pms.device_category AS deviceCategory, " +
            "    pms.notes AS notes, " +
            "    a.device_name AS deviceName " +
            "FROM prediction_train_history pth " +
            "LEFT JOIN prediction_model_service pms ON pth.service_id = pms.id " +
            "LEFT JOIN asset_category ac ON pms.device_category = ac.category_name " +
            "LEFT JOIN asset a ON ac.id = a.category_id AND a.deleted = 0 " +
            "WHERE pth.service_id = #{serviceId} " +
            "ORDER BY pth.train_start_time DESC, a.device_name ASC")
    List<Map<String, Object>> selectTrainingHistoryByServiceId(@Param("serviceId") Long serviceId);

    /**
     * 统计服务的成功训练次数
     */
    @Select("SELECT COUNT(*) FROM prediction_train_history " +
            "WHERE service_id = #{serviceId} AND train_status = 'success'")
    int countSuccessTrains(@Param("serviceId") Long serviceId);

    /**
     * 获取服务的最后训练时间
     */
    @Select("SELECT MAX(train_end_time) FROM prediction_train_history " +
            "WHERE service_id = #{serviceId} AND train_status = 'success'")
    String getLastTrainTime(@Param("serviceId") Long serviceId);

    /**
     * 获取服务的平均准确率
     */
    @Select("SELECT AVG(accuracy_rate) FROM prediction_train_history " +
            "WHERE service_id = #{serviceId} AND train_status = 'success'")
    Double getAvgAccuracy(@Param("serviceId") Long serviceId);

    /**
     * 根据服务ID删除训练历史数据
     * @param serviceId 服务ID
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_train_history WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);
}
