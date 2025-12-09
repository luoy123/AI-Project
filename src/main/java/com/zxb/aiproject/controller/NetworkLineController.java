package com.zxb.aiproject.controller;

import com.zxb.aiproject.entity.NetworkLine;
import com.zxb.aiproject.service.NetworkLineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 专线管理Controller
 */
@RestController
@RequestMapping("/lines")
@Slf4j
@CrossOrigin
public class NetworkLineController {

    @Autowired
    private NetworkLineService networkLineService;

    /**
     * 获取专线列表
     */
    @GetMapping
    public Map<String, Object> getLinesList(
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        log.info("获取专线列表 - provider: {}, status: {}, keyword: {}", provider, status, keyword);
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> data = networkLineService.getLinesList(provider, status, keyword);
            result.put("success", true);
            result.put("data", data.get("list"));
            result.put("total", data.get("total"));
        } catch (Exception e) {
            log.error("获取专线列表失败", e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    /**
     * 获取专线详情
     */
    @GetMapping("/{id}")
    public NetworkLine getLineDetail(@PathVariable Long id) {
        log.info("获取专线详情 - id: {}", id);
        return networkLineService.getLineDetail(id);
    }

    /**
     * 添加专线
     */
    @PostMapping
    public Map<String, Object> addLine(@RequestBody NetworkLine line) {
        log.info("添加专线 - name: {}", line.getName());
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = networkLineService.addLine(line);
            result.put("success", success);
            if (success) {
                result.put("message", "添加成功");
            } else {
                result.put("message", "添加失败");
            }
        } catch (Exception e) {
            log.error("添加专线失败", e);
            result.put("success", false);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 更新专线
     */
    @PutMapping("/{id}")
    public Map<String, Object> updateLine(@PathVariable Long id, @RequestBody NetworkLine line) {
        log.info("更新专线 - id: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            line.setId(id);
            boolean success = networkLineService.updateLine(line);
            result.put("success", success);
            if (success) {
                result.put("message", "更新成功");
            } else {
                result.put("message", "更新失败");
            }
        } catch (Exception e) {
            log.error("更新专线失败", e);
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 删除专线
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteLine(@PathVariable Long id) {
        log.info("删除专线 - id: {}", id);
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = networkLineService.deleteLine(id);
            result.put("success", success);
            if (success) {
                result.put("message", "删除成功");
            } else {
                result.put("message", "删除失败");
            }
        } catch (Exception e) {
            log.error("删除专线失败", e);
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
}
