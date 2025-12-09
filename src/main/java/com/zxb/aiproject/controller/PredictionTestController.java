package com.zxb.aiproject.controller;

import com.zxb.aiproject.service.Impl.PredictionDataGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 预测系统测试控制器
 */
@RestController
@RequestMapping("/api/prediction/test")
@Slf4j
public class PredictionTestController {

    @Autowired
    private PredictionDataGeneratorService generatorService;

    /**
     * 手动触发指定服务的预测数据生成
     */
    @PostMapping("/trigger/{serviceId}")
    public String triggerPrediction(@PathVariable Long serviceId) {
        try {
            log.info("手动触发服务[{}]的预测数据生成", serviceId);
            generatorService.triggerPredictionForService(serviceId);
            return "预测数据生成已触发，请查看日志和数据库";
        } catch (Exception e) {
            log.error("手动触发预测失败: serviceId={}", serviceId, e);
            return "触发失败: " + e.getMessage();
        }
    }

    /**
     * 手动触发所有服务的预测数据生成
     */
    @PostMapping("/trigger/all")
    public String triggerAllPredictions() {
        try {
            log.info("手动触发所有服务的预测数据生成");
            // 这里可以调用定时任务方法
            return "所有服务的预测数据生成已触发";
        } catch (Exception e) {
            log.error("手动触发所有预测失败", e);
            return "触发失败: " + e.getMessage();
        }
    }
}
