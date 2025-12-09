// 导航功能脚本
(function() {
    'use strict';
    
    console.log('📋 导航脚本加载...');
    
    // 获取context path
    function getContextPath() {
        const path = window.location.pathname;
        if (path.startsWith('/api')) {
            return '/api';
        }
        return '';
    }
    
    // 页面映射表
    const pageMap = {
        '总览': '',
        '视图': '视图.html',
        '告警中心': '告警中心.html',
        '设备管理': '设备管理.html',
        '网络拓扑': '网络拓扑.html',
        '统计报表': '统计报表.html',
        '运维工具': '运维工具.html',
        '数字大屏': '大屏展示.html',
        '业务管理': '业务管理.html',
        '网络管理': '网络管理.html',
        '视频管理': '视频管理.html',
        '机房管理': '机房管理.html',
        '资产管理': '资产管理.html',
        '运维管理': '运维管理.html',
        'CMDB': 'CMDB.html',
        '日志管理': '日志管理.html',
        '智能预测管理': '智能预测管理.html',
        '云平台': '云平台.html',
        '设置': '设置.html',
        '对接配置': '对接配置.html'
    };
    
    // 初始化导航
    function initNavigation() {
        const contextPath = getContextPath();
        console.log('📍 Context Path:', contextPath);
        
        // 等待DOM加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupNavigation);
        } else {
            setupNavigation();
        }
        
        function setupNavigation() {
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            console.log('📋 找到导航项:', sidebarItems.length);
            
            if (sidebarItems.length === 0) {
                console.warn('⚠️  未找到导航项，稍后重试...');
                setTimeout(setupNavigation, 500);
                return;
            }
            
            sidebarItems.forEach(item => {
                // 隐藏CMDB
                const span = item.querySelector('span');
                if (span && span.textContent.trim() === 'CMDB') {
                    item.style.display = 'none';
                    return;
                }
                
                // 绑定点击事件
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const span = this.querySelector('span');
                    if (!span) return;
                    
                    const itemText = span.textContent.trim();
                    console.log('🖱️  点击导航:', itemText);
                    
                    // 更新active状态
                    sidebarItems.forEach(si => si.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 跳转页面
                    const targetPage = pageMap[itemText];
                    if (targetPage !== undefined) {
                        const fullUrl = targetPage === '' 
                            ? contextPath + '/' 
                            : contextPath + '/' + targetPage;
                        
                        console.log('🔗 跳转到:', fullUrl);
                        window.location.href = fullUrl;
                    } else {
                        console.warn('⚠️  未找到页面映射:', itemText);
                    }
                });
            });
            
            console.log('✅ 导航初始化完成！');
        }
    }
    
    // 启动
    initNavigation();
    
    // 暴露全局重新初始化函数
    window.reinitNavigation = initNavigation;
    
})();
