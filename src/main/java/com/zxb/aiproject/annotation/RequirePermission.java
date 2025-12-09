package com.zxb.aiproject.annotation;

import java.lang.annotation.*;

/**
 * 权限验证注解
 * 用于标记需要权限验证的方法
 * 
 * 使用示例：
 * @RequirePermission("device:view")
 * public List<Device> getDeviceList() { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequirePermission {
    
    /**
     * 需要的权限代码
     * 支持多个权限，满足其中一个即可
     */
    String[] value();
    
    /**
     * 是否需要满足所有权限（AND逻辑）
     * true: 需要满足所有权限
     * false: 满足任意一个权限即可（默认）
     */
    boolean requireAll() default false;
}
