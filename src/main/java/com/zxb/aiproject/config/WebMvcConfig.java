package com.zxb.aiproject.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC配置类
 * 用于配置静态资源映射和视图控制器
 * 
 * @author AI Assistant
 * @date 2025-11-24
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-path:./upload/}")
    private String uploadPath;

    /**
     * 配置静态资源处理器
     * 将静态资源映射到根路径，不受context-path影响
     *
     * 配置说明：
     * - addResourceHandler("/**"): 拦截所有请求
     * - addResourceLocations("classpath:/static/"): 从classpath:/static/目录加载资源
     * - setCachePeriod(0): 禁用缓存（开发环境）
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 上传文件访问路径映射
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:" + uploadPath)
                .setCachePeriod(0);  // 开发环境禁用缓存

        // 静态资源映射到根路径
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(0);  // 开发环境禁用缓存

        // 可选：为特定资源类型设置缓存
        // 生产环境可以启用缓存以提高性能
        /*
        registry.addResourceHandler("/css/**", "/js/**", "/images/**")
                .addResourceLocations("classpath:/static/css/",
                                     "classpath:/static/js/",
                                     "classpath:/static/images/")
                .setCachePeriod(3600);  // 1小时缓存
        */
    }
    
    /**
     * 配置视图控制器
     * 可选：为特定路径配置默认视图
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 可选：配置默认首页
        // registry.addViewController("/").setViewName("forward:/index.html");
    }
}
