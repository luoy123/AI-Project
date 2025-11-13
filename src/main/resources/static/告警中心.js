/**
 * 告警中心功能模块
 * 集成后端API，实现完整的告警管理功能
 */
const AlertCenter = {
    // API基础URL
    apiBaseUrl: '/api/alert',

    // 告警数据（从后端加载）
    alertData: [],

    currentPage: 1,
    pageSize: 10,
    filteredData: [],

    // 当前查看的告警ID
    currentAlertId: null,

    // 初始化
    init: function() {
        document.addEventListener('DOMContentLoaded', function() {
            // 检查认证（common.js已处理）
            AlertCenter.initSidebar();
            AlertCenter.initEventListeners();
            AlertCenter.handleUrlParameters();
            AlertCenter.loadAlertData();
            AlertCenter.loadStatistics();
        });
    },

    // 处理URL参数
    handleUrlParameters: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const alertId = urlParams.get('alertId');
        const severity = urlParams.get('severity');
        const status = urlParams.get('status');
        const deviceName = urlParams.get('deviceName');
        
        console.log('URL参数:', { alertId, severity, status, deviceName });
        
        // 如果有严重级别参数，设置严重级别过滤器
        if (severity) {
            const severityFilter = document.getElementById('severityFilter');
            if (severityFilter) {
                severityFilter.value = severity;
                console.log('设置严重级别过滤器:', severity);
            }
        }
        
        // 如果有状态参数，设置状态过滤器
        if (status) {
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) {
                statusFilter.value = status;
                console.log('设置状态过滤器:', status);
            }
        }
        
        // 如果有设备名称参数，设置搜索框
        if (deviceName) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = decodeURIComponent(deviceName);
                console.log('设置搜索关键词:', deviceName);
            }
        }
        
        // 保存目标告警ID，用于后续高亮显示
        if (alertId) {
            AlertCenter.currentAlertId = parseInt(alertId);
            console.log('目标告警ID:', AlertCenter.currentAlertId);
        }
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
        // 搜索功能 - 移除自动筛选，只在点击刷新按钮时生效
        // document.getElementById('searchInput').addEventListener('input', function() {
        //     AlertCenter.filterAlerts();
        // });

        // 过滤器 - 移除自动筛选，只在点击刷新按钮时生效
        // document.getElementById('severityFilter').addEventListener('change', function() {
        //     AlertCenter.filterAlerts();
        // });

        // document.getElementById('statusFilter').addEventListener('change', function() {
        //     AlertCenter.filterAlerts();
        // });

        // document.getElementById('deviceTypeFilter').addEventListener('change', function() {
        //     AlertCenter.filterAlerts();
        // });

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
            AlertCenter.updateBatchButtonState();
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

        // 模态框内的关闭按钮
        document.getElementById('closeDetailBtn').addEventListener('click', function() {
            AlertCenter.closeModal();
        });
    },

    // 从后端加载告警数据
    loadAlertData: function() {
        // 获取筛选条件
        const severity = document.getElementById('severityFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';
        const deviceType = document.getElementById('deviceTypeFilter')?.value || '';
        const keyword = document.getElementById('searchInput')?.value || '';

        // 构建URL参数
        const params = new URLSearchParams();
        if (severity) params.append('severity', severity);
        if (status) params.append('status', status);
        if (deviceType) params.append('deviceType', deviceType);
        if (keyword) params.append('keyword', keyword);

        console.log('加载告警数据，过滤条件:', { severity, status, deviceType, keyword });

        // 调用后端API
        fetchWithAuth(`${this.apiBaseUrl}/list?${params.toString()}`)
            .then(data => {
                if (data.code === 200) {
                    this.alertData = data.data || [];
                    this.filteredData = [...this.alertData];
                    
                    this.renderAlertTable();
                    this.renderPagination();
                    this.updateLastUpdateTime();
                    
                    // 如果有目标告警ID，高亮显示
                    if (this.currentAlertId) {
                        setTimeout(() => {
                            this.highlightAlert(this.currentAlertId);
                        }, 500);
                    }
                } else {
                    console.error('加载告警数据失败:', data.message);
                    this.showError('加载数据失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('请求失败:', error);
                this.showError('网络错误，请检查后端服务');
                
                // 如果后端不可用，使用示例数据
                this.loadExampleData();
            });
    },

    // 加载示例数据（当后端不可用时）
    loadExampleData: function() {
        console.log('使用示例告警数据');
        
        const now = new Date();
        const exampleData = [
            {
                id: 1,
                severity: 'critical',
                message: '路由器-01 CPU使用率过高',
                device_name: '路由器-01',
                device_type: 'router',
                status: 'acknowledged',
                occurred_time: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
                metric_value: '95%',
                threshold: '90%'
            },
            {
                id: 2,
                severity: 'critical',
                message: '核心交换机-01 内存不足',
                device_name: '核心交换机-01',
                device_type: 'switch',
                status: 'active',
                occurred_time: new Date(now.getTime() - 7 * 60 * 1000).toISOString(),
                metric_value: '98%',
                threshold: '85%'
            },
            {
                id: 3,
                severity: 'critical',
                message: 'API网关-01 服务异常',
                device_name: 'API网关-01',
                device_type: 'server',
                status: 'active',
                occurred_time: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
                metric_value: '5000ms',
                threshold: '2000ms'
            },
            {
                id: 4,
                severity: 'warning',
                message: '无线AP-01 连接数过多',
                device_name: '无线AP-01',
                device_type: 'wireless',
                status: 'active',
                occurred_time: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
                metric_value: '80个',
                threshold: '70个'
            },
            {
                id: 5,
                severity: 'warning',
                message: '接入交换机-01 端口利用率高',
                device_name: '接入交换机-01',
                device_type: 'switch',
                status: 'acknowledged',
                occurred_time: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
                metric_value: '85%',
                threshold: '80%'
            },
            {
                id: 6,
                severity: 'warning',
                message: 'VPN网关-01 隧道连接不稳定',
                device_name: 'VPN网关-01',
                device_type: 'router',
                status: 'active',
                occurred_time: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
                metric_value: '75%',
                threshold: '90%'
            },
            {
                id: 7,
                severity: 'warning',
                message: '防火墙-02 规则匹配率异常',
                device_name: '防火墙-02',
                device_type: 'firewall',
                status: 'acknowledged',
                occurred_time: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
                metric_value: '150%',
                threshold: '120%'
            },
            {
                id: 8,
                severity: 'warning',
                message: '无线AP-02 信号强度下降',
                device_name: '无线AP-02',
                device_type: 'wireless',
                status: 'acknowledged',
                occurred_time: new Date(now.getTime() - 65 * 60 * 1000).toISOString(),
                metric_value: '-75dBm',
                threshold: '-65dBm'
            },
            {
                id: 9,
                severity: 'info',
                message: '核心交换机-01 端口状态变更',
                device_name: '核心交换机-01',
                device_type: 'switch',
                status: 'resolved',
                occurred_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                metric_value: 'up',
                threshold: 'down'
            },
            {
                id: 10,
                severity: 'info',
                message: 'API网关-01 性能监控报告',
                device_name: 'API网关-01',
                device_type: 'server',
                status: 'resolved',
                occurred_time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                metric_value: '99.9%',
                threshold: '99.5%'
            }
        ];
        
        this.alertData = exampleData;
        this.filteredData = [...this.alertData];
        
        this.renderAlertTable();
        this.renderPagination();
        this.updateLastUpdateTime();
        
        // 如果有目标告警ID，高亮显示
        if (this.currentAlertId) {
            setTimeout(() => {
                this.highlightAlert(this.currentAlertId);
            }, 500);
        }
    },

    // 高亮显示特定告警
    highlightAlert: function(alertId) {
        console.log('高亮显示告警:', alertId);
        
        const alertRow = document.querySelector(`tr[data-alert-id="${alertId}"]`);
        if (alertRow) {
            alertRow.classList.add('highlight-alert');
            alertRow.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // 3秒后移除高亮
            setTimeout(() => {
                alertRow.classList.remove('highlight-alert');
            }, 3000);
            
            console.log('成功高亮告警:', alertId);
        } else {
            console.warn('未找到告警行:', alertId);
        }
    },

    // 从后端加载统计数据
    loadStatistics: function() {
        fetchWithAuth(`${this.apiBaseUrl}/statistics`)
            .then(data => {
                if (data.code === 200) {
                    const stats = data.data;
                    this.updateStatisticsDisplay(stats);
                }
            })
            .catch(error => {
                console.error('加载统计数据失败:', error);
            });
    },

    // 过滤告警（重新从后端加载）
    filterAlerts: function() {
        this.currentPage = 1;
        this.loadAlertData();
        this.loadStatistics();
    },

    // 按日期过滤告警数据
    filterAlertsByDate: function(alerts, targetDate) {
        if (!targetDate) {
            return alerts;
        }
        
        console.log('按日期过滤告警:', targetDate);
        
        // 获取目标日期的Date对象
        const targetDateObj = new Date(targetDate);
        const todayDateStr = new Date().toISOString().split('T')[0];
        
        // 如果目标日期是今天，则不进行严格的日期过滤（因为示例数据都是今天的）
        if (targetDate === todayDateStr) {
            console.log('目标日期是今天，显示所有告警');
            return alerts;
        }
        
        // 对于非今天的日期，进行严格过滤
        return alerts.filter(alert => {
            const alertDate = new Date(alert.occurred_time || alert.occurredTime);
            const alertDateStr = alertDate.toISOString().split('T')[0];
            const match = alertDateStr === targetDate;
            if (!match) {
                console.log(`告警 ${alert.id} 日期不匹配: ${alertDateStr} !== ${targetDate}`);
            }
            return match;
        });
    },

    // 支持多选条件的筛选（前端过滤）
    filterAlertsWithMultipleConditions: function(selectedSeverities, selectedStatuses) {
        console.log('开始多条件筛选...');

        // 如果没有选中任何条件，加载所有数据
        if (selectedSeverities.length === 0 && selectedStatuses.length === 0) {
            console.log('没有筛选条件，加载所有数据');
            this.filterAlerts();
            return;
        }

        // 获取其他筛选条件
        const deviceType = document.getElementById('deviceTypeFilter')?.value || '';
        const keyword = document.getElementById('searchInput')?.value || '';

        // 构建URL参数（不包含severity和status，因为要支持多选）
        const params = new URLSearchParams();
        if (deviceType) params.append('deviceType', deviceType);
        if (keyword) params.append('keyword', keyword);

        // 先加载所有数据（不带severity和status筛选）
        fetchWithAuth(`${this.apiBaseUrl}/list?${params.toString()}`)
            .then(data => {
                if (data.code === 200) {
                    let allData = data.data || [];
                    console.log('从后端获取的数据数量:', allData.length);

                    // 在前端进行多选筛选
                    this.filteredData = allData.filter(alert => {
                        // 检查严重程度
                        const severityMatch = selectedSeverities.length === 0 ||
                            selectedSeverities.includes(alert.severity);

                        // 检查状态
                        const statusMatch = selectedStatuses.length === 0 ||
                            selectedStatuses.includes(alert.status);

                        return severityMatch && statusMatch;
                    });

                    console.log('筛选后的数据数量:', this.filteredData.length);

                    this.alertData = allData;
                    this.currentPage = 1;
                    this.renderAlertTable();
                    this.renderPagination();
                    this.updateLastUpdateTime();
                } else {
                    console.error('加载告警数据失败:', data.message);
                    this.showError('加载数据失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('请求失败:', error);
                this.showError('网络错误，请检查后端服务');
            });
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
                <td>${alert.deviceName || '-'}</td>
                <td>${this.formatDateTime(alert.occurredTime)}</td>
                <td><span class="status-badge status-${alert.status}">${this.getStatusText(alert.status)}</span></td>
                <td>
                    <button class="action-btn view" onclick="AlertCenter.viewAlert(${alert.id})">查看</button>
                    ${alert.status === 'active' ? `<button class="action-btn acknowledge" onclick="AlertCenter.acknowledgeAlert(${alert.id})">确认</button>` : ''}
                    ${alert.status !== 'resolved' ? `<button class="action-btn resolve" onclick="AlertCenter.resolveAlert(${alert.id})">解决</button>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });

        // 为新添加的复选框添加事件监听器
        const checkboxes = document.querySelectorAll('.alert-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBatchButtonState();
            });
        });

        // 初始化按钮状态
        this.updateBatchButtonState();
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

                // 移除自动筛选，只更新选中状态
                // AlertCenter.applyQuickFilters();
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

        console.log('应用快速筛选 - 选中的级别:', selectedSeverities);
        console.log('应用快速筛选 - 选中的状态:', selectedStatuses);

        // 设置下拉框的值
        // 如果只选中一个，设置下拉框；如果选中多个或没选，清空下拉框
        if (selectedSeverities.length === 1) {
            document.getElementById('severityFilter').value = selectedSeverities[0];
        } else {
            document.getElementById('severityFilter').value = '';
        }

        if (selectedStatuses.length === 1) {
            document.getElementById('statusFilter').value = selectedStatuses[0];
        } else {
            document.getElementById('statusFilter').value = '';
        }

        // 执行筛选（支持多选）
        this.filterAlertsWithMultipleConditions(selectedSeverities, selectedStatuses);
    },

    // 清除快速筛选
    clearQuickFilters: function() {
        // 取消所有选中状态
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.filter-option').classList.remove('selected');
        });

        // 清除下拉框的选择
        document.getElementById('severityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('deviceTypeFilter').value = '';
        document.getElementById('searchInput').value = '';

        // 清除后立即应用筛选（显示所有数据）
        this.applyQuickFilters();
    },

    // 更新统计数据显示
    updateStatisticsDisplay: function(stats) {
        // 更新筛选栏的数字显示
        document.getElementById('criticalCount').textContent = stats.critical || 0;
        document.getElementById('warningCount').textContent = stats.warning || 0;
        document.getElementById('infoCount').textContent = stats.info || 0;
        document.getElementById('resolvedCount').textContent = stats.resolvedCount || 0;
        document.getElementById('activeCount').textContent = stats.activeCount || 0;
        document.getElementById('acknowledgedCount').textContent = stats.acknowledgedCount || 0;

        // 重新计算图表数据（新规则：已解决优先，否则按告警级别分类）
        const chartStats = this.calculateChartStatistics();

        const total = stats.total || 0;

        // 更新图表区域
        document.getElementById('totalAlerts').textContent = total;
        document.getElementById('centerTotal').textContent = total;

        // 更新环形图
        this.updateDonutChart(chartStats, total);
    },

    // 计算图表统计数据（新的分类规则）
    calculateChartStatistics: function() {
        const stats = {
            critical: 0,
            warning: 0,
            info: 0,
            resolved: 0
        };

        if (!this.alertData || this.alertData.length === 0) {
            return stats;
        }

        // 遍历所有告警数据
        this.alertData.forEach(alert => {
            // 如果状态是已解决，归类到"已解决"
            if (alert.status === 'resolved') {
                stats.resolved++;
            } else {
                // 否则按照告警级别分类
                if (alert.severity === 'critical') {
                    stats.critical++;
                } else if (alert.severity === 'warning') {
                    stats.warning++;
                } else if (alert.severity === 'info') {
                    stats.info++;
                }
            }
        });

        console.log('图表统计数据:', stats);
        return stats;
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

        const labels = {
            critical: '严重',
            warning: '警告',
            info: '信息',
            resolved: '已解决'
        };

        // 保存扇形数据，用于鼠标悬停检测
        const slices = [];
        let currentAngle = -Math.PI / 2; // 从顶部开始

        Object.keys(stats).forEach(key => {
            if (stats[key] > 0) {
                const sliceAngle = (stats[key] / total) * 2 * Math.PI;

                // 保存扇形信息
                slices.push({
                    key: key,
                    label: labels[key],
                    value: stats[key],
                    percentage: ((stats[key] / total) * 100).toFixed(1),
                    startAngle: currentAngle,
                    endAngle: currentAngle + sliceAngle,
                    color: colors[key]
                });

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

        // 保存扇形数据到canvas，用于鼠标事件
        canvas.chartData = {
            slices: slices,
            centerX: centerX,
            centerY: centerY,
            outerRadius: outerRadius,
            innerRadius: innerRadius
        };

        // 移除旧的事件监听器
        canvas.onmousemove = null;
        canvas.onmouseleave = null;

        // 添加鼠标移动事件
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 计算鼠标相对于圆心的位置
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // 检查是否在环形区域内
            if (distance >= innerRadius && distance <= outerRadius) {
                // 查找鼠标所在的扇形
                let hoveredSlice = null;
                for (let slice of slices) {
                    let normalizedAngle = angle;
                    if (normalizedAngle < -Math.PI / 2) {
                        normalizedAngle += 2 * Math.PI;
                    }

                    let startAngle = slice.startAngle;
                    let endAngle = slice.endAngle;

                    if (startAngle < -Math.PI / 2) {
                        startAngle += 2 * Math.PI;
                    }
                    if (endAngle < -Math.PI / 2) {
                        endAngle += 2 * Math.PI;
                    }

                    if (normalizedAngle >= startAngle && normalizedAngle <= endAngle) {
                        hoveredSlice = slice;
                        break;
                    }
                }

                if (hoveredSlice) {
                    canvas.style.cursor = 'pointer';
                    this.showChartTooltip(canvas, hoveredSlice, e.clientX, e.clientY);
                } else {
                    canvas.style.cursor = 'default';
                    this.hideChartTooltip();
                }
            } else {
                canvas.style.cursor = 'default';
                this.hideChartTooltip();
            }
        };

        // 添加鼠标离开事件
        canvas.onmouseleave = () => {
            canvas.style.cursor = 'default';
            this.hideChartTooltip();
        };
    },

    // 显示图表提示框
    showChartTooltip: function(canvas, slice, x, y) {
        let tooltip = document.getElementById('chartTooltip');

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chartTooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '14px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '10000';
            tooltip.style.whiteSpace = 'nowrap';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${slice.label}</div>
            <div>数量: ${slice.value}</div>
            <div>占比: ${slice.percentage}%</div>
        `;

        tooltip.style.display = 'block';
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y + 10) + 'px';
    },

    // 隐藏图表提示框
    hideChartTooltip: function() {
        const tooltip = document.getElementById('chartTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
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
        fetchWithAuth(`${this.apiBaseUrl}/${alertId}`)
            .then(data => {
                if (data.code === 200) {
                    const alert = data.data;
                    this.currentAlertId = alertId;

                    const modalContent = document.getElementById('alertDetailContent');
                    modalContent.innerHTML = `
                        <div style="margin-bottom: 15px;">
                            <strong>告警级别:</strong> <span class="severity-badge severity-${alert.severity}">${this.getSeverityText(alert.severity)}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>告警信息:</strong> ${alert.message}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>设备:</strong> ${alert.deviceName || '-'}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>设备类型:</strong> ${alert.deviceType || '-'}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>发生时间:</strong> ${this.formatDateTime(alert.occurredTime)}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>状态:</strong> <span class="status-badge status-${alert.status}">${this.getStatusText(alert.status)}</span>
                        </div>
                        ${alert.acknowledgedBy ? `<div style="margin-bottom: 15px;"><strong>确认人:</strong> ${alert.acknowledgedBy}</div>` : ''}
                        ${alert.acknowledgedTime ? `<div style="margin-bottom: 15px;"><strong>确认时间:</strong> ${this.formatDateTime(alert.acknowledgedTime)}</div>` : ''}
                        ${alert.resolvedBy ? `<div style="margin-bottom: 15px;"><strong>解决人:</strong> ${alert.resolvedBy}</div>` : ''}
                        ${alert.resolvedTime ? `<div style="margin-bottom: 15px;"><strong>解决时间:</strong> ${this.formatDateTime(alert.resolvedTime)}</div>` : ''}
                        <div style="margin-bottom: 15px;">
                            <strong>详细描述:</strong> ${alert.description || '无'}
                        </div>
                    `;

                    document.getElementById('alertDetailModal').style.display = 'block';
                } else {
                    this.showError('获取告警详情失败');
                }
            })
            .catch(error => {
                console.error('获取告警详情失败:', error);
                this.showError('网络错误');
            });
    },

    // 确认告警
    acknowledgeAlert: function(alertId) {
        if (!alertId) {
            alertId = this.currentAlertId;
        }

        if (!alertId) return;

        if (!confirm('确定要确认这条告警吗？')) return;

        fetchWithAuth(`${this.apiBaseUrl}/acknowledge/${alertId}`, {
            method: 'PUT'
        })
            .then(data => {
                if (data.code === 200) {
                    this.showSuccess('确认成功');
                    this.loadAlertData();
                    this.loadStatistics();
                    this.closeModal();
                } else {
                    this.showError('确认失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('确认告警失败:', error);
                this.showError('网络错误');
            });
    },

    // 解决告警
    resolveAlert: function(alertId) {
        if (!alertId) {
            alertId = this.currentAlertId;
        }

        if (!alertId) return;

        if (!confirm('确定要解决这条告警吗？')) return;

        fetchWithAuth(`${this.apiBaseUrl}/resolve/${alertId}`, {
            method: 'PUT'
        })
            .then(data => {
                if (data.code === 200) {
                    this.showSuccess('解决成功');
                    this.loadAlertData();
                    this.loadStatistics();
                    this.closeModal();
                } else {
                    this.showError('解决失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('解决告警失败:', error);
                this.showError('网络错误');
            });
    },

    // 更新批量确认按钮状态
    updateBatchButtonState: function() {
        const selectedCheckboxes = document.querySelectorAll('.alert-checkbox:checked');
        const acknowledgeBtn = document.getElementById('acknowledgeAllBtn');
        
        if (selectedCheckboxes.length === 0) {
            // 没有选中任何告警
            acknowledgeBtn.disabled = true;
            acknowledgeBtn.innerHTML = '<i class="fas fa-check"></i> 批量确认';
            acknowledgeBtn.title = '请先选择要确认的告警';
            return;
        }

        // 统计活跃状态的告警数量
        let activeCount = 0;
        let totalSelected = selectedCheckboxes.length;
        
        selectedCheckboxes.forEach(checkbox => {
            const alertId = parseInt(checkbox.getAttribute('data-id'));
            const alert = this.alertData.find(a => a.id === alertId);
            if (alert && alert.status === 'active') {
                activeCount++;
            }
        });

        if (activeCount === 0) {
            // 选中的都不是活跃状态
            acknowledgeBtn.disabled = true;
            acknowledgeBtn.innerHTML = '<i class="fas fa-check"></i> 批量确认 (无可确认项)';
            acknowledgeBtn.title = '所选告警均不是活跃状态，无法确认';
        } else if (activeCount === totalSelected) {
            // 选中的都是活跃状态
            acknowledgeBtn.disabled = false;
            acknowledgeBtn.innerHTML = `<i class="fas fa-check"></i> 批量确认 (${activeCount})`;
            acknowledgeBtn.title = `确认 ${activeCount} 条活跃告警`;
        } else {
            // 部分是活跃状态
            acknowledgeBtn.disabled = false;
            acknowledgeBtn.innerHTML = `<i class="fas fa-check"></i> 批量确认 (${activeCount}/${totalSelected})`;
            acknowledgeBtn.title = `确认 ${activeCount} 条活跃告警，跳过 ${totalSelected - activeCount} 条非活跃告警`;
        }
    },

    // 批量确认选中的告警
    acknowledgeSelected: function() {
        const selectedCheckboxes = document.querySelectorAll('.alert-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            this.showError('请先选择要确认的告警');
            return;
        }

        // 筛选出只有活跃状态的告警
        const activeAlerts = [];
        const skippedAlerts = [];
        
        selectedCheckboxes.forEach(checkbox => {
            const alertId = parseInt(checkbox.getAttribute('data-id'));
            // 从当前数据中找到对应的告警
            const alert = this.alertData.find(a => a.id === alertId);
            if (alert) {
                if (alert.status === 'active') {
                    activeAlerts.push(alertId);
                } else {
                    skippedAlerts.push({id: alertId, status: alert.status});
                }
            }
        });

        if (activeAlerts.length === 0) {
            if (skippedAlerts.length > 0) {
                this.showError('所选告警均不是活跃状态，无法确认');
            } else {
                this.showError('未找到可确认的告警');
            }
            return;
        }

        // 构建确认消息
        let confirmMessage = `确定要确认 ${activeAlerts.length} 条活跃告警吗？`;
        if (skippedAlerts.length > 0) {
            confirmMessage += `\n注意：将跳过 ${skippedAlerts.length} 条非活跃状态的告警`;
        }

        if (!confirm(confirmMessage)) return;

        const promises = [];
        activeAlerts.forEach(alertId => {
            promises.push(
                fetchWithAuth(`${this.apiBaseUrl}/acknowledge/${alertId}`, {
                    method: 'PUT'
                })
            );
        });

        Promise.all(promises)
            .then(() => {
                let successMessage = `成功确认 ${activeAlerts.length} 条告警`;
                if (skippedAlerts.length > 0) {
                    successMessage += `，跳过 ${skippedAlerts.length} 条非活跃告警`;
                }
                this.showSuccess(successMessage);
                this.loadAlertData();
                this.loadStatistics();
                document.getElementById('selectAll').checked = false;
            })
            .catch(error => {
                console.error('批量确认失败:', error);
                this.showError('批量确认失败');
            });
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
        // 显示刷新动画
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn.querySelector('i');
        icon.style.animation = 'spin 1s linear';

        this.loadAlertData();
        this.loadStatistics();

        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    },

    // 格式化日期时间
    formatDateTime: function(dateTime) {
        if (!dateTime) return '-';

        // 如果是字符串，转换为Date对象
        const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

        if (isNaN(date.getTime())) return dateTime;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 显示成功消息
    showSuccess: function(message) {
        alert(message); // 可以替换为更好的提示组件
    },

    // 显示错误消息
    showError: function(message) {
        alert(message); // 可以替换为更好的提示组件
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
