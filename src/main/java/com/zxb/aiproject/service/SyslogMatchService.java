package com.zxb.aiproject.service;

import com.zxb.aiproject.entity.LogRule;
import com.zxb.aiproject.entity.SyslogEntry;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Syslog日志匹配服务接口
 */
public interface SyslogMatchService {
    
    /**
     * 对单条日志进行规则匹配
     * @param syslogEntry 日志条目
     * @return 是否匹配成功
     */
    boolean matchSingleLog(SyslogEntry syslogEntry);
    
    /**
     * 批量匹配未匹配的日志
     * @param limit 每次处理的数量限制
     * @return 匹配成功的数量
     */
    int matchUnmatchedLogs(Integer limit);
    
    /**
     * 重新匹配所有日志（清空已有匹配结果）
     * @return 匹配成功的数量
     */
    int rematchAllLogs();
    
    /**
     * 检查日志是否匹配某个规则
     * @param log 日志条目
     * @param rule 规则
     * @return 是否匹配
     */
    boolean isLogMatchRule(SyslogEntry log, LogRule rule);
}
