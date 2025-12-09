package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionReport;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 预测报告Mapper接口
 */
@Mapper
public interface PredictionReportMapper extends BaseMapper<PredictionReport> {

    /**
     * 根据服务ID删除预测报告数据
     * @param serviceId 服务ID
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_report WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);
}
