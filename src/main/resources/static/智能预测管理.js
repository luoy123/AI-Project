// 智能预测管理页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化预测分类树
    initializePredictionTree();
    
    // 初始化图表
    initializeCharts();
    
    // 初始化导航标签
    initializeNavTabs();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索预测:', searchTerm);
        });
    }

    // 工具栏按钮事件
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log('点击按钮:', buttonText);
            
            switch(buttonText) {
                case '刷新':
                    refreshDashboard();
                    break;
                default:
                    console.log('未知按钮操作');
            }
        });
    });

    // 操作按钮事件
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log('操作按钮:', buttonText);
            
            switch(buttonText) {
                case '新增':
                    addNewItem();
                    break;
                case '编辑':
                    editItem();
                    break;
                default:
                    console.log('未知操作');
            }
        });
    });

    // 侧边栏导航点击事件
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemText = this.querySelector('span').textContent;
            console.log('导航到:', itemText);

            // 根据菜单项跳转到对应页面
            navigateToPage(itemText);
        });
    });
}

// 初始化预测分类树
function initializePredictionTree() {
    // 预测分类节点选择事件，只选择预测页面内部的导航元素
    const nodeItems = document.querySelectorAll('.prediction-main .node-item, .main-content .node-item');
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他节点的选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前节点的选中状态
            this.classList.add('selected');
            
            const nodeText = this.querySelector('.node-text').textContent;
            console.log('选中预测分类:', nodeText);
            
            // 根据选中的分类更新右侧内容
            updatePredictionContent(nodeText);
        });
    });
}

// 初始化导航标签
function initializeNavTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除其他标签的激活状态
            navTabs.forEach(t => t.classList.remove('active'));
            // 添加当前标签的激活状态
            this.classList.add('active');
            
            const tabType = this.getAttribute('data-tab');
            console.log('切换标签:', tabType);
            
            // 根据选择的标签更新内容
            switchTabContent(tabType);
        });
    });
}

// 初始化图表
function initializeCharts() {
    // 初始化异常检测分析图表
    initializeAnomalyChart();
    
    // 初始化设备分析预测图表
    initializeDeviceChart();
}

// 初始化异常检测分析图表
function initializeAnomalyChart() {
    const ctx = document.getElementById('anomalyChart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['正常状态', '异常状态'],
                datasets: [{
                    data: [100, 0],
                    backgroundColor: ['#007bff', '#28a745'],
                    borderWidth: 0
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
                cutout: '70%'
            }
        });
    }
}

// 初始化设备分析预测图表
function initializeDeviceChart() {
    const ctx = document.getElementById('deviceChart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
                datasets: [{
                    label: '设备状态',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true
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
}

// 切换标签内容
function switchTabContent(tabType) {
    console.log('切换到标签:', tabType);
    
    // 根据不同标签类型加载不同内容
    switch(tabType) {
        case 'overview':
            loadOverviewContent();
            break;
        case 'analysis':
            loadAnalysisContent();
            break;
        case 'prediction':
            loadPredictionContent();
            break;
        case 'more':
            loadMoreContent();
            break;
        default:
            loadOverviewContent();
    }
}

// 加载概览内容
function loadOverviewContent() {
    console.log('加载概览内容');
    // 这里可以添加加载概览内容的逻辑
}

// 加载智能分析预测结果内容
function loadAnalysisContent() {
    console.log('加载智能分析预测结果内容');
    // 这里可以添加加载分析内容的逻辑
}

// 加载预测分析内容
function loadPredictionContent() {
    console.log('加载预测分析内容');
    // 这里可以添加加载预测内容的逻辑
}

// 加载更多内容
function loadMoreContent() {
    console.log('加载更多内容');
    // 这里可以添加加载更多内容的逻辑
}

// 更新预测内容
function updatePredictionContent(categoryName) {
    console.log('更新预测内容:', categoryName);
    
    // 根据选中的分类更新右侧内容
    switch(categoryName) {
        case '智能预测管理':
            loadPredictionManagement();
            break;
        case '预测模型':
            loadPredictionModels();
            break;
        case '模型':
            loadModels();
            break;
        case '数据源':
            loadDataSources();
            break;
        case '算法分析':
            loadAlgorithmAnalysis();
            break;
        case '智能运维分析':
            loadIntelligentOpsAnalysis();
            break;
        default:
            loadPredictionManagement();
    }
}

// 加载预测管理
function loadPredictionManagement() {
    console.log('加载预测管理');
    // 这里可以添加加载预测管理的逻辑
}

// 加载预测模型
function loadPredictionModels() {
    console.log('加载预测模型');
    // 这里可以添加加载预测模型的逻辑
}

// 加载模型
function loadModels() {
    console.log('加载模型');
    // 这里可以添加加载模型的逻辑
}

// 加载数据源
function loadDataSources() {
    console.log('加载数据源');
    // 这里可以添加加载数据源的逻辑
}

// 加载算法分析
function loadAlgorithmAnalysis() {
    console.log('加载算法分析');
    // 这里可以添加加载算法分析的逻辑
}

// 加载智能运维分析
function loadIntelligentOpsAnalysis() {
    console.log('加载智能运维分析');
    // 这里可以添加加载智能运维分析的逻辑
}

// 刷新仪表板
function refreshDashboard() {
    console.log('刷新仪表板');
    
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('仪表板刷新完成');
        
        // 重新初始化图表
        initializeCharts();
    }, 1000);
}

// 新增项目
function addNewItem() {
    console.log('新增项目');
    // 这里可以添加新增项目的逻辑
    alert('新增项目功能');
}

// 编辑项目
function editItem() {
    console.log('编辑项目');
    // 这里可以添加编辑项目的逻辑
    alert('编辑项目功能');
}

// 显示加载状态
function showLoading() {
    console.log('显示加载状态');
    // 这里可以添加显示加载状态的逻辑
}

// 隐藏加载状态
function hideLoading() {
    console.log('隐藏加载状态');
    // 这里可以添加隐藏加载状态的逻辑
}

// 页面加载完成后的初始化
function initializePage() {
    console.log('智能预测管理页面初始化完成');
    
    // 默认选中智能预测管理
    const defaultNode = document.querySelector('.node-item.selected');
    if (defaultNode) {
        const nodeText = defaultNode.querySelector('.node-text').textContent;
        updatePredictionContent(nodeText);
    }
    
    // 默认选中概览标签
    const defaultTab = document.querySelector('.nav-tab.active');
    if (defaultTab) {
        const tabType = defaultTab.getAttribute('data-tab');
        switchTabContent(tabType);
    }
}

// 页面加载完成后执行初始化
setTimeout(initializePage, 100);

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

    const targetPage = pageMap[menuItem];
    if (targetPage) {
        // 如果是当前页面，不进行跳转
        if (targetPage === '智能预测管理.html') {
            console.log('当前已在智能预测管理页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
