// 仪表盘功能模块
const Dashboard = {
    init: function() {
        // 初始化页面加载完成后的操作
        document.addEventListener('DOMContentLoaded', function() {
            Dashboard.initCharts();
            Dashboard.initSidebar();
            Dashboard.initMockData();
        });
    },

    // 初始化图表
    initCharts: function() {
        // 告警趋势图表
        const alertTrendCtx = document.getElementById('alertTrendChart');
        if (alertTrendCtx) {
            const alertTrendChart = new Chart(alertTrendCtx, {
                type: 'line',
                data: {
                    labels: ['07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28'],
                    datasets: [{
                        label: '设备告警',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#00b42a',
                        backgroundColor: 'rgba(0, 180, 42, 0.1)',
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
                            position: 'top',
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
                            min: 0,
                            max: 10,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                precision: 0,
                                color: '#666',
                                stepSize: 2
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
            const networkStatusChart = new Chart(networkStatusCtx, {
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
                            position: 'top',
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
                            min: 0,
                            max: 1,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                drawBorder: true
                            },
                            ticks: {
                                display: true,
                                color: '#666',
                                stepSize: 0.2
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
    updatePieChart: function(chartId, percentage) {
        const chart = document.getElementById(chartId);
        if (chart) {
            const color = '#00b42a';
            chart.style.background = `conic-gradient(${color} ${percentage}%, #e6e6e6 ${percentage}%)`;
            chart.querySelector('.chart-value').textContent = Math.round(percentage / 100 * 100);
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

// 初始化仪表盘
Dashboard.init();