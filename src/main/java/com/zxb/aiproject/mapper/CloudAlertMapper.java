package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.CloudAlert;
import org.apache.ibatis.annotations.Mapper;

/**
 * 云平台告警Mapper接口
 */
@Mapper
public interface CloudAlertMapper extends BaseMapper<CloudAlert> {
}
