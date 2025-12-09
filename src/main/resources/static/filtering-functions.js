// 日志过滤页面功能函数

// 初始化过滤页面
function initializeFilteringPage() {
    console.log('=== 初始化日志过滤页面 ===');
    
    // 防止重复初始化
    if (window.filterPageInitialized) {
        console.log('过滤页面已初始化，跳过');
        return;
    }
    console.log('开始绑定事件监听器...');
    window.filterPageInitialized = true;
    
    // 检查是否有待处理的编辑请求
    setTimeout(() => {
        checkPendingEdit();
    }, 500);
    
    // 加载保存的过滤器列表
    setTimeout(() => {
        loadSavedFilters().then(() => {
            console.log('过滤器列表加载完成，初始化安全过滤器系统');
            // 过滤器列表加载完成后，初始化安全过滤器系统
            setTimeout(() => {
                initializeSafeFilterSystem();
            }, 300);
        }).catch(() => {
            // 如果加载失败，仍然初始化安全过滤器系统
            setTimeout(() => {
                initializeSafeFilterSystem();
            }, 300);
        });
    }, 800);
    
    // 更新过滤器状态显示
    setTimeout(() => {
        updateFilterStatus();
    }, 1000);
    
    // 绑定时间范围选择事件
    const timeRangeSelect = document.getElementById('filterTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const customTimeGroup = document.getElementById('customTimeGroup');
            if (this.value === 'custom') {
                customTimeGroup.style.display = 'block';
            } else {
                customTimeGroup.style.display = 'none';
            }
            updateFilterStatus();
        });
    }
    
    // 绑定设备类型复选框事件
    const deviceTypeCheckboxes = document.querySelectorAll('#deviceTypeCheckboxes .checkbox-item');
    deviceTypeCheckboxes.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('active', checkbox.checked);
            updateFilterStatus();
        });
    });
    
    // 绑定严重性级别选择事件
    const severityItems = document.querySelectorAll('#severityLevels .severity-item');
    console.log('找到严重性级别按钮数量:', severityItems.length);
    severityItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('点击严重性级别:', this.dataset.severity);
            this.classList.toggle('active');
            updateFilterStatus();
            updateSeverityDisplay();
        });
    });
    
    // 绑定特殊过滤复选框事件
    const specialCheckboxes = document.querySelectorAll('[data-special] .checkbox-item');
    specialCheckboxes.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('active', checkbox.checked);
            updateFilterStatus();
        });
    });
    
    // 绑定输入框事件
    const inputFields = ['filterKeyword', 'filterSourceIP', 'filterHostname', 'filterEventId'];
    inputFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateFilterStatus);
        }
    });
    
    // 初始化状态
    updateFilterStatus();
    loadSavedFilters();
    
    // ✨ 新增：恢复已应用的过滤表单状态
    setTimeout(() => {
        restoreAppliedFilterForm();
    }, 1200);  // 在所有初始化完成后恢复
    
    console.log('=== 过滤页面事件监听器绑定完成 ===');
}

// 检查待处理的编辑请求
async function checkPendingEdit() {
    try {
        const pendingEditStr = sessionStorage.getItem('pendingEdit');
        if (pendingEditStr) {
            const pendingEdit = JSON.parse(pendingEditStr);
            console.log('检测到待处理的编辑请求:', pendingEdit);
            
            // 清除待处理的编辑请求
            sessionStorage.removeItem('pendingEdit');
            
            // 延迟执行编辑，确保页面完全加载
            setTimeout(() => {
                editSavedFilter(pendingEdit.filterId, pendingEdit.isLocal);
            }, 500); // 增加延迟时间，确保页面完全加载
        }
    } catch (error) {
        console.error('处理待编辑请求失败:', error);
        sessionStorage.removeItem('pendingEdit');
    }
}

// 更新过滤器状态显示
function updateFilterStatus() {
    const statusElement = document.getElementById('filterStatus');
    const activeFilterNameElement = document.getElementById('activeFilterName');
    
    if (!statusElement) return;
    
    const conditions = getActiveFilterConditions();
    const count = conditions.length;
    
    // 更新过滤条件状态
    if (count === 0) {
        statusElement.textContent = '请设置过滤条件';
        statusElement.style.color = '#6c757d';
    } else {
        statusElement.textContent = `已设置 ${count} 个过滤条件`;
        statusElement.style.color = '#28a745';
    }
    
    // 更新当前应用的过滤器状态
    if (activeFilterNameElement) {
        if (window.currentEditingFilter) {
            // 编辑模式
            activeFilterNameElement.textContent = '编辑模式';
            activeFilterNameElement.style.color = '#ff9800';
        } else if (window.currentAppliedFilter) {
            // 有应用的过滤器
            activeFilterNameElement.textContent = `${window.currentAppliedFilter.name}${window.currentAppliedFilter.isLocal ? ' (本地)' : ''}`;
            activeFilterNameElement.style.color = '#28a745';
        } else {
            // 检查是否有活跃的过滤器
            const activeFilterState = getCurrentFilterState();
            if (activeFilterState && activeFilterState.filterData) {
                // 显示具体的过滤器名称
                const filterName = activeFilterState.filterName || identifyFilterName(activeFilterState.filterData);
                activeFilterNameElement.textContent = filterName;
                activeFilterNameElement.style.color = '#28a745';
            } else {
                activeFilterNameElement.textContent = '未应用任何过滤器';
                activeFilterNameElement.style.color = '#6c757d';
            }
        }
    }
    
    // 更新严重性级别显示
    updateSeverityDisplay();
}

// 更新严重性级别显示
function updateSeverityDisplay() {
    const selectedSeverityText = document.getElementById('selectedSeverityText');
    if (!selectedSeverityText) return;
    
    const selectedItems = document.querySelectorAll('#severityLevels .severity-item.active');
    
    if (selectedItems.length === 0) {
        selectedSeverityText.textContent = '无';
        selectedSeverityText.style.color = '#6c757d';
    } else {
        const severityNames = {
            0: 'Emergency', 1: 'Alert', 2: 'Critical', 3: 'Error',
            4: 'Warning', 5: 'Notice', 6: 'Info', 7: 'Debug'
        };
        
        const selectedNames = Array.from(selectedItems).map(item => {
            const severity = item.dataset.severity;
            return severityNames[severity] || `Level${severity}`;
        });
        
        selectedSeverityText.textContent = selectedNames.join(', ');
        selectedSeverityText.style.color = '#007bff';
    }
}

// 获取当前激活的过滤条件
function getActiveFilterConditions() {
    const conditions = [];
    
    // 时间范围
    const timeRange = document.getElementById('filterTimeRange')?.value;
    if (timeRange && timeRange !== 'week') {
        conditions.push(`时间范围: ${getTimeRangeLabel(timeRange)}`);
    }
    
    // 关键字
    const keyword = document.getElementById('filterKeyword')?.value.trim();
    if (keyword) {
        conditions.push(`关键字: ${keyword}`);
    }
    
    // 来源IP
    const sourceIP = document.getElementById('filterSourceIP')?.value.trim();
    if (sourceIP) {
        conditions.push(`来源IP: ${sourceIP}`);
    }
    
    // 主机名
    const hostname = document.getElementById('filterHostname')?.value.trim();
    if (hostname) {
        conditions.push(`主机名: ${hostname}`);
    }
    
    // 设备类型
    const selectedDeviceTypes = [];
    document.querySelectorAll('#deviceTypeCheckboxes input:checked').forEach(cb => {
        const label = cb.nextElementSibling.textContent;
        selectedDeviceTypes.push(label);
    });
    if (selectedDeviceTypes.length > 0) {
        conditions.push(`设备类型: ${selectedDeviceTypes.join(', ')}`);
    }
    
    // 严重性级别
    const selectedSeverities = [];
    document.querySelectorAll('#severityLevels .severity-item.active').forEach(item => {
        const severity = item.textContent.split('\n')[0];
        selectedSeverities.push(severity);
    });
    if (selectedSeverities.length > 0) {
        conditions.push(`严重性: ${selectedSeverities.join(', ')}`);
    }
    
    // 事件ID
    const eventId = document.getElementById('filterEventId')?.value.trim();
    if (eventId) {
        conditions.push(`事件ID: ${eventId}`);
    }
    
    // 特殊过滤
    const specialFilters = [];
    document.querySelectorAll('[data-special] input:checked').forEach(cb => {
        const label = cb.nextElementSibling.textContent;
        specialFilters.push(label);
    });
    if (specialFilters.length > 0) {
        conditions.push(`特殊过滤: ${specialFilters.join(', ')}`);
    }
    
    return conditions;
}

// 获取时间范围标签
function getTimeRangeLabel(value) {
    const labels = {
        'today': '今天',
        'week': '最近7天',
        'month': '最近30天',
        'custom': '自定义时间'
    };
    return labels[value] || value;
}

// 应用高级过滤器
function applyAdvancedFilter() {
    console.log('应用高级过滤器');
    
    // 收集所有过滤条件
    const filterData = collectFilterData();
    
    if (Object.keys(filterData).length === 0) {
        alert('请至少设置一个过滤条件');
        return;
    }
    
    // 重置防重复应用标记，允许应用新的过滤器
    window.filterAlreadyApplied = false;
    
    // 保存当前过滤状态到全局存储
    saveCurrentFilterState(filterData);
    
    // ✨ 新增：保存当前表单状态，以便返回时恢复
    saveAppliedFilterForm(filterData);
    
    // 显示加载状态
    const applyBtn = document.querySelector('[onclick="applyAdvancedFilter()"]');
    const originalText = applyBtn.innerHTML;
    applyBtn.innerHTML = '🔄 应用中...';
    applyBtn.disabled = true;
    
    // 跳转到syslog页面并应用过滤条件
    setTimeout(() => {
        // 切换到syslog页面
        if (typeof loadTabContent === 'function') {
            loadTabContent('syslog');
        }
        
        // 等待页面加载完成后应用过滤条件
        setTimeout(() => {
            applyFilterToSyslog(filterData);
            
            // 恢复按钮状态
            applyBtn.innerHTML = originalText;
            applyBtn.disabled = false;
        }, 500);
    }, 100);
}

// 保存当前过滤状态（临时，用于页面内跳转）
function saveCurrentFilterState(filterData, filterName = null) {
    // 防止循环保存
    if (window.isSavingFilterState) {
        console.log('正在保存过滤状态，跳过重复保存');
        return;
    }
    window.isSavingFilterState = true;
    
    try {
        // 如果没有提供过滤器名称，尝试智能识别
        if (!filterName) {
            filterName = identifyFilterName(filterData);
        }
        
        const stateData = {
            filterData: filterData,
            filterName: filterName,
            appliedAt: new Date().toISOString(),
            isActive: true
        };
        
        // 保存到sessionStorage（临时）
        sessionStorage.setItem('currentActiveFilter', JSON.stringify(stateData));
        console.log('已保存当前过滤状态（临时）:', filterName);
        
        // 同时保存到localStorage（持久化）
        localStorage.setItem('syslogPersistentFilter', JSON.stringify(filterData));
        console.log('已保存持久化过滤器:', filterData);
        
    } catch (error) {
        console.error('保存过滤状态失败:', error);
    } finally{
        // 重置保存标记
        setTimeout(() => {
            window.isSavingFilterState = false;
        }, 100);
    }
}

// 智能识别过滤器名称
function identifyFilterName(filterData) {
    // 基于严重性级别识别
    if (filterData.severities && filterData.severities.length > 0) {
        const severities = filterData.severities;
        
        // 错误级别 (0-3)
        if (severities.every(s => s <= 3)) {
            return '错误日志过滤器';
        }
        
        // 警告级别 (4)
        if (severities.includes(4) && severities.length === 1) {
            return '警告日志过滤器';
        }
        
        // 信息级别 (5-7)
        if (severities.every(s => s >= 5)) {
            return '信息日志过滤器';
        }
        
        // 混合级别
        const severityNames = {0: '紧急', 1: '警报', 2: '严重', 3: '错误', 4: '警告', 5: '通知', 6: '信息', 7: '调试'};
        const severityTexts = severities.map(s => severityNames[s]).filter(Boolean);
        if (severityTexts.length <= 3) {
            return severityTexts.join('/') + '日志过滤器';
        }
    }
    
    // 基于关键字识别
    if (filterData.keyword) {
        const keyword = filterData.keyword.toLowerCase();
        if (keyword.includes('network') || keyword.includes('网络')) {
            return '网络日志过滤器';
        } else if (keyword.includes('security') || keyword.includes('安全')) {
            return '安全日志过滤器';
        } else if (keyword.includes('system') || keyword.includes('系统')) {
            return '系统日志过滤器';
        } else {
            return `"${filterData.keyword}"日志过滤器`;
        }
    }
    
    // 基于时间范围
    if (filterData.timeRange) {
        const timeNames = {'today': '今日', 'week': '周', 'month': '月'};
        const timeName = timeNames[filterData.timeRange];
        if (timeName) {
            return `${timeName}日志过滤器`;
        }
    }
    
    return '自定义过滤器';
}

// 获取当前活跃的过滤状态
function getCurrentFilterState() {
    try {
        // 只从sessionStorage获取，避免循环重建
        const stored = sessionStorage.getItem('currentActiveFilter');
        if (stored) {
            const filterState = JSON.parse(stored);
            if (filterState.isActive) {
                return filterState;
            }
        }
    } catch (error) {
        console.error('获取过滤状态失败:', error);
    }
    return null;
}

// 清除当前过滤状态
function clearCurrentFilterState() {
    sessionStorage.removeItem('currentActiveFilter');
    console.log('已清除过滤状态');
}

// 收集过滤数据
function collectFilterData() {
    const filterData = {};
    
    // 时间范围
    const timeRange = document.getElementById('filterTimeRange')?.value;
    console.log('收集时间范围:', timeRange);
    if (timeRange) {
        filterData.timeRange = timeRange;
        
        if (timeRange === 'custom') {
            const startTime = document.getElementById('filterStartTime')?.value;
            const endTime = document.getElementById('filterEndTime')?.value;
            if (startTime && endTime) {
                filterData.startTime = startTime;
                filterData.endTime = endTime;
            }
        }
    }
    
    // 关键字 - 始终包含，即使为空
    const keyword = document.getElementById('filterKeyword')?.value.trim();
    filterData.keyword = keyword || null;
    
    // 来源IP - 始终包含，即使为空
    const sourceIP = document.getElementById('filterSourceIP')?.value.trim();
    filterData.sourceIP = sourceIP || null;
    
    // 主机名 - 始终包含，即使为空
    const hostname = document.getElementById('filterHostname')?.value.trim();
    filterData.hostname = hostname || null;
    
    // 设备类型
    const deviceTypes = [];
    document.querySelectorAll('#deviceTypeCheckboxes input:checked').forEach(cb => {
        deviceTypes.push(cb.value); // 使用字符串值 SERVER, NETWORK等
    });
    if (deviceTypes.length > 0) {
        filterData.deviceTypes = deviceTypes;
    }
    
    // 严重性级别
    const severities = [];
    const severityItems = document.querySelectorAll('#severityLevels .severity-item.active');
    console.log('找到的激活严重性元素:', severityItems);
    severityItems.forEach(item => {
        const severityValue = parseInt(item.dataset.severity);
        console.log('严重性元素:', item, '值:', severityValue);
        severities.push(severityValue);
    });
    if (severities.length > 0) {
        filterData.severities = severities;
        console.log('收集到的严重性级别:', severities);
    }
    
    // 事件ID
    const eventId = document.getElementById('filterEventId')?.value.trim();
    if (eventId) {
        filterData.eventIds = [parseInt(eventId)];
    }
    
    // 特殊过滤
    const alertOnly = document.getElementById('alertOnly')?.checked;
    if (alertOnly) {
        filterData.alertOnly = true;
    }
    
    const errorOnly = document.getElementById('errorOnly')?.checked;
    if (errorOnly) {
        filterData.errorOnly = true;
    }
    
    return filterData;
}

// 保存当前应用的过滤器到本地存储
function saveAppliedFilter(filterData) {
    try {
        localStorage.setItem('appliedFilter', JSON.stringify(filterData));
        console.log('已保存应用的过滤器:', filterData);
    } catch (error) {
        console.error('保存过滤器失败:', error);
    }
}

// 获取已应用的过滤器
function getAppliedFilter() {
    try {
        const filterData = localStorage.getItem('appliedFilter');
        return filterData ? JSON.parse(filterData) : null;
    } catch (error) {
        console.error('获取过滤器失败:', error);
        return null;
    }
}

// 清除已应用的过滤器
function clearAppliedFilter() {
    try {
        localStorage.removeItem('appliedFilter');
        console.log('已清除应用的过滤器');
    } catch (error) {
        console.error('清除过滤器失败:', error);
    }
}

// 清除持久过滤器（从过滤器页面调用）
function clearPersistentFilter() {
    if (confirm('确定要清除持久过滤器吗？清除后，syslog页面将不再自动应用过滤器。')) {
        clearAppliedFilter();
        
        // 显示清除成功提示
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            font-size: 14px;
        `;
        notification.innerHTML = `
            <i class="fas fa-check"></i>
            <span>持久过滤器已清除</span>
        `;
        
        document.body.appendChild(notification);
        
        // 2秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
}

// 过滤器恢复提示已移除

// 根据严重性列表同步Syslog页面上的工具栏按钮
function syncSeverityFilterButtons(severities) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons || filterButtons.length === 0) {
        return;
    }

    // 重置所有按钮
    filterButtons.forEach(btn => btn.classList.remove('active'));

    if (!severities || severities.length === 0) {
        const allBtn = document.querySelector('.filter-btn[data-level="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
        return;
    }

    const mappedLevels = new Set();
    severities.forEach(severity => {
        const sev = parseInt(severity, 10);
        if (isNaN(sev)) {
            return;
        }
        if (sev <= 3) {
            mappedLevels.add('error');
        } else if (sev === 4) {
            mappedLevels.add('warning');
        } else if (sev === 5 || sev === 6) {
            mappedLevels.add('info');
        } else if (sev >= 7) {
            mappedLevels.add('debug');
        }
    });

    if (mappedLevels.size === 0) {
        const allBtn = document.querySelector('.filter-btn[data-level="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
        return;
    }

    mappedLevels.forEach(level => {
        const btn = document.querySelector(`.filter-btn[data-level="${level}"]`);
        if (btn) {
            btn.classList.add('active');
        }
    });
}

// 将过滤条件应用到syslog页面
function applyFilterToSyslog(filterData, retryCount = 0) {
    console.log('应用过滤条件到syslog页面:', filterData);
    
    // 确认syslog页面元素已渲染，否则延迟重试
    const timeRangeSelect = document.getElementById('timeRange');
    const keywordInput = document.getElementById('searchKeyword');
    if (!timeRangeSelect || !keywordInput) {
        if (retryCount < 10) {
            console.log(`Syslog页面尚未就绪，${retryCount + 1}/10 次重试...`);
            setTimeout(() => applyFilterToSyslog(filterData, retryCount + 1), 200);
        } else {
            console.warn('Syslog页面仍未就绪，已保存过滤状态供后续自动应用');
            saveAppliedFilter(filterData);
            saveCurrentFilterState(filterData);
        }
        return;
    }

    // 防止循环调用
    if (window.isApplyingFilter) {
        console.log('正在应用过滤器，跳过重复调用');
        return;
    }
    window.isApplyingFilter = true;
    
    // 保存过滤器状态
    saveAppliedFilter(filterData);
    
    // 保存当前活跃状态（用于状态显示）
    saveCurrentFilterState(filterData);
    
    // 设置时间范围
    if (filterData.timeRange) {
        console.log('应用时间范围:', filterData.timeRange, '到元素:', timeRangeSelect);
        if (timeRangeSelect) {
            // 映射时间范围值
            const timeRangeMapping = {
                'today': 'today',
                'week': 'week',
                'month': 'month',
                'custom': 'custom'
            };
            const mappedValue = timeRangeMapping[filterData.timeRange] || 'week';
            console.log('映射后的值:', mappedValue);
            timeRangeSelect.value = mappedValue;
            console.log('设置后的实际值:', timeRangeSelect.value);
            
            // 触发change事件以确保UI更新
            const changeEvent = new Event('change', { bubbles: true });
            timeRangeSelect.dispatchEvent(changeEvent);
        }
    }
    
    // 设置关键字
    if (filterData.keyword) {
        if (keywordInput) {
            keywordInput.value = filterData.keyword;
        }
    }
    
    // 设置来源IP地址
    if (filterData.sourceIP) {
        window.currentSourceIP = filterData.sourceIP;
        console.log('设置来源IP过滤:', filterData.sourceIP);
    } else {
        window.currentSourceIP = null;
    }
    
    // 设置主机名
    if (filterData.hostname) {
        window.currentHostname = filterData.hostname;
        console.log('设置主机名过滤:', filterData.hostname);
    } else {
        window.currentHostname = null;
    }
    
    // 设置严重性级别（支持多选）
    if (filterData.severities && filterData.severities.length > 0) {
        // 保存到全局变量
        window.currentSeverities = filterData.severities;
        console.log('设置严重性过滤:', filterData.severities);
        
        // 如果syslog页面的严重性按钮存在，也更新它们的状态
        const severityButtons = document.querySelectorAll('.severity-btn');
        if (severityButtons.length > 0) {
            // 清除所有按钮的active状态
            severityButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            // 激活选中的按钮
            filterData.severities.forEach(severity => {
                const severityBtn = document.querySelector(`.severity-btn[data-severity="${severity}"]`);
                if (severityBtn) {
                    severityBtn.classList.add('active');
                }
            });
        }
    } else {
        window.currentSeverities = null;
    }
    
    // 设置全局过滤变量
    if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
        window.currentDeviceTypes = filterData.deviceTypes;
        console.log('设置设备类型过滤:', filterData.deviceTypes);
    } else {
        window.currentDeviceTypes = [];
    }
    
    if (filterData.eventIds) {
        window.currentEventIds = filterData.eventIds;
        console.log('设置事件ID过滤:', filterData.eventIds);
    } else {
        window.currentEventIds = [];
    }
    
    if (filterData.alertOnly) {
        window.currentFilterMode = 'alert';
        console.log('设置告警过滤模式');
    } else {
        window.currentFilterMode = null;
    }
    
    // 加载数据
    setTimeout(() => {
        if (typeof loadSyslogData === 'function') {
            loadSyslogData();
        }
        
        // 重置应用标记
        window.isApplyingFilter = false;
        
        // 标记过滤器已应用，防止重复应用
        window.filterAlreadyApplied = true;
        
        // 5秒后重置标记，允许下次切换页面时重新应用
        setTimeout(() => {
            window.filterAlreadyApplied = false;
        }, 5000);
    }, 200);
}

// 高级过滤通知已移除

// 清空所有过滤条件
function clearAllFilters() {
    console.log('清空所有过滤条件');
    
    // 重置时间范围
    const timeRangeSelect = document.getElementById('filterTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.value = 'week';
    }
    
    // 隐藏自定义时间
    const customTimeGroup = document.getElementById('customTimeGroup');
    if (customTimeGroup) {
        customTimeGroup.style.display = 'none';
    }
    
    // 清空输入框
    const inputFields = ['filterKeyword', 'filterSourceIP', 'filterHostname', 'filterEventId', 'filterStartTime', 'filterEndTime'];
    inputFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
    
    // 清除设备类型选择
    document.querySelectorAll('#deviceTypeCheckboxes .checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = false;
        item.classList.remove('active');
    });
    
    // 清除严重性级别选择
    document.querySelectorAll('#severityLevels .severity-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 清除特殊过滤选择
    document.querySelectorAll('[data-special] .checkbox-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = false;
        item.classList.remove('active');
    });
    
    // 更新状态
    updateFilterStatus();
    
    // ✨ 新增：清除已保存的表单状态
    localStorage.removeItem('appliedFilterFormState');
    
    // 移除指示器（如果存在）
    const indicator = document.querySelector('.applied-filter-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // 显示清空通知
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6c757d;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 10000;
        font-size: 14px;
    `;
    notification.textContent = '已清空所有过滤条件';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 2000);
}

// 清除活跃过滤器并重置syslog页面
function clearActiveFilter() {
    // 清除保存的过滤状态
    clearCurrentFilterState();
    
    // 清除持久化的过滤器
    clearAppliedFilter();
    
    // 重置防重复应用标记
    window.filterAlreadyApplied = false;
    
    // 如果当前在syslog页面，重新加载数据
    if (typeof loadSyslogData === 'function') {
        // 清除所有过滤变量
        if (typeof currentEventIds !== 'undefined') currentEventIds = [];
        if (typeof currentFacilities !== 'undefined') currentFacilities = [];
        window.currentFilterMode = null;
        window.currentSourceIP = null;
        window.currentHostname = null;
        window.currentSeverities = null;
        
        // 重置syslog页面的UI状态
        const timeRangeSelect = document.getElementById('timeRange');
        if (timeRangeSelect) {
            timeRangeSelect.value = 'week';
        }
        
        const searchInput = document.getElementById('searchKeyword');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 重置严重性按钮
        document.querySelectorAll('.severity-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const allBtn = document.querySelector('[data-severity="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
        
        // 重新加载数据
        loadSyslogData();
    }
    
    // 显示清除通知
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 10000;
        font-size: 14px;
    `;
    notification.textContent = '✅ 已清除活跃过滤器，恢复默认显示';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 保存当前过滤器
async function saveCurrentFilter() {
    const filterData = collectFilterData();
    
    if (Object.keys(filterData).length === 0) {
        alert('请先设置过滤条件');
        return;
    }
    
    // 检查是否在编辑模式
    if (window.currentEditingFilter) {
        // 编辑模式：更新现有过滤器
        await updateExistingFilter(window.currentEditingFilter, filterData);
        return;
    }
    
    // 新建模式：创建新过滤器
    const name = prompt('请输入过滤器名称:');
    if (!name) return;
    
    try {
        // 显示保存状态
        const saveBtn = document.querySelector('[onclick="saveCurrentFilter()"]');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '💾 保存中...';
        saveBtn.disabled = true;
        
        // 转换前端格式到数据库格式
        const dbFilterData = convertFrontendToDbFilter(name, filterData);
        
        // 调用后端API保存过滤器
        const response = await fetch('/api/logs/filters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbFilterData)
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            // 刷新保存的过滤器列表
            await loadSavedFilters();
            alert('过滤器保存成功！');
        } else {
            alert('保存失败: ' + result.message);
        }
        
        // 恢复按钮状态
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
    } catch (error) {
        console.error('保存过滤器失败:', error);
        alert('保存失败，请检查网络连接');
        
        // 降级到localStorage保存
        saveToLocalStorage(name, filterData);
    }
}

// 降级保存到localStorage
function saveToLocalStorage(name, filterData) {
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
    savedFilters.push({
        id: Date.now(),
        name: name,
        data: filterData,
        createdAt: new Date().toISOString(),
        isLocal: true
    });
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
    loadSavedFilters();
    alert('过滤器已保存到本地存储！');
}

// 更新现有过滤器
async function updateExistingFilter(editingFilter, filterData) {
    try {
        // ✨ 特殊处理：默认过滤器无法更新，提示另存为新过滤器
        if (editingFilter.id === 'default') {
            const filterName = prompt('默认过滤器无法直接保存修改。\n请输入新过滤器的名称：', '我的自定义过滤器');
            
            if (!filterName || !filterName.trim()) {
                console.log('用户取消了保存');
                return;
            }
            
            // 转换为新增模式
            window.currentEditingFilter = null;
            
            // 创建新过滤器到本地存储
            const newFilterId = 'local_' + Date.now();
            const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            savedFilters.push({
                id: newFilterId,
                name: filterName.trim(),
                data: filterData,
                createdAt: new Date().toISOString(),
                isLocal: true
            });
            localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
            
            // 显示成功通知
            alert(`过滤器 "${filterName.trim()}" 已保存！`);
            
            // 清除编辑状态
            clearEditingMode();
            
            // 清空表单
            clearAllFilters();
            
            // 刷新过滤器列表
            loadSavedFilters();
            return;
        }
        
        // 显示保存状态
        const saveBtn = document.querySelector('[onclick="saveCurrentFilter()"]');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '💾 更新中...';
        saveBtn.disabled = true;
        
        if (editingFilter.isLocal) {
            // 更新本地过滤器
            const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            const filter = savedFilters.find(f => f.id == editingFilter.id);
            
            if (filter) {
                filter.data = filterData;
                localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
                
                // 显示成功通知
                showUpdateSuccessNotification(filter.name);
                
                // 清除编辑状态
                clearEditingMode();
                
                // 清空表单，恢复原始状态
                clearAllFilters();
                
                // 刷新过滤器列表
                loadSavedFilters();
            } else {
                alert('过滤器不存在');
            }
        } else {
            // 更新数据库过滤器
            console.log('=== 开始更新数据库过滤器 ===');
            console.log('过滤器ID:', editingFilter.id);
            console.log('收集到的filterData:', filterData);
            
            const response = await fetch(`/api/logs/filters/${editingFilter.id}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                const currentFilter = result.data;
                const dbFilterData = convertFrontendToDbFilter(currentFilter.filterName, filterData);
                
                console.log('转换后的dbFilterData:', dbFilterData);
                console.log('发送PUT请求到:', `/api/logs/filters/${editingFilter.id}`);
                console.log('请求体:', JSON.stringify(dbFilterData, null, 2));
                
                const updateResponse = await fetch(`/api/logs/filters/${editingFilter.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dbFilterData)
                });
                
                const updateResult = await updateResponse.json();
                console.log('更新响应:', updateResult);
                
                if (updateResult.code === 200) {
                    console.log('✅ 过滤器更新成功');
                    // 显示成功通知
                    showUpdateSuccessNotification(currentFilter.filterName);
                    
                    // 清除编辑状态
                    clearEditingMode();
                    
                    // 清空表单，恢复原始状态
                    clearAllFilters();
                    
                    // 刷新过滤器列表
                    loadSavedFilters();
                } else {
                    console.error('❌ 更新失败:', updateResult.message);
                    alert('更新失败: ' + updateResult.message);
                }
            } else {
                console.error('❌ 获取过滤器信息失败');
                alert('获取过滤器信息失败');
            }
        }
        
        // 恢复按钮状态
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
    } catch (error) {
        console.error('更新过滤器失败:', error);
        alert('更新失败，请检查网络连接');
        
        // 恢复按钮状态
        const saveBtn = document.querySelector('[onclick="saveCurrentFilter()"]');
        if (saveBtn) {
            saveBtn.innerHTML = '💾 保存过滤器';
            saveBtn.disabled = false;
        }
    }
}

// 显示更新成功通知
function showUpdateSuccessNotification(filterName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(40,167,69,0.3);
        z-index: 10002;
        font-size: 15px;
        font-weight: 600;
        animation: bounceIn 0.5s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">✅</span>
            <div>
                <div>过滤器更新成功！</div>
                <div style="font-size: 13px; opacity: 0.9; margin-top: 2px;">${filterName}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 2px; color: #20c997;">表单已恢复原始状态</div>
            </div>
        </div>
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: translateX(-50%) scale(0.3); opacity: 0; }
            50% { transform: translateX(-50%) scale(1.05); }
            70% { transform: translateX(-50%) scale(0.9); }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'bounceIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }
    }, 3000);
}

// 清除编辑模式
function clearEditingMode() {
    // 清除编辑状态
    window.currentEditingFilter = null;
    
    // 隐藏编辑按钮
    hideEditModeButtons();
    
    // 移除编辑模式通知
    const notification = document.getElementById('editingModeNotification');
    if (notification) {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// 显示编辑模式按钮
function showEditModeButtons() {
    const editModeButtons = document.getElementById('editModeButtons');
    if (editModeButtons) {
        editModeButtons.style.display = 'flex';
    }
    
    // 更新状态显示
    const activeFilterName = document.getElementById('activeFilterName');
    if (activeFilterName) {
        activeFilterName.textContent = '正在编辑过滤器';
        activeFilterName.style.color = '#ff9800';
    }
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.textContent = '修改表单后点击"保存过滤器"完成编辑';
        filterStatus.style.color = '#ff9800';
    }
}

// 隐藏编辑模式按钮
function hideEditModeButtons() {
    const editModeButtons = document.getElementById('editModeButtons');
    if (editModeButtons) {
        editModeButtons.style.display = 'none';
    }
    
    // 恢复状态显示
    const activeFilterName = document.getElementById('activeFilterName');
    if (activeFilterName) {
        activeFilterName.textContent = '未编辑任何过滤器';
        activeFilterName.style.color = '#6c757d';
    }
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.textContent = '点击下方过滤器的"编辑"按钮开始编辑';
        filterStatus.style.color = '#6c757d';
    }
}

// 创建新过滤器
function createNewFilter() {
    const filterData = collectFilterData();
    
    if (Object.keys(filterData).length === 0) {
        alert('请先设置过滤条件');
        return;
    }
    
    // 清除编辑模式
    window.currentEditingFilter = null;
    
    // 调用保存函数（会自动识别为新增模式）
    saveCurrentFilter();
}

// 加载保存的过滤器
async function loadSavedFilters() {
    const filtersList = document.getElementById('savedFiltersList');
    if (!filtersList) return;
    
    try {
        // 从后端API获取过滤器
        console.log('正在从后端获取过滤器...');
        const response = await fetch('/api/logs/filters?createdBy=admin');
        console.log('API响应状态:', response.status);
        
        const result = await response.json();
        console.log('API响应结果:', result);
        
        let savedFilters = [];
        if (result.code === 200) {
            savedFilters = result.data || [];
            console.log('成功获取过滤器数量:', savedFilters.length);
            console.log('过滤器数据:', savedFilters);
        } else {
            console.warn('获取后端过滤器失败，使用本地存储。错误:', result.message);
        }
        
        // 如果后端没有数据，尝试从localStorage获取
        if (savedFilters.length === 0) {
            const localFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            savedFilters = localFilters;
        }
        
        // 清空现有列表（保留默认过滤器）
        const defaultFilter = filtersList.querySelector('.filter-item');
        filtersList.innerHTML = '';
        if (defaultFilter) {
            filtersList.appendChild(defaultFilter);
        }
        
        // 添加保存的过滤器
        savedFilters.forEach(filter => {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            
            // 处理不同数据源的显示
            const isLocal = filter.isLocal || false;
            const createdAt = filter.createdAt || filter.createdAt;
            const filterName = filter.name || filter.filterName;
            const filterId = filter.id;
            
            filterItem.innerHTML = `
                <div class="filter-item-info">
                    <div class="filter-item-name">
                        ${filterName}
                        ${isLocal ? '<small style="color: #6c757d;">(本地)</small>' : ''}
                    </div>
                    <div class="filter-item-desc">
                        创建于 ${new Date(createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="filter-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="loadSavedFilter('${filterId}', ${isLocal})">应用</button>
                    <button class="btn btn-sm btn-secondary" onclick="editSavedFilter('${filterId}', ${isLocal})">编辑</button>
                    <button class="btn btn-sm" style="background: #dc3545; color: white;" onclick="deleteSavedFilter('${filterId}', ${isLocal})">删除</button>
                </div>
            `;
            filtersList.appendChild(filterItem);
        });
        
    } catch (error) {
        console.error('加载过滤器失败:', error);
        
        // 降级到localStorage
        const localFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
        
        // 清空现有列表（保留默认过滤器）
        const defaultFilter = filtersList.querySelector('.filter-item');
        filtersList.innerHTML = '';
        if (defaultFilter) {
            filtersList.appendChild(defaultFilter);
        }
        
        // 添加本地过滤器
        localFilters.forEach(filter => {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.innerHTML = `
                <div class="filter-item-info">
                    <div class="filter-item-name">
                        ${filter.name} <small style="color: #6c757d;">(本地)</small>
                    </div>
                    <div class="filter-item-desc">创建于 ${new Date(filter.createdAt).toLocaleString()}</div>
                </div>
                <div class="filter-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="loadSavedFilter('${filter.id}', true)">应用</button>
                    <button class="btn btn-sm btn-secondary" onclick="editSavedFilter('${filter.id}', true)">编辑</button>
                    <button class="btn btn-sm" style="background: #dc3545; color: white;" onclick="deleteSavedFilter('${filter.id}', true)">删除</button>
                </div>
            `;
            filtersList.appendChild(filterItem);
        });
    }
}

// 加载保存的过滤器
async function loadSavedFilter(filterId, isLocal = false) {
    if (filterId === 'default') {
        clearAllFilters();
        // 清除活跃过滤器状态
        clearCurrentFilterState();
        updateFilterStatus();
        return;
    }
    
    let filter = null;
    let filterName = '';
    let filterData = null;
    
    if (isLocal) {
        // 从localStorage获取
        const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
        filter = savedFilters.find(f => f.id == filterId);
        if (filter) {
            filterData = filter.data;
            filterName = filter.name;
        }
    } else {
        // 从数据库获取
        try {
            const response = await fetch(`/api/logs/filters/${filterId}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                const dbFilter = result.data;
                // 转换数据库格式到前端格式
                filterData = convertDbFilterToFrontend(dbFilter);
                filterName = dbFilter.filterName;
            } else {
                alert('过滤器不存在或已被删除');
                return;
            }
        } catch (error) {
            console.error('加载过滤器失败:', error);
            alert('加载过滤器失败');
            return;
        }
    }
    
    // 设置当前应用的过滤器
    window.currentAppliedFilter = {
        id: filterId,
        name: filterName,
        isLocal: isLocal
    };
    
    // 应用过滤器到syslog页面
    if (filterData) {
        // 保存过滤器状态
        saveCurrentFilterState(filterData, filterName);
        
        // 跳转到syslog页面并应用过滤条件
        setTimeout(() => {
            // 更新左侧菜单选中状态
            const allMenuItems = document.querySelectorAll('.node-item');
            allMenuItems.forEach(item => {
                item.classList.remove('selected');
                const nodeText = item.querySelector('.node-text');
                if (nodeText && nodeText.textContent.trim() === 'Syslog日志') {
                    item.classList.add('selected');
                }
            });
            
            // 加载syslog内容
            if (typeof loadTabContent === 'function') {
                loadTabContent('syslog');
            }
            
            // 等待页面加载完成后应用过滤条件
            setTimeout(() => {
                applyFilterToSyslog(filterData);
            }, 500);
        }, 100);
    }
    
    updateFilterStatus();
}

// 显示过滤器应用成功通知
function showFilterAppliedNotification(filterName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10002;
        font-size: 14px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = ` 已应用过滤器: ${filterName}`;
    
    document.body.appendChild(notification);
    
    // 2秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 2000);
}

// 转换数据库过滤器格式到前端格式
function convertDbFilterToFrontend(dbFilter) {
    const filterData = {};
    
    // 处理时间范围
    if (dbFilter.timeRange) {
        filterData.timeRange = dbFilter.timeRange;
        
        // 处理自定义时间
        if (dbFilter.timeRange === 'custom') {
            if (dbFilter.startTime) {
                filterData.startTime = dbFilter.startTime;
            }
            if (dbFilter.endTime) {
                filterData.endTime = dbFilter.endTime;
            }
        }
    } else {
        // 默认时间范围
        filterData.timeRange = 'week';
    }
    
    // 处理来源IP
    if (dbFilter.sourceIps) {
        try {
            const sourceIps = JSON.parse(dbFilter.sourceIps);
            if (sourceIps.length > 0) {
                // 取第一个IP或网段
                filterData.sourceIP = sourceIps[0].split('/')[0]; // 去掉网段部分
            }
        } catch (e) {
            console.warn('解析sourceIps失败:', e);
        }
    }
    
    // 处理设备类型（数据库存储在facilities字段中）
    if (dbFilter.facilities) {
        const deviceTypes = dbFilter.facilities.split(',').map(d => d.trim()).filter(d => d);
        if (deviceTypes.length > 0) {
            // 数据库中可能存储的是旧的facility数字或新的设备类型字符串
            // 检查第一个值是否为数字，如果是数字则忽略（旧数据），如果是字符串则使用
            if (isNaN(deviceTypes[0])) {
                filterData.deviceTypes = deviceTypes;
                console.log('转换设备类型:', deviceTypes);
            } else {
                console.log('忽略旧的facility数据:', deviceTypes);
            }
        }
    }
    
    // 处理严重性级别
    if (dbFilter.severities) {
        const severities = dbFilter.severities.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
        if (severities.length > 0) {
            filterData.severities = severities;
        }
    }
    
    // 处理包含关键字
    if (dbFilter.includeKeywords) {
        const keywords = dbFilter.includeKeywords.split(';').map(k => k.trim()).filter(k => k);
        if (keywords.length > 0) {
            filterData.keyword = keywords[0]; // 取第一个关键字
        }
    }
    
    return filterData;
}

// 转换前端过滤器格式到数据库格式
function convertFrontendToDbFilter(name, filterData) {
    const dbFilter = {
        filterName: name,
        logType: 'Syslog'
    };
    
    // 处理时间范围
    if (filterData.timeRange) {
        dbFilter.timeRange = filterData.timeRange;
        
        // 处理自定义时间
        if (filterData.timeRange === 'custom') {
            if (filterData.startTime) {
                dbFilter.startTime = filterData.startTime;
            }
            if (filterData.endTime) {
                dbFilter.endTime = filterData.endTime;
            }
        }
    }
    
    // 处理来源IP - 转换为JSON数组格式
    if (filterData.sourceIP) {
        // 如果是单个IP，转换为网段格式
        const ip = filterData.sourceIP.trim();
        if (ip.includes('/')) {
            dbFilter.sourceIps = JSON.stringify([ip]);
        } else {
            // 单个IP转换为/32网段
            dbFilter.sourceIps = JSON.stringify([ip + '/32']);
        }
    } else {
        // 空值时设置为null，让数据库更新
        dbFilter.sourceIps = null;
    }
    
    // 处理设备类型 - 前端使用deviceTypes，数据库暂时还用facilities字段
    if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
        dbFilter.facilities = filterData.deviceTypes.join(',');
    } else {
        // 空值时设置为null
        dbFilter.facilities = null;
    }
    
    // 处理严重性级别 - 转换为逗号分隔字符串
    if (filterData.severities && filterData.severities.length > 0) {
        dbFilter.severities = filterData.severities.join(',');
    } else {
        // 空值时设置为null
        dbFilter.severities = null;
    }
    
    // 处理包含关键字 - 转换为分号分隔字符串
    const includeKeywords = [];
    if (filterData.keyword) {
        includeKeywords.push(filterData.keyword.trim());
    }
    
    // 添加特殊过滤的关键字
    if (filterData.alertOnly) {
        includeKeywords.push('alert', 'warning', 'critical');
    }
    if (filterData.errorOnly) {
        includeKeywords.push('error', 'failed', 'exception');
    }
    
    if (includeKeywords.length > 0) {
        dbFilter.includeKeywords = includeKeywords.join(';');
    } else {
        // 空值时设置为null
        dbFilter.includeKeywords = null;
    }
    
    // 排除关键字（暂时为空）
    dbFilter.excludeKeywords = '';
    
    // 创建用户（这里应该从session获取）
    dbFilter.createdBy = 'admin'; // 使用admin匹配数据库中的数据
    
    return dbFilter;
}

// 应用过滤器数据到表单
function applyFilterData(filterData) {
    console.log('应用过滤器数据到表单:', filterData);
    
    // 保存过滤器状态（如果用户想要持久化）
    saveAppliedFilter(filterData);
    
    // 先清空所有表单
    clearAllFilters();
    
    // 延迟应用数据，确保表单已清空
    setTimeout(() => {
        // 时间范围
        if (filterData.timeRange) {
            const timeRangeSelect = document.getElementById('filterTimeRange');
            if (timeRangeSelect) {
                timeRangeSelect.value = filterData.timeRange;
                console.log('设置时间范围:', filterData.timeRange);
                
                if (filterData.timeRange === 'custom') {
                    const customTimeGroup = document.getElementById('customTimeGroup');
                    if (customTimeGroup) {
                        customTimeGroup.style.display = 'block';
                    }
                    
                    if (filterData.startTime) {
                        const startTimeInput = document.getElementById('filterStartTime');
                        if (startTimeInput) {
                            startTimeInput.value = filterData.startTime;
                        }
                    }
                    
                    if (filterData.endTime) {
                        const endTimeInput = document.getElementById('filterEndTime');
                        if (endTimeInput) {
                            endTimeInput.value = filterData.endTime;
                        }
                    }
                }
            }
        }
        
        // 关键字
        if (filterData.keyword) {
            const keywordInput = document.getElementById('filterKeyword');
            if (keywordInput) {
                keywordInput.value = filterData.keyword;
                console.log('设置关键字:', filterData.keyword);
            }
        }
        
        // 来源IP
        if (filterData.sourceIP) {
            const sourceIPInput = document.getElementById('filterSourceIP');
            if (sourceIPInput) {
                sourceIPInput.value = filterData.sourceIP;
                console.log('设置来源IP:', filterData.sourceIP);
            }
        }
        
        // 主机名
        if (filterData.hostname) {
            const hostnameInput = document.getElementById('filterHostname');
            if (hostnameInput) {
                hostnameInput.value = filterData.hostname;
                console.log('设置主机名:', filterData.hostname);
            }
        }
        
        // 设备类型（从facilities字段转换而来）
        if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
            console.log('设置设备类型:', filterData.deviceTypes);
            filterData.deviceTypes.forEach(deviceType => {
                const checkbox = document.querySelector(`#deviceTypeCheckboxes input[value="${deviceType}"]`);
                const item = document.querySelector(`[data-device-type="${deviceType}"]`);
                if (checkbox && item) {
                    checkbox.checked = true;
                    item.classList.add('active');
                    console.log('激活设备类型:', deviceType);
                }
            });
        }
        
        // 严重性级别
        if (filterData.severities && filterData.severities.length > 0) {
            console.log('设置严重性级别:', filterData.severities);
            filterData.severities.forEach(severity => {
                const item = document.querySelector(`[data-severity="${severity}"]`);
                if (item) {
                    item.classList.add('active');
                    console.log('激活严重性级别:', severity);
                }
            });
        }
        
        // 事件ID
        if (filterData.eventIds && filterData.eventIds.length > 0) {
            const eventIdInput = document.getElementById('filterEventId');
            if (eventIdInput) {
                eventIdInput.value = filterData.eventIds[0];
                console.log('设置事件ID:', filterData.eventIds[0]);
            }
        }
        
        // 特殊过滤
        if (filterData.alertOnly) {
            const alertCheckbox = document.getElementById('alertOnly');
            const alertItem = document.querySelector('[data-special="alert"]');
            if (alertCheckbox && alertItem) {
                alertCheckbox.checked = true;
                alertItem.classList.add('active');
                console.log('激活仅告警日志');
            }
        }
        
        if (filterData.errorOnly) {
            const errorCheckbox = document.getElementById('errorOnly');
            const errorItem = document.querySelector('[data-special="error"]');
            if (errorCheckbox && errorItem) {
                errorCheckbox.checked = true;
                errorItem.classList.add('active');
                console.log('激活仅错误日志');
            }
        }
        
        // 更新状态显示
        updateFilterStatus();
        
        console.log('过滤器数据应用完成');
    }, 100);
}

// 编辑保存的过滤器
async function editSavedFilter(filterId, isLocal = false) {
    // ✨ 移除默认过滤器的编辑限制
    
    // 检查是否在过滤页面，如果不在则先跳转
    const filteringPage = document.querySelector('.filtering-page');
    if (!filteringPage) {
        // 不在过滤页面，需要先跳转
        console.log('不在过滤页面，先跳转到过滤页面');
        
        // 保存编辑信息到临时存储
        sessionStorage.setItem('pendingEdit', JSON.stringify({
            filterId: filterId,
            isLocal: isLocal
        }));
        
        // 跳转到过滤页面
        if (typeof loadTabContent === 'function') {
            loadTabContent('filtering');
        }
        return;
    }
    
    // 设置编辑模式
    window.currentEditingFilter = {
        id: filterId,
        isLocal: isLocal
    };
    
    // 显示编辑按钮
    showEditModeButtons();
    
    // ✨ 处理默认过滤器的编辑
    if (filterId === 'default') {
        // 默认过滤器的初始数据：最近7天，无其他条件
        const defaultFilterData = {
            timeRange: 'week',
            deviceTypes: [],
            severities: [],
            keyword: '',
            sourceIP: '',
            hostname: '',
            eventIds: [],
            alertOnly: false,
            errorOnly: false
        };
        
        // 加载默认过滤器数据到表单
        applyFilterData(defaultFilterData);
        
        // 显示编辑状态提示
        showEditingModeNotification('默认过滤器');
        return;
    }
    
    if (isLocal) {
        // 编辑本地过滤器
        const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
        const filter = savedFilters.find(f => f.id == filterId);
        
        if (!filter) {
            alert('过滤器不存在');
            return;
        }
        
        // 加载过滤器数据到表单
        applyFilterData(filter.data);
        
        // 显示编辑状态提示
        showEditingModeNotification(filter.name);
    } else {
        // 编辑数据库过滤器
        try {
            const response = await fetch(`/api/logs/filters/${filterId}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                const dbFilter = result.data;
                // 转换数据库格式到前端格式
                const filterData = convertDbFilterToFrontend(dbFilter);
                
                // 加载过滤器数据到表单
                applyFilterData(filterData);
                
                // 显示编辑状态提示
                showEditingModeNotification(dbFilter.filterName);
            } else {
                alert('过滤器不存在');
            }
        } catch (error) {
            console.error('编辑过滤器失败:', error);
            alert('编辑失败，请检查网络连接');
        }
    }
}

// 显示编辑过滤器模态框
function showEditFilterModal(currentName, filterId, isLocal) {
    // 先移除可能存在的模态框
    const existingModal = document.getElementById('editFilterModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框HTML
    const modalHtml = `
        <div id="editFilterModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                padding: 35px;
                max-width: 550px;
                width: 90%;
                box-shadow: 0 12px 40px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
                border: 3px solid #007bff;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 25px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #007bff, #0056b3);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        color: white;
                        font-size: 18px;
                    ">🔧</div>
                    <h3 style="margin: 0; color: #2c3e50; font-size: 22px; font-weight: 700;">
                        编辑过滤器
                    </h3>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #495057; font-size: 15px;">
                        过滤器名称
                    </label>
                    <input type="text" id="editFilterName" value="${currentName}" style="
                        width: 100%;
                        padding: 14px 16px;
                        border: 2px solid #e9ecef;
                        border-radius: 10px;
                        font-size: 15px;
                        box-sizing: border-box;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    " onkeypress="if(event.key==='Enter') saveEditedFilter('${filterId}', ${isLocal})">
                </div>
                
                <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #f8f9ff, #e3f2fd); border-radius: 12px; border-left: 4px solid #007bff;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 18px; margin-right: 8px;">📝</span>
                        <p style="margin: 0; font-weight: 700; color: #1565c0; font-size: 15px;">
                            编辑说明
                        </p>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #424242; line-height: 1.5;">
                        <strong>编辑步骤：</strong><br>
                        <span style="color: #1976d2;">1.</span> 修改上方的过滤器名称<br>
                        <span style="color: #1976d2;">2.</span> 向上滚动调整表单中的过滤条件<br>
                        <span style="color: #1976d2;">3.</span> 点击"重新加载"按钮刷新表单数据<br>
                        <span style="color: #1976d2;">4.</span> 按Enter键或点击"保存更改"完成编辑<br>
                        <br>
                        <span style="color: #f57c00; font-weight: 600;">💡 提示：如果表单数据未正确显示，请点击"重新加载"按钮</span>
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center;">
                    <button onclick="reloadFilterData('${filterId}', ${isLocal})" style="
                        padding: 10px 18px;
                        border: 2px solid #17a2b8;
                        background: white;
                        color: #17a2b8;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 13px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#17a2b8'; this.style.color='white';" 
                       onmouseout="this.style.background='white'; this.style.color='#17a2b8';">
                        🔄 重新加载
                    </button>
                    
                    <div style="display: flex; gap: 12px;">
                        <button onclick="cancelEditFilter()" style="
                            padding: 12px 24px;
                            border: 2px solid #6c757d;
                            background: white;
                            color: #6c757d;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#6c757d'; this.style.color='white';" 
                           onmouseout="this.style.background='white'; this.style.color='#6c757d';">
                            ✕ 取消
                        </button>
                        <button onclick="saveEditedFilter('${filterId}', ${isLocal})" style="
                            padding: 12px 24px;
                            border: none;
                            background: linear-gradient(135deg, #28a745, #20c997);
                            color: white;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            box-shadow: 0 4px 12px rgba(40,167,69,0.3);
                            transition: all 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(40,167,69,0.4)';"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(40,167,69,0.3)';">
                            💾 保存更改
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px) scale(0.9); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            #editFilterName:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
            }
        </style>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 延迟聚焦，确保动画完成
    setTimeout(() => {
        const nameInput = document.getElementById('editFilterName');
        if (nameInput) {
            nameInput.focus();
            nameInput.select(); // 选中所有文本，方便修改
        }
    }, 100);
    
    // 添加ESC键关闭功能
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            cancelEditFilter();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 重新加载过滤器数据到表单
async function reloadFilterData(filterId, isLocal) {
    console.log('重新加载过滤器数据:', filterId, isLocal);
    
    try {
        if (isLocal) {
            // 重新加载本地过滤器
            const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            const filter = savedFilters.find(f => f.id == filterId);
            
            if (filter) {
                console.log('重新加载本地过滤器数据:', filter.data);
                applyFilterData(filter.data);
                
                // 显示成功提示
                showReloadNotification('本地过滤器数据已重新加载');
            } else {
                alert('过滤器不存在');
            }
        } else {
            // 重新加载数据库过滤器
            const response = await fetch(`/api/logs/filters/${filterId}`);
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                const dbFilter = result.data;
                console.log('重新加载数据库过滤器数据:', dbFilter);
                
                // 转换数据库格式到前端格式
                const filterData = convertDbFilterToFrontend(dbFilter);
                console.log('转换后的过滤器数据:', filterData);
                
                // 应用到表单
                applyFilterData(filterData);
                
                // 显示成功提示
                showReloadNotification('数据库过滤器数据已重新加载');
            } else {
                alert('过滤器不存在或加载失败');
            }
        }
    } catch (error) {
        console.error('重新加载过滤器数据失败:', error);
        alert('重新加载失败，请检查网络连接');
    }
}

// 显示重新加载成功通知
function showReloadNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10002;
        font-size: 14px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = `✅ ${message}`;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }
    }, 3000);
}

// 显示编辑模式通知
function showEditingModeNotification(filterName) {
    // 移除已存在的编辑通知
    const existingNotification = document.getElementById('editingModeNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'editingModeNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(255,152,0,0.3);
        z-index: 9999;
        max-width: 350px;
        font-size: 14px;
        font-weight: 500;
        border: 2px solid #ff9800;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <div style="font-weight: 700; margin-bottom: 4px;">
                    🔧 编辑模式
                </div>
                <div style="font-size: 13px; opacity: 0.9;">
                    正在编辑: ${filterName}
                </div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
                    修改表单后点击"保存过滤器"完成编辑
                </div>
            </div>
            <button onclick="cancelEditingMode()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-left: 12px;
            ">取消</button>
        </div>
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 添加悬停效果
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(-5px)';
        notification.style.boxShadow = '0 8px 25px rgba(255,152,0,0.4)';
    });
    
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
        notification.style.boxShadow = '0 6px 20px rgba(255,152,0,0.3)';
    });
}

// 取消编辑模式
function cancelEditingMode() {
    // 清除编辑状态
    window.currentEditingFilter = null;
    
    // 隐藏编辑按钮
    hideEditModeButtons();
    
    // 移除通知
    const notification = document.getElementById('editingModeNotification');
    if (notification) {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // 清空表单，恢复原始状态
    clearAllFilters();
    
    // 显示取消通知
    const cancelNotification = document.createElement('div');
    cancelNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6c757d;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
    `;
    cancelNotification.innerHTML = `
        <div>已取消编辑模式</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">表单已恢复原始状态</div>
    `;
    
    document.body.appendChild(cancelNotification);
    
    setTimeout(() => {
        if (cancelNotification.parentNode) {
            cancelNotification.parentNode.removeChild(cancelNotification);
        }
    }, 2000);
}

// 取消编辑过滤器
function cancelEditFilter() {
    const modal = document.getElementById('editFilterModal');
    if (modal) {
        modal.remove();
    }
    
    // 清空表单
    clearAllFilters();
}

// 保存编辑后的过滤器
async function saveEditedFilter(filterId, isLocal) {
    const newName = document.getElementById('editFilterName').value.trim();
    if (!newName) {
        alert('请输入过滤器名称');
        return;
    }
    
    // 获取当前表单的过滤条件
    const filterData = collectFilterData();
    
    try {
        if (isLocal) {
            // 更新本地过滤器
            const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            const filter = savedFilters.find(f => f.id == filterId);
            
            if (filter) {
                filter.name = newName;
                filter.data = filterData;
                localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
                
                // 关闭模态框
                cancelEditFilter();
                
                // 刷新列表
                loadSavedFilters();
                alert('过滤器更新成功！');
            }
        } else {
            // 更新数据库过滤器
            const dbFilterData = convertFrontendToDbFilter(newName, filterData);
            
            const response = await fetch(`/api/logs/filters/${filterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dbFilterData)
            });
            
            const result = await response.json();
            if (result.code === 200) {
                // 关闭模态框
                cancelEditFilter();
                
                // 刷新列表
                loadSavedFilters();
                alert('过滤器更新成功！');
            } else {
                alert('更新失败: ' + result.message);
            }
        }
    } catch (error) {
        console.error('保存编辑失败:', error);
        alert('保存失败，请检查网络连接');
    }
}

// 删除保存的过滤器
async function deleteSavedFilter(filterId, isLocal = false) {
    if (!confirm('确定要删除这个过滤器吗？')) {
        return;
    }
    
    if (isLocal) {
        // 删除本地过滤器
        const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
        const newFilters = savedFilters.filter(f => f.id != filterId);
        localStorage.setItem('savedFilters', JSON.stringify(newFilters));
        loadSavedFilters();
    } else {
        // 删除数据库过滤器
        try {
            const response = await fetch(`/api/logs/filters/${filterId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            if (result.code === 200) {
                loadSavedFilters();
                alert('过滤器删除成功！');
            } else {
                alert('删除失败: ' + result.message);
            }
        } catch (error) {
            console.error('删除过滤器失败:', error);
            alert('删除失败，请检查网络连接');
        }
    }
}

// ==================== 安全过滤器系统 ====================

// 初始化安全过滤器系统
function initializeSafeFilterSystem() {
    console.log('初始化安全过滤器系统...');
    
    // 防止重复初始化
    if (window.safeFilterSystemInitialized) {
        console.log('安全过滤器系统已初始化');
        return;
    }
    window.safeFilterSystemInitialized = true;
    
    // 恢复过滤器按钮功能
    restoreFilterButtons();
    
    // 设置页面切换监听
    setupPageSwitchListener();
    
    console.log('✅ 安全过滤器系统初始化完成');
}

// 安全应用过滤器到syslog页面
function safeApplyFilterToSyslog(filterData, filterName) {
    console.log('安全应用过滤器到syslog页面:', filterName || '自定义过滤器');
    
    // 防止重复调用
    if (window.isApplyingFilterSafe) {
        console.log('正在安全应用过滤器，跳过重复调用');
        return;
    }
    window.isApplyingFilterSafe = true;
    
    // 防止复杂过滤器导致的循环问题
    const isComplexFilter = filterData.facilities && filterData.facilities.length > 0 ||
                           filterData.sourceIP ||
                           (filterData.severities && filterData.severities.length > 4);
    
    if (isComplexFilter) {
        console.log('检测到复杂过滤器，使用简化处理');
        // 对复杂过滤器使用简化处理，避免循环
        setTimeout(() => {
            window.isApplyingFilterSafe = false;
        }, 500);
        
        // 只保存状态，不触发复杂的应用逻辑
        try {
            localStorage.setItem('appliedFilter', JSON.stringify(filterData));
            const stateData = {
                filterData: filterData,
                filterName: filterName || identifyFilterNameSafe(filterData),
                appliedAt: new Date().toISOString(),
                isActive: true
            };
            sessionStorage.setItem('currentActiveFilter', JSON.stringify(stateData));
            updateFilterStatusSafe(stateData.filterName);
            console.log('✅ 复杂过滤器状态保存完成');
        } catch (error) {
            console.error('复杂过滤器状态保存失败:', error);
        }
        return;
    }
    
    try {
        // 1. 保存过滤器数据到localStorage
        localStorage.setItem('appliedFilter', JSON.stringify(filterData));
        console.log('✅ 已保存过滤器数据');
        
        // ✨ 新增：保存过滤表单状态
        if (typeof saveAppliedFilterForm === 'function') {
            saveAppliedFilterForm(filterData);
        }
        
        // 2. 保存过滤器状态用于显示
        const stateData = {
            filterData: filterData,
            filterName: filterName || identifyFilterNameSafe(filterData),
            appliedAt: new Date().toISOString(),
            isActive: true
        };
        sessionStorage.setItem('currentActiveFilter', JSON.stringify(stateData));
        console.log('✅ 已保存过滤器状态');
        
        // 3. 如果当前在syslog页面，直接应用过滤条件
        const currentPage = getCurrentPageType();
        if (currentPage === 'syslog') {
            console.log('当前在syslog页面，直接应用过滤条件');
            applySyslogFilters(filterData);
        } else {
            console.log('当前不在syslog页面，过滤器将在切换到syslog页面时应用');
        }
        
        // 4. 更新过滤器状态显示
        updateFilterStatusSafe(stateData.filterName);
        
        console.log('✅ 过滤器应用完成');
        
    } catch (error) {
        console.error('安全应用过滤器失败:', error);
    } finally {
        // 重置应用标记
        setTimeout(() => {
            window.isApplyingFilterSafe = false;
        }, 1000);
    }
}

// 安全的过滤器名称识别
function identifyFilterNameSafe(filterData) {
    if (filterData.severities && filterData.severities.length > 0) {
        const severities = filterData.severities;
        
        if (severities.every(s => s <= 3)) {
            return '错误日志过滤器';
        } else if (severities.includes(4) && severities.length === 1) {
            return '警告日志过滤器';
        } else if (severities.every(s => s >= 5)) {
            return '信息日志过滤器';
        }
    }
    
    if (filterData.keyword) {
        const keyword = filterData.keyword.toLowerCase();
        if (keyword.includes('network') || keyword.includes('网络')) {
            return '网络日志过滤器';
        } else if (keyword.includes('security') || keyword.includes('安全')) {
            return '安全日志过滤器';
        } else if (keyword.includes('system') || keyword.includes('系统')) {
            return '系统日志过滤器';
        }
    }
    
    return '自定义过滤器';
}

// 检测当前页面类型
function getCurrentPageType() {
    const logMain = document.querySelector('.log-main');
    if (!logMain) return 'unknown';
    
    const content = logMain.innerHTML;
    if (content.includes('toolbar') && content.includes('timeRange') && content.includes('searchKeyword')) {
        return 'syslog';
    } else if (content.includes('高级日志过滤器') || content.includes('filter-header')) {
        return 'filtering';
    }
    
    return 'unknown';
}

// 直接应用过滤条件到syslog页面
function applySyslogFilters(filterData) {
    console.log('应用过滤条件到syslog页面元素...');
    
    // 防止重复调用
    if (window.isApplyingSyslogFilters) {
        console.log('正在应用syslog过滤条件，跳过重复调用');
        return;
    }
    window.isApplyingSyslogFilters = true;
    
    // 检测复杂过滤器
    const isComplexFilter = filterData.facilities && filterData.facilities.length > 0 ||
                           filterData.sourceIP ||
                           (filterData.severities && filterData.severities.length > 4);
    
    if (isComplexFilter) {
        console.log('检测到复杂过滤器，使用简化应用方式');
        // 对复杂过滤器只应用基础可视条件（时间范围/关键字/严重性），避免触发循环
        try {
            if (filterData.timeRange) {
                const timeRangeSelect = document.getElementById('timeRange');
                if (timeRangeSelect) {
                    timeRangeSelect.value = filterData.timeRange;
                    console.log('✅ 已设置时间范围:', filterData.timeRange);
                }
            }
            
            const searchKeyword = document.getElementById('searchKeyword');
            if (searchKeyword) {
                searchKeyword.value = filterData.keyword || '';
                if (filterData.keyword) {
                    console.log('✅ 已设置搜索关键字:', filterData.keyword);
                } else {
                    console.log('✅ 搜索关键字已清空');
                }
            }

            // 即便是复杂过滤器，也同步严重性按钮的显示状态，方便用户理解当前条件
            if (Array.isArray(filterData.severities)) {
                syncSeverityFilterButtons(filterData.severities);
            } else {
                syncSeverityFilterButtons([]);
            }
            
            console.log('✅ 复杂过滤器简化应用完成');
        } catch (error) {
            console.error('复杂过滤器简化应用失败:', error);
        } finally {
            setTimeout(() => {
                window.isApplyingSyslogFilters = false;
            }, 1000);
        }
        return;
    }
    
    try {
        // 应用时间范围
        if (filterData.timeRange) {
            const timeRangeSelect = document.getElementById('timeRange');
            if (timeRangeSelect) {
                timeRangeSelect.value = filterData.timeRange;
                console.log('✅ 已设置时间范围:', filterData.timeRange);
            }
        }
        
        // 应用搜索关键字
        if (filterData.keyword) {
            const searchKeyword = document.getElementById('searchKeyword');
            if (searchKeyword) {
                searchKeyword.value = filterData.keyword;
                console.log('✅ 已设置搜索关键字:', filterData.keyword);
            }
        }
        
        // 应用严重性级别
        if (filterData.severities && filterData.severities.length > 0) {
            syncSeverityFilterButtons(filterData.severities);
            console.log('✅ 已设置严重性级别:', filterData.severities);
        } else {
            syncSeverityFilterButtons([]);
        }
        
        // 触发数据重新加载
        setTimeout(() => {
            if (typeof loadSyslogData === 'function') {
                loadSyslogData();
                console.log('✅ 已触发syslog数据重新加载');
            }
        }, 300);
        
    } catch (error) {
        console.error('应用syslog过滤条件失败:', error);
    } finally {
        // 重置应用标记
        setTimeout(() => {
            window.isApplyingSyslogFilters = false;
        }, 1000);
    }
}

// 安全的状态显示更新
function updateFilterStatusSafe(filterName) {
    try {
        const activeFilterNameElement = document.getElementById('activeFilterName');
        if (activeFilterNameElement) {
            activeFilterNameElement.textContent = filterName;
            activeFilterNameElement.style.color = '#28a745';
            console.log('✅ 已更新过滤器状态显示:', filterName);
        }
    } catch (error) {
        console.error('更新过滤器状态显示失败:', error);
    }
}

// 恢复过滤器应用按钮的功能
function restoreFilterButtons() {
    console.log('恢复过滤器应用按钮功能...');
    
    // 查找所有过滤器应用按钮
    const applyButtons = document.querySelectorAll('.filter-item .btn-primary');
    
    applyButtons.forEach((button, index) => {
        // 移除现有的事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 添加新的安全事件监听器
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const filterItem = this.closest('.filter-item');
            const filterNameElement = filterItem.querySelector('.filter-item-name');
            const filterName = filterNameElement ? filterNameElement.textContent.trim() : '未知过滤器';
            
            console.log('点击应用过滤器:', filterName);
            
            // 根据过滤器名称创建过滤器数据
            let filterData = createFilterDataByName(filterName);
            
            if (filterData) {
                safeApplyFilterToSyslog(filterData, filterName);
            } else {
                console.warn('无法识别过滤器类型:', filterName);
            }
        });
    });
    
    console.log(`✅ 已恢复 ${applyButtons.length} 个过滤器按钮功能`);
}

// 根据过滤器名称创建过滤器数据
function createFilterDataByName(filterName) {
    const name = filterName.toLowerCase();
    
    if (name.includes('错误')) {
        return {
            timeRange: 'week',
            severities: [0, 1, 2, 3], // 紧急、警报、严重、错误
            keyword: '',
            facilities: [],
            eventIds: []
        };
    } else if (name.includes('警告')) {
        return {
            timeRange: 'week',
            severities: [4], // 警告
            keyword: '',
            facilities: [],
            eventIds: []
        };
    } else if (name.includes('信息')) {
        return {
            timeRange: 'week',
            severities: [5, 6, 7], // 通知、信息、调试
            keyword: '',
            facilities: [],
            eventIds: []
        };
    } else if (name.includes('网络')) {
        return {
            timeRange: 'week',
            severities: [],
            keyword: 'network',
            facilities: [],
            eventIds: []
        };
    } else if (name.includes('安全')) {
        return {
            timeRange: 'week',
            severities: [],
            keyword: 'security',
            facilities: [],
            eventIds: []
        };
    }
    
    // 默认过滤器
    return {
        timeRange: 'week',
        severities: [],
        keyword: '',
        facilities: [],
        eventIds: []
    };
}

// 页面切换时自动应用过滤器
function setupPageSwitchListener() {
    console.log('设置页面切换时自动应用过滤器...');
    
    // 监听页面内容变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const logMain = document.querySelector('.log-main');
                if (logMain && mutation.target === logMain) {
                    const currentPage = getCurrentPageType();
                    
                    if (currentPage === 'syslog') {
                        // 切换到syslog页面，检查是否有待应用的过滤器
                        setTimeout(() => {
                            const appliedFilter = localStorage.getItem('appliedFilter');
                            if (appliedFilter) {
                                try {
                                    const filterData = JSON.parse(appliedFilter);
                                    console.log('检测到切换到syslog页面，应用保存的过滤器');
                                    applySyslogFilters(filterData);
                                } catch (e) {
                                    console.error('应用保存的过滤器失败:', e);
                                }
                            }
                        }, 500);
                    } else if (currentPage === 'filtering') {
                        // 切换到过滤页面，重新加载过滤器列表和恢复按钮功能
                        setTimeout(() => {
                            console.log('切换到过滤页面，重新加载过滤器列表');
                            if (typeof loadSavedFilters === 'function') {
                                loadSavedFilters().then(() => {
                                    // 过滤器列表加载完成后，恢复按钮功能
                                    setTimeout(() => {
                                        restoreFilterButtons();
                                    }, 300);
                                });
                            } else {
                                restoreFilterButtons();
                            }
                        }, 500);
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ 页面切换监听已设置');
}

// 全局暴露安全过滤器函数
window.safeApplyFilterToSyslog = safeApplyFilterToSyslog;

// ✨ 保存已应用的过滤表单状态
function saveAppliedFilterForm(filterData) {
    console.log('💾 保存已应用的过滤表单状态:', filterData);
    
    const formState = {
        filterData: filterData,
        appliedAt: new Date().toISOString(),
        isApplied: true
    };
    
    // 保存到localStorage，以便页面刷新后也能恢复
    localStorage.setItem('appliedFilterFormState', JSON.stringify(formState));
    console.log('✅ 过滤表单状态已保存');
}

// ✨ 恢复已应用的过滤表单状态
function restoreAppliedFilterForm() {
    console.log('🔄 尝试恢复已应用的过滤表单状态...');
    
    try {
        const savedState = localStorage.getItem('appliedFilterFormState');
        
        if (!savedState) {
            console.log('没有找到已保存的过滤表单状态');
            return;
        }
        
        const formState = JSON.parse(savedState);
        
        if (!formState.isApplied) {
            console.log('过滤器未应用，不恢复表单');
            return;
        }
        
        console.log('📝 恢复过滤表单数据:', formState.filterData);
        
        // 使用现有的 applyFilterData 函数恢复表单
        applyFilterData(formState.filterData);
        
        // 显示一个友好的提示，告诉用户当前显示的是已应用的条件
        showAppliedFilterIndicator(formState.appliedAt);
        
        console.log('✅ 过滤表单状态已恢复');
        
    } catch (error) {
        console.error('恢复过滤表单状态失败:', error);
    }
}

// ✨ 显示"已应用过滤器"指示器
function showAppliedFilterIndicator(appliedAt) {
    // 检查是否已存在指示器
    const existingIndicator = document.querySelector('.applied-filter-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // 创建指示器
    const indicator = document.createElement('div');
    indicator.className = 'applied-filter-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    const time = new Date(appliedAt).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    indicator.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>当前显示已应用的过滤条件 (${time})</span>
        <button onclick="clearAppliedFilterForm()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
        ">✕ 清除</button>
    `;
    
    document.body.appendChild(indicator);
    
    // 3秒后自动淡出（但不移除，保留清除按钮）
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s ease';
        indicator.style.opacity = '0.7';
    }, 3000);
}

// ✨ 清除已应用的过滤表单状态
function clearAppliedFilterForm() {
    console.log('🗑️ 清除已应用的过滤表单状态');
    
    // 移除保存的状态
    localStorage.removeItem('appliedFilterFormState');
    
    // 清空表单
    if (typeof clearAllFilters === 'function') {
        clearAllFilters();
    }
    
    // 移除指示器
    const indicator = document.querySelector('.applied-filter-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    console.log('✅ 过滤表单状态已清除');
}

// 全局暴露新函数
window.restoreAppliedFilterForm = restoreAppliedFilterForm;
window.clearAppliedFilterForm = clearAppliedFilterForm;
