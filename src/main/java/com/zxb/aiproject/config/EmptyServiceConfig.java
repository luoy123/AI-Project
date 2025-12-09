package com.zxb.aiproject.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.*;

/**
 * 空服务配置类 - 为缺失的服务接口提供空实现
 * 这样可以让项目快速启动，后续可以逐步实现具体的业务逻辑
 */
@Configuration
@Slf4j
public class EmptyServiceConfig {

    /**
     * 通用的空实现处理器
     */
    private static class EmptyServiceHandler implements InvocationHandler {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String methodName = method.getName();
            Class<?> returnType = method.getReturnType();
            
            log.debug("调用空实现方法: {}", methodName);
            
            // 根据返回类型返回默认值
            if (returnType == void.class || returnType == Void.class) {
                return null;
            } else if (returnType == boolean.class || returnType == Boolean.class) {
                return true;
            } else if (returnType == int.class || returnType == Integer.class) {
                return 0;
            } else if (returnType == long.class || returnType == Long.class) {
                return 0L;
            } else if (returnType == String.class) {
                return "";
            } else if (List.class.isAssignableFrom(returnType)) {
                return new ArrayList<>();
            } else if (Map.class.isAssignableFrom(returnType)) {
                return new HashMap<>();
            } else if (Set.class.isAssignableFrom(returnType)) {
                return new HashSet<>();
            } else {
                return null;
            }
        }
    }

    /**
     * 创建服务接口的空实现
     */
    private <T> T createEmptyService(Class<T> serviceClass) {
        return (T) Proxy.newProxyInstance(
            serviceClass.getClassLoader(),
            new Class[]{serviceClass},
            new EmptyServiceHandler()
        );
    }

    // OpsTicketService 已有实现类 OpsTicketServiceImpl，不需要空实现

    @Bean
    public com.zxb.aiproject.service.PredictionService predictionService() {
        return createEmptyService(com.zxb.aiproject.service.PredictionService.class);
    }

    @Bean
    public com.zxb.aiproject.service.LogService logService() {
        return createEmptyService(com.zxb.aiproject.service.LogService.class);
    }

    @Bean
    public com.zxb.aiproject.service.SyslogMatchService syslogMatchService() {
        return createEmptyService(com.zxb.aiproject.service.SyslogMatchService.class);
    }

    // TicketImportService / TicketTemplateService 已有具体实现类，不再提供空实现
    // TicketPriorityService 已有实现类 TicketPriorityServiceImpl，不需要空实现

    // TicketSourceService 已有实现类 TicketSourceServiceImpl，不需要空实现

    // TicketTypeService 已有实现类 TicketTypeServiceImpl，不需要空实现

    @Bean
    public com.zxb.aiproject.service.UserGroupRelationService userGroupRelationService() {
        return createEmptyService(com.zxb.aiproject.service.UserGroupRelationService.class);
    }

    @Bean
    public com.zxb.aiproject.service.UserGroupService userGroupService() {
        return createEmptyService(com.zxb.aiproject.service.UserGroupService.class);
    }

    @Bean
    public com.zxb.aiproject.service.ViewDeviceService viewDeviceService() {
        return createEmptyService(com.zxb.aiproject.service.ViewDeviceService.class);
    }
}
