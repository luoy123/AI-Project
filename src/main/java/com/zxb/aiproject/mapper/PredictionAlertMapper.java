package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionAlert;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 预测告警Mapper
 */
@Mapper
public interface PredictionAlertMapper extends BaseMapper<PredictionAlert> {

    /**
     * 根据服务ID删除预测告警数据
     * @param serviceId 服务ID
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_alert WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);
}
