/**
 * 云平台管理系统 - 前端JavaScript
 */

// 当前选中的云平台和页面
let currentProvider = 'huawei';
let currentPage = 'overview';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('云平台管理系统初始化...');
    
    // 加载华为云概览数据
    loadOverviewData('huawei');
});

/**
 * 切换云服务商标签（新版导航）
 */
function switchProvider(provider) {
    console.log(`切换云服务商: ${provider}`);
    currentProvider = provider;
    
    // 更新标签样式
    document.querySelectorAll('.cloud-tab').forEach(tab => {
        tab.style.background = '#f5f5f5';
        tab.style.border = '1px solid #d9d9d9';
    });
    
    const activeTab = document.getElementById('tab-' + provider);
    if (activeTab) {
        activeTab.style.background = '#e6f7ff';
        activeTab.style.border = '1px solid #1890ff';
    }
    
    // 切换到当前页面
    switchSubPage(currentPage);
}

/**
 * 切换子页面（新版导航）
 */
function switchSubPage(page) {
    console.log(`切换子页面: ${currentProvider} - ${page}`);
    currentPage = page;
    
    // 更新按钮样式
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.style.background = 'white';
        btn.style.color = '#333';
        btn.style.border = '1px solid #d9d9d9';
    });
    
    const activeBtn = document.getElementById('btn-' + page);
    if (activeBtn) {
        activeBtn.style.background = '#1890ff';
        activeBtn.style.color = 'white';
        activeBtn.style.border = 'none';
    }
    
    // 隐藏所有页面
    document.querySelectorAll('.content-page').forEach(el => {
        el.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`${currentProvider}-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新面包屑
    const providerName = currentProvider === 'huawei' ? '华为云' : '阿里云';
    const pageNames = {
        'overview': '概览',
        'vm': '虚拟机',
        'host': '云主机',
        'storage': '云存储',
        'monitor': '监控告警'
    };
    
    document.getElementById('breadcrumb').textContent = `云平台 / ${providerName} / ${pageNames[page]}`;
    
    // 加载对应页面的数据
    if (page === 'overview') {
        loadOverviewData(currentProvider);
    }
}

/**
 * 切换云平台提供商菜单（旧版兼容）
 */
function toggleProvider(provider) {
    const menu = document.getElementById(provider + '-menu');
    const arrow = document.getElementById(provider + '-arrow');
    
    if (menu) menu.classList.toggle('active');
    if (arrow) {
        arrow.classList.toggle('fa-chevron-down');
        arrow.classList.toggle('fa-chevron-up');
    }
}

/**
 * 切换页面（旧版兼容）
 */
function switchPage(provider, page) {
    currentProvider = provider;
    switchSubPage(page);
}

/**
 * 加载概览数据
 */
async function loadOverviewData(provider) {
    console.log(`加载${provider}概览数据...`);
    
    try {
        // 获取统计数据
        const stats = await fetchProviderStats(provider);
        updateStatsCards(provider, stats);
        
        // 加载资源使用图表
        loadResourceChart(provider);
        
        // 加载告警列表
        loadAlertList(provider);
        
    } catch (error) {
        console.error('加载概览数据失败:', error);
    }
}

/**
 * 获取云平台统计数据
 */
async function fetchProviderStats(provider) {
    try {
        // 调用后端API获取概览统计数据（注意：后端context-path是/api）
        const response = await fetch(`/api/cloud/overview/${provider}`);
        if (response.ok) {
            const data = await response.json();
            if (data.code === 200 && data.data) {
                console.log('从数据库获取云平台统计数据成功:', data.data);
                return data.data;
            }
        }
    } catch (error) {
        console.warn('API请求失败，使用模拟数据:', error);
    }
    
    // 返回模拟数据
    return getMockStats(provider);
}

/**
 * 获取模拟统计数据
 */
function getMockStats(provider) {
    if (provider === 'huawei') {
        return {
            totalInstances: 5,
            runningInstances: 4,
            stoppedInstances: 1,
            totalCpuCores: 20,
            totalMemoryGb: 38,
            totalStorageGb: 1800,
            totalCost: 1250
        };
    } else {
        return {
            totalInstances: 6,
            runningInstances: 5,
            stoppedInstances: 1,
            totalCpuCores: 24,
            totalMemoryGb: 48,
            totalStorageGb: 3200,
            totalCost: 1680
        };
    }
}

/**
 * 更新统计卡片
 */
function updateStatsCards(provider, stats) {
    const prefix = provider === 'huawei' ? 'hw' : 'ali';
    
    // 兼容后端返回的字段名（totalCount）和模拟数据的字段名（totalInstances）
    const totalInstances = stats.totalCount || stats.totalInstances || 0;
    const runningInstances = stats.runningCount || stats.runningInstances || 0;
    const totalCpu = stats.totalCpu || stats.totalCpuCores || 0;
    const totalMemory = stats.totalMemory || stats.totalMemoryGb || 0;
    const totalStorage = stats.totalStorage || stats.totalStorageGb || 0;
    
    document.getElementById(`${prefix}-total-instances`).textContent = totalInstances;
    document.getElementById(`${prefix}-running-instances`).textContent = runningInstances;
    document.getElementById(`${prefix}-total-cpu`).textContent = totalCpu;
    document.getElementById(`${prefix}-total-memory`).textContent = totalMemory;
    document.getElementById(`${prefix}-total-storage`).textContent = totalStorage;
}

/**
 * 加载资源使用图表
 */
function loadResourceChart(provider) {
    const chartDom = document.getElementById(provider === 'huawei' ? 'hwResourceChart' : 'aliResourceChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['CPU使用率', '内存使用率', '磁盘使用率']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: getRecentDates(7)
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 30, 70),
                itemStyle: {
                    color: '#667eea'
                }
            },
            {
                name: '内存使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 40, 80),
                itemStyle: {
                    color: '#f093fb'
                }
            },
            {
                name: '磁盘使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 20, 60),
                itemStyle: {
                    color: '#4facfe'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 加载告警列表
 */
async function loadAlertList(provider) {
    const providerId = provider === 'huawei' ? 1 : 2;
    const tableBody = document.querySelector(`#${provider === 'huawei' ? 'hw' : 'ali'}-alert-table tbody`);
    
    if (!tableBody) return;
    
    // 获取告警数据（这里使用模拟数据）
    const alerts = getMockAlerts(provider);
    
    // 渲染表格
    tableBody.innerHTML = alerts.map(alert => `
        <tr>
            <td>${alert.alertTime}</td>
            <td>${alert.resourceName}</td>
            <td>
                <span class="status-badge" style="background: ${getAlertLevelColor(alert.alertLevel)};">
                    ${alert.alertLevel}
                </span>
            </td>
            <td>${alert.alertMessage}</td>
            <td>
                <span class="status-badge ${alert.status === 'active' ? 'status-running' : 'status-stopped'}">
                    ${alert.status === 'active' ? '活跃' : '已解决'}
                </span>
            </td>
        </tr>
    `).join('');
}

/**
 * 获取模拟告警数据
 */
function getMockAlerts(provider) {
    if (provider === 'huawei') {
        return [
            {
                alertTime: '2025-11-23 22:30:00',
                resourceName: '数据库服务器',
                alertLevel: 'warning',
                alertMessage: '内存使用率持续5分钟超过85%',
                status: 'active'
            }
        ];
    } else {
        return [
            {
                alertTime: '2025-11-23 20:15:00',
                resourceName: 'MongoDB数据库',
                alertLevel: 'warning',
                alertMessage: '内存使用率持续5分钟超过85%',
                status: 'resolved'
            }
        ];
    }
}

/**
 * 获取告警级别颜色
 */
function getAlertLevelColor(level) {
    const colors = {
        'info': '#d1ecf1',
        'warning': '#fff3cd',
        'critical': '#f8d7da'
    };
    return colors[level] || '#e9ecef';
}

/**
 * 获取最近N天的日期
 */
function getRecentDates(days) {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    
    return dates;
}

/**
 * 生成随机数据
 */
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}
