// 配置管理功能实现

// 全局变量
let currentDevice = null;
let selectedVersions = [];
let deviceConfigs = [];
let versionHistory = [];

// 初始化配置管理
document.addEventListener('DOMContentLoaded', function() {
    initializeConfigManagement();
});

function initializeConfigManagement() {
    // 加载设备配置数据
    loadDeviceConfigs();
    
    // 绑定事件
    bindConfigEvents();
}

// 绑定配置管理事件
function bindConfigEvents() {
    // 备份所有设备
    document.getElementById('backupAllBtn')?.addEventListener('click', backupAllDevices);
    
    // 添加设备
    document.getElementById('addDeviceConfigBtn')?.addEventListener('click', () => {
        alert('添加设备功能开发中...');
    });
    
    // 返回配置列表
    document.getElementById('backToConfigDashboard')?.addEventListener('click', () => {
        document.getElementById('configDashboard').style.display = 'block';
        document.getElementById('configDetail').style.display = 'none';
        document.getElementById('configDiff').style.display = 'none';
    });
    
    // 返回版本列表
    document.getElementById('backToVersionList')?.addEventListener('click', () => {
        document.getElementById('configDetail').style.display = 'block';
        document.getElementById('configDiff').style.display = 'none';
    });
    
    // 立即备份
    document.getElementById('backupNowBtn')?.addEventListener('click', backupCurrentDevice);
    
    // 版本比对
    document.getElementById('compareVersionsBtn')?.addEventListener('click', showCompareView);
    
    // 开始比对
    document.getElementById('startCompareBtn')?.addEventListener('click', performComparison);
    
    // 导出配置
    document.getElementById('exportVersionBtn')?.addEventListener('click', exportConfig);
    
    // 过滤器
    document.getElementById('deviceTypeFilterConfig')?.addEventListener('change', filterDevices);
    document.getElementById('backupStatusFilter')?.addEventListener('change', filterDevices);
    document.getElementById('deviceSearchConfig')?.addEventListener('input', filterDevices);
}

// 加载设备配置数据
async function loadDeviceConfigs() {
    try {
        // 从API获取真实数据
        const token = localStorage.getItem('token');
        const response = await fetch('/api/network/config/devices', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                // 转换API数据格式为前端需要的格式
                deviceConfigs = result.data.map(device => ({
                    id: device.deviceId,
                    name: device.deviceName,
                    ip: device.deviceIp || '未配置',
                    type: getDeviceTypeFromModel(device.model),
                    model: device.model,
                    baselineVersion: device.version || '未知',
                    lastBackup: device.lastBackupTime || '从未备份',
                    backupStatus: device.backupStatus === 'success' ? 'success' : 
                                 device.backupStatus === 'no_backup' ? 'pending' : 'failed',
                    changeStatus: 'unchanged', // 默认未改变，可以后续扩展
                    manufacturer: device.manufacturer,
                    location: device.location,
                    firmwareVersion: device.firmwareVersion,
                    backupSize: device.backupSize,
                    hasBackup: device.hasBackup
                }));
                
                console.log('成功加载设备配置数据:', deviceConfigs.length, '台设备');
            } else {
                console.error('API返回错误:', result.message);
                deviceConfigs = [];
            }
        } else {
            console.error('获取设备配置失败:', response.status);
            deviceConfigs = [];
        }
    } catch (error) {
        console.error('加载设备配置数据失败:', error);
        deviceConfigs = [];
    }
    
    // 更新统计数据
    updateConfigStats();
    
    // 渲染设备列表
    renderDeviceConfigTable();
    
    // 加载图表
    loadConfigCharts();
}

// 根据设备型号判断设备类型
function getDeviceTypeFromModel(model) {
    if (!model) return 'unknown';
    
    const modelLower = model.toLowerCase();
    if (modelLower.includes('switch') || modelLower.includes('catalyst')) {
        return 'switch';
    } else if (modelLower.includes('router') || modelLower.includes('isr')) {
        return 'router';
    } else if (modelLower.includes('firewall') || modelLower.includes('fortigate')) {
        return 'firewall';
    } else if (modelLower.includes('ap') || modelLower.includes('wifi')) {
        return 'ap';
    } else if (modelLower.includes('gateway') || modelLower.includes('big-ip')) {
        return 'gateway';
    } else {
        return 'unknown';
    }
}

// 更新统计数据
function updateConfigStats() {
    const successCount = deviceConfigs.filter(d => d.backupStatus === 'success').length;
    const failCount = deviceConfigs.filter(d => d.backupStatus === 'failed').length;
    const changedCount = deviceConfigs.filter(d => d.changeStatus === 'changed').length;
    const totalCount = deviceConfigs.length;
    
    document.getElementById('backupSuccessCount').textContent = successCount;
    document.getElementById('backupFailCount').textContent = failCount;
    document.getElementById('configChangedCount').textContent = changedCount;
    document.getElementById('totalDeviceCount').textContent = totalCount;
}

// 渲染设备配置表格
function renderDeviceConfigTable() {
    const tbody = document.getElementById('deviceConfigTableBody');
    tbody.innerHTML = '';
    
    deviceConfigs.forEach(device => {
        const tr = document.createElement('tr');
        
        const backupStatusClass = device.backupStatus;
        const backupStatusText = {
            'success': '备份成功',
            'failed': '备份失败',
            'pending': '待备份'
        }[device.backupStatus];
        
        const changeStatusClass = device.changeStatus;
        const changeStatusText = {
            'unchanged': '未变更',
            'changed': '已变更'
        }[device.changeStatus];
        
        tr.innerHTML = `
            <td><strong>${device.name}</strong></td>
            <td><code>${device.ip}</code></td>
            <td>${device.model}</td>
            <td>${device.baselineVersion}</td>
            <td>${device.lastBackup}</td>
            <td><span class="backup-status ${backupStatusClass}">${backupStatusText}</span></td>
            <td><span class="change-status ${changeStatusClass}">${changeStatusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewDeviceConfig(${device.id})" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="backupDevice(${device.id})" title="立即备份">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="editDevice(${device.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// 过滤设备
function filterDevices() {
    const typeFilter = document.getElementById('deviceTypeFilterConfig').value;
    const statusFilter = document.getElementById('backupStatusFilter').value;
    const searchText = document.getElementById('deviceSearchConfig').value.toLowerCase();
    
    const filtered = deviceConfigs.filter(device => {
        const matchType = !typeFilter || device.type === typeFilter;
        const matchStatus = !statusFilter || device.backupStatus === statusFilter;
        const matchSearch = !searchText || 
            device.name.toLowerCase().includes(searchText) ||
            device.ip.includes(searchText);
        
        return matchType && matchStatus && matchSearch;
    });
    
    // 重新渲染过滤后的列表
    const tbody = document.getElementById('deviceConfigTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(device => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${device.name}</strong></td>
            <td><code>${device.ip}</code></td>
            <td>${device.model}</td>
            <td>${device.baselineVersion}</td>
            <td>${device.lastBackup}</td>
            <td><span class="backup-status ${device.backupStatus}">${device.backupStatus === 'success' ? '备份成功' : '备份失败'}</span></td>
            <td><span class="change-status ${device.changeStatus}">${device.changeStatus === 'unchanged' ? '未变更' : '已变更'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewDeviceConfig(${device.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon" onclick="backupDevice(${device.id})"><i class="fas fa-download"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 查看设备配置详情
function viewDeviceConfig(deviceId) {
    currentDevice = deviceConfigs.find(d => d.id === deviceId);
    if (!currentDevice) return;
    
    // 显示详情页
    document.getElementById('configDashboard').style.display = 'none';
    document.getElementById('configDetail').style.display = 'block';
    
    // 更新设备信息
    document.getElementById('deviceConfigName').textContent = currentDevice.name;
    document.getElementById('deviceConfigIP').textContent = currentDevice.ip;
    
    // 加载版本历史
    loadVersionHistory(deviceId);
}

// 加载版本历史
function loadVersionHistory(deviceId) {
    // 模拟版本历史数据
    versionHistory = [
        {
            id: 1,
            version: 'v2.3',
            date: '2025-01-29 02:05:00',
            size: '45.2 KB',
            user: 'admin',
            isBaseline: true,
            isLatest: true,
            changeType: '接口配置变更'
        },
        {
            id: 2,
            version: 'v2.2',
            date: '2025-01-28 02:05:00',
            size: '44.8 KB',
            user: 'admin',
            isBaseline: false,
            isLatest: false,
            changeType: '路由变更'
        },
        {
            id: 3,
            version: 'v2.1',
            date: '2025-01-27 02:05:00',
            size: '44.5 KB',
            user: 'admin',
            isBaseline: false,
            isLatest: false,
            changeType: 'ACL变更'
        },
        {
            id: 4,
            version: 'v2.0',
            date: '2025-01-26 02:05:00',
            size: '44.0 KB',
            user: 'admin',
            isBaseline: false,
            isLatest: false,
            changeType: '系统配置'
        },
        {
            id: 5,
            version: 'v1.9',
            date: '2025-01-25 02:05:00',
            size: '43.8 KB',
            user: 'admin',
            isBaseline: false,
            isLatest: false,
            changeType: 'VLAN配置'
        }
    ];
    
    renderVersionList();
}

// 渲染版本列表
function renderVersionList() {
    const versionListContainer = document.getElementById('versionList');
    versionListContainer.innerHTML = '';
    
    if (versionHistory.length === 0) {
        versionListContainer.innerHTML = `
            <div class="empty-version-list">
                <i class="fas fa-folder-open"></i>
                <p>暂无配置版本</p>
            </div>
        `;
        return;
    }
    
    versionHistory.forEach(version => {
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item' + (version.isBaseline ? ' baseline' : '');
        
        versionItem.innerHTML = `
            <div class="version-checkbox">
                <input type="checkbox" id="version-${version.id}" data-version-id="${version.id}">
            </div>
            <div class="version-icon">
                <i class="fas ${version.isBaseline ? 'fa-star' : 'fa-file-code'}"></i>
            </div>
            <div class="version-info">
                <div class="version-number">${version.version}</div>
                <div class="version-meta">
                    <span><i class="fas fa-clock"></i> ${version.date}</span>
                    <span><i class="fas fa-file"></i> ${version.size}</span>
                    <span><i class="fas fa-user"></i> ${version.user}</span>
                    <span><i class="fas fa-tag"></i> ${version.changeType}</span>
                </div>
            </div>
            <div class="version-tags">
                ${version.isBaseline ? '<span class="version-tag baseline">基准版本</span>' : ''}
                ${version.isLatest ? '<span class="version-tag latest">最新版本</span>' : ''}
            </div>
            <div class="version-actions-btn">
                <button class="btn-icon" onclick="viewVersionContent(${version.id})" title="查看内容">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="downloadVersion(${version.id})" title="下载">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" onclick="setBaseline(${version.id})" title="设为基准">
                    <i class="fas fa-star"></i>
                </button>
                <button class="btn-icon" onclick="restoreVersion(${version.id})" title="恢复配置">
                    <i class="fas fa-undo"></i>
                </button>
            </div>
        `;
        
        versionListContainer.appendChild(versionItem);
        
        // 绑定复选框事件
        const checkbox = versionItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateSelectedVersions);
    });
}

// 更新选中的版本
function updateSelectedVersions() {
    selectedVersions = [];
    document.querySelectorAll('.version-checkbox input:checked').forEach(checkbox => {
        selectedVersions.push(parseInt(checkbox.dataset.versionId));
    });
    
    // 最多选择2个版本进行比对
    if (selectedVersions.length > 2) {
        alert('最多只能选择2个版本进行比对');
        event.target.checked = false;
        selectedVersions.pop();
    }
}

// 显示比对视图
function showCompareView() {
    if (selectedVersions.length !== 2) {
        alert('请选择2个版本进行比对');
        return;
    }
    
    // 显示比对视图
    document.getElementById('configDetail').style.display = 'none';
    document.getElementById('configDiff').style.display = 'block';
    
    // 填充版本选择器
    const versionASelect = document.getElementById('versionASelect');
    const versionBSelect = document.getElementById('versionBSelect');
    
    versionASelect.innerHTML = '';
    versionBSelect.innerHTML = '';
    
    versionHistory.forEach(version => {
        const optionA = document.createElement('option');
        optionA.value = version.id;
        optionA.textContent = `${version.version} (${version.date})`;
        if (version.id === selectedVersions[0]) optionA.selected = true;
        versionASelect.appendChild(optionA);
        
        const optionB = document.createElement('option');
        optionB.value = version.id;
        optionB.textContent = `${version.version} (${version.date})`;
        if (version.id === selectedVersions[1]) optionB.selected = true;
        versionBSelect.appendChild(optionB);
    });
    
    // 执行比对
    performComparison();
}

// 执行配置比对
function performComparison() {
    const versionAId = parseInt(document.getElementById('versionASelect').value);
    const versionBId = parseInt(document.getElementById('versionBSelect').value);
    
    const versionA = versionHistory.find(v => v.id === versionAId);
    const versionB = versionHistory.find(v => v.id === versionBId);
    
    if (!versionA || !versionB) return;
    
    // 更新版本信息
    document.getElementById('versionATitle').textContent = `版本 ${versionA.version}`;
    document.getElementById('versionADate').textContent = versionA.date;
    document.getElementById('versionBTitle').textContent = `版本 ${versionB.version}`;
    document.getElementById('versionBDate').textContent = versionB.date;
    
    // 模拟配置内容
    const configA = generateMockConfig(versionA.version);
    const configB = generateMockConfig(versionB.version);
    
    // 执行差异比对
    const diff = computeDiff(configA, configB);
    
    // 更新统计
    document.getElementById('addedLines').textContent = diff.added;
    document.getElementById('removedLines').textContent = diff.removed;
    document.getElementById('modifiedLines').textContent = diff.modified;
    
    // 渲染差异内容
    renderDiffContent(configA, configB, diff);
}

// 生成模拟配置
function generateMockConfig(version) {
    const baseConfig = [
        'hostname CoreRouter01',
        'version 15.2',
        '!',
        'interface GigabitEthernet0/0',
        ' ip address 192.168.1.1 255.255.255.0',
        ' no shutdown',
        '!',
        'interface GigabitEthernet0/1',
        ' ip address 192.168.2.1 255.255.255.0',
        ' no shutdown',
        '!',
        'router ospf 1',
        ' network 192.168.1.0 0.0.0.255 area 0',
        ' network 192.168.2.0 0.0.0.255 area 0',
        '!',
        'access-list 100 permit ip any any',
        '!',
        'line vty 0 4',
        ' login local',
        ' transport input ssh',
        '!',
        'end'
    ];
    
    // 根据版本添加一些变化
    if (version === 'v2.3') {
        baseConfig.splice(8, 0, ' description Link to Switch01');
        baseConfig.splice(12, 0, ' description Link to Switch02');
    }
    
    return baseConfig;
}

// 计算差异
function computeDiff(configA, configB) {
    let added = 0;
    let removed = 0;
    let modified = 0;
    
    // 简单的差异计算（实际应使用diff算法）
    const setA = new Set(configA);
    const setB = new Set(configB);
    
    configB.forEach(line => {
        if (!setA.has(line)) added++;
    });
    
    configA.forEach(line => {
        if (!setB.has(line)) removed++;
    });
    
    return { added, removed, modified };
}

// 渲染差异内容
function renderDiffContent(configA, configB, diff) {
    const contentA = document.getElementById('diffContentA');
    const contentB = document.getElementById('diffContentB');
    
    contentA.innerHTML = '';
    contentB.innerHTML = '';
    
    // 渲染左侧（版本A）
    configA.forEach((line, index) => {
        const diffLine = document.createElement('div');
        diffLine.className = 'diff-line';
        
        if (!configB.includes(line)) {
            diffLine.classList.add('removed');
        } else {
            diffLine.classList.add('unchanged');
        }
        
        diffLine.innerHTML = `
            <div class="diff-line-number">${index + 1}</div>
            <div class="diff-line-content">${escapeHtml(line)}</div>
        `;
        
        contentA.appendChild(diffLine);
    });
    
    // 渲染右侧（版本B）
    configB.forEach((line, index) => {
        const diffLine = document.createElement('div');
        diffLine.className = 'diff-line';
        
        if (!configA.includes(line)) {
            diffLine.classList.add('added');
        } else {
            diffLine.classList.add('unchanged');
        }
        
        diffLine.innerHTML = `
            <div class="diff-line-number">${index + 1}</div>
            <div class="diff-line-content">${escapeHtml(line)}</div>
        `;
        
        contentB.appendChild(diffLine);
    });
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 备份所有设备
function backupAllDevices() {
    console.log('开始备份所有设备...');
    alert('正在备份所有设备，请稍候...');
    
    // 模拟备份过程
    setTimeout(() => {
        alert('所有设备备份完成！');
        loadDeviceConfigs();
    }, 2000);
}

// 备份单个设备
function backupDevice(deviceId) {
    const device = deviceConfigs.find(d => d.id === deviceId);
    console.log('备份设备:', device.name);
    alert(`正在备份设备 ${device.name}...`);
}

// 备份当前设备
function backupCurrentDevice() {
    if (!currentDevice) return;
    backupDevice(currentDevice.id);
}

// 查看版本内容
function viewVersionContent(versionId) {
    console.log('查看版本内容:', versionId);
    alert('查看版本内容功能开发中...');
}

// 下载版本
function downloadVersion(versionId) {
    console.log('下载版本:', versionId);
    alert('下载版本功能开发中...');
}

// 设置基准版本
function setBaseline(versionId) {
    if (confirm('确定要将此版本设为基准版本吗？')) {
        console.log('设置基准版本:', versionId);
        
        // 更新基准标记
        versionHistory.forEach(v => {
            v.isBaseline = v.id === versionId;
        });
        
        renderVersionList();
        alert('基准版本设置成功！');
    }
}

// 恢复配置
function restoreVersion(versionId) {
    if (confirm('确定要恢复到此版本的配置吗？此操作将覆盖当前配置！')) {
        console.log('恢复配置到版本:', versionId);
        alert('配置恢复功能开发中...');
    }
}

// 导出配置
function exportConfig() {
    console.log('导出配置');
    alert('导出配置功能开发中...');
}

// 编辑设备
function editDevice(deviceId) {
    console.log('编辑设备:', deviceId);
    alert('编辑设备功能开发中...');
}

// 加载配置图表
function loadConfigCharts() {
    console.log('加载配置管理图表');
    // 这里应该使用Chart.js或ECharts绘制图表
}

// 导出函数供HTML使用
window.viewDeviceConfig = viewDeviceConfig;
window.backupDevice = backupDevice;
window.editDevice = editDevice;
window.viewVersionContent = viewVersionContent;
window.downloadVersion = downloadVersion;
window.setBaseline = setBaseline;
window.restoreVersion = restoreVersion;
