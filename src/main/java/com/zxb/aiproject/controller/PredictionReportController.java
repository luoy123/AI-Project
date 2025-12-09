package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.dto.DynamicReportDTO;
import com.zxb.aiproject.entity.PredictionReportEnhanced;
import com.zxb.aiproject.service.PredictionReportService;
import com.zxb.aiproject.service.ReportScheduleService;
import com.zxb.aiproject.service.TrendAnalysisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 预测报告API控制器
 */
@Slf4j
@RestController
@RequestMapping("/prediction/enhanced-reports")
public class PredictionReportController {
    
    @Autowired
    private PredictionReportService reportService;
    
    @Autowired
    private ReportScheduleService scheduleService;
    
    @Autowired
    private TrendAnalysisService trendAnalysisService;
    
    @Autowired
    private com.zxb.aiproject.service.AssetCategoryService assetCategoryService;
    
    /**
     * 获取单个报告详情
     */
    @GetMapping("/{reportId}")
    public Result<PredictionReportEnhanced> getReportById(@PathVariable Long reportId) {
        try {
            log.info("获取报告详情: reportId={}", reportId);
            PredictionReportEnhanced report = reportService.getReportById(reportId);
            if (report != null) {
                return Result.success(report);
            } else {
                return Result.error("报告不存在");
            }
        } catch (Exception e) {
            log.error("获取报告详情失败: reportId={}, error={}", reportId, e.getMessage(), e);
            return Result.error("获取报告详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取服务的最新报告列表（支持按分类过滤）
     */
    @GetMapping("/latest")
    public Result<List<PredictionReportEnhanced>> getLatestReports(
            @RequestParam Long serviceId,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        try {
            List<PredictionReportEnhanced> reports;
            
            // 如果指定了分类ID，按分类过滤
            if (categoryId != null) {
                log.info("按分类ID查询报告: categoryId={}, serviceId={}, reportType={}, limit={}", 
                        categoryId, serviceId, reportType, limit);
                reports = reportService.getReportsByCategoryId(categoryId, reportType, limit);
            } else {
                reports = reportService.getLatestReports(serviceId, reportType, limit);
            }
            
            return Result.success(reports);
        } catch (Exception e) {
            log.error("获取最新报告失败: serviceId={}, categoryId={}, error={}", 
                    serviceId, categoryId, e.getMessage(), e);
            return Result.error("获取最新报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取设备的最新报告列表
     */
    @GetMapping("/device/latest")
    public Result<List<PredictionReportEnhanced>> getDeviceLatestReports(
            @RequestParam Long serviceId,
            @RequestParam Long deviceId,
            @RequestParam(required = false) String reportType,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        try {
            List<PredictionReportEnhanced> reports = reportService.getDeviceLatestReports(
                    serviceId, deviceId, reportType, limit);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("获取设备最新报告失败: serviceId={}, deviceId={}, error={}", 
                     serviceId, deviceId, e.getMessage(), e);
            return Result.error("获取设备最新报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 手动生成健康度报告
     */
    @PostMapping("/generate/health")
    public Result<PredictionReportEnhanced> generateHealthReport(
            @RequestParam Long serviceId,
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        try {
            // 默认时间范围：过去24小时
            if (endTime == null) {
                endTime = LocalDateTime.now();
            }
            if (startTime == null) {
                startTime = endTime.minusDays(1);
            }
            
            PredictionReportEnhanced report = reportService.generateHealthReport(
                    serviceId, deviceId, startTime, endTime);
            
            if (report != null) {
                return Result.success(report);
            } else {
                return Result.error("报告已存在或生成失败");
            }
        } catch (Exception e) {
            log.error("生成健康度报告失败: serviceId={}, deviceId={}, error={}", 
                     serviceId, deviceId, e.getMessage(), e);
            return Result.error("生成健康度报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 手动生成趋势分析报告
     */
    @PostMapping("/generate/trend")
    public Result<PredictionReportEnhanced> generateTrendReport(
            @RequestParam Long serviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        try {
            // 默认时间范围：过去7天
            if (endTime == null) {
                endTime = LocalDateTime.now();
            }
            if (startTime == null) {
                startTime = endTime.minusDays(7);
            }
            
            PredictionReportEnhanced report = reportService.generateTrendReport(serviceId, startTime, endTime);
            
            if (report != null) {
                return Result.success(report);
            } else {
                return Result.error("报告已存在或生成失败");
            }
        } catch (Exception e) {
            log.error("生成趋势分析报告失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("生成趋势分析报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 手动生成综合摘要报告
     */
    @PostMapping("/generate/summary")
    public Result<PredictionReportEnhanced> generateSummaryReport(
            @RequestParam Long serviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        try {
            // 默认时间范围：过去30天
            if (endTime == null) {
                endTime = LocalDateTime.now();
            }
            if (startTime == null) {
                startTime = endTime.minusDays(30);
            }
            
            PredictionReportEnhanced report = reportService.generateSummaryReport(serviceId, startTime, endTime);
            
            if (report != null) {
                return Result.success(report);
            } else {
                return Result.error("报告已存在或生成失败");
            }
        } catch (Exception e) {
            log.error("生成综合摘要报告失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("生成综合摘要报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 手动触发报告生成（通用接口）
     */
    @PostMapping("/generate/manual")
    public Result<String> generateReportManually(
            @RequestParam Long serviceId,
            @RequestParam String reportType,
            @RequestParam(defaultValue = "1") Integer days) {
        
        try {
            scheduleService.generateReportManually(serviceId, reportType, days);
            return Result.success("报告生成任务已提交");
        } catch (Exception e) {
            log.error("手动触发报告生成失败: serviceId={}, reportType={}, error={}", 
                     serviceId, reportType, e.getMessage(), e);
            return Result.error("手动触发报告生成失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取趋势分析结果
     */
    @GetMapping("/trend/analysis")
    public Result<TrendAnalysisService.ComprehensiveTrendResult> getTrendAnalysis(
            @RequestParam Long serviceId,
            @RequestParam(defaultValue = "7") Integer days) {
        
        try {
            TrendAnalysisService.ComprehensiveTrendResult result = 
                    trendAnalysisService.analyzeComprehensiveTrend(serviceId, days);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取趋势分析失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("获取趋势分析失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取健康度趋势
     */
    @GetMapping("/trend/health")
    public Result<TrendAnalysisService.TrendAnalysisResult> getHealthTrend(
            @RequestParam Long serviceId,
            @RequestParam(defaultValue = "7") Integer days) {
        
        try {
            TrendAnalysisService.TrendAnalysisResult result = 
                    trendAnalysisService.analyzeHealthTrend(serviceId, days);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取健康度趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("获取健康度趋势失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取准确率趋势
     */
    @GetMapping("/trend/accuracy")
    public Result<TrendAnalysisService.TrendAnalysisResult> getAccuracyTrend(
            @RequestParam Long serviceId,
            @RequestParam(defaultValue = "7") Integer days) {
        
        try {
            TrendAnalysisService.TrendAnalysisResult result = 
                    trendAnalysisService.analyzeAccuracyTrend(serviceId, days);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取准确率趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("获取准确率趋势失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取异常率趋势
     */
    @GetMapping("/trend/anomaly")
    public Result<TrendAnalysisService.TrendAnalysisResult> getAnomalyTrend(
            @RequestParam Long serviceId,
            @RequestParam(defaultValue = "7") Integer days) {
        
        try {
            TrendAnalysisService.TrendAnalysisResult result = 
                    trendAnalysisService.analyzeAnomalyTrend(serviceId, days);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取异常率趋势失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("获取异常率趋势失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取定时任务状态
     */
    @GetMapping("/schedule/status")
    public Result<String> getScheduleStatus() {
        try {
            String status = scheduleService.getScheduleStatus();
            return Result.success(status);
        } catch (Exception e) {
            log.error("获取定时任务状态失败: {}", e.getMessage(), e);
            return Result.error("获取定时任务状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取资产分类列表（用于预测报告页面）
     */
    @GetMapping("/categories/assets")
    public Result<List<com.zxb.aiproject.entity.AssetCategory>> getCategories() {
        System.out.println("=== DEBUG: PredictionReportController.getCategories() 被调用 ===");
        try {
            System.out.println("=== DEBUG: 调用 assetCategoryService.getTopLevelCategories() ===");
            List<com.zxb.aiproject.entity.AssetCategory> categories = assetCategoryService.getTopLevelCategories();
            System.out.println("=== DEBUG: Service返回分类数量: " + categories.size() + " ===");
            return Result.success(categories);
        } catch (Exception e) {
            System.out.println("=== DEBUG: Controller异常: " + e.getMessage() + " ===");
            log.error("获取资产分类失败: {}", e.getMessage(), e);
            return Result.error("获取资产分类失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取有预测报告数据的分类树（只显示有数据的分类）
     */
    @GetMapping("/categories/tree")
    public Result<List<Map<String, Object>>> getCategoryTree() {
        System.out.println("=== DEBUG: PredictionReportController.getCategoryTree() 被调用 ===");
        try {
            // 获取所有有报告数据的分类ID
            List<Long> categoryIdsWithData = reportService.getCategoryIdsWithReports();
            System.out.println("=== DEBUG: 有报告数据的分类ID: " + categoryIdsWithData + " ===");
            
            // 获取完整分类树
            List<Map<String, Object>> fullCategoryTree = assetCategoryService.getCategoryTree();
            
            // 过滤出有数据的分类
            List<Map<String, Object>> filteredTree = filterCategoryTreeWithData(fullCategoryTree, categoryIdsWithData);
            
            System.out.println("=== DEBUG: 过滤后分类树数量: " + filteredTree.size() + " ===");
            return Result.success(filteredTree);
        } catch (Exception e) {
            System.out.println("=== DEBUG: Controller异常: " + e.getMessage() + " ===");
            log.error("获取分类树失败: {}", e.getMessage(), e);
            return Result.error("获取分类树失败: " + e.getMessage());
        }
    }
    
    /**
     * 过滤分类树，只保留有数据的分类及其父分类
     */
    private List<Map<String, Object>> filterCategoryTreeWithData(
            List<Map<String, Object>> categoryTree, 
            List<Long> categoryIdsWithData) {
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Map<String, Object> parent : categoryTree) {
            Long parentId = ((Number) parent.get("id")).longValue();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");
            
            // 过滤子分类，只保留有数据的
            List<Map<String, Object>> filteredChildren = new ArrayList<>();
            if (children != null) {
                for (Map<String, Object> child : children) {
                    Long childId = ((Number) child.get("id")).longValue();
                    if (categoryIdsWithData.contains(childId)) {
                        filteredChildren.add(child);
                    }
                }
            }
            
            // 如果父分类有数据，或者有子分类有数据，则保留该父分类
            if (categoryIdsWithData.contains(parentId) || !filteredChildren.isEmpty()) {
                Map<String, Object> filteredParent = new HashMap<>(parent);
                filteredParent.put("children", filteredChildren);
                result.add(filteredParent);
            }
        }
        
        return result;
    }
    
    /**
     * 获取设备健康度统计（正常/异常）
     */
    @GetMapping("/health-stats")
    public Result<Map<String, Object>> getHealthStats(@RequestParam(value = "categoryId", required = false) Long categoryId) {
        System.out.println("=== DEBUG: PredictionReportController.getHealthStats() 被调用，categoryId: " + categoryId + " ===");
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // 获取最新报告 - 如果有分类ID，则按分类过滤
            List<PredictionReportEnhanced> reports;
            if (categoryId != null) {
                // 根据分类ID获取该分类下的设备报告
                reports = reportService.getReportsByCategoryId(categoryId, "HEALTH", 100);
                System.out.println("=== DEBUG: 按分类ID " + categoryId + " 过滤，获得报告数量: " + reports.size() + " ===");
            } else {
                // 获取所有报告
                reports = reportService.getLatestReports(30L, "HEALTH", 100);
                System.out.println("=== DEBUG: 获取所有报告，数量: " + reports.size() + " ===");
            }
            
            // 统计正常和异常设备数量
            // 正常标准：健康度 >= 70%
            // 异常标准：健康度 < 70%
            int normalCount = 0;
            int abnormalCount = 0;
            
            for (PredictionReportEnhanced report : reports) {
                if (report.getHealthScore() != null) {
                    double score = report.getHealthScore().doubleValue() * 100;
                    System.out.println("=== DEBUG: 设备ID " + report.getServiceId() + " 健康度: " + score + "% ===");
                    if (score >= 70.0) {
                        normalCount++;
                        System.out.println("=== DEBUG: 判定为正常设备 ===");
                    } else {
                        abnormalCount++;
                        System.out.println("=== DEBUG: 判定为异常设备 ===");
                    }
                }
            }
            
            stats.put("normalCount", normalCount);
            stats.put("abnormalCount", abnormalCount);
            stats.put("totalCount", normalCount + abnormalCount);
            stats.put("normalRate", normalCount + abnormalCount > 0 ? 
                Math.round((double) normalCount / (normalCount + abnormalCount) * 100) : 0);
            stats.put("categoryId", categoryId);
            stats.put("healthStandard", "健康度 >= 70% 为正常，< 70% 为异常");
            
            System.out.println("=== DEBUG: 分类ID " + categoryId + " 健康度统计 - 正常:" + normalCount + ", 异常:" + abnormalCount + " ===");
            return Result.success(stats);
        } catch (Exception e) {
            System.out.println("=== DEBUG: Controller异常: " + e.getMessage() + " ===");
            log.error("获取健康度统计失败: {}", e.getMessage(), e);
            return Result.error("获取健康度统计失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取报告统计信息
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getReportStatistics(@RequestParam Long serviceId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // 获取各类型报告数量
            List<PredictionReportEnhanced> healthReports = reportService.getLatestReports(serviceId, "HEALTH", 100);
            List<PredictionReportEnhanced> trendReports = reportService.getLatestReports(serviceId, "TREND", 100);
            List<PredictionReportEnhanced> summaryReports = reportService.getLatestReports(serviceId, "SUMMARY", 100);
            
            stats.put("healthReportCount", healthReports.size());
            stats.put("trendReportCount", trendReports.size());
            stats.put("summaryReportCount", summaryReports.size());
            stats.put("totalReportCount", healthReports.size() + trendReports.size() + summaryReports.size());
            
            // 最新报告时间
            if (!healthReports.isEmpty()) {
                stats.put("latestHealthReport", healthReports.get(0).getReportTime());
            }
            if (!trendReports.isEmpty()) {
                stats.put("latestTrendReport", trendReports.get(0).getReportTime());
            }
            if (!summaryReports.isEmpty()) {
                stats.put("latestSummaryReport", summaryReports.get(0).getReportTime());
            }
            
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取报告统计信息失败: serviceId={}, error={}", serviceId, e.getMessage(), e);
            return Result.error("获取报告统计信息失败: " + e.getMessage());
        }
    }
    
    // ==================== 动态聚合API ====================
    
    /**
     * 动态生成设备报告（基于时间范围）
     */
    @GetMapping("/dynamic/device")
    public Result<DynamicReportDTO> getDynamicDeviceReport(
            @RequestParam Long deviceId,
            @RequestParam(defaultValue = "3") Integer days) {
        
        try {
            DynamicReportDTO report = reportService.generateDynamicDeviceReport(deviceId, days);
            return Result.success(report);
        } catch (Exception e) {
            log.error("动态生成设备报告失败: deviceId={}, days={}, error={}", deviceId, days, e.getMessage(), e);
            return Result.error("动态生成设备报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 动态生成分类报告列表（基于时间范围）
     */
    @GetMapping("/dynamic/category")
    public Result<List<DynamicReportDTO>> getDynamicCategoryReports(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "3") Integer days) {
        
        try {
            List<DynamicReportDTO> reports = reportService.generateDynamicCategoryReports(categoryId, days);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("动态生成分类报告失败: categoryId={}, days={}, error={}", categoryId, days, e.getMessage(), e);
            return Result.error("动态生成分类报告失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取分类健康度统计（动态聚合）
     */
    @GetMapping("/dynamic/health-stats")
    public Result<Map<String, Object>> getDynamicHealthStats(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "3") Integer days) {

        try {
            Map<String, Object> stats;
            if (categoryId != null) {
                stats = reportService.getCategoryHealthStats(categoryId, days);
            } else {
                // 全部分类的统计
                stats = new HashMap<>();
                stats.put("normalCount", 0);
                stats.put("abnormalCount", 0);
                stats.put("totalCount", 0);
                stats.put("normalRate", BigDecimal.ZERO);
                stats.put("healthStandard", "健康度 >= 70% 为正常，< 70% 为异常");
            }

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取动态健康度统计失败: categoryId={}, days={}, error={}", categoryId, days, e.getMessage(), e);
            return Result.error("获取动态健康度统计失败: " + e.getMessage());
        }
    }


    @Autowired
    private com.zxb.aiproject.mapper.PredictionReportMapper predictionReportMapper;

    /**
     * 获取按分类的设备报告列表（用于预测报告主页面）
     */
    @GetMapping("/category-reports")
    public Result<List<com.zxb.aiproject.entity.PredictionReport>> getCategoryReports(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") Integer predictionTime) {

        try {
            log.info("获取分类报告列表: categoryId={}, predictionTime={}", categoryId, predictionTime);

            // 构建查询条件
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.zxb.aiproject.entity.PredictionReport> queryWrapper =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();

            if (categoryId != null) {
                queryWrapper.eq("category_id", categoryId);
            }
            queryWrapper.eq("prediction_time", predictionTime);
            queryWrapper.eq("deleted", 0);
            queryWrapper.orderByDesc("updated_at");
            queryWrapper.last("LIMIT 20");

            List<com.zxb.aiproject.entity.PredictionReport> reports = predictionReportMapper.selectList(queryWrapper);

            log.info("查询到 {} 条报告记录", reports.size());
            return Result.success(reports);

        } catch (Exception e) {
            log.error("获取分类报告列表失败: categoryId={}, predictionTime={}, error={}",
                     categoryId, predictionTime, e.getMessage(), e);
            return Result.error("获取分类报告列表失败: " + e.getMessage());
        }
    }
}
