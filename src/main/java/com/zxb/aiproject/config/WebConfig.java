package com.zxb.aiproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 对所有API接口生效
                .allowedOriginPatterns("*") // 允许所有来源的域名，使用 aterns 而不是 Origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的请求方法
                .allowCredentials(true) // 允许发送凭证（如 cookies）
                .maxAge(3600); // 预检请求的有效期，单位为秒
    }
}
