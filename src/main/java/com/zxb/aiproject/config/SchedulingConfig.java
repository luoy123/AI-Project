package com.zxb.aiproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * 定时任务配置
 * 启用Spring定时任务功能
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
    
    /**
     * 配置任务调度器
     */
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5); // 线程池大小
        scheduler.setThreadNamePrefix("prediction-task-"); // 线程名前缀
        scheduler.setWaitForTasksToCompleteOnShutdown(true); // 关闭时等待任务完成
        scheduler.setAwaitTerminationSeconds(60); // 等待终止的秒数
        scheduler.initialize();
        return scheduler;
    }
}
