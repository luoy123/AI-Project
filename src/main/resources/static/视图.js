// 视图页面交互逻辑

// 设备类型跳转功能
function navigateToDeviceType(deviceType) {
    const typeGroupMap = {
        'network': '2',    // 网络设备分组ID
        'server': '1',     // 服务器分组ID  
        'storage': '3'     // 存储设备分组ID
    };
    
    const typeNameMap = {
        'network': '网络设备',
        'server': '服务器',
        'storage': '存储设备'
    };
    
    const groupId = typeGroupMap[deviceType];
    const typeName = typeNameMap[deviceType];
    
    if (groupId) {
        console.log(`跳转到${typeName}分组，ID: ${groupId}`);
        
        // 直接跳转，不显示提示
        window.location.href = `设备管理.html?selectGroup=${groupId}&groupType=parent`;
    } else {
        console.warn(`未找到设备类型 ${deviceType} 对应的分组ID`);
        window.location.href = '设备管理.html';
    }
}

// 加载设备统计数据
async function loadDeviceStatistics() {
    try {
        console.log('开始加载设备统计数据...');
        const response = await fetch('/api/alert/statistics');
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            const stats = data.data;
            updateSystemOverviewChart(stats);
            console.log('设备统计数据加载成功:', stats);
        } else {
            console.warn('设备统计数据加载失败，使用默认数据');
            updateSystemOverviewChart({
                serverCount: 8,
                networkCount: 6,
                storageCount: 5
            });
        }
    } catch (error) {
        console.error('加载设备统计数据时出错:', error);
        updateSystemOverviewChart({
            serverCount: 8,
            networkCount: 6,
            storageCount: 5
        });
    }
}

// 加载活跃设备数据
async function loadActiveDevices() {
    try {
        console.log('开始加载活跃设备数据...');
        
        // 尝试从API加载数据（修改为使用asset表）
        const response = await fetch('/api/asset/active');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.length > 0) {
                renderActiveDevices(data.data);
                console.log('活跃设备数据加载成功:', data.data);
                return;
            }
        }
        
        // API失败或无数据，使用示例数据
        console.warn('API无响应或无数据，使用示例数据');
        renderActiveDevices(getExampleActiveDevices());
        
    } catch (error) {
        console.error('加载活跃设备数据时出错:', error);
        console.log('使用示例数据作为备用');
        renderActiveDevices(getExampleActiveDevices());
    }
}

// 获取示例活跃设备数据
function getExampleActiveDevices() {
    // 基于当前真实时间计算各设备的创建时间
    const now = new Date(); // 当前真实时间
    return [
        {
            id: 1,
            name: '路由器-01',
            type: 'router',
            ip: '192.168.1.1',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 1 * 60 * 1000), // 1分钟前创建
            groupId: 8, // 路由器分组
            description: '核心路由器'
        },
        {
            id: 2,
            name: '无线AP-01',
            type: 'wireless',
            ip: '192.168.1.201',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 3 * 60 * 1000), // 3分钟前创建
            groupId: 10, // 无线AP分组
            description: '办公区无线接入点'
        },
        {
            id: 3,
            name: '无线AP-02',
            type: 'wireless',
            ip: '192.168.1.202',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 6 * 60 * 1000), // 6分钟前创建
            groupId: 10, // 无线AP分组
            description: '会议室无线接入点'
        },
        {
            id: 4,
            name: 'VPN网关-01',
            type: 'router',
            ip: '192.168.1.100',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 9 * 60 * 1000), // 9分钟前创建
            groupId: 8, // 路由器分组
            description: 'VPN远程接入网关'
        },
        {
            id: 5,
            name: 'API网关-01',
            type: 'server',
            ip: '192.168.1.50',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 13 * 60 * 1000), // 13分钟前创建
            groupId: 6, // 应用服务器分组
            description: 'API接口网关服务器'
        },
        {
            id: 6,
            name: '核心交换机-01',
            type: 'switch',
            ip: '192.168.1.10',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 16 * 60 * 1000), // 16分钟前创建
            groupId: 7, // 交换机分组
            description: '数据中心核心交换机'
        },
        {
            id: 7,
            name: '接入交换机-01',
            type: 'switch',
            ip: '192.168.1.20',
            status: 'warning',
            lastActiveTime: new Date(now.getTime() - 20 * 60 * 1000), // 20分钟前创建
            groupId: 7, // 交换机分组
            description: '楼层接入交换机'
        },
        {
            id: 8,
            name: '防火墙-02',
            type: 'firewall',
            ip: '192.168.1.254',
            status: 'online',
            lastActiveTime: new Date(now.getTime() - 24 * 60 * 1000), // 24分钟前创建
            groupId: 9, // 防火墙分组
            description: '内网安全防火墙'
        }
    ];
}

// 渲染活跃设备列表
function renderActiveDevices(devices) {
    const deviceList = document.querySelector('.device-list');
    if (!deviceList) {
        console.warn('未找到活跃设备列表容器');
        return;
    }
    
    // 按最后活跃时间排序（最近的在前）
    devices.sort((a, b) => new Date(b.lastActiveTime) - new Date(a.lastActiveTime));
    
    deviceList.innerHTML = '';
    
    devices.forEach(device => {
        const li = document.createElement('li');
        li.className = 'device-item clickable-device';
        li.onclick = () => navigateToSpecificDevice(device);
        li.title = `设备名称: ${device.name}\n设备描述: ${device.description || '无描述'}\nIP地址: ${device.ip}\n设备类型: ${getDeviceTypeText(device.type)}\n当前状态: ${getStatusText(device.status)}\n最后活跃: ${formatTimeAgo(device.lastActiveTime)}\n\n点击跳转到设备管理页面`;
        
        const icon = getDeviceIcon(device.type);
        const statusClass = getStatusClass(device.status);
        const timeAgo = formatTimeAgo(device.lastActiveTime);
        
        li.innerHTML = `
            <i class="${icon}"></i> 
            ${device.name} 
            <span class="device-time" data-original-time="${device.lastActiveTime}">${timeAgo}</span>
            <span class="status ${statusClass}"></span>
        `;
        
        deviceList.appendChild(li);
    });
    
    console.log(`渲染了 ${devices.length} 个活跃设备`);
}

// 获取设备图标
function getDeviceIcon(type) {
    const iconMap = {
        'server': 'fas fa-server',
        'switch': 'fas fa-network-wired',
        'router': 'fas fa-route',
        'firewall': 'fas fa-shield-alt',
        'storage': 'fas fa-hdd',
        'wireless': 'fas fa-wifi'
    };
    return iconMap[type] || 'fas fa-desktop';
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        'online': 'online',
        'offline': 'offline',
        'warning': 'warning',
        'error': 'error'
    };
    return statusMap[status] || 'offline';
}

// 获取设备类型文本
function getDeviceTypeText(type) {
    const typeMap = {
        'server': '服务器',
        'switch': '交换机',
        'router': '路由器',
        'firewall': '防火墙',
        'storage': '存储设备',
        'wireless': '无线设备'
    };
    return typeMap[type] || '未知设备';
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'online': '在线',
        'offline': '离线',
        'warning': '警告',
        'error': '错误',
        'maintenance': '维护中'
    };
    return statusMap[status] || '未知状态';
}

// 格式化时间差
function formatTimeAgo(time) {
    const now = new Date();
    const alertTime = new Date(time);
    const diff = now.getTime() - alertTime.getTime();
    
    // 确保时间差不为负数
    if (diff < 0) {
        return '刚刚';
    }
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}天前`;
    } else if (hours > 0) {
        return `${hours}小时前`;
    } else if (minutes > 0) {
        // 显示更精确的分钟数，包括秒数信息
        const remainingSeconds = seconds % 60;
        if (remainingSeconds >= 30) {
            return `${minutes + 1}分钟前`;
        } else {
            return `${minutes}分钟前`;
        }
    } else if (seconds >= 10) {
        return `${seconds}秒前`;
    } else {
        return '刚刚';
    }
}

// 更新时间显示（不重新加载数据）
function updateTimeDisplays() {
    console.log('开始更新时间显示...');
    
    // 更新活跃设备的时间显示
    const deviceItems = document.querySelectorAll('.device-list .device-item');
    let updatedDevices = 0;
    deviceItems.forEach((item, index) => {
        const timeElement = item.querySelector('.device-time');
        if (timeElement && timeElement.dataset.originalTime) {
            const originalTimeStr = timeElement.dataset.originalTime;
            const originalTime = new Date(originalTimeStr);
            const oldTimeText = timeElement.textContent;
            const newTimeText = formatTimeAgo(originalTime);
            
            // 调试信息
            if (index === 0) { // 只打印第一个设备的详细信息
                console.log(`设备时间更新调试:`, {
                    originalTimeStr,
                    originalTime,
                    oldTimeText,
                    newTimeText,
                    isValidDate: !isNaN(originalTime.getTime())
                });
            }
            
            timeElement.textContent = newTimeText;
            updatedDevices++;
        }
    });
    
    // 更新最近告警的时间显示
    const alertItems = document.querySelectorAll('.alert-list .alert-item');
    let updatedAlerts = 0;
    alertItems.forEach((item, index) => {
        const timeElement = item.querySelector('.alert-time');
        if (timeElement && timeElement.dataset.originalTime) {
            const originalTimeStr = timeElement.dataset.originalTime;
            const originalTime = new Date(originalTimeStr);
            const oldTimeText = timeElement.textContent;
            const newTimeText = formatTimeAgo(originalTime);
            
            // 调试信息
            if (index === 0) { // 只打印第一个告警的详细信息
                console.log(`告警时间更新调试:`, {
                    originalTimeStr,
                    originalTime,
                    oldTimeText,
                    newTimeText,
                    isValidDate: !isNaN(originalTime.getTime())
                });
            }
            
            timeElement.textContent = newTimeText;
            updatedAlerts++;
        }
    });
    
    console.log(`更新了 ${updatedDevices} 个设备和 ${updatedAlerts} 个告警的时间显示`);
}

// 跳转到具体设备
function navigateToSpecificDevice(device) {
    console.log('跳转到具体设备:', device);
    
    // 构建跳转URL，包含设备ID和分组ID
    const url = `设备管理.html?selectGroup=${device.groupId}&groupType=child&deviceId=${device.id}`;
    
    console.log(`跳转到设备: ${device.name} (ID: ${device.id})`);
    console.log(`目标URL: ${url}`);
    
    window.location.href = url;
}

// 加载最近告警数据
async function loadRecentAlerts() {
    try {
        console.log('开始加载最近告警数据...');
        
        // 尝试从API加载数据
        const response = await fetch('/api/alert/recent?limit=10');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.length > 0) {
                renderRecentAlerts(data.data);
                console.log('最近告警数据加载成功:', data.data);
                return;
            }
        }
        
        // API失败或无数据，使用示例数据
        console.warn('API无响应或无数据，使用示例数据');
        renderRecentAlerts(getExampleRecentAlerts());
        
    } catch (error) {
        console.error('加载最近告警数据时出错:', error);
        console.log('使用示例数据作为备用');
        renderRecentAlerts(getExampleRecentAlerts());
    }
}

// 获取示例最近告警数据
function getExampleRecentAlerts() {
    // 基于当前真实时间计算各告警的创建时间
    const now = new Date(); // 当前真实时间
    return [
        {
            id: 1,
            severity: 'critical',
            message: '路由器-01 CPU使用率过高',
            deviceName: '路由器-01',
            deviceType: 'router',
            status: 'acknowledged',
            occurredTime: new Date(now.getTime() - 3 * 60 * 1000), // 3分钟前创建
            metricValue: '95%',
            threshold: '90%',
            description: 'CPU使用率持续超过90%'
        },
        {
            id: 2,
            severity: 'critical',
            message: '核心交换机-01 内存不足',
            deviceName: '核心交换机-01',
            deviceType: 'switch',
            status: 'active',
            occurredTime: new Date(now.getTime() - 7 * 60 * 1000), // 7分钟前创建
            metricValue: '98%',
            threshold: '85%',
            description: '内存使用率达到98%'
        },
        {
            id: 3,
            severity: 'critical',
            message: 'API网关-01 服务异常',
            deviceName: 'API网关-01',
            deviceType: 'server',
            status: 'active',
            occurredTime: new Date(now.getTime() - 12 * 60 * 1000), // 12分钟前创建
            metricValue: '5000ms',
            threshold: '2000ms',
            description: '服务响应超时，影响业务访问'
        },
        {
            id: 4,
            severity: 'warning',
            message: '无线AP-01 连接数过多',
            deviceName: '无线AP-01',
            deviceType: 'wireless',
            status: 'active',
            occurredTime: new Date(now.getTime() - 18 * 60 * 1000), // 18分钟前创建
            metricValue: '80个',
            threshold: '70个',
            description: '连接设备数量接近上限'
        },
        {
            id: 5,
            severity: 'warning',
            message: '接入交换机-01 端口利用率高',
            deviceName: '接入交换机-01',
            deviceType: 'switch',
            status: 'acknowledged',
            occurredTime: new Date(now.getTime() - 25 * 60 * 1000), // 25分钟前创建
            metricValue: '85%',
            threshold: '80%',
            description: '24口千兆端口利用率过高'
        },
        {
            id: 6,
            severity: 'warning',
            message: 'VPN网关-01 隧道连接不稳定',
            deviceName: 'VPN网关-01',
            deviceType: 'router',
            status: 'active',
            occurredTime: new Date(now.getTime() - 35 * 60 * 1000), // 35分钟前创建
            metricValue: '75%',
            threshold: '90%',
            description: 'VPN隧道连接出现间歇性断开'
        },
        {
            id: 7,
            severity: 'warning',
            message: '防火墙-02 规则匹配率异常',
            deviceName: '防火墙-02',
            deviceType: 'firewall',
            status: 'acknowledged',
            occurredTime: new Date(now.getTime() - 50 * 60 * 1000), // 50分钟前创建
            metricValue: '150%',
            threshold: '120%',
            description: '检测到大量可疑流量'
        },
        {
            id: 8,
            severity: 'warning',
            message: '无线AP-02 信号强度下降',
            deviceName: '无线AP-02',
            deviceType: 'wireless',
            status: 'acknowledged',
            occurredTime: new Date(now.getTime() - 65 * 60 * 1000), // 65分钟前创建
            metricValue: '-75dBm',
            threshold: '-65dBm',
            description: '会议室信号覆盖强度下降'
        },
        {
            id: 9,
            severity: 'info',
            message: '核心交换机-01 端口状态变更',
            deviceName: '核心交换机-01',
            deviceType: 'switch',
            status: 'resolved',
            occurredTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2小时前创建
            metricValue: 'up',
            threshold: 'down',
            description: '端口48状态从down变更为up'
        },
        {
            id: 10,
            severity: 'info',
            message: 'API网关-01 性能监控报告',
            deviceName: 'API网关-01',
            deviceType: 'server',
            status: 'resolved',
            occurredTime: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4小时前创建
            metricValue: '99.9%',
            threshold: '99.5%',
            description: '本周性能表现良好'
        }
    ];
}

// 渲染最近告警列表
function renderRecentAlerts(alerts) {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) {
        console.warn('未找到最近告警列表容器');
        return;
    }
    
    // 按发生时间排序（最新的在前）
    alerts.sort((a, b) => new Date(b.occurredTime) - new Date(a.occurredTime));
    
    alertList.innerHTML = '';
    
    alerts.forEach(alert => {
        const li = document.createElement('li');
        li.className = `alert-item clickable-alert severity-${alert.severity} status-${alert.status}`;
        li.onclick = () => navigateToAlertCenter(alert);
        li.title = `告警详情: ${alert.message}\n设备: ${alert.deviceName}\n状态: ${getAlertStatusText(alert.status)}\n发生时间: ${formatTimeAgo(alert.occurredTime)}\n指标值: ${alert.metricValue} (阈值: ${alert.threshold})\n\n点击跳转到告警中心`;
        
        const icon = getAlertIcon(alert.severity);
        const timeAgo = formatTimeAgo(alert.occurredTime);
        const statusText = getAlertStatusText(alert.status);
        
        li.innerHTML = `
            <i class="${icon}"></i> 
            <span class="alert-message">${alert.message}</span>
            <span class="alert-time" data-original-time="${alert.occurredTime}">${timeAgo}</span>
            <span class="alert-status status-${alert.status}">${statusText}</span>
        `;
        
        alertList.appendChild(li);
    });
    
    console.log(`渲染了 ${alerts.length} 个最近告警`);
}

// 获取告警图标
function getAlertIcon(severity) {
    const iconMap = {
        'critical': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle', 
        'info': 'fas fa-info-circle'
    };
    return iconMap[severity] || 'fas fa-bell';
}

// 获取告警状态文本
function getAlertStatusText(status) {
    const statusMap = {
        'active': '活跃',
        'acknowledged': '已确认',
        'resolved': '已解决'
    };
    return statusMap[status] || '未知';
}

// 跳转到告警中心
function navigateToAlertCenter(alert) {
    console.log('跳转到告警中心:', alert);
    
    // 构建跳转URL，不包含日期参数，这样可以显示所有告警
    const url = `告警中心.html?alertId=${alert.id}&severity=${alert.severity}&status=${alert.status}&deviceName=${encodeURIComponent(alert.deviceName)}`;
    
    console.log(`跳转到告警: ${alert.message} (ID: ${alert.id})`);
    console.log(`告警状态: ${alert.status}`);
    console.log(`目标URL: ${url}`);
    
    window.location.href = url;
}

// 更新系统概览图表
function updateSystemOverviewChart(stats) {
    if (!window.systemOverviewChart) return;
    
    const serverCount = stats.serverCount || 0;
    const networkCount = stats.networkCount || 0;
    const storageCount = stats.storageCount || 0;
    const totalDevices = stats.totalDevices || 0;
    
    // 更新图表数据
    window.systemOverviewChart.data.datasets[0].data = [serverCount, networkCount, storageCount];
    window.systemOverviewChart.update();
    
    console.log(`系统概览图表已更新: 服务器=${serverCount}, 网络设备=${networkCount}, 存储设备=${storageCount}, 总计=${totalDevices}`);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM内容加载完成');
    
    // 初始化视图控制器
    initViewController();
    
    // 初始化图表
    initCharts();
    
    // 初始化仪表盘视图（默认视图）
    initDashboardView();
    
    // 初始化视图设置
    initializeViewSettings();
    
    // 初始化侧边栏导航
    initSidebar();
    
    // 延迟尝试更新路由统计数据（防止切换到路由视图时数据为0）
    setTimeout(() => {
        if (typeof connectionData !== 'undefined' && typeof updateRouteStats === 'function') {
            console.log('尝试预加载路由统计数据...');
            updateRouteStats();
        }
    }, 1000);
    
    // 加载设备统计数据
    setTimeout(() => {
        loadDeviceStatistics();
    }, 500);
    
    // 加载活跃设备数据（无论当前是哪个视图）
    setTimeout(() => {
        loadActiveDevices();
    }, 800);
    
    // 加载最近告警数据
    setTimeout(() => {
        loadRecentAlerts();
    }, 1000);
    
    // 定期更新数据（每30秒）
    setInterval(() => {
        console.log('定期刷新数据...');
        loadDeviceStatistics();
        loadActiveDevices();
        loadRecentAlerts();
    }, 30000);
});

// 定期更新时间显示（不重新加载数据，只更新时间）- 每10秒更新一次，更频繁
setInterval(() => {
    console.log('更新时间显示...');
    updateTimeDisplays();
}, 10000); // 每10秒更新一次时间显示

// 全局调试函数 - 可在浏览器控制台中调用
window.debugRouteStats = function() {
    console.log('=== 手动调试路由统计 ===');
    console.log('connectionData:', connectionData);
    console.log('updateRouteStats函数:', typeof updateRouteStats);
    
    if (typeof updateRouteStats === 'function') {
        const result = updateRouteStats();
        console.log('更新结果:', result);
    } else {
        console.error('updateRouteStats函数不存在');
    }
    
    // 检查所有统计元素
    const elements = {
        totalLinksCount: document.getElementById('totalLinksCount'),
        normalLinksCount: document.getElementById('normalLinksCount'),
        warningLinksCount: document.getElementById('warningLinksCount'),
        criticalLinksCount: document.getElementById('criticalLinksCount')
    };
    
    console.log('统计元素状态:', elements);
    return elements;
};

/**
 * 初始化视图控制器
 */
function initViewController() {
    // 获取所有视图选项卡和面板
    const tabButtons = document.querySelectorAll('.tab-btn');
    const viewPanels = document.querySelectorAll('.view-panel');

    // 为每个选项卡添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标视图
            const targetView = this.getAttribute('data-view');

            // 移除所有选项卡的活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前选项卡的活动状态
            this.classList.add('active');

            // 隐藏所有视图面板
            viewPanels.forEach(panel => panel.classList.remove('active'));
            // 显示目标视图面板
            document.getElementById(`${targetView}-view`).classList.add('active');

            // 如果是首次切换到该视图，初始化相关内容
            if (targetView === 'dashboard' && !window.dashboardInitialized) {
                initDashboardView();
            } else if (targetView === 'route') {
                if (!window.routeInitialized) {
                    window.routeInitialized = true;
                    initRouteView();
                } else {
                    // 即使已经初始化，也要更新统计数据
                    setTimeout(() => {
                        updateRouteStats();
                    }, 50);
                }
            } else if (targetView === 'visio' && !window.visioInitialized) {
                initVisioView();
            } else if (targetView === 'room' && !window.roomInitialized) {
                initRoomView();
            } else if (targetView === 'line' && !window.lineInitialized) {
                initLineView();
            }
        });
    });
}

/**
 * 初始化图表
 */
function initCharts() {
    console.log('开始检查Chart.js...');
    
    // 检查是否加载了Chart.js，如果没有则延迟重试
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js未加载，1秒后重试...');
        setTimeout(() => {
            if (typeof Chart === 'undefined') {
                console.warn('第一次重试失败，2秒后再次重试...');
                setTimeout(() => {
                    if (typeof Chart === 'undefined') {
                        console.error('Chart.js加载失败，请检查网络连接');
                        return;
                    }
                    console.log('Chart.js在第二次重试后加载成功');
                    createCharts();
                }, 2000);
                return;
            }
            console.log('Chart.js在第一次重试后加载成功');
            createCharts();
        }, 1000);
        return;
    }
    
    console.log('Chart.js加载成功');
    createCharts();
}

/**
 * 创建图表
 */
function createCharts() {

    // 系统概览图表 - 使用真实设备数据
    const systemOverviewCtx = document.getElementById('systemOverviewChart');
    console.log('系统概览Canvas元素:', systemOverviewCtx);
    
    if (systemOverviewCtx) {
        try {
            window.systemOverviewChart = new Chart(systemOverviewCtx, {
                type: 'doughnut',
                data: {
                    labels: ['服务器', '网络设备', '存储设备'],
                    datasets: [{
                        data: [8, 6, 5], // 使用默认数据，避免全0导致不显示
                        backgroundColor: [
                            '#3b82f6',
                            '#10b981',
                            '#f59e0b'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: '设备类型分布'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value}台 (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const elementIndex = elements[0].index;
                        const deviceTypes = ['server', 'network', 'storage'];
                        const deviceType = deviceTypes[elementIndex];
                        navigateToDeviceType(deviceType);
                    }
                }
            }
        });
        console.log('系统概览图表创建成功');
        } catch (error) {
            console.error('创建系统概览图表失败:', error);
        }
    } else {
        console.error('未找到systemOverviewChart元素');
    }

    // 资源使用情况图表
    const resourceUsageCtx = document.getElementById('resourceUsageChart');
    if (resourceUsageCtx) {
        // 获取保存的设置
        const savedSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
        const showGrid = savedSettings.showGrid !== undefined ? savedSettings.showGrid : true;
        
        window.resourceUsageChart = new Chart(resourceUsageCtx, {
            type: 'bar',
            data: {
                labels: ['CPU', '内存', '磁盘', '网络'],
                datasets: [{
                    label: '使用率 (%)',
                    data: [65, 45, 78, 32],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            display: showGrid
                        }
                    },
                    x: {
                        grid: {
                            display: showGrid
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '系统资源使用情况'
                    },
                    legend: {
                        display: true
                    }
                }
            }
        });
        
        console.log('资源使用情况图表已创建，网格线:', showGrid);
    }

    // 机房温度图表
    const temperatureCtx = document.getElementById('temperatureChart');
    if (temperatureCtx) {
        // 获取保存的设置
        const savedSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
        const showGrid = savedSettings.showGrid !== undefined ? savedSettings.showGrid : true;
        
        window.temperatureChart = new Chart(temperatureCtx, {
            type: 'line',
            data: {
                labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                datasets: [{
                    label: '温度 (°C)',
                    data: [22, 23, 24, 25, 24, 23],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 18,
                        max: 30,
                        grid: {
                            display: showGrid
                        }
                    },
                    x: {
                        grid: {
                            display: showGrid
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '机房温度变化'
                    }
                }
            }
        });
        
        console.log('机房温度图表已创建，网格线:', showGrid);
    }

    // 机房湿度图表
    const humidityCtx = document.getElementById('humidityChart');
    if (humidityCtx) {
        // 获取保存的设置
        const savedSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
        const showGrid = savedSettings.showGrid !== undefined ? savedSettings.showGrid : true;
        
        window.humidityChart = new Chart(humidityCtx, {
            type: 'line',
            data: {
                labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                datasets: [{
                    label: '湿度 (%)',
                    data: [45, 42, 40, 38, 41, 43],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        max: 60,
                        grid: {
                            display: showGrid
                        }
                    },
                    x: {
                        grid: {
                            display: showGrid
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '机房湿度变化'
                    }
                }
            }
        });
        
        console.log('机房湿度图表已创建，网格线:', showGrid);
    }

    // 专线流量图表 - 从API加载数据
    loadLineDataAndChart();
}

// 加载专线数据并创建图表
async function loadLineDataAndChart() {
    try {
        console.log('开始加载专线数据...');
        const response = await fetch('/api/lines');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            console.log('专线数据加载成功:', result.data);
            updateLineOverview(result.data);
            createLineTrafficChart(result.data);
        } else {
            console.warn('专线数据加载失败，使用默认数据');
            useDefaultLineData();
        }
    } catch (error) {
        console.error('加载专线数据失败:', error);
        useDefaultLineData();
    }
}

// 更新专线概览卡片
function updateLineOverview(lines) {
    const lineOverview = document.querySelector('.line-overview');
    if (!lineOverview) return;
    
    lineOverview.innerHTML = lines.map(line => {
        const statusClass = line.status === 'normal' ? 'online' : 
                           line.status === 'warning' ? 'warning' : 'critical';
        const statusColor = line.status === 'normal' ? '#10b981' : 
                           line.status === 'warning' ? '#f59e0b' : '#ef4444';
        
        return `
            <div class="line-item">
                <h4>${line.name}</h4>
                <div class="line-status ${statusClass}" style="background: ${statusColor};"></div>
                <div class="line-traffic">流量: ${line.bandwidth || '0Mbps'}</div>
                <div class="line-latency">延迟: ${line.latency || 0} ms</div>
            </div>
        `;
    }).join('');
}

// 创建专线流量图表
function createLineTrafficChart(lines) {
    const lineTrafficCtx = document.getElementById('lineTrafficChart');
    if (!lineTrafficCtx) return;
    
    // 只筛选状态为正常的专线
    const normalLines = lines.filter(line => line.status === 'normal');
    
    if (normalLines.length === 0) {
        console.log('没有状态正常的专线，不生成图表');
        // 隐藏图表容器或显示提示信息
        const chartContainer = lineTrafficCtx.parentElement;
        if (chartContainer) {
            chartContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;"><i class="fas fa-info-circle" style="font-size: 48px; margin-bottom: 15px;"></i><p>暂无正常运行的专线数据</p></div>';
        }
        return;
    }
    
    console.log(`找到 ${normalLines.length} 条状态正常的专线，生成图表`);
    
    // 获取保存的设置
    const savedSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
    const showGrid = savedSettings.showGrid !== undefined ? savedSettings.showGrid : true;
    
    // 生成时间标签（24小时）
    const labels = [];
    for (let i = 0; i < 24; i += 4) {
        labels.push(`${String(i).padStart(2, '0')}:00`);
    }
    
    // 为每条正常状态的专线生成数据集
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const datasets = normalLines.slice(0, 6).map((line, index) => {
        // 模拟流量数据（基于带宽）
        const bandwidth = parseInt(line.bandwidth) || 100;
        const data = labels.map(() => {
            const variation = Math.random() * 0.3 + 0.7; // 70%-100%的带宽利用率
            return Math.round(bandwidth * variation);
        });
        
        return {
            label: line.name,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: 'transparent',
            tension: 0.3
        };
    });
    
    window.lineTrafficChart = new Chart(lineTrafficCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '流量 (Mbps)'
                    },
                    grid: {
                        display: showGrid
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间'
                    },
                    grid: {
                        display: showGrid
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `专线流量趋势 (${normalLines.length}条正常专线)`
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    console.log(`专线流量图表已创建，包含 ${normalLines.length} 条正常专线，网格线:`, showGrid);
}

// 使用默认专线数据
function useDefaultLineData() {
    const defaultLines = [
        { name: '北京-上海', status: 'normal', bandwidth: '400Mbps', latency: 23 },
        { name: '上海-广州', status: 'normal', bandwidth: '300Mbps', latency: 31 },
        { name: '广州-深圳', status: 'warning', bandwidth: '700Mbps', latency: 18 },
        { name: '北京-成都', status: 'normal', bandwidth: '210Mbps', latency: 45 },
        { name: '上海-成都', status: 'fault', bandwidth: '0Mbps', latency: 0 }
    ];
    
    updateLineOverview(defaultLines);
    createLineTrafficChart(defaultLines);
}

/**
 * 初始化仪表盘视图
 */
function initDashboardView() {
    window.dashboardInitialized = true;
    
    // 加载活跃设备数据
    loadActiveDevices();
    
    // 加载最近告警数据
    
    console.log('Visio view initialized');
}

// 更新路由统计数据
function updateRouteStats() {
    console.log('开始更新路由统计数据...');
    
    // 确保connectionData已定义
    if (typeof connectionData === 'undefined') {
        console.error('connectionData未定义，无法更新统计数据');
        return;
    }
    
    // 计算统计数据
    const totalLinks = connectionData.length;
    const normalLinks = connectionData.filter(c => c.status === 'normal').length;
    const warningLinks = connectionData.filter(c => c.status === 'warning').length;
    const criticalLinks = connectionData.filter(c => c.status === 'critical').length;
    
    console.log(`计算结果: 总链路${totalLinks}, 正常${normalLinks}, 警告${warningLinks}, 故障${criticalLinks}`);
    
    // 强制查找所有可能的统计元素
    const possibleSelectors = [
        '#totalLinksCount',
        '[id="totalLinksCount"]',
        '.stat-value:nth-child(1)',
        '#route-view .stat-item:nth-child(1) .stat-value'
    ];
    
    let totalElement = null;
    for (const selector of possibleSelectors) {
        totalElement = document.querySelector(selector);
        if (totalElement) {
            console.log(`找到总链路元素，使用选择器: ${selector}`);
            break;
        }
    }
    
    // 类似地查找其他元素
    const normalElement = document.getElementById('normalLinksCount') || 
                         document.querySelector('#route-view .stat-item:nth-child(2) .stat-value');
    const warningElement = document.getElementById('warningLinksCount') || 
                          document.querySelector('#route-view .stat-item:nth-child(3) .stat-value');
    const criticalElement = document.getElementById('criticalLinksCount') || 
                           document.querySelector('#route-view .stat-item:nth-child(4) .stat-value');
    
    console.log('DOM元素查找结果:', {
        totalElement: !!totalElement,
        normalElement: !!normalElement,
        warningElement: !!warningElement,
        criticalElement: !!criticalElement
    });
    
    // 强制更新，即使元素不存在也要尝试
    if (totalElement) {
        totalElement.textContent = totalLinks;
        totalElement.innerHTML = totalLinks; // 双重保险
        console.log(`✅ 更新总链路数: ${totalLinks}`);
    } else {
        console.error('❌ 总链路数元素未找到');
    }
    
    if (normalElement) {
        normalElement.textContent = normalLinks;
        normalElement.innerHTML = normalLinks;
        console.log(`✅ 更新正常链路: ${normalLinks}`);
    } else {
        console.error('❌ 正常链路元素未找到');
    }
    
    if (warningElement) {
        warningElement.textContent = warningLinks;
        warningElement.innerHTML = warningLinks;
        console.log(`✅ 更新警告链路: ${warningLinks}`);
    } else {
        console.error('❌ 警告链路元素未找到');
    }
    
    if (criticalElement) {
        criticalElement.textContent = criticalLinks;
        criticalElement.innerHTML = criticalLinks;
        console.log(`✅ 更新故障链路: ${criticalLinks}`);
    } else {
        console.error('❌ 故障链路元素未找到');
    }
    
    console.log('路由统计数据更新完成');
    
    // 返回统计结果供调试使用
    return { totalLinks, normalLinks, warningLinks, criticalLinks };
}

// 地点数据
const locationData = {
    'beijing': {
        id: 'beijing',
        name: '北京',
        province: '北京市',
        city: '北京市',
        latitude: 39.9042,
        longitude: 116.4074,
        status: 'online',
        description: '华北地区核心节点',
        devices: 156,
        links: 8,
        traffic: '2.5 Gbps',
        lastUpdate: '2分钟前',
        details: {
            '数据中心': '北京亦庄数据中心',
            '运营商': '中国电信、中国联通、中国移动',
            '带宽容量': '10 Gbps',
            '设备数量': '156台',
            '在线率': '99.8%',
            '平均延迟': '15ms'
        }
    },
    'tianjin': {
        id: 'tianjin',
        name: '天津',
        province: '天津市',
        city: '天津市',
        latitude: 39.3434,
        longitude: 117.3616,
        status: 'online',
        description: '华北地区重要节点',
        devices: 89,
        links: 4,
        traffic: '1.8 Gbps',
        lastUpdate: '3分钟前',
        details: {
            '数据中心': '天津滨海数据中心',
            '运营商': '中国电信、中国联通',
            '带宽容量': '6 Gbps',
            '设备数量': '89台',
            '在线率': '99.5%',
            '平均延迟': '18ms'
        }
    },
    'shanghai': {
        id: 'shanghai',
        name: '上海',
        province: '上海市',
        city: '上海市',
        latitude: 31.2304,
        longitude: 121.4737,
        status: 'online',
        description: '华东地区核心节点',
        devices: 203,
        links: 12,
        traffic: '3.8 Gbps',
        lastUpdate: '1分钟前',
        details: {
            '数据中心': '上海张江数据中心',
            '运营商': '中国电信、中国联通、中国移动',
            '带宽容量': '20 Gbps',
            '设备数量': '203台',
            '在线率': '99.9%',
            '平均延迟': '12ms'
        }
    },
    'guangzhou': {
        id: 'guangzhou',
        name: '广州',
        province: '广东省',
        city: '广州市',
        latitude: 23.1291,
        longitude: 113.2644,
        status: 'warning',
        description: '华南地区核心节点',
        devices: 134,
        links: 6,
        traffic: '1.9 Gbps',
        lastUpdate: '5分钟前',
        details: {
            '数据中心': '广州南沙数据中心',
            '运营商': '中国电信、中国联通',
            '带宽容量': '8 Gbps',
            '设备数量': '134台',
            '在线率': '98.5%',
            '平均延迟': '25ms'
        }
    },
    'shenzhen': {
        id: 'shenzhen',
        name: '深圳',
        province: '广东省',
        city: '深圳市',
        latitude: 22.5431,
        longitude: 114.0579,
        status: 'online',
        description: '华南地区重要节点',
        devices: 89,
        links: 4,
        traffic: '1.2 Gbps',
        lastUpdate: '3分钟前',
        details: {
            '数据中心': '深圳前海数据中心',
            '运营商': '中国电信、中国移动',
            '带宽容量': '5 Gbps',
            '设备数量': '89台',
            '在线率': '99.2%',
            '平均延迟': '18ms'
        }
    },
    'chengdu': {
        id: 'chengdu',
        name: '成都',
        province: '四川省',
        city: '成都市',
        latitude: 30.5728,
        longitude: 104.0668,
        status: 'online',
        description: '西南地区核心节点',
        devices: 76,
        links: 5,
        traffic: '1.1 Gbps',
        lastUpdate: '4分钟前',
        details: {
            '数据中心': '成都天府数据中心',
            '运营商': '中国电信、中国联通',
            '带宽容量': '6 Gbps',
            '设备数量': '76台',
            '在线率': '99.1%',
            '平均延迟': '22ms'
        }
    },
    'wuhan': {
        id: 'wuhan',
        name: '武汉',
        province: '湖北省',
        city: '武汉市',
        latitude: 30.5928,
        longitude: 114.3055,
        status: 'offline',
        description: '华中地区核心节点',
        devices: 45,
        links: 2,
        traffic: '0 Gbps',
        lastUpdate: '30分钟前',
        details: {
            '数据中心': '武汉光谷数据中心',
            '运营商': '中国电信',
            '带宽容量': '4 Gbps',
            '设备数量': '45台',
            '在线率': '0%',
            '平均延迟': '超时'
        }
    },
    'nanjing': {
        id: 'nanjing',
        name: '南京',
        province: '江苏省',
        city: '南京市',
        latitude: 32.0603,
        longitude: 118.7969,
        status: 'online',
        description: '华东地区重要节点',
        devices: 112,
        links: 6,
        traffic: '2.1 Gbps',
        lastUpdate: '1分钟前',
        details: {
            '数据中心': '南京江北数据中心',
            '运营商': '中国电信、中国联通',
            '带宽容量': '8 Gbps',
            '设备数量': '112台',
            '在线率': '99.7%',
            '平均延迟': '16ms'
        }
    },
    'hangzhou': {
        id: 'hangzhou',
        name: '杭州',
        province: '浙江省',
        city: '杭州市',
        latitude: 30.2741,
        longitude: 120.1551,
        status: 'warning',
        description: '华东地区重要节点',
        devices: 98,
        links: 5,
        traffic: '1.7 Gbps',
        lastUpdate: '4分钟前',
        details: {
            '数据中心': '杭州西湖数据中心',
            '运营商': '中国电信、中国移动',
            '带宽容量': '7 Gbps',
            '设备数量': '98台',
            '在线率': '98.2%',
            '平均延迟': '28ms'
        }
    },
    'xian': {
        id: 'xian',
        name: '西安',
        province: '陕西省',
        city: '西安市',
        latitude: 34.3416,
        longitude: 108.9398,
        status: 'online',
        description: '西北地区核心节点',
        devices: 87,
        links: 5,
        traffic: '1.4 Gbps',
        lastUpdate: '2分钟前',
        details: {
            '数据中心': '西安高新数据中心',
            '运营商': '中国电信、中国联通',
            '带宽容量': '6 Gbps',
            '设备数量': '87台',
            '在线率': '99.3%',
            '平均延迟': '20ms'
        }
    },
    'chongqing': {
        id: 'chongqing',
        name: '重庆',
        province: '重庆市',
        city: '重庆市',
        latitude: 29.4316,
        longitude: 106.9123,
        status: 'warning',
        description: '西南地区重要节点',
        devices: 73,
        links: 4,
        traffic: '1.0 Gbps',
        lastUpdate: '6分钟前',
        details: {
            '数据中心': '重庆两江数据中心',
            '运营商': '中国电信、中国移动',
            '带宽容量': '5 Gbps',
            '设备数量': '73台',
            '在线率': '97.8%',
            '平均延迟': '32ms'
        }
    }
};

// 链路连接数据
const connectionData = [
    { from: 'beijing', to: 'tianjin', status: 'normal', traffic: '1.2 Gbps' },
    { from: 'beijing', to: 'shanghai', status: 'normal', traffic: '3.5 Gbps' },
    { from: 'beijing', to: 'xian', status: 'normal', traffic: '1.8 Gbps' },
    { from: 'shanghai', to: 'nanjing', status: 'normal', traffic: '2.1 Gbps' },
    { from: 'shanghai', to: 'hangzhou', status: 'warning', traffic: '1.7 Gbps' },
    { from: 'shanghai', to: 'guangzhou', status: 'normal', traffic: '2.8 Gbps' },
    { from: 'guangzhou', to: 'shenzhen', status: 'normal', traffic: '1.9 Gbps' },
    { from: 'chengdu', to: 'chongqing', status: 'warning', traffic: '0.9 Gbps' },
    { from: 'chengdu', to: 'xian', status: 'normal', traffic: '1.1 Gbps' },
    { from: 'wuhan', to: 'shanghai', status: 'critical', traffic: '0 Gbps' },
    { from: 'wuhan', to: 'guangzhou', status: 'critical', traffic: '0 Gbps' },
    { from: 'nanjing', to: 'hangzhou', status: 'normal', traffic: '1.3 Gbps' }
];

// 初始化SVG地图
function initRouteMap() {
    const svg = d3.select('#routeMap');
    const width = 800;
    const height = 500;
    
    // 清空现有内容
    svg.selectAll('*').remove();
    
    // 设置SVG尺寸
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // 创建中国地图背景
    const mapGroup = svg.append('g').attr('class', 'map-background');
    
    // 简化的中国地图轮廓
    mapGroup.append('rect')
        .attr('x', 60)
        .attr('y', 40)
        .attr('width', width - 120)
        .attr('height', height - 80)
        .attr('fill', '#f8fafc')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 2)
        .attr('rx', 10);
    
    // 添加地图标题
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e293b')
        .text('全国网络节点分布图');
    
    // 创建地点标记
    const locations = svg.append('g').attr('class', 'locations');
    
    // 坐标映射函数（扩大映射范围）
    const xScale = d3.scaleLinear()
        .domain([100, 130]) // 调整经度范围，聚焦中国东部
        .range([80, width - 80]);
    
    const yScale = d3.scaleLinear()
        .domain([45, 20]) // 调整纬度范围（注意Y轴反转）
        .range([60, height - 60]);
    
    // 添加地点标记
    Object.values(locationData).forEach(location => {
        const x = xScale(location.longitude);
        const y = yScale(location.latitude);
        
        // 创建地点组
        const locationGroup = locations.append('g')
            .attr('class', `map-location location-${location.id}`)
            .attr('transform', `translate(${x}, ${y})`)
            .style('cursor', 'pointer')
            .on('click', function(event) {
                event.stopPropagation();
                showLocationInfo(location.id);
            });
        
        // 地点圆圈
        locationGroup.append('circle')
            .attr('r', 8)
            .attr('fill', getLocationColor(location.status))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);
        
        // 地点名称
        locationGroup.append('text')
            .attr('x', 0)
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('class', 'city-label')
            .attr('fill', '#1e293b')
            .text(location.name);
        
        // 状态指示器
        locationGroup.append('circle')
            .attr('r', 3)
            .attr('cx', 8)
            .attr('cy', -8)
            .attr('class', 'status-indicator')
            .attr('fill', getStatusColor(location.status))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1);
    });
    
    // 添加连接线
    const lines = svg.append('g').attr('class', 'connections');
    
    connectionData.forEach(connection => {
        const fromLocation = locationData[connection.from];
        const toLocation = locationData[connection.to];
        
        if (fromLocation && toLocation) {
            const x1 = xScale(fromLocation.longitude);
            const y1 = yScale(fromLocation.latitude);
            const x2 = xScale(toLocation.longitude);
            const y2 = yScale(toLocation.latitude);
            
            const line = lines.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('class', `connection-line ${connection.status}`)
                .style('opacity', 0.8);
            
            // 添加流量标签背景
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // 添加白色背景矩形
            const textBg = lines.append('rect')
                .attr('x', midX - 20)
                .attr('y', midY - 12)
                .attr('width', 40)
                .attr('height', 14)
                .attr('fill', 'rgba(255,255,255,0.9)')
                .attr('stroke', '#e2e8f0')
                .attr('stroke-width', 1)
                .attr('rx', 3);
            
            // 添加流量标签
            lines.append('text')
                .attr('x', midX)
                .attr('y', midY - 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '9px')
                .attr('fill', '#374151')
                .attr('class', 'traffic-label')
                .style('font-weight', '500')
                .text(connection.traffic);
        }
    });
}

// 获取地点颜色
function getLocationColor(status) {
    switch (status) {
        case 'online': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'offline': return '#ef4444';
        default: return '#6b7280';
    }
}

// 获取状态颜色
function getStatusColor(status) {
    switch (status) {
        case 'online': return '#22c55e';
        case 'warning': return '#eab308';
        case 'offline': return '#dc2626';
        default: return '#6b7280';
    }
}

// 显示地点详细信息
function showLocationInfo(locationId) {
    const location = locationData[locationId];
    if (!location) return;
    
    console.log('显示地点信息:', location.name);
    
    // 更新选中状态
    d3.selectAll('.map-location').classed('selected', false);
    d3.select(`.location-${locationId}`).classed('selected', true);
    
    // 构建详细信息HTML
    const statusClass = `status-${location.status}`;
    const statusText = {
        'online': '在线',
        'warning': '警告',
        'offline': '离线'
    }[location.status] || '未知';
    
    const infoHTML = `
        <div class="location-detail">
            <div class="detail-label">地点名称</div>
            <div class="detail-value">${location.name}</div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">省份城市</div>
            <div class="detail-value">${location.province} ${location.city}</div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">地理坐标</div>
            <div class="detail-value">
                纬度: ${location.latitude}°<br>
                经度: ${location.longitude}°
            </div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">节点状态</div>
            <div class="detail-value">
                <span class="location-status ${statusClass}">${statusText}</span>
            </div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">节点描述</div>
            <div class="detail-value">${location.description}</div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">设备统计</div>
            <div class="detail-value">
                设备数量: ${location.devices}台<br>
                链路数量: ${location.links}条<br>
                流量负载: ${location.traffic}
            </div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">详细信息</div>
            <div class="detail-value">
                ${Object.entries(location.details).map(([key, value]) => 
                    `<strong>${key}:</strong> ${value}`
                ).join('<br>')}
            </div>
        </div>
        
        <div class="location-detail">
            <div class="detail-label">最后更新</div>
            <div class="detail-value">${location.lastUpdate}</div>
        </div>
    `;
    
    // 显示信息面板
    const panel = document.getElementById('locationInfoPanel');
    const content = document.getElementById('locationInfoContent');
    
    content.innerHTML = infoHTML;
    panel.classList.add('active');
}

// 关闭地点信息面板
function closeLocationInfo() {
    const panel = document.getElementById('locationInfoPanel');
    panel.classList.remove('active');
    
    // 清除选中状态
    d3.selectAll('.map-location').classed('selected', false);
}

/**
 * 初始化设备视图
 */
function initDevicesView() {
    window.devicesInitialized = true;
    // 这里可以添加设备视图的初始化逻辑
    console.log('Devices view initialized');
}

/**
 * 初始化网络视图
 */
function initNetworkView() {
    window.networkInitialized = true;
    // 这里可以添加网络视图的初始化逻辑
    console.log('Network view initialized');
}

/**
 * 初始化链路航线图视图
 */
function initRouteView() {
    window.routeInitialized = true;
    // 初始化链路航线图
    initRouteMap();
    console.log('Route view initialized');
}

/**
 * 初始化Visio视图
 */
function initVisioView() {
    window.visioInitialized = true;
    console.log('Initializing visio view...');
    
    // 初始化网络拓扑图
    initNetworkTopology();
    
    // 更新拓扑统计数据
    updateTopologyStats();
    
    console.log('Visio view initialized');
}

/**
 * 初始化机房仪表盘视图
 */
function initRoomView() {
    window.roomInitialized = true;
    // 初始化机房布局图
    // 延迟初始化，确保SVG元素已渲染
setTimeout(initRoomLayout, 100);
    console.log('Room view initialized');
}

/**
 * 初始化专线大屏视图
 */
function initLineView() {
    window.lineInitialized = true;
    // 这里可以添加专线大屏视图的初始化逻辑
    initLineStatus();
    console.log('Line view initialized');
}

/**
        line.setAttribute('d', d);

        // 设置链路状态样式
        let strokeColor = '#10b981'; // 正常
        let strokeWidth = 3;

        if (status === 'warning') {
            strokeColor = '#f59e0b'; // 警告
        } else if (status === 'critical') {
            strokeColor = '#ef4444'; // 故障
            strokeWidth = 4;
            line.setAttribute('stroke-dasharray', '5,5');
        }

        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('fill', 'none');
        svg.appendChild(line);
    }
}

/**
 * 初始化Visio视图控件
 */
function initVisioControls() {
    const zoomInBtn = document.querySelector('.visio-controls button:nth-child(1)');
    const zoomOutBtn = document.querySelector('.visio-controls button:nth-child(2)');
    const panBtn = document.querySelector('.visio-controls button:nth-child(3)');
    const resetBtn = document.querySelector('.visio-controls button:nth-child(4)');
    const exportBtn = document.querySelector('.visio-controls button:nth-child(5)');
    const visioImage = document.querySelector('.visio-image');

    let scale = 1;
    let isPanning = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            scale += 0.1;
            updateVisioTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(0.5, scale - 0.1);
            updateVisioTransform();
        });
    }

    if (panBtn) {
        panBtn.addEventListener('click', () => {
            isPanning = !isPanning;
            panBtn.textContent = isPanning ? '平移 (已激活)' : '平移';
            visioImage.style.cursor = isPanning ? 'move' : 'default';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateVisioTransform();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('导出功能已触发');
            // 实际项目中这里会实现导出功能
        });
    }

    if (visioImage) {
        visioImage.addEventListener('mousedown', (e) => {
            if (isPanning) {
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateVisioTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            isPanning = false;
            if (panBtn) {
                panBtn.textContent = '平移';
            }
            if (visioImage) {
                visioImage.style.cursor = 'default';
            }
        });
    }

    function updateVisioTransform() {
        if (visioImage) {
            visioImage.style.transform = `scale(${scale}) translate(${translateX/scale}px, ${translateY/scale}px)`;
        }
    }
}

/**
 * 初始化机房布局图
 */
function initRoomLayout() {
    const svg = document.getElementById('roomLayout');
    if (!svg) return;

    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // 清空SVG
    svg.innerHTML = '';

    // 设置SVG视口
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 定义边距
    const margin = 60;

    // 绘制机房轮廓
    const room = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    room.setAttribute('x', margin);
    room.setAttribute('y', margin);
    room.setAttribute('width', width - 2 * margin);
    room.setAttribute('height', height - 2 * margin);
    room.setAttribute('fill', '#f1f5f9');
    room.setAttribute('stroke', '#94a3b8');
    room.setAttribute('stroke-width', '2');
    svg.appendChild(room);

    // 计算内部可用空间
    const innerWidth = width - 2 * margin;
    const innerHeight = height - 2 * margin;

    // 绘制机柜
    const rackWidth = 60;
    const rackHeight = 80; // 减少机柜高度
    const gap = 15; // 减少间隙
    const rows = 2;
    const cols = 4;

    // 计算机柜区域总宽度和高度
    const racksTotalWidth = cols * rackWidth + (cols - 1) * gap;
    const racksTotalHeight = rows * rackHeight + (rows - 1) * gap;

    // 计算机柜起始位置(居中放置)
    const racksStartX = margin + (innerWidth - racksTotalWidth) / 2;
    const racksStartY = margin + 20; // 顶部留出一些空间

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = racksStartX + j * (rackWidth + gap);
            const y = racksStartY + i * (rackHeight + gap);

            // 确保机柜在机房内部
            if (x + rackWidth > width - margin || y + rackHeight > height - margin) {
                continue;
            }

            const rack = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rack.setAttribute('x', x);
            rack.setAttribute('y', y);
            rack.setAttribute('width', rackWidth);
            rack.setAttribute('height', rackHeight);
            rack.setAttribute('fill', '#e2e8f0');
            rack.setAttribute('stroke', '#64748b');
            rack.setAttribute('stroke-width', '1');
            svg.appendChild(rack);

            // 机柜编号
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + rackWidth / 2);
            text.setAttribute('y', y + 15);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#333');
            text.setAttribute('font-size', '12');
            text.textContent = `机柜 ${i+1}-${j+1}`;
            svg.appendChild(text);

            // 状态指示灯
            const statusLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            statusLight.setAttribute('cx', x + rackWidth - 10);
            statusLight.setAttribute('cy', y + 10);
            statusLight.setAttribute('r', 5);
            // 随机状态
            const statuses = ['#10b981', '#f59e0b', '#ef4444'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            statusLight.setAttribute('fill', status);
            svg.appendChild(statusLight);
        }
    }

    // 绘制空调 - 右侧中间位置
    const acWidth = 60;
    const acHeight = 70; // 减少空调高度
    const acX = width - margin - acWidth - 15; // 右侧留出边距和间隙
    const acY = margin + (innerHeight - acHeight) / 2; // 垂直居中

    // 确保空调在机房内部
    if (acX >= margin && acY >= margin && acX + acWidth <= width - margin && acY + acHeight <= height - margin) {
        const ac = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ac.setAttribute('x', acX);
        ac.setAttribute('y', acY);
        ac.setAttribute('width', acWidth);
        ac.setAttribute('height', acHeight);
        ac.setAttribute('fill', '#bfdbfe');
        ac.setAttribute('stroke', '#3b82f6');
        ac.setAttribute('stroke-width', '1');
        svg.appendChild(ac);

        const acText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        acText.setAttribute('x', acX + acWidth / 2);
        acText.setAttribute('y', acY + acHeight / 2);
        acText.setAttribute('text-anchor', 'middle');
        acText.setAttribute('dominant-baseline', 'middle');
        acText.setAttribute('fill', '#333');
        acText.textContent = '空调';
        svg.appendChild(acText);
    }

    // 绘制UPS - 底部中间位置
    const upsWidth = 70; // 减少UPS宽度
    const upsHeight = 50; // 减少UPS高度
    const upsX = margin + (innerWidth - upsWidth) / 2; // 水平居中
    const upsY = height - margin - upsHeight - 15; // 底部留出边距和间隙

    // 确保UPS在机房内部
    if (upsX >= margin && upsY >= margin && upsX + upsWidth <= width - margin && upsY + upsHeight <= height - margin) {
        const ups = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ups.setAttribute('x', upsX);
        ups.setAttribute('y', upsY);
        ups.setAttribute('width', upsWidth);
        ups.setAttribute('height', upsHeight);
        ups.setAttribute('fill', '#d1fae5');
        ups.setAttribute('stroke', '#10b981');
        ups.setAttribute('stroke-width', '1');
        svg.appendChild(ups);

        const upsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        upsText.setAttribute('x', upsX + upsWidth / 2);
        upsText.setAttribute('y', upsY + upsHeight / 2);
        upsText.setAttribute('text-anchor', 'middle');
        upsText.setAttribute('dominant-baseline', 'middle');
        upsText.setAttribute('fill', '#333');
        upsText.textContent = 'UPS';
        svg.appendChild(upsText);
    }
}

/**
 * 初始化专线状态
 */
function initLineStatus() {
    // 设置专线状态颜色
    const lineStatuses = document.querySelectorAll('.line-status');
    lineStatuses.forEach(status => {
        if (status.classList.contains('online')) {
            status.style.backgroundColor = '#10b981';
        } else if (status.classList.contains('warning')) {
            status.style.backgroundColor = '#f59e0b';
        } else if (status.classList.contains('critical')) {
            status.style.backgroundColor = '#ef4444';
        }
    });

    // 设置统计值颜色
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(value => {
        if (value.classList.contains('online')) {
            value.style.color = '#10b981';
        } else if (value.classList.contains('warning')) {
            value.style.color = '#f59e0b';
        } else if (value.classList.contains('critical')) {
            value.style.color = '#ef4444';
        }
    });
}

/**
 * 初始化侧边栏交互
 */
function initSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log('初始化侧边栏，找到', sidebarItems.length, '个菜单项');

    sidebarItems.forEach((item, index) => {
        const itemText = item.querySelector('span')?.textContent;
        console.log(`菜单项 ${index + 1}: ${itemText}`);
        
        item.addEventListener('click', function() {
            const clickedItemText = this.querySelector('span').textContent;
            console.log('点击导航项:', clickedItemText);

            // 移除所有活跃状态
            sidebarItems.forEach(sidebarItem => {
                sidebarItem.classList.remove('active');
            });

            // 添加当前项的活跃状态
            this.classList.add('active');

            // 根据菜单项跳转到对应页面
            navigateToPage(clickedItemText);
        });
    });
    
    console.log('侧边栏初始化完成');
}

/**
 * 侧边栏导航功能
 */
function navigateToPage(menuItem) {
    const pageMap = {
        '总览': '总览.html',
        '视图': '视图.html',
        '告警中心': '告警中心.html',
        '设备管理': '设备管理.html',
        '网络拓扑': '网络拓扑.html',
        '统计报表': '统计报表.html',
        '运维工具': '运维工具.html',
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

    const targetPage = pageMap[menuItem];
    if (targetPage) {
        // 获取当前页面名称
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // 如果是当前页面，不进行跳转
        if (targetPage === currentPage) {
            console.log('当前已在页面:', currentPage);
            return;
        }

        console.log('跳转到页面:', targetPage);
        
        // 尝试跳转，如果页面不存在则提示
        try {
            window.location.href = targetPage;
        } catch (error) {
            console.error('页面跳转失败:', error);
            alert('页面跳转失败，请检查页面是否存在');
        }
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}

// ==================== 网络拓扑图相关函数 ====================

// 网络设备数据
const networkDevices = [
    // 核心层
    { id: 'core-router-1', name: '核心路由器-1', type: 'core-router', x: 400, y: 100, status: 'online', ip: '192.168.1.1' },
    { id: 'core-router-2', name: '核心路由器-2', type: 'core-router', x: 600, y: 100, status: 'online', ip: '192.168.1.2' },
    
    // 汇聚层
    { id: 'agg-switch-1', name: '汇聚交换机-1', type: 'access-switch', x: 300, y: 250, status: 'online', ip: '192.168.2.1' },
    { id: 'agg-switch-2', name: '汇聚交换机-2', type: 'access-switch', x: 500, y: 250, status: 'warning', ip: '192.168.2.2' },
    { id: 'agg-switch-3', name: '汇聚交换机-3', type: 'access-switch', x: 700, y: 250, status: 'online', ip: '192.168.2.3' },
    
    // 防火墙
    { id: 'firewall-1', name: '防火墙-1', type: 'firewall', x: 500, y: 180, status: 'online', ip: '192.168.1.10' },
    
    // 接入层
    { id: 'access-switch-1', name: '接入交换机-1', type: 'access-switch', x: 200, y: 400, status: 'online', ip: '192.168.3.1' },
    { id: 'access-switch-2', name: '接入交换机-2', type: 'access-switch', x: 350, y: 400, status: 'online', ip: '192.168.3.2' },
    { id: 'access-switch-3', name: '接入交换机-3', type: 'access-switch', x: 500, y: 400, status: 'offline', ip: '192.168.3.3' },
    { id: 'access-switch-4', name: '接入交换机-4', type: 'access-switch', x: 650, y: 400, status: 'online', ip: '192.168.3.4' },
    { id: 'access-switch-5', name: '接入交换机-5', type: 'access-switch', x: 800, y: 400, status: 'online', ip: '192.168.3.5' },
    
    // 服务器
    { id: 'server-1', name: 'Web服务器-1', type: 'server', x: 150, y: 520, status: 'online', ip: '192.168.4.10' },
    { id: 'server-2', name: 'Web服务器-2', type: 'server', x: 250, y: 520, status: 'online', ip: '192.168.4.11' },
    { id: 'server-3', name: '数据库服务器', type: 'server', x: 350, y: 520, status: 'warning', ip: '192.168.4.20' },
    { id: 'server-4', name: '应用服务器-1', type: 'server', x: 450, y: 520, status: 'online', ip: '192.168.4.30' },
    { id: 'server-5', name: '应用服务器-2', type: 'server', x: 550, y: 520, status: 'offline', ip: '192.168.4.31' },
    { id: 'server-6', name: '文件服务器', type: 'server', x: 650, y: 520, status: 'online', ip: '192.168.4.40' },
    { id: 'server-7', name: '备份服务器', type: 'server', x: 750, y: 520, status: 'online', ip: '192.168.4.50' },
    { id: 'server-8', name: '监控服务器', type: 'server', x: 850, y: 520, status: 'online', ip: '192.168.4.60' }
];

// 网络连接数据
const networkConnections = [
    // 核心层互联
    { from: 'core-router-1', to: 'core-router-2', status: 'active', bandwidth: '10Gbps' },
    
    // 核心层到汇聚层
    { from: 'core-router-1', to: 'agg-switch-1', status: 'active', bandwidth: '1Gbps' },
    { from: 'core-router-1', to: 'agg-switch-2', status: 'active', bandwidth: '1Gbps' },
    { from: 'core-router-2', to: 'agg-switch-2', status: 'active', bandwidth: '1Gbps' },
    { from: 'core-router-2', to: 'agg-switch-3', status: 'active', bandwidth: '1Gbps' },
    
    // 防火墙连接
    { from: 'core-router-1', to: 'firewall-1', status: 'active', bandwidth: '1Gbps' },
    { from: 'core-router-2', to: 'firewall-1', status: 'active', bandwidth: '1Gbps' },
    
    // 汇聚层到接入层
    { from: 'agg-switch-1', to: 'access-switch-1', status: 'active', bandwidth: '100Mbps' },
    { from: 'agg-switch-1', to: 'access-switch-2', status: 'active', bandwidth: '100Mbps' },
    { from: 'agg-switch-2', to: 'access-switch-2', status: 'active', bandwidth: '100Mbps' },
    { from: 'agg-switch-2', to: 'access-switch-3', status: 'inactive', bandwidth: '100Mbps' },
    { from: 'agg-switch-2', to: 'access-switch-4', status: 'active', bandwidth: '100Mbps' },
    { from: 'agg-switch-3', to: 'access-switch-4', status: 'active', bandwidth: '100Mbps' },
    { from: 'agg-switch-3', to: 'access-switch-5', status: 'active', bandwidth: '100Mbps' },
    
    // 接入层到服务器
    { from: 'access-switch-1', to: 'server-1', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-1', to: 'server-2', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-2', to: 'server-3', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-2', to: 'server-4', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-3', to: 'server-5', status: 'inactive', bandwidth: '100Mbps' },
    { from: 'access-switch-4', to: 'server-6', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-5', to: 'server-7', status: 'active', bandwidth: '100Mbps' },
    { from: 'access-switch-5', to: 'server-8', status: 'active', bandwidth: '100Mbps' }
];

// 初始化网络拓扑图
function initNetworkTopology() {
    const svg = d3.select('#topologyDiagram');
    const width = 1000;
    const height = 600;
    
    // 清空现有内容
    svg.selectAll('*').remove();
    
    // 设置SVG尺寸
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // 创建缩放行为
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            container.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // 创建主容器
    const container = svg.append('g').attr('class', 'topology-container');
    
    // 绘制连接线
    const connections = container.append('g').attr('class', 'connections');
    
    networkConnections.forEach(connection => {
        const fromDevice = networkDevices.find(d => d.id === connection.from);
        const toDevice = networkDevices.find(d => d.id === connection.to);
        
        if (fromDevice && toDevice) {
            connections.append('line')
                .attr('x1', fromDevice.x)
                .attr('y1', fromDevice.y)
                .attr('x2', toDevice.x)
                .attr('y2', toDevice.y)
                .attr('class', `connection-line ${connection.status}`)
                .attr('stroke-width', connection.bandwidth === '10Gbps' ? 4 : 2);
        }
    });
    
    // 绘制设备
    const devices = container.append('g').attr('class', 'devices');
    
    networkDevices.forEach(device => {
        const deviceGroup = devices.append('g')
            .attr('class', `network-device device-${device.type}`)
            .attr('transform', `translate(${device.x}, ${device.y})`)
            .on('click', () => showDeviceInfo(device))
            .on('mouseover', function() {
                d3.select(this).classed('selected', true);
                highlightConnections(device.id);
            })
            .on('mouseout', function() {
                d3.select(this).classed('selected', false);
                clearHighlights();
            });
        
        // 绘制设备图标
        drawDeviceIcon(deviceGroup, device);
        
        // 设备标签
        deviceGroup.append('text')
            .attr('class', 'device-label')
            .attr('y', 35)
            .text(device.name);
        
        // 状态指示器
        deviceGroup.append('circle')
            .attr('class', `status-indicator status-${device.status}`)
            .attr('cx', 15)
            .attr('cy', -15)
            .attr('r', 4);
    });
    
    // 存储缩放对象供外部使用
    window.topologyZoom = zoom;
    window.topologySvg = svg;
}

// 绘制设备图标
function drawDeviceIcon(group, device) {
    const iconSize = 30;
    const colors = {
        'core-router': '#3b82f6',
        'access-switch': '#10b981',
        'server': '#f59e0b',
        'firewall': '#ef4444'
    };
    
    switch (device.type) {
        case 'core-router':
            // 核心路由器 - 圆形
            group.append('circle')
                .attr('r', iconSize / 2)
                .attr('fill', colors[device.type])
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3);
            
            // 内部图标
            group.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text('R');
            break;
            
        case 'access-switch':
            // 交换机 - 矩形
            group.append('rect')
                .attr('x', -iconSize / 2)
                .attr('y', -iconSize / 2)
                .attr('width', iconSize)
                .attr('height', iconSize)
                .attr('fill', colors[device.type])
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3)
                .attr('rx', 4);
            
            // 内部图标
            group.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text('S');
            break;
            
        case 'server':
            // 服务器 - 矩形
            group.append('rect')
                .attr('x', -iconSize / 2)
                .attr('y', -iconSize / 2)
                .attr('width', iconSize)
                .attr('height', iconSize * 0.8)
                .attr('fill', colors[device.type])
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3)
                .attr('rx', 2);
            
            // 服务器指示线
            for (let i = 0; i < 3; i++) {
                group.append('line')
                    .attr('x1', -iconSize / 2 + 4)
                    .attr('x2', iconSize / 2 - 4)
                    .attr('y1', -iconSize / 2 + 6 + i * 6)
                    .attr('y2', -iconSize / 2 + 6 + i * 6)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1);
            }
            break;
            
        case 'firewall':
            // 防火墙 - 盾形
            const shieldPath = `M 0,-${iconSize/2} 
                               L ${iconSize/3},-${iconSize/3} 
                               L ${iconSize/3},${iconSize/4} 
                               L 0,${iconSize/2} 
                               L -${iconSize/3},${iconSize/4} 
                               L -${iconSize/3},-${iconSize/3} Z`;
            
            group.append('path')
                .attr('d', shieldPath)
                .attr('fill', colors[device.type])
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3);
            
            // 内部图标
            group.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', 'white')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .text('FW');
            break;
    }
}

// 更新拓扑统计数据
function updateTopologyStats() {
    const coreDevices = networkDevices.filter(d => d.type === 'core-router').length;
    const accessDevices = networkDevices.filter(d => d.type === 'access-switch').length;
    const servers = networkDevices.filter(d => d.type === 'server').length;
    const connections = networkConnections.length;
    
    // 更新页面显示
    const coreElement = document.getElementById('coreDeviceCount');
    const accessElement = document.getElementById('accessDeviceCount');
    const serverElement = document.getElementById('serverCount');
    const connectionElement = document.getElementById('connectionCount');
    
    if (coreElement) coreElement.textContent = coreDevices;
    if (accessElement) accessElement.textContent = accessDevices;
    if (serverElement) serverElement.textContent = servers;
    if (connectionElement) connectionElement.textContent = connections;
    
    console.log(`拓扑统计更新: 核心设备${coreDevices}, 接入设备${accessDevices}, 服务器${servers}, 连接数${connections}`);
}

// 显示设备信息
function showDeviceInfo(device) {
    const info = `
        设备名称: ${device.name}
        设备类型: ${device.type}
        IP地址: ${device.ip}
        状态: ${device.status}
    `;
    alert(info);
}

// 高亮连接
function highlightConnections(deviceId) {
    const relatedConnections = networkConnections.filter(
        conn => conn.from === deviceId || conn.to === deviceId
    );
    
    d3.selectAll('.connection-line')
        .style('opacity', 0.3);
    
    relatedConnections.forEach(conn => {
        const selector = `.connection-line:nth-child(${networkConnections.indexOf(conn) + 1})`;
        d3.select(selector).style('opacity', 1);
    });
}

// 清除高亮
function clearHighlights() {
    d3.selectAll('.connection-line')
        .style('opacity', 1);
}

// 拓扑图控制函数
function zoomIn() {
    if (window.topologyZoom && window.topologySvg) {
        window.topologySvg.transition().call(
            window.topologyZoom.scaleBy, 1.5
        );
    }
}

function zoomOut() {
    if (window.topologyZoom && window.topologySvg) {
        window.topologySvg.transition().call(
            window.topologyZoom.scaleBy, 1 / 1.5
        );
    }
}

function resetView() {
    if (window.topologyZoom && window.topologySvg) {
        window.topologySvg.transition().call(
            window.topologyZoom.transform,
            d3.zoomIdentity
        );
    }
}

function toggleLayout() {
    // 重新初始化拓扑图（可以添加不同的布局算法）
    initNetworkTopology();
}

function exportTopology() {
    try {
        console.log('开始导出网络拓扑图...');
        
        const svgElement = document.getElementById('topologyDiagram');
        if (!svgElement) {
            alert('未找到拓扑图元素，请确保图表已加载');
            return;
        }
        
        // 克隆SVG元素以避免修改原始元素
        const svgClone = svgElement.cloneNode(true);
        
        // 设置SVG的尺寸和样式
        svgClone.setAttribute('width', '1000');
        svgClone.setAttribute('height', '600');
        svgClone.style.backgroundColor = 'white';
        
        // 添加内联样式到SVG
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = `
            .network-device { cursor: pointer; }
            .device-label { 
                font-family: 'Microsoft YaHei', Arial, sans-serif; 
                font-size: 12px; 
                font-weight: 600; 
                text-anchor: middle; 
                fill: #374151; 
            }
            .connection-line { stroke: #6b7280; stroke-width: 2; fill: none; }
            .connection-line.active { stroke: #10b981; stroke-width: 3; }
            .connection-line.inactive { stroke: #ef4444; stroke-width: 2; stroke-dasharray: 3,3; }
            .status-online { fill: #10b981; }
            .status-warning { fill: #f59e0b; }
            .status-offline { fill: #ef4444; }
        `;
        svgClone.insertBefore(styleElement, svgClone.firstChild);
        
        // 序列化SVG
        const serializer = new XMLSerializer();
        let svgData = serializer.serializeToString(svgClone);
        
        // 确保SVG有正确的命名空间
        if (!svgData.includes('xmlns="http://www.w3.org/2000/svg"')) {
            svgData = svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        // 创建Blob并下载
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = `network-topology-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log('网络拓扑图导出成功');
        
        // 可选：同时导出PNG格式
        exportTopologyAsPNG(svgData);
        
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败: ' + error.message);
    }
}

// 导出为PNG格式
function exportTopologyAsPNG(svgData) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // 设置画布尺寸
        canvas.width = 1000;
        canvas.height = 600;
        
        img.onload = function() {
            // 填充白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制SVG图像
            ctx.drawImage(img, 0, 0);
            
            // 创建下载链接
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `network-topology-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                console.log('PNG格式导出成功');
            }, 'image/png', 1.0);
        };
        
        img.onerror = function(error) {
            console.error('PNG导出失败:', error);
            // SVG导出已成功，PNG失败不影响主要功能
        };
        
        // 将SVG数据转换为Data URL
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        img.src = svgUrl;
        
    } catch (error) {
        console.error('PNG导出过程出错:', error);
        // 不显示错误给用户，因为SVG导出已成功
    }
}

// 导出网络设备清单
function exportDeviceList() {
    try {
        console.log('开始导出设备清单...');
        
        // 生成设备清单数据
        const deviceList = networkDevices.map((device, index) => {
            const typeNames = {
                'core-router': '核心路由器',
                'access-switch': '接入交换机',
                'server': '服务器',
                'firewall': '防火墙'
            };
            
            const statusNames = {
                'online': '在线',
                'warning': '警告',
                'offline': '离线'
            };
            
            return {
                序号: index + 1,
                设备名称: device.name,
                设备类型: typeNames[device.type] || device.type,
                IP地址: device.ip,
                状态: statusNames[device.status] || device.status,
                位置: `(${device.x}, ${device.y})`
            };
        });
        
        // 生成连接清单数据
        const connectionList = networkConnections.map((conn, index) => {
            const fromDevice = networkDevices.find(d => d.id === conn.from);
            const toDevice = networkDevices.find(d => d.id === conn.to);
            
            const statusNames = {
                'active': '活跃',
                'inactive': '故障'
            };
            
            return {
                序号: index + 1,
                源设备: fromDevice ? fromDevice.name : conn.from,
                目标设备: toDevice ? toDevice.name : conn.to,
                带宽: conn.bandwidth,
                状态: statusNames[conn.status] || conn.status
            };
        });
        
        // 生成CSV内容
        let csvContent = '网络设备清单\n';
        csvContent += '序号,设备名称,设备类型,IP地址,状态,位置\n';
        
        deviceList.forEach(device => {
            csvContent += `${device.序号},${device.设备名称},${device.设备类型},${device.IP地址},${device.状态},${device.位置}\n`;
        });
        
        csvContent += '\n网络连接清单\n';
        csvContent += '序号,源设备,目标设备,带宽,状态\n';
        
        connectionList.forEach(conn => {
            csvContent += `${conn.序号},${conn.源设备},${conn.目标设备},${conn.带宽},${conn.状态}\n`;
        });
        
        // 添加统计信息
        csvContent += '\n网络统计信息\n';
        csvContent += `核心设备数量,${networkDevices.filter(d => d.type === 'core-router').length}\n`;
        csvContent += `接入设备数量,${networkDevices.filter(d => d.type === 'access-switch').length}\n`;
        csvContent += `服务器数量,${networkDevices.filter(d => d.type === 'server').length}\n`;
        csvContent += `防火墙数量,${networkDevices.filter(d => d.type === 'firewall').length}\n`;
        csvContent += `总连接数,${networkConnections.length}\n`;
        csvContent += `活跃连接,${networkConnections.filter(c => c.status === 'active').length}\n`;
        csvContent += `故障连接,${networkConnections.filter(c => c.status === 'inactive').length}\n`;
        
        // 创建并下载CSV文件
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `network-device-list-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log('设备清单导出成功');
        
    } catch (error) {
        console.error('设备清单导出失败:', error);
        alert('设备清单导出失败: ' + error.message);
    }
}

// 切换导出菜单显示
function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// 点击其他地方关闭导出菜单
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.export-dropdown');
    const menu = document.getElementById('exportMenu');
    
    if (dropdown && menu && !dropdown.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// 导出网络报告 (HTML格式)
function exportNetworkReport() {
    try {
        console.log('开始生成网络报告...');
        
        // 关闭下拉菜单
        const menu = document.getElementById('exportMenu');
        if (menu) menu.classList.remove('show');
        
        // 统计数据
        const stats = {
            totalDevices: networkDevices.length,
            coreRouters: networkDevices.filter(d => d.type === 'core-router').length,
            accessSwitches: networkDevices.filter(d => d.type === 'access-switch').length,
            servers: networkDevices.filter(d => d.type === 'server').length,
            firewalls: networkDevices.filter(d => d.type === 'firewall').length,
            totalConnections: networkConnections.length,
            activeConnections: networkConnections.filter(c => c.status === 'active').length,
            inactiveConnections: networkConnections.filter(c => c.status === 'inactive').length,
            onlineDevices: networkDevices.filter(d => d.status === 'online').length,
            warningDevices: networkDevices.filter(d => d.status === 'warning').length,
            offlineDevices: networkDevices.filter(d => d.status === 'offline').length
        };
        
        // 生成HTML报告
        const reportHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网络拓扑报告 - ${new Date().toLocaleDateString()}</title>
    <style>
        body { 
            font-family: 'Microsoft YaHei', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc; 
            color: #374151;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            border: 1px solid #e5e7eb;
        }
        .stat-value { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .stat-label { 
            color: #6b7280; 
            font-size: 14px; 
        }
        .device-table, .connection-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        .device-table th, .device-table td,
        .connection-table th, .connection-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
        }
        .device-table th, .connection-table th { 
            background: #f3f4f6; 
            font-weight: 600; 
        }
        .status-online { color: #10b981; font-weight: 600; }
        .status-warning { color: #f59e0b; font-weight: 600; }
        .status-offline { color: #ef4444; font-weight: 600; }
        .status-active { color: #10b981; font-weight: 600; }
        .status-inactive { color: #ef4444; font-weight: 600; }
        .footer { 
            background: #f3f4f6; 
            padding: 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 网络拓扑报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 网络概览</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalDevices}</div>
                        <div class="stat-label">总设备数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalConnections}</div>
                        <div class="stat-label">总连接数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.onlineDevices}</div>
                        <div class="stat-label">在线设备</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.activeConnections}</div>
                        <div class="stat-label">活跃连接</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🏗️ 设备分布</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" style="color: #3b82f6;">${stats.coreRouters}</div>
                        <div class="stat-label">核心路由器</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: #10b981;">${stats.accessSwitches}</div>
                        <div class="stat-label">接入交换机</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: #f59e0b;">${stats.servers}</div>
                        <div class="stat-label">服务器</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: #ef4444;">${stats.firewalls}</div>
                        <div class="stat-label">防火墙</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 设备清单</h2>
                <table class="device-table">
                    <thead>
                        <tr>
                            <th>设备名称</th>
                            <th>设备类型</th>
                            <th>IP地址</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${networkDevices.map(device => {
                            const typeNames = {
                                'core-router': '核心路由器',
                                'access-switch': '接入交换机',
                                'server': '服务器',
                                'firewall': '防火墙'
                            };
                            const statusNames = {
                                'online': '在线',
                                'warning': '警告',
                                'offline': '离线'
                            };
                            return `
                                <tr>
                                    <td>${device.name}</td>
                                    <td>${typeNames[device.type] || device.type}</td>
                                    <td>${device.ip}</td>
                                    <td class="status-${device.status}">${statusNames[device.status] || device.status}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>🔗 连接清单</h2>
                <table class="connection-table">
                    <thead>
                        <tr>
                            <th>源设备</th>
                            <th>目标设备</th>
                            <th>带宽</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${networkConnections.map(conn => {
                            const fromDevice = networkDevices.find(d => d.id === conn.from);
                            const toDevice = networkDevices.find(d => d.id === conn.to);
                            const statusNames = {
                                'active': '活跃',
                                'inactive': '故障'
                            };
                            return `
                                <tr>
                                    <td>${fromDevice ? fromDevice.name : conn.from}</td>
                                    <td>${toDevice ? toDevice.name : conn.to}</td>
                                    <td>${conn.bandwidth}</td>
                                    <td class="status-${conn.status}">${statusNames[conn.status] || conn.status}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>⚠️ 状态分析</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value status-online">${stats.onlineDevices}</div>
                        <div class="stat-label">在线设备</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value status-warning">${stats.warningDevices}</div>
                        <div class="stat-label">警告设备</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value status-offline">${stats.offlineDevices}</div>
                        <div class="stat-label">离线设备</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value status-inactive">${stats.inactiveConnections}</div>
                        <div class="stat-label">故障连接</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>此报告由网络拓扑管理系统自动生成 | 生成时间: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
        
        // 创建并下载HTML文件
        const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `network-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log('网络报告导出成功');
        
    } catch (error) {
        console.error('网络报告导出失败:', error);
        alert('网络报告导出失败: ' + error.message);
    }
}

// ==================== 视图管理功能 ====================

// 获取当前活跃的视图
function getCurrentView() {
    const activeTab = document.querySelector('.tab-btn.active');
    return activeTab ? activeTab.getAttribute('data-view') : 'dashboard';
}

// 导出当前视图
function exportCurrentView() {
    try {
        const currentView = getCurrentView();
        console.log('导出视图:', currentView);
        
        // 获取当前视图的状态
        const viewState = {
            view: currentView,
            timestamp: new Date().toISOString(),
            settings: getCurrentViewSettings(),
            data: getCurrentViewData()
        };
        
        // 保存到localStorage（作为导出的本地副本）
        const exportedViews = JSON.parse(localStorage.getItem('exportedViews') || '[]');
        const viewName = `${getViewDisplayName(currentView)}_${new Date().toLocaleString()}`;
        
        exportedViews.push({
            id: Date.now().toString(),
            name: viewName,
            state: viewState
        });
        
        // 限制导出视图数量
        if (exportedViews.length > 10) {
            exportedViews.shift();
        }
        
        localStorage.setItem('exportedViews', JSON.stringify(exportedViews));
        
        // 同时生成可下载的配置文件
        const exportData = {
            exportInfo: {
                exportTime: new Date().toISOString(),
                exportBy: '人工智能运维平台',
                version: '1.0'
            },
            viewConfig: viewState
        };
        
        // 创建下载链接
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `view-config-${currentView}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // 显示成功提示
        showToast('视图导出成功！配置文件已下载');
        
        console.log('视图导出成功:', viewName);
        
    } catch (error) {
        console.error('导出视图失败:', error);
        alert('导出视图失败: ' + error.message);
    }
}

// 获取视图显示名称
function getViewDisplayName(viewType) {
    const names = {
        'dashboard': '仪表盘视图',
        'route': '链路航线图',
        'visio': 'Visio视图',
        'room': '机房仪表盘',
        'line': '专线大屏'
    };
    return names[viewType] || viewType;
}

// 获取当前视图设置
function getCurrentViewSettings() {
    try {
        const settings = {
            autoRefresh: document.getElementById('autoRefresh')?.checked ?? true,
            showGrid: document.getElementById('showGrid')?.checked ?? true,
            theme: document.getElementById('themeSelect')?.value || 'light',
            refreshInterval: document.getElementById('refreshInterval')?.value || '30'
        };
        
        console.log('获取当前设置:', settings);
        return settings;
        
    } catch (error) {
        console.error('获取设置失败:', error);
        return {
            autoRefresh: true,
            showGrid: true,
            theme: 'light',
            refreshInterval: '30'
        };
    }
}

// 获取当前视图数据
function getCurrentViewData() {
    const currentView = getCurrentView();
    const data = {};
    
    switch (currentView) {
        case 'dashboard':
            data.activeDevices = window.activeDevicesData || [];
            break;
        case 'route':
            data.connections = window.connectionData || [];
            break;
        case 'visio':
            data.networkDevices = window.networkDevices || [];
            data.networkConnections = window.networkConnections || [];
            break;
        case 'room':
            data.roomData = window.roomData || {};
            break;
        case 'line':
            data.lineData = window.lineData || {};
            break;
    }
    
    return data;
}

// 共享当前视图
function shareCurrentView() {
    try {
        const currentView = getCurrentView();
        console.log('共享视图:', currentView);
        
        // 生成分享链接
        const shareId = generateShareId();
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?shared=${shareId}&view=${currentView}`;
        
        // 更新分享链接输入框
        document.getElementById('shareLink').value = shareUrl;
        
        // 显示共享模态框
        showModal('shareViewModal');
        
        console.log('生成分享链接:', shareUrl);
        
    } catch (error) {
        console.error('共享视图失败:', error);
        alert('共享视图失败: ' + error.message);
    }
}

// 生成分享ID
function generateShareId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 打开视图设置
function openViewSettings() {
    try {
        console.log('打开视图设置');
        
        // 加载当前设置
        loadCurrentSettings();
        
        // 显示设置模态框
        showModal('viewSettingsModal');
        
    } catch (error) {
        console.error('打开视图设置失败:', error);
        alert('打开视图设置失败: ' + error.message);
    }
}

// 加载当前设置
function loadCurrentSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
        console.log('正在加载设置到界面:', settings);
        
        // 设置复选框
        const autoRefreshEl = document.getElementById('autoRefresh');
        if (autoRefreshEl && settings.autoRefresh !== undefined) {
            autoRefreshEl.checked = settings.autoRefresh;
            console.log('设置自动刷新:', settings.autoRefresh);
        }
        
        const showGridEl = document.getElementById('showGrid');
        if (showGridEl && settings.showGrid !== undefined) {
            showGridEl.checked = settings.showGrid;
            console.log('设置显示网格:', settings.showGrid);
        }
        
        // 设置下拉框
        const themeSelectEl = document.getElementById('themeSelect');
        if (themeSelectEl && settings.theme) {
            themeSelectEl.value = settings.theme;
            console.log('设置主题:', settings.theme);
        }
        
        const refreshIntervalEl = document.getElementById('refreshInterval');
        if (refreshIntervalEl && settings.refreshInterval) {
            refreshIntervalEl.value = settings.refreshInterval;
            console.log('设置刷新间隔:', settings.refreshInterval);
        }
        
        console.log('设置加载完成');
        
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 保存视图设置
function saveViewSettings() {
    try {
        const settings = getCurrentViewSettings();
        
        // 保存到localStorage
        localStorage.setItem('viewSettings', JSON.stringify(settings));
        
        // 应用设置
        applyViewSettings(settings);
        
        // 关闭模态框
        closeViewSettings();
        
        // 显示成功提示
        showToast('设置保存成功！');
        
        console.log('视图设置已保存:', settings);
        
    } catch (error) {
        console.error('保存设置失败:', error);
        alert('保存设置失败: ' + error.message);
    }
}

// 应用视图设置
function applyViewSettings(settings) {
    console.log('开始应用视图设置:', settings);
    
    // 应用主题
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
        console.log('已应用深色主题');
    } else {
        document.body.classList.remove('dark-theme');
        console.log('已应用浅色主题');
    }
    
    
    // 应用网格线设置
    applyGridSettings(settings.showGrid);
    
    // 应用刷新间隔
    if (settings.autoRefresh) {
        setupAutoRefresh(parseInt(settings.refreshInterval) * 1000);
    } else {
        // 如果关闭自动刷新，清除定时器
        if (window.autoRefreshTimer) {
            clearInterval(window.autoRefreshTimer);
            window.autoRefreshTimer = null;
        }
    }
    
    console.log('视图设置已应用完成');
}


// 应用网格线设置
function applyGridSettings(showGrid) {
    console.log('应用网格线设置:', showGrid);
    
    try {
        // 获取所有Chart.js实例
        const charts = [];
        
        // 收集所有图表实例
        if (window.systemOverviewChart) charts.push(window.systemOverviewChart);
        if (window.resourceUsageChart) charts.push(window.resourceUsageChart);
        if (window.temperatureChart) charts.push(window.temperatureChart);
        if (window.humidityChart) charts.push(window.humidityChart);
        if (window.lineTrafficChart) charts.push(window.lineTrafficChart);
        
        // 应用网格线设置到所有图表
        charts.forEach((chart, index) => {
            if (chart && chart.options) {
                // 更新图表配置
                if (chart.options.scales) {
                    // 处理不同类型的坐标轴
                    Object.keys(chart.options.scales).forEach(scaleKey => {
                        const scale = chart.options.scales[scaleKey];
                        if (scale && scale.grid) {
                            scale.grid.display = showGrid;
                        } else if (scale) {
                            // 如果没有grid配置，创建一个
                            scale.grid = { display: showGrid };
                        }
                    });
                    
                    // 更新图表
                    chart.update('none'); // 使用'none'模式避免动画
                    console.log(`图表 ${index + 1} 网格线设置已更新:`, showGrid);
                }
            }
        });
        
        // 如果没有找到图表实例，尝试重新初始化
        if (charts.length === 0) {
            console.log('没有找到图表实例，将在下次图表初始化时应用设置');
            // 保存设置供图表初始化时使用
            window.pendingGridSetting = showGrid;
        }
        
        console.log(`网格线设置应用完成，影响了 ${charts.length} 个图表`);
        
    } catch (error) {
        console.error('应用网格线设置失败:', error);
    }
}


// 设置自动刷新
function setupAutoRefresh(interval) {
    // 清除现有定时器
    if (window.autoRefreshTimer) {
        clearInterval(window.autoRefreshTimer);
    }
    
    // 设置新定时器
    window.autoRefreshTimer = setInterval(() => {
        refreshCurrentView();
    }, interval);
}

// 刷新当前视图
function refreshCurrentView() {
    const currentView = getCurrentView();
    console.log('自动刷新视图:', currentView);
    
    switch (currentView) {
        case 'dashboard':
            if (typeof loadActiveDevices === 'function') loadActiveDevices();
            break;
        case 'route':
            if (typeof updateRouteStats === 'function') updateRouteStats();
            break;
        case 'visio':
            if (typeof updateTopologyStats === 'function') updateTopologyStats();
            break;
        case 'room':
            // 刷新机房数据
            break;
        case 'line':
            // 刷新专线数据
            break;
    }
}

// ==================== 模态框控制 ====================

// 显示模态框
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// 隐藏模态框
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 关闭视图设置
function closeViewSettings() {
    hideModal('viewSettingsModal');
}

// 关闭共享视图
function closeShareView() {
    hideModal('shareViewModal');
}

// ==================== 共享功能 ====================

// 复制分享链接
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        shareLink.select();
        shareLink.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showToast('链接已复制到剪贴板！');
        } catch (err) {
            // 使用现代API
            navigator.clipboard.writeText(shareLink.value).then(() => {
                showToast('链接已复制到剪贴板！');
            }).catch(() => {
                alert('复制失败，请手动复制链接');
            });
        }
    }
}

// 生成新的分享链接
function generateShareLink() {
    try {
        const currentView = getCurrentView();
        const settings = {
            auth: document.getElementById('shareWithAuth').checked,
            readOnly: document.getElementById('shareReadOnly').checked,
            expiry: document.getElementById('shareExpiry').value
        };
        
        // 生成新的分享ID
        const shareId = generateShareId();
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?shared=${shareId}&view=${currentView}`;
        
        // 保存分享配置
        const shareConfig = {
            id: shareId,
            view: currentView,
            settings: settings,
            created: new Date().toISOString(),
            viewState: getCurrentViewData()
        };
        
        const sharedViews = JSON.parse(localStorage.getItem('sharedViews') || '[]');
        sharedViews.push(shareConfig);
        localStorage.setItem('sharedViews', JSON.stringify(sharedViews));
        
        // 更新链接
        document.getElementById('shareLink').value = shareUrl;
        
        showToast('新的分享链接已生成！');
        
    } catch (error) {
        console.error('生成分享链接失败:', error);
        alert('生成分享链接失败: ' + error.message);
    }
}

// 邮件分享
function shareToEmail() {
    const shareLink = document.getElementById('shareLink').value;
    if (!shareLink) {
        showToast('请先生成分享链接！');
        return;
    }
    
    const currentView = getCurrentView();
    const viewName = getViewDisplayName(currentView);
    
    const subject = encodeURIComponent(`网络监控视图分享 - ${viewName}`);
    const body = encodeURIComponent(`您好！

我想与您分享一个网络监控视图：${viewName}

分享链接：${shareLink}

请点击上方链接查看详细的网络监控数据。

此链接包含实时的网络状态信息，建议您及时查看。

---
发送时间：${new Date().toLocaleString()}
系统：人工智能运维平台`);
    
    try {
        window.open(`mailto:?subject=${subject}&body=${body}`);
        showToast('邮件客户端已打开，请发送邮件！');
        
        // 记录分享操作
        console.log('邮件分享:', { view: currentView, link: shareLink, time: new Date().toISOString() });
        
    } catch (error) {
        console.error('邮件分享失败:', error);
        alert('无法打开邮件客户端，请手动复制链接分享。');
    }
}

// ==================== 工具函数 ====================

// 显示提示消息
function showToast(message) {
    const toast = document.getElementById('exportSuccessToast');
    if (toast) {
        toast.querySelector('span').textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
});

// 按ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
});

// 初始化视图设置（在主DOMContentLoaded中调用）
function initializeViewSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
        console.log('加载保存的设置:', settings);
        
        if (Object.keys(settings).length > 0) {
            applyViewSettings(settings);
            console.log('已应用保存的设置');
        } else {
            console.log('没有保存的设置，使用默认设置');
        }
    } catch (error) {
        console.error('初始化视图设置失败:', error);
    }
}

// 调试视图设置功能
function debugViewSettings() {
    console.log('=== 视图设置调试信息 ===');
    
    // 检查localStorage中的设置
    const savedSettings = localStorage.getItem('viewSettings');
    console.log('localStorage中的设置:', savedSettings);
    
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            console.log('解析后的设置:', parsedSettings);
        } catch (error) {
            console.error('设置解析失败:', error);
        }
    }
    
    // 检查DOM元素是否存在
    const elements = {
        autoRefresh: document.getElementById('autoRefresh'),
        showGrid: document.getElementById('showGrid'),
        themeSelect: document.getElementById('themeSelect'),
        refreshInterval: document.getElementById('refreshInterval')
    };
    
    console.log('DOM元素检查:');
    for (const [key, element] of Object.entries(elements)) {
        if (element) {
            const value = element.type === 'checkbox' ? element.checked : element.value;
            console.log(`  ${key}: 存在, 当前值: ${value}`);
        } else {
            console.error(`  ${key}: 不存在!`);
        }
    }
    
    // 测试获取当前设置
    console.log('当前设置:', getCurrentViewSettings());
    
    return {
        savedSettings,
        elements,
        currentSettings: getCurrentViewSettings()
    };
}

// 将调试函数暴露到全局作用域
window.debugViewSettings = debugViewSettings;

// 测试网格线设置的快速函数
function testGridSettings(showGrid) {
    console.log('测试网格线设置:', showGrid);
    applyGridSettings(showGrid);
    
    // 同时更新localStorage中的设置
    const currentSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
    currentSettings.showGrid = showGrid;
    localStorage.setItem('viewSettings', JSON.stringify(currentSettings));
    
    // 更新界面中的复选框（如果存在）
    const gridCheckbox = document.getElementById('showGrid');
    if (gridCheckbox) {
        gridCheckbox.checked = showGrid;
    }
    
    console.log('网格线设置测试完成');
}


// 测试主题设置的快速函数
function testThemeSettings(theme) {
    console.log('测试主题设置:', theme);
    
    const settings = {
        theme: theme || 'light'
    };
    
    // 应用主题
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
        console.log('已应用深色主题');
    } else {
        document.body.classList.remove('dark-theme');
        console.log('已应用浅色主题');
    }
    
    // 同时更新localStorage中的设置
    const currentSettings = JSON.parse(localStorage.getItem('viewSettings') || '{}');
    currentSettings.theme = settings.theme;
    localStorage.setItem('viewSettings', JSON.stringify(currentSettings));
    
    // 更新界面中的选择框（如果存在）
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = settings.theme;
    }
    
    console.log('主题设置测试完成');
}

// 测试不同深色主题变体的函数
function testDarkThemeVariants(variant) {
    console.log('测试深色主题变体:', variant);
    
    // 先应用深色主题
    document.body.classList.add('dark-theme');
    
    // 根据变体调整CSS变量
    switch (variant) {
        case 'soft':
            // 柔和深色主题
            document.documentElement.style.setProperty('--bg-color', '#2d3748');
            document.documentElement.style.setProperty('--text-color', '#e2e8f0');
            document.documentElement.style.setProperty('--card-bg', '#4a5568');
            document.documentElement.style.setProperty('--border-color', '#718096');
            break;
        case 'medium':
            // 中等深色主题
            document.documentElement.style.setProperty('--bg-color', '#1a202c');
            document.documentElement.style.setProperty('--text-color', '#f7fafc');
            document.documentElement.style.setProperty('--card-bg', '#2d3748');
            document.documentElement.style.setProperty('--border-color', '#4a5568');
            break;
        case 'deep':
            // 深度深色主题（原来的）
            document.documentElement.style.setProperty('--bg-color', '#1f2937');
            document.documentElement.style.setProperty('--text-color', '#f9fafb');
            document.documentElement.style.setProperty('--card-bg', '#374151');
            document.documentElement.style.setProperty('--border-color', '#4b5563');
            break;
        case 'blue':
            // 蓝色调深色主题
            document.documentElement.style.setProperty('--bg-color', '#1e293b');
            document.documentElement.style.setProperty('--text-color', '#f1f5f9');
            document.documentElement.style.setProperty('--card-bg', '#334155');
            document.documentElement.style.setProperty('--border-color', '#64748b');
            break;
        default:
            // 默认使用柔和主题
            document.documentElement.style.setProperty('--bg-color', '#2d3748');
            document.documentElement.style.setProperty('--text-color', '#e2e8f0');
            document.documentElement.style.setProperty('--card-bg', '#4a5568');
            document.documentElement.style.setProperty('--border-color', '#718096');
    }
    
    console.log(`已应用深色主题变体: ${variant}`);
}

// 重置为浅色主题
function resetToLightTheme() {
    document.body.classList.remove('dark-theme');
    
    // 重置CSS变量为浅色主题
    document.documentElement.style.setProperty('--bg-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#374151');
    document.documentElement.style.setProperty('--card-bg', '#ffffff');
    document.documentElement.style.setProperty('--border-color', '#e5e7eb');
    
    console.log('已重置为浅色主题');
}


// 检查所有图表实例的函数
function checkAllCharts() {
    console.log('=== 检查所有图表实例 ===');
    
    const charts = {
        'systemOverviewChart': window.systemOverviewChart,
        'resourceUsageChart': window.resourceUsageChart,
        'temperatureChart': window.temperatureChart,
        'humidityChart': window.humidityChart,
        'lineTrafficChart': window.lineTrafficChart
    };
    
    let foundCharts = 0;
    for (const [name, chart] of Object.entries(charts)) {
        if (chart) {
            console.log(`✅ ${name}: 存在`);
            foundCharts++;
            
            // 检查网格线配置
            if (chart.options && chart.options.scales) {
                const scales = chart.options.scales;
                console.log(`   坐标轴配置:`, Object.keys(scales));
                
                Object.keys(scales).forEach(scaleKey => {
                    const scale = scales[scaleKey];
                    if (scale && scale.grid) {
                        console.log(`   ${scaleKey}轴网格线: ${scale.grid.display}`);
                    }
                });
            }
        } else {
            console.log(`❌ ${name}: 不存在`);
        }
    }
    
    console.log(`总共找到 ${foundCharts}/5 个图表实例`);
    return { charts, foundCharts };
}

// 强制刷新所有图表网格线的函数
function forceRefreshAllCharts(showGrid) {
    console.log('强制刷新所有图表网格线:', showGrid);
    
    const charts = [
        window.systemOverviewChart,
        window.resourceUsageChart,
        window.temperatureChart,
        window.humidityChart,
        window.lineTrafficChart
    ];
    
    let updatedCount = 0;
    charts.forEach((chart, index) => {
        if (chart && chart.options && chart.options.scales) {
            Object.keys(chart.options.scales).forEach(scaleKey => {
                const scale = chart.options.scales[scaleKey];
                if (scale) {
                    if (!scale.grid) {
                        scale.grid = {};
                    }
                    scale.grid.display = showGrid;
                }
            });
            
            chart.update('none');
            updatedCount++;
            console.log(`已更新图表 ${index + 1} 的网格线设置`);
        }
    });
    
    console.log(`共更新了 ${updatedCount} 个图表的网格线设置`);
}

// 测试侧边栏导航的函数
function testSidebarNavigation() {
    console.log('=== 测试侧边栏导航 ===');
    
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log('找到侧边栏项目数量:', sidebarItems.length);
    
    sidebarItems.forEach((item, index) => {
        const span = item.querySelector('span');
        const text = span ? span.textContent : '无文本';
        const hasClickListener = item.onclick !== null || item.addEventListener;
        
        console.log(`${index + 1}. ${text} - 点击事件: ${hasClickListener ? '已绑定' : '未绑定'}`);
    });
    
    // 测试点击第一个非视图项目
    const nonViewItems = Array.from(sidebarItems).filter(item => {
        const text = item.querySelector('span')?.textContent;
        return text && text !== '视图';
    });
    
    if (nonViewItems.length > 0) {
        const testItem = nonViewItems[0];
        const testText = testItem.querySelector('span').textContent;
        console.log('测试点击:', testText);
        
        // 模拟点击
        testItem.click();
    }
}

// 手动触发导航的函数
function manualNavigate(pageName) {
    console.log('手动导航到:', pageName);
    navigateToPage(pageName);
}

// 测试侧边栏样式的函数
function testSidebarStyles() {
    console.log('=== 测试侧边栏样式 ===');
    
    const activeItem = document.querySelector('.sidebar-item.active');
    if (activeItem) {
        const styles = window.getComputedStyle(activeItem);
        const backgroundColor = styles.backgroundColor;
        const fontWeight = styles.fontWeight;
        
        console.log('活跃项背景色:', backgroundColor);
        console.log('活跃项字体粗细:', fontWeight);
        
        // 检查是否是期望的深色背景
        const isCorrectColor = backgroundColor === 'rgb(30, 41, 59)' || backgroundColor === '#1e293b';
        console.log('背景色是否正确:', isCorrectColor ? '✅ 正确（深色）' : '❌ 错误（可能是蓝色）');
        
        // 检查伪元素（蓝色指示条）
        const beforeStyles = window.getComputedStyle(activeItem, '::before');
        console.log('左侧指示条颜色:', beforeStyles.backgroundColor);
        
        return {
            backgroundColor,
            fontWeight,
            isCorrectColor
        };
    } else {
        console.log('❌ 未找到活跃的侧边栏项目');
        return null;
    }
}

// 强制设置正确的侧边栏样式
function fixSidebarStyles() {
    console.log('修复侧边栏样式...');
    
    const activeItems = document.querySelectorAll('.sidebar-item.active');
    activeItems.forEach(item => {
        // 强制设置正确的背景色
        item.style.backgroundColor = '#1e293b';
        item.style.fontWeight = 'bold';
        item.style.color = 'white';
        
        console.log('已修复侧边栏项目样式');
    });
}

// ================================================
// 视图设备统计数据加载
// ================================================

/**
 * 加载视图设备统计数据（用于视图页面的卡片）
 */
async function loadViewDeviceStatistics() {
    try {
        console.log('开始加载视图设备统计数据...');
        const response = await fetch('/api/view/statistics');
        const result = await response.json();
        
        if (result.success && result.data) {
            const stats = result.data;
            console.log('视图设备统计数据加载成功:', stats);
            updateViewStatisticsCards(stats);
            return stats;
        } else {
            console.warn('视图设备统计数据加载失败');
            return null;
        }
    } catch (error) {
        console.error('加载视图设备统计数据失败:', error);
        return null;
    }
}

/**
 * 更新视图统计卡片显示
 */
function updateViewStatisticsCards(stats) {
    // 这个函数需要根据实际的HTML结构来更新
    // 如果视图页面有对应的卡片元素，在这里更新它们的值
    console.log('更新视图统计卡片:', stats);
    
    // 示例：如果有对应的元素ID
    // document.getElementById('onlineDevicesCount').textContent = stats.onlineDevices;
    // document.getElementById('faultDevicesCount').textContent = stats.faultDevices;
    // document.getElementById('todayNewCount').textContent = stats.todayNewMonitorDevices;
    // document.getElementById('availableDevicesCount').textContent = stats.availableDevices;
}

/**
 * 加载视图设备类型分布（用于饼图）
 */
async function loadViewDeviceTypeDistribution() {
    try {
        console.log('开始加载视图设备类型分布...');
        const response = await fetch('/api/view/type-distribution');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('视图设备类型分布加载成功:', result.data);
            return result.data;
        } else {
            console.warn('视图设备类型分布加载失败');
            return null;
        }
    } catch (error) {
        console.error('加载视图设备类型分布失败:', error);
        return null;
    }
}

/**
 * 加载视图故障设备统计
 */
async function loadViewFaultStatistics() {
    try {
        console.log('开始加载视图故障设备统计...');
        const response = await fetch('/api/view/fault-statistics');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('视图故障设备统计加载成功:', result.data);
            return result.data;
        } else {
            console.warn('视图故障设备统计加载失败');
            return null;
        }
    } catch (error) {
        console.error('加载视图故障设备统计失败:', error);
        return null;
    }
}

// 暴露测试函数到全局作用域
window.testGridSettings = testGridSettings;
window.testThemeSettings = testThemeSettings;
window.testDarkThemeVariants = testDarkThemeVariants;
window.resetToLightTheme = resetToLightTheme;
window.checkAllCharts = checkAllCharts;
window.forceRefreshAllCharts = forceRefreshAllCharts;
window.testSidebarNavigation = testSidebarNavigation;
window.manualNavigate = manualNavigate;
window.testSidebarStyles = testSidebarStyles;
window.fixSidebarStyles = fixSidebarStyles;

// 暴露视图设备统计函数
window.loadViewDeviceStatistics = loadViewDeviceStatistics;
window.loadViewDeviceTypeDistribution = loadViewDeviceTypeDistribution;
window.loadViewFaultStatistics = loadViewFaultStatistics;