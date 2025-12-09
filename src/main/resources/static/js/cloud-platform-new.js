/**
 * 云平台管理系统 - 前端JavaScript（新版）
 * 集成到主系统侧边栏
 */

// 当前选中的云平台和页面
let currentProvider = 'huawei';
let currentPage = 'overview';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('云平台管理系统初始化...');
    
    // 初始化树形导航
    initTreeNavigation();
    
    // 加载华为云概览数据
    loadOverviewData('huawei');
});

/**
 * 初始化树形导航
 */
function initTreeNavigation() {
    // 父节点点击事件（展开/收起）
    document.querySelectorAll('.parent-node').forEach(node => {
        node.addEventListener('click', function(e) {
            e.stopPropagation();
            const treeNode = this.closest('.tree-node');
            treeNode.classList.toggle('expanded');
        });
    });
    
    // 子节点点击事件（切换页面）
    document.querySelectorAll('.sub-node').forEach(node => {
        node.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const provider = this.getAttribute('data-provider');
            const page = this.getAttribute('data-page');
            
            // 移除所有选中状态
            document.querySelectorAll('.sub-node').forEach(n => n.classList.remove('selected'));
            
            // 添加当前选中状态
            this.classList.add('selected');
            
            // 切换页面
            switchToPage(provider, page);
        });
    });
}

/**
 * 切换到指定页面
 */
function switchToPage(provider, page) {
    console.log(`切换到: ${provider} - ${page}`);
    
    currentProvider = provider;
    currentPage = page;
    
    // 隐藏所有页面
    document.querySelectorAll('.content-page').forEach(el => {
        el.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`${provider}-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 加载对应页面的数据
    if (page === 'overview') {
        loadOverviewData(provider);
    } else if (page === 'vm') {
        loadVMList(provider);
    } else if (page === 'host') {
        loadHostList(provider);
    } else if (page === 'storage') {
        loadStorageList(provider);
    } else if (page === 'monitor') {
        loadMonitorData(provider);
    }
}

/**
 * 加载概览数据
 */
async function loadOverviewData(provider) {
    console.log(`加载${provider}概览数据...`);
    
    try {
        // 获取统计数据（从数据库）
        const stats = await fetchProviderStatsFromDB(provider);
        updateStatsCards(provider, stats);
        
        // 加载资源使用图表
        loadResourceChart(provider);
        
        // 加载告警列表（从数据库）
        loadAlertListFromDB(provider);
        
    } catch (error) {
        console.error('加载概览数据失败:', error);
    }
}

/**
 * 从数据库获取云平台统计数据
 */
async function fetchProviderStatsFromDB(provider) {
    try {
        const response = await fetch(`/api/cloud/overview/${provider}`);
        if (response.ok) {
            const result = await response.json();
            if (result.code === 200 && result.data) {
                return result.data;
            }
        }
    } catch (error) {
        console.warn('从数据库获取统计数据失败，使用模拟数据:', error);
    }
    
    // 返回模拟数据作为备用
    return getMockStats(provider);
}

/**
 * 获取云平台统计数据（旧版，保留兼容）
 */
async function fetchProviderStats(provider) {
    return fetchProviderStatsFromDB(provider);
}

/**
 * 获取模拟统计数据
 */
function getMockStats(provider) {
    if (provider === 'huawei') {
        return {
            totalInstances: 5,
            runningInstances: 4,
            stoppedInstances: 1,
            totalCpuCores: 20,
            totalMemoryGb: 38,
            totalStorageGb: 1800,
            totalCost: 1250
        };
    } else {
        return {
            totalInstances: 6,
            runningInstances: 5,
            stoppedInstances: 1,
            totalCpuCores: 24,
            totalMemoryGb: 48,
            totalStorageGb: 3200,
            totalCost: 1680
        };
    }
}

/**
 * 更新统计卡片
 */
function updateStatsCards(provider, stats) {
    const prefix = provider === 'huawei' ? 'hw' : 'ali';
    
    const totalEl = document.getElementById(`${prefix}-total-instances`);
    const runningEl = document.getElementById(`${prefix}-running-instances`);
    const cpuEl = document.getElementById(`${prefix}-total-cpu`);
    const memoryEl = document.getElementById(`${prefix}-total-memory`);
    const storageEl = document.getElementById(`${prefix}-total-storage`);
    
    // 使用后端返回的字段名
    if (totalEl) totalEl.textContent = stats.totalCount || 0;
    if (runningEl) runningEl.textContent = stats.runningCount || 0;
    if (cpuEl) cpuEl.textContent = stats.totalCpu || 0;
    if (memoryEl) memoryEl.textContent = stats.totalMemory || 0;
    if (storageEl) storageEl.textContent = stats.totalStorage || 0;
}

/**
 * 加载资源使用图表
 */
function loadResourceChart(provider) {
    const chartDom = document.getElementById(provider === 'huawei' ? 'hwResourceChart' : 'aliResourceChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['CPU使用率', '内存使用率', '磁盘使用率']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: getRecentDates(7)
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 30, 70),
                itemStyle: {
                    color: '#667eea'
                }
            },
            {
                name: '内存使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 40, 80),
                itemStyle: {
                    color: '#f093fb'
                }
            },
            {
                name: '磁盘使用率',
                type: 'line',
                smooth: true,
                data: generateRandomData(7, 20, 60),
                itemStyle: {
                    color: '#4facfe'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

/**
 * 从数据库加载告警列表
 */
async function loadAlertListFromDB(provider) {
    // 华为云用 hw-alert-table, 阿里云用 ali-alert-table
    let tableBody;
    if (provider === 'huawei') {
        const table = document.getElementById('hw-alert-table');
        tableBody = table ? table.querySelector('tbody') : null;
    } else {
        const table = document.getElementById('ali-alert-table');
        tableBody = table ? table.querySelector('tbody') : null;
    }
    
    if (!tableBody) return;
    
    try {
        // 从数据库获取告警数据
        const response = await fetch(`/api/cloud/alert/list?provider=${provider}`);
        const result = await response.json();
        
        let alerts = [];
        if (result.code === 200 && result.data && result.data.length > 0) {
            // 只取前5条最新的告警
            alerts = result.data.slice(0, 5);
        } else {
            // 如果没有数据，使用模拟数据
            alerts = getMockAlerts(provider);
        }
        
        // 渲染表格
        tableBody.innerHTML = alerts.map(alert => `
            <tr>
                <td>${formatDateTime(alert.alertTime)}</td>
                <td>${alert.resourceName}</td>
                <td>
                    <span class="status-badge" style="background: ${getAlertLevelColor(alert.alertLevel)};">
                        ${alert.alertLevel}
                    </span>
                </td>
                <td>${alert.alertMessage}</td>
                <td>
                    <span class="status-badge ${alert.alertStatus === '未解决' ? 'status-running' : 'status-stopped'}">
                        ${alert.alertStatus}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载告警列表失败:', error);
        // 出错时使用模拟数据
        const alerts = getMockAlerts(provider);
        tableBody.innerHTML = alerts.map(alert => `
            <tr>
                <td>${alert.alertTime}</td>
                <td>${alert.resourceName}</td>
                <td>
                    <span class="status-badge" style="background: ${getAlertLevelColor(alert.alertLevel)};">
                        ${alert.alertLevel}
                    </span>
                </td>
                <td>${alert.alertMessage}</td>
                <td>
                    <span class="status-badge ${alert.status === 'active' ? 'status-running' : 'status-stopped'}">
                        ${alert.status === 'active' ? '活跃' : '已解决'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

/**
 * 加载告警列表（旧版，保留兼容）
 */
async function loadAlertList(provider) {
    return loadAlertListFromDB(provider);
}

/**
 * 获取模拟告警数据
 */
function getMockAlerts(provider) {
    if (provider === 'huawei') {
        return [
            {
                alertTime: '2025-11-23 22:30:00',
                resourceName: '数据库服务器',
                alertLevel: 'warning',
                alertMessage: '内存使用率持续5分钟超过85%',
                status: 'active'
            }
        ];
    } else {
        return [
            {
                alertTime: '2025-11-23 20:15:00',
                resourceName: 'MongoDB数据库',
                alertLevel: 'warning',
                alertMessage: '内存使用率持续5分钟超过85%',
                status: 'resolved'
            }
        ];
    }
}

/**
 * 获取告警级别颜色
 */
function getAlertLevelColor(level) {
    const colors = {
        'info': '#d1ecf1',
        'warning': '#fff3cd',
        'critical': '#f8d7da'
    };
    return colors[level] || '#e9ecef';
}

/**
 * 获取最近N天的日期
 */
function getRecentDates(days) {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    
    return dates;
}

/**
 * 生成随机数据
 */
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

/**
 * 侧边栏导航功能
 */
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
        window.location.href = targetPage;
    }
}

/**
 * ==================== 虚拟机管理功能 ====================
 */

/**
 * 加载虚拟机列表
 */
async function loadVMList(provider) {
    console.log(`加载${provider}虚拟机列表...`);
    
    const tableBody = document.getElementById(`${provider}VMTableBody`);
    if (!tableBody) return;
    
    try {
        // 显示加载状态
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">加载中...</p>
                </td>
            </tr>
        `;
        
        // 调用API获取数据
        const response = await fetch(`/api/cloud/vm/list?provider=${provider}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderVMTable(provider, result.data);
        } else {
            throw new Error(result.message || '获取数据失败');
        }
    } catch (error) {
        console.error('加载虚拟机列表失败:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff4d4f;"></i>
                    <p style="margin-top: 10px;">加载失败: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 渲染虚拟机表格
 */
function renderVMTable(provider, vmList) {
    const tableBody = document.getElementById(`${provider}VMTableBody`);
    if (!tableBody) return;
    
    if (!vmList || vmList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">暂无虚拟机数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = vmList.map(vm => `
        <tr>
            <td style="padding: 12px;">
                <div style="display: flex; align-items: center;">
                    <i class="fas fa-server" style="margin-right: 8px; color: #667eea;"></i>
                    <span>${vm.vmName}</span>
                </div>
            </td>
            <td style="padding: 12px;">
                <span class="status-badge status-${vm.status}">
                    ${getStatusText(vm.status)}
                </span>
            </td>
            <td style="padding: 12px;">${vm.specType || '-'}</td>
            <td style="padding: 12px;">${vm.ipAddress || '-'}</td>
            <td style="padding: 12px;">${formatDateTime(vm.createdTime)}</td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    ${vm.status === 'stopped' ? 
                        `<button class="btn-success" onclick="startVM(${vm.id}, '${provider}')">
                            <i class="fas fa-play"></i> 启动
                        </button>` : 
                        `<button class="btn-secondary" onclick="stopVM(${vm.id}, '${provider}')">
                            <i class="fas fa-stop"></i> 停止
                        </button>`
                    }
                    <button class="btn-secondary" onclick="viewVMDetail(${vm.id})">
                        <i class="fas fa-eye"></i> 详情
                    </button>
                    <button class="btn-danger" onclick="deleteVM(${vm.id}, '${provider}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 搜索虚拟机
 */
async function searchVMs(provider) {
    const statusEl = document.getElementById(`${provider}VmStatusFilter`);
    const keywordEl = document.getElementById(`${provider}VmSearchKeyword`);
    const status = statusEl ? statusEl.value : '';
    const keyword = keywordEl ? keywordEl.value : '';
    
    const tableBody = document.getElementById(`${provider}VMTableBody`);
    if (!tableBody) return;
    
    try {
        let url = `/api/cloud/vm/list?provider=${provider}`;
        if (status) url += `&status=${status}`;
        if (keyword) url += `&keyword=${keyword}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderVMTable(provider, result.data);
        }
    } catch (error) {
        console.error('搜索虚拟机失败:', error);
    }
}

/**
 * 启动虚拟机
 */
async function startVM(id, provider) {
    if (!confirm('确定要启动这台虚拟机吗？')) return;
    
    try {
        const response = await fetch(`/api/cloud/vm/${id}/start`, {
            method: 'PUT'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('启动成功！');
            loadVMList(provider);
        } else {
            alert('启动失败: ' + result.message);
        }
    } catch (error) {
        console.error('启动虚拟机失败:', error);
        alert('启动失败: ' + error.message);
    }
}

/**
 * 停止虚拟机
 */
async function stopVM(id, provider) {
    if (!confirm('确定要停止这台虚拟机吗？')) return;
    
    try {
        const response = await fetch(`/api/cloud/vm/${id}/stop`, {
            method: 'PUT'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('停止成功！');
            loadVMList(provider);
        } else {
            alert('停止失败: ' + result.message);
        }
    } catch (error) {
        console.error('停止虚拟机失败:', error);
        alert('停止失败: ' + error.message);
    }
}

/**
 * 删除虚拟机
 */
async function deleteVM(id, provider) {
    if (!confirm('确定要删除这台虚拟机吗？此操作不可恢复！')) return;
    
    try {
        const response = await fetch(`/api/cloud/vm/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('删除成功！');
            loadVMList(provider);
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除虚拟机失败:', error);
        alert('删除失败: ' + error.message);
    }
}

/**
 * 查看虚拟机详情
 */
async function viewVMDetail(id) {
    try {
        const response = await fetch(`/api/cloud/vm/${id}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const vm = result.data;
            alert(`虚拟机详情：
名称：${vm.vmName}
状态：${getStatusText(vm.status)}
规格：${vm.specType}
CPU：${vm.cpuCores}核
内存：${vm.memoryGb}GB
磁盘：${vm.diskGb}GB
IP地址：${vm.ipAddress}
区域：${vm.region}
创建时间：${formatDateTime(vm.createdTime)}`);
        }
    } catch (error) {
        console.error('获取虚拟机详情失败:', error);
        alert('获取详情失败: ' + error.message);
    }
}

/**
 * 显示创建虚拟机模态框
 */
let currentVMProvider = '';

function showCreateVMModal(provider) {
    currentVMProvider = provider;
    
    // 设置默认值
    document.getElementById('vmName').value = `${provider === 'huawei' ? '华为云' : '阿里云'}-虚拟机-${new Date().getTime()}`;
    document.getElementById('specType').value = 's6.large.2';
    document.getElementById('cpuCores').value = '2';
    document.getElementById('memoryGb').value = '4';
    document.getElementById('diskGb').value = '40';
    document.getElementById('ipAddress').value = '192.168.1.100';
    document.getElementById('autoStart').checked = true;
    
    // 设置区域默认值
    if (provider === 'huawei') {
        document.getElementById('region').value = 'cn-north-1';
    } else {
        document.getElementById('region').value = 'cn-hangzhou';
    }
    
    // 显示模态框
    document.getElementById('createVMModal').style.display = 'flex';
}

/**
 * 关闭创建虚拟机模态框
 */
function closeCreateVMModal() {
    document.getElementById('createVMModal').style.display = 'none';
    document.getElementById('createVMForm').reset();
}

/**
 * 提交创建虚拟机表单
 */
function submitCreateVM() {
    const form = document.getElementById('createVMForm');
    
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集表单数据
    const vmData = {
        vmName: document.getElementById('vmName').value,
        vmId: `${currentVMProvider}-vm-${new Date().getTime()}`,
        provider: currentVMProvider,
        status: document.getElementById('autoStart').checked ? 'running' : 'stopped',
        specType: document.getElementById('specType').value,
        cpuCores: parseInt(document.getElementById('cpuCores').value),
        memoryGb: parseInt(document.getElementById('memoryGb').value),
        diskGb: parseInt(document.getElementById('diskGb').value),
        ipAddress: document.getElementById('ipAddress').value,
        region: document.getElementById('region').value,
        osType: document.getElementById('osType').value
    };
    
    // 调用创建API
    createVM(vmData, currentVMProvider);
}

/**
 * 创建虚拟机
 */
async function createVM(vmData, provider) {
    try {
        const response = await fetch('/api/cloud/vm/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vmData)
        });
        const result = await response.json();
        
        if (result.code === 200) {
            window.alert('虚拟机创建成功！');
            closeCreateVMModal();  // 关闭模态框
            loadVMList(provider);   // 刷新列表
        } else {
            window.alert('创建失败: ' + result.message);
        }
    } catch (error) {
        console.error('创建虚拟机失败:', error);
        window.alert('创建失败: ' + error.message);
    }
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
    const statusMap = {
        'running': '运行中',
        'stopped': '已停止',
        'error': '异常'
    };
    return statusMap[status] || status;
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * ==================== 云主机管理功能 ====================
 */

/**
 * 加载云主机列表
 */
async function loadHostList(provider) {
    console.log(`加载${provider}云主机列表...`);
    
    const tableBody = document.getElementById(`${provider}HostTableBody`);
    if (!tableBody) return;
    
    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">加载中...</p>
                </td>
            </tr>
        `;
        
        const response = await fetch(`/api/cloud/host/list?provider=${provider}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderHostTable(provider, result.data);
        } else {
            throw new Error(result.message || '获取数据失败');
        }
    } catch (error) {
        console.error('加载云主机列表失败:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff4d4f;"></i>
                    <p style="margin-top: 10px;">加载失败: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 渲染云主机表格
 */
function renderHostTable(provider, hostList) {
    const tableBody = document.getElementById(`${provider}HostTableBody`);
    if (!tableBody) return;
    
    if (!hostList || hostList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">暂无云主机数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = hostList.map(host => `
        <tr>
            <td style="padding: 12px;">
                <div style="display: flex; align-items: center;">
                    <i class="fas fa-desktop" style="margin-right: 8px; color: #667eea;"></i>
                    <span>${host.hostName}</span>
                </div>
            </td>
            <td style="padding: 12px;">
                <span class="status-badge status-${host.status}">
                    ${getStatusText(host.status)}
                </span>
            </td>
            <td style="padding: 12px;">${host.instanceType || '-'}</td>
            <td style="padding: 12px;">${host.publicIp || '-'}</td>
            <td style="padding: 12px;">${host.osType || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-secondary" onclick="rebootHost(${host.id}, '${provider}')">
                        <i class="fas fa-redo"></i> 重启
                    </button>
                    <button class="btn-secondary" onclick="viewHostDetail(${host.id})">
                        <i class="fas fa-eye"></i> 详情
                    </button>
                    <button class="btn-danger" onclick="deleteHost(${host.id}, '${provider}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 搜索云主机
 */
async function searchHosts(provider) {
    const statusEl = document.getElementById(`${provider}HostStatusFilter`);
    const keywordEl = document.getElementById(`${provider}HostSearchKeyword`);
    const status = statusEl ? statusEl.value : '';
    const keyword = keywordEl ? keywordEl.value : '';
    
    const tableBody = document.getElementById(`${provider}HostTableBody`);
    if (!tableBody) return;
    
    try {
        let url = `/api/cloud/host/list?provider=${provider}`;
        if (status) url += `&status=${status}`;
        if (keyword) url += `&keyword=${keyword}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderHostTable(provider, result.data);
        }
    } catch (error) {
        console.error('搜索云主机失败:', error);
    }
}

/**
 * 重启云主机
 */
async function rebootHost(id, provider) {
    if (!confirm('确定要重启这台云主机吗？')) return;
    
    try {
        const response = await fetch(`/api/cloud/host/${id}/reboot`, {
            method: 'PUT'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('重启成功！');
            loadHostList(provider);
        } else {
            alert('重启失败: ' + result.message);
        }
    } catch (error) {
        console.error('重启云主机失败:', error);
        alert('重启失败: ' + error.message);
    }
}

/**
 * 删除云主机
 */
async function deleteHost(id, provider) {
    if (!confirm('确定要删除这台云主机吗？此操作不可恢复！')) return;
    
    try {
        const response = await fetch(`/api/cloud/host/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('删除成功！');
            loadHostList(provider);
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除云主机失败:', error);
        alert('删除失败: ' + error.message);
    }
}

/**
 * 查看云主机详情
 */
async function viewHostDetail(id) {
    try {
        const response = await fetch(`/api/cloud/host/${id}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const host = result.data;
            alert(`云主机详情：
名称：${host.hostName}
状态：${getStatusText(host.status)}
实例类型：${host.instanceType}
CPU：${host.cpuCores}核
内存：${host.memoryGb}GB
公网IP：${host.publicIp}
私网IP：${host.privateIp}
操作系统：${host.osType}
区域：${host.region}
创建时间：${formatDateTime(host.createdTime)}`);
        }
    } catch (error) {
        console.error('获取云主机详情失败:', error);
        alert('获取详情失败: ' + error.message);
    }
}

/**
 * ==================== 云存储管理功能 ====================
 */

/**
 * 加载云存储列表
 */
async function loadStorageList(provider) {
    console.log(`加载${provider}云存储列表...`);
    
    const tableBody = document.getElementById(`${provider}StorageTableBody`);
    if (!tableBody) return;
    
    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">加载中...</p>
                </td>
            </tr>
        `;
        
        const response = await fetch(`/api/cloud/storage/list?provider=${provider}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderStorageTable(provider, result.data);
        } else {
            throw new Error(result.message || '获取数据失败');
        }
    } catch (error) {
        console.error('加载云存储列表失败:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff4d4f;"></i>
                    <p style="margin-top: 10px;">加载失败: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 渲染云存储表格
 */
function renderStorageTable(provider, storageList) {
    const tableBody = document.getElementById(`${provider}StorageTableBody`);
    if (!tableBody) return;
    
    if (!storageList || storageList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">暂无云存储数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = storageList.map(storage => {
        const usagePercent = storage.capacityGb > 0 
            ? Math.round((storage.usedGb / storage.capacityGb) * 100) 
            : 0;
        
        return `
        <tr>
            <td style="padding: 12px;">
                <div style="display: flex; align-items: center;">
                    <i class="fas fa-database" style="margin-right: 8px; color: #667eea;"></i>
                    <span>${storage.storageName}</span>
                </div>
            </td>
            <td style="padding: 12px;">${getStorageTypeText(storage.storageType)}</td>
            <td style="padding: 12px;">${storage.capacityGb}GB</td>
            <td style="padding: 12px;">${storage.usedGb}GB</td>
            <td style="padding: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${usagePercent}%; height: 100%; background: ${usagePercent > 80 ? '#ff4d4f' : usagePercent > 60 ? '#faad14' : '#52c41a'};"></div>
                    </div>
                    <span>${usagePercent}%</span>
                </div>
            </td>
            <td style="padding: 12px;">
                <span class="status-badge status-running">${storage.status || 'active'}</span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-secondary" onclick="viewStorageDetail(${storage.id})">
                        <i class="fas fa-eye"></i> 详情
                    </button>
                    <button class="btn-danger" onclick="deleteStorage(${storage.id}, '${provider}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

/**
 * 搜索云存储
 */
async function searchStorage(provider) {
    const typeEl = document.getElementById(`${provider}StorageTypeFilter`);
    const keywordEl = document.getElementById(`${provider}StorageSearchKeyword`);
    const storageType = typeEl ? typeEl.value : '';
    const keyword = keywordEl ? keywordEl.value : '';
    
    const tableBody = document.getElementById(`${provider}StorageTableBody`);
    if (!tableBody) return;
    
    try {
        let url = `/api/cloud/storage/list?provider=${provider}`;
        if (storageType) url += `&storageType=${storageType}`;
        if (keyword) url += `&keyword=${keyword}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderStorageTable(provider, result.data);
        }
    } catch (error) {
        console.error('搜索云存储失败:', error);
    }
}

/**
 * 删除云存储
 */
async function deleteStorage(id, provider) {
    if (!confirm('确定要删除这个存储吗？此操作不可恢复！')) return;
    
    try {
        const response = await fetch(`/api/cloud/storage/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('删除成功！');
            loadStorageList(provider);
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除云存储失败:', error);
        alert('删除失败: ' + error.message);
    }
}

/**
 * 查看云存储详情
 */
async function viewStorageDetail(id) {
    try {
        const response = await fetch(`/api/cloud/storage/${id}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const storage = result.data;
            const usagePercent = storage.capacityGb > 0 
                ? Math.round((storage.usedGb / storage.capacityGb) * 100) 
                : 0;
            
            alert(`云存储详情：
名称：${storage.storageName}
类型：${getStorageTypeText(storage.storageType)}
容量：${storage.capacityGb}GB
已使用：${storage.usedGb}GB
使用率：${usagePercent}%
状态：${storage.status}
区域：${storage.region}
创建时间：${formatDateTime(storage.createdTime)}`);
        }
    } catch (error) {
        console.error('获取云存储详情失败:', error);
        alert('获取详情失败: ' + error.message);
    }
}

/**
 * 获取存储类型文本
 */
function getStorageTypeText(type) {
    const typeMap = {
        'object': '对象存储',
        'block': '块存储',
        'file': '文件存储'
    };
    return typeMap[type] || type;
}

/**
 * ==================== 监控告警功能 ====================
 */

/**
 * 加载监控告警数据
 */
async function loadMonitorData(provider) {
    console.log(`加载${provider}监控告警数据...`);
    
    const tableBody = document.getElementById(`${provider}AlertTableBody`);
    if (!tableBody) return;
    
    try {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">加载中...</p>
                </td>
            </tr>
        `;
        
        const response = await fetch(`/api/cloud/alert/list?provider=${provider}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderAlertTable(provider, result.data);
        } else {
            throw new Error(result.message || '获取数据失败');
        }
    } catch (error) {
        console.error('加载告警数据失败:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff4d4f;"></i>
                    <p style="margin-top: 10px;">加载失败: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

/**
 * 渲染告警表格
 */
function renderAlertTable(provider, alertList) {
    const tableBody = document.getElementById(`${provider}AlertTableBody`);
    if (!tableBody) return;
    
    if (!alertList || alertList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 24px;"></i>
                    <p style="margin-top: 10px;">暂无告警数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = alertList.map(alert => `
        <tr>
            <td style="padding: 12px;">${formatDateTime(alert.alertTime)}</td>
            <td style="padding: 12px;">${alert.resourceName}</td>
            <td style="padding: 12px;">${getResourceTypeText(alert.resourceType)}</td>
            <td style="padding: 12px;">
                <span class="status-badge" style="background: ${getAlertLevelColor(alert.alertLevel)};">
                    ${getAlertLevelText(alert.alertLevel)}
                </span>
            </td>
            <td style="padding: 12px;">${alert.alertMessage}</td>
            <td style="padding: 12px;">
                <span class="status-badge ${alert.alertStatus === 'active' ? 'status-error' : 'status-running'}">
                    ${alert.alertStatus === 'active' ? '活跃' : '已解决'}
                </span>
            </td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    ${alert.alertStatus === 'active' ? 
                        `<button class="btn-success" onclick="resolveAlert(${alert.id}, '${provider}')">
                            <i class="fas fa-check"></i> 解决
                        </button>` : 
                        `<span style="color: #999;">已处理</span>`
                    }
                    <button class="btn-secondary" onclick="viewAlertDetail(${alert.id})">
                        <i class="fas fa-eye"></i> 详情
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 搜索告警
 */
async function searchAlerts(provider) {
    const levelEl = document.getElementById(`${provider}AlertLevelFilter`);
    const statusEl = document.getElementById(`${provider}AlertStatusFilter`);
    const alertLevel = levelEl ? levelEl.value : '';
    const alertStatus = statusEl ? statusEl.value : '';
    
    const tableBody = document.getElementById(`${provider}AlertTableBody`);
    if (!tableBody) return;
    
    try {
        let url = `/api/cloud/alert/list?provider=${provider}`;
        if (alertLevel) url += `&alertLevel=${alertLevel}`;
        if (alertStatus) url += `&alertStatus=${alertStatus}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderAlertTable(provider, result.data);
        }
    } catch (error) {
        console.error('搜索告警失败:', error);
    }
}

/**
 * 解决告警
 */
async function resolveAlert(id, provider) {
    if (!confirm('确定要标记此告警为已解决吗？')) return;
    
    try {
        const response = await fetch(`/api/cloud/alert/${id}/resolve`, {
            method: 'PUT'
        });
        const result = await response.json();
        
        if (result.code === 200) {
            alert('告警已解决！');
            loadMonitorData(provider);
        } else {
            alert('操作失败: ' + result.message);
        }
    } catch (error) {
        console.error('解决告警失败:', error);
        alert('操作失败: ' + error.message);
    }
}

/**
 * 查看告警详情
 */
async function viewAlertDetail(id) {
    try {
        const response = await fetch(`/api/cloud/alert/${id}`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            const alertData = result.data;
            window.alert(`告警详情：
资源名称：${alertData.resourceName}
资源类型：${getResourceTypeText(alertData.resourceType)}
告警级别：${getAlertLevelText(alertData.alertLevel)}
告警信息：${alertData.alertMessage}
告警状态：${alertData.alertStatus === 'active' ? '活跃' : '已解决'}
告警时间：${formatDateTime(alertData.alertTime)}
${alertData.resolvedTime ? '解决时间：' + formatDateTime(alertData.resolvedTime) : ''}`);
        }
    } catch (error) {
        console.error('获取告警详情失败:', error);
        window.alert('获取详情失败: ' + error.message);
    }
}

/**
 * 获取资源类型文本
 */
function getResourceTypeText(type) {
    const typeMap = {
        'vm': '虚拟机',
        'host': '云主机',
        'storage': '云存储'
    };
    return typeMap[type] || type;
}

/**
 * 获取告警级别文本
 */
function getAlertLevelText(level) {
    const levelMap = {
        'info': '信息',
        'warning': '警告',
        'error': '错误',
        'critical': '严重'
    };
    return levelMap[level] || level;
}

/**
 * 获取告警级别颜色
 */
function getAlertLevelColor(level) {
    const colorMap = {
        'info': '#d1ecf1',
        'warning': '#fff3cd',
        'error': '#f8d7da',
        'critical': '#721c24'
    };
    return colorMap[level] || '#e9ecef';
}
