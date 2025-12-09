// Syslog配置页面相关函数

// 绑定配置标签页事件
function bindConfigTabEvents() {
    // 标签页切换 - 更新为使用现代化样式类
    document.querySelectorAll('.tab-btn-modern').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchConfigTab(tabName);
        });
    });
    
    // 来源类型切换
    document.querySelectorAll('input[name="sourceType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const specificIpGroup = document.getElementById('specificIpGroup');
            if (this.value === 'specific') {
                specificIpGroup.style.display = 'block';
            } else {
                specificIpGroup.style.display = 'none';
            }
        });
    });
    
    // 初始化多选框的点击即多选功能
    initMultiSelectClick();
}

// 初始化多选框点击即多选功能
function initMultiSelectClick() {
    const multiSelects = ['filterDeviceType', 'filterSeverity'];
    
    multiSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // 使用更简单的click事件，不阻止默认行为
            select.addEventListener('click', function(e) {
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    // 使用setTimeout确保在默认行为之后执行
                    setTimeout(() => {
                        // 触发change事件以便其他逻辑响应
                        this.dispatchEvent(new Event('change'));
                    }, 0);
                }
            });
            
            // 优化：双击也能正常工作
            select.addEventListener('dblclick', function(e) {
                const option = e.target;
                if (option.tagName === 'OPTION') {
                    option.selected = !option.selected;
                    this.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

// 切换配置标签页
function switchConfigTab(tabName) {
    // 切换标签按钮状态 - 更新为使用现代化样式类
    document.querySelectorAll('.tab-btn-modern').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // 切换标签页内容 - 更新为使用现代化样式类
    document.querySelectorAll('.tab-pane-modern').forEach(pane => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`${tabName}-tab`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
}

// 加载规则列表
async function loadRulesList() {
    console.log('开始加载规则列表...');
    try {
        const response = await fetch('/api/logs/rules');
        console.log('规则列表响应状态:', response.status);
        
        const result = await response.json();
        console.log('规则列表响应数据:', result);
        
        if (result.code === 200) {
            console.log('规则数据:', result.data);
            renderRulesTable(result.data);
        } else {
            console.error('加载规则列表失败:', result.message);
        }
    } catch (error) {
        console.error('加载规则列表异常:', error);
    }
}

// 渲染规则表格
function renderRulesTable(rules) {
    const tbody = document.getElementById('rulesTableBody');
    if (!tbody) return;
    
    if (!rules || rules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无规则</td></tr>';
        return;
    }
    
    const rows = rules.map(rule => {
        const statusSwitch = `
            <label class="switch-modern">
                <input type="checkbox" ${rule.isEnabled ? 'checked' : ''} 
                       onchange="toggleRuleStatus(${rule.id}, this.checked, this)">
                <span class="slider-modern"></span>
            </label>
        `;
        
        const sourceText = rule.sourceType === 'any' ? '任意来源' : `指定IP: ${rule.sourceIps || ''}`;
        
        const filterSummary = buildFilterSummary(rule);
        
        const effectiveTime = rule.effectiveTime || '始终生效';
        
        return `
            <tr>
                <td><strong>${rule.ruleName}</strong></td>
                <td>${statusSwitch}</td>
                <td>${sourceText}</td>
                <td>${filterSummary}</td>
                <td>${effectiveTime}</td>
                <td>
                    <button class="btn-sm-modern btn-outline-modern" onclick="editRule(${rule.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn-sm-modern btn-danger-modern" onclick="deleteRule(${rule.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// 构建过滤条件摘要
function buildFilterSummary(rule) {
    const parts = [];
    
    if (rule.filterDeviceType) {
        // 设备类型映射
        const deviceTypeMap = {
            'SERVER': '服务器',
            'NETWORK': '网络设备',
            'STORAGE': '存储设备',
            'VIDEO': '视频设备'
        };
        const deviceTypes = rule.filterDeviceType.split(',').map(type => deviceTypeMap[type] || type).join(',');
        parts.push(`设备类型: ${deviceTypes}`);
    }
    
    if (rule.filterSeverity) {
        parts.push(`严重程度: ${rule.filterSeverity}`);
    }
    
    if (rule.filterKeywords) {
        parts.push(`关键字: ${rule.filterKeywords}`);
    }
    
    return parts.length > 0 ? parts.join('; ') : '无条件';
}

// 显示新增规则弹窗
async function showAddRuleModal() {
    document.getElementById('ruleModalTitle').textContent = '新增规则';
    document.getElementById('ruleForm').reset();
    const modal = document.getElementById('ruleModal');
    modal.style.display = 'flex'; // modal-modern使用flex布局居中
    
    // 加载严重程度选项
    await loadSeverityOptions();
    
    // 重新初始化点击即多选功能
    setTimeout(() => initMultiSelectClick(), 100);
}

// 编辑规则
async function editRule(ruleId) {
    try {
        const response = await fetch(`/api/logs/rules/${ruleId}`);
        const result = await response.json();
        
        if (result.code === 200) {
            const rule = result.data;
            console.log('📋 加载规则数据:', rule);
            
            // 填充表单
            document.getElementById('ruleName').value = rule.ruleName;
            
            // 映射数据库值到UI值
            let sourceTypeValue = 'any';
            if (rule.sourceType === 'ip_range' || rule.sourceType === 'single_ip' || rule.sourceType === 'specific') {
                sourceTypeValue = 'specific';
            }
            
            const sourceRadio = document.querySelector(`input[name="sourceType"][value="${sourceTypeValue}"]`);
            if (sourceRadio) {
                sourceRadio.checked = true;
            }
            
            if (sourceTypeValue === 'specific') {
                document.getElementById('specificIpGroup').style.display = 'block';
                // 尝试填充IP地址
                const sourceIps = rule.sourceIps || rule.sourceIpStart || '';
                document.getElementById('sourceIps').value = sourceIps;
            }
            
            document.getElementById('filterKeywords').value = rule.filterKeywords || '';
            
            // 显示弹窗
            document.getElementById('ruleModalTitle').textContent = '编辑规则';
            const modal = document.getElementById('ruleModal');
            modal.style.display = 'flex'; // modal-modern使用flex布局居中
            modal.setAttribute('data-rule-id', ruleId);
            
            // 先加载严重程度选项
            await loadSeverityOptions();
            
            // 加载完成后再设置多选框值
            console.log('开始设置规则值，设备类型:', rule.filterDeviceType, '严重程度:', rule.filterSeverity);
            setMultiSelectValue('filterDeviceType', rule.filterDeviceType);
            setMultiSelectValue('filterSeverity', rule.filterSeverity);
            
            // 重新初始化点击即多选功能
            setTimeout(() => initMultiSelectClick(), 100);
        }
    } catch (error) {
        console.error('加载规则详情失败:', error);
    }
}

// 设置多选框值
function setMultiSelectValue(selectId, values) {
    const select = document.getElementById(selectId);
    if (!select || !values) {
        console.log(`setMultiSelectValue: select=${selectId}, values=${values}, found=${!!select}`);
        return;
    }
    
    console.log(`设置多选框值: ${selectId} = ${values}`);
    const valueArray = values.split(',').map(v => v.trim());
    console.log(`值数组:`, valueArray);
    
    Array.from(select.options).forEach(option => {
        const shouldSelect = valueArray.includes(option.value.trim());
        option.selected = shouldSelect;
        console.log(`选项 ${option.value}: ${shouldSelect ? '✓选中' : '未选中'}`);
    });
}

// 保存规则
async function saveRule() {
    const form = document.getElementById('ruleForm');
    const formData = new FormData(form);
    
    const ruleData = {
        ruleName: document.getElementById('ruleName').value,
        logType: 'Syslog',
        sourceType: document.querySelector('input[name="sourceType"]:checked').value,
        sourceIps: document.getElementById('sourceIps').value,
        filterType: 'match',
        filterDeviceType: getMultiSelectValue('filterDeviceType'),
        filterSeverity: getMultiSelectValue('filterSeverity'),
        filterKeywords: document.getElementById('filterKeywords').value,
        isEnabled: true,
        createdBy: 'admin'
    };
    
    try {
        const ruleId = document.getElementById('ruleModal').getAttribute('data-rule-id');
        const url = ruleId ? `/api/logs/rules/${ruleId}` : '/api/logs/rules';
        const method = ruleId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ruleData)
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showSuccess(ruleId ? '规则更新成功' : '规则创建成功');
            closeRuleModal();
            loadRulesList();
        } else {
            showError('保存规则失败: ' + result.message);
        }
    } catch (error) {
        console.error('保存规则失败:', error);
        showError('保存规则失败');
    }
}

// 获取多选框值
function getMultiSelectValue(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return '';
    
    const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
    return selectedValues.join(',');
}

// 关闭规则弹窗
function closeRuleModal() {
    document.getElementById('ruleModal').style.display = 'none';
    document.getElementById('ruleModal').removeAttribute('data-rule-id');
}

// 切换规则状态
async function toggleRuleStatus(ruleId, enabled, checkboxElement) {
    try {
        const response = await fetch(`/api/logs/rules/${ruleId}/status?enabled=${enabled}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showSuccess(`规则已${enabled ? '启用' : '停用'}`);
        } else {
            showError('更新规则状态失败: ' + result.message);
            // 恢复开关状态
            if (checkboxElement) {
                checkboxElement.checked = !enabled;
            }
        }
    } catch (error) {
        console.error('更新规则状态失败:', error);
        showError('更新规则状态失败');
        // 恢复开关状态
        if (checkboxElement) {
            checkboxElement.checked = !enabled;
        }
    }
}

// 删除规则
async function deleteRule(ruleId) {
    if (!confirm('确定要删除这个规则吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/logs/rules/${ruleId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showSuccess('规则删除成功');
            loadRulesList();
        } else {
            showError('删除规则失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除规则失败:', error);
        showError('删除规则失败');
    }
}

// 加载事件列表
async function loadEventsList() {
    try {
        const response = await fetch('/api/logs/events');
        const result = await response.json();
        
        if (result.code === 200) {
            renderEventsTable(result.data);
        } else {
            console.error('加载事件列表失败:', result.message);
        }
    } catch (error) {
        console.error('加载事件列表异常:', error);
    }
}

// 渲染事件表格
function renderEventsTable(events) {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;
    
    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 30px; color: #64748b;">暂无事件</td></tr>';
        return;
    }
    
    const rows = events.map(event => {
        return `
            <tr>
                <td><strong>${event.eventName}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 30px; height: 30px; background-color: ${event.eventColor}; border-radius: 6px; display: inline-block; border: 2px solid #e5e7eb;"></span>
                        <span style="font-family: monospace; color: #64748b;">${event.eventColor}</span>
                    </div>
                </td>
                <td>
                    <button class="btn-sm-modern btn-outline-modern" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn-sm-modern btn-danger-modern" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// 加载设施类型选项（从数据库）
async function loadFacilityOptions() {
    try {
        const response = await fetch('/api/logs/facilities');
        const result = await response.json();
        
        if (result.code === 200 && result.data && result.data.length > 0) {
            const select = document.getElementById('filterFacility');
            if (select) {
                select.innerHTML = result.data.map(facility => 
                    `<option value="${facility.code}">${facility.name}</option>`
                ).join('');
            }
        } else {
            console.warn('数据库中没有设施类型数据，使用默认值');
            loadDefaultFacilityOptions();
        }
    } catch (error) {
        console.error('加载设施类型失败，使用默认值:', error);
        loadDefaultFacilityOptions();
    }
}

// 加载默认设施类型选项（备用）
function loadDefaultFacilityOptions() {
    const select = document.getElementById('filterFacility');
    if (select) {
        const defaultOptions = [
            { code: 0, name: 'Kernel' },
            { code: 1, name: 'User' },
            { code: 2, name: 'Mail' },
            { code: 3, name: 'Daemon' },
            { code: 4, name: 'Security' },
            { code: 16, name: 'Local0' },
            { code: 17, name: 'Local1' },
            { code: 18, name: 'Local2' }
        ];
        select.innerHTML = defaultOptions.map(facility => 
            `<option value="${facility.code}">${facility.name}</option>`
        ).join('');
    }
}

// 加载严重程度选项（从数据库）
async function loadSeverityOptions() {
    try {
        const response = await fetch('/api/logs/severities');
        const result = await response.json();
        
        if (result.code === 200 && result.data && result.data.length > 0) {
            const select = document.getElementById('filterSeverity');
            if (select) {
                select.innerHTML = result.data.map(severity => 
                    `<option value="${severity.level}">${severity.name}</option>`
                ).join('');
            }
        } else {
            console.warn('数据库中没有严重程度数据，使用默认值');
            loadDefaultSeverityOptions();
        }
    } catch (error) {
        console.error('加载严重程度失败，使用默认值:', error);
        loadDefaultSeverityOptions();
    }
}

// 加载默认严重程度选项（备用）
function loadDefaultSeverityOptions() {
    const select = document.getElementById('filterSeverity');
    if (select) {
        const defaultOptions = [
            { level: 0, name: 'Emergency（紧急）' },
            { level: 1, name: 'Alert（告警）' },
            { level: 2, name: 'Critical（严重）' },
            { level: 3, name: 'Error（错误）' },
            { level: 4, name: 'Warning（警告）' },
            { level: 5, name: 'Notice（通知）' },
            { level: 6, name: 'Info（信息）' },
            { level: 7, name: 'Debug（调试）' }
        ];
        select.innerHTML = defaultOptions.map(severity => 
            `<option value="${severity.level}">${severity.name}</option>`
        ).join('');
    }
}

// 加载事件选项（从数据库）
async function loadEventOptions() {
    try {
        const response = await fetch('/api/logs/events');
        const result = await response.json();
        
        if (result.code === 200) {
            const select = document.getElementById('matchedEvents');
            if (select) {
                select.innerHTML = result.data.map(event => 
                    `<option value="${event.id}">${event.eventName}</option>`
                ).join('');
            }
        }
    } catch (error) {
        console.error('加载事件选项失败:', error);
    }
}

// 显示事件管理弹窗
function showEventManageModal() {
    const modal = document.getElementById('eventManageModal');
    modal.style.display = 'flex'; // modal-modern使用flex布局居中
    loadEventsList();
}

// 关闭事件管理弹窗
function closeEventManageModal() {
    document.getElementById('eventManageModal').style.display = 'none';
}

// 显示新增事件表单
function showAddEventForm() {
    document.getElementById('addEventForm').style.display = 'block';
    document.getElementById('eventName').value = '';
    document.getElementById('eventColor').value = '#007bff';
}

// 取消新增事件
function cancelAddEvent() {
    document.getElementById('addEventForm').style.display = 'none';
}

// 保存事件
async function saveEvent() {
    const eventName = document.getElementById('eventName').value;
    const eventColor = document.getElementById('eventColor').value;
    
    if (!eventName.trim()) {
        showError('请输入事件名称');
        return;
    }
    
    try {
        const response = await fetch('/api/logs/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: eventName,
                eventColor: eventColor
            })
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showSuccess('事件创建成功');
            cancelAddEvent();
            loadEventsList();
            loadEventOptions();
        } else {
            showError('创建事件失败: ' + result.message);
        }
    } catch (error) {
        console.error('创建事件失败:', error);
        showError('创建事件失败');
    }
}

// 编辑事件
async function editEvent(eventId) {
    // 实现编辑事件逻辑
    console.log('编辑事件:', eventId);
}

// 删除事件
async function deleteEvent(eventId) {
    if (!confirm('确定要删除这个事件吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/logs/events/${eventId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showSuccess('事件删除成功');
            loadEventsList();
            loadEventOptions();
        } else {
            showError('删除事件失败');
        }
    } catch (error) {
        console.error('删除事件失败:', error);
        showError('删除事件失败');
    }
}

// 将函数暴露到全局作用域，以便HTML的onclick可以调用
window.editRule = editRule;
window.deleteRule = deleteRule;
window.saveRule = saveRule;
window.closeRuleModal = closeRuleModal;
window.showAddRuleModal = showAddRuleModal;
window.toggleRuleStatus = toggleRuleStatus;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.saveEvent = saveEvent;
window.closeEventManageModal = closeEventManageModal;
window.showEventManageModal = showEventManageModal;
window.showAddEventForm = showAddEventForm;
window.cancelAddEvent = cancelAddEvent;
