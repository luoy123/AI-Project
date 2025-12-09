package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.BusinessComponent;

import java.util.List;

/**
 * 业务组件服务接口
 */
public interface BusinessComponentService extends IService<BusinessComponent> {

    /**
     * 根据业务ID获取组件列表
     */
    List<BusinessComponent> getComponentsByBusinessId(Long businessId);

    /**
     * 获取所有组件
     */
    List<BusinessComponent> getAllComponents();

    /**
     * 根据ID获取组件
     */
    BusinessComponent getComponentById(Long id);

    /**
     * 保存组件（新增或更新）
     */
    BusinessComponent saveComponent(BusinessComponent component);

    /**
     * 删除组件
     */
    void deleteComponent(Long id);

    /**
     * 更新组件状态
     */
    void updateComponentStatus(Long id, String status);
}
