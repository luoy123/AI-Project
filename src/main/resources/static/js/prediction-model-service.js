/**
 * 算法模型服务管理 - 前端逻辑
 */

// 全局变量
let modelServiceCurrentPage = 1;
let modelServicePageSize = 20;
let modelServiceTotalRecords = 0;
let modelServiceList = [];
var deviceCategoriesCache = null;
let deviceSelectionCounter = 0;
let trainingTargetCounter = 0;
// 设备缓存：按分类缓存资产列表，以及当前所有选中分类对应的设备合集
let devicesByCategoryCache = {};
let selectedDevicesCache = [];

// 算法类型选项（硬编码）
const algorithmTypes = [
    { value: 'KNN',     label: 'KNN多变量时间序列预测',  description: '基于K近邻算法的时间序列预测' },
    { value: 'Prophet', label: 'Prophet时间序列预测',    description: 'Facebook开源的时间序列预测算法' },
    { value: 'LSTM',    label: 'LSTM深度学习预测',       description: '基于长短期记忆网络的深度学习预测' },
    { value: 'ARIMA',   label: 'ARIMA统计预测',          description: '自回归移动平均模型' },
    { value: 'XGBoost', label: 'XGBoost机器学习预测',    description: '梯度提升决策树算法' }
];

// 设备类型选项
const deviceTypes = [
    { value: 'server', label: '服务器' },
    { value: 'network', label: '网络设备' },
    { value: 'storage', label: '存储设备' },
    { value: 'database', label: '数据库' },
    { value: 'application', label: '应用服务' }
];

// 监控类型选项
const monitoringTypes = [
    { value: 'cpu', label: 'CPU监控' },
    { value: 'memory', label: '内存监控' },
    { value: 'disk', label: '磁盘监控' },
    { value: 'network', label: '网络监控' },
    { value: 'temperature', label: '温度监控' },
    { value: 'performance', label: '性能监控' }
];

// 检测类型名称映射（对应detection_template表的detection_type字段）
var detectionTypeNames = window.detectionTypeNames || {
    'performance': '性能监控',
    'capacity': '容量监控',
    'fault': '故障检测',
    'health': '健康检查',
    'cpu': 'CPU监控',
    'memory': '内存监控',
    'disk': '磁盘监控',
    'network': '网络监控',
    'temperature': '温度监控'
};
window.detectionTypeNames = detectionTypeNames;

/**
 * 加载检测模板数据
 */
async function loadDetectionTemplates() {
    try {
        const response = await fetch('/api/detection-templates');
        const result = await response.json();
        
        if (result.code === 200) {
            console.log('✅ 检测模板加载成功:', result.data.length, '条');
            return result.data;
        } else {
            console.error('❌ 加载检测模板失败:', result.message);
            return [];
        }
    } catch (error) {
        console.error('❌ 加载检测模板失败:', error);
        return [];
    }
}

/**
 * 页面初始化
 */
function initModelServicePage() {
    console.log('🚀 初始化算法模型服务页面');

    // 加载服务列表
    loadServiceList();

    // 绑定搜索按钮事件
    bindSearchEvents();

    // 绑定新建按钮事件
    bindCreateButtonEvent();

    // 初始化弹窗中的算法选项
    initAlgorithmOptions();
}

/**
 * 加载服务列表
 */
function loadServiceList(filters = {}) {
    console.log('📋 加载服务列表', filters);

    // 构建查询参数
    const params = new URLSearchParams();
    if (filters.serviceName) params.append('serviceName', filters.serviceName);
    if (filters.status !== undefined) params.append('status', filters.status);
    if (filters.algorithmType) params.append('algorithmType', filters.algorithmType);
    if (filters.deviceType) params.append('deviceType', filters.deviceType);
    if (filters.keyword) params.append('keyword', filters.keyword);

    // 调用API
    fetch(`/api/prediction/services?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            serviceList = result.data.list || result.data || [];
            totalRecords = serviceList.length;
            renderServiceTable();
            updatePagination();
            console.log('✅ 服务列表加载成功', serviceList.length, '条记录');
        } else {
            console.error('❌ 加载服务列表失败:', result.message);
            showToast('加载失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 加载服务列表异常:', error);
        showToast('加载失败: ' + error.message, 'error');
    });
}

/**
 * 渲染服务表格
 */
function renderServiceTable() {
    const tbody = document.querySelector('.model-table tbody');
    if (!tbody) {
        console.warn('⚠️ 未找到表格tbody元素');
        return;
    }

    // 清空现有内容
    tbody.innerHTML = '';

    if (serviceList.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>暂无数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // 渲染数据行
    serviceList.forEach(service => {
        const row = createServiceRow(service);
        tbody.appendChild(row);
    });
}

/**
 * 创建服务行
 * 列顺序与页面表头保持一致：
 * 状态 / 算法模型服务名称 / 训练对象 / 模型数量 / 更新时间 / 计算方法 / 操作
 */
function createServiceRow(service) {
    const tr = document.createElement('tr');

    // 状态（后端返回的 status 可能是 1/0，也可能是 true/false，这里统一转换为布尔值）
    const rawStatus = service.status;
    const isEnabled = rawStatus === 1 || rawStatus === '1' || rawStatus === true;
    const statusClass = isEnabled ? 'enabled' : 'disabled';
    const statusText = isEnabled ? '启用' : '停用';

    // 服务名称
    const serviceName = service.service_name || service.serviceName || '-';

    // 训练对象数量（去重后的监控类型+指标组合数量，由后端计算）
    const trainingTargetCount =
        service.training_target_count ||
        service.trainingTargetCount || 0;

    // 模型数量：优先使用 modelCount，否则使用 trainCount
    const modelCount =
        service.model_count ||
        service.modelCount || 0;

    // 更新时间
    const updateTime = service.update_time || service.updateTime || '-';

    // 计算方法（算法类型）
    const algorithm = service.algorithm_type || service.algorithmType || '-';

    tr.innerHTML = `
        <td><span class="model-status ${statusClass}">● ${statusText}</span></td>
        <td>${serviceName}</td>
        <td><a href="javascript:void(0)" onclick="showTrainingTargets(${service.id})" style="color: #667eea; text-decoration: underline; cursor: pointer;">${trainingTargetCount}</a></td>
        <td><a href="javascript:void(0)" onclick="viewServiceModels(${service.id})" style="color: #667eea; text-decoration: underline; cursor: pointer;">${modelCount}</a></td>
        <td>${updateTime}</td>
        <td>${algorithm}</td>
        <td>
            <div class="model-actions">
                <button class="btn-link" onclick="toggleStatus(${service.id}, ${isEnabled ? 1 : 0})">
                    ${isEnabled ? '停用' : '启用'}
                </button>
                <button class="btn-link" onclick="editService(${service.id})">编辑</button>
                <button class="btn-link" onclick="viewServiceDetail(${service.id})">详情</button>
                <button class="btn-link" onclick="deleteService(${service.id})">删除</button>
            </div>
        </td>
    `;

    return tr;
}

/**
 * 更新分页信息
 */
function updatePagination() {
    const totalPages = Math.ceil(modelServiceTotalRecords / modelServicePageSize);
    const paginationInfo = document.querySelector('.model-pagination .pagination-info');

    if (paginationInfo) {
        paginationInfo.textContent = `共 ${modelServiceTotalRecords} 条记录，${modelServicePageSize} 条/页，第 ${modelServiceCurrentPage} 页，总共 ${totalPages} 页`;
    }
}

/**
 * 绑定搜索事件
 */
function bindSearchEvents() {
    const searchBtn = document.querySelector('.btn-model-search');
    const resetBtn = document.querySelector('.btn-model-reset');
    const nameInput = document.querySelector('.model-input');

    // 搜索按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // 重置按钮点击事件
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    // 输入框回车时搜索
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * 执行搜索
 */
function performSearch() {
    // 算法模型服务名称
    const serviceName = document.querySelector('.model-input')?.value.trim() || '';
    // 状态筛选
    const statusValue = document.querySelector('.model-select[name="status"]')?.value || '';
    // 计算方法筛选（算法类型）
    const algorithmType = document.querySelector('.model-select[name="algorithmTypeFilter"]')?.value || '';

    console.log('🔍 执行搜索:', { serviceName, status: statusValue, algorithmType });

    loadServiceList({
        serviceName,
        status: statusValue ? parseInt(statusValue) : undefined,
        algorithmType: algorithmType || undefined,
        deviceType: '',
        keyword: ''
    });
}

/**
 * 重置筛选条件
 */
function resetFilters() {
    console.log('🔄 重置筛选条件');
    
    // 重置所有筛选控件
    const statusSelect = document.querySelector('.model-select[name="status"]');
    const algSelect = document.querySelector('.model-select[name="algorithmTypeFilter"]');
    const nameInput = document.querySelector('.model-input');
    
    if (statusSelect) statusSelect.value = '';
    if (algSelect) algSelect.value = '';
    if (nameInput) nameInput.value = '';
    
    // 加载全部数据
    loadServiceList({});
}

/**
 * 绑定新建按钮事件
 */
function bindCreateButtonEvent() {
    const createBtn = document.querySelector('.btn-new-model');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            showModelServiceModal();
        });
    }
}

/**
 * 初始化算法选项
 */
function initAlgorithmOptions() {
    const algorithmContainer = document.querySelector('.algorithm-selection');
    if (!algorithmContainer) return;

    algorithmContainer.innerHTML = '';

    algorithmTypes.forEach((alg, index) => {
        const option = document.createElement('div');
        option.className = 'algorithm-option' + (index === 0 ? ' selected' : '');
        option.dataset.value = alg.value;
        option.innerHTML = `
            <div class="algorithm-name">${alg.label}</div>
            <div class="algorithm-desc">${alg.description}</div>
        `;

        option.addEventListener('click', () => {
            document.querySelectorAll('.algorithm-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
        });

        algorithmContainer.appendChild(option);
    });
}

/**
 * 显示新建/编辑弹窗
 */
function showModelServiceModal(serviceId = null) {
    const modal = document.getElementById('modelServiceModal');
    const title = document.getElementById('modelServiceModalTitle');
    const form = document.getElementById('modelServiceForm');
    const saveBtn = document.querySelector('.btn-save-model');

    if (!modal || !title || !form) {
        console.error('❌ 弹窗元素未找到');
        return;
    }

    // 每次打开弹窗前，恢复为可编辑模式
    if (saveBtn) {
        saveBtn.style.display = '';
    }
    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.disabled = false;
        el.readOnly = false;
    });

    // 重置表单
    form.reset();
    document.getElementById('modelServiceId').value = '';

    if (serviceId) {
        // 编辑模式 - 加载服务详情
        title.textContent = '编辑算法模型服务';
        loadServiceDetail(serviceId);
    } else {
        // 新建模式
        title.textContent = '新建算法模型服务';

        // 清空设备选择列表
        const deviceList = document.getElementById('deviceSelectionList');
        if (deviceList) {
            deviceList.innerHTML = '';
        }
        deviceSelectionCounter = 0;

        // 清空训练目标列表
        const targetsList = document.getElementById('trainingTargetsList');
        if (targetsList) {
            targetsList.innerHTML = '';
        }
        trainingTargetCounter = 0;

        // 设置默认值
        document.getElementById('updateCycle').value = '7';
        document.getElementById('predictionCycle').value = '1';
        document.getElementById('predictionDuration').value = '1';
        document.getElementById('autoPrediction').checked = true;

        // 加载设备分类数据
        loadDeviceCategories();

        // 添加第一行设备选择
        setTimeout(() => {
            addDeviceSelectionRow();
        }, 100);

        // 添加第一行训练目标
        setTimeout(() => {
            addTrainingTargetRow();
        }, 150);
    }

    modal.style.display = 'flex';
}

/**
 * 加载服务详情
 */
function loadServiceDetail(serviceId) {
    fetch(`/api/prediction/services/${serviceId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            const detail = result.data || {};
            const service = detail.service || detail;
            const models = detail.models || [];
            console.log('🧩 加载服务详情成功:', detail);
            console.log('🧩 模型组合(models)数量:', Array.isArray(models) ? models.length : 'not-array');
            if (Array.isArray(models) && models.length > 0) {
                console.log('🧩 第一条模型记录:', models[0]);
            }
            fillServiceForm(service, models);
        } else {
            showToast('加载服务详情失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 加载服务详情异常:', error);
        showToast('加载失败: ' + error.message, 'error');
    });
}

/**
 * 填充表单数据
 * @param service 服务基础信息
 * @param models  模型组合列表（可选，用于多设备/多指标回显）
 */
// 辅助函数：忽略大小写和下划线差异读取字段
function getFieldIgnoreCase(obj, ...names) {
    if (!obj) return null;
    const keys = Object.keys(obj);
    for (const name of names) {
        if (obj[name] !== undefined && obj[name] !== null) {
            return obj[name];
        }
        const lower = name.toLowerCase();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key && key.toLowerCase() === lower && obj[key] !== undefined && obj[key] !== null) {
                return obj[key];
            }
        }
    }
    return null;
}

function fillServiceForm(service, models) {
    // 确保 models 为数组
    if (!Array.isArray(models)) {
        models = [];
    }

    const idInput = document.getElementById('modelServiceId');
    if (idInput) idInput.value = service.id || '';

    const nameInput = document.getElementById('serviceName');
    if (nameInput) nameInput.value = service.service_name || service.serviceName || '';

    const updateCycleInput = document.getElementById('updateCycle');
    if (updateCycleInput) {
        // 直接使用服务配置的更新周期，不进行智能推荐
        updateCycleInput.value = service.update_cycle || service.updateCycle || 7;
    }

    const predictionCycleInput = document.getElementById('predictionCycle');
    if (predictionCycleInput) predictionCycleInput.value = service.prediction_cycle || service.predictionCycle || 1;

    const predictionDurationInput = document.getElementById('predictionDuration');
    if (predictionDurationInput) predictionDurationInput.value = service.prediction_duration || service.predictionDuration || 1;

    const autoPredictionCheckbox = document.getElementById('autoPrediction');
    if (autoPredictionCheckbox) autoPredictionCheckbox.checked = (service.auto_prediction || service.autoPrediction) === 1;

    const notesInput = document.getElementById('serviceNotes');
    if (notesInput) notesInput.value = service.notes || '';

    // 选择算法类型
    const algorithmType = service.algorithm_type || service.algorithmType;
    if (algorithmType) {
        document.querySelectorAll('.algorithm-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === algorithmType) {
                opt.classList.add('selected');
            }
        });
    }

    // ==================== 设备选择回填（支持多行） ====================
    const deviceList = document.getElementById('deviceSelectionList');
    if (deviceList) {
        deviceList.innerHTML = '';
    }
    deviceSelectionCounter = 0;

    // 从 models 中提取唯一的设备分类
    const deviceCategories = [];
    const deviceCategorySet = new Set();
    models.forEach(m => {
        const categoryId = getFieldIgnoreCase(m, 'category_id', 'categoryId');
        const categoryName = getFieldIgnoreCase(m, 'category_name', 'categoryName');
        const parentCategoryName = getFieldIgnoreCase(m, 'parent_category_name', 'parentCategoryName');
        if (!categoryId) return;
        if (!deviceCategorySet.has(categoryId)) {
            deviceCategorySet.add(categoryId);
            deviceCategories.push({ 
                categoryId: categoryId,
                categoryName: categoryName,
                parentName: parentCategoryName 
            });
        }
    });

    if (deviceCategories.length > 0) {
        // 使用 models 中的设备分类回填多行设备
        loadDeviceCategories().then(() => {
            deviceCategories.forEach((device, index) => {
                const { categoryId, categoryName, parentName } = device;

                setTimeout(() => {
                    const rowId = addDeviceSelectionRow();

                    // 等待 addDeviceSelectionRow 内部加载完设备大类选项后，再设置选中的值
                    setTimeout(() => {
                        const row = document.getElementById(rowId);
                        if (!row) return;

                        const categorySelect = row.querySelector('.device-category-select');
                        const subcategorySelect = row.querySelector('.device-subcategory-select');
                        if (!categorySelect || !subcategorySelect) return;

                        // 如果有父级分类名称，先选中父级分类
                        if (parentName) {
                            const options = categorySelect.options;
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].textContent === parentName || options[i].value === parentName) {
                                    categorySelect.value = options[i].value;
                                    window.onDeviceCategoryChange(rowId); // 触发加载子分类
                                    break;
                                }
                            }
                        }

                        // 再选中对应的子分类（给子分类接口足够时间返回数据）
                        setTimeout(() => {
                            const subOptions = subcategorySelect.options;
                            for (let i = 0; i < subOptions.length; i++) {
                                // 使用 categoryId 进行精确匹配
                                if (subOptions[i].value === String(categoryId)) {
                                    subcategorySelect.value = subOptions[i].value;
                                    // 触发 change 事件，以便加载对应的设备列表
                                    subcategorySelect.dispatchEvent(new Event('change'));
                                    break;
                                }
                            }
                        }, 800);
                    }, 200);
                }, index * 400);
            });
        });
    } else {
        // 如果没有模型数据，添加一个空行
        addDeviceSelectionRow();
    }

    // ==================== 训练指标回填（支持多行，每行包含设备+检测类型+指标） ====================
    const targetsList = document.getElementById('trainingTargetsList');
    if (targetsList) {
        targetsList.innerHTML = '';
    }
    trainingTargetCounter = 0;

    if (Array.isArray(models) && models.length > 0) {
        // 每条模型数据一行：设备 + 检测类型 + 指标
        models.forEach((m, index) => {
            const monitoringType = getFieldIgnoreCase(m, 'monitoring_type', 'monitoringType');
            const monitoringMetric = getFieldIgnoreCase(m, 'monitoring_metric', 'monitoringMetric');
            const deviceId = getFieldIgnoreCase(m, 'device_id', 'deviceId');

            // 没有监控类型和指标时跳过
            if (!monitoringType && !monitoringMetric) {
                return;
            }

            setTimeout(() => {
                addTrainingTargetRow();

                setTimeout(() => {
                    const rows = document.querySelectorAll('.training-target-row');
                    const row = rows[rows.length - 1];
                    if (!row) return;

                    const deviceSelect = row.querySelector('.device-select');
                    const typeSelect = row.querySelector('.detection-type-select');
                    const metricSelect = row.querySelector('.metric-select');

                    // 先设置监测类型
                    if (typeSelect && monitoringType) {
                        typeSelect.value = monitoringType;
                        typeSelect.dispatchEvent(new Event('change'));

                        // 等待指标加载完成后设置指标值
                        setTimeout(() => {
                            if (metricSelect && monitoringMetric) {
                                const metricOptions = metricSelect.options;
                                for (let i = 0; i < metricOptions.length; i++) {
                                    if (metricOptions[i].textContent === monitoringMetric || metricOptions[i].value === monitoringMetric) {
                                        metricSelect.value = metricOptions[i].value;
                                        break;
                                    }
                                }
                            }
                        }, 200);
                    }

                    // 再设置设备选择（依赖于上方设备分类回填后 updateDevicesForTrainingTargets 已经填充好设备列表）
                    // 需要等待设备列表加载完成（设备小类选中后800ms + 设备列表加载时间）
                    if (deviceSelect && deviceId) {
                        setTimeout(() => {
                            deviceSelect.value = String(deviceId);
                            console.log('✅ 设置设备ID:', deviceId, '当前值:', deviceSelect.value);
                        }, 1200);
                    }
                }, 220);
            }, index * 250 + 300);
        });
    } else {
        // 兼容旧数据：只有 service.monitoring_type / monitoring_metric 时，回填一行
        const monitoringType = service.monitoring_type || service.monitoringType;
        const monitoringMetric = service.monitoring_metric || service.monitoringMetric;

        if (monitoringType || monitoringMetric) {
            setTimeout(() => {
                addTrainingTargetRow();
                setTimeout(() => {
                    const firstRow = document.querySelector('.training-target-row');
                    if (firstRow) {
                        const typeSelect = firstRow.querySelector('.detection-type-select');
                        const metricSelect = firstRow.querySelector('.metric-select');

                        if (typeSelect && monitoringType) {
                            typeSelect.value = monitoringType;
                            typeSelect.dispatchEvent(new Event('change'));

                            setTimeout(() => {
                                if (metricSelect && monitoringMetric) {
                                    const metricOptions = metricSelect.options;
                                    for (let i = 0; i < metricOptions.length; i++) {
                                        if (metricOptions[i].textContent === monitoringMetric || metricOptions[i].value === monitoringMetric) {
                                            metricSelect.value = metricOptions[i].value;
                                            break;
                                        }
                                    }
                                }
                            }, 200);
                        }
                    }
                }, 100);
            }, 400);
        }
    }
}

/**
 * 保存服务
 */
function saveModelService() {
    const form = document.getElementById('modelServiceForm');
    const serviceId = document.getElementById('modelServiceId').value;

    // 获取选中的算法类型
    const selectedAlgorithm = document.querySelector('.algorithm-option.selected');
    if (!selectedAlgorithm) {
        showToast('请选择算法类型', 'warning');
        return;
    }

    // 收集所有设备选择（包含设备大类和设备小类）
    const deviceRows = document.querySelectorAll('.device-selection-row');
    const devices = [];
    const deviceTypeNames = ['服务器', '网络设备', '存储设备', '视频管理']; // 设备大类名称列表
    
    console.log('📊 开始收集设备，总行数:', deviceRows.length);
    
    deviceRows.forEach((row, index) => {
        const catSelect = row.querySelector('.device-category-select');
        const subSelect = row.querySelector('.device-subcategory-select');
        
        const catIndex = catSelect ? catSelect.selectedIndex : -1;
        const subIndex = subSelect ? subSelect.selectedIndex : -1;
        
        const catOpt = catSelect && catIndex > 0 ? catSelect.options[catIndex] : null;
        const subOpt = subSelect && subIndex > 0 ? subSelect.options[subIndex] : null;
        
        const deviceType = catOpt ? catOpt.textContent.trim() : '';
        const categoryId = subOpt ? subOpt.value : '';
        const categoryName = subOpt ? subOpt.textContent.trim() : '';
        
        console.log(`📋 设备行 ${index + 1}:`, {
            deviceType,
            categoryId,
            categoryName,
            willCollect: categoryId && categoryId.length > 0
        });
        
        // 只收集第二个下拉框的 value（category_id）
        if (subSelect && subIndex > 0) {
            if (categoryId && categoryId.length > 0) {
                devices.push(parseInt(categoryId));
                console.log(`✅ 收集设备分类ID: ${categoryId} (${categoryName})`);
            } else {
                console.log(`❌ 跳过设备: ${categoryName} (原因: ID为空)`);
            }
        } else {
            console.log(`❌ 跳过设备行 ${index + 1} (原因: 未选择或选择了占位选项)`);
        }
    });
    
    console.log('📦 最终收集到的设备:', devices);

    // 收集所有训练目标行（设备 + 监控类型 + 指标）
    const targetRows = document.querySelectorAll('.training-target-row');
    const targets = [];
    const modelDevices = [];
    targetRows.forEach(row => {
        const deviceSelect = row.querySelector('.device-select');
        const typeSelect = row.querySelector('.detection-type-select');
        const metricSelect = row.querySelector('.metric-select');
        if (typeSelect && typeSelect.value && metricSelect && metricSelect.value && metricSelect.selectedIndex > 0) {
            const metricOpt = metricSelect.options[metricSelect.selectedIndex];
            const monitoringType = typeSelect.value;
            const monitoringMetric = metricOpt ? metricOpt.textContent : '';

            targets.push({
                monitoringType,
                monitoringMetric
            });

            // 同时收集每行的设备信息，便于后端精确到具体设备
            if (deviceSelect && deviceSelect.value) {
                const deviceId = parseInt(deviceSelect.value);
                let categoryId = null;
                // 从 option 上带的 data-category-id 取分类
                const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
                if (selectedOption && selectedOption.getAttribute('data-category-id')) {
                    categoryId = parseInt(selectedOption.getAttribute('data-category-id'));
                }

                modelDevices.push({
                    deviceId,
                    categoryId,
                    monitoringType,
                    monitoringMetric
                });
            }
        }
    });

    // 基于具体设备行生成“分类 + 指标”的唯一组合（不再做笛卡尔积）
    const modelsMap = new Map();
    modelDevices.forEach(dev => {
        // 如果没有categoryId，尝试从设备选择行中查找
        let categoryId = dev.categoryId;
        if (!categoryId || categoryId === '') {
            // 从"选择设备"部分查找对应的categoryId
            const deviceRows = document.querySelectorAll('.device-selection-row');
            deviceRows.forEach(row => {
                const subSelect = row.querySelector('.device-subcategory-select');
                if (subSelect && subSelect.value) {
                    categoryId = parseInt(subSelect.value);
                }
            });
        }
        
        if (!dev || !categoryId) {
            console.warn('⚠️ 跳过模型组合（缺少categoryId）:', dev);
            return;
        }
        const key = categoryId + '|' + (dev.monitoringType || '') + '|' + (dev.monitoringMetric || '');
        if (!modelsMap.has(key)) {
            modelsMap.set(key, {
                categoryId: categoryId,
                monitoringType: dev.monitoringType,
                monitoringMetric: dev.monitoringMetric
            });
        }
    });
    const models = Array.from(modelsMap.values());

    // 构建数据对象
    const data = {
        serviceName: document.getElementById('serviceName').value.trim(),
        algorithmType: selectedAlgorithm.dataset.value,
        updateCycle: parseInt(document.getElementById('updateCycle').value) || 7,
        predictionCycle: parseInt(document.getElementById('predictionCycle').value) || 1,
        predictionDuration: parseInt(document.getElementById('predictionDuration').value) || 1,
        autoPrediction: document.getElementById('autoPrediction').checked ? 1 : 0,
        notes: document.getElementById('serviceNotes').value.trim(),
        models: models,         // 抽象层：基于设备行去重后的 分类 + 监控类型 + 指标
        modelDevices: modelDevices // 具体设备层：设备 + 监控类型 + 指标
    };
    
    console.log('📦 准备保存的数据:', data);
    console.log('📊 模型组合数量:', models.length);
    console.log('📋 模型组合详情:', models);

    // 验证必填字段
    if (!data.serviceName) {
        alert('请输入算法模型服务名称！');
        document.getElementById('serviceName').focus();
        return;
    }
    
    if (!data.algorithmType) {
        alert('请选择计算方法！');
        return;
    }
    
    if (models.length === 0) {
        alert('请至少配置一个设备和训练指标！');
        return;
    }

    // 发送请求
    const url = serviceId ? `/api/prediction/services/${serviceId}` : '/api/prediction/services';
    const method = serviceId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            showToast(serviceId ? '更新成功' : '创建成功', 'success');
            closeModelServiceModal();
            loadServiceList();
        } else {
            showToast((serviceId ? '更新' : '创建') + '失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 保存服务异常:', error);
        showToast('保存失败: ' + error.message, 'error');
    });
}

/**
 * 关闭弹窗
 */
function closeModelServiceModal() {
    const modal = document.getElementById('modelServiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 编辑服务
 */
function editService(serviceId) {
    showModelServiceModal(serviceId);
}

/**
 * 查看服务详情（只读卡片式）
 */
function viewServiceDetail(serviceId) {
    console.log('📋 查看服务详情:', serviceId);
    
    fetch(`/api/prediction/services/${serviceId}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                const service = result.data;
                const models = service.models || [];
                
                // 状态显示
                const statusBadge = service.status === 1 
                    ? '<span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">● 启用</span>'
                    : '<span style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">● 停用</span>';
                
                // 创建详情内容
                let content = `
                    <div style="padding: 30px; max-width: 900px;">
                        <!-- 标题区域 -->
                        <div style="margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h2 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                                    ${service.serviceName || '服务详情'}
                                </h2>
                                ${statusBadge}
                            </div>
                            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">
                                服务编码: ${service.serviceCode || '-'}
                            </p>
                        </div>
                        
                        <!-- 基本信息卡片 -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; opacity: 0.9;">
                                <i class="fas fa-info-circle"></i> 基本信息
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">算法类型</div>
                                    <div style="font-size: 15px; font-weight: 500;">${service.algorithmType || '-'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">更新周期</div>
                                    <div style="font-size: 15px; font-weight: 500;">${service.updateCycle || 0} 天</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">预测周期</div>
                                    <div style="font-size: 15px; font-weight: 500;">${service.predictionCycle || 0} 天</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">预测时长</div>
                                    <div style="font-size: 15px; font-weight: 500;">${service.predictionDuration || 0} 天</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 训练对象列表 -->
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                                <i class="fas fa-bullseye"></i> 训练对象 (${models.length})
                            </h3>
                            ${models.length === 0 ? `
                                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                                    暂无训练对象
                                </div>
                            ` : `
                                <div style="display: grid; gap: 10px;">
                                    ${models.map((model, index) => `
                                        <div style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: grid; grid-template-columns: auto 1fr 1fr 1fr 1.5fr; gap: 15px; align-items: center;">
                                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">
                                                ${index + 1}
                                            </div>
                                            <div>
                                                <div style="font-size: 11px; color: #64748b; margin-bottom: 3px;">设备分类</div>
                                                <div style="font-size: 14px; color: #1e293b; font-weight: 500;">${model.categoryName || model.category_name || '-'}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 11px; color: #64748b; margin-bottom: 3px;">监控类型</div>
                                                <div style="font-size: 14px; color: #1e293b; font-weight: 500;">${model.monitoringType || model.monitoring_type || '-'}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 11px; color: #64748b; margin-bottom: 3px;">监控指标</div>
                                                <div style="font-size: 14px; color: #1e293b; font-weight: 500;">${model.monitoringMetric || model.monitoring_metric || '-'}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 11px; color: #64748b; margin-bottom: 3px;">设备名称</div>
                                                <div style="font-size: 14px; color: #1e293b; font-weight: 500;">${model.deviceName || model.device_name || '暂无设备'}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                        
                        <!-- 备注信息 -->
                        ${service.notes ? `
                            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                                    <i class="fas fa-sticky-note"></i> 备注说明
                                </h3>
                                <p style="margin: 0; color: #78350f; line-height: 1.6;">${service.notes}</p>
                            </div>
                        ` : ''}
                        
                        <!-- 关闭按钮 -->
                        <div style="text-align: right; margin-top: 30px;">
                            <button onclick="closeServiceDetailModal()" style="
                                padding: 12px 32px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 15px;
                                font-weight: 500;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                transition: all 0.2s;
                            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px -2px rgba(0, 0, 0, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)';">
                                关闭
                            </button>
                        </div>
                    </div>
                `;
                
                // 显示模态框
                showModal('服务详情', content);
            } else {
                showToast('加载失败: ' + (result.message || '未知错误'), 'error');
            }
        })
        .catch(error => {
            console.error('❌ 加载服务详情失败:', error);
            showToast('加载失败: ' + error.message, 'error');
        });
}

// 根据设备分类ID加载设备列表（asset 表），带简单缓存
function loadDevicesByCategoryId(categoryId) {
    if (!categoryId) {
        return Promise.resolve([]);
    }

    if (devicesByCategoryCache[categoryId]) {
        return Promise.resolve(devicesByCategoryCache[categoryId]);
    }

    const url = `/api/asset/list?categoryId=${categoryId}`;
    return fetch(url)
        .then(response => response.json())
        .then(result => {
            console.log('加载设备列表响应:', categoryId, result);
            if (result.code === 200) {
                const list = result.data || [];
                devicesByCategoryCache[categoryId] = list;
                return list;
            } else {
                console.error('加载设备列表失败:', result.message);
                return [];
            }
        })
        .catch(error => {
            console.error('加载设备列表出错:', error);
            return [];
        });
}

// 根据当前选择的设备分类，刷新所有训练目标行中的“设备”下拉选项
function updateDevicesForTrainingTargets() {
    const subcategorySelects = document.querySelectorAll('.device-subcategory-select');
    const categoryIds = [];

    subcategorySelects.forEach(sel => {
        if (sel && sel.value) {
            categoryIds.push(parseInt(sel.value));
        }
    });

    const targetRows = document.querySelectorAll('.training-target-row');

    if (categoryIds.length === 0) {
        // 没有选择任何设备分类时，清空并禁用设备下拉
        targetRows.forEach(row => {
            const deviceSelect = row.querySelector('.device-select');
            if (deviceSelect) {
                deviceSelect.innerHTML = '<option value="">请先在上方选择设备类型</option>';
                deviceSelect.disabled = true;
            }
        });
        selectedDevicesCache = [];
        return;
    }

    const uniqueIds = Array.from(new Set(categoryIds));
    const loadPromises = uniqueIds.map(id => loadDevicesByCategoryId(id));

    Promise.all(loadPromises).then(results => {
        selectedDevicesCache = results.flat();

        targetRows.forEach(row => {
            const deviceSelect = row.querySelector('.device-select');
            if (!deviceSelect) return;

            const currentValue = deviceSelect.value;
            deviceSelect.innerHTML = '<option value="">选择设备</option>';

            selectedDevicesCache.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.deviceName || device.assetName || `设备${device.id}`;
                // 始终设置 categoryId，即使为 null 或 0
                option.setAttribute('data-category-id', device.categoryId || device.category_id || '');
                deviceSelect.appendChild(option);
            });

            deviceSelect.disabled = selectedDevicesCache.length === 0;

            // 保持原选择（若仍然在新列表中）
            if (currentValue) {
                deviceSelect.value = currentValue;
            }
        });
    });
}

// 设备小类变更时，刷新所有训练目标行的设备下拉
function onDeviceSubCategoryChange() {
    updateDevicesForTrainingTargets();
}

// 暴露到window对象，供HTML onchange调用
window.onDeviceSubCategoryChange = onDeviceSubCategoryChange;

/**
 * 关闭服务详情模态框
 */
function closeServiceDetailModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * 切换服务状态
 */
function toggleStatus(serviceId, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? '启用' : '停用';

    if (!confirm(`确定要${action}该服务吗?`)) {
        return;
    }

    fetch(`/api/prediction/services/${serviceId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            showToast(`${action}成功`, 'success');
            loadServiceList();
        } else {
            showToast(`${action}失败: ` + result.message, 'error');
        }
    })
    .catch(error => {
        console.error(`❌ ${action}服务异常:`, error);
        showToast(`${action}失败: ` + error.message, 'error');
    });
}

/**
 * 删除服务
 */
function deleteService(serviceId) {
    if (!confirm('确定要删除该服务吗? 此操作不可恢复!')) {
        return;
    }

    fetch(`/api/prediction/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            showToast('删除成功', 'success');
            loadServiceList();
        } else {
            showToast('删除失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 删除服务异常:', error);
        showToast('删除失败: ' + error.message, 'error');
    });
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 创建美观的Toast提示
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 根据类型设置不同的图标和颜色
    let icon = 'fa-info-circle';
    let bgColor = '#4299e1';
    
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            bgColor = '#48bb78';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            bgColor = '#f56565';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            bgColor = '#ed8936';
            break;
    }
    
    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        ">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加动画样式
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.firstElementChild.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在算法模型服务页面
    const modelServicePage = document.getElementById('page-model-service');
    if (modelServicePage && modelServicePage.classList.contains('active')) {
        initModelServicePageInternal();
    }
});

// 提供全局初始化函数，供页面切换时调用
function initModelServicePageGlobal() {
    console.log('🚀 初始化算法模型服务页面...');
    const modelServicePage = document.getElementById('page-model-service');
    if (modelServicePage) {
        // 直接调用内部初始化函数，避免循环
        initModelServicePageInternal();
    }
}

// 内部初始化函数
function initModelServicePageInternal() {
    console.log('📋 执行算法模型服务页面内部初始化...');
    
    // 加载服务列表数据
    loadServiceList();
    
    // 绑定搜索事件
    bindSearchEvents();

    // 绑定新建按钮事件
    bindCreateButtonEvent();

    // 初始化弹窗中的算法选项
    initAlgorithmOptions();

    // 初始化设备类型选项
    // initDeviceTypeOptions();

    // 初始化监控类型选项
    // initMonitoringTypeOptions();

    console.log('✅ 算法模型服务页面初始化完成');
}

// 暴露全局初始化函数
window.initModelServicePage = initModelServicePageGlobal;

// 加载设备分类
function loadDeviceCategories() {
    if (deviceCategoriesCache) {
        return Promise.resolve(deviceCategoriesCache);
    }

    return fetch('/api/asset-category/top-level')
        .then(response => response.json())
        .then(result => {
            console.log('加载设备分类响应:', result);
            if (result.code === 200) {
                deviceCategoriesCache = result.data || [];
                console.log('设备分类数据:', deviceCategoriesCache);
                return deviceCategoriesCache;
            } else {
                console.error('加载设备分类失败:', result.message);
                return [];
            }
        })
        .catch(error => {
            console.error('加载设备分类出错:', error);
            return [];
        });
}

// 加载子分类
function loadSubCategories(parentId) {
    return fetch(`/api/asset-category/children/${parentId}`)
        .then(response => response.json())
        .then(result => {
            console.log('加载子分类响应:', result);
            if (result.code === 200) {
                console.log('子分类数据:', result.data);
                return result.data || [];
            } else {
                console.error('加载子分类失败:', result.message);
                return [];
            }
        })
        .catch(error => {
            console.error('加载子分类出错:', error);
            return [];
        });
}

// 添加设备选择行
function addDeviceSelectionRow() {
    const container = document.getElementById('deviceSelectionList');
    if (!container) {
        console.error('找不到deviceSelectionList容器');
        return null;
    }

    deviceSelectionCounter++;
    const rowId = `device-row-${deviceSelectionCounter}`;

    const rowHtml = `
        <div class="device-selection-row" id="${rowId}">
            <div class="form-col-model">
                <select class="device-category-select" data-row-id="${rowId}" onchange="window.onDeviceCategoryChange('${rowId}')">
                    <option value="">选择设备大类</option>
                </select>
            </div>
            <div class="form-col-model">
                <select class="device-subcategory-select" data-row-id="${rowId}" disabled onchange="window.onDeviceSubCategoryChange()">
                    <option value="">请先选择设备大类</option>
                </select>
            </div>
            <button type="button" class="btn-remove-device" onclick="window.removeDeviceSelectionRow('${rowId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHtml);
    console.log('添加设备选择行:', rowId);

    // 加载设备大类选项
    loadDeviceCategories().then(categories => {
        const select = document.querySelector(`#${rowId} .device-category-select`);
        if (select) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.categoryName;
                select.appendChild(option);
            });
            console.log('设备大类选项已加载');
        }
    });

    return rowId;
}

// 设备大类改变时加载小类
function onDeviceCategoryChange(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const categorySelect = row.querySelector('.device-category-select');
    const subcategorySelect = row.querySelector('.device-subcategory-select');

    const selectedCategory = categorySelect.value;

    // 重置小类下拉框
    subcategorySelect.innerHTML = '<option value="">选择设备小类</option>';

    if (!selectedCategory) {
        subcategorySelect.disabled = true;
        updateDevicesForTrainingTargets();
        return;
    }

    // 加载小类
    subcategorySelect.disabled = false;
    loadSubCategories(selectedCategory).then(subCategories => {
        subCategories.forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat.id;
            option.textContent = subCat.categoryName;
            subcategorySelect.appendChild(option);
        });
        console.log('设备小类选项已加载');

        // 小类列表加载完成后，根据新的选择刷新训练目标行中的设备下拉
        updateDevicesForTrainingTargets();
    });
}

// 删除设备选择行
function removeDeviceSelectionRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        console.log('删除设备选择行:', rowId);
        // 行删除后，刷新训练目标行中的设备下拉
        updateDevicesForTrainingTargets();
    }
}

// 添加训练目标行
function addTrainingTargetRow() {
    const container = document.getElementById('trainingTargetsList');
    if (!container) {
        console.error('找不到trainingTargetsList容器');
        return;
    }

    trainingTargetCounter++;
    const rowId = `target-row-${trainingTargetCounter}`;

    const rowHtml = `
        <div class="training-target-row" id="${rowId}">
            <div class="form-col-model">
                <label>选择设备</label>
                <select class="device-select" data-row-id="${rowId}" disabled>
                    <option value="">请先在上方选择设备类型</option>
                </select>
            </div>
            <div class="form-col-model">
                <label>选择检测类型</label>
                <select class="detection-type-select" data-row-id="${rowId}" onchange="window.onDetectionTypeChange('${rowId}')">
                    <option value="">选择检测类型</option>
                </select>
            </div>
            <div class="form-col-model">
                <label>选择指标</label>
                <select class="metric-select" data-row-id="${rowId}" disabled>
                    <option value="">请先选择检测类型</option>
                </select>
            </div>
            <button type="button" class="btn-remove-target" onclick="window.removeTrainingTargetRow('${rowId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHtml);
    console.log('添加训练目标行:', rowId);

     // 行添加后，根据当前选择的设备分类刷新该行设备下拉
    updateDevicesForTrainingTargets();

    // 加载检测类型选项（从检测模板中提取检测类型）
    if (typeof loadDetectionTemplates !== 'function') {
        console.error('loadDetectionTemplates 未定义，无法加载检测类型');
        return;
    }

    loadDetectionTemplates().then(templates => {
        const typeSelect = document.querySelector(`#${rowId} .detection-type-select`);
        if (!typeSelect) return;

        const uniqueTypes = [...new Set(templates.map(t => t.detectionType))];

        typeSelect.innerHTML = '<option value="">选择检测类型</option>';
        uniqueTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            if (typeof detectionTypeNames !== 'undefined' && detectionTypeNames[type]) {
                option.textContent = detectionTypeNames[type];
            } else {
                option.textContent = type;
            }
            typeSelect.appendChild(option);
        });
    });
}

// 检测类型改变时加载指标（模板名称）
function onDetectionTypeChange(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const typeSelect = row.querySelector('.detection-type-select');
    const metricSelect = row.querySelector('.metric-select');

    const selectedType = typeSelect.value;

    // 重置指标下拉框
    metricSelect.innerHTML = '<option value="">选择指标</option>';

    if (!selectedType) {
        metricSelect.disabled = true;
        return;
    }

    if (typeof loadDetectionTemplates !== 'function') {
        console.error('loadDetectionTemplates 未定义，无法加载指标');
        return;
    }

    metricSelect.disabled = false;

    loadDetectionTemplates().then(templates => {
        const filtered = templates.filter(t =>
            t.detectionType === selectedType && t.status === 1
        );

        filtered.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.templateName;
            metricSelect.appendChild(option);
        });
    });
}

// 删除训练目标行
function removeTrainingTargetRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        console.log('删除训练目标行:', rowId);
    }
}

// ==================== 训练历史相关功能 ====================

let currentServiceId = null; // 当前查看训练历史的服务ID

/**
 * 查看服务模型组合
 */
function viewServiceModels(serviceId) {
    console.log('🔍 查看服务模型组合:', serviceId);
    currentServiceId = serviceId;
    
    // 显示模态框
    const modal = document.getElementById('trainingHistoryModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 加载数据
        loadServiceModels(serviceId);
        
        // 加载筛选选项
        loadFilterOptions(serviceId);
    }
}

/**
 * 查看训练历史
 */
function viewTrainingHistory(serviceId) {
    console.log('🔍 查看训练历史:', serviceId);
    currentServiceId = serviceId;
    
    // 显示模态框
    const modal = document.getElementById('trainingHistoryModal');
    if (modal) {
        modal.style.display = 'flex';
        loadTrainingHistory(serviceId);
        
        // 启动自动刷新
        startAutoRefresh(serviceId);
    }
}

/**
 * 关闭训练历史模态框
 */
function closeTrainingHistoryModal() {
    const modal = document.getElementById('trainingHistoryModal');
    if (modal) {
        modal.style.display = 'none';
        // 停止自动刷新
        stopAutoRefresh();
    }
    currentServiceId = null;
}

/**
 * 启动自动刷新
 */
function startAutoRefresh(serviceId) {
    // 先停止之前的自动刷新
    stopAutoRefresh();
    
    isAutoRefreshEnabled = true;
    console.log('🔄 启动自动刷新，每5秒刷新一次');
    
    // 每5秒自动刷新一次
    autoRefreshInterval = setInterval(() => {
        if (isAutoRefreshEnabled && currentServiceId) {
            console.log('🔄 自动刷新训练历史数据');
            loadTrainingHistory(currentServiceId);
        }
    }, 5000);
}

/**
 * 停止自动刷新
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    isAutoRefreshEnabled = false;
    console.log('⏹️ 停止自动刷新');
}

/**
 * 训练期间增加刷新频率
 */
function increaseRefreshFrequency() {
    // 停止当前的自动刷新
    stopAutoRefresh();
    
    isAutoRefreshEnabled = true;
    console.log('⚡ 训练期间启动高频刷新，每2秒刷新一次');
    
    // 训练期间每2秒刷新一次
    autoRefreshInterval = setInterval(() => {
        if (isAutoRefreshEnabled && currentServiceId) {
            console.log('⚡ 训练期间高频刷新');
            loadTrainingHistory(currentServiceId);
        }
    }, 2000);
    
    // 2分钟后恢复正常刷新频率
    setTimeout(() => {
        if (isAutoRefreshEnabled && currentServiceId) {
            console.log('🔄 恢复正常刷新频率');
            startAutoRefresh(currentServiceId);
        }
    }, 120000); // 2分钟
}

/**
 * 带重试机制的加载服务模型组合数据
 */
function loadServiceModelsWithRetry(serviceId, retryCount = 0) {
    const maxRetries = 3;
    console.log(`📊 加载服务模型组合 (重试 ${retryCount}/${maxRetries}):`, serviceId);
    
    // 显示加载状态
    if (retryCount === 0) {
        const tbody = document.getElementById('trainingHistoryTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <div style="color: #666;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                            <p>正在加载模型数据...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    fetch(`/api/prediction/services/${serviceId}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('模型组合响应:', result);
        if (result.code === 200) {
            const models = result.data || [];
            console.log('📊 模型组合数据:', models.length, '条记录');
            console.log('📊 模型组合详细数据:', models);
            
            // 如果返回空数据且还有重试次数，则重试
            if (models.length === 0 && retryCount < maxRetries) {
                const delayTime = 2000 * (retryCount + 1); // 递增延迟：2s, 4s, 6s
                console.warn(`⚠️ API返回空数据，${delayTime}ms后重试 (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => {
                    loadServiceModelsWithRetry(serviceId, retryCount + 1);
                }, delayTime);
                return;
            }
            
            renderServiceModels(models);
        } else {
            console.error('❌ 加载模型组合失败:', result.message);
            showToast('加载模型组合失败: ' + result.message, 'error');
            renderServiceModels([]);
        }
    })
    .catch(error => {
        console.error('❌ 加载模型组合异常:', error);
        if (retryCount < maxRetries) {
            const delayTime = 2000 * (retryCount + 1); // 递增延迟：2s, 4s, 6s
            console.warn(`⚠️ 网络异常，${delayTime}ms后重试 (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
                loadServiceModelsWithRetry(serviceId, retryCount + 1);
            }, delayTime);
        } else {
            showToast('加载失败: ' + error.message, 'error');
            renderServiceModels([]);
        }
    });
}

/**
 * 加载服务模型组合数据
 */
function loadServiceModels(serviceId) {
    console.log('📊 加载服务模型组合:', serviceId);
    
    fetch(`/api/prediction/services/${serviceId}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('模型组合响应:', result);
        if (result.code === 200) {
            const models = result.data || [];
            console.log('📊 模型组合数据:', models.length, '条记录');
            if (models.length === 0) {
                console.warn('⚠️ API返回空数据，可能是数据库更新延迟');
            }
            renderServiceModels(models);
        } else {
            console.error('❌ 加载模型组合失败:', result.message);
            showToast('加载模型组合失败: ' + result.message, 'error');
            renderServiceModels([]);
        }
    })
    .catch(error => {
        console.error('❌ 加载模型组合异常:', error);
        showToast('加载失败: ' + error.message, 'error');
        renderServiceModels([]);
    });
}

/**
 * 加载训练历史数据
 */
function loadTrainingHistory(serviceId) {
    console.log('📊 加载训练历史:', serviceId);
    
    fetch(`/api/prediction/services/${serviceId}/training-history`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('训练历史响应:', result);
        if (result.code === 200) {
            renderTrainingHistory(result.data || []);
        } else {
            showToast('加载训练历史失败: ' + result.message, 'error');
            renderTrainingHistory([]);
        }
    })
    .catch(error => {
        console.error('❌ 加载训练历史异常:', error);
        showToast('加载失败: ' + error.message, 'error');
        renderTrainingHistory([]);
    });
}

/**
 * 加载训练历史数据（带筛选条件）
 */
function loadTrainingHistoryWithFilters(serviceId, filters) {
    console.log('📊 加载训练历史（带筛选）:', serviceId, filters);
    
    fetch(`/api/prediction/services/${serviceId}/training-history`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('训练历史响应:', result);
        if (result.code === 200) {
            let data = result.data || [];
            
            // 前端筛选逻辑
            if (filters.status || filters.device || filters.metric || filters.keyword) {
                data = data.filter(item => {
                    // 状态筛选
                    if (filters.status && item.train_status !== filters.status) {
                        return false;
                    }
                    
                    // 设备筛选（通过设备名称或ID）
                    if (filters.device) {
                        const deviceName = item.device_name || item.deviceName || '';
                        const deviceId = item.device_id || item.deviceId || '';
                        if (!deviceName.includes(filters.device) && !deviceId.toString().includes(filters.device)) {
                            return false;
                        }
                    }
                    
                    // 监测指标筛选
                    if (filters.metric) {
                        const metric = item.monitoring_metric || item.monitoringMetric || '';
                        if (!metric.includes(filters.metric)) {
                            return false;
                        }
                    }
                    
                    // 关键字筛选（搜索设备名称、监测指标、备注等）
                    if (filters.keyword) {
                        const searchText = [
                            item.device_name || item.deviceName || '',
                            item.monitoring_metric || item.monitoringMetric || '',
                            item.notes || '',
                            item.model_version || item.modelVersion || ''
                        ].join(' ').toLowerCase();
                        
                        if (!searchText.includes(filters.keyword.toLowerCase())) {
                            return false;
                        }
                    }
                    
                    return true;
                });
                
                console.log('🔍 筛选结果:', `${data.length}条记录（原始${result.data.length}条）`);
            }
            
            renderTrainingHistory(data);
        } else {
            showToast('加载训练历史失败: ' + result.message, 'error');
            renderTrainingHistory([]);
        }
    })
    .catch(error => {
        console.error('❌ 加载训练历史异常:', error);
        showToast('加载失败: ' + error.message, 'error');
        renderTrainingHistory([]);
    });
}

/**
 * 渲染服务模型组合列表
 */
function renderServiceModels(modelList) {
    console.log('🎨 开始渲染模型列表:', modelList ? modelList.length : 'null', '条记录');
    console.log('🎨 渲染数据详情:', modelList);
    
    const tbody = document.getElementById('trainingHistoryTableBody');
    if (!tbody) {
        console.error('❌ 找不到表格tbody元素: trainingHistoryTableBody');
        return;
    }
    
    if (!modelList || modelList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: #999;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px;"></i>
                        <p>暂无模型组合</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // 监控类型映射
    const monitoringTypeMap = {
        'cpu': 'CPU监控',
        'memory': '内存监控',
        'disk': '磁盘监控',
        'network': '网络监控',
        'temperature': '温度监控'
    };
    
    tbody.innerHTML = modelList.map((model, index) => {
        // 使用 getFieldIgnoreCase 兼容不同字段命名
        const deviceName = getFieldIgnoreCase(model, 'device_name', 'deviceName') || '-';
        const monitoringType = getFieldIgnoreCase(model, 'monitoring_type', 'monitoringType') || '';
        const monitoringMetric = getFieldIgnoreCase(model, 'monitoring_metric', 'monitoringMetric') || '-';
        const createTime = getFieldIgnoreCase(model, 'create_time', 'createTime') || '-';
        const lastTrainTime = getFieldIgnoreCase(model, 'last_train_time', 'lastTrainTime');
        const trainStatus = getFieldIgnoreCase(model, 'train_status', 'trainStatus') || 'pending';
        const notes = getFieldIgnoreCase(model, 'notes', 'remark') || '-';
        
        const monitoringTypeText = monitoringTypeMap[monitoringType] || monitoringType || '-';
        
        // 训练状态显示
        const statusMap = {
            'success': { text: '训练完成', class: 'status-success', icon: 'check-circle' },
            'failed': { text: '训练失败', class: 'status-error', icon: 'times-circle' },
            'running': { text: '训练中', class: 'status-warning', icon: 'spinner fa-spin' },
            'pending': { text: '待训练', class: 'status-info', icon: 'clock' }
        };
        
        const status = statusMap[trainStatus] || statusMap['pending'];
        
        // 最近一次训练时间处理
        let lastTrainTimeText = '-';
        if (lastTrainTime && lastTrainTime !== '-') {
            const trainDate = new Date(lastTrainTime);
            if (!isNaN(trainDate.getTime())) {
                lastTrainTimeText = trainDate.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        
        // 创建时间格式化
        let createTimeText = '-';
        if (createTime && createTime !== '-') {
            const createDate = new Date(createTime);
            if (!isNaN(createDate.getTime())) {
                createTimeText = createDate.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        
        return `
            <tr>
                <td>
                    <span class="status-badge ${status.class}">
                        <i class="fas fa-${status.icon}"></i> ${status.text}
                    </span>
                </td>
                <td>${monitoringTypeText}</td>
                <td>${deviceName}</td>
                <td>${monitoringMetric}</td>
                <td>${notes}</td>
                <td>${createTimeText}</td>
                <td>${lastTrainTimeText}</td>
                <td>
                    <button onclick="startSingleModelTraining(${model.id})" class="btn-sm btn-primary" style="margin-right: 5px;">
                        <i class="fas fa-play"></i> 开始训练
                    </button>
                    ${trainStatus === 'success' ?
                        `<button onclick="showTrainingDetails(${model.id})" class="btn-sm btn-info">
                            <i class="fas fa-info-circle"></i> 详情
                        </button>` :
                        ''
                    }
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 渲染训练历史表格
 */
function renderTrainingHistory(historyList) {
    const tbody = document.getElementById('trainingHistoryTableBody');
    if (!tbody) return;
    
    if (!historyList || historyList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <div style="color: #999;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px;"></i>
                        <p>暂无数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = historyList.map(item => {
        const statusMap = {
            'success': { text: '成功', class: 'status-success', icon: 'check-circle' },
            'failed': { text: '失败', class: 'status-error', icon: 'times-circle' },
            'running': { text: '运行中', class: 'status-warning', icon: 'spinner fa-spin' }
        };
        
        const status = statusMap[item.train_status || item.trainStatus] || statusMap['running'];
        
        // 监控类型映射
        const monitoringTypeMap = {
            'cpu': 'CPU监控',
            'memory': '内存监控',
            'disk': '磁盘监控',
            'network': '网络监控',
            'temperature': '温度监控'
        };
        
        // 支持多种字段名格式：detection_type, detectionType, detectiontype
        const detectionType = item.detection_type || item.detectionType || item.detectiontype || item.monitoring_type || item.monitoringType || item.monitoringtype || '';
        const detectionTypeText = monitoringTypeMap[detectionType] || detectionType || '-';
        
        // 获取设备名称（单个设备）
        const deviceName = item.device_name || item.deviceName || item.devicename || '';
        const deviceNameText = deviceName || '-';
        
        // 调试日志
        if (!detectionType) {
            console.log('⚠️ 检测类型为空:', item);
        }
        if (!deviceName) {
            console.log('⚠️ 设备名称为空:', item);
        }
        
        return `
            <tr>
                <td>
                    <span class="${status.class}" style="display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fas fa-${status.icon}"></i> ${status.text}
                    </span>
                </td>
                <td>${detectionTypeText}</td>
                <td>${deviceNameText}</td>
                <td>${item.monitoring_metric || item.monitoringMetric || '-'}</td>
                <td>${item.notes || '-'}</td>
                <td>${item.create_time || item.createTime || '-'}</td>
                <td>${item.train_start_time || item.trainStartTime || '-'}</td>
                <td>${item.train_end_time || item.trainEndTime || '-'}</td>
                <td>
                    <button class="btn-link" onclick="viewTrainingDetail(${item.id})">查看详情</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 开始训练整个服务
 */
function startTraining(serviceId) {
    console.log('🚀 开始训练服务:', serviceId);
    
    if (!serviceId) {
        showToast('服务ID不能为空', 'error');
        return;
    }
    
    // 显示加载状态
    showToast('正在启动服务训练...', 'info');
    
    fetch(`/api/prediction/services/${serviceId}/train`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('服务训练响应:', result);
        if (result.code === 200) {
            showToast('服务训练启动成功，预计需要30-60秒完成', 'success');
            
            // 立即刷新一次显示训练中状态
            if (currentServiceId) {
                setTimeout(() => {
                    loadTrainingHistory(currentServiceId);
                    loadServiceModels(currentServiceId);
                }, 1000);
                
                // 训练期间增加刷新频率
                increaseRefreshFrequency();
            }
        } else {
            showToast('服务训练启动失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 服务训练启动异常:', error);
        showToast('服务训练启动失败: ' + error.message, 'error');
    });
}

/**
 * 开始训练单个模型设备组合
 */
function startSingleModelTraining(modelId) {
    console.log('🎯 开始训练单个模型:', modelId);
    
    if (!modelId) {
        showToast('模型ID不能为空', 'error');
        return;
    }
    
    // 显示加载状态
    showToast('正在启动模型训练...', 'info');
    
    fetch(`/api/prediction/models/${modelId}/train`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('单个模型训练响应:', result);
        if (result.code === 200) {
            showToast('模型训练完成: ' + result.data + '\n\n请手动刷新页面查看最新状态', 'success');
        } else {
            showToast('模型训练失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 单个模型训练异常:', error);
        showToast('模型训练失败: ' + error.message, 'error');
    });
}

/**
 * 搜索训练历史（实际是搜索模型组合）
 */
function searchTrainingHistory() {
    if (!currentServiceId) return;
    
    const status = document.getElementById('trainStatusFilter')?.value || '';
    const device = document.getElementById('trainDeviceFilter')?.value || '';
    const metric = document.getElementById('trainMetricFilter')?.value || '';
    const keyword = document.getElementById('trainSearchInput')?.value || '';
    
    console.log('🔍 搜索条件:', { status, device, metric, keyword });
    
    // 实现基于模型组合数据的筛选
    loadServiceModelsWithFilters(currentServiceId, { status, device, metric, keyword });
}

/**
 * 加载服务模型组合数据（带筛选条件）
 */
function loadServiceModelsWithFilters(serviceId, filters) {
    console.log('📊 加载模型组合（带筛选）:', serviceId, filters);
    
    fetch(`/api/prediction/services/${serviceId}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('模型组合响应:', result);
        if (result.code === 200) {
            let data = result.data || [];
            
            // 前端筛选逻辑
            if (filters.status || filters.device || filters.metric || filters.keyword) {
                data = data.filter(item => {
                    // 状态筛选（基于train_status字段）
                    if (filters.status) {
                        const trainStatus = item.train_status || item.trainStatus || '';
                        // 状态映射
                        const statusMap = {
                            '训练完成': 'success',
                            '训练失败': 'failed', 
                            '训练中': 'running',
                            '待训练': 'pending'
                        };
                        const mappedStatus = statusMap[filters.status] || filters.status;
                        if (trainStatus !== mappedStatus) {
                            return false;
                        }
                    }
                    
                    // 设备筛选（基于device_name字段）
                    if (filters.device) {
                        const deviceName = item.device_name || item.deviceName || '';
                        if (!deviceName.includes(filters.device)) {
                            return false;
                        }
                    }
                    
                    // 监测指标筛选（基于monitoring_metric字段）
                    if (filters.metric) {
                        const metric = item.monitoring_metric || item.monitoringMetric || '';
                        if (!metric.includes(filters.metric)) {
                            return false;
                        }
                    }
                    
                    // 关键字筛选（搜索设备名称、监测指标、备注等）
                    if (filters.keyword) {
                        const searchText = [
                            item.device_name || item.deviceName || '',
                            item.monitoring_metric || item.monitoringMetric || '',
                            item.monitoring_type || item.monitoringType || '',
                            item.notes || '',
                            item.category_name || item.categoryName || ''
                        ].join(' ').toLowerCase();
                        
                        if (!searchText.includes(filters.keyword.toLowerCase())) {
                            return false;
                        }
                    }
                    
                    return true;
                });
                
                console.log('🔍 筛选结果:', `${data.length}条记录（原始${result.data.length}条）`);
            }
            
            renderServiceModels(data);
        } else {
            showToast('加载模型组合失败: ' + result.message, 'error');
            renderServiceModels([]);
        }
    })
    .catch(error => {
        console.error('❌ 加载模型组合异常:', error);
        showToast('加载失败: ' + error.message, 'error');
        renderServiceModels([]);
    });
}

/**
 * 重置训练历史筛选条件
 */
function resetTrainingHistoryFilters() {
    console.log('🔄 重置模型组合筛选条件');
    
    // 重置所有筛选条件为默认值
    const statusFilter = document.getElementById('trainStatusFilter');
    const deviceFilter = document.getElementById('trainDeviceFilter');
    const metricFilter = document.getElementById('trainMetricFilter');
    const searchInput = document.getElementById('trainSearchInput');
    
    if (statusFilter) statusFilter.value = '';
    if (deviceFilter) deviceFilter.value = '';
    if (metricFilter) metricFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // 重新加载所有模型组合数据
    if (currentServiceId) {
        loadServiceModels(currentServiceId);
        showToast('筛选条件已重置，显示所有数据', 'success');
    }
}

/**
 * 查看训练详情
 */
function viewTrainingDetail(trainingId) {
    console.log('📋 查看训练详情:', trainingId);
    // TODO: 实现训练详情查看
    showToast('训练详情功能开发中', 'info');
}

// 导出函数供HTML调用
window.initModelServicePage = initModelServicePage;
window.__saveModelServiceInternal = saveModelService;
window.saveModelService = saveModelService;
window.closeModelServiceModal = closeModelServiceModal;
window.editService = editService;
window.viewServiceDetail = viewServiceDetail;
window.toggleStatus = toggleStatus;
window.deleteService = deleteService;
window.addDeviceSelectionRow = addDeviceSelectionRow;
window.removeDeviceSelectionRow = removeDeviceSelectionRow;
/**
 * 显示训练对象详情（设备和指标列表）
 */
function showTrainingTargets(serviceId) {
    console.log('📋 显示训练对象详情:', serviceId);
    
    fetch(`/api/prediction/services/${serviceId}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200 && result.data) {
                const service = result.data;
                const models = service.models || [];
                
                // 去重：提取唯一的监控类型+监控指标组合
                const uniqueTargets = [];
                const seen = new Set();
                models.forEach(model => {
                    // 使用 getFieldIgnoreCase 兼容不同的字段命名
                    const monitoringType = getFieldIgnoreCase(model, 'monitoring_type', 'monitoringType');
                    const monitoringMetric = getFieldIgnoreCase(model, 'monitoring_metric', 'monitoringMetric');
                    const key = `${monitoringType}|${monitoringMetric}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueTargets.push({
                            monitoringType: monitoringType,
                            monitoringMetric: monitoringMetric
                        });
                    }
                });
                
                // 创建模态框内容
                let content = `
                    <div style="padding: 20px;">
                        <h3 style="margin-bottom: 20px; color: #1e293b; font-size: 18px;">
                            ${service.serviceName || '服务'} - 训练对象列表
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                    <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">序号</th>
                                    <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">监控类型</th>
                                    <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">监控指标</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                if (uniqueTargets.length === 0) {
                    content += `
                        <tr>
                            <td colspan="3" style="padding: 40px; text-align: center; color: #94a3b8;">
                                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                                暂无训练对象
                            </td>
                        </tr>
                    `;
                } else {
                    uniqueTargets.forEach((target, index) => {
                        const bgColor = index % 2 === 0 ? '#f8fafc' : 'white';
                        content += `
                            <tr style="background: ${bgColor};">
                                <td style="padding: 12px; border: 1px solid #e2e8f0;">${index + 1}</td>
                                <td style="padding: 12px; border: 1px solid #e2e8f0;">${target.monitoringType || '-'}</td>
                                <td style="padding: 12px; border: 1px solid #e2e8f0;">${target.monitoringMetric || '-'}</td>
                            </tr>
                        `;
                    });
                }
                
                content += `
                            </tbody>
                        </table>
                        <div style="margin-top: 20px; text-align: right;">
                            <button onclick="closeTrainingTargetsModal()" style="
                                padding: 10px 24px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                            ">关闭</button>
                        </div>
                    </div>
                `;
                
                // 显示模态框
                showModal('训练对象详情', content);
            } else {
                showToast('加载失败: ' + (result.message || '未知错误'), 'error');
            }
        })
        .catch(error => {
            console.error('❌ 加载训练对象失败:', error);
            showToast('加载失败: ' + error.message, 'error');
        });
}

/**
 * 关闭训练对象模态框
 */
function closeTrainingTargetsModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * 显示通用模态框
 */
function showModal(title, content) {
    // 移除已存在的模态框
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        ">
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

window.onDeviceCategoryChange = onDeviceCategoryChange;
window.addTrainingTargetRow = addTrainingTargetRow;
window.removeTrainingTargetRow = removeTrainingTargetRow;
window.onDetectionTypeChange = onDetectionTypeChange;
window.viewServiceModels = viewServiceModels;
/**
 * 加载筛选选项
 */
function loadFilterOptions(serviceId) {
    console.log('📊 加载筛选选项:', serviceId);
    
    // 加载设备选项
    loadDeviceOptions(serviceId);
    
    // 加载监测指标选项
    loadMetricOptions(serviceId);
}

/**
 * 加载设备选项
 */
function loadDeviceOptions(serviceId) {
    // 基于模型组合数据生成设备选项
    fetch(`/api/prediction/services/${serviceId}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('基于模型组合加载设备选项:', result);
        if (result.code === 200) {
            const data = result.data || [];
            const deviceSelect = document.getElementById('trainDeviceFilter');
            if (deviceSelect) {
                // 清空现有选项，保留"全部"
                deviceSelect.innerHTML = '<option value="">全部</option>';
                
                // 从模型组合中提取唯一的设备
                const uniqueDevices = new Set();
                data.forEach(item => {
                    const deviceName = item.device_name || item.deviceName || '';
                    if (deviceName) {
                        uniqueDevices.add(deviceName);
                    }
                });
                
                // 添加设备选项
                Array.from(uniqueDevices).sort().forEach(deviceName => {
                    const option = document.createElement('option');
                    option.value = deviceName;
                    option.textContent = deviceName;
                    deviceSelect.appendChild(option);
                });
                
                console.log('📊 加载了', uniqueDevices.size, '个设备选项');
            }
        } else {
            console.error('❌ 加载设备选项失败:', result.message);
        }
    })
    .catch(error => {
        console.error('❌ 加载设备选项异常:', error);
    });
}

/**
 * 加载监测指标选项
 */
function loadMetricOptions(serviceId) {
    // 基于模型组合数据生成监测指标选项
    fetch(`/api/prediction/services/${serviceId}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('基于模型组合加载监测指标选项:', result);
        if (result.code === 200) {
            const data = result.data || [];
            const metricSelect = document.getElementById('trainMetricFilter');
            if (metricSelect) {
                // 清空现有选项，保留"全部"
                metricSelect.innerHTML = '<option value="">全部</option>';
                
                // 从模型组合中提取唯一的监测指标
                const uniqueMetrics = new Set();
                data.forEach(item => {
                    const metric = item.monitoring_metric || item.monitoringMetric || '';
                    if (metric) {
                        uniqueMetrics.add(metric);
                    }
                });
                
                // 添加监测指标选项
                Array.from(uniqueMetrics).sort().forEach(metric => {
                    const option = document.createElement('option');
                    option.value = metric;
                    option.textContent = metric;
                    metricSelect.appendChild(option);
                });
                
                console.log('📊 加载了', uniqueMetrics.size, '个监测指标选项');
            }
        } else {
            console.error('❌ 加载监测指标选项失败:', result.message);
        }
    })
    .catch(error => {
        console.error('❌ 加载监测指标选项异常:', error);
    });
}

/**
 * 显示训练详情
 */
function showTrainingDetails(modelId) {
    console.log('📋 显示训练详情:', modelId);
    
    // 显示模态框
    const modal = document.getElementById('trainingDetailsModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 加载模型详情
        loadModelDetails(modelId);
    }
}

/**
 * 关闭训练详情模态框
 */
function closeTrainingDetailsModal() {
    const modal = document.getElementById('trainingDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 加载模型详情
 */
function loadModelDetails(modelId) {
    console.log('📊 加载模型详情:', modelId);
    
    fetch(`/api/prediction/models/${modelId}/details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('模型详情响应:', result);
        if (result.code === 200 && result.data) {
            renderModelDetails(result.data);
        } else {
            showToast('加载模型详情失败: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ 加载模型详情异常:', error);
        showToast('加载失败: ' + error.message, 'error');
    });
}

/**
 * 渲染模型详情
 */
function renderModelDetails(modelData) {
    const model = modelData.model || {};
    const trainingHistory = modelData.trainingHistory || [];
    
    // 更新基本信息
    document.getElementById('detailDeviceName').textContent = model.deviceName || '-';
    document.getElementById('detailMonitoringType').textContent = model.monitoringType || '-';
    document.getElementById('detailMonitoringMetric').textContent = model.monitoringMetric || '-';
    
    // 状态显示
    const statusMap = {
        'success': { text: '训练完成', class: 'success', icon: 'check-circle' },
        'failed': { text: '训练失败', class: 'failed', icon: 'times-circle' },
        'running': { text: '训练中', class: 'running', icon: 'spinner fa-spin' },
        'pending': { text: '待训练', class: 'pending', icon: 'clock' }
    };
    
    const status = statusMap[model.trainStatus] || statusMap['pending'];
    const statusElement = document.getElementById('detailStatus');
    statusElement.innerHTML = `<span class="timeline-status ${status.class}"><i class="fas fa-${status.icon}"></i> ${status.text}</span>`;
    
    // 渲染训练历史时间轴
    renderTrainingHistoryTimeline(trainingHistory);
}

/**
 * 渲染训练历史时间轴
 */
function renderTrainingHistoryTimeline(historyList) {
    const timeline = document.getElementById('trainingHistoryTimeline');
    if (!timeline) return;
    
    if (!historyList || historyList.length === 0) {
        timeline.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>暂无训练历史记录</p>
            </div>
        `;
        return;
    }
    
    timeline.innerHTML = historyList.map(history => {
        const statusClass = history.status === 'success' ? 'success' : 
                           history.status === 'failed' ? 'failed' : 'running';
        
        const statusText = history.status === 'success' ? '训练成功' :
                          history.status === 'failed' ? '训练失败' : '训练中';
        
        const statusIcon = history.status === 'success' ? 'check-circle' :
                          history.status === 'failed' ? 'times-circle' : 'spinner fa-spin';
        
        // 格式化时间
        const startTime = history.startTime ? new Date(history.startTime).toLocaleString('zh-CN') : '-';
        const endTime = history.endTime ? new Date(history.endTime).toLocaleString('zh-CN') : '-';
        
        return `
            <div class="timeline-item ${statusClass}">
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-status ${statusClass}">
                            <i class="fas fa-${statusIcon}"></i>
                            ${statusText}
                        </div>
                        <div class="timeline-time">${startTime}</div>
                    </div>
                    
                    <div class="timeline-details">
                        <div class="timeline-detail-item">
                            <label>模型版本</label>
                            <span>${history.modelVersion || '-'}</span>
                        </div>
                        <div class="timeline-detail-item">
                            <label>准确率</label>
                            <span>${history.accuracy ? history.accuracy + '%' : '-'}</span>
                        </div>
                        <div class="timeline-detail-item">
                            <label>训练时长</label>
                            <span>${history.duration || '-'}</span>
                        </div>
                        <div class="timeline-detail-item">
                            <label>结束时间</label>
                            <span>${endTime}</span>
                        </div>
                    </div>
                    
                    ${history.errorMessage ? `
                        <div style="margin-top: 12px; padding: 8px 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; color: #c53030; font-size: 13px;">
                            <i class="fas fa-exclamation-triangle"></i> ${history.errorMessage}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

window.showTrainingTargets = showTrainingTargets;
window.showTrainingDetails = showTrainingDetails;
window.closeTrainingDetailsModal = closeTrainingDetailsModal;
window.loadFilterOptions = loadFilterOptions;
window.closeTrainingTargetsModal = closeTrainingTargetsModal;
window.closeServiceDetailModal = closeServiceDetailModal;
window.viewTrainingHistory = viewTrainingHistory;
window.closeTrainingHistoryModal = closeTrainingHistoryModal;
window.searchTrainingHistory = searchTrainingHistory;
window.resetTrainingHistoryFilters = resetTrainingHistoryFilters;

// ==================== 模态框管理函数 ====================

/**
 * 显示新建算法模型服务弹窗
 */
function showModelServiceModal(editServiceId = null) {
    const modal = document.getElementById('modelServiceModal');
    const title = document.getElementById('modelServiceModalTitle');
    const form = document.getElementById('modelServiceForm');

    // 根据是否有editServiceId来设置标题
    if (title) {
        title.textContent = editServiceId ? '编辑算法模型服务' : '新建算法模型服务';
    }
    if (form) form.reset();

    // 设置隐藏的ID字段
    const serviceId = document.getElementById('modelServiceId');
    if (serviceId) serviceId.value = editServiceId || '';

    // 清空设备选择列表
    const deviceList = document.getElementById('deviceSelectionList');
    if (deviceList) {
        deviceList.innerHTML = '';
    }
    deviceSelectionCounter = 0;

    // 清空训练目标列表
    const targetsList = document.getElementById('trainingTargetsList');
    if (targetsList) {
        targetsList.innerHTML = '';
    }
    trainingTargetCounter = 0;

    // 设置默认值
    const autoPrediction = document.getElementById('autoPrediction');
    if (autoPrediction) autoPrediction.checked = true;

    const updateCycle = document.getElementById('updateCycle');
    if (updateCycle) updateCycle.value = '7';

    const predictionCycle = document.getElementById('predictionCycle');
    if (predictionCycle) predictionCycle.value = '1';

    const predictionDuration = document.getElementById('predictionDuration');
    if (predictionDuration) predictionDuration.value = '1';

    // 加载设备分类数据
    loadDeviceCategories().then(() => {
        if (editServiceId) {
            // 编辑模式：加载服务数据并回填
            loadServiceDataForEdit(editServiceId);
        } else {
            // 新建模式：添加空行
            setTimeout(() => {
                addDeviceSelectionRow();
            }, 100);

            // 添加第一行训练目标
            setTimeout(() => {
                addTrainingTargetRow();
            }, 150);
        }
    }).catch(error => {
        console.error('加载设备分类失败:', error);
        // 即使失败也要添加行
        setTimeout(() => {
            addDeviceSelectionRow();
            addTrainingTargetRow();
        }, 100);
    });

    if (modal) {
        modal.style.display = 'flex';

        // 聚焦到服务名称输入框
        const serviceNameInput = document.getElementById('serviceName');
        if (serviceNameInput) {
            setTimeout(() => serviceNameInput.focus(), 200);
        }
    }
}

/**
 * 关闭算法模型服务弹窗
 */
function closeModelServiceModal() {
    const modal = document.getElementById('modelServiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 加载服务数据用于编辑
 */
function loadServiceDataForEdit(serviceId) {
    console.log('🔄 加载服务数据用于编辑:', serviceId);
    
    // 获取服务基本信息
    fetch(`/api/prediction/services/${serviceId}`)
        .then(response => response.json())
        .then(result => {
            console.log('📋 服务数据响应:', result);
            if (result.code === 200 && result.data) {
                fillServiceData(result.data);
            } else {
                console.error('❌ 加载服务数据失败:', result.message || result.error || '未知错误');
                alert('加载服务数据失败: ' + (result.message || result.error || '未知错误'));
            }
        })
        .catch(error => {
            console.error('❌ 加载服务数据出错:', error);
            alert('加载服务数据出错，请重试');
        });
}

/**
 * 回填服务数据到表单
 */
function fillServiceData(serviceData) {
    console.log('📝 开始回填服务数据:', serviceData);
    
    // 回填基本信息
    const serviceName = document.getElementById('serviceName');
    if (serviceName) serviceName.value = serviceData.serviceName || '';
    
    const serviceNotes = document.getElementById('serviceNotes');
    if (serviceNotes) serviceNotes.value = serviceData.notes || '';
    
    // 回填算法类型
    selectAlgorithmType(serviceData.algorithmType);
    
    // 回填模型参数
    const updateCycle = document.getElementById('updateCycle');
    if (updateCycle) updateCycle.value = serviceData.updateCycle || '7';
    
    const predictionCycle = document.getElementById('predictionCycle');
    if (predictionCycle) predictionCycle.value = serviceData.predictionCycle || '1';
    
    const predictionDuration = document.getElementById('predictionDuration');
    if (predictionDuration) predictionDuration.value = serviceData.predictionDuration || '1';
    
    const autoPrediction = document.getElementById('autoPrediction');
    if (autoPrediction) autoPrediction.checked = serviceData.autoPrediction === 1;
    
    // 加载设备和训练目标数据
    console.log('🔍 检查模型数据:', serviceData.models);
    console.log('🔢 模型数据长度:', serviceData.models ? serviceData.models.length : 'undefined');
    if (serviceData.models && serviceData.models.length > 0) {
        console.log('✅ 调用fillDeviceAndTargetData');
        fillDeviceAndTargetData(serviceData.models);
        
        // 额外的安全措施：延迟回填训练目标行
        setTimeout(() => {
            console.log('🔄 执行延迟回填训练目标行...');
            fillTrainingTargetsFromModels(serviceData.models);
        }, 3000);
    } else {
        // 没有模型数据，添加空行
        setTimeout(() => {
            addDeviceSelectionRow();
            addTrainingTargetRow();
        }, 100);
    }
}

/**
 * 选择算法类型
 */
function selectAlgorithmType(algorithmType) {
    const algorithmOptions = document.querySelectorAll('.algorithm-option');
    algorithmOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-value') === algorithmType) {
            option.classList.add('selected');
        }
    });
}

/**
 * 直接从模型数据回填训练目标行
 */
function fillTrainingTargetsFromModels(models) {
    console.log('🎯 开始直接回填训练目标行:', models);
    
    // 获取所有训练目标行
    const targetRows = document.querySelectorAll('.training-target-row');
    console.log('找到训练目标行数量:', targetRows.length, '模型数据数量:', models.length);
    
    // 为每个训练目标行回填对应的模型数据
    targetRows.forEach((row, index) => {
        if (index < models.length) {
            const model = models[index];
            const targetData = {
                deviceName: model.device_name,
                monitoringType: model.monitoring_type,
                monitoringMetric: model.monitoring_metric
            };
            
            console.log(`回填训练目标行 ${index + 1}:`, row.id, targetData);
            
            // 延迟回填，确保下拉框选项已加载
            setTimeout(() => {
                fillTrainingTargetRow(row.id, targetData);
            }, index * 500 + 500);
        }
    });
}

/**
 * 回填设备和训练目标数据
 */
function fillDeviceAndTargetData(deviceData) {
    console.log('📝 回填设备和训练目标数据:', deviceData);
    console.log('📊 数据长度:', deviceData.length);
    
    // 按设备分组
    const deviceGroups = {};
    deviceData.forEach(item => {
        // 使用parent_category_name和category_name作为分组键
        const key = `${item.parent_category_name}_${item.category_name}`;
        if (!deviceGroups[key]) {
            deviceGroups[key] = {
                deviceCategoryName: item.parent_category_name,
                deviceSubcategoryName: item.category_name,
                categoryId: item.category_id,
                targets: []
            };
        }
        deviceGroups[key].targets.push({
            monitoringType: item.monitoring_type,
            monitoringMetric: item.monitoring_metric,
            deviceId: item.device_id,
            deviceName: item.device_name
        });
    });
    
    console.log('📋 设备分组结果:', deviceGroups);
    console.log('📈 分组数量:', Object.keys(deviceGroups).length);
    
    // 先添加设备选择行并回填
    const deviceRowPromises = Object.values(deviceGroups).map((group, index) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const rowId = addDeviceSelectionRow();
                if (rowId) {
                    // 等待设备分类数据加载完成后再回填
                    setTimeout(() => {
                        fillDeviceSelectionRow(rowId, group);
                        resolve(rowId);
                    }, 500);
                } else {
                    resolve(null);
                }
            }, index * 100);
        });
    });
    
    // 等待所有设备选择行回填完成后，再添加训练目标行
    console.log('🔄 等待设备选择行Promise完成...');
    Promise.all(deviceRowPromises).then(() => {
        console.log('✅ 设备选择行Promise已完成，开始添加训练目标行');
        // 等待设备列表加载完成（需要等待subcategory change事件触发并加载设备列表）
        // 时间轴: 500ms填充设备行 + 300ms设置子类并触发change + 500ms API加载设备
        setTimeout(() => {
            console.log('🎯 开始处理训练目标行...');
            let targetIndex = 0;
            Object.values(deviceGroups).forEach(group => {
                group.targets.forEach(target => {
                    setTimeout(() => {
                        const rowId = addTrainingTargetRow();
                        if (rowId) {
                            console.log('准备回填训练目标行:', rowId, target);
                            // 等待设备列表加载完成后再回填（设备列表由updateDevicesForTrainingTargets异步加载）
                            setTimeout(() => {
                                console.log('开始回填训练目标行:', rowId, target);
                                fillTrainingTargetRow(rowId, target);
                            }, 800);
                        }
                    }, targetIndex * 200);
                    targetIndex++;
                });
            });
        }, 1500); // 增加等待时间，确保设备列表已完全加载
    });
}

/**
 * 回填设备选择行
 */
function fillDeviceSelectionRow(rowId, deviceData) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const categorySelect = row.querySelector('.device-category-select');
    const subcategorySelect = row.querySelector('.device-subcategory-select');
    
    if (categorySelect) {
        // 根据设备大类名称找到对应的选项
        const categoryOptions = categorySelect.querySelectorAll('option');
        for (let option of categoryOptions) {
            if (option.textContent === deviceData.deviceCategoryName) {
                categorySelect.value = option.value;
                break;
            }
        }
        
        // 触发change事件加载子类
        categorySelect.dispatchEvent(new Event('change'));
        
        // 等待子类加载后设置值
        setTimeout(() => {
            if (subcategorySelect) {
                const subcategoryOptions = subcategorySelect.querySelectorAll('option');
                for (let option of subcategoryOptions) {
                    if (option.textContent === deviceData.deviceSubcategoryName) {
                        subcategorySelect.value = option.value;
                        console.log('✅ 设置设备子类:', option.value, option.textContent);
                        // 重要：触发change事件以更新训练目标行的设备列表
                        subcategorySelect.dispatchEvent(new Event('change'));
                        break;
                    }
                }
            }
        }, 300);
    }
}

/**
 * 回填训练目标行
 */
function fillTrainingTargetRow(rowId, targetData) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    console.log('📝 回填训练目标行:', rowId, targetData);
    
    const deviceSelect = row.querySelector('.device-select');
    const detectionTypeSelect = row.querySelector('.detection-type-select');
    const metricSelect = row.querySelector('.metric-select');
    
    // 设置设备的函数（带重试机制）
    function setDeviceValue(retryCount = 0) {
        if (!deviceSelect || !targetData.deviceName) return;
        
        const deviceOptions = deviceSelect.querySelectorAll('option');
        console.log(`设备选项(尝试${retryCount + 1}):`, Array.from(deviceOptions).map(o => o.textContent));
        
        let found = false;
        for (let option of deviceOptions) {
            if (option.textContent === targetData.deviceName) {
                deviceSelect.value = option.value;
                console.log('✅ 设置设备为:', option.value, option.textContent);
                found = true;
                break;
            }
        }
        
        // 如果设备选项只有1个（只有默认的"选择设备"），重试
        if (!found && deviceOptions.length <= 1 && retryCount < 5) {
            console.log(`⏳ 设备列表未加载完成，${500}ms后重试...`);
            setTimeout(() => setDeviceValue(retryCount + 1), 500);
        }
    }
    
    // 等待设备列表加载完成后设置设备
    setTimeout(() => setDeviceValue(0), 300);
    
    if (detectionTypeSelect) {
        // 设置检测类型（监控类型）
        detectionTypeSelect.value = targetData.monitoringType;
        console.log('设置检测类型为:', targetData.monitoringType);
        
        // 触发change事件加载指标
        detectionTypeSelect.dispatchEvent(new Event('change'));
        
        // 等待指标加载后设置值
        setTimeout(() => {
            if (metricSelect) {
                // 根据监控指标名称找到对应的选项
                const metricOptions = metricSelect.querySelectorAll('option');
                console.log('指标选项:', Array.from(metricOptions).map(o => o.textContent));
                
                for (let option of metricOptions) {
                    if (option.textContent === targetData.monitoringMetric || 
                        option.value === targetData.monitoringMetric) {
                        metricSelect.value = option.value;
                        console.log('✅ 设置指标为:', option.value, option.textContent);
                        break;
                    }
                }
            }
        }, 500);
    }
}

// 将函数暴露到全局作用域
window.showModelServiceModal = showModelServiceModal;
window.closeModelServiceModal = closeModelServiceModal;
// saveModelService函数已在前面定义并暴露

// ... (existing code)
