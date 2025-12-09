package com.zxb.aiproject.service;

import java.util.Map;

/**
 * 系统备份服务接口
 */
public interface SystemBackupService {
    
    /**
     * 执行系统备份
     * @return 备份结果
     */
    Map<String, Object> executeBackup();
    
    /**
     * 获取备份列表
     * @return 备份文件列表
     */
    Map<String, Object> getBackupList();
    
    /**
     * 下载备份文件
     * @param filename 文件名
     * @return 文件路径
     */
    String getBackupFilePath(String filename);
    
    /**
     * 删除备份文件
     * @param filename 文件名
     * @return 是否成功
     */
    boolean deleteBackup(String filename);
    
    /**
     * 推送备份到远程地址
     * @param filename 文件名
     * @param targetUrl 目标地址
     * @return 推送结果
     */
    Map<String, Object> pushBackup(String filename, String targetUrl);
    
    /**
     * 清理历史数据
     * @return 清理结果
     */
    Map<String, Object> cleanupHistoryData();
}
