package com.zxb.aiproject;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.zxb.aiproject", "com.aiops"})
@MapperScan({"com.zxb.aiproject.mapper", "com.aiops.mapper"})
@EnableScheduling

public class AiProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiProjectApplication.class, args);
    }

}
