package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.BusinessComponent;
import com.zxb.aiproject.mapper.BusinessComponentMapper;
import com.zxb.aiproject.service.BusinessComponentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 业务组件服务实现类
 */
@Service
@Slf4j
public class BusinessComponentServiceImpl extends ServiceImpl<BusinessComponentMapper, BusinessComponent> implements BusinessComponentService {

    @Override
    public List<BusinessComponent> getComponentsByBusinessId(Long businessId) {
        log.info("根据业务ID获取组件列表: {}", businessId);
        
        try {
            if (businessId == null) {
                log.warn("业务ID为空，返回空列表");
                return new ArrayList<>();
            }
            
            // 首先检查数据库中是否有任何组件数据
            long totalCount = this.count();
            if (totalCount == 0) {
                log.info("数据库中没有任何组件数据，创建默认测试数据");
                createAndSaveDefaultComponents();
            }
            
            // 使用MyBatis-Plus查询指定业务的组件
            QueryWrapper<BusinessComponent> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("business_id", businessId);
            queryWrapper.eq("deleted", 0); // 只查询未删除的组件
            queryWrapper.orderByDesc("create_time"); // 按创建时间倒序
            
            List<BusinessComponent> components = this.list(queryWrapper);
            log.info("查询到业务ID {} 的组件数量: {}", businessId, components.size());
            
            // 为组件补充监控数据
            for (BusinessComponent component : components) {
                addMonitoringData(component);
            }
            
            return components;
            
        } catch (Exception e) {
            log.error("根据业务ID获取组件失败: {}", businessId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<BusinessComponent> getAllComponents() {
        log.info("获取所有组件");
        
        try {
            // 先尝试从数据库获取
            List<BusinessComponent> components = this.list();
            log.info("从数据库查询到 {} 个组件", components.size());
            
            // 如果数据库为空，创建并保存默认测试数据
            if (components == null || components.isEmpty()) {
                log.info("数据库中没有组件数据，创建并保存默认测试数据");
                components = createAndSaveDefaultComponents();
                log.info("创建并保存了 {} 个默认测试组件", components.size());
            } else {
                // 为现有组件补充监控数据（模拟实时监控）
                for (BusinessComponent component : components) {
                    addMonitoringData(component);
                }
                log.info("为 {} 个组件补充了监控数据", components.size());
            }
            
            log.info("最终返回组件数据: {} 个", components.size());
            return components;
            
        } catch (Exception e) {
            log.error("获取组件数据失败，返回默认测试数据", e);
            List<BusinessComponent> defaultComponents = createDefaultComponents();
            log.info("异常情况下创建了 {} 个默认测试组件", defaultComponents.size());
            return defaultComponents;
        }
    }
    
    /**
     * 创建并保存默认测试组件数据到数据库
     */
    private List<BusinessComponent> createAndSaveDefaultComponents() {
        // 先清理可能存在的错误数据
        try {
            long existingCount = this.count();
            if (existingCount > 0) {
                log.info("发现 {} 个现有组件，先清理数据库", existingCount);
                // 删除所有现有组件数据
                this.remove(null);
                log.info("已清理现有组件数据");
            }
        } catch (Exception e) {
            log.warn("清理现有数据时出错，继续创建新数据", e);
        }
        
        List<BusinessComponent> components = createDefaultComponents();
        
        try {
            // 批量保存到数据库
            log.info("开始批量保存 {} 个组件到数据库", components.size());
            this.saveBatch(components);
            log.info("成功保存 {} 个组件到数据库", components.size());
            
            // 重新从数据库查询以获取生成的ID，并补充监控数据
            List<BusinessComponent> savedComponents = this.list();
            log.info("从数据库重新查询到 {} 个组件", savedComponents.size());
            
            // 为每个组件补充监控数据（模拟实时监控数据）
            for (BusinessComponent component : savedComponents) {
                addMonitoringData(component);
            }
            
            return savedComponents;
            
        } catch (Exception e) {
            log.error("保存组件到数据库失败，返回内存中的数据", e);
            return components;
        }
    }
    
    /**
     * 为组件添加监控数据（模拟实时监控）
     */
    private void addMonitoringData(BusinessComponent component) {
        // 根据组件类型设置不同的监控数据
        switch (component.getType()) {
            case "api":
                component.setCpuUsage(10.0 + Math.random() * 20.0); // 10-30%
                component.setMemoryUsage(200L + (long)(Math.random() * 300)); // 200-500MB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 50) + 1, (int)(Math.random() * 24)));
                break;
            case "microservice":
                component.setCpuUsage(15.0 + Math.random() * 25.0); // 15-40%
                component.setMemoryUsage(300L + (long)(Math.random() * 500)); // 300-800MB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 40) + 5, (int)(Math.random() * 24)));
                break;
            case "database":
                component.setCpuUsage(20.0 + Math.random() * 30.0); // 20-50%
                component.setMemoryUsage(1000L + (long)(Math.random() * 2000)); // 1-3GB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 60) + 10, (int)(Math.random() * 24)));
                break;
            case "cache":
                component.setCpuUsage(5.0 + Math.random() * 15.0); // 5-20%
                component.setMemoryUsage(500L + (long)(Math.random() * 1000)); // 500MB-1.5GB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 45) + 15, (int)(Math.random() * 24)));
                break;
            case "web":
                component.setCpuUsage(8.0 + Math.random() * 12.0); // 8-20%
                component.setMemoryUsage(100L + (long)(Math.random() * 200)); // 100-300MB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 30) + 5, (int)(Math.random() * 24)));
                break;
            default:
                component.setCpuUsage(12.0 + Math.random() * 18.0); // 12-30%
                component.setMemoryUsage(256L + (long)(Math.random() * 512)); // 256-768MB
                component.setUptime(String.format("%d天 %d小时", 
                    (int)(Math.random() * 35) + 7, (int)(Math.random() * 24)));
                break;
        }
        
        // 保留两位小数
        component.setCpuUsage(Math.round(component.getCpuUsage() * 100.0) / 100.0);
    }
    
    /**
     * 创建默认测试组件数据
     */
    private List<BusinessComponent> createDefaultComponents() {
        List<BusinessComponent> components = new ArrayList<>();
        
        // 业务2: 用户管理 (businessId = 2) - 添加4个组件
        // 用户认证API
        BusinessComponent userService = new BusinessComponent();
        userService.setBusinessId(2L);
        userService.setName("用户认证API");
        userService.setType("api");
        userService.setStatus("running");
        userService.setPort(8080);
        userService.setUrl("http://user-auth:8080");
        userService.setEnvironment("prod");
        userService.setVersion("2.1.0");
        userService.setDescription("用户登录注册、权限验证");
        userService.setHealthCheckUrl("http://user-auth:8080/health");
        userService.setMonitoringEnabled(true);
        userService.setCpuUsage(12.5);
        userService.setMemoryUsage(256L);
        userService.setUptime("30天 12小时");
        components.add(userService);
        
        // 用户信息管理
        BusinessComponent userInfo = new BusinessComponent();
        userInfo.setBusinessId(2L);
        userInfo.setName("用户信息管理");
        userInfo.setType("microservice");
        userInfo.setStatus("running");
        userInfo.setPort(8081);
        userInfo.setUrl("http://user-info:8081");
        userInfo.setEnvironment("prod");
        userInfo.setVersion("1.8.2");
        userInfo.setDescription("用户资料管理、偏好设置");
        userInfo.setHealthCheckUrl("http://user-info:8081/health");
        userInfo.setMonitoringEnabled(true);
        userInfo.setCpuUsage(8.3);
        userInfo.setMemoryUsage(192L);
        userInfo.setUptime("25天 6小时");
        components.add(userInfo);
        
        // 用户权限服务
        BusinessComponent userPermission = new BusinessComponent();
        userPermission.setBusinessId(2L);
        userPermission.setName("用户权限服务");
        userPermission.setType("microservice");
        userPermission.setStatus("running");
        userPermission.setPort(8082);
        userPermission.setUrl("http://user-permission:8082");
        userPermission.setEnvironment("prod");
        userPermission.setVersion("1.5.3");
        userPermission.setDescription("角色权限管理、访问控制");
        userPermission.setHealthCheckUrl("http://user-permission:8082/health");
        userPermission.setMonitoringEnabled(true);
        userPermission.setCpuUsage(6.8);
        userPermission.setMemoryUsage(128L);
        userPermission.setUptime("28天 15小时");
        components.add(userPermission);
        
        // 用户数据库
        BusinessComponent userDatabase = new BusinessComponent();
        userDatabase.setBusinessId(2L);
        userDatabase.setName("用户数据库");
        userDatabase.setType("database");
        userDatabase.setStatus("running");
        userDatabase.setPort(3306);
        userDatabase.setUrl("mysql://user-db:3306/userdb");
        userDatabase.setEnvironment("prod");
        userDatabase.setVersion("8.0.32");
        userDatabase.setDescription("用户数据存储");
        userDatabase.setHealthCheckUrl("mysql://user-db:3306/health");
        userDatabase.setMonitoringEnabled(true);
        userDatabase.setCpuUsage(15.2);
        userDatabase.setMemoryUsage(1024L);
        userDatabase.setUptime("45天 8小时");
        components.add(userDatabase);
        
        // 业务3: 订单管理 (businessId = 3) - 添加4个组件
        // 订单管理API
        BusinessComponent orderAPI = new BusinessComponent();
        orderAPI.setBusinessId(3L);
        orderAPI.setName("订单管理API");
        orderAPI.setType("api");
        orderAPI.setStatus("running");
        orderAPI.setPort(8090);
        orderAPI.setUrl("http://order-api:8090");
        orderAPI.setEnvironment("prod");
        orderAPI.setVersion("3.2.1");
        orderAPI.setDescription("订单创建、查询、状态管理");
        orderAPI.setHealthCheckUrl("http://order-api:8090/health");
        orderAPI.setMonitoringEnabled(true);
        orderAPI.setCpuUsage(18.7);
        orderAPI.setMemoryUsage(512L);
        orderAPI.setUptime("28天 14小时");
        components.add(orderAPI);
        
        // 订单状态机
        BusinessComponent orderStateMachine = new BusinessComponent();
        orderStateMachine.setBusinessId(3L);
        orderStateMachine.setName("订单状态机");
        orderStateMachine.setType("microservice");
        orderStateMachine.setStatus("running");
        orderStateMachine.setPort(8091);
        orderStateMachine.setUrl("http://order-fsm:8091");
        orderStateMachine.setEnvironment("prod");
        orderStateMachine.setVersion("2.5.0");
        orderStateMachine.setDescription("订单生命周期状态管理");
        orderStateMachine.setHealthCheckUrl("http://order-fsm:8091/health");
        orderStateMachine.setMonitoringEnabled(true);
        orderStateMachine.setCpuUsage(15.2);
        orderStateMachine.setMemoryUsage(384L);
        orderStateMachine.setUptime("22天 8小时");
        components.add(orderStateMachine);
        
        // 订单数据库
        BusinessComponent orderDatabase = new BusinessComponent();
        orderDatabase.setBusinessId(3L);
        orderDatabase.setName("订单数据库");
        orderDatabase.setType("database");
        orderDatabase.setStatus("running");
        orderDatabase.setPort(3307);
        orderDatabase.setUrl("mysql://order-db:3307/orderdb");
        orderDatabase.setEnvironment("prod");
        orderDatabase.setVersion("8.0.32");
        orderDatabase.setDescription("订单数据存储");
        orderDatabase.setHealthCheckUrl("mysql://order-db:3307/health");
        orderDatabase.setMonitoringEnabled(true);
        orderDatabase.setCpuUsage(22.3);
        orderDatabase.setMemoryUsage(2048L);
        orderDatabase.setUptime("35天 10小时");
        components.add(orderDatabase);
        
        // 订单缓存
        BusinessComponent orderCache = new BusinessComponent();
        orderCache.setBusinessId(3L);
        orderCache.setName("订单缓存");
        orderCache.setType("cache");
        orderCache.setStatus("running");
        orderCache.setPort(6379);
        orderCache.setUrl("redis://order-redis:6379");
        orderCache.setEnvironment("prod");
        orderCache.setVersion("7.0.5");
        orderCache.setDescription("订单数据缓存");
        orderCache.setHealthCheckUrl("redis://order-redis:6379/ping");
        orderCache.setMonitoringEnabled(true);
        orderCache.setCpuUsage(8.5);
        orderCache.setMemoryUsage(512L);
        orderCache.setUptime("30天 5小时");
        components.add(orderCache);
        
        // 业务4: 支付管理 (businessId = 4) - 添加4个组件
        // 支付网关
        BusinessComponent paymentGateway = new BusinessComponent();
        paymentGateway.setBusinessId(4L);
        paymentGateway.setName("支付网关");
        paymentGateway.setType("api");
        paymentGateway.setStatus("running");
        paymentGateway.setPort(8100);
        paymentGateway.setUrl("http://payment-gateway:8100");
        paymentGateway.setEnvironment("prod");
        paymentGateway.setVersion("4.1.3");
        paymentGateway.setDescription("统一支付接口，支持多种支付方式");
        paymentGateway.setHealthCheckUrl("http://payment-gateway:8100/health");
        paymentGateway.setMonitoringEnabled(true);
        paymentGateway.setCpuUsage(22.1);
        paymentGateway.setMemoryUsage(768L);
        paymentGateway.setUptime("35天 18小时");
        components.add(paymentGateway);
        
        // 退款服务
        BusinessComponent refundService = new BusinessComponent();
        refundService.setBusinessId(4L);
        refundService.setName("退款服务");
        refundService.setType("microservice");
        refundService.setStatus("running");
        refundService.setPort(8101);
        refundService.setUrl("http://refund-service:8101");
        refundService.setEnvironment("prod");
        refundService.setVersion("1.9.2");
        refundService.setDescription("处理退款申请和退款流程");
        refundService.setHealthCheckUrl("http://refund-service:8101/health");
        refundService.setMonitoringEnabled(true);
        refundService.setCpuUsage(9.4);
        refundService.setMemoryUsage(256L);
        refundService.setUptime("20天 12小时");
        components.add(refundService);
        
        // 账单管理
        BusinessComponent billService = new BusinessComponent();
        billService.setBusinessId(4L);
        billService.setName("账单管理");
        billService.setType("microservice");
        billService.setStatus("running");
        billService.setPort(8102);
        billService.setUrl("http://bill-service:8102");
        billService.setEnvironment("prod");
        billService.setVersion("2.3.1");
        billService.setDescription("账单生成、查询、对账");
        billService.setHealthCheckUrl("http://bill-service:8102/health");
        billService.setMonitoringEnabled(true);
        billService.setCpuUsage(11.7);
        billService.setMemoryUsage(384L);
        billService.setUptime("25天 16小时");
        components.add(billService);
        
        // 支付数据库
        BusinessComponent paymentDatabase = new BusinessComponent();
        paymentDatabase.setBusinessId(4L);
        paymentDatabase.setName("支付数据库");
        paymentDatabase.setType("database");
        paymentDatabase.setStatus("running");
        paymentDatabase.setPort(3308);
        paymentDatabase.setUrl("mysql://payment-db:3308/paymentdb");
        paymentDatabase.setEnvironment("prod");
        paymentDatabase.setVersion("8.0.32");
        paymentDatabase.setDescription("支付交易数据存储");
        paymentDatabase.setHealthCheckUrl("mysql://payment-db:3308/health");
        paymentDatabase.setMonitoringEnabled(true);
        paymentDatabase.setCpuUsage(18.9);
        paymentDatabase.setMemoryUsage(1536L);
        paymentDatabase.setUptime("40天 12小时");
        components.add(paymentDatabase);
        
        // 业务5: 库存管理 (businessId = 5) - 添加3个组件
        // 库存管理API
        BusinessComponent inventoryAPI = new BusinessComponent();
        inventoryAPI.setBusinessId(5L);
        inventoryAPI.setName("库存管理API");
        inventoryAPI.setType("api");
        inventoryAPI.setStatus("running");
        inventoryAPI.setPort(8110);
        inventoryAPI.setUrl("http://inventory-api:8110");
        inventoryAPI.setEnvironment("prod");
        inventoryAPI.setVersion("2.8.1");
        inventoryAPI.setDescription("商品库存查询、预扣、释放");
        inventoryAPI.setHealthCheckUrl("http://inventory-api:8110/health");
        inventoryAPI.setMonitoringEnabled(true);
        inventoryAPI.setCpuUsage(16.8);
        inventoryAPI.setMemoryUsage(512L);
        inventoryAPI.setUptime("40天 6小时");
        components.add(inventoryAPI);
        
        // 仓储管理
        BusinessComponent warehouseService = new BusinessComponent();
        warehouseService.setBusinessId(5L);
        warehouseService.setName("仓储管理");
        warehouseService.setType("microservice");
        warehouseService.setStatus("running");
        warehouseService.setPort(8111);
        warehouseService.setUrl("http://warehouse-mgmt:8111");
        warehouseService.setEnvironment("prod");
        warehouseService.setVersion("3.1.0");
        warehouseService.setDescription("仓库管理、货位分配");
        warehouseService.setHealthCheckUrl("http://warehouse-mgmt:8111/health");
        warehouseService.setMonitoringEnabled(true);
        warehouseService.setCpuUsage(11.3);
        warehouseService.setMemoryUsage(384L);
        warehouseService.setUptime("32天 15小时");
        components.add(warehouseService);
        
        // 库存数据库
        BusinessComponent inventoryDatabase = new BusinessComponent();
        inventoryDatabase.setBusinessId(5L);
        inventoryDatabase.setName("库存数据库");
        inventoryDatabase.setType("database");
        inventoryDatabase.setStatus("running");
        inventoryDatabase.setPort(3309);
        inventoryDatabase.setUrl("mysql://inventory-db:3309/inventorydb");
        inventoryDatabase.setEnvironment("prod");
        inventoryDatabase.setVersion("8.0.32");
        inventoryDatabase.setDescription("库存数据存储");
        inventoryDatabase.setHealthCheckUrl("mysql://inventory-db:3309/health");
        inventoryDatabase.setMonitoringEnabled(true);
        inventoryDatabase.setCpuUsage(14.5);
        inventoryDatabase.setMemoryUsage(1024L);
        inventoryDatabase.setUptime("38天 20小时");
        components.add(inventoryDatabase);
        
        // 为每个业务创建了足够的组件用于演示
        // 总计：用户管理4个，订单管理4个，支付管理4个，库存管理3个 = 15个组件
        
        return components;
    }

    @Override
    public BusinessComponent getComponentById(Long id) {
        log.info("根据ID获取组件: {}", id);
        // TODO: 实现根据ID获取组件逻辑
        return null;
    }

    @Override
    public BusinessComponent saveComponent(BusinessComponent component) {
        log.info("保存组件: {}", component);
        
        try {
            // 设置默认值
            if (component.getCreateTime() == null) {
                component.setCreateTime(LocalDateTime.now());
            }
            if (component.getUpdateTime() == null) {
                component.setUpdateTime(LocalDateTime.now());
            }
            if (component.getDeleted() == null) {
                component.setDeleted(0);
            }
            if (component.getStatus() == null) {
                component.setStatus("stopped");
            }
            
            // 保存到数据库
            if (component.getId() == null) {
                // 新增
                this.save(component);
                log.info("新增组件成功，ID: {}", component.getId());
            } else {
                // 更新
                component.setUpdateTime(LocalDateTime.now());
                this.updateById(component);
                log.info("更新组件成功，ID: {}", component.getId());
            }
            
            return component;
            
        } catch (Exception e) {
            log.error("保存组件失败: {}", e.getMessage(), e);
            throw new RuntimeException("保存组件失败: " + e.getMessage());
        }
    }

    @Override
    public void deleteComponent(Long id) {
        log.info("删除组件: {}", id);
        // TODO: 实现删除组件逻辑
    }

    @Override
    public void updateComponentStatus(Long id, String status) {
        log.info("更新组件状态: id={}, status={}", id, status);
        // TODO: 实现更新组件状态逻辑
    }
}
