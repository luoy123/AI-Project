package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.PredictionModelService;
import com.zxb.aiproject.service.Impl.PredictionServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时训练服务
 * 根据服务配置的更新周期自动进行模型训练
 */
@Slf4j
@Service
public class ScheduledTrainingService {

    @Autowired
    private PredictionServiceImpl predictionService;

    /**
     * 定时检查并执行训练任务
     * 每小时执行一次检查
     */
    @Scheduled(cron = "0 0 * * * ?") // 每小时执行一次
    public void checkAndExecuteTraining() {
        log.info("🕐 开始检查定时训练任务...");
        
        try {
            // 获取所有启用的服务
            List<PredictionModelService> services = predictionService.list();
            
            for (PredictionModelService service : services) {
                if (service.getStatus() == 1) { // 只处理启用的服务
                    checkServiceTraining(service);
                }
            }
            
            log.info("✅ 定时训练任务检查完成");
        } catch (Exception e) {
            log.error("❌ 定时训练任务检查异常", e);
        }
    }

    /**
     * 检查单个服务是否需要训练
     */
    private void checkServiceTraining(PredictionModelService service) {
        try {
            // 获取更新周期（天）
            Integer updateCycle = service.getUpdateCycle();
            if (updateCycle == null || updateCycle <= 0) {
                log.debug("服务 {} 未配置更新周期，跳过", service.getServiceName());
                return;
            }

            // 获取最后一次训练时间
            LocalDateTime lastTrainTime = service.getLastTrainTime();
            LocalDateTime now = LocalDateTime.now();
            
            boolean shouldTrain = false;
            
            if (lastTrainTime == null) {
                // 从未训练过，立即训练
                shouldTrain = true;
                log.info("服务 {} 从未训练过，准备开始首次训练", service.getServiceName());
            } else {
                // 检查是否超过更新周期
                LocalDateTime nextTrainTime = lastTrainTime.plusDays(updateCycle);
                if (now.isAfter(nextTrainTime)) {
                    shouldTrain = true;
                    log.info("服务 {} 距离上次训练已超过 {} 天，准备开始训练", 
                            service.getServiceName(), updateCycle);
                }
            }
            
            if (shouldTrain) {
                executeServiceTraining(service);
            }
            
        } catch (Exception e) {
            log.error("检查服务 {} 训练状态异常", service.getServiceName(), e);
        }
    }

    /**
     * 执行服务训练
     */
    private void executeServiceTraining(PredictionModelService service) {
        try {
            log.info("🚀 开始自动训练服务: {}", service.getServiceName());
            
            String result = predictionService.startTraining(service.getId());
            
            // 更新服务的最后训练时间
            service.setLastTrainTime(LocalDateTime.now());
            predictionService.updateById(service);
            
            log.info("✅ 自动训练完成: {} - {}", service.getServiceName(), result);
            
        } catch (Exception e) {
            log.error("❌ 自动训练失败: {}", service.getServiceName(), e);
        }
    }

    /**
     * 手动触发所有服务的训练检查（用于测试）
     */
    public void manualCheckTraining() {
        log.info("🔧 手动触发训练检查...");
        checkAndExecuteTraining();
    }
}
