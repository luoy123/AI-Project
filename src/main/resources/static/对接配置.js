// 对接配置页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 初始化对接配置数据
    initializeDockingData();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索对接配置:', searchTerm);
        });
    }

    // 对接配置搜索功能
    const dockingSearchInput = document.getElementById('dockingSearchInput');
    if (dockingSearchInput) {
        dockingSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('搜索对接配置信息:', searchTerm);
            filterDockingConfigs(searchTerm);
        });
    }

    // 搜索按钮
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = dockingSearchInput.value.toLowerCase();
            console.log('点击搜索按钮:', searchTerm);
            filterDockingConfigs(searchTerm);
        });
    }

    // 刷新按钮
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('刷新对接配置数据');
            refreshDockingData();
        });
    }

    // 新增对接配置按钮
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            console.log('新增对接配置');
            openAddDockingModal();
        });
    }

    // 编辑按钮
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const configName = row.cells[0].textContent;
            console.log('编辑对接配置:', configName);
            editDockingConfig(configName);
        });
    });

    // 删除按钮
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const configName = row.cells[0].textContent;
            console.log('删除对接配置:', configName);
            deleteDockingConfig(configName);
        });
    });

    // 测试连接按钮
    const testButtons = document.querySelectorAll('.btn-test-connection');
    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const configName = row.cells[0].textContent;
            console.log('测试连接:', configName);
            testDockingConnection(configName);
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

    // 表单验证
    const dockingForm = document.getElementById('dockingForm');
    if (dockingForm) {
        const inputs = dockingForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
}

// 初始化对接配置数据
function initializeDockingData() {
    console.log('初始化对接配置数据');
    // 这里可以添加加载对接配置数据的逻辑
    loadDockingConfigs();
}

// 加载对接配置
function loadDockingConfigs() {
    console.log('加载对接配置列表');
    
    fetch('/api/integration-config/list')
        .then(response => response.json())
        .then(result => {
            console.log('加载对接配置数据:', result);
            if (result.code === 200 && result.data && result.data.length > 0) {
                // 转换数据格式
                const configs = result.data.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.integrationType || item.integration_type || '-',
                    url: item.dockingId || item.docking_id || '-',
                    port: '-',
                    tool: item.dockingType || item.docking_type || '-',
                    status: item.status === 1 ? '正常' : '停用',
                    statusValue: item.status,
                    description: item.description || '-',
                    createTime: item.createdTime || item.created_time || '-',
                    username: item.username || '',
                    password: item.password || ''
                }));
                renderDockingTable(configs);
            } else {
                showEmptyState();
            }
        })
        .catch(error => {
            console.error('加载对接配置失败:', error);
            showEmptyState();
        });
}

// 显示空状态
function showEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

// 隐藏空状态
function hideEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// 渲染对接配置表格
function renderDockingTable(data) {
    console.log('渲染对接配置表格:', data);
    hideEmptyState();
    
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(config => {
        const row = createTableRow(config);
        tbody.appendChild(row);
    });
}

// 创建表格行
function createTableRow(config) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', config.id);
    row.innerHTML = `
        <td>${config.name}</td>
        <td>${config.type}</td>
        <td>${config.url}</td>
        <td>${config.port || '-'}</td>
        <td>${config.tool || '-'}</td>
        <td>${config.status}</td>
        <td>${config.description || '-'}</td>
        <td>${config.createTime}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-edit" title="编辑" onclick="editConfig(${config.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-test-connection" title="测试连接">
                    <i class="fas fa-plug"></i>
                </button>
                <button class="btn-delete" title="删除" onclick="deleteConfig(${config.id}, '${config.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// 编辑配置
function editConfig(id) {
    console.log('编辑配置:', id);
    // 获取配置详情
    fetch(`/api/integration-config/get/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                const config = result.data;
                // 填充表单
                document.getElementById('dockingName').value = config.name || '';
                document.getElementById('dockingType').value = config.dockingType || '';
                document.getElementById('dockingUrl').value = config.dockingId || '';
                document.getElementById('dockingPort').value = config.port || '';
                document.getElementById('username').value = config.username || '';
                document.getElementById('password').value = config.password || '';
                document.getElementById('description').value = config.description || '';
                
                // 设置编辑模式
                window.editingConfigId = id;
                
                // 修改模态框标题
                const modalTitle = document.querySelector('#addDockingModal h3');
                if (modalTitle) {
                    modalTitle.textContent = '编辑对接配置';
                }
                
                showModal();
            } else {
                alert('获取配置详情失败');
            }
        })
        .catch(error => {
            console.error('获取配置详情失败:', error);
            alert('获取配置详情失败: ' + error.message);
        });
}

// 删除配置
function deleteConfig(id, name) {
    if (!confirm(`确定要删除配置 "${name}" 吗？`)) {
        return;
    }
    
    fetch(`/api/integration-config/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            alert('删除成功');
            loadDockingConfigs(); // 重新加载列表
        } else {
            alert('删除失败: ' + (result.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('删除配置失败:', error);
        alert('删除失败: ' + error.message);
    });
}

// 筛选对接配置
function filterDockingConfigs(searchTerm) {
    console.log('筛选对接配置:', searchTerm);
    
    // 获取表格中的所有行
    const table = document.querySelector('.data-table tbody');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        // 获取行中所有单元格的文本内容
        const cells = row.querySelectorAll('td');
        let rowText = '';
        cells.forEach(cell => {
            rowText += cell.textContent.toLowerCase() + ' ';
        });
        
        // 如果搜索词为空或者行内容包含搜索词，显示该行
        if (!searchTerm || rowText.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 刷新对接配置数据
function refreshDockingData() {
    console.log('刷新对接配置数据');
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('对接配置数据刷新完成');
        
        // 重新加载数据
        loadDockingConfigs();
    }, 1000);
}

// 打开新增对接配置模态框
function openAddDockingModal() {
    console.log('打开新增对接配置模态框');
    
    // 清除编辑状态
    window.editingConfigId = null;
    
    // 清空表单
    const form = document.getElementById('dockingForm');
    if (form) {
        form.reset();
        clearAllFieldErrors();
    }
    
    // 重置模态框标题
    const modalTitle = document.querySelector('#addDockingModal h3');
    if (modalTitle) {
        modalTitle.textContent = '新增对接配置';
    }
    
    // 显示模态框
    showModal();
}

// 显示模态框
function showModal() {
    const modal = document.getElementById('addDockingModal');
    const backdrop = document.getElementById('modalBackdrop');
    
    if (modal && backdrop) {
        modal.style.display = 'flex';
        backdrop.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('addDockingModal');
    const backdrop = document.getElementById('modalBackdrop');
    
    if (modal && backdrop) {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 保存对接配置
function saveDockingConfig() {
    console.log('保存对接配置');
    
    const form = document.getElementById('dockingForm');
    if (!form) return;
    
    // 验证表单
    if (!validateForm(form)) {
        console.log('表单验证失败');
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    const configData = {};
    
    for (let [key, value] of formData.entries()) {
        configData[key] = value;
    }
    
    console.log('对接配置数据:', configData);
    
    // 构建后端需要的数据格式
    const apiData = {
        name: configData.dockingName,
        integrationType: configData.dockingType,
        dockingType: configData.dockingType,
        dockingId: configData.dockingUrl,
        username: configData.username || '',
        password: configData.password || '',
        description: configData.description || '',
        status: 1
    };
    
    // 判断是新增还是编辑
    const isEdit = window.editingConfigId != null;
    const url = isEdit ? `/api/integration-config/update/${window.editingConfigId}` : '/api/integration-config/add';
    const method = isEdit ? 'PUT' : 'POST';
    
    // 调用后端API保存
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('保存结果:', result);
        if (result.code === 200) {
            alert(isEdit ? '对接配置更新成功' : '对接配置保存成功');
            window.editingConfigId = null; // 清除编辑状态
            closeModal();
            loadDockingConfigs(); // 重新加载列表
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('保存对接配置失败:', error);
        alert('保存失败: ' + error.message);
    });
}

// 测试连接
function testConnection() {
    console.log('测试连接');
    
    const form = document.getElementById('dockingForm');
    if (!form) return;
    
    // 收集连接信息
    const formData = new FormData(form);
    const connectionData = {};
    
    for (let [key, value] of formData.entries()) {
        connectionData[key] = value;
    }
    
    console.log('测试连接数据:', connectionData);
    
    // 显示测试中状态
    const testBtn = document.querySelector('.btn-test');
    if (testBtn) {
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
    }
    
    // 模拟测试连接
    setTimeout(() => {
        if (testBtn) {
            testBtn.disabled = false;
            testBtn.innerHTML = '测试连接';
        }
        
        // 模拟测试结果
        const success = Math.random() > 0.5;
        if (success) {
            alert('连接测试成功');
        } else {
            alert('连接测试失败，请检查配置信息');
        }
    }, 2000);
}

// 编辑对接配置
function editDockingConfig(configName) {
    console.log('编辑对接配置:', configName);
    // 这里可以添加编辑对接配置的逻辑
    openAddDockingModal();
}

// 删除对接配置
function deleteDockingConfig(configName) {
    console.log('删除对接配置:', configName);
    if (confirm('确定要删除对接配置 "' + configName + '" 吗？')) {
        console.log('确认删除对接配置:', configName);
        // 这里可以添加删除对接配置的逻辑
        refreshDockingData();
    }
}

// 测试对接连接
function testDockingConnection(configName) {
    console.log('测试对接连接:', configName);
    
    // 显示测试状态
    alert('正在测试连接...');
    
    // 模拟测试连接
    setTimeout(() => {
        const success = Math.random() > 0.5;
        if (success) {
            alert('连接测试成功');
        } else {
            alert('连接测试失败');
        }
    }, 1000);
}

// 表单验证
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 验证单个字段
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // 必填验证
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = '此字段为必填项';
    }
    
    // 特定字段验证
    if (value && fieldName === 'dockingUrl') {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(value)) {
            isValid = false;
            errorMessage = '请输入有效的URL地址';
        }
    }
    
    if (value && fieldName === 'dockingPort') {
        const port = parseInt(value);
        if (port < 1 || port > 65535) {
            isValid = false;
            errorMessage = '端口号必须在1-65535之间';
        }
    }
    
    // 显示验证结果
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        if (isValid) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            removeErrorMessage(formGroup);
        } else {
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            showErrorMessage(formGroup, errorMessage);
        }
    }
    
    return isValid;
}

// 清除字段错误
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error', 'success');
        removeErrorMessage(formGroup);
    }
}

// 清除所有字段错误
function clearAllFieldErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        removeErrorMessage(group);
    });
}

// 显示错误信息
function showErrorMessage(formGroup, message) {
    removeErrorMessage(formGroup);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// 移除错误信息
function removeErrorMessage(formGroup) {
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
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
    console.log('对接配置页面初始化完成');
    
    // 加载对接配置数据
    loadDockingConfigs();
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
        if (targetPage === '对接配置.html') {
            console.log('当前已在对接配置页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
