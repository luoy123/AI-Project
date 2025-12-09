package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.DetectionTemplate;
import com.zxb.aiproject.service.DetectionTemplateService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 检测模板Controller
 */
@Slf4j
@RestController
@Api(tags = "检测模板管理")
public class DetectionTemplateController {

    @Autowired
    private DetectionTemplateService detectionTemplateService;

    @GetMapping("/detection-templates")
    @ApiOperation("获取所有检测模板")
    public Result<List<DetectionTemplate>> getAllTemplates() {
        try {
            List<DetectionTemplate> templates = detectionTemplateService.getAllTemplates();
            log.info("获取检测模板列表成功，共{}条", templates.size());
            return Result.success(templates);
        } catch (Exception e) {
            log.error("获取检测模板列表失败", e);
            return Result.error("获取检测模板列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/detection-templates/type/{detectionType}")
    @ApiOperation("根据检测类型获取模板")
    public Result<List<DetectionTemplate>> getTemplatesByType(@PathVariable String detectionType) {
        try {
            List<DetectionTemplate> templates = detectionTemplateService.getTemplatesByType(detectionType);
            return Result.success(templates);
        } catch (Exception e) {
            log.error("根据类型获取检测模板失败", e);
            return Result.error("获取检测模板失败: " + e.getMessage());
        }
    }

    @GetMapping("/detection-templates/{id}")
    @ApiOperation("根据ID获取模板")
    public Result<DetectionTemplate> getTemplateById(@PathVariable Long id) {
        try {
            DetectionTemplate template = detectionTemplateService.getTemplateById(id);
            if (template == null) {
                return Result.error("模板不存在");
            }
            return Result.success(template);
        } catch (Exception e) {
            log.error("获取检测模板详情失败", e);
            return Result.error("获取模板详情失败: " + e.getMessage());
        }
    }

    @PostMapping("/detection-templates")
    @ApiOperation("创建检测模板")
    public Result<String> createTemplate(@RequestBody DetectionTemplate template) {
        try {
            boolean success = detectionTemplateService.createTemplate(template);
            if (success) {
                log.info("创建检测模板成功: {}", template.getTemplateName());
                return Result.success("创建成功");
            } else {
                return Result.error("创建失败");
            }
        } catch (Exception e) {
            log.error("创建检测模板失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/detection-templates/{id}")
    @ApiOperation("更新检测模板")
    public Result<String> updateTemplate(@PathVariable Long id, @RequestBody DetectionTemplate template) {
        try {
            template.setId(id);
            boolean success = detectionTemplateService.updateTemplate(template);
            if (success) {
                log.info("更新检测模板成功: {}", id);
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新检测模板失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/detection-templates/{id}")
    @ApiOperation("删除检测模板")
    public Result<String> deleteTemplate(@PathVariable Long id) {
        try {
            boolean success = detectionTemplateService.deleteTemplate(id);
            if (success) {
                log.info("删除检测模板成功: {}", id);
                return Result.success("删除成功");
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            log.error("删除检测模板失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    @PutMapping("/detection-templates/{id}/status")
    @ApiOperation("更新模板状态")
    public Result<String> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        try {
            boolean success = detectionTemplateService.updateStatus(id, status);
            if (success) {
                log.info("更新模板状态成功: {} -> {}", id, status);
                return Result.success("状态更新成功");
            } else {
                return Result.error("状态更新失败");
            }
        } catch (Exception e) {
            log.error("更新模板状态失败", e);
            return Result.error("状态更新失败: " + e.getMessage());
        }
    }
}
