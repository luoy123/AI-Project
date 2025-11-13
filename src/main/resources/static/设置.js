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
    // 设置分类节点选择事件，只选择设置页面内部的导航元素
    const nodeItems = document.querySelectorAll('.settings-main .node-item, .main-content .node-item');
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
        tab.addEventListener('click', function(e) {
            const tabType = this.getAttribute('data-tab');
            console.log('点击标签:', tabType);
            
            // 如果点击的是"新增"标签，需要验证密码
            if (tabType === 'add') {
                e.preventDefault();
                showPasswordModal();
                return;
            }
            
            // 其他标签正常切换
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            switchTab(tabType);
        });
    });
    
    // 初始化头像上传功能
    initializeAvatarUpload('add');
    initializeAvatarUpload('edit');
    
    // 初始化表单提交
    initializeFormSubmit();
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
    const tabContents = ['usersTab', 'addTab', 'editTab', 'importTab'];
    tabContents.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // 隐藏/显示编辑标签
    const editTabBtn = document.querySelector('[data-tab="edit"]');
    if (editTabBtn) {
        if (tabType === 'edit') {
            editTabBtn.style.display = 'inline-block';
        } else {
            editTabBtn.style.display = 'none';
        }
    }
    
    // 更新标签激活状态
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 显示对应的标签内容
    switch(tabType) {
        case 'users':
            showElement('usersTab');
            break;
        case 'add':
            showElement('addTab');
            clearForm('add');
            break;
        case 'edit':
            showElement('editTab');
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
        case '检测模板设置':
            loadDetectionTemplateSettings();
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

// 加载检测模板设置
function loadDetectionTemplateSettings() {
    console.log('加载检测模板设置');
    
    // 隐藏所有其他内容区域
    const allTabs = document.querySelectorAll('.settings-content > div');
    allTabs.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // 显示检测模板设置区域
    const templateTab = document.getElementById('detectionTemplateTab');
    if (templateTab) {
        templateTab.style.display = 'block';
        
        // 初始化检测模板功能
        initializeDetectionTemplates();
    }
    
    // 隐藏工具栏（因为检测模板有自己的头部）
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
        toolbar.style.display = 'none';
    }
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

// 初始化设置页面头像
function initializeSettingsAvatar() {
    console.log('初始化设置页面头像');
    
    // 修复头像URL格式
    fixAvatarUrl();
    
    // 加载头像
    loadSettingsAvatar();
    
    // 监听头像更新事件
    listenAvatarUpdate();
}

// 修复头像URL格式
function fixAvatarUrl() {
    const userAvatar = localStorage.getItem('userAvatar');
    if (userAvatar && userAvatar.startsWith('/upload/')) {
        const fixedUrl = userAvatar.replace('/upload/', '/api/upload/');
        localStorage.setItem('userAvatar', fixedUrl);
        console.log('修复设置页面头像URL:', userAvatar, '->', fixedUrl);
        
        // 同时修复userInfo中的头像
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (userInfo.avatar && userInfo.avatar.startsWith('/upload/')) {
                userInfo.avatar = userInfo.avatar.replace('/upload/', '/api/upload/');
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
        } catch (e) {
            console.error('修复userInfo头像失败:', e);
        }
    }
}

// 加载设置页面头像
function loadSettingsAvatar() {
    const avatarElement = document.getElementById('settingsUserAvatar');
    if (avatarElement) {
        const avatar = localStorage.getItem('userAvatar');
        if (avatar && avatar !== 'null' && avatar !== '') {
            avatarElement.src = avatar;
            console.log('设置页面头像加载:', avatar);
        } else {
            avatarElement.src = '1.png';
            console.log('设置页面使用默认头像');
        }
    }
}

// 监听头像更新事件
function listenAvatarUpdate() {
    // 监听自定义事件（同页面内更新）
    window.addEventListener('avatarUpdated', function(e) {
        console.log('设置页面收到头像更新事件:', e.detail);
        const avatarElement = document.getElementById('settingsUserAvatar');
        if (avatarElement && e.detail && e.detail.avatar) {
            avatarElement.src = e.detail.avatar;
            console.log('设置页面头像已更新为:', e.detail.avatar);
        }
    });

    // 监听localStorage变化（跨页面更新）
    window.addEventListener('storage', function(e) {
        if (e.key === 'userAvatar') {
            console.log('设置页面localStorage头像变化:', e.newValue);
            const avatarElement = document.getElementById('settingsUserAvatar');
            if (avatarElement) {
                const newAvatar = e.newValue;
                if (newAvatar && newAvatar !== 'null' && newAvatar !== '') {
                    avatarElement.src = newAvatar;
                } else {
                    avatarElement.src = '1.png';
                }
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('设置页面初始化');
    
    // 初始化导航标签
    initializeNavTabs();
    
    // 初始化用户数据
    initializeUserData();
    
    // 初始化侧边栏导航
    initializeSidebarNavigation();
    
    // 延迟初始化头像显示，确保DOM完全加载
    setTimeout(() => {
        initializeSettingsAvatar();
    }, 100);
    
    // 模拟数据加载
    setTimeout(() => {
        console.log('用户数据刷新完成');
        
        // 重新加载数据
        initializeUserData();
        
        // 再次尝试加载头像
        loadSettingsAvatar();
    }, 1000);
});

// 编辑用户
function editUser(userName) {
    console.log('编辑用户:', userName);
    
    // 先从localStorage获取当前登录用户信息
    const currentUsername = localStorage.getItem('username');
    const storedUserInfo = localStorage.getItem('userInfo');
    
    let userData;
    
    // 如果编辑的是当前登录用户，使用localStorage中的数据
    if (userName === currentUsername && storedUserInfo) {
        try {
            userData = JSON.parse(storedUserInfo);
            console.log('使用localStorage中的用户数据:', userData);
        } catch (e) {
            console.error('解析用户信息失败:', e);
        }
    }
    
    // 如果没有从localStorage获取到数据，使用默认数据
    if (!userData) {
        console.log('使用默认用户数据');
        userData = {
            id: 1,
            username: userName || currentUsername || 'admin',
            realName: '用户',
            email: '',
            phone: '',
            role: 'user',
            status: 1,
            avatar: localStorage.getItem('userAvatar') || '1.png'
        };
    }
    
    // 填充表单数据
    fillEditForm(userData);
    
    // 切换到编辑标签
    switchTab('edit');
}

// 填充编辑表单
function fillEditForm(userData) {
    document.getElementById('edit-userId').value = userData.id || '';
    
    // 确保用户名是纯用户名，去除可能的 "用户名/真实姓名" 格式
    let username = userData.username || '';
    if (username.includes('/')) {
        username = username.split('/')[0];
    }
    document.getElementById('edit-username').value = username;
    
    document.getElementById('edit-realName').value = userData.realName || '';
    document.getElementById('edit-email').value = userData.email || '';
    document.getElementById('edit-phone').value = userData.phone || '';
    document.getElementById('edit-avatarUrl').value = userData.avatar || '';
    
    console.log('填充编辑表单 - 用户名:', username);
    
    // 设置头像预览
    const avatarImage = document.getElementById('edit-avatarImage');
    if (userData.avatar) {
        avatarImage.src = userData.avatar;
    } else {
        avatarImage.src = 'https://via.placeholder.com/100';
    }
    
    // 清空密码字段
    document.getElementById('edit-password').value = '';
    document.getElementById('edit-confirmPassword').value = '';
}

// 清空表单
function clearForm(formType) {
    const form = document.getElementById(formType + 'UserForm');
    if (form) {
        form.reset();
        // 重置头像预览
        const avatarImage = document.getElementById(formType + '-avatarImage');
        if (avatarImage) {
            avatarImage.src = 'https://via.placeholder.com/100';
        }
        document.getElementById(formType + '-avatarUrl').value = '';
    }
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

// 初始化头像上传功能
function initializeAvatarUpload(formType) {
    const avatarPreview = document.getElementById(formType + '-avatarPreview');
    const avatarInput = document.getElementById(formType + '-avatarInput');
    const avatarImage = document.getElementById(formType + '-avatarImage');
    const avatarUrl = document.getElementById(formType + '-avatarUrl');
    
    if (!avatarPreview || !avatarInput) return;
    
    // 点击头像预览触发文件选择
    avatarPreview.addEventListener('click', function() {
        avatarInput.click();
    });
    
    // 文件选择变化
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件！');
                return;
            }
            
            // 验证文件大小（2MB）
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过 2MB！');
                return;
            }
            
            // 预览图片
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            // 上传图片到服务器
            uploadAvatar(file, formType);
        }
    });
}

// 上传头像到服务器
function uploadAvatar(file, formType) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 显示上传中状态
    console.log('正在上传头像...');
    
    // TODO: 调用后端上传接口
    fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            console.log('头像上传成功:', data.data);
            // 保存头像 URL
            document.getElementById(formType + '-avatarUrl').value = data.data;
            
            // 更新localStorage中的头像（如果是编辑当前用户）
            const currentUsername = localStorage.getItem('username');
            let editingUsername = document.getElementById(formType + '-username')?.value || '';
            
            // 去除可能的 "用户名/真实姓名" 格式
            if (editingUsername.includes('/')) {
                editingUsername = editingUsername.split('/')[0];
            }
            
            console.log('=== 上传头像后检查 ===');
            console.log('formType:', formType);
            console.log('当前登录用户:', currentUsername);
            console.log('正在编辑的用户:', editingUsername);
            console.log('上传的头像URL:', data.data);
            
            // 如果是编辑当前用户，立即更新localStorage和界面
            if (currentUsername === editingUsername) {
                console.log('✓ 是当前用户，立即更新头像');
                localStorage.setItem('userAvatar', data.data);
                
                // 触发自定义事件，通知其他组件更新头像
                window.dispatchEvent(new CustomEvent('avatarUpdated', {
                    detail: { avatar: data.data }
                }));
                
                console.log('✓ localStorage已更新');
                console.log('✓ 头像更新事件已触发');
            } else {
                console.log('× 不是当前用户或formType不匹配，不更新localStorage');
            }
        } else {
            alert('头像上传失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('上传错误:', error);
        alert('头像上传失败，请稍后重试！');
    });
}

// 初始化表单提交
function initializeFormSubmit() {
    // 编辑用户表单提交
    const editForm = document.getElementById('editUserForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditFormSubmit();
        });
    }
    
    // 新增用户表单提交
    const addForm = document.getElementById('addUserForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddFormSubmit();
        });
    }
}

// 处理编辑表单提交
function handleEditFormSubmit() {
    const userId = document.getElementById('edit-userId').value;
    let username = document.getElementById('edit-username').value;
    
    // 确保用户名是纯用户名，去除可能的 "用户名/真实姓名" 格式
    if (username.includes('/')) {
        username = username.split('/')[0];
    }
    
    const realName = document.getElementById('edit-realName').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const password = document.getElementById('edit-password').value;
    const confirmPassword = document.getElementById('edit-confirmPassword').value;
    const avatar = document.getElementById('edit-avatarUrl').value;
    
    // 验证必填字段
    if (!realName) {
        alert('请输入真实姓名');
        return;
    }
    
    // 如果填写了密码，验证密码
    if (password) {
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        if (password.length < 6) {
            alert('密码长度不能少于6位');
            return;
        }
    }
    
    // 构建提交数据
    const formData = {
        id: userId,
        username: username,
        realName: realName,
        email: email || null,
        phone: phone || null,
        avatar: avatar || null
    };
    
    // 如果填写了密码，添加到数据中
    if (password) {
        formData.password = password;
    }
    
    console.log('提交编辑数据:', formData);
    
    // 调用后端接口更新用户
    fetch('/api/user/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            console.log('用户更新成功');
            
            // 如果是当前用户，更新localStorage
            const currentUsername = localStorage.getItem('username');
            console.log('当前登录用户:', currentUsername);
            console.log('编辑的用户:', username);
            console.log('头像URL:', avatar);
            
            if (currentUsername === username) {
                // 更新用户信息
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.realName = realName;
                userInfo.email = email;
                userInfo.phone = phone;
                userInfo.avatar = avatar;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                // 更新头像
                if (avatar) {
                    console.log('正在更新localStorage中的头像:', avatar);
                    localStorage.setItem('userAvatar', avatar);
                    
                    // 触发头像更新事件
                    window.dispatchEvent(new CustomEvent('avatarUpdated', {
                        detail: { avatar: avatar }
                    }));
                    
                    console.log('头像更新事件已触发');
                } else {
                    console.log('警告：头像URL为空');
                }
                
                console.log('已更新当前用户的localStorage信息');
            } else {
                console.log('不是当前用户，不更新localStorage');
            }
            
            alert('保存成功！');
            
            // 返回用户列表
            switchTab('users');
        } else {
            alert('保存失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('更新用户失败:', error);
        alert('保存失败，请稍后重试！');
    });
}

// 处理新增表单提交
function handleAddFormSubmit() {
    const username = document.getElementById('add-username').value;
    const realName = document.getElementById('add-realName').value;
    const email = document.getElementById('add-email').value;
    const phone = document.getElementById('add-phone').value;
    const password = document.getElementById('add-password').value;
    const confirmPassword = document.getElementById('add-confirmPassword').value;
    const role = document.getElementById('add-role').value;
    const status = document.getElementById('add-status').value;
    const avatar = document.getElementById('add-avatarUrl').value;
    
    // 验证必填字段
    if (!username) {
        alert('请输入用户名');
        return;
    }
    if (!realName) {
        alert('请输入真实姓名');
        return;
    }
    if (!password) {
        alert('请输入密码');
        return;
    }
    
    // 验证密码
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    if (password.length < 6) {
        alert('密码长度不能少于6位');
        return;
    }
    
    // 构建提交数据
    const formData = {
        username: username,
        realName: realName,
        email: email || null,
        phone: phone || null,
        password: password,
        role: role,
        status: parseInt(status),
        avatar: avatar || null
    };
    
    console.log('提交新增数据:', formData);
    
    // 调用后端接口新增用户
    fetch('/api/user/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            console.log('新增用户成功');
            alert('新增成功！');
            
            // 清空表单
            clearForm('add');
            
            // 返回用户列表
            switchTab('users');
        } else {
            alert('新增失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('新增用户失败:', error);
        alert('新增失败，请稍后重试！');
    });
}

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

// 显示密码验证弹窗
function showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('adminPassword');
    const errorMessage = document.getElementById('passwordError');
    
    // 清空输入和错误信息
    passwordInput.value = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // 显示弹窗
    modal.style.display = 'flex';
    
    // 自动聚焦到密码输入框
    setTimeout(() => {
        passwordInput.focus();
    }, 100);
    
    // 按下 Enter 键提交
    passwordInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    };
    
    // 按下 Esc 键关闭
    document.onkeydown = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closePasswordModal();
        }
    };
}

// 关闭密码验证弹窗
function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'none';
    document.onkeydown = null;
}

// 验证密码
function verifyPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const errorMessage = document.getElementById('passwordError');
    const password = passwordInput.value.trim();
    
    // 验证密码不能为空
    if (!password) {
        errorMessage.textContent = '请输入管理员密码';
        errorMessage.style.display = 'block';
        passwordInput.focus();
        return;
    }
    
    // 调用后端接口验证密码
    fetch('/api/user/verify-admin-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200 && data.data === true) {
            // 密码正确，关闭弹窗并切换到新增页面
            closePasswordModal();
            
            // 更新标签状态
            const navTabs = document.querySelectorAll('.nav-tab');
            navTabs.forEach(t => t.classList.remove('active'));
            const addTab = document.querySelector('[data-tab="add"]');
            if (addTab) {
                addTab.classList.add('active');
            }
            
            // 切换到新增页面
            switchTab('add');
        } else {
            // 密码错误
            errorMessage.textContent = '密码错误，请重新输入';
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    })
    .catch(error => {
        console.error('验证密码失败:', error);
        errorMessage.textContent = '验证失败，请稍后重试';
        errorMessage.style.display = 'block';
    });
}

// ==================== 检测模板管理功能 ====================

// 检测模板数据
let detectionTemplates = [];
let currentTemplatePage = 1;
const templatesPerPage = 20;

// 初始化检测模板功能
function initializeDetectionTemplates() {
    console.log('初始化检测模板功能');
    loadDetectionTemplates();
}

// 加载检测模板数据
function loadDetectionTemplates() {
    // 从后端API获取检测模板数据
    fetch('/api/detection-templates')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                detectionTemplates = result.data.map(template => ({
                    id: template.id,
                    templateName: template.templateName || template.template_name,
                    detectionType: template.detectionType || template.detection_type,
                    warningThreshold: template.warningThreshold || template.warning_threshold,
                    criticalThreshold: template.criticalThreshold || template.critical_threshold,
                    checkInterval: template.checkInterval || template.check_interval,
                    intervalUnit: template.intervalUnit || template.interval_unit || 'minutes',
                    description: template.description,
                    status: template.status,
                    updatedAt: template.updatedAt || template.updated_at
                }));
                renderTemplateTable();
                updateTemplateStats();
            } else {
                console.error('API返回错误:', result.message);
                loadFallbackTemplateData();
            }
        })
        .catch(error => {
            console.error('加载检测模板失败:', error);
            // 如果API调用失败，使用模拟数据作为后备
            loadFallbackTemplateData();
        });
}

// 加载后备模拟数据
function loadFallbackTemplateData() {
    detectionTemplates = [
        // CPU监控模板
        {
            id: 1,
            templateName: 'CPU高使用率检测',
            detectionType: 'cpu',
            warningThreshold: 70,
            criticalThreshold: 90,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控服务器CPU使用率，超过阈值时发出告警',
            status: 1,
            updatedAt: '2024-11-12 10:30:00'
        },
        {
            id: 2,
            templateName: 'CPU负载异常检测',
            detectionType: 'cpu',
            warningThreshold: 2,
            criticalThreshold: 4,
            checkInterval: 3,
            intervalUnit: 'minutes',
            description: '监控系统CPU负载，当负载超过2时警告，超过4时严重告警',
            status: 1,
            updatedAt: '2024-11-12 10:25:00'
        },
        {
            id: 3,
            templateName: 'CPU空闲率过低检测',
            detectionType: 'cpu',
            warningThreshold: 20,
            criticalThreshold: 10,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控CPU空闲率，当空闲率低于20%时警告，低于10%时严重告警',
            status: 1,
            updatedAt: '2024-11-12 10:20:00'
        },
        
        // 内存监控模板
        {
            id: 4,
            templateName: '内存泄漏检测',
            detectionType: 'memory',
            warningThreshold: 80,
            criticalThreshold: 95,
            checkInterval: 10,
            intervalUnit: 'minutes',
            description: '监控服务器内存使用率，检测内存泄漏',
            status: 1,
            updatedAt: '2024-11-12 09:15:00'
        },
        {
            id: 5,
            templateName: '可用内存不足检测',
            detectionType: 'memory',
            warningThreshold: 15,
            criticalThreshold: 5,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控可用内存百分比，当可用内存低于15%时警告',
            status: 1,
            updatedAt: '2024-11-12 09:10:00'
        },
        {
            id: 6,
            templateName: '交换内存使用检测',
            detectionType: 'memory',
            warningThreshold: 50,
            criticalThreshold: 80,
            checkInterval: 10,
            intervalUnit: 'minutes',
            description: '监控交换内存使用率，频繁使用交换内存可能影响性能',
            status: 1,
            updatedAt: '2024-11-12 09:05:00'
        },
        
        // 磁盘监控模板
        {
            id: 7,
            templateName: '磁盘空间不足检测',
            detectionType: 'disk',
            warningThreshold: 85,
            criticalThreshold: 95,
            checkInterval: 15,
            intervalUnit: 'minutes',
            description: '监控磁盘使用率，预防磁盘空间不足',
            status: 1,
            updatedAt: '2024-11-12 08:45:00'
        },
        {
            id: 8,
            templateName: '磁盘IO异常检测',
            detectionType: 'disk',
            warningThreshold: 80,
            criticalThreshold: 95,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控磁盘IO使用率，高IO可能导致系统响应缓慢',
            status: 1,
            updatedAt: '2024-11-12 08:40:00'
        },
        {
            id: 9,
            templateName: '磁盘读取速度异常',
            detectionType: 'disk',
            warningThreshold: 100,
            criticalThreshold: 200,
            checkInterval: 10,
            intervalUnit: 'minutes',
            description: '监控磁盘读取速度(MB/s)，异常高的读取可能表示系统问题',
            status: 1,
            updatedAt: '2024-11-12 08:35:00'
        },
        
        // 网络监控模板
        {
            id: 10,
            templateName: '网络异常流量检测',
            detectionType: 'network',
            warningThreshold: 75,
            criticalThreshold: 90,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控网络流量，检测异常网络活动',
            status: 1,
            updatedAt: '2024-11-12 11:20:00'
        },
        {
            id: 11,
            templateName: '网络入流量异常',
            detectionType: 'network',
            warningThreshold: 80,
            criticalThreshold: 95,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控网络入流量，检测可能的DDoS攻击或异常访问',
            status: 1,
            updatedAt: '2024-11-12 11:15:00'
        },
        {
            id: 12,
            templateName: '网络延迟检测',
            detectionType: 'network',
            warningThreshold: 100,
            criticalThreshold: 500,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控网络延迟(ms)，高延迟可能影响用户体验',
            status: 1,
            updatedAt: '2024-11-12 11:10:00'
        },
        
        // 温度监控模板
        {
            id: 13,
            templateName: '设备过热检测',
            detectionType: 'temperature',
            warningThreshold: 70,
            criticalThreshold: 85,
            checkInterval: 3,
            intervalUnit: 'minutes',
            description: '监控设备温度，预防设备过热损坏',
            status: 1,
            updatedAt: '2024-11-12 12:10:00'
        },
        {
            id: 14,
            templateName: 'CPU温度监控',
            detectionType: 'temperature',
            warningThreshold: 75,
            criticalThreshold: 90,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '专门监控CPU温度，防止CPU过热导致性能下降或损坏',
            status: 1,
            updatedAt: '2024-11-12 12:05:00'
        },
        {
            id: 15,
            templateName: 'GPU温度监控',
            detectionType: 'temperature',
            warningThreshold: 80,
            criticalThreshold: 95,
            checkInterval: 5,
            intervalUnit: 'minutes',
            description: '监控GPU温度，防止显卡过热影响图形处理性能',
            status: 1,
            updatedAt: '2024-11-12 12:00:00'
        }
    ];
    
    renderTemplateTable();
    updateTemplateStats();
}

// 渲染检测模板表格
function renderTemplateTable() {
    const tbody = document.getElementById('templateTableBody');
    if (!tbody) return;
    
    if (detectionTemplates.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>暂无检测模板</p>
                        <button class="btn-primary" onclick="showAddTemplateModal()">添加第一个模板</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentTemplatePage - 1) * templatesPerPage;
    const endIndex = startIndex + templatesPerPage;
    const pageTemplates = detectionTemplates.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageTemplates.map(template => `
        <tr>
            <td>
                <div class="template-name">
                    <strong>${template.templateName}</strong>
                </div>
            </td>
            <td>${getDetectionTypeText(template.detectionType)}</td>
            <td>
                <div class="threshold-info">
                    <span class="warning">警告: ${template.warningThreshold}%</span><br>
                    <span class="critical">严重: ${template.criticalThreshold}%</span>
                </div>
            </td>
            <td>${template.updatedAt}</td>
            <td>
                <span class="status-badge ${template.status === 1 ? 'active' : 'inactive'}">
                    ${template.status === 1 ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" title="编辑" onclick="editTemplate(${template.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" title="删除" onclick="deleteTemplate(${template.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateTemplatePagination();
}

// 获取检测类型文本
function getDetectionTypeText(type) {
    const typeMap = {
        'cpu': 'CPU监控',
        'memory': '内存监控',
        'disk': '磁盘监控',
        'network': '网络监控',
        'temperature': '温度监控'
    };
    return typeMap[type] || type;
}

// 更新模板统计信息
function updateTemplateStats() {
    const totalElement = document.getElementById('totalTemplates');
    if (totalElement) {
        totalElement.textContent = detectionTemplates.length;
    }
}

// 更新分页信息
function updateTemplatePagination() {
    const totalPages = Math.ceil(detectionTemplates.length / templatesPerPage);
    const paginationInfo = document.getElementById('templatePaginationInfo');
    const pagination = document.getElementById('templatePagination');
    
    if (detectionTemplates.length === 0) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    if (pagination) pagination.style.display = 'flex';
    
    if (paginationInfo) {
        const startIndex = (currentTemplatePage - 1) * templatesPerPage + 1;
        const endIndex = Math.min(currentTemplatePage * templatesPerPage, detectionTemplates.length);
        paginationInfo.textContent = `共计 ${detectionTemplates.length} 条记录，共 ${totalPages} 页，每页 ${templatesPerPage} 条，当前第 ${currentTemplatePage} 页`;
    }
    
    // 更新分页按钮状态
    const prevBtn = document.getElementById('templatePrevBtn');
    const nextBtn = document.getElementById('templateNextBtn');
    
    if (prevBtn) prevBtn.disabled = currentTemplatePage === 1;
    if (nextBtn) nextBtn.disabled = currentTemplatePage === totalPages;
    
    // 更新页码
    const pageNumbers = document.getElementById('templatePageNumbers');
    if (pageNumbers) {
        let pagesHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            pagesHtml += `<span class="page-number ${i === currentTemplatePage ? 'active' : ''}" onclick="goToTemplatePage(${i})">${i}</span>`;
        }
        pageNumbers.innerHTML = pagesHtml;
    }
}

// 切换模板页面
function changeTemplatePage(direction) {
    const totalPages = Math.ceil(detectionTemplates.length / templatesPerPage);
    const newPage = currentTemplatePage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentTemplatePage = newPage;
        renderTemplateTable();
    }
}

// 跳转到指定页面
function goToTemplatePage(page) {
    const totalPages = Math.ceil(detectionTemplates.length / templatesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentTemplatePage = page;
        renderTemplateTable();
    }
}

// 搜索模板
function searchTemplates() {
    const searchInput = document.getElementById('templateSearchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadDetectionTemplates();
        return;
    }
    
    // 过滤模板数据
    const filteredTemplates = detectionTemplates.filter(template => 
        template.templateName.toLowerCase().includes(searchTerm) ||
        getDetectionTypeText(template.detectionType).toLowerCase().includes(searchTerm)
    );
    
    // 临时替换数据进行显示
    const originalTemplates = [...detectionTemplates];
    detectionTemplates = filteredTemplates;
    currentTemplatePage = 1;
    renderTemplateTable();
    updateTemplateStats();
    
    // 恢复原始数据
    detectionTemplates = originalTemplates;
}

// 显示添加模板弹窗
function showAddTemplateModal() {
    const modal = document.getElementById('templateModal');
    const title = document.getElementById('templateModalTitle');
    const form = document.getElementById('templateForm');
    
    if (title) title.textContent = '添加检测模板';
    if (form) form.reset();
    
    // 清空隐藏的ID字段
    const templateId = document.getElementById('templateId');
    if (templateId) templateId.value = '';
    
    if (modal) {
        modal.style.display = 'flex';
        
        // 聚焦到第一个输入框
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// 编辑模板
function editTemplate(id) {
    const template = detectionTemplates.find(t => t.id === id);
    if (!template) return;
    
    const modal = document.getElementById('templateModal');
    const title = document.getElementById('templateModalTitle');
    
    if (title) title.textContent = '编辑检测模板';
    
    // 填充表单数据
    document.getElementById('templateId').value = template.id;
    document.getElementById('templateName').value = template.templateName;
    document.getElementById('detectionType').value = template.detectionType;
    document.getElementById('warningThreshold').value = template.warningThreshold;
    document.getElementById('criticalThreshold').value = template.criticalThreshold;
    document.getElementById('checkInterval').value = template.checkInterval;
    document.getElementById('intervalUnit').value = template.intervalUnit;
    document.getElementById('templateDescription').value = template.description || '';
    document.getElementById('templateStatus').value = template.status;
    
    if (modal) modal.style.display = 'flex';
}

// 删除模板
function deleteTemplate(id) {
    const template = detectionTemplates.find(t => t.id === id);
    if (!template) return;
    
    if (confirm(`确定要删除检测模板"${template.templateName}"吗？`)) {
        // 这里应该调用后端API删除
        detectionTemplates = detectionTemplates.filter(t => t.id !== id);
        renderTemplateTable();
        updateTemplateStats();
        
        console.log('删除模板:', id);
        // TODO: 调用后端API
    }
}

// 关闭模板弹窗
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) modal.style.display = 'none';
}

// 保存模板
function saveTemplate() {
    const form = document.getElementById('templateForm');
    const formData = new FormData(form);
    
    // 验证表单
    if (!validateTemplateForm()) {
        return;
    }
    
    const templateData = {
        id: formData.get('id') || null,
        templateName: formData.get('templateName'),
        detectionType: formData.get('detectionType'),
        warningThreshold: parseInt(formData.get('warningThreshold')),
        criticalThreshold: parseInt(formData.get('criticalThreshold')),
        checkInterval: parseInt(formData.get('checkInterval')),
        intervalUnit: formData.get('intervalUnit'),
        description: formData.get('description'),
        status: parseInt(formData.get('status'))
    };
    
    if (templateData.id) {
        // 编辑模式
        const index = detectionTemplates.findIndex(t => t.id == templateData.id);
        if (index !== -1) {
            detectionTemplates[index] = {
                ...detectionTemplates[index],
                ...templateData,
                updatedAt: new Date().toLocaleString('zh-CN')
            };
        }
    } else {
        // 新增模式
        templateData.id = Date.now(); // 临时ID
        templateData.updatedAt = new Date().toLocaleString('zh-CN');
        detectionTemplates.push(templateData);
    }
    
    renderTemplateTable();
    updateTemplateStats();
    closeTemplateModal();
    
    console.log('保存模板:', templateData);
    // TODO: 调用后端API保存
}

// 验证模板表单
function validateTemplateForm() {
    const templateName = document.getElementById('templateName').value.trim();
    const detectionType = document.getElementById('detectionType').value;
    const warningThreshold = parseInt(document.getElementById('warningThreshold').value);
    const criticalThreshold = parseInt(document.getElementById('criticalThreshold').value);
    const checkInterval = parseInt(document.getElementById('checkInterval').value);
    
    if (!templateName) {
        alert('请输入模板名称');
        document.getElementById('templateName').focus();
        return false;
    }
    
    if (!detectionType) {
        alert('请选择检测类型');
        document.getElementById('detectionType').focus();
        return false;
    }
    
    if (isNaN(warningThreshold) || warningThreshold < 0 || warningThreshold > 100) {
        alert('警告阈值必须是0-100之间的数字');
        document.getElementById('warningThreshold').focus();
        return false;
    }
    
    if (isNaN(criticalThreshold) || criticalThreshold < 0 || criticalThreshold > 100) {
        alert('严重阈值必须是0-100之间的数字');
        document.getElementById('criticalThreshold').focus();
        return false;
    }
    
    if (warningThreshold >= criticalThreshold) {
        alert('严重阈值必须大于警告阈值');
        document.getElementById('criticalThreshold').focus();
        return false;
    }
    
    if (isNaN(checkInterval) || checkInterval < 1) {
        alert('检测间隔必须是大于0的数字');
        document.getElementById('checkInterval').focus();
        return false;
    }
    
    return true;
}
