// 告警中心功能模块
const AlertCenter = {
    // 模拟告警数据
    alertData: [
        {
            id: 1,
            severity: 'critical',
            message: '服务器CPU使用率超过90%',
            device: 'SRV-001',
            deviceType: 'server',
            timestamp: '2024-07-31 14:30:25',
            status: 'active',
            description: '服务器SRV-001的CPU使用率持续超过90%，可能影响系统性能。'
        },
        {
            id: 2,
            severity: 'warning',
            message: '网络延迟异常',
            device: 'NET-002',
            deviceType: 'network',
            timestamp: '2024-07-31 14:25:10',
            status: 'acknowledged',
            description: '网络设备NET-002检测到延迟异常，平均延迟超过100ms。'
        },
        {
            id: 3,
            severity: 'info',
            message: '存储空间使用率达到80%',
            device: 'STO-003',
            deviceType: 'storage',
            timestamp: '2024-07-31 14:20:45',
            status: 'resolved',
            description: '存储设备STO-003的空间使用率达到80%，建议清理或扩容。'
        },
        {
            id: 4,
            severity: 'critical',
            message: '数据库连接失败',
            device: 'DB-004',
            deviceType: 'server',
            timestamp: '2024-07-31 14:15:30',
            status: 'active',
            description: '数据库服务器DB-004无法建立连接，服务可能中断。'
        },
        {
            id: 5,
            severity: 'warning',
            message: '内存使用率过高',
            device: 'SRV-005',
            deviceType: 'server',
            timestamp: '2024-07-31 14:10:15',
            status: 'acknowledged',
            description: '服务器SRV-005内存使用率超过85%，可能需要重启或优化。'
        }
    ],

    currentPage: 1,
    pageSize: 10,
    filteredData: [],

    // 初始化
    init: function() {
        document.addEventListener('DOMContentLoaded', function() {
            AlertCenter.initSidebar();
            AlertCenter.initEventListeners();
            AlertCenter.loadAlertData();
            AlertCenter.updateStatistics();
        });
    },

    // 初始化侧边栏交互
    initSidebar: function() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', function() {
                const itemText = this.querySelector('span').textContent;
                console.log('导航到:', itemText);

                // 根据菜单项跳转到对应页面
                AlertCenter.navigateToPage(itemText);
            });
        });
    },

    // 初始化事件监听器
    initEventListeners: function() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', function() {
            AlertCenter.filterAlerts();
        });

        // 过滤器
        document.getElementById('severityFilter').addEventListener('change', function() {
            AlertCenter.filterAlerts();
        });

        document.getElementById('statusFilter').addEventListener('change', function() {
            AlertCenter.filterAlerts();
        });

        document.getElementById('deviceTypeFilter').addEventListener('change', function() {
            AlertCenter.filterAlerts();
        });

        // 快速筛选栏
        this.initQuickFilters();

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', function() {
            AlertCenter.refreshData();
        });

        // 全选复选框
        document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.alert-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

        // 批量确认按钮
        document.getElementById('acknowledgeAllBtn').addEventListener('click', function() {
            AlertCenter.acknowledgeSelected();
        });

        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', function() {
            AlertCenter.exportAlerts();
        });

        // 模态框关闭
        document.getElementById('closeModal').addEventListener('click', function() {
            AlertCenter.closeModal();
        });

        // 点击模态框外部关闭
        document.getElementById('alertDetailModal').addEventListener('click', function(e) {
            if (e.target === this) {
                AlertCenter.closeModal();
            }
        });

        // 模态框内的按钮
        document.getElementById('acknowledgeBtn').addEventListener('click', function() {
            AlertCenter.acknowledgeAlert();
        });

        document.getElementById('resolveBtn').addEventListener('click', function() {
            AlertCenter.resolveAlert();
        });
    },

    // 加载告警数据
    loadAlertData: function() {
        this.filteredData = [...this.alertData];
        this.renderAlertTable();
        this.renderPagination();
    },

    // 过滤告警
    filterAlerts: function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const severityFilter = document.getElementById('severityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const deviceTypeFilter = document.getElementById('deviceTypeFilter').value;

        this.filteredData = this.alertData.filter(alert => {
            const matchesSearch = alert.message.toLowerCase().includes(searchTerm) ||
                                alert.device.toLowerCase().includes(searchTerm);
            const matchesSeverity = !severityFilter || alert.severity === severityFilter;
            const matchesStatus = !statusFilter || alert.status === statusFilter;
            const matchesDeviceType = !deviceTypeFilter || alert.deviceType === deviceTypeFilter;

            return matchesSearch && matchesSeverity && matchesStatus && matchesDeviceType;
        });

        this.currentPage = 1;
        this.renderAlertTable();
        this.renderPagination();
        this.updateStatistics();
    },

    // 渲染告警表格
    renderAlertTable: function() {
        const tbody = document.getElementById('alertTableBody');
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">暂无告警数据</td></tr>';
            return;
        }

        pageData.forEach(alert => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="alert-checkbox" data-id="${alert.id}"></td>
                <td><span class="severity-badge severity-${alert.severity}">${this.getSeverityText(alert.severity)}</span></td>
                <td>${alert.message}</td>
                <td>${alert.device}</td>
                <td>${alert.timestamp}</td>
                <td><span class="status-badge status-${alert.status}">${this.getStatusText(alert.status)}</span></td>
                <td>
                    <button class="action-btn view" onclick="AlertCenter.viewAlert(${alert.id})">查看</button>
                    ${alert.status === 'active' ? `<button class="action-btn acknowledge" onclick="AlertCenter.acknowledgeAlert(${alert.id})">确认</button>` : ''}
                    ${alert.status !== 'resolved' ? `<button class="action-btn resolve" onclick="AlertCenter.resolveAlert(${alert.id})">解决</button>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // 渲染分页
    renderPagination: function() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 上一页按钮
        paginationHTML += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="AlertCenter.goToPage(${this.currentPage - 1})">上一页</button>`;

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="AlertCenter.goToPage(${i})">${i}</button>`;
            }
        }

        // 下一页按钮
        paginationHTML += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="AlertCenter.goToPage(${this.currentPage + 1})">下一页</button>`;

        pagination.innerHTML = paginationHTML;
    },

    // 跳转到指定页面
    goToPage: function(page) {
        this.currentPage = page;
        this.renderAlertTable();
        this.renderPagination();
    },

    // 初始化快速筛选栏
    initQuickFilters: function() {
        // 筛选选项点击事件
        const filterOptions = document.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;

                if (checkbox.checked) {
                    this.classList.add('selected');
                } else {
                    this.classList.remove('selected');
                }

                AlertCenter.applyQuickFilters();
            });
        });

        // 清除筛选按钮
        document.getElementById('clearFilters').addEventListener('click', function() {
            AlertCenter.clearQuickFilters();
        });

        // 应用筛选按钮
        document.getElementById('applyFilters').addEventListener('click', function() {
            AlertCenter.applyQuickFilters();
        });
    },

    // 应用快速筛选
    applyQuickFilters: function() {
        const selectedSeverities = [];
        const selectedStatuses = [];

        // 获取选中的严重程度
        document.querySelectorAll('.filter-option[data-filter="severity"] input:checked').forEach(checkbox => {
            const option = checkbox.closest('.filter-option');
            selectedSeverities.push(option.getAttribute('data-value'));
        });

        // 获取选中的状态
        document.querySelectorAll('.filter-option[data-filter="status"] input:checked').forEach(checkbox => {
            const option = checkbox.closest('.filter-option');
            selectedStatuses.push(option.getAttribute('data-value'));
        });

        // 应用筛选
        this.filteredData = this.alertData.filter(alert => {
            const severityMatch = selectedSeverities.length === 0 || selectedSeverities.includes(alert.severity);
            const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(alert.status);

            // 同时考虑搜索框的筛选
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const searchMatch = !searchTerm ||
                alert.message.toLowerCase().includes(searchTerm) ||
                alert.device.toLowerCase().includes(searchTerm);

            return severityMatch && statusMatch && searchMatch;
        });

        this.currentPage = 1;
        this.renderAlertTable();
        this.renderPagination();
        this.updateStatistics();
    },

    // 清除快速筛选
    clearQuickFilters: function() {
        // 取消所有选中状态
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.filter-option').classList.remove('selected');
        });

        // 重新应用筛选
        this.applyQuickFilters();
    },

    // 更新统计数据
    updateStatistics: function() {
        const allStats = {
            critical: 0,
            warning: 0,
            info: 0,
            resolved: 0,
            active: 0,
            acknowledged: 0
        };

        // 统计所有数据（用于筛选栏显示）
        this.alertData.forEach(alert => {
            allStats[alert.severity]++;
            allStats[alert.status]++;
        });

        const filteredStats = {
            critical: 0,
            warning: 0,
            info: 0,
            resolved: 0
        };

        // 统计筛选后的数据（用于图表显示）
        this.filteredData.forEach(alert => {
            if (alert.status === 'resolved') {
                filteredStats.resolved++;
            } else {
                filteredStats[alert.severity]++;
            }
        });

        const total = filteredStats.critical + filteredStats.warning + filteredStats.info + filteredStats.resolved;

        // 更新筛选栏的数字显示
        document.getElementById('criticalCount').textContent = allStats.critical;
        document.getElementById('warningCount').textContent = allStats.warning;
        document.getElementById('infoCount').textContent = allStats.info;
        document.getElementById('resolvedCount').textContent = allStats.resolved;
        document.getElementById('activeCount').textContent = allStats.active;
        document.getElementById('acknowledgedCount').textContent = allStats.acknowledged;

        // 更新图表区域
        document.getElementById('totalAlerts').textContent = total;
        document.getElementById('centerTotal').textContent = total;

        // 更新环形图
        this.updateDonutChart(filteredStats, total);

        // 更新时间
        this.updateLastUpdateTime();
    },



    // 更新环形图
    updateDonutChart: function(stats, total) {
        const canvas = document.getElementById('alertDistributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = 80;
        const innerRadius = 50;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (total === 0) return;

        const colors = {
            critical: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            resolved: '#10b981'
        };

        let currentAngle = -Math.PI / 2; // 从顶部开始

        Object.keys(stats).forEach(key => {
            if (stats[key] > 0) {
                const sliceAngle = (stats[key] / total) * 2 * Math.PI;

                // 绘制扇形
                ctx.beginPath();
                ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
                ctx.closePath();
                ctx.fillStyle = colors[key];
                ctx.fill();

                currentAngle += sliceAngle;
            }
        });
    },

    // 更新最后更新时间
    updateLastUpdateTime: function() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdateTime').textContent = `最后更新: ${timeString}`;
    },

    // 获取严重程度文本
    getSeverityText: function(severity) {
        const severityMap = {
            'critical': '严重',
            'warning': '警告',
            'info': '信息'
        };
        return severityMap[severity] || severity;
    },

    // 获取状态文本
    getStatusText: function(status) {
        const statusMap = {
            'active': '活跃',
            'acknowledged': '已确认',
            'resolved': '已解决'
        };
        return statusMap[status] || status;
    },

    // 查看告警详情
    viewAlert: function(alertId) {
        const alert = this.alertData.find(a => a.id === alertId);
        if (!alert) return;

        const modalContent = document.getElementById('alertDetailContent');
        modalContent.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>告警级别:</strong> <span class="severity-badge severity-${alert.severity}">${this.getSeverityText(alert.severity)}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>告警信息:</strong> ${alert.message}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>设备:</strong> ${alert.device}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>设备类型:</strong> ${alert.deviceType}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>发生时间:</strong> ${alert.timestamp}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>状态:</strong> <span class="status-badge status-${alert.status}">${this.getStatusText(alert.status)}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>详细描述:</strong> ${alert.description}
            </div>
        `;

        // 设置当前查看的告警ID
        document.getElementById('alertDetailModal').setAttribute('data-alert-id', alertId);
        document.getElementById('alertDetailModal').style.display = 'block';
    },

    // 确认告警
    acknowledgeAlert: function(alertId) {
        if (!alertId) {
            // 从模态框获取告警ID
            alertId = parseInt(document.getElementById('alertDetailModal').getAttribute('data-alert-id'));
        }

        const alert = this.alertData.find(a => a.id === alertId);
        if (alert && alert.status === 'active') {
            alert.status = 'acknowledged';
            this.loadAlertData();
            this.updateStatistics();
            this.closeModal();
        }
    },

    // 解决告警
    resolveAlert: function(alertId) {
        if (!alertId) {
            // 从模态框获取告警ID
            alertId = parseInt(document.getElementById('alertDetailModal').getAttribute('data-alert-id'));
        }

        const alert = this.alertData.find(a => a.id === alertId);
        if (alert && alert.status !== 'resolved') {
            alert.status = 'resolved';
            this.loadAlertData();
            this.updateStatistics();
            this.closeModal();
        }
    },

    // 批量确认选中的告警
    acknowledgeSelected: function() {
        const selectedCheckboxes = document.querySelectorAll('.alert-checkbox:checked');
        selectedCheckboxes.forEach(checkbox => {
            const alertId = parseInt(checkbox.getAttribute('data-id'));
            const alert = this.alertData.find(a => a.id === alertId);
            if (alert && alert.status === 'active') {
                alert.status = 'acknowledged';
            }
        });

        this.loadAlertData();
        this.updateStatistics();
        document.getElementById('selectAll').checked = false;
    },

    // 导出告警数据
    exportAlerts: function() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `alerts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 生成CSV内容
    generateCSV: function() {
        const headers = ['ID', '级别', '告警信息', '设备', '时间', '状态', '描述'];
        const csvRows = [headers.join(',')];

        this.filteredData.forEach(alert => {
            const row = [
                alert.id,
                this.getSeverityText(alert.severity),
                `"${alert.message}"`,
                alert.device,
                alert.timestamp,
                this.getStatusText(alert.status),
                `"${alert.description}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    },

    // 刷新数据
    refreshData: function() {
        // 模拟数据刷新
        this.loadAlertData();
        this.updateStatistics();
        
        // 显示刷新动画
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn.querySelector('i');
        icon.style.animation = 'spin 1s linear';
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    },

    // 关闭模态框
    closeModal: function() {
        document.getElementById('alertDetailModal').style.display = 'none';
    },

    // 侧边栏导航功能
    navigateToPage: function(menuItem) {
        const pageMap = {
            '总览': '总览.html',
            '视图': '视图.html',
            '告警中心': '告警中心.html',
            '设备管理': '设备管理.html',
            '网络拓扑': '网络拓扑.html',
            '统计报表': '统计报表.html',
            '运维工具': '运维工具.html',
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
            if (targetPage === '告警中心.html') {
                console.log('当前已在告警中心页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
};

// 添加旋转动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// 初始化告警中心
AlertCenter.init();
