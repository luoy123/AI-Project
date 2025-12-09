package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.DevicePredictionReport;
import com.zxb.aiproject.mapper.DevicePredictionReportMapper;
import com.zxb.aiproject.service.PredictionModelServiceService;
import com.zxb.aiproject.service.PredictionService;
import com.zxb.aiproject.service.ScheduledTrainingService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 智能预测管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/prediction")
@Api(tags = "智能预测管理")
public class PredictionController {

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("predictionServiceFull")
    private PredictionService predictionService;

    @Autowired
    private PredictionModelServiceService predictionModelServiceService;

    @Autowired
    private ScheduledTrainingService scheduledTrainingService;

    /**
     * 获取概览页面统计数据
     */
    @GetMapping("/overview/stats")
    @ApiOperation("获取概览页面统计数据")
    public Result<Map<String, Object>> getOverviewStats() {
        try {
            Map<String, Object> stats = predictionService.getOverviewStats();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取概览统计数据失败", e);
            return Result.error("获取概览统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备分类故障占比
     */
    @GetMapping("/overview/device-fault-ratio")
    @ApiOperation("获取设备分类故障占比")
    public Result<Map<String, Object>> getDeviceFaultRatio(
            @RequestParam(defaultValue = "1") Integer predictionTime) {
        try {
            Map<String, Object> ratio = predictionService.getDeviceFaultRatio(predictionTime);
            return Result.success(ratio);
        } catch (Exception e) {
            log.error("获取设备故障占比失败", e);
            return Result.error("获取设备故障占比失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备分类故障率列表
     */
    @GetMapping("/overview/category-fault-rates")
    @ApiOperation("获取设备分类故障率列表")
    public Result<Map<String, Object>> getCategoryFaultRates(
            @RequestParam(defaultValue = "1") Integer predictionTime) {
        try {
            Map<String, Object> rates = predictionService.getCategoryFaultRates(predictionTime);
            return Result.success(rates);
        } catch (Exception e) {
            log.error("获取分类故障率失败", e);
            return Result.error("获取分类故障率失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测告警统计
     */
    @GetMapping("/overview/alerts")
    @ApiOperation("获取预测告警统计")
    public Result<Map<String, Object>> getAlertStats(
            @RequestParam(defaultValue = "1") Integer predictionTime) {
        try {
            Map<String, Object> alerts = predictionService.getAlertStats(predictionTime);
            return Result.success(alerts);
        } catch (Exception e) {
            log.error("获取告警统计失败", e);
            return Result.error("获取告警统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取服务器故障预测统计
     */
    @GetMapping("/overview/server-fault-stats")
    @ApiOperation("获取服务器故障预测统计")
    public Result<Map<String, Object>> getServerFaultStats(
            @RequestParam(defaultValue = "1") Integer predictionTime) {
        try {
            Map<String, Object> stats = predictionService.getServerFaultStats(predictionTime);
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取服务器故障统计失败", e);
            return Result.error("获取服务器故障统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取其他设备故障预测统计
     */
    @GetMapping("/overview/other-device-fault-stats")
    @ApiOperation("获取其他设备故障预测统计")
    public Result<Map<String, Object>> getOtherDeviceFaultStats(
            @RequestParam(defaultValue = "1") Integer predictionTime) {
        try {
            Map<String, Object> stats = predictionService.getOtherDeviceFaultStats(predictionTime);
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取其他设备故障统计失败", e);
            return Result.error("获取其他设备故障统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测报告分类列表
     */
    @GetMapping("/reports/categories")
    @ApiOperation("获取预测报告分类列表")
    public Result<java.util.List<Map<String, Object>>> getReportCategories() {
        try {
            java.util.List<Map<String, Object>> categories = predictionService.getReportCategories();
            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取报告分类失败", e);
            return Result.error("获取报告分类失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测报告列表
     */
    @GetMapping("/reports")
    @ApiOperation("获取预测报告列表")
    public Result<Map<String, Object>> getReports(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer predictionTime,
            @RequestParam(required = false) String status) {
        try {
            Map<String, Object> reports = predictionService.getReports(categoryId, brand, predictionTime, status);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("获取预测报告失败", e);
            return Result.error("获取预测报告失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测风险列表
     */
    @GetMapping("/risks")
    @ApiOperation("获取预测风险列表")
    public Result<Map<String, Object>> getRisks(
            @RequestParam(required = false) Integer predictionTime,
            @RequestParam(required = false) String riskZone,
            @RequestParam(required = false) String monitoringCategory,
            @RequestParam(required = false) String keyword) {
        try {
            Map<String, Object> risks = predictionService.getRisks(predictionTime, riskZone, monitoringCategory,
                    keyword);
            return Result.success(risks);
        } catch (Exception e) {
            log.error("获取预测风险失败", e);
            return Result.error("获取预测风险失败: " + e.getMessage());
        }
    }

    /**
     * 获取监测数据
     */
    @GetMapping("/monitoring/data")
    @ApiOperation("获取监测数据")
    public Result<Map<String, Object>> getMonitoringData(
            @RequestParam(required = false) String timeRangeStart,
            @RequestParam(required = false) String timeRangeEnd,
            @RequestParam(required = false) Integer timeRangeMinutes) {
        try {
            Map<String, Object> data = predictionService.getMonitoringData(timeRangeStart, timeRangeEnd,
                    timeRangeMinutes);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取监测数据失败", e);
            return Result.error("获取监测数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取算法模型服务列表
     */
    @GetMapping("/services")
    @ApiOperation("获取算法模型服务列表")
    public Result<Map<String, Object>> getAlgorithmServices(
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String algorithmType,
            @RequestParam(required = false) String keyword) {
        try {
            log.info("查询算法服务列表 - serviceName: {}, status: {}, algorithmType: {}, keyword: {}",
                    serviceName, status, algorithmType, keyword);
            Map<String, Object> services = predictionService.getAlgorithmServices(serviceName, status, algorithmType,
                    keyword);
            log.info("查询结果数量: {}", services.get("total"));
            return Result.success(services);
        } catch (Exception e) {
            log.error("获取算法服务失败", e);
            return Result.error("获取算法服务失败: " + e.getMessage());
        }
    }

    /**
     * 获取算法模型服务详情
     */
    @GetMapping("/services/{id}")
    @ApiOperation("获取算法模型服务详情")
    public Result<Map<String, Object>> getServiceDetail(@PathVariable Long id) {
        try {
            Map<String, Object> detail = predictionService.getServiceDetail(id);
            if (detail == null) {
                return Result.error("服务不存在");
            }
            return Result.success(detail);
        } catch (Exception e) {
            log.error("获取服务详情失败", e);
            return Result.error("获取服务详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建算法模型服务
     */
    @PostMapping("/services")
    @ApiOperation("创建算法模型服务")
    public Result<Long> createService(@RequestBody com.zxb.aiproject.dto.PredictionModelServiceDTO dto) {
        try {
            log.info("📥 接收到创建服务请求: serviceName={}, algorithmType={}, models={}",
                    dto.getServiceName(), dto.getAlgorithmType(),
                    dto.getModels() == null ? "null" : dto.getModels().size());
            if (dto.getModels() != null) {
                log.info("📋 模型组合详情: {}", dto.getModels());
            }
            Long serviceId = predictionService.createService(dto);
            return Result.success(serviceId);
        } catch (Exception e) {
            log.error("创建服务失败", e);
            return Result.error("创建服务失败: " + e.getMessage());
        }
    }

    /**
     * 更新算法模型服务
     */
    @PutMapping("/services/{id}")
    @ApiOperation("更新算法模型服务")
    public Result<Boolean> updateService(@PathVariable Long id,
            @RequestBody com.zxb.aiproject.dto.PredictionModelServiceDTO dto) {
        try {
            dto.setId(id);
            boolean result = predictionService.updateService(dto);
            return Result.success(result);
        } catch (Exception e) {
            log.error("更新服务失败", e);
            return Result.error("更新服务失败: " + e.getMessage());
        }
    }

    /**
     * 删除算法模型服务
     */
    @DeleteMapping("/services/{id}")
    @ApiOperation("删除算法模型服务")
    public Result<Boolean> deleteService(@PathVariable Long id) {
        try {
            boolean result = predictionService.deleteService(id);
            return Result.success(result);
        } catch (Exception e) {
            log.error("删除服务失败", e);
            return Result.error("删除服务失败: " + e.getMessage());
        }
    }

    /**
     * 启用/停用服务
     */
    @PutMapping("/services/{id}/status")
    @ApiOperation("启用/停用服务")
    public Result<Boolean> toggleServiceStatus(@PathVariable Long id,
            @RequestParam Integer status) {
        try {
            boolean result = predictionService.toggleServiceStatus(id, status);
            return Result.success(result);
        } catch (Exception e) {
            log.error("更新服务状态失败", e);
            return Result.error("更新服务状态失败: " + e.getMessage());
        }
    }

    /**
     * 处理预测告警
     */
    @PutMapping("/risks/{id}/handle")
    @ApiOperation("处理预测告警")
    public Result<Boolean> handleAlert(@PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String handleNotes) {
        try {
            boolean result = predictionService.handleAlert(id, status, handleNotes);
            return Result.success(result);
        } catch (Exception e) {
            log.error("处理告警失败", e);
            return Result.error("处理告警失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测风险历史
     */
    @GetMapping("/risks/{id}/history")
    @ApiOperation("获取预测风险历史")
    public Result<java.util.List<Map<String, Object>>> getRiskHistory(@PathVariable Long id) {
        try {
            java.util.List<Map<String, Object>> history = predictionService.getRiskHistory(id);
            return Result.success(history);
        } catch (Exception e) {
            log.error("获取风险历史失败", e);
            return Result.error("获取风险历史失败: " + e.getMessage());
        }
    }

    /**
     * 获取预测报告详情
     */
    @GetMapping("/reports/{id}")
    @ApiOperation("获取预测报告详情")
    public Result<Map<String, Object>> getReportDetail(@PathVariable Long id) {
        try {
            Map<String, Object> detail = predictionService.getReportDetail(id);
            if (detail == null) {
                return Result.error("报告不存在");
            }
            return Result.success(detail);
        } catch (Exception e) {
            log.error("获取报告详情失败", e);
            return Result.error("获取报告详情失败: " + e.getMessage());
        }
    }

    /**
     * 获取时间序列数据
     */
    @GetMapping("/analysis/timeseries")
    @ApiOperation("获取时间序列数据")
    public Result<java.util.List<Map<String, Object>>> getTimeSeriesData(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) String metricName,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            java.util.List<Map<String, Object>> data = predictionService.getTimeSeriesData(
                    deviceId, metricName, startTime, endTime);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取时间序列数据失败", e);
            return Result.error("获取时间序列数据失败: " + e.getMessage());
        }
    }

    /**
     * 发现新阈值
     */
    @PostMapping("/analysis/discover-threshold")
    @ApiOperation("发现新阈值")
    public Result<Map<String, Object>> discoverThreshold(
            @RequestParam Long deviceId,
            @RequestParam String metricName,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        try {
            Map<String, Object> result = predictionService.discoverThreshold(
                    deviceId, metricName, startTime, endTime);
            return Result.success(result);
        } catch (Exception e) {
            log.error("发现新阈值失败", e);
            return Result.error("发现新阈值失败: " + e.getMessage());
        }
    }

    // 注意：检测模板API已迁移到DetectionTemplateController

    @GetMapping("/services/{serviceId}/training-history")
    @ApiOperation("获取服务的训练历史")
    public Result<?> getTrainingHistory(@PathVariable Long serviceId) {
        try {
            log.info("获取服务训练历史, serviceId: {}", serviceId);
            List<?> history = predictionService.getTrainingHistory(serviceId);
            return Result.success(history);
        } catch (Exception e) {
            log.error("获取训练历史失败", e);
            return Result.error("获取训练历史失败: " + e.getMessage());
        }
    }

    @PostMapping("/services/{serviceId}/train")
    @ApiOperation("开始训练模型")
    public Result<String> startTraining(@PathVariable Long serviceId) {
        try {
            log.info("开始训练模型, serviceId: {}", serviceId);
            String result = predictionService.startTraining(serviceId);
            return Result.success(result);
        } catch (Exception e) {
            log.error("开始训练失败", e);
            return Result.error("开始训练失败: " + e.getMessage());
        }
    }

    @PostMapping("/models/{modelId}/train")
    @ApiOperation("开始训练单个模型设备组合")
    public Result<String> startSingleModelTraining(@PathVariable Long modelId) {
        try {
            log.info("开始训练单个模型, modelId: {}", modelId);
            String result = predictionService.startSingleModelTraining(modelId);
            return Result.success(result);
        } catch (Exception e) {
            log.error("开始单个模型训练失败", e);
            return Result.error("开始训练失败: " + e.getMessage());
        }
    }

    @PostMapping("/training/check-scheduled")
    @ApiOperation("手动触发定时训练检查")
    public Result<String> checkScheduledTraining() {
        try {
            log.info("手动触发定时训练检查");
            scheduledTrainingService.manualCheckTraining();
            return Result.success("定时训练检查已触发，请查看日志了解执行情况");
        } catch (Exception e) {
            log.error("触发定时训练检查失败", e);
            return Result.error("触发失败: " + e.getMessage());
        }
    }

    @GetMapping("/services/{serviceId}/models")
    @ApiOperation("获取服务的模型组合列表")
    public Result<List<Map<String, Object>>> getServiceModels(@PathVariable Long serviceId) {
        try {
            log.info("获取服务模型组合列表, serviceId: {}", serviceId);
            List<Map<String, Object>> models = predictionModelServiceService.getServiceModels(serviceId);
            return Result.success(models);
        } catch (Exception e) {
            log.error("获取模型组合列表失败", e);
            return Result.error("获取模型组合列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/models/{modelId}/details")
    @ApiOperation("获取模型详情和训练历史")
    public Result<Map<String, Object>> getModelDetails(@PathVariable Long modelId) {
        try {
            log.info("获取模型详情, modelId: {}", modelId);
            Map<String, Object> details = predictionModelServiceService.getModelDetails(modelId);
            return Result.success(details);
        } catch (Exception e) {
            log.error("获取模型详情失败", e);
            return Result.error("获取模型详情失败: " + e.getMessage());
        }
    }

    @GetMapping("/services/{serviceId}/devices")
    @ApiOperation("获取服务的设备列表")
    public Result<List<Map<String, Object>>> getServiceDevices(@PathVariable Long serviceId) {
        try {
            log.info("获取服务设备列表, serviceId: {}", serviceId);
            List<Map<String, Object>> devices = predictionModelServiceService.getServiceDevices(serviceId);
            return Result.success(devices);
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
            return Result.error("获取设备列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/services/{serviceId}/metrics")
    @ApiOperation("获取服务的监测指标列表")
    public Result<List<Map<String, Object>>> getServiceMetrics(@PathVariable Long serviceId) {
        try {
            log.info("获取服务监测指标列表, serviceId: {}", serviceId);
            List<Map<String, Object>> metrics = predictionModelServiceService.getServiceMetrics(serviceId);
            return Result.success(metrics);
        } catch (Exception e) {
            log.error("获取监测指标列表失败", e);
            return Result.error("获取监测指标列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取服务的模型设备组合数据（用于编辑回填）
     */
    @GetMapping("/prediction-model-device/service/{serviceId}")
    @ApiOperation("获取服务的模型设备组合数据")
    public Result<List<Map<String, Object>>> getServiceModelDevices(@PathVariable Long serviceId) {
        try {
            log.info("获取服务模型设备数据, serviceId: {}", serviceId);
            List<Map<String, Object>> modelDevices = predictionModelServiceService.getServiceModelDevices(serviceId);
            return Result.success(modelDevices);
        } catch (Exception e) {
            log.error("获取服务模型设备数据失败", e);
            return Result.error("获取服务模型设备数据失败: " + e.getMessage());
        }
    }

    // ========== 新增：预测报告和风险API ==========

    @Autowired
    private com.zxb.aiproject.mapper.PredictionReportMapper predictionReportMapper;

    @Autowired
    private com.zxb.aiproject.mapper.PredictionRiskMapper predictionRiskMapper;

    @Autowired
    private com.zxb.aiproject.mapper.DevicePredictionReportMapper devicePredictionReportMapper;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/v2/test")
    @ApiOperation("测试新API")
    public Result<String> testV2() {
        log.info("✅ 新API正常工作!");
        return Result.success("API is active");
    }

    @GetMapping("/v2/reports/statistics")
    @ApiOperation("获取预测报告统计")
    public Result<?> getReportStatistics(@RequestParam(required = false) Integer predictDays) {
        try {
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.PredictionReport> wrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();

            // 如果指定了预测天数，则按该条件筛选；否则返回所有记录
            if (predictDays != null) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionReport::getPredictDays, predictDays);
            }

            // 排除视频管理(4)和云平台(23)分类，这些分类只用于特定页面
            wrapper.notIn(com.zxb.aiproject.entity.PredictionReport::getCategoryId, 4L, 23L);

            wrapper.orderByDesc(com.zxb.aiproject.entity.PredictionReport::getCreatedAt);

            java.util.List<com.zxb.aiproject.entity.PredictionReport> reports = predictionReportMapper
                    .selectList(wrapper);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询预测报告统计失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/v2/risks/statistics")
    @ApiOperation("获取预测风险统计")
    public Result<?> getRiskStatistics() {
        try {
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.PredictionRisk> wrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();
            // 移除status过滤，统计所有风险
            wrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getDeleted, 0)
                    .orderByDesc(com.zxb.aiproject.entity.PredictionRisk::getRiskScore);

            java.util.List<com.zxb.aiproject.entity.PredictionRisk> risks = predictionRiskMapper.selectList(wrapper);
            return Result.success(risks);
        } catch (Exception e) {
            log.error("查询预测风险统计失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/v2/reports")
    @ApiOperation("查询预测报告列表")
    public Result<?> getReports(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer predictDays) {
        try {
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.PredictionReport> wrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();

            if (categoryId != null) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionReport::getCategoryId, categoryId);
            }
            if (predictDays != null) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionReport::getPredictDays, predictDays);
            }

            wrapper.orderByDesc(com.zxb.aiproject.entity.PredictionReport::getCreatedAt);

            java.util.List<com.zxb.aiproject.entity.PredictionReport> reports = predictionReportMapper
                    .selectList(wrapper);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询预测报告失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/v2/risks")
    @ApiOperation("查询预测风险列表")
    public Result<?> getRisks(
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String targetName) {
        try {
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.PredictionRisk> wrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();

            if (riskLevel != null && !riskLevel.isEmpty()) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getRiskLevel, riskLevel);
            }
            if (categoryId != null) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getCategoryId, categoryId);
            }
            if (status != null && !status.isEmpty()) {
                wrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getStatus, status);
            }
            if (targetName != null && !targetName.isEmpty()) {
                wrapper.like(com.zxb.aiproject.entity.PredictionRisk::getTargetName, targetName);
            }

            wrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getDeleted, 0);
            wrapper.orderByDesc(com.zxb.aiproject.entity.PredictionRisk::getRiskScore)
                    .orderByDesc(com.zxb.aiproject.entity.PredictionRisk::getCreatedAt);

            java.util.List<com.zxb.aiproject.entity.PredictionRisk> risks = predictionRiskMapper.selectList(wrapper);
            return Result.success(risks);
        } catch (Exception e) {
            log.error("查询预测风险失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/v2/device-reports")
    @ApiOperation("查询分类下的设备预测报告列表")
    public Result<?> getDeviceReports(
            @RequestParam Long categoryId,
            @RequestParam(required = false, defaultValue = "1") Integer predictDays) {
        try {
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.DevicePredictionReport> wrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();

            wrapper.eq(com.zxb.aiproject.entity.DevicePredictionReport::getCategoryId, categoryId)
                    .eq(com.zxb.aiproject.entity.DevicePredictionReport::getPredictDays, predictDays)
                    .orderByDesc(com.zxb.aiproject.entity.DevicePredictionReport::getHealthScore);

            java.util.List<com.zxb.aiproject.entity.DevicePredictionReport> reports = devicePredictionReportMapper
                    .selectList(wrapper);
            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询设备预测报告失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/v2/device-reports/{id}")
    @ApiOperation("查询设备预测报告详情")
    public Result<?> getDeviceReportDetail(@PathVariable Long id) {
        try {
            com.zxb.aiproject.entity.DevicePredictionReport report = devicePredictionReportMapper.selectById(id);
            if (report == null) {
                return Result.error("报告不存在");
            }
            return Result.success(report);
        } catch (Exception e) {
            log.error("查询设备预测报告详情失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    @PutMapping("/v2/risks/{id}/status")
    @ApiOperation("更新风险状态")
    public Result<?> updateRiskStatus(@PathVariable Long id, @RequestBody Map<String, String> params) {
        try {
            String status = params.get("status");
            String note = params.get("note");

            if (status == null || status.trim().isEmpty()) {
                return Result.error("状态不能为空");
            }

            // 更新数据库
            String sql = "UPDATE prediction_risk SET status = ?, updated_at = NOW() WHERE id = ?";
            jdbcTemplate.update(sql, status, id);

            log.info("更新风险状态成功: id={}, status={}, note={}", id, status, note);
            return Result.success("更新成功");
        } catch (Exception e) {
            log.error("更新风险状态失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 获取设备预测报告列表
     * 
     * @param categoryId  分类ID（可选）
     * @param deviceId    设备ID（可选）
     * @param predictDays 预测天数（可选，默认7天）
     * @return 设备预测报告列表
     */
    @GetMapping("/device-reports")
    @ApiOperation("获取设备预测报告列表")
    public Result<List<DevicePredictionReport>> getDevicePredictionReports(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long deviceId,
            @RequestParam(defaultValue = "7") Integer predictDays) {

        log.info("查询设备预测报告 - 分类ID: {}, 设备ID: {}, 预测天数: {}", categoryId, deviceId, predictDays);

        try {
            LambdaQueryWrapper<DevicePredictionReport> wrapper = Wrappers.lambdaQuery();

            // 按分类ID筛选
            if (categoryId != null) {
                wrapper.eq(DevicePredictionReport::getCategoryId, categoryId);
            }

            // 按设备ID筛选
            if (deviceId != null) {
                wrapper.eq(DevicePredictionReport::getDeviceId, deviceId);
            }

            // 按预测天数筛选
            if (predictDays != null) {
                wrapper.eq(DevicePredictionReport::getPredictDays, predictDays);
            }

            // 按创建时间倒序
            wrapper.orderByDesc(DevicePredictionReport::getCreatedAt);

            List<DevicePredictionReport> reports = devicePredictionReportMapper.selectList(wrapper);
            log.info("查询到 {} 条设备预测报告", reports.size());

            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询设备预测报告失败", e);
            return Result.error("查询设备预测报告失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID获取设备预测报告详情
     */
    @GetMapping("/device-reports/{id}")
    @ApiOperation("获取设备预测报告详情")
    public Result<DevicePredictionReport> getDevicePredictionReportById(@PathVariable Long id) {
        log.info("查询设备预测报告详情 - ID: {}", id);

        try {
            DevicePredictionReport report = devicePredictionReportMapper.selectById(id);
            if (report == null) {
                return Result.error("报告不存在");
            }
            return Result.success(report);
        } catch (Exception e) {
            log.error("查询设备预测报告详情失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    // ==================== 智能分析页面API ====================

    /**
     * 获取智能分析统计数据
     */
    @GetMapping("/data/statistics")
    @ApiOperation("获取智能分析统计数据")
    public Result<?> getAnalysisStatistics(
            @RequestParam(required = false) Integer predictDays,
            @RequestParam(required = false) String timeRange) {

        log.info("查询智能分析统计 - 预测天数: {}, 时间范围: {}", predictDays, timeRange);

        try {
            // 从prediction_report表统计
            java.util.List<com.zxb.aiproject.entity.PredictionReport> reports = predictionReportMapper.selectList(null);

            // 从prediction_risk表统计风险
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.zxb.aiproject.entity.PredictionRisk> riskWrapper = com.baomidou.mybatisplus.core.toolkit.Wrappers
                    .lambdaQuery();
            riskWrapper.eq(com.zxb.aiproject.entity.PredictionRisk::getDeleted, 0);
            java.util.List<com.zxb.aiproject.entity.PredictionRisk> risks = predictionRiskMapper
                    .selectList(riskWrapper);

            // 计算统计数据
            int totalReports = reports.size();
            int totalRisks = risks.size();
            int normalCount = 0, warningCount = 0, criticalCount = 0;
            int highRiskCount = 0, mediumRiskCount = 0, lowRiskCount = 0;
            java.util.Map<String, Integer> categoryStats = new java.util.HashMap<>();

            for (com.zxb.aiproject.entity.PredictionReport report : reports) {
                normalCount += report.getNormalDevices() != null ? report.getNormalDevices() : 0;
                warningCount += report.getWarningDevices() != null ? report.getWarningDevices() : 0;
                criticalCount += report.getRiskDevices() != null ? report.getRiskDevices() : 0;

                String category = report.getCategoryName();
                if (category != null) {
                    int total = report.getTotalDevices() != null ? report.getTotalDevices() : 0;
                    categoryStats.merge(category, total, Integer::sum);
                }
            }

            for (com.zxb.aiproject.entity.PredictionRisk risk : risks) {
                String level = risk.getRiskLevel();
                if ("high".equalsIgnoreCase(level) || "critical".equalsIgnoreCase(level)) {
                    highRiskCount++;
                } else if ("medium".equalsIgnoreCase(level)) {
                    mediumRiskCount++;
                } else {
                    lowRiskCount++;
                }
            }

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("totalReports", totalReports);
            result.put("totalRisks", totalRisks);
            result.put("normalCount", normalCount);
            result.put("warningCount", warningCount);
            result.put("criticalCount", criticalCount);
            result.put("highRiskCount", highRiskCount);
            result.put("mediumRiskCount", mediumRiskCount);
            result.put("lowRiskCount", lowRiskCount);
            result.put("categoryStats", categoryStats);

            return Result.success(result);
        } catch (Exception e) {
            log.error("查询智能分析统计失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取智能分析趋势数据
     */
    @GetMapping("/data/trend")
    @ApiOperation("获取智能分析趋势数据")
    public Result<?> getAnalysisTrend(
            @RequestParam(defaultValue = "7") Integer days) {

        log.info("查询智能分析趋势 - 天数: {}", days);

        try {
            java.util.List<String> dates = new java.util.ArrayList<>();
            java.util.List<Integer> normalData = new java.util.ArrayList<>();
            java.util.List<Integer> warningData = new java.util.ArrayList<>();
            java.util.List<Integer> criticalData = new java.util.ArrayList<>();

            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("M/d");

            // 从prediction_report表获取历史数据
            java.util.List<com.zxb.aiproject.entity.PredictionReport> allReports = predictionReportMapper
                    .selectList(null);

            for (int i = days - 1; i >= 0; i--) {
                java.time.LocalDate date = today.minusDays(i);
                dates.add(date.format(formatter));

                // 统计当天的设备状态（基于报告的创建日期）
                int normal = 0, warning = 0, critical = 0;
                for (com.zxb.aiproject.entity.PredictionReport report : allReports) {
                    if (report.getCreatedAt() != null) {
                        java.time.LocalDate reportDate = report.getCreatedAt().toLocalDate();
                        if (reportDate.equals(date)) {
                            normal += report.getNormalDevices() != null ? report.getNormalDevices() : 0;
                            warning += report.getWarningDevices() != null ? report.getWarningDevices() : 0;
                            critical += report.getRiskDevices() != null ? report.getRiskDevices() : 0;
                        }
                    }
                }

                // 如果当天没有数据，使用累计数据的平均值模拟
                if (normal == 0 && warning == 0 && critical == 0) {
                    int totalNormal = 0, totalWarning = 0, totalCritical = 0, count = 0;
                    for (com.zxb.aiproject.entity.PredictionReport report : allReports) {
                        totalNormal += report.getNormalDevices() != null ? report.getNormalDevices() : 0;
                        totalWarning += report.getWarningDevices() != null ? report.getWarningDevices() : 0;
                        totalCritical += report.getRiskDevices() != null ? report.getRiskDevices() : 0;
                        count++;
                    }
                    if (count > 0) {
                        normal = totalNormal / count + (int) (Math.random() * 3 - 1);
                        warning = totalWarning / count + (int) (Math.random() * 2 - 1);
                        critical = totalCritical / count;
                    }
                }

                normalData.add(Math.max(0, normal));
                warningData.add(Math.max(0, warning));
                criticalData.add(Math.max(0, critical));
            }

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("dates", dates);
            result.put("normalData", normalData);
            result.put("warningData", warningData);
            result.put("criticalData", criticalData);

            return Result.success(result);
        } catch (Exception e) {
            log.error("查询智能分析趋势失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取监测数据详细记录
     */
    @GetMapping("/data/records")
    @ApiOperation("获取监测数据详细记录")
    public Result<?> getMonitoringRecords(
            @RequestParam(required = false) Integer predictDays,
            @RequestParam(required = false) String timeRange,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        log.info("查询监测数据记录 - 预测天数: {}, 时间范围: {}, 页码: {}, 每页: {}", predictDays, timeRange, page, pageSize);

        try {
            // 查询设备预测报告
            java.util.List<DevicePredictionReport> reports = devicePredictionReportMapper.selectList(
                    com.baomidou.mybatisplus.core.toolkit.Wrappers.<DevicePredictionReport>lambdaQuery()
                            .orderByDesc(DevicePredictionReport::getCreatedAt));

            // 定义阈值配置
            java.util.Map<String, double[]> thresholds = new java.util.HashMap<>();
            thresholds.put("CPU使用率", new double[] { 70.0, 90.0 });
            thresholds.put("内存使用率", new double[] { 80.0, 95.0 });
            thresholds.put("磁盘使用率", new double[] { 80.0, 95.0 });
            thresholds.put("网络流量", new double[] { 500.0, 800.0 }); // Mbps

            // 转换为监测记录列表（每个设备拆分为多个指标记录）
            java.util.List<java.util.Map<String, Object>> records = new java.util.ArrayList<>();
            java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (DevicePredictionReport report : reports) {
                String deviceName = report.getDeviceName();
                String categoryName = report.getCategoryName();
                String baseTime = report.getCreatedAt() != null ? report.getCreatedAt().format(dtf) : "";

                // CPU使用率记录
                if (report.getCpuUsage() != null) {
                    java.util.Map<String, Object> record = new java.util.HashMap<>();
                    double value = report.getCpuUsage().doubleValue();
                    double predicted = value + (Math.random() * 6 - 3); // 模拟预测值
                    double[] th = thresholds.get("CPU使用率");

                    record.put("id", "cpu_" + report.getId());
                    record.put("time", baseTime);
                    record.put("deviceName", deviceName);
                    record.put("category", categoryName);
                    record.put("metric", "CPU使用率");
                    record.put("currentValue", Math.round(value));
                    record.put("predictedValue", Math.round(predicted));
                    record.put("unit", "%");
                    record.put("warningThreshold", (int) th[0]);
                    record.put("criticalThreshold", (int) th[1]);
                    record.put("riskLevel", calculateRiskLevel(value, th[0], th[1]));
                    record.put("status", calculateStatus(value, th[0], th[1]));
                    records.add(record);
                }

                // 内存使用率记录
                if (report.getMemoryUsage() != null) {
                    java.util.Map<String, Object> record = new java.util.HashMap<>();
                    double value = report.getMemoryUsage().doubleValue();
                    double predicted = value + (Math.random() * 6 - 3);
                    double[] th = thresholds.get("内存使用率");

                    record.put("id", "mem_" + report.getId());
                    record.put("time", baseTime);
                    record.put("deviceName", deviceName);
                    record.put("category", categoryName);
                    record.put("metric", "内存使用率");
                    record.put("currentValue", Math.round(value));
                    record.put("predictedValue", Math.round(predicted));
                    record.put("unit", "%");
                    record.put("warningThreshold", (int) th[0]);
                    record.put("criticalThreshold", (int) th[1]);
                    record.put("riskLevel", calculateRiskLevel(value, th[0], th[1]));
                    record.put("status", calculateStatus(value, th[0], th[1]));
                    records.add(record);
                }

                // 磁盘使用率记录
                if (report.getDiskUsage() != null) {
                    java.util.Map<String, Object> record = new java.util.HashMap<>();
                    double value = report.getDiskUsage().doubleValue();
                    double predicted = value + (Math.random() * 6 - 3);
                    double[] th = thresholds.get("磁盘使用率");

                    record.put("id", "disk_" + report.getId());
                    record.put("time", baseTime);
                    record.put("deviceName", deviceName);
                    record.put("category", categoryName);
                    record.put("metric", "磁盘使用率");
                    record.put("currentValue", Math.round(value));
                    record.put("predictedValue", Math.round(predicted));
                    record.put("unit", "%");
                    record.put("warningThreshold", (int) th[0]);
                    record.put("criticalThreshold", (int) th[1]);
                    record.put("riskLevel", calculateRiskLevel(value, th[0], th[1]));
                    record.put("status", calculateStatus(value, th[0], th[1]));
                    records.add(record);
                }

                // 网络流量记录
                if (report.getNetworkTraffic() != null) {
                    java.util.Map<String, Object> record = new java.util.HashMap<>();
                    double value = report.getNetworkTraffic().doubleValue();
                    double predicted = value + (Math.random() * 20 - 10);
                    double[] th = thresholds.get("网络流量");

                    record.put("id", "net_" + report.getId());
                    record.put("time", baseTime);
                    record.put("deviceName", deviceName);
                    record.put("category", categoryName);
                    record.put("metric", "网络流量");
                    record.put("currentValue", Math.round(value));
                    record.put("predictedValue", Math.round(predicted));
                    record.put("unit", "Mbps");
                    record.put("warningThreshold", (int) th[0]);
                    record.put("criticalThreshold", (int) th[1]);
                    record.put("riskLevel", calculateRiskLevel(value, th[0], th[1]));
                    record.put("status", calculateStatus(value, th[0], th[1]));
                    records.add(record);
                }
            }

            // 分页处理
            int total = records.size();
            int start = (page - 1) * pageSize;
            int end = Math.min(start + pageSize, total);
            java.util.List<java.util.Map<String, Object>> pagedRecords = start < total ? records.subList(start, end)
                    : new java.util.ArrayList<>();

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("records", pagedRecords);
            result.put("total", total);
            result.put("page", page);
            result.put("pageSize", pageSize);
            result.put("totalPages", (int) Math.ceil((double) total / pageSize));

            return Result.success(result);
        } catch (Exception e) {
            log.error("查询监测数据记录失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 根据值和阈值计算风险等级
     */
    private String calculateRiskLevel(double value, double warning, double critical) {
        if (value >= critical) {
            return "严重";
        } else if (value >= warning) {
            return "高风险";
        } else if (value >= warning * 0.8) {
            return "中风险";
        } else {
            return "低风险";
        }
    }

    /**
     * 根据值和阈值计算状态
     */
    private String calculateStatus(double value, double warning, double critical) {
        if (value >= critical) {
            return "告警";
        } else if (value >= warning) {
            return "预警";
        } else {
            return "正常";
        }
    }
}
