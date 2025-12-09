package com.zxb.aiproject.service;

import com.zxb.aiproject.dto.AlertStats;
import com.zxb.aiproject.dto.DynamicReportDTO;
import com.zxb.aiproject.dto.PredictionStats;
import com.zxb.aiproject.entity.PredictionReportEnhanced;
import com.zxb.aiproject.mapper.PredictionReportEnhancedMapper;
import com.zxb.aiproject.mapper.PredictionResultMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 预测报告生成服务
 * 负责智能生成各类预测分析报告
 */
@Slf4j
@Service
public class PredictionReportService {
    
    @Autowired
    private ReportDataCollector reportDataCollector;
    
    @Autowired
    private HealthScoreCalculator healthScoreCalculator;
    
    @Autowired
    private ReportContentGenerator contentGenerator;
    
    @Autowired
    private PredictionReportEnhancedMapper reportMapper;
    
    @Autowired
    private PredictionResultMapper predictionResultMapper;
    
    /**
     * 生成健康度报告
     * @param serviceId 服务ID
     * @param deviceId 设备ID (null表示服务级别报告)
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 生成的报告
     */
    @Transactional(rollbackFor = Exception.class)
    public PredictionReportEnhanced generateHealthReport(Long serviceId, Long deviceId, 
                                                        LocalDateTime startTime, LocalDateTime endTime) {
        try {
            log.info("开始生成健康度报告: serviceId={}, deviceId={}, period={} to {}", 
                    serviceId, deviceId, startTime, endTime);
            
            // 检查是否已存在相同周期的报告
            if (reportExists(serviceId, deviceId, "HEALTH", startTime, endTime)) {
                log.info("相同周期的健康度报告已存在，跳过生成");
                return null;
            }
            
            // 1. 收集基础数据
            reportDataCollector.init(serviceId, deviceId, startTime, endTime);
            PredictionStats predictionStats = reportDataCollector.collectPredictionStats();
            AlertStats alertStats = reportDataCollector.collectAlertStats();
            
            // 2. 计算健康度评分
            BigDecimal healthScore = healthScoreCalculator.calculateHealthScore(predictionStats, alertStats);
            
            // 3. 生成报告内容
            ReportContentGenerator.ReportContent content = contentGenerator.generateHealthReportContent(
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 4. 创建报告实体
            PredictionReportEnhanced report = buildHealthReport(serviceId, deviceId, content, 
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 5. 保存报告
            reportMapper.insert(report);
            
            log.info("健康度报告生成成功: reportId={}, healthScore={}", report.getId(), healthScore);
            return report;
            
        } catch (Exception e) {
            log.error("生成健康度报告失败: serviceId={}, deviceId={}, error={}", 
                     serviceId, deviceId, e.getMessage(), e);
            throw new RuntimeException("生成健康度报告失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 生成趋势分析报告
     * @param serviceId 服务ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 生成的报告
     */
    @Transactional(rollbackFor = Exception.class)
    public PredictionReportEnhanced generateTrendReport(Long serviceId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            log.info("开始生成趋势分析报告: serviceId={}, period={} to {}", serviceId, startTime, endTime);
            
            // 检查是否已存在相同周期的报告
            if (reportExists(serviceId, null, "TREND", startTime, endTime)) {
                log.info("相同周期的趋势分析报告已存在，跳过生成");
                return null;
            }
            
            // 收集数据并分析趋势
            reportDataCollector.init(serviceId, null, startTime, endTime);
            PredictionStats predictionStats = reportDataCollector.collectPredictionStats();
            AlertStats alertStats = reportDataCollector.collectAlertStats();
            
            // 计算健康度评分
            BigDecimal healthScore = healthScoreCalculator.calculateHealthScore(predictionStats, alertStats);
            
            // 生成趋势报告内容
            ReportContentGenerator.ReportContent content = generateTrendReportContent(
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 创建报告实体
            PredictionReportEnhanced report = buildTrendReport(serviceId, content, 
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 保存报告
            reportMapper.insert(report);
            
            log.info("趋势分析报告生成成功: reportId={}", report.getId());
            return report;
            
        } catch (Exception e) {
            log.error("生成趋势分析报告失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            throw new RuntimeException("生成趋势分析报告失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 根据ID获取单个报告
     * @param reportId 报告ID
     * @return 报告详情
     */
    public PredictionReportEnhanced getReportById(Long reportId) {
        try {
            return reportMapper.selectById(reportId);
        } catch (Exception e) {
            log.error("获取报告详情失败: reportId={}, error={}", reportId, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 获取服务的最新报告列表
     * @param serviceId 服务ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    public List<PredictionReportEnhanced> getLatestReports(Long serviceId, String reportType, Integer limit) {
        try {
            return reportMapper.getLatestReports(serviceId, reportType, limit != null ? limit : 10);
        } catch (Exception e) {
            log.error("获取最新报告失败: serviceId={}, reportType={}, error={}", 
                     serviceId, reportType, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 根据分类ID获取报告列表（直接从数据库查询）
     * @param categoryId 分类ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    public List<PredictionReportEnhanced> getReportsByCategoryId(Long categoryId, String reportType, Integer limit) {
        try {
            log.info("根据分类ID获取报告: categoryId={}, reportType={}, limit={}", categoryId, reportType, limit);
            
            // 直接从数据库按category_id字段查询
            List<PredictionReportEnhanced> reports = reportMapper.getReportsByCategoryId(categoryId, reportType, limit != null ? limit : 100);
            
            log.info("分类ID {} 获得报告数量: {}", categoryId, reports.size());
            return reports;
        } catch (Exception e) {
            log.error("根据分类ID获取报告失败: categoryId={}, reportType={}, error={}", 
                     categoryId, reportType, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 获取所有有报告数据的分类ID列表
     * @return 分类ID列表
     */
    public List<Long> getCategoryIdsWithReports() {
        try {
            log.info("获取所有有报告数据的分类ID");
            List<Long> categoryIds = reportMapper.getDistinctCategoryIds();
            log.info("找到 {} 个有报告数据的分类", categoryIds.size());
            return categoryIds;
        } catch (Exception e) {
            log.error("获取分类ID列表失败: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 判断报告是否应该包含在指定分类中
     * @param report 报告
     * @param categoryId 分类ID
     * @return 是否包含
     */
    private boolean shouldIncludeReportForCategory(PredictionReportEnhanced report, Long categoryId) {
        // 模拟分类过滤逻辑
        // 实际应该根据设备表的category_id字段进行判断
        
        // 为了演示不同分类的不同数据，我们根据分类ID返回不同的结果
        if (categoryId == null) {
            return true; // 无分类限制，返回所有
        }
        
        // 根据分类ID模拟不同的设备健康度
        Long serviceId = report.getServiceId();
        if (serviceId == null) return false;
        
        // 模拟逻辑：不同分类显示不同的设备数据，并修改报告内容使其更真实
        switch (categoryId.intValue()) {
            case 1: // 服务器
            case 5: // Web服务器
            case 6: // 数据库服务器
            case 7: // 应用服务器
                if (serviceId % 4 == 1) {
                    // 为应用服务器分类生成更真实的数据
                    updateReportForCategory(report, categoryId, getCategoryName(categoryId));
                    return true;
                }
                return false;
            case 2: // 网络设备
            case 8: // 交换机
            case 9: // 路由器
                if (serviceId % 3 == 0) {
                    updateReportForCategory(report, categoryId, getCategoryName(categoryId));
                    return true;
                }
                return false;
            case 3: // 存储设备
            case 13: // NAS存储
            case 14: // SAN存储
                if (serviceId % 5 == 2) {
                    updateReportForCategory(report, categoryId, getCategoryName(categoryId));
                    return true;
                }
                return false;
            case 4: // 视频管理
            case 15: // 摄像头
                if (serviceId % 2 == 0) {
                    updateReportForCategory(report, categoryId, getCategoryName(categoryId));
                    return true;
                }
                return false;
            default:
                if (serviceId % 6 == 1) {
                    updateReportForCategory(report, categoryId, getCategoryName(categoryId));
                    return true;
                }
                return false;
        }
    }
    
    /**
     * 创建报告副本
     */
    private PredictionReportEnhanced createReportCopy(PredictionReportEnhanced original) {
        return PredictionReportEnhanced.builder()
                .id(original.getId())
                .serviceId(original.getServiceId())
                .deviceId(original.getDeviceId())
                .reportType(original.getReportType())
                .reportPeriod(original.getReportPeriod())
                .reportTitle(original.getReportTitle())
                .totalPredictions(original.getTotalPredictions())
                .anomalyCount(original.getAnomalyCount())
                .accuracyRate(original.getAccuracyRate())
                .healthScore(original.getHealthScore())
                .criticalAlerts(original.getCriticalAlerts())
                .warningAlerts(original.getWarningAlerts())
                .infoAlerts(original.getInfoAlerts())
                .trendDirection(original.getTrendDirection())
                .trendConfidence(original.getTrendConfidence())
                .summary(original.getSummary())
                .keyFindings(original.getKeyFindings())
                .recommendations(original.getRecommendations())
                .detailedAnalysis(original.getDetailedAnalysis())
                .periodStart(original.getPeriodStart())
                .periodEnd(original.getPeriodEnd())
                .reportTime(original.getReportTime())
                .generatedBy(original.getGeneratedBy())
                .templateVersion(original.getTemplateVersion())
                .build();
    }
    
    /**
     * 获取分类名称
     */
    private String getCategoryName(Long categoryId) {
        switch (categoryId.intValue()) {
            case 1: return "服务器";
            case 5: return "Web服务器";
            case 6: return "数据库服务器";
            case 7: return "应用服务器";
            case 8: return "交换机";
            case 9: return "路由器";
            case 13: return "NAS存储";
            case 14: return "SAN存储";
            case 15: return "摄像头";
            default: return "其他设备";
        }
    }
    
    /**
     * 根据分类更新报告数据，使其更真实
     */
    private void updateReportForCategory(PredictionReportEnhanced report, Long categoryId, String categoryName) {
        Long serviceId = report.getServiceId();
        
        // 根据分类和设备ID生成更真实的数据
        switch (categoryId.intValue()) {
            case 7: // 应用服务器
                report.setReportTitle("应用服务器" + serviceId + "健康度报告");
                report.setTotalPredictions(800 + (serviceId.intValue() * 50)); // 800-1200次预测
                report.setAnomalyCount(5 + (serviceId.intValue() % 10)); // 5-15次异常
                report.setAccuracyRate(new java.math.BigDecimal(92.0 + (serviceId % 8))); // 92-99%准确率
                report.setHealthScore(new java.math.BigDecimal(0.75 + (serviceId % 3) * 0.08)); // 75-91%健康度
                break;
            case 5: // Web服务器
                report.setReportTitle("Web服务器" + serviceId + "健康度报告");
                report.setTotalPredictions(600 + (serviceId.intValue() * 30));
                report.setAnomalyCount(3 + (serviceId.intValue() % 8));
                report.setAccuracyRate(new java.math.BigDecimal(88.0 + (serviceId % 10)));
                report.setHealthScore(new java.math.BigDecimal(0.70 + (serviceId % 4) * 0.07));
                break;
            case 15: // 摄像头
                report.setReportTitle("摄像头设备" + serviceId + "健康度报告");
                report.setTotalPredictions(200 + (serviceId.intValue() * 20));
                report.setAnomalyCount(1 + (serviceId.intValue() % 5));
                report.setAccuracyRate(new java.math.BigDecimal(85.0 + (serviceId % 12)));
                report.setHealthScore(new java.math.BigDecimal(0.68 + (serviceId % 5) * 0.06));
                break;
            case 8: // 交换机
                report.setReportTitle("交换机设备" + serviceId + "健康度报告");
                report.setTotalPredictions(400 + (serviceId.intValue() * 25));
                report.setAnomalyCount(2 + (serviceId.intValue() % 6));
                report.setAccuracyRate(new java.math.BigDecimal(90.0 + (serviceId % 8)));
                report.setHealthScore(new java.math.BigDecimal(0.72 + (serviceId % 4) * 0.06));
                break;
            default:
                report.setReportTitle(categoryName + serviceId + "健康度报告");
                report.setTotalPredictions(300 + (serviceId.intValue() * 40));
                report.setAnomalyCount(4 + (serviceId.intValue() % 7));
                report.setAccuracyRate(new java.math.BigDecimal(87.0 + (serviceId % 10)));
                report.setHealthScore(new java.math.BigDecimal(0.69 + (serviceId % 4) * 0.08));
        }
    }
    
    /**
     * 获取设备的最新报告列表
     * @param serviceId 服务ID
     * @param deviceId 设备ID
     * @param reportType 报告类型
     * @param limit 限制数量
     * @return 报告列表
     */
    public List<PredictionReportEnhanced> getDeviceLatestReports(Long serviceId, Long deviceId, 
                                                               String reportType, Integer limit) {
        try {
            return reportMapper.getDeviceLatestReports(serviceId, deviceId, reportType, limit != null ? limit : 10);
        } catch (Exception e) {
            log.error("获取设备最新报告失败: serviceId={}, deviceId={}, reportType={}, error={}", 
                     serviceId, deviceId, reportType, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 检查报告是否已存在
     */
    private boolean reportExists(Long serviceId, Long deviceId, String reportType, 
                               LocalDateTime startTime, LocalDateTime endTime) {
        try {
            int count = reportMapper.countExistingReport(serviceId, deviceId, reportType, startTime, endTime);
            return count > 0;
        } catch (Exception e) {
            log.warn("检查报告存在性失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 构建健康度报告实体
     */
    private PredictionReportEnhanced buildHealthReport(Long serviceId, Long deviceId, 
                                                     ReportContentGenerator.ReportContent content,
                                                     PredictionStats predictionStats, AlertStats alertStats,
                                                     BigDecimal healthScore, LocalDateTime startTime, LocalDateTime endTime) {
        
        String reportTitle = generateReportTitle("HEALTH", serviceId, deviceId, startTime, endTime);
        
        return PredictionReportEnhanced.builder()
                .serviceId(serviceId)
                .deviceId(deviceId)
                .reportType("HEALTH")
                .reportPeriod("DAILY")
                .reportTitle(reportTitle)
                .totalPredictions(predictionStats.getTotalPredictions())
                .anomalyCount(predictionStats.getAnomalyCount())
                .accuracyRate(predictionStats.getAccuracyRate())
                .healthScore(healthScore)
                .criticalAlerts(alertStats.getCriticalAlerts())
                .warningAlerts(alertStats.getWarningAlerts())
                .infoAlerts(alertStats.getInfoAlerts())
                .summary(content.getSummary())
                .keyFindings(content.getKeyFindings())
                .recommendations(content.getRecommendations())
                .detailedAnalysis(content.getDetailedAnalysis())
                .periodStart(startTime)
                .periodEnd(endTime)
                .reportTime(LocalDateTime.now())
                .generatedBy("SYSTEM")
                .templateVersion("v1.0")
                .build();
    }
    
    /**
     * 构建趋势分析报告实体
     */
    private PredictionReportEnhanced buildTrendReport(Long serviceId, ReportContentGenerator.ReportContent content,
                                                    PredictionStats predictionStats, AlertStats alertStats,
                                                    BigDecimal healthScore, LocalDateTime startTime, LocalDateTime endTime) {
        
        String reportTitle = generateReportTitle("TREND", serviceId, null, startTime, endTime);
        
        return PredictionReportEnhanced.builder()
                .serviceId(serviceId)
                .deviceId(null)
                .reportType("TREND")
                .reportPeriod("WEEKLY")
                .reportTitle(reportTitle)
                .totalPredictions(predictionStats.getTotalPredictions())
                .anomalyCount(predictionStats.getAnomalyCount())
                .accuracyRate(predictionStats.getAccuracyRate())
                .healthScore(healthScore)
                .criticalAlerts(alertStats.getCriticalAlerts())
                .warningAlerts(alertStats.getWarningAlerts())
                .infoAlerts(alertStats.getInfoAlerts())
                .trendDirection("STABLE") // TODO: 实现趋势分析算法
                .trendConfidence(BigDecimal.valueOf(0.8))
                .summary(content.getSummary())
                .keyFindings(content.getKeyFindings())
                .recommendations(content.getRecommendations())
                .detailedAnalysis(content.getDetailedAnalysis())
                .periodStart(startTime)
                .periodEnd(endTime)
                .reportTime(LocalDateTime.now())
                .generatedBy("SYSTEM")
                .templateVersion("v1.0")
                .build();
    }
    
    /**
     * 生成趋势报告内容
     */
    private ReportContentGenerator.ReportContent generateTrendReportContent(PredictionStats predictionStats, 
                                                                          AlertStats alertStats, 
                                                                          BigDecimal healthScore,
                                                                          LocalDateTime startTime, 
                                                                          LocalDateTime endTime) {
        // 这里可以实现更复杂的趋势分析逻辑
        // 暂时使用健康度报告的生成逻辑
        return contentGenerator.generateHealthReportContent(predictionStats, alertStats, healthScore, startTime, endTime);
    }
    
    /**
     * 生成报告标题
     */
    private String generateReportTitle(String reportType, Long serviceId, Long deviceId, 
                                     LocalDateTime startTime, LocalDateTime endTime) {
        String typeDesc = getReportTypeDescription(reportType);
        String targetDesc = deviceId != null ? "设备" + deviceId : "服务" + serviceId;
        String periodDesc = startTime.toLocalDate().equals(endTime.toLocalDate()) ? "每日" : "周度";
        
        return String.format("%s%s%s报告", targetDesc, periodDesc, typeDesc);
    }
    
    /**
     * 生成综合摘要报告
     * @param serviceId 服务ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 生成的报告
     */
    @Transactional(rollbackFor = Exception.class)
    public PredictionReportEnhanced generateSummaryReport(Long serviceId, LocalDateTime startTime, LocalDateTime endTime) {
        try {
            log.info("开始生成综合摘要报告: serviceId={}, period={} to {}", serviceId, startTime, endTime);
            
            // 检查是否已存在相同周期的报告
            if (reportExists(serviceId, null, "SUMMARY", startTime, endTime)) {
                log.info("相同周期的综合摘要报告已存在，跳过生成");
                return null;
            }
            
            // 收集数据并分析
            reportDataCollector.init(serviceId, null, startTime, endTime);
            PredictionStats predictionStats = reportDataCollector.collectPredictionStats();
            AlertStats alertStats = reportDataCollector.collectAlertStats();
            
            // 计算健康度评分
            BigDecimal healthScore = healthScoreCalculator.calculateHealthScore(predictionStats, alertStats);
            
            // 生成摘要报告内容
            ReportContentGenerator.ReportContent content = generateSummaryReportContent(
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 创建报告实体
            PredictionReportEnhanced report = buildSummaryReport(serviceId, content, 
                    predictionStats, alertStats, healthScore, startTime, endTime);
            
            // 保存报告
            reportMapper.insert(report);
            
            log.info("综合摘要报告生成成功: reportId={}", report.getId());
            return report;
            
        } catch (Exception e) {
            log.error("生成综合摘要报告失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            throw new RuntimeException("生成综合摘要报告失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建综合摘要报告实体
     */
    private PredictionReportEnhanced buildSummaryReport(Long serviceId, ReportContentGenerator.ReportContent content,
                                                      PredictionStats predictionStats, AlertStats alertStats,
                                                      BigDecimal healthScore, LocalDateTime startTime, LocalDateTime endTime) {
        
        String reportTitle = generateReportTitle("SUMMARY", serviceId, null, startTime, endTime);
        
        return PredictionReportEnhanced.builder()
                .serviceId(serviceId)
                .deviceId(null)
                .reportType("SUMMARY")
                .reportPeriod("MONTHLY")
                .reportTitle(reportTitle)
                .totalPredictions(predictionStats.getTotalPredictions())
                .anomalyCount(predictionStats.getAnomalyCount())
                .accuracyRate(predictionStats.getAccuracyRate())
                .healthScore(healthScore)
                .criticalAlerts(alertStats.getCriticalAlerts())
                .warningAlerts(alertStats.getWarningAlerts())
                .infoAlerts(alertStats.getInfoAlerts())
                .summary(content.getSummary())
                .keyFindings(content.getKeyFindings())
                .recommendations(content.getRecommendations())
                .detailedAnalysis(content.getDetailedAnalysis())
                .periodStart(startTime)
                .periodEnd(endTime)
                .reportTime(LocalDateTime.now())
                .generatedBy("SYSTEM")
                .templateVersion("v1.0")
                .build();
    }
    
    /**
     * 生成综合摘要报告内容
     */
    private ReportContentGenerator.ReportContent generateSummaryReportContent(PredictionStats predictionStats, 
                                                                            AlertStats alertStats, 
                                                                            BigDecimal healthScore,
                                                                            LocalDateTime startTime, 
                                                                            LocalDateTime endTime) {
        // 使用健康度报告的生成逻辑，后续可以扩展为更复杂的摘要逻辑
        return contentGenerator.generateHealthReportContent(predictionStats, alertStats, healthScore, startTime, endTime);
    }
    
    /**
     * 获取报告类型描述
     */
    private String getReportTypeDescription(String reportType) {
        switch (reportType) {
            case "HEALTH": return "健康度";
            case "TREND": return "趋势分析";
            case "SUMMARY": return "综合摘要";
            case "ANOMALY": return "异常分析";
            default: return "预测";
        }
    }
    
    // ==================== 动态聚合方法 ====================
    
    /**
     * 动态生成设备报告（基于时间范围）
     * @param deviceId 设备ID
     * @param days 时间范围（天数）
     * @return 动态报告DTO
     */
    public DynamicReportDTO generateDynamicDeviceReport(Long deviceId, Integer days) {
        try {
            log.info("动态生成设备报告: deviceId={}, days={}", deviceId, days);
            
            Map<String, Object> stats = predictionResultMapper.getDeviceStatsByDays(deviceId, days);
            
            if (stats == null || stats.isEmpty()) {
                log.warn("设备 {} 在过去 {} 天内无预测数据", deviceId, days);
                return createEmptyReport(deviceId, null, days);
            }
            
            return buildDynamicReportFromStats(stats, days, "设备" + deviceId + "健康度报告");
            
        } catch (Exception e) {
            log.error("动态生成设备报告失败: deviceId={}, days={}, error={}", deviceId, days, e.getMessage(), e);
            return createEmptyReport(deviceId, null, days);
        }
    }
    
    /**
     * 动态生成分类报告列表（基于时间范围）
     * @param categoryId 分类ID
     * @param days 时间范围（天数）
     * @return 动态报告DTO列表
     */
    public List<DynamicReportDTO> generateDynamicCategoryReports(Long categoryId, Integer days) {
        try {
            log.info("动态生成分类报告列表: categoryId={}, days={}", categoryId, days);
            
            List<Map<String, Object>> deviceStatsList = predictionResultMapper.getDeviceListByCategoryAndDays(categoryId, days);
            List<DynamicReportDTO> reports = new ArrayList<>();
            
            for (Map<String, Object> stats : deviceStatsList) {
                Long deviceId = (Long) stats.get("device_id");
                String reportTitle = getCategoryName(categoryId) + deviceId + "健康度报告";
                DynamicReportDTO report = buildDynamicReportFromStats(stats, days, reportTitle);
                report.setCategoryId(categoryId);
                report.setCategoryName(getCategoryName(categoryId));
                reports.add(report);
            }
            
            log.info("分类 {} 生成了 {} 个动态报告", categoryId, reports.size());
            return reports;
            
        } catch (Exception e) {
            log.error("动态生成分类报告失败: categoryId={}, days={}, error={}", categoryId, days, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 获取分类健康度统计
     * @param categoryId 分类ID
     * @param days 时间范围（天数）
     * @return 健康度统计数据
     */
    public Map<String, Object> getCategoryHealthStats(Long categoryId, Integer days) {
        try {
            log.info("获取分类健康度统计: categoryId={}, days={}", categoryId, days);
            
            Map<String, Object> stats = predictionResultMapper.getHealthStatsByCategory(categoryId, days);
            
            if (stats == null || stats.isEmpty()) {
                // 返回空统计
                Map<String, Object> emptyStats = new java.util.HashMap<>();
                emptyStats.put("normalCount", 0);
                emptyStats.put("abnormalCount", 0);
                emptyStats.put("totalCount", 0);
                emptyStats.put("normalRate", BigDecimal.ZERO);
                emptyStats.put("healthStandard", "健康度 >= 70% 为正常，< 70% 为异常");
                return emptyStats;
            }
            
            // 处理统计结果
            Integer normalCount = (Integer) stats.get("normal_devices");
            Integer abnormalCount = (Integer) stats.get("abnormal_devices");
            Integer totalCount = (Integer) stats.get("total_devices");
            
            if (normalCount == null) normalCount = 0;
            if (abnormalCount == null) abnormalCount = 0;
            if (totalCount == null) totalCount = 0;
            
            BigDecimal normalRate = totalCount > 0 ? 
                new BigDecimal(normalCount).divide(new BigDecimal(totalCount), 4, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO;
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("normalCount", normalCount);
            result.put("abnormalCount", abnormalCount);
            result.put("totalCount", totalCount);
            result.put("normalRate", normalRate);
            result.put("healthStandard", "健康度 >= 70% 为正常，< 70% 为异常");
            
            return result;
            
        } catch (Exception e) {
            log.error("获取分类健康度统计失败: categoryId={}, days={}, error={}", categoryId, days, e.getMessage(), e);
            return Collections.emptyMap();
        }
    }
    
    /**
     * 从统计数据构建动态报告DTO
     */
    private DynamicReportDTO buildDynamicReportFromStats(Map<String, Object> stats, Integer days, String reportTitle) {
        Long deviceId = (Long) stats.get("device_id");
        Long categoryId = (Long) stats.get("category_id");
        Integer totalPredictions = (Integer) stats.get("total_predictions");
        Integer anomalyCount = (Integer) stats.get("anomaly_count");
        BigDecimal accuracyRate = (BigDecimal) stats.get("accuracy_rate");
        BigDecimal healthScore = (BigDecimal) stats.get("health_score");
        LocalDateTime periodStart = (LocalDateTime) stats.get("period_start");
        LocalDateTime periodEnd = (LocalDateTime) stats.get("period_end");
        
        // 处理null值
        if (totalPredictions == null) totalPredictions = 0;
        if (anomalyCount == null) anomalyCount = 0;
        if (accuracyRate == null) accuracyRate = BigDecimal.ZERO;
        if (healthScore == null) healthScore = BigDecimal.ZERO;
        
        // 计算健康度状态
        String healthStatus = healthScore.compareTo(new BigDecimal("0.7")) >= 0 ? "正常" : "异常";
        
        return DynamicReportDTO.builder()
                .deviceId(deviceId)
                .categoryId(categoryId)
                .categoryName(getCategoryName(categoryId))
                .reportTitle(reportTitle)
                .totalPredictions(totalPredictions)
                .anomalyCount(anomalyCount)
                .accuracyRate(accuracyRate)
                .healthScore(healthScore)
                .healthStatus(healthStatus)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .timeDays(days)
                .reportTime(LocalDateTime.now())
                .build();
    }
    
    /**
     * 创建空报告
     */
    private DynamicReportDTO createEmptyReport(Long deviceId, Long categoryId, Integer days) {
        return DynamicReportDTO.builder()
                .deviceId(deviceId)
                .categoryId(categoryId)
                .categoryName(getCategoryName(categoryId))
                .reportTitle("设备" + deviceId + "健康度报告")
                .totalPredictions(0)
                .anomalyCount(0)
                .accuracyRate(BigDecimal.ZERO)
                .healthScore(BigDecimal.ZERO)
                .healthStatus("异常")
                .periodStart(LocalDateTime.now().minusDays(days))
                .periodEnd(LocalDateTime.now())
                .timeDays(days)
                .reportTime(LocalDateTime.now())
                .build();
    }
}
