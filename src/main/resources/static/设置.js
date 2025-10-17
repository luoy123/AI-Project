// 设置页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化设置分类树
    initializeSettingsTree();
    
    // 初始化导航标签
    initializeNavTabs();
    
    // 初始化用户数据
    initializeUserData();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索用户:', searchTerm);
        });
    }

    // 用户搜索功能
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索用户信息:', searchTerm);
            filterUsers(searchTerm);
        });
    }

    // 搜索按钮
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = userSearchInput.value.toLowerCase();
            console.log('点击搜索按钮:', searchTerm);
            filterUsers(searchTerm);
        });
    }

    // 刷新按钮
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('刷新用户数据');
            refreshUserData();
        });
    }

    // 编辑按钮
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const userName = row.querySelector('.user-name').textContent;
            console.log('编辑用户:', userName);
            editUser(userName);
        });
    });

    // 删除按钮
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const userName = row.querySelector('.user-name').textContent;
            console.log('删除用户:', userName);
            deleteUser(userName);
        });
    });

    // 用户表单提交
    const userForm = document.querySelector('.user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('提交用户表单');
            submitUserForm();
        });
    }

    // 取消按钮
    const cancelBtn = document.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('取消操作');
            switchTab('users');
        });
    }

    // 文件上传
    const uploadBtn = document.querySelector('.upload-btn');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('选择文件:', file.name);
                handleFileUpload(file);
            }
        });
    }

    // 拖拽上传
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#007bff';
            this.style.backgroundColor = '#f8f9fa';
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.backgroundColor = '';
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('拖拽文件:', files[0].name);
                handleFileUpload(files[0]);
            }
        });
    }

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

// 初始化设置分类树
function initializeSettingsTree() {
    // 设置分类节点选择事件
    const nodeItems = document.querySelectorAll('.node-item');
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他节点的选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前节点的选中状态
            this.classList.add('selected');
            
            const nodeText = this.querySelector('.node-text').textContent;
            console.log('选中设置分类:', nodeText);
            
            // 根据选中的分类更新右侧内容
            updateSettingsContent(nodeText);
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
            switchTab(tabType);
        });
    });
}

// 初始化用户数据
function initializeUserData() {
    console.log('初始化用户数据');
    // 这里可以添加加载用户数据的逻辑
}

// 切换标签内容
function switchTab(tabType) {
    console.log('切换到标签:', tabType);
    
    // 隐藏所有标签内容
    const tabContents = ['usersTab', 'addTab', 'importTab'];
    tabContents.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // 显示对应的标签内容
    switch(tabType) {
        case 'users':
            showElement('usersTab');
            break;
        case 'add':
            showElement('addTab');
            break;
        case 'import':
            showElement('importTab');
            break;
        default:
            showElement('usersTab');
    }
}

// 显示元素
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

// 更新设置内容
function updateSettingsContent(categoryName) {
    console.log('更新设置内容:', categoryName);
    
    // 根据选中的分类更新右侧内容
    switch(categoryName) {
        case '用户':
            loadUserManagement();
            break;
        case '用户组配置':
            loadUserGroupConfig();
            break;
        case '用户组':
            loadUserGroups();
            break;
        case '角色':
            loadRoles();
            break;
        case '系统配置':
            loadSystemConfig();
            break;
        case '已删除的用户':
            loadDeletedUsers();
            break;
        case '档案管理':
            loadFileManagement();
            break;
        case '日志管理':
            loadLogManagement();
            break;
        case '应用配置':
            loadAppConfig();
            break;
        case '已删除的用户组':
            loadDeletedUserGroups();
            break;
        case '设置':
            loadSettings();
            break;
        default:
            loadUserManagement();
    }
}

// 加载用户管理
function loadUserManagement() {
    console.log('加载用户管理');
    // 确保显示用户标签
    switchTab('users');
}

// 加载用户组配置
function loadUserGroupConfig() {
    console.log('加载用户组配置');
}

// 加载用户组
function loadUserGroups() {
    console.log('加载用户组');
}

// 加载角色
function loadRoles() {
    console.log('加载角色');
}

// 加载系统配置
function loadSystemConfig() {
    console.log('加载系统配置');
}

// 加载已删除的用户
function loadDeletedUsers() {
    console.log('加载已删除的用户');
}

// 加载档案管理
function loadFileManagement() {
    console.log('加载档案管理');
}

// 加载日志管理
function loadLogManagement() {
    console.log('加载日志管理');
}

// 加载应用配置
function loadAppConfig() {
    console.log('加载应用配置');
}

// 加载已删除的用户组
function loadDeletedUserGroups() {
    console.log('加载已删除的用户组');
}

// 加载设置
function loadSettings() {
    console.log('加载设置');
}

// 筛选用户
function filterUsers(searchTerm) {
    console.log('筛选用户:', searchTerm);
    // 这里可以添加筛选用户的逻辑
}

// 刷新用户数据
function refreshUserData() {
    console.log('刷新用户数据');
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('用户数据刷新完成');
        
        // 重新加载数据
        initializeUserData();
    }, 1000);
}

// 编辑用户
function editUser(userName) {
    console.log('编辑用户:', userName);
    // 切换到新增标签并填充数据
    switchTab('add');
    // 这里可以添加填充用户数据的逻辑
}

// 删除用户
function deleteUser(userName) {
    console.log('删除用户:', userName);
    if (confirm('确定要删除用户 "' + userName + '" 吗？')) {
        console.log('确认删除用户:', userName);
        // 这里可以添加删除用户的逻辑
    }
}

// 提交用户表单
function submitUserForm() {
    const formData = new FormData(document.querySelector('.user-form'));
    const userData = {};
    
    for (let [key, value] of formData.entries()) {
        userData[key] = value;
    }
    
    console.log('用户数据:', userData);
    
    // 验证密码
    if (userData.password !== userData.confirmPassword) {
        alert('密码和确认密码不匹配');
        return;
    }
    
    // 这里可以添加提交用户数据的逻辑
    alert('用户保存成功');
    switchTab('users');
}

// 处理文件上传
function handleFileUpload(file) {
    console.log('处理文件上传:', file.name);
    
    // 验证文件类型
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        alert('不支持的文件格式，请上传 CSV 或 Excel 文件');
        return;
    }
    
    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过 10MB');
        return;
    }
    
    // 这里可以添加文件上传的逻辑
    console.log('文件验证通过，开始上传');
    alert('文件上传功能');
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
    console.log('设置页面初始化完成');
    
    // 默认选中用户
    const defaultNode = document.querySelector('.node-item.selected');
    if (defaultNode) {
        const nodeText = defaultNode.querySelector('.node-text').textContent;
        updateSettingsContent(nodeText);
    }
    
    // 默认选中用户标签
    switchTab('users');
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
        if (targetPage === '设置.html') {
            console.log('当前已在设置页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
