/**
 * 云平台管理 - 嵌入式模块
 * 在右侧内容区显示，不跳转页面
 */

// 当前选中的云平台和页面
let currentCloudProvider = 'huawei';
let currentCloudPage = 'overview';

/**
 * 在主内容区显示云平台管理界面
 */
function showCloudPlatformInMainContent() {
    console.log('🚀 在主内容区显示云平台管理界面');
    
    // 获取主内容区容器
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('未找到主内容区容器');
        return;
    }
    
    // 保存原始内容（如果需要返回）
    if (!window.originalMainContent) {
        window.originalMainContent = mainContent.innerHTML;
    }
    
    // 加载云平台HTML和CSS
    loadCloudPlatformStyles();
    mainContent.innerHTML = getCloudPlatformHTML();
    
    // 初始化并加载数据
    setTimeout(() => {
        loadCloudOverviewData('huawei');
    }, 100);
}

/**
 * 加载云平台样式
 */
function loadCloudPlatformStyles() {
    if (document.getElementById('cloud-platform-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cloud-platform-styles';
    style.textContent = `
        .cloud-platform-container { display: flex; height: calc(100vh - 60px); background: #f5f7fa; }
        .cloud-sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px 0; overflow-y: auto; }
        .cloud-sidebar-header { padding: 0 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .cloud-sidebar-header h2 { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .cloud-menu { margin-top: 20px; }
        .cloud-provider { margin-bottom: 10px; }
        .provider-header { padding: 12px 20px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.3s; }
        .provider-header:hover { background: rgba(255,255,255,0.1); }
        .provider-name { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; }
        .provider-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .huawei-icon { background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); }
        .aliyun-icon { background: linear-gradient(135deg, #ff6a00 0%, #ee5500 100%); }
        .sub-menu { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
        .sub-menu.active { max-height: 300px; }
        .sub-menu-item { padding: 10px 20px 10px 54px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.8); transition: all 0.3s; }
        .sub-menu-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .sub-menu-item.active { background: rgba(52, 152, 219, 0.2); color: #3498db; border-left: 3px solid #3498db; }
        .cloud-main-content { flex: 1; overflow-y: auto; padding: 30px; background: #f5f7fa; }
        .cloud-page-header { margin-bottom: 30px; }
        .cloud-page-title { font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .cloud-page-breadcrumb { font-size: 14px; color: #7f8c8d; }
        .cloud-content-page { display: none; }
        .cloud-content-page.active { display: block; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .stat-title { font-size: 14px; color: #7f8c8d; }
        .stat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
        .stat-value { font-size: 28px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .stat-footer { font-size: 12px; color: #95a5a6; }
        .data-table-container { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-top: 20px; }
        .table-title { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 20px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead { background: #f8f9fa; }
        .data-table th { padding: 12px; text-align: left; font-weight: 600; color: #2c3e50; font-size: 14px; border-bottom: 2px solid #e9ecef; }
        .data-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }
        .data-table tbody tr:hover { background: #f8f9fa; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .status-running { background: #d4edda; color: #155724; }
        .status-stopped { background: #f8d7da; color: #721c24; }
        .chart-container { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
        .chart-title { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 20px; }
    `;
    document.head.appendChild(style);
}

/**
 * 获取云平台HTML
 */
function getCloudPlatformHTML() {
    return `
        <div class="cloud-platform-container">
            <div class="cloud-sidebar">
                <div class="cloud-sidebar-header">
                    <h2><i class="fas fa-cloud"></i> 云平台管理</h2>
                </div>
                <div class="cloud-menu">
                    <div class="cloud-provider">
                        <div class="provider-header" onclick="toggleCloudProvider('huawei')">
                            <div class="provider-name">
                                <div class="provider-icon huawei-icon"><i class="fas fa-cloud"></i></div>
                                <span>华为云</span>
                            </div>
                            <i class="fas fa-chevron-down" id="huawei-arrow"></i>
                        </div>
                        <div class="sub-menu active" id="huawei-menu">
                            <div class="sub-menu-item active" onclick="switchCloudPage('huawei', 'overview')">
                                <i class="fas fa-chart-line"></i> 概览
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('huawei', 'vm')">
                                <i class="fas fa-server"></i> 虚拟机
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('huawei', 'host')">
                                <i class="fas fa-desktop"></i> 云主机
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('huawei', 'storage')">
                                <i class="fas fa-database"></i> 云存储
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('huawei', 'monitor')">
                                <i class="fas fa-chart-area"></i> 监控告警
                            </div>
                        </div>
                    </div>
                    <div class="cloud-provider">
                        <div class="provider-header" onclick="toggleCloudProvider('aliyun')">
                            <div class="provider-name">
                                <div class="provider-icon aliyun-icon"><i class="fas fa-cloud"></i></div>
                                <span>阿里云</span>
                            </div>
                            <i class="fas fa-chevron-down" id="aliyun-arrow"></i>
                        </div>
                        <div class="sub-menu" id="aliyun-menu">
                            <div class="sub-menu-item" onclick="switchCloudPage('aliyun', 'overview')">
                                <i class="fas fa-chart-line"></i> 概览
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('aliyun', 'vm')">
                                <i class="fas fa-server"></i> 虚拟机
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('aliyun', 'host')">
                                <i class="fas fa-desktop"></i> 云主机
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('aliyun', 'storage')">
                                <i class="fas fa-database"></i> 云存储
                            </div>
                            <div class="sub-menu-item" onclick="switchCloudPage('aliyun', 'monitor')">
                                <i class="fas fa-chart-area"></i> 监控告警
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cloud-main-content">
                <div class="cloud-page-header">
                    <h1 class="cloud-page-title" id="cloudPageTitle">华为云 - 概览</h1>
                    <div class="cloud-page-breadcrumb"><span id="cloudBreadcrumb">云平台 / 华为云 / 概览</span></div>
                </div>
                <div class="cloud-content-page active" id="huawei-overview">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-title">总实例数</span>
                                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                    <i class="fas fa-server"></i>
                                </div>
                            </div>
                            <div class="stat-value" id="hw-total-instances">0</div>
                            <div class="stat-footer">运行中: <span id="hw-running-instances">0</span></div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-title">CPU总核数</span>
                                <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                    <i class="fas fa-microchip"></i>
                                </div>
                            </div>
                            <div class="stat-value" id="hw-total-cpu">0</div>
                            <div class="stat-footer">核心</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-title">内存总量</span>
                                <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                                    <i class="fas fa-memory"></i>
                                </div>
                            </div>
                            <div class="stat-value" id="hw-total-memory">0</div>
                            <div class="stat-footer">GB</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-title">存储总量</span>
                                <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                                    <i class="fas fa-hdd"></i>
                                </div>
                            </div>
                            <div class="stat-value" id="hw-total-storage">0</div>
                            <div class="stat-footer">GB</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h3 class="chart-title">资源使用情况</h3>
                        <div id="hwResourceChart" style="width: 100%; height: 300px;"></div>
                    </div>
                    <div class="data-table-container">
                        <h3 class="table-title">最近告警</h3>
                        <table class="data-table" id="hw-alert-table">
                            <thead>
                                <tr><th>告警时间</th><th>资源名称</th><th>告警级别</th><th>告警信息</th><th>状态</th></tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div class="cloud-content-page" id="huawei-vm"><h2>华为云虚拟机管理</h2><p>虚拟机列表...</p></div>
                <div class="cloud-content-page" id="huawei-host"><h2>华为云云主机管理</h2><p>云主机列表...</p></div>
                <div class="cloud-content-page" id="huawei-storage"><h2>华为云存储管理</h2><p>存储资源...</p></div>
                <div class="cloud-content-page" id="huawei-monitor"><h2>华为云监控告警</h2><p>监控数据...</p></div>
                <div class="cloud-content-page" id="aliyun-overview"><h2>阿里云概览</h2><p>阿里云资源概览...</p></div>
                <div class="cloud-content-page" id="aliyun-vm"><h2>阿里云虚拟机管理</h2><p>虚拟机列表...</p></div>
                <div class="cloud-content-page" id="aliyun-host"><h2>阿里云云主机管理</h2><p>云主机列表...</p></div>
                <div class="cloud-content-page" id="aliyun-storage"><h2>阿里云存储管理</h2><p>存储资源...</p></div>
                <div class="cloud-content-page" id="aliyun-monitor"><h2>阿里云监控告警</h2><p>监控数据...</p></div>
            </div>
        </div>
    `;
}

function toggleCloudProvider(provider) {
    const menu = document.getElementById(provider + '-menu');
    const arrow = document.getElementById(provider + '-arrow');
    if (menu && arrow) {
        menu.classList.toggle('active');
        arrow.classList.toggle('fa-chevron-down');
        arrow.classList.toggle('fa-chevron-up');
    }
}

function switchCloudPage(provider, page) {
    console.log(`切换到: ${provider} - ${page}`);
    currentCloudProvider = provider;
    currentCloudPage = page;
    
    document.querySelectorAll('.cloud-content-page').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(`${provider}-${page}`);
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.sub-menu-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    const providerName = provider === 'huawei' ? '华为云' : '阿里云';
    const pageNames = { 'overview': '概览', 'vm': '虚拟机', 'host': '云主机', 'storage': '云存储', 'monitor': '监控告警' };
    
    const titleEl = document.getElementById('cloudPageTitle');
    const breadcrumbEl = document.getElementById('cloudBreadcrumb');
    if (titleEl) titleEl.textContent = `${providerName} - ${pageNames[page]}`;
    if (breadcrumbEl) breadcrumbEl.textContent = `云平台 / ${providerName} / ${pageNames[page]}`;
    
    if (page === 'overview') loadCloudOverviewData(provider);
}

async function loadCloudOverviewData(provider) {
    console.log(`加载${provider}概览数据...`);
    const stats = provider === 'huawei' ? 
        { totalInstances: 5, runningInstances: 4, totalCpuCores: 20, totalMemoryGb: 38, totalStorageGb: 1800 } :
        { totalInstances: 6, runningInstances: 5, totalCpuCores: 24, totalMemoryGb: 48, totalStorageGb: 3200 };
    
    const prefix = provider === 'huawei' ? 'hw' : 'ali';
    const els = {
        total: document.getElementById(`${prefix}-total-instances`),
        running: document.getElementById(`${prefix}-running-instances`),
        cpu: document.getElementById(`${prefix}-total-cpu`),
        memory: document.getElementById(`${prefix}-total-memory`),
        storage: document.getElementById(`${prefix}-total-storage`)
    };
    
    if (els.total) els.total.textContent = stats.totalInstances;
    if (els.running) els.running.textContent = stats.runningInstances;
    if (els.cpu) els.cpu.textContent = stats.totalCpuCores;
    if (els.memory) els.memory.textContent = stats.totalMemoryGb;
    if (els.storage) els.storage.textContent = stats.totalStorageGb;
    
    // 加载告警列表
    const tableBody = document.querySelector(`#${prefix}-alert-table tbody`);
    if (tableBody) {
        const alert = provider === 'huawei' ?
            { alertTime: '2025-11-23 22:30:00', resourceName: '数据库服务器', alertLevel: 'warning', alertMessage: '内存使用率持续5分钟超过85%', status: 'active' } :
            { alertTime: '2025-11-23 20:15:00', resourceName: 'MongoDB数据库', alertLevel: 'warning', alertMessage: '内存使用率持续5分钟超过85%', status: 'resolved' };
        
        tableBody.innerHTML = `
            <tr>
                <td>${alert.alertTime}</td>
                <td>${alert.resourceName}</td>
                <td><span class="status-badge" style="background: #fff3cd;">${alert.alertLevel}</span></td>
                <td>${alert.alertMessage}</td>
                <td><span class="status-badge ${alert.status === 'active' ? 'status-running' : 'status-stopped'}">
                    ${alert.status === 'active' ? '活跃' : '已解决'}
                </span></td>
            </tr>
        `;
    }
}

// 暴露到全局
window.showCloudPlatformInMainContent = showCloudPlatformInMainContent;
window.toggleCloudProvider = toggleCloudProvider;
window.switchCloudPage = switchCloudPage;
