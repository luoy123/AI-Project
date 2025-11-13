package com.zxb.aiproject.config;

//import com.zxb.aiproject.interceptor.JwtInterceptor;
import com.zxb.aiproject.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Value("${file.upload-path}")
    private String uploadPath;

    /**
     * 添加自定义格式转换器
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        // 添加LocalDateTime转换器
        registry.addConverter(new Converter<String, LocalDateTime>() {
            @Override
            public LocalDateTime convert(String source) {
                if (source == null || source.trim().isEmpty()) {
                    return null;
                }
                try {
                    // 支持多种时间格式
                    if (source.contains("T")) {
                        // ISO格式：2025-10-22T00:00:00
                        return LocalDateTime.parse(source, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
                    } else {
                        // 标准格式：2025-10-22 00:00:00
                        return LocalDateTime.parse(source, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    }
                } catch (Exception e) {
                    System.err.println("时间格式转换失败: " + source + ", 错误: " + e.getMessage());
                    return null;
                }
            }
        });
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 只拦截API接口路径
                .addPathPatterns("/api/**")
                // 排除不需要认证的API接口
                .excludePathPatterns(
                        // 登录相关接口
                        "/api/user/login",
                        "/api/user/captcha",
                        "/api/user/verify-admin-password"
                        // 用户管理和文件上传需要登录
                );
    }


    /**
     * 配置静态资源映射（用于访问上传的文件）
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射上传文件路径
        String location = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";
        
        // 添加静态资源映射 - 支持两种路径访问
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:" + location)
                .setCachePeriod(3600)  // 缓存1小时
                .resourceChain(true);
                
        // 同时支持 /api/upload/** 路径访问
        registry.addResourceHandler("/api/upload/**")
                .addResourceLocations("file:" + location)
                .setCachePeriod(3600)
                .resourceChain(true);
        
        System.out.println("=== 静态资源映射配置 ===");
        System.out.println("Handler: /upload/**");
        System.out.println("Location: file:" + location);
        System.out.println("Upload Path: " + uploadPath);
        
        // 验证目录是否存在
        java.io.File uploadDir = new java.io.File(uploadPath);
        System.out.println("Upload directory exists: " + uploadDir.exists());
        System.out.println("Upload directory path: " + uploadDir.getAbsolutePath());
    }

    /**
     * 配置跨域（如果需要）
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}