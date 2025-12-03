// 视频管理类
class VideoManager {
    constructor() {
        this.deviceData = {
            normal: 0,
            abnormal: 0,
            fault: 0,
            todayFault: 0,
            available: 0
        };
        
        this.deviceTypes = {
            '摄像头': { count: 45, color: '#FF6384' },
            '录像机': { count: 12, color: '#36A2EB' },
            '显示器': { count: 8, color: '#FFCE56' },
            '交换机': { count: 15, color: '#4BC0C0' },
            '服务器': { count: 6, color: '#9966FF' },
            '存储设备': { count: 10, color: '#FF9F40' },
            '网关': { count: 4, color: '#FF6384' },
            '其他': { count: 3, color: '#C9CBCF' }
        };
        
        this.faultData = {
            offline: 0,
            fault: 0,
            maintenance: 0
        };
        
        this.charts = {};
        
        // 设备列表分页参数
        this.pagination = {
            currentPage: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0
        };
        
        // 当前筛选条件
        this.currentFilter = {
            type: null,  // 'status' 或 'deviceType'
            value: null  // 具体的值
        };
        
        this.init();
    }

    async init() {
        this.initEventListeners();
        await this.loadMockData();
        this.updateStats();
        this.initCharts();
        this.loadDeviceList();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 侧边栏导航事件
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span').textContent;
                console.log('导航到:', itemText);
                this.navigateToPage(itemText);
            });
        });
        
        // 统计卡片点击事件
        document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
            card.addEventListener('click', () => {
                const filterType = card.dataset.filter;
                const filterValue = card.dataset.value;
                this.filterDevices(filterType, filterValue);
            });
            
            // 悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // 故障统计项点击事件
        document.querySelectorAll('.fault-item[data-filter]').forEach(item => {
            item.addEventListener('click', () => {
                const filterType = item.dataset.filter;
                const filterValue = item.dataset.value;
                this.filterDevices(filterType, filterValue);
            });
            
            // 悬停效果
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f3f4f6';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
        });
        
        // 分页按钮事件
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (this.pagination.currentPage > 1) {
                this.pagination.currentPage--;
                this.loadDeviceList();
            }
        });
        
        document.getElementById('nextPageBtn').addEventListener('click', () => {
            if (this.pagination.currentPage < this.pagination.totalPages) {
                this.pagination.currentPage++;
                this.loadDeviceList();
            }
        });
        
        // 清除筛选按钮
        document.getElementById('clearFilterBtn').addEventListener('click', () => {
            this.clearFilter();
        });
    }

    // 从Asset表加载视频设备数据
    async loadMockData() {
        try {
            console.log('开始从Asset表加载视频设备数据...');
            
            // 从Asset表获取视频设备数据（categoryId: 15-22）
            console.log('🔍 正在调用API: /api/asset/list?videoDevicesOnly=true');
            const response = await fetch('/api/asset/list?videoDevicesOnly=true');
            console.log('📡 API响应状态:', response.status, response.statusText);
            const result = await response.json();
            console.log('📊 API返回结果:', result);
            
            if (result.code === 200 && result.data) {
                const videoDevices = result.data;
                console.log('视频设备数据加载成功:', videoDevices);
                console.log('视频设备总数:', videoDevices.length);
                
                // 统计设备状态
                const onlineDevices = videoDevices.filter(device => device.assetStatus === 'online').length;
                const offlineDevices = videoDevices.filter(device => device.assetStatus === 'offline').length;
                const maintenanceDevices = videoDevices.filter(device => device.assetStatus === 'maintenance').length;
                
                // 更新设备状态统计
                this.deviceData.normal = onlineDevices;
                this.deviceData.abnormal = offlineDevices + maintenanceDevices;
                this.deviceData.fault = offlineDevices;
                this.deviceData.todayFault = Math.floor(offlineDevices * 0.3); // 假设30%是今日新增
                this.deviceData.available = onlineDevices;
                
                // 更新故障统计
                this.faultData.offline = offlineDevices;
                this.faultData.fault = Math.floor(offlineDevices * 0.7); // 假设70%是故障
                this.faultData.maintenance = maintenanceDevices;
                
                // 统计设备类型分布
                this.deviceTypes = {};
                const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF8C00', '#C9CBCF'];
                const categoryMap = {
                    15: '摄像头',
                    16: '视频交换机',
                    17: '录像机',
                    18: '视频存储',
                    19: '显示器',
                    20: '视频服务器',
                    21: '视频网关',
                    22: '其他视频设备'
                };
                
                // 按分类统计设备数量
                const categoryStats = {};
                videoDevices.forEach(device => {
                    const categoryName = categoryMap[device.categoryId] || '未知设备';
                    categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1;
                });
                
                // 转换为图表数据格式
                let colorIndex = 0;
                Object.entries(categoryStats).forEach(([typeName, count]) => {
                    this.deviceTypes[typeName] = {
                        count: count,
                        color: colors[colorIndex % colors.length]
                    };
                    colorIndex++;
                });
                
                console.log('设备状态统计:', {
                    online: onlineDevices,
                    offline: offlineDevices,
                    maintenance: maintenanceDevices,
                    total: videoDevices.length
                });
                console.log('设备类型分布:', this.deviceTypes);
                
            } else {
                console.warn('视频设备数据加载失败，使用默认值');
                this.loadDefaultData();
            }
            
        } catch (error) {
            console.error('加载视频设备数据失败:', error);
            this.loadDefaultData();
        }
    }
    
    // 加载默认数据（作为备用）
    loadDefaultData() {
        console.log('⚠️ 使用默认视频设备数据');
        const totalDevices = 20; // 视频设备总数
        this.deviceData.normal = 15; // 正常设备
        this.deviceData.abnormal = 5; // 异常设备
        this.deviceData.fault = 3; // 故障设备
        this.deviceData.todayFault = 1; // 今日新增故障
        this.deviceData.available = this.deviceData.normal;
        
        this.faultData.offline = 3; // 离线设备
        this.faultData.fault = 2; // 故障设备
        this.faultData.maintenance = 2; // 维护设备
        
        // 设置默认设备类型分布
        this.deviceTypes = {
            '摄像头': { count: 8, color: '#FF6384' },
            '录像机': { count: 3, color: '#36A2EB' },
            '视频交换机': { count: 2, color: '#FFCE56' },
            '显示器': { count: 3, color: '#4BC0C0' },
            '视频服务器': { count: 2, color: '#9966FF' },
            '视频存储': { count: 2, color: '#FF9F40' }
        };
        
        console.log('默认数据设置完成:', {
            deviceData: this.deviceData,
            faultData: this.faultData,
            deviceTypes: this.deviceTypes
        });
    }

    // 更新统计数据
    updateStats() {
        document.getElementById('normalDevices').textContent = this.deviceData.normal;
        document.getElementById('abnormalDevices').textContent = this.deviceData.abnormal;
        
        // 更新故障统计
        document.getElementById('offlineCount').textContent = this.faultData.offline;
        document.getElementById('faultCount').textContent = this.faultData.fault;
        document.getElementById('maintenanceCount').textContent = this.faultData.maintenance;
    }

    // 初始化图表
    async initCharts() {
        this.initDeviceTypeChart();
        await this.initAvailabilityTrendChart();
        this.renderDeviceTypeLegend();
    }

    // 初始化设备类型分布饼图
    initDeviceTypeChart() {
        const ctx = document.getElementById('deviceTypeChart').getContext('2d');
        
        const labels = Object.keys(this.deviceTypes);
        const data = Object.values(this.deviceTypes).map(type => type.count);
        const colors = Object.values(this.deviceTypes).map(type => type.color);
        
        this.charts.deviceType = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const deviceTypeName = labels[index];
                        const deviceTypeKey = this.getDeviceTypeKey(deviceTypeName);
                        this.filterDevices('deviceType', deviceTypeKey);
                    }
                }
            }
        });
    }
    
    // 获取设备类型的key
    getDeviceTypeKey(typeName) {
        const typeMap = {
            '摄像头': 'camera',
            '录像机': 'nvr',
            '显示器': 'monitor',
            '交换机': 'switch',
            '服务器': 'server',
            '存储设备': 'storage',
            '网关': 'gateway',
            '其他': 'other'
        };
        return typeMap[typeName] || typeName;
    }

    // 渲染设备类型图例
    renderDeviceTypeLegend() {
        const legendContainer = document.getElementById('deviceTypeLegend');
        const legendItems = Object.entries(this.deviceTypes).map(([name, data]) => {
            const total = Object.values(this.deviceTypes).reduce((sum, type) => sum + type.count, 0);
            const percentage = ((data.count / total) * 100).toFixed(0);
            
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${data.color}"></div>
                    <span>${name} (${percentage}%)</span>
                </div>
            `;
        }).join('');
        
        legendContainer.innerHTML = legendItems;
    }

    // 初始化异常趋势图
    async initAbnormalTrendChart() {
        const ctx = document.getElementById('abnormalTrendChart');
        if (!ctx) {
            console.warn('abnormalTrendChart canvas not found');
            return;
        }
        
        try {
            const response = await fetch('/api/view/abnormal-trend?days=7');
            const result = await response.json();
            
            let dates = [];
            let abnormalData = [];
            
            if (result.success && result.data && result.data.length > 0) {
                console.log('异常趋势数据加载成功:', result.data);
                dates = result.data.map(item => this.formatDate(item.date));
                abnormalData = result.data.map(item => item.abnormal_count || 0);
            } else {
                console.warn('异常趋势数据为空，使用默认数据');
                dates = this.generateDateLabels(7);
                abnormalData = this.generateTrendData(7, 0, 10);
            }
            
            this.charts.abnormalTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: '异常数量',
                        data: abnormalData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f1f3f4'
                            }
                        },
                        x: {
                            grid: {
                                color: '#f1f3f4'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('初始化异常趋势图失败:', error);
        }
    }

    // 初始化可用性趋势图
    async initAvailabilityTrendChart() {
        const ctx = document.getElementById('availabilityTrendChart');
        if (!ctx) {
            console.warn('availabilityTrendChart canvas not found');
            return;
        }
        
        // 基于当前设备数据生成可用性趋势
        const dates = this.generateDateLabels(7);
        let availabilityData = [];
        
        // 计算当前可用性百分比
        const totalDevices = this.deviceData.normal + this.deviceData.abnormal;
        const currentAvailability = totalDevices > 0 ? 
            Math.round((this.deviceData.normal / totalDevices) * 100) : 0;
        
        console.log('当前视频设备可用性:', currentAvailability + '%');
        
        // 生成过去7天的模拟趋势数据（基于当前可用性）
        availabilityData = this.generateTrendData(7, Math.max(currentAvailability - 10, 70), currentAvailability + 5);
        
        console.log('生成的可用性趋势数据:', {
            dates: dates,
            availability: availabilityData
        });
        
        this.charts.availabilityTrend = new Chart(ctx, {
            type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: '可用性',
                        data: availabilityData,
                        borderColor: '#10b981',
                        backgroundColor: function(context) {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
                            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
                            return gradient;
                        },
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#10b981',
                        pointHoverBorderWidth: 3,
                        shadowOffsetX: 0,
                        shadowOffsetY: 4,
                        shadowBlur: 10,
                        shadowColor: 'rgba(16, 185, 129, 0.3)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'end',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 13,
                                    family: "'Microsoft YaHei', sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function(context) {
                                    return '可用性: ' + context.parsed.y.toFixed(2) + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 85,
                            max: 100,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.06)',
                                drawBorder: false,
                                lineWidth: 1
                            },
                            border: {
                                display: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                },
                                font: {
                                    size: 13,
                                    family: "'Microsoft YaHei', sans-serif",
                                    weight: '500'
                                },
                                color: '#6b7280',
                                padding: 12,
                                stepSize: 3
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.04)',
                                drawBorder: false,
                                lineWidth: 1
                            },
                            border: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 13,
                                    family: "'Microsoft YaHei', sans-serif",
                                    weight: '500'
                                },
                                color: '#6b7280',
                                padding: 12,
                                maxRotation: 0,
                                minRotation: 0
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('初始化可用性趋势图失败:', error);
        }
    }

    // 格式化日期
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
    
    // 生成日期标签
    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
        }
        
        return labels;
    }

    // 生成趋势数据
    generateTrendData(days, min, max) {
        const data = [];
        
        for (let i = 0; i < days; i++) {
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push(value);
        }
        
        return data;
    }

    // 刷新数据
    refreshData() {
        this.loadMockData();
        this.updateStats();
        
        // 重新生成图表数据
        if (this.charts.faultTrend) {
            const newFaultData = this.generateTrendData(7, 0, 10);
            this.charts.faultTrend.data.datasets[0].data = newFaultData;
            this.charts.faultTrend.update();
        }
        
        if (this.charts.availabilityTrend) {
            const newAvailabilityData = this.generateTrendData(7, 85, 100);
            this.charts.availabilityTrend.data.datasets[0].data = newAvailabilityData;
            this.charts.availabilityTrend.update();
        }
        
        console.log('数据已刷新');
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 3000;
            font-size: 14px;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    // 侧边栏导航功能
    navigateToPage(menuItem) {
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
            if (targetPage === '视频管理.html') {
                console.log('当前已在视频管理页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
    
    // 从Asset表加载视频设备列表
    async loadDeviceList() {
        try {
            console.log('从Asset表加载视频设备列表，页码:', this.pagination.currentPage, '筛选条件:', this.currentFilter);
            
            // 从Asset表获取视频设备数据
            const response = await fetch('/api/asset/list?videoDevicesOnly=true');
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                let videoDevices = result.data;
                console.log('获取到视频设备数据:', videoDevices.length, '台');
                
                // 应用筛选条件
                if (this.currentFilter.type && this.currentFilter.value) {
                    if (this.currentFilter.type === 'status') {
                        if (this.currentFilter.value === 'abnormal') {
                            // 异常设备：offline, maintenance
                            videoDevices = videoDevices.filter(device => 
                                device.assetStatus === 'offline' || device.assetStatus === 'maintenance'
                            );
                        } else {
                            videoDevices = videoDevices.filter(device => 
                                device.assetStatus === this.currentFilter.value
                            );
                        }
                    } else if (this.currentFilter.type === 'deviceType') {
                        // 按设备类型筛选
                        const categoryMap = {
                            '摄像头': 15,
                            '视频交换机': 16,
                            '录像机': 17,
                            '视频存储': 18,
                            '显示器': 19,
                            '视频服务器': 20,
                            '视频网关': 21,
                            '其他视频设备': 22
                        };
                        const targetCategoryId = categoryMap[this.currentFilter.value];
                        if (targetCategoryId) {
                            videoDevices = videoDevices.filter(device => 
                                device.categoryId === targetCategoryId
                            );
                        }
                    }
                }
                
                console.log('筛选后的设备数量:', videoDevices.length);
                
                // 计算分页
                const total = videoDevices.length;
                const totalPages = Math.ceil(total / this.pagination.pageSize);
                const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
                const endIndex = startIndex + this.pagination.pageSize;
                const pageDevices = videoDevices.slice(startIndex, endIndex);
                
                // 转换为视频管理页面需要的格式
                const formattedDevices = pageDevices.map(asset => ({
                    id: asset.id,
                    name: asset.deviceName || asset.assetName,
                    ip: asset.ipAddress || '未设置',
                    status: asset.assetStatus || 'offline',
                    type: this.getCategoryName(asset.categoryId),
                    location: asset.location || '未设置',
                    lastUpdate: asset.updateTime || asset.createTime
                }));
                
                this.renderDeviceTable(formattedDevices);
                this.updatePagination(total, totalPages);
            } else {
                console.error('加载视频设备列表失败:', result.message);
                this.renderDeviceTable([]);
            }
        } catch (error) {
            console.error('加载视频设备列表出错:', error);
            this.renderDeviceTable([]);
        }
    }
    
    // 获取分类名称
    getCategoryName(categoryId) {
        const categoryMap = {
            15: '摄像头',
            16: '视频交换机',
            17: '录像机',
            18: '视频存储',
            19: '显示器',
            20: '视频服务器',
            21: '视频网关',
            22: '其他视频设备'
        };
        return categoryMap[categoryId] || '未知设备';
    }
    
    // 渲染设备表格
    renderDeviceTable(devices) {
        const tbody = document.getElementById('deviceTableBody');
        
        if (!devices || devices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 40px; text-align: center; color: #9ca3af;">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3;"></i>
                        <div>暂无设备数据</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = devices.map(device => {
            const statusMap = {
                'online': { text: '在线', color: '#10b981', bg: '#d1fae5' },
                'offline': { text: '离线', color: '#6b7280', bg: '#f3f4f6' },
                'fault': { text: '故障', color: '#ef4444', bg: '#fee2e2' },
                'warning': { text: '警告', color: '#f59e0b', bg: '#fef3c7' }
            };
            
            const status = statusMap[device.status] || statusMap['offline'];
            
            return `
                <tr style="border-bottom: 1px solid #e5e7eb; transition: background 0.2s;" 
                    onmouseenter="this.style.background='#f9fafb'" 
                    onmouseleave="this.style.background='white'">
                    <td style="padding: 12px; color: #111827; font-weight: 500;">${device.name || '-'}</td>
                    <td style="padding: 12px; color: #6b7280;">${this.getDeviceTypeText(device.deviceType)}</td>
                    <td style="padding: 12px; color: #6b7280; font-family: monospace;">${device.ipAddress || '-'}</td>
                    <td style="padding: 12px;">
                        <span style="display: inline-block; padding: 4px 12px; background: ${status.bg}; color: ${status.color}; border-radius: 12px; font-size: 12px; font-weight: 500;">
                            ${status.text}
                        </span>
                    </td>
                    <td style="padding: 12px; color: #6b7280;">${device.location || '-'}</td>
                    <td style="padding: 12px; color: #6b7280;">${device.manufacturer || '-'}</td>
                </tr>
            `;
        }).join('');
    }
    
    // 获取设备类型文本
    getDeviceTypeText(type) {
        const typeMap = {
            'camera': '摄像头',
            'nvr': '录像机',
            'monitor': '显示器',
            'switch': '交换机',
            'server': '服务器',
            'storage': '存储设备',
            'gateway': '网关',
            'other': '其他'
        };
        return typeMap[type] || type;
    }
    
    // 更新分页信息
    updatePagination(total, totalPages) {
        this.pagination.total = total;
        this.pagination.totalPages = totalPages;
        
        document.getElementById('totalDevices').textContent = total;
        document.getElementById('currentPage').textContent = this.pagination.currentPage;
        document.getElementById('totalPages').textContent = totalPages;
        
        // 更新按钮状态
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        
        prevBtn.disabled = this.pagination.currentPage <= 1;
        nextBtn.disabled = this.pagination.currentPage >= totalPages;
        
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
    }
    
    // 筛选设备
    filterDevices(filterType, filterValue) {
        console.log('筛选设备:', filterType, filterValue);
        
        this.currentFilter.type = filterType;
        this.currentFilter.value = filterValue;
        this.pagination.currentPage = 1; // 重置到第一页
        
        // 更新标题
        this.updateFilterTitle();
        
        // 显示清除筛选按钮
        document.getElementById('clearFilterBtn').style.display = 'block';
        
        // 加载设备列表
        this.loadDeviceList();
        
        // 滚动到设备列表
        document.querySelector('.device-list-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // 更新筛选标题
    updateFilterTitle() {
        const titleEl = document.getElementById('deviceListTitle');
        
        if (!this.currentFilter.type || !this.currentFilter.value) {
            titleEl.textContent = '全部设备';
            return;
        }
        
        if (this.currentFilter.type === 'status') {
            const statusMap = {
                'online': '在线设备',
                'offline': '离线设备',
                'fault': '故障设备',
                'warning': '维护设备',
                'abnormal': '异常设备'
            };
            titleEl.textContent = statusMap[this.currentFilter.value] || '设备列表';
        } else if (this.currentFilter.type === 'deviceType') {
            titleEl.textContent = this.getDeviceTypeText(this.currentFilter.value);
        }
    }
    
    // 清除筛选
    clearFilter() {
        this.currentFilter.type = null;
        this.currentFilter.value = null;
        this.pagination.currentPage = 1;
        
        document.getElementById('clearFilterBtn').style.display = 'none';
        this.updateFilterTitle();
        this.loadDeviceList();
    }
}

// 初始化应用
let videoManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化视频管理器...');
        videoManager = new VideoManager();
        console.log('视频管理器初始化完成');
    } catch (error) {
        console.error('初始化视频管理器时出错:', error);
    }
});
