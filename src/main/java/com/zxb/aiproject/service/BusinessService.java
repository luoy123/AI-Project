package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zxb.aiproject.entity.Business;

import java.util.List;
import java.util.Map;

/**
 * 业务服务接口
 */
public interface BusinessService extends IService<Business> {

    /**
     * 获取所有业务列表
     */
    List<Business> getAllBusiness();

    /**
     * 获取业务树结构
     */
    List<Map<String, Object>> getBusinessTree();

    /**
     * 根据父业务ID获取子业务
     */
    List<Business> getChildrenByParentId(Long parentId);

    /**
     * 获取根业务列表
     */
    List<Business> getRootBusiness();

    /**
     * 智能新增业务
     * @param business 业务信息
     * @param parentId 父业务ID（为null时创建根业务）
     */
    Business smartAddBusiness(Business business, Long parentId);

    /**
     * 验证业务编码是否唯一
     */
    boolean isCodeUnique(String code, Long excludeId);

    /**
     * 获取业务统计信息
     */
    Map<String, Object> getBusinessStats();

    /**
     * 根据业务编码查询业务
     */
    Business getByCode(String code);

    /**
     * 删除业务（级联删除子业务）
     */
    boolean deleteBusiness(Long id);

    /**
     * 更新业务状态
     */
    boolean updateBusinessStatus(Long id, String status);
}
