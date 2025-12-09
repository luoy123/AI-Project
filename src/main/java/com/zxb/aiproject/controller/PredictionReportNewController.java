package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.PredictionReport;
import com.zxb.aiproject.entity.PredictionRisk;
import com.zxb.aiproject.mapper.PredictionReportMapper;
import com.zxb.aiproject.mapper.PredictionRiskMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 预测报告和风险数据查询Controller（新版）
 * 提供预测报告和预测风险的查询接口
 */
@Slf4j
@RestController
@RequestMapping("/api/prediction/v2")
public class PredictionReportNewController {

    @Autowired
    private PredictionReportMapper predictionReportMapper;

    @Autowired
    private PredictionRiskMapper predictionRiskMapper;

    /**
     * 测试端点 - 验证Controller是否被加载
     */
    @GetMapping("/test")
    public Result<String> test() {
        log.info("✅ PredictionReportNewController is working!");
        return Result.success("Controller is active");
    }

    /**
     * 查询预测报告列表
     * @param categoryId 分类ID（可选）
     * @param predictDays 预测天数（可选）
     * @return 预测报告列表
     */
    @GetMapping("/reports")
    public Result<List<PredictionReport>> getReports(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer predictDays) {
        
        log.info("查询预测报告 - 分类ID: {}, 预测天数: {}", categoryId, predictDays);
        
        try {
            LambdaQueryWrapper<PredictionReport> wrapper = Wrappers.lambdaQuery();
            
            // 按分类ID筛选
            if (categoryId != null) {
                wrapper.eq(PredictionReport::getCategoryId, categoryId);
            }
            
            // 按预测天数筛选
            if (predictDays != null) {
                wrapper.eq(PredictionReport::getPredictDays, predictDays);
            }
            
            // 按创建时间倒序
            wrapper.orderByDesc(PredictionReport::getCreatedAt);
            
            List<PredictionReport> reports = predictionReportMapper.selectList(wrapper);
            log.info("查询到 {} 条预测报告", reports.size());
            
            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询预测报告失败", e);
            return Result.error("查询预测报告失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID查询预测报告详情
     * @param id 报告ID
     * @return 预测报告详情
     */
    @GetMapping("/reports/{id}")
    public Result<PredictionReport> getReportById(@PathVariable Long id) {
        log.info("查询预测报告详情 - ID: {}", id);
        
        try {
            PredictionReport report = predictionReportMapper.selectById(id);
            if (report == null) {
                return Result.error("报告不存在");
            }
            return Result.success(report);
        } catch (Exception e) {
            log.error("查询预测报告详情失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 查询预测风险列表
     * @param riskLevel 风险等级（可选）
     * @param categoryId 分类ID（可选）
     * @param status 状态（可选）
     * @param targetName 监测对象名称（可选，模糊查询）
     * @return 预测风险列表
     */
    @GetMapping("/risks")
    public Result<List<PredictionRisk>> getRisks(
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String targetName) {
        
        log.info("查询预测风险 - 风险等级: {}, 分类ID: {}, 状态: {}, 监测对象: {}", 
                riskLevel, categoryId, status, targetName);
        
        try {
            LambdaQueryWrapper<PredictionRisk> wrapper = Wrappers.lambdaQuery();
            
            // 按风险等级筛选
            if (riskLevel != null && !riskLevel.isEmpty()) {
                wrapper.eq(PredictionRisk::getRiskLevel, riskLevel);
            }
            
            // 按分类ID筛选
            if (categoryId != null) {
                wrapper.eq(PredictionRisk::getCategoryId, categoryId);
            }
            
            // 按状态筛选
            if (status != null && !status.isEmpty()) {
                wrapper.eq(PredictionRisk::getStatus, status);
            }
            
            // 按监测对象名称模糊查询
            if (targetName != null && !targetName.isEmpty()) {
                wrapper.like(PredictionRisk::getTargetName, targetName);
            }
            
            // 排除已删除的记录
            wrapper.eq(PredictionRisk::getDeleted, 0);
            
            // 按风险评分倒序，再按创建时间倒序
            wrapper.orderByDesc(PredictionRisk::getRiskScore)
                   .orderByDesc(PredictionRisk::getCreatedAt);
            
            List<PredictionRisk> risks = predictionRiskMapper.selectList(wrapper);
            log.info("查询到 {} 条预测风险", risks.size());
            
            return Result.success(risks);
        } catch (Exception e) {
            log.error("查询预测风险失败", e);
            return Result.error("查询预测风险失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID查询预测风险详情
     * @param id 风险ID
     * @return 预测风险详情
     */
    @GetMapping("/risks/{id}")
    public Result<PredictionRisk> getRiskById(@PathVariable Long id) {
        log.info("查询预测风险详情 - ID: {}", id);
        
        try {
            PredictionRisk risk = predictionRiskMapper.selectById(id);
            if (risk == null || risk.getDeleted() == 1) {
                return Result.error("风险记录不存在");
            }
            return Result.success(risk);
        } catch (Exception e) {
            log.error("查询预测风险详情失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取预测报告统计数据（用于概览页面）
     * @return 统计数据
     */
    @GetMapping("/reports/statistics")
    public Result<?> getReportStatistics() {
        log.info("查询预测报告统计数据");
        
        try {
            // 查询最新的预测报告（每个分类的1天预测）
            LambdaQueryWrapper<PredictionReport> wrapper = Wrappers.lambdaQuery();
            wrapper.eq(PredictionReport::getPredictDays, 1)
                   .orderByDesc(PredictionReport::getCreatedAt);
            
            List<PredictionReport> reports = predictionReportMapper.selectList(wrapper);
            
            return Result.success(reports);
        } catch (Exception e) {
            log.error("查询预测报告统计数据失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取预测风险统计数据（用于概览页面）
     * @return 统计数据
     */
    @GetMapping("/risks/statistics")
    public Result<?> getRiskStatistics() {
        log.info("查询预测风险统计数据");
        
        try {
            // 查询所有活跃的风险
            LambdaQueryWrapper<PredictionRisk> wrapper = Wrappers.lambdaQuery();
            wrapper.eq(PredictionRisk::getStatus, "active")
                   .eq(PredictionRisk::getDeleted, 0)
                   .orderByDesc(PredictionRisk::getRiskScore);
            
            List<PredictionRisk> risks = predictionRiskMapper.selectList(wrapper);
            
            return Result.success(risks);
        } catch (Exception e) {
            log.error("查询预测风险统计数据失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }
}
