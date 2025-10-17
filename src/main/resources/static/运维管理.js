// 运维管理页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有图表
    initializeCharts();
    
    // 初始化事件监听器
    initializeEventListeners();
});

// 初始化图表
function initializeCharts() {
    // 初始化工单状态仪表盘
    initializeTicketStatusGauge();
    
    // 初始化优先级分析仪表盘
    initializePriorityGauge();
    
    // 初始化工单趋势图表
    initializeTrendChart();
}

// 初始化工单状态仪表盘
function initializeTicketStatusGauge() {
    const ctx = document.getElementById('ticketStatusGauge').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#007bff', '#e9ecef'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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

// 初始化优先级分析仪表盘
function initializePriorityGauge() {
    const ctx = document.getElementById('priorityGauge').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#28a745', '#e9ecef'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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

// 初始化工单趋势图表
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // 生成时间标签
    const timeLabels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        timeLabels.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: '新建',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#007bff',
                    pointRadius: 4
                },
                {
                    label: '处理中',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#fd7e14',
                    pointBorderColor: '#fd7e14',
                    pointRadius: 4
                },
                {
                    label: '已完成',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#28a745',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 使用自定义图例
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f3f4'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#f1f3f4'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // 这里可以添加搜索逻辑
            console.log('搜索工单:', searchTerm);
        });
    }

    // 标签页切换事件
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他标签的激活状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            // 添加当前标签的激活状态
            this.classList.add('active');
            
            const tabText = this.textContent;
            console.log('切换到标签:', tabText);
            
            // 这里可以添加切换标签页内容的逻辑
            updateTabContent(tabText);
        });
    });

    // 侧边栏导航点击事件
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemText = this.querySelector('span').textContent;
            console.log('导航到:', itemText);
            navigateToPage(itemText);
        });
    });
}

// 更新标签页内容
function updateTabContent(tabName) {
    // 根据不同的标签页更新内容
    switch(tabName) {
        case '配置工单':
            updateConfigTickets();
            break;
        case '工单':
            updateTickets();
            break;
        case '文档':
            updateDocuments();
            break;
        case '上传':
            updateUploads();
            break;
        case '归档':
            updateArchives();
            break;
        default:
            console.log('未知标签页:', tabName);
    }
}

// 更新配置工单数据
function updateConfigTickets() {
    console.log('更新配置工单数据');
    // 这里可以添加获取和更新配置工单数据的逻辑
}

// 更新工单数据
function updateTickets() {
    console.log('更新工单数据');
    // 这里可以添加获取和更新工单数据的逻辑
}

// 更新文档数据
function updateDocuments() {
    console.log('更新文档数据');
    // 这里可以添加获取和更新文档数据的逻辑
}

// 更新上传数据
function updateUploads() {
    console.log('更新上传数据');
    // 这里可以添加获取和更新上传数据的逻辑
}

// 更新归档数据
function updateArchives() {
    console.log('更新归档数据');
    // 这里可以添加获取和更新归档数据的逻辑
}

// 模拟数据更新函数
function updateTicketData() {
    // 这里可以添加从服务器获取数据的逻辑
    // 然后更新图表和统计数据
    console.log('更新工单数据');
}

// 页面加载完成后定期更新数据
setInterval(updateTicketData, 30000); // 每30秒更新一次

// 侧边栏导航功能
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
        // 如果是当前页面，不进行跳转
        if (targetPage === '运维管理.html') {
            console.log('当前已在运维管理页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
