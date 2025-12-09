package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.LogEvent;
import org.apache.ibatis.annotations.Mapper;

/**
 * 日志事件Mapper
 */
@Mapper
public interface LogEventMapper extends BaseMapper<LogEvent> {
}
