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

    // 子节点点击事件（虚拟机、云主机、存储等）
    const subNodes = document.querySelectorAll('.sub-node');
    subNodes.forEach(node => {
        node.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡

            // 移除其他子节点的选中状态
            subNodes.forEach(n => n.classList.remove('selected'));
            // 添加当前子节点的选中状态
            this.classList.add('selected');

            const provider = this.getAttribute('data-provider');
            const page = this.getAttribute('data-page');

            console.log(`选中: ${provider} - ${page}`);

            // 隐藏所有内容页面
            document.querySelectorAll('.content-page').forEach(p => {
                p.style.display = 'none';
            });

            // 显示对应的内容页面
            const pageId = `${provider}-${page}`;
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.style.display = 'block';

                // 加载对应的数据
                loadPageData(provider, page);
            } else {
                console.warn(`未找到页面: ${pageId}`);
            }
        });
    });
}

/**
 * 加载页面数据
 */
function loadPageData(provider, page) {
    console.log(`加载${provider}的${page}数据`);

    switch (page) {
        case 'vm':
            loadVMList(provider);
            break;
        case 'host':
            loadHostList(provider);
            break;
        case 'storage':
            loadStorageList(provider);
            break;
        case 'alert':
        case 'monitor':  // HTML中使用的是monitor
            loadAlertList(provider);
            break;
        case 'overview':
            loadOverviewStats(provider);
            break;
        default:
            console.warn(`未知页面类型: ${page}`);
    }
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
    // 加载华为云的虚拟机数据
    loadVMList('huawei');
}

// 加载腾讯云
function loadTencentCloud() {
    console.log('加载腾讯云');
    // 这里可以添加加载腾讯云的逻辑
}

// 加载阿里云
function loadAliCloud() {
    console.log('加载阿里云');
    // 加载阿里云的虚拟机数据
    loadVMList('aliyun');
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

    // 加载真实的资源概览数据
    loadOverviewStats('huawei');
}

// ==================== API数据加载函数 ====================

/**
 * 加载虚拟机列表
 */
async function loadVMList(provider, status = '', keyword = '') {
    try {
        console.log(`加载${provider}虚拟机列表...`);

        // 构建查询参数
        let url = `/api/cloud/vm/list?provider=${provider}`;
        if (status) url += `&status=${status}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            console.log(`${provider}虚拟机数据加载成功:`, result.data);
            renderVMTable(provider, result.data);
            return result.data;
        } else {
            console.error('虚拟机数据加载失败:', result.message);
            showError('虚拟机数据加载失败: ' + result.message);
            return [];
        }
    } catch (error) {
        console.error('加载虚拟机列表失败:', error);
        showError('加载虚拟机列表失败: ' + error.message);
        return [];
    }
}

/**
 * 渲染虚拟机表格
 */
function renderVMTable(provider, vmList) {
    const tableId = `${provider}-vm`;
    const tableBody = document.querySelector(`#${tableId} tbody`);

    if (!tableBody) {
        console.warn(`未找到虚拟机表格: ${tableId}`);
        return;
    }

    // 清空现有数据
    tableBody.innerHTML = '';

    if (vmList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">暂无虚拟机数据</td></tr>';
        return;
    }

    // 渲染每一行
    vmList.forEach(vm => {
        const row = document.createElement('tr');

        // 状态显示
        const statusText = vm.status === 'running' ? '运行中' :
                          vm.status === 'stopped' ? '已停止' :
                          vm.status === 'paused' ? '已暂停' : '未知';
        const statusColor = vm.status === 'running' ? '#52c41a' :
                           vm.status === 'stopped' ? '#ff4d4f' : '#faad14';

        row.innerHTML = `
            <td style="padding: 12px;">${vm.vm_name || vm.vmName || '-'}</td>
            <td style="padding: 12px;">
                <span style="color: ${statusColor}; font-weight: 500;">● ${statusText}</span>
            </td>
            <td style="padding: 12px;">${vm.spec_type || vm.specType || '-'} (${vm.cpu_cores || vm.cpuCores || 0}核${vm.memory_gb || vm.memoryGb || 0}G)</td>
            <td style="padding: 12px;">${vm.ip_address || vm.ipAddress || '-'}</td>
            <td style="padding: 12px;">${formatDateTime(vm.created_time || vm.createdTime)}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="viewVMDetail(${vm.id})" style="padding: 4px 12px; margin-right: 5px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">详情</button>
                ${vm.status === 'running' ?
                    `<button onclick="stopVM(${vm.id})" style="padding: 4px 12px; background: #ff4d4f; color: white; border: none; border-radius: 4px; cursor: pointer;">停止</button>` :
                    `<button onclick="startVM(${vm.id})" style="padding: 4px 12px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">启动</button>`
                }
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`渲染了 ${vmList.length} 条虚拟机记录`);
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

/**
 * 加载云主机列表
 */
async function loadHostList(provider, status = '', keyword = '') {
    try {
        console.log(`加载${provider}云主机列表...`);

        let url = `/api/cloud/host/list?provider=${provider}`;
        if (status) url += `&status=${status}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            console.log(`${provider}云主机数据加载成功:`, result.data);
            renderHostTable(provider, result.data);
            return result.data;
        } else {
            console.error('云主机数据加载失败:', result.message);
            showError('云主机数据加载失败: ' + result.message);
            return [];
        }
    } catch (error) {
        console.error('加载云主机列表失败:', error);
        showError('加载云主机列表失败: ' + error.message);
        return [];
    }
}

/**
 * 渲染云主机表格
 */
function renderHostTable(provider, hostList) {
    const tableId = `${provider}-host`;
    const tableBody = document.querySelector(`#${tableId} tbody`);

    if (!tableBody) {
        console.warn(`未找到云主机表格: ${tableId}`);
        return;
    }

    tableBody.innerHTML = '';

    if (hostList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">暂无云主机数据</td></tr>';
        return;
    }

    hostList.forEach(host => {
        const row = document.createElement('tr');
        const statusText = host.status === 'running' ? '运行中' : host.status === 'stopped' ? '已停止' : '未知';
        const statusColor = host.status === 'running' ? '#52c41a' : '#ff4d4f';

        row.innerHTML = `
            <td style="padding: 12px;">${host.host_name || host.hostName || '-'}</td>
            <td style="padding: 12px;">
                <span style="color: ${statusColor}; font-weight: 500;">● ${statusText}</span>
            </td>
            <td style="padding: 12px;">${host.instance_type || host.instanceType || '-'}</td>
            <td style="padding: 12px;">
                <div style="font-size: 12px; color: #666;">
                    CPU: ${host.cpu_usage || host.cpuUsage || 0}% (${host.cpu_cores || host.cpuCores || 0}核)<br/>
                    内存: ${host.memory_usage || host.memoryUsage || 0}% (${host.memory_gb || host.memoryGb || 0}GB)
                </div>
            </td>
            <td style="padding: 12px;">${host.public_ip || host.publicIp || '-'}</td>
            <td style="padding: 12px;">${host.region || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="viewHostDetail(${host.id})" style="padding: 4px 12px; margin-right: 5px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">详情</button>
                <button onclick="rebootHost(${host.id})" style="padding: 4px 12px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;">重启</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`渲染了 ${hostList.length} 条云主机记录`);
}

/**
 * 加载云存储列表
 */
async function loadStorageList(provider, storageType = '', keyword = '') {
    try {
        console.log(`加载${provider}云存储列表...`);

        let url = `/api/cloud/storage/list?provider=${provider}`;
        if (storageType) url += `&storageType=${storageType}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            console.log(`${provider}云存储数据加载成功:`, result.data);
            renderStorageTable(provider, result.data);
            return result.data;
        } else {
            console.error('云存储数据加载失败:', result.message);
            showError('云存储数据加载失败: ' + result.message);
            return [];
        }
    } catch (error) {
        console.error('加载云存储列表失败:', error);
        showError('加载云存储列表失败: ' + error.message);
        return [];
    }
}

/**
 * 渲染云存储表格
 */
function renderStorageTable(provider, storageList) {
    const tableId = `${provider}-storage`;
    const tableBody = document.querySelector(`#${tableId} tbody`);

    if (!tableBody) {
        console.warn(`未找到云存储表格: ${tableId}`);
        return;
    }

    tableBody.innerHTML = '';

    if (storageList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">暂无云存储数据</td></tr>';
        return;
    }

    storageList.forEach(storage => {
        const row = document.createElement('tr');

        // 计算使用百分比
        const capacityGb = storage.capacity_gb || storage.capacityGb || 0;
        const usedGb = storage.used_gb || storage.usedGb || 0;
        const usagePercent = capacityGb > 0 ? Math.round((usedGb / capacityGb) * 100) : 0;

        row.innerHTML = `
            <td style="padding: 12px;">${storage.storage_name || storage.storageName || '-'}</td>
            <td style="padding: 12px;">${storage.storage_type || storage.storageType || '-'}</td>
            <td style="padding: 12px;">${capacityGb} GB</td>
            <td style="padding: 12px;">${usedGb} GB (${usagePercent}%)</td>
            <td style="padding: 12px;">${storage.status || '-'}</td>
            <td style="padding: 12px;">${storage.region || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="viewStorageDetail(${storage.id})" style="padding: 4px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">详情</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`渲染了 ${storageList.length} 条云存储记录`);
}

/**
 * 加载云告警列表
 */
async function loadAlertList(provider, alertLevel = '', alertStatus = '') {
    try {
        console.log(`加载${provider}云告警列表...`);

        let url = `/api/cloud/alert/list?provider=${provider}`;
        if (alertLevel) url += `&alertLevel=${alertLevel}`;
        if (alertStatus) url += `&alertStatus=${alertStatus}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            console.log(`${provider}云告警数据加载成功:`, result.data);
            renderAlertTable(provider, result.data);
            return result.data;
        } else {
            console.error('云告警数据加载失败:', result.message);
            showError('云告警数据加载失败: ' + result.message);
            return [];
        }
    } catch (error) {
        console.error('加载云告警列表失败:', error);
        showError('加载云告警列表失败: ' + error.message);
        return [];
    }
}

/**
 * 渲染云告警表格
 */
function renderAlertTable(provider, alertList) {
    // HTML中的tbody ID格式：huaweiAlertTableBody, aliyunAlertTableBody
    const tableBodyId = `${provider}AlertTableBody`;
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) {
        console.warn(`未找到云告警表格: ${tableBodyId}`);
        return;
    }

    tableBody.innerHTML = '';

    if (alertList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">暂无告警数据</td></tr>';
        return;
    }

    alertList.forEach(alert => {
        const row = document.createElement('tr');

        // 告警级别处理（支持中英文）
        const alertLevel = alert.alert_level || alert.alertLevel || '';
        const levelText = alertLevel === 'critical' || alertLevel === '严重' ? '严重' :
                         alertLevel === 'warning' || alertLevel === '警告' ? '警告' :
                         alertLevel === 'info' || alertLevel === '信息' ? '信息' : alertLevel;
        const levelColor = levelText === '严重' ? '#ff4d4f' :
                          levelText === '警告' ? '#faad14' : '#1890ff';

        // 告警状态处理（支持中英文）
        const alertStatus = alert.alert_status || alert.alertStatus || '';
        const statusText = alertStatus === 'active' || alertStatus === '未解决' || alertStatus === '活跃' ? '未解决' :
                          alertStatus === 'resolved' || alertStatus === '已解决' ? '已解决' : alertStatus;

        row.innerHTML = `
            <td style="padding: 12px;">${formatDateTime(alert.alert_time || alert.alertTime)}</td>
            <td style="padding: 12px;">${alert.resource_name || alert.resourceName || '-'}</td>
            <td style="padding: 12px;">${alert.resource_type || alert.resourceType || '-'}</td>
            <td style="padding: 12px;">
                <span style="color: ${levelColor}; font-weight: 500;">${levelText}</span>
            </td>
            <td style="padding: 12px;">${alert.alert_message || alert.alertMessage || '-'}</td>
            <td style="padding: 12px;">${statusText}</td>
            <td style="padding: 12px; text-align: center;">
                ${statusText === '未解决' ?
                    `<button onclick="resolveAlert(${alert.id})" style="padding: 4px 12px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">解决</button>` :
                    '<span style="color: #999;">-</span>'
                }
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log(`渲染了 ${alertList.length} 条云告警记录`);
}

// 加载告警信息表格（兼容旧函数名）
function loadAlertTable() {
    console.log('加载告警信息表格');
    loadAlertList('huawei');
}

// 加载存储列表表格（兼容旧函数名）
function loadStorageTable() {
    console.log('加载存储列表表格');
    loadStorageList('huawei');
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

    // 刷新当前页面数据
    refreshCurrentPage();

    // 显示提示
    showSuccess('数据刷新成功');
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

    // 隐藏所有内容页面
    document.querySelectorAll('.content-page').forEach(p => {
        p.style.display = 'none';
    });

    // 默认显示华为云虚拟机页面
    const defaultPage = document.getElementById('huawei-vm');
    if (defaultPage) {
        defaultPage.style.display = 'block';
        console.log('显示默认页面: 华为云虚拟机');

        // 加载华为云虚拟机数据
        loadVMList('huawei');
    }

    // 默认选中华为云虚拟机子节点
    const defaultSubNode = document.querySelector('.sub-node[data-provider="huawei"][data-page="vm"]');
    if (defaultSubNode) {
        defaultSubNode.classList.add('selected');
    }
}

// 页面加载完成后执行初始化
setTimeout(initializePage, 100);

/**
 * 加载概览统计数据
 */
async function loadOverviewStats(provider) {
    try {
        console.log(`加载${provider}概览统计...`);

        const response = await fetch(`/api/cloud/overview/${provider}`);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            console.log(`${provider}概览统计加载成功:`, result.data);
            updateOverviewDisplay(result.data);
            return result.data;
        } else {
            console.error('概览统计加载失败:', result.message);
            return null;
        }
    } catch (error) {
        console.error('加载概览统计失败:', error);
        return null;
    }
}

/**
 * 更新概览显示
 */
function updateOverviewDisplay(stats) {
    console.log('更新概览显示，数据:', stats);

    // 获取当前选中的provider
    const selectedNode = document.querySelector('.sub-node.selected');
    if (!selectedNode) return;

    const provider = selectedNode.getAttribute('data-provider');
    const prefix = provider === 'huawei' ? 'hw' : 'ali';

    // 更新总实例数（虚拟机 + 云主机）
    const totalInstances = (stats.totalCount || 0);
    const totalInstancesEl = document.getElementById(`${prefix}-total-instances`);
    if (totalInstancesEl) {
        totalInstancesEl.textContent = totalInstances;
    }

    // 更新运行中实例数
    const runningInstancesEl = document.getElementById(`${prefix}-running-instances`);
    if (runningInstancesEl) {
        runningInstancesEl.textContent = stats.runningCount || 0;
    }

    // 更新CPU总核数
    const totalCpuEl = document.getElementById(`${prefix}-total-cpu`);
    if (totalCpuEl) {
        totalCpuEl.textContent = stats.totalCpu || 0;
    }

    // 更新内存总量
    const totalMemoryEl = document.getElementById(`${prefix}-total-memory`);
    if (totalMemoryEl) {
        totalMemoryEl.textContent = stats.totalMemory || 0;
    }

    // 更新存储总量
    const totalStorageEl = document.getElementById(`${prefix}-total-storage`);
    if (totalStorageEl) {
        totalStorageEl.textContent = stats.totalStorage || 0;
    }

    console.log(`概览显示已更新: 总实例=${totalInstances}, 运行中=${stats.runningCount}, CPU=${stats.totalCpu}, 内存=${stats.totalMemory}, 存储=${stats.totalStorage}`);
}

/**
 * 更新统计卡片
 */
function updateStatCard(type, stats) {
    const cardElement = document.querySelector(`.stat-card[data-type="${type}"]`);
    if (cardElement) {
        // 更新卡片内容
        console.log(`更新${type}统计卡片:`, stats);
    }
}

// ==================== 操作函数 ====================

/**
 * 查看虚拟机详情
 */
async function viewVMDetail(vmId) {
    try {
        const response = await fetch(`/api/cloud/vm/${vmId}`);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            const vm = result.data;
            const details = `
虚拟机详情
━━━━━━━━━━━━━━━━━━━━━━
名称: ${vm.vm_name || vm.vmName || '-'}
虚拟机ID: ${vm.vm_id || vm.vmId || '-'}
状态: ${vm.status === 'running' ? '运行中' : vm.status === 'stopped' ? '已停止' : vm.status}
规格: ${vm.spec_type || vm.specType || '-'}
配置: ${vm.cpu_cores || vm.cpuCores || 0}核 ${vm.memory_gb || vm.memoryGb || 0}GB 内存
磁盘: ${vm.disk_gb || vm.diskGb || 0}GB
IP地址: ${vm.ip_address || vm.ipAddress || '-'}
区域: ${vm.region || '-'}
━━━━━━━━━━━━━━━━━━━━━━
资源使用情况:
CPU使用率: ${vm.cpu_usage || vm.cpuUsage || 0}%
CPU负载: ${vm.cpu_load || vm.cpuLoad || 0}
内存使用率: ${vm.memory_usage || vm.memoryUsage || 0}%
内存已用: ${vm.memory_used || vm.memoryUsed || 0}GB
网络使用率: ${vm.network_usage || vm.networkUsage || 0}%
网络流入: ${vm.network_in || vm.networkIn || 0}MB/s
网络流出: ${vm.network_out || vm.networkOut || 0}MB/s
存储使用率: ${vm.storage_usage || vm.storageUsage || 0}%
━━━━━━━━━━━━━━━━━━━━━━
创建时间: ${formatDateTime(vm.created_time || vm.createdTime)}
更新时间: ${formatDateTime(vm.updated_time || vm.updatedTime)}
            `.trim();
            alert(details);
        } else {
            showError('获取虚拟机详情失败');
        }
    } catch (error) {
        console.error('查看虚拟机详情失败:', error);
        showError('查看虚拟机详情失败');
    }
}

/**
 * 启动虚拟机
 */
async function startVM(vmId) {
    if (!confirm('确定要启动该虚拟机吗？')) return;

    try {
        const response = await fetch(`/api/cloud/vm/${vmId}/start`, { method: 'PUT' });
        const result = await response.json();

        if (result.code === 200) {
            showSuccess('虚拟机启动成功');
            // 刷新当前页面数据
            refreshCurrentPage();
        } else {
            showError('虚拟机启动失败: ' + result.message);
        }
    } catch (error) {
        console.error('启动虚拟机失败:', error);
        showError('启动虚拟机失败');
    }
}

/**
 * 停止虚拟机
 */
async function stopVM(vmId) {
    if (!confirm('确定要停止该虚拟机吗？')) return;

    try {
        const response = await fetch(`/api/cloud/vm/${vmId}/stop`, { method: 'PUT' });
        const result = await response.json();

        if (result.code === 200) {
            showSuccess('虚拟机停止成功');
            refreshCurrentPage();
        } else {
            showError('虚拟机停止失败: ' + result.message);
        }
    } catch (error) {
        console.error('停止虚拟机失败:', error);
        showError('停止虚拟机失败');
    }
}

/**
 * 查看云主机详情
 */
async function viewHostDetail(hostId) {
    try {
        const response = await fetch(`/api/cloud/host/${hostId}`);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            const host = result.data;
            const details = `
云主机详情
━━━━━━━━━━━━━━━━━━━━━━
名称: ${host.host_name || host.hostName || '-'}
主机ID: ${host.host_id || host.hostId || '-'}
状态: ${host.status === 'running' ? '运行中' : host.status === 'stopped' ? '已停止' : host.status}
实例类型: ${host.instance_type || host.instanceType || '-'}
配置: ${host.cpu_cores || host.cpuCores || 0}核 ${host.memory_gb || host.memoryGb || 0}GB 内存
操作系统: ${host.os_type || host.osType || '-'}
公网IP: ${host.public_ip || host.publicIp || '-'}
私网IP: ${host.private_ip || host.privateIp || '-'}
区域: ${host.region || '-'}
━━━━━━━━━━━━━━━━━━━━━━
资源使用情况:
CPU使用率: ${host.cpu_usage || host.cpuUsage || 0}%
CPU负载: ${host.cpu_load || host.cpuLoad || 0}
内存使用率: ${host.memory_usage || host.memoryUsage || 0}%
内存已用: ${host.memory_used || host.memoryUsed || 0}GB
网络使用率: ${host.network_usage || host.networkUsage || 0}%
网络流入: ${host.network_in || host.networkIn || 0}MB/s
网络流出: ${host.network_out || host.networkOut || 0}MB/s
存储使用率: ${host.storage_usage || host.storageUsage || 0}%
存储已用: ${host.storage_used || host.storageUsed || 0}GB
存储总量: ${host.storage_total || host.storageTotal || 0}GB
━━━━━━━━━━━━━━━━━━━━━━
创建时间: ${formatDateTime(host.created_time || host.createdTime)}
更新时间: ${formatDateTime(host.updated_time || host.updatedTime)}
            `.trim();
            alert(details);
        } else {
            showError('获取云主机详情失败');
        }
    } catch (error) {
        console.error('查看云主机详情失败:', error);
        showError('查看云主机详情失败');
    }
}

/**
 * 重启云主机
 */
async function rebootHost(hostId) {
    if (!confirm('确定要重启该云主机吗？')) return;

    try {
        const response = await fetch(`/api/cloud/host/${hostId}/reboot`, { method: 'PUT' });
        const result = await response.json();

        if (result.code === 200) {
            showSuccess('云主机重启成功');
            refreshCurrentPage();
        } else {
            showError('云主机重启失败: ' + result.message);
        }
    } catch (error) {
        console.error('重启云主机失败:', error);
        showError('重启云主机失败');
    }
}

/**
 * 查看存储详情
 */
async function viewStorageDetail(storageId) {
    try {
        const response = await fetch(`/api/cloud/storage/${storageId}`);
        const result = await response.json();

        if (result.code === 200 && result.data) {
            const storage = result.data;
            const capacityGb = storage.capacity_gb || storage.capacityGb || 0;
            const usedGb = storage.used_gb || storage.usedGb || 0;
            const usagePercent = capacityGb > 0 ? Math.round((usedGb / capacityGb) * 100) : 0;
            const availableGb = capacityGb - usedGb;

            const details = `
云存储详情
━━━━━━━━━━━━━━━━━━━━━━
名称: ${storage.storage_name || storage.storageName || '-'}
存储ID: ${storage.storage_id || storage.storageId || '-'}
类型: ${storage.storage_type || storage.storageType || '-'}
状态: ${storage.status || '-'}
区域: ${storage.region || '-'}
━━━━━━━━━━━━━━━━━━━━━━
容量信息:
总容量: ${capacityGb} GB
已使用: ${usedGb} GB
可用空间: ${availableGb} GB
使用率: ${usagePercent}%
━━━━━━━━━━━━━━━━━━━━━━
创建时间: ${formatDateTime(storage.created_time || storage.createdTime)}
更新时间: ${formatDateTime(storage.updated_time || storage.updatedTime)}
            `.trim();
            alert(details);
        } else {
            showError('获取存储详情失败');
        }
    } catch (error) {
        console.error('查看存储详情失败:', error);
        showError('查看存储详情失败');
    }
}

/**
 * 解决告警
 */
async function resolveAlert(alertId) {
    if (!confirm('确定要解决该告警吗？')) return;

    try {
        const response = await fetch(`/api/cloud/alert/${alertId}/resolve`, { method: 'PUT' });
        const result = await response.json();

        if (result.code === 200) {
            showSuccess('告警已解决');
            refreshCurrentPage();
        } else {
            showError('解决告警失败: ' + result.message);
        }
    } catch (error) {
        console.error('解决告警失败:', error);
        showError('解决告警失败');
    }
}

/**
 * 搜索虚拟机
 */
function searchVMs(provider) {
    const statusFilter = document.getElementById(`${provider}VmStatusFilter`).value;
    const keyword = document.getElementById(`${provider}VmSearchKeyword`).value;
    loadVMList(provider, statusFilter, keyword);
}

/**
 * 搜索云主机
 */
function searchHosts(provider) {
    const statusFilter = document.getElementById(`${provider}HostStatusFilter`).value;
    const keyword = document.getElementById(`${provider}HostSearchKeyword`).value;
    loadHostList(provider, statusFilter, keyword);
}

/**
 * 搜索告警
 */
function searchAlerts(provider) {
    const levelFilter = document.getElementById(`${provider}AlertLevelFilter`).value;
    const statusFilter = document.getElementById(`${provider}AlertStatusFilter`).value;
    loadAlertList(provider, levelFilter, statusFilter);
}

/**
 * 刷新当前页面数据
 */
function refreshCurrentPage() {
    // 获取当前选中的云平台提供商
    const selectedNode = document.querySelector('.sub-node.selected');
    if (selectedNode) {
        const provider = selectedNode.getAttribute('data-provider');
        const page = selectedNode.getAttribute('data-page');

        console.log(`刷新${provider}的${page}页面`);

        switch (page) {
            case 'vm':
                loadVMList(provider);
                break;
            case 'host':
                loadHostList(provider);
                break;
            case 'storage':
                loadStorageList(provider);
                break;
            case 'alert':
            case 'monitor':
                loadAlertList(provider);
                break;
        }
    }
}

// ==================== 工具函数 ====================

/**
 * 格式化日期时间
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 显示错误消息
 */
function showError(message) {
    console.error(message);
    alert('错误: ' + message);
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
    console.log(message);
    alert(message);
}

// ==================== 添加设备功能 ====================

/**
 * 显示添加虚拟机对话框
 */
function showAddVMDialog(provider) {
    document.getElementById('vmProvider').value = provider;
    document.getElementById('addVMDialog').style.display = 'flex';
    // 清空表单
    document.getElementById('addVMForm').reset();
    document.getElementById('vmProvider').value = provider;
}

/**
 * 关闭添加虚拟机对话框
 */
function closeAddVMDialog() {
    document.getElementById('addVMDialog').style.display = 'none';
}

/**
 * 显示添加云主机对话框
 */
function showAddHostDialog(provider) {
    document.getElementById('hostProvider').value = provider;
    document.getElementById('addHostDialog').style.display = 'flex';
    // 清空表单
    document.getElementById('addHostForm').reset();
    document.getElementById('hostProvider').value = provider;
}

/**
 * 关闭添加云主机对话框
 */
function closeAddHostDialog() {
    document.getElementById('addHostDialog').style.display = 'none';
}

/**
 * 提交添加虚拟机表单
 */
async function submitAddVM(formData) {
    try {
        const response = await fetch('/api/cloud/vm/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.code === 200) {
            showSuccess('虚拟机添加成功！');
            closeAddVMDialog();
            // 刷新当前页面
            loadVMList(formData.provider);
        } else {
            showError('添加失败: ' + result.message);
        }
    } catch (error) {
        console.error('添加虚拟机失败:', error);
        showError('添加虚拟机失败: ' + error.message);
    }
}

/**
 * 提交添加云主机表单
 */
async function submitAddHost(formData) {
    try {
        const response = await fetch('/api/cloud/host/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.code === 200) {
            showSuccess('云主机添加成功！');
            closeAddHostDialog();
            // 刷新当前页面
            loadHostList(formData.provider);
        } else {
            showError('添加失败: ' + result.message);
        }
    } catch (error) {
        console.error('添加云主机失败:', error);
        showError('添加云主机失败: ' + error.message);
    }
}

// 绑定表单提交事件
document.addEventListener('DOMContentLoaded', function() {
    // 虚拟机表单提交
    const vmForm = document.getElementById('addVMForm');
    if (vmForm) {
        vmForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                provider: document.getElementById('vmProvider').value,
                vmName: document.getElementById('vmName').value,
                vmId: document.getElementById('vmId').value,
                specType: document.getElementById('specType').value,
                cpuCores: parseInt(document.getElementById('cpuCores').value),
                memoryGb: parseInt(document.getElementById('memoryGb').value),
                diskGb: parseInt(document.getElementById('diskGb').value),
                ipAddress: document.getElementById('ipAddress').value,
                region: document.getElementById('vmRegion').value,
                status: document.getElementById('vmStatus').value,
                // 设置默认的资源使用率
                cpuUsage: 0,
                memoryUsage: 0,
                networkUsage: 0,
                storageUsage: 0
            };

            submitAddVM(formData);
        });
    }

    // 云主机表单提交
    const hostForm = document.getElementById('addHostForm');
    if (hostForm) {
        hostForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                provider: document.getElementById('hostProvider').value,
                hostName: document.getElementById('hostName').value,
                hostId: document.getElementById('hostId').value,
                instanceType: document.getElementById('instanceType').value,
                cpuCores: parseInt(document.getElementById('hostCpuCores').value),
                memoryGb: parseInt(document.getElementById('hostMemoryGb').value),
                osType: document.getElementById('osType').value,
                publicIp: document.getElementById('publicIp').value,
                privateIp: document.getElementById('privateIp').value,
                region: document.getElementById('hostRegion').value,
                status: document.getElementById('hostStatus').value,
                // 设置默认的资源使用率
                cpuUsage: 0,
                memoryUsage: 0,
                networkUsage: 0,
                storageUsage: 0
            };

            submitAddHost(formData);
        });
    }
});

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
