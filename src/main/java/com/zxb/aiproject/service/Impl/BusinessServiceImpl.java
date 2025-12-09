package com.zxb.aiproject.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zxb.aiproject.entity.Business;
import com.zxb.aiproject.mapper.BusinessMapper;
import com.zxb.aiproject.service.BusinessService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 业务服务实现类
 */
@Slf4j
@Service
public class BusinessServiceImpl extends ServiceImpl<BusinessMapper, Business> implements BusinessService {

    @Override
    public List<Business> getAllBusiness() {
        log.info("获取所有业务列表");
        try {
            List<Business> businesses = this.list();
            log.info("获取到 {} 个业务", businesses.size());
            
            // 如果数据库为空，创建默认业务数据
            if (businesses.isEmpty()) {
                log.info("数据库中没有业务数据，创建默认业务");
                businesses = createDefaultBusinessData();
            }
            
            return businesses;
        } catch (Exception e) {
            log.error("获取业务列表失败", e);
            return createDefaultBusinessData();
        }
    }

    @Override
    public List<Map<String, Object>> getBusinessTree() {
        log.info("获取业务树结构");
        try {
            List<Business> allBusiness = getAllBusiness();
            return buildBusinessTree(allBusiness);
        } catch (Exception e) {
            log.error("获取业务树失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Business> getChildrenByParentId(Long parentId) {
        QueryWrapper<Business> wrapper = new QueryWrapper<>();
        wrapper.eq("parent_id", parentId);
        return this.list(wrapper);
    }

    @Override
    public List<Business> getRootBusiness() {
        QueryWrapper<Business> wrapper = new QueryWrapper<>();
        wrapper.isNull("parent_id").or().eq("parent_id", 0);
        return this.list(wrapper);
    }

    @Override
    public Business smartAddBusiness(Business business, Long parentId) {
        log.info("智能新增业务: {}, 父业务ID: {}", business.getName(), parentId);
        
        // 验证业务编码唯一性
        if (!isCodeUnique(business.getCode(), null)) {
            throw new IllegalArgumentException("业务编码已存在");
        }
        
        // 设置父业务ID
        business.setParentId(parentId);
        
        // 设置默认状态
        if (business.getStatus() == null) {
            business.setStatus("active");
        }
        
        // 保存业务
        boolean saved = this.save(business);
        if (saved) {
            log.info("业务创建成功: {}", business.getId());
            return business;
        } else {
            throw new RuntimeException("业务保存失败");
        }
    }

    @Override
    public boolean isCodeUnique(String code, Long excludeId) {
        QueryWrapper<Business> wrapper = new QueryWrapper<>();
        wrapper.eq("code", code);
        if (excludeId != null) {
            wrapper.ne("id", excludeId);
        }
        return this.count(wrapper) == 0;
    }

    @Override
    public Map<String, Object> getBusinessStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 总业务数
        long totalCount = this.count();
        stats.put("totalCount", totalCount);
        
        // 根业务数
        QueryWrapper<Business> rootWrapper = new QueryWrapper<>();
        rootWrapper.isNull("parent_id").or().eq("parent_id", 0);
        long rootCount = this.count(rootWrapper);
        stats.put("rootCount", rootCount);
        
        // 按状态统计
        QueryWrapper<Business> activeWrapper = new QueryWrapper<>();
        activeWrapper.eq("status", "active");
        long activeCount = this.count(activeWrapper);
        stats.put("activeCount", activeCount);
        
        QueryWrapper<Business> inactiveWrapper = new QueryWrapper<>();
        inactiveWrapper.eq("status", "inactive");
        long inactiveCount = this.count(inactiveWrapper);
        stats.put("inactiveCount", inactiveCount);
        
        return stats;
    }

    @Override
    public Business getByCode(String code) {
        QueryWrapper<Business> wrapper = new QueryWrapper<>();
        wrapper.eq("code", code);
        return this.getOne(wrapper);
    }

    @Override
    public boolean deleteBusiness(Long id) {
        log.info("删除业务: {}", id);
        
        // 检查是否有子业务
        List<Business> children = getChildrenByParentId(id);
        if (!children.isEmpty()) {
            throw new IllegalArgumentException("该业务下还有子业务，无法删除");
        }
        
        // TODO: 检查是否有关联的组件
        
        return this.removeById(id);
    }

    @Override
    public boolean updateBusinessStatus(Long id, String status) {
        Business business = new Business();
        business.setId(id);
        business.setStatus(status);
        return this.updateById(business);
    }

    /**
     * 创建默认业务数据
     */
    private List<Business> createDefaultBusinessData() {
        log.info("创建默认业务数据");
        
        List<Business> businesses = new ArrayList<>();
        
        // 创建根业务
        Business ecommerce = createBusiness(null, "电商平台", "ECOMMERCE", "platform", "电商业务平台", "张三");
        Business finance = createBusiness(null, "财务系统", "FINANCE", "system", "财务管理系统", "李四");
        Business hr = createBusiness(null, "人力资源", "HR", "system", "人力资源管理系统", "王五");
        Business data = createBusiness(null, "数据平台", "DATA", "platform", "大数据分析平台", "赵六");
        Business customer = createBusiness(null, "客户服务", "CUSTOMER", "service", "客户服务系统", "孙七");
        
        businesses.addAll(Arrays.asList(ecommerce, finance, hr, data, customer));
        
        try {
            // 批量保存根业务
            this.saveBatch(businesses);
            log.info("成功创建 {} 个根业务", businesses.size());
            
            // 重新查询获取ID
            List<Business> savedBusinesses = this.list();
            
            // 创建子业务
            List<Business> childBusinesses = new ArrayList<>();
            
            for (Business parent : savedBusinesses) {
                switch (parent.getCode()) {
                    case "ECOMMERCE":
                        childBusinesses.add(createBusiness(parent.getId(), "用户管理", "USER_MGMT", "module", "用户注册登录管理", "张三"));
                        childBusinesses.add(createBusiness(parent.getId(), "订单管理", "ORDER_MGMT", "module", "订单处理管理", "张三"));
                        childBusinesses.add(createBusiness(parent.getId(), "支付管理", "PAYMENT_MGMT", "module", "支付处理管理", "张三"));
                        childBusinesses.add(createBusiness(parent.getId(), "库存管理", "INVENTORY_MGMT", "module", "库存管理系统", "张三"));
                        break;
                    case "FINANCE":
                        childBusinesses.add(createBusiness(parent.getId(), "会计核算", "ACCOUNTING", "module", "会计核算模块", "李四"));
                        childBusinesses.add(createBusiness(parent.getId(), "财务报表", "FINANCIAL_REPORT", "module", "财务报表生成", "李四"));
                        childBusinesses.add(createBusiness(parent.getId(), "预算管理", "BUDGET_MGMT", "module", "预算编制与控制", "李四"));
                        childBusinesses.add(createBusiness(parent.getId(), "成本控制", "COST_CONTROL", "module", "成本核算与控制", "李四"));
                        break;
                    case "HR":
                        childBusinesses.add(createBusiness(parent.getId(), "员工管理", "EMPLOYEE_MGMT", "module", "员工档案管理", "王五"));
                        childBusinesses.add(createBusiness(parent.getId(), "薪酬管理", "PAYROLL_MGMT", "module", "薪酬计算与发放", "王五"));
                        childBusinesses.add(createBusiness(parent.getId(), "绩效管理", "PERFORMANCE_MGMT", "module", "绩效考核管理", "王五"));
                        childBusinesses.add(createBusiness(parent.getId(), "培训管理", "TRAINING_MGMT", "module", "培训计划与管理", "王五"));
                        break;
                    case "DATA":
                        childBusinesses.add(createBusiness(parent.getId(), "数据采集", "DATA_COLLECTION", "module", "数据采集与处理", "赵六"));
                        childBusinesses.add(createBusiness(parent.getId(), "数据仓库", "DATA_WAREHOUSE", "module", "数据仓库管理", "赵六"));
                        childBusinesses.add(createBusiness(parent.getId(), "数据分析", "DATA_ANALYSIS", "module", "数据分析与挖掘", "赵六"));
                        break;
                    case "CUSTOMER":
                        childBusinesses.add(createBusiness(parent.getId(), "客户关系", "CRM", "module", "客户关系管理", "孙七"));
                        childBusinesses.add(createBusiness(parent.getId(), "在线客服", "ONLINE_SERVICE", "module", "在线客服系统", "孙七"));
                        childBusinesses.add(createBusiness(parent.getId(), "工单管理", "TICKET_MGMT", "module", "工单处理管理", "孙七"));
                        childBusinesses.add(createBusiness(parent.getId(), "知识库", "KNOWLEDGE_BASE", "module", "知识库管理", "孙七"));
                        break;
                }
            }
            
            // 保存子业务
            if (!childBusinesses.isEmpty()) {
                this.saveBatch(childBusinesses);
                log.info("成功创建 {} 个子业务", childBusinesses.size());
            }
            
            // 返回所有业务
            return this.list();
            
        } catch (Exception e) {
            log.error("创建默认业务数据失败", e);
            return businesses;
        }
    }

    /**
     * 创建业务对象
     */
    private Business createBusiness(Long parentId, String name, String code, String type, String description, String owner) {
        Business business = new Business();
        business.setParentId(parentId);
        business.setName(name);
        business.setCode(code);
        business.setType(type);
        business.setDescription(description);
        business.setOwner(owner);
        business.setStatus("active");
        return business;
    }

    /**
     * 构建业务树结构
     */
    private List<Map<String, Object>> buildBusinessTree(List<Business> allBusiness) {
        // 获取根业务
        List<Business> rootBusinesses = allBusiness.stream()
                .filter(b -> b.getParentId() == null || b.getParentId() == 0)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> tree = new ArrayList<>();
        
        for (Business root : rootBusinesses) {
            Map<String, Object> node = buildTreeNode(root, allBusiness);
            tree.add(node);
        }
        
        return tree;
    }

    /**
     * 构建树节点
     */
    private Map<String, Object> buildTreeNode(Business business, List<Business> allBusiness) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", business.getId());
        node.put("name", business.getName());
        node.put("code", business.getCode());
        node.put("type", business.getType());
        node.put("status", business.getStatus());
        node.put("description", business.getDescription());
        node.put("owner", business.getOwner());
        
        // 查找子业务
        List<Business> children = allBusiness.stream()
                .filter(b -> Objects.equals(b.getParentId(), business.getId()))
                .collect(Collectors.toList());
        
        if (!children.isEmpty()) {
            List<Map<String, Object>> childNodes = new ArrayList<>();
            for (Business child : children) {
                childNodes.add(buildTreeNode(child, allBusiness));
            }
            node.put("children", childNodes);
        }
        
        return node;
    }
}
