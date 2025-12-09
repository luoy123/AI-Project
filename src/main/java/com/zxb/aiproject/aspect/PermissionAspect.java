package com.zxb.aiproject.aspect;

import com.zxb.aiproject.annotation.RequirePermission;
import com.zxb.aiproject.service.SysPermissionService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * 权限验证切面
 * 拦截带有@RequirePermission注解的方法，进行权限验证
 */
@Aspect
@Component
public class PermissionAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionAspect.class);
    
    @Autowired
    private SysPermissionService permissionService;
    
    /**
     * 环绕通知，拦截@RequirePermission注解的方法
     */
    @Around("@annotation(com.zxb.aiproject.annotation.RequirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取方法签名
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 获取注解
        RequirePermission annotation = method.getAnnotation(RequirePermission.class);
        if (annotation == null) {
            return joinPoint.proceed();
        }
        
        // 获取需要的权限
        String[] requiredPermissions = annotation.value();
        boolean requireAll = annotation.requireAll();
        
        // 获取当前用户ID（从Session中获取）
        Long userId = getCurrentUserId();
        if (userId == null) {
            logger.warn("用户未登录，拒绝访问：{}", method.getName());
            return createErrorResponse(401, "用户未登录");
        }
        
        // 获取用户权限
        Set<String> userPermissions = permissionService.getUserPermissionCodes(userId);
        
        // 验证权限
        boolean hasPermission = checkPermissions(userPermissions, requiredPermissions, requireAll);
        
        if (!hasPermission) {
            logger.warn("用户{}权限不足，需要权限：{}", userId, String.join(",", requiredPermissions));
            return createErrorResponse(403, "权限不足");
        }
        
        // 权限验证通过，执行方法
        logger.debug("用户{}权限验证通过，执行方法：{}", userId, method.getName());
        return joinPoint.proceed();
    }
    
    /**
     * 获取当前登录用户ID
     */
    private Long getCurrentUserId() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                HttpSession session = request.getSession(false);
                if (session != null) {
                    Object userIdObj = session.getAttribute("userId");
                    if (userIdObj != null) {
                        return Long.valueOf(userIdObj.toString());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("获取当前用户ID失败", e);
        }
        return null;
    }
    
    /**
     * 检查权限
     */
    private boolean checkPermissions(Set<String> userPermissions, String[] requiredPermissions, boolean requireAll) {
        if (requiredPermissions == null || requiredPermissions.length == 0) {
            return true;
        }
        
        if (requireAll) {
            // AND逻辑：需要满足所有权限
            for (String permission : requiredPermissions) {
                if (!userPermissions.contains(permission)) {
                    return false;
                }
            }
            return true;
        } else {
            // OR逻辑：满足任意一个权限即可
            for (String permission : requiredPermissions) {
                if (userPermissions.contains(permission)) {
                    return true;
                }
            }
            return false;
        }
    }
    
    /**
     * 创建错误响应
     */
    private Map<String, Object> createErrorResponse(int code, String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("message", message);
        return result;
    }
}
