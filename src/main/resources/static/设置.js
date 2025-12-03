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

// 密码可见性切换
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

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
        // 回车搜索
        userSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                userSearchKeyword = e.target.value.trim();
                userCurrentPage = 1;
                loadUserList();
            }
        });
    }

    // 搜索按钮
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const userSearchInput = document.getElementById('userSearchInput');
            userSearchKeyword = userSearchInput ? userSearchInput.value.trim() : '';
            userCurrentPage = 1;
            loadUserList();
        });
    }

    // 刷新按钮
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('刷新用户数据');
            userSearchKeyword = '';
            const userSearchInput = document.getElementById('userSearchInput');
            if (userSearchInput) userSearchInput.value = '';
            userCurrentPage = 1;
            loadUserList();
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

    // 用户表单提交 - 已移除，使用独立的addUserForm和editUserForm事件处理
    // 注意：不要在这里添加.user-form的提交事件，因为会导致重复提交

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

// 用户管理全局变量
let userCurrentPage = 1;
let userPageSize = 20;
let userTotalPages = 1;
let userSearchKeyword = '';
let roleList = []; // 角色列表缓存

// 初始化用户数据
function initializeUserData() {
    console.log('初始化用户数据');
    loadRoleList(); // 先加载角色列表
    loadUserList();
}

// 加载角色列表
function loadRoleList() {
    fetch('/api/role/list')
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                roleList = result.data || [];
                updateRoleSelects();
            }
        })
        .catch(error => {
            console.error('加载角色列表失败:', error);
        });
}

// 更新角色下拉框
function updateRoleSelects(selectedRole) {
    const addRoleSelect = document.getElementById('add-role');
    const editRoleSelect = document.getElementById('edit-role');
    
    if (roleList.length === 0) {
        console.log('角色列表为空，尝试重新加载');
        // 如果角色列表为空，先加载角色列表
        fetch('/api/role/list')
            .then(response => response.json())
            .then(result => {
                if (result.code === 200) {
                    roleList = result.data || [];
                    doUpdateRoleSelects(selectedRole);
                }
            })
            .catch(error => {
                console.error('加载角色列表失败:', error);
            });
        return;
    }
    
    doUpdateRoleSelects(selectedRole);
}

// 实际更新角色下拉框
function doUpdateRoleSelects(selectedRole) {
    const addRoleSelect = document.getElementById('add-role');
    const editRoleSelect = document.getElementById('edit-role');
    
    const optionsHtml = roleList
        .filter(role => role.status === 1) // 只显示启用的角色
        .map(role => `<option value="${role.roleCode}">${role.roleName}</option>`)
        .join('');
    
    console.log('更新角色下拉框，共', roleList.length, '个角色');
    
    if (addRoleSelect) {
        addRoleSelect.innerHTML = optionsHtml;
        // 默认选择普通用户
        addRoleSelect.value = 'user';
    }
    if (editRoleSelect) {
        editRoleSelect.innerHTML = optionsHtml;
        // 如果有指定角色，设置选中
        if (selectedRole) {
            editRoleSelect.value = selectedRole;
        }
    }
}

// 加载用户列表
function loadUserList() {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    // 显示加载中
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin"></i> 加载中...
            </td>
        </tr>
    `;
    
    // 构建请求URL
    let url = `/api/sys-user/list?page=${userCurrentPage}&pageSize=${userPageSize}`;
    if (userSearchKeyword) {
        url += `&keyword=${encodeURIComponent(userSearchKeyword)}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                renderUserTable(result.data.list);
                updateUserPagination(result.data);
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #ff4d4f;">
                            <i class="fas fa-exclamation-circle"></i> ${result.message || '加载失败'}
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('加载用户列表失败:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #ff4d4f;">
                        <i class="fas fa-exclamation-circle"></i> 网络错误，请稍后重试
                    </td>
                </tr>
            `;
        });
}

// 渲染用户表格
function renderUserTable(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-inbox"></i> 暂无用户数据
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
            <td>
                <div class="user-info">
                    <div class="user-name">${user.username}/${user.realName || '-'}</div>
                </div>
            </td>
            <td>${user.email || '-'}</td>
            <td>${formatDateTime(user.lastLoginTime) || '-'}</td>
            <td>${formatDateTime(user.updateTime) || '-'}</td>
            <td>
                <span class="status-badge ${user.status === 1 ? 'active' : 'inactive'}">
                    ${user.status === 1 ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" title="编辑" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" title="删除" onclick="deleteUser(${user.id}, '${user.username}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 更新用户分页
function updateUserPagination(data) {
    const paginationInfo = document.getElementById('userPaginationInfo');
    const pageNumbers = document.getElementById('userPageNumbers');
    const prevBtn = document.getElementById('userPrevBtn');
    const nextBtn = document.getElementById('userNextBtn');
    
    if (paginationInfo) {
        paginationInfo.textContent = `共计 ${data.total} 条记录，共 ${data.totalPages} 页，每页 ${data.pageSize} 条，当前第 ${data.page} 页`;
    }
    
    userCurrentPage = data.page;
    userTotalPages = data.totalPages;
    
    // 更新分页按钮状态
    if (prevBtn) {
        prevBtn.disabled = userCurrentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = userCurrentPage >= userTotalPages;
    }
    
    // 更新页码显示
    if (pageNumbers) {
        let html = '';
        const maxPages = 5;
        let startPage = Math.max(1, userCurrentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(userTotalPages, startPage + maxPages - 1);
        
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<span class="page-number ${i === userCurrentPage ? 'active' : ''}" onclick="goToUserPage(${i})">${i}</span>`;
        }
        pageNumbers.innerHTML = html;
    }
}

// 切换用户页面
function changeUserPage(delta) {
    const newPage = userCurrentPage + delta;
    if (newPage >= 1 && newPage <= userTotalPages) {
        userCurrentPage = newPage;
        loadUserList();
    }
}

// 跳转到指定页
function goToUserPage(page) {
    if (page >= 1 && page <= userTotalPages) {
        userCurrentPage = page;
        loadUserList();
    }
}

// 格式化日期时间
function formatDateTime(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 编辑用户
function editUser(userId) {
    console.log('编辑用户:', userId);
    
    // 获取用户详情
    fetch(`/api/sys-user/${userId}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                const user = result.data;
                
                // 切换到编辑标签（先切换，确保表单元素可见）
                switchTab('edit');
                
                // 更新角色下拉框并选中用户的角色
                updateRoleSelects(user.role);
                
                // 填充编辑表单
                document.getElementById('edit-userId').value = user.id;
                document.getElementById('edit-username').value = user.username || '';
                document.getElementById('edit-realName').value = user.realName || '';
                document.getElementById('edit-email').value = user.email || '';
                document.getElementById('edit-phone').value = user.phone || '';
                document.getElementById('edit-role').value = user.role || 'user';
                document.getElementById('edit-status').value = user.status || 1;
                document.getElementById('edit-password').value = ''; // 密码不回显
                document.getElementById('edit-confirmPassword').value = ''; // 确认密码也清空
                
                // 设置头像预览 - 重要：每次编辑都要重新加载该用户的头像
                const avatarImage = document.getElementById('edit-avatarImage');
                const avatarUrlInput = document.getElementById('edit-avatarUrl');
                if (user.avatar && user.avatar.trim() !== '') {
                    // 用户有头像，显示用户头像
                    avatarImage.src = user.avatar;
                    avatarUrlInput.value = user.avatar;
                    console.log('加载用户头像:', user.avatar);
                } else {
                    // 用户没有头像，显示默认头像
                    avatarImage.src = 'https://via.placeholder.com/100';
                    avatarUrlInput.value = '';
                    console.log('用户无头像，使用默认头像');
                }
            } else {
                alert(result.message || '获取用户信息失败');
            }
        })
        .catch(error => {
            console.error('获取用户信息失败:', error);
            alert('网络错误，请稍后重试');
        });
}

// 删除用户
function deleteUser(userId, username) {
    if (username === 'admin') {
        alert('不能删除管理员账户');
        return;
    }
    
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
        return;
    }
    
    fetch(`/api/sys-user/delete/${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('删除成功');
                loadUserList();
            } else {
                alert(result.message || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除用户失败:', error);
            alert('网络错误，请稍后重试');
        });
}

// 保存新增用户
function saveAddUser() {
    const username = document.getElementById('add-username').value.trim();
    const realName = document.getElementById('add-realName').value.trim();
    const password = document.getElementById('add-password').value;
    const confirmPassword = document.getElementById('add-confirmPassword').value;
    const email = document.getElementById('add-email').value.trim();
    const phone = document.getElementById('add-phone').value.trim();
    const role = document.getElementById('add-role').value;
    const status = document.getElementById('add-status').value;
    
    // 验证
    if (!username) {
        alert('请输入用户名');
        return;
    }
    if (!password) {
        alert('请输入密码');
        return;
    }
    if (password.length < 6) {
        alert('密码长度不能少于6位');
        document.getElementById('add-password').focus();
        return;
    }
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    const userData = {
        username,
        realName,
        password,
        email,
        phone,
        role,
        status: parseInt(status)
    };
    
    fetch('/api/sys-user/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('新增成功');
                // 清空表单
                document.getElementById('add-username').value = '';
                document.getElementById('add-realName').value = '';
                document.getElementById('add-password').value = '';
                document.getElementById('add-confirmPassword').value = '';
                document.getElementById('add-email').value = '';
                document.getElementById('add-phone').value = '';
                document.getElementById('add-role').value = 'user';
                document.getElementById('add-status').value = '1';
                // 切换到用户列表
                switchTab('users');
                loadUserList();
            } else {
                alert(result.message || '新增失败');
            }
        })
        .catch(error => {
            console.error('新增用户失败:', error);
            alert('网络错误，请稍后重试');
        });
}

// 保存编辑用户
function saveEditUser() {
    const userId = document.getElementById('edit-userId').value;
    const username = document.getElementById('edit-username').value.trim();
    const realName = document.getElementById('edit-realName').value.trim();
    const password = document.getElementById('edit-password').value;
    const email = document.getElementById('edit-email').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const role = document.getElementById('edit-role').value;
    const status = document.getElementById('edit-status').value;
    
    if (!username) {
        alert('请输入用户名');
        return;
    }
    
    const userData = {
        username,
        realName,
        email,
        phone,
        role,
        status: parseInt(status)
    };
    
    // 如果填写了密码，则更新密码
    if (password) {
        userData.password = password;
    }
    
    fetch(`/api/sys-user/update/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('更新成功');
                switchTab('users');
                loadUserList();
            } else {
                alert(result.message || '更新失败');
            }
        })
        .catch(error => {
            console.error('更新用户失败:', error);
            alert('网络错误，请稍后重试');
        });
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
    
    // 隐藏/显示搜索框 - 只在用户列表时显示
    const searchContainer = document.querySelector('.toolbar-right .search-container');
    if (searchContainer) {
        if (tabType === 'users') {
            searchContainer.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
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
            // 更新角色下拉框
            updateRoleSelects();
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
    
    // 显示工具栏
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
        toolbar.style.display = 'flex';
    }
    
    // 隐藏所有内容区域
    hideAllContentAreas();
    
    // 显示用户工具栏
    const userToolbar = document.getElementById('userToolbar');
    if (userToolbar) {
        userToolbar.style.display = 'flex';
    }
    
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
    console.log('加载角色管理');
    
    // 隐藏工具栏（角色管理不需要工具栏）
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
        toolbar.style.display = 'none';
    }
    
    // 隐藏所有内容区域
    hideAllContentAreas();
    
    // 显示角色管理区域
    const roleManagement = document.getElementById('roleManagementTab');
    if (roleManagement) {
        roleManagement.style.display = 'block';
    }
    
    // 加载角色列表
    loadRoleList();
}

// 隐藏所有内容区域
function hideAllContentAreas() {
    const areas = [
        '#userToolbar',  // 隐藏用户管理的工具栏（包含"用户"、"新增"、"导入"标签）
        '.user-management',
        '.add-user-form',
        '.edit-user-form',
        '.import-user-form',
        '.detection-template-management',
        '#roleManagementTab',
        '#systemConfigTab'  // 添加系统配置区域
    ];
    
    areas.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// 加载角色列表
function loadRoleList() {
    fetch('/api/role/list')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                renderRoleTable(data.data);
            } else {
                console.error('加载角色列表失败:', data.message);
            }
        })
        .catch(error => {
            console.error('加载角色列表出错:', error);
        });
}

// 渲染角色表格
function renderRoleTable(roles) {
    const tbody = document.getElementById('roleTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!roles || roles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <div style="color: #999;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px;"></i>
                        <p>暂无角色数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    roles.forEach((role, index) => {
        const tr = document.createElement('tr');
        // 获取权限数量（如果后端返回了permissionCount字段，使用它；否则默认为0）
        const permissionCount = role.permissionCount || role.permissions?.length || 0;
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${role.roleName}</td>
            <td>${role.roleCode}</td>
            <td>${role.description || '-'}</td>
            <td><span class="badge" style="background-color: #17a2b8; color: white; padding: 3px 8px; border-radius: 3px;">${permissionCount}</span></td>
            <td>
                <span class="status-badge ${role.status === 1 ? 'active' : 'inactive'}">
                    ${role.status === 1 ? '启用' : '禁用'}
                </span>
            </td>
            <td>${role.sortOrder}</td>
            <td>${formatDateTime(role.createTime)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRolePermissions(${role.id})" title="查看权限">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-edit" onclick="editRoleInline(${role.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteRole(${role.id}, '${role.roleName}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // 更新分页信息
    updateRolePagination(roles.length);
}

// 更新角色分页信息
function updateRolePagination(total) {
    const paginationInfo = document.getElementById('rolePaginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `共计 ${total} 条记录，共 1 页，每页 20 条，当前第 1 页`;
    }
}

// 查看角色权限
function viewRolePermissions(roleId) {
    console.log('查看角色权限, roleId:', roleId);
    
    // 获取角色信息
    fetch(`/api/role/list`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const role = data.data.find(r => r.id === roleId);
                if (role) {
                    // 显示权限模态框
                    document.getElementById('permissionRoleName').textContent = role.roleName;
                    document.getElementById('permissionModal').style.display = 'flex';
                    
                    // 加载权限树
                    loadPermissionTree(roleId);
                }
            }
        })
        .catch(error => {
            console.error('获取角色信息出错:', error);
            alert('获取角色信息失败');
        });
}

// 编辑角色（内联）
function editRoleInline(roleId) {
    console.log('编辑角色, roleId:', roleId);
    
    // 获取角色信息
    fetch(`/api/role/list`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const role = data.data.find(r => r.id === roleId);
                if (role) {
                    // 填充表单
                    document.getElementById('editRoleId').value = role.id;
                    document.getElementById('editRoleName').value = role.roleName;
                    document.getElementById('editRoleCode').value = role.roleCode;
                    document.getElementById('editRoleDesc').value = role.roleDesc || '';
                    document.getElementById('editRoleStatus').value = role.status;
                    document.getElementById('editRoleSort').value = role.sort || 0;
                    
                    // 显示模态框
                    document.getElementById('editRoleModal').style.display = 'flex';
                } else {
                    alert('未找到角色信息');
                }
            } else {
                alert('获取角色信息失败');
            }
        })
        .catch(error => {
            console.error('获取角色信息出错:', error);
            alert('获取角色信息失败');
        });
}

// 关闭编辑角色模态框
function closeEditRoleModal() {
    document.getElementById('editRoleModal').style.display = 'none';
}

// 保存编辑的角色
function saveEditRole() {
    const roleId = document.getElementById('editRoleId').value;
    const roleName = document.getElementById('editRoleName').value.trim();
    const roleCode = document.getElementById('editRoleCode').value.trim();
    const roleDesc = document.getElementById('editRoleDesc').value.trim();
    const status = document.getElementById('editRoleStatus').value;
    const sort = document.getElementById('editRoleSort').value;
    
    if (!roleName) {
        alert('请输入角色名称');
        return;
    }
    
    if (!roleCode) {
        alert('请输入角色代码');
        return;
    }
    
    const roleData = {
        id: roleId,
        roleName: roleName,
        roleCode: roleCode,
        roleDesc: roleDesc,
        status: parseInt(status),
        sort: parseInt(sort)
    };
    
    fetch(`/api/role/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('角色更新成功！');
            closeEditRoleModal();
            loadRoleList(); // 重新加载角色列表
        } else {
            alert('角色更新失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('更新角色出错:', error);
        alert('更新角色失败');
    });
}

// 暴露函数到全局作用域
window.closeEditRoleModal = closeEditRoleModal;
window.saveEditRole = saveEditRole;

// 删除角色
function deleteRole(roleId, roleName) {
    console.log('删除角色, roleId:', roleId, 'roleName:', roleName);
    if (!confirm(`确定要删除角色"${roleName}"吗？\n\n此操作不可恢复！`)) {
        return;
    }
    
    fetch(`/api/role/delete/${roleId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('删除成功');
            loadRoleList();
        } else {
            alert('删除失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('删除角色出错:', error);
        alert('删除失败');
    });
}

// 搜索角色
function searchRoles() {
    const keyword = document.getElementById('roleSearchInput').value.trim().toLowerCase();
    console.log('搜索角色:', keyword);
    
    if (!keyword) {
        loadRoleList();
        return;
    }
    
    // 重新加载并过滤
    fetch('/api/role/list')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const filtered = data.data.filter(role => 
                    role.roleName.toLowerCase().includes(keyword) ||
                    role.roleCode.toLowerCase().includes(keyword) ||
                    (role.description && role.description.toLowerCase().includes(keyword))
                );
                renderRoleTable(filtered);
            }
        })
        .catch(error => {
            console.error('搜索角色出错:', error);
        });
}

// 显示新增角色模态框
function showAddRoleModal() {
    console.log('显示新增角色模态框');
    
    // 清空表单
    document.getElementById('addRoleName').value = '';
    document.getElementById('addRoleCode').value = '';
    document.getElementById('addRoleDesc').value = '';
    document.getElementById('addRoleStatus').value = '1';
    document.getElementById('addRoleSort').value = '0';
    
    // 显示模态框
    document.getElementById('addRoleModal').style.display = 'flex';
}

// 关闭新增角色模态框
function closeAddRoleModal() {
    document.getElementById('addRoleModal').style.display = 'none';
}

// 保存新增的角色
function saveAddRole() {
    const roleName = document.getElementById('addRoleName').value.trim();
    const roleCode = document.getElementById('addRoleCode').value.trim();
    const roleDesc = document.getElementById('addRoleDesc').value.trim();
    const status = document.getElementById('addRoleStatus').value;
    const sort = document.getElementById('addRoleSort').value;
    
    if (!roleName) {
        alert('请输入角色名称');
        return;
    }
    
    if (!roleCode) {
        alert('请输入角色代码');
        return;
    }
    
    const roleData = {
        roleName: roleName,
        roleCode: roleCode,
        roleDesc: roleDesc,
        status: parseInt(status),
        sort: parseInt(sort)
    };
    
    fetch(`/api/role/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('角色添加成功！');
            closeAddRoleModal();
            loadRoleList(); // 重新加载角色列表
        } else {
            alert('角色添加失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('添加角色出错:', error);
        alert('添加角色失败');
    });
}

// 暴露函数到全局作用域
window.closeAddRoleModal = closeAddRoleModal;
window.saveAddRole = saveAddRole;

// 加载权限树
let currentRoleId = null;

function loadPermissionTree(roleId) {
    currentRoleId = roleId;
    const treeContainer = document.getElementById('permissionTree');
    treeContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载权限数据...</div>';
    
    // 从后端获取所有权限和角色已有的权限
    Promise.all([
        fetch('/api/permission/list').then(res => res.json()),
        fetch(`/api/role/${roleId}/permissions`).then(res => res.json())
    ])
    .then(([allPermissionsRes, rolePermissionsRes]) => {
        if (allPermissionsRes.code !== 200) {
            throw new Error('获取权限列表失败');
        }
        
        const allPermissions = allPermissionsRes.data || [];
        const rolePermissionIds = rolePermissionsRes.code === 200 
            ? (rolePermissionsRes.data || []).map(p => p.id) 
            : [];
        
        // 构建树形结构
        const permissionTree = buildPermissionTree(allPermissions, rolePermissionIds);
        
        // 渲染权限树
        renderPermissionTree(permissionTree, treeContainer);
        
        // 绑定父子复选框联动
        bindCheckboxEvents();
    })
    .catch(error => {
        console.error('加载权限树失败:', error);
        treeContainer.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">加载权限数据失败，请刷新重试</div>';
    });
}

// 构建权限树形结构（递归）
function buildPermissionTree(permissions, checkedIds) {
    // 找出所有一级权限（parent_id = 0 或 null）
    const rootPermissions = permissions.filter(p => !p.parentId || p.parentId === 0);
    
    // 递归构建子树
    function buildChildren(parentId) {
        const children = permissions.filter(p => p.parentId === parentId);
        return children.map(child => ({
            id: child.id,
            name: child.permissionName,
            code: child.permissionCode,
            type: child.type,
            checked: checkedIds.includes(child.id),
            parentId: parentId,
            children: buildChildren(child.id) // 递归获取子节点
        }));
    }
    
    // 为每个一级权限构建完整的树
    return rootPermissions.map(parent => ({
        id: parent.id,
        name: parent.permissionName,
        code: parent.permissionCode,
        type: parent.type,
        checked: checkedIds.includes(parent.id),
        children: buildChildren(parent.id)
    }));
}

// 渲染权限树（递归渲染多级权限）
function renderPermissionTree(permissions, container) {
    // 递归渲染节点
    function renderNode(node, level = 0) {
        const hasChildren = node.children && node.children.length > 0;
        const indent = level * 20;
        const icon = hasChildren ? 'fa-folder' : 'fa-file';
        const iconColor = hasChildren ? '#f59e0b' : '#3b82f6';
        const fontWeight = level === 0 ? 'bold' : 'normal';
        
        let html = `
            <label style="display: flex; align-items: center; padding: 6px; cursor: pointer; margin-left: ${indent}px; font-weight: ${fontWeight};">
                <input type="checkbox" class="permission-checkbox" data-id="${node.id}" data-parent="${node.parentId || 0}" ${node.checked ? 'checked' : ''} style="margin-right: 8px;">
                <i class="fas ${icon}" style="margin-right: 8px; color: ${iconColor};"></i>
                ${node.name}
            </label>
        `;
        
        // 递归渲染子节点
        if (hasChildren) {
            node.children.forEach(child => {
                html += renderNode(child, level + 1);
            });
        }
        
        return html;
    }
    
    let html = '<div class="permission-tree-list">';
    permissions.forEach(parent => {
        html += '<div class="permission-parent">';
        html += renderNode(parent, 0);
        html += '</div>';
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// 绑定复选框事件（支持多级联动）
function bindCheckboxEvents() {
    const allCheckboxes = document.querySelectorAll('.permission-checkbox');
    
    // 获取某个节点的所有子节点复选框
    function getDescendantCheckboxes(nodeId) {
        const descendants = [];
        allCheckboxes.forEach(cb => {
            if (cb.dataset.parent == nodeId) {
                descendants.push(cb);
                // 递归获取子节点的子节点
                const subDescendants = getDescendantCheckboxes(cb.dataset.id);
                descendants.push(...subDescendants);
            }
        });
        return descendants;
    }
    
    // 更新父节点的选中状态
    function updateParentCheckbox(parentId) {
        if (!parentId || parentId == '0') return;
        
        const parentCheckbox = document.querySelector(`.permission-checkbox[data-id="${parentId}"]`);
        if (!parentCheckbox) return;
        
        // 获取所有直接子节点
        const children = Array.from(allCheckboxes).filter(cb => cb.dataset.parent == parentId);
        if (children.length === 0) return;
        
        const checkedCount = children.filter(c => c.checked).length;
        
        if (checkedCount === 0) {
            parentCheckbox.checked = false;
            parentCheckbox.indeterminate = false;
        } else if (checkedCount === children.length) {
            parentCheckbox.checked = true;
            parentCheckbox.indeterminate = false;
        } else {
            parentCheckbox.checked = false;
            parentCheckbox.indeterminate = true;
        }
        
        // 递归更新上级父节点
        updateParentCheckbox(parentCheckbox.dataset.parent);
    }
    
    // 为所有复选框绑定事件
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const nodeId = this.dataset.id;
            const isChecked = this.checked;
            
            // 1. 更新所有子节点
            const descendants = getDescendantCheckboxes(nodeId);
            descendants.forEach(desc => {
                desc.checked = isChecked;
            });
            
            // 2. 更新父节点状态
            updateParentCheckbox(this.dataset.parent);
        });
    });
}

// 关闭权限模态框
function closePermissionModal() {
    document.getElementById('permissionModal').style.display = 'none';
    currentRoleId = null;
}

// 展开全部
function expandAll() {
    const children = document.querySelectorAll('.permission-children');
    children.forEach(child => {
        child.style.display = 'block';
    });
}

// 收起全部
function collapseAll() {
    const children = document.querySelectorAll('.permission-children');
    children.forEach(child => {
        child.style.display = 'none';
    });
}

// 全选
function selectAll() {
    const checkboxes = document.querySelectorAll('#permissionTree input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

// 取消全选
function unselectAll() {
    const checkboxes = document.querySelectorAll('#permissionTree input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// 保存权限
function savePermissions() {
    if (!currentRoleId) {
        alert('角色ID不存在');
        return;
    }
    
    // 获取选中的权限（只保存叶子节点，即没有子节点的权限）
    const checkedPermissions = [];
    const checkboxes = document.querySelectorAll('.permission-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const permissionId = parseInt(checkbox.dataset.id);
        
        // 检查这个权限是否有子节点（是否是叶子节点）
        const hasChildren = document.querySelector(`.permission-checkbox[data-parent="${permissionId}"]`) !== null;
        
        // 只保存叶子节点（没有子节点的权限）
        if (!hasChildren) {
            checkedPermissions.push(permissionId);
        }
    });
    
    console.log('保存权限, roleId:', currentRoleId, 'permissions:', checkedPermissions);
    
    // 调用后端API保存权限
    fetch(`/api/role/${currentRoleId}/assign-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkedPermissions)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('权限保存成功！');
            closePermissionModal();
            // 重新加载角色列表，更新权限数量
            loadRoleList();
        } else {
            alert('权限保存失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('保存权限失败:', error);
        alert('保存权限失败，请重试');
    });
}

// 将函数暴露到全局作用域，以便HTML的onclick可以访问
window.viewRolePermissions = viewRolePermissions;
window.editRoleInline = editRoleInline;
window.deleteRole = deleteRole;
window.searchRoles = searchRoles;
window.showAddRoleModal = showAddRoleModal;
window.closePermissionModal = closePermissionModal;
window.expandAll = expandAll;
window.collapseAll = collapseAll;
window.selectAll = selectAll;
window.unselectAll = unselectAll;
window.savePermissions = savePermissions;

// 格式化日期时间
function formatDateTime(dateTime) {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

// 加载系统配置
function loadSystemConfig() {
    console.log('加载系统配置');
    
    // 隐藏工具栏
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
        toolbar.style.display = 'none';
    }
    
    // 隐藏所有内容区域
    hideAllContentAreas();
    
    // 显示系统配置区域
    const systemConfigTab = document.getElementById('systemConfigTab');
    if (!systemConfigTab) return;
    
    systemConfigTab.style.display = 'block';
    
    // 如果内容为空，则初始化
    if (!systemConfigTab.innerHTML.trim() || systemConfigTab.innerHTML.includes('将通过JavaScript动态加载')) {
        systemConfigTab.innerHTML = `
        <div class="system-config-container" style="padding: 20px; background: #fff;">
            <h2 style="margin-bottom: 20px; font-size: 18px; color: #333;">系统与安全设置</h2>
            
            <!-- 标签页 -->
            <div class="config-tabs" style="border-bottom: 2px solid #e8e8e8; margin-bottom: 30px;">
                <button class="config-tab active" data-tab="system" style="padding: 10px 20px; border: none; background: none; color: #1890ff; border-bottom: 2px solid #1890ff; cursor: pointer; font-size: 14px; margin-right: 20px;">系统设置</button>
                <button class="config-tab" data-tab="security" style="padding: 10px 20px; border: none; background: none; color: #666; cursor: pointer; font-size: 14px;">安全设置</button>
            </div>
            
            <!-- 系统设置内容 -->
            <div class="config-content" id="systemConfig">
                <!-- 页面刷新 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">页面刷新</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="autoRefresh" style="margin-right: 8px;">
                            <span>页面长表格自动刷新</span>
                        </label>
                    </div>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        页面更新时间间隔（秒）
                    </div>
                    <input type="number" id="refreshInterval" value="30" min="10" max="300" style="width: 200px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                </div>
                
                <!-- 登录验证理由 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">登录验证理由</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="requireLoginReason" checked style="margin-right: 8px;">
                            <span>开启验证理由</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="requireToken" checked style="margin-right: 8px;">
                            <span>开启Token验证</span>
                        </label>
                    </div>
                </div>
                
                <!-- 系统自密码天数 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">
                        <span style="color: #ff4d4f; margin-right: 4px;">*</span>
                        系统自密码天数（天）
                    </h3>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        只保留一段时间内的系统自动密码，历史密码会被自动清理，转换组密码空间
                    </div>
                    <input type="number" id="passwordRetentionDays" value="30" min="1" max="365" style="width: 200px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                </div>
                
                <!-- 指标数据保留天数 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">
                        <span style="color: #ff4d4f; margin-right: 4px;">*</span>
                        指标数据保留天数（天）
                    </h3>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        只保留一段时间内的指标数据，历史数据会被自动清理，清理后将无法恢复数据，而不会保留数据库空间
                    </div>
                    <input type="number" id="metricsRetentionDays" value="90" min="1" max="365" style="width: 200px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                </div>
                
                <!-- 系统备份推送 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">系统备份推送</h3>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        系统会按照配置的时间进行数据备份，配置推送地址后会将备份的数据推送到指定地址
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #666; font-size: 14px; margin-bottom: 8px; display: block;">
                            <span style="color: #ff4d4f; margin-right: 4px;">*</span>
                            备份时间间隔（天）
                        </label>
                        <input type="number" id="backupInterval" value="7" min="1" max="30" style="width: 200px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #666; font-size: 14px; margin-bottom: 8px; display: block;">
                            备份推送地址（可选）
                        </label>
                        <input type="text" id="backupPushUrl" placeholder="http://example.com/backup" style="width: 400px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
                    </div>
                </div>
                
                <!-- 备份管理 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">备份管理</h3>
                    <div style="margin-bottom: 15px;">
                        <button onclick="executeBackupNow()" style="padding: 8px 16px; background: #52c41a; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                            <i class="fas fa-database"></i> 立即备份
                        </button>
                        <button onclick="cleanupHistoryData()" style="padding: 8px 16px; background: #faad14; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-broom"></i> 清理历史数据
                        </button>
                    </div>
                    <div id="backupList" style="margin-top: 15px; max-height: 300px; overflow-y: auto;">
                        <!-- 备份列表将动态加载 -->
                    </div>
                </div>
                
                <!-- 保存按钮 -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8;">
                    <button onclick="saveSystemConfig()" style="padding: 8px 24px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">保存</button>
                    <button onclick="resetSystemConfig()" style="padding: 8px 24px; background: #fff; color: #666; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;">重置</button>
                </div>
            </div>
            
            <!-- 安全设置内容（隐藏） -->
            <div class="config-content" id="securityConfig" style="display: none;">
                <!-- 用户密码强度验证 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">用户密码强度验证</h3>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        密码最小长度：<input type="number" id="minPasswordLength" value="10" min="6" max="20" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 位，密码最大长度：<input type="number" id="maxPasswordLength" value="16" min="10" max="32" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 位
                    </div>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        密码中必须包含元素（至少勾选两项）：
                    </div>
                    <div style="margin-left: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                            <input type="checkbox" id="requireUppercase" checked style="margin-right: 8px;">
                            <span>大写字母</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                            <input type="checkbox" id="requireLowercase" checked style="margin-right: 8px;">
                            <span>小写字母</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                            <input type="checkbox" id="requireNumber" checked style="margin-right: 8px;">
                            <span>阿拉伯数字</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                            <input type="checkbox" id="requireSpecialChar" checked style="margin-right: 8px;">
                            <span>特殊符号(如#$&)</span>
                        </label>
                    </div>
                </div>
                
                <!-- 密码过期时间配置 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">密码过期时间配置</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="enablePasswordExpiry" style="margin-right: 8px;">
                            <span>启用密码过期时间</span>
                        </label>
                    </div>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        密码过期时间：<input type="number" id="passwordExpiryDays" value="30" min="1" max="365" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 天（1~365天）
                    </div>
                    <div style="color: #999; font-size: 12px;">
                        如启用此功能，则用户在设置密码后的指定天数内，用户密码将会过期并需要修改，需要用户在密码过期前修改。
                    </div>
                </div>
                
                <!-- 登录密码验证 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">登录密码验证</h3>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        连续密码验证失败次数：<input type="number" id="maxLoginAttempts" value="3" min="1" max="10" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 次，用户锁定时间：<input type="number" id="lockoutDuration" value="10" min="1" max="60" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 分钟
                    </div>
                    <div style="color: #999; font-size: 12px;">
                        如启用此功能，则用户在连续密码验证失败达到指定次数后，该用户账号将会被锁定指定时间，需要等待锁定时间结束或联系管理员解锁。
                    </div>
                </div>
                
                <!-- 会话超时配置 -->
                <div class="config-section" style="margin-bottom: 30px;">
                    <h3 style="font-size: 16px; margin-bottom: 15px; color: #333;">会话超时配置</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="enableSessionTimeout" checked style="margin-right: 8px;">
                            <span>启用会话超时限制</span>
                        </label>
                    </div>
                    <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                        注销闲置时间：<input type="number" id="sessionTimeout" value="1" min="1" max="24" style="width: 80px; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; margin: 0 5px;"> 小时
                    </div>
                    <div style="color: #999; font-size: 12px;">
                        如启用此功能，则用户在设置的闲置时间内无任何操作，用户会被自动注销并需要重新登录，需要用户在会话超时前进行操作。
                    </div>
                </div>
                
                <!-- 保存按钮 -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8;">
                    <button onclick="saveSecurityConfig()" style="padding: 8px 24px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">保存</button>
                    <button onclick="resetSecurityConfig()" style="padding: 8px 24px; background: #fff; color: #666; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;">重置</button>
                </div>
            </div>
        </div>
    `;
    
        // 绑定标签页切换事件
        const tabs = document.querySelectorAll('.config-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有active状态
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.color = '#666';
                    t.style.borderBottom = 'none';
                });
                
                // 添加当前active状态
                this.classList.add('active');
                this.style.color = '#1890ff';
                this.style.borderBottom = '2px solid #1890ff';
                
                // 切换内容
                const tabName = this.getAttribute('data-tab');
                document.getElementById('systemConfig').style.display = tabName === 'system' ? 'block' : 'none';
                document.getElementById('securityConfig').style.display = tabName === 'security' ? 'block' : 'none';
            });
        });
    }
    
    // 加载配置数据
    loadSystemConfigData();
    loadSecurityConfigData();
    loadBackupList();
}

// 加载系统配置数据
function loadSystemConfigData() {
    fetch('/api/system-config/category/system')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                data.data.forEach(config => {
                    const key = config.configKey.replace('system.', '');
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = config.configValue === 'true';
                        } else {
                            element.value = config.configValue;
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('加载系统配置失败:', error);
        });
}

// 加载安全配置数据
function loadSecurityConfigData() {
    fetch('/api/system-config/category/security')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                data.data.forEach(config => {
                    const key = config.configKey.replace('security.', '');
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = config.configValue === 'true';
                        } else {
                            element.value = config.configValue;
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('加载安全配置失败:', error);
        });
}

// 保存系统配置
function saveSystemConfig() {
    const backupPushUrlEl = document.getElementById('backupPushUrl');
    const config = {
        category: 'system',
        'system.autoRefresh': document.getElementById('autoRefresh').checked,
        'system.refreshInterval': document.getElementById('refreshInterval').value,
        'system.requireLoginReason': document.getElementById('requireLoginReason').checked,
        'system.requireToken': document.getElementById('requireToken').checked,
        'system.passwordRetentionDays': document.getElementById('passwordRetentionDays').value,
        'system.metricsRetentionDays': document.getElementById('metricsRetentionDays').value,
        'system.backupInterval': document.getElementById('backupInterval').value,
        'system.backupPushUrl': backupPushUrlEl ? backupPushUrlEl.value : ''
    };
    
    console.log('保存系统配置:', config);
    
    // 调用后端API保存配置
    fetch('/api/system-config/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('系统配置保存成功！');
        } else {
            alert('系统配置保存失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('保存系统配置失败:', error);
        alert('系统配置保存失败，请重试');
    });
}

// 重置系统配置
function resetSystemConfig() {
    document.getElementById('autoRefresh').checked = false;
    document.getElementById('refreshInterval').value = '30';
    document.getElementById('requireLoginReason').checked = true;
    document.getElementById('requireToken').checked = true;
    document.getElementById('passwordRetentionDays').value = '30';
    document.getElementById('metricsRetentionDays').value = '90';
    document.getElementById('backupInterval').value = '7';
}

// 保存安全配置
function saveSecurityConfig() {
    const config = {
        category: 'security',
        'security.minPasswordLength': document.getElementById('minPasswordLength').value,
        'security.maxPasswordLength': document.getElementById('maxPasswordLength').value,
        'security.requireUppercase': document.getElementById('requireUppercase').checked,
        'security.requireLowercase': document.getElementById('requireLowercase').checked,
        'security.requireNumber': document.getElementById('requireNumber').checked,
        'security.requireSpecialChar': document.getElementById('requireSpecialChar').checked,
        'security.enablePasswordExpiry': document.getElementById('enablePasswordExpiry').checked,
        'security.passwordExpiryDays': document.getElementById('passwordExpiryDays').value,
        'security.maxLoginAttempts': document.getElementById('maxLoginAttempts').value,
        'security.lockoutDuration': document.getElementById('lockoutDuration').value,
        'security.enableSessionTimeout': document.getElementById('enableSessionTimeout').checked,
        'security.sessionTimeout': document.getElementById('sessionTimeout').value
    };
    
    console.log('保存安全配置:', config);
    
    // 调用后端API保存配置
    fetch('/api/system-config/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('安全配置保存成功！');
        } else {
            alert('安全配置保存失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('保存安全配置失败:', error);
        alert('安全配置保存失败，请重试');
    });
}

// 重置安全配置
function resetSecurityConfig() {
    document.getElementById('minPasswordLength').value = '10';
    document.getElementById('maxPasswordLength').value = '16';
    document.getElementById('requireUppercase').checked = true;
    document.getElementById('requireLowercase').checked = true;
    document.getElementById('requireNumber').checked = true;
    document.getElementById('requireSpecialChar').checked = true;
    document.getElementById('enablePasswordExpiry').checked = false;
    document.getElementById('passwordExpiryDays').value = '30';
    document.getElementById('maxLoginAttempts').value = '3';
    document.getElementById('lockoutDuration').value = '10';
    document.getElementById('enableSessionTimeout').checked = true;
    document.getElementById('sessionTimeout').value = '1';
}

// 将函数暴露到全局作用域
window.saveSystemConfig = saveSystemConfig;
window.resetSystemConfig = resetSystemConfig;
window.saveSecurityConfig = saveSecurityConfig;
window.resetSecurityConfig = resetSecurityConfig;
window.executeBackupNow = executeBackupNow;
window.cleanupHistoryData = cleanupHistoryData;
window.downloadBackup = downloadBackup;
window.deleteBackup = deleteBackup;

// 立即执行备份
function executeBackupNow() {
    if (!confirm('确定要立即执行系统备份吗？')) {
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 备份中...';
    
    fetch('/api/system-backup/execute', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('备份成功！\n文件: ' + data.data.filename + '\n大小: ' + data.data.size);
            loadBackupList();
        } else {
            alert('备份失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('备份失败:', error);
        alert('备份失败，请重试');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-database"></i> 立即备份';
    });
}

// 清理历史数据
function cleanupHistoryData() {
    if (!confirm('确定要清理历史数据吗？此操作不可恢复！')) {
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 清理中...';
    
    fetch('/api/system-backup/cleanup', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            let msg = '清理完成！\n';
            const stats = data.data;
            for (const [table, count] of Object.entries(stats)) {
                if (count > 0) {
                    msg += table + ': ' + count + ' 条\n';
                }
            }
            alert(msg);
        } else {
            alert('清理失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('清理失败:', error);
        alert('清理失败，请重试');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-broom"></i> 清理历史数据';
    });
}

// 加载备份列表
function loadBackupList() {
    const container = document.getElementById('backupList');
    if (!container) return;
    
    container.innerHTML = '<div style="color: #999; padding: 10px;">加载中...</div>';
    
    fetch('/api/system-backup/list')
    .then(response => response.json())
    .then(data => {
        if (data.code === 200 && data.data && data.data.length > 0) {
            let html = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
            html += '<thead><tr style="background: #fafafa;">';
            html += '<th style="padding: 10px; text-align: left; border-bottom: 1px solid #e8e8e8;">文件名</th>';
            html += '<th style="padding: 10px; text-align: left; border-bottom: 1px solid #e8e8e8;">大小</th>';
            html += '<th style="padding: 10px; text-align: left; border-bottom: 1px solid #e8e8e8;">备份时间</th>';
            html += '<th style="padding: 10px; text-align: center; border-bottom: 1px solid #e8e8e8;">操作</th>';
            html += '</tr></thead><tbody>';
            
            data.data.forEach(backup => {
                const time = new Date(backup.time).toLocaleString();
                html += '<tr>';
                html += '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">' + backup.filename + '</td>';
                html += '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">' + backup.size + '</td>';
                html += '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">' + time + '</td>';
                html += '<td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: center;">';
                html += '<button onclick="downloadBackup(\'' + backup.filename + '\')" style="padding: 4px 8px; background: #1890ff; color: #fff; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;"><i class="fas fa-download"></i></button>';
                html += '<button onclick="deleteBackup(\'' + backup.filename + '\')" style="padding: 4px 8px; background: #ff4d4f; color: #fff; border: none; border-radius: 3px; cursor: pointer;"><i class="fas fa-trash"></i></button>';
                html += '</td>';
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">暂无备份文件</div>';
        }
    })
    .catch(error => {
        console.error('加载备份列表失败:', error);
        container.innerHTML = '<div style="color: #ff4d4f; padding: 10px;">加载失败</div>';
    });
}

// 下载备份
function downloadBackup(filename) {
    window.open('/api/system-backup/download/' + filename, '_blank');
}

// 删除备份
function deleteBackup(filename) {
    if (!confirm('确定要删除备份文件 ' + filename + ' 吗？')) {
        return;
    }
    
    fetch('/api/system-backup/delete/' + filename, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            alert('删除成功');
            loadBackupList();
        } else {
            alert('删除失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
    });
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

// 页面加载完成后初始化（补充初始化）
document.addEventListener('DOMContentLoaded', function() {
    console.log('设置页面初始化完成');
    
    // 注意：initializeNavTabs() 和 initializeUserData() 已在文件开头的DOMContentLoaded中调用
    // 这里不再重复调用，避免事件监听器被添加两次导致重复提交
    
    // 初始化侧边栏导航
    initializeSidebarNavigation();
    
    // 延迟初始化头像显示，确保DOM完全加载
    setTimeout(() => {
        initializeSettingsAvatar();
    }, 100);
    
    // 延迟加载头像（数据已在文件开头初始化，这里只需要加载头像）
    setTimeout(() => {
        loadSettingsAvatar();
    }, 1000);
});

// 编辑用户（旧版本，保留兼容性，调用新API）
function editUserOld(userName) {
    console.log('编辑用户(旧):', userName);
    // 旧版本函数已弃用，请使用editUser(userId)
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

// 删除用户（旧版本，已弃用）
function deleteUserOld(userName) {
    console.log('删除用户(旧):', userName);
    // 旧版本函数已弃用，请使用deleteUser(userId, username)
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
    
    // 显示上传进度
    showImportProgress('正在上传文件...');
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // 上传文件
    fetch('/api/sys-user/import', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        hideImportProgress();
        
        if (result.code === 200) {
            // 显示导入结果
            showImportResult(result.data);
            // 刷新用户列表
            loadUserList();
        } else {
            alert(result.message || '导入失败');
        }
    })
    .catch(error => {
        hideImportProgress();
        console.error('导入失败:', error);
        alert('导入失败，请稍后重试');
    });
}

// 显示导入进度
function showImportProgress(message) {
    const importArea = document.querySelector('.import-area');
    if (importArea) {
        const progressHtml = `
            <div class="import-progress" id="importProgress">
                <div class="progress-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        importArea.insertAdjacentHTML('beforeend', progressHtml);
    }
}

// 隐藏导入进度
function hideImportProgress() {
    const progress = document.getElementById('importProgress');
    if (progress) {
        progress.remove();
    }
}

// 显示导入结果
function showImportResult(data) {
    let message = `导入完成！\n\n`;
    message += `总计: ${data.total} 条\n`;
    message += `成功: ${data.success} 条\n`;
    message += `失败: ${data.fail} 条`;
    
    if (data.errors && data.errors.length > 0) {
        message += `\n\n失败详情:\n`;
        data.errors.forEach(err => {
            message += `- ${err}\n`;
        });
    }
    
    alert(message);
    
    // 切换到用户列表
    if (data.success > 0) {
        switchTab('users');
    }
}

// 下载导入模板
function downloadImportTemplate() {
    window.location.href = '/api/sys-user/import-template';
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

// 页面加载完成后的初始化 - 此函数已弃用，初始化已在DOMContentLoaded中完成
// 移除了initializePage()和setTimeout调用以避免重复初始化

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
    
    // 获取角色和状态
    const role = document.getElementById('edit-role') ? document.getElementById('edit-role').value : 'user';
    const status = document.getElementById('edit-status') ? document.getElementById('edit-status').value : '1';
    formData.role = role;
    formData.status = parseInt(status);
    
    // 调用后端接口更新用户
    fetch(`/api/sys-user/update/${userId}`, {
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
            
            // 返回用户列表并刷新
            switchTab('users');
            loadUserList();
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
    fetch('/api/sys-user/add', {
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
            
            // 返回用户列表并刷新
            switchTab('users');
            loadUserList();
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
                    warningThreshold: template.warningThreshold !== undefined ? template.warningThreshold : (template.warning_threshold !== undefined ? template.warning_threshold : 0),
                    criticalThreshold: template.criticalThreshold !== undefined ? template.criticalThreshold : (template.critical_threshold !== undefined ? template.critical_threshold : 0),
                    checkInterval: template.checkInterval || template.check_interval,
                    intervalUnit: template.intervalUnit || template.interval_unit || 'minutes',
                    description: template.description,
                    status: template.status,
                    updatedAt: template.updateTime || template.updatedAt || template.updated_at
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

// API加载失败时的处理
function loadFallbackTemplateData() {
    console.warn('无法从API加载检测模板数据，显示空状态');
    detectionTemplates = [];
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
        'temperature': '温度监控',
        'performance': '性能监控',
        'capacity': '容量监控',
        'fault': '故障检测',
        'health': '健康检查'
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
        console.log('删除模板:', id);
        
        fetch(`/api/detection-templates/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('删除成功');
                loadDetectionTemplates(); // 重新加载数据
            } else {
                alert('删除失败: ' + (result.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('删除模板失败:', error);
            alert('删除失败: ' + error.message);
        });
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
    
    const templateId = formData.get('id');
    const templateData = {
        templateName: formData.get('templateName'),
        detectionType: formData.get('detectionType'),
        warningThreshold: parseFloat(formData.get('warningThreshold')),
        criticalThreshold: parseFloat(formData.get('criticalThreshold')),
        checkInterval: parseInt(formData.get('checkInterval')),
        intervalUnit: formData.get('intervalUnit'),
        description: formData.get('description'),
        status: parseInt(formData.get('status'))
    };
    
    const isEdit = templateId && !isNaN(parseInt(templateId));
    const url = isEdit ? `/api/detection-templates/${templateId}` : '/api/detection-templates';
    const method = isEdit ? 'PUT' : 'POST';
    
    console.log('保存模板:', method, url, templateData);
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            alert(isEdit ? '模板更新成功' : '模板创建成功');
            closeTemplateModal();
            loadDetectionTemplates(); // 重新加载数据
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('保存模板失败:', error);
        alert('保存失败: ' + error.message);
    });
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
