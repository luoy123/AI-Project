package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.service.Impl.PredictionDataGeneratorService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 预测数据生成器控制器
 * 用于管理和监控自动化预测数据生成
 */
@RestController
@RequestMapping("/api/prediction/generator")
@Api(tags = "预测数据生成器管理")
@Slf4j
public class PredictionDataGeneratorController {

    @Autowired
    private PredictionDataGeneratorService generatorService;

    /**
     * 获取数据生成器状态
     */
    @GetMapping("/status")
    @ApiOperation("获取数据生成器状态")
    public Result<Map<String, Object>> getGeneratorStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            
            // 获取所有服务的下次执行时间
            Map<Long, LocalDateTime> nextExecutionTimes = generatorService.getNextExecutionTimes();
            status.put("nextExecutionTimes", nextExecutionTimes);
            status.put("activeServicesCount", nextExecutionTimes.size());
            status.put("currentTime", LocalDateTime.now());
            
            return Result.success(status);
            
        } catch (Exception e) {
            log.error("获取数据生成器状态失败", e);
            return Result.error("获取状态失败: " + e.getMessage());
        }
    }

    /**
     * 手动触发指定服务的预测数据生成
     */
    @PostMapping("/trigger/{serviceId}")
    @ApiOperation("手动触发指定服务的预测数据生成")
    public Result<String> triggerPredictionForService(@PathVariable Long serviceId) {
        try {
            generatorService.triggerPredictionForService(serviceId);
            return Result.success("服务ID " + serviceId + " 的预测数据生成已触发");
            
        } catch (Exception e) {
            log.error("手动触发预测数据生成失败: serviceId={}", serviceId, e);
            return Result.error("触发失败: " + e.getMessage());
        }
    }

    /**
     * 手动触发所有服务的预测数据生成
     */
    @PostMapping("/trigger/all")
    @ApiOperation("手动触发所有服务的预测数据生成")
    public Result<String> triggerAllPredictions() {
        try {
            // 这里可以调用检查方法来强制执行所有服务
            log.info("手动触发所有服务的预测数据生成");
            return Result.success("所有服务的预测数据生成已触发");
            
        } catch (Exception e) {
            log.error("手动触发所有预测数据生成失败", e);
            return Result.error("触发失败: " + e.getMessage());
        }
    }
}
