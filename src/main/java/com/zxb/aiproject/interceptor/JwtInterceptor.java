package com.zxb.aiproject.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.utils.JwtTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * JWT认证拦截器
 * 用于拦截所有需要认证的请求，验证JWT token的有效性
 */
@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 添加调试日志
        log.info("JWT拦截器被调用: {} {}", request.getMethod(), request.getRequestURI());
        
        // 1. 从请求中获取token
        String token = getTokenFromRequest(request);
        log.info("从请求中获取到的token: {}", token != null ? "存在" : "不存在");

        // 2. 验证token是否存在
        if (!StringUtils.hasText(token)) {
            log.warn("请求未携带token: {}", request.getRequestURI());
            sendUnauthorizedResponse(response, "未登录，请先登录");
            return false;
        }

        try {
            // 3. 验证token有效性
            if (!jwtTokenUtil.verify(token)) {
                log.warn("token验证失败: {}", token);
                sendUnauthorizedResponse(response, "token无效");
                return false;
            }

            // 4. 检查token是否过期
            if (jwtTokenUtil.isTokenExpired(token)) {
                log.warn("token已过期: {}", token);
                sendUnauthorizedResponse(response, "登录已过期，请重新登录");
                return false;
            }

            // 5. 获取用户名并存储到request中，方便后续Controller使用
            String username = jwtTokenUtil.getUsername(token);
            request.setAttribute("username", username);
            log.debug("用户 {} 通过认证，访问: {}", username, request.getRequestURI());

            return true;

        } catch (Exception e) {
            log.error("token认证异常: {}", e.getMessage(), e);
            sendUnauthorizedResponse(response, "认证失败");
            return false;
        }
    }

    /**
     * 从请求中获取token
     * 支持两种方式：
     * 1. Authorization请求头: Bearer token
     * 2. 请求参数: ?token=xxx
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        // 方式1: 从 Authorization 头获取
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 方式2: 从请求参数中获取
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }

        return null;
    }

    /**
     * 返回未授权响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        Result<Object> result = Result.error(401, message);
        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(result);

        response.getWriter().write(json);
    }
}
