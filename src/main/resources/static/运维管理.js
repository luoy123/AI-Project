// 运维管理页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有图表
    initializeCharts();
    
    // 初始化事件监听器
    initializeEventListeners();
});

// 初始化图表
function initializeCharts() {
    // 初始化工单状态仪表盘
    initializeTicketStatusGauge();
    
    // 初始化优先级分析仪表盘
    initializePriorityGauge();
    
    // 初始化工单趋势图表
    initializeTrendChart();
}

// 初始化工单状态仪表盘
function initializeTicketStatusGauge() {
    const ctx = document.getElementById('ticketStatusGauge').getContext('2d');
    new Chart(ctx, {
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
}

// 初始化优先级分析仪表盘
function initializePriorityGauge() {
    const canvas = document.getElementById('priorityGauge');
    // 某些页面布局中可能不存在该图表容器，避免空指针错误
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('优先级仪表盘容器不存在或图表库未加载，跳过渲染');
        return;
    }

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
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

// 初始化工单趋势图表
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // 生成时间标签
    const timeLabels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        timeLabels.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: '新建',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#007bff',
                    pointRadius: 4
                },
                {
                    label: '处理中',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#fd7e14',
                    pointBorderColor: '#fd7e14',
                    pointRadius: 4
                },
                {
                    label: '已完成',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#28a745',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 使用自定义图例
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
            console.log('搜索工单:', searchTerm);
        });
    }

    // 标签页切换事件
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他标签的激活状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            // 添加当前标签的激活状态
            this.classList.add('active');
            
            const tabText = this.textContent;
            console.log('切换到标签:', tabText);
            
            // 这里可以添加切换标签页内容的逻辑
            updateTabContent(tabText);
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

// 更新标签页内容
function updateTabContent(tabName) {
    // 根据不同的标签页更新内容
    switch(tabName) {
        case '配置工单':
            updateConfigTickets();
            break;
        case '我的工单':
            updateMyTickets();
            break;
        case '上传':
            updateUploads();
            break;
        case '派发':
            updateUnassigned();
            break;
        default:
            console.log('未知标签页:', tabName);
    }
}

// 统一的页面切换函数
function switchToPage(targetPageId) {
    console.log('切换到页面:', targetPageId);
    
    // 隐藏所有页面
    const allPages = [
        'configTicketPage',
        'ticketStatsPage', 
        'myTicketsPage',
        'uploadPage',
        'unassignedPage'
    ];
    
    allPages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'none';
        }
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // 处理子标签页显示/隐藏
    const configSubTabs = document.getElementById('configSubTabs');
    if (configSubTabs) {
        if (targetPageId === 'configTicketPage') {
            configSubTabs.style.display = 'block';
        } else {
            configSubTabs.style.display = 'none';
        }
    }
}

// 更新配置工单数据
function updateConfigTickets() {
    console.log('更新配置工单数据');
    
    // 使用统一的页面切换函数
    switchToPage('configTicketPage');
    
    // 初始化配置页面
    initConfigPage();
}

// 更新我的工单数据
function updateMyTickets() {
    console.log('更新我的工单数据');
    
    // 使用统一的页面切换函数
    switchToPage('myTicketsPage');
    
    // 初始化我的工单管理页面（避免重复初始化）
    if (!window.myTicketsPageInitialized) {
        initMyTicketManagePage();
        window.myTicketsPageInitialized = true;
    } else {
        // 如果已经初始化过，只重新加载数据
        loadMyTicketData();
    }
}

// 更新上传数据
function updateUploads() {
    console.log('更新上传数据');
    
    // 使用统一的页面切换函数
    switchToPage('uploadPage');
    
    // 初始化上传页面
    initUploadPage();
}

// 更新未派发数据
function updateUnassigned() {
    console.log('更新未派发数据');
    
    // 使用统一的页面切换函数
    switchToPage('unassignedPage');
    
    // 初始化未派发页面
    initUnassignedPage();
}

// 初始化配置页面
function initConfigPage() {
    console.log('初始化配置页面');
    
    // 绑定子标签页切换事件
    bindSubTabEvents();
    
    // 绑定配置操作事件
    bindConfigEvents();
    
    // 加载配置数据
    loadConfigData();
}

// 加载配置数据
async function loadConfigData() {
    try {
        // 加载优先级配置
        await loadPriorityConfig();
        
        // 加载类型配置
        await loadTypeConfig();
        
        // 加载来源配置
        await loadSourceConfig();
        
    } catch (error) {
        console.error('加载配置数据失败:', error);
        showErrorMessage('加载配置数据失败');
    }
}

// 加载优先级配置
async function loadPriorityConfig() {
    try {
        const response = await fetch('/api/ticket/config/priority');
        const result = await response.json();
        
        console.log('后端返回的完整响应:', result); // 调试：查看完整响应
        
        // 检查返回结果，兼容不同的响应格式
        const isSuccess = result.success === true || result.code === 200;
        const data = result.data;
        
        console.log('响应检查 - isSuccess:', isSuccess, 'data length:', data ? data.length : 0);
        
        if (isSuccess && data) {
            console.log('优先级列表数据:', data); // 调试：查看数据数组
            renderPriorityList(data);
        } else {
            console.error('加载优先级配置失败:', result.message);
            const priorityList = document.querySelector('.priority-list');
            if (priorityList) {
                priorityList.innerHTML = '<p class="no-data">加载优先级配置失败</p>';
            }
        }
    } catch (error) {
        console.error('加载优先级配置出错:', error);
    }
}

// 渲染优先级列表
function renderPriorityList(priorities) {
    console.log('开始渲染优先级列表，数据:', priorities);
    
    const priorityList = document.querySelector('.priority-list');
    if (!priorityList) {
        console.error('找不到 .priority-list 元素');
        return;
    }
    
    console.log('找到优先级列表容器:', priorityList);
    priorityList.innerHTML = '';
    
    if (!priorities || priorities.length === 0) {
        priorityList.innerHTML = '<p class="no-data">暂无优先级配置</p>';
        return;
    }
    
    priorities.forEach((priority, index) => {
        try {
            console.log(`渲染第 ${index + 1} 个优先级:`, priority);
            
            // 安全地获取字段值，提供默认值
            const priorityKey = priority.priorityKey || '';
            const priorityName = priority.priorityName || '未命名';
            const description = priority.description || '无描述';
            const colorCode = priority.colorCode || '#6c757d';
            const id = priority.id || '';
            const isDefault = priority.isDefault || false;
            
            console.log(`字段值 - key: ${priorityKey}, name: ${priorityName}, id: ${id}`);
            
            const priorityHTML = `
                <div class="priority-item" data-priority="${priorityKey}" data-db-id="${id}">
                    <div class="priority-info">
                        <div class="priority-color" style="background-color: ${colorCode};"></div>
                        <div class="priority-details">
                            <span class="priority-name">${priorityName}</span>
                            <span class="priority-desc">${description}</span>
                        </div>
                    </div>
                    <div class="priority-actions">
                        <button class="btn-icon" title="编辑" onclick="editPriority('${priorityKey}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="删除" onclick="deletePriority('${priorityKey}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            console.log(`生成的HTML:`, priorityHTML);
            priorityList.insertAdjacentHTML('beforeend', priorityHTML);
            console.log(`成功添加第 ${index + 1} 个优先级项目`);
            
        } catch (error) {
            console.error(`渲染第 ${index + 1} 个优先级时出错:`, error, priority);
        }
    });
    
    const renderedItems = priorityList.querySelectorAll('.priority-item');
    console.log(`渲染完成，实际生成了 ${renderedItems.length} 个项目`);
}

// 加载类型配置 - 已禁用，因为类型管理功能已删除
async function loadTypeConfig() {
    console.log('类型配置功能已禁用');
    // 清空类型列表显示
    const typeList = document.querySelector('.type-list');
    if (typeList) {
        typeList.innerHTML = '<p class="no-data">类型管理功能已禁用</p>';
    }
}

// 渲染类型列表
function renderTypeList(types) {
    const typeList = document.querySelector('.type-settings-list');
    if (!typeList) return;
    
    typeList.innerHTML = '';
    
    types.forEach(type => {
        const typeHTML = `
            <div class="type-setting-item" data-type="${type.typeKey}" data-db-id="${type.id}">
                <div class="type-setting-info">
                    <div class="type-setting-color" style="background-color: ${type.colorCode};"></div>
                    <div class="type-setting-details">
                        <span class="type-setting-name">${type.typeName}</span>
                        <span class="type-setting-desc">${type.typeDesc}</span>
                    </div>
                </div>
                <div class="type-setting-actions">
                    <button class="btn-icon" title="编辑" onclick="editTicketType('${type.typeKey}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!type.isDefault ? `
                    <button class="btn-icon" title="删除" onclick="deleteTicketType('${type.typeKey}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        typeList.insertAdjacentHTML('beforeend', typeHTML);
    });
}

// 加载来源配置 - 已禁用，因为来源管理功能已删除
async function loadSourceConfig() {
    console.log('来源配置功能已禁用');
    // 清空来源列表显示
    const sourceList = document.querySelector('.source-list');
    if (sourceList) {
        sourceList.innerHTML = '<p class="no-data">来源管理功能已禁用</p>';
    }
}

// 渲染来源列表
function renderSourceList(sources) {
    const sourceList = document.querySelector('.source-settings-list');
    if (!sourceList) return;
    
    sourceList.innerHTML = '';
    
    sources.forEach(source => {
        const sourceHTML = `
            <div class="source-setting-item" data-source="${source.sourceKey}" data-db-id="${source.id}">
                <div class="source-setting-info">
                    <div class="source-setting-icon">
                        <i class="${source.iconClass}"></i>
                    </div>
                    <div class="source-setting-details">
                        <span class="source-setting-name">${source.sourceName}</span>
                        <span class="source-setting-desc">${source.sourceDesc}</span>
                    </div>
                </div>
                <div class="source-setting-actions">
                    <button class="btn-icon" title="编辑" onclick="editTicketSource('${source.sourceKey}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!source.isDefault ? `
                    <button class="btn-icon" title="删除" onclick="deleteTicketSource('${source.sourceKey}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        sourceList.insertAdjacentHTML('beforeend', sourceHTML);
    });
}

// 绑定子标签页事件
function bindSubTabEvents() {
    console.log('绑定子标签页事件');
    const subTabItems = document.querySelectorAll('.sub-tab-item');
    console.log('找到子标签页数量:', subTabItems.length);
    
    subTabItems.forEach((item, index) => {
        console.log(`绑定第${index + 1}个子标签页:`, item.textContent);
        
        // 移除之前的事件监听器（如果有的话）
        item.removeEventListener('click', handleSubTabClick);
        
        // 添加新的事件监听器
        item.addEventListener('click', handleSubTabClick);
    });
}

// 子标签页点击处理函数
function handleSubTabClick(event) {
    const clickedItem = event.currentTarget;
    const configType = clickedItem.getAttribute('data-config');
    
    console.log('点击子标签页:', clickedItem.textContent, '配置类型:', configType);
    
    // 切换配置面板
    switchConfigPanel(configType);
    
    // 更新子标签页状态
    const subTabItems = document.querySelectorAll('.sub-tab-item');
    subTabItems.forEach(tab => tab.classList.remove('active'));
    clickedItem.classList.add('active');
}

// 切换配置面板
function switchConfigPanel(configType) {
    console.log('切换配置面板:', configType);
    
    // 隐藏所有配置面板
    const panels = document.querySelectorAll('.config-panel');
    console.log('找到配置面板数量:', panels.length);
    panels.forEach((panel, index) => {
        console.log(`面板${index + 1}:`, panel.id, '当前状态:', panel.classList.contains('active'));
        panel.classList.remove('active');
    });
    
    // 显示对应的配置面板
    const targetPanel = document.getElementById(configType);
    console.log('目标面板:', targetPanel);
    if (targetPanel) {
        targetPanel.classList.add('active');
        console.log('已激活面板:', configType);
    } else {
        console.error('未找到配置面板:', configType);
    }
}


// 绑定配置相关事件
function bindConfigEvents() {
    // 添加工单类型
    const addTypeBtn = document.getElementById('addTicketType');
    if (addTypeBtn) {
        addTypeBtn.addEventListener('click', function() {
            showAddTicketTypeModal();
        });
    }
    
    // 保存工单类型配置
    const saveTypesBtn = document.getElementById('saveTicketTypes');
    if (saveTypesBtn) {
        saveTypesBtn.addEventListener('click', function() {
            saveTicketTypesConfig();
        });
    }
    
    // 添加优先级
    const addPriorityBtn = document.getElementById('addPriority');
    if (addPriorityBtn) {
        addPriorityBtn.addEventListener('click', function() {
            showAddPriorityModal();
        });
    }
    
    // 保存优先级配置
    const savePrioritiesBtn = document.getElementById('savePriorities');
    if (savePrioritiesBtn) {
        savePrioritiesBtn.addEventListener('click', function() {
            savePrioritiesConfig();
        });
    }
    
    // 新增优先级链接
    const addNewPriorityBtn = document.getElementById('addNewPriority');
    if (addNewPriorityBtn && !addNewPriorityBtn.hasAttribute('data-bound')) {
        addNewPriorityBtn.addEventListener('click', function() {
            addNewPriority();
        });
        addNewPriorityBtn.setAttribute('data-bound', 'true');
    }
    
    // 保存工单类型配置
    const saveTicketTypesBtn = document.getElementById('saveTicketTypes');
    if (saveTicketTypesBtn) {
        saveTicketTypesBtn.addEventListener('click', function() {
            saveTicketTypesConfig();
        });
    }
    
    // 新增工单类型链接
    const addNewTicketTypeBtn = document.getElementById('addNewTicketType');
    if (addNewTicketTypeBtn) {
        addNewTicketTypeBtn.addEventListener('click', function() {
            addNewTicketType();
        });
    }
    
    // 保存工单来源配置
    const saveTicketSourcesBtn = document.getElementById('saveTicketSources');
    if (saveTicketSourcesBtn) {
        saveTicketSourcesBtn.addEventListener('click', function() {
            saveTicketSourcesConfig();
        });
    }
    
    // 新增工单来源链接
    const addNewTicketSourceBtn = document.getElementById('addNewTicketSource');
    if (addNewTicketSourceBtn) {
        addNewTicketSourceBtn.addEventListener('click', function() {
            addNewTicketSource();
        });
    }
}

// 显示添加工单类型模态框
function showAddTicketTypeModal() {
    console.log('显示添加工单类型模态框');
    // 这里可以实现模态框逻辑
    alert('添加工单类型功能开发中...');
}

// 保存工单类型配置
function saveTicketTypesConfig() {
    console.log('保存工单类型配置');
    
    // 收集工单类型数据
    const typeItems = document.querySelectorAll('.type-item');
    const ticketTypes = [];
    
    typeItems.forEach(item => {
        const type = item.getAttribute('data-type');
        const name = item.querySelector('.type-name').textContent;
        const desc = item.querySelector('.type-desc').textContent;
        const color = item.querySelector('.type-color').style.backgroundColor;
        
        ticketTypes.push({
            type: type,
            name: name,
            description: desc,
            color: color
        });
    });
    
    console.log('工单类型数据:', ticketTypes);
    
    // 这里可以发送到后端保存
    // 临时显示成功消息
    alert('工单类型配置保存成功！');
}

// 旧版showAddPriorityModal已移至底部统一定义

async function submitAddPriority() {
	console.log('开始提交新增优先级');
	
	// 使用唯一的add_前缀ID
	const priorityKey = document.getElementById('add_priorityKey')?.value?.trim();
	const priorityName = document.getElementById('add_priorityName')?.value?.trim();
	const priorityDesc = document.getElementById('add_priorityDesc')?.value?.trim();
	const priorityLevel = document.getElementById('add_priorityLevel')?.value;
	const priorityColor = document.getElementById('add_priorityColor')?.value;
	
	console.log('新增优先级表单数据:', {
		priorityKey, priorityName, priorityDesc, priorityLevel, priorityColor
	});
	
	if (!priorityKey) {
		showErrorMessage('请输入优先级Key');
		return;
	}
	if (!priorityName) {
		showErrorMessage('请输入优先级名称');
		return;
	}
	if (!priorityLevel) {
		showErrorMessage('请输入优先级等级');
		return;
	}
	
	const createData = {
		priorityKey: priorityKey,
		priorityName: priorityName,
		priorityDesc: priorityDesc,
		priorityLevel: parseInt(priorityLevel),
		colorCode: priorityColor,
		isActive: true
	};
	
	console.log('发送到后端的新增数据:', createData);
	
	try {
		const response = await fetch('/api/ticket/config/priority', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(createData)
		});
		
		console.log('新增优先级API响应状态:', response.status);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('新增优先级API错误响应:', errorText);
			showErrorMessage(`服务器错误 (${response.status}): ${errorText}`);
			return;
		}
		
		const result = await response.json();
		console.log('新增优先级API响应结果:', result);
		
		if (result.success || result.code === 200) {
			showSuccessMessage('优先级创建成功！');
			closeAddPriorityModal();
			await loadPriorityConfig();
		} else {
			showErrorMessage(result.message || '创建优先级失败');
		}
	} catch (error) {
		console.error('创建优先级失败:', error);
		showErrorMessage('创建优先级失败，请重试');
	}
}

// 保存优先级配置
function savePrioritiesConfig() {
    console.log('保存优先级配置');
    
    // 收集优先级数据
    const priorityItems = document.querySelectorAll('.priority-item');
    const priorities = [];
    
    priorityItems.forEach(item => {
        const priority = item.getAttribute('data-priority');
        const dbValue = item.getAttribute('data-db-value');
        const name = item.querySelector('.priority-name').textContent;
        const desc = item.querySelector('.priority-desc').textContent;
        const sla = item.querySelector('.priority-sla').textContent;
        const color = item.querySelector('.priority-color').style.backgroundColor;
        
        priorities.push({
            priority: priority,
            dbValue: dbValue,
            name: name,
            description: desc,
            sla: sla,
            color: color
        });
    });
    
    console.log('优先级数据:', priorities);
    
    // 模拟发送到后端保存到ops_ticket表的priority字段
}

// 编辑优先级
async function editPriority(priorityKey) {
    console.log('编辑优先级:', priorityKey);
    
    try {
        // 直接从后端API获取准确的优先级数据
        const response = await fetch('/api/ticket/config/priority');
        const result = await response.json();
        
        if (!result || (result.code !== 200 && !result.success)) {
            showErrorMessage('获取优先级数据失败');
            return;
        }
        
        const priorityData = result.data.find(p => p.priorityKey === priorityKey);
        if (!priorityData) {
            showErrorMessage('未找到指定的优先级数据');
            return;
        }
        
        console.log('从后端获取的优先级数据:', priorityData);
        
        // 构造编辑数据
        const editData = {
            key: priorityData.priorityKey,
            name: priorityData.priorityName,
            desc: priorityData.description || '',
            level: priorityData.priorityLevel,
            sla: '24', // 默认值
            color: priorityData.colorCode || '#3498db',
            dbId: priorityData.id
        };
        
        console.log('构造的编辑数据:', editData);
        showEditPriorityModal(editData);
        
    } catch (error) {
        console.error('获取优先级数据失败:', error);
        showErrorMessage('获取优先级数据失败，请重试');
    }
}

// 显示编辑优先级模态框
function showEditPriorityModal(priorityData) {
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal-overlay" id="editPriorityModal" style="display: flex;">
            <div class="modal-container" style="width: 500px;">
                <div class="modal-header">
                    <h3>编辑优先级</h3>
                    <button class="modal-close" onclick="closeEditPriorityModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editPriorityForm">
                        <input type="hidden" id="editPriorityKey" value="${priorityData.key}">
                        <input type="hidden" id="editPriorityDbId" value="${priorityData.dbId || ''}">
                        
                        <div class="form-group">
                            <label for="editPriorityKeyDisplay">优先级Key</label>
                            <input type="text" id="editPriorityKeyDisplay" class="form-control" 
                                   value="${priorityData.key}" readonly disabled 
                                   style="background-color: #e9ecef; cursor: not-allowed;">
                            <small class="form-text text-muted">系统唯一标识，创建后不可修改</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="editPriorityName">优先级名称 <span class="required">*</span></label>
                            <input type="text" id="editPriorityName" class="form-control" value="${priorityData.name}" required placeholder="如：P1, P2, 紧急等">
                        </div>
                        
                        <div class="form-group">
                            <label for="editPriorityDesc">优先级描述</label>
                            <textarea id="editPriorityDesc" class="form-control" rows="3" placeholder="请描述该优先级的含义和使用场景">${priorityData.desc}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editPriorityLevel">优先级等级 <span class="required">*</span></label>
                                <input type="number" id="editPriorityLevel" class="form-control" 
                                       min="1" max="999" placeholder="请输入优先级等级" required>
                                <small class="form-text text-muted">数字越小优先级越高</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="editPriorityColor">显示颜色</label>
                                <div class="color-picker-container">
                                    <input type="color" id="editPriorityColor" class="color-picker" value="${priorityData.color}">
                                    <div class="color-preview" style="background-color: ${priorityData.color};"></div>
                                    <span class="color-text">${priorityData.color}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeEditPriorityModal()">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitEditPriority()">保存</button>
                </div>
            </div>
        </div>
    `;
    
    // 移除已存在的模态框
    const existingModal = document.getElementById('editPriorityModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // 设置优先级等级的值
    const levelInput = document.getElementById('editPriorityLevel');
    if (levelInput && priorityData.level) {
        levelInput.value = priorityData.level;
    }
    
    // 绑定颜色选择器事件
    const colorPicker = document.getElementById('editPriorityColor');
    const colorPreview = document.querySelector('#editPriorityModal .color-preview');
    const colorText = document.querySelector('#editPriorityModal .color-text');
    
    if (colorPicker && colorPreview && colorText) {
        colorPicker.addEventListener('change', function() {
            colorPreview.style.backgroundColor = this.value;
            colorText.textContent = this.value;
        });
    }
}

// 关闭编辑优先级模态框
function closeEditPriorityModal() {
    const modal = document.getElementById('editPriorityModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
}

// 提交编辑优先级
async function submitEditPriority() {
    console.log('开始提交编辑优先级');
    const form = document.getElementById('editPriorityForm');
    
    // 获取表单数据
    const priorityKey = document.getElementById('editPriorityKey').value;
    const priorityDbId = document.getElementById('editPriorityDbId').value;
    const priorityName = document.getElementById('editPriorityName').value.trim();
    const priorityDesc = document.getElementById('editPriorityDesc').value.trim();
    const priorityLevel = document.getElementById('editPriorityLevel').value;
    const priorityColor = document.getElementById('editPriorityColor').value;
    
    console.log('表单数据:', {
        priorityKey, priorityDbId, priorityName, priorityDesc, 
        priorityLevel, priorityColor
    });
    
    // 验证必填字段
    if (!priorityName) {
        showErrorMessage('请输入优先级名称');
        return;
    }
    if (!priorityLevel) {
        showErrorMessage('请输入优先级等级');
        return;
    }
    
    // 构造更新数据
    const updateData = {
        id: priorityDbId ? parseInt(priorityDbId) : null,
        priorityKey: priorityKey,
        priorityName: priorityName,
        description: priorityDesc,
        priorityLevel: parseInt(priorityLevel),
        colorCode: priorityColor,
        isActive: true,  // 使用isActive字段，布尔值
        enabled: 1       // 同时保留enabled字段以兼容
    };
    
    console.log('发送到后端的数据:', updateData);
    console.log('优先级ID:', priorityDbId);
    
    // 检查ID是否有效
    if (!priorityDbId || priorityDbId.trim() === '') {
        showErrorMessage('无法获取优先级ID，请刷新页面后重试');
        return;
    }
    
    try {
        // 构造包含ID的URL
        const updateUrl = `/api/ticket/config/priority/${priorityDbId}`;
        console.log('更新URL:', updateUrl);
        
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            showErrorMessage(`服务器错误 (${response.status}): ${errorText}`);
            return;
        }
        
        const result = await response.json();
        console.log('API响应结果:', result);
        
        if (result.success || result.code === 200) {
            showSuccessMessage('优先级更新成功！');
            closeEditPriorityModal();
            
            // 重新加载优先级配置
            await loadPriorityConfig();
        } else {
            showErrorMessage(result.message || '更新优先级失败');
        }
        
    } catch (error) {
        console.error('更新优先级失败:', error);
        showErrorMessage('更新优先级失败，请重试');
    }
}

// 显示编辑模态框
function showEditModal() {
    const modal = document.getElementById('editPriorityModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 绑定颜色选择器事件
    bindColorPickerEvents();
    
    // 点击遮罩层关闭模态框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });
}

// 关闭编辑模态框
function closeEditModal() {
    const modal = document.getElementById('editPriorityModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 清空表单
    document.getElementById('editPriorityForm').reset();
    clearColorSelection();
}

// 绑定颜色选择器事件
function bindColorPickerEvents() {
    const colorOptions = document.querySelectorAll('.color-option');
    const customColorInput = document.getElementById('customColor');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            selectColor(color);
        });
    });
    
    customColorInput.addEventListener('change', function() {
        selectColor(this.value);
    });
}

// 选择颜色
function selectColor(color) {
    // 清除所有选中状态
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 设置选中状态
    const colorOption = document.querySelector(`[data-color="${color}"]`);
    if (colorOption) {
        colorOption.classList.add('selected');
    } else {
        // 自定义颜色
        document.getElementById('customColor').value = color;
    }
    
    // 保存选中的颜色
    window.selectedColor = color;
}

// 清除颜色选择
function clearColorSelection() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    window.selectedColor = null;
}

// 保存优先级编辑
function savePriorityEdit() {
    const priorityType = window.currentEditingPriority;
    if (!priorityType) return;
    
    // 获取表单数据
    const name = document.getElementById('priorityName').value.trim();
    const level = document.getElementById('priorityLevel').value;
    const desc = document.getElementById('priorityDesc').value.trim();
    const slaValue = document.getElementById('slaValue').value;
    const slaUnit = document.getElementById('slaUnit').value;
    const color = window.selectedColor;
    
    // 验证必填字段
    if (!name || !desc || !slaValue || !color) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 更新页面显示
    const priorityItem = document.querySelector(`[data-priority="${priorityType}"]`);
    if (priorityItem) {
        priorityItem.querySelector('.priority-name').textContent = name;
        priorityItem.querySelector('.priority-desc').textContent = `${getLevelText(level)} - ${desc}`;
        priorityItem.querySelector('.priority-sla').textContent = `响应时间: ${slaValue}${slaUnit}内`;
        priorityItem.querySelector('.priority-color').style.backgroundColor = color;
        priorityItem.setAttribute('data-db-value', level);
    }
    
    // 关闭模态框
    closeEditModal();
    
    // 显示成功消息
    showSuccessMessage('优先级更新成功！');
    
    console.log('优先级已更新:', {
        type: priorityType,
        name: name,
        level: level,
        description: desc,
        sla: `${slaValue}${slaUnit}`,
        color: color
    });
}

// 获取优先级等级文本
function getLevelText(level) {
    const levelMap = {
        'urgent': '紧急',
        'high': '高',
        'medium': '中',
        'low': '低',
        'lowest': '最低'
    };
    return levelMap[level] || level;
}

// 显示成功消息
function showSuccessMessage(message) {
    // 创建成功提示
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(successDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// 添加成功消息动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// ================================
// 工单类型设置功能
// ================================

// 编辑工单类型
function editTicketType(typeKey) {
    console.log('编辑工单类型:', typeKey);
    
    const typeItem = document.querySelector(`[data-type="${typeKey}"]`);
    if (typeItem) {
        // 获取当前数据
        const name = typeItem.querySelector('.type-setting-name').textContent;
        const desc = typeItem.querySelector('.type-setting-desc').textContent;
        const color = typeItem.querySelector('.type-setting-color').style.backgroundColor;
        
        // 填充表单数据
        document.getElementById('typeName').value = name;
        document.getElementById('typeDescription').value = desc;
        
        // 设置选中的颜色
        selectTypeColor(color);
        
        // 保存当前编辑的类型Key
        window.currentEditingType = typeKey;
        
        // 显示模态框
        showTypeEditModal();
    }
}

// 显示类型编辑模态框
function showTypeEditModal() {
    const modal = document.getElementById('editTypeModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 绑定颜色选择器事件
    bindTypeColorPickerEvents();
    
    // 点击遮罩层关闭模态框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTypeEditModal();
        }
    });
}

// 关闭类型编辑模态框
function closeTypeEditModal() {
    const modal = document.getElementById('editTypeModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 清空表单
    document.getElementById('editTypeForm').reset();
    clearTypeColorSelection();
}

// 绑定类型颜色选择器事件
function bindTypeColorPickerEvents() {
    const colorOptions = document.querySelectorAll('#editTypeModal .color-option');
    const customColorInput = document.getElementById('customTypeColor');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            selectTypeColor(color);
        });
    });
    
    customColorInput.addEventListener('change', function() {
        selectTypeColor(this.value);
    });
}

// 选择类型颜色
function selectTypeColor(color) {
    // 清除所有选中状态
    document.querySelectorAll('#editTypeModal .color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 设置选中状态
    const colorOption = document.querySelector(`#editTypeModal [data-color="${color}"]`);
    if (colorOption) {
        colorOption.classList.add('selected');
    } else {
        // 自定义颜色
        document.getElementById('customTypeColor').value = color;
    }
    
    // 保存选中的颜色
    window.selectedTypeColor = color;
}

// 清除类型颜色选择
function clearTypeColorSelection() {
    document.querySelectorAll('#editTypeModal .color-option').forEach(option => {
        option.classList.remove('selected');
    });
    window.selectedTypeColor = null;
}

// 保存类型编辑
function saveTypeEdit() {
    const typeKey = window.currentEditingType;
    if (!typeKey) return;
    
    // 获取表单数据
    const name = document.getElementById('typeName').value.trim();
    const description = document.getElementById('typeDescription').value.trim();
    const category = document.getElementById('typeCategory').value;
    const color = window.selectedTypeColor;
    
    // 验证必填字段
    if (!name || !description || !color) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 更新页面显示
    const typeItem = document.querySelector(`[data-type="${typeKey}"]`);
    if (typeItem) {
        typeItem.querySelector('.type-setting-name').textContent = name;
        typeItem.querySelector('.type-setting-desc').textContent = description;
        typeItem.querySelector('.type-setting-color').style.backgroundColor = color;
    }
    
    // 关闭模态框
    closeTypeEditModal();
    
    // 显示成功消息
    showSuccessMessage('工单类型更新成功！');
    
    console.log('工单类型已更新:', {
        key: typeKey,
        name: name,
        description: description,
        category: category,
        color: color
    });
}

// 删除工单类型
function deleteTicketType(typeKey) {
    console.log('删除工单类型:', typeKey);
    
    const typeItem = document.querySelector(`[data-type="${typeKey}"]`);
    if (typeItem) {
        const name = typeItem.querySelector('.type-setting-name').textContent;
        
        if (confirm(`确定要删除 "${name}" 类型吗？\n删除后将从数据库中移除该类型选项。`)) {
            typeItem.remove();
            showSuccessMessage('工单类型删除成功！');
            console.log(`工单类型 ${name} 已删除`);
        }
    }
}

// 新增工单类型
function addNewTicketType() {
    console.log('新增工单类型');
    
    // 清空表单
    document.getElementById('editTypeForm').reset();
    clearTypeColorSelection();
    
    // 设置默认颜色
    selectTypeColor('#6c757d');
    
    // 设置为新增模式
    window.currentEditingType = 'new';
    
    // 显示模态框
    showTypeEditModal();
}

// 修改保存类型编辑函数，支持新增模式
function saveTypeEdit() {
    const typeKey = window.currentEditingType;
    if (!typeKey) return;
    
    // 获取表单数据
    const name = document.getElementById('typeName').value.trim();
    const description = document.getElementById('typeDescription').value.trim();
    const category = document.getElementById('typeCategory').value;
    const color = window.selectedTypeColor;
    
    // 验证必填字段
    if (!name || !description || !color) {
        alert('请填写所有必填字段！');
        return;
    }
    
    if (typeKey === 'new') {
        // 新增模式
        const newTypeKey = 'custom_' + Date.now();
        const typeList = document.querySelector('.type-settings-list');
        
        const newTypeHtml = `
            <div class="type-setting-item" data-type="${newTypeKey}">
                <div class="type-setting-info">
                    <div class="type-setting-color" style="background-color: ${color};"></div>
                    <div class="type-setting-details">
                        <span class="type-setting-name">${name}</span>
                        <span class="type-setting-desc">${description}</span>
                    </div>
                </div>
                <div class="type-setting-actions">
                    <button class="btn-icon" title="编辑" onclick="editTicketType('${newTypeKey}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="删除" onclick="deleteTicketType('${newTypeKey}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        typeList.insertAdjacentHTML('beforeend', newTypeHtml);
        showSuccessMessage('新工单类型添加成功！');
    } else {
        // 编辑模式
        const typeItem = document.querySelector(`[data-type="${typeKey}"]`);
        if (typeItem) {
            typeItem.querySelector('.type-setting-name').textContent = name;
            typeItem.querySelector('.type-setting-desc').textContent = description;
            typeItem.querySelector('.type-setting-color').style.backgroundColor = color;
        }
        showSuccessMessage('工单类型更新成功！');
    }
    
    // 关闭模态框
    closeTypeEditModal();
    
    console.log('工单类型操作完成:', {
        mode: typeKey === 'new' ? 'add' : 'edit',
        key: typeKey,
        name: name,
        description: description,
        category: category,
        color: color
    });
}

// 保存工单类型配置
function saveTicketTypesConfig() {
    console.log('保存工单类型配置');
    
    const typeItems = document.querySelectorAll('.type-setting-item');
    const types = [];
    
    typeItems.forEach(item => {
        const typeKey = item.getAttribute('data-type');
        const isDefault = item.getAttribute('data-default') === 'true';
        const name = item.querySelector('.type-setting-name').textContent;
        const desc = item.querySelector('.type-setting-desc').textContent;
        const color = item.querySelector('.type-setting-color').style.backgroundColor;
        
        types.push({
            key: typeKey,
            name: name,
            description: desc,
            color: color,
            isDefault: isDefault
        });
    });
    
    console.log('工单类型数据:', types);
    
    // 模拟发送到后端保存到ops_ticket表的ticket_type字段
    showSuccessMessage('工单类型配置保存成功！\n数据将保存到ops_ticket表的ticket_type字段');
}

// ================================
// 工单来源设置功能
// ================================

// 编辑工单来源
function editTicketSource(sourceKey) {
    console.log('编辑工单来源:', sourceKey);
    
    const sourceItem = document.querySelector(`[data-source="${sourceKey}"]`);
    if (sourceItem) {
        // 获取当前数据
        const name = sourceItem.querySelector('.source-setting-name').textContent;
        const desc = sourceItem.querySelector('.source-setting-desc').textContent;
        const iconElement = sourceItem.querySelector('.source-setting-icon i');
        const currentIcon = iconElement ? iconElement.className : 'fas fa-plus';
        
        // 填充表单数据
        document.getElementById('sourceName').value = name;
        document.getElementById('sourceDescription').value = desc;
        
        // 设置选中的图标
        selectSourceIcon(currentIcon);
        
        // 保存当前编辑的来源Key
        window.currentEditingSource = sourceKey;
        
        // 显示模态框
        showSourceEditModal();
    }
}

// 显示来源编辑模态框
function showSourceEditModal() {
    const modal = document.getElementById('editSourceModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 绑定图标选择器事件
    bindSourceIconPickerEvents();
    
    // 点击遮罩层关闭模态框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeSourceEditModal();
        }
    });
}

// 关闭来源编辑模态框
function closeSourceEditModal() {
    const modal = document.getElementById('editSourceModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 清空表单
    document.getElementById('editSourceForm').reset();
    clearSourceIconSelection();
}

// 绑定来源图标选择器事件
function bindSourceIconPickerEvents() {
    const iconOptions = document.querySelectorAll('#editSourceModal .icon-option');
    
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            const icon = this.getAttribute('data-icon');
            selectSourceIcon(icon);
        });
    });
}

// 选择来源图标
function selectSourceIcon(iconClass) {
    // 清除所有选中状态
    document.querySelectorAll('#editSourceModal .icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 设置选中状态
    const iconOption = document.querySelector(`#editSourceModal [data-icon="${iconClass}"]`);
    if (iconOption) {
        iconOption.classList.add('selected');
    }
    
    // 保存选中的图标
    window.selectedSourceIcon = iconClass;
}

// 清除来源图标选择
function clearSourceIconSelection() {
    document.querySelectorAll('#editSourceModal .icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    window.selectedSourceIcon = null;
}

// 保存来源编辑
function saveSourceEdit() {
    const sourceKey = window.currentEditingSource;
    if (!sourceKey) return;
    
    // 获取表单数据
    const name = document.getElementById('sourceName').value.trim();
    const description = document.getElementById('sourceDescription').value.trim();
    const sourceType = document.getElementById('sourceType').value;
    const icon = window.selectedSourceIcon;
    
    // 验证必填字段
    if (!name || !description || !icon) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 更新页面显示
    const sourceItem = document.querySelector(`[data-source="${sourceKey}"]`);
    if (sourceItem) {
        sourceItem.querySelector('.source-setting-name').textContent = name;
        sourceItem.querySelector('.source-setting-desc').textContent = description;
        
        // 更新图标
        const iconElement = sourceItem.querySelector('.source-setting-icon i');
        if (iconElement) {
            iconElement.className = icon;
        }
    }
    
    // 关闭模态框
    closeSourceEditModal();
    
    // 显示成功消息
    showSuccessMessage('工单来源更新成功！');
    
    console.log('工单来源已更新:', {
        key: sourceKey,
        name: name,
        description: description,
        sourceType: sourceType,
        icon: icon
    });
}

// 删除工单来源
function deleteTicketSource(sourceKey) {
    console.log('删除工单来源:', sourceKey);
    
    const sourceItem = document.querySelector(`[data-source="${sourceKey}"]`);
    if (sourceItem) {
        const name = sourceItem.querySelector('.source-setting-name').textContent;
        
        if (confirm(`确定要删除 "${name}" 来源吗？\n删除后将从数据库中移除该来源选项。`)) {
            sourceItem.remove();
            showSuccessMessage('工单来源删除成功！');
            console.log(`工单来源 ${name} 已删除`);
        }
    }
}

// 新增工单来源
function addNewTicketSource() {
    console.log('新增工单来源');
    
    // 清空表单
    document.getElementById('editSourceForm').reset();
    clearSourceIconSelection();
    
    // 设置默认图标
    selectSourceIcon('fas fa-plus');
    
    // 设置为新增模式
    window.currentEditingSource = 'new';
    
    // 显示模态框
    showSourceEditModal();
}

// 修改保存来源编辑函数，支持新增模式
function saveSourceEdit() {
    const sourceKey = window.currentEditingSource;
    if (!sourceKey) return;
    
    // 获取表单数据
    const name = document.getElementById('sourceName').value.trim();
    const description = document.getElementById('sourceDescription').value.trim();
    const sourceType = document.getElementById('sourceType').value;
    const icon = window.selectedSourceIcon;
    
    // 验证必填字段
    if (!name || !description || !icon) {
        alert('请填写所有必填字段！');
        return;
    }
    
    if (sourceKey === 'new') {
        // 新增模式
        const newSourceKey = 'custom_' + Date.now();
        const sourceList = document.querySelector('.source-settings-list');
        
        const newSourceHtml = `
            <div class="source-setting-item" data-source="${newSourceKey}">
                <div class="source-setting-info">
                    <div class="source-setting-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="source-setting-details">
                        <span class="source-setting-name">${name}</span>
                        <span class="source-setting-desc">${description}</span>
                    </div>
                </div>
                <div class="source-setting-actions">
                    <button class="btn-icon" title="编辑" onclick="editTicketSource('${newSourceKey}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="删除" onclick="deleteTicketSource('${newSourceKey}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        sourceList.insertAdjacentHTML('beforeend', newSourceHtml);
        showSuccessMessage('新工单来源添加成功！');
    } else {
        // 编辑模式
        const sourceItem = document.querySelector(`[data-source="${sourceKey}"]`);
        if (sourceItem) {
            sourceItem.querySelector('.source-setting-name').textContent = name;
            sourceItem.querySelector('.source-setting-desc').textContent = description;
            
            // 更新图标
            const iconElement = sourceItem.querySelector('.source-setting-icon i');
            if (iconElement) {
                iconElement.className = icon;
            }
        }
        showSuccessMessage('工单来源更新成功！');
    }
    
    // 关闭模态框
    closeSourceEditModal();
    
    console.log('工单来源操作完成:', {
        mode: sourceKey === 'new' ? 'add' : 'edit',
        key: sourceKey,
        name: name,
        description: description,
        sourceType: sourceType,
        icon: icon
    });
}

// 保存工单来源配置
function saveTicketSourcesConfig() {
    console.log('保存工单来源配置');
    
    const sourceItems = document.querySelectorAll('.source-setting-item');
    const sources = [];
    
    sourceItems.forEach(item => {
        const sourceKey = item.getAttribute('data-source');
        const isDefault = item.getAttribute('data-default') === 'true';
        const name = item.querySelector('.source-setting-name').textContent;
        const desc = item.querySelector('.source-setting-desc').textContent;
        
        sources.push({
            key: sourceKey,
            name: name,
            description: desc,
            isDefault: isDefault
        });
    });
    
    console.log('工单来源数据:', sources);
    
    // 模拟发送到后端保存
    showSuccessMessage('工单来源配置保存成功！\n数据将保存到相关配置表');
}

// ================================
// 调试和测试函数
// ================================

// 测试子标签页切换功能
function testSubTabSwitch() {
    console.log('=== 测试子标签页切换功能 ===');
    
    // 测试切换到类型设置
    console.log('切换到类型设置...');
    switchConfigPanel('type-settings');
    
    setTimeout(() => {
        // 测试切换到来源设置
        console.log('切换到来源设置...');
        switchConfigPanel('source-settings');
        
        setTimeout(() => {
            // 切换回优先级设置
            console.log('切换回优先级设置...');
            switchConfigPanel('priority-levels');
        }, 1000);
    }, 1000);
}

// 重新初始化配置页面
function reinitConfigPage() {
    console.log('=== 重新初始化配置页面 ===');
    initConfigPage();
}

// 检查页面元素状态
function checkPageElements() {
    console.log('=== 检查页面元素状态 ===');
    
    const subTabs = document.querySelectorAll('.sub-tab-item');
    console.log('子标签页数量:', subTabs.length);
    subTabs.forEach((tab, index) => {
        console.log(`子标签页${index + 1}:`, tab.textContent, 'data-config:', tab.getAttribute('data-config'));
    });
    
    const panels = document.querySelectorAll('.config-panel');
    console.log('配置面板数量:', panels.length);
    panels.forEach((panel, index) => {
        console.log(`配置面板${index + 1}:`, panel.id, '是否激活:', panel.classList.contains('active'));
    });
}

// 测试完整的优先级加载流程
async function testPriorityLoad() {
    console.log('=== 开始测试优先级加载流程 ===');
    
    try {
        // 1. 清空当前列表
        const priorityList = document.querySelector('.priority-list');
        if (priorityList) {
            priorityList.innerHTML = '<p>正在加载...</p>';
        }
        
        // 2. 手动调用加载函数
        console.log('调用 loadPriorityConfig...');
        await loadPriorityConfig();
        
        // 3. 检查结果
        const items = document.querySelectorAll('.priority-item');
        console.log(`渲染完成，共 ${items.length} 个优先级项目`);
        
        items.forEach((item, index) => {
            const key = item.getAttribute('data-priority');
            const id = item.getAttribute('data-db-id');
            const name = item.querySelector('.priority-name')?.textContent;
            console.log(`${index + 1}. ${name} (key: ${key}, id: ${id})`);
        });
        
        console.log('=== 优先级加载测试完成 ===');
        
    } catch (error) {
        console.error('优先级加载测试失败:', error);
    }
}

// 将测试函数添加到全局作用域，方便在控制台调用
window.testSubTabSwitch = testSubTabSwitch;
window.reinitConfigPage = reinitConfigPage;
window.checkPageElements = checkPageElements;
window.addNewPriority = addNewPriority;
window.showAddPriorityModal = showAddPriorityModal;
window.testPriorityLoad = testPriorityLoad;
window.closeAddPriorityModal = closeAddPriorityModal;
window.submitAddPriority = submitAddPriority;
window.editPriority = editPriority;
window.deletePriority = deletePriority;

// ================================
// 工单管理页面功能
// ================================

// 初始化我的工单管理页面
function initMyTicketManagePage() {
    console.log('初始化我的工单管理页面');
    
    // 绑定筛选器事件
    bindTicketFilters();
    
    // 绑定工具栏事件
    bindMyTicketToolbar();
    
    // 绑定列表事件
    bindTicketListEvents();
    
    // 加载类型、优先级筛选下拉选项
    console.log('开始加载筛选下拉选项...');
    loadTypeFilterOptions();
    loadPriorityFilterOptions();
    
    // 加载我的工单数据
    loadMyTicketData();
}

// 加载“我的工单”页的类型筛选下拉选项
async function loadTypeFilterOptions() {
    console.log('🔄 开始加载类型筛选下拉选项...');
    try {
        const selectEl = document.getElementById('myTypeFilter');
        if (!selectEl) {
            console.warn('未找到 myTypeFilter 下拉框');
            return;
        }

        // 保留第一个"全部类型"选项，其余清空
        selectEl.innerHTML = '<option value="">全部类型</option>';

        console.log('📡 调用类型配置API...');
        const response = await fetch('/api/ticket/config/type');
        const result = await response.json();
        console.log('📋 类型API响应:', result);

        const isSuccess = result.success === true || result.code === 200;
        const data = result.data || [];

        if (!isSuccess || !Array.isArray(data)) {
            console.error('加载类型筛选数据失败:', result);
            return;
        }

        data
            .filter(t => t && t.typeKey && (t.isActive === undefined || t.isActive === true || t.isActive === 1) && (t.deleted !== 1 && t.deleted !== true))
            .forEach(t => {
                const option = document.createElement('option');
                option.value = t.typeKey;
                option.textContent = t.typeName || t.typeKey;
                selectEl.appendChild(option);
            });
    } catch (error) {
        console.error('加载类型筛选下拉选项出错:', error);
    }
}

// 加载“我的工单”页的优先级筛选下拉选项
async function loadPriorityFilterOptions() {
    console.log('🔄 开始加载优先级筛选下拉选项...');
    try {
        const selectEl = document.getElementById('myPriorityFilter');
        if (!selectEl) {
            console.warn('未找到 myPriorityFilter 下拉框');
            return;
        }

        // 保留第一个"全部优先级"选项，其余清空
        selectEl.innerHTML = '<option value="">全部优先级</option>';

        console.log('📡 调用优先级配置API...');
        const response = await fetch('/api/ticket/config/priority');
        const result = await response.json();
        console.log('📋 优先级API响应:', result);

        const isSuccess = result.success === true || result.code === 200;
        const data = result.data || [];

        if (!isSuccess || !Array.isArray(data)) {
            console.error('加载优先级筛选数据失败:', result);
            return;
        }

        data
            .filter(p => p && p.priorityKey && (p.isActive === undefined || p.isActive === true || p.isActive === 1) && (p.deleted !== 1 && p.deleted !== true))
            .sort((a, b) => {
                const la = typeof a.priorityLevel === 'number' ? a.priorityLevel : 999;
                const lb = typeof b.priorityLevel === 'number' ? b.priorityLevel : 999;
                return la - lb;
            })
            .forEach(p => {
                const option = document.createElement('option');
                option.value = p.priorityKey;
                // 文本优先使用 priorityName，例如 P1、P2
                option.textContent = p.priorityName || p.priorityKey;
                selectEl.appendChild(option);
            });
    } catch (error) {
        console.error('加载优先级筛选下拉选项出错:', error);
    }
}

// 初始化工单管理页面（通用）
function initTicketManagePage() {
    console.log('初始化工单管理页面');
    
    // 绑定筛选器事件
    bindTicketFilters();
    
    // 绑定工具栏事件
    bindTicketToolbar();
    
    // 绑定列表事件
    bindTicketListEvents();
    
    // 加载工单数据
    loadTicketData();
}

// 绑定筛选器事件
function bindTicketFilters() {
    // 移除自动触发的change事件，改为点击搜索按钮触发
    
    // 搜索按钮事件
    const searchBtn = document.getElementById('searchMyTicketsBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            console.log('点击搜索按钮');
            applyMyTicketFilter();
        });
    }
    
    // 重置按钮事件
    const resetBtn = document.getElementById('resetMyTicketsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('点击重置按钮');
            resetMyTicketFilter();
        });
    }
    
    // 搜索框回车事件
    const searchInput = document.getElementById('myTicketSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('搜索框回车');
                applyMyTicketFilter();
            }
        });
    }
}

// 绑定工具栏事件
function bindTicketToolbar() {
    // 新建工单
    const createBtn = document.getElementById('createTicketBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            createNewTicket();
        });
    }
    
    // 批量分配
    const batchAssignBtn = document.getElementById('batchAssignBtn');
    if (batchAssignBtn) {
        batchAssignBtn.addEventListener('click', function() {
            batchAssignTickets();
        });
    }
    
    // 批量关闭
    const batchCloseBtn = document.getElementById('batchCloseBtn');
    if (batchCloseBtn) {
        batchCloseBtn.addEventListener('click', function() {
            batchCloseTickets();
        });
    }
    
    // 导出
    const exportBtn = document.getElementById('exportTicketsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportTickets();
        });
    }
    
    // 刷新
    const refreshBtn = document.getElementById('refreshTicketsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshTickets();
        });
    }
}

// 绑定列表事件
function bindTicketListEvents() {
    // 全选复选框
    const selectAllCheckbox = document.getElementById('selectAllTickets');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleAllTickets(this.checked);
        });
    }
    
    // 单个复选框事件（委托）
    const listBody = document.getElementById('ticketListBody');
    if (listBody) {
        listBody.addEventListener('change', function(e) {
            if (e.target.classList.contains('ticket-checkbox')) {
                updateBatchButtons();
            }
        });
    }
}

// 应用我的工单筛选
function applyMyTicketFilter() {
    const filters = {
        status: document.getElementById('myStatusFilter')?.value || '',
        typeKey: document.getElementById('myTypeFilter')?.value || '',
        priorityKey: document.getElementById('myPriorityFilter')?.value || '',
        keyword: document.getElementById('myTicketSearch')?.value?.trim() || ''
    };
    
    console.log('应用我的工单筛选:', filters);
    loadMyTicketData(1, 20, filters);
}

// 重置我的工单筛选
function resetMyTicketFilter() {
    document.getElementById('myStatusFilter').value = '';
    document.getElementById('myTypeFilter').value = '';
    document.getElementById('myPriorityFilter').value = '';
    document.getElementById('myTicketSearch').value = '';
    
    console.log('重置我的工单筛选');
    loadMyTicketData(1, 20, {});
}

// 加载我的工单数据
async function loadMyTicketData(page = 1, size = 20, filters = {}) {
    console.log('加载我的工单数据', { page, size, filters });
    
    // 获取当前用户信息
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
        console.error('无法获取当前用户信息');
        showErrorMessage('请先登录');
        return;
    }
    
    const assigneeId = currentUser.id;
    console.log('当前用户ID:', assigneeId);
    
    try {
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('current', page);
        params.append('size', size);
        params.append('assigneeId', assigneeId);
        
        // 添加筛选参数
        if (filters.status) params.append('status', filters.status);
        if (filters.typeKey) params.append('typeKey', filters.typeKey);
        if (filters.priorityKey) params.append('priorityKey', filters.priorityKey);
        if (filters.keyword) params.append('keyword', filters.keyword);
        
        // 调用后端API获取我的工单
        const url = `/api/tickets/my?${params.toString()}`;
        console.log('请求URL:', url);
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('我的工单API响应:', result);
        
        if (result.success || result.code === 200) {
            const data = result.data;
            let tickets = [];
            
            // 兼容不同的数据结构
            if (Array.isArray(data)) {
                // 如果data直接是数组
                tickets = data;
            } else if (data && Array.isArray(data.records)) {
                // 如果data是对象且包含records数组
                tickets = data.records;
            } else if (data && Array.isArray(data.list)) {
                // 如果data是对象且包含list数组
                tickets = data.list;
            } else {
                console.warn('⚠️ 我的工单数据结构未知:', data);
                tickets = [];
            }
            
            console.log(`成功加载 ${tickets.length} 条我的工单`);
            
            // 渲染工单列表
            renderMyTicketList(tickets);
            
            // 更新分页信息（如果需要）
            updateMyTicketPagination(data);
        } else {
            console.error('加载我的工单失败:', result.message);
            showErrorMessage(result.message || '加载工单失败');
            renderMyTicketList([]); // 显示空列表
        }
    } catch (error) {
        console.error('加载我的工单时发生错误:', error);
        showErrorMessage('加载工单数据失败，请检查网络连接');
        renderMyTicketList([]); // 显示空列表
    }
    
    // 更新页面标题和提示信息
    updateMyTicketPageTitle();
}

// 加载工单数据（通用）
function loadTicketData() {
    console.log('加载工单数据');
    // 这里可以调用API加载数据
}

// 绑定我的工单工具栏事件
function bindMyTicketToolbar() {
    // 新建工单
    const createBtn = document.getElementById('createTicketBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            createNewTicket();
        });
    }
    
    // 批量操作 - 我的工单页面主要是处理和关闭
    const batchAssignBtn = document.getElementById('batchAssignBtn');
    if (batchAssignBtn) {
        // 在我的工单页面，这个按钮改为"标记为处理中"
        batchAssignBtn.innerHTML = '<i class="fas fa-play"></i> 开始处理';
        batchAssignBtn.addEventListener('click', function() {
            batchStartProcessing();
        });
    }
    
    const batchCloseBtn = document.getElementById('batchCloseBtn');
    if (batchCloseBtn) {
        // 改为"标记为完成"
        batchCloseBtn.innerHTML = '<i class="fas fa-check"></i> 标记完成';
        batchCloseBtn.addEventListener('click', function() {
            batchCompleteTickets();
        });
    }
    
    // 导出
    const exportBtn = document.getElementById('exportTicketsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportMyTickets();
        });
    }
    
    // 刷新
    const refreshBtn = document.getElementById('refreshTicketsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshMyTickets();
        });
    }
}

// 更新我的工单页面标题
function updateMyTicketPageTitle() {
    // 可以在页面上添加一些提示信息，说明这是当前用户需要处理的工单
    console.log('更新我的工单页面标题');
}

// 批量开始处理工单
function batchStartProcessing() {
    console.log('批量开始处理工单');
    const selectedTickets = getSelectedTickets();
    if (selectedTickets.length === 0) {
        alert('请先选择要处理的工单');
        return;
    }
    if (confirm(`确定要开始处理 ${selectedTickets.length} 个工单吗？`)) {
        // 这里调用API将工单状态改为"处理中"
        alert(`已开始处理 ${selectedTickets.length} 个工单`);
        loadMyTicketData(); // 重新加载数据
    }
}

// 批量完成工单
function batchCompleteTickets() {
    console.log('批量完成工单');
    const selectedTickets = getSelectedTickets();
    if (selectedTickets.length === 0) {
        alert('请先选择要完成的工单');
        return;
    }
    if (confirm(`确定要标记 ${selectedTickets.length} 个工单为已完成吗？`)) {
        // 这里调用API将工单状态改为"已完成"
        alert(`已完成 ${selectedTickets.length} 个工单`);
        loadMyTicketData(); // 重新加载数据
    }
}

// 导出我的工单
function exportMyTickets() {
    console.log('导出我的工单');
    alert('导出我的工单功能开发中...');
}

// 刷新我的工单
function refreshMyTickets() {
    console.log('刷新我的工单');
    loadMyTicketData();
    showSuccessMessage('我的工单数据已刷新');
}

// 创建新工单
function createNewTicket() {
    console.log('创建新工单');
    showCreateTicketModal();
}

// 显示创建工单模态框
function showCreateTicketModal() {
    // 先加载配置数据
    loadTicketConfigs().then(() => {
        const modal = document.getElementById('createTicketModal');
        if (!modal) {
            createTicketModalHTML();
        }
        document.getElementById('createTicketModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// 创建工单模态框HTML
function createTicketModalHTML() {
    const modalHTML = `
        <div class="modal-overlay" id="createTicketModal" style="display: none;">
            <div class="modal-container" style="width: 600px;">
                <div class="modal-header">
                    <h3>新建工单</h3>
                    <button class="modal-close" onclick="closeCreateTicketModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="createTicketForm">
                        <div class="form-group">
                            <label for="ticketTitle">工单标题 <span class="required">*</span></label>
                            <input type="text" id="ticketTitle" class="form-control" required placeholder="请输入工单标题">
                        </div>
                        
                        <div class="form-group">
                            <label for="ticketDescription">工单描述</label>
                            <textarea id="ticketDescription" class="form-control" rows="4" placeholder="请详细描述工单内容..."></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ticketPriority">优先级 <span class="required">*</span></label>
                                <select id="ticketPriority" class="form-control" required>
                                    <option value="">请选择优先级</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="ticketType">工单类型 <span class="required">*</span></label>
                                <select id="ticketType" class="form-control" required>
                                    <option value="">请选择类型</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ticketSource">来源 <span class="required">*</span></label>
                                <select id="ticketSource" class="form-control" required>
                                    <option value="">请选择来源</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="ticketCreator">创建人 <span class="required">*</span></label>
                                <select id="ticketCreator" class="form-control" required>
                                    <option value="">请选择创建人</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="expectedDate">期望完成时间</label>
                            <input type="datetime-local" id="expectedDate" class="form-control">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeCreateTicketModal()">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitCreateTicket()">创建工单</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 加载工单配置数据
async function loadTicketConfigs() {
    try {
        // 加载优先级配置
        const priorityResponse = await fetch('/api/ticket/config/priority');
        const priorityData = await priorityResponse.json();
        if (priorityData.success) {
            populateSelect('ticketPriority', priorityData.data, 'id', 'priorityName');
        }
        
        // 加载类型配置
        const typeResponse = await fetch('/api/ticket/config/type');
        const typeData = await typeResponse.json();
        if (typeData.success || typeData.code === 200) {
            populateSelect('ticketType', typeData.data, 'id', 'typeName');
        }
        
        // 加载来源配置
        const sourceResponse = await fetch('/api/ticket/config/source');
        const sourceData = await sourceResponse.json();
        if (sourceData.success || sourceData.code === 200) {
            populateSelect('ticketSource', sourceData.data, 'id', 'sourceName');
        }
        
        // 加载用户列表
        const userResponse = await fetch('/api/users/list');
        const userData = await userResponse.json();
        if (userData.success) {
            populateSelect('ticketCreator', userData.data, 'id', 'realName');
        }
        
    } catch (error) {
        console.error('加载配置数据失败:', error);
        showErrorMessage('加载配置数据失败，请刷新页面重试');
    }
}

// 填充下拉选择框
function populateSelect(selectId, data, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select || !data) return;
    
    // 清空现有选项（保留第一个默认选项）
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    // 添加数据选项
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
}

// 关闭创建工单模态框
function closeCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 清空表单
    document.getElementById('createTicketForm').reset();
}

// 提交创建工单
async function submitCreateTicket() {
    const form = document.getElementById('createTicketForm');
    const formData = new FormData(form);
    
    // 验证必填字段
    const title = document.getElementById('ticketTitle').value.trim();
    const priorityId = document.getElementById('ticketPriority').value;
    const typeId = document.getElementById('ticketType').value;
    const sourceId = document.getElementById('ticketSource').value;
    const creatorId = document.getElementById('ticketCreator').value;
    
    if (!title) {
        showErrorMessage('请输入工单标题');
        return;
    }
    if (!priorityId) {
        showErrorMessage('请选择优先级');
        return;
    }
    if (!typeId) {
        showErrorMessage('请选择工单类型');
        return;
    }
    if (!sourceId) {
        showErrorMessage('请选择来源');
        return;
    }
    if (!creatorId) {
        showErrorMessage('请选择创建人');
        return;
    }
    
    const ticketData = {
        title: title,
        description: document.getElementById('ticketDescription').value.trim(),
        priorityId: parseInt(priorityId),
        typeId: parseInt(typeId),
        sourceId: parseInt(sourceId),
        creatorId: parseInt(creatorId),
        expectedDate: document.getElementById('expectedDate').value || null
    };
    
    try {
        const response = await fetch('/api/tickets/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessMessage('工单创建成功！');
            closeCreateTicketModal();
            
            // 刷新当前页面数据
            const currentTab = document.querySelector('.tab-item.active').textContent.trim();
            if (currentTab === '派发') {
                loadUnassignedTicketData();
            }
        } else {
            showErrorMessage(result.message || '创建工单失败');
        }
        
    } catch (error) {
        console.error('创建工单失败:', error);
        showErrorMessage('创建工单失败，请重试');
    }
}

// 查看工单详情
function viewTicket(ticketId) {
    console.log('查看工单详情:', ticketId);
    alert(`查看工单 ${ticketId} 详情`);
}

// 编辑工单
function editTicket(ticketId) {
    console.log('编辑工单:', ticketId);
    alert(`编辑工单 ${ticketId}`);
}

// 批量分配工单
function batchAssignTickets() {
    console.log('批量分配工单');
    const selectedTickets = getSelectedTickets();
    if (selectedTickets.length === 0) {
        alert('请先选择要分配的工单');
        return;
    }
    alert(`批量分配 ${selectedTickets.length} 个工单`);
}

// 批量关闭工单
function batchCloseTickets() {
    console.log('批量关闭工单');
    const selectedTickets = getSelectedTickets();
    if (selectedTickets.length === 0) {
        alert('请先选择要关闭的工单');
        return;
    }
    if (confirm(`确定要关闭 ${selectedTickets.length} 个工单吗？`)) {
        alert('批量关闭成功');
    }
}

// 导出工单
function exportTickets() {
    console.log('导出工单');
    alert('导出工单功能开发中...');
}

// 刷新工单
function refreshTickets() {
    console.log('刷新工单');
    loadTicketData();
    showSuccessMessage('工单数据已刷新');
}

// 全选/取消全选
function toggleAllTickets(checked) {
    const checkboxes = document.querySelectorAll('.ticket-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateBatchButtons();
}

// 获取选中的工单
function getSelectedTickets() {
    console.log('🔍 获取选中的工单...');
    
    // 修正选择器：使用实际的复选框类名和工单行结构
    const checkboxes = document.querySelectorAll('table tbody tr input[type="checkbox"]:checked');
    console.log('📋 找到选中的复选框数量:', checkboxes.length);
    
    const ticketIds = Array.from(checkboxes).map(checkbox => {
        const row = checkbox.closest('tr');
        const ticketId = row ? row.getAttribute('data-ticket-id') : null;
        console.log('📋 获取到工单ID:', ticketId);
        return ticketId;
    }).filter(id => id !== null); // 过滤掉null值
    
    console.log('📋 最终工单ID数组:', ticketIds);
    return ticketIds;
}

// 更新批量操作按钮状态
function updateBatchButtons() {
    const selectedCount = getSelectedTickets().length;
    const batchAssignBtn = document.getElementById('batchAssignBtn');
    const batchCloseBtn = document.getElementById('batchCloseBtn');
    
    if (batchAssignBtn) {
        batchAssignBtn.disabled = selectedCount === 0;
    }
    if (batchCloseBtn) {
        batchCloseBtn.disabled = selectedCount === 0;
    }
}

// ================================
// 上传页面功能
// ================================

// 初始化上传页面
function initUploadPage() {
    console.log('初始化上传页面');
    
    // 绑定上传类型选择事件
    bindUploadTypeEvents();
    
    // 绑定文件上传事件
    bindFileUploadEvents();
    
    // 加载上传历史
    if (typeof loadUploadHistory === 'function') {
        loadUploadHistory();
    }
}

// 绑定上传类型选择事件
function bindUploadTypeEvents() {
    const typeCards = document.querySelectorAll('.upload-type-card');
    
    typeCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有激活状态
            typeCards.forEach(c => c.classList.remove('active'));
            
            // 激活当前选中的类型
            this.classList.add('active');
            
            const uploadType = this.getAttribute('data-type');
            console.log('选择上传类型:', uploadType);
            
            // 更新文件接受类型
            updateFileAcceptTypes(uploadType);
        });
    });
}

// 绑定文件上传事件
function bindFileUploadEvents() {
    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectFilesBtn');
    
    // 点击选择文件
    if (selectBtn && fileInput) {
        selectBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // 点击拖拽区域选择文件
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // 文件选择事件
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleFileSelection(this.files);
        });
    }
    
    // 拖拽事件
    if (dropzone) {
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            handleFileSelection(e.dataTransfer.files);
        });
    }
}

// 更新文件接受类型
function updateFileAcceptTypes(uploadType) {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) return;
    
    const acceptTypes = {
        'tickets': '.xlsx,.csv',
        'reports': '.xlsx,.csv,.json',
        'scripts': '.sh,.py,.js',
        'configs': '.json,.xml,.yml,.yaml,.conf'
    };
    
    fileInput.accept = acceptTypes[uploadType] || '.xlsx,.csv,.json,.sql,.sh,.py';
    console.log('更新文件类型限制:', fileInput.accept);
}

// 处理文件选择
function handleFileSelection(files) {
    console.log('选择了文件:', files);
    
    Array.from(files).forEach(file => {
        console.log(`文件: ${file.name}, 大小: ${file.size}, 类型: ${file.type}`);
        
        // 验证文件大小（50MB限制）
        if (file.size > 50 * 1024 * 1024) {
            alert(`文件 ${file.name} 超过50MB限制`);
            return;
        }
        
        // 添加到上传队列
        addToUploadQueue(file);
        
        // 开始上传
        startFileUpload(file);
    });
}

// 添加到上传队列
function addToUploadQueue(file) {
    const progressList = document.getElementById('uploadProgressList');
    if (!progressList) return;
    
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    
    const progressItemHtml = `
        <div class="upload-progress-item" id="${fileId}">
            <div class="file-info">
                <div class="file-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <div class="progress-info">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%;"></div>
                </div>
                <div class="progress-text">0%</div>
            </div>
            <div class="upload-status">
                <span class="status-uploading">
                    <i class="fas fa-spinner fa-spin"></i>
                    准备中
                </span>
            </div>
        </div>
    `;
    
    progressList.insertAdjacentHTML('beforeend', progressItemHtml);
}

// 开始文件上传
async function startFileUpload(file) {
    console.log('开始上传文件:', file.name);
    
    const fileId = 'file_' + Date.now();
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // 获取当前用户ID
    const currentUser = getCurrentUser();
    console.log('当前用户:', currentUser);
    
    if (!currentUser || !currentUser.id) {
        showErrorMessage('无法获取用户信息，请刷新页面重试');
        return;
    }
    formData.append('creatorId', currentUser.id);
    
    try {
        // 显示上传进度
        const progressItem = document.getElementById(fileId);
        
        // 调用上传API（注意加上/api前缀）
        const response = await fetch('/api/tickets/import/file', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('上传结果:', result);
        
        if (result.success || result.code === 200) {
            // 上传成功
            completeUpload(fileId, true, result.data);
            
            // 显示详细结果
            const data = result.data || result;
            let message = `文件上传成功！共导入 ${data.totalCount} 条，成功 ${data.successCount} 条，失败 ${data.failCount} 条`;
            
            // 如果有失败记录，显示失败原因
            if (data.failedRecords && data.failedRecords.length > 0) {
                console.error('失败记录:', data.failedRecords);
                message += '\n\n失败详情：\n';
                data.failedRecords.forEach(record => {
                    message += `第${record.rowNumber}行: ${record.title} - ${record.reason}\n`;
                });
            }
            
            if (data.failCount > 0) {
                showErrorMessage(message);
            } else {
                showSuccessMessage(message);
            }
            
            // 刷新上传历史
            loadUploadHistory();
        } else {
            // 上传失败
            console.error('上传失败:', result);
            completeUpload(fileId, false, result.message);
            showErrorMessage(result.message || '上传失败');
        }
    } catch (error) {
        console.error('上传文件失败:', error);
        completeUpload(fileId, false, '网络错误');
        showErrorMessage('上传失败：' + error.message);
    }
}

// 模拟上传进度
function simulateUploadProgress(file) {
    const fileId = 'file_' + Date.now();
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        updateUploadProgress(fileId, progress);
        
        if (progress >= 100) {
            clearInterval(interval);
            completeUpload(fileId);
        }
    }, 500);
}

// 更新上传进度
function updateUploadProgress(fileId, progress) {
    const progressItem = document.getElementById(fileId);
    if (!progressItem) return;
    
    const progressFill = progressItem.querySelector('.progress-fill');
    const progressText = progressItem.querySelector('.progress-text');
    const statusSpan = progressItem.querySelector('.upload-status span');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(progress) + '%';
    }
    if (statusSpan) {
        statusSpan.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            上传中
        `;
    }
}

// 完成上传
function completeUpload(fileId, success = true, data = null) {
    const progressItem = document.getElementById(fileId);
    if (!progressItem) return;
    
    const progressFill = progressItem.querySelector('.progress-fill');
    const progressText = progressItem.querySelector('.progress-text');
    const statusSpan = progressItem.querySelector('.upload-status span');
    
    if (success) {
        // 成功
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = '100%';
        
        if (statusSpan) {
            statusSpan.className = 'status-success';
            if (data && data.totalCount !== undefined) {
                statusSpan.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    完成 (成功: ${data.successCount}/${data.totalCount})
                `;
            } else {
                statusSpan.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    完成
                `;
            }
        }
    } else {
        // 失败
        if (statusSpan) {
            statusSpan.className = 'status-error';
            statusSpan.innerHTML = `
                <i class="fas fa-times-circle"></i>
                失败${data ? ': ' + data : ''}
            `;
        }
    }
}

// 获取文件图标
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'xlsx': 'fas fa-file-excel',
        'xls': 'fas fa-file-excel',
        'csv': 'fas fa-file-csv',
        'json': 'fas fa-file-code',
        'sql': 'fas fa-database',
        'sh': 'fas fa-terminal',
        'py': 'fas fa-file-code',
        'js': 'fas fa-file-code'
    };
    
    return iconMap[ext] || 'fas fa-file';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ================================
// 未派发页面功能
// ================================

// 初始化未派发页面
function initUnassignedPage() {
    console.log('初始化未派发页面');
    
    // 加载筛选选项（类型和优先级）
    loadUnassignedFilterOptions();
    
    // 绑定筛选器事件
    bindUnassignedFilters();
    
    // 绑定工具栏事件
    bindUnassignedToolbar();
    
    // 绑定列表事件
    bindUnassignedListEvents();
    
    // 加载未派发工单数据
    loadUnassignedTicketData();
}

// 绑定未派发筛选器事件
function bindUnassignedFilters() {
    // 筛选按钮
    const applyBtn = document.getElementById('applyUnassignedFilter');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyUnassignedFilter);
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('resetUnassignedFilter');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetUnassignedFilter);
    }
    
    // 日期输入变更
    const dateInput = document.getElementById('unassignedDateFilter');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            console.log('创建日期筛选变更:', this.value);
        });
    }
    
    // 搜索框回车键触发搜索
    const keywordInput = document.getElementById('unassignedKeywordFilter');
    if (keywordInput) {
        keywordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('回车触发搜索');
                applyUnassignedFilter();
            }
        });
    }
}

// 绑定未派发工具栏事件
function bindUnassignedToolbar() {
    // 新建工单
    const createBtn = document.getElementById('createNewTicketBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            console.log('新建工单');
            showCreateTicketModal();
        });
    }
    
    // 批量派发
    const batchAssignBtn = document.getElementById('batchAssignTicketsBtn');
    if (batchAssignBtn) {
        batchAssignBtn.addEventListener('click', function() {
            batchAssignUnassignedTickets();
        });
    }
    
    // 导出
    const exportBtn = document.getElementById('exportUnassignedBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportUnassignedTickets();
        });
    }
    
    // 刷新
    const refreshBtn = document.getElementById('refreshUnassignedBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshUnassignedTickets();
        });
    }
}

// 绑定未派发列表事件
function bindUnassignedListEvents() {
    // 全选复选框
    const selectAllCheckbox = document.getElementById('selectAllUnassigned');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleAllUnassignedTickets(this.checked);
        });
    }
    
    // 单个复选框事件（委托）
    const listBody = document.getElementById('unassignedListBody');
    if (listBody) {
        listBody.addEventListener('change', function(e) {
            if (e.target.classList.contains('unassigned-checkbox')) {
                updateUnassignedBatchButtons();
            }
        });
    }
}

// 加载派发工单数据（显示所有工单，包括已派发的）
async function loadUnassignedTicketData(page = 1, size = 50, filters = {}) {
    console.log('📋 加载派发工单数据（包括所有状态）', { page, size, filters });
    
    try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            showErrorMessage('无法获取用户信息，请刷新页面重试');
            return;
        }
        
        // 构建查询参数 - 使用 /list 接口获取所有工单
        const params = new URLSearchParams();
        params.append('current', page);
        params.append('size', size);
        
        // 添加筛选参数
        if (filters.typeKey) params.append('typeKey', filters.typeKey);
        if (filters.priorityKey) params.append('priorityKey', filters.priorityKey);
        if (filters.status) params.append('status', filters.status);
        if (filters.createdDate) params.append('createdDate', filters.createdDate);
        if (filters.keyword) params.append('keyword', filters.keyword);
        
        // 修改为获取所有工单的接口
        const url = `/api/tickets/list?${params.toString()}`;
        console.log('✅ 请求URL（显示所有工单）:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📥 API响应（所有工单）:', result);
        
        if (result.success || result.code === 200) {
            const data = result.data;
            let records = [];
            
            // 兼容不同的数据结构
            if (Array.isArray(data)) {
                // 如果data直接是数组
                records = data;
            } else if (data && Array.isArray(data.records)) {
                // 如果data是对象且包含records数组
                records = data.records;
            } else if (data && Array.isArray(data.list)) {
                // 如果data是对象且包含list数组
                records = data.list;
            } else {
                console.warn('⚠️ 未知的数据结构:', data);
                records = [];
            }
            
            console.log(`✅ 接收到 ${records.length} 个工单（所有状态）`);
            
            // 如果有筛选条件但没有结果，显示提示
            if (records.length === 0 && (filters.typeKey || filters.priorityKey || filters.createdDate)) {
                console.warn('筛选条件未匹配到任何工单');
                showErrorMessage('未找到符合筛选条件的工单');
            }
            
            renderUnassignedTickets(records);
            renderUnassignedPagination(data);
        } else {
            showErrorMessage(result.message || '加载失败');
        }
    } catch (error) {
        console.error('❌ 加载派发工单失败:', error);
        showErrorMessage('加载失败：' + error.message);
    }
}

// 加载筛选选项（类型和优先级）
async function loadUnassignedFilterOptions() {
    try {
        // 加载类型选项
        const typeResponse = await fetch('/api/ticket/config/type');
        const typeResult = await typeResponse.json();
        if (typeResult.success || typeResult.code === 200) {
            const typeSelect = document.getElementById('unassignedTypeFilter');
            if (typeSelect) {
                let options = '<option value="">全部类型</option>';
                (typeResult.data || []).forEach(type => {
                    options += `<option value="${type.typeKey}">${type.typeName}</option>`;
                });
                typeSelect.innerHTML = options;
            }
        }
        
        // 加载优先级选项
        const priorityResponse = await fetch('/api/ticket/config/priority');
        const priorityResult = await priorityResponse.json();
        if (priorityResult.success || priorityResult.code === 200) {
            const prioritySelect = document.getElementById('unassignedPriorityFilter');
            if (prioritySelect) {
                let options = '<option value="">全部优先级</option>';
                (priorityResult.data || []).forEach(priority => {
                    options += `<option value="${priority.priorityKey}">${priority.priorityName}</option>`;
                });
                prioritySelect.innerHTML = options;
            }
        }
        
        console.log('✅ 筛选选项加载完成');
    } catch (error) {
        console.error('加载筛选选项失败:', error);
    }
}

// 应用筛选（搜索）
function applyUnassignedFilter() {
    const filters = {
        typeKey: document.getElementById('unassignedTypeFilter')?.value || '',
        priorityKey: document.getElementById('unassignedPriorityFilter')?.value || '',
        status: document.getElementById('unassignedStatusFilter')?.value || '',
        createdDate: document.getElementById('unassignedDateFilter')?.value || '',
        keyword: document.getElementById('unassignedKeywordFilter')?.value?.trim() || ''
    };
    
    console.log('应用筛选/搜索:', filters);
    loadUnassignedTicketData(1, 20, filters);
}

// 重置筛选
function resetUnassignedFilter() {
    document.getElementById('unassignedTypeFilter').value = '';
    document.getElementById('unassignedPriorityFilter').value = '';
    document.getElementById('unassignedStatusFilter').value = '';
    document.getElementById('unassignedDateFilter').value = '';
    document.getElementById('unassignedKeywordFilter').value = '';
    
    console.log('重置筛选');
    loadUnassignedTicketData(1, 20, {});
}

// 筛选未派发工单
function filterUnassignedTickets() {
    console.log('筛选未派发工单');
    // 实现筛选逻辑
}

// 搜索未派发工单
function searchUnassignedTickets(query) {
    console.log('搜索未派发工单:', query);
    // 实现搜索逻辑
}

// 全选/取消全选未派发工单
function toggleAllUnassignedTickets(checked) {
    const checkboxes = document.querySelectorAll('.unassigned-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateUnassignedBatchButtons();
}

// 获取选中的未派发工单
function getSelectedUnassignedTickets() {
    console.log('🔍 获取选中的未派发工单...');
    
    const checkboxes = document.querySelectorAll('.unassigned-checkbox:checked');
    console.log('📋 找到选中的复选框数量:', checkboxes.length);
    
    const ticketIds = Array.from(checkboxes).map(checkbox => {
        console.log('📋 处理复选框:', checkbox);
        
        // 派发页面使用表格结构，查找最近的tr元素
        const ticketRow = checkbox.closest('tr');
        console.log('📋 找到的工单行:', ticketRow);
        
        if (ticketRow) {
            const ticketId = ticketRow.getAttribute('data-ticket-id') || checkbox.value;
            console.log('📋 获取到工单ID:', ticketId);
            return ticketId;
        }
        console.log('📋 未找到工单行，返回null');
        return null;
    }).filter(id => id !== null); // 过滤掉null值
    
    console.log('📋 最终未派发工单ID数组:', ticketIds);
    return ticketIds;
}

// 更新未派发批量操作按钮状态
function updateUnassignedBatchButtons() {
    const selectedCount = getSelectedUnassignedTickets().length;
    const batchAssignBtn = document.getElementById('batchAssignTicketsBtn');
    
    if (batchAssignBtn) {
        batchAssignBtn.disabled = selectedCount === 0;
    }
}

// 渲染派发工单列表（显示所有工单）
function renderUnassignedTickets(tickets) {
    const listBody = document.getElementById('unassignedListBody');
    if (!listBody) return;
    
    console.log('=== 📋 前端收到的派发工单数据（所有状态） ===');
    console.log('工单总数:', tickets ? tickets.length : 0);
    if (tickets && tickets.length > 0) {
        console.log('前5条工单的派发状态:');
        tickets.slice(0, 5).forEach((ticket, index) => {
            const status = ticket.assigneeId ? '已派发' : '待派发';
            console.log(`  [${index + 1}] ID:${ticket.id}, 编号:${ticket.ticketNo}, 状态:${status}, 处理人ID:${ticket.assigneeId || '无'}, 处理人:${ticket.assigneeName || '无'}`);
        });
    }
    console.log('====================================');
    
    if (!tickets || tickets.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="12" class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <p style="color: #999; font-size: 16px;">暂无工单数据</p>
                </td>
            </tr>`;
        return;
    }
    
    listBody.innerHTML = tickets.map(ticket => {
        const priorityInfo = getPriorityInfo(ticket.priorityKey);
        const typeInfo = getTypeInfo(ticket.typeKey);
        const statusInfo = getStatusInfo(ticket.status);
        
        const deviceHtml = ticket.deviceName ? 
            `<a href="javascript:void(0)" class="device-link" onclick="jumpToAssetPage('${ticket.deviceName}')" title="点击跳转到资产管理">
                <i class="fas fa-server"></i> ${ticket.deviceName}
            </a>` : 
            '<span style="color: #ccc;">-</span>';
        
        // 获取当前用户，判断是否显示删除按钮
        const currentUser = getCurrentUser();
        const canDelete = currentUser && ticket.creatorId && String(currentUser.id) === String(ticket.creatorId);
        
        const deleteButton = canDelete ? 
            `<button class="btn-icon btn-delete" onclick="deleteTicket(${ticket.id})" title="删除">
                <i class="fas fa-trash"></i>
            </button>` : '';
        
        // 已解决或已关闭的工单不显示派发按钮
        const isCompleted = ['resolved', 'closed', 'completed'].includes(ticket.status);
        const assignButton = isCompleted ? '' :
            `<button class="btn-icon btn-assign" onclick="assignSingleTicket(${ticket.id})" title="派发">
                <i class="fas fa-user-plus"></i>
            </button>`;
        
        return `
        <tr data-ticket-id="${ticket.id}">
            <td><input type="checkbox" class="unassigned-checkbox" value="${ticket.id}" ${isCompleted ? 'disabled title="已完成的工单无需派发"' : ''}></td>
            <td><span class="ticket-number">${ticket.ticketNo || '#' + ticket.id}</span></td>
            <td><span class="ticket-title">${ticket.title}</span></td>
            <td>
                <span class="badge badge-type" style="background-color: ${typeInfo.color}15; color: ${typeInfo.color};">
                    ${typeInfo.name}
                </span>
            </td>
            <td>
                <span class="badge badge-priority" style="background-color: ${priorityInfo.color}15; color: ${priorityInfo.color};">
                    ${priorityInfo.name}
                </span>
            </td>
            <td>
                <span class="badge badge-status" style="background-color: ${statusInfo.color}15; color: ${statusInfo.color};">
                    ${statusInfo.name}
                </span>
            </td>
            <td>${ticket.creatorName || '未知'}</td>
            <td>${ticket.assigneeId || '-'}</td>
            <td>${ticket.assigneeName || '-'}</td>
            <td>${deviceHtml}</td>
            <td>${formatDateTime(ticket.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewUnassignedTicket(${ticket.id})" title="查看">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editUnassignedTicket(${ticket.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${assignButton}
                    ${deleteButton}
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// 获取优先级信息（包括颜色）
function getPriorityInfo(key) {
    const priorityMap = {
        'urgent': { name: '紧急', color: '#f5222d' },
        'high': { name: '高', color: '#fa8c16' },
        'medium': { name: '中', color: '#1890ff' },
        'low': { name: '低', color: '#52c41a' }
    };
    return priorityMap[key] || { name: '中', color: '#1890ff' };
}

// 获取类型信息（包括颜色）
function getTypeInfo(key) {
    const typeMap = {
        'incident': { name: '故障', color: '#f5222d' },
        'service': { name: '服务请求', color: '#1890ff' },
        'change': { name: '变更', color: '#fa8c16' },
        'maintenance': { name: '维护', color: '#722ed1' },
        'consultation': { name: '咨询', color: '#13c2c2' }
    };
    return typeMap[key] || { name: '服务请求', color: '#1890ff' };
}

// 获取来源信息（包括颜色和图标）
function getSourceInfo(key) {
    const sourceMap = {
        // 数据库中的来源
        'alert': { name: '告警触发', color: '#f5222d', icon: 'fas fa-bell' },
        'manual': { name: '人工创建', color: '#1890ff', icon: 'fas fa-user-edit' },
        'scheduled': { name: '计划任务', color: '#722ed1', icon: 'fas fa-clock' },
        'user': { name: '用户报告', color: '#52c41a', icon: 'fas fa-user' },
        // 兼容旧数据
        'user_report': { name: '用户报告', color: '#1890ff', icon: 'fas fa-user' },
        'system_monitor': { name: '系统监控', color: '#722ed1', icon: 'fas fa-desktop' },
        'email': { name: '邮件', color: '#13c2c2', icon: 'fas fa-envelope' },
        'phone': { name: '电话', color: '#52c41a', icon: 'fas fa-phone' },
        'web': { name: 'Web端', color: '#fa8c16', icon: 'fas fa-globe' }
    };
    return sourceMap[key] || { name: key || '未知', color: '#d9d9d9', icon: 'fas fa-question' };
}

// 获取状态信息（包括颜色）
function getStatusInfo(status) {
    const statusMap = {
        'pending': { name: '待处理', color: '#faad14' },
        'processing': { name: '处理中', color: '#1890ff' },
        'resolved': { name: '已解决', color: '#52c41a' },
        'closed': { name: '已关闭', color: '#8c8c8c' }
    };
    return statusMap[status] || { name: '未知', color: '#d9d9d9' };
}

// 渲染分页
function renderUnassignedPagination(data) {
    console.log('分页信息:', {
        current: data.current,
        size: data.size,
        total: data.total,
        pages: data.pages
    });
    
    // 更新分页信息文字
    const paginationInfo = document.querySelector('#unassignedPage .pagination-info');
    if (paginationInfo && data) {
        const start = data.total === 0 ? 0 : ((data.current - 1) * data.size + 1);
        const end = Math.min(data.current * data.size, data.total);
        paginationInfo.textContent = `显示 ${start}-${end} 条，共 ${data.total} 条记录`;
    }
    
    // 更新分页按钮
    const paginationControls = document.querySelector('#unassignedPage .pagination-controls');
    if (paginationControls && data && data.pages > 1) {
        let buttonsHtml = '';
        
        // 上一页按钮
        buttonsHtml += `<button class="btn-pagination" ${data.current === 1 ? 'disabled' : ''} 
                        onclick="loadUnassignedTicketData(${data.current - 1})">
                            <i class="fas fa-chevron-left"></i>
                        </button>`;
        
        // 页码按钮
        for (let i = 1; i <= data.pages; i++) {
            if (i === 1 || i === data.pages || (i >= data.current - 1 && i <= data.current + 1)) {
                buttonsHtml += `<button class="btn-pagination ${i === data.current ? 'active' : ''}" 
                                onclick="loadUnassignedTicketData(${i})">${i}</button>`;
            } else if (i === data.current - 2 || i === data.current + 2) {
                buttonsHtml += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // 下一页按钮
        buttonsHtml += `<button class="btn-pagination" ${data.current === data.pages ? 'disabled' : ''} 
                        onclick="loadUnassignedTicketData(${data.current + 1})">
                            <i class="fas fa-chevron-right"></i>
                        </button>`;
        
        paginationControls.innerHTML = buttonsHtml;
    } else if (paginationControls) {
        // 只有一页或没有数据时，隐藏分页按钮
        paginationControls.innerHTML = '';
    }
}

// 查看未派发工单详情
async function viewUnassignedTicket(ticketId) {
    console.log('查看未派发工单详情:', ticketId);
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            const ticket = result.data;
            
            // 检查工单是否存在
            if (!ticket) {
                showErrorMessage('工单不存在或已被删除');
                return;
            }
            
            showTicketDetailModal(ticket);
        } else {
            showErrorMessage(result.message || '工单不存在');
        }
    } catch (error) {
        console.error('加载工单详情失败:', error);
        showErrorMessage('加载失败：' + error.message);
    }
}

// 编辑未派发工单
async function editUnassignedTicket(ticketId) {
    console.log('编辑未派发工单:', ticketId);
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            const ticket = result.data;
            
            // 检查工单是否存在
            if (!ticket) {
                showErrorMessage('工单不存在或已被删除');
                return;
            }
            
            showEditTicketModal(ticket);
        } else {
            showErrorMessage(result.message || '工单不存在');
        }
    } catch (error) {
        console.error('加载工单信息失败:', error);
        showErrorMessage('加载失败：' + error.message);
    }
}

// 派发单个工单
function assignSingleTicket(ticketId) {
    console.log('派发工单:', ticketId);
    
    // 保存当前要派发的工单ID（单个）
    window.currentAssignTicketIds = [ticketId];
    
    // 显示派发模态框
    showAssignModal();
}

// 派发工单（兼容旧函数名）
function assignTicket(ticketId) {
    assignSingleTicket(ticketId);
}

// 批量派发工单
function batchAssignUnassignedTickets() {
    console.log('批量派发工单');
    const selectedTickets = getSelectedUnassignedTickets();
    if (selectedTickets.length === 0) {
        showErrorMessage('请先选择要派发的工单');
        return;
    }
    
    // 保存要批量派发的工单ID列表
    window.currentAssignTicketIds = selectedTickets;
    
    // 显示派发模态框
    showAssignModal();
}

// 显示派发模态框
function showAssignModal() {
    const ticketIds = window.currentAssignTicketIds || [];
    const isBatch = ticketIds.length > 1;
    
    // 先关闭已存在的模态框
    const existingModal = document.getElementById('assignModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'assignModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isBatch ? '批量派发工单' : '派发工单'}</h3>
                <button class="close-button" onclick="closeAssignModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-info">${isBatch ? `已选择 ${ticketIds.length} 个工单` : ''}</p>
                <form id="assignForm">
                    <div class="form-group">
                        <label for="assigneeSelect">处理人 <span class="required">*</span></label>
                        <select id="assigneeSelect" class="form-control" required>
                            <option value="">请选择处理人</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="assignNote">派发备注</label>
                        <textarea id="assignNote" class="form-control" rows="3" placeholder="请输入派发备注（可选）"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeAssignModal()">取消</button>
                <button class="btn btn-primary" onclick="confirmAssign()">确认派发</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    console.log('📋 派发工单模态框已创建');
    
    // 立即加载用户列表，同时设置延迟备份
    loadAssigneeList();
    
    // 延迟再次加载，确保DOM完全渲染
    setTimeout(function() {
        console.log('🔄 延迟200ms后再次尝试加载用户列表');
        loadAssigneeList();
    }, 200);
}

// 关闭派发模态框
function closeAssignModal() {
    const modal = document.getElementById('assignModal');
    if (modal) {
        modal.remove();
    }
    window.currentAssignTicketIds = null;
}

// 加载处理人列表 - 重写版本
function loadAssigneeList() {
    console.log('🔄 开始加载处理人列表...');
    
    const select = document.getElementById('assigneeSelect');
    if (!select) {
        console.error('❌ 未找到 assigneeSelect 元素！');
        return;
    }
    
    // 显示加载状态
    select.innerHTML = '<option value="">正在加载...</option>';
    select.disabled = true;
    
    // 使用XMLHttpRequest确保兼容性
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/user/list', true);
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
        console.log('📥 API响应状态:', xhr.status);
        console.log('📄 响应内容类型:', xhr.getResponseHeader('Content-Type'));
        
        if (xhr.status === 200) {
            try {
                const result = JSON.parse(xhr.responseText);
                console.log('✅ API返回数据:', result);
                
                if (result.success || result.code === 200) {
                    const users = result.data || [];
                    console.log(`👥 接收到 ${users.length} 个用户:`, users);
                    
                    if (users.length === 0) {
                        select.innerHTML = '<option value="">暂无用户</option>';
                        console.warn('⚠️ 用户列表为空');
                    } else {
                        // 构建选项 - 只显示username
                        let options = '<option value="">请选择处理人</option>';
                        users.forEach(function(user) {
                            // 只显示username
                            options += '<option value="' + user.id + '">' + user.username + '</option>';
                            console.log('  ➕ 添加用户: id=' + user.id + ', username=' + user.username);
                        });
                        select.innerHTML = options;
                        console.log('✅ 用户列表加载完成，共 ' + users.length + ' 人');
                    }
                    select.disabled = false;
                } else {
                    console.error('❌ API返回错误:', result.message);
                    select.innerHTML = '<option value="">加载失败</option>';
                    select.disabled = false;
                    alert('加载处理人列表失败: ' + (result.message || '未知错误'));
                }
            } catch (e) {
                console.error('❌ JSON解析失败:', e);
                console.log('原始响应:', xhr.responseText.substring(0, 500));
                select.innerHTML = '<option value="">数据解析失败</option>';
                select.disabled = false;
                alert('数据解析失败: ' + e.message);
            }
        } else {
            console.error('❌ HTTP错误:', xhr.status, xhr.statusText);
            console.log('响应内容:', xhr.responseText.substring(0, 500));
            select.innerHTML = '<option value="">服务器错误</option>';
            select.disabled = false;
            alert('服务器错误: HTTP ' + xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ 网络错误');
        select.innerHTML = '<option value="">网络错误</option>';
        select.disabled = false;
        alert('网络错误，请检查网络连接');
    };
    
    xhr.ontimeout = function() {
        console.error('❌ 请求超时');
        select.innerHTML = '<option value="">请求超时</option>';
        select.disabled = false;
        alert('请求超时，请重试');
    };
    
    xhr.timeout = 10000; // 10秒超时
    xhr.send();
}

// 确认派发
async function confirmAssign() {
    const assigneeSelect = document.getElementById('assigneeSelect');
    const assigneeId = assigneeSelect.value;
    const note = document.getElementById('assignNote').value.trim();
    
    if (!assigneeId) {
        showErrorMessage('请选择处理人');
        return;
    }
    
    // 获取选中的处理人姓名
    const assigneeName = assigneeSelect.options[assigneeSelect.selectedIndex].text;
    
    const ticketIds = window.currentAssignTicketIds || [];
    if (ticketIds.length === 0) {
        showErrorMessage('没有要派发的工单');
        return;
    }
    
    // 获取当前用户作为操作人
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
        showErrorMessage('无法获取用户信息');
        return;
    }
    
    try {
        console.log('🔍 === 派发工单调试信息 ===');
        console.log('工单ID数组:', ticketIds);
        console.log('工单数量:', ticketIds.length);
        console.log('处理人ID:', assigneeId, '类型:', typeof assigneeId);
        console.log('处理人姓名:', assigneeName);
        console.log('派发备注:', note);
        console.log('当前用户:', currentUser);
        
        let response;
        
        if (ticketIds.length === 1) {
            console.log('📋 执行单个派发');
            // 单个派发：POST /api/tickets/{ticketId}/assign
            const requestData = {
                assigneeId: parseInt(assigneeId),
                assigneeName: assigneeName,
                assignNote: note,
                operatorId: currentUser.id
            };
            console.log('单个派发请求数据:', requestData);
            
            response = await fetch(`/api/tickets/${ticketIds[0]}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
        } else {
            console.log('📋 执行批量派发');
            // 批量派发：POST /api/tickets/batch-assign
            const requestData = {
                ticketIds,
                assigneeId: parseInt(assigneeId),
                assigneeName: assigneeName,
                assignNote: note,
                operatorId: currentUser.id
            };
            console.log('批量派发请求数据:', requestData);
            console.log('请求URL: /api/tickets/batch-assign');
            
            response = await fetch('/api/tickets/batch-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
        }
        
        console.log('📥 API响应状态:', response.status);
        console.log('📥 API响应头:', response.headers.get('content-type'));
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage(ticketIds.length > 1 ? '批量派发成功' : '派发成功');
            closeAssignModal();
            loadUnassignedTicketData();
        } else {
            showErrorMessage(result.message || '派发失败');
        }
    } catch (error) {
        console.error('派发失败:', error);
        showErrorMessage('派发失败：' + error.message);
    }
}

// 导出未派发工单
async function exportUnassignedTickets() {
    console.log('导出工单数据');
    
    try {
        // 获取当前筛选条件
        const filters = {};
        const typeFilter = document.getElementById('unassignedTypeFilter');
        const priorityFilter = document.getElementById('unassignedPriorityFilter');
        const statusFilter = document.getElementById('unassignedStatusFilter');
        const keywordFilter = document.getElementById('unassignedKeywordFilter');
        
        if (typeFilter && typeFilter.value) filters.typeKey = typeFilter.value;
        if (priorityFilter && priorityFilter.value) filters.priorityKey = priorityFilter.value;
        if (statusFilter && statusFilter.value) filters.status = statusFilter.value;
        if (keywordFilter && keywordFilter.value) filters.keyword = keywordFilter.value;
        
        // 构建查询参数，获取所有数据
        const params = new URLSearchParams();
        params.append('current', 1);
        params.append('size', 1000); // 获取最多1000条
        
        if (filters.typeKey) params.append('typeKey', filters.typeKey);
        if (filters.priorityKey) params.append('priorityKey', filters.priorityKey);
        if (filters.status) params.append('status', filters.status);
        if (filters.keyword) params.append('keyword', filters.keyword);
        
        showSuccessMessage('正在导出数据...');
        
        const response = await fetch(`/api/tickets/list?${params.toString()}`);
        const result = await response.json();
        
        if (!result.success && result.code !== 200) {
            showErrorMessage('获取数据失败');
            return;
        }
        
        // 获取工单数据
        let records = [];
        const data = result.data;
        if (Array.isArray(data)) {
            records = data;
        } else if (data && Array.isArray(data.records)) {
            records = data.records;
        } else if (data && Array.isArray(data.list)) {
            records = data.list;
        }
        
        if (records.length === 0) {
            showErrorMessage('没有可导出的数据');
            return;
        }
        
        // 状态映射
        const statusMap = {
            'pending': '待处理',
            'assigned': '已分配',
            'processing': '处理中',
            'resolved': '已解决',
            'completed': '已完成',
            'closed': '已关闭'
        };
        
        // 优先级映射
        const priorityMap = {
            'urgent': '紧急',
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        
        // 类型映射
        const typeMap = {
            'fault': '故障',
            'incident': '故障',
            'change': '变更',
            'request': '服务请求',
            'service': '服务',
            'consultation': '咨询',
            'maintenance': '维护'
        };
        
        // 来源映射
        const sourceMap = {
            'alert': '告警触发',
            'manual': '人工创建',
            'scheduled': '计划任务',
            'user': '用户报告'
        };
        
        // 构建CSV内容
        const headers = ['工单编号', '标题', '描述', '类型', '优先级', '状态', '来源', '创建人', '处理人', '关联设备', '创建时间', '更新时间'];
        
        const csvRows = [headers.join(',')];
        
        records.forEach(ticket => {
            const row = [
                ticket.ticketNo || '',
                `"${(ticket.title || '').replace(/"/g, '""')}"`,
                `"${(ticket.description || '').replace(/"/g, '""')}"`,
                typeMap[ticket.typeKey] || ticket.typeKey || '',
                priorityMap[ticket.priorityKey] || ticket.priorityKey || '',
                statusMap[ticket.status] || ticket.status || '',
                sourceMap[ticket.sourceKey] || ticket.sourceKey || '',
                ticket.creatorName || '',
                ticket.assigneeName || '',
                ticket.deviceName || '',
                formatDateTime(ticket.createdAt) || '',
                formatDateTime(ticket.updatedAt) || ''
            ];
            csvRows.push(row.join(','));
        });
        
        // 添加BOM以支持中文
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\n');
        
        // 创建Blob并下载
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // 生成文件名
        const now = new Date();
        const fileName = `工单列表_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccessMessage(`成功导出 ${records.length} 条工单数据`);
        
    } catch (error) {
        console.error('导出工单失败:', error);
        showErrorMessage('导出失败：' + error.message);
    }
}

// 格式化日期时间
function formatDateTime(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    } catch (e) {
        return dateStr;
    }
}

// 刷新未派发工单
function refreshUnassignedTickets() {
    console.log('刷新未派发工单');
    loadUnassignedTicketData();
    showSuccessMessage('未派发工单数据已刷新');
}

// 删除工单
async function deleteTicket(ticketId) {
    // 二次确认
    const confirmed = confirm('确定要删除这个工单吗？删除后无法恢复！');
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage('工单删除成功');
            // 刷新列表
            loadUnassignedTicketData();
        } else {
            showErrorMessage(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除工单失败:', error);
        showErrorMessage('删除失败：' + error.message);
    }
}

// 显示工单详情模态框
function showTicketDetailModal(ticket) {
    // 检查工单数据是否存在
    if (!ticket) {
        console.error('工单数据为空，无法显示详情');
        showErrorMessage('工单数据加载失败');
        return;
    }
    
    const priorityInfo = getPriorityInfo(ticket.priorityKey);
    const typeInfo = getTypeInfo(ticket.typeKey);
    const sourceInfo = getSourceInfo(ticket.sourceKey);
    const statusInfo = getStatusInfo(ticket.status);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modern-modal">
            <!-- 模态框头部 -->
            <div class="modern-modal-header">
                <div class="header-title-section">
                    <div class="ticket-number-badge">${ticket.ticketNo || '#' + ticket.id}</div>
                    <h2 class="modal-title">${ticket.title}</h2>
                </div>
                <button class="modern-close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- 模态框主体 -->
            <div class="modern-modal-body">
                <!-- 工单状态栏 -->
                <div class="ticket-status-bar">
                    <div class="status-item">
                        <span class="status-badge" style="background-color: ${statusInfo.color}15; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}40;">
                            <i class="${statusInfo.icon}"></i> ${statusInfo.name}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="priority-badge-large" style="background-color: ${priorityInfo.color}15; color: ${priorityInfo.color}; border: 1px solid ${priorityInfo.color}40;">
                            <i class="fas fa-flag"></i> ${priorityInfo.name}优先级
                        </span>
                    </div>
                </div>
                
                <!-- 工单描述 -->
                ${ticket.description ? `
                <div class="detail-card">
                    <div class="card-header">
                        <i class="fas fa-align-left"></i>
                        <span>工单描述</span>
                    </div>
                    <div class="card-content">
                        <p class="description-text">${ticket.description}</p>
                    </div>
                </div>
                ` : ''}
                
                <!-- 工单信息 -->
                <div class="detail-card">
                    <div class="card-header">
                        <i class="fas fa-info-circle"></i>
                        <span>基本信息</span>
                    </div>
                    <div class="card-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-tag"></i> 工单类型
                                </div>
                                <div class="info-value">
                                    <span class="badge-pill" style="background-color: ${typeInfo.color}15; color: ${typeInfo.color};">
                                        ${typeInfo.name}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-inbox"></i> 来源渠道
                                </div>
                                <div class="info-value">
                                    <span class="badge-pill" style="background-color: ${sourceInfo.color}15; color: ${sourceInfo.color};">
                                        ${sourceInfo.name}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-user"></i> 创建人
                                </div>
                                <div class="info-value">
                                    ${ticket.creatorName || '未知'}
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-clock"></i> 创建时间
                                </div>
                                <div class="info-value">
                                    ${formatDateTime(ticket.createdAt)}
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-user-check"></i> 处理人
                                </div>
                                <div class="info-value">
                                    ${ticket.assigneeName ? 
                                        `<span style="color: #52c41a;"><i class="fas fa-user-circle"></i> ${ticket.assigneeName}</span>` : 
                                        `<span style="color: #8c8c8c;"><i class="fas fa-user-slash"></i> 未分配</span>`
                                    }
                                </div>
                            </div>
                            
                            ${ticket.updatedAt ? `
                            <div class="info-item">
                                <div class="info-label">
                                    <i class="fas fa-edit"></i> 更新时间
                                </div>
                                <div class="info-value">
                                    ${formatDateTime(ticket.updatedAt)}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- 附件信息 -->
                <div class="detail-card">
                    <div class="card-header">
                        <i class="fas fa-paperclip"></i>
                        <span>附件</span>
                    </div>
                    <div class="card-content">
                        <div class="attachment-list">
                            ${renderAttachments(ticket.attachmentUrls)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 渲染附件列表
function renderAttachments(attachmentUrls) {
    // 处理空值情况
    if (!attachmentUrls || attachmentUrls === '' || attachmentUrls === '[]' || attachmentUrls === 'null') {
        return '<p style="color: #999; text-align: center; padding: 20px;">📎 暂无附件</p>';
    }
    
    try {
        const urls = JSON.parse(attachmentUrls);
        if (!Array.isArray(urls) || urls.length === 0) {
            return '<p style="color: #999; text-align: center; padding: 20px;">📎 暂无附件</p>';
        }
        
        return urls.map(url => {
            const fileName = url.split('/').pop();
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
            
            if (isImage) {
                return `
                    <div class="attachment-item attachment-image">
                        <div class="image-preview-container">
                            <img src="${url}" alt="${fileName}" class="attachment-thumbnail" onclick="window.open('${url}', '_blank')" style="cursor: pointer;" />
                        </div>
                        <div class="attachment-info">
                            <div class="attachment-file-info">
                                <i class="fas fa-image"></i>
                                <span class="attachment-name">${fileName}</span>
                            </div>
                            <div class="attachment-actions">
                                <button class="btn-attachment-action" onclick="window.open('${url}', '_blank')" title="预览">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-attachment-action" onclick="downloadAttachment('${url}', '${fileName}')" title="下载">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="attachment-item attachment-file">
                        <div class="attachment-file-content">
                            <div class="attachment-file-info">
                                <i class="fas fa-file"></i>
                                <span class="attachment-name">${fileName}</span>
                            </div>
                            <div class="attachment-actions">
                                <button class="btn-attachment-action" onclick="downloadAttachment('${url}', '${fileName}')" title="下载">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    } catch (e) {
        console.error('解析附件URL失败:', e);
        return '<p style="color: #ff4757;">附件信息格式错误</p>';
    }
}

// 下载附件
function downloadAttachment(url, fileName) {
    console.log('下载附件:', fileName, url);
    
    // 创建一个隐藏的a标签来触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage('开始下载: ' + fileName);
}

// 显示编辑工单模态框
function showEditTicketModal(ticket) {
    // 检查工单数据是否存在
    if (!ticket) {
        console.error('工单数据为空，无法显示编辑表单');
        showErrorMessage('工单数据加载失败');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editTicketModal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>编辑工单 - #${ticket.ticketNo || ticket.id}</h3>
            </div>
            <div class="modal-body">
                <form id="editTicketForm">
                    <input type="hidden" id="editTicketId" value="${ticket.id}">
                    
                    <div class="form-group">
                        <label for="editTicketTitle">标题 <span class="required">*</span></label>
                        <input type="text" id="editTicketTitle" class="form-control" value="${ticket.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTicketDescription">描述</label>
                        <textarea id="editTicketDescription" class="form-control" rows="4">${ticket.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editTicketPriority">优先级 <span class="required">*</span></label>
                            <select id="editTicketPriority" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="editTicketType">类型 <span class="required">*</span></label>
                            <select id="editTicketType" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editTicketSource">来源 <span class="required">*</span></label>
                            <select id="editTicketSource" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="editTicketStatus">状态 <span class="required">*</span></label>
                            <select id="editTicketStatus" class="form-control" required>
                                <option value="pending" ${!ticket.status || ticket.status === 'pending' ? 'selected' : ''}>待处理</option>
                                <option value="processing" ${ticket.status === 'processing' ? 'selected' : ''}>处理中</option>
                                <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>已解决</option>
                                <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>已关闭</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTicketDevice">关联设备</label>
                        <input type="text" id="editTicketDevice" class="form-control" value="${ticket.deviceName || ''}" placeholder="请输入设备名称或ID（可选）">
                        <small class="form-text text-muted">填写后可在工单列表中点击跳转到资产管理</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeEditTicketModal()">取消</button>
                <button class="btn btn-primary" onclick="saveEditedTicket()">保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 加载配置数据并设置当前值
    loadEditTicketConfig(ticket);
}

// 解析附件URL（JSON字符串转数组）
function parseAttachmentUrls(attachmentUrls) {
    try {
        if (!attachmentUrls) return [];
        if (typeof attachmentUrls === 'string') {
            return JSON.parse(attachmentUrls);
        }
        return Array.isArray(attachmentUrls) ? attachmentUrls : [];
    } catch (error) {
        console.error('解析附件URL失败:', error);
        return [];
    }
}

// 从URL中提取文件名
function getFileNameFromUrl(url) {
    try {
        const parts = url.split('/');
        return parts[parts.length - 1] || '附件';
    } catch (error) {
        return '附件';
    }
}

// 移除已存在的附件（标记删除）
function removeExistingFile(url, index) {
    if (!window.editRemovedFiles) {
        window.editRemovedFiles = [];
    }
    window.editRemovedFiles.push(url);
    
    // 从显示中移除
    const fileElement = event.target.closest('.file-item');
    if (fileElement) {
        fileElement.remove();
    }
}

// 关闭编辑工单模态框
function closeEditTicketModal() {
    const modal = document.getElementById('editTicketModal');
    if (modal) {
        modal.remove();
    }
}

// 加载编辑工单的配置数据
async function loadEditTicketConfig(ticket) {
    try {
        // 加载优先级
        const priorityResponse = await fetch('/api/ticket/config/priority');
        const priorityResult = await priorityResponse.json();
        if (priorityResult.success || priorityResult.code === 200) {
            const prioritySelect = document.getElementById('editTicketPriority');
            prioritySelect.innerHTML = '<option value="">请选择</option>' +
                (priorityResult.data || []).map(p => 
                    `<option value="${p.priorityKey}" ${p.priorityKey === ticket.priorityKey ? 'selected' : ''}>${p.priorityName}</option>`
                ).join('');
        }
        
        // 加载类型
        const typeResponse = await fetch('/api/ticket/config/type');
        const typeResult = await typeResponse.json();
        if (typeResult.success || typeResult.code === 200) {
            const typeSelect = document.getElementById('editTicketType');
            typeSelect.innerHTML = '<option value="">请选择</option>' +
                (typeResult.data || []).map(t => 
                    `<option value="${t.typeKey}" ${t.typeKey === ticket.typeKey ? 'selected' : ''}>${t.typeName}</option>`
                ).join('');
        }
        
        // 加载来源
        const sourceResponse = await fetch('/api/ticket/config/source');
        const sourceResult = await sourceResponse.json();
        if (sourceResult.success || sourceResult.code === 200) {
            const sourceSelect = document.getElementById('editTicketSource');
            sourceSelect.innerHTML = '<option value="">请选择</option>' +
                (sourceResult.data || []).map(s => 
                    `<option value="${s.sourceKey}" ${s.sourceKey === ticket.sourceKey ? 'selected' : ''}>${s.sourceName}</option>`
                ).join('');
        }
        
        // 绑定文件上传事件
        bindEditTicketFileUpload();
        
    } catch (error) {
        console.error('加载配置数据失败:', error);
    }
}

// 绑定编辑工单的文件上传事件
function bindEditTicketFileUpload() {
    const fileInput = document.getElementById('editTicketAttachment');
    const fileList = document.getElementById('editTicketFileList');
    
    // 清空删除标记
    window.editRemovedFiles = [];
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                showErrorMessage('最多只能上传5个文件');
                fileInput.value = '';
                return;
            }
            
            fileList.innerHTML = files.map((file, index) => `
                <div class="file-item" data-file-index="${index}">
                    <i class="fas fa-file"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                    <button type="button" class="btn-remove-file" onclick="removeEditFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        });
    }
}

// 移除编辑工单的新文件
function removeEditFile(index) {
    const fileInput = document.getElementById('editTicketAttachment');
    const fileList = document.getElementById('editTicketFileList');
    
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    
    fileList.innerHTML = Array.from(fileInput.files).map((file, i) => `
        <div class="file-item" data-file-index="${i}">
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <button type="button" class="btn-remove-file" onclick="removeEditFile(${i})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// 保存编辑的工单
async function saveEditedTicket() {
    const ticketId = document.getElementById('editTicketId').value;
    const title = document.getElementById('editTicketTitle').value.trim();
    const description = document.getElementById('editTicketDescription').value.trim();
    const priorityKey = document.getElementById('editTicketPriority').value;
    const typeKey = document.getElementById('editTicketType').value;
    const sourceKey = document.getElementById('editTicketSource').value;
    const status = document.getElementById('editTicketStatus').value;
    const deviceName = document.getElementById('editTicketDevice')?.value.trim() || null;
    const fileInput = document.getElementById('editTicketAttachment');
    
    if (!title) {
        showErrorMessage('请输入工单标题');
        return;
    }
    
    if (!priorityKey || !typeKey || !sourceKey) {
        showErrorMessage('请选择优先级、类型和来源');
        return;
    }
    
    // 确保status有值，如果为空则设置默认值
    const finalStatus = status && status.trim() !== '' ? status : 'pending';
    
    try {
        // 上传新附件（如果有）
        let newAttachmentUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            const formData = new FormData();
            Array.from(fileInput.files).forEach(file => {
                formData.append('files', file);
            });
            
            try {
                const uploadResponse = await fetch('/api/tickets/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadResult = await uploadResponse.json();
                if (uploadResult.success || uploadResult.code === 200) {
                    newAttachmentUrls = uploadResult.data || [];
                    console.log('新附件上传成功:', newAttachmentUrls);
                }
            } catch (uploadError) {
                console.warn('附件上传失败:', uploadError);
            }
        }
        
        // 构建更新数据
        const updateData = {
            title,
            description,
            priorityKey,
            typeKey,
            sourceKey,
            status: finalStatus
        };
        
        // 添加可选字段
        if (deviceName) updateData.deviceName = deviceName;
        
        // 处理附件URL（保留未删除的 + 新上传的）
        const existingUrls = parseAttachmentUrls(
            document.querySelector('#editExistingFiles')?.dataset.urls || '[]'
        ).filter(url => !window.editRemovedFiles || !window.editRemovedFiles.includes(url));
        
        const allAttachmentUrls = [...existingUrls, ...newAttachmentUrls];
        if (allAttachmentUrls.length > 0) {
            updateData.attachmentUrls = JSON.stringify(allAttachmentUrls);
        }
        
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage('工单更新成功');
            closeEditTicketModal();
            loadUnassignedTicketData();
        } else {
            showErrorMessage(result.message || '更新失败');
        }
    } catch (error) {
        console.error('更新工单失败:', error);
        showErrorMessage('更新失败：' + error.message);
    }
}

// 显示新增工单模态框
function showCreateTicketModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'createTicketModal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>新建工单</h3>
                <button class="close-button" onclick="closeCreateTicketModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="createTicketForm">
                    <div class="form-group">
                        <label for="createTicketTitle">标题 <span class="required">*</span></label>
                        <input type="text" id="createTicketTitle" class="form-control" placeholder="请输入工单标题" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="createTicketDescription">描述</label>
                        <textarea id="createTicketDescription" class="form-control" rows="4" placeholder="请输入工单描述"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="createTicketPriority">优先级 <span class="required">*</span></label>
                            <select id="createTicketPriority" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="createTicketType">类型 <span class="required">*</span></label>
                            <select id="createTicketType" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="createTicketSource">来源 <span class="required">*</span></label>
                            <select id="createTicketSource" class="form-control" required>
                                <option value="">请选择</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="createTicketStatus">状态 <span class="required">*</span></label>
                            <select id="createTicketStatus" class="form-control" required>
                                <option value="pending" selected>待处理</option>
                                <option value="processing">处理中</option>
                                <option value="resolved">已解决</option>
                                <option value="closed">已关闭</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="createTicketDevice">关联设备</label>
                        <input type="text" id="createTicketDevice" class="form-control" placeholder="请输入设备名称或ID（可选）">
                        <small class="form-text text-muted">填写后可在工单列表中点击跳转到资产管理</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="createTicketAttachment">附件上传</label>
                        <div class="file-upload-area">
                            <input type="file" id="createTicketAttachment" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt" style="display: none;">
                            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('createTicketAttachment').click()">
                                <i class="fas fa-upload"></i> 选择文件
                            </button>
                            <span class="file-hint">支持jpg、png、pdf、doc、xls等格式，最多5个文件</span>
                            <div id="createTicketFileList" class="file-list"></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCreateTicketModal()">取消</button>
                <button class="btn btn-primary" onclick="saveNewTicket()">创建</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 加载配置数据
    loadCreateTicketConfig();
}

// 关闭新增工单模态框
function closeCreateTicketModal() {
    const modal = document.getElementById('createTicketModal');
    if (modal) {
        modal.remove();
    }
}

// 加载新增工单的配置数据
async function loadCreateTicketConfig() {
    try {
        // 加载优先级
        const priorityResponse = await fetch('/api/ticket/config/priority');
        const priorityResult = await priorityResponse.json();
        if (priorityResult.success || priorityResult.code === 200) {
            const prioritySelect = document.getElementById('createTicketPriority');
            prioritySelect.innerHTML = '<option value="">请选择</option>' +
                (priorityResult.data || []).map(p => 
                    `<option value="${p.priorityKey}">${p.priorityName}</option>`
                ).join('');
        }
        
        // 加载类型
        const typeResponse = await fetch('/api/ticket/config/type');
        const typeResult = await typeResponse.json();
        if (typeResult.success || typeResult.code === 200) {
            const typeSelect = document.getElementById('createTicketType');
            typeSelect.innerHTML = '<option value="">请选择</option>' +
                (typeResult.data || []).map(t => 
                    `<option value="${t.typeKey}">${t.typeName}</option>`
                ).join('');
        }
        
        // 加载来源
        const sourceResponse = await fetch('/api/ticket/config/source');
        const sourceResult = await sourceResponse.json();
        if (sourceResult.success || sourceResult.code === 200) {
            const sourceSelect = document.getElementById('createTicketSource');
            sourceSelect.innerHTML = '<option value="">请选择</option>' +
                (sourceResult.data || []).map(s => 
                    `<option value="${s.sourceKey}">${s.sourceName}</option>`
                ).join('');
        }
        
        // 绑定文件上传事件
        bindCreateTicketFileUpload();
        
    } catch (error) {
        console.error('加载配置数据失败:', error);
    }
}

// 绑定新建工单的文件上传事件
function bindCreateTicketFileUpload() {
    const fileInput = document.getElementById('createTicketAttachment');
    const fileList = document.getElementById('createTicketFileList');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                showErrorMessage('最多只能上传5个文件');
                fileInput.value = '';
                return;
            }
            
            fileList.innerHTML = files.map((file, index) => `
                <div class="file-item" data-file-index="${index}">
                    <i class="fas fa-file"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                    <button type="button" class="btn-remove-file" onclick="removeCreateFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        });
    }
}

// 移除新建工单的文件
function removeCreateFile(index) {
    const fileInput = document.getElementById('createTicketAttachment');
    const fileList = document.getElementById('createTicketFileList');
    
    // 创建新的FileList（不包含要删除的文件）
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    
    // 更新显示
    fileList.innerHTML = Array.from(fileInput.files).map((file, i) => `
        <div class="file-item" data-file-index="${i}">
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <button type="button" class="btn-remove-file" onclick="removeCreateFile(${i})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 保存新工单
async function saveNewTicket() {
    const title = document.getElementById('createTicketTitle').value.trim();
    const description = document.getElementById('createTicketDescription').value.trim();
    const priorityKey = document.getElementById('createTicketPriority').value;
    const typeKey = document.getElementById('createTicketType').value;
    const sourceKey = document.getElementById('createTicketSource').value;
    const status = document.getElementById('createTicketStatus').value;
    const deviceName = document.getElementById('createTicketDevice')?.value.trim() || null;
    const fileInput = document.getElementById('createTicketAttachment');
    
    if (!title) {
        showErrorMessage('请输入工单标题');
        return;
    }
    
    if (!priorityKey || !typeKey || !sourceKey) {
        showErrorMessage('请选择优先级、类型和来源');
        return;
    }
    
    // 确保status有值，如果为空则设置默认值
    const finalStatus = status && status.trim() !== '' ? status : 'pending';
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
        showErrorMessage('无法获取用户信息');
        return;
    }
    
    try {
        // 上传附件（如果有）
        let attachmentUrls = [];
        if (fileInput && fileInput.files.length > 0) {
            const formData = new FormData();
            Array.from(fileInput.files).forEach(file => {
                formData.append('files', file);
            });
            
            try {
                const uploadResponse = await fetch('/api/tickets/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadResult = await uploadResponse.json();
                if (uploadResult.success || uploadResult.code === 200) {
                    attachmentUrls = uploadResult.data || [];
                    console.log('附件上传成功:', attachmentUrls);
                } else {
                    console.warn('附件上传失败:', uploadResult.message);
                }
            } catch (uploadError) {
                console.warn('附件上传失败:', uploadError);
                // 继续创建工单，不因附件上传失败而中断
            }
        }
        
        // 创建工单
        const ticketData = {
            title,
            description,
            priorityKey,
            typeKey,
            sourceKey,
            status: finalStatus,
            creatorId: currentUser.id,
            creatorName: currentUser.name || currentUser.username
        };
        
        // 添加可选字段
        if (deviceName) ticketData.deviceName = deviceName;
        if (attachmentUrls.length > 0) ticketData.attachmentUrls = JSON.stringify(attachmentUrls);
        
        const response = await fetch('/api/tickets/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage('工单创建成功');
            closeCreateTicketModal();
            loadUnassignedTicketData();
        } else {
            showErrorMessage(result.message || '创建失败');
        }
    } catch (error) {
        console.error('创建工单失败:', error);
        showErrorMessage('创建失败：' + error.message);
    }
}

// 辅助函数：获取优先级名称
function getPriorityName(key) {
    const map = {
        'urgent': 'P1-紧急',
        'high': 'P2-高',
        'medium': 'P3-中',
        'low': 'P4-低'
    };
    return map[key] || key;
}

// 辅助函数：获取类型名称
function getTypeName(key) {
    const map = {
        'incident': '故障处理',
        'change': '变更申请',
        'service': '服务请求',
        'consultation': '咨询工单',
        'maintenance': '维护工单'
    };
    return map[key] || key;
}

// 辅助函数：获取来源名称
function getSourceName(key) {
    const map = {
        'user_report': '用户报告',
        'system_monitor': '系统监控',
        'api': 'API接口',
        'email': '邮件'
    };
    return map[key] || key;
}

// 辅助函数：获取状态名称
function getStatusName(status) {
    const map = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决',
        'closed': '已关闭'
    };
    return map[status] || status;
}

// 辅助函数：格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 删除优先级
function deletePriority(priorityKey) {
    console.log('删除优先级:', priorityKey);
    
    const priorityItem = document.querySelector(`[data-priority="${priorityKey}"]`);
    if (priorityItem) {
        const name = priorityItem.querySelector('.priority-name').textContent;
        const priorityId = priorityItem.getAttribute('data-db-id'); // 获取数据库ID
        
        if (!priorityId) {
            console.error('无法获取优先级ID');
            showErrorMessage('删除失败：无法获取优先级ID');
            return;
        }
        
        if (confirm(`确定要删除 ${name} 吗？\n删除后将从数据库中移除该优先级选项。`)) {
            // 调用后端API删除，使用数据库ID而不是key
            fetch(`/api/ticket/config/priority/${priorityId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('删除API响应:', data);
                
                // 兼容不同的响应格式
                const isSuccess = data.success === true || data.code === 200;
                
                if (isSuccess) {
                    // 从DOM中移除元素
                    priorityItem.remove();
                    console.log(`${name} 已删除`);
                    showSuccessMessage(`优先级 ${name} 删除成功`);
                    
                    // 重新加载优先级列表以确保数据同步
                    loadPriorityConfig();
                } else {
                    console.error('删除失败:', data.message);
                    showErrorMessage(data.message || '删除优先级失败');
                }
            })
            .catch(error => {
                console.error('删除优先级时发生错误:', error);
                showErrorMessage('删除优先级时发生网络错误');
            });
        }
    }
}

// 新增优先级
function addNewPriority() {
    console.log('打开新增优先级表单');
    showAddPriorityModal();
}

// 显示新增优先级模态框
function showAddPriorityModal() {
    // 获取当前优先级数量，用于生成建议的优先级编号
    const existingPriorities = document.querySelectorAll('.priority-item');
    const nextPriorityNumber = existingPriorities.length + 1;
    
    // 创建模态框HTML
    const modalHtml = `
        <div class="modal-overlay" id="addPriorityModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>新增优先级</h3>
                    <button class="modal-close" onclick="closeAddPriorityModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addPriorityForm">
                        <div class="form-group">
                            <label for="add_priorityKey">优先级Key *</label>
                            <input type="text" id="add_priorityKey" name="priorityKey" 
                                   placeholder="例如：urgent, high, custom_p${nextPriorityNumber}" 
                                   pattern="[a-z0-9_]+" 
                                   title="只能包含小写字母、数字和下划线"
                                   required>
                            <small class="form-text text-muted">系统唯一标识，只能包含小写字母、数字和下划线</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="add_priorityName">优先级名称 *</label>
                            <input type="text" id="add_priorityName" name="priorityName" 
                                   placeholder="例如：P${nextPriorityNumber}-紧急" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="add_priorityDesc">优先级描述 *</label>
                            <input type="text" id="add_priorityDesc" name="priorityDesc" 
                                   placeholder="请输入优先级描述" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="add_priorityLevel">优先级等级 *</label>
                            <input type="number" id="add_priorityLevel" name="priorityLevel" 
                                   value="${nextPriorityNumber}" min="0" max="999" 
                                   placeholder="请输入优先级等级（数字越小优先级越高）" required>
                            <small class="form-text text-muted">建议：0-最高，1-紧急，2-高，3-中，4-低</small>
                        </div>
                        
                        
                        <div class="form-group">
                            <label for="add_priorityColor">优先级颜色 *</label>
                            <div class="color-picker">
                                <input type="color" id="add_priorityColor" name="priorityColor" 
                                       value="${getNextAvailableColor()}" required>
                                <span class="color-preview"></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeAddPriorityModal()">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitAddPriority()">确认添加</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 显示模态框
    const modal = document.getElementById('addPriorityModal');
    modal.style.display = 'flex';
    
    // 聚焦到Key输入框
    setTimeout(() => {
        document.getElementById('add_priorityKey').focus();
    }, 100);
}

// 关闭新增优先级模态框
function closeAddPriorityModal() {
    const modal = document.getElementById('addPriorityModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
}

// 获取下一个可用的颜色
function getNextAvailableColor() {
    const availableColors = [
        '#6c757d', // 灰色
        '#17a2b8', // 青色
        '#28a745', // 绿色
        '#dc3545', // 红色
        '#ffc107', // 黄色
        '#6f42c1', // 紫色
        '#fd7e14', // 橙色
        '#20c997', // 青绿色
        '#e83e8c', // 粉色
        '#6610f2'  // 靛蓝色
    ];
    
    // 获取已使用的颜色
    const usedColors = [];
    const existingPriorities = document.querySelectorAll('.priority-item .priority-color');
    existingPriorities.forEach(colorDiv => {
        const bgColor = colorDiv.style.backgroundColor;
        if (bgColor) {
            usedColors.push(rgbToHex(bgColor));
        }
    });
    
    // 找到第一个未使用的颜色
    for (let color of availableColors) {
        if (!usedColors.includes(color)) {
            return color;
        }
    }
    
    // 如果所有颜色都被使用，返回随机颜色
    return availableColors[Math.floor(Math.random() * availableColors.length)];
}

// RGB颜色转换为HEX格式
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return rgb;
    
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 模拟数据更新函数
function updateTicketData() {
    // 这里可以添加从服务器获取数据的逻辑
    // 然后更新图表和统计数据
    console.log('更新工单数据');
}

// 页面加载完成后定期更新数据
setInterval(updateTicketData, 30000); // 每30秒更新一次

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化页面');
    
    // 绑定主标签页事件（已在initializeEventListeners中处理，避免重复绑定）
    // bindMainTabEvents();
    
    // 初始化配置功能（因为默认显示配置工单页面）
    setTimeout(() => {
        console.log('延迟初始化配置页面');
        initConfigPage();
    }, 100);
});

// 绑定主标签页事件
function bindMainTabEvents() {
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabText = this.textContent.trim();
            
            // 更新标签页状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            
            // 根据标签页切换内容
            switch(tabText) {
                case '配置工单':
                    updateConfigTickets();
                    break;
                case '我的工单':
                    updateMyTickets();
                    break;
                case '上传':
                    updateUploads();
                    break;
                case '派发':
                    updateUnassigned();
                    break;
            }
        });
    });
}

// 获取当前应用的context path
function getContextPath() {
    const path = window.location.pathname;
    if (path.startsWith('/api')) {
        return '/api';
    }
    return '';
}

// 侧边栏导航功能
function navigateToPage(menuItem) {
    const contextPath = getContextPath();
    console.log('检测到的context path:', contextPath);
    
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
        if (targetPage === '运维管理.html') {
            console.log('当前已在运维管理页面');
            return;
        }

        const fullUrl = contextPath + '/' + targetPage;
        console.log('跳转到页面:', fullUrl);
        window.location.href = fullUrl;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}

// 消息提示函数
function showSuccessMessage(message) {
    console.log('✅ 成功:', message);
    
    // 创建成功提示元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    console.error('❌ 错误:', message);
    
    // 创建错误提示元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ==================== 类型配置管理 ====================

// 加载类型配置
async function loadTypeConfig() {
    try {
        const response = await fetch('/api/ticket/config/type');
        const data = await response.json();
        
        if (data.success || data.code === 200) {
            renderTypeList(data.data);
        } else {
            console.error('加载类型失败:', data.message);
        }
    } catch (error) {
        console.error('加载类型配置失败:', error);
    }
}

// 渲染类型列表
function renderTypeList(types) {
    const container = document.querySelector('#type-settings .type-settings-list');
    if (!container) {
        console.error('类型列表容器不存在');
        return;
    }
    
    container.innerHTML = '';
    
    types.forEach(type => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.dataset.type = type.typeKey;
        item.dataset.dbId = type.id;
        
        item.innerHTML = `
            <div class="item-content">
                <div class="item-info">
                    <span class="type-name">${type.typeName}</span>
                    <span class="type-key">${type.typeKey}</span>
                    ${type.typeDesc ? `<span class="type-desc">${type.typeDesc}</span>` : ''}
                </div>
                <div class="item-color" style="background-color: ${type.colorCode}"></div>
            </div>
            <div class="item-actions">
                <button class="btn-icon btn-edit" onclick="editType('${type.typeKey}')" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteType('${type.typeKey}')" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 编辑类型
window.editType = function(typeKey) {
    console.log('编辑类型:', typeKey);
    
    const typeItem = document.querySelector(`#type-settings [data-type="${typeKey}"]`);
    if (!typeItem) {
        console.error('找不到类型项:', typeKey);
        return;
    }
    
    const typeId = typeItem.dataset.dbId;
    const name = typeItem.querySelector('.type-name').textContent;
    const key = typeItem.querySelector('.type-key').textContent;
    const descElement = typeItem.querySelector('.type-desc');
    const desc = descElement ? descElement.textContent : '';
    const colorElement = typeItem.querySelector('.item-color');
    const color = colorElement ? colorElement.style.backgroundColor : '#007bff';
    
    // 填充编辑表单
    document.getElementById('editTypeId').value = typeId;
    document.getElementById('editTypeKey').value = key;
    document.getElementById('editTypeName').value = name;
    document.getElementById('editTypeDesc').value = desc;
    document.getElementById('editTypeColor').value = rgbToHex(color);
    
    // 显示模态框
    document.getElementById('editTypeModal').style.display = 'flex';
};

// 删除类型
window.deleteType = function(typeKey) {
    console.log('删除类型:', typeKey);
    
    const typeItem = document.querySelector(`#type-settings [data-type="${typeKey}"]`);
    if (typeItem) {
        const name = typeItem.querySelector('.type-name').textContent;
        
        if (confirm(`确定要删除 ${name} 吗？`)) {
            fetch(`/api/ticket/config/type/${typeKey}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                const isSuccess = data.success === true || data.code === 200;
                
                if (isSuccess) {
                    typeItem.remove();
                    console.log(`${name} 已删除`);
                    showSuccessMessage(`类型 ${name} 删除成功`);
                    loadTypeConfig();
                } else {
                    console.error('删除失败:', data.message);
                    showErrorMessage(data.message || '删除类型失败');
                }
            })
            .catch(error => {
                console.error('删除类型时发生错误:', error);
                showErrorMessage('删除类型时发生网络错误');
            });
        }
    }
};

// ==================== 来源配置管理 ====================

// 加载来源配置
async function loadSourceConfig() {
    try {
        const response = await fetch('/api/ticket/config/source');
        const data = await response.json();
        
        if (data.success || data.code === 200) {
            renderSourceList(data.data);
        } else {
            console.error('加载来源失败:', data.message);
        }
    } catch (error) {
        console.error('加载来源配置失败:', error);
    }
}

// 渲染来源列表
function renderSourceList(sources) {
    const container = document.querySelector('#source-settings .source-settings-list');
    if (!container) {
        console.error('来源列表容器不存在');
        return;
    }
    
    container.innerHTML = '';
    
    sources.forEach(source => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.dataset.source = source.sourceKey;
        item.dataset.dbId = source.id;
        
        item.innerHTML = `
            <div class="item-content">
                <div class="item-info">
                    <span class="source-name">${source.sourceName}</span>
                    <span class="source-key">${source.sourceKey}</span>
                    ${source.sourceDesc ? `<span class="source-desc">${source.sourceDesc}</span>` : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon btn-edit" onclick="editSource('${source.sourceKey}')" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteSource('${source.sourceKey}')" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 编辑来源
window.editSource = function(sourceKey) {
    console.log('编辑来源:', sourceKey);
    
    const sourceItem = document.querySelector(`#source-settings [data-source="${sourceKey}"]`);
    if (!sourceItem) {
        console.error('找不到来源项:', sourceKey);
        return;
    }
    
    const sourceId = sourceItem.dataset.dbId;
    const name = sourceItem.querySelector('.source-name').textContent;
    const key = sourceItem.querySelector('.source-key').textContent;
    const descElement = sourceItem.querySelector('.source-desc');
    const desc = descElement ? descElement.textContent : '';
    
    // 填充编辑表单
    document.getElementById('editSourceId').value = sourceId;
    document.getElementById('editSourceKey').value = key;
    document.getElementById('editSourceName').value = name;
    document.getElementById('editSourceDesc').value = desc;
    
    // 显示模态框
    document.getElementById('editSourceModal').style.display = 'flex';
};

// 删除来源
window.deleteSource = function(sourceKey) {
    console.log('删除来源:', sourceKey);
    
    const sourceItem = document.querySelector(`#source-settings [data-source="${sourceKey}"]`);
    if (sourceItem) {
        const name = sourceItem.querySelector('.source-name').textContent;
        
        if (confirm(`确定要删除 ${name} 吗？`)) {
            fetch(`/api/ticket/config/source/${sourceKey}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                const isSuccess = data.success === true || data.code === 200;
                
                if (isSuccess) {
                    sourceItem.remove();
                    console.log(`${name} 已删除`);
                    showSuccessMessage(`来源 ${name} 删除成功`);
                    loadSourceConfig();
                } else {
                    console.error('删除失败:', data.message);
                    showErrorMessage(data.message || '删除来源失败');
                }
            })
            .catch(error => {
                console.error('删除来源时发生错误:', error);
                showErrorMessage('删除来源时发生网络错误');
            });
        }
    }
};

// RGB转HEX颜色
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) return '#007bff';
    return '#' + values.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// ==================== 新增类型功能 ====================

// 新增类型按钮点击
window.addNewTicketType = function() {
    document.getElementById('editTypeModal').style.display = 'flex';
    document.getElementById('editTypeId').value = '';
    document.getElementById('editTypeKey').value = '';
    document.getElementById('editTypeName').value = '';
    document.getElementById('editTypeDesc').value = '';
    document.getElementById('editTypeColor').value = '#007bff';
};

// 保存类型编辑
window.saveTypeEdit = function() {
    const typeId = document.getElementById('editTypeId').value;
    const typeData = {
        typeKey: document.getElementById('editTypeKey').value.trim(),
        typeName: document.getElementById('editTypeName').value.trim(),
        typeDesc: document.getElementById('editTypeDesc').value.trim(),
        colorCode: document.getElementById('editTypeColor').value,
        isActive: 1
    };
    
    if (!typeData.typeKey || !typeData.typeName) {
        showErrorMessage('类型标识和名称不能为空');
        return;
    }
    
    const url = typeId ? `/api/ticket/config/type/${typeId}` : '/api/ticket/config/type';
    const method = typeId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeData)
    })
    .then(response => response.json())
    .then(data => {
        const isSuccess = data.success === true || data.code === 200;
        
        if (isSuccess) {
            showSuccessMessage(typeId ? '类型更新成功' : '类型创建成功');
            closeTypeEditModal();
            loadTypeConfig();
        } else {
            showErrorMessage(data.message || '操作失败');
        }
    })
    .catch(error => {
        console.error('保存类型失败:', error);
        showErrorMessage('保存类型失败');
    });
};

// 关闭类型编辑模态框
window.closeTypeEditModal = function() {
    document.getElementById('editTypeModal').style.display = 'none';
};

// ==================== 新增来源功能 ====================

// 新增来源按钮点击
window.addNewTicketSource = function() {
    document.getElementById('editSourceModal').style.display = 'flex';
    document.getElementById('editSourceId').value = '';
    document.getElementById('editSourceKey').value = '';
    document.getElementById('editSourceName').value = '';
    document.getElementById('editSourceDesc').value = '';
};

// 保存来源编辑
window.saveSourceEdit = function() {
    const sourceId = document.getElementById('editSourceId').value;
    const sourceData = {
        sourceKey: document.getElementById('editSourceKey').value.trim(),
        sourceName: document.getElementById('editSourceName').value.trim(),
        sourceDesc: document.getElementById('editSourceDesc').value.trim(),
        isActive: 1
    };
    
    if (!sourceData.sourceKey || !sourceData.sourceName) {
        showErrorMessage('来源标识和名称不能为空');
        return;
    }
    
    const url = sourceId ? `/api/ticket/config/source/${sourceId}` : '/api/ticket/config/source';
    const method = sourceId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sourceData)
    })
    .then(response => response.json())
    .then(data => {
        const isSuccess = data.success === true || data.code === 200;
        
        if (isSuccess) {
            showSuccessMessage(sourceId ? '来源更新成功' : '来源创建成功');
            closeSourceEditModal();
            loadSourceConfig();
        } else {
            showErrorMessage(data.message || '操作失败');
        }
    })
    .catch(error => {
        console.error('保存来源失败:', error);
        showErrorMessage('保存来源失败');
    });
};

// 关闭来源编辑模态框
window.closeSourceEditModal = function() {
    document.getElementById('editSourceModal').style.display = 'none';
};

// ==================== 我的工单数据渲染 ====================

// 渲染我的工单列表
function renderMyTicketList(tickets) {
    const listBody = document.getElementById('myTicketListBody');
    if (!listBody) {
        console.error('找不到工单列表容器');
        return;
    }
    
    // 清空现有内容
    listBody.innerHTML = '';
    
    if (!tickets || tickets.length === 0) {
        listBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>暂无工单</p>
            </div>
        `;
        return;
    }
    
    // 渲染每个工单
    tickets.forEach(ticket => {
        const ticketItem = createTicketListItem(ticket);
        listBody.appendChild(ticketItem);
    });
}

// 创建工单列表项
function createTicketListItem(ticket) {
    const item = document.createElement('div');
    item.className = 'ticket-list-item';
    item.dataset.ticketId = ticket.id;
    
    // 状态映射
    const statusMap = {
        'pending': { text: '待处理', class: 'pending' },
        'assigned': { text: '已分配', class: 'assigned' },
        'processing': { text: '处理中', class: 'processing' },
        'resolved': { text: '已解决', class: 'resolved' },
        'completed': { text: '已完成', class: 'completed' },
        'closed': { text: '已关闭', class: 'closed' }
    };
    
    const status = statusMap[ticket.status] || { text: ticket.status, class: 'unknown' };
    
    // 优先级映射
    const priorityMap = {
        'urgent': { text: 'P1 紧急', class: 'urgent' },
        'high': { text: 'P2 高', class: 'high' },
        'medium': { text: 'P3 中', class: 'medium' },
        'low': { text: 'P4 低', class: 'low' }
    };
    
    const priority = priorityMap[ticket.priorityKey] || { text: ticket.priorityKey, class: 'medium' };
    
    // 类型映射
    const typeMap = {
        'fault': { text: '故障', class: 'fault' },
        'incident': { text: '故障', class: 'incident' },
        'change': { text: '变更', class: 'change' },
        'request': { text: '服务请求', class: 'request' },
        'service': { text: '服务', class: 'service' },
        'consultation': { text: '咨询', class: 'consultation' },
        'maintenance': { text: '维护', class: 'maintenance' }
    };
    
    const type = typeMap[ticket.typeKey] || { text: ticket.typeKey, class: 'default' };
    
    // 来源映射
    const sourceMap = {
        // 数据库中的来源
        'alert': { text: '告警触发', icon: 'fa-bell' },
        'manual': { text: '人工创建', icon: 'fa-user-edit' },
        'scheduled': { text: '计划任务', icon: 'fa-clock' },
        'user': { text: '用户报告', icon: 'fa-user' },
        // 兼容旧数据
        'user_report': { text: '用户报告', icon: 'fa-user' },
        'system_monitor': { text: '系统监控', icon: 'fa-desktop' },
        'email': { text: '邮件', icon: 'fa-envelope' },
        'phone': { text: '电话', icon: 'fa-phone' },
        'web': { text: 'Web端', icon: 'fa-globe' }
    };
    
    const source = sourceMap[ticket.sourceKey] || { text: ticket.sourceKey || '未知', icon: 'fa-question' };
    
    // 格式化时间
    const createdTime = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('zh-CN') : '-';
    const assignedTime = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('zh-CN') : '-';
    
    item.innerHTML = `
        <div class="list-item-cell checkbox-col">
            <input type="checkbox" class="my-ticket-checkbox" data-ticket-id="${ticket.id}">
        </div>
        <div class="list-item-cell">
            <span class="ticket-no">${ticket.ticketNo || '-'}</span>
        </div>
        <div class="list-item-cell status-col">
            <span class="status-badge ${status.class}">${status.text}</span>
        </div>
        <div class="list-item-cell title-col">
            <div class="ticket-title">${ticket.title || '无标题'}</div>
        </div>
        <div class="list-item-cell type-col">
            <span class="type-badge ${type.class}">${type.text}</span>
        </div>
        <div class="list-item-cell priority-col">
            <span class="priority-badge ${priority.class}">${priority.text}</span>
        </div>
        <div class="list-item-cell">
            <span class="source-badge">
                <i class="fas ${source.icon}"></i> ${source.text}
            </span>
        </div>
        <div class="list-item-cell creator-col">
            <span class="creator-name">${ticket.creatorName || '未知'}</span>
        </div>
        <div class="list-item-cell date-col">
            <span class="ticket-date">${createdTime}</span>
        </div>
        <div class="list-item-cell date-col">
            <span class="ticket-date">${assignedTime}</span>
        </div>
        <div class="list-item-cell actions-col">
            <button class="btn-icon btn-view" onclick="viewTicketDetail(${ticket.id})" title="查看详情">
                <i class="fas fa-eye"></i>
            </button>
            ${ticket.status === 'processing' || ticket.status === 'pending' ? `
                <button class="btn-icon btn-complete" onclick="completeTicket(${ticket.id})" title="完成">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    return item;
}

// 更新分页信息
function updateMyTicketPagination(pageData) {
    if (!pageData) return;
    
    console.log('分页信息:', {
        current: pageData.current,
        size: pageData.size,
        total: pageData.total,
        pages: pageData.pages
    });
    
    // 更新分页UI
    const paginationInfo = document.querySelector('#myTicketsPage .pagination-info');
    if (paginationInfo && pageData) {
        const current = pageData.current || 1;
        const size = pageData.size || 20;
        const total = pageData.total || 0;
        const start = total === 0 ? 0 : ((current - 1) * size + 1);
        const end = Math.min(current * size, total);
        paginationInfo.textContent = `显示 ${start}-${end} 条，共 ${total} 条记录`;
    }
    
    // 更新分页按钮
    const paginationControls = document.querySelector('#myTicketsPage .pagination-controls');
    if (paginationControls && pageData) {
        const pages = pageData.pages || 1;
        const current = pageData.current || 1;
        
        let buttonsHTML = `
            <button class="btn-pagination" ${current <= 1 ? 'disabled' : ''} onclick="loadMyTicketData(${current - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        for (let i = 1; i <= Math.min(pages, 5); i++) {
            buttonsHTML += `
                <button class="btn-pagination ${i === current ? 'active' : ''}" onclick="loadMyTicketData(${i})">${i}</button>
            `;
        }
        
        buttonsHTML += `
            <button class="btn-pagination" ${current >= pages ? 'disabled' : ''} onclick="loadMyTicketData(${current + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationControls.innerHTML = buttonsHTML;
    }
}

// 查看工单详情
window.viewTicketDetail = async function(ticketId) {
    console.log('🔍 [开始] 查看工单详情, ID:', ticketId);
    
    try {
        console.log('📡 [请求] 正在获取工单数据...');
        const response = await fetch(`/api/tickets/${ticketId}`);
        console.log('📥 [响应] HTTP状态:', response.status);
        
        const result = await response.json();
        console.log('📦 [数据] API结果:', result);
        
        if (result.success || result.code === 200) {
            const ticket = result.data;
            console.log('✅ [成功] 工单数据:', ticket);
            
            if (!ticket) {
                console.error('❌ [错误] 工单数据为空');
                showErrorMessage('工单不存在');
                return;
            }
            
            console.log('🎨 [显示] 准备显示详情弹窗...');
            showMyTicketDetailModal(ticket);
            console.log('✨ [完成] 弹窗已显示');
        } else {
            console.error('❌ [失败] API返回失败:', result.message);
            showErrorMessage(result.message || '加载工单详情失败');
        }
    } catch (error) {
        console.error('💥 [异常] 加载工单详情失败:', error);
        showErrorMessage('加载失败，请重试');
    }
};

// 显示工单详情弹窗
function showMyTicketDetailModal(ticket) {
    console.log('🎭 [Modal] 开始创建详情弹窗, 工单:', ticket);
    
    // 先移除已存在的详情弹窗（如果有）
    const existingModal = document.querySelector('#ticketDetailModal');
    if (existingModal) {
        console.log('🗑️ [Modal] 移除已存在的详情弹窗');
        existingModal.remove();
    }
    
    // 获取状态信息
    const statusMap = {
        'pending': { text: '待处理', color: '#fa8c16', icon: 'fa-clock' },
        'processing': { text: '处理中', color: '#1890ff', icon: 'fa-spinner' },
        'resolved': { text: '已解决', color: '#52c41a', icon: 'fa-check-circle' },
        'closed': { text: '已关闭', color: '#8c8c8c', icon: 'fa-times-circle' }
    };
    
    const priorityMap = {
        'urgent': { text: 'P1 紧急', color: '#f5222d', icon: 'fa-exclamation-circle' },
        'high': { text: 'P2 高', color: '#fa8c16', icon: 'fa-arrow-up' },
        'medium': { text: 'P3 中', color: '#1890ff', icon: 'fa-minus' },
        'low': { text: 'P4 低', color: '#52c41a', icon: 'fa-arrow-down' }
    };
    
    const typeMap = {
        'incident': { text: '故障', color: '#f5222d', icon: 'fa-bug' },
        'change': { text: '变更', color: '#fa8c16', icon: 'fa-exchange-alt' },
        'service': { text: '服务请求', color: '#1890ff', icon: 'fa-hands-helping' },
        'consultation': { text: '咨询', color: '#722ed1', icon: 'fa-question-circle' },
        'maintenance': { text: '维护', color: '#13c2c2', icon: 'fa-tools' }
    };
    
    const sourceMap = {
        'user_report': { text: '用户报告', icon: 'fa-user' },
        'system_monitor': { text: '系统监控', icon: 'fa-desktop' },
        'email': { text: '邮件', icon: 'fa-envelope' },
        'phone': { text: '电话', icon: 'fa-phone' },
        'web': { text: 'Web端', icon: 'fa-globe' }
    };
    
    const status = statusMap[ticket.status] || { text: ticket.status, color: '#8c8c8c', icon: 'fa-question' };
    const priority = priorityMap[ticket.priorityKey] || { text: ticket.priorityKey, color: '#1890ff', icon: 'fa-minus' };
    const type = typeMap[ticket.typeKey] || { text: ticket.typeKey, color: '#1890ff', icon: 'fa-file' };
    const source = sourceMap[ticket.sourceKey] || { text: ticket.sourceKey || '未知', icon: 'fa-question' };
    
    // 格式化时间
    const formatTime = (time) => time ? new Date(time).toLocaleString('zh-CN') : '-';
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'ticketDetailModal';
    modal.innerHTML = `
        <div class="modal-container ticket-detail-modal">
            <div class="modal-header">
                <h3><i class="fas fa-file-alt"></i> 工单详情</h3>
                <button class="modal-close" onclick="closeMyTicketDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <!-- 头部概览 -->
                <div class="detail-section detail-header-section">
                    <div class="detail-header-badges">
                        <span class="status-badge-large" style="background-color: ${status.color}15; color: ${status.color}; border-color: ${status.color};">
                            <i class="fas ${status.icon}"></i> ${status.text}
                        </span>
                        <span class="priority-badge-large" style="background-color: ${priority.color}15; color: ${priority.color};">
                            <i class="fas ${priority.icon}"></i> ${priority.text}
                        </span>
                        <span class="type-badge-large" style="background-color: ${type.color}15; color: ${type.color};">
                            <i class="fas ${type.icon}"></i> ${type.text}
                        </span>
                    </div>
                    <div class="detail-ticket-no">
                        <label>工单编号</label>
                        <div class="ticket-no-display">${ticket.ticketNo || '-'}</div>
                    </div>
                </div>
                
                <!-- 工单内容 -->
                <div class="detail-section">
                    <div class="section-title">工单信息</div>
                    <div class="detail-item full-width">
                        <label>标题</label>
                        <div class="detail-value ticket-title-display">${ticket.title || '-'}</div>
                    </div>
                    ${ticket.description ? `
                        <div class="detail-item full-width">
                            <label>详细描述</label>
                            <div class="detail-value ticket-desc-display">${ticket.description}</div>
                        </div>
                    ` : ''}
                    ${ticket.resolution ? `
                        <div class="detail-item full-width">
                            <label>解决方案</label>
                            <div class="detail-value ticket-resolution-display">${ticket.resolution}</div>
                        </div>
                    ` : ''}
                    <div class="detail-item full-width">
                        <label><i class="fas fa-paperclip"></i> 附件</label>
                        <div class="detail-value">
                            <div class="attachment-list">
                                ${renderAttachments(ticket.attachmentUrls)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 时间信息 -->
                <div class="detail-section">
                    <div class="section-title">时间信息</div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>创建时间</label>
                            <div class="detail-value"><i class="fas fa-clock"></i> ${formatTime(ticket.createdAt)}</div>
                        </div>
                        <div class="detail-item">
                            <label>最后更新</label>
                            <div class="detail-value"><i class="fas fa-sync-alt"></i> ${formatTime(ticket.updatedAt)}</div>
                        </div>
                        ${ticket.resolvedAt ? `
                            <div class="detail-item">
                                <label>完成时间</label>
                                <div class="detail-value"><i class="fas fa-check-circle" style="color: #52c41a;"></i> ${formatTime(ticket.resolvedAt)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeMyTicketDetailModal()">
                    <i class="fas fa-times"></i> 关闭
                </button>
                ${ticket.status === 'processing' || ticket.status === 'pending' ? `
                    <button class="btn btn-success" onclick="closeMyTicketDetailModal(); completeTicket(${ticket.id});">
                        <i class="fas fa-check"></i> 完成工单
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    console.log('📝 [Modal] 弹窗HTML已创建');
    
    document.body.appendChild(modal);
    console.log('✅ [Modal] 弹窗已添加到DOM');
    
    // 阻止弹窗内容的点击事件冒泡
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', function(e) {
            console.log('🖱️ [Modal] 点击了弹窗内容（已阻止冒泡）');
            e.stopPropagation();
        });
        console.log('🛡️ [Modal] 事件冒泡阻止已设置');
    } else {
        console.error('❌ [Modal] 找不到modal-container！');
    }
    
    // 添加点击遮罩关闭
    modal.addEventListener('click', function(e) {
        console.log('🖱️ [Modal] 点击事件触发, target:', e.target.className);
        if (e.target === modal) {
            console.log('✅ [Modal] 点击了遮罩，关闭弹窗');
            closeMyTicketDetailModal();
        } else {
            console.log('⏭️ [Modal] 点击的不是遮罩，忽略');
        }
    });
    console.log('👆 [Modal] 遮罩点击事件已绑定');
    
    // 添加ESC键关闭
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            console.log('⌨️ [Modal] 按下ESC键，关闭弹窗');
            closeMyTicketDetailModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    console.log('⌨️ [Modal] ESC键事件已绑定');
    
    console.log('🎉 [Modal] 弹窗显示完成！');
    
    // 验证弹窗是否真的在DOM中
    setTimeout(() => {
        const checkModal = document.querySelector('#ticketDetailModal');
        if (checkModal) {
            console.log('✅ [验证] 1秒后弹窗仍然存在于DOM中');
            console.log('📊 [验证] 弹窗display:', window.getComputedStyle(checkModal).display);
            console.log('📊 [验证] 弹窗opacity:', window.getComputedStyle(checkModal).opacity);
            console.log('📊 [验证] 弹窗visibility:', window.getComputedStyle(checkModal).visibility);
            console.log('📊 [验证] 弹窗z-index:', window.getComputedStyle(checkModal).zIndex);
        } else {
            console.error('❌ [验证] 1秒后弹窗已经不在DOM中了！！！');
        }
    }, 1000);
}

// 关闭工单详情弹窗
window.closeMyTicketDetailModal = function() {
    console.log('🚪 [Modal] 开始关闭弹窗');
    const modal = document.querySelector('#ticketDetailModal');
    if (modal) {
        console.log('✅ [Modal] 找到弹窗，正在移除');
        modal.remove();
        console.log('✅ [Modal] 弹窗已关闭');
    } else {
        console.log('⚠️ [Modal] 没有找到弹窗（可能已经关闭）');
    }
};

// 开始处理工单
window.startProcessingTicket = async function(ticketId) {
    if (!confirm('确定要开始处理这个工单吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage('工单已开始处理');
            loadMyTicketData(); // 刷新列表
        } else {
            showErrorMessage(result.message || '操作失败');
        }
    } catch (error) {
        console.error('开始处理工单失败:', error);
        showErrorMessage('操作失败，请重试');
    }
};

// 完成工单
window.completeTicket = async function(ticketId) {
    if (!confirm('确定要标记此工单为已完成吗？')) {
        return;
    }
    
    try {
        // 获取当前用户ID
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            showErrorMessage('无法获取当前用户信息');
            return;
        }
        
        const response = await fetch(`/api/tickets/${ticketId}/complete?operatorId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            showSuccessMessage('工单已完成');
            loadMyTicketData(); // 刷新列表
        } else {
            showErrorMessage(result.message || '操作失败');
        }
    } catch (error) {
        console.error('完成工单失败:', error);
        showErrorMessage('操作失败，请重试');
    }
};

// ==================== 用户管理 ====================

/**
 * 获取当前登录用户
 */
function getCurrentUser() {
    // 尝试从localStorage获取用户信息
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            // 确保id是数字类型
            if (user.id) {
                user.id = parseInt(user.id);
            }
            return user;
        } catch (e) {
            console.error('解析用户信息失败:', e);
        }
    }
    
    // 如果没有用户信息，返回默认用户（用于测试）
    return {
        id: 1,  // 数字类型
        name: '管理员',
        username: 'admin'
    };
}

// ==================== 上传历史功能 ====================

/**
 * 加载上传历史记录
 */
window.loadUploadHistory = async function() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            console.log('未获取到用户信息');
            return;
        }
        
        const response = await fetch(`/api/tickets/import/history/recent?uploaderId=${currentUser.id}&limit=10`);
        const result = await response.json();
        
        if (result.success || result.code === 200) {
            renderUploadHistory(result.data);
        } else {
            console.error('加载上传历史失败:', result.message);
        }
    } catch (error) {
        console.error('加载上传历史失败:', error);
    }
};

/**
 * 渲染上传历史
 */
function renderUploadHistory(records) {
    const historyList = document.getElementById('uploadHistoryList');
    if (!historyList) return;
    
    if (!records || records.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>暂无上传记录</p>
                <span>上传文件后，记录将显示在这里</span>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    records.forEach(record => {
        const statusMap = {
            'processing': { icon: '⏳', text: '处理中', class: 'status-processing' },
            'completed': { icon: '✅', text: '完成', class: 'status-success' },
            'failed': { icon: '❌', text: '失败', class: 'status-error' }
        };
        
        const status = statusMap[record.status] || statusMap.processing;
        const progress = record.totalCount > 0 
            ? Math.round((record.successCount / record.totalCount) * 100)
            : 0;
        
        const historyItemHtml = `
            <div class="upload-history-item">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${getFileIcon(record.fileName)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${record.fileName}</div>
                        <div class="file-size">${formatFileSize(record.fileSize)}</div>
                        <div class="file-time">${formatDateTime(record.createdAt)}</div>
                    </div>
                </div>
                <div class="progress-info">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <div class="progress-text">${progress}%</div>
                </div>
                <div class="upload-status">
                    <span class="${status.class}">
                        ${status.icon} ${status.text}
                    </span>
                    ${record.status === 'completed' ? `
                        <div class="status-detail">
                            成功: ${record.successCount} / 失败: ${record.failCount}
                        </div>
                    ` : ''}
                    ${record.status === 'failed' && record.errorMessage ? `
                        <div class="error-message">${record.errorMessage}</div>
                    ` : ''}
                </div>
            </div>
        `;
        
        historyList.insertAdjacentHTML('beforeend', historyItemHtml);
    });
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 格式化日期时间
 */
function formatDateTime(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    }
    // 小于24小时
    if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    }
    // 显示完整时间
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0');
}

// ==================== 模板下载功能 ====================

/**
 * 下载CSV模板（Excel可直接打开）
 */
window.downloadExcelTemplate = function() {
    // 生成当前日期和未来日期（Timestamp格式）
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    // 格式化为 yyyy-MM-dd HH:mm:ss
    const formatTimestamp = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    // CSV格式的模板数据（Excel可以直接打开CSV文件）
    // 注意：期望完成时间必须使用 yyyy-MM-dd HH:mm:ss 格式（Timestamp）
    const csvContent = `\ufeff标题,描述,优先级,类型,来源,创建人,期望完成时间
【紧急】生产环境数据库服务器宕机,生产环境MySQL主库突然宕机所有业务系统无法访问数据库。需要立即排查原因并恢复服务。影响范围：全部生产系统,urgent,incident,system_monitor,张三,${formatTimestamp(tomorrow)}
CRM系统版本升级至v3.0,计划将CRM系统从v2.5升级到v3.0版本。升级时间：本周六凌晨2:00-6:00。需要提前做好数据备份和回滚预案,high,change,user_report,王五,${formatTimestamp(threeDays)}
应用服务器性能优化,Web应用服务器CPU使用率长期维持在85%以上需要进行性能分析和优化。建议检查应用程序代码数据库查询缓存策略等,medium,maintenance,user_report,钱七,${formatTimestamp(oneWeek)}
数据库备份策略咨询,希望咨询如何制定合理的数据库备份策略包括全量备份和增量备份的时间安排备份保留周期等,low,consultation,email,周九,${formatTimestamp(twoWeeks)}
新员工账号开通申请,新员工张三入职需要开通OA系统邮箱VPN等系统的访问权限。部门：技术部,medium,service,user_report,吴十,${formatTimestamp(threeDays)}

# ========== 字段说明 ==========
# 
# 【标题】必填 - 工单简短标题建议加上优先级标签如【紧急】
# 【描述】可选 - 详细描述问题背景影响范围处理要求等
# 
# 【优先级】必填 - 可选值：
#   urgent  - P1紧急（影响业务需立即处理）
#   high    - P2高（严重影响需优先处理）
#   medium  - P3中（一般问题正常排期）
#   low     - P4低（优化建议可延后处理）
# 
# 【类型】必填 - 可选值：
#   incident     - 故障处理（系统故障设备故障等紧急问题）
#   change       - 变更申请（系统升级配置修改等计划变更）
#   service      - 服务请求（权限申请资源申请等服务需求）
#   consultation - 咨询工单（技术咨询使用指导等）
#   maintenance  - 维护工单（日常维护巡检等计划工作）
# 
# 【来源】必填 - 可选值：
#   user_report    - 用户报告（用户主动提交）
#   system_monitor - 系统监控（监控系统自动创建）
#   api            - API接口（第三方系统对接）
#   email          - 邮件（邮件自动转工单）
# 
# 【创建人】必填 - 创建工单的用户姓名如张三
# 【期望完成时间】可选 - 格式：yyyy-MM-dd HH:mm:ss（必须完整，包含秒）
#   示例：2024-11-04 18:00:00
#   注意：不要使用 2024/11/4 或其他格式，必须是 yyyy-MM-dd HH:mm:ss
# 
# 注：工单创建后可在系统中再指派处理人无需在导入时指定`;

    downloadFile(csvContent, '工单批量导入模板.csv', 'text/csv;charset=utf-8');
    showSuccessMessage('Excel模板下载成功！');
};

/**
 * 下载CSV模板
 */
window.downloadCsvTemplate = function() {
    // 生成动态日期
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const formatTimestamp = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    const csvContent = `\ufeff标题,描述,优先级,类型,来源,创建人,期望完成时间
【紧急】生产环境数据库服务器宕机,生产环境MySQL主库突然宕机所有业务系统无法访问数据库。需要立即排查原因并恢复服务。影响范围：全部生产系统,urgent,incident,system_monitor,张三,${formatTimestamp(tomorrow)}
CRM系统版本升级至v3.0,计划将CRM系统从v2.5升级到v3.0版本。升级时间：本周六凌晨2:00-6:00。需要提前做好数据备份和回滚预案,high,change,user_report,王五,${formatTimestamp(threeDays)}
应用服务器性能优化,Web应用服务器CPU使用率长期维持在85%以上需要进行性能分析和优化。建议检查应用程序代码数据库查询缓存策略等,medium,maintenance,user_report,钱七,${formatTimestamp(oneWeek)}
数据库备份策略咨询,希望咨询如何制定合理的数据库备份策略包括全量备份和增量备份的时间安排备份保留周期等,low,consultation,email,周九,${formatTimestamp(twoWeeks)}
新员工账号开通申请,新员工张三入职需要开通OA系统邮箱VPN等系统的访问权限。部门：技术部,medium,service,user_report,吴十,${formatTimestamp(threeDays)}

# ========== 字段说明 ==========
# 【标题】必填 - 工单简短标题
# 【描述】可选 - 详细描述问题
# 【优先级】urgent/high/medium/low
# 【类型】incident/change/service/consultation/maintenance  
# 【来源】user_report/system_monitor/api/email
# 【创建人】必填 - 创建人姓名
# 【期望完成时间】可选 - 格式：yyyy-MM-dd HH:mm:ss（完整格式，包含秒）
#   正确示例：2024-11-04 18:00:00
#   错误示例：2024/11/4 18:00 或 2024-11-04（会导致导入失败）
# 
# 注：处理人可在系统中后续指派`;

    downloadFile(csvContent, '工单批量导入模板.csv', 'text/csv;charset=utf-8');
    showSuccessMessage('CSV模板下载成功！');
};

/**
 * 下载文本示例模板
 */
window.downloadTextTemplate = function() {
    // 生成动态日期
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const formatTimestamp = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    const textContent = `╔═══════════════════════════════════════════════════════╗
║          工单文本智能导入 - 使用说明                    ║
╚═══════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────┐
│ 📋 格式要求                                           │
└─────────────────────────────────────────────────────┘

  1. 每个工单之间用【空行】分隔
  2. 每个工单的【第一行】是标题
  3. 后续行是详细描述
  4. 系统会自动识别关键词，智能设置优先级和类型

┌─────────────────────────────────────────────────────┐
│ 🔍 关键词识别规则                                      │
└─────────────────────────────────────────────────────┘

【优先级关键词】
  • 紧急 | urgent | P1     → P1紧急
  • 高   | high   | P2     → P2高
  • 低   | low    | P4     → P4低
  • 默认                    → P3中

【类型关键词】
  • 故障 | incident | 报障  → 故障处理
  • 变更 | change           → 变更申请
  • 维护 | maintenance      → 维护工单
  • 咨询 | consultation     → 咨询工单
  • 默认                    → 服务请求

┌─────────────────────────────────────────────────────┐
│ 📝 示例工单（可直接使用）                               │
└─────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【紧急】生产环境数据库服务器宕机
生产环境MySQL主库突然宕机，导致所有业务系统无法访问数据库
需要立即重启数据库服务并排查宕机原因
影响范围：全部生产系统
创建人：张三
期望完成：${formatTimestamp(tomorrow)}

CRM系统版本升级变更申请
计划将CRM系统从v2.5升级到v3.0版本
升级时间：本周六凌晨2:00-6:00
需要提前做好数据备份和回滚预案
影响业务：销售部门周六暂停使用CRM
创建人：王五
期望完成：${formatTimestamp(threeDays)}

应用服务器性能优化维护
Web应用服务器CPU使用率长期维持在85%以上
需要进行性能分析和优化
建议检查：应用程序代码、数据库查询、缓存策略
创建人：钱七
期望完成：${formatTimestamp(oneWeek)}

数据库备份策略咨询
希望咨询如何制定合理的数据库备份策略
包括全量备份和增量备份的时间安排
以及备份数据的保留周期设置
创建人：周九
期望完成：${formatTimestamp(twoWeeks)}

新员工账号开通服务请求
新员工入职，需要开通以下系统权限：
1. OA办公系统
2. 企业邮箱 zhangsan@company.com
3. VPN远程访问
所属部门：技术部
创建人：吴十
期望完成：${formatTimestamp(threeDays)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 温馨提示：
  • 建议在标题中明确标注优先级，如【紧急】
  • 描述要清晰，包含：问题现象、影响范围、处理要求
  • 每个工单之间必须有空行分隔
  • 可以一次性导入多个工单
  • 处理人可在工单创建后在系统中指派

📋 扩展字段说明：
  • 创建人格式：创建人：姓名 如 张三
  • 期望完成格式：期望完成：yyyy-MM-dd HH:mm:ss（完整格式，包含秒）
    正确示例：期望完成：2024-11-04 18:00:00
    错误示例：期望完成：2024/11/4 18:00（会导致解析失败）
  • 扩展字段都是可选的，系统会智能提取

════════════════════════════════════════════════════════
请在下方开始填写您的工单内容：
════════════════════════════════════════════════════════

`;

    downloadFile(textContent, '工单批量导入文本示例.txt', 'text/plain;charset=utf-8');
    showSuccessMessage('文本示例下载成功！');
};

/**
 * 通用文件下载函数
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME类型
 */
function downloadFile(content, filename, mimeType) {
    // 创建Blob对象
    const blob = new Blob([content], { type: mimeType });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * 跳转到资产管理页面并高亮显示设备
 * @param {string} deviceName - 设备名称
 */
async function jumpToAssetPage(deviceName) {
    if (!deviceName) {
        showErrorMessage('设备名称为空');
        return;
    }
    
    try {
        // 先查询设备是否存在
        const response = await fetch(`/api/asset/search?keyword=${encodeURIComponent(deviceName)}`);
        const result = await response.json();
        
        if (!result.success && result.code !== 200) {
            showErrorMessage('设备不存在：' + deviceName);
            return;
        }
        
        if (!result.data || result.data.length === 0) {
            showErrorMessage('未找到设备：' + deviceName);
            return;
        }
        
        const asset = result.data[0];
        
        // 保存设备信息到sessionStorage，用于页面加载后高亮
        sessionStorage.setItem('highlightAssetId', asset.id);
        sessionStorage.setItem('highlightDeviceName', deviceName);
        
        // 切换到资产管理页面
        navigateToPage('资产管理');
        
        // 延迟一点时间等待页面渲染，然后高亮
        setTimeout(() => {
            highlightAssetRow(asset.id);
        }, 500);
        
    } catch (error) {
        console.error('查询设备失败:', error);
        // 即使查询失败，也尝试跳转到资产管理页面
        sessionStorage.setItem('highlightDeviceName', deviceName);
        navigateToPage('资产管理');
    }
}

/**
 * 高亮显示资产行
 * @param {number} assetId - 资产ID
 */
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

// 暴露函数到全局
window.jumpToAssetPage = jumpToAssetPage;
window.highlightAssetRow = highlightAssetRow;

// 暴露派发页面的查看和编辑函数到全局
window.viewUnassignedTicket = viewUnassignedTicket;
window.editUnassignedTicket = editUnassignedTicket;
window.assignSingleTicket = assignSingleTicket;
window.assignTicket = assignTicket;
window.showTicketDetailModal = showTicketDetailModal;
window.showEditTicketModal = showEditTicketModal;
window.closeEditTicketModal = closeEditTicketModal;
window.saveEditedTicket = saveEditedTicket;
window.closeAssignModal = closeAssignModal;
window.confirmAssign = confirmAssign;
window.downloadAttachment = downloadAttachment;
window.removeCreateFile = removeCreateFile;
window.closeCreateTicketModal = closeCreateTicketModal;
window.saveNewTicket = saveNewTicket;

// ==================== 我的工单批量完成功能 ====================

/**
 * 全选/取消全选我的工单复选框
 */
document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('selectAllMyTickets');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.my-ticket-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBatchCompleteButton();
        });
    }
    
    // 绑定批量完成按钮
    const batchCompleteBtn = document.getElementById('batchCompleteBtn');
    if (batchCompleteBtn) {
        batchCompleteBtn.addEventListener('click', batchCompleteTickets);
    }
    
    // 绑定刷新按钮
    const refreshBtn = document.getElementById('refreshMyTicketsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadMyTicketData();
        });
    }
    
    // 监听复选框变化
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('my-ticket-checkbox')) {
            updateBatchCompleteButton();
        }
    });
});

/**
 * 更新批量完成按钮状态
 */
function updateBatchCompleteButton() {
    const batchCompleteBtn = document.getElementById('batchCompleteBtn');
    if (!batchCompleteBtn) return;
    
    const selectedCheckboxes = document.querySelectorAll('.my-ticket-checkbox:checked');
    batchCompleteBtn.disabled = selectedCheckboxes.length === 0;
    
    if (selectedCheckboxes.length > 0) {
        batchCompleteBtn.innerHTML = `<i class="fas fa-check-double"></i> 批量完成 (${selectedCheckboxes.length})`;
    } else {
        batchCompleteBtn.innerHTML = '<i class="fas fa-check-double"></i> 批量完成';
    }
}

/**
 * 批量完成工单
 */
async function batchCompleteTickets() {
    const selectedCheckboxes = document.querySelectorAll('.my-ticket-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showErrorMessage('请至少选择一个工单');
        return;
    }
    
    const ticketIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.ticketId);
    
    if (!confirm(`确定要将选中的 ${ticketIds.length} 个工单标记为已完成吗？`)) {
        return;
    }
    
    try {
        // 显示加载提示
        showLoading('正在批量完成工单...');
        
        let successCount = 0;
        let failCount = 0;
        
        // 获取当前用户ID
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            hideLoading();
            showErrorMessage('无法获取当前用户信息');
            return;
        }
        
        // 依次完成每个工单
        for (const ticketId of ticketIds) {
            try {
                const response = await fetch(`/api/tickets/${ticketId}/complete?operatorId=${currentUser.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success || result.code === 200) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`工单 ${ticketId} 完成失败:`, result.message);
                }
            } catch (error) {
                failCount++;
                console.error(`工单 ${ticketId} 完成失败:`, error);
            }
        }
        
        hideLoading();
        
        // 显示结果
        if (successCount > 0) {
            showSuccessMessage(`成功完成 ${successCount} 个工单${failCount > 0 ? `，失败 ${failCount} 个` : ''}`);
            
            // 刷新列表
            loadMyTicketData();
            
            // 取消全选
            const selectAllCheckbox = document.getElementById('selectAllMyTickets');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
        } else {
            showErrorMessage('批量完成失败，请检查网络连接或稍后重试');
        }
        
    } catch (error) {
        hideLoading();
        console.error('批量完成工单失败:', error);
        showErrorMessage('批量完成失败: ' + error.message);
    }
}

// 暴露批量完成函数到全局
window.batchCompleteTickets = batchCompleteTickets;
window.updateBatchCompleteButton = updateBatchCompleteButton;


