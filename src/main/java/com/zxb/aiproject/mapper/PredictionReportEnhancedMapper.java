package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.PredictionReportEnhanced;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 增强预测报告Mapper接口
 */
@Mapper
public interface PredictionReportEnhancedMapper extends BaseMapper<PredictionReportEnhanced> {

    /**
     * 根据服务ID删除预测报告数据
     * @param serviceId 服务ID
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_report_enhanced WHERE service_id = #{serviceId}")
    int deleteByServiceId(@Param("serviceId") Long serviceId);

    /**
     * 获取服务的最新报告列表
     * @param serviceId 服务ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    @Select("SELECT * FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND (#{reportType} IS NULL OR report_type = #{reportType}) " +
            "AND deleted = 0 " +
            "ORDER BY report_time DESC " +
            "LIMIT #{limit}")
    List<PredictionReportEnhanced> getLatestReports(@Param("serviceId") Long serviceId,
                                                   @Param("reportType") String reportType,
                                                   @Param("limit") Integer limit);

    /**
     * 获取设备的最新报告列表
     * @param serviceId 服务ID
     * @param deviceId 设备ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    @Select("SELECT * FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND device_id = #{deviceId} " +
            "AND (#{reportType} IS NULL OR report_type = #{reportType}) " +
            "AND deleted = 0 " +
            "ORDER BY report_time DESC " +
            "LIMIT #{limit}")
    List<PredictionReportEnhanced> getDeviceLatestReports(@Param("serviceId") Long serviceId,
                                                         @Param("deviceId") Long deviceId,
                                                         @Param("reportType") String reportType,
                                                         @Param("limit") Integer limit);

    /**
     * 获取时间范围内的报告统计
     * @param serviceId 服务ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    @Select("SELECT " +
            "report_type, " +
            "COUNT(*) as report_count, " +
            "AVG(health_score) as avg_health_score, " +
            "MIN(health_score) as min_health_score, " +
            "MAX(health_score) as max_health_score " +
            "FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND report_time >= #{startTime} AND report_time <= #{endTime} " +
            "AND deleted = 0 " +
            "GROUP BY report_type")
    List<Map<String, Object>> getReportStatsByTimeRange(@Param("serviceId") Long serviceId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 检查是否已存在相同周期的报告
     * @param serviceId 服务ID
     * @param deviceId 设备ID
     * @param reportType 报告类型
     * @param periodStart 周期开始时间
     * @param periodEnd 周期结束时间
     * @return 报告数量
     */
    @Select("SELECT COUNT(*) FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND (#{deviceId} IS NULL OR device_id = #{deviceId}) " +
            "AND report_type = #{reportType} " +
            "AND period_start = #{periodStart} " +
            "AND period_end = #{periodEnd} " +
            "AND deleted = 0")
    int countExistingReport(@Param("serviceId") Long serviceId,
                           @Param("deviceId") Long deviceId,
                           @Param("reportType") String reportType,
                           @Param("periodStart") LocalDateTime periodStart,
                           @Param("periodEnd") LocalDateTime periodEnd);

    /**
     * 统计指定时间范围内的报告数量
     */
    @Select("SELECT COUNT(*) FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND (#{deviceId} IS NULL OR device_id = #{deviceId}) " +
            "AND report_type = #{reportType} " +
            "AND period_start >= #{startTime} AND period_end <= #{endTime} " +
            "AND deleted = 0")
    int countReportsInTimeRange(@Param("serviceId") Long serviceId,
                               @Param("deviceId") Long deviceId,
                               @Param("reportType") String reportType,
                               @Param("startTime") LocalDateTime startTime,
                               @Param("endTime") LocalDateTime endTime);

    /**
     * 获取指定时间范围内的健康度报告（用于趋势分析）
     */
    @Select("SELECT * FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND report_type = 'HEALTH' " +
            "AND report_time >= #{startTime} AND report_time <= #{endTime} " +
            "AND health_score IS NOT NULL " +
            "AND deleted = 0 " +
            "ORDER BY report_time ASC")
    List<PredictionReportEnhanced> getHealthReportsInPeriod(@Param("serviceId") Long serviceId,
                                                           @Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);

    /**
     * 获取健康度趋势数据
     * @param serviceId 服务ID
     * @param deviceId 设备ID
     * @param reportType 报告类型
     * @param days 天数
     * @return 趋势数据
     */
    @Select("SELECT " +
            "DATE(report_time) as report_date, " +
            "AVG(health_score) as avg_health_score, " +
            "COUNT(*) as report_count " +
            "FROM prediction_report_enhanced " +
            "WHERE service_id = #{serviceId} " +
            "AND (#{deviceId} IS NULL OR device_id = #{deviceId}) " +
            "AND report_type = #{reportType} " +
            "AND report_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "AND deleted = 0 " +
            "GROUP BY DATE(report_time) " +
            "ORDER BY report_date DESC")
    List<Map<String, Object>> getHealthTrend(@Param("serviceId") Long serviceId,
                                           @Param("deviceId") Long deviceId,
                                           @Param("reportType") String reportType,
                                           @Param("days") Integer days);

    /**
     * 清理过期报告 (保留最近指定天数)
     * @param days 保留天数
     * @return 删除的记录数
     */
    @Delete("DELETE FROM prediction_report_enhanced " +
            "WHERE report_time < DATE_SUB(NOW(), INTERVAL #{days} DAY)")
    int cleanupOldReports(@Param("days") Integer days);

    /**
     * 根据分类ID获取报告列表
     * @param categoryId 分类ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    @Select("SELECT * FROM prediction_report_enhanced " +
            "WHERE category_id = #{categoryId} " +
            "AND (#{reportType} IS NULL OR report_type = #{reportType}) " +
            "AND deleted = 0 " +
            "ORDER BY report_time DESC " +
            "LIMIT #{limit}")
    List<PredictionReportEnhanced> getReportsByCategoryId(@Param("categoryId") Long categoryId,
                                                          @Param("reportType") String reportType,
                                                          @Param("limit") Integer limit);
    
    /**
     * 获取所有有报告数据的分类ID列表（去重）
     * @return 分类ID列表
     */
    @Select("SELECT DISTINCT category_id FROM prediction_report_enhanced " +
            "WHERE category_id IS NOT NULL " +
            "AND deleted = 0 " +
            "ORDER BY category_id")
    List<Long> getDistinctCategoryIds();
}
