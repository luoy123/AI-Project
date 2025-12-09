package com.zxb.aiproject.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日志查询DTO
 */
@Data
public class LogQueryDTO {

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 关键字搜索
     */
    private String keyword;

    /**
     * 来源IP列表
     */
    private List<String> sourceIps;

    /**
     * Facility列表
     */
    private List<Integer> facilities;

    /**
     * Severity列表
     */
    private List<Integer> severities;

    /**
     * 是否只查询告警日志
     */
    private Boolean alertOnly;

    /**
     * 匹配的事件ID列表
     */
    private List<Integer> eventIds;

    /**
     * 匹配的规则ID列表
     */
    private List<Integer> ruleIds;

    /**
     * 主机名
     */
    private String hostname;

    /**
     * 设备类型列表：SERVER-服务器, NETWORK-网络设备, STORAGE-存储设备, VIDEO-视频设备
     */
    private List<String> deviceTypes;

    /**
     * 页码
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer pageSize = 20;

    /**
     * 保存的过滤器ID
     */
    private Integer filterId;
}
