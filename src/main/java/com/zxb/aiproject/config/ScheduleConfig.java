package com.zxb.aiproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 定时任务配置
 */
@Configuration
@EnableScheduling
public class ScheduleConfig {
    // Spring Boot会自动扫描@Scheduled注解的方法
}
