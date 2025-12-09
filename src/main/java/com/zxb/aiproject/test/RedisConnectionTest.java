package com.zxb.aiproject.test;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Redis连接测试
 */
@Component
@Slf4j
public class RedisConnectionTest implements CommandLineRunner {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            // 测试Redis连接
            redisTemplate.opsForValue().set("test:connection", "success");
            String value = redisTemplate.opsForValue().get("test:connection");
            
            if ("success".equals(value)) {
                log.info("✅ Redis连接成功！");
            } else {
                log.error("❌ Redis连接失败：读取值不匹配");
            }
            
            // 清理测试数据
            redisTemplate.delete("test:connection");
            
        } catch (Exception e) {
            log.error("❌ Redis连接测试失败：", e);
        }
    }
}
