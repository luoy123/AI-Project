// 视频管理类
class VideoManager {
    constructor() {
        this.deviceData = {
            normal: 0,
            fault: 0,
            todayFault: 0,
            available: 0
        };
        
        this.deviceTypes = {
            '摄像头': { count: 45, color: '#FF6384' },
            '录像机': { count: 12, color: '#36A2EB' },
            '显示器': { count: 8, color: '#FFCE56' },
            '交换机': { count: 15, color: '#4BC0C0' },
            '服务器': { count: 6, color: '#9966FF' },
            '存储设备': { count: 10, color: '#FF9F40' },
            '网关': { count: 4, color: '#FF6384' },
            '其他': { count: 3, color: '#C9CBCF' }
        };
        
        this.faultData = {
            offline: 0,
            fault: 0,
            maintenance: 0
        };
        
        this.charts = {};
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadMockData();
        this.updateStats();
        this.initCharts();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchDevices(e.target.value);
        });

        // 侧边栏导航事件
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span').textContent;
                console.log('导航到:', itemText);
                this.navigateToPage(itemText);
            });
        });
    }

    // 加载模拟数据
    loadMockData() {
        // 计算设备统计
        const totalDevices = Object.values(this.deviceTypes).reduce((sum, type) => sum + type.count, 0);
        this.deviceData.normal = Math.floor(totalDevices * 0.85);
        this.deviceData.fault = Math.floor(totalDevices * 0.10);
        this.deviceData.todayFault = Math.floor(totalDevices * 0.02);
        this.deviceData.available = this.deviceData.normal;
        
        // 故障设备分布
        this.faultData.offline = Math.floor(this.deviceData.fault * 0.6);
        this.faultData.fault = Math.floor(this.deviceData.fault * 0.3);
        this.faultData.maintenance = this.deviceData.fault - this.faultData.offline - this.faultData.fault;
    }

    // 更新统计数据
    updateStats() {
        document.getElementById('normalDevices').textContent = this.deviceData.normal;
        document.getElementById('faultDevices').textContent = this.deviceData.fault;
        document.getElementById('todayFaultDevices').textContent = this.deviceData.todayFault;
        document.getElementById('availableDevices').textContent = this.deviceData.available;
        
        // 更新故障统计
        document.getElementById('offlineCount').textContent = this.faultData.offline;
        document.getElementById('faultCount').textContent = this.faultData.fault;
        document.getElementById('maintenanceCount').textContent = this.faultData.maintenance;
    }

    // 初始化图表
    initCharts() {
        this.initDeviceTypeChart();
        this.initFaultTrendChart();
        this.initAvailabilityTrendChart();
        this.renderDeviceTypeLegend();
    }

    // 初始化设备类型分布饼图
    initDeviceTypeChart() {
        const ctx = document.getElementById('deviceTypeChart').getContext('2d');
        
        const labels = Object.keys(this.deviceTypes);
        const data = Object.values(this.deviceTypes).map(type => type.count);
        const colors = Object.values(this.deviceTypes).map(type => type.color);
        
        this.charts.deviceType = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 渲染设备类型图例
    renderDeviceTypeLegend() {
        const legendContainer = document.getElementById('deviceTypeLegend');
        const legendItems = Object.entries(this.deviceTypes).map(([name, data]) => {
            const total = Object.values(this.deviceTypes).reduce((sum, type) => sum + type.count, 0);
            const percentage = ((data.count / total) * 100).toFixed(0);
            
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${data.color}"></div>
                    <span>${name} (${percentage}%)</span>
                </div>
            `;
        }).join('');
        
        legendContainer.innerHTML = legendItems;
    }

    // 初始化故障趋势图
    initFaultTrendChart() {
        const ctx = document.getElementById('faultTrendChart').getContext('2d');
        
        // 生成近7天的数据
        const dates = this.generateDateLabels(7);
        const faultData = this.generateTrendData(7, 0, 10);
        
        this.charts.faultTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '故障数量',
                    data: faultData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f3f4'
                        }
                    },
                    x: {
                        grid: {
                            color: '#f1f3f4'
                        }
                    }
                }
            }
        });
    }

    // 初始化可用性趋势图
    initAvailabilityTrendChart() {
        const ctx = document.getElementById('availabilityTrendChart').getContext('2d');
        
        // 生成近7天的数据
        const dates = this.generateDateLabels(7);
        const availabilityData = this.generateTrendData(7, 85, 100);
        
        this.charts.availabilityTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '可用性 (%)',
                    data: availabilityData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 80,
                        max: 100,
                        grid: {
                            color: '#f1f3f4'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: '#f1f3f4'
                        }
                    }
                }
            }
        });
    }

    // 生成日期标签
    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
        }
        
        return labels;
    }

    // 生成趋势数据
    generateTrendData(days, min, max) {
        const data = [];
        
        for (let i = 0; i < days; i++) {
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push(value);
        }
        
        return data;
    }

    // 搜索设备
    searchDevices(query) {
        console.log('搜索设备:', query);
        // 这里可以实现搜索功能
    }

    // 刷新数据
    refreshData() {
        this.loadMockData();
        this.updateStats();
        
        // 重新生成图表数据
        if (this.charts.faultTrend) {
            const newFaultData = this.generateTrendData(7, 0, 10);
            this.charts.faultTrend.data.datasets[0].data = newFaultData;
            this.charts.faultTrend.update();
        }
        
        if (this.charts.availabilityTrend) {
            const newAvailabilityData = this.generateTrendData(7, 85, 100);
            this.charts.availabilityTrend.data.datasets[0].data = newAvailabilityData;
            this.charts.availabilityTrend.update();
        }
        
        console.log('数据已刷新');
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 3000;
            font-size: 14px;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    // 侧边栏导航功能
    navigateToPage(menuItem) {
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
            // 如果是当前页面，不进行跳转
            if (targetPage === '视频管理.html') {
                console.log('当前已在视频管理页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
}

// 初始化应用
let videoManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化视频管理器...');
        videoManager = new VideoManager();
        console.log('视频管理器初始化完成');
    } catch (error) {
        console.error('初始化视频管理器时出错:', error);
    }
});
