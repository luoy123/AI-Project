// 机房管理类
class RoomManager {
    constructor() {
        this.currentRoom = 'A1';
        this.alertData = [];
        this.deviceStats = {
            total: 1,
            online: 1,
            offline: 0,
            maintenance: 0
        };
        
        this.environmentData = {
            temperature: 32,
            humidity: 45,
            voltage: 220,
            current: 15
        };
        
        this.charts = {};
        this.selectedRack = null;
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadMockData();
        this.initCharts();
        this.startEnvironmentMonitoring();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchDevices(e.target.value);
        });

        // 全屏按钮
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // 重置视图按钮
        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetView();
        });

        // 机柜点击事件
        document.querySelectorAll('.room-rack').forEach(rack => {
            rack.addEventListener('click', (e) => {
                this.selectRack(e.currentTarget);
            });
            
            rack.addEventListener('mouseenter', (e) => {
                this.showRackInfo(e.currentTarget);
            });
            
            rack.addEventListener('mouseleave', () => {
                this.hideRackInfo();
            });
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
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
        // 生成告警数据
        this.alertData = this.generateAlertData();
        
        // 更新环境数据
        this.updateEnvironmentData();
    }

    // 生成告警数据
    generateAlertData() {
        const alerts = [];
        const now = new Date();
        
        // 生成过去24小时的数据
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            alerts.push({
                time: time.toISOString(),
                count: Math.floor(Math.random() * 5)
            });
        }
        
        return alerts;
    }

    // 初始化图表
    initCharts() {
        this.initAlertChart();
        this.initTemperatureGauge();
    }

    // 初始化告警图表
    initAlertChart() {
        const ctx = document.getElementById('alertChart').getContext('2d');
        
        const labels = this.alertData.map(item => {
            const date = new Date(item.time);
            return date.toLocaleDateString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit' 
            });
        });
        
        const data = this.alertData.map(item => item.count);
        
        // 创建彩色点数据
        const pointColors = data.map(value => {
            if (value === 0) return '#28a745';      // 绿色
            if (value <= 1) return '#ffc107';      // 黄色
            if (value <= 2) return '#fd7e14';      // 橙色
            return '#dc3545';                      // 红色
        });
        
        this.charts.alert = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '告警数量',
                    data: data,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointColors,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                                return `告警数量: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        grid: {
                            color: '#f1f3f4'
                        },
                        ticks: {
                            stepSize: 1
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

    // 初始化温度仪表盘
    initTemperatureGauge() {
        const ctx = document.getElementById('temperatureGauge').getContext('2d');
        
        this.charts.temperature = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [this.environmentData.temperature, 100 - this.environmentData.temperature],
                    backgroundColor: [
                        '#007bff',
                        '#e9ecef'
                    ],
                    borderWidth: 0,
                    cutout: '80%'
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
                        enabled: false
                    }
                }
            }
        });
    }

    // 选择机柜
    selectRack(rackElement) {
        // 移除之前的选中状态
        document.querySelectorAll('.room-rack').forEach(rack => {
            rack.classList.remove('selected');
        });
        
        // 添加选中状态
        rackElement.classList.add('selected');
        this.selectedRack = rackElement;
        
        // 显示机柜详细信息
        this.showRackDetails(rackElement);
    }

    // 显示机柜信息
    showRackInfo(rackElement) {
        const popup = document.getElementById('rackInfo');
        const rackName = rackElement.querySelector('.rack-label').textContent;
        
        // 更新弹窗内容
        popup.querySelector('.popup-title').textContent = rackName;
        
        // 显示弹窗
        popup.style.display = 'block';
    }

    // 隐藏机柜信息
    hideRackInfo() {
        const popup = document.getElementById('rackInfo');
        popup.style.display = 'none';
    }

    // 显示机柜详细信息
    showRackDetails(rackElement) {
        const rackName = rackElement.querySelector('.rack-label').textContent;
        console.log(`显示 ${rackName} 的详细信息`);
        
        // 这里可以加载和显示机柜的详细信息
        this.showMessage(`已选择 ${rackName}`, 'info');
    }

    // 切换全屏
    toggleFullscreen() {
        const container = document.querySelector('.room-3d-container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('无法进入全屏模式:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // 重置视图
    resetView() {
        // 移除所有选中状态
        document.querySelectorAll('.room-rack').forEach(rack => {
            rack.classList.remove('selected');
        });
        
        this.selectedRack = null;
        this.hideRackInfo();
        
        this.showMessage('视图已重置', 'success');
    }

    // 更新环境数据
    updateEnvironmentData() {
        // 模拟环境数据变化
        this.environmentData.temperature = 30 + Math.random() * 10;
        this.environmentData.humidity = 40 + Math.random() * 20;
        this.environmentData.voltage = 220 + (Math.random() - 0.5) * 10;
        this.environmentData.current = 10 + Math.random() * 10;
        
        // 更新显示
        document.querySelector('.gauge-value .value').textContent = 
            Math.round(this.environmentData.temperature);
        
        // 更新监控指标
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length >= 2) {
            metrics[0].textContent = Math.round(this.environmentData.voltage);
            metrics[1].textContent = Math.round(this.environmentData.current);
        }
        
        // 更新温度仪表盘
        if (this.charts.temperature) {
            const tempPercentage = Math.min(this.environmentData.temperature, 100);
            this.charts.temperature.data.datasets[0].data = [tempPercentage, 100 - tempPercentage];
            this.charts.temperature.update('none');
        }
    }

    // 开始环境监控
    startEnvironmentMonitoring() {
        // 每30秒更新一次环境数据
        setInterval(() => {
            this.updateEnvironmentData();
        }, 30000);
    }

    // 处理窗口大小变化
    handleResize() {
        // 重新调整图表大小
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // 搜索设备
    searchDevices(query) {
        console.log('搜索设备:', query);
        // 这里可以实现搜索功能
        if (query.trim()) {
            this.showMessage(`搜索: ${query}`, 'info');
        }
    }

    // 刷新数据
    refreshData() {
        this.loadMockData();
        this.updateEnvironmentData();
        
        // 重新生成告警图表数据
        if (this.charts.alert) {
            const newAlertData = this.generateAlertData();
            const labels = newAlertData.map(item => {
                const date = new Date(item.time);
                return date.toLocaleDateString('zh-CN', { 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            });
            const data = newAlertData.map(item => item.count);
            
            this.charts.alert.data.labels = labels;
            this.charts.alert.data.datasets[0].data = data;
            this.charts.alert.update();
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
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 3000;
            font-size: 14px;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 3000);
    }

    // 导出数据
    exportData() {
        const data = {
            room: this.currentRoom,
            deviceStats: this.deviceStats,
            environmentData: this.environmentData,
            alertData: this.alertData,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `room_data_${this.currentRoom}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('数据导出成功', 'success');
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
            if (targetPage === '机房管理.html') {
                console.log('当前已在机房管理页面');
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
let roomManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化机房管理器...');
        roomManager = new RoomManager();
        console.log('机房管理器初始化完成');
    } catch (error) {
        console.error('初始化机房管理器时出错:', error);
    }
});

// 添加一些全局快捷键
document.addEventListener('keydown', (e) => {
    if (roomManager) {
        switch(e.key) {
            case 'F5':
                e.preventDefault();
                roomManager.refreshData();
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    }
});
