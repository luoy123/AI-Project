// 大屏展示页面 JavaScript

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initTime();
    initCharts();
    loadData();
    initNavigation();
    initHeaderNav();
    initResponsive();
    initDeviceSearch(); // 初始化设备搜索功能

    // 定时刷新数据
    setInterval(loadData, 30000); // 30秒刷新一次
    setInterval(updateTime, 1000); // 每秒更新时间
});

// 初始化响应式功能
function initResponsive() {
    // 窗口大小变化时重新调整图表
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            resizeAllCharts();
        }, 200);
    });
    
    // 页面加载完成后延迟调用 resize，确保图表尺寸正确
    setTimeout(function() {
        resizeAllCharts();
    }, 100);
    
    // 再次延迟调用，处理某些浏览器渲染延迟的情况
    setTimeout(function() {
        resizeAllCharts();
    }, 500);
}

// 重新调整所有图表大小
function resizeAllCharts() {
    try {
        if (typeof deviceTypeChart !== 'undefined' && deviceTypeChart) deviceTypeChart.resize();
        if (typeof deviceUsageChart !== 'undefined' && deviceUsageChart) deviceUsageChart.resize();
        if (typeof alertRadarChart !== 'undefined' && alertRadarChart) alertRadarChart.resize();
        if (typeof trendChart !== 'undefined' && trendChart) trendChart.resize();
        // 告警监控页面图表
        if (typeof alertCategoryChart !== 'undefined' && alertCategoryChart) alertCategoryChart.resize();
        if (typeof alertTrendChart !== 'undefined' && alertTrendChart) alertTrendChart.resize();
        if (typeof alertStatsPieChart !== 'undefined' && alertStatsPieChart) alertStatsPieChart.resize();
        if (typeof alertMonthTrendChart !== 'undefined' && alertMonthTrendChart) alertMonthTrendChart.resize();
        if (typeof alertHandleChart !== 'undefined' && alertHandleChart) alertHandleChart.resize();
        if (typeof alert30DayTrendChart !== 'undefined' && alert30DayTrendChart) alert30DayTrendChart.resize();
        if (typeof alertRadialChart !== 'undefined' && alertRadialChart) alertRadialChart.resize();
        // 资源监控页面图表
        if (typeof resourceRateChart !== 'undefined' && resourceRateChart) resourceRateChart.resize();
        if (typeof resourceUsageChart !== 'undefined' && resourceUsageChart) resourceUsageChart.resize();
        if (typeof cpuGaugeChart !== 'undefined' && cpuGaugeChart) cpuGaugeChart.resize();
        if (typeof memoryGaugeChart !== 'undefined' && memoryGaugeChart) memoryGaugeChart.resize();
        if (typeof resourceBreakdownChart !== 'undefined' && resourceBreakdownChart) resourceBreakdownChart.resize();
        // 运维监控页面图表 - 工单管理与SLA监控
        if (typeof ticketStatusChart !== 'undefined' && ticketStatusChart) ticketStatusChart.resize();
        if (typeof ticketTrendChart !== 'undefined' && ticketTrendChart) ticketTrendChart.resize();
        if (typeof ticketSourceChart !== 'undefined' && ticketSourceChart) ticketSourceChart.resize();
        // 网络监控页面图表 - 网络状态监控仪表盘
        if (typeof networkTrafficTrendChart !== 'undefined' && networkTrafficTrendChart) networkTrafficTrendChart.resize();
        if (typeof topDevicesChart !== 'undefined' && topDevicesChart) topDevicesChart.resize();
        if (typeof networkNodeMapChart !== 'undefined' && networkNodeMapChart) networkNodeMapChart.resize();
        // 网络监控页面图表
        if (typeof latencySparklineChart !== 'undefined' && latencySparklineChart) latencySparklineChart.resize();
        if (typeof successRateRingChart !== 'undefined' && successRateRingChart) successRateRingChart.resize();
        if (typeof alertCategoryBarChart !== 'undefined' && alertCategoryBarChart) alertCategoryBarChart.resize();
        if (typeof latencyTrendChart !== 'undefined' && latencyTrendChart) latencyTrendChart.resize();
        if (typeof networkTopologyChart !== 'undefined' && networkTopologyChart) networkTopologyChart.resize();
        // 机房管理页面图表
        if (typeof networkThroughputChart !== 'undefined' && networkThroughputChart) networkThroughputChart.resize();
        if (typeof temperatureChart !== 'undefined' && temperatureChart) temperatureChart.resize();
        if (typeof humidityChart !== 'undefined' && humidityChart) humidityChart.resize();
        // 能耗监测页面图表
        if (typeof slaTrendChart !== 'undefined' && slaTrendChart) slaTrendChart.resize();
        if (typeof cpuHeatmapChart !== 'undefined' && cpuHeatmapChart) cpuHeatmapChart.resize();
        if (typeof ticketPieChart !== 'undefined' && ticketPieChart) ticketPieChart.resize();
        if (typeof cpuPredictionChart !== 'undefined' && cpuPredictionChart) cpuPredictionChart.resize();
        // 智能预测页面图表（新版）
        if (typeof historyPredictionChart !== 'undefined' && historyPredictionChart) historyPredictionChart.resize();
        if (typeof accuracyHeatmapChart !== 'undefined' && accuracyHeatmapChart) accuracyHeatmapChart.resize();
        if (typeof errorTrendChart !== 'undefined' && errorTrendChart) errorTrendChart.resize();
        if (typeof alertDistributionChart !== 'undefined' && alertDistributionChart) alertDistributionChart.resize();
        if (typeof futurePredictionChart !== 'undefined' && futurePredictionChart) futurePredictionChart.resize();
        // 资源监控页面图表
        if (typeof resourceRankChart !== 'undefined' && resourceRankChart) resourceRankChart.resize();
        if (typeof cpuGaugeChart2 !== 'undefined' && cpuGaugeChart2) cpuGaugeChart2.resize();
        if (typeof memoryGaugeChart2 !== 'undefined' && memoryGaugeChart2) memoryGaugeChart2.resize();
        if (typeof networkGaugeChart !== 'undefined' && networkGaugeChart) networkGaugeChart.resize();
        if (typeof storageGaugeChart !== 'undefined' && storageGaugeChart) storageGaugeChart.resize();
        if (typeof resourceHistoryChart !== 'undefined' && resourceHistoryChart) resourceHistoryChart.resize();
    } catch (e) {
        // 忽略图表尚未初始化的错误
    }
}

// 更新时间
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('currentTime').textContent = timeStr;
}

function initTime() {
    updateTime();
}

// 全屏切换
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.body.classList.add('fullscreen-mode');
    } else {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-mode');
    }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen-mode');
    }
});

// 当前激活的视图
let currentView = '首页';

// 初始化顶部导航 - 页面内切换
function initHeaderNav() {
    // 默认激活首页
    document.querySelectorAll('.bigscreen-header .nav-item').forEach(item => {
        if (item.dataset.page === '首页') {
            item.classList.add('active');
        }
        
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            switchView(page);
        });
    });
}

// 切换视图
function switchView(viewName) {
    currentView = viewName;
    
    // 更新菜单激活状态
    document.querySelectorAll('.bigscreen-header .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === viewName);
    });
    
    // 隐藏所有视图内容
    document.querySelectorAll('.view-content').forEach(view => {
        view.style.display = 'none';
    });
    
    // 显示对应视图
    const viewId = getViewId(viewName);
    const viewEl = document.getElementById(viewId);
    if (viewEl) {
        viewEl.style.display = 'block';
    }
    
    // 触发视图加载
    loadViewData(viewName);
}

// 获取视图ID
function getViewId(viewName) {
    const viewIdMap = {
        '首页': 'view-home',
        '资源监控': 'view-resource',
        '告警监控': 'view-alert',
        '智能预测': 'view-prediction',
        '运维监控': 'view-ops',
        '网络监控': 'view-network',
        '机房管理': 'view-datacenter',
        '能耗监测': 'view-energy'
    };
    return viewIdMap[viewName] || 'view-home';
}

// 加载视图数据
function loadViewData(viewName) {
    switch(viewName) {
        case '首页':
            // 首页数据已在loadData中加载
            break;
        case '资源监控':
            loadPredictionData();
            break;
        case '告警监控':
            loadAlertMonitorData();
            break;
        case '智能预测':
            loadPredictionPageData();
            break;
        case '运维监控':
            loadOpsMonitorData();
            break;
        case '网络监控':
            loadNetworkMonitorData();
            break;
        case '机房管理':
            loadDatacenterMonitorData();
            break;
        case '能耗监测':
            loadEnergyData();
            break;
    }
}

// 资源监控数据加载
let resourceRateChart = null;
let resourceUsageChart = null;
let cpuGaugeChart = null;
let memoryGaugeChart = null;
let resourceBreakdownChart = null;

function loadResourceMonitorData() {
    console.log('加载资源监控数据...');
    initResourceRateChart();
    initResourceUsageChart();
    initCpuGaugeChart();
    initMemoryGaugeChart();
    initResourceBreakdownChart();
    initResourceTabs();
}

// 资源速率TOP10条形图
function initResourceRateChart() {
    const chartDom = document.getElementById('resourceRateChart');
    if (!chartDom) return;
    
    if (resourceRateChart) resourceRateChart.dispose();
    resourceRateChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        grid: {
            left: '3%', right: '5%', bottom: '3%', top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['CPU', '内存', '网络', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [{
            type: 'bar',
            barWidth: '50%',
            data: [92, 78, 65, 58, 52, 48, 42, 38, 35, 30],
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#60a5fa' },
                    { offset: 1, color: '#3b82f6' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    };
    resourceRateChart.setOption(option);
}

// 资源使用率TOP10条形图
function initResourceUsageChart() {
    const chartDom = document.getElementById('resourceUsageChart');
    if (!chartDom) return;
    
    if (resourceUsageChart) resourceUsageChart.dispose();
    resourceUsageChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        grid: {
            left: '3%', right: '5%', bottom: '3%', top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['CPU', '内存', '网络', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [{
            type: 'bar',
            barWidth: '50%',
            data: [85, 72, 68, 55, 50, 45, 40, 35, 32, 28],
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#34d399' },
                    { offset: 1, color: '#10b981' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    };
    resourceUsageChart.setOption(option);
}

// CPU仪表盘
function initCpuGaugeChart() {
    const chartDom = document.getElementById('cpuGaugeChart');
    if (!chartDom) return;
    
    if (cpuGaugeChart) cpuGaugeChart.dispose();
    cpuGaugeChart = echarts.init(chartDom);
    
    const option = {
        series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            radius: '100%',
            center: ['50%', '75%'],
            progress: {
                show: true,
                width: 18,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#3b82f6' },
                        { offset: 1, color: '#60a5fa' }
                    ])
                }
            },
            axisLine: {
                lineStyle: { width: 18, color: [[1, 'rgba(59, 130, 246, 0.15)']] }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            pointer: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#60a5fa',
                offsetCenter: [0, '-15%'],
                formatter: '{value}%'
            },
            data: [{ value: 85 }]
        }]
    };
    cpuGaugeChart.setOption(option);
}

// 内存仪表盘
function initMemoryGaugeChart() {
    const chartDom = document.getElementById('memoryGaugeChart');
    if (!chartDom) return;
    
    if (memoryGaugeChart) memoryGaugeChart.dispose();
    memoryGaugeChart = echarts.init(chartDom);
    
    const option = {
        series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            radius: '100%',
            center: ['50%', '75%'],
            progress: {
                show: true,
                width: 18,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#10b981' },
                        { offset: 1, color: '#34d399' }
                    ])
                }
            },
            axisLine: {
                lineStyle: { width: 18, color: [[1, 'rgba(16, 185, 129, 0.15)']] }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            pointer: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#34d399',
                offsetCenter: [0, '-15%'],
                formatter: '{value}%'
            },
            data: [{ value: 62 }]
        }]
    };
    memoryGaugeChart.setOption(option);
}

// 资源使用分解折线图
function initResourceBreakdownChart() {
    const chartDom = document.getElementById('resourceBreakdownChart');
    if (!chartDom) return;
    
    if (resourceBreakdownChart) resourceBreakdownChart.dispose();
    resourceBreakdownChart = echarts.init(chartDom);
    
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const cpuData = [35, 42, 38, 45, 52, 60, 72, 80, 75, 68, 62, 58, 65, 70, 78, 85, 82, 76, 68, 55, 48, 42, 38, 35];
    const memoryData = [45, 48, 46, 50, 55, 58, 62, 68, 72, 70, 65, 60, 58, 62, 68, 72, 70, 65, 60, 55, 50, 48, 46, 45];
    const networkData = [20, 25, 22, 28, 35, 42, 50, 55, 52, 48, 45, 40, 42, 48, 55, 60, 58, 52, 45, 38, 32, 28, 24, 20];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['CPU', '内存', '网络IO'],
            textStyle: { color: '#94a3b8', fontSize: 11 },
            right: 10, top: 5
        },
        grid: {
            left: '3%', right: '4%', bottom: '8%', top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: hours,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, interval: 3 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: 'CPU',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: cpuData,
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#60a5fa' },
                markPoint: {
                    symbol: 'pin',
                    symbolSize: 35,
                    data: [
                        { type: 'max', name: '峰值', itemStyle: { color: '#ef4444' } },
                        { type: 'min', name: '低谷', itemStyle: { color: '#10b981' } }
                    ],
                    label: { color: '#fff', fontSize: 9 }
                }
            },
            {
                name: '内存',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: memoryData,
                lineStyle: { color: '#10b981', width: 2 },
                itemStyle: { color: '#34d399' }
            },
            {
                name: '网络IO',
                type: 'line',
                smooth: true,
                data: networkData,
                lineStyle: { color: '#8b5cf6', width: 0 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139, 92, 246, 0.4)' },
                        { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                    ])
                },
                symbol: 'none'
            }
        ]
    };
    resourceBreakdownChart.setOption(option);
}

// 资源标签切换
function initResourceTabs() {
    document.querySelectorAll('.resource-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.resource-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // 可以在此处根据选中的tab更新图表数据
            console.log('切换到:', this.dataset.type);
        });
    });
}

// 告警监控数据加载
let alertStatsPieChart = null;
let alertMonthTrendChart = null;
let alertHandleChart = null;
let alert7DayTrendChart = null;

let alertRadialChart = null;

let alert30DayTrendChart = null;
let current30DayTrendType = 'all';

function loadAlertMonitorData() {
    console.log('加载告警监控数据（从数据库）...');
    loadAlertSeverityStats();
    loadAlertMonthTrend();
    loadAlertHandleStats();
    loadAlert30DayTrend('all');
    loadAlertTableDataFromDB();
    loadAlertRadialStats();
    initTrendFilterBtns();
}

// 初始化趋势筛选按钮
function initTrendFilterBtns() {
    const btns = document.querySelectorAll('.trend-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const type = this.dataset.type;
            current30DayTrendType = type;
            loadAlert30DayTrend(type);
        });
    });
}

// 从数据库加载告警级别统计 (饼图)
async function loadAlertSeverityStats() {
    try {
        const response = await fetch('/api/bigscreen/alert-monitor/severity-stats');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updateAlertStatsPieChart(result.data);
        }
    } catch (error) {
        console.error('加载告警级别统计失败:', error);
    }
}

function updateAlertStatsPieChart(data) {
    const chartDom = document.getElementById('alertStatsPieChart');
    if (!chartDom) return;
    
    if (alertStatsPieChart) alertStatsPieChart.dispose();
    alertStatsPieChart = echarts.init(chartDom);
    
    const pieData = data.pieData || [];
    const chartData = pieData.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: item.color }
    }));
    
    // 如果没有数据，显示默认
    if (chartData.length === 0) {
        chartData.push({ value: 0, name: '暂无数据', itemStyle: { color: '#64748b' } });
    }
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: '#94a3b8', fontSize: 11 }
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: '#1e293b', borderWidth: 2 },
            label: { show: false },
            emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e0e6ed' }
            },
            data: chartData
        }]
    };
    alertStatsPieChart.setOption(option);

    // 添加点击事件 - 跳转到告警中心页面
    alertStatsPieChart.off('click'); // 移除旧的事件监听器
    alertStatsPieChart.on('click', function(params) {
        if (params.data && params.data.name !== '暂无数据') {
            // 根据点击的数据项名称映射到严重级别
            const severityMap = {
                '紧急': 'critical',
                '严重': 'critical',
                '警告': 'warning',
                '信息': 'info',
                '提示': 'info'
            };

            const severity = severityMap[params.data.name] || '';
            if (severity) {
                // 跳转到告警中心页面，并传递严重级别参数
                window.location.href = `告警中心.html?severity=${severity}`;
            }
        }
    });
}

// 从数据库加载本月告警统计 (按告警分类和严重级别分组柱状图)
async function loadAlertMonthTrend() {
    try {
        const response = await fetch('/api/bigscreen/alert-monitor/monthly-trend');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updateAlertMonthTrendChart(result.data);
        }
    } catch (error) {
        console.error('加载本月告警统计失败:', error);
    }
}

function updateAlertMonthTrendChart(data) {
    const chartDom = document.getElementById('alertMonthTrendChart');
    if (!chartDom) return;
    
    if (alertMonthTrendChart) alertMonthTrendChart.dispose();
    alertMonthTrendChart = echarts.init(chartDom);
    
    const categories = data.categories || ['暂无数据'];
    const critical = data.critical || [0];
    const warning = data.warning || [0];
    const info = data.info || [0];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['紧急', '警告', '信息'],
            bottom: '2%',
            textStyle: { color: '#94a3b8', fontSize: 9 },
            itemWidth: 12,
            itemHeight: 8
        },
        grid: { left: '8%', right: '5%', bottom: '20%', top: '8%' },
        xAxis: {
            type: 'category',
            data: categories,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { 
                color: '#94a3b8', 
                fontSize: 8, 
                rotate: 25,
                formatter: function(value) {
                    return value.replace('告警', '');
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '紧急',
                type: 'bar',
                barWidth: '20%',
                data: critical,
                itemStyle: { color: '#ef4444', borderRadius: [2, 2, 0, 0] }
            },
            {
                name: '警告',
                type: 'bar',
                barWidth: '20%',
                data: warning,
                itemStyle: { color: '#f59e0b', borderRadius: [2, 2, 0, 0] }
            },
            {
                name: '信息',
                type: 'bar',
                barWidth: '20%',
                data: info,
                itemStyle: { color: '#3b82f6', borderRadius: [2, 2, 0, 0] }
            }
        ]
    };
    alertMonthTrendChart.setOption(option);

    // 添加点击事件 - 弹出模态框展示对应数据
    alertMonthTrendChart.off('click'); // 移除旧的事件监听器
    alertMonthTrendChart.on('click', function(params) {
        if (params.seriesName && params.name) {
            // 根据系列名称映射到严重级别
            const severityMap = {
                '紧急': 'critical',
                '警告': 'warning',
                '信息': 'info'
            };

            // 根据分类名称映射到数据库字段值
            const categoryMap = {
                'CPU告警': 'cpu',
                '内存告警': 'memory',
                '磁盘告警': 'disk',
                '网络告警': 'network',
                '服务告警': 'service',
                '安全告警': 'security',
                '温度告警': 'temperature',
                '其他告警': 'other',
                'CPU': 'cpu',
                '内存': 'memory',
                '磁盘': 'disk',
                '网络': 'network',
                '服务': 'service',
                '安全': 'security',
                '温度': 'temperature',
                '其他': 'other'
            };

            const severity = severityMap[params.seriesName] || '';
            const category = categoryMap[params.name] || '';

            // 构建筛选条件
            const filter = {};
            if (severity) filter.severity = severity;
            if (category) filter.alertCategory = category;

            // 弹出模态框展示数据
            openAlertListModal(filter);
        }
    });
}

// 从数据库加载告警处理情况 (按分类堆叠柱状图)
async function loadAlertHandleStats() {
    try {
        const response = await fetch('/api/bigscreen/alert-monitor/handle-stats');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updateAlertHandleChart(result.data);
        }
    } catch (error) {
        console.error('加载告警处理情况失败:', error);
    }
}

function updateAlertHandleChart(data) {
    const chartDom = document.getElementById('alertHandleChart');
    if (!chartDom) return;
    
    if (alertHandleChart) alertHandleChart.dispose();
    alertHandleChart = echarts.init(chartDom);
    
    const categories = data.categories || ['暂无数据'];
    const resolved = data.resolved || [0];
    const unresolved = data.unresolved || [0];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['已处理', '未处理'],
            bottom: '2%',
            textStyle: { color: '#94a3b8', fontSize: 10 }
        },
        grid: { left: '8%', right: '5%', bottom: '18%', top: '8%' },
        xAxis: {
            type: 'category',
            data: categories,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, rotate: 20 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '已处理',
                type: 'bar',
                stack: 'total',
                barWidth: '40%',
                data: resolved,
                itemStyle: { 
                    color: '#10b981',
                    borderRadius: [0, 0, 0, 0]
                }
            },
            {
                name: '未处理',
                type: 'bar',
                stack: 'total',
                barWidth: '40%',
                data: unresolved,
                itemStyle: { 
                    color: '#ef4444',
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ]
    };
    alertHandleChart.setOption(option);

    // 添加点击事件 - 弹出模态框展示对应数据
    alertHandleChart.off('click'); // 移除旧的事件监听器
    alertHandleChart.on('click', function(params) {
        if (params.seriesName && params.name) {
            // 根据系列名称映射到状态（与后端统计逻辑一致）
            // 已处理：status = 'resolved'
            // 未处理：status IN ('active', 'acknowledged')
            const statusMap = {
                '已处理': 'resolved',
                '未处理': 'active,acknowledged'
            };

            // 根据分类名称映射到 device_type 字段值（与后端统计逻辑一致）
            const deviceTypeMap = {
                '服务器': 'server',
                '网络': 'network',
                '存储': 'storage',
                '安全': 'security',
                '应用': 'application',
                '数据库': 'database'
            };

            const status = statusMap[params.seriesName] || '';
            const deviceType = deviceTypeMap[params.name] || '';

            // 构建筛选条件
            const filter = {};
            if (status) filter.status = status;
            if (deviceType) filter.deviceType = deviceType;

            // 弹出模态框展示数据
            openAlertListModal(filter);
        }
    });
}

// 从数据库加载30天告警趋势 (折线图 - 过去实线/未来虚线)
async function loadAlert30DayTrend(type = 'all') {
    try {
        const response = await fetch(`/api/bigscreen/alert-monitor/30day-trend?type=${type}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updateAlert30DayTrendChart(result.data, type);
        }
    } catch (error) {
        console.error('加载30天告警趋势失败:', error);
    }
}

function updateAlert30DayTrendChart(data, type) {
    const chartDom = document.getElementById('alert30DayTrendChart');
    if (!chartDom) return;
    
    if (alert30DayTrendChart) alert30DayTrendChart.dispose();
    alert30DayTrendChart = echarts.init(chartDom);
    
    const dates = data.dates || [];
    const past = data.past || [];
    const future = data.future || [];
    const todayIndex = data.todayIndex || 14;
    
    // 颜色配置
    const colorMap = {
        'all': '#3b82f6',
        'critical': '#ef4444',
        'warning': '#f59e0b',
        'info': '#10b981'
    };
    const lineColor = colorMap[type] || '#3b82f6';
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                let result = params[0].axisValue + '<br/>';
                params.forEach(p => {
                    if (p.value !== null && p.value !== undefined) {
                        const isPast = p.seriesName === '实际';
                        result += `${isPast ? '实际' : '预测'}: ${p.value}条<br/>`;
                    }
                });
                return result;
            }
        },
        legend: {
            data: ['实际', '预测'],
            bottom: '2%',
            textStyle: { color: '#94a3b8', fontSize: 9 }
        },
        grid: { left: '8%', right: '5%', bottom: '18%', top: '8%' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { 
                color: '#94a3b8', 
                fontSize: 8,
                interval: 2,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '实际',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 4,
                data: past,
                connectNulls: false,
                lineStyle: { color: lineColor, width: 2, type: 'solid' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: lineColor.replace(')', ', 0.3)').replace('rgb', 'rgba') },
                        { offset: 1, color: lineColor.replace(')', ', 0.05)').replace('rgb', 'rgba') }
                    ])
                },
                itemStyle: { color: lineColor },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    data: [{
                        xAxis: todayIndex,
                        lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
                        label: { show: true, formatter: '今天', color: '#94a3b8', fontSize: 9 }
                    }]
                }
            },
            {
                name: '预测',
                type: 'line',
                smooth: true,
                symbol: 'diamond',
                symbolSize: 4,
                data: future,
                connectNulls: false,
                lineStyle: { color: lineColor, width: 2, type: 'dashed' },
                itemStyle: { color: lineColor, opacity: 0.7 }
            }
        ]
    };
    alert30DayTrendChart.setOption(option);
}

// 从数据库加载告警统计概览（放射图）
async function loadAlertRadialStats() {
    try {
        const response = await fetch('/api/bigscreen/alert-monitor/radial-stats');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updateAlertRadialChart(result.data);
        }
    } catch (error) {
        console.error('加载告警统计概览失败:', error);
    }
}

function updateAlertRadialChart(data) {
    const chartDom = document.getElementById('alertRadialChart');
    if (!chartDom) return;
    
    if (alertRadialChart) alertRadialChart.dispose();
    alertRadialChart = echarts.init(chartDom);
    
    const monthTotal = data.monthTotal || 0;
    const monthGrowth = data.monthGrowth || 0;
    const todayResolved = data.todayResolved || 0;
    const resolvedGrowth = data.resolvedGrowth || 0;
    const todayPending = data.todayPending || 0;
    const pendingGrowth = data.pendingGrowth || 0;
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            confine: true,
            borderWidth: 1,
            padding: [10, 15],
            textStyle: { color: '#e0e6ed', fontSize: 12 },
            formatter: function(params) {
                const d = params.data;
                const growth = d.growth;
                let compareText = '较上月';
                if (d.compareType === 'day') compareText = '较昨日';
                else if (d.compareType === 'avg') compareText = '环比';
                const arrow = growth >= 0 ? '↑' : '↓';
                const color = growth >= 0 ? '#ef4444' : '#10b981';
                return `<div style="font-weight:bold;margin-bottom:5px;">${d.name}</div>
                        <div>数量: <span style="color:#3b82f6;font-size:16px;font-weight:bold;">${d.count}</span> 条</div>
                        <div style="margin-top:5px;">${compareText}: <span style="color:${color};font-weight:bold;">${arrow} ${Math.abs(growth)}%</span></div>`;
            }
        },
        series: [
            // 中心圆
            {
                type: 'pie',
                radius: ['0%', '28%'],
                center: ['50%', '50%'],
                silent: true,
                label: { show: false },
                data: [{ value: 1, itemStyle: { color: 'rgba(59, 130, 246, 0.2)' } }]
            },
            // 三个分支数据
            {
                type: 'pie',
                radius: ['35%', '75%'],
                center: ['50%', '50%'],
                startAngle: 90,
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function(params) {
                        return `${params.data.name}\n${params.data.count}条`;
                    },
                    fontSize: 11,
                    color: '#fff',
                    lineHeight: 16,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowBlur: 2
                },
                labelLine: { show: false },
                emphasis: {
                    scale: true,
                    scaleSize: 5,
                    label: { fontSize: 12 }
                },
                data: [
                    {
                        value: 33,
                        name: '本月告警',
                        count: monthTotal,
                        growth: monthGrowth,
                        compareType: 'month',
                        itemStyle: { color: '#3b82f6' }
                    },
                    {
                        value: 33,
                        name: '已解决',
                        count: todayResolved,
                        growth: resolvedGrowth,
                        compareType: 'avg',
                        itemStyle: { color: '#10b981' }
                    },
                    {
                        value: 33,
                        name: '待处理',
                        count: todayPending,
                        growth: pendingGrowth,
                        compareType: 'avg',
                        itemStyle: { color: '#ef4444' }
                    }
                ]
            }
        ],
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: 'center',
                style: {
                    text: '告警\n统计',
                    textAlign: 'center',
                    fill: '#e0e6ed',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }
        ]
    };
    alertRadialChart.setOption(option);

    // 添加点击事件 - 根据点击的部分显示对应分类的告警
    alertRadialChart.off('click'); // 移除旧的事件监听器
    alertRadialChart.on('click', function(params) {
        if (params.data && params.data.name) {
            // 根据点击的部分映射到过滤条件
            const filterMap = {
                '本月告警': { timeRange: 'month', title: '本月告警' },
                '已解决': { status: 'resolved,acknowledged', title: '已解决告警' },
                '待处理': { status: 'active', title: '待处理告警' }
            };

            const filter = filterMap[params.data.name] || {};
            openAlertListModal(filter);
        }
    });
}

// 从数据库加载告警列表数据
async function loadAlertTableDataFromDB() {
    const tbody = document.getElementById('alertTableBody');
    if (!tbody) return;
    
    try {
        const response = await fetch('/api/bigscreen/alert-monitor/list?limit=20');
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            updateAlertTable(result.data);
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">暂无告警数据</td></tr>';
        }
    } catch (error) {
        console.error('加载告警列表失败:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">加载失败</td></tr>';
    }
}

// 存储当前告警数据
let currentAlertData = [];

function updateAlertTable(alerts) {
    const tbody = document.getElementById('alertTableBody');
    if (!tbody) return;
    
    currentAlertData = alerts || [];
    
    if (!alerts || alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">暂无告警数据</td></tr>';
        return;
    }
    
    const statusMap = {
        'active': '<span class="status-badge pending">待处理</span>',
        'resolved': '<span class="status-badge processing">进行中</span>',
        'acknowledged': '<span class="status-badge confirmed">已解决</span>'
    };
    
    tbody.innerHTML = alerts.map((item, index) => `
        <tr onclick="showAlertDetail(${index})">
            <td>${item.time || ''}</td>
            <td>${item.message || item.device || '未知'}</td>
            <td><span class="alert-type-tag">${item.type || '其他'}</span></td>
            <td>${statusMap[item.status] || '<span class="status-badge">未知</span>'}</td>
        </tr>
    `).join('');
}

// 显示告警详情弹窗
function showAlertDetail(index) {
    const alert = currentAlertData[index];
    if (!alert) return;
    
    const modal = document.getElementById('alertDetailModal');
    const body = document.getElementById('alertDetailBody');
    if (!modal || !body) return;
    
    const severityText = {
        'critical': '紧急',
        'warning': '警告',
        'info': '信息'
    };
    
    const statusText = {
        'active': '待处理',
        'resolved': '进行中',
        'acknowledged': '已解决'
    };
    
    body.innerHTML = `
        <div class="alert-detail-item">
            <span class="label">告警时间:</span>
            <span class="value">${alert.time || '-'}</span>
        </div>
        <div class="alert-detail-item">
            <span class="label">告警设备:</span>
            <span class="value">${alert.device || '-'}</span>
        </div>
        <div class="alert-detail-item">
            <span class="label">告警消息:</span>
            <span class="value">${alert.message || '-'}</span>
        </div>
        <div class="alert-detail-item">
            <span class="label">告警类型:</span>
            <span class="value">${alert.type || '-'}</span>
        </div>
        <div class="alert-detail-item">
            <span class="label">严重级别:</span>
            <span class="value ${alert.severity || ''}">${severityText[alert.severity] || '-'}</span>
        </div>
        <div class="alert-detail-item">
            <span class="label">当前状态:</span>
            <span class="value">${statusText[alert.status] || '-'}</span>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// 关闭告警详情弹窗
function closeAlertDetail() {
    const modal = document.getElementById('alertDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('alertDetailModal');
    if (modal && e.target === modal) {
        modal.style.display = 'none';
    }
});

// 智能预测数据加载
let resourceRankChart = null;
let cpuGaugeChart2 = null;
let memoryGaugeChart2 = null;
let networkGaugeChart = null;
let storageGaugeChart = null;
let resourceHistoryChart = null;

function loadPredictionData() {
    console.log('加载智能预测数据...');
    // 检查是否有从机房管理页面跳转过来的设备ID
    const pendingDeviceId = window.pendingDeviceId || 'all';
    window.pendingDeviceId = null; // 清除
    // 从数据库加载数据
    loadResourceMonitorFromDB(pendingDeviceId);
}

// 当前选中的分类ID
let currentCategoryId = 'all';

// 从数据库加载资源监控数据
async function loadResourceMonitorFromDB(deviceId = 'all', categoryId = null) {
    try {
        const catId = categoryId || currentCategoryId || 'all';
        
        // 首次加载时获取资源类型列表
        if (!categoryId) {
            const categoriesRes = await fetch('/api/bigscreen/resource-monitor/categories').then(r => r.json());
            if (categoriesRes.code === 200 && categoriesRes.data) {
                updateCategoryDropdown(categoriesRes.data);
            }
        }
        
        // 并行请求其他数据
        const [poolRes, devicesRes, rankingRes, perfRes, historyRes] = await Promise.all([
            fetch(`/api/bigscreen/resource-monitor/pool?categoryId=${catId}&deviceId=${deviceId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/devices?categoryId=${catId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/ranking?deviceId=${deviceId}&categoryId=${catId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/performance?deviceId=${deviceId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/history?deviceId=${deviceId}`).then(r => r.json())
        ]);

        // 更新资源池概览
        if (poolRes.code === 200 && poolRes.data) {
            updateResourcePool(poolRes.data);
        }

        // 更新设备下拉列表，并选中指定设备
        if (devicesRes.code === 200 && devicesRes.data) {
            updateDeviceDropdown(devicesRes.data, deviceId);
        }

        // 初始化排行图
        if (rankingRes.code === 200 && rankingRes.data) {
            initResourceRankChartWithData(rankingRes.data, deviceId);
        }

        // 初始化仪表盘
        if (perfRes.code === 200 && perfRes.data) {
            initGaugesWithData(perfRes.data);
        }

        // 初始化历史曲线
        if (historyRes.code === 200 && historyRes.data) {
            initResourceHistoryChartWithData(historyRes.data);
        }

    } catch (error) {
        console.error('加载资源监控数据失败:', error);
        // 使用默认数据
        initResourceRankChart();
        initCpuGaugeChart2();
        initMemoryGaugeChart2();
        initNetworkGaugeChart();
        initStorageGaugeChart();
        initResourceHistoryChart();
    }
}

// 更新资源类型下拉列表
function updateCategoryDropdown(categories) {
    const dropdown = document.getElementById('resourceTypeFilter');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        option.dataset.code = cat.code;
        dropdown.appendChild(option);
    });
    
    // 绑定change事件
    dropdown.onchange = function() {
        currentCategoryId = this.value;
        // 切换分类时重新加载设备列表
        loadResourceMonitorFromDB('all', this.value);
    };
}

// 更新资源池概览
function updateResourcePool(data) {
    const cpuEl = document.querySelector('.pool-stat:nth-child(1) .stat-value');
    const memEl = document.querySelector('.pool-stat:nth-child(2) .stat-value');
    const storageEl = document.querySelector('.pool-stat:nth-child(3) .stat-value');
    const bwEl = document.querySelector('.pool-stat:nth-child(4) .stat-value');
    
    // 解析带单位的值
    const parseValueUnit = (val) => {
        if (typeof val === 'string') {
            const match = val.match(/^([\d.]+)(.*)$/);
            if (match) return { value: match[1], unit: match[2] || '' };
        }
        return { value: val, unit: '' };
    };
    
    if (cpuEl) cpuEl.innerHTML = `${data.cpuCores}<span class="stat-unit">核</span>`;
    
    const mem = parseValueUnit(data.memoryTotal);
    if (memEl) memEl.innerHTML = `${mem.value}<span class="stat-unit">${mem.unit || 'TB'}</span>`;
    
    const storage = parseValueUnit(data.storageTotal);
    if (storageEl) storageEl.innerHTML = `${storage.value}<span class="stat-unit">${storage.unit || 'PB'}</span>`;
    
    if (bwEl) bwEl.innerHTML = `${data.bandwidth}<span class="stat-unit">Gbps</span>`;
}

// 当前选中的设备ID（用于跳转后选中）
let currentSelectedDeviceId = 'all';

// 更新设备下拉列表
function updateDeviceDropdown(devices, selectedDeviceId = null) {
    const dropdown = document.getElementById('deviceInstanceFilter');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.value;
        option.textContent = device.label;
        dropdown.appendChild(option);
    });
    
    // 如果指定了设备ID，选中它
    if (selectedDeviceId && selectedDeviceId !== 'all') {
        dropdown.value = selectedDeviceId;
        currentSelectedDeviceId = selectedDeviceId;
    }
    
    // 绑定change事件
    dropdown.onchange = function() {
        currentSelectedDeviceId = this.value;
        loadResourceMonitorFromDB(this.value, currentCategoryId);
    };
}

// 使用API数据初始化排行图
function initResourceRankChartWithData(data, deviceId) {
    const chartDom = document.getElementById('resourceRankChart');
    if (!chartDom) return;
    
    if (resourceRankChart) resourceRankChart.dispose();
    resourceRankChart = echarts.init(chartDom);
    
    const hosts = data.map(item => item.name).reverse();
    const values = data.map(item => item.value).reverse();
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}: {c}%'
        },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: hosts,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#e0e6ed', fontSize: 11 }
        },
        series: [{
            type: 'bar',
            barWidth: 14,
            data: values.map(v => ({
                value: v,
                itemStyle: {
                    color: v >= 90 ? '#ef4444' : v >= 80 ? '#f59e0b' : v >= 70 ? '#fbbf24' : '#10b981',
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            label: {
                show: true,
                position: 'right',
                color: '#94a3b8',
                fontSize: 10,
                formatter: '{c}%'
            }
        }]
    };
    resourceRankChart.setOption(option);
}

// 使用API数据初始化仪表盘
function initGaugesWithData(data) {
    initGaugeChart('cpuGaugeChart2', data.cpuUsage || 0, '#3b82f6');
    initGaugeChart('memoryGaugeChart2', data.memoryUsage || 0, '#10b981');
    initGaugeChart('networkGaugeChart', data.networkUsage || 0, '#8b5cf6');
    initGaugeChart('storageGaugeChart', data.storageUsage || 0, '#f59e0b');
    
    // 更新详情信息
    updateGaugeDetails(data);
}

function initGaugeChart(chartId, value, color) {
    const chartDom = document.getElementById(chartId);
    if (!chartDom) return;
    
    let chart;
    if (chartId === 'cpuGaugeChart2') {
        if (cpuGaugeChart2) cpuGaugeChart2.dispose();
        cpuGaugeChart2 = echarts.init(chartDom);
        chart = cpuGaugeChart2;
    } else if (chartId === 'memoryGaugeChart2') {
        if (memoryGaugeChart2) memoryGaugeChart2.dispose();
        memoryGaugeChart2 = echarts.init(chartDom);
        chart = memoryGaugeChart2;
    } else if (chartId === 'networkGaugeChart') {
        if (networkGaugeChart) networkGaugeChart.dispose();
        networkGaugeChart = echarts.init(chartDom);
        chart = networkGaugeChart;
    } else if (chartId === 'storageGaugeChart') {
        if (storageGaugeChart) storageGaugeChart.dispose();
        storageGaugeChart = echarts.init(chartDom);
        chart = storageGaugeChart;
    }
    
    const option = {
        series: [{
            type: 'gauge',
            radius: '90%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            itemStyle: { color: color },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, color.replace(')', ', 0.15)').replace('rgb', 'rgba')]] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#e0e6ed',
                offsetCenter: [0, '10%'],
                formatter: '{value}%'
            },
            data: [{ value: value }]
        }]
    };
    chart.setOption(option);
}

function updateGaugeDetails(data) {
    // 更新CPU详情
    const cpuDetail = document.querySelector('#cpuGaugeChart2')?.closest('.gauge-item')?.querySelector('.gauge-detail');
    if (cpuDetail) cpuDetail.textContent = `${data.cpuCores || 16} Cores / Load: ${data.cpuLoad || '0.75'}`;
    
    // 更新内存详情
    const memDetail = document.querySelector('#memoryGaugeChart2')?.closest('.gauge-item')?.querySelector('.gauge-detail');
    if (memDetail) memDetail.textContent = `${data.memoryUsed || 198}GB / ${data.memoryTotal || 320}GB`;
    
    // 更新网络详情
    const netDetail = document.querySelector('#networkGaugeChart')?.closest('.gauge-item')?.querySelector('.gauge-detail');
    if (netDetail) netDetail.textContent = `↑${data.networkIn || 2.5}Gbps / ↓${data.networkOut || 3.8}Gbps`;
    
    // 更新存储详情
    const storageDetail = document.querySelector('#storageGaugeChart')?.closest('.gauge-item')?.querySelector('.gauge-detail');
    if (storageDetail) storageDetail.textContent = `${data.storageUsed || 1.2}PB / ${data.storageTotal || 1.8}PB`;
}

// 使用API数据初始化历史曲线
function initResourceHistoryChartWithData(data) {
    const chartDom = document.getElementById('resourceHistoryChart');
    if (!chartDom) return;
    
    if (resourceHistoryChart) resourceHistoryChart.dispose();
    resourceHistoryChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['CPU', 'CPU预测', '内存', '内存预测', '网络', '网络预测', '存储', '存储预测'],
            textStyle: { color: '#94a3b8', fontSize: 10 },
            right: 5, top: 0,
            itemWidth: 15, itemHeight: 8,
            itemGap: 8
        },
        grid: { left: '3%', right: '3%', bottom: '3%', top: '18%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.hours,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 3 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            { name: 'CPU', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#3b82f6' }, data: data.cpuActual },
            { name: 'CPU预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#3b82f6', type: 'dashed' }, data: data.cpuPredict },
            { name: '内存', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#10b981' }, data: data.memActual },
            { name: '内存预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#10b981', type: 'dashed' }, data: data.memPredict },
            { name: '网络', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#8b5cf6' }, data: data.netActual },
            { name: '网络预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#8b5cf6', type: 'dashed' }, data: data.netPredict },
            { name: '存储', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#f59e0b' }, data: data.storageActual },
            { name: '存储预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' }, data: data.storagePredict,
              markLine: {
                  silent: true, symbol: 'none',
                  lineStyle: { type: 'dashed', color: '#ef4444', width: 2 },
                  data: [{ yAxis: 80, label: { formatter: '警戒线 80%', color: '#ef4444', fontSize: 10 } }]
              }
            }
        ]
    };
    resourceHistoryChart.setOption(option);
}

// 资源消耗排行条形图
function initResourceRankChart(deviceFilter) {
    const chartDom = document.getElementById('resourceRankChart');
    if (!chartDom) return;
    
    if (resourceRankChart) resourceRankChart.dispose();
    resourceRankChart = echarts.init(chartDom);
    
    // 根据设备筛选显示不同数据
    let hosts, values;
    if (!deviceFilter || deviceFilter === 'all') {
        // 全部设备 - 显示主机排行
        hosts = ['Host-10', 'Host-07', 'Host-03', 'Host-15', 'Host-08', 'Host-12', 'Host-01', 'Host-05', 'Host-09', 'Host-02'];
        values = [95, 89, 85, 82, 78, 75, 72, 68, 65, 62];
    } else {
        // 选中特定设备 - 显示该设备各资源消耗
        hosts = ['CPU核心', '内存', '磁盘IO', '网络带宽', '存储空间', 'GPU', '缓存', '线程数', '连接数', '队列深度'];
        // 模拟不同设备的数据
        const deviceData = {
            'server-01': [78, 65, 45, 58, 72, 30, 55, 68, 42, 35],
            'server-02': [85, 72, 62, 45, 68, 25, 48, 75, 38, 42],
            'server-03': [62, 88, 55, 72, 58, 45, 62, 52, 65, 28]
        };
        values = deviceData[deviceFilter] || [70, 60, 50, 55, 65, 35, 50, 60, 45, 40];
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}: {c}%'
        },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: hosts.reverse(),
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#e0e6ed', fontSize: 11 }
        },
        series: [{
            type: 'bar',
            barWidth: 14,
            data: values.reverse().map((v, i) => ({
                value: v,
                itemStyle: {
                    color: v >= 90 ? '#ef4444' : v >= 80 ? '#f59e0b' : v >= 70 ? '#fbbf24' : '#10b981',
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            label: {
                show: true,
                position: 'right',
                color: '#94a3b8',
                fontSize: 10,
                formatter: '{c}%'
            }
        }]
    };
    resourceRankChart.setOption(option);
}

// CPU仪表盘
function initCpuGaugeChart2(deviceFilter) {
    const chartDom = document.getElementById('cpuGaugeChart2');
    if (!chartDom) return;
    
    if (cpuGaugeChart2) cpuGaugeChart2.dispose();
    cpuGaugeChart2 = echarts.init(chartDom);
    
    // 根据设备筛选获取不同数值
    const deviceValues = { 'server-01': 78, 'server-02': 85, 'server-03': 62, 'all': 45 };
    const value = deviceValues[deviceFilter] || 45;
    
    const option = {
        series: [{
            type: 'gauge',
            radius: '90%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: { color: '#3b82f6' },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(59, 130, 246, 0.15)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#e0e6ed',
                offsetCenter: [0, '10%'],
                formatter: '{value}%'
            },
            data: [{ value: value }]
        }]
    };
    cpuGaugeChart2.setOption(option);
}

// 内存仪表盘
function initMemoryGaugeChart2(deviceFilter) {
    const chartDom = document.getElementById('memoryGaugeChart2');
    if (!chartDom) return;
    
    if (memoryGaugeChart2) memoryGaugeChart2.dispose();
    memoryGaugeChart2 = echarts.init(chartDom);
    
    const deviceValues = { 'server-01': 65, 'server-02': 72, 'server-03': 88, 'all': 62 };
    const value = deviceValues[deviceFilter] || 62;
    
    const option = {
        series: [{
            type: 'gauge',
            radius: '90%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: { color: '#10b981' },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(16, 185, 129, 0.15)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#e0e6ed',
                offsetCenter: [0, '10%'],
                formatter: '{value}%'
            },
            data: [{ value: value }]
        }]
    };
    memoryGaugeChart2.setOption(option);
}

// 网络仪表盘
function initNetworkGaugeChart(deviceFilter) {
    const chartDom = document.getElementById('networkGaugeChart');
    if (!chartDom) return;
    
    if (networkGaugeChart) networkGaugeChart.dispose();
    networkGaugeChart = echarts.init(chartDom);
    
    const deviceValues = { 'server-01': 58, 'server-02': 45, 'server-03': 72, 'all': 71 };
    const value = deviceValues[deviceFilter] || 71;
    
    const option = {
        series: [{
            type: 'gauge',
            radius: '90%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: { color: '#8b5cf6' },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(139, 92, 246, 0.15)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#e0e6ed',
                offsetCenter: [0, '10%'],
                formatter: '{value}%'
            },
            data: [{ value: value }]
        }]
    };
    networkGaugeChart.setOption(option);
}

// 存储仪表盘
function initStorageGaugeChart(deviceFilter) {
    const chartDom = document.getElementById('storageGaugeChart');
    if (!chartDom) return;
    
    if (storageGaugeChart) storageGaugeChart.dispose();
    storageGaugeChart = echarts.init(chartDom);
    
    const deviceValues = { 'server-01': 72, 'server-02': 68, 'server-03': 58, 'all': 67 };
    const value = deviceValues[deviceFilter] || 67;
    
    const option = {
        series: [{
            type: 'gauge',
            radius: '90%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: { color: '#f59e0b' },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(245, 158, 11, 0.15)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 28,
                fontWeight: 'bold',
                color: '#e0e6ed',
                offsetCenter: [0, '10%'],
                formatter: '{value}%'
            },
            data: [{ value: value }]
        }]
    };
    storageGaugeChart.setOption(option);
}

// 资源使用历史曲线图（实线=实际，虚线=预测）
function initResourceHistoryChart(deviceFilter) {
    const chartDom = document.getElementById('resourceHistoryChart');
    if (!chartDom) return;
    
    if (resourceHistoryChart) resourceHistoryChart.dispose();
    resourceHistoryChart = echarts.init(chartDom);
    
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    // 实际数据
    const cpuActual = [35,32,30,28,25,30,45,58,72,78,75,70,68,72,75,80,78,72,65,58,48,42,38,35];
    const memActual = [55,54,53,52,50,52,58,62,68,72,70,68,65,68,70,72,70,68,62,58,56,55,54,55];
    const netActual = [20,18,15,12,10,15,35,48,55,60,58,52,48,52,58,62,55,48,42,35,28,25,22,20];
    const storageActual = [60,60,61,61,62,62,63,64,65,66,66,67,67,68,68,69,69,68,68,67,66,65,64,62];
    // 预测数据（基于实际数据的趋势预测）
    const cpuPredict = cpuActual.map((v, i) => i < 18 ? null : v + Math.sin(i) * 5 + 3);
    const memPredict = memActual.map((v, i) => i < 18 ? null : v + Math.cos(i) * 3 + 2);
    const netPredict = netActual.map((v, i) => i < 18 ? null : v + Math.sin(i) * 4 + 5);
    const storagePredict = storageActual.map((v, i) => i < 18 ? null : v + 2);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['CPU', 'CPU预测', '内存', '内存预测', '网络', '网络预测', '存储', '存储预测'],
            textStyle: { color: '#94a3b8', fontSize: 10 },
            right: 5, top: 0,
            itemWidth: 15, itemHeight: 8,
            itemGap: 8
        },
        grid: { left: '3%', right: '3%', bottom: '3%', top: '18%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: hours,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 3 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            // CPU实际
            { name: 'CPU', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#3b82f6' }, data: cpuActual },
            // CPU预测
            { name: 'CPU预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#3b82f6', type: 'dashed' }, data: cpuPredict },
            // 内存实际
            { name: '内存', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#10b981' }, data: memActual },
            // 内存预测
            { name: '内存预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#10b981', type: 'dashed' }, data: memPredict },
            // 网络实际
            { name: '网络', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#8b5cf6' }, data: netActual },
            // 网络预测
            { name: '网络预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#8b5cf6', type: 'dashed' }, data: netPredict },
            // 存储实际
            { name: '存储', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#f59e0b' }, data: storageActual },
            // 存储预测
            { name: '存储预测', type: 'line', smooth: true, symbol: 'none',
              lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' }, data: storagePredict,
              markLine: {
                  silent: true, symbol: 'none',
                  lineStyle: { type: 'dashed', color: '#ef4444', width: 2 },
                  data: [{ yAxis: 80, label: { formatter: '警戒线 80%', color: '#ef4444', fontSize: 10 } }]
              }
            }
        ]
    };
    resourceHistoryChart.setOption(option);
}

// 更新预测数据（筛选器变化时调用）
function updatePredictionData() {
    const categoryDropdown = document.getElementById('resourceTypeFilter');
    const deviceDropdown = document.getElementById('deviceInstanceFilter');
    const categoryId = categoryDropdown?.value;
    const deviceId = deviceDropdown?.value;
    const deviceLabel = deviceDropdown?.options[deviceDropdown.selectedIndex]?.text;
    
    console.log('筛选条件变化:', categoryId, deviceId);
    
    // 根据设备选择更新标题
    const isAllDevices = !deviceId || deviceId === 'all';
    const perfHeader = document.querySelector('.prediction-center-panel .panel-header span');
    if (perfHeader) {
        perfHeader.textContent = isAllDevices ? '实时性能' : `实时性能 - ${deviceLabel}`;
    }
    
    // 更新当前分类ID
    currentCategoryId = categoryId || 'all';
    
    // 从API重新加载数据（不更新分类下拉）
    loadDeviceDataFromDB(deviceId || 'all', currentCategoryId);
}

// 只加载设备相关数据，不更新分类下拉
async function loadDeviceDataFromDB(deviceId = 'all', categoryId = 'all') {
    try {
        const [poolRes, rankingRes, perfRes, historyRes] = await Promise.all([
            fetch(`/api/bigscreen/resource-monitor/pool?categoryId=${categoryId}&deviceId=${deviceId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/ranking?deviceId=${deviceId}&categoryId=${categoryId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/performance?deviceId=${deviceId}`).then(r => r.json()),
            fetch(`/api/bigscreen/resource-monitor/history?deviceId=${deviceId}`).then(r => r.json())
        ]);

        if (poolRes.code === 200 && poolRes.data) {
            updateResourcePool(poolRes.data);
        }
        if (rankingRes.code === 200 && rankingRes.data) {
            initResourceRankChartWithData(rankingRes.data, deviceId);
        }
        if (perfRes.code === 200 && perfRes.data) {
            initGaugesWithData(perfRes.data);
        }
        if (historyRes.code === 200 && historyRes.data) {
            initResourceHistoryChartWithData(historyRes.data);
        }
    } catch (error) {
        console.error('加载设备数据失败:', error);
    }
}

// ========== 运维监控 - 工单管理与SLA监控 ==========
let ticketStatusChart = null;
let ticketTrendChart = null;
let ticketSourceChart = null;
let ticketTrendRepairDetails = [];

async function loadOpsMonitorData() {
    console.log('加载工单管理数据...');

    // 先加载工单类型映射（用于点击事件）
    await loadTicketTypeKeys();

    try {
        const [kpiRes, statusRes, trendRes, sourceRes, slaRes] = await Promise.all([
            fetch('/api/bigscreen/workorder/kpi').then(r => r.json()),
            fetch('/api/bigscreen/workorder/status-distribution').then(r => r.json()),
            fetch('/api/bigscreen/workorder/trend').then(r => r.json()),
            fetch('/api/bigscreen/workorder/source-distribution').then(r => r.json()),
            fetch('/api/bigscreen/workorder/sla-detail').then(r => r.json())
        ]);
        
        if (kpiRes.code === 200 && kpiRes.data) {
            updateWorkorderKpi(kpiRes.data);
        }
        
        if (statusRes.code === 200 && statusRes.data) {
            initTicketStatusChart(statusRes.data);
        } else {
            initTicketStatusChart(null);
        }
        
        if (trendRes.code === 200 && trendRes.data) {
            initTicketTrendChart(trendRes.data);
        } else {
            initTicketTrendChart(null);
        }
        
        if (sourceRes.code === 200 && sourceRes.data) {
            initTicketSourceChart(sourceRes.data);
        } else {
            initTicketSourceChart(null);
        }
        
        if (slaRes.code === 200 && slaRes.data) {
            loadSlaDetailTable(slaRes.data);
        } else {
            loadSlaDetailTable(null);
        }
    } catch (error) {
        console.error('加载工单数据失败:', error);
        initTicketStatusChart(null);
        initTicketTrendChart(null);
        initTicketSourceChart(null);
        loadSlaDetailTable(null);
    }
}

function updateWorkorderKpi(data) {
    const slaValue = document.getElementById('slaRateValue');
    if (slaValue) slaValue.innerHTML = `${data.slaRate}<span class="unit">%</span>`;
    
    const avgTime = document.getElementById('avgRepairTime');
    if (avgTime) avgTime.textContent = `${data.avgRepairTime}h`;
    
    const todayTickets = document.getElementById('todayTicketsValue');
    if (todayTickets) todayTickets.textContent = data.todayTotal;
    
    const ticketsDiff = document.getElementById('ticketsDiff');
    if (ticketsDiff) {
        const diff = data.ticketsDiff;
        ticketsDiff.textContent = diff >= 0 ? `+${diff}` : `${diff}`;
        const trendEl = ticketsDiff.closest('.workorder-kpi-trend');
        if (trendEl) {
            trendEl.className = `workorder-kpi-trend ${diff >= 0 ? 'up' : 'down'}`;
            trendEl.querySelector('i').className = `fas fa-arrow-${diff >= 0 ? 'up' : 'down'}`;
        }
    }
    
    const timeoutTickets = document.getElementById('timeoutTicketsValue');
    if (timeoutTickets) timeoutTickets.textContent = data.timeoutToday;
    
    const timeoutDiff = document.getElementById('timeoutDiff');
    if (timeoutDiff) {
        const diff = data.timeoutDiff;
        timeoutDiff.textContent = diff >= 0 ? `+${diff}` : `${diff}`;
    }
}

// 存储工单状态图表的原始数据用于点击事件
let ticketStatusApiData = null;
// 存储优先级key映射（用于点击事件）
let ticketPriorityKeyMap = {};

function initTicketStatusChart(apiData) {
    const chartDom = document.getElementById('ticketStatusChart');
    if (!chartDom) return;

    if (ticketStatusChart) ticketStatusChart.dispose();
    ticketStatusChart = echarts.init(chartDom);

    ticketStatusApiData = apiData; // 保存原始数据

    let priorities, priorityKeys, resolved, pending;
    if (apiData) {
        priorities = apiData.priorities.slice().reverse();
        priorityKeys = apiData.priorityKeys ? apiData.priorityKeys.slice().reverse() : [];
        resolved = apiData.resolved.slice().reverse();
        pending = apiData.pending.slice().reverse();
        // 构建优先级标签到key的映射
        ticketPriorityKeyMap = {};
        for (let i = 0; i < priorities.length; i++) {
            ticketPriorityKeyMap[priorities[i]] = priorityKeys[i] || priorities[i];
        }
    } else {
        priorities = ['P4(低)', 'P3(中)', 'P2(高)', 'P1(紧急)'];
        priorityKeys = ['low', 'medium', 'high', 'urgent'];
        resolved = [5, 6, 4, 2];
        pending = [2, 3, 3, 2];
        ticketPriorityKeyMap = {
            'P4(低)': 'low', 'P3(中)': 'medium', 'P2(高)': 'high', 'P1(紧急)': 'urgent'
        };
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                let html = `<div style="font-weight:600;margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    html += `<div>${p.marker} ${p.seriesName}: ${p.value}条</div>`;
                });
                html += '<div style="color:#94a3b8;font-size:11px;margin-top:5px;">点击查看详情</div>';
                return html;
            }
        },
        grid: { left: '3%', right: '8%', bottom: '8%', top: '8%', containLabel: true },
        xAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: priorities,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#e0e6ed', fontSize: 11 }
        },
        series: [
            { name: '已解决', type: 'bar', stack: 'total', barWidth: 18, itemStyle: { color: '#10b981' }, data: resolved },
            { name: '待解决', type: 'bar', stack: 'total', barWidth: 18, itemStyle: { color: '#f59e0b', borderRadius: [0, 4, 4, 0] }, data: pending }
        ]
    };
    ticketStatusChart.setOption(option);

    // 添加点击事件
    ticketStatusChart.off('click');
    ticketStatusChart.on('click', function(params) {
        const priorityLabel = params.name; // 如 "P1(紧急)"
        const status = params.seriesName === '已解决' ? 'resolved' : 'pending';
        const count = params.value;
        // 从优先级映射中获取正确的 priority_key
        const priorityKey = ticketPriorityKeyMap[priorityLabel] || priorityLabel;
        showWorkorderModal(priorityKey, priorityLabel, status, count);
    });
}

// extractPriorityKey 函数已废弃，改用 ticketPriorityKeyMap
function extractPriorityKey(label) {
    // 格式如 "P1(紧急)" -> "P1"
    const match = label.match(/^(P\d+)/);
    return match ? match[1] : label;
}

function initTicketTrendChart(apiData) {
    const chartDom = document.getElementById('ticketTrendChart');
    if (!chartDom) return;
    
    if (ticketTrendChart) ticketTrendChart.dispose();
    ticketTrendChart = echarts.init(chartDom);
    
    let dates, ticketCounts, repairTimes;
    if (apiData) {
        dates = apiData.dates;
        ticketCounts = apiData.counts;
        repairTimes = apiData.repairTimes;
        ticketTrendRepairDetails = apiData.repairDetails || [];
    } else {
        dates = [];
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push((d.getMonth() + 1) + '/' + d.getDate());
        }
        ticketCounts = [18, 22, 25, 20, 28, 32, 24, 19, 27, 30, 26, 23, 29, 25, 27];
        repairTimes = [2.1, 2.5, 1.8, 2.2, 3.0, 2.8, 2.0, 1.9, 2.4, 2.6, 2.3, 2.1, 2.7, 2.2, 2.1];
        ticketTrendRepairDetails = [];
    }
    
    const priorityColors = { 'P1(紧急)': '#f87171', 'P2(高)': '#fbbf24', 'P3(中)': '#60a5fa', 'P4(低)': '#94a3b8' };
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                const dataIndex = params[0].dataIndex;
                let result = `<div style="font-weight:bold;margin-bottom:8px;">${params[0].axisValue}</div>`;
                const countParam = params.find(p => p.seriesName === '工单数量');
                if (countParam) result += `<div>工单数量: <b>${countParam.value}</b>单</div>`;
                const details = ticketTrendRepairDetails[dataIndex];
                if (details && Object.keys(details).length > 0) {
                    result += `<div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;font-size:11px;">各级别修复时长:</div>`;
                    Object.keys(details).sort().forEach(key => {
                        result += `<div style="color:${priorityColors[key] || '#64748b'}">${key}: ${details[key]}h</div>`;
                    });
                }
                return result;
            }
        },
        grid: { left: '3%', right: '5%', bottom: '10%', top: '12%', containLabel: true },
        xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#94a3b8', fontSize: 9, rotate: 30 } },
        yAxis: [
            { type: 'value', name: '工单量', nameTextStyle: { color: '#94a3b8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } } },
            { type: 'value', name: '时长(h)', nameTextStyle: { color: '#94a3b8', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(6, 182, 212, 0.5)' } }, axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { show: false } }
        ],
        series: [
            { name: '工单数量', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: ticketCounts, lineStyle: { color: '#3b82f6', width: 2 }, itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.25)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }]) } },
            { name: '平均修复时长', type: 'bar', yAxisIndex: 1, barWidth: 12, data: repairTimes, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#06b6d4' }, { offset: 1, color: 'rgba(6, 182, 212, 0.4)' }]), borderRadius: [3, 3, 0, 0] } }
        ]
    };
    ticketTrendChart.setOption(option);
}

// 存储工单类型映射
let ticketTypeKeyMap = {};

// 加载工单类型key映射
async function loadTicketTypeKeys() {
    try {
        const response = await fetch('/api/bigscreen/workorder/type-keys');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            result.data.forEach(item => {
                ticketTypeKeyMap[item.type_name] = item.type_key;
            });
        }
    } catch (error) {
        console.error('加载工单类型映射失败:', error);
    }
}

function initTicketSourceChart(apiData) {
    const chartDom = document.getElementById('ticketSourceChart');
    if (!chartDom) return;

    if (ticketSourceChart) ticketSourceChart.dispose();
    ticketSourceChart = echarts.init(chartDom);

    // 工单类型颜色配置（与运维管理模块一致）
    const typeColors = { '故障': '#ef4444', '变更': '#3b82f6', '维护': '#10b981', '服务请求': '#f59e0b' };

    let sourceData;
    if (apiData && apiData.length > 0) {
        sourceData = apiData.map(item => ({ value: item.value || 0, name: item.name, itemStyle: { color: typeColors[item.name] || '#64748b' } }));
    } else {
        sourceData = [
            { value: 8, name: '故障', itemStyle: { color: '#ef4444' } },
            { value: 5, name: '变更', itemStyle: { color: '#3b82f6' } },
            { value: 6, name: '维护', itemStyle: { color: '#10b981' } },
            { value: 4, name: '服务请求', itemStyle: { color: '#f59e0b' } }
        ];
    }

    const total = sourceData.reduce((sum, item) => sum + item.value, 0);

    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            confine: true,
            formatter: '{b}: {c}条 ({d}%)<br/><span style="color:#94a3b8;font-size:11px;">点击查看详情</span>'
        },
        legend: { orient: 'vertical', right: '5%', top: 'center', itemWidth: 12, itemHeight: 12, textStyle: { color: '#94a3b8', fontSize: 11 } },
        series: [{
            type: 'pie', radius: ['50%', '75%'], center: ['35%', '50%'], avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 2 },
            label: { show: true, position: 'center', formatter: () => `{total|${total}}\n{label|总工单}`, rich: { total: { fontSize: 28, fontWeight: 'bold', color: '#e0e6ed', lineHeight: 36 }, label: { fontSize: 12, color: '#94a3b8', lineHeight: 20 } } },
            emphasis: { label: { show: true } },
            data: sourceData
        }]
    };
    ticketSourceChart.setOption(option);

    // 添加点击事件
    ticketSourceChart.off('click');
    ticketSourceChart.on('click', function(params) {
        const typeName = params.name;
        const count = params.value;
        const typeKey = ticketTypeKeyMap[typeName] || typeName;
        showWorkorderTypeModal(typeKey, typeName, count);
    });
}

// 显示工单模态框（按优先级和状态筛选）
async function showWorkorderModal(priorityKey, priorityLabel, status, count) {
    let modal = document.getElementById('workorderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'workorderModal';
        modal.className = 'workorder-modal-overlay';
        modal.innerHTML = `
            <div class="workorder-modal">
                <div class="workorder-modal-header">
                    <div class="modal-title">
                        <i class="fas fa-clipboard-list"></i>
                        <span id="workorderModalTitle">工单列表</span>
                    </div>
                    <button class="modal-close" onclick="closeWorkorderModal()">&times;</button>
                </div>
                <div class="workorder-modal-body">
                    <div class="workorder-filter-info">
                        <span id="workorderFilterInfo">加载中...</span>
                    </div>
                    <div class="workorder-table-container">
                        <table class="workorder-table">
                            <thead>
                                <tr>
                                    <th>工单编号</th>
                                    <th>标题</th>
                                    <th>优先级</th>
                                    <th>类型</th>
                                    <th>状态</th>
                                    <th>创建时间</th>
                                    <th>解决时间</th>
                                    <th>处理人</th>
                                </tr>
                            </thead>
                            <tbody id="workorderModalTableBody">
                                <tr><td colspan="8" class="loading-cell">加载中...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeWorkorderModal();
        });
    }

    modal.style.display = 'flex';
    const statusText = status === 'resolved' ? '已解决' : '待解决';
    document.getElementById('workorderModalTitle').textContent = `今日工单 - ${priorityLabel} - ${statusText}`;
    document.getElementById('workorderFilterInfo').textContent = `共 ${count} 条工单`;

    try {
        const response = await fetch(`/api/bigscreen/workorder/list?priorityKey=${priorityKey}&status=${status}`);
        const result = await response.json();
        const tbody = document.getElementById('workorderModalTableBody');

        if (result.code === 200 && result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td>${item.ticketNo || '-'}</td>
                    <td title="${item.description || ''}">${item.title || '-'}</td>
                    <td><span class="priority-tag p${item.priorityLevel}">${item.priorityName || '-'}</span></td>
                    <td>${item.typeName || '-'}</td>
                    <td><span class="status-tag ${getWorkorderStatusClass(item.status)}">${item.statusText}</span></td>
                    <td>${item.createdAt || '-'}</td>
                    <td>${item.resolvedAt || '-'}</td>
                    <td>${item.assignee || '-'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">暂无数据</td></tr>';
        }
    } catch (error) {
        console.error('加载工单列表失败:', error);
        document.getElementById('workorderModalTableBody').innerHTML = '<tr><td colspan="8" class="error-cell">加载失败，请重试</td></tr>';
    }
}

// 显示工单类型模态框
async function showWorkorderTypeModal(typeKey, typeName, count) {
    let modal = document.getElementById('workorderModal');
    if (!modal) {
        // 复用上面的模态框创建逻辑
        await showWorkorderModal('', '', '', 0);
        modal = document.getElementById('workorderModal');
    }

    modal.style.display = 'flex';
    document.getElementById('workorderModalTitle').textContent = `今日工单 - ${typeName}`;
    document.getElementById('workorderFilterInfo').textContent = `共 ${count} 条工单`;

    try {
        const response = await fetch(`/api/bigscreen/workorder/list?typeKey=${typeKey}`);
        const result = await response.json();
        const tbody = document.getElementById('workorderModalTableBody');

        if (result.code === 200 && result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td>${item.ticketNo || '-'}</td>
                    <td title="${item.description || ''}">${item.title || '-'}</td>
                    <td><span class="priority-tag p${item.priorityLevel}">${item.priorityName || '-'}</span></td>
                    <td>${item.typeName || '-'}</td>
                    <td><span class="status-tag ${getWorkorderStatusClass(item.status)}">${item.statusText}</span></td>
                    <td>${item.createdAt || '-'}</td>
                    <td>${item.resolvedAt || '-'}</td>
                    <td>${item.assignee || '-'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">暂无数据</td></tr>';
        }
    } catch (error) {
        console.error('加载工单列表失败:', error);
        document.getElementById('workorderModalTableBody').innerHTML = '<tr><td colspan="8" class="error-cell">加载失败，请重试</td></tr>';
    }
}

// 关闭工单模态框
function closeWorkorderModal() {
    const modal = document.getElementById('workorderModal');
    if (modal) modal.style.display = 'none';
}

// 获取工单状态样式类
function getWorkorderStatusClass(status) {
    if (!status) return '';
    switch (status.toLowerCase()) {
        case 'open': case 'pending': return 'pending';
        case 'processing': case 'in_progress': return 'processing';
        case 'resolved': case 'completed': return 'resolved';
        case 'closed': return 'closed';
        default: return '';
    }
}

function loadSlaDetailTable(apiData) {
    const tbody = document.getElementById('slaDetailTableBody');
    if (!tbody) return;
    
    let slaData;
    if (apiData && apiData.length > 0) {
        slaData = apiData.map(item => ({ priority: item.priority, label: item.priorityName, target: item.targetHours, actual: item.actualHours, rate: item.rate, trend: item.trend, timeout: item.timeout }));
    } else {
        slaData = [
            { priority: 'P1', label: '紧急', target: '1h', actual: '0.8h', rate: 98.5, trend: 'up', timeout: 0 },
            { priority: 'P2', label: '高', target: '4h', actual: '3.5h', rate: 92.1, trend: 'down', timeout: 2 },
            { priority: 'P3', label: '中', target: '8h', actual: '7.8h', rate: 95.2, trend: 'up', timeout: 1 },
            { priority: 'P4', label: '低', target: '24h', actual: '22.4h', rate: 97.8, trend: 'up', timeout: 1 }
        ];
    }
    
    tbody.innerHTML = slaData.map(item => {
        const priorityClass = item.priority.toLowerCase();
        const rateClass = item.rate >= 95 ? 'success' : item.rate >= 90 ? 'warning' : 'danger';
        const trendHtml = item.trend === 'up' ? '<span class="trend-icon up"><i class="fas fa-arrow-up"></i></span>' : '<span class="trend-icon down"><i class="fas fa-arrow-down"></i></span>';
        const timeoutClass = item.timeout > 0 ? 'has-timeout' : '';
        return `<tr><td><span class="priority-tag ${priorityClass}">${item.priority}(${item.label})</span></td><td>${item.target}</td><td>${item.actual}</td><td><span class="rate-value ${rateClass}">${item.rate}%</span></td><td>${trendHtml}</td><td><span class="timeout-count ${timeoutClass}">${item.timeout}</span></td></tr>`;
    }).join('');
}

// ========== 网络监控 - 网络状态监控仪表盘 ==========
let networkTrafficTrendChart = null;
let topDevicesChart = null;
let networkNodeMapChart = null;
let networkNodesData = [];
let currentLinkId = 0;

async function loadNetworkMonitorData() {
    console.log('加载网络状态监控数据...');
    
    await loadNetworkLinks();
    
    try {
        const [kpiRes, trendRes, devicesRes, nodesRes, tableRes] = await Promise.all([
            fetch(`/api/bigscreen/netops/kpi?linkId=${currentLinkId}`).then(r => r.json()),
            fetch(`/api/bigscreen/netops/traffic-trend?linkId=${currentLinkId}`).then(r => r.json()),
            fetch('/api/bigscreen/netops/top-devices').then(r => r.json()),
            fetch('/api/bigscreen/netops/nodes').then(r => r.json()),
            fetch('/api/bigscreen/netops/node-table').then(r => r.json())
        ]);
        
        if (kpiRes.code === 200 && kpiRes.data) updateNetworkKpi(kpiRes.data);
        if (trendRes.code === 200 && trendRes.data) initNetworkTrafficTrendChart(trendRes.data); else initNetworkTrafficTrendChart(null);
        if (devicesRes.code === 200 && devicesRes.data) initTopDevicesChart(devicesRes.data); else initTopDevicesChart(null);
        if (nodesRes.code === 200 && nodesRes.data) {
            // 新格式：包含nodes和links
            const data = nodesRes.data;
            networkNodesData = data.nodes || data;
            initNetworkNodeMapChart(data.nodes || data, data.links || []);
        } else {
            initNetworkNodeMapChart(null, []);
        }
        if (tableRes.code === 200 && tableRes.data) loadNetworkNodeTable(tableRes.data); else loadNetworkNodeTable(null);
    } catch (error) {
        console.error('加载网络监控数据失败:', error);
        initNetworkTrafficTrendChart(null);
        initTopDevicesChart(null);
        initNetworkNodeMapChart(null, []);
        loadNetworkNodeTable(null);
    }
    
    const linkSelect = document.getElementById('networkLinkSelect');
    if (linkSelect) {
        linkSelect.removeEventListener('change', handleLinkChange);
        linkSelect.addEventListener('change', handleLinkChange);
    }
    
    const searchInput = document.getElementById('nodeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() { filterNetworkNodes(this.value); });
    }
}

// 加载网络链路列表
async function loadNetworkLinks() {
    try {
        const res = await fetch('/api/bigscreen/netops/links').then(r => r.json());
        if (res.code === 200 && res.data) {
            const select = document.getElementById('networkLinkSelect');
            if (select) {
                select.innerHTML = '<option value="0">全部链路</option>' + 
                    res.data.map(link => `<option value="${link.id}">${link.name} (${link.bandwidth})</option>`).join('');
            }
        }
    } catch (error) {
        console.error('加载链路列表失败:', error);
    }
}

// 链路切换事件处理
async function handleLinkChange() {
    currentLinkId = parseInt(this.value) || 0;
    console.log('切换链路:', currentLinkId);
    
    try {
        const [kpiRes, trendRes] = await Promise.all([
            fetch(`/api/bigscreen/netops/kpi?linkId=${currentLinkId}`).then(r => r.json()),
            fetch(`/api/bigscreen/netops/traffic-trend?linkId=${currentLinkId}`).then(r => r.json())
        ]);
        
        if (kpiRes.code === 200 && kpiRes.data) {
            updateNetworkKpi(kpiRes.data);
        }
        
        if (trendRes.code === 200 && trendRes.data) {
            initNetworkTrafficTrendChart(trendRes.data);
        }
    } catch (error) {
        console.error('刷新链路数据失败:', error);
    }
}

// 更新网络KPI
function updateNetworkKpi(data) {
    const latencyEl = document.getElementById('netAvgLatency');
    if (latencyEl) latencyEl.innerHTML = `${data.latency}<span class="unit">ms</span>`;
    
    const latencyDiffEl = document.getElementById('netLatencyDiff');
    if (latencyDiffEl) {
        const diff = data.latencyDiff || 0;
        latencyDiffEl.textContent = `${Math.abs(diff)}ms`;
        const trendEl = latencyDiffEl.closest('.netops-kpi-trend');
        if (trendEl) {
            trendEl.className = `netops-kpi-trend ${diff <= 0 ? 'good' : 'bad'}`;
            trendEl.querySelector('i').className = `fas fa-arrow-${diff <= 0 ? 'down' : 'up'}`;
        }
    }
    
    const lossEl = document.getElementById('netPacketLoss');
    if (lossEl) lossEl.innerHTML = `${data.loss}<span class="unit">%</span>`;
    
    const lossDiffEl = document.getElementById('netLossDiff');
    if (lossDiffEl) {
        const diff = data.lossDiff || 0;
        lossDiffEl.textContent = `${Math.abs(diff)}%`;
        const trendEl = lossDiffEl.closest('.netops-kpi-trend');
        if (trendEl) {
            trendEl.className = `netops-kpi-trend ${diff <= 0 ? 'good' : 'bad'}`;
            trendEl.querySelector('i').className = `fas fa-arrow-${diff <= 0 ? 'down' : 'up'}`;
        }
    }
    
    const trafficEl = document.getElementById('netTotalTraffic');
    if (trafficEl) trafficEl.innerHTML = `${data.traffic}<span class="unit">GB</span>`;
    
    const trafficDiffEl = document.getElementById('netTrafficDiff');
    if (trafficDiffEl) {
        const diff = data.trafficDiff || 0;
        trafficDiffEl.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} GB`;
    }
    
    const healthEl = document.getElementById('netHealthScore');
    if (healthEl) healthEl.innerHTML = `${data.health}<span class="unit">%</span>`;
    
    const congestionEl = document.getElementById('netCongestion');
    if (congestionEl) congestionEl.textContent = `${data.congestion}%`;
}

// 网络流量趋势图 - 双曲线面积图
function initNetworkTrafficTrendChart(apiData) {
    const chartDom = document.getElementById('networkTrafficTrendChart');
    if (!chartDom) return;
    
    if (networkTrafficTrendChart) networkTrafficTrendChart.dispose();
    networkTrafficTrendChart = echarts.init(chartDom);
    
    let hours, inboundData, outboundData, threshold;
    
    if (apiData && apiData.hours && apiData.hours.length > 0) {
        hours = apiData.hours;
        inboundData = apiData.inbound;
        outboundData = apiData.outbound;
        threshold = apiData.threshold || 100;
    } else {
        // 模拟数据
        hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
        }
        inboundData = [45, 52, 48, 42, 38, 35, 42, 68, 85, 92, 88, 95, 102, 98, 92, 88, 95, 110, 105, 98, 85, 72, 58, 48];
        outboundData = [38, 45, 42, 35, 32, 28, 35, 55, 72, 78, 75, 82, 88, 85, 78, 75, 82, 95, 90, 85, 72, 62, 48, 42];
        threshold = 100;
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    if (p.seriesName !== '阈值') {
                        result += `<div><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p.color};margin-right:6px;"></span>${p.seriesName}: ${p.value} Gbps</div>`;
                    }
                });
                result += `<div style="color:#f59e0b;margin-top:4px;"><span style="display:inline-block;width:10px;height:2px;background:#f59e0b;margin-right:6px;border-style:dashed;"></span>阈值: ${threshold} Gbps</div>`;
                return result;
            }
        },
        legend: { show: false },
        grid: { left: '3%', right: '4%', bottom: '8%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: hours,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, interval: 2 }
        },
        yAxis: {
            type: 'value',
            name: 'Gbps',
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '入口流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: inboundData,
                lineStyle: { color: '#3b82f6', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
                    ])
                }
            },
            {
                name: '出口流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: outboundData,
                lineStyle: { color: '#10b981', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
                    ])
                }
            },
            {
                name: '阈值',
                type: 'line',
                symbol: 'none',
                data: Array(24).fill(threshold),
                lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' }
            }
        ]
    };
    networkTrafficTrendChart.setOption(option);
}

// 高流量设备Top5 - 水平条形图
function initTopDevicesChart(apiData) {
    const chartDom = document.getElementById('topDevicesChart');
    if (!chartDom) return;
    
    if (topDevicesChart) topDevicesChart.dispose();
    topDevicesChart = echarts.init(chartDom);
    
    let deviceData;
    if (apiData && apiData.length > 0) {
        deviceData = apiData.map(d => ({ name: d.name, value: d.value })).reverse();
    } else {
        deviceData = [
            { name: '核心交换机-BJ-01', value: 2.85 },
            { name: '边界路由器-SH-02', value: 2.42 },
            { name: '数据中心-GZ-03', value: 1.98 },
            { name: '分支网关-SZ-04', value: 1.65 },
            { name: '接入交换机-CD-05', value: 1.32 }
        ].reverse();
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                return `<div style="font-weight:bold;">${params[0].name}</div><div>流量: ${params[0].value} TB</div>`;
            }
        },
        grid: { left: '3%', right: '10%', bottom: '5%', top: '5%', containLabel: true },
        xAxis: {
            type: 'value',
            name: 'TB',
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: deviceData.map(d => d.name),
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#e0e6ed', fontSize: 11, width: 120, overflow: 'truncate' }
        },
        series: [{
            type: 'bar',
            barWidth: 16,
            data: deviceData.map((d, i) => ({
                value: d.value,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: `rgba(59, 130, 246, ${0.4 + i * 0.12})` },
                        { offset: 1, color: `rgba(6, 182, 212, ${0.6 + i * 0.08})` }
                    ]),
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            label: {
                show: true,
                position: 'right',
                color: '#94a3b8',
                fontSize: 11,
                formatter: '{c} TB'
            }
        }]
    };
    topDevicesChart.setOption(option);
    
    // 点击打开设备流量趋势模态框
    topDevicesChart.on('click', function(params) {
        openDeviceTrafficModal(params.name);
    });
}

// 打开设备流量趋势模态框
function openDeviceTrafficModal(deviceName) {
    const modal = document.getElementById('deviceTrafficModal');
    const titleEl = document.getElementById('modalDeviceName');
    if (!modal) return;
    
    titleEl.textContent = deviceName + ' - 流量趋势';
    modal.style.display = 'flex';
    
    // 初始化图表
    const chartDom = document.getElementById('deviceTrafficChart');
    const chart = echarts.init(chartDom);
    
    // 生成模拟24小时流量数据
    const hours = [];
    const inData = [];
    const outData = [];
    for (let i = 0; i < 24; i++) {
        hours.push(i.toString().padStart(2, '0') + ':00');
        inData.push(Math.round((Math.random() * 300 + 100) * 10) / 10);
        outData.push(Math.round((Math.random() * 200 + 80) * 10) / 10);
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['入口流量', '出口流量'],
            textStyle: { color: '#94a3b8' },
            top: 5
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
        xAxis: {
            type: 'category',
            data: hours,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            name: 'GB',
            nameTextStyle: { color: '#94a3b8' },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '入口流量',
                type: 'line',
                smooth: true,
                data: inData,
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#3b82f6' },
                areaStyle: { color: 'rgba(59, 130, 246, 0.2)' }
            },
            {
                name: '出口流量',
                type: 'line',
                smooth: true,
                data: outData,
                lineStyle: { color: '#34d399', width: 2 },
                itemStyle: { color: '#34d399' },
                areaStyle: { color: 'rgba(52, 211, 153, 0.2)' }
            }
        ]
    };
    chart.setOption(option);
    
    // 更新统计数据
    document.getElementById('modalInPeak').textContent = Math.max(...inData).toFixed(1) + ' GB';
    document.getElementById('modalOutPeak').textContent = Math.max(...outData).toFixed(1) + ' GB';
    const avgTraffic = ((inData.reduce((a,b)=>a+b,0) + outData.reduce((a,b)=>a+b,0)) / 48).toFixed(1);
    document.getElementById('modalAvgTraffic').textContent = avgTraffic + ' GB';
    
    // ESC键关闭
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeDeviceTrafficModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// 关闭设备流量模态框
function closeDeviceTrafficModal() {
    const modal = document.getElementById('deviceTrafficModal');
    if (modal) modal.style.display = 'none';
}

// 点击模态框外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deviceTrafficModal');
    if (modal && e.target === modal) {
        closeDeviceTrafficModal();
    }
});

// 告警列表模态框功能
let currentAlertFilter = {}; // 当前的过滤条件

// 打开告警列表模态框
function openAlertListModal(filterParams) {
    const modal = document.getElementById('alertListModal');
    if (!modal) return;

    // 保存过滤条件
    currentAlertFilter = filterParams || {};

    // 显示模态框
    modal.style.display = 'flex';

    // 更新标题和过滤信息
    updateAlertModalTitle(filterParams);

    // 加载告警数据
    loadAlertListData(filterParams);
}

// 关闭告警列表模态框
function closeAlertListModal() {
    const modal = document.getElementById('alertListModal');
    if (modal) modal.style.display = 'none';
}

// 更新模态框标题
function updateAlertModalTitle(filterParams) {
    const titleEl = document.getElementById('alertModalTitle');
    const filterInfoEl = document.getElementById('alertFilterInfo');

    let title = '告警列表';
    let filterInfo = '显示所有告警';

    if (filterParams) {
        // 优先使用自定义标题
        if (filterParams.title) {
            title = filterParams.title;
        }

        if (filterParams.timeRange === 'month') {
            filterInfo = '筛选条件：本月所有告警';
        } else if (filterParams.severity) {
            const severityMap = {
                'critical': '紧急',
                'warning': '警告',
                'info': '信息'
            };
            if (!filterParams.title) {
                title = `${severityMap[filterParams.severity] || filterParams.severity}告警`;
            }
            filterInfo = `筛选条件：严重级别 = ${severityMap[filterParams.severity] || filterParams.severity}`;
        } else if (filterParams.status) {
            const statusMap = {
                'active': '待处理',
                'resolved,acknowledged': '已解决',
                'pending': '未处理',
                'resolved': '已处理'
            };
            if (!filterParams.title) {
                title = `${statusMap[filterParams.status] || filterParams.status}告警`;
            }
            filterInfo = `筛选条件：状态 = ${statusMap[filterParams.status] || filterParams.status}`;
        }
    }

    if (titleEl) titleEl.textContent = title;
    if (filterInfoEl) filterInfoEl.textContent = filterInfo;
}

// 从数据库加载告警数据
async function loadAlertListData(filterParams) {
    const tbody = document.getElementById('alertModalTableBody');
    if (!tbody) return;

    // 显示加载状态
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">加载中...</td></tr>';

    try {
        // 构建URL参数
        const params = new URLSearchParams();
        if (filterParams) {
            if (filterParams.severity) params.append('severity', filterParams.severity);
            if (filterParams.status) params.append('status', filterParams.status);
            if (filterParams.alertCategory) params.append('alertCategory', filterParams.alertCategory);
            if (filterParams.deviceType) params.append('deviceType', filterParams.deviceType);
            if (filterParams.timeRange === 'month') {
                // 本月告警：设置时间范围为本月
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                params.append('startTime', firstDay.toISOString().split('T')[0]);
                params.append('endTime', lastDay.toISOString().split('T')[0]);
            }
        }

        // 调用API获取数据
        const response = await fetch(`/api/alert/list?${params.toString()}`);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            renderAlertTable(result.data);
            updateAlertStats(result.data);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">加载失败：' + (result.message || '未知错误') + '</td></tr>';
        }
    } catch (error) {
        console.error('加载告警数据失败:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">加载失败，请稍后重试</td></tr>';
    }
}

// 渲染告警表格
function renderAlertTable(alerts) {
    const tbody = document.getElementById('alertModalTableBody');
    if (!tbody) return;

    if (!alerts || alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">暂无数据</td></tr>';
        return;
    }

    const severityMap = {
        'critical': { text: '紧急', class: 'critical' },
        'warning': { text: '警告', class: 'warning' },
        'info': { text: '信息', class: 'info' }
    };

    const html = alerts.map(alert => {
        const severity = severityMap[alert.severity] || { text: alert.severity, class: '' };
        const time = alert.occurred_time || alert.occurredTime || alert.create_time || alert.createTime || '-';
        const deviceName = alert.device_name || alert.deviceName || '-';
        const alertType = alert.alert_category || alert.alertCategory || alert.metric_name || alert.metricName || '-';
        const description = alert.description || alert.message || '-';

        return `
            <tr>
                <td>${time}</td>
                <td>${deviceName}</td>
                <td>${alertType}</td>
                <td><span class="severity-badge ${severity.class}">${severity.text}</span></td>
                <td>${description}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

// 更新统计信息
function updateAlertStats(alerts) {
    const totalEl = document.getElementById('modalAlertTotal');
    const criticalEl = document.getElementById('modalAlertCritical');
    const warningEl = document.getElementById('modalAlertWarning');
    const infoEl = document.getElementById('modalAlertInfo');

    if (!alerts || alerts.length === 0) {
        if (totalEl) totalEl.textContent = '0';
        if (criticalEl) criticalEl.textContent = '0';
        if (warningEl) warningEl.textContent = '0';
        if (infoEl) infoEl.textContent = '0';
        return;
    }

    const total = alerts.length;
    // 统计各级别告警数量（兼容驼峰和下划线命名）
    const critical = alerts.filter(a => (a.severity || a.Severity) === 'critical').length;
    const warning = alerts.filter(a => (a.severity || a.Severity) === 'warning').length;
    const info = alerts.filter(a => (a.severity || a.Severity) === 'info').length;

    if (totalEl) totalEl.textContent = total;
    if (criticalEl) criticalEl.textContent = critical;
    if (warningEl) warningEl.textContent = warning;
    if (infoEl) infoEl.textContent = info;
}

// 查看全部告警（跳转到告警中心）
function viewAllAlerts() {
    const params = new URLSearchParams();
    if (currentAlertFilter.severity) {
        params.append('severity', currentAlertFilter.severity);
    }
    if (currentAlertFilter.status) {
        params.append('status', currentAlertFilter.status);
    }
    window.location.href = `告警中心.html?${params.toString()}`;
}

// 点击模态框外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('alertListModal');
    if (modal && e.target === modal) {
        closeAlertListModal();
    }
});

// 全国网络节点地图
function initNetworkNodeMapChart(apiData, linksData) {
    const chartDom = document.getElementById('networkNodeMapChart');
    if (!chartDom) return;
    
    if (networkNodeMapChart) networkNodeMapChart.dispose();
    networkNodeMapChart = echarts.init(chartDom);
    
    // 节点数据
    let nodes;
    if (apiData && apiData.length > 0) {
        nodes = apiData.map(n => ({
            name: n.name,
            fullName: n.fullName,
            value: n.coords,
            status: n.status,
            latency: n.latency,
            loss: n.loss,
            bandwidth: n.bandwidth
        }));
    } else {
        nodes = [
            { name: '北京', value: [116.46, 39.92], status: 'normal', latency: 2.1, loss: 0.02 },
            { name: '上海', value: [121.48, 31.22], status: 'normal', latency: 3.5, loss: 0.05 },
            { name: '广州', value: [113.23, 23.16], status: 'warning', latency: 8.2, loss: 0.12 },
            { name: '深圳', value: [114.07, 22.62], status: 'normal', latency: 4.1, loss: 0.03 },
            { name: '成都', value: [104.06, 30.67], status: 'error', latency: 15.2, loss: 0.25 },
            { name: '杭州', value: [120.19, 30.26], status: 'normal', latency: 3.8, loss: 0.02 },
            { name: '武汉', value: [114.31, 30.52], status: 'warning', latency: 9.5, loss: 0.15 },
            { name: '西安', value: [108.95, 34.27], status: 'normal', latency: 6.1, loss: 0.05 },
            { name: '南京', value: [118.78, 32.04], status: 'normal', latency: 4.8, loss: 0.03 },
            { name: '重庆', value: [106.54, 29.59], status: 'error', latency: 12.8, loss: 0.2 }
        ];
    }
    
    // 连接线数据
    let links = linksData || [];
    if (links.length === 0) {
        // 默认连接线
        links = [
            { source: '北京', target: '上海', coordsA: [116.46, 39.92], coordsB: [121.48, 31.22], status: 'normal' },
            { source: '北京', target: '广州', coordsA: [116.46, 39.92], coordsB: [113.23, 23.16], status: 'normal' },
            { source: '上海', target: '深圳', coordsA: [121.48, 31.22], coordsB: [114.07, 22.62], status: 'normal' },
            { source: '成都', target: '武汉', coordsA: [104.06, 30.67], coordsB: [114.31, 30.52], status: 'warning' },
            { source: '杭州', target: '南京', coordsA: [120.19, 30.26], coordsB: [118.78, 32.04], status: 'normal' },
            { source: '西安', target: '重庆', coordsA: [108.95, 34.27], coordsB: [106.54, 29.59], status: 'error' }
        ];
    }
    
    networkNodesData = nodes;
    
    const statusColors = { normal: '#34d399', warning: '#fbbf24', error: '#f87171' };
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                if (params.data && params.data.name) {
                    const node = nodes.find(n => n.name === params.data.name);
                    if (node) {
                        const statusText = { normal: '正常', warning: '警告', error: '异常' };
                        return `<div style="font-weight:bold;margin-bottom:5px;">${node.name}节点</div>
                                <div>状态: <span style="color:${statusColors[node.status]}">${statusText[node.status]}</span></div>
                                <div>延迟: ${node.latency}ms</div>
                                <div>丢包率: ${node.loss}%</div>`;
                    }
                }
                return '';
            }
        },
        geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            center: [104, 35],
            itemStyle: {
                areaColor: 'rgba(30, 41, 59, 0.8)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1
            },
            emphasis: {
                itemStyle: {
                    areaColor: 'rgba(59, 130, 246, 0.2)'
                }
            }
        },
        series: [{
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: nodes.map(node => ({
                name: node.name,
                value: [...node.value, node.latency],
                status: node.status,
                itemStyle: { color: statusColors[node.status] }
            })),
            symbolSize: function(val) {
                return 12 + val[2] * 0.5;
            },
            rippleEffect: {
                brushType: 'stroke',
                scale: 3,
                period: 4
            },
            label: {
                show: true,
                position: 'right',
                formatter: '{b}',
                color: '#94a3b8',
                fontSize: 10
            }
        }]
    };
    
    // 直接使用散点图模式（不依赖地图JSON）
    // 构建连接线数据
    const linesData = links.map(link => ({
        coords: [link.coordsA, link.coordsB],
        lineStyle: {
            color: statusColors[link.status] || '#3b82f6',
            width: 2,
            opacity: 0.6,
            curveness: 0.2
        },
        source: link.source,
        target: link.target,
        status: link.status,
        bandwidth: link.bandwidth
    }));
    
    const scatterOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                if (params.seriesType === 'effectScatter' && params.data && params.data.name) {
                    const node = nodes.find(n => n.name === params.data.name);
                    if (node) {
                        const statusText = { normal: '正常', warning: '警告', error: '异常' };
                        return `<div style="font-weight:bold;margin-bottom:5px;">${node.name}节点</div>
                                <div>状态: <span style="color:${statusColors[node.status]}">${statusText[node.status]}</span></div>
                                <div>延迟: ${node.latency}ms</div>
                                <div>丢包率: ${node.loss}%</div>`;
                    }
                } else if (params.seriesType === 'lines' && params.data) {
                    const statusText = { normal: '正常', warning: '警告', error: '异常' };
                    return `<div style="font-weight:bold;margin-bottom:5px;">${params.data.source} → ${params.data.target}</div>
                            <div>状态: <span style="color:${statusColors[params.data.status]}">${statusText[params.data.status] || '未知'}</span></div>
                            <div>带宽: ${params.data.bandwidth || '-'}</div>`;
                }
                return '';
            }
        },
        grid: { left: '3%', right: '3%', top: '5%', bottom: '5%' },
        xAxis: { 
            type: 'value', 
            min: 100, max: 125,
            show: false,
            scale: true
        },
        yAxis: { 
            type: 'value', 
            min: 18, max: 45,
            show: false,
            scale: true
        },
        series: [
            // 连接线
            {
                type: 'lines',
                coordinateSystem: 'cartesian2d',
                polyline: false,
                data: linesData,
                lineStyle: {
                    width: 2,
                    opacity: 0.6,
                    curveness: 0.2
                },
                effect: {
                    show: true,
                    period: 4,
                    trailLength: 0.3,
                    symbol: 'arrow',
                    symbolSize: 6,
                    color: '#60a5fa'
                },
                zlevel: 1
            },
            // 节点散点
            {
                type: 'effectScatter',
                coordinateSystem: 'cartesian2d',
                data: nodes.map(node => ({
                    name: node.name,
                    value: [node.value[0], node.value[1], node.latency || 5],
                    status: node.status,
                    itemStyle: { color: statusColors[node.status] }
                })),
                symbolSize: function(val) {
                    return 16 + (val[2] || 0) * 0.4;
                },
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 3,
                    period: 3
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    color: '#e0e6ed',
                    fontSize: 11,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowBlur: 4
                },
                zlevel: 2
            }
        ]
    };
    networkNodeMapChart.setOption(scatterOption);
    
    // 尝试加载真实中国地图（如果有API支持则升级显示）
    fetch('/api/bigscreen/china-map').then(r => r.json()).then(mapData => {
        if (mapData.code === 200 && mapData.data && !echarts.getMap('china')) {
            echarts.registerMap('china', mapData.data);
            networkNodeMapChart.setOption(option);
        }
    }).catch(() => {
        console.log('使用散点图模式显示网络节点');
    });
    
    // 点击联动表格
    networkNodeMapChart.on('click', function(params) {
        if (params.data && params.data.name) {
            highlightNodeInTable(params.data.name);
        }
    });
}

// 高亮地图上的节点
function highlightNodeOnMap(deviceName) {
    console.log('高亮地图节点:', deviceName);
    if (!networkNodeMapChart) return;
    
    // 高亮地图上对应的节点
    const nodesData = networkNodesData || [];
    const nodeIndex = nodesData.findIndex(n => n.name === deviceName || n.name.includes(deviceName));
    if (nodeIndex >= 0) {
        networkNodeMapChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 1,
            dataIndex: nodeIndex
        });
        // 3秒后取消高亮
        setTimeout(() => {
            networkNodeMapChart.dispatchAction({
                type: 'downplay',
                seriesIndex: 1,
                dataIndex: nodeIndex
            });
        }, 3000);
    }
}

// 高亮表格中的节点（支持匹配节点名称中包含的城市）
function highlightNodeInTable(nodeName) {
    const rows = document.querySelectorAll('#networkNodeTableBody tr');
    const tableContainer = document.querySelector('.card-node-table .netops-card-body');
    let firstMatch = null;
    
    rows.forEach(row => {
        row.classList.remove('selected', 'highlighted');
        const rowName = row.dataset.name || '';
        const endpointA = row.dataset.endpointA || '';
        const endpointB = row.dataset.endpointB || '';
        // 匹配：链路名称包含城市名，或端点A/B包含城市名
        if (rowName.includes(nodeName) || endpointA.includes(nodeName) || endpointB.includes(nodeName)) {
            row.classList.add('highlighted');
            if (!firstMatch) firstMatch = row;
        }
    });
    
    // 滚动到第一个匹配的行
    if (firstMatch && tableContainer) {
        // 计算行相对于表格容器的位置
        const table = tableContainer.querySelector('table');
        const thead = table?.querySelector('thead');
        const theadHeight = thead?.offsetHeight || 40;
        const rowRect = firstMatch.getBoundingClientRect();
        const containerRect = tableContainer.getBoundingClientRect();
        const scrollOffset = rowRect.top - containerRect.top + tableContainer.scrollTop - theadHeight - 10;
        
        tableContainer.scrollTo({ 
            top: Math.max(0, scrollOffset), 
            behavior: 'smooth' 
        });
    }
}

// 加载网络节点表格
function loadNetworkNodeTable(apiData) {
    const tbody = document.getElementById('networkNodeTableBody');
    if (!tbody) return;
    
    let nodes;
    if (apiData && apiData.length > 0) {
        nodes = apiData.map(n => ({
            name: n.name,
            status: n.status,
            latency: n.latency,
            loss: n.loss,
            bandwidth: n.bandwidth
        }));
    } else {
        nodes = [
            { name: '北京-核心节点', status: 'normal', latency: 2.1, loss: '0.02%', bandwidth: 45 },
            { name: '上海-核心节点', status: 'normal', latency: 3.5, loss: '0.05%', bandwidth: 62 },
            { name: '广州-核心节点', status: 'warning', latency: 8.2, loss: '0.12%', bandwidth: 78 },
            { name: '深圳-边缘节点', status: 'normal', latency: 4.1, loss: '0.03%', bandwidth: 55 },
            { name: '武汉-边缘节点', status: 'error', latency: 15.5, loss: '0.35%', bandwidth: 92 },
            { name: '成都-边缘节点', status: 'normal', latency: 5.2, loss: '0.04%', bandwidth: 48 },
            { name: '杭州-边缘节点', status: 'normal', latency: 3.8, loss: '0.02%', bandwidth: 52 },
            { name: '南京-接入节点', status: 'warning', latency: 9.8, loss: '0.15%', bandwidth: 85 }
        ];
    }
    
    tbody.innerHTML = nodes.map(node => {
        const statusClass = node.status;
        const bandwidthClass = node.bandwidth >= 80 ? 'high' : node.bandwidth >= 50 ? 'medium' : 'low';
        const latencyColor = node.latency > 10 ? '#f87171' : node.latency > 5 ? '#fbbf24' : '#34d399';
        // 提取链路两端城市名
        const nameParts = node.name.split('-');
        const endpointA = nameParts[0] || '';
        const endpointB = nameParts[1]?.split(/专线|骨干|边缘|IDC/)[0] || '';
        
        return `
            <tr data-name="${node.name}" data-endpoint-a="${endpointA}" data-endpoint-b="${endpointB}">
                <td>
                    <div class="node-status-indicator">
                        <span class="status-dot ${statusClass}"></span>
                    </div>
                </td>
                <td>${node.name}</td>
                <td style="color:${latencyColor}">${node.latency}</td>
                <td>${node.loss}</td>
                <td>
                    <div class="bandwidth-bar">
                        <div class="bar-container">
                            <div class="bar-fill ${bandwidthClass}" style="width:${node.bandwidth}%"></div>
                        </div>
                        <span class="bar-value ${bandwidthClass}">${node.bandwidth}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 绑定行点击事件
    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', function() {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected', 'highlighted'));
            this.classList.add('selected');
            // 联动地图 - 高亮两端节点
            const endpointA = this.dataset.endpointA;
            const endpointB = this.dataset.endpointB;
            if (endpointA) highlightNodeOnMap(endpointA);
            if (endpointB) setTimeout(() => highlightNodeOnMap(endpointB), 100);
        });
    });
}

// 过滤网络节点
function filterNetworkNodes(keyword) {
    const rows = document.querySelectorAll('#networkNodeTableBody tr');
    keyword = keyword.toLowerCase();
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        row.style.display = name.includes(keyword) ? '' : 'none';
    });
}

// 旧网络监控数据加载（已弃用，被网络状态监控仪表盘替换）
let latencySparklineChart = null;
let successRateRingChart = null;
let alertCategoryBarChart = null;
let latencyTrendChart = null;
let networkTopologyChart = null;

// 此函数已被移至上方的loadNetworkMonitorData()
// function loadOldNetworkMonitorData() { ... }

// 延迟迷你折线图
function initLatencySparkline() {
    const chartDom = document.getElementById('latencySparkline');
    if (!chartDom) return;
    
    if (latencySparklineChart) latencySparklineChart.dispose();
    latencySparklineChart = echarts.init(chartDom);
    
    const option = {
        grid: { left: 0, right: 0, top: 2, bottom: 2 },
        xAxis: { type: 'category', show: false, data: [1,2,3,4,5,6,7,8] },
        yAxis: { type: 'value', show: false },
        series: [{
            type: 'line',
            data: [4.8, 5.1, 4.9, 5.3, 5.0, 5.4, 5.1, 5.2],
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#60a5fa', width: 2 },
            areaStyle: { color: 'rgba(96, 165, 250, 0.2)' }
        }]
    };
    latencySparklineChart.setOption(option);
}

// 成功率环形图
function initSuccessRateRing() {
    const chartDom = document.getElementById('successRateRing');
    if (!chartDom) return;
    
    if (successRateRingChart) successRateRingChart.dispose();
    successRateRingChart = echarts.init(chartDom);
    
    const option = {
        series: [{
            type: 'pie',
            radius: ['70%', '90%'],
            silent: true,
            label: { show: false },
            data: [
                { value: 99.8, itemStyle: { color: '#a78bfa' } },
                { value: 0.2, itemStyle: { color: 'rgba(139, 92, 246, 0.15)' } }
            ]
        }]
    };
    successRateRingChart.setOption(option);
}

// 告警分类条形图
function initAlertCategoryBarChart() {
    const chartDom = document.getElementById('alertCategoryBarChart');
    if (!chartDom) return;
    
    if (alertCategoryBarChart) alertCategoryBarChart.dispose();
    alertCategoryBarChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            confine: true,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
        xAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: ['磁盘空间不足', '服务响应超时', '内存使用过高', 'CPU超载', '网络延迟'],
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#e0e6ed', fontSize: 11 }
        },
        series: [{
            type: 'bar',
            barWidth: 16,
            data: [
                { value: 3, itemStyle: { color: '#f59e0b' } },
                { value: 5, itemStyle: { color: '#f59e0b' } },
                { value: 8, itemStyle: { color: '#ef4444' } },
                { value: 12, itemStyle: { color: '#ef4444' } },
                { value: 15, itemStyle: { color: '#ef4444' } }
            ],
            itemStyle: { borderRadius: [0, 4, 4, 0] }
        }]
    };
    alertCategoryBarChart.setOption(option);
}

// 延迟趋势面积图
function initLatencyTrendChart() {
    const chartDom = document.getElementById('latencyTrendChart');
    if (!chartDom) return;
    
    if (latencyTrendChart) latencyTrendChart.dispose();
    latencyTrendChart = echarts.init(chartDom);
    
    const days = Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return `${d.getMonth()+1}/${d.getDate()}`;
    });
    
    const avgData = [4.2,4.5,4.3,4.8,5.1,4.9,5.2,4.8,4.6,5.0,5.3,4.7,4.9,5.1,4.8,5.0,5.2,4.9,5.1,5.4,5.0,4.8,5.2,4.9,5.1,5.3,5.0,5.2,4.8,5.2];
    const peakData = [6.5,7.2,6.8,7.5,8.1,7.4,8.0,7.2,7.0,7.8,8.2,7.1,7.5,7.9,7.3,7.6,8.0,7.4,7.8,8.3,7.5,7.2,8.0,7.4,7.8,8.1,7.6,8.0,7.3,7.8];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['平均延迟', '峰值延迟'],
            textStyle: { color: '#94a3b8', fontSize: 10 },
            right: 10, top: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: days,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 4 }
        },
        yAxis: {
            type: 'value',
            name: 'ms',
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '峰值延迟',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#f59e0b', width: 1, type: 'dashed' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(245, 158, 11, 0.25)' },
                        { offset: 1, color: 'rgba(245, 158, 11, 0.02)' }
                    ])
                },
                data: peakData
            },
            {
                name: '平均延迟',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 4,
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#60a5fa' },
                data: avgData
            }
        ]
    };
    latencyTrendChart.setOption(option);
}

// 网络拓扑图
function initNetworkTopologyChart() {
    const chartDom = document.getElementById('networkTopologyChart');
    if (!chartDom) return;
    
    if (networkTopologyChart) networkTopologyChart.dispose();
    networkTopologyChart = echarts.init(chartDom);
    
    const nodes = [
        { name: '核心交换机', x: 300, y: 80, symbolSize: 50, category: 0, status: 'normal' },
        { name: 'Web服务器-01', x: 150, y: 180, symbolSize: 35, category: 1, status: 'normal' },
        { name: 'Web服务器-02', x: 300, y: 180, symbolSize: 35, category: 1, status: 'warning' },
        { name: 'Web服务器-03', x: 450, y: 180, symbolSize: 35, category: 1, status: 'normal' },
        { name: '数据库主', x: 200, y: 280, symbolSize: 40, category: 2, status: 'normal' },
        { name: '数据库从', x: 400, y: 280, symbolSize: 40, category: 2, status: 'normal' },
        { name: '缓存服务器', x: 100, y: 280, symbolSize: 30, category: 3, status: 'error' },
        { name: '文件服务器', x: 500, y: 280, symbolSize: 30, category: 3, status: 'normal' },
        { name: '防火墙', x: 300, y: 380, symbolSize: 35, category: 4, status: 'normal' }
    ];
    
    const links = [
        { source: '核心交换机', target: 'Web服务器-01' },
        { source: '核心交换机', target: 'Web服务器-02' },
        { source: '核心交换机', target: 'Web服务器-03' },
        { source: 'Web服务器-01', target: '数据库主' },
        { source: 'Web服务器-02', target: '数据库主' },
        { source: 'Web服务器-03', target: '数据库从' },
        { source: '数据库主', target: '数据库从' },
        { source: 'Web服务器-01', target: '缓存服务器' },
        { source: 'Web服务器-03', target: '文件服务器' },
        { source: '核心交换机', target: '防火墙' }
    ];
    
    const categories = [
        { name: '核心设备' },
        { name: 'Web服务器' },
        { name: '数据库' },
        { name: '辅助服务' },
        { name: '安全设备' }
    ];
    
    const statusColors = {
        normal: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    nodes.forEach(node => {
        node.itemStyle = {
            color: statusColors[node.status],
            borderColor: statusColors[node.status],
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: statusColors[node.status]
        };
    });
    
    const option = {
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            confine: true,
            formatter: function(params) {
                if (params.dataType === 'node') {
                    const node = params.data;
                    const statusText = { normal: '正常', warning: '警告', error: '异常' };
                    return `<strong>${node.name}</strong><br/>状态: ${statusText[node.status]}`;
                }
                return '';
            }
        },
        series: [{
            type: 'graph',
            layout: 'none',
            roam: true,
            draggable: true,
            categories: categories,
            data: nodes,
            links: links,
            label: {
                show: true,
                position: 'bottom',
                fontSize: 10,
                color: '#94a3b8'
            },
            lineStyle: {
                color: 'rgba(59, 130, 246, 0.4)',
                width: 2,
                curveness: 0.1
            },
            emphasis: {
                focus: 'adjacency',
                lineStyle: { width: 4 }
            }
        }]
    };
    
    networkTopologyChart.setOption(option);
    
    // 点击节点显示详情
    networkTopologyChart.on('click', function(params) {
        if (params.dataType === 'node') {
            showNodeDetail(params.data);
        }
    });
}

// 显示节点详情
function showNodeDetail(node) {
    const panel = document.getElementById('nodeDetailPanel');
    if (!panel) return;
    
    const statusClass = { normal: 'normal', warning: 'warning', error: 'error' };
    const statusText = { normal: '正常', warning: '警告', error: '异常' };
    
    panel.innerHTML = `
        <div class="node-info">
            <div class="node-info-header">
                <div class="node-info-icon ${statusClass[node.status]}">
                    <i class="fas fa-server"></i>
                </div>
                <div class="node-info-title">
                    <h4>${node.name}</h4>
                    <span>节点ID: ${node.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}</span>
                </div>
            </div>
            <div class="node-info-row"><span class="label">状态</span><span class="value">${statusText[node.status]}</span></div>
            <div class="node-info-row"><span class="label">IP地址</span><span class="value">192.168.1.${Math.floor(Math.random()*200+10)}</span></div>
            <div class="node-info-row"><span class="label">CPU使用率</span><span class="value">${Math.floor(Math.random()*40+30)}%</span></div>
            <div class="node-info-row"><span class="label">内存使用率</span><span class="value">${Math.floor(Math.random()*30+40)}%</span></div>
            <div class="node-info-row"><span class="label">网络延迟</span><span class="value">${(Math.random()*5+2).toFixed(1)}ms</span></div>
            <div class="node-info-row"><span class="label">运行时间</span><span class="value">${Math.floor(Math.random()*30+1)}天</span></div>
        </div>
    `;
}

// 加载活动告警列表
function loadActiveAlertList() {
    const container = document.getElementById('activeAlertList');
    if (!container) return;
    
    const alerts = [
        { node: '缓存服务器', time: '10:45:32', content: '服务响应超时，连接失败', level: 'critical', status: 'pending' },
        { node: 'Web服务器-02', time: '10:32:18', content: 'CPU使用率超过85%阈值', level: 'warning', status: 'confirmed' },
        { node: '数据库主', time: '09:58:05', content: '磁盘空间使用率达到90%', level: 'warning', status: 'pending' }
    ];
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.level}" onclick="highlightTopologyNode('${alert.node}')">
            <div class="alert-item-header">
                <span class="alert-node">${alert.node}</span>
                <span class="alert-time">${alert.time}</span>
            </div>
            <div class="alert-content">${alert.content}</div>
            <span class="alert-status ${alert.status}">${alert.status === 'pending' ? '未处理' : '已确认'}</span>
        </div>
    `).join('');
}

// 高亮拓扑图节点
function highlightTopologyNode(nodeName) {
    if (networkTopologyChart) {
        networkTopologyChart.dispatchAction({
            type: 'highlight',
            name: nodeName
        });
        setTimeout(() => {
            networkTopologyChart.dispatchAction({
                type: 'downplay',
                name: nodeName
            });
        }, 2000);
    }
}

// 机房管理数据加载
let networkThroughputChart = null;
let temperatureChart = null;
let humidityChart = null;

function loadDatacenterData() {
    console.log('加载机房管理数据...');
    loadTaskOverviewData();
    initNetworkThroughputChart();
    initTemperatureChart();
    initHumidityChart();
}

// 核心任务概览表格数据
function loadTaskOverviewData() {
    const tbody = document.getElementById('taskOverviewBody');
    if (!tbody) return;
    
    const tasks = [
        { name: '数据采集任务-01', status: 'running', progress: 78, cpu: 45, memory: 62 },
        { name: 'ETL处理流程', status: 'running', progress: 92, cpu: 68, memory: 75 },
        { name: '日志分析服务', status: 'waiting', progress: 0, cpu: 12, memory: 35 },
        { name: '备份同步任务', status: 'running', progress: 56, cpu: 32, memory: 48 },
        { name: '报表生成服务', status: 'failed', progress: 23, cpu: 0, memory: 15 },
        { name: '监控告警服务', status: 'running', progress: 100, cpu: 28, memory: 42 }
    ];
    
    const statusText = { running: '运行中', waiting: '等待中', failed: '失败' };
    
    tbody.innerHTML = tasks.map(task => {
        const progressClass = task.progress >= 80 ? 'high' : task.progress >= 40 ? 'medium' : 'low';
        return `
            <tr>
                <td>${task.name}</td>
                <td><span class="task-status ${task.status}">${statusText[task.status]}</span></td>
                <td>
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${task.progress}%"></div>
                        </div>
                        <span class="progress-text">${task.progress}%</span>
                    </div>
                </td>
                <td>${task.cpu}%</td>
                <td>${task.memory}%</td>
            </tr>
        `;
    }).join('');
}

// 网络吞吐量双曲线图
function initNetworkThroughputChart() {
    const chartDom = document.getElementById('networkThroughputChart');
    if (!chartDom) return;
    
    if (networkThroughputChart) networkThroughputChart.dispose();
    networkThroughputChart = echarts.init(chartDom);
    
    const times = Array.from({length: 60}, (_, i) => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (59 - i));
        return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    
    const inboundData = times.map(() => (Math.random() * 4 + 2).toFixed(2));
    const outboundData = times.map(() => (Math.random() * 3 + 1).toFixed(2));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' }
        },
        legend: {
            data: ['入口流量', '出口流量'],
            textStyle: { color: '#94a3b8', fontSize: 11 },
            right: 10, top: 5
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 9 }
        },
        yAxis: {
            type: 'value',
            name: 'Gbps',
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '入口流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#3b82f6', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
                    ])
                },
                data: inboundData
            },
            {
                name: '出口流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#10b981', width: 2, type: 'dashed' },
                data: outboundData
            }
        ]
    };
    networkThroughputChart.setOption(option);
}

// 温度监控图表
function initTemperatureChart() {
    const chartDom = document.getElementById('temperatureChart');
    if (!chartDom) return;
    
    if (temperatureChart) temperatureChart.dispose();
    temperatureChart = echarts.init(chartDom);
    
    const times = Array.from({length: 24}, (_, i) => `${i}:00`);
    const tempData = [22, 22.5, 23, 23.5, 24, 24.5, 25, 26, 27, 28, 27.5, 26, 25, 24.5, 24, 23.5, 23, 22.5, 22, 21.5, 21, 20.5, 21, 21.5];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}<br/>温度: {c}°C'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 3 }
        },
        yAxis: {
            type: 'value',
            min: 15,
            max: 35,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}°C' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        visualMap: {
            show: false,
            pieces: [
                { lte: 18, color: '#60a5fa' },
                { gt: 18, lte: 27, color: '#10b981' },
                { gt: 27, color: '#ef4444' }
            ]
        },
        series: [{
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: tempData,
            lineStyle: { width: 2 },
            markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: { type: 'dashed', width: 1 },
                data: [
                    { yAxis: 18, label: { formatter: '安全下限 18°C', color: '#94a3b8', fontSize: 9 }, lineStyle: { color: '#f59e0b' } },
                    { yAxis: 27, label: { formatter: '安全上限 27°C', color: '#94a3b8', fontSize: 9 }, lineStyle: { color: '#f59e0b' } }
                ]
            },
            markArea: {
                silent: true,
                itemStyle: { color: 'rgba(16, 185, 129, 0.08)' },
                data: [[{ yAxis: 18 }, { yAxis: 27 }]]
            }
        }]
    };
    temperatureChart.setOption(option);
}

// 湿度监控图表
function initHumidityChart() {
    const chartDom = document.getElementById('humidityChart');
    if (!chartDom) return;
    
    if (humidityChart) humidityChart.dispose();
    humidityChart = echarts.init(chartDom);
    
    const times = Array.from({length: 24}, (_, i) => `${i}:00`);
    const humidityData = [45, 46, 48, 50, 52, 55, 58, 60, 62, 65, 63, 60, 58, 55, 52, 50, 48, 46, 45, 44, 43, 42, 43, 44];
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}<br/>湿度: {c}%'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9, interval: 3 }
        },
        yAxis: {
            type: 'value',
            min: 20,
            max: 80,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        visualMap: {
            show: false,
            pieces: [
                { lte: 40, color: '#f59e0b' },
                { gt: 40, lte: 60, color: '#06b6d4' },
                { gt: 60, color: '#ef4444' }
            ]
        },
        series: [{
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            data: humidityData,
            lineStyle: { width: 2 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(6, 182, 212, 0.25)' },
                    { offset: 1, color: 'rgba(6, 182, 212, 0.02)' }
                ])
            },
            markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: { type: 'dashed', width: 1 },
                data: [
                    { yAxis: 40, label: { formatter: '安全下限 40%', color: '#94a3b8', fontSize: 9 }, lineStyle: { color: '#f59e0b' } },
                    { yAxis: 60, label: { formatter: '安全上限 60%', color: '#94a3b8', fontSize: 9 }, lineStyle: { color: '#f59e0b' } }
                ]
            },
            markArea: {
                silent: true,
                itemStyle: { color: 'rgba(6, 182, 212, 0.08)' },
                data: [[{ yAxis: 40 }, { yAxis: 60 }]]
            }
        }]
    };
    humidityChart.setOption(option);
}

// 选择数据处理链路阶段
function selectPipelineStage(stage) {
    // 移除之前的选中状态
    document.querySelectorAll('.pipeline-stage').forEach(el => el.classList.remove('selected'));
    
    // 添加新的选中状态
    const selectedStage = document.querySelector(`.pipeline-stage[data-stage="${stage}"]`);
    if (selectedStage) {
        selectedStage.classList.add('selected');
    }
    
    // 显示详情
    const detailPanel = document.getElementById('pipelineDetail');
    if (!detailPanel) return;
    
    const stageData = {
        input: { name: '数据输入', speed: '1.2GB/s', queue: 128, success: '99.8%' },
        clean: { name: '数据清洗', speed: '850MB/s', queue: 256, success: '99.5%' },
        transform: { name: '数据转换', speed: '0', queue: 512, success: '-' },
        load: { name: '数据加载', speed: '0', queue: 0, success: '-' },
        output: { name: '数据输出', speed: '0', queue: 0, success: '-' }
    };
    
    const data = stageData[stage];
    detailPanel.innerHTML = `
        <div class="pipeline-detail-content">
            <div class="detail-item">
                <div class="label">处理速度</div>
                <div class="value ${data.speed !== '0' ? 'success' : ''}">${data.speed}</div>
            </div>
            <div class="detail-item">
                <div class="label">队列长度</div>
                <div class="value ${data.queue > 200 ? 'warning' : ''}">${data.queue}</div>
            </div>
            <div class="detail-item">
                <div class="label">成功率</div>
                <div class="value ${data.success !== '-' ? 'success' : ''}">${data.success}</div>
            </div>
        </div>
    `;
}

// 能耗监测数据加载
let slaTrendChart = null;
let cpuHeatmapChart = null;
// ========== 能耗监测页面 ==========
let energyGaugeChart = null;
let powerLossChart = null;
let waterUsageChart = null;
let efficiencyTrendChart = null;
let deviceEnergyCompareChart = null;
let building3DChart = null;

function loadEnergyData() {
    console.log('加载能耗监测数据...');
    // 从API加载数据
    loadEnergyOverviewFromAPI();
    loadPowerDistributionFromAPI();
    loadEnergyRealtimeFromAPI();
    initBuilding3DViewFromAPI();
    loadWaterUsageFromAPI();
    loadEfficiencyTrendFromAPI();
    loadDeviceEnergyRankingFromAPI();
    initEnergyViewSwitchers();
}

// 从API加载能耗总览数据
function loadEnergyOverviewFromAPI() {
    fetch('datacenter/energy/overview')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                const data = result.data;
                initEnergyGaugeChart(data.totalEnergy || 1080);
                // 更新统计卡片数据
                updateEnergyCards(data);
            } else {
                initEnergyGaugeChart(1080);
            }
        })
        .catch(error => {
            console.error('获取能耗总览数据失败:', error);
            initEnergyGaugeChart(1080);
        });
}

// 更新能耗统计卡片
function updateEnergyCards(data) {
    // 更新能效趋势百分比
    const trendEl = document.getElementById('energyTrendValue');
    if (trendEl) {
        const change = data.energyChange || 0;
        trendEl.textContent = Math.abs(change) + '%';
        // 更新趋势箭头方向
        const trendContainer = trendEl.closest('.gauge-trend');
        if (trendContainer) {
            trendContainer.classList.remove('up', 'down');
            trendContainer.classList.add(change >= 0 ? 'up' : 'down');
            const icon = trendContainer.querySelector('i');
            if (icon) {
                icon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            }
        }
    }
    
    // 更新总相能耗
    const phaseEl = document.getElementById('energyTotalPhase');
    if (phaseEl) {
        phaseEl.textContent = (data.todayEnergy || 0) + (data.yesterdayEnergy || 0);
    }
    
    // 更新关键能效指标
    const pue = data.avgPue || 1.5;
    const pueEl = document.getElementById('pueValue');
    if (pueEl) pueEl.textContent = pue.toFixed(2);
    
    // CLF (制冷负载因子) = 制冷功率 / IT功率
    const clf = data.itPower > 0 ? (data.coolingPower / data.itPower).toFixed(2) : '0.30';
    const clfEl = document.getElementById('clfValue');
    if (clfEl) clfEl.textContent = clf;
    
    // PLF (电力损耗因子) = (总功率 - IT功率 - 制冷功率) / 总功率
    const plf = data.totalPower > 0 ? ((data.totalPower - data.itPower - data.coolingPower) / data.totalPower).toFixed(2) : '0.08';
    const plfEl = document.getElementById('plfValue');
    if (plfEl) plfEl.textContent = plf;
    
    // 计算能效评级（根据PUE值）
    // PUE评级标准：
    // 1级（优秀）: PUE < 1.2
    // 2级（良好）: 1.2 <= PUE < 1.4
    // 3级（一般）: 1.4 <= PUE < 1.6
    // 4级（较差）: 1.6 <= PUE < 1.8
    // 5级（差）: PUE >= 1.8
    let rating, status, statusClass;
    if (pue < 1.2) {
        rating = '1级'; status = '优秀'; statusClass = 'success';
    } else if (pue < 1.4) {
        rating = '2级'; status = '良好'; statusClass = 'info';
    } else if (pue < 1.6) {
        rating = '3级'; status = '一般'; statusClass = 'warning';
    } else if (pue < 1.8) {
        rating = '4级'; status = '偏高'; statusClass = 'warning';
    } else {
        rating = '5级'; status = '较差'; statusClass = 'error';
    }
    
    const ratingEl = document.getElementById('efficiencyRating');
    const statusEl = document.getElementById('efficiencyStatus');
    if (ratingEl) ratingEl.textContent = rating;
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = 'rating-status ' + statusClass;
    }
}

// 从API加载电力分配数据
function loadPowerDistributionFromAPI() {
    fetch('datacenter/energy/power-distribution')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initPowerLossChart(result.data);
            } else {
                initPowerLossChart(null);
            }
        })
        .catch(error => {
            console.error('获取电力分配数据失败:', error);
            initPowerLossChart(null);
        });
}

// 从API加载实时能耗明细
function loadEnergyRealtimeFromAPI() {
    fetch('datacenter/energy/realtime')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initEnergyDetailTable(result.data);
            } else {
                initEnergyDetailTable(null);
            }
        })
        .catch(error => {
            console.error('获取实时能耗数据失败:', error);
            initEnergyDetailTable(null);
        });
}

// 从API加载用水量趋势
function loadWaterUsageFromAPI() {
    fetch('datacenter/energy/water-usage')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initWaterUsageChart(result.data);
            } else {
                initWaterUsageChart(null);
            }
        })
        .catch(error => {
            console.error('获取用水量数据失败:', error);
            initWaterUsageChart(null);
        });
}

// 从API加载能效趋势
function loadEfficiencyTrendFromAPI() {
    fetch('datacenter/energy/efficiency-trend')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initEfficiencyTrendChart(result.data);
            } else {
                initEfficiencyTrendChart(null);
            }
        })
        .catch(error => {
            console.error('获取能效趋势数据失败:', error);
            initEfficiencyTrendChart(null);
        });
}

// 从API加载设备能耗排行
function loadDeviceEnergyRankingFromAPI() {
    fetch('datacenter/energy/device-ranking')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initDeviceEnergyCompareChart(result.data);
            } else {
                initDeviceEnergyCompareChart(null);
            }
        })
        .catch(error => {
            console.error('获取设备能耗排行失败:', error);
            initDeviceEnergyCompareChart(null);
        });
}

// 从API加载机柜热力图
function initBuilding3DViewFromAPI() {
    fetch('datacenter/energy/cabinet-heatmap')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data && result.data.length > 0) {
                initBuilding3DView(result.data);
            } else {
                initBuilding3DView(null);
            }
        })
        .catch(error => {
            console.error('获取机柜热力图数据失败:', error);
            initBuilding3DView(null);
        });
}

// 总能耗仪表盘
function initEnergyGaugeChart(energyValue) {
    const chartDom = document.getElementById('energyGaugeChart');
    if (!chartDom) return;
    
    const value = energyValue || 1080;
    
    if (energyGaugeChart) energyGaugeChart.dispose();
    energyGaugeChart = echarts.init(chartDom);
    
    const option = {
        series: [{
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 2000,
            center: ['50%', '60%'],
            radius: '90%',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#22c55e' },
                    { offset: 0.5, color: '#eab308' },
                    { offset: 1, color: '#ef4444' }
                ])
            },
            progress: { show: true, width: 12 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(59, 130, 246, 0.15)']] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 20,
                fontWeight: 'bold',
                color: '#34d399',
                offsetCenter: [0, '35%'],
                formatter: '{value} kWh'
            },
            data: [{ value: value }]
        }]
    };
    energyGaugeChart.setOption(option);
}

// 电力线损构成饼图
function initPowerLossChart(apiData) {
    const chartDom = document.getElementById('powerLossChart');
    if (!chartDom) return;
    
    if (powerLossChart) powerLossChart.dispose();
    powerLossChart = echarts.init(chartDom);
    
    // 处理API数据或使用默认数据
    const colors = { 'IT设备': '#3b82f6', '制冷/散热': '#22c55e', '照明/其他': '#f59e0b', '备用电': '#8b5cf6' };
    let chartData = [
        { value: 300, name: 'IT设备', itemStyle: { color: '#3b82f6' } },
        { value: 120, name: '制冷/散热', itemStyle: { color: '#22c55e' } },
        { value: 50, name: '照明/其他', itemStyle: { color: '#f59e0b' } },
        { value: 30, name: '备用电', itemStyle: { color: '#8b5cf6' } }
    ];
    
    if (apiData && apiData.length > 0) {
        chartData = apiData.map(item => ({
            value: item.value || 0,
            name: item.name,
            itemStyle: { color: colors[item.name] || '#3b82f6' }
        }));
    }
    
    const totalPower = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}<br/>{c}kW ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: '#94a3b8', fontSize: 10 },
            itemWidth: 12,
            itemHeight: 12
        },
        series: [{
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 6,
                borderColor: 'rgba(15, 23, 42, 0.8)',
                borderWidth: 2
            },
            label: {
                show: true,
                position: 'center',
                formatter: `总功耗\n${Math.round(totalPower)}kW`,
                fontSize: 12,
                color: '#94a3b8',
                lineHeight: 18
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#e0e6ed',
                    formatter: '{b}\n{c}kW'
                }
            },
            labelLine: { show: false },
            data: chartData
        }]
    };
    powerLossChart.setOption(option);
}

// 实时能耗明细表格
function initEnergyDetailTable(apiData) {
    const tbody = document.getElementById('energyDetailBody');
    if (!tbody) return;
    
    // 使用API数据或默认数据
    const now = new Date();
    let data = [
        { time: formatTime(now, -5), room: 'A', totalPower: 230, itPower: 170, pue: 1.47, energy: 23, status: 'normal' },
        { time: formatTime(now, -4), room: 'A', totalPower: 235, itPower: 172, pue: 1.48, energy: 24, status: 'normal' },
        { time: formatTime(now, -3), room: 'B', totalPower: 180, itPower: 140, pue: 1.52, energy: 18, status: 'warning' },
        { time: formatTime(now, -2), room: 'B', totalPower: 178, itPower: 138, pue: 1.51, energy: 18, status: 'normal' },
        { time: formatTime(now, -1), room: 'C', totalPower: 95, itPower: 75, pue: 1.55, energy: 10, status: 'warning' },
        { time: formatTime(now, 0), room: 'D', totalPower: 150, itPower: 120, pue: 1.45, energy: 15, status: 'normal' }
    ];
    
    if (apiData && apiData.length > 0) {
        data = apiData.map(item => ({
            time: item.time || '--:--',
            room: item.room || '-',
            totalPower: item.totalPower || 0,
            itPower: item.itPower || 0,
            pue: item.pue || 1.5,
            energy: item.energy || 0,
            status: item.status || 'normal'
        }));
    }
    
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>${d.time}</td>
            <td>${d.room}</td>
            <td>${d.totalPower}</td>
            <td>${d.itPower}</td>
            <td>${typeof d.pue === 'number' ? d.pue.toFixed(2) : d.pue}</td>
            <td>${d.energy}</td>
            <td><span class="status-badge ${d.status}">${d.status === 'normal' ? '正常' : d.status === 'warning' ? '警告' : '异常'}</span></td>
        </tr>
    `).join('');
}

function formatTime(date, offsetMinutes) {
    const d = new Date(date.getTime() + offsetMinutes * 60000);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// 3D大楼视图（使用ECharts模拟）
function initBuilding3DView(apiData) {
    const canvas = document.getElementById('building3DCanvas');
    if (!canvas) return;
    
    if (building3DChart) building3DChart.dispose();
    building3DChart = echarts.init(canvas);
    
    // 使用API数据或生成默认数据
    const floorData = apiData && apiData.length > 0 ? apiData : generateFloorHeatmapData();
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                const temp = params.data.temperature || (25 + params.data.value[2]/10);
                return `机柜: ${params.data.name}<br/>能耗: ${params.data.value[2].toFixed(1)} kW<br/>温度: ${typeof temp === 'number' ? temp.toFixed(1) : temp}°C`;
            }
        },
        grid: { left: '5%', right: '5%', top: '8%', bottom: '8%' },
        xAxis: {
            type: 'value',
            min: 0, max: 100,
            show: false
        },
        yAxis: {
            type: 'value',
            min: 0, max: 100,
            show: false
        },
        visualMap: {
            show: false,
            min: 0,
            max: 10,
            dimension: 2,
            inRange: { color: ['#22c55e', '#eab308', '#ef4444'] }
        },
        series: [{
            type: 'scatter',
            symbolSize: function(data) { return Math.max(20, data[2] * 5 + 15); },
            data: floorData,
            emphasis: {
                focus: 'self',
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
            }
        }]
    };
    building3DChart.setOption(option);
    
    // 绑定楼层切换
    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const floor = this.dataset.floor;
            updateFloorView(floor);
        });
    });
}

function generateFloorHeatmapData() {
    const data = [];
    const rows = 4, cols = 6;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = 10 + j * 15;
            const y = 15 + i * 22;
            const power = Math.floor(Math.random() * 40 + 10);
            data.push({
                name: `机柜${String.fromCharCode(65 + i)}-${j + 1}`,
                value: [x, y, power]
            });
        }
    }
    return data;
}

function updateFloorView(floor) {
    if (!building3DChart) return;
    
    // 从API获取对应楼层的机柜数据
    const url = floor === 'all' ? 'datacenter/energy/cabinet-heatmap' : `datacenter/energy/cabinet-heatmap?floor=${floor}`;
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data && result.data.length > 0) {
                building3DChart.setOption({
                    series: [{ data: result.data }]
                });
            } else {
                // 无数据时显示空
                building3DChart.setOption({
                    series: [{ data: [] }]
                });
            }
        })
        .catch(error => {
            console.error('获取楼层数据失败:', error);
        });
}

// 水资源监控图表
function initWaterUsageChart(apiData) {
    const chartDom = document.getElementById('waterUsageChart');
    if (!chartDom) return;
    
    if (waterUsageChart) waterUsageChart.dispose();
    waterUsageChart = echarts.init(chartDom);
    
    // 使用API数据或默认数据
    let dates, waterData, wueData;
    if (apiData && apiData.dates && apiData.data) {
        dates = apiData.dates;
        waterData = apiData.data.map(d => Math.round(d * 10)); // 吨转升
        wueData = apiData.wue || apiData.data.map(() => 1.22);
    } else {
        // 无数据时显示空
        dates = [];
        waterData = [];
        wueData = [];
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            confine: true,
            position: function(point) {
                return [point[0] + 10, point[1] - 10];
            }
        },
        legend: {
            data: ['用水量', 'WUE'],
            textStyle: { color: '#94a3b8', fontSize: 9 },
            right: 60, top: 0
        },
        grid: { left: '8%', right: '10%', bottom: '12%', top: '20%' },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 8, interval: dates.length > 10 ? 3 : 0 }
        },
        yAxis: [
            {
                type: 'value',
                name: '用水量(L)',
                nameTextStyle: { color: '#94a3b8', fontSize: 9 },
                axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
                axisLabel: { color: '#94a3b8', fontSize: 9 },
                splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
            },
            {
                type: 'value',
                name: 'WUE',
                nameTextStyle: { color: '#94a3b8', fontSize: 9 },
                axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
                axisLabel: { color: '#94a3b8', fontSize: 9 },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '用水量',
                type: 'bar',
                barWidth: 8,
                itemStyle: { color: '#3b82f6', borderRadius: [2, 2, 0, 0] },
                data: waterData
            },
            {
                name: 'WUE',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                symbol: 'circle',
                symbolSize: 4,
                lineStyle: { color: '#22c55e', width: 2 },
                itemStyle: { color: '#22c55e' },
                data: wueData
            }
        ]
    };
    waterUsageChart.setOption(option);
}

// PUE/PLF/CLF趋势图
function initEfficiencyTrendChart(apiData) {
    const chartDom = document.getElementById('efficiencyTrendChart');
    if (!chartDom) return;
    
    if (efficiencyTrendChart) efficiencyTrendChart.dispose();
    efficiencyTrendChart = echarts.init(chartDom);
    
    // 使用API数据
    let days, pueData, plfData, clfData;
    if (apiData && apiData.dates && apiData.pue) {
        days = apiData.dates;
        pueData = apiData.pue;
        plfData = apiData.plf || apiData.pue.map(p => (p * 0.06).toFixed(2));
        clfData = apiData.clf || apiData.pue.map(p => (p * 0.2).toFixed(2));
    } else {
        // 无数据时显示空
        days = [];
        pueData = [];
        plfData = [];
        clfData = [];
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            confine: true,
            position: function(point) {
                return [point[0] + 10, point[1] - 10];
            }
        },
        legend: {
            data: ['PUE', 'PLF', 'CLF'],
            textStyle: { color: '#94a3b8', fontSize: 9 },
            right: 10, top: 0
        },
        grid: { left: '8%', right: '5%', bottom: '12%', top: '20%' },
        xAxis: {
            type: 'category',
            data: days,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 8, interval: 'auto' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: 'PUE',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#3b82f6', width: 2 },
                data: pueData
            },
            {
                name: 'PLF',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#22c55e', width: 2 },
                data: plfData
            },
            {
                name: 'CLF',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#f59e0b', width: 2 },
                data: clfData
            }
        ],
        // 目标线和告警线
        graphic: [
            {
                type: 'line',
                shape: { x1: '8%', y1: '45%', x2: '95%', y2: '45%' },
                style: { stroke: '#3b82f6', lineDash: [5, 5], lineWidth: 1 }
            },
            {
                type: 'line',
                shape: { x1: '8%', y1: '30%', x2: '95%', y2: '30%' },
                style: { stroke: '#ef4444', lineDash: [5, 5], lineWidth: 1 }
            }
        ]
    };
    efficiencyTrendChart.setOption(option);
}

// 月度能耗对比柱状图
function initDeviceEnergyCompareChart(apiData) {
    const chartDom = document.getElementById('deviceEnergyCompareChart');
    if (!chartDom) return;
    
    if (deviceEnergyCompareChart) deviceEnergyCompareChart.dispose();
    deviceEnergyCompareChart = echarts.init(chartDom);
    
    // 使用API数据
    let months, totalEnergy, itEnergy, nonItEnergy;
    if (apiData && apiData.months) {
        months = apiData.months;
        totalEnergy = apiData.totalEnergy;
        itEnergy = apiData.itEnergy;
        nonItEnergy = apiData.nonItEnergy;
    } else {
        // 无数据时显示空
        months = [];
        totalEnergy = [];
        itEnergy = [];
        nonItEnergy = [];
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' },
            confine: true,
            position: function(point) {
                return [point[0] + 10, point[1] - 10];
            }
        },
        legend: {
            data: ['总能耗', 'IT能耗', '非IT能耗'],
            textStyle: { color: '#94a3b8', fontSize: 9 },
            top: 0, right: 10
        },
        grid: { left: '10%', right: '5%', bottom: '15%', top: '18%' },
        xAxis: {
            type: 'category',
            data: months,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '总能耗',
                type: 'bar',
                barWidth: 8,
                data: totalEnergy,
                itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'IT能耗',
                type: 'bar',
                barWidth: 8,
                data: itEnergy,
                itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] }
            },
            {
                name: '非IT能耗',
                type: 'bar',
                barWidth: 8,
                data: nonItEnergy,
                itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
            }
        ]
    };
    deviceEnergyCompareChart.setOption(option);
}

// 视图切换器初始化
function initEnergyViewSwitchers() {
    document.querySelectorAll('.view-switcher').forEach(switcher => {
        switcher.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switcher.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const period = this.dataset.view; // day, week, month 或 year
                const panel = this.closest('.energy-panel');
                
                // 根据所在面板刷新对应图表
                if (panel.querySelector('#waterUsageChart')) {
                    loadWaterUsageByPeriod(period);
                } else if (panel.querySelector('#efficiencyTrendChart')) {
                    loadEfficiencyTrendByPeriod(period);
                }
            });
        });
    });
}

// 按时间周期加载用水量数据
function loadWaterUsageByPeriod(period) {
    // 从API获取数据
    fetch(`datacenter/energy/water-usage?period=${period}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initWaterUsageChart(result.data);
            } else {
                initWaterUsageChart(null);
            }
        })
        .catch(error => {
            console.error('获取用水量数据失败:', error);
            initWaterUsageChart(null);
        });
}

// 按时间周期加载能效趋势数据
function loadEfficiencyTrendByPeriod(period) {
    // 从API获取数据
    fetch(`datacenter/energy/efficiency-trend?period=${period}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                initEfficiencyTrendChart(result.data);
            } else {
                initEfficiencyTrendChart(null);
            }
        })
        .catch(error => {
            console.error('获取能效趋势数据失败:', error);
            initEfficiencyTrendChart(null);
        });
}

// 图表实例
let deviceTypeChart, deviceUsageChart, alertRadarChart, trendChart;

// 颜色配置
const categoryColors = [
    { start: '#3b82f6', end: '#60a5fa' },  // 蓝色
    { start: '#10b981', end: '#34d399' },  // 绿色
    { start: '#ec4899', end: '#f472b6' },  // 粉色
    { start: '#8b5cf6', end: '#a78bfa' },  // 紫色
    { start: '#f59e0b', end: '#fbbf24' }   // 橙色
];

// 初始化图表
function initCharts() {
    // 设备类型统计（横向条形图）- 先初始化空图表，数据从API加载
    deviceTypeChart = echarts.init(document.getElementById('deviceTypeChart'));
    deviceTypeChart.setOption({
        tooltip: { 
            trigger: 'axis', 
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed', fontSize: 13 }
        },
        grid: { left: 80, right: 50, top: 10, bottom: 30 },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#94a3b8', fontSize: 12 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.15)' } },
            axisLine: { show: true, lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }
        },
        yAxis: {
            type: 'category',
            data: [],
            axisLabel: { color: '#e0e6ed', fontSize: 13 },
            axisLine: { show: true, lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisTick: { show: false }
        },
        series: [{
            type: 'bar',
            data: [],
            barWidth: 18,
            label: { show: true, position: 'right', color: '#e0e6ed', fontSize: 12, fontWeight: 'bold' },
            itemStyle: { borderRadius: [0, 4, 4, 0] }
        }]
    });

    // 设备类型统计图表点击事件 - 点击柱状图显示对应分类的设备列表
    deviceTypeChart.on('click', function(params) {
        if (params.name && deviceTypeData) {
            const category = deviceTypeData.find(d => d.name === params.name);
            if (category) {
                // 显示该分类下的全部设备
                showDeviceListModal(category.id, category.name, 'all', '全部设备');
            }
        }
    });

    // 加载设备类型统计数据
    loadDeviceTypeStats();

    // 设备使用情况（分组条形图）- 先初始化空图表，数据从API加载
    deviceUsageChart = echarts.init(document.getElementById('deviceUsageChart'));
    deviceUsageChart.setOption({
        tooltip: { 
            trigger: 'axis',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed', fontSize: 13 },
            formatter: function(params) {
                const online = params[0] ? params[0].value : 0;
                const offline = params[1] ? params[1].value : 0;
                return `${params[0].name}<br/>已用(在线): ${online}<br/>空闲(离线): ${offline}`;
            }
        },
        grid: { left: 80, right: 50, top: 10, bottom: 30 },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#94a3b8', fontSize: 12 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.15)' } },
            axisLine: { show: true, lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }
        },
        yAxis: {
            type: 'category',
            data: [],
            axisLabel: { color: '#e0e6ed', fontSize: 13 },
            axisLine: { show: true, lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisTick: { show: false }
        },
        series: [
            {
                name: '已用',
                type: 'bar',
                stack: 'total',
                data: [],
                itemStyle: { 
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{offset: 0, color: '#3b82f6'}, {offset: 1, color: '#60a5fa'}])
                },
                barWidth: 18,
                label: {
                    show: true,
                    position: 'insideRight',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 'bold',
                    formatter: '{c}'
                }
            },
            {
                name: '空闲',
                type: 'bar',
                stack: 'total',
                data: [],
                itemStyle: { 
                    color: 'rgba(59, 130, 246, 0.25)',
                    borderRadius: [0, 3, 3, 0]
                },
                barWidth: 18,
                label: {
                    show: true,
                    position: 'insideRight',
                    color: '#94a3b8',
                    fontSize: 11,
                    formatter: function(params) {
                        return params.value > 0 ? params.value : '';
                    }
                }
            }
        ]
    });
    
    // 加载设备使用情况数据
    loadDeviceUsageStats();
    
    // 添加图表点击事件
    deviceUsageChart.on('click', function(params) {
        if (params.name && deviceUsageData) {
            const category = deviceUsageData.find(d => d.name === params.name);
            if (category) {
                // 根据点击的是已用还是空闲，传递不同的状态过滤
                const statusFilter = params.seriesName === '已用' ? 'online' : 'offline';
                const statusText = params.seriesName === '已用' ? '在线设备' : '离线设备';
                showDeviceListModal(category.id, category.name, statusFilter, statusText);
            }
        }
    });

    // 告警类型分布（雷达图）
    alertRadarChart = echarts.init(document.getElementById('alertRadarChart'));
    alertRadarChart.setOption({
        tooltip: {
            show: true,
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed' }
        },
        radar: {
            indicator: [
                { name: 'CPU告警', max: 100 },
                { name: '内存告警', max: 100 },
                { name: '服务告警', max: 100 },
                { name: '磁盘告警', max: 100 },
                { name: '网络告警', max: 100 }
            ],
            center: ['50%', '52%'],
            radius: '70%',
            axisName: { color: '#64748b', fontSize: 9 },
            splitArea: {
                areaStyle: {
                    color: ['rgba(59, 130, 246, 0.02)', 'rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.1)']
                }
            },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.2)' } },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.15)' } }
        },
        series: [{
            type: 'radar',
            data: [
                {
                    value: [75, 55, 45, 35, 65],
                    name: '告警分布',
                    areaStyle: {
                        color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                            { offset: 0, color: 'rgba(139, 92, 246, 0.5)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.2)' }
                        ])
                    },
                    lineStyle: { color: '#8b5cf6', width: 2 },
                    itemStyle: { color: '#a78bfa' },
                    label: {
                        show: true,
                        formatter: '{c}',
                        color: '#e0e6ed',
                        fontSize: 11,
                        fontWeight: 'bold'
                    }
                }
            ]
        }]
    });

    // 资源使用趋势图（从API获取7天数据）
    trendChart = echarts.init(document.getElementById('trendChart'));
    loadResourceTrend7Days();

    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        deviceTypeChart && deviceTypeChart.resize();
        deviceUsageChart && deviceUsageChart.resize();
        alertRadarChart && alertRadarChart.resize();
        trendChart && trendChart.resize();
    });
}

// 加载7天资源使用趋势（前3天历史 + 今天 + 未来3天预测）
async function loadResourceTrend7Days() {
    const contextPath = window.contextPath || '/api';
    try {
        const response = await fetch(`${contextPath}/bigscreen/resource-monitor/trend-7days`);
        if (response.ok) {
            const result = await response.json();
            if (result.code === 200 && result.data) {
                updateTrendChart(result.data);
                return;
            }
        }
        updateTrendChart(getDefaultTrendData());
    } catch (e) {
        console.log('7天趋势数据加载失败，使用默认数据', e);
        updateTrendChart(getDefaultTrendData());
    }
}

// 获取默认趋势数据
function getDefaultTrendData() {
    return {
        dates: ['12/05', '12/06', '12/07', '12/08', '12/09', '12/10', '12/11'],
        todayIndex: 3,
        actualData: [48, 55, 52, 58, null, null, null],
        predictData: [null, null, null, 58, 65, 72, 78],
        warningLine: 80
    };
}

// 更新趋势图表
function updateTrendChart(data) {
    if (!trendChart) return;
    const warningData = new Array(data.dates.length).fill(data.warningLine);
    trendChart.setOption({
        tooltip: { 
            trigger: 'axis',
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            textStyle: { color: '#e0e6ed', fontSize: 12 }
        },
        legend: {
            bottom: 8,
            textStyle: { color: '#94a3b8', fontSize: 11 },
            itemWidth: 16, itemHeight: 3, itemGap: 20
        },
        grid: { left: 50, right: 20, top: 20, bottom: 50 },
        xAxis: {
            type: 'category',
            data: data.dates,
            axisLabel: { 
                color: '#94a3b8', fontSize: 11, interval: 0,
                formatter: (value, index) => index === data.todayIndex ? '{today|' + value + '}' : value,
                rich: { today: { color: '#10b981', fontWeight: 'bold' } }
            },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value', max: 100,
            axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } },
            axisLine: { show: false }
        },
        series: [
            {
                name: 'AI预测', type: 'line', smooth: true,
                data: data.predictData,
                lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
                symbol: 'circle', symbolSize: 6, itemStyle: { color: '#f59e0b' }
            },
            {
                name: '实际使用率', type: 'line', smooth: true,
                data: data.actualData,
                lineStyle: { color: '#10b981', width: 2 },
                areaStyle: { 
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                    ])
                },
                symbol: 'circle', symbolSize: 6, itemStyle: { color: '#10b981' }
            },
            {
                name: '警戒线', type: 'line',
                data: warningData,
                lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
                symbol: 'none'
            }
        ]
    });
}

// 存储设备类型数据（用于点击事件）
let deviceTypeData = null;

// 加载设备类型统计数据
async function loadDeviceTypeStats() {
    const contextPath = window.contextPath || '/api';

    try {
        const response = await fetch(`${contextPath}/asset-category/device-stats`);
        if (response.ok) {
            const result = await response.json();
            if (result.code === 200 && result.data) {
                deviceTypeData = result.data;
                updateDeviceTypeChart(result.data);
                return;
            }
        }
        // 如果API失败，使用默认数据
        const defaultData = getDefaultDeviceTypeData();
        deviceTypeData = defaultData;
        updateDeviceTypeChart(defaultData);
    } catch (e) {
        console.log('设备类型统计加载失败，使用默认数据', e);
        const defaultData = getDefaultDeviceTypeData();
        deviceTypeData = defaultData;
        updateDeviceTypeChart(defaultData);
    }
}

// 获取默认设备类型数据
function getDefaultDeviceTypeData() {
    return [
        { id: 4, name: '视频管理', count: 11 },
        { id: 1, name: '服务器', count: 8 },
        { id: 2, name: '网络设备', count: 7 },
        { id: 3, name: '存储设备', count: 2 },
        { id: 23, name: '云平台', count: 32 }
    ];
}

// 更新设备类型统计图表
function updateDeviceTypeChart(data) {
    if (!deviceTypeChart || !data || data.length === 0) return;
    
    // 按数量升序排序（ECharts横向条形图从下往上显示）
    const sortedData = [...data].sort((a, b) => a.count - b.count);
    
    // 准备图表数据
    const categories = sortedData.map(item => item.name);
    const seriesData = sortedData.map((item, index) => {
        const colorIndex = index % categoryColors.length;
        return {
            value: item.count,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: categoryColors[colorIndex].start },
                    { offset: 1, color: categoryColors[colorIndex].end }
                ])
            }
        };
    });
    
    // 更新图表
    deviceTypeChart.setOption({
        yAxis: {
            data: categories
        },
        series: [{
            data: seriesData
        }]
    });
}

// 存储设备使用情况数据（用于点击事件）
let deviceUsageData = null;

// 加载设备使用情况数据
async function loadDeviceUsageStats() {
    const contextPath = window.contextPath || '/api';
    
    try {
        const response = await fetch(`${contextPath}/asset-category/device-usage`);
        if (response.ok) {
            const result = await response.json();
            if (result.code === 200 && result.data) {
                deviceUsageData = result.data;
                updateDeviceUsageChart(result.data);
                return;
            }
        }
        // 如果API失败，使用默认数据
        const defaultData = getDefaultDeviceUsageData();
        deviceUsageData = defaultData;
        updateDeviceUsageChart(defaultData);
    } catch (e) {
        console.log('设备使用情况加载失败，使用默认数据', e);
        const defaultData = getDefaultDeviceUsageData();
        deviceUsageData = defaultData;
        updateDeviceUsageChart(defaultData);
    }
}

// 获取默认设备使用情况数据
function getDefaultDeviceUsageData() {
    return [
        { id: 1, name: '服务器', online: 6, offline: 2, total: 8 },
        { id: 2, name: '网络设备', online: 5, offline: 2, total: 7 },
        { id: 3, name: '存储设备', online: 2, offline: 0, total: 2 },
        { id: 4, name: '视频管理', online: 8, offline: 3, total: 11 }
    ];
}

// 更新设备使用情况图表
function updateDeviceUsageChart(data) {
    if (!deviceUsageChart || !data || data.length === 0) return;
    
    // 按总数升序排序（ECharts横向条形图从下往上显示）
    const sortedData = [...data].sort((a, b) => a.total - b.total);
    
    // 准备图表数据
    const categories = sortedData.map(item => item.name);
    const onlineData = sortedData.map(item => item.online);
    const offlineData = sortedData.map(item => item.offline);
    
    // 更新图表
    deviceUsageChart.setOption({
        yAxis: {
            data: categories
        },
        series: [
            { data: onlineData },
            { data: offlineData }
        ]
    });
}

// 显示设备列表模态框
async function showDeviceListModal(categoryId, categoryName, statusFilter = 'all', statusText = '全部设备') {
    const contextPath = window.contextPath || '/api';
    
    // 创建模态框（如果不存在）
    let modal = document.getElementById('deviceListModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deviceListModal';
        modal.className = 'device-modal';
        modal.innerHTML = `
            <div class="device-modal-content">
                <div class="device-modal-header">
                    <h3><i class="fas fa-server"></i> <span id="modalCategoryName"></span> - <span id="modalStatusText"></span></h3>
                    <button class="modal-close-btn" onclick="closeDeviceModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="device-modal-body">
                    <table class="device-modal-table">
                        <thead>
                            <tr>
                                <th>设备名称</th>
                                <th>小类</th>
                                <th>状态</th>
                                <th>IP地址</th>
                                <th>位置</th>
                            </tr>
                        </thead>
                        <tbody id="deviceModalTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 点击背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDeviceModal();
            }
        });
    }
    
    // 设置标题
    document.getElementById('modalCategoryName').textContent = categoryName;
    document.getElementById('modalStatusText').textContent = statusText;
    
    // 显示加载中
    const tbody = document.getElementById('deviceModalTableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;">加载中...</td></tr>';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    try {
        // 添加状态过滤参数，使用带认证的 fetch 请求
        // fetchWithAuth 直接返回 JSON 解析后的数据
        const url = `${contextPath}/asset-category/${categoryId}/devices?status=${statusFilter}`;
        const result = await fetchWithAuth(url);
        if (result.code === 200 && result.data) {
            renderModalDeviceTable(result.data);
            return;
        }
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">加载失败</td></tr>';
    } catch (e) {
        console.error('加载设备列表失败', e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">加载失败</td></tr>';
    }
}

// 渲染模态框设备表格
function renderModalDeviceTable(devices) {
    const tbody = document.getElementById('deviceModalTableBody');

    if (!devices || devices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">暂无设备</td></tr>';
        return;
    }

    tbody.innerHTML = devices.map(device => {
        const statusClass = getStatusClass(device.status);
        const statusText = getStatusText(device.status);
        return `
            <tr>
                <td>${device.name || device.deviceName || '-'}</td>
                <td>${device.categoryName || '-'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${device.ipAddress || '-'}</td>
                <td>${device.location || '-'}</td>
            </tr>
        `;
    }).join('');
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        'online': 'online',
        'running': 'online',
        'offline': 'offline',
        'maintenance': 'warning',
        'suspended': 'warning'
    };
    return statusMap[status] || 'offline';
}

// 获取状态文本
function getStatusText(status) {
    const textMap = {
        'online': '在线',
        'running': '运行中',
        'offline': '离线',
        'maintenance': '维护中',
        'suspended': '已暂停'
    };
    return textMap[status] || status || '未知';
}

// 关闭设备模态框
function closeDeviceModal() {
    const modal = document.getElementById('deviceListModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 加载数据
async function loadData() {
    const contextPath = window.contextPath || '/api';
    
    // 加载核心统计数据（设备在线/离线数量 + 告警统计）
    await loadCoreStats();
    
    // 更新设备列表
    updateDeviceTable();
}

// 加载核心统计数据
async function loadCoreStats() {
    const contextPath = window.contextPath || '/api';
    
    try {
        // 加载大屏核心统计数据
        const response = await fetch(`${contextPath}/bigscreen/core-stats`);
        if (response.ok) {
            const result = await response.json();
            if (result.code === 200 && result.data) {
                updateCoreStats(result.data);
                return;
            }
        }
        // API失败，使用默认数据
        updateCoreStats(getDefaultCoreStats());
    } catch (e) {
        console.log('核心统计数据加载失败，使用默认数据', e);
        updateCoreStats(getDefaultCoreStats());
    }
}

// 获取默认核心统计数据
function getDefaultCoreStats() {
    return {
        onlineDevices: 0,
        offlineDevices: 0,
        currentMonthAlerts: 0,
        lastMonthAlerts: 0,
        alertChangePercent: 0
    };
}

// 更新核心统计显示
function updateCoreStats(data) {
    const onlineEl = document.getElementById('onlineDevices');
    const offlineEl = document.getElementById('offlineDevices');
    const alertTotalEl = document.getElementById('alertTotal');
    const alertChangeEl = document.getElementById('alertChange');
    
    if (onlineEl) onlineEl.textContent = data.onlineDevices || 0;
    if (offlineEl) offlineEl.textContent = data.offlineDevices || 0;
    if (alertTotalEl) alertTotalEl.textContent = data.currentMonthAlerts || 0;
    
    const changePercent = data.alertChangePercent || 0;
    if (alertChangeEl) {
        alertChangeEl.textContent = Math.abs(changePercent) + '%';
        // 更新趋势方向样式
        const trendEl = alertChangeEl.closest('.ring-trend');
        if (trendEl) {
            trendEl.classList.remove('up', 'down');
            trendEl.classList.add(changePercent <= 0 ? 'down' : 'up');
            const icon = trendEl.querySelector('i');
            if (icon) {
                icon.className = changePercent <= 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
            }
        }
    }
}


// 更新告警统计（雷达图）
function updateAlertStats(data) {
    alertRadarChart.setOption({
        series: [{
            data: [
                {
                    value: [data.cpu || 80, data.memory || 60, data.disk || 40, data.network || 70, data.service || 50],
                    name: '告警分布',
                    areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
                    lineStyle: { color: '#3b82f6' },
                    itemStyle: { color: '#3b82f6' },
                    label: {
                        show: true,
                        formatter: '{c}',
                        color: '#e0e6ed',
                        fontSize: 11,
                        fontWeight: 'bold'
                    }
                },
                {
                    value: [60, 60, 60, 60, 60],
                    name: '健康阈值',
                    lineStyle: { color: '#10b981', type: 'dashed' },
                    itemStyle: { color: '#10b981' },
                    areaStyle: { color: 'transparent' }
                }
            ]
        }]
    });
}

// 设备列表数据缓存
let deviceListCache = [];
let deviceListFilteredCache = []; // 过滤后的设备列表

// 初始化设备搜索功能
function initDeviceSearch() {
    const searchIcon = document.getElementById('deviceSearchIcon');
    const searchInput = document.getElementById('deviceSearchInput');

    if (!searchIcon || !searchInput) return;

    // 点击搜索图标切换搜索框显示/隐藏
    searchIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = searchInput.classList.contains('show');

        if (isVisible) {
            // 隐藏搜索框
            searchInput.classList.remove('show');
            searchInput.value = '';
            // 恢复显示所有设备
            filterDeviceList('');
        } else {
            // 显示搜索框并聚焦
            searchInput.classList.add('show');
            setTimeout(() => searchInput.focus(), 300);
        }
    });

    // 搜索输入事件
    searchInput.addEventListener('input', function() {
        filterDeviceList(this.value);
    });

    // 点击其他地方时隐藏搜索框
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchIcon.contains(e.target)) {
            if (searchInput.classList.contains('show') && searchInput.value === '') {
                searchInput.classList.remove('show');
            }
        }
    });

    // 阻止搜索框点击事件冒泡
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// 过滤设备列表
function filterDeviceList(keyword) {
    if (!keyword || keyword.trim() === '') {
        // 没有关键词，显示所有设备
        deviceListFilteredCache = deviceListCache;
    } else {
        // 根据关键词过滤设备
        const lowerKeyword = keyword.toLowerCase().trim();
        deviceListFilteredCache = deviceListCache.filter(device => {
            const name = (device.assetName || device.deviceName || '').toLowerCase();
            const ip = (device.ipAddress || '').toLowerCase();
            const status = (device.assetStatus || '').toLowerCase();

            return name.includes(lowerKeyword) ||
                   ip.includes(lowerKeyword) ||
                   status.includes(lowerKeyword);
        });
    }

    // 重新渲染设备表格
    renderDeviceTable(deviceListFilteredCache);
}

// 更新设备列表 - 从API获取数据
function updateDeviceTable() {
    fetch('/api/asset/list')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                deviceListCache = result.data.slice(0, 10); // 只显示前10个
                deviceListFilteredCache = deviceListCache; // 初始化过滤缓存
                renderDeviceTable(deviceListFilteredCache);
            } else {
                console.error('获取设备列表失败:', result.message);
                renderDeviceTableFallback();
            }
        })
        .catch(error => {
            console.error('获取设备列表请求失败:', error);
            renderDeviceTableFallback();
        });
}

// 渲染设备表格
function renderDeviceTable(devices) {
    const statusMap = {
        'online': { text: 'Online', class: 'online' },
        'offline': { text: 'Offline', class: 'offline' },
        'running': { text: 'Running', class: 'running' },
        'warning': { text: 'Warning', class: 'suspended' },
        'maintenance': { text: 'Maintenance', class: 'maintenance' }
    };

    // 根据categoryId获取图标和类型名
    const getCategoryInfo = (categoryId) => {
        const categoryMap = {
            5: { icon: 'fa-server', type: 'Web服务器' },
            6: { icon: 'fa-database', type: '数据库服务器' },
            7: { icon: 'fa-server', type: '应用服务器' },
            8: { icon: 'fa-network-wired', type: '交换机' },
            9: { icon: 'fa-random', type: '路由器' },
            10: { icon: 'fa-shield-alt', type: '防火墙' },
            11: { icon: 'fa-wifi', type: '无线AP' },
            12: { icon: 'fa-door-open', type: '网关' },
            13: { icon: 'fa-hdd', type: 'NAS存储' },
            14: { icon: 'fa-hdd', type: 'SAN存储' },
            15: { icon: 'fa-video', type: '摄像头' },
            16: { icon: 'fa-film', type: '录像机' },
            17: { icon: 'fa-desktop', type: '显示器' }
        };
        return categoryMap[categoryId] || { icon: 'fa-cube', type: '其他设备' };
    };

    const html = devices.map((d, index) => {
        const catInfo = getCategoryInfo(d.categoryId);
        const status = statusMap[d.assetStatus] || { text: d.assetStatus || 'Unknown', class: 'offline' };
        const displayName = d.assetName || d.deviceName || '未命名设备';
        
        return `
            <tr onclick="showDeviceDetail(${index})" style="cursor: pointer;" class="device-row">
                <td><i class="fas ${catInfo.icon} device-icon"></i></td>
                <td title="${displayName}">${displayName.length > 12 ? displayName.substring(0, 12) + '...' : displayName}</td>
                <td>${catInfo.type}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
            </tr>
        `;
    }).join('');

    document.getElementById('deviceTableBody').innerHTML = html;
    
    // 默认选中第一个设备
    if (devices.length > 0) {
        showDeviceDetail(0);
    }
}

// 显示设备详情
function showDeviceDetail(index) {
    const device = deviceListFilteredCache[index];
    if (!device) return;
    
    // 更新选中行样式
    document.querySelectorAll('.device-row').forEach((row, i) => {
        row.classList.toggle('selected', i === index);
    });
    
    // 获取设备类型信息
    const getCategoryName = (categoryId) => {
        const categoryMap = {
            5: 'Web服务器', 6: '数据库服务器', 7: '应用服务器',
            8: '交换机', 9: '路由器', 10: '防火墙', 11: '无线AP', 12: '网关',
            13: 'NAS存储', 14: 'SAN存储', 15: '摄像头', 16: '录像机', 17: '显示器'
        };
        return categoryMap[categoryId] || '其他设备';
    };
    
    // 状态映射
    const statusMap = {
        'online': { text: '在线', class: 'status-online' },
        'offline': { text: '离线', class: 'status-offline' },
        'warning': { text: '告警', class: 'status-warning' },
        'running': { text: '运行中', class: 'status-online' },
        'maintenance': { text: '维护中', class: 'status-warning' }
    };
    
    // 更新设备详情面板
    const displayName = device.assetName || device.deviceName || '未命名设备';
    document.getElementById('selectedDeviceName').textContent = displayName;
    
    // IP地址
    document.getElementById('selectedIp').textContent = device.ipAddress || '-';
    
    // 设备状态
    const statusInfo = statusMap[device.assetStatus] || { text: device.assetStatus || '-', class: '' };
    const statusEl = document.getElementById('selectedStatus');
    statusEl.textContent = statusInfo.text;
    statusEl.className = 'detail-value ' + statusInfo.class;
    
    // 设备类型
    document.getElementById('selectedType').textContent = getCategoryName(device.categoryId);
    
    // 制造商
    document.getElementById('selectedManufacturer').textContent = device.manufacturer || '-';
    
    // 型号
    document.getElementById('selectedModel').textContent = device.model || '-';
    
    // 位置
    document.getElementById('selectedLocation').textContent = device.location || '-';
    
    // 模拟CPU使用率（实际项目中应从监控API获取）
    const cpuUsage = Math.floor(Math.random() * 60) + 20;
    document.getElementById('selectedCpu').style.width = cpuUsage + '%';
    document.getElementById('selectedCpuPercent').textContent = cpuUsage + '%';
    
    // 模拟内存使用率
    const memoryUsage = Math.floor(Math.random() * 50) + 30;
    document.getElementById('selectedMemory').style.width = memoryUsage + '%';
    document.getElementById('selectedMemoryPercent').textContent = memoryUsage + '%';
    
    // 模拟网络流量
    const networkTraffic = (Math.random() * 50).toFixed(1);
    document.getElementById('selectedNetwork').textContent = networkTraffic + ' MB/s';
}

// 备用渲染（API失败时使用）
function renderDeviceTableFallback() {
    const fallbackDevices = [
        { assetName: 'Web-Server-01', categoryId: 5, assetStatus: 'online' },
        { assetName: 'DB-Master-01', categoryId: 6, assetStatus: 'online' },
        { assetName: 'Core-Switch-01', categoryId: 8, assetStatus: 'offline' }
    ];
    deviceListCache = fallbackDevices;
    renderDeviceTable(fallbackDevices);
}

// 初始化导航
function initNavigation() {
    const contextPath = window.contextPath || '/api';
    
    const pageMap = {
        '总览': '总览.html',
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

    document.querySelectorAll('.sidebar-item').forEach(item => {
        const span = item.querySelector('span');
        if (!span) return;
        
        // 隐藏CMDB
        if (span.textContent.trim() === 'CMDB') {
            item.style.display = 'none';
            return;
        }

        item.addEventListener('click', function() {
            const text = span.textContent.trim();
            const page = pageMap[text];
            if (page && text !== '数字大屏') {
                window.location.href = contextPath + '/' + page;
            }
        });
    });
}

// ========== 智能预测页面图表 ==========
let historyPredictionChart = null;
let accuracyHeatmapChart = null;
let errorTrendChart = null;
let alertDistributionChart = null;
let futurePredictionChart = null;

// 加载智能预测页面数据
function loadPredictionPageData() {
    console.log('加载智能预测页面数据...');
    const metricType = document.getElementById('predType')?.value || 'cpu';
    const days = parseInt(document.getElementById('predTimeRange')?.value || 7);
    const predPeriod = parseInt(document.getElementById('predPeriod')?.value || 7);
    
    // 更新标题标签
    const typeLabels = { cpu: 'CPU', memory: '内存', storage: '存储', network: '网络', alert: '告警' };
    const typeLabel = typeLabels[metricType] || 'CPU';
    if (document.getElementById('predTypeLabel')) document.getElementById('predTypeLabel').textContent = typeLabel;
    if (document.getElementById('predTypeLabel2')) document.getElementById('predTypeLabel2').textContent = typeLabel;
    if (document.getElementById('predTypeLabel3')) document.getElementById('predTypeLabel3').textContent = typeLabel;
    if (document.getElementById('predPeriodLabel')) document.getElementById('predPeriodLabel').textContent = predPeriod;
    
    // 加载模型列表（首次加载）
    loadPredictionModels();
    
    // 加载各图表数据
    loadHistoryPredictionData(metricType, days);
    loadAccuracyHeatmapData(metricType, days);
    loadPredictionKpi(metricType);
    loadErrorTrendData(metricType, days);
    loadAlertDistributionData();
    loadFuturePredictionData(metricType, predPeriod);
}

// 加载预测模型列表
async function loadPredictionModels() {
    const select = document.getElementById('predModel');
    if (!select || select.options.length > 1) return; // 已加载过
    
    try {
        const response = await fetch('/api/bigscreen/prediction/models');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            select.innerHTML = '';
            result.data.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.service_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载模型列表失败:', error);
        // 使用默认选项
        select.innerHTML = '<option value="1">服务器性能预测模型</option>';
    }
}

// 切换自定义日期范围显示
function toggleCustomDateRange() {
    const timeRange = document.getElementById('predTimeRange').value;
    const customDateRange = document.getElementById('customDateRange');
    const customDateRangeEnd = document.getElementById('customDateRangeEnd');

    if (timeRange === 'custom') {
        customDateRange.style.display = 'block';
        customDateRangeEnd.style.display = 'block';

        // 设置默认日期（今天和7天前）
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        document.getElementById('predEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('predStartDate').value = sevenDaysAgo.toISOString().split('T')[0];
    } else {
        customDateRange.style.display = 'none';
        customDateRangeEnd.style.display = 'none';
    }
}

// 应用筛选器
function applyPredictionFilters() {
    const predType = document.getElementById('predType').value;
    const predPeriod = document.getElementById('predPeriod').value;
    const timeRange = document.getElementById('predTimeRange').value;

    // 计算天数
    let days;
    let customDates = null;
    if (timeRange === 'custom') {
        const startDate = document.getElementById('predStartDate').value;
        const endDate = document.getElementById('predEndDate').value;
        const start = new Date(startDate);
        const end = new Date(endDate);
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
            alert('结束日期必须大于开始日期');
            return;
        }
        customDates = { startDate, endDate };
    } else {
        days = parseInt(timeRange);
    }

    // 更新标签
    const typeLabels = { cpu: 'CPU', memory: '内存', storage: '存储', network: '网络', alert: '告警' };
    const typeLabel = typeLabels[predType] || 'CPU';

    document.getElementById('predTypeLabel').textContent = typeLabel;
    document.getElementById('predTypeLabel2').textContent = typeLabel;
    document.getElementById('predTypeLabel3').textContent = typeLabel;
    document.getElementById('predPeriodLabel').textContent = predPeriod;

    // 重新加载图表数据
    loadHistoryPredictionData(predType, days, customDates);
    loadAccuracyHeatmapData(predType, days);
    loadPredictionKpi(predType);
    loadErrorTrendData(predType, days);
    loadAlertDistributionData();
    loadFuturePredictionData(predType, parseInt(predPeriod));
}

// 加载历史与预测对比数据
async function loadHistoryPredictionData(metricType, days, customDates = null) {
    try {
        let url = `/api/bigscreen/prediction/history-comparison?metricType=${metricType}&days=${days}`;
        if (customDates) {
            url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            initHistoryPredictionChart(result.data.dates, result.data.historyData, result.data.predictionData);
        } else {
            // 使用模拟数据
            initHistoryPredictionChart(null, null, null);
        }
    } catch (error) {
        console.error('加载历史对比数据失败:', error);
        initHistoryPredictionChart(null, null, null);
    }
}

// 历史与预测对比图
function initHistoryPredictionChart(dates, historyData, predictionData) {
    const chartDom = document.getElementById('historyPredictionChart');
    if (!chartDom) return;
    
    if (historyPredictionChart) {
        historyPredictionChart.dispose();
    }
    historyPredictionChart = echarts.init(chartDom);
    
    // 如果没有数据，使用模拟数据
    if (!dates || dates.length === 0) {
        dates = [];
        historyData = [];
        predictionData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push((date.getMonth() + 1) + '/' + date.getDate());
            historyData.push(Math.floor(40 + Math.random() * 35));
            predictionData.push(Math.floor(42 + Math.random() * 30));
        }
    } else {
        // 格式化日期
        dates = dates.map(d => {
            const parts = d.split('-');
            return parseInt(parts[1]) + '/' + parseInt(parts[2]);
        });
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    result += `<div style="display:flex;align-items:center;gap:5px;">
                        <span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:50%;"></span>
                        <span>${p.seriesName}: ${p.value}%</span>
                    </div>`;
                });
                return result;
            }
        },
        legend: {
            data: ['历史值', '预测值'],
            textStyle: { color: '#94a3b8' },
            top: 5,
            right: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8' }
        },
        yAxis: {
            type: 'value',
            name: '使用率 (%)',
            nameTextStyle: { color: '#94a3b8' },
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '历史值',
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                    ])
                },
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#3b82f6' },
                data: historyData
            },
            {
                name: '预测值',
                type: 'line',
                smooth: true,
                lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
                itemStyle: { color: '#f59e0b' },
                data: predictionData
            }
        ]
    };
    
    historyPredictionChart.setOption(option);
}

// 加载预测准确度热力图数据
async function loadAccuracyHeatmapData(metricType, days) {
    try {
        const response = await fetch(`/api/bigscreen/prediction/accuracy-heatmap?metricType=${metricType}&days=${days}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            initAccuracyHeatmapChart(result.data.dates, result.data.algorithms, result.data.data);
        } else {
            initAccuracyHeatmapChart(null, null, null);
        }
    } catch (error) {
        console.error('加载热力图数据失败:', error);
        initAccuracyHeatmapChart(null, null, null);
    }
}

// 预测准确度热力图（X轴日期，Y轴算法）
function initAccuracyHeatmapChart(dates, algorithms, data) {
    const chartDom = document.getElementById('accuracyHeatmapChart');
    if (!chartDom) return;
    
    if (accuracyHeatmapChart) {
        accuracyHeatmapChart.dispose();
    }
    accuracyHeatmapChart = echarts.init(chartDom);
    
    // 如果没有数据，使用模拟数据
    if (!dates || dates.length === 0) {
        dates = [];
        for (let i = 7; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push((date.getMonth() + 1) + '/' + date.getDate());
        }
        algorithms = ['KNN', 'LSTM', 'Prophet', 'XGBoost', 'ARIMA'];
        data = [];
        for (let i = 0; i < dates.length; i++) {
            for (let j = 0; j < algorithms.length; j++) {
                const accuracy = 70 + Math.random() * 30;
                data.push([i, j, Math.round(accuracy)]);
            }
        }
    } else {
        // 格式化日期
        dates = dates.map(d => {
            const parts = d.split('-');
            return parseInt(parts[1]) + '/' + parseInt(parts[2]);
        });
    }
    
    const option = {
        tooltip: {
            position: function(point, params, dom, rect, size) {
                // 智能定位tooltip，避免超出容器
                let x = point[0] - size.contentSize[0] / 2;
                let y = point[1] - size.contentSize[1] - 10;
                // 如果tooltip超出顶部，显示在下方
                if (y < 0) {
                    y = point[1] + 10;
                }
                // 防止超出左右边界
                if (x < 0) x = 5;
                if (x + size.contentSize[0] > size.viewSize[0]) {
                    x = size.viewSize[0] - size.contentSize[0] - 5;
                }
                return [x, y];
            },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                const accuracy = params.value[2];
                let level = '较差';
                if (accuracy >= 95) level = '优秀';
                else if (accuracy >= 85) level = '良好';
                else if (accuracy >= 75) level = '一般';
                return `日期: ${dates[params.value[0]]}<br/>算法: ${algorithms[params.value[1]]}<br/>准确度: ${accuracy}% (${level})`;
            }
        },
        grid: {
            left: '15%',
            right: '18%',
            top: '8%',
            bottom: '18%'
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 11, rotate: 0 },
            splitArea: { show: true, areaStyle: { color: ['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.5)'] } }
        },
        yAxis: {
            type: 'category',
            data: algorithms,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 11 }
        },
        visualMap: {
            min: 70,
            max: 100,
            calculable: true,
            orient: 'vertical',
            right: '1%',
            top: 'center',
            itemWidth: 12,
            itemHeight: 80,
            inRange: {
                color: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
            },
            textStyle: { color: '#94a3b8', fontSize: 10 },
            formatter: function(value) {
                return value + '%';
            }
        },
        series: [{
            type: 'heatmap',
            data: data,
            label: { show: false },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
            }
        }]
    };
    
    accuracyHeatmapChart.setOption(option);
}

// 加载KPI数据
async function loadPredictionKpi(metricType) {
    try {
        const response = await fetch(`/api/bigscreen/prediction/kpi?metricType=${metricType}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            updatePredictionKpi(result.data);
        }
    } catch (error) {
        console.error('加载KPI数据失败:', error);
    }
}

// 更新KPI显示
function updatePredictionKpi(data) {
    // 更新准确率
    const accuracyValue = document.querySelector('.kpi-item:nth-child(1) .kpi-value');
    if (accuracyValue) accuracyValue.innerHTML = `${data.accuracy}<span class="kpi-unit">%</span>`;
    
    const accuracyTrend = document.querySelector('.kpi-item:nth-child(1) .kpi-trend');
    if (accuracyTrend) {
        const trendClass = data.accuracyTrend >= 0 ? 'up' : 'down';
        const icon = data.accuracyTrend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        accuracyTrend.className = `kpi-trend ${trendClass}`;
        accuracyTrend.innerHTML = `<i class="fas ${icon}"></i> ${Math.abs(data.accuracyTrend)}%`;
    }
    
    // 更新最大误差
    const maxErrorValue = document.querySelector('.kpi-item:nth-child(2) .kpi-value');
    if (maxErrorValue) maxErrorValue.innerHTML = `${data.maxError}<span class="kpi-unit">%</span>`;
    
    const maxErrorTime = document.querySelector('.kpi-item:nth-child(2) .kpi-sub');
    if (maxErrorTime) maxErrorTime.textContent = data.maxErrorTime;
    
    // 更新预测峰值
    const peakValue = document.querySelector('.kpi-item:nth-child(3) .kpi-value');
    if (peakValue) peakValue.innerHTML = `${data.peakValue}<span class="kpi-unit">%</span>`;
    
    const peakTime = document.querySelector('.kpi-item:nth-child(3) .kpi-sub');
    if (peakTime) peakTime.textContent = `预计时间 ${data.peakTime}`;
}

// 加载误差趋势数据
async function loadErrorTrendData(metricType, days) {
    try {
        const response = await fetch(`/api/bigscreen/prediction/error-trend?metricType=${metricType}&days=${days}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            initErrorTrendChart(result.data.dates, result.data.algorithms, result.data.algorithmData);
        } else {
            initErrorTrendChart(null, null, null);
        }
    } catch (error) {
        console.error('加载误差趋势失败:', error);
        initErrorTrendChart(null, null, null);
    }
}

// 预测误差趋势图（多条算法曲线）
function initErrorTrendChart(dates, algorithms, algorithmData) {
    const chartDom = document.getElementById('errorTrendChart');
    if (!chartDom) return;
    
    if (errorTrendChart) {
        errorTrendChart.dispose();
    }
    errorTrendChart = echarts.init(chartDom);
    
    // 算法颜色映射
    const algorithmColors = {
        'KNN': '#3b82f6',
        'LSTM': '#10b981',
        'Prophet': '#f59e0b',
        'XGBoost': '#8b5cf6',
        'ARIMA': '#ef4444'
    };
    
    // 如果没有数据，使用模拟数据
    if (!dates || dates.length === 0) {
        dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push((date.getMonth() + 1) + '/' + date.getDate());
        }
        algorithms = ['KNN', 'LSTM', 'Prophet', 'XGBoost', 'ARIMA'];
        algorithmData = {};
        algorithms.forEach(alg => {
            algorithmData[alg] = dates.map(() => (Math.random() * 5 + 1).toFixed(1));
        });
    } else {
        dates = dates.map(d => {
            const parts = d.split('-');
            return parseInt(parts[1]) + '/' + parseInt(parts[2]);
        });
    }
    
    // 构建多条曲线的series
    const series = algorithms.map(algorithm => ({
        name: algorithm,
        type: 'line',
        smooth: true,
        data: algorithmData[algorithm],
        lineStyle: { color: algorithmColors[algorithm] || '#64748b', width: 2 },
        itemStyle: { color: algorithmColors[algorithm] || '#64748b' },
        symbol: 'circle',
        symbolSize: 6
    }));
    
    // 添加警戒线
    series.push({
        name: '警戒线',
        type: 'line',
        data: dates.map(() => 5),
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        itemStyle: { color: '#ef4444' },
        symbol: 'none',
        label: { show: false }
    });
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach(p => {
                    if (p.seriesName !== '警戒线') {
                        result += `<div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:5px;"></span>${p.seriesName}: ${p.value}%</div>`;
                    }
                });
                return result;
            }
        },
        legend: {
            data: algorithms,
            textStyle: { color: '#94a3b8', fontSize: 10 },
            top: 0,
            right: 10,
            itemWidth: 12,
            itemHeight: 8
        },
        grid: {
            left: '3%',
            right: '3%',
            bottom: '12%',
            top: '18%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            name: '误差率(%)',
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } },
            min: 0,
            scale: true
        },
        series: series
    };
    
    errorTrendChart.setOption(option);
}

// 加载预警分布数据
async function loadAlertDistributionData() {
    try {
        const response = await fetch('/api/bigscreen/prediction/alert-distribution');
        const result = await response.json();
        if (result.code === 200 && result.data) {
            initAlertDistributionChart(result.data);
        } else {
            initAlertDistributionChart(null);
        }
    } catch (error) {
        console.error('加载预警分布失败:', error);
        initAlertDistributionChart(null);
    }
}

// 预警分布环形图 - 存储原始数据用于点击事件
let predictionAlertData = [];

// 预警分布环形图
function initAlertDistributionChart(apiData) {
    const chartDom = document.getElementById('alertDistributionChart');
    if (!chartDom) return;

    if (alertDistributionChart) {
        alertDistributionChart.dispose();
    }
    alertDistributionChart = echarts.init(chartDom);

    let data;
    if (apiData && apiData.length > 0) {
        predictionAlertData = apiData; // 保存原始数据
        data = apiData.map(item => ({
            value: item.value,
            name: item.name,
            level: item.level,
            itemStyle: { color: item.color }
        }));
    } else {
        predictionAlertData = [];
        data = [
            { value: 5, name: '严重', level: 'HIGH', itemStyle: { color: '#ef4444' } },
            { value: 6, name: '警告', level: 'MEDIUM', itemStyle: { color: '#f59e0b' } },
            { value: 5, name: '信息', level: 'LOW', itemStyle: { color: '#3b82f6' } }
        ];
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            confine: true,
            textStyle: { color: '#e0e6ed' },
            formatter: '{b}: {c}条 ({d}%)<br/><span style="color:#94a3b8;font-size:12px;">点击查看详情</span>'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: '#94a3b8' }
        },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#e0e6ed',
                    formatter: '{b}\n{c}条'
                }
            },
            labelLine: { show: false },
            data: data
        }],
        graphic: [{
            type: 'text',
            left: '26%',
            top: '45%',
            style: {
                text: '共 ' + total + ' 条',
                textAlign: 'center',
                fill: '#e0e6ed',
                fontSize: 14,
                fontWeight: 'bold'
            }
        }]
    };

    alertDistributionChart.setOption(option);

    // 添加点击事件
    alertDistributionChart.off('click');
    alertDistributionChart.on('click', function(params) {
        if (params.data && params.data.level) {
            showPredictionAlertModal(params.data.level, params.data.name, params.data.value);
        }
    });
}

// 显示预测性预警模态框
async function showPredictionAlertModal(level, levelName, count) {
    // 创建模态框（如果不存在）
    let modal = document.getElementById('predictionAlertModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'predictionAlertModal';
        modal.className = 'prediction-alert-modal-overlay';
        modal.innerHTML = `
            <div class="prediction-alert-modal">
                <div class="prediction-alert-modal-header">
                    <div class="modal-title">
                        <i class="fas fa-brain"></i>
                        <span id="predictionAlertModalTitle">预测性预警列表</span>
                    </div>
                    <button class="modal-close" onclick="closePredictionAlertModal()">&times;</button>
                </div>
                <div class="prediction-alert-modal-body">
                    <div class="prediction-alert-filter-info">
                        <span id="predictionAlertFilterInfo">加载中...</span>
                    </div>
                    <div class="prediction-alert-table-container">
                        <table class="prediction-alert-table">
                            <thead>
                                <tr>
                                    <th>预警标题</th>
                                    <th>资产名称</th>
                                    <th>指标</th>
                                    <th>当前值</th>
                                    <th>预测值</th>
                                    <th>阈值</th>
                                    <th>预测时间</th>
                                    <th>风险评分</th>
                                    <th>置信度</th>
                                    <th>状态</th>
                                </tr>
                            </thead>
                            <tbody id="predictionAlertModalTableBody">
                                <tr><td colspan="10" class="loading-cell">加载中...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击遮罩层关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePredictionAlertModal();
            }
        });
    }

    // 显示模态框
    modal.style.display = 'flex';

    // 更新标题和筛选信息
    document.getElementById('predictionAlertModalTitle').textContent = `预测性预警列表 - ${levelName}`;
    document.getElementById('predictionAlertFilterInfo').textContent = `共 ${count} 条${levelName}级别预警`;

    // 加载数据
    try {
        const response = await fetch(`/api/bigscreen/prediction/alert-list?level=${level}`);
        const result = await response.json();

        const tbody = document.getElementById('predictionAlertModalTableBody');

        if (result.code === 200 && result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td title="${item.message}">${item.title}</td>
                    <td>${item.assetName || '-'}</td>
                    <td>${item.metricName || '-'}</td>
                    <td>${item.metricValue || '-'}</td>
                    <td class="predicted-value">${item.predictedValue || '-'}</td>
                    <td>${item.threshold || '-'}</td>
                    <td>${item.predictedAt || '-'}<br/><small>未来${item.predictionDays}天</small></td>
                    <td><span class="risk-score ${getRiskScoreClass(item.riskScore)}">${item.riskScore || '-'}</span></td>
                    <td>${item.confidence ? item.confidence + '%' : '-'}</td>
                    <td><span class="status-tag ${getStatusClass(item.status)}">${getStatusText(item.status)}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="10" class="empty-cell">暂无数据</td></tr>';
        }
    } catch (error) {
        console.error('加载预测性预警列表失败:', error);
        document.getElementById('predictionAlertModalTableBody').innerHTML =
            '<tr><td colspan="10" class="error-cell">加载失败，请重试</td></tr>';
    }
}

// 关闭预测性预警模态框
function closePredictionAlertModal() {
    const modal = document.getElementById('predictionAlertModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 获取风险评分样式类
function getRiskScoreClass(score) {
    if (!score) return '';
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

// 获取状态样式类
function getStatusClass(status) {
    switch (status) {
        case 'PENDING': return 'pending';
        case 'PROCESSING': return 'processing';
        case 'RESOLVED': return 'resolved';
        case 'IGNORED': return 'ignored';
        default: return '';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch (status) {
        case 'PENDING': return '待处理';
        case 'PROCESSING': return '处理中';
        case 'RESOLVED': return '已解决';
        case 'IGNORED': return '已忽略';
        default: return status || '-';
    }
}

// 加载未来预测数据
async function loadFuturePredictionData(metricType, days) {
    try {
        const response = await fetch(`/api/bigscreen/prediction/future?metricType=${metricType}&days=${days}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            initFuturePredictionChart(result.data.dates, result.data.predictedData, result.data.upperBound, result.data.lowerBound);
        } else {
            initFuturePredictionChart(null, null, null, null);
        }
    } catch (error) {
        console.error('加载未来预测失败:', error);
        initFuturePredictionChart(null, null, null, null);
    }
}

// 未来使用率预测图（带置信区间）
function initFuturePredictionChart(dates, predictedData, upperBound, lowerBound) {
    const chartDom = document.getElementById('futurePredictionChart');
    if (!chartDom) return;
    
    if (futurePredictionChart) {
        futurePredictionChart.dispose();
    }
    futurePredictionChart = echarts.init(chartDom);
    
    // 如果没有数据，使用模拟数据
    if (!dates || dates.length === 0) {
        const predPeriod = parseInt(document.getElementById('predPeriod')?.value || 7);
        dates = [];
        predictedData = [];
        upperBound = [];
        lowerBound = [];
        
        for (let i = 1; i <= predPeriod; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push((date.getMonth() + 1) + '/' + date.getDate());
            
            const base = 50 + Math.random() * 25;
            predictedData.push(Math.round(base));
            upperBound.push(Math.round(base + 8 + Math.random() * 5));
            lowerBound.push(Math.round(base - 8 - Math.random() * 5));
        }
    }
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            textStyle: { color: '#e0e6ed' },
            formatter: function(params) {
                const idx = params[0].dataIndex;
                return `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>
                    <div>预测值: ${predictedData[idx]}%</div>
                    <div>上限: ${upperBound[idx]}%</div>
                    <div>下限: ${lowerBound[idx]}%</div>`;
            }
        },
        legend: {
            data: ['预测值', '置信区间'],
            textStyle: { color: '#94a3b8' },
            top: 5,
            right: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8' }
        },
        yAxis: {
            type: 'value',
            name: '使用率 (%)',
            nameTextStyle: { color: '#94a3b8' },
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
        },
        series: [
            {
                name: '置信区间',
                type: 'line',
                stack: 'confidence',
                symbol: 'none',
                lineStyle: { opacity: 0 },
                areaStyle: { opacity: 0 },
                data: lowerBound
            },
            {
                name: '置信区间',
                type: 'line',
                stack: 'confidence',
                symbol: 'none',
                lineStyle: { opacity: 0 },
                areaStyle: {
                    color: 'rgba(16, 185, 129, 0.2)'
                },
                data: upperBound.map((v, i) => v - lowerBound[i])
            },
            {
                name: '预测值',
                type: 'line',
                smooth: true,
                lineStyle: { color: '#10b981', width: 2, type: 'dashed' },
                itemStyle: { color: '#10b981' },
                data: predictedData
            }
        ]
    };
    
    futurePredictionChart.setOption(option);
}

// ============================================
// 机房监控中心
// ============================================
let dcSelectedId = 0;
let dcDatacenters = [];
let dcTrafficChart, dcTemperatureChart, dcHumidityChart;

// 加载机房监控数据
function loadDatacenterMonitorData() {
    loadDcDatacenters();
    loadDcDevices();
    loadDcTrafficChart();
    loadDcTemperatureChart();
    loadDcHumidityChart();
}

// 加载机房列表
async function loadDcDatacenters() {
    try {
        const response = await fetch('/api/datacenter/monitor/list');
        const result = await response.json();
        if (result.code === 200) {
            dcDatacenters = result.data;
            renderDcFloorPlan();
        }
    } catch (error) {
        console.error('加载机房列表失败:', error);
    }
}

// 渲染机房平面图
function renderDcFloorPlan() {
    const container = document.getElementById('dcFloorPlan');
    if (!container) return;
    
    container.innerHTML = '';
    
    const layouts = [
        { left: '5%', top: '8%', width: '42%', height: '38%' },
        { left: '53%', top: '8%', width: '42%', height: '38%' },
        { left: '5%', top: '54%', width: '42%', height: '38%' },
        { left: '53%', top: '54%', width: '42%', height: '38%' }
    ];
    
    dcDatacenters.forEach((dc, index) => {
        const layout = layouts[index] || layouts[0];
        const room = document.createElement('div');
        room.className = `dc-room ${dc.healthStatus}`;
        room.dataset.id = dc.id;
        room.style.cssText = `left:${layout.left}; top:${layout.top}; width:${layout.width}; height:${layout.height}`;
        
        room.innerHTML = `
            <i class="fas fa-server dc-room-icon"></i>
            <div class="dc-room-name">${dc.name}</div>
            <div class="dc-room-stats">${dc.deviceCount}台设备</div>
        `;
        
        room.addEventListener('click', () => selectDcRoom(dc.id, dc.name));
        room.addEventListener('mouseenter', (e) => showDcTooltip(e, dc));
        room.addEventListener('mousemove', moveDcTooltip);
        room.addEventListener('mouseleave', hideDcTooltip);
        
        container.appendChild(room);
    });
}

// 选择机房
function selectDcRoom(id, name) {
    dcSelectedId = id;
    
    document.querySelectorAll('.dc-room').forEach(room => {
        room.classList.remove('selected');
        if (parseInt(room.dataset.id) === id) {
            room.classList.add('selected');
        }
    });
    
    document.getElementById('dcSelectedRoom').textContent = name || '全部机房';
    
    loadDcDevices();
    loadDcTrafficChart();
    loadDcTemperatureChart();
    loadDcHumidityChart();
}

// Tooltip
function showDcTooltip(e, dc) {
    const tooltip = document.getElementById('dcTooltip');
    document.getElementById('dcTooltipTitle').textContent = dc.name;
    document.getElementById('dcTooltipDevices').textContent = dc.deviceCount;
    document.getElementById('dcTooltipErrors').textContent = dc.offlineCount || 0;
    tooltip.style.display = 'block';
    moveDcTooltip(e);
}

function moveDcTooltip(e) {
    const tooltip = document.getElementById('dcTooltip');
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
}

function hideDcTooltip() {
    document.getElementById('dcTooltip').style.display = 'none';
}

// 加载设备列表
async function loadDcDevices() {
    try {
        const url = `/api/datacenter/monitor/${dcSelectedId}/devices`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 200) {
            renderDcDeviceTable(result.data);
        }
    } catch (error) {
        console.error('加载设备列表失败:', error);
    }
}

// 渲染设备表格
function renderDcDeviceTable(devices) {
    const tbody = document.getElementById('dcDeviceTableBody');
    if (!tbody) return;
    
    const statusMap = {
        'online': { label: '运行中', class: 'online' },
        'offline': { label: '离线', class: 'offline' },
        'maintenance': { label: '维护中', class: 'maintenance' },
        'pending': { label: '挂起', class: 'pending' }
    };
    
    tbody.innerHTML = devices.map(device => {
        const status = statusMap[device.status] || statusMap['offline'];
        const usage = device.resourceUsage || 0;
        let usageClass = 'low';
        if (usage >= 95) usageClass = 'high';
        else if (usage >= 80) usageClass = 'medium';
        
        return `
            <tr class="dc-device-row" data-device-id="${device.id}" data-device-name="${device.deviceName}" style="cursor:pointer;">
                <td>${device.deviceName}</td>
                <td><span class="dc-status-badge ${status.class}">${status.label}</span></td>
                <td>
                    <div class="dc-resource-bar">
                        <div class="dc-bar-track">
                            <div class="dc-bar-fill ${usageClass}" style="width:${usage}%"></div>
                        </div>
                        <span class="dc-bar-value ${usageClass}">${usage.toFixed(1)}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 绑定点击事件 - 跳转到资源监控页面
    tbody.querySelectorAll('.dc-device-row').forEach(row => {
        row.addEventListener('click', function() {
            const deviceId = this.dataset.deviceId;
            const deviceName = this.dataset.deviceName;
            console.log('跳转到资源监控，设备ID:', deviceId, '设备名称:', deviceName);
            // 存储要选中的设备ID（格式为 asset_ID）
            window.pendingDeviceId = `asset_${deviceId}`;
            // 切换到资源监控视图
            switchView('资源监控');
        });
    });
}

// 网络流量图表
async function loadDcTrafficChart() {
    const chartDom = document.getElementById('dcTrafficChart');
    if (!chartDom) return;
    
    if (!dcTrafficChart) dcTrafficChart = echarts.init(chartDom);
    
    try {
        const response = await fetch(`/api/datacenter/monitor/${dcSelectedId}/traffic`);
        const result = await response.json();
        
        if (result.code === 200) {
            const data = result.data.data || [];
            const threshold = result.data.threshold || 1;
            
            const option = {
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(59, 130, 246, 0.3)', textStyle: { color: '#e0e6ed' }, confine: true },
                legend: { data: ['入口流量', '出口流量'], textStyle: { color: '#94a3b8' }, top: 0 },
                grid: { left: '3%', right: '4%', bottom: '3%', top: 35, containLabel: true },
                xAxis: { type: 'category', data: data.map(d => d.hour), axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } },
                yAxis: { type: 'value', name: 'Gbps', nameTextStyle: { color: '#94a3b8' }, axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } } },
                series: [
                    { name: '入口流量', type: 'line', smooth: true, data: data.map(d => d.inbound?.toFixed(2) || 0), lineStyle: { color: '#3b82f6', width: 2 }, areaStyle: { color: 'rgba(59, 130, 246, 0.2)' } },
                    { name: '出口流量', type: 'line', smooth: true, data: data.map(d => d.outbound?.toFixed(2) || 0), lineStyle: { color: '#34d399', width: 2 }, areaStyle: { color: 'rgba(52, 211, 153, 0.2)' } },
                    { name: '阈值', type: 'line', data: data.map(() => threshold), lineStyle: { color: '#f87171', width: 1, type: 'dashed' }, symbol: 'none' }
                ]
            };
            dcTrafficChart.setOption(option);
        }
    } catch (error) {
        console.error('加载流量图表失败:', error);
    }
}

// 温度图表 - 24小时温度趋势折线图
async function loadDcTemperatureChart() {
    const chartDom = document.getElementById('dcTemperatureChart');
    if (!chartDom) return;
    
    if (!dcTemperatureChart) dcTemperatureChart = echarts.init(chartDom);
    
    try {
        const response = await fetch(`/api/datacenter/monitor/${dcSelectedId}/temperature`);
        const result = await response.json();
        
        if (result.code === 200) {
            const data = result.data.data || [];
            const safeMin = result.data.safeMin || 18;
            const safeMax = result.data.safeMax || 27;
            
            const option = {
                tooltip: { 
                    trigger: 'axis', 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(59, 130, 246, 0.3)', 
                    textStyle: { color: '#e0e6ed' }, 
                    formatter: p => `${p[0].name}<br/>温度: ${p[0].value}°C` 
                },
                grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
                xAxis: { 
                    type: 'category', 
                    data: data.map(d => d.hour), 
                    axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, 
                    axisLabel: { color: '#94a3b8', fontSize: 10 } 
                },
                yAxis: { 
                    type: 'value', 
                    min: 15, 
                    max: 35, 
                    axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, 
                    axisLabel: { color: '#94a3b8', formatter: '{value}°C' }, 
                    splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } } 
                },
                visualMap: { 
                    show: false, 
                    pieces: [
                        { lt: safeMin, color: '#3b82f6' }, 
                        { gte: safeMin, lte: safeMax, color: '#34d399' }, 
                        { gt: safeMax, color: '#f87171' }
                    ] 
                },
                series: [{ 
                    type: 'line', 
                    smooth: true,
                    data: data.map(d => parseFloat(d.avgTemp)?.toFixed(1) || 22), 
                    lineStyle: { width: 2 },
                    areaStyle: { color: 'rgba(52, 211, 153, 0.2)' },
                    markLine: { 
                        silent: true, 
                        data: [
                            { yAxis: safeMin, lineStyle: { color: '#3b82f6', type: 'dashed' }, label: { show: false } },
                            { yAxis: safeMax, lineStyle: { color: '#f87171', type: 'dashed' }, label: { show: false } }
                        ] 
                    }
                }]
            };
            dcTemperatureChart.setOption(option, true);
        }
    } catch (error) {
        console.error('加载温度图表失败:', error);
    }
}

// 湿度图表 - 24小时湿度趋势折线图
async function loadDcHumidityChart() {
    const chartDom = document.getElementById('dcHumidityChart');
    if (!chartDom) return;
    
    if (!dcHumidityChart) dcHumidityChart = echarts.init(chartDom);
    
    try {
        const response = await fetch(`/api/datacenter/monitor/${dcSelectedId}/humidity`);
        const result = await response.json();
        
        if (result.code === 200) {
            const data = result.data.data || [];
            const safeMin = result.data.safeMin || 40;
            const safeMax = result.data.safeMax || 60;
            
            const option = {
                tooltip: { 
                    trigger: 'axis', 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(59, 130, 246, 0.3)', 
                    textStyle: { color: '#e0e6ed' }, 
                    formatter: p => `${p[0].name}<br/>湿度: ${p[0].value}%` 
                },
                grid: { left: '3%', right: '4%', bottom: '3%', top: 20, containLabel: true },
                xAxis: { 
                    type: 'category', 
                    data: data.map(d => d.hour), 
                    axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, 
                    axisLabel: { color: '#94a3b8', fontSize: 10 } 
                },
                yAxis: { 
                    type: 'value', 
                    min: 20, 
                    max: 80, 
                    axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, 
                    axisLabel: { color: '#94a3b8', formatter: '{value}%' }, 
                    splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } } 
                },
                visualMap: { 
                    show: false, 
                    pieces: [
                        { lt: safeMin, color: '#fb923c' }, 
                        { gte: safeMin, lte: safeMax, color: '#22d3ee' }, 
                        { gt: safeMax, color: '#fb923c' }
                    ] 
                },
                series: [{ 
                    type: 'line', 
                    smooth: true,
                    data: data.map(d => parseFloat(d.avgHumidity)?.toFixed(1) || 50), 
                    lineStyle: { width: 2 },
                    areaStyle: { color: 'rgba(34, 211, 238, 0.2)' },
                    markLine: { 
                        silent: true, 
                        data: [
                            { yAxis: safeMin, lineStyle: { color: '#fb923c', type: 'dashed' }, label: { show: false } },
                            { yAxis: safeMax, lineStyle: { color: '#fb923c', type: 'dashed' }, label: { show: false } }
                        ] 
                    }
                }]
            };
            dcHumidityChart.setOption(option, true);
        }
    } catch (error) {
        console.error('加载湿度图表失败:', error);
    }
}
