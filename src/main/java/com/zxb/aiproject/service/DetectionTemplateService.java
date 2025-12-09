package com.zxb.aiproject.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zxb.aiproject.entity.DetectionTemplate;
import com.zxb.aiproject.mapper.DetectionTemplateMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 检测模板服务
 */
@Slf4j
@Service
public class DetectionTemplateService {

    @Autowired
    private DetectionTemplateMapper detectionTemplateMapper;

    /**
     * 获取所有检测模板
     */
    public List<DetectionTemplate> getAllTemplates() {
        LambdaQueryWrapper<DetectionTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(DetectionTemplate::getUpdateTime);
        return detectionTemplateMapper.selectList(wrapper);
    }

    /**
     * 根据检测类型获取模板
     */
    public List<DetectionTemplate> getTemplatesByType(String detectionType) {
        LambdaQueryWrapper<DetectionTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DetectionTemplate::getDetectionType, detectionType)
               .eq(DetectionTemplate::getStatus, 1)
               .orderByDesc(DetectionTemplate::getUpdateTime);
        return detectionTemplateMapper.selectList(wrapper);
    }

    /**
     * 根据ID获取模板
     */
    public DetectionTemplate getTemplateById(Long id) {
        return detectionTemplateMapper.selectById(id);
    }

    /**
     * 创建模板
     */
    public boolean createTemplate(DetectionTemplate template) {
        return detectionTemplateMapper.insert(template) > 0;
    }

    /**
     * 更新模板
     */
    public boolean updateTemplate(DetectionTemplate template) {
        return detectionTemplateMapper.updateById(template) > 0;
    }

    /**
     * 删除模板（逻辑删除）
     */
    public boolean deleteTemplate(Long id) {
        return detectionTemplateMapper.deleteById(id) > 0;
    }

    /**
     * 更新模板状态
     */
    public boolean updateStatus(Long id, Integer status) {
        DetectionTemplate template = new DetectionTemplate();
        template.setId(id);
        template.setStatus(status);
        return detectionTemplateMapper.updateById(template) > 0;
    }
}
