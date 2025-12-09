package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.service.SyslogMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Syslog日志匹配控制器
 */
@RestController
@RequestMapping("/logs/match")
public class SyslogMatchController {

    @Autowired
    private SyslogMatchService syslogMatchService;

    /**
     * 批量匹配未匹配的日志
     * @param limit 处理数量限制（可选，默认100）
     */
    @PostMapping("/unmatch")
    public Result<Integer> matchUnmatchedLogs(
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        try {
            int matchedCount = syslogMatchService.matchUnmatchedLogs(limit);
            return Result.success("成功匹配 " + matchedCount + " 条日志", matchedCount);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("匹配失败: " + e.getMessage());
        }
    }

    /**
     * 重新匹配所有日志（慎用，会清空所有已有匹配结果）
     */
    @PostMapping("/rematch-all")
    public Result<Integer> rematchAllLogs() {
        try {
            int matchedCount = syslogMatchService.rematchAllLogs();
            return Result.success("重新匹配完成，成功匹配 " + matchedCount + " 条日志", matchedCount);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("重新匹配失败: " + e.getMessage());
        }
    }
}
