// 资产管理页面JavaScript

// 全局变量存储图表实例
let statusChart = null;
let gauge1Chart = null;
let gauge2Chart = null;

document.addEventListener('DOMContentLoaded', function() {
    // 加载资产数据
    loadAssetData();
    
    // 初始化事件监听器
    initializeEventListeners();
    
    // 添加统计卡片点击事件
    addStatItemClickEvents();
});

// 加载资产数据
async function loadAssetData() {
    try {
        // 获取资产总览数据
        const overviewResponse = await fetch('/api/asset/overview');
        const overviewResult = await overviewResponse.json();
        
        if (overviewResult.code === 200) {
            updateOverviewData(overviewResult.data);
        }
        
        // 获取分类统计数据
        const categoryResponse = await fetch('/api/asset/statistics/category-count');
        const categoryResult = await categoryResponse.json();
        
        if (categoryResult.code === 200) {
            updateCategoryPanel(categoryResult.data);
        }
        
        // 获取资产状态数据并初始化状态图表
        initializeStatusChart(overviewResult.data);
        
    } catch (error) {
        console.error('加载资产数据失败:', error);
    }
}

// 更新总览数据
function updateOverviewData(data) {
    // 计算使用率和闲置率
    const totalCount = data.totalCount || 0;
    const inUseCount = data.inUseCount || 0;
    const idleCount = data.idleCount || 0;
    
    // 避免除以0，如果总数为0则使用率和闲置率都为0
    const useRate = totalCount > 0 ? Math.round((inUseCount / totalCount) * 100) : 0;
    const idleRate = totalCount > 0 ? Math.round((idleCount / totalCount) * 100) : 0;
    
    // 更新使用率仪表盘
    updateGauge('assetGauge1', useRate, '#007bff', `使用中设备: ${inUseCount}台`);
    document.querySelector('#assetGauge1').parentElement.querySelector('.value').textContent = useRate + '%';
    
    // 更新闲置率仪表盘
    updateGauge('assetGauge2', idleRate, '#28a745', `闲置设备: ${idleCount}台`);
    document.querySelector('#assetGauge2').parentElement.querySelector('.value').textContent = idleRate + '%';
}

// 存储所有分类数据（包括子分类）
let allCategoriesData = [];

// 更新分类面板数据
async function updateCategoryPanel(categories) {
    console.log('分类数据:', categories);
    
    // 保存所有分类数据
    allCategoriesData = categories;
    
    // 只显示一级分类
    const topCategories = categories.filter(cat => {
        const parentId = cat.parent_id || cat.parentId;
        return !parentId || parentId === null;
    });
    
    console.log('一级分类:', topCategories);
    
    // 更新筛选器选项
    updateCategoryFilter(topCategories);
    
    // 获取所有子分类
    const subCategoriesResponse = await fetch('/api/asset/category/tree');
    const subCategoriesResult = await subCategoriesResponse.json();
    
    let categoryTree = [];
    if (subCategoriesResult.code === 200) {
        categoryTree = subCategoriesResult.data;
    }
    
    // 动态生成分类HTML
    renderCategoryPanel(topCategories, categoryTree);
}

// 渲染分类面板
function renderCategoryPanel(topCategories, categoryTree) {
    const container = document.getElementById('categoriesContent');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 图标和颜色映射
    const iconMap = {
        '服务器': 'fa-server',
        '网络设备': 'fa-network-wired',
        '存储设备': 'fa-hdd',
        '视频管理': 'fa-video'
    };
    
    const colorMap = {
        '服务器': 'blue',
        '网络设备': 'purple',
        '存储设备': 'orange',
        '视频管理': 'red'
    };
    
    topCategories.forEach(category => {
        const categoryName = category.categoryName || category.category_name;
        const categoryId = category.id;
        
        // 创建一级分类容器
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'category-group';
        categoryGroup.setAttribute('data-category-id', categoryId);
        
        // 创建一级分类项
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div class="category-icon ${colorMap[categoryName] || 'blue'}">
                <i class="fas ${iconMap[categoryName] || 'fa-cube'}"></i>
            </div>
            <div class="category-info">
                <div class="category-name">${categoryName}</div>
                <div class="category-count">${category.count || 0}</div>
            </div>
            <div class="category-expand">
                <i class="fas fa-chevron-down"></i>
            </div>
        `;
        
        // 点击一级分类
        categoryItem.onclick = function(e) {
            e.stopPropagation();
            toggleCategoryExpand(categoryId, category);
        };
        
        categoryGroup.appendChild(categoryItem);
        
        // 创建子分类容器（默认隐藏）
        const subCategoryContainer = document.createElement('div');
        subCategoryContainer.className = 'sub-category-container';
        subCategoryContainer.style.display = 'none';
        
        // 查找该分类的子分类
        const treeItem = categoryTree.find(t => t.id === categoryId);
        if (treeItem && treeItem.children && treeItem.children.length > 0) {
            treeItem.children.forEach(subCat => {
                const subCategoryItem = document.createElement('div');
                subCategoryItem.className = 'sub-category-item';
                subCategoryItem.setAttribute('data-subcategory-id', subCat.id);
                subCategoryItem.innerHTML = `
                    <div class="sub-category-name">${subCat.categoryName || subCat.category_name}</div>
                    <div class="sub-category-count">${subCat.count || 0}</div>
                `;
                
                // 点击子分类
                subCategoryItem.onclick = function(e) {
                    e.stopPropagation();
                    handleSubCategoryClick(subCat);
                };
                
                subCategoryContainer.appendChild(subCategoryItem);
            });
        }
        
        categoryGroup.appendChild(subCategoryContainer);
        container.appendChild(categoryGroup);
    });
}

// 切换分类展开/收起
function toggleCategoryExpand(categoryId, category) {
    const categoryGroup = document.querySelector(`.category-group[data-category-id="${categoryId}"]`);
    if (!categoryGroup) return;
    
    const subContainer = categoryGroup.querySelector('.sub-category-container');
    const expandIcon = categoryGroup.querySelector('.category-expand i');
    
    if (subContainer.style.display === 'none') {
        // 展开子分类
        subContainer.style.display = 'block';
        expandIcon.classList.remove('fa-chevron-down');
        expandIcon.classList.add('fa-chevron-up');
        
        // 高亮当前分类
        document.querySelectorAll('.category-item').forEach(item => {
            item.style.backgroundColor = '';
            item.style.borderLeft = '';
        });
        categoryGroup.querySelector('.category-item').style.backgroundColor = '#e3f2fd';
        categoryGroup.querySelector('.category-item').style.borderLeft = '3px solid #007bff';
    } else {
        // 收起子分类
        subContainer.style.display = 'none';
        expandIcon.classList.remove('fa-chevron-up');
        expandIcon.classList.add('fa-chevron-down');
        
        // 取消高亮
        categoryGroup.querySelector('.category-item').style.backgroundColor = '';
        categoryGroup.querySelector('.category-item').style.borderLeft = '';
        
        // 清除子分类选中状态
        categoryGroup.querySelectorAll('.sub-category-item').forEach(item => {
            item.classList.remove('active');
        });
    }
}

// 处理子分类点击
function handleSubCategoryClick(subCategory) {
    console.log('点击子分类:', subCategory);
    
    // 高亮选中的子分类
    document.querySelectorAll('.sub-category-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // 更新筛选器并加载对应设备
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = subCategory.id;
        loadDeviceList();
    }
    
    // 滚动到设备列表
    const deviceListSection = document.querySelector('.device-list-section');
    if (deviceListSection) {
        deviceListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 更新分类筛选器选项（显示所有子分类）
async function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // 清空现有选项（保留"全部类型"）
    categoryFilter.innerHTML = '<option value="">全部类型</option>';
    
    // 获取分类树
    try {
        const response = await fetch('/api/asset/category/tree');
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            // 遍历一级分类
            result.data.forEach(topCategory => {
                // 添加一级分类作为分组标题
                const optgroup = document.createElement('optgroup');
                optgroup.label = topCategory.categoryName || topCategory.category_name;
                
                // 添加该一级分类下的所有子分类
                if (topCategory.children && topCategory.children.length > 0) {
                    topCategory.children.forEach(subCategory => {
                        const option = document.createElement('option');
                        option.value = subCategory.id;
                        option.textContent = subCategory.categoryName || subCategory.category_name;
                        optgroup.appendChild(option);
                    });
                }
                
                categoryFilter.appendChild(optgroup);
            });
        }
    } catch (error) {
        console.error('更新分类筛选器失败:', error);
    }
}

// 处理分类点击事件
function handleCategoryClick(category) {
    console.log('点击分类:', category);
    
    // 高亮选中的分类
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.style.backgroundColor = '';
        item.style.borderLeft = '';
    });
    event.currentTarget.style.backgroundColor = '#e3f2fd';
    event.currentTarget.style.borderLeft = '3px solid #007bff';
    
    // 更新筛选器并加载对应设备
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category.id;
        loadDeviceList();
    }
    
    // 滚动到设备列表
    const deviceListSection = document.querySelector('.device-list-section');
    if (deviceListSection) {
        deviceListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 更新仪表盘
function updateGauge(canvasId, percentage, color, tooltipText) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // 销毁旧图表
    if (canvasId === 'assetGauge1' && gauge1Chart) {
        gauge1Chart.destroy();
    } else if (canvasId === 'assetGauge2' && gauge2Chart) {
        gauge2Chart.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [color, '#e9ecef'],
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
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) {
                                return tooltipText || `${percentage}%`;
                            }
                            return null;
                        }
                    },
                    filter: function(tooltipItem) {
                        return tooltipItem.dataIndex === 0;
                    }
                }
            }
        }
    });
    
    // 保存图表实例
    if (canvasId === 'assetGauge1') {
        gauge1Chart = chart;
    } else if (canvasId === 'assetGauge2') {
        gauge2Chart = chart;
    }
}

// 初始化资产概览仪表盘
function initializeAssetGauges() {
    // 在线率仪表盘
    const gauge1Ctx = document.getElementById('assetGauge1').getContext('2d');
    new Chart(gauge1Ctx, {
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

    // 利用率仪表盘
    const gauge2Ctx = document.getElementById('assetGauge2').getContext('2d');
    new Chart(gauge2Ctx, {
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

// 初始化资产状态分布图表
function initializeStatusChart(overviewData) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    // 销毁旧图表
    if (statusChart) {
        statusChart.destroy();
    }
    
    // 生成时间标签
    const timeLabels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        timeLabels.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
    }
    
    // 使用真实数据（模拟历史数据，实际项目中应该从后端获取历史数据）
    const inUseCount = overviewData.inUseCount || 0;
    const idleCount = overviewData.idleCount || 0;
    const maintenanceCount = overviewData.maintenanceCount || 0;
    
    // 生成模拟的历史数据（在实际项目中应该从后端API获取）
    const inUseData = timeLabels.map(() => inUseCount + Math.floor(Math.random() * 3 - 1));
    const idleData = timeLabels.map(() => idleCount + Math.floor(Math.random() * 2));
    const maintenanceData = timeLabels.map(() => maintenanceCount);
    
    statusChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: '在线',
                    data: inUseData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '离线',
                    data: idleData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '维护中',
                    data: maintenanceData,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
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
            console.log('搜索:', searchTerm);
        });
    }

    // 添加按钮点击事件
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            // 这里可以添加新增资产分类的逻辑
            console.log('添加新的资产分类');
        });
    }

    // 资产分类项点击事件
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他项的选中状态
            categoryItems.forEach(i => i.classList.remove('selected'));
            // 添加当前项的选中状态
            this.classList.add('selected');
            
            const categoryName = this.querySelector('.category-name').textContent;
            console.log('选中资产分类:', categoryName);
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

// 定期更新数据
function updateAssetData() {
    loadAssetData();
}

// 页面加载完成后定期更新数据
setInterval(updateAssetData, 30000); // 每30秒更新一次

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
        if (targetPage === '资产管理.html') {
            console.log('当前已在资产管理页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    }
}

// 添加统计卡片点击事件
function addStatItemClickEvents() {
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const label = this.querySelector('.stat-label').textContent;
            handleStatItemClick(label);
        });
    });
}

// 处理统计卡片点击
async function handleStatItemClick(label) {
    let filter = null;
    let title = '';
    
    switch(label) {
        case '资产总数':
            filter = null; // 显示所有资产
            title = '全部资产';
            break;
        case '在线':
            filter = { assetStatus: 'online' };
            title = '在线设备';
            break;
        case '离线':
            filter = { assetStatus: 'offline' };
            title = '离线设备';
            break;
        default:
            return;
    }
    
    await showDeviceList(filter, title);
}

// 显示设备列表
async function showDeviceList(filter, title) {
    try {
        // 构建API URL
        let url = '/api/asset/list';
        const params = new URLSearchParams();
        
        if (filter) {
            if (filter.assetStatus) {
                params.append('assetStatus', filter.assetStatus);
            }
            if (filter.categoryId) {
                params.append('categoryId', filter.categoryId);
            }
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('请求设备列表:', url);
        
        // 获取设备列表
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200) {
            displayDeviceModal(result.data, title);
        } else {
            console.error('获取设备列表失败:', result.message);
            alert('获取设备列表失败');
        }
    } catch (error) {
        console.error('获取设备列表出错:', error);
        alert('获取设备列表出错');
    }
}

// 显示设备模态框
function displayDeviceModal(devices, title) {
    const modal = document.getElementById('deviceListModal');
    const modalTitle = document.getElementById('modalTitle');
    const tableBody = document.getElementById('deviceTableBody');
    
    // 设置标题
    modalTitle.textContent = `${title} (${devices.length}台)`;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 如果没有设备
    if (devices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #999;">
                    暂无数据
                </td>
            </tr>
        `;
    } else {
        // 填充设备数据
        devices.forEach(device => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${device.assetCode || '-'}</td>
                <td>${device.assetName || '-'}</td>
                <td>${getCategoryName(device.categoryId)}</td>
                <td>${device.manufacturer || '-'}</td>
                <td>${device.model || '-'}</td>
                <td>${device.location || '-'}</td>
                <td>${device.ipAddress || '-'}</td>
                <td><span class="status-badge status-${device.assetStatus}">${getAssetStatusText(device.assetStatus)}</span></td>
                <td>${device.owner || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // 显示模态框
    modal.classList.add('show');
}

// 关闭设备模态框
function closeDeviceModal() {
    const modal = document.getElementById('deviceListModal');
    modal.classList.remove('show');
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('deviceListModal');
    if (event.target === modal) {
        closeDeviceModal();
    }
}

// 获取分类名称（简化版，实际应该从API获取）
function getCategoryName(categoryId) {
    const categoryMap = {
        5: 'Web服务器',
        6: '数据库服务器',
        7: '应用服务器',
        8: '交换机',
        9: '路由器',
        10: '防火墙',
        11: '无线AP',
        12: '网关',
        13: 'NAS存储',
        14: 'SAN存储',
        15: '摄像头',
        16: '视频交换机',
        17: '录像机',
        18: '视频存储',
        19: '显示器',
        20: '视频服务器',
        21: '视频网关',
        22: '其他视频设备'
    };
    return categoryMap[categoryId] || '未分类';
}

// 获取资产状态文本
function getAssetStatusText(status) {
    const statusMap = {
        'online': '在线',
        'offline': '离线',
        'maintenance': '维护中'
    };
    return statusMap[status] || status;
}

// ========== 设备列表功能 ==========

// 分页变量
let currentPageNum = 1;
let pageSize = 10;
let totalRecords = 0;
let allDevices = [];

// 页面加载时加载设备列表
window.addEventListener('load', function() {
    loadDeviceList();
    
    // 添加搜索框回车事件
    const searchInput = document.getElementById('deviceSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDevices();
            }
        });
    }
});

// 加载设备列表
async function loadDeviceList() {
    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('deviceSearchInput');
        
        const categoryId = categoryFilter ? categoryFilter.value : '';
        const assetStatus = statusFilter ? statusFilter.value : '';
        const keyword = searchInput ? searchInput.value : '';
        
        // 构建URL
        let url = '/api/asset/list';
        const params = new URLSearchParams();
        
        if (categoryId) params.append('categoryId', categoryId);
        if (assetStatus) params.append('assetStatus', assetStatus);
        if (keyword) params.append('keyword', keyword);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('加载设备列表:', url);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200) {
            allDevices = result.data;
            totalRecords = allDevices.length;
            currentPageNum = 1;
            displayDeviceList();
        } else {
            console.error('加载设备列表失败:', result.message);
        }
    } catch (error) {
        console.error('加载设备列表出错:', error);
    }
}

// 显示设备列表
function displayDeviceList() {
    const tbody = document.getElementById('deviceListTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // 计算分页
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (currentPageNum - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    const pageDevices = allDevices.slice(startIndex, endIndex);
    
    // 更新分页信息
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const totalRecordsEl = document.getElementById('totalRecords');
    
    if (currentPageEl) currentPageEl.textContent = currentPageNum;
    if (totalPagesEl) totalPagesEl.textContent = totalPages || 1;
    if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;
    
    // 如果没有数据
    if (pageDevices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    暂无设备数据
                </td>
            </tr>
        `;
        return;
    }
    
    // 填充数据
    pageDevices.forEach((device, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-asset-id', device.id);
        row.setAttribute('data-device-name', device.deviceName || '');
        const globalIndex = startIndex + index + 1;
        
        row.innerHTML = `
            <td>${globalIndex}</td>
            <td>${device.assetCode || '-'}</td>
            <td>${device.assetName || '-'}</td>
            <td>${device.deviceName || '-'}</td>
            <td>${getCategoryName(device.categoryId)}</td>
            <td>${device.manufacturer || '-'}</td>
            <td>${device.model || '-'}</td>
            <td>${device.location || '-'}</td>
            <td>${device.ipAddress || '-'}</td>
            <td>
                <span class="status-badge status-${device.assetStatus}">
                    ${getAssetStatusText(device.assetStatus)}
                </span>
            </td>
            <td>${device.owner || '-'}</td>
            <td class="action-buttons">
                <button class="action-btn btn-detail" onclick="viewDeviceDetail(${device.id})" title="查看详情">
                    <i class="fas fa-eye"></i> 详情
                </button>
                <button class="action-btn btn-edit" onclick="editDevice(${device.id})" title="编辑资产">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="action-btn btn-delete" onclick="deleteDevice(${device.id}, '${device.assetName}')" title="删除资产">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // 检查是否需要高亮显示
    checkAndHighlightAsset();
}

// 检查并高亮显示资产
function checkAndHighlightAsset() {
    const highlightAssetId = sessionStorage.getItem('highlightAssetId');
    const highlightDeviceName = sessionStorage.getItem('highlightDeviceName');
    
    if (highlightAssetId) {
        // 清除标记
        sessionStorage.removeItem('highlightAssetId');
        sessionStorage.removeItem('highlightDeviceName');
        
        // 延迟执行高亮，确保DOM已完全渲染
        setTimeout(() => {
            highlightAssetRow(parseInt(highlightAssetId));
        }, 300);
    } else if (highlightDeviceName) {
        // 如果没有ID但有设备名，尝试通过设备名查找
        sessionStorage.removeItem('highlightDeviceName');
        
        setTimeout(() => {
            const row = document.querySelector(`tr[data-device-name="${highlightDeviceName}"]`);
            if (row) {
                const assetId = row.getAttribute('data-asset-id');
                if (assetId) {
                    highlightAssetRow(parseInt(assetId));
                }
            }
        }, 300);
    }
}

// 高亮显示资产行
function highlightAssetRow(assetId) {
    // 查找资产表格中的对应行
    const row = document.querySelector(`tr[data-asset-id="${assetId}"]`);
    if (row) {
        // 移除所有高亮
        document.querySelectorAll('.asset-highlight').forEach(el => {
            el.classList.remove('asset-highlight');
        });
        
        // 添加高亮class
        row.classList.add('asset-highlight');
        
        // 滚动到该行
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 3秒后移除高亮
        setTimeout(() => {
            row.classList.remove('asset-highlight');
        }, 3000);
    }
}

// 搜索设备
function searchDevices() {
    currentPageNum = 1;
    loadDeviceList();
}

// 重置所有过滤条件
function resetFilters() {
    // 重置筛选器
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('deviceSearchInput');
    
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // 清除侧边栏高亮
    document.querySelectorAll('.category-item').forEach(item => {
        item.style.backgroundColor = '';
        item.style.borderLeft = '';
    });
    
    // 清除子分类高亮
    document.querySelectorAll('.sub-category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 收起所有展开的分类
    document.querySelectorAll('.sub-category-container').forEach(container => {
        container.style.display = 'none';
    });
    
    document.querySelectorAll('.category-expand i').forEach(icon => {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    });
    
    // 重置页码并重新加载
    currentPageNum = 1;
    loadDeviceList();
}

// 上一页
function previousPage() {
    if (currentPageNum > 1) {
        currentPageNum--;
        displayDeviceList();
    }
}

// 下一页
function nextPage() {
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (currentPageNum < totalPages) {
        currentPageNum++;
        displayDeviceList();
    }
}

// 查看设备详情
async function viewDeviceDetail(deviceId) {
    console.log('查看设备详情:', deviceId);
    
    try {
        const response = await fetch(`/api/asset/${deviceId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            displayAssetDetail(result.data);
        } else {
            alert('获取资产详情失败');
        }
    } catch (error) {
        console.error('获取资产详情出错:', error);
        alert('获取资产详情出错');
    }
}

// 显示资产详情
function displayAssetDetail(asset) {
    const container = document.getElementById('assetDetailContent');
    
    container.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">基本信息</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">资产编号:</div>
                    <div class="detail-value">${asset.assetCode || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">资产名称:</div>
                    <div class="detail-value">${asset.assetName || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">设备名称:</div>
                    <div class="detail-value">${asset.deviceName || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">分类:</div>
                    <div class="detail-value">${getCategoryName(asset.categoryId)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">制造商:</div>
                    <div class="detail-value">${asset.manufacturer || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">型号:</div>
                    <div class="detail-value">${asset.model || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">序列号:</div>
                    <div class="detail-value">${asset.serialNumber || '-'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">网络信息</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">IP地址:</div>
                    <div class="detail-value">${asset.ipAddress || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">MAC地址:</div>
                    <div class="detail-value">${asset.macAddress || '-'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">状态信息</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">资产状态:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${asset.assetStatus}">${getAssetStatusText(asset.assetStatus)}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">位置:</div>
                    <div class="detail-value">${asset.location || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">责任人:</div>
                    <div class="detail-value">${asset.owner || '-'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">采购信息</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">采购日期:</div>
                    <div class="detail-value">${asset.purchaseDate || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">保修到期:</div>
                    <div class="detail-value">${asset.warrantyEndDate || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">采购价格:</div>
                    <div class="detail-value">${asset.purchasePrice ? '¥' + asset.purchasePrice : '-'}</div>
                </div>
            </div>
        </div>
        
        ${asset.remark ? `
        <div class="detail-section">
            <div class="detail-section-title">备注</div>
            <div class="detail-value">${asset.remark}</div>
        </div>
        ` : ''}
    `;
    
    // 显示模态框
    document.getElementById('assetDetailModal').classList.add('show');
}

// 关闭详情模态框
function closeDetailModal() {
    document.getElementById('assetDetailModal').classList.remove('show');
}

// 编辑设备
async function editDevice(deviceId) {
    console.log('编辑设备:', deviceId);
    
    try {
        const response = await fetch(`/api/asset/${deviceId}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            await loadEditCategoryOptions();
            fillEditForm(result.data);
        } else {
            alert('获取资产信息失败');
        }
    } catch (error) {
        console.error('获取资产信息出错:', error);
        alert('获取资产信息出错');
    }
}

// 加载编辑表单的分类选项
async function loadEditCategoryOptions() {
    try {
        const response = await fetch('/api/asset/category/tree');
        const result = await response.json();
        
        const select = document.getElementById('edit_categoryId');
        select.innerHTML = '<option value="">请选择分类</option>';
        
        if (result.code === 200 && result.data) {
            result.data.forEach(topCategory => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = topCategory.categoryName;
                
                if (topCategory.children) {
                    topCategory.children.forEach(subCategory => {
                        const option = document.createElement('option');
                        option.value = subCategory.id;
                        option.textContent = subCategory.categoryName;
                        optgroup.appendChild(option);
                    });
                }
                
                select.appendChild(optgroup);
            });
        }
    } catch (error) {
        console.error('加载分类选项失败:', error);
    }
}

// 填充编辑表单
function fillEditForm(asset) {
    document.getElementById('edit_assetId').value = asset.id;
    document.getElementById('edit_assetCode').value = asset.assetCode || '';
    document.getElementById('edit_assetName').value = asset.assetName || '';
    document.getElementById('edit_deviceName').value = asset.deviceName || '';
    document.getElementById('edit_categoryId').value = asset.categoryId || '';
    document.getElementById('edit_manufacturer').value = asset.manufacturer || '';
    document.getElementById('edit_model').value = asset.model || '';
    document.getElementById('edit_serialNumber').value = asset.serialNumber || '';
    document.getElementById('edit_ipAddress').value = asset.ipAddress || '';
    document.getElementById('edit_macAddress').value = asset.macAddress || '';
    document.getElementById('edit_location').value = asset.location || '';
    document.getElementById('edit_owner').value = asset.owner || '';
    document.getElementById('edit_assetStatus').value = asset.assetStatus || 'offline';
    document.getElementById('edit_purchaseDate').value = asset.purchaseDate || '';
    document.getElementById('edit_warrantyEndDate').value = asset.warrantyEndDate || '';
    document.getElementById('edit_remark').value = asset.remark || '';
    
    // 隐藏编辑表单中不需要的字段
    hideAssetEditFields();
    
    // 显示模态框
    document.getElementById('assetEditModal').classList.add('show');
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('assetEditModal').classList.remove('show');
}

// 删除设备
async function deleteDevice(deviceId, assetName) {
    // 确认删除
    if (!confirm(`确定要删除资产"${assetName}"吗？\n\n此操作不可恢复！`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/asset/${deviceId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            alert('删除成功');
            loadDeviceList(); // 刷新列表
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
    }
}

// 打开新增资产模态框
async function openAddAssetModal() {
    await loadAddCategoryOptions();
    document.getElementById('assetAddForm').reset();
    document.getElementById('assetAddModal').classList.add('show');
}

// 关闭新增资产模态框
function closeAddModal() {
    document.getElementById('assetAddModal').classList.remove('show');
}

// 加载新增表单的分类选项
async function loadAddCategoryOptions() {
    try {
        const response = await fetch('/api/asset/category/tree');
        const result = await response.json();
        
        const select = document.getElementById('add_categoryId');
        select.innerHTML = '<option value="">请选择分类</option>';
        
        if (result.code === 200 && result.data) {
            result.data.forEach(topCategory => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = topCategory.categoryName;
                
                if (topCategory.children) {
                    topCategory.children.forEach(subCategory => {
                        const option = document.createElement('option');
                        option.value = subCategory.id;
                        option.textContent = subCategory.categoryName;
                        optgroup.appendChild(option);
                    });
                }
                
                select.appendChild(optgroup);
            });
        }
    } catch (error) {
        console.error('加载分类选项失败:', error);
    }
}

// 提交编辑表单
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('assetEditForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(editForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch(`/api/asset/${data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.code === 200) {
                    alert('保存成功');
                    closeEditModal();
                    loadDeviceList(); // 刷新列表
                } else {
                    alert('保存失败: ' + result.message);
                }
            } catch (error) {
                console.error('保存失败:', error);
                alert('保存失败');
            }
        });
    }
    
    // 提交新增表单
    const addForm = document.getElementById('assetAddForm');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(addForm);
            const data = Object.fromEntries(formData.entries());
            
            // 验证分类必须选择
            if (!data.categoryId || data.categoryId === '') {
                alert('请选择分类');
                return;
            }
            
            // 如果设备名称为空，删除该字段（可选字段）
            if (!data.deviceName || data.deviceName.trim() === '') {
                delete data.deviceName;
            }
            
            try {
                const response = await fetch('/api/asset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.code === 200) {
                    alert('新增成功');
                    closeAddModal();
                    loadDeviceList(); // 刷新列表
                } else {
                    alert('新增失败: ' + result.message);
                }
            } catch (error) {
                console.error('新增失败:', error);
                alert('新增失败');
            }
        });
    }
});

// ==================== 编辑表单字段显示/隐藏控制 ====================

/**
 * 隐藏编辑表单中不需要的字段
 * 包括：资产编号、资产名称、制造商、型号、序列号、采购日期、保修到期日期
 */
function hideAssetEditFields() {
    const fieldsToHide = [
        'edit_assetCodeNameRow',      // 资产编号 + 资产名称
        'edit_manufacturerGroup',      // 制造商
        'edit_modelSerialRow',         // 型号 + 序列号
        'edit_purchaseDateRow'         // 采购日期 + 保修到期日期
    ];
    
    fieldsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    console.log('✅ 已隐藏编辑表单中的字段：资产编号、资产名称、制造商、型号、序列号、采购日期、保修到期日期');
}

/**
 * 显示编辑表单中的所有字段（如果需要的话可以调用此函数）
 */
function showAssetEditFields() {
    const fieldsToShow = [
        'edit_assetCodeNameRow',
        'edit_manufacturerGroup',
        'edit_modelSerialRow',
        'edit_purchaseDateRow'
    ];
    
    fieldsToShow.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = '';
        }
    });
    
    console.log('✅ 已显示编辑表单中的所有字段');
}
