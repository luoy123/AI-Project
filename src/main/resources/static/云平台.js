// 云平台页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化云平台分类树
    initializeCloudTree();
    
    // 初始化导航标签
    initializeNavTabs();
    
    // 初始化资源数据
    initializeResourceData();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索云资源:', searchTerm);
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
                    refreshCloudData();
                    break;
                default:
                    console.log('未知按钮操作');
            }
        });
    });

    // 筛选下拉框事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            const filterType = this.options[0].text;
            const filterValue = this.value;
            console.log('筛选:', filterType, filterValue);

            // 根据筛选条件更新表格数据
            filterTableData(filterType, filterValue);
        });
    });

    // 操作按钮事件
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log('操作按钮:', buttonText);

            switch(buttonText) {
                case '新增存储':
                    addNewStorage();
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

// 初始化云平台分类树
function initializeCloudTree() {
    // 云平台分类节点选择事件
    const nodeItems = document.querySelectorAll('.node-item');
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他节点的选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前节点的选中状态
            this.classList.add('selected');
            
            const nodeText = this.querySelector('.node-text').textContent;
            console.log('选中云平台分类:', nodeText);
            
            // 根据选中的分类更新右侧内容
            updateCloudContent(nodeText);
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

// 初始化资源数据
function initializeResourceData() {
    // 模拟加载资源数据
    loadResourceOverview();
    loadAlertTable();
    loadStorageTable();
}

// 切换标签内容
function switchTabContent(tabType) {
    console.log('切换到标签:', tabType);
    
    // 根据不同标签类型加载不同内容
    switch(tabType) {
        case 'huawei':
            loadHuaweiCloudContent();
            break;
        case 'overview':
            loadOverviewContent();
            break;
        default:
            loadHuaweiCloudContent();
    }
}

// 加载华为云内容
function loadHuaweiCloudContent() {
    console.log('加载华为云内容');
    // 这里可以添加加载华为云内容的逻辑
}

// 加载概览内容
function loadOverviewContent() {
    console.log('加载概览内容');
    // 这里可以添加加载概览内容的逻辑
}

// 更新云平台内容
function updateCloudContent(categoryName) {
    console.log('更新云平台内容:', categoryName);
    
    // 根据选中的分类更新右侧内容
    switch(categoryName) {
        case '云平台':
            loadCloudPlatform();
            break;
        case '华为云':
            loadHuaweiCloud();
            break;
        case '腾讯云':
            loadTencentCloud();
            break;
        case '阿里云':
            loadAliCloud();
            break;
        case '云资源':
            loadCloudResources();
            break;
        case '内网云平台':
            loadInternalCloud();
            break;
        default:
            loadCloudPlatform();
    }
}

// 加载云平台
function loadCloudPlatform() {
    console.log('加载云平台');
    // 这里可以添加加载云平台的逻辑
}

// 加载华为云
function loadHuaweiCloud() {
    console.log('加载华为云');
    // 这里可以添加加载华为云的逻辑
}

// 加载腾讯云
function loadTencentCloud() {
    console.log('加载腾讯云');
    // 这里可以添加加载腾讯云的逻辑
}

// 加载阿里云
function loadAliCloud() {
    console.log('加载阿里云');
    // 这里可以添加加载阿里云的逻辑
}

// 加载云资源
function loadCloudResources() {
    console.log('加载云资源');
    // 这里可以添加加载云资源的逻辑
}

// 加载内网云平台
function loadInternalCloud() {
    console.log('加载内网云平台');
    // 这里可以添加加载内网云平台的逻辑
}

// 加载资源概览
function loadResourceOverview() {
    console.log('加载资源概览');
    
    // 模拟更新资源数据
    updateResourceMetrics();
}

// 更新资源指标
function updateResourceMetrics() {
    // 这里可以添加更新资源指标的逻辑
    console.log('更新资源指标');
    
    // 模拟数据更新
    const metrics = {
        consumeCloud: { running: 0, stopped: 0, paused: 0, fault: 0, other: 0 },
        cpu: { total: 0, used: 0, current: 0 },
        memory: { total: 0, used: 0, current: 0 },
        storage: { total: 0, used: 0, current: 0 }
    };
    
    // 更新页面显示
    updateMetricsDisplay(metrics);
}

// 更新指标显示
function updateMetricsDisplay(metrics) {
    console.log('更新指标显示:', metrics);
    // 这里可以添加更新页面指标显示的逻辑
}

// 加载告警信息表格
function loadAlertTable() {
    console.log('加载告警信息表格');
    // 这里可以添加加载告警信息表格数据的逻辑
}

// 加载存储列表表格
function loadStorageTable() {
    console.log('加载存储列表表格');
    // 这里可以添加加载存储列表表格数据的逻辑
}

// 筛选表格数据
function filterTableData(filterType, filterValue) {
    console.log('筛选表格数据:', filterType, filterValue);

    // 根据筛选条件更新表格
    if (filterType === '告警级别') {
        filterByAlertLevel(filterValue);
    } else if (filterType === '告警状态') {
        filterByAlertStatus(filterValue);
    } else if (filterType === '存储类型') {
        filterByStorageType(filterValue);
    }
}

// 按告警级别筛选
function filterByAlertLevel(level) {
    console.log('按告警级别筛选:', level);
    // 这里可以添加按告警级别筛选的逻辑
}

// 按告警状态筛选
function filterByAlertStatus(status) {
    console.log('按告警状态筛选:', status);
    // 这里可以添加按告警状态筛选的逻辑
}

// 按存储类型筛选
function filterByStorageType(storageType) {
    console.log('按存储类型筛选:', storageType);
    // 这里可以添加按存储类型筛选的逻辑
}

// 新增存储
function addNewStorage() {
    console.log('新增存储');
    // 这里可以添加新增存储的逻辑
    alert('新增存储功能');
}

// 刷新云平台数据
function refreshCloudData() {
    console.log('刷新云平台数据');
    
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('云平台数据刷新完成');
        
        // 重新加载数据
        initializeResourceData();
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
    console.log('云平台页面初始化完成');
    
    // 默认选中云平台
    const defaultNode = document.querySelector('.node-item.selected');
    if (defaultNode) {
        const nodeText = defaultNode.querySelector('.node-text').textContent;
        updateCloudContent(nodeText);
    }
    
    // 默认选中华为云标签
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
        if (targetPage === '云平台.html') {
            console.log('当前已在云平台页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
