// 通用导航修复脚本
// 自动修复所有页面的主导航问题

(function() {
    'use strict';
    
    console.log('导航修复脚本加载...');
    
    // 获取context path
    function getContextPath() {
        const path = window.location.pathname;
        if (path.startsWith('/api')) {
            return '/api';
        }
        return '';
    }
    
    // 修复主导航
    function fixMainNavigation() {
        const contextPath = getContextPath();
        console.log('导航修复 - Context Path:', contextPath);
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(applyNavigationFix, 500);
            });
        } else {
            setTimeout(applyNavigationFix, 500);
        }
        
        function applyNavigationFix() {
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            console.log('导航修复 - 找到导航元素:', sidebarItems.length);
            
            if (sidebarItems.length === 0) {
                console.log('导航修复 - 未找到导航元素，稍后重试...');
                setTimeout(applyNavigationFix, 1000);
                return;
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
            
            // 移除现有事件监听器
            sidebarItems.forEach(item => {
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
            });
            
            // 重新绑定事件
            const newSidebarItems = document.querySelectorAll('.sidebar-item');
            newSidebarItems.forEach(item => {
                // 检查是否已经绑定过
                if (item.hasAttribute('data-nav-fixed')) {
                    return;
                }
                item.setAttribute('data-nav-fixed', 'true');
                
                // 隐藏CMDB菜单项
                const span = item.querySelector('span');
                if (span && span.textContent.trim() === 'CMDB') {
                    item.setAttribute('data-hidden', 'true');
                    item.style.display = 'none';
                    console.log('已隐藏CMDB菜单项');
                    return; // 跳过事件绑定
                }
                
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    const span = this.querySelector('span');
                    if (!span) return;
                    
                    const itemText = span.textContent.trim();
                    console.log('导航点击:', itemText);
                    
                    // 移除所有active状态
                    newSidebarItems.forEach(si => si.classList.remove('active'));
                    // 添加当前active状态
                    this.classList.add('active');
                    
                    const targetPage = pageMap[itemText];
                    if (targetPage !== undefined) {
                        // 检查是否是当前页面
                        const currentPageName = getCurrentPageName();
                        if (targetPage === currentPageName) {
                            console.log('当前已在目标页面');
                            return;
                        }
                        
                        const fullUrl = targetPage === '' ? contextPath + '/' : contextPath + '/' + targetPage;
                        console.log('导航到:', fullUrl);
                        window.location.href = fullUrl;
                    } else {
                        console.log('未找到页面映射:', itemText);
                    }
                });
            });
            
            console.log('导航修复完成！');
        }
    }
    
    // 获取当前页面名称
    function getCurrentPageName() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        return fileName || '';
    }
    
    // 修复页面内部导航（如日志管理）
    function fixInternalNavigation() {
        // 日志管理页面内部导航
        const logNavItems = document.querySelectorAll('.log-tree .node-item, .tree-content .node-item');
        if (logNavItems.length > 0) {
            console.log('修复日志管理内部导航...');
            
            const mapping = {
                'Syslog日志': 'syslog',
                'Syslog配置': 'config',
                '日志统计': 'statistics',
                '日志过滤': 'filtering'
            };
            
            logNavItems.forEach(item => {
                if (item.hasAttribute('data-internal-nav-fixed')) {
                    return;
                }
                item.setAttribute('data-internal-nav-fixed', 'true');
                
                item.addEventListener('click', function() {
                    logNavItems.forEach(node => node.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    const nodeText = this.querySelector('.node-text')?.textContent;
                    const tabName = mapping[nodeText] || 'syslog';
                    
                    console.log('日志内部导航:', nodeText, '->', tabName);
                    
                    if (typeof loadTabContent === 'function') {
                        loadTabContent(tabName);
                    }
                });
            });
        }
    }
    
    // 初始化修复
    function init() {
        console.log('初始化导航修复...');
        fixMainNavigation();
        
        // 延迟修复内部导航
        setTimeout(fixInternalNavigation, 1000);
    }
    
    // 启动修复
    init();
    
    // 暴露全局修复函数
    window.fixNavigation = function() {
        console.log('手动触发导航修复...');
        fixMainNavigation();
        fixInternalNavigation();
    };
    
    console.log('导航修复脚本已加载，运行 fixNavigation() 可手动修复');
    
})();
