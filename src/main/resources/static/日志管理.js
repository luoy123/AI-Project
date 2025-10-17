// 日志管理页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化日志分类树
    initializeLogTree();
    
    // 初始化表格
    initializeTable();
    
    // 初始化过滤器
    initializeFilters();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('顶部搜索:', searchTerm);
        });
    }

    const mainSearchInput = document.getElementById('mainSearchInput');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('主要搜索:', searchTerm);
            // 这里可以添加日志搜索逻辑
            filterLogs(searchTerm);
        });
    }

    // 工具栏按钮事件
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log('点击按钮:', buttonText);
            
            switch(buttonText) {
                case '导出':
                    exportLogs();
                    break;
                case '刷新':
                    refreshLogs();
                    break;
                default:
                    console.log('未知按钮操作');
            }
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

// 初始化日志分类树
function initializeLogTree() {
    // 日志分类节点选择事件
    const nodeItems = document.querySelectorAll('.node-item');
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他节点的选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前节点的选中状态
            this.classList.add('selected');
            
            const nodeText = this.querySelector('.node-text').textContent;
            console.log('选中日志分类:', nodeText);
            
            // 根据选中的分类更新右侧内容
            updateLogContent(nodeText);
        });
    });
}

// 初始化过滤器
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的激活状态
            this.classList.add('active');
            
            const level = this.getAttribute('data-level');
            console.log('选择日志级别:', level);
            
            // 根据选择的级别过滤日志
            filterLogsByLevel(level);
        });
    });
}

// 初始化表格
function initializeTable() {
    // 这里可以添加表格初始化逻辑
    console.log('初始化日志表格');
    
    // 模拟加载数据
    loadLogData();
}

// 加载日志数据
function loadLogData() {
    // 模拟异步加载数据
    setTimeout(() => {
        console.log('日志数据加载完成');
        // 这里可以添加实际的数据加载逻辑
    }, 1000);
}

// 过滤日志数据
function filterLogs(searchTerm) {
    console.log('过滤日志数据:', searchTerm);
    // 这里可以添加日志过滤逻辑
}

// 根据级别过滤日志
function filterLogsByLevel(level) {
    console.log('根据级别过滤日志:', level);
    
    // 这里可以添加根据日志级别过滤的逻辑
    switch(level) {
        case 'all':
            showAllLogs();
            break;
        case 'error':
            showErrorLogs();
            break;
        case 'warning':
            showWarningLogs();
            break;
        case 'info':
            showInfoLogs();
            break;
        case 'debug':
            showDebugLogs();
            break;
        default:
            showAllLogs();
    }
}

// 显示所有日志
function showAllLogs() {
    console.log('显示所有日志');
    // 这里可以添加显示所有日志的逻辑
}

// 显示错误日志
function showErrorLogs() {
    console.log('显示错误日志');
    // 这里可以添加显示错误日志的逻辑
}

// 显示警告日志
function showWarningLogs() {
    console.log('显示警告日志');
    // 这里可以添加显示警告日志的逻辑
}

// 显示信息日志
function showInfoLogs() {
    console.log('显示信息日志');
    // 这里可以添加显示信息日志的逻辑
}

// 显示调试日志
function showDebugLogs() {
    console.log('显示调试日志');
    // 这里可以添加显示调试日志的逻辑
}

// 更新日志内容
function updateLogContent(categoryName) {
    console.log('更新日志内容:', categoryName);
    
    // 根据选中的分类更新右侧表格内容
    switch(categoryName) {
        case '日志管理':
            loadAllLogs();
            break;
        case 'Syslog日志':
            loadSyslogData();
            break;
        case 'Syslog配置':
            loadSyslogConfig();
            break;
        case '日志统计':
            loadLogStatistics();
            break;
        case '日志过滤':
            loadLogFilters();
            break;
        case '告警日志':
            loadAlertLogs();
            break;
        default:
            loadDefaultLogs();
    }
}

// 加载所有日志
function loadAllLogs() {
    console.log('加载所有日志');
    // 这里可以添加加载所有日志的逻辑
}

// 加载Syslog数据
function loadSyslogData() {
    console.log('加载Syslog数据');
    // 这里可以添加加载Syslog数据的逻辑
}

// 加载Syslog配置
function loadSyslogConfig() {
    console.log('加载Syslog配置');
    // 这里可以添加加载Syslog配置的逻辑
}

// 加载日志统计
function loadLogStatistics() {
    console.log('加载日志统计');
    // 这里可以添加加载日志统计的逻辑
}

// 加载日志过滤器
function loadLogFilters() {
    console.log('加载日志过滤器');
    // 这里可以添加加载日志过滤器的逻辑
}

// 加载告警日志
function loadAlertLogs() {
    console.log('加载告警日志');
    // 这里可以添加加载告警日志的逻辑
}

// 加载默认日志
function loadDefaultLogs() {
    console.log('加载默认日志');
    // 这里可以添加加载默认日志的逻辑
}

// 导出日志
function exportLogs() {
    console.log('导出日志');
    // 这里可以添加导出日志的逻辑
    alert('导出日志功能');
}

// 刷新日志
function refreshLogs() {
    console.log('刷新日志');
    // 这里可以添加刷新日志的逻辑
    
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('日志刷新完成');
    }, 1000);
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
    console.log('日志管理页面初始化完成');
    
    // 默认选中Syslog日志
    const defaultNode = document.querySelector('.node-item.selected');
    if (defaultNode) {
        const nodeText = defaultNode.querySelector('.node-text').textContent;
        updateLogContent(nodeText);
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
        if (targetPage === '日志管理.html') {
            console.log('当前已在日志管理页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
