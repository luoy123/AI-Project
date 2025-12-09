/**
 * 自动刷新模块
 * 根据系统配置自动刷新页面数据
 */
(function() {
    'use strict';
    
    let refreshInterval = null;
    let refreshCallback = null;
    
    /**
     * 初始化自动刷新
     * @param {Function} callback 刷新时执行的回调函数
     */
    window.initAutoRefresh = function(callback) {
        refreshCallback = callback;
        loadRefreshConfig();
    };
    
    /**
     * 加载刷新配置
     */
    function loadRefreshConfig() {
        // 获取自动刷新配置
        Promise.all([
            fetch('/api/system-config/get/system.autoRefresh').then(r => r.json()),
            fetch('/api/system-config/get/system.refreshInterval').then(r => r.json())
        ])
        .then(([autoRefreshResult, intervalResult]) => {
            const autoRefresh = autoRefreshResult.code === 200 && autoRefreshResult.data === 'true';
            const interval = intervalResult.code === 200 ? parseInt(intervalResult.data) || 30 : 30;
            
            console.log('自动刷新配置:', { autoRefresh, interval: interval + '秒' });
            
            if (autoRefresh && refreshCallback) {
                startAutoRefresh(interval);
            }
        })
        .catch(error => {
            console.warn('获取自动刷新配置失败:', error);
        });
    }
    
    /**
     * 启动自动刷新
     * @param {number} intervalSeconds 刷新间隔（秒）
     */
    function startAutoRefresh(intervalSeconds) {
        // 清除之前的定时器
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        console.log('启动自动刷新，间隔:', intervalSeconds + '秒');
        
        refreshInterval = setInterval(function() {
            console.log('自动刷新数据...');
            if (refreshCallback) {
                refreshCallback();
            }
        }, intervalSeconds * 1000);
    }
    
    /**
     * 停止自动刷新
     */
    window.stopAutoRefresh = function() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
            console.log('已停止自动刷新');
        }
    };
    
    /**
     * 手动刷新
     */
    window.manualRefresh = function() {
        if (refreshCallback) {
            console.log('手动刷新数据...');
            refreshCallback();
        }
    };
    
    // 页面卸载时清除定时器
    window.addEventListener('beforeunload', function() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
})();
