// CMDB页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化树形结构
    initializeTree();
    
    // 初始化表格
    initializeTable();
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
            // 这里可以添加表格搜索逻辑
            filterTable(searchTerm);
        });
    }

    // 工具栏按钮事件
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log('点击按钮:', buttonText);
            
            switch(buttonText) {
                case '导出模板':
                    exportTemplate();
                    break;
                case '导入数据':
                    importData();
                    break;
                case '新增CI类型':
                    addCIType();
                    break;
                case '批量操作':
                    batchOperation();
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

// 初始化树形结构
function initializeTree() {
    // 树节点切换事件
    const nodeToggles = document.querySelectorAll('.node-toggle');
    nodeToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNode(this);
        });
    });

    // 树节点选择事件
    const nodeItems = document.querySelectorAll('.node-item');
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他节点的选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前节点的选中状态
            this.classList.add('selected');
            
            const nodeText = this.querySelector('.node-text').textContent;
            console.log('选中节点:', nodeText);
            
            // 根据选中的节点更新右侧内容
            updateMainContent(nodeText);
        });
    });
}

// 切换树节点展开/折叠
function toggleNode(toggleElement) {
    const nodeItem = toggleElement.parentElement;
    const treeNode = nodeItem.parentElement;
    const nodeChildren = treeNode.querySelector('.node-children');
    
    if (nodeChildren) {
        const isExpanded = nodeItem.classList.contains('expanded');
        
        if (isExpanded) {
            // 折叠节点
            nodeItem.classList.remove('expanded');
            toggleElement.classList.remove('fa-chevron-down');
            toggleElement.classList.add('fa-chevron-right');
            nodeChildren.style.display = 'none';
        } else {
            // 展开节点
            nodeItem.classList.add('expanded');
            toggleElement.classList.remove('fa-chevron-right');
            toggleElement.classList.add('fa-chevron-down');
            nodeChildren.style.display = 'block';
        }
    }
}

// 初始化表格
function initializeTable() {
    // 这里可以添加表格初始化逻辑
    console.log('初始化表格');
    
    // 模拟加载数据
    loadTableData();
}

// 加载表格数据
function loadTableData() {
    // 模拟异步加载数据
    setTimeout(() => {
        console.log('表格数据加载完成');
        // 这里可以添加实际的数据加载逻辑
    }, 1000);
}

// 过滤表格数据
function filterTable(searchTerm) {
    console.log('过滤表格数据:', searchTerm);
    // 这里可以添加表格过滤逻辑
}

// 更新主要内容区域
function updateMainContent(nodeText) {
    console.log('更新主要内容:', nodeText);
    // 根据选中的树节点更新右侧表格内容
    
    // 这里可以添加根据不同节点类型加载不同数据的逻辑
    switch(nodeText) {
        case 'CI类型管理':
            loadCITypeData();
            break;
        case '应用系统':
            loadApplicationData();
            break;
        case '网络设备':
            loadNetworkDeviceData();
            break;
        case '物理设备':
            loadPhysicalDeviceData();
            break;
        default:
            loadDefaultData();
    }
}

// 加载CI类型数据
function loadCITypeData() {
    console.log('加载CI类型数据');
    // 这里可以添加加载CI类型数据的逻辑
}

// 加载应用系统数据
function loadApplicationData() {
    console.log('加载应用系统数据');
    // 这里可以添加加载应用系统数据的逻辑
}

// 加载网络设备数据
function loadNetworkDeviceData() {
    console.log('加载网络设备数据');
    // 这里可以添加加载网络设备数据的逻辑
}

// 加载物理设备数据
function loadPhysicalDeviceData() {
    console.log('加载物理设备数据');
    // 这里可以添加加载物理设备数据的逻辑
}

// 加载默认数据
function loadDefaultData() {
    console.log('加载默认数据');
    // 这里可以添加加载默认数据的逻辑
}

// 导出模板
function exportTemplate() {
    console.log('导出模板');
    // 这里可以添加导出模板的逻辑
    alert('导出模板功能');
}

// 导入数据
function importData() {
    console.log('导入数据');
    // 这里可以添加导入数据的逻辑
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('选择文件:', file.name);
            // 这里可以添加文件处理逻辑
        }
    };
    input.click();
}

// 新增CI类型
function addCIType() {
    console.log('新增CI类型');
    // 这里可以添加新增CI类型的逻辑
    alert('新增CI类型功能');
}

// 批量操作
function batchOperation() {
    console.log('批量操作');
    // 这里可以添加批量操作的逻辑
    alert('批量操作功能');
}

// 页面加载完成后的初始化
function initializePage() {
    console.log('CMDB页面初始化完成');
    
    // 默认展开第一个节点
    const firstToggle = document.querySelector('.node-toggle');
    if (firstToggle && firstToggle.classList.contains('fa-chevron-down')) {
        // 节点已经是展开状态，不需要额外操作
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
        if (targetPage === 'CMDB.html') {
            console.log('当前已在CMDB页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
