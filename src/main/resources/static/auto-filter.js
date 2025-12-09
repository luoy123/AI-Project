// 自动过滤器应用功能

// 在syslog页面加载完成后自动应用保存的过滤状态
function autoApplyFilterOnSyslogLoad() {
    // 检查是否已经应用过，防止重复应用
    if (window.filterAlreadyApplied) {
        console.log('过滤器已应用，跳过重复应用');
        return true;
    }
    
    // 延迟执行，确保页面元素已加载
    setTimeout(() => {
        if (typeof getCurrentFilterState === 'function') {
            const savedFilterState = getCurrentFilterState();
            if (savedFilterState && savedFilterState.filterData) {
                console.log('检测到活跃的过滤状态，正在自动应用...');
                console.log('过滤条件:', savedFilterState.filterData);
                
                // 标记已应用，防止重复
                window.filterAlreadyApplied = true;
                
                // 显示过滤状态提示
                showActiveFilterNotification(savedFilterState.filterData);
                
                // 应用过滤条件到syslog页面（使用filterData而不是整个filterState）
                if (typeof applyFilterToSyslog === 'function') {
                    applyFilterToSyslog(savedFilterState.filterData);
                }
                
                // 5秒后重置标记，允许下次切换页面时重新应用
                setTimeout(() => {
                    window.filterAlreadyApplied = false;
                }, 5000);
                
                return true; // 表示已应用过滤器
            }
        }
        return false; // 表示没有应用过滤器
    }, 300);
}

// 显示活跃过滤器通知
function showActiveFilterNotification(filterData) {
    const conditions = [];
    
    if (filterData.keyword) conditions.push(`关键字: ${filterData.keyword}`);
    if (filterData.sourceIP) conditions.push(`IP: ${filterData.sourceIP}`);
    if (filterData.severities) conditions.push(`严重性: ${filterData.severities.length}个级别`);
    if (filterData.facilities) conditions.push(`Facility: ${filterData.facilities.length}个类型`);
    if (filterData.eventIds) conditions.push(`事件ID: ${filterData.eventIds[0]}`);
    if (filterData.alertOnly) conditions.push('仅告警日志');
    if (filterData.errorOnly) conditions.push('仅错误日志');
    
    const message = conditions.length > 0 
        ? `🔍 活跃过滤器: ${conditions.join(', ')}` 
        : '🔍 活跃过滤器已应用';
    
    // 创建持久化通知元素
    const notification = document.createElement('div');
    notification.id = 'activeFilterNotification';
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 400px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="clearActiveFilter()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                margin-left: 10px;
            ">清除</button>
        </div>
    `;
    
    // 移除已存在的通知
    const existingNotification = document.getElementById('activeFilterNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    document.body.appendChild(notification);
    
    // 添加悬停效果
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateY(-2px)';
        notification.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
    });
    
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateY(0)';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
}

// 移除活跃过滤器通知
function removeActiveFilterNotification() {
    const notification = document.getElementById('activeFilterNotification');
    if (notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// 检查是否有活跃的过滤器
function hasActiveFilter() {
    if (typeof getCurrentFilterState === 'function') {
        const filterState = getCurrentFilterState();
        return filterState !== null;
    }
    return false;
}

// 获取活跃过滤器的描述
function getActiveFilterDescription() {
    if (typeof getCurrentFilterState === 'function') {
        const filterData = getCurrentFilterState();
        if (filterData) {
            const conditions = [];
            
            if (filterData.timeRange && filterData.timeRange !== 'week') {
                const timeLabels = {
                    'today': '今天',
                    'month': '最近30天',
                    'custom': '自定义时间'
                };
                conditions.push(`时间: ${timeLabels[filterData.timeRange] || filterData.timeRange}`);
            }
            
            if (filterData.keyword) conditions.push(`关键字: "${filterData.keyword}"`);
            if (filterData.sourceIP) conditions.push(`来源IP: ${filterData.sourceIP}`);
            if (filterData.severities && filterData.severities.length > 0) {
                const severityNames = {
                    0: 'Emergency', 1: 'Alert', 2: 'Critical', 3: 'Error',
                    4: 'Warning', 5: 'Notice', 6: 'Info', 7: 'Debug'
                };
                const names = filterData.severities.map(s => severityNames[s] || s).join(', ');
                conditions.push(`严重性: ${names}`);
            }
            if (filterData.facilities && filterData.facilities.length > 0) {
                const facilityNames = {
                    0: 'Kernel', 1: 'User', 2: 'Mail', 3: 'Daemon', 4: 'Security',
                    16: 'Local0', 17: 'Local1', 18: 'Local2'
                };
                const names = filterData.facilities.map(f => facilityNames[f] || `Facility${f}`).join(', ');
                conditions.push(`Facility: ${names}`);
            }
            if (filterData.eventIds && filterData.eventIds.length > 0) {
                conditions.push(`事件ID: ${filterData.eventIds.join(', ')}`);
            }
            if (filterData.alertOnly) conditions.push('仅告警日志');
            if (filterData.errorOnly) conditions.push('仅错误日志');
            
            return conditions.length > 0 ? conditions.join(' | ') : '活跃过滤器';
        }
    }
    return null;
}

// 在页面加载时自动执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auto-filter.js已加载，但MutationObserver已禁用');
    console.log('过滤器应用逻辑由filtering-functions.js的safeApplyFilterToSyslog处理');
    
    // 注意：MutationObserver已被禁用，因为filtering-functions.js中的
    // safeApplyFilterToSyslog和setupPageSwitchListener已经提供了完整的自动应用功能
    // 保留此文件仅用于显示活跃过滤器通知等辅助功能
});
