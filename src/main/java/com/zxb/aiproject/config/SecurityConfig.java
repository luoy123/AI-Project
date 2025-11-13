package com.zxb.aiproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security配置
 * 只保留密码加密器，认证由WebMvc拦截器处理
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 密码加密器
     * 用于用户密码的加密和验证
     */
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    /**
     * 安全过滤链
     * 禁用CSRF，允许所有请求通过（认证由拦截器处理）
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                // 禁用CSRF（前后端分离项目不需要）
                .csrf().disable()
                
                // 允许所有请求通过Security（认证由WebMvc拦截器处理）
                .authorizeRequests()
                .anyRequest().permitAll();

        return http.build();
    }

}
