package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionModelDevice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 预测模型设备关联Mapper（合并后）
 */
@Mapper
public interface PredictionModelDeviceMapper extends BaseMapper<PredictionModelDevice> {

    /**
     * 根据服务ID查询所有关联的设备记录（包含设备信息）
     * 返回 Map 包含：device_id, device_name, category_id, category_name, parent_category_name, 
     * monitoring_type, monitoring_metric, status, last_train_time, train_status
     */
    @Select("SELECT pmd.id, pmd.service_id, pmd.device_id, a.device_name, " +
            "pmd.category_id, ac.category_name, pac.category_name AS parent_category_name, " +
            "pmd.monitoring_type, pmd.monitoring_metric, pmd.status, " +
            "pmd.last_train_time, pmd.train_status, pmd.notes, pmd.create_time " +
            "FROM prediction_model_device pmd " +
            "LEFT JOIN asset a ON pmd.device_id = a.id AND a.deleted = 0 " +
            "LEFT JOIN asset_category ac ON pmd.category_id = ac.id " +
            "LEFT JOIN asset_category pac ON ac.parent_id = pac.id " +
            "WHERE pmd.service_id = #{serviceId} AND pmd.deleted = 0 " +
            "ORDER BY pmd.id")
    List<java.util.Map<String, Object>> selectByServiceIdWithDetails(@Param("serviceId") Long serviceId);

    /**
     * 根据服务ID查询关联的设备数量
     */
    @Select("SELECT COUNT(*) FROM prediction_model_device " +
            "WHERE service_id = #{serviceId} AND deleted = 0")
    int countDevicesByServiceId(@Param("serviceId") Long serviceId);

    /**
     * 批量插入模型-设备关联
     */
    int batchInsert(@Param("list") List<PredictionModelDevice> list);

    /**
     * 物理删除指定服务的所有设备关联（避免唯一约束冲突）
     */
    @Update("DELETE FROM prediction_model_device WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);
}
