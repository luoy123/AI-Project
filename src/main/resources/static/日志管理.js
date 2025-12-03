// 日志管理页面JavaScript

// 全局变量
let currentTab = 'syslog';
let currentPage = 1;
let pageSize = 15;
let logData = [];
let charts = {};
let currentEventIds = []; // 当前选择的事件ID列表
let currentRuleIds = []; // 当前选择的规则ID列表
let currentDeviceTypes = []; // 当前选择的设备类型列表

// 设备类型定义（业务层面的设备分类）
const DEVICE_TYPES = {
    'SERVER': '服务器',
    'NETWORK': '网络设备',
    'STORAGE': '存储设备',
    'VIDEO': '视频设备'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('日志管理页面加载完成');
    
    // 检查URL参数或默认显示syslog页面
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const defaultTab = tabFromUrl || 'syslog'; // 始终默认显示syslog页面
    
    console.log('加载页面:', tabFromUrl ? `URL指定页面: ${tabFromUrl}` : '默认页面: syslog');
    
    // 加载对应的内容
    loadTabContent(defaultTab);
    
    // 延迟初始化树形导航，确保内容已加载
    setTimeout(() => {
        initializeTreeNavigation();
        // 确保主导航正常工作
        initializeMainNavigation();
    }, 100);
});

// 初始化树形导航
function initializeTreeNavigation() {
    // 只选择日志管理页面内部的导航元素，避免影响主导航
    const nodeItems = document.querySelectorAll('.log-tree .node-item');
    
    nodeItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有选中状态
            nodeItems.forEach(node => node.classList.remove('selected'));
            // 添加当前选中状态
            this.classList.add('selected');
            
            // 获取节点文本并映射到对应的标签页
            const nodeText = this.querySelector('.node-text').textContent;
            const tabName = mapNodeTextToTab(nodeText);
            
            console.log('点击节点:', nodeText, '映射到标签页:', tabName);
            loadTabContent(tabName);
        });
    });
}

// 将节点文本映射到标签页名称
function mapNodeTextToTab(nodeText) {
    const mapping = {
        'Syslog日志': 'syslog',
        'Syslog配置': 'config',
        '日志统计': 'statistics',
        '日志过滤': 'filtering'
    };
    return mapping[nodeText] || 'syslog';
}

// 获取当前应用的context path
function getContextPath() {
    const path = window.location.pathname;
    // 如果路径以/api开头，则context path是/api
    if (path.startsWith('/api')) {
        return '/api';
    }
    return '';
}

// 初始化主导航
function initializeMainNavigation() {
    console.log('初始化主导航...');
    
    const contextPath = getContextPath();
    console.log('检测到的context path:', contextPath);
    
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log('找到主导航元素数量:', sidebarItems.length);
    
    sidebarItems.forEach(item => {
        // 检查是否已经有点击事件监听器
        const hasListener = item.hasAttribute('data-nav-initialized');
        
        if (!hasListener) {
            item.setAttribute('data-nav-initialized', 'true');
            
            item.addEventListener('click', function(e) {
                // 防止事件冒泡
                e.stopPropagation();
                
                const itemText = this.querySelector('span').textContent;
                console.log('主导航点击:', itemText);
                
                // 移除所有active状态
                sidebarItems.forEach(si => si.classList.remove('active'));
                // 添加当前active状态
                this.classList.add('active');
                
                // 根据点击的项目进行导航（自动适配context-path）
                switch(itemText) {
                    case '总览':
                        window.location.href = contextPath + '/';
                        break;
                    case '设备管理':
                        window.location.href = contextPath + '/设备管理.html';
                        break;
                    case '告警中心':
                        window.location.href = contextPath + '/告警中心.html';
                        break;
                    case '网络拓扑':
                        window.location.href = contextPath + '/网络拓扑.html';
                        break;
                    case '统计报表':
                        window.location.href = contextPath + '/统计报表.html';
                        break;
                    case '运维工具':
                        window.location.href = contextPath + '/运维工具.html';
                        break;
                    case '网络管理':
                        window.location.href = contextPath + '/网络管理.html';
                        break;
                    case '视频管理':
                        window.location.href = contextPath + '/视频管理.html';
                        break;
                    case '机房管理':
                        window.location.href = contextPath + '/机房管理.html';
                        break;
                    case '资产管理':
                        window.location.href = contextPath + '/资产管理.html';
                        break;
                    case '运维管理':
                        window.location.href = contextPath + '/运维管理.html';
                        break;
                    case 'CMDB':
                        window.location.href = contextPath + '/CMDB.html';
                        break;
                    case '智能预测管理':
                        window.location.href = contextPath + '/智能预测管理.html';
                        break;
                    case '云平台':
                        window.location.href = contextPath + '/大屏展示.html';
                        break;
                    case '设置':
                        window.location.href = contextPath + '/设置.html';
                        break;
                    case '对接配置':
                        window.location.href = contextPath + '/对接配置.html';
                        break;
                    case '视图':
                        window.location.href = contextPath + '/视图.html';
                        break;
                    case '业务管理':
                        window.location.href = contextPath + '/业务管理.html';
                        break;
                    case '日志管理':
                        // 当前页面，不需要跳转
                        console.log('当前已在日志管理页面');
                        break;
                    default:
                        console.log('导航到:', itemText);
                        window.location.href = contextPath + '/' + itemText + '.html';
                }
            });
        }
    });
    
    console.log('主导航初始化完成');
}

// 切换标签页（已废弃，使用树形导航）
function switchTab(tabName) {
    currentTab = tabName;
    loadTabContent(tabName);
}

// 加载标签页内容
function loadTabContent(tabName) {
    console.log('加载标签页内容:', tabName);
    
    // 更新当前标签页状态（不保存到localStorage）
    currentTab = tabName;
    
    try {
        switch(tabName) {
            case 'syslog':
                console.log('开始加载Syslog内容');
                loadSyslogContent();
                console.log('Syslog内容加载完成');
                break;
            case 'config':
                console.log('开始加载Config内容');
                loadConfigContent();
                break;
            case 'statistics':
                console.log('开始加载Statistics内容');
                loadStatisticsContent();
                break;
            case 'filtering':
                console.log('开始加载Filtering内容');
                loadFilteringContent();
                break;
            default:
                console.error('未知的标签页:', tabName);
        }
    } catch (error) {
        console.error('加载标签页内容时发生错误:', error);
    }
}

// 加载Syslog日志内容
function loadSyslogContent() {
    // 检查是否有保存的过滤器，如果有则不清除状态
    const hasAppliedFilter = typeof getAppliedFilter === 'function' && getAppliedFilter();
    
    if (!hasAppliedFilter) {
        console.log('没有保存的过滤器，清除过滤状态');
        // 清除过滤模式标记
        window.currentFilterMode = null;
        
        // 清空事件ID过滤
        currentEventIds = [];
        
        // 清空设备类型过滤
        currentDeviceTypes = [];
    } else {
        console.log('检测到保存的过滤器，保持过滤状态');
    }
    
    const content = `
        <!-- 工具栏 -->
        <div class="toolbar-enhanced" style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 20px; margin-bottom: 20px;">
            <!-- 第一行：筛选条件 -->
            <div class="toolbar-row" style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 16px;">
                <div class="toolbar-filters" style="display: flex; align-items: flex-end; gap: 16px; flex: 1; flex-wrap: wrap;">
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 8px; min-width: 140px;">
                        <label class="filter-label" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569;">
                            <i class="fas fa-clock" style="font-size: 12px; color: #64748b;"></i>
                            时间范围
                        </label>
                        <select id="timeRange" class="form-control-modern" style="height: 38px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <option value="today">今天</option>
                            <option value="week" selected>最近7天</option>
                            <option value="month">最近30天</option>
                            <option value="custom">自定义</option>
                        </select>
                        <div id="customTimeRange" class="custom-time-range" style="display: none; gap: 8px; margin-top: 8px;">
                            <input type="datetime-local" id="startTime" class="form-control-modern" style="flex: 1; min-width: 160px;">
                            <span style="font-size: 13px; color: #64748b;">至</span>
                            <input type="datetime-local" id="endTime" class="form-control-modern" style="flex: 1; min-width: 160px;">
                        </div>
                    </div>
                    
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 8px; min-width: 140px;">
                        <label class="filter-label" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569;">
                            <i class="fas fa-server" style="font-size: 12px; color: #64748b;"></i>
                            设备类型
                        </label>
                        <select id="deviceTypeFilter" class="form-control-modern" style="height: 38px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <option value="">全部设备</option>
                            <option value="server">服务器</option>
                            <option value="network">网络设备</option>
                            <option value="storage">存储设备</option>
                            <option value="video">视频设备</option>
                        </select>
                    </div>
                    
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 8px; min-width: 160px;">
                        <label class="filter-label" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569;">
                            <i class="fas fa-filter" style="font-size: 12px; color: #64748b;"></i>
                            匹配规则
                        </label>
                        <select id="ruleFilter" class="form-control-modern" style="height: 38px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <option value="">全部规则</option>
                            <!-- 动态加载规则列表 -->
                        </select>
                    </div>
                    
                    <div class="filter-group search-group" style="display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 250px; max-width: 400px;">
                        <label class="filter-label" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569;">
                            <i class="fas fa-search" style="font-size: 12px; color: #64748b;"></i>
                            关键字搜索
                        </label>
                        <div class="search-input-modern" style="position: relative; display: flex; align-items: center;">
                            <input type="text" id="searchKeyword" placeholder="IP地址、主机名或内容..." class="form-control-modern" style="width: 100%; padding-right: 36px; height: 38px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155;">
                            <button class="search-clear-btn" id="clearSearchBtn" style="display: none; position: absolute; right: 8px; width: 24px; height: 24px; border: none; background: #e2e8f0; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-times" style="font-size: 10px; color: #64748b;"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="toolbar-actions" style="display: flex; gap: 12px; align-items: center; align-self: flex-end; margin-bottom: 0;">
                    <button class="btn-modern btn-search" id="searchBtn" title="应用筛选条件" style="height: 38px; padding: 0 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <i class="fas fa-search" style="font-size: 14px;"></i>
                        <span>搜索</span>
                    </button>
                    <button class="btn-modern btn-export" id="exportBtn" title="导出日志" style="height: 38px; padding: 0 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <i class="fas fa-download" style="font-size: 14px;"></i>
                        <span>导出</span>
                    </button>
                    <button class="btn-modern btn-reset" id="resetBtn" title="重置所有筛选条件" style="height: 38px; padding: 0 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <i class="fas fa-redo" style="font-size: 14px;"></i>
                        <span>重置</span>
                    </button>
                </div>
            </div>
            
            <!-- 第二行：严重程度筛选 -->
            <div class="toolbar-row" style="display: flex; align-items: center;">
                <div class="severity-filter-section" style="display: flex; align-items: center; gap: 16px; flex: 1;">
                    <label class="filter-label" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569;">
                        <i class="fas fa-exclamation-circle" style="font-size: 12px; color: #64748b;"></i>
                        严重程度
                    </label>
                    <div class="severity-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="severity-btn-modern active" data-severity="all" style="height: 34px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: #3b82f6; color: white; font-size: 13px; font-weight: 500; cursor: pointer; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">全部</button>
                        <button class="severity-btn-modern severity-0" data-severity="0" style="height: 34px; padding: 0 14px; border: 1px solid #dc2626; border-radius: 6px; background: #ffffff; color: #dc2626; font-size: 13px; font-weight: 500; cursor: pointer;">紧急</button>
                        <button class="severity-btn-modern severity-1" data-severity="1" style="height: 34px; padding: 0 14px; border: 1px solid #ea580c; border-radius: 6px; background: #ffffff; color: #ea580c; font-size: 13px; font-weight: 500; cursor: pointer;">告警</button>
                        <button class="severity-btn-modern severity-2" data-severity="2" style="height: 34px; padding: 0 14px; border: 1px solid #f59e0b; border-radius: 6px; background: #ffffff; color: #f59e0b; font-size: 13px; font-weight: 500; cursor: pointer;">严重</button>
                        <button class="severity-btn-modern severity-3" data-severity="3" style="height: 34px; padding: 0 14px; border: 1px solid #ef4444; border-radius: 6px; background: #ffffff; color: #ef4444; font-size: 13px; font-weight: 500; cursor: pointer;">错误</button>
                        <button class="severity-btn-modern severity-4" data-severity="4" style="height: 34px; padding: 0 14px; border: 1px solid #f97316; border-radius: 6px; background: #ffffff; color: #f97316; font-size: 13px; font-weight: 500; cursor: pointer;">警告</button>
                        <button class="severity-btn-modern severity-5" data-severity="5" style="height: 34px; padding: 0 14px; border: 1px solid #06b6d4; border-radius: 6px; background: #ffffff; color: #06b6d4; font-size: 13px; font-weight: 500; cursor: pointer;">通知</button>
                        <button class="severity-btn-modern severity-6" data-severity="6" style="height: 34px; padding: 0 14px; border: 1px solid #10b981; border-radius: 6px; background: #ffffff; color: #10b981; font-size: 13px; font-weight: 500; cursor: pointer;">信息</button>
                        <button class="severity-btn-modern severity-7" data-severity="7" style="height: 34px; padding: 0 14px; border: 1px solid #8b5cf6; border-radius: 6px; background: #ffffff; color: #8b5cf6; font-size: 13px; font-weight: 500; cursor: pointer;">调试</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-container">
            <table class="data-table" id="logTable">
                <thead>
                    <tr>
                        <th>事件时间</th>
                        <th>数据来源</th>
                        <th>主机名</th>
                        <th>设备类型</th>
                        <th>严重程度</th>
                        <th>匹配规则</th>
                        <th>日志内容</th>
                    </tr>
                </thead>
                <tbody id="logTableBody">
                    <!-- 动态加载 -->
                </tbody>
            </table>
            
            <!-- 分页 -->
            <div class="pagination-container" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #ffffff; border-radius: 0 0 12px 12px; margin-top: -1px; border-top: 1px solid #e2e8f0;">
                <div class="pagination-info" style="color: #64748b; font-size: 14px;">
                    <i class="fas fa-info-circle" style="margin-right: 6px; color: #3b82f6;"></i>
                    <span id="paginationInfo">显示 1-15 条，共 0 条记录</span>
                </div>
                <div class="pagination-controls" style="display: flex; align-items: center; gap: 8px;">
                    <button id="prevPageBtn" class="pagination-btn" style="padding: 8px 16px; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-chevron-left" style="font-size: 12px;"></i>
                        <span>上一页</span>
                    </button>
                    <span id="pageNumbers" style="display: flex; gap: 6px;"></span>
                    <button id="nextPageBtn" class="pagination-btn" style="padding: 8px 16px; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;">
                        <span>下一页</span>
                        <i class="fas fa-chevron-right" style="font-size: 12px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 替换右侧主要内容区域
    const logMain = document.querySelector('.log-main');
    if (logMain) {
        logMain.innerHTML = content;
        
        // 绑定事件
        bindSyslogEvents();
        
        // 延迟加载匹配规则列表（确保DOM已经渲染）
        setTimeout(async () => {
            await loadSyslogRulesList();
            
            // 加载规则列表后，检查是否有持久化过滤器
            setTimeout(() => {
                const persistentFilter = localStorage.getItem('syslogPersistentFilter');
                if (persistentFilter) {
                    try {
                        const filterData = JSON.parse(persistentFilter);
                        console.log('✅ 检测到持久化过滤器，自动应用:', filterData);
                        
                        // 应用持久化过滤器（直接设置全局变量）
                        if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
                            window.currentDeviceTypes = filterData.deviceTypes;
                            currentDeviceTypes = filterData.deviceTypes;
                        }
                        if (filterData.severities && filterData.severities.length > 0) {
                            window.currentSeverities = filterData.severities;
                        }
                        if (filterData.eventIds && filterData.eventIds.length > 0) {
                            window.currentEventIds = filterData.eventIds;
                            currentEventIds = filterData.eventIds;
                        }
                        if (filterData.ruleIds && filterData.ruleIds.length > 0) {
                            currentRuleIds = filterData.ruleIds;
                        }
                        
                        loadSyslogData();
                    } catch (error) {
                        console.error('应用持久化过滤器失败:', error);
                        loadSyslogData();
                    }
                } else {
                    console.log('没有持久化过滤器，加载默认数据');
                    loadSyslogData();
                }
            }, 200);
        }, 100);
        
        // 检查是否有从统计页面跳转过来的临时过滤器
        setTimeout(() => {
            const appliedFilter = localStorage.getItem('appliedFilter');
            if (appliedFilter) {
                try {
                    const filterData = JSON.parse(appliedFilter);
                    console.log('检测到临时过滤器（来自统计页面）:', filterData);
                    
                    // 使用安全的过滤器应用函数
                    if (typeof applySyslogFilters === 'function') {
                        applySyslogFilters(filterData);
                    }
                } catch (error) {
                    console.error('应用临时过滤器失败:', error);
                }
            } else if (window.statisticsTimeRange) {
                console.log('检测到统计页面时间范围:', window.statisticsTimeRange);
                if (typeof syncTimeRangeToSyslog === 'function') {
                    syncTimeRangeToSyslog(window.statisticsTimeRange);
                }
            }
        }, 500);
    }
}

// 检查并应用已保存的过滤器函数已移除，避免循环
// 用户需要手动应用过滤器

// 恢复过滤变量状态
function restoreFilterVariables(filterData) {
    console.log('恢复过滤变量状态:', filterData);
    
    // 恢复设备类型过滤
    if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
        if (typeof currentDeviceTypes !== 'undefined') {
            currentDeviceTypes = [...filterData.deviceTypes];
            console.log('恢复currentDeviceTypes:', currentDeviceTypes);
        }
    }
    
    // 恢复事件ID过滤
    if (filterData.eventIds && filterData.eventIds.length > 0) {
        if (typeof currentEventIds !== 'undefined') {
            currentEventIds = [...filterData.eventIds];
            console.log('恢复currentEventIds:', currentEventIds);
        }
    }
    
    // 恢复过滤模式
    if (filterData.facilities || filterData.eventIds || filterData.severities) {
        window.currentFilterMode = 'applied';
        console.log('恢复过滤模式标记');
    }
}

// 只应用过滤器UI状态，不重复保存
function applyFilterUIOnly(filterData) {
    console.log('应用过滤器UI状态:', filterData);
    
    // 设置时间范围
    if (filterData.timeRange) {
        const timeRangeSelect = document.getElementById('timeRange');
        console.log('恢复时间范围:', filterData.timeRange, '到元素:', timeRangeSelect);
        if (timeRangeSelect) {
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
        const searchInput = document.getElementById('searchKeyword');
        if (searchInput) {
            searchInput.value = filterData.keyword;
        }
    }
    
    // 设置严重性过滤
    if (filterData.severities && filterData.severities.length > 0) {
        console.log('应用严重性过滤:', filterData.severities);
        // 清除所有严重性按钮的active状态
        document.querySelectorAll('.severity-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 激活对应的严重性按钮
        filterData.severities.forEach(severity => {
            const severityBtn = document.querySelector(`[data-severity="${severity}"]`);
            console.log('查找严重性按钮:', severity, '找到:', severityBtn);
            if (severityBtn) {
                severityBtn.classList.add('active');
                console.log('激活严重性按钮:', severity);
            }
        });
        
        // 验证激活状态
        const activeButtons = document.querySelectorAll('.severity-btn.active');
        console.log('当前激活的严重性按钮:', activeButtons);
    }
    
    // 设置设备类型过滤
    if (filterData.deviceTypes && filterData.deviceTypes.length > 0) {
        if (typeof currentDeviceTypes !== 'undefined') {
            currentDeviceTypes = [...filterData.deviceTypes];
        }
    }
    
    // 设置事件ID过滤
    if (filterData.eventIds && filterData.eventIds.length > 0) {
        if (typeof currentEventIds !== 'undefined') {
            currentEventIds = [...filterData.eventIds];
        }
    }
    
    // 设置自定义时间范围
    if (filterData.timeRange === 'custom' && filterData.startTime && filterData.endTime) {
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        if (startTimeInput && endTimeInput) {
            startTimeInput.value = filterData.startTime;
            endTimeInput.value = filterData.endTime;
            
            // 显示自定义时间范围
            const customRange = document.getElementById('customTimeRange');
            if (customRange) {
                customRange.style.display = 'flex';
            }
        }
    }
    
    // 显示过滤器应用提示
    showFilterAppliedNotification(filterData);
    
    // 自动重新加载数据以应用过滤器
    setTimeout(() => {
        console.log('自动重新加载数据以应用过滤器');
        if (typeof loadSyslogData === 'function') {
            loadSyslogData();
        }
    }, 100);
}

// 显示过滤器应用提示
function showFilterAppliedNotification(filterData) {
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>已自动应用过滤器</span>
        <button onclick="clearAppliedFilter(); this.parentElement.remove(); location.reload();" class="clear-filter-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加样式
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
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    `;
    
    // 清除按钮样式
    const clearBtn = notification.querySelector('.clear-filter-btn');
    if (clearBtn) {
        clearBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
    }
    
    document.body.appendChild(notification);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}


// 绑定Syslog页面事件
function bindSyslogEvents() {
    // 时间范围变更 - 只显示/隐藏自定义时间范围，不自动加载数据
    const timeRangeEl = document.getElementById('timeRange');
    if (timeRangeEl) {
        timeRangeEl.addEventListener('change', function() {
            const customRange = document.getElementById('customTimeRange');
            if (this.value === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
            }
            console.log('时间范围已变更（等待搜索按钮点击）');
            // 不自动触发，等待用户点击搜索按钮
        });
    }
    
    // 搜索框回车事件 - 触发搜索按钮点击
    const searchKeyword = document.getElementById('searchKeyword');
    if (searchKeyword) {
        searchKeyword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // 触发搜索按钮点击
                const searchBtn = document.getElementById('searchBtn');
                if (searchBtn) {
                    searchBtn.click();
                }
            }
        });
    }
    
    // 设备类型筛选 - 移除自动筛选，改为点击搜索按钮触发
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    if (deviceTypeFilter) {
        console.log('设备类型筛选器已绑定（等待搜索按钮点击）');
        // 不自动触发，等待用户点击搜索按钮
    }
    
    // 匹配规则筛选 - 移除自动筛选，改为点击搜索按钮触发
    const ruleFilter = document.getElementById('ruleFilter');
    if (ruleFilter) {
        console.log('匹配规则筛选器已绑定（等待搜索按钮点击）');
        // 不自动触发，等待用户点击搜索按钮
    }
    
    // 搜索框输入事件（显示/隐藏清除按钮）
    const searchKeywordInput = document.getElementById('searchKeyword');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchKeywordInput && clearSearchBtn) {
        searchKeywordInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });
        
        // 清除搜索
        clearSearchBtn.addEventListener('click', function() {
            searchKeywordInput.value = '';
            clearSearchBtn.style.display = 'none';
            currentPage = 1;
            loadSyslogData();
        });
    }
    
    // 严重性过滤 - 只更新UI状态，不自动加载数据
    document.querySelectorAll('.severity-btn-modern').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.severity-btn-modern').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log('严重程度已选择:', this.dataset.severity, '（等待搜索按钮点击）');
            // 不自动触发，等待用户点击搜索按钮
        });
    });
    
    // 导出
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSyslogData);
    }
    
    // 搜索按钮 - 应用所有筛选条件
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            console.log('点击搜索按钮，应用所有筛选条件');
            
            // 收集所有筛选条件
            const deviceType = document.getElementById('deviceTypeFilter')?.value || '';
            const ruleId = document.getElementById('ruleFilter')?.value || '';
            
            // 收集严重程度选择
            const activeSeverityBtn = document.querySelector('.severity-btn-modern.active');
            const selectedSeverity = activeSeverityBtn?.dataset?.severity || 'all';
            
            console.log('当前筛选条件:', {
                deviceType: deviceType,
                ruleId: ruleId,
                severity: selectedSeverity,
                timeRange: document.getElementById('timeRange')?.value,
                keyword: document.getElementById('searchKeyword')?.value
            });
            
            // 设置规则ID过滤
            if (ruleId) {
                currentRuleIds = [parseInt(ruleId)];
            } else {
                currentRuleIds = [];
            }
            
            // 设置设备类型过滤
            if (deviceType) {
                currentDeviceTypes = [deviceType.toUpperCase()];
            } else {
                currentDeviceTypes = [];
            }
            
            // 设置严重程度过滤
            if (selectedSeverity && selectedSeverity !== 'all') {
                window.currentSeverities = [selectedSeverity];
            } else {
                window.currentSeverities = [];
            }
            
            console.log('应用后的过滤器:', {
                currentRuleIds: currentRuleIds,
                currentDeviceTypes: currentDeviceTypes,
                currentSeverities: window.currentSeverities
            });
            
            // 重置到第一页
            currentPage = 1;
            loadSyslogData();
        });
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('重置所有筛选条件');
            temporaryResetFilters();
        });
    }
    
    // 分页按钮
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
        console.log('绑定上一页按钮事件');
        prevPageBtn.addEventListener('click', function() {
            console.log('点击上一页，当前页:', currentPage);
            if (currentPage > 1) {
                currentPage--;
                console.log('切换到页面:', currentPage);
                loadSyslogData();
            }
        });
    } else {
        console.error('找不到上一页按钮，无法绑定事件');
    }
    
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
        console.log('绑定下一页按钮事件');
        nextPageBtn.addEventListener('click', function() {
            console.log('点击下一页，当前页:', currentPage, '按钮禁用状态:', this.disabled);
            // 检查按钮是否被禁用
            if (!this.disabled) {
                currentPage++;
                console.log('切换到页面:', currentPage);
                loadSyslogData();
            }
        });
    } else {
        console.error('找不到下一页按钮，无法绑定事件');
    }
}

// 加载Syslog数据
async function loadSyslogData() {
    console.log('=== 开始加载Syslog数据 ===');
    try {
        showLoading();
        const params = buildQueryParams();
        console.log('请求参数:', params);
        console.log('请求URL:', `/api/logs/syslog?${params}`);
        console.log('当前页:', currentPage, '页面大小:', pageSize);
        
        const response = await fetch(`/api/logs/syslog?${params}`);
        console.log('响应状态:', response.status);
        
        const result = await response.json();
        console.log('响应数据:', result);
        console.log('响应数据结构:', {
            success: result.code === 200,
            data: result.data,
            dataType: typeof result.data,
            records: result.data?.records,
            recordsLength: result.data?.records?.length,
            total: result.data?.total,
            current: result.data?.current,
            size: result.data?.size
        });
        
        if (result.code === 200) {
            console.log('日志记录数:', result.data?.records?.length || 0);
            console.log('分页数据详情:', {
                current: result.data?.current,
                size: result.data?.size,
                total: result.data?.total,
                pages: result.data?.pages
            });
            if (result.data?.records?.length > 0) {
                console.log('第一条日志:', result.data.records[0]);
            }
            renderSyslogTable(result.data.records);
            updatePagination(result.data);
        } else {
            console.error('API返回错误:', result.message);
            showError('加载日志数据失败: ' + result.message);
        }
    } catch (error) {
        console.error('请求异常:', error);
        showError('加载日志数据失败，请重试');
    } finally {
        hideLoading();
    }
}

// 构建查询参数
function buildQueryParams() {
    const params = new URLSearchParams();
    
    // 分页（必需参数）
    params.append('page', currentPage);
    params.append('pageSize', pageSize);
    
    // 时间范围
    const timeRangeEl = document.getElementById('timeRange');
    if (timeRangeEl) {
        const timeRange = timeRangeEl.value;
        console.log('选择的时间范围:', timeRange);
        const { startTime, endTime } = getTimeRange(timeRange);
        console.log('获取的时间对象:', { startTime, endTime });
        
        if (startTime) {
            // 转换为本地时间字符串格式
            const startTimeStr = toLocalISOString(startTime);
            console.log('开始时间字符串:', startTimeStr);
            if (startTimeStr) {
                params.append('startTime', startTimeStr);
            }
        }
        if (endTime) {
            // 转换为本地时间字符串格式
            const endTimeStr = toLocalISOString(endTime);
            console.log('结束时间字符串:', endTimeStr);
            if (endTimeStr) {
                params.append('endTime', endTimeStr);
            }
        }
    }
    
    // 关键字
    const keywordEl = document.getElementById('searchKeyword');
    if (keywordEl) {
        const keyword = keywordEl.value.trim();
        if (keyword) params.append('keyword', keyword);
    }
    
    // 来源IP地址（从高级过滤器）
    if (window.currentSourceIP) {
        // 后端期望的是sourceIps（复数），作为列表
        params.append('sourceIps', window.currentSourceIP);
        console.log('添加来源IP过滤参数:', window.currentSourceIP);
    }
    
    // 主机名（从高级过滤器）
    if (window.currentHostname) {
        params.append('hostname', window.currentHostname);
        console.log('添加主机名过滤参数:', window.currentHostname);
    }
    
    // 设备类型筛选（从UI下拉框获取）
    const deviceTypeEl = document.getElementById('deviceTypeFilter');
    const uiDeviceTypes = [];
    if (deviceTypeEl && deviceTypeEl.value) {
        uiDeviceTypes.push(deviceTypeEl.value);
        console.log('从UI获取设备类型过滤参数:', deviceTypeEl.value);
    }
    
    // 严重性（支持多选）
    const activeSeverityEls = document.querySelectorAll('.severity-btn.active');
    const severities = [];
    activeSeverityEls.forEach(el => {
        const severity = el.getAttribute('data-severity');
        if (severity && severity !== 'all') {
            severities.push(severity);
        }
    });
    
    // 如果没有从UI获取到严重性，则从全局变量获取（高级过滤器）
    if (severities.length === 0 && window.currentSeverities && window.currentSeverities.length > 0) {
        window.currentSeverities.forEach(severity => {
            severities.push(severity);
        });
        console.log('从全局变量获取严重性参数:', severities);
    }
    
    if (severities.length > 0) {
        severities.forEach(severity => {
            params.append('severities', severity);
        });
        console.log('添加严重性过滤参数:', severities);
    }
    
    // 检查是否是告警过滤模式
    if (window.currentFilterMode === 'alert') {
        params.append('alertOnly', 'true');
        console.log('添加告警过滤参数: alertOnly=true');
    }
    
    // 事件ID过滤
    if (currentEventIds && currentEventIds.length > 0) {
        currentEventIds.forEach(eventId => {
            params.append('eventIds', eventId);
        });
        console.log('添加事件ID过滤参数:', currentEventIds);
    }
    
    // 规则ID过滤
    if (currentRuleIds && currentRuleIds.length > 0) {
        currentRuleIds.forEach(ruleId => {
            params.append('ruleIds', ruleId);
        });
        console.log('添加规则ID过滤参数:', currentRuleIds);
    }
    
    // 设备类型过滤（合并UI选择和全局变量）
    let finalDeviceTypes = [];
    
    // 优先使用UI下拉框的选择
    if (uiDeviceTypes.length > 0) {
        finalDeviceTypes = uiDeviceTypes;
    }
    // 其次使用全局变量（从筛选页面传递的过滤条件）
    else if (window.currentDeviceTypes && window.currentDeviceTypes.length > 0) {
        finalDeviceTypes = window.currentDeviceTypes;
    }
    // 最后使用当前设备类型变量
    else if (currentDeviceTypes && currentDeviceTypes.length > 0) {
        finalDeviceTypes = currentDeviceTypes;
    }
    
    if (finalDeviceTypes.length > 0) {
        finalDeviceTypes.forEach(deviceType => {
            params.append('deviceTypes', deviceType);
        });
        console.log('添加设备类型过滤参数:', finalDeviceTypes);
    }
    
    console.log('构建的查询参数:', params.toString());
    return params.toString();
}

// 转换为本地时间字符串，避免时区问题
function toLocalISOString(date) {
    // 检查参数是否是有效的Date对象
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('toLocalISOString: 无效的Date对象', date);
        return null;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    // 使用ISO格式，后端转换器支持这种格式
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// 获取时间范围
function getTimeRange(range) {
    const now = new Date();
    let startTime, endTime;
    
    switch(range) {
        case 'today':
            // 今天：从今天0点到今天24点
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            console.log('syslog今天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case 'week':
            // 最近7天：从今天24点往前推7天
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            startTime = new Date(endTime);
            startTime.setDate(startTime.getDate() - 6); // 使用setDate方法正确处理跨月
            startTime.setHours(0, 0, 0, 0); // 设置为0点
            console.log('syslog最近7天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case 'month':
            // 最近30天：从今天24点往前推30天
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            startTime = new Date(endTime);
            startTime.setDate(startTime.getDate() - 29); // 使用setDate方法正确处理跨月
            startTime.setHours(0, 0, 0, 0); // 设置为0点
            console.log('syslog最近30天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case 'custom':
            const startInput = document.getElementById('startTime').value;
            const endInput = document.getElementById('endTime').value;
            if (startInput) startTime = new Date(startInput);
            if (endInput) endTime = new Date(endInput);
            break;
    }
    
    return {
        startTime: startTime,
        endTime: endTime
    };
}

// 格式化日期时间
function formatDateTime(date) {
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0') + ':' +
           String(date.getSeconds()).padStart(2, '0');
}

// 初始化过滤器
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的激活状态
            this.classList.add('active');
            
            const level = this.getAttribute('data-level');
            console.log('选择日志级别:', level);
            
            // 根据选择的级别过滤日志
            filterLogsByLevel(level);
        });
    });
}

// 初始化表格
function initializeTable() {
    // 这里可以添加表格初始化逻辑
    console.log('初始化日志表格');
    
    // 模拟加载数据
    loadLogData();
}

// 加载日志数据
function loadLogData() {
    // 模拟异步加载数据
    setTimeout(() => {
        console.log('日志数据加载完成');
        // 这里可以添加实际的数据加载逻辑
    }, 1000);
}

// 重置所有过滤条件（临时重置，不删除持久化过滤器）
function resetFilters() {
    console.log('⚠️ 临时重置所有过滤条件（持久化过滤器不受影响）');
    
    // 重置时间范围为默认值（最近7天）
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
        timeRangeSelect.value = 'week';
        
        // 隐藏自定义时间范围
        const customTimeRange = document.getElementById('customTimeRange');
        if (customTimeRange) {
            customTimeRange.style.display = 'none';
        }
    }
    
    // 清空搜索框
    const mainSearchInput = document.getElementById('mainSearchInput');
    if (mainSearchInput) {
        mainSearchInput.value = '';
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 清空关键字输入框
    const keywordInput = document.getElementById('keywordInput');
    if (keywordInput) {
        keywordInput.value = '';
    }
    
    // 重置设备类型选择
    const deviceTypeSelect = document.getElementById('deviceTypeFilter');
    if (deviceTypeSelect) {
        deviceTypeSelect.value = '';
    }
    
    // 重置严重程度按钮
    const severityButtons = document.querySelectorAll('.severity-btn-modern');
    severityButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    // 激活"全部"按钮
    const allSeverityBtn = document.querySelector('.severity-btn-modern[data-severity="all"]');
    if (allSeverityBtn) {
        allSeverityBtn.classList.add('active');
    }
    
    // 重置数据来源
    const sourceIpInput = document.getElementById('sourceIpInput');
    if (sourceIpInput) {
        sourceIpInput.value = '';
    }
    
    // 重置过滤器按钮状态为"全部"
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-level') === 'all') {
            btn.classList.add('active');
        }
    });
    
    // 清空全局过滤变量（临时清除，不删除localStorage）
    currentDeviceTypes = [];
    currentEventIds = [];
    currentRuleIds = [];
    window.currentDeviceTypes = [];
    window.currentEventIds = [];
    window.currentSeverities = null;
    
    // 同步清除localStorage中的持久化过滤器，避免重置后仍被自动应用
    localStorage.removeItem('syslogPersistentFilter');
    
    // 重置页码
    currentPage = 1;
    
    // 重新加载数据
    loadSyslogData();
}

// 过滤日志数据
function filterLogs(searchTerm) {
    console.log('过滤日志数据:', searchTerm);
    // 这里可以添加日志过滤逻辑
}

// 根据级别过滤日志
function filterLogsByLevel(level) {
    console.log('根据级别过滤日志:', level);
    
    // 这里可以添加根据日志级别过滤的逻辑
    switch(level) {
        case 'all':
            showAllLogs();
            break;
        case 'error':
            showErrorLogs();
            break;
        case 'warning':
            showWarningLogs();
            break;
        case 'info':
            showInfoLogs();
            break;
        case 'debug':
            showDebugLogs();
            break;
        default:
            showAllLogs();
    }
}

// 显示所有日志
function showAllLogs() {
    console.log('显示所有日志');
    // 这里可以添加显示所有日志的逻辑
}

// 显示错误日志
function showErrorLogs() {
    console.log('显示错误日志');
    // 这里可以添加显示错误日志的逻辑
}

// 显示警告日志
function showWarningLogs() {
    console.log('显示警告日志');
    // 这里可以添加显示警告日志的逻辑
}

// 显示信息日志
function showInfoLogs() {
    console.log('显示信息日志');
    // 这里可以添加显示信息日志的逻辑
}

// 显示调试日志
function showDebugLogs() {
    console.log('显示调试日志');
    // 这里可以添加显示调试日志的逻辑
}

// 加载所有日志
function loadAllLogs() {
    console.log('加载所有日志');
    // 这里可以添加加载所有日志的逻辑
}


// 加载Syslog配置
function loadSyslogConfig() {
    console.log('加载Syslog配置');
    // 这里可以添加加载Syslog配置的逻辑
}

// 加载日志统计
function loadLogStatistics() {
    console.log('加载日志统计');
    // 这里可以添加加载日志统计的逻辑
}

// 加载日志过滤器
function loadLogFilters() {
    console.log('加载日志过滤器');
    // 这里可以添加加载日志过滤器的逻辑
}


// 加载默认日志
function loadDefaultLogs() {
    console.log('加载默认日志');
    // 这里可以添加加载默认日志的逻辑
}

// 导出日志
function exportLogs() {
    console.log('导出日志');
    // 这里可以添加导出日志的逻辑
    alert('导出日志功能');
}

// 刷新日志
function refreshLogs() {
    console.log('刷新日志');
    // 这里可以添加刷新日志的逻辑
    
    // 显示加载状态
    showLoading();
    
    // 模拟刷新延迟
    setTimeout(() => {
        hideLoading();
        console.log('日志刷新完成');
    }, 1000);
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
    console.log('日志管理页面初始化完成');
    
    // 默认选中Syslog日志 - 这个逻辑已经在DOMContentLoaded中处理了
    console.log('页面初始化完成');
}

// 页面加载完成后执行初始化
setTimeout(initializePage, 100);

// 渲染Syslog表格
function renderSyslogTable(logs) {
    const tbody = document.getElementById('logTableBody');
    
    if (!tbody) {
        console.error('找不到表格体元素 logTableBody');
        return;
    }
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    const rows = logs.map(log => {
        const severityClass = getSeverityClass(log.severity);
        const severityText = getSeverityText(log.severity);
        const deviceTypeText = getDeviceTypeText(log.deviceType);
        
        return `
            <tr>
                <td>${formatLogTime(log.eventTime)}</td>
                <td>${log.sourceIp}</td>
                <td>${log.hostname || '-'}</td>
                <td>${deviceTypeText}</td>
                <td><span class="severity-badge ${severityClass}">${severityText}</span></td>
                <td>${log.ruleName ? `<span class="rule-badge">${log.ruleName}</span>` : '-'}</td>
                <td class="log-message">
                    <div class="log-content-wrapper">
                        <span class="log-text" title="${log.message}">${truncateMessage(log.message)}</span>
                        <button class="btn-view-log" onclick="showLogDetail('${escapeHtml(log.message)}', '${log.eventTime}', '${log.hostname || '-'}', '${log.sourceIp}')" title="查看完整日志">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// 辅助函数
function getSeverityClass(severity) {
    const severityMap = {
        0: 'severity-emergency',
        1: 'severity-alert', 
        2: 'severity-critical',
        3: 'severity-error',
        4: 'severity-warning',
        5: 'severity-notice',
        6: 'severity-info',
        7: 'severity-debug'
    };
    return severityMap[severity] || 'severity-info';
}

const DEVICE_TYPE_MAP = {
    'server': '服务器',
    'network': '网络设备',
    'storage': '存储设备',
    'video': '视频设备'
};

function getDeviceTypeText(deviceType) {
    if (!deviceType) return '-';
    return DEVICE_TYPE_MAP[deviceType] || deviceType;
}

function formatLogTime(timeStr) {
    if (!timeStr) return '-';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function truncateMessage(message, maxLength = 80) {
    if (!message) return '-';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
}

// HTML转义函数，防止XSS攻击
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 获取严重性文本
function getSeverityText(severity) {
    const texts = {
        0: '紧急',
        1: '告警',
        2: '严重',
        3: '错误', 
        4: '警告',
        5: '通知',
        6: '信息',
        7: '调试'
    };
    return texts[severity] || '未知';
}

// 加载Syslog页面的匹配规则列表（带重试机制）
async function loadSyslogRulesList(retryCount = 0) {
    try {
        console.log(`=== 开始加载匹配规则列表 (尝试 ${retryCount + 1}/3) ===`);
        
        // 先检查元素是否存在
        const ruleFilter = document.getElementById('ruleFilter');
        if (!ruleFilter) {
            console.warn('⚠️ ruleFilter元素还不存在，等待DOM加载...');
            if (retryCount < 3) {
                setTimeout(() => loadSyslogRulesList(retryCount + 1), 200);
                return;
            } else {
                console.error('❌ 找不到ruleFilter元素，已达到最大重试次数!');
                return;
            }
        }
        
        console.log('✅ ruleFilter元素已找到');
        console.log('API路径: /api/logs/rules?logType=Syslog');
        
        const response = await fetch('/api/logs/rules?logType=Syslog');
        console.log('响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API返回结果:', result);
        
        if (result.code === 200 && result.data) {
            const rules = result.data;
            console.log('获取到规则列表:', rules);
            console.log('规则数量:', rules.length);
            
            // 清空现有选项（保留"全部规则"）
            ruleFilter.innerHTML = '<option value="">全部规则</option>';
            
            if (rules.length === 0) {
                console.warn('⚠️ 数据库中没有Syslog规则数据！');
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '(暂无规则)';
                option.disabled = true;
                ruleFilter.appendChild(option);
            } else {
                // 添加规则选项
                rules.forEach(rule => {
                    const option = document.createElement('option');
                    option.value = rule.id;
                    option.textContent = rule.ruleName;
                    ruleFilter.appendChild(option);
                    console.log(`✅ 添加规则: [${rule.id}] ${rule.ruleName}`);
                });
                
                console.log(`✅✅✅ 成功加载 ${rules.length} 条规则到下拉框！`);
                
                // 验证下拉框中的选项数量
                console.log(`下拉框当前选项数: ${ruleFilter.options.length} (包括"全部规则")`);
            }
        } else {
            console.error('❌ 加载规则列表失败:', result.message);
            console.error('完整响应:', result);
        }
    } catch (error) {
        console.error('❌ 加载规则列表异常:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
        
        // 在界面显示错误提示
        const ruleFilter = document.getElementById('ruleFilter');
        if (ruleFilter) {
            ruleFilter.innerHTML = '<option value="">全部规则 (加载失败)</option>';
        }
    }
}

// 临时重置所有筛选条件（不删除已保存的过滤器）
function temporaryResetFilters() {
    console.log('=== 临时重置所有筛选条件 ===');
    
    // 重置时间范围
    const timeRangeEl = document.getElementById('timeRange');
    if (timeRangeEl) {
        timeRangeEl.value = 'week'; // 默认最近7天
    }
    
    // 隐藏自定义时间范围
    const customRange = document.getElementById('customTimeRange');
    if (customRange) {
        customRange.style.display = 'none';
    }
    
    // 重置设备类型
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    if (deviceTypeFilter) {
        deviceTypeFilter.value = '';
    }
    
    // 重置匹配规则
    const ruleFilter = document.getElementById('ruleFilter');
    if (ruleFilter) {
        ruleFilter.value = '';
    }
    
    // 重置搜索关键字
    const searchKeyword = document.getElementById('searchKeyword');
    if (searchKeyword) {
        searchKeyword.value = '';
    }
    
    // 隐藏清除按钮
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    // 重置严重性筛选到"全部"
    document.querySelectorAll('.severity-btn-modern').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-severity') === 'all') {
            btn.classList.add('active');
        }
    });
    
    // 重置事件ID和规则ID过滤
    currentEventIds = [];
    currentRuleIds = [];
    
    // 清除过滤模式标记
    window.currentFilterMode = null;
    window.currentSourceIP = null;
    window.currentHostname = null;
    window.currentSeverities = null;
    
    // 重置到第一页
    currentPage = 1;
    
    // 重新加载数据
    console.log('临时重置完成，重新加载数据（保留已保存的过滤器）');
    loadSyslogData();
}

// 保存持久化过滤器
function savePersistentFilter() {
    console.log('=== 保存持久化过滤器 ===');
    
    const filterConfig = {
        timeRange: document.getElementById('timeRange')?.value || 'week',
        deviceType: document.getElementById('deviceTypeFilter')?.value || '',
        ruleId: document.getElementById('ruleFilter')?.value || '',
        keyword: document.getElementById('searchKeyword')?.value || '',
        severity: document.querySelector('.severity-btn-modern.active')?.getAttribute('data-severity') || 'all',
        ruleIds: [...currentRuleIds],
        savedAt: new Date().toISOString()
    };
    
    console.log('保存的过滤配置:', filterConfig);
    localStorage.setItem('syslogPersistentFilter', JSON.stringify(filterConfig));
    
    // 显示清除过滤按钮
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.style.display = 'flex';
    }
    
    // 提示用户
    showSuccess('过滤器已保存！下次登录时会自动应用此过滤条件。');
    
    // 应用过滤器
    currentPage = 1;
    loadSyslogData();
}

// 加载持久化过滤器
function loadPersistentFilter() {
    console.log('=== 检查是否有持久化过滤器 ===');
    
    const savedFilter = localStorage.getItem('syslogPersistentFilter');
    if (!savedFilter) {
        console.log('没有保存的过滤器');
        return false;
    }
    
    try {
        const filterConfig = JSON.parse(savedFilter);
        console.log('找到保存的过滤器:', filterConfig);
        console.log('保存时间:', filterConfig.savedAt);
        
        // 应用过滤器到UI
        applySavedFilterToUI(filterConfig);
        
        // 显示清除过滤按钮
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.style.display = 'flex';
        }
        
        return true;
    } catch (error) {
        console.error('加载过滤器失败:', error);
        return false;
    }
}

// 应用保存的过滤器到UI
function applySavedFilterToUI(filterConfig) {
    console.log('应用过滤器到UI:', filterConfig);
    
    // 应用时间范围
    const timeRangeEl = document.getElementById('timeRange');
    if (timeRangeEl && filterConfig.timeRange) {
        timeRangeEl.value = filterConfig.timeRange;
    }
    
    // 应用设备类型
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    if (deviceTypeFilter && filterConfig.deviceType) {
        deviceTypeFilter.value = filterConfig.deviceType;
    }
    
    // 应用匹配规则
    const ruleFilter = document.getElementById('ruleFilter');
    if (ruleFilter && filterConfig.ruleId) {
        ruleFilter.value = filterConfig.ruleId;
    }
    
    // 应用搜索关键字
    const searchKeyword = document.getElementById('searchKeyword');
    if (searchKeyword && filterConfig.keyword) {
        searchKeyword.value = filterConfig.keyword;
        // 显示清除按钮
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.style.display = 'block';
        }
    }
    
    // 应用严重程度
    if (filterConfig.severity) {
        document.querySelectorAll('.severity-btn-modern').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-severity') === filterConfig.severity) {
                btn.classList.add('active');
            }
        });
    }
    
    // 应用规则ID
    if (filterConfig.ruleIds && filterConfig.ruleIds.length > 0) {
        currentRuleIds = [...filterConfig.ruleIds];
    }
    
    console.log('过滤器已应用到UI');
}

// 清除持久化过滤器
function clearPersistentFilter() {
    console.log('=== 清除持久化过滤器 ===');
    
    if (confirm('确定要清除已保存的过滤器吗？\n\n清除后，下次登录将显示全部日志。')) {
        localStorage.removeItem('syslogPersistentFilter');
        
        // 隐藏清除过滤按钮
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.style.display = 'none';
        }
        
        // 临时重置
        temporaryResetFilters();
        
        showSuccess('过滤器已清除！下次登录将显示全部日志。');
        console.log('持久化过滤器已删除');
    }
}

// 更新分页信息
function updatePagination(pageData) {
    console.log('更新分页信息:', pageData);
    
    const info = document.getElementById('paginationInfo');
    if (!info) {
        console.error('找不到分页信息元素');
        return;
    }
    
    // 适配MyBatis Plus的IPage结构
    const current = pageData.current || 1;
    const size = pageData.size || pageSize;
    const total = pageData.total || 0;
    // 手动计算总页数，确保正确
    const pages = total > 0 ? Math.ceil(total / size) : 1;
    
    console.log('解析后的分页数据:', { current, size, total, pages });
    
    const start = (current - 1) * size + 1;
    const end = Math.min(current * size, total);
    info.textContent = `显示 ${start}-${end} 条，共 ${total} 条记录`;
    
    // 更新分页按钮状态
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.disabled = current <= 1;
        console.log('上一页按钮状态:', prevBtn.disabled, '(当前页:', current, ')');
    } else {
        console.error('找不到上一页按钮');
    }
    
    if (nextBtn) {
        nextBtn.disabled = current >= pages;
        console.log('下一页按钮状态:', nextBtn.disabled, '(当前页:', current, '总页数:', pages, ')');
    } else {
        console.error('找不到下一页按钮');
    }
}

// 导出Syslog数据
function exportSyslogData() {
    const params = buildQueryParams();
    window.open(`/api/logs/syslog/export?${params}`);
}

// 显示加载状态
function showLoading() {
    console.log('显示加载状态');
}

// 隐藏加载状态
function hideLoading() {
    console.log('隐藏加载状态');
}

// Toast通知系统
function showToast(message, type = 'success', title = '') {
    // 确保有toast容器
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // 根据类型设置默认标题和图标
    const typeConfig = {
        success: {
            title: title || '操作成功',
            icon: 'fa-check-circle'
        },
        error: {
            title: title || '操作失败',
            icon: 'fa-times-circle'
        },
        warning: {
            title: title || '警告',
            icon: 'fa-exclamation-triangle'
        },
        info: {
            title: title || '提示',
            icon: 'fa-info-circle'
        }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${config.icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${config.title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
            // 如果容器为空，也删除容器
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

// 显示错误信息
function showError(message) {
    showToast(message, 'error');
}

// 显示成功信息
function showSuccess(message) {
    showToast(message, 'success');
}

// 显示警告信息
function showWarning(message) {
    showToast(message, 'warning');
}

// 显示提示信息
function showInfo(message) {
    showToast(message, 'info');
}

// 加载Syslog配置内容
function loadConfigContent() {
    const content = `
        <style>
            .config-container-modern {
                padding: 0;
            }
            .config-header-modern {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            }
            .config-header-modern h3 {
                color: white;
                font-size: 26px;
                font-weight: 700;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .config-header-modern h3 i {
                font-size: 28px;
            }
            .tab-nav-modern {
                display: flex;
                gap: 8px;
                margin-bottom: 30px;
                background: white;
                padding: 8px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .tab-btn-modern {
                flex: 1;
                padding: 14px 24px;
                border: none;
                border-radius: 8px;
                background: transparent;
                color: #64748b;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .tab-btn-modern:hover {
                background: #f1f5f9;
                color: #475569;
            }
            .tab-btn-modern.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            .tab-btn-modern i {
                font-size: 16px;
            }
            .tab-pane-modern {
                display: none;
                animation: fadeIn 0.3s ease-in;
            }
            .tab-pane-modern.active {
                display: block;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .config-card-modern {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                margin-bottom: 25px;
            }
            .form-section-modern {
                margin-bottom: 35px;
            }
            .form-section-modern:last-child {
                margin-bottom: 0;
            }
            .form-section-modern h4 {
                margin: 0 0 20px 0;
                padding-bottom: 12px;
                border-bottom: 2px solid #667eea;
                color: #1e293b;
                font-size: 18px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .form-section-modern h4 i {
                color: #667eea;
                font-size: 20px;
            }
            .form-group-modern {
                margin-bottom: 20px;
            }
            .form-group-modern label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            .form-group-modern .required {
                color: #ef4444;
                margin-left: 4px;
            }
            .form-control-modern {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 15px;
                color: #1e293b;
                font-weight: 500;
                transition: all 0.3s;
                box-sizing: border-box;
                background: white;
            }
            .form-control-modern:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .form-control-modern:disabled {
                background: #f3f4f6;
                color: #6b7280;
                cursor: not-allowed;
            }
            /* 多选框特殊样式 */
            .form-control-modern[multiple] {
                padding: 8px;
                min-height: 150px;
                background: #fafbfc;
                border: 2px dashed #cbd5e1;
            }
            .form-control-modern[multiple]:focus {
                background: white;
                border-style: solid;
                border-color: #667eea;
            }
            .form-control-modern[multiple] option {
                padding: 10px 12px;
                border-radius: 6px;
                margin: 2px 0;
                cursor: pointer;
                font-size: 14px;
                color: #475569;
                transition: all 0.2s;
                background: white;
            }
            .form-control-modern[multiple] option:hover {
                background: #f1f5f9;
                transform: translateX(2px);
            }
            .form-control-modern[multiple] option:checked {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;
                border-left: 3px solid #10b981;
            }
            .form-help-modern {
                margin-top: 6px;
                font-size: 13px;
                color: #64748b;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .form-help-modern i {
                font-size: 12px;
            }
            .checkbox-container-modern {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
                border: 2px solid #e5e7eb;
                cursor: pointer;
                transition: all 0.3s;
            }
            .checkbox-container-modern:hover {
                border-color: #667eea;
                background: #f1f5f9;
            }
            .checkbox-container-modern input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            .checkbox-container-modern label {
                margin: 0;
                cursor: pointer;
                font-weight: 600;
                color: #475569;
                flex: 1;
            }
            .form-row-modern {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .form-actions-modern {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                padding-top: 25px;
                border-top: 1px solid #e5e7eb;
            }
            .btn-modern {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .btn-primary-modern {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            .btn-primary-modern:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            .forward-settings-modern {
                margin-top: 20px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border: 2px dashed #cbd5e1;
            }
            .rules-header-modern {
                background: white;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 25px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .rules-title-modern h4 {
                margin: 0 0 8px 0;
                color: #1e293b;
                font-size: 20px;
                font-weight: 700;
            }
            .rules-desc-modern {
                margin: 0;
                color: #64748b;
                font-size: 14px;
            }
            .rules-table-container-modern {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            }
            .rules-table-modern {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
            }
            .rules-table-modern thead {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .rules-table-modern thead th {
                padding: 15px;
                text-align: left;
                color: white;
                font-weight: 600;
                font-size: 14px;
                border: none;
            }
            .rules-table-modern thead th:first-child {
                border-radius: 8px 0 0 0;
            }
            .rules-table-modern thead th:last-child {
                border-radius: 0 8px 0 0;
            }
            .rules-table-modern tbody tr {
                transition: all 0.3s;
                border-bottom: 1px solid #e5e7eb;
            }
            .rules-table-modern tbody tr:hover {
                background: #f8fafc;
            }
            .rules-table-modern tbody td {
                padding: 15px;
                color: #475569;
                font-size: 14px;
            }
            .switch-modern {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 24px;
            }
            .switch-modern input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .slider-modern {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.3s;
                border-radius: 24px;
            }
            .slider-modern:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }
            .switch-modern input:checked + .slider-modern {
                background-color: #10b981;
            }
            .switch-modern input:checked + .slider-modern:before {
                transform: translateX(24px);
            }
            .btn-sm-modern {
                padding: 8px 14px;
                font-size: 13px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .btn-outline-modern {
                background: white;
                color: #667eea;
                border: 1px solid #667eea;
            }
            .btn-outline-modern:hover {
                background: #667eea;
                color: white;
            }
            .btn-danger-modern {
                background: #ef4444;
                color: white;
            }
            .btn-danger-modern:hover {
                background: #dc2626;
            }
            /* 模态框样式 */
            .modal-modern {
                display: none;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                align-items: center;
                justify-content: center;
            }
            .modal-content-modern {
                background-color: #fff;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .modal-header-modern {
                padding: 25px 30px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px 12px 0 0;
            }
            .modal-header-modern h4 {
                color: white;
                margin: 0;
                font-size: 20px;
                font-weight: 700;
            }
            .modal-close-modern {
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                color: white;
                background: transparent;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-close-modern:hover {
                background: rgba(255,255,255,0.2);
            }
            .modal-body-modern {
                padding: 30px;
            }
            .modal-footer-modern {
                padding: 20px 30px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                background: #f9fafb;
                border-radius: 0 0 12px 12px;
            }
            .form-step-modern {
                margin-bottom: 30px;
                padding-bottom: 30px;
                border-bottom: 1px solid #e5e7eb;
            }
            .form-step-modern:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            .form-step-modern h5 {
                margin: 0 0 20px 0;
                color: #1e293b;
                font-size: 16px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .form-step-modern h5:before {
                content: '';
                width: 4px;
                height: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 2px;
            }
            .radio-group-modern {
                display: flex;
                gap: 20px;
            }
            .radio-label-modern {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 10px 15px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                transition: all 0.3s;
            }
            .radio-label-modern:hover {
                border-color: #667eea;
                background: #f8fafc;
            }
            .radio-label-modern input[type="radio"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            .radio-label-modern input[type="radio"]:checked + span {
                color: #667eea;
                font-weight: 600;
            }
            .manage-link-modern {
                color: #667eea;
                text-decoration: none;
                font-weight: 600;
                font-size: 13px;
                margin-left: 10px;
                transition: all 0.3s;
            }
            .manage-link-modern:hover {
                color: #764ba2;
                text-decoration: underline;
            }
            .btn-secondary-modern {
                background: #f3f4f6;
                color: #374151;
            }
            .btn-secondary-modern:hover {
                background: #e5e7eb;
            }
            /* Toast通知样式 */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .toast-notification {
                min-width: 300px;
                padding: 16px 20px;
                border-radius: 12px;
                background: white;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid;
            }
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
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
                    transform: translateX(100px);
                }
            }
            .toast-notification.hiding {
                animation: slideOutRight 0.3s ease-in forwards;
            }
            .toast-success {
                border-left-color: #10b981;
            }
            .toast-error {
                border-left-color: #ef4444;
            }
            .toast-warning {
                border-left-color: #f59e0b;
            }
            .toast-info {
                border-left-color: #3b82f6;
            }
            .toast-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 16px;
            }
            .toast-success .toast-icon {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            .toast-error .toast-icon {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
            .toast-warning .toast-icon {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
            }
            .toast-info .toast-icon {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            .toast-content {
                flex: 1;
            }
            .toast-title {
                font-weight: 700;
                font-size: 14px;
                color: #1e293b;
                margin-bottom: 4px;
            }
            .toast-message {
                font-size: 13px;
                color: #64748b;
                line-height: 1.4;
            }
            .toast-close {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: none;
                background: #f3f4f6;
                color: #64748b;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.3s;
                font-size: 14px;
            }
            .toast-close:hover {
                background: #e5e7eb;
                color: #374151;
            }
        </style>
        <div class="config-container-modern">
            <div class="config-header-modern">
                <h3><i class="fas fa-cog"></i>Syslog配置</h3>
            </div>
            
            <!-- 标签页导航 -->
            <div class="tab-nav-modern">
                <button class="tab-btn-modern active" data-tab="storage">
                    <i class="fas fa-database"></i>存储与转发
                </button>
                <button class="tab-btn-modern" data-tab="rules">
                    <i class="fas fa-filter"></i>匹配规则
                </button>
            </div>
            
            <!-- 标签页内容 -->
            <div class="tab-content">
                <!-- 存储与转发标签页 -->
                <div class="tab-pane-modern active" id="storage-tab">
                    <div class="config-card-modern">
                        <div class="form-section-modern">
                            <h4><i class="fas fa-archive"></i>日志存储</h4>
                            <div class="form-group-modern">
                                <label for="retentionDays">日志存储天数 <span class="required">*</span></label>
                                <input type="number" id="retentionDays" class="form-control-modern" 
                                       min="1" max="360" value="180" placeholder="请输入1-360之间的整数">
                                <div class="form-help-modern">
                                    <i class="fas fa-info-circle"></i>
                                    超过存储时间的日志将被自动清理
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section-modern">
                            <h4><i class="fas fa-share-square"></i>日志转发</h4>
                            <div class="form-group-modern">
                                <div class="checkbox-container-modern" onclick="document.getElementById('forwardEnabled').click()">
                                    <input type="checkbox" id="forwardEnabled" onclick="event.stopPropagation()">
                                    <label for="forwardEnabled">启用日志转发</label>
                                </div>
                            </div>
                            
                            <div id="forwardSettings" class="forward-settings-modern" style="display: none;">
                                <div class="form-row-modern">
                                    <div class="form-group-modern">
                                        <label for="forwardServerIp">服务器地址 <span class="required">*</span></label>
                                        <input type="text" id="forwardServerIp" class="form-control-modern" 
                                               placeholder="如：192.168.1.100" pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$">
                                        <div class="form-help-modern">
                                            <i class="fas fa-info-circle"></i>
                                            请输入有效的IP地址
                                        </div>
                                    </div>
                                    
                                    <div class="form-group-modern">
                                        <label for="forwardServerPort">服务器端口 <span class="required">*</span></label>
                                        <input type="number" id="forwardServerPort" class="form-control-modern" 
                                               min="1" max="65535" value="514" placeholder="514">
                                        <div class="form-help-modern">
                                            <i class="fas fa-info-circle"></i>
                                            端口范围: 1-65535
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions-modern">
                            <button onclick="saveLogSettings()" class="btn-modern btn-primary-modern">
                                <i class="fas fa-save"></i> 保存配置
                            </button>
                        </div>
                    </div>
                </div>
                    
                    <!-- 匹配规则标签页 -->
                    <div class="tab-pane-modern" id="rules-tab">
                        <div class="rules-container">
                            <div class="rules-header-modern">
                                <div class="rules-title-modern">
                                    <h4>匹配规则管理</h4>
                                    <p class="rules-desc-modern">配置日志匹配规则，自动识别和分类日志事件</p>
                                </div>
                                <div class="rules-actions">
                                    <button onclick="showAddRuleModal()" class="btn-modern btn-primary-modern">
                                        <i class="fas fa-plus"></i> 新增规则
                                    </button>
                                </div>
                            </div>
                            
                            <div class="rules-table-container-modern">
                                <table class="rules-table-modern">
                                    <thead>
                                        <tr>
                                            <th>规则名称</th>
                                            <th>状态</th>
                                            <th>日志来源</th>
                                            <th>过滤条件摘要</th>
                                            <th>生效时间</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="rulesTableBody">
                                        <!-- 规则数据将通过JavaScript动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 新增/编辑规则弹窗 -->
        <div id="ruleModal" class="modal-modern" style="display: none;">
            <div class="modal-content-modern">
                <div class="modal-header-modern">
                    <h4 id="ruleModalTitle">新增规则</h4>
                    <button class="modal-close-modern" onclick="closeRuleModal()">&times;</button>
                </div>
                
                <div class="modal-body-modern">
                    <form id="ruleForm" class="rule-form">
                        <div class="form-step-modern">
                            <h5>基本信息</h5>
                            <div class="form-row-modern">
                                <div class="form-group-modern">
                                    <label for="ruleName">规则名称 <span class="required">*</span></label>
                                    <input type="text" id="ruleName" class="form-control-modern" 
                                           placeholder="请输入规则名称" required>
                                </div>
                                
                                <div class="form-group-modern">
                                    <label for="logType">日志类型</label>
                                    <select id="logType" class="form-control-modern" disabled style="height: 48px;">
                                        <option value="Syslog">Syslog</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-step-modern">
                            <h5>日志来源</h5>
                            <div class="form-group-modern">
                                <label>来源类型</label>
                                <div class="radio-group-modern">
                                    <label class="radio-label-modern">
                                        <input type="radio" name="sourceType" value="any" checked>
                                        <span>任意来源</span>
                                    </label>
                                    <label class="radio-label-modern">
                                        <input type="radio" name="sourceType" value="specific">
                                        <span>指定IP</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div id="specificIpGroup" class="form-group-modern" style="display: none;">
                                <label for="sourceIps">指定IP地址</label>
                                <input type="text" id="sourceIps" class="form-control-modern" 
                                       placeholder="192.168.1.100,10.0.0.1 (多个IP用逗号分隔)">
                            </div>
                        </div>
                        
                        <div class="form-step-modern">
                            <h5>过滤条件</h5>
                            
                            <!-- 设备类型 -->
                            <div class="form-group-modern">
                                <label for="filterDeviceType">设备类型</label>
                                <select id="filterDeviceType" class="form-control-modern" multiple>
                                    <option value="SERVER">服务器</option>
                                    <option value="NETWORK">网络设备</option>
                                    <option value="STORAGE">存储设备</option>
                                    <option value="VIDEO">视频设备</option>
                                </select>
                                <div class="form-help-modern" style="background: #eff6ff; padding: 8px 10px; border-radius: 6px; margin-top: 8px; border-left: 3px solid #3b82f6;">
                                    <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                                    <span>按住 <strong>Ctrl</strong> 键点击可多选/取消选择</span>
                                </div>
                            </div>
                            
                            <div class="form-group-modern">
                                <label for="filterSeverity">严重程度 <span style="color: #10b981; font-size: 12px;">(从数据库加载)</span></label>
                                <select id="filterSeverity" class="form-control-modern" multiple>
                                    <!-- 选项从数据库动态加载 -->
                                    <option disabled style="text-align: center; color: #94a3b8;">正在加载...</option>
                                </select>
                                <div class="form-help-modern" style="background: #eff6ff; padding: 8px 10px; border-radius: 6px; margin-top: 8px; border-left: 3px solid #3b82f6;">
                                    <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                                    <span>按住 <strong>Ctrl</strong> 键点击可多选/取消选择</span>
                                </div>
                            </div>
                            
                            <div class="form-group-modern">
                                <label for="filterKeywords">关键字</label>
                                <input type="text" id="filterKeywords" class="form-control-modern" 
                                       placeholder="error;failed;timeout (多个关键字用分号分隔)">
                                <div class="form-help-modern">
                                    <i class="fas fa-info-circle"></i>
                                    支持正则表达式，多个关键字用分号分隔
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer-modern">
                    <button type="button" class="btn-modern btn-secondary-modern" onclick="closeRuleModal()">取消</button>
                    <button type="button" class="btn-modern btn-primary-modern" onclick="saveRule()">
                        <i class="fas fa-save"></i> 保存规则
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 事件管理弹窗 -->
        <div id="eventManageModal" class="modal-modern" style="display: none;">
            <div class="modal-content-modern">
                <div class="modal-header-modern">
                    <h4>事件管理</h4>
                    <button class="modal-close-modern" onclick="closeEventManageModal()">&times;</button>
                </div>
                
                <div class="modal-body-modern">
                    <div class="event-actions" style="margin-bottom: 20px;">
                        <button onclick="showAddEventForm()" class="btn-modern btn-primary-modern">
                            <i class="fas fa-plus"></i> 新增事件
                        </button>
                    </div>
                    
                    <div class="events-list">
                        <table class="rules-table-modern">
                            <thead>
                                <tr>
                                    <th>事件名称</th>
                                    <th>颜色</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="eventsTableBody">
                                <!-- 事件数据将通过JavaScript动态加载 -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 新增事件表单 -->
                    <div id="addEventForm" class="add-event-form" style="display: none; margin-top: 25px; padding: 25px; background: #f8fafc; border-radius: 8px; border: 2px dashed #cbd5e1;">
                        <h5 style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 700;">新增事件</h5>
                        <div class="form-row-modern">
                            <div class="form-group-modern">
                                <label for="eventName">事件名称</label>
                                <input type="text" id="eventName" class="form-control-modern" placeholder="请输入事件名称">
                            </div>
                            <div class="form-group-modern">
                                <label for="eventColor">颜色</label>
                                <input type="color" id="eventColor" class="form-control-modern" value="#667eea">
                            </div>
                        </div>
                        <div class="form-actions-modern" style="padding-top: 15px; border-top: 1px solid #e5e7eb; margin-top: 15px;">
                            <button onclick="saveEvent()" class="btn-modern btn-primary-modern">
                                <i class="fas fa-save"></i> 保存
                            </button>
                            <button onclick="cancelAddEvent()" class="btn-modern btn-secondary-modern">取消</button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer-modern">
                    <button type="button" class="btn-modern btn-secondary-modern" onclick="closeEventManageModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 替换右侧主要内容区域
    const logMain = document.querySelector('.log-main');
    if (logMain) {
        logMain.innerHTML = content;
        
        // 绑定标签页切换事件
        bindConfigTabEvents();
        
        // 加载现有配置
        loadLogSettings();
        
        // 加载规则列表
        loadRulesList();
        
        // 加载事件列表
        loadEventsList();
    }
}

function loadStatisticsContent() {
    const content = `
        <style>
            .charts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .chart-container.large {
                grid-column: 1 / -1;
            }
            
            .chart-container.medium {
                grid-column: span 1;
            }
            
            .chart-container.small {
                grid-column: span 1;
            }
            
            .chart-container {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                min-height: 300px;
            }
            
            .chart-header {
                margin-bottom: 15px;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: #333;
                font-size: 16px;
            }
            
            .chart-content {
                position: relative;
                height: 250px;
            }
            
            .chart-content canvas {
                max-height: 100%;
            }
            
            .stats-cards {
                display: flex;
                gap: 30px;
                margin-bottom: 40px;
                padding: 0 20px;
                width: 100%;
            }
            
            .stat-card {
                background: white;
                border-radius: 16px;
                padding: 50px 40px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, box-shadow 0.2s;
                flex: 1;
                cursor: pointer;
            }
            
            .stat-card:hover {
                transform: translateY(-6px) scale(1.02);
                box-shadow: 0 12px 32px rgba(0,0,0,0.18);
            }
            
            .stat-card:active {
                transform: translateY(-2px) scale(1.01);
                transition: transform 0.1s;
            }
            
            .stat-icon {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 30px;
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                font-size: 40px;
                box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-number {
                font-size: 64px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 12px;
                line-height: 1;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .stat-label {
                font-size: 22px;
                color: #5a6c7d;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .stats-cards {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .stat-card {
                    padding: 30px 20px;
                }
                
                .stat-icon {
                    width: 80px;
                    height: 80px;
                    font-size: 32px;
                    margin-right: 20px;
                }
                
                .stat-number {
                    font-size: 48px;
                }
                
                .stat-label {
                    font-size: 18px;
                }
            }
        </style>
        <div class="statistics-dashboard">
            <div class="dashboard-header">
                <h3>日志统计仪表盘</h3>
                <div class="dashboard-filters">
                    <div class="time-range-selector">
                        <label for="statsTimeRange">时间范围：</label>
                        <select id="statsTimeRange" class="form-control">
                            <option value="today">今天</option>
                            <option value="7d" selected>最近7天</option>
                            <option value="30d">最近30天</option>
                            <option value="custom">自定义范围</option>
                        </select>
                        <div id="customStatsRange" class="custom-time-range" style="display: none;">
                            <input type="datetime-local" id="statsStartTime" class="form-control">
                            <span>至</span>
                            <input type="datetime-local" id="statsEndTime" class="form-control">
                        </div>
                    </div>
                    <button id="refreshStatsBtn" class="btn btn-primary">
                        <i class="fas fa-sync"></i> 刷新数据
                    </button>
                </div>
            </div>
            
            <!-- 统计卡片区域 -->
            <div class="stats-cards">
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-content">
                        <div class="stat-number" id="totalLogsCount">0</div>
                        <div class="stat-label">总日志数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #28a745, #20c997);">🖥️</div>
                    <div class="stat-content">
                        <div class="stat-number" id="totalDevicesCount">0</div>
                        <div class="stat-label">设备总数</div>
                    </div>
                </div>
            </div>
            
            <!-- 图表展示区域 -->
            <div class="charts-grid">
                <!-- 日志趋势图 -->
                <div class="chart-container large">
                    <div class="chart-header">
                        <h4>日志趋势 (24小时)</h4>
                        <div class="chart-legend" id="trendLegend"></div>
                    </div>
                    <div class="chart-content">
                        <canvas id="logTrendChart"></canvas>
                    </div>
                </div>
                
                <!-- 日志来源 Top 5 -->
                <div class="chart-container medium">
                    <div class="chart-header">
                        <h4>日志来源 Top 5</h4>
                    </div>
                    <div class="chart-content">
                        <canvas id="logSourceChart"></canvas>
                    </div>
                </div>
                
                <!-- 严重性分布 -->
                <div class="chart-container small">
                    <div class="chart-header">
                        <h4>严重性分布</h4>
                    </div>
                    <div class="chart-content">
                        <canvas id="severityChart"></canvas>
                    </div>
                </div>
                
                <!-- 设备类型分布 -->
                <div class="chart-container small">
                    <div class="chart-header">
                        <h4>设备类型分布</h4>
                    </div>
                    <div class="chart-content">
                        <canvas id="facilityChart"></canvas>
                    </div>
                </div>
                
                <!-- 匹配规则 Top 5 -->
                <div class="chart-container medium">
                    <div class="chart-header">
                        <h4>匹配规则 Top 5</h4>
                    </div>
                    <div class="chart-content">
                        <canvas id="rulesChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 替换右侧主要内容区域
    const logMain = document.querySelector('.log-main');
    if (logMain) {
        logMain.innerHTML = content;
        
        // 绑定事件
        bindStatisticsEvents();
        
        // 加载统计数据
        loadStatisticsData();
    }
}

function loadFilteringContent() {
    const content = `
        <style>
            .filtering-page {
                padding: 20px;
                background: #f8f9fa;
                min-height: 100vh;
            }
            
            .filter-header {
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            
            .filter-header h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 24px;
                font-weight: 600;
            }
            
            .filter-header p {
                margin: 0;
                color: #6c757d;
                font-size: 14px;
            }
            
            .filter-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .filter-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .filter-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            .filter-card h4 {
                margin: 0 0 16px 0;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-card-icon {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #007bff, #0056b3);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                color: #495057;
                font-weight: 500;
                font-size: 14px;
            }
            
            .form-control {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            
            .form-control:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
            }
            
            .checkbox-group {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin-top: 8px;
            }
            
            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 13px;
            }
            
            .checkbox-item:hover {
                border-color: #007bff;
                background: #f8f9ff;
            }
            
            .checkbox-item.active {
                border-color: #007bff;
                background: #007bff;
                color: white;
            }
            
            .checkbox-item input {
                margin: 0;
            }
            
            .severity-levels {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-top: 8px;
            }
            
            .severity-item {
                padding: 10px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
                font-weight: 500;
            }
            
            .severity-item:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .severity-item.active {
                color: white;
                border-color: transparent;
            }
            
            .severity-0 { background: #dc3545; }
            .severity-1 { background: #fd7e14; }
            .severity-2 { background: #ffc107; color: #000; }
            .severity-3 { background: #20c997; }
            .severity-4 { background: #17a2b8; }
            .severity-5 { background: #6f42c1; }
            .severity-6 { background: #6c757d; }
            .severity-7 { background: #28a745; }
            
            .filter-actions {
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                display: flex;
                gap: 12px;
                justify-content: space-between;
                align-items: center;
            }
            
            .btn-group {
                display: flex;
                gap: 12px;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-1px);
            }
            
            .btn-success {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
            }
            
            .btn-success:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(40,167,69,0.3);
            }
            
            .saved-filters {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-top: 20px;
            }
            
            .saved-filters h4 {
                margin: 0 0 16px 0;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
            }
            
            .filter-list {
                display: grid;
                gap: 12px;
            }
            
            .filter-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                transition: all 0.2s;
            }
            
            .filter-item:hover {
                border-color: #007bff;
                background: #f8f9ff;
            }
            
            .filter-item-info {
                flex: 1;
            }
            
            .filter-item-name {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            
            .filter-item-desc {
                font-size: 12px;
                color: #6c757d;
            }
            
            .filter-item-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            @media (max-width: 768px) {
                .filter-grid {
                    grid-template-columns: 1fr;
                }
                
                .severity-levels {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .checkbox-group {
                    grid-template-columns: 1fr;
                }
                
                .filter-actions {
                    flex-direction: column;
                    gap: 16px;
                }
                
                .btn-group {
                    width: 100%;
                    justify-content: center;
                }
            }
        </style>
        
        <div class="filtering-page">
            <!-- 页面头部 -->
            <div class="filter-header">
                <h3>🔍 高级日志过滤器</h3>
                <p>创建和管理自定义过滤条件，快速定位所需日志信息</p>
            </div>
            
            <!-- 过滤条件设置 -->
            <div class="filter-grid">
                <!-- 时间和关键字过滤 -->
                <div class="filter-card">
                    <h4>
                        <div class="filter-card-icon">⏰</div>
                        时间范围 & 关键字
                    </h4>
                    
                    <div class="form-group">
                        <label for="filterTimeRange">时间范围</label>
                        <select id="filterTimeRange" class="form-control">
                            <option value="today">今天</option>
                            <option value="week" selected>最近7天</option>
                            <option value="month">最近30天</option>
                            <option value="custom">自定义时间</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customTimeGroup" style="display: none;">
                        <label>自定义时间范围</label>
                        <input type="datetime-local" id="filterStartTime" class="form-control" style="margin-bottom: 8px;">
                        <input type="datetime-local" id="filterEndTime" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="filterKeyword">关键字搜索</label>
                        <input type="text" id="filterKeyword" class="form-control" placeholder="输入关键字...">
                    </div>
                </div>
                
                <!-- 来源和设备过滤 -->
                <div class="filter-card">
                    <h4>
                        <div class="filter-card-icon">🖥️</div>
                        来源 & 设备
                    </h4>
                    
                    <div class="form-group">
                        <label for="filterSourceIP">来源IP地址</label>
                        <input type="text" id="filterSourceIP" class="form-control" placeholder="例: 192.168.1.100">
                    </div>
                    
                    <div class="form-group">
                        <label for="filterHostname">主机名</label>
                        <input type="text" id="filterHostname" class="form-control" placeholder="例: server01">
                    </div>
                    
                    <div class="form-group">
                        <label>设备类型</label>
                        <div class="checkbox-group" id="deviceTypeCheckboxes">
                            <div class="checkbox-item" data-device-type="SERVER">
                                <input type="checkbox" id="deviceServer" value="SERVER">
                                <label for="deviceServer">服务器</label>
                            </div>
                            <div class="checkbox-item" data-device-type="NETWORK">
                                <input type="checkbox" id="deviceNetwork" value="NETWORK">
                                <label for="deviceNetwork">网络设备</label>
                            </div>
                            <div class="checkbox-item" data-device-type="STORAGE">
                                <input type="checkbox" id="deviceStorage" value="STORAGE">
                                <label for="deviceStorage">存储设备</label>
                            </div>
                            <div class="checkbox-item" data-device-type="VIDEO">
                                <input type="checkbox" id="deviceVideo" value="VIDEO">
                                <label for="deviceVideo">视频设备</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 严重性级别过滤 -->
                <div class="filter-card">
                    <h4>
                        <div class="filter-card-icon">⚠️</div>
                        严重性级别
                    </h4>
                    
                    <div class="form-group">
                        <label>选择严重性级别（可多选）</label>
                        <div id="selectedSeverityDisplay" style="margin-bottom: 10px; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; font-size: 13px; color: #495057;">
                            已选择: <span id="selectedSeverityText" style="color: #007bff; font-weight: 600;">无</span>
                        </div>
                        <div class="severity-levels" id="severityLevels">
                            <div class="severity-item severity-0" data-severity="0">
                                Emergency<br><small>紧急</small>
                            </div>
                            <div class="severity-item severity-1" data-severity="1">
                                Alert<br><small>告警</small>
                            </div>
                            <div class="severity-item severity-2" data-severity="2">
                                Critical<br><small>严重</small>
                            </div>
                            <div class="severity-item severity-3" data-severity="3">
                                Error<br><small>错误</small>
                            </div>
                            <div class="severity-item severity-4" data-severity="4">
                                Warning<br><small>警告</small>
                            </div>
                            <div class="severity-item severity-5" data-severity="5">
                                Notice<br><small>通知</small>
                            </div>
                            <div class="severity-item severity-6" data-severity="6">
                                Info<br><small>信息</small>
                            </div>
                            <div class="severity-item severity-7" data-severity="7">
                                Debug<br><small>调试</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 事件和高级过滤 -->
                <div class="filter-card">
                    <h4>
                        <div class="filter-card-icon">🎯</div>
                        事件 & 高级选项
                    </h4>
                    
                    <div class="form-group">
                        <label for="filterEventId">匹配事件ID</label>
                        <input type="number" id="filterEventId" class="form-control" placeholder="例: 1001">
                    </div>
                    
                    <div class="form-group">
                        <label>特殊过滤</label>
                        <div class="checkbox-group">
                            <div class="checkbox-item" data-special="alert">
                                <input type="checkbox" id="alertOnly" value="alert">
                                <label for="alertOnly">仅告警日志</label>
                            </div>
                            <div class="checkbox-item" data-special="error">
                                <input type="checkbox" id="errorOnly" value="error">
                                <label for="errorOnly">仅错误日志</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="filter-actions">
                <div class="btn-group" id="editModeButtons" style="display: none;">
                    <button class="btn btn-secondary" onclick="clearAllFilters()">
                        🗑️ 清空条件
                    </button>
                    <button class="btn btn-success" onclick="saveCurrentFilter()">
                        💾 保存过滤器
                    </button>
                </div>
                <div>
                    <div id="currentFilterStatus" style="color: #495057; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                        当前状态: <span id="activeFilterName" style="color: #6c757d;">未编辑任何过滤器</span>
                    </div>
                    <div id="filterStatus" style="color: #6c757d; font-size: 13px;">
                        点击下方过滤器的"编辑"按钮开始编辑
                    </div>
                </div>
            </div>
            
            <!-- 保存的过滤器 -->
            <div class="saved-filters">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0;">📋 保存的过滤器</h4>
                    <button class="btn btn-sm btn-success" onclick="createNewFilter()" style="padding: 6px 12px;">
                        ➕ 新增过滤器
                    </button>
                </div>
                <div class="filter-list" id="savedFiltersList">
                    <div class="filter-item">
                        <div class="filter-item-info">
                            <div class="filter-item-name">默认过滤器</div>
                            <div class="filter-item-desc">显示最近7天的所有日志</div>
                        </div>
                        <div class="filter-item-actions">
                            <button class="btn btn-sm btn-primary" onclick="loadSavedFilter('default')">应用</button>
                            <button class="btn btn-sm btn-secondary" onclick="editSavedFilter('default')">编辑</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 替换右侧主要内容区域
    const logMain = document.querySelector('.log-main');
    if (logMain) {
        // 清除初始化标志，确保事件监听器重新绑定
        window.filterPageInitialized = false;
        logMain.innerHTML = content;
        initializeFilteringPage();
    }
}


// 辅助函数
async function loadLogSettings() {
    try {
        const response = await fetch('/api/logs/settings');
        const result = await response.json();
        if (result.code === 200) {
            const settings = result.data;
            document.getElementById('retentionDays').value = settings.retentionDays || 180;
            document.getElementById('forwardEnabled').checked = settings.isForwardEnabled || false;
            document.getElementById('forwardServerIp').value = settings.forwardServerIp || '';
            document.getElementById('forwardServerPort').value = settings.forwardServerPort || 514;
            
            // 显示/隐藏转发设置
            document.getElementById('forwardSettings').style.display = 
                settings.isForwardEnabled ? 'block' : 'none';
        }
    } catch (error) {
        console.error('加载配置失败:', error);
    }
    
    // 绑定转发启用复选框事件
    const forwardEnabled = document.getElementById('forwardEnabled');
    if (forwardEnabled) {
        forwardEnabled.addEventListener('change', function() {
            const forwardSettings = document.getElementById('forwardSettings');
            if (forwardSettings) {
                forwardSettings.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
}

async function saveLogSettings() {
    try {
        const settings = {
            retentionDays: parseInt(document.getElementById('retentionDays').value),
            isForwardEnabled: document.getElementById('forwardEnabled').checked,
            forwardServerIp: document.getElementById('forwardServerIp').value,
            forwardServerPort: parseInt(document.getElementById('forwardServerPort').value)
        };
        
        const response = await fetch('/api/logs/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        if (result.code === 200) {
            showSuccess('配置保存成功');
        } else {
            showError('保存失败: ' + result.message);
        }
    } catch (error) {
        console.error('保存配置失败:', error);
        showError('保存配置失败');
    }
}

async function loadStatistics() {
    // 模拟统计数据
    document.getElementById('todayCount').textContent = '1,234';
    document.getElementById('alertCount').textContent = '56';
    document.getElementById('errorCount').textContent = '23';
    document.getElementById('deviceCount').textContent = '45';
}

async function loadSavedFilters() {
    try {
        const response = await fetch('/api/logs/filters?createdBy=admin');
        const result = await response.json();
        if (result.code === 200) {
            // 渲染过滤器列表
            console.log('过滤器列表:', result.data);
        }
    } catch (error) {
        console.error('加载过滤器失败:', error);
    }
}

// 显示日志详情弹窗
function showLogDetail(message, eventTime, hostname, sourceIp) {
    // 解码HTML实体
    const decodedMessage = decodeHtml(message);
    
    // 创建弹窗HTML
    const modalHtml = `
        <div class="log-detail-modal" id="logDetailModal">
            <div class="modal-overlay" onclick="closeLogDetail()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> 日志详情</h3>
                    <button class="modal-close" onclick="closeLogDetail()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="log-info-grid">
                        <div class="log-info-item">
                            <label><i class="fas fa-clock"></i> 事件时间:</label>
                            <span>${formatLogTime(eventTime)}</span>
                        </div>
                        <div class="log-info-item">
                            <label><i class="fas fa-server"></i> 主机名:</label>
                            <span>${hostname}</span>
                        </div>
                        <div class="log-info-item">
                            <label><i class="fas fa-network-wired"></i> 来源IP:</label>
                            <span>${sourceIp}</span>
                        </div>
                    </div>
                    <div class="log-content-section">
                        <label><i class="fas fa-align-left"></i> 完整日志内容:</label>
                        <div class="log-content-display">
                            <pre>${decodedMessage}</pre>
                        </div>
                    </div>
                    <div class="log-actions">
                        <button class="btn-copy" onclick="copyLogContent('${escapeHtml(decodedMessage)}')" title="复制日志内容">
                            <i class="fas fa-copy"></i> 复制内容
                        </button>
                        <button class="btn-export" onclick="exportLogDetail('${escapeHtml(decodedMessage)}', '${eventTime}', '${hostname}', '${sourceIp}')" title="导出日志">
                            <i class="fas fa-download"></i> 导出日志
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 显示弹窗
    const modal = document.getElementById('logDetailModal');
    modal.style.display = 'flex';
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleModalKeydown);
}

// 关闭日志详情弹窗
function closeLogDetail() {
    const modal = document.getElementById('logDetailModal');
    if (modal) {
        modal.remove();
    }
    
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleModalKeydown);
}

// 处理弹窗键盘事件
function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeLogDetail();
    }
}

// HTML解码函数
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// 复制日志内容到剪贴板
function copyLogContent(content) {
    const decodedContent = decodeHtml(content);
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(decodedContent).then(() => {
            showSuccess('日志内容已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(decodedContent);
        });
    } else {
        fallbackCopyTextToClipboard(decodedContent);
    }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccess('日志内容已复制到剪贴板');
        } else {
            showError('复制失败，请手动复制');
        }
    } catch (err) {
        console.error('复制失败:', err);
        showError('复制失败，请手动复制');
    }
    
    document.body.removeChild(textArea);
}

// 导出单条日志
function exportLogDetail(content, eventTime, hostname, sourceIp) {
    const decodedContent = decodeHtml(content);
    
    const logText = `日志详情导出
=====================================
事件时间: ${formatLogTime(eventTime)}
主机名: ${hostname}
来源IP: ${sourceIp}
=====================================
日志内容:
${decodedContent}
=====================================
导出时间: ${new Date().toLocaleString()}
`;
    
    // 创建下载链接
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log_${hostname}_${eventTime.replace(/[:\s]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('日志已导出');
}

// 显示成功消息
function showSuccess(message) {
    console.log('成功:', message);
    showToast(message, 'success');
}

// 显示错误消息
function showError(message) {
    console.error('错误:', message);
    showToast(message, 'error');
}

// 简单的Toast通知
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

