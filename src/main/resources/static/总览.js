// 仪表盘功能模块
const Dashboard = {
    // API基础URL
    apiBaseUrl: '/api',

    init: function() {
        // 初始化所有功能
        Dashboard.initCharts();
        Dashboard.initSidebar();
        Dashboard.loadDashboardData();  // 从后端加载数据
    },

    // 存储图表实例
    charts: {
        alertTrend: null,
        networkStatus: null
    },

    // 初始化图表
    initCharts: function() {
        // 告警趋势图表
        const alertTrendCtx = document.getElementById('alertTrendChart');
        if (alertTrendCtx) {
            this.charts.alertTrend = new Chart(alertTrendCtx, {
                type: 'line',
                data: {
                    labels: ['07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28'],
                    datasets: [{
                        label: '近七日告警趋势',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'end',
                            labels: {
                                boxWidth: 12,
                                padding: 10,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                color: '#666',
                                maxRotation: 0
                            },
                            border: {
                                display: true,
                                color: '#666'
                            }
                        },
                        y: {
                            display: true,
                            beginAtZero: true,
                            grace: '10%',
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                precision: 0,
                                color: '#666'
                            },
                            border: {
                                display: true,
                                color: '#666'
                            }
                        }
                    }
                }
            });
        }

        // 网络接口状态图表
        const networkStatusCtx = document.getElementById('networkStatusChart');
        if (networkStatusCtx) {
            this.charts.networkStatus = new Chart(networkStatusCtx, {
                type: 'line',
                data: {
                    labels: ['07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28'],
                    datasets: [{
                        label: '网络接口接收带宽利用率',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#1890ff',
                        backgroundColor: 'rgba(24, 144, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'end',
                            labels: {
                                boxWidth: 12,
                                padding: 10,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                color: '#666',
                                maxRotation: 0
                            },
                            border: {
                                display: true,
                                color: '#666'
                            }
                        },
                        y: {
                            display: true,
                            beginAtZero: true,
                            grace: '10%',
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                color: '#666'
                            },
                            border: {
                                display: true,
                                color: '#666'
                            }
                        }
                    }
                }
            });
        }
    },

    // 初始化侧边栏交互
    initSidebar: function() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', function() {
                const itemText = this.querySelector('span').textContent;
                console.log('导航到:', itemText);

                // 根据菜单项跳转到对应页面
                Dashboard.navigateToPage(itemText);
            });
        });
    },

    // 从后端加载仪表盘数据
    loadDashboardData: function() {
        // 加载告警统计数据
        fetchWithAuth(`${this.apiBaseUrl}/alert/statistics`)
            .then(data => {
                if (data.code === 200) {
                    const stats = data.data;
                    this.updateDashboardStats(stats);
                } else {
                    console.error('加载统计数据失败:', data.message);
                    // 失败时使用模拟数据
                    this.initMockData();
                }
            })
            .catch(error => {
                console.error('统计数据请求失败:', error);
                // 失败时使用模拟数据
                this.initMockData();
            });

        // 加载告警趋势数据
        fetchWithAuth(`${this.apiBaseUrl}/alert/trend`)
            .then(data => {
                if (data.code === 200) {
                    const trendData = data.data;
                    this.updateChartWithRealData(trendData);
                } else {
                    console.error('加载趋势数据失败:', data.message);
                }
            })
            .catch(error => {
                console.error('趋势数据请求失败:', error);
            });
    },

    // 更新仪表盘统计数据
    updateDashboardStats: function(stats) {
        console.log('开始更新仪表盘数据:', stats);

        // 更新告警总数
        const totalAlerts = stats.total || 0;
        const criticalCount = stats.critical || 0;
        const warningCount = stats.warning || 0;
        const infoCount = stats.info || 0;
        const resolvedCount = stats.resolvedCount || 0;
        const acknowledgedCount = stats.acknowledgedCount || 0;
        const activeCount = stats.activeCount || 0;

        // 更新告警总数显示（第一个圆形图表）
        const alertCountElements = document.querySelectorAll('.chart-value');
        if (alertCountElements.length > 0) {
            alertCountElements[0].textContent = totalAlerts;
        }

        // 更新设备告警显示（第二个圆形图表）- 基于设备状态
        const totalDevices = stats.totalDevices || 0;
        const onlineDevices = stats.onlineDevices || 0;
        const abnormalDevices = stats.abnormalDevices || 0;
        
        if (alertCountElements.length > 1) {
            alertCountElements[1].textContent = totalDevices; // 显示总设备数量
            console.log(`设备告警图表: 中心数字=${totalDevices}, 正常设备=${onlineDevices}, 异常设备=${abnormalDevices}`);
        }

        // 更新圆形图表的百分比（使用真实数据）
        if (totalAlerts > 0) {
            // 第一个圆形图：已处理（resolved）vs 未处理（active + acknowledged）
            const unprocessedCount = activeCount + acknowledgedCount;
            const resolvedPercentage = (resolvedCount / totalAlerts) * 100;
            this.updatePieChart('chart1', resolvedPercentage, {
                resolved: resolvedCount,
                unprocessed: unprocessedCount,
                total: totalAlerts
            });
            console.log(`告警总数图表: 总数=${totalAlerts}, 已处理=${resolvedCount}, 未处理=${unprocessedCount}, 百分比=${resolvedPercentage.toFixed(1)}%`);
        } else {
            this.updatePieChart('chart1', 0, { resolved: 0, unprocessed: 0, total: 0 });
            console.log('没有告警数据，告警总数图表显示为0%');
        }

        // 第二个圆形图：设备状态 - 正常（online）vs 异常（非online）
        if (totalDevices > 0) {
            const normalPercentage = (onlineDevices / totalDevices) * 100;
            this.updatePieChart('chart2', normalPercentage, {
                normal: onlineDevices,
                abnormal: abnormalDevices,
                total: totalDevices
            });
            console.log(`设备状态图表: 正常设备=${onlineDevices}, 异常设备=${abnormalDevices}, 正常比例=${normalPercentage.toFixed(1)}%`);
        } else {
            this.updatePieChart('chart2', 0, { normal: 0, abnormal: 0, total: 0 });
            console.log('没有设备数据，设备状态图表显示为0%');
        }

        // 更新设备状态显示
        const statusValue = document.querySelector('.status-value');
        if (statusValue) {
            statusValue.textContent = `${onlineDevices}/${totalDevices}`;
        }

        // 更新设备类型进度条和计数
        if (totalDevices > 0) {
            // 网络设备
            const networkCount = stats.networkCount || 0;
            const onlineNetworkCount = stats.onlineNetworkCount || 0;
            const networkPercentage = (onlineNetworkCount / networkCount) * 100;
            
            const networkProgress = document.getElementById('networkProgress');
            const networkCountEl = document.getElementById('networkCount');
            if (networkProgress) {
                networkProgress.style.width = (networkCount > 0 ? networkPercentage : 0) + '%';
            }
            if (networkCountEl) {
                networkCountEl.textContent = `${onlineNetworkCount}/${networkCount}`;
            }

            // 服务器
            const serverCount = stats.serverCount || 0;
            const onlineServerCount = stats.onlineServerCount || 0;
            const serverPercentage = (onlineServerCount / serverCount) * 100;
            
            const serverProgress = document.getElementById('serverProgress');
            const serverCountEl = document.getElementById('serverCount');
            if (serverProgress) {
                serverProgress.style.width = (serverCount > 0 ? serverPercentage : 0) + '%';
            }
            if (serverCountEl) {
                serverCountEl.textContent = `${onlineServerCount}/${serverCount}`;
            }

            // 存储设备
            const storageCount = stats.storageCount || 0;
            const onlineStorageCount = stats.onlineStorageCount || 0;
            const storagePercentage = (onlineStorageCount / storageCount) * 100;
            
            const storageProgress = document.getElementById('storageProgress');
            const storageCountEl = document.getElementById('storageCount');
            if (storageProgress) {
                storageProgress.style.width = (storageCount > 0 ? storagePercentage : 0) + '%';
            }
            if (storageCountEl) {
                storageCountEl.textContent = `${onlineStorageCount}/${storageCount}`;
            }

            console.log('设备类型统计更新:', {
                network: `${onlineNetworkCount}/${networkCount} (${networkPercentage.toFixed(1)}%)`,
                server: `${onlineServerCount}/${serverCount} (${serverPercentage.toFixed(1)}%)`,
                storage: `${onlineStorageCount}/${storageCount} (${storagePercentage.toFixed(1)}%)`
            });
        }

        // 更新授权管理信息
        this.updateLicenseInfo(stats);

        // 加载真实的告警趋势数据
        this.loadAlertTrendData();

        console.log('仪表盘数据更新完成');
    },

    // 更新授权管理信息
    updateLicenseInfo: function(stats) {
        // 更新剩余设备数量
        const remainingDevicesEl = document.getElementById('remainingDevices');
        if (remainingDevicesEl && stats.remainingDevices !== undefined) {
            remainingDevicesEl.textContent = stats.remainingDevices;
        }

        // 更新剩余天数
        const remainingDaysEl = document.getElementById('remainingDays');
        if (remainingDaysEl && stats.remainingDays !== undefined) {
            remainingDaysEl.textContent = stats.remainingDays;
            
            // 根据剩余天数设置颜色警告
            if (stats.remainingDays <= 30) {
                remainingDaysEl.style.color = '#dc3545'; // 红色警告
            } else if (stats.remainingDays <= 90) {
                remainingDaysEl.style.color = '#ffc107'; // 黄色警告
            } else {
                remainingDaysEl.style.color = '#28a745'; // 绿色正常
            }
        }

        console.log('授权管理信息更新:', {
            maxDevices: stats.maxLicensedDevices,
            currentDevices: stats.totalDevices,
            remainingDevices: stats.remainingDevices,
            remainingDays: stats.remainingDays,
            licenseEndTime: stats.licenseEndTime
        });
    },

    // 加载告警趋势数据
    async loadAlertTrendData() {
        try {
            console.log('开始加载告警趋势数据...');
            const response = await fetch('/api/alert/trend');
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                console.log('告警趋势数据加载成功:', data.data);
                this.updateChartWithRealData(data.data);
            } else {
                console.warn('告警趋势数据加载失败:', data.message);
                // 使用默认数据
                this.updateChartWithDefaultData();
            }
        } catch (error) {
            console.error('加载告警趋势数据失败:', error);
            // 使用默认数据
            this.updateChartWithDefaultData();
        }
    },

    // 使用默认数据更新图表
    updateChartWithDefaultData() {
        const now = new Date();
        const dates = [];
        const counts = [];
        
        // 生成最近7天的日期
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(date.getDate()).padStart(2, '0');
            dates.push(dateStr);
            counts.push(0); // 默认为0
        }
        
        this.updateChartWithRealData({ dates, counts });
        console.log('使用默认数据更新图表，日期:', dates);
    },

    // 使用真实数据更新图表
    updateChartWithRealData: function(trendData) {
        console.log('使用真实数据更新图表:', trendData);

        const dates = trendData.dates || [];
        const counts = trendData.counts || [];

        // 更新告警趋势图表
        if (this.charts.alertTrend && dates.length > 0) {
            this.charts.alertTrend.data.labels = dates;
            this.charts.alertTrend.data.datasets[0].data = counts;
            this.charts.alertTrend.update();
            console.log('告警趋势图表已更新，数据:', counts);
        }

        // 网络状态图表使用固定数值但日期动态更新
        if (this.charts.networkStatus) {
            // 固定的网络监控数值（保持不变）
            const fixedNetworkData = [0.85, 0.92, 0.78, 0.88, 0.95, 0.82, 0.90];
            
            this.charts.networkStatus.data.labels = dates; // 使用动态日期
            this.charts.networkStatus.data.datasets[0].data = fixedNetworkData; // 使用固定数值
            this.charts.networkStatus.update();
            
            console.log('网络监控图表已更新，日期:', dates, '数值:', fixedNetworkData);
        }
    },

    // 更新图表趋势数据（模拟数据，作为备用）
    updateChartWithTrendData: function(stats) {
        console.log('使用模拟数据更新图表');
        // 生成模拟的趋势数据
        const totalAlerts = stats.total || 0;
        const activeCount = stats.activeCount || 0;

        // 生成最近7天的模拟数据
        const trendData = [];
        const networkData = [];
        for (let i = 0; i < 7; i++) {
            // 模拟告警趋势（逐渐增加到当前值）
            trendData.push(Math.floor((activeCount / 7) * (i + 1) + Math.random() * 2));
            // 模拟网络利用率（0-1之间）
            networkData.push((Math.random() * 0.8).toFixed(2));
        }

        // 更新告警趋势图表
        if (this.charts.alertTrend) {
            this.charts.alertTrend.data.datasets[0].data = trendData;
            this.charts.alertTrend.update();
        }

        // 更新网络状态图表
        if (this.charts.networkStatus) {
            this.charts.networkStatus.data.datasets[0].data = networkData;
            this.charts.networkStatus.update();
        }
    },

    // 初始化模拟数据（实际项目中会从API获取）
    initMockData: function() {
        // 更新饼图数据
        const chart1 = document.getElementById('chart1');
        const chart2 = document.getElementById('chart2');

        if (chart1) {
            chart1.style.background = 'conic-gradient(#00b42a 0%, #e6e6e6 0%)';
        }

        if (chart2) {
            chart2.style.background = 'conic-gradient(#00b42a 0%, #e6e6e6 0%)';
        }

        // 更新进度条
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.width = '0%';
        });

        // 更新状态值
        const statusValue = document.querySelector('.status-value');
        if (statusValue) {
            statusValue.textContent = '0/0';
        }
    },

    // 更新图表数据（模拟API数据更新）
    updateChartData: function(chartId, newData) {
        const chart = Chart.getChart(chartId);
        if (chart) {
            chart.data.datasets[0].data = newData;
            chart.update();
        }
    },

    // 更新饼图百分比
    updatePieChart: function(chartId, percentage, data) {
        const chart = document.getElementById(chartId);
        if (!chart) return;

        const color = '#00b42a';
        chart.style.background = `conic-gradient(${color} ${percentage}%, #e6e6e6 ${percentage}%)`;

        // 保存数据用于悬停提示
        chart.chartData = {
            percentage: percentage,
            resolved: data.resolved || data.normal,
            unprocessed: data.unprocessed || data.abnormal,
            total: data.total
        };

        // 移除旧的事件监听器
        chart.onmouseenter = null;
        chart.onmousemove = null;
        chart.onmouseleave = null;

        // 添加鼠标事件
        chart.onmouseenter = () => {
            chart.style.cursor = 'pointer';
        };

        chart.onmousemove = (e) => {
            if (!chart.chartData) return;

            const rect = chart.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 计算鼠标相对于圆心的位置
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // 圆形图的半径（假设是容器宽度的40%）
            const radius = rect.width * 0.4;
            const innerRadius = rect.width * 0.25;

            // 检查是否在圆环区域内
            if (distance >= innerRadius && distance <= radius) {
                // 转换角度到0-360度，从右侧开始顺时针
                let degrees = (angle * 180 / Math.PI + 90 + 360) % 360;

                // 判断是在已处理区域还是未处理区域
                const resolvedDegrees = (chart.chartData.percentage / 100) * 360;

                let label, value, percent;
                if (degrees <= resolvedDegrees) {
                    // 正常/已处理区域（绿色）
                    if (chartId === 'chart2') {
                        label = '正常设备';
                    } else {
                        label = '已处理';
                    }
                    value = chart.chartData.resolved;
                    percent = chart.chartData.percentage.toFixed(1);
                } else {
                    // 异常/未处理区域（灰色）
                    if (chartId === 'chart2') {
                        label = '异常设备';
                    } else {
                        label = '未处理';
                    }
                    value = chart.chartData.unprocessed;
                    percent = (100 - chart.chartData.percentage).toFixed(1);
                }

                this.showPieChartTooltip(label, value, percent, e.clientX, e.clientY);
            } else {
                this.hidePieChartTooltip();
            }
        };

        chart.onmouseleave = () => {
            chart.style.cursor = 'default';
            this.hidePieChartTooltip();
        };
    },

    // 显示圆形图提示框
    showPieChartTooltip: function(label, value, percent, x, y) {
        let tooltip = document.getElementById('pieChartTooltip');

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'pieChartTooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '14px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '10000';
            tooltip.style.whiteSpace = 'nowrap';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${label}</div>
            <div>数量: ${value}</div>
            <div>占比: ${percent}%</div>
        `;

        tooltip.style.display = 'block';
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y + 10) + 'px';
    },

    // 隐藏圆形图提示框
    hidePieChartTooltip: function() {
        const tooltip = document.getElementById('pieChartTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    // 侧边栏导航功能
    navigateToPage: function(menuItem) {
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
            if (targetPage === '总览.html') {
                console.log('当前已在总览页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
};

// 页面加载完成后初始化仪表盘
document.addEventListener('DOMContentLoaded', function() {
    Dashboard.init();
});