// 统计报表管理系统
class ReportManager {
    constructor() {
        this.currentCategory = null;
        this.currentPage = 'list'; // 'list', 'detail', 'preview'
        this.currentData = {};
        this.templates = [];
        this.schedules = [];
        this.charts = {};
        this.currentPageIndex = 1;
        this.pageSize = 10;
        this.totalRecords = 0;
        this.filteredData = [];
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initPreviewEvents();
        this.initModalEvents();
        this.loadCategoryData();
        this.loadLocalData();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 分类卡片点击事件
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.openCategoryDetail(category);
            });
        });

        // 返回按钮
        const backBtn = document.getElementById('backToList');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToList());
        }

        // 表单事件
        this.initFormEvents();



        // 新建报表按钮
        const createBtn = document.getElementById('createNewReport');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createNewReport());
        }

        // 侧边栏导航事件
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span').textContent;
                console.log('导航到:', itemText);
                this.navigateToPage(itemText);
            });
        });
    }

    // 初始化表单事件
    initFormEvents() {
        // 时间范围变化
        const timeRangeSelect = document.getElementById('timeRange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                const customTimeRange = document.getElementById('customTimeRange');
                if (customTimeRange) {
                    customTimeRange.style.display = e.target.value === 'custom' ? 'grid' : 'none';
                }
            });
        }

        // 邮件通知切换
        const emailNotification = document.getElementById('emailNotification');
        if (emailNotification) {
            emailNotification.addEventListener('change', (e) => {
                const emailSettings = document.getElementById('emailSettings');
                if (emailSettings) {
                    emailSettings.style.display = e.target.checked ? 'grid' : 'none';
                }
            });
        }

        // 表单按钮事件
        const previewBtn = document.getElementById('previewReport');
        const saveBtn = document.getElementById('saveReport');
        const reportForm = document.getElementById('reportForm');

        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewReport());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveReport());
        }

        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateReport();
            });
        }

        // 保存模板按钮
        const saveTemplateBtn = document.getElementById('saveTemplate');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => this.showTemplateModal());
        }
    }

    // 初始化预览页面事件
    initPreviewEvents() {
        // 返回表单按钮
        const backToFormBtn = document.getElementById('backToForm');
        if (backToFormBtn) {
            backToFormBtn.addEventListener('click', () => this.backToForm());
        }

        // 预览页面操作按钮
        const refreshPreviewBtn = document.getElementById('refreshPreview');
        const exportPreviewBtn = document.getElementById('exportPreview');
        const shareReportBtn = document.getElementById('shareReport');

        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', () => this.refreshPreview());
        }

        if (exportPreviewBtn) {
            exportPreviewBtn.addEventListener('click', () => this.exportPreview());
        }

        if (shareReportBtn) {
            shareReportBtn.addEventListener('click', () => this.showShareModal());
        }

        // 表格搜索和过滤
        const tableSearch = document.getElementById('tableSearch');
        const tableFilter = document.getElementById('tableFilter');
        const exportTableBtn = document.getElementById('exportTableData');

        if (tableSearch) {
            tableSearch.addEventListener('input', (e) => this.filterTableData(e.target.value));
        }

        if (tableFilter) {
            tableFilter.addEventListener('change', (e) => this.filterTableByType(e.target.value));
        }

        if (exportTableBtn) {
            exportTableBtn.addEventListener('click', () => this.exportTableData());
        }

        // 分页控制
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.nextPage());
        }

        // 图表时间范围切换
        const chartTimeRange = document.getElementById('chartTimeRange');
        if (chartTimeRange) {
            chartTimeRange.addEventListener('change', (e) => this.updateChartTimeRange(e.target.value));
        }
    }

    // 初始化模态框事件
    initModalEvents() {
        // 模板模态框
        this.initTemplateModalEvents();

        // 分享模态框
        this.initShareModalEvents();

        // 定时任务模态框
        this.initScheduleModalEvents();

        // 筛选模态框
        this.initFilterModalEvents();
    }

    // 初始化模板模态框事件
    initTemplateModalEvents() {
        const templateModal = document.getElementById('templateModal');
        const closeTemplateModal = document.getElementById('closeTemplateModal');
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');

        if (closeTemplateModal) {
            closeTemplateModal.addEventListener('click', () => this.hideTemplateModal());
        }

        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => this.saveTemplate());
        }

        // 模板标签页切换
        document.querySelectorAll('#templateModal .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTemplateTab(tabName);
            });
        });

        // 文件输入
        const templateFileInput = document.getElementById('templateFileInput');
        if (templateFileInput) {
            templateFileInput.addEventListener('change', (e) => this.handleTemplateImport(e));
        }
    }

    // 初始化分享模态框事件
    initShareModalEvents() {
        const shareModal = document.getElementById('shareModal');
        const closeShareModal = document.getElementById('closeShareModal');
        const confirmShare = document.getElementById('confirmShare');
        const cancelShare = document.getElementById('cancelShare');
        const copyLink = document.getElementById('copyLink');

        if (closeShareModal) {
            closeShareModal.addEventListener('click', () => this.hideShareModal());
        }

        if (confirmShare) {
            confirmShare.addEventListener('click', () => this.confirmShare());
        }

        if (cancelShare) {
            cancelShare.addEventListener('click', () => this.hideShareModal());
        }

        if (copyLink) {
            copyLink.addEventListener('click', () => this.copyShareLink());
        }

        // 分享方式选择
        document.querySelectorAll('.method-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.selectShareMethod(method);
            });
        });
    }

    // 加载本地数据
    loadLocalData() {
        // 加载模板数据
        const savedTemplates = localStorage.getItem('reportTemplates');
        if (savedTemplates) {
            this.templates = JSON.parse(savedTemplates);
        }

        // 加载定时任务数据
        const savedSchedules = localStorage.getItem('reportSchedules');
        if (savedSchedules) {
            this.schedules = JSON.parse(savedSchedules);
        }
    }

    // 加载分类数据
    loadCategoryData() {
        // 模拟加载分类统计数据
        const categories = {
            performance: { reports: 12, lastUpdate: '2小时前' },
            availability: { reports: 8, lastUpdate: '1小时前' },
            capacity: { reports: 6, lastUpdate: '30分钟前' },
            alarm: { reports: 15, lastUpdate: '15分钟前' },
            network: { reports: 9, lastUpdate: '5分钟前' },
            security: { reports: 7, lastUpdate: '1小时前' }
        };

        // 更新分类卡片数据
        document.querySelectorAll('.category-card').forEach(card => {
            const category = card.dataset.category;
            const data = categories[category];
            if (data) {
                const reportCount = card.querySelector('.stat-item span');
                const lastUpdate = card.querySelectorAll('.stat-item span')[1];
                if (reportCount) reportCount.textContent = `${data.reports} 个报表`;
                if (lastUpdate) lastUpdate.textContent = `最近更新: ${data.lastUpdate}`;
            }
        });
    }

    // 打开分类详情
    openCategoryDetail(category) {
        this.currentCategory = category;
        this.currentPage = 'detail';

        // 隐藏列表页面，显示详情页面
        document.getElementById('reportListPage').style.display = 'none';
        document.getElementById('reportDetailPage').style.display = 'block';

        // 更新详情页标题
        const categoryNames = {
            performance: '性能报表',
            availability: '可用性报表',
            capacity: '容量报表',
            alarm: '告警报表',
            network: '网络报表',
            security: '安全报表'
        };

        document.getElementById('detailTitle').textContent = categoryNames[category] || '报表详情';

        // 预填充表单数据
        this.prefillForm(category);

        this.showNotification(`进入${categoryNames[category]}配置`, 'info');
    }

    // 返回列表页面
    backToList() {
        this.currentPage = 'list';
        document.getElementById('reportDetailPage').style.display = 'none';
        document.getElementById('reportListPage').style.display = 'block';
        this.showNotification('返回报表列表', 'info');
    }

    // 预填充表单数据
    prefillForm(category) {
        const reportTypeSelect = document.getElementById('reportType');
        if (reportTypeSelect) {
            reportTypeSelect.value = category;
        }

        const reportNameInput = document.getElementById('reportName');
        if (reportNameInput) {
            const categoryNames = {
                performance: '性能监控报表',
                availability: '系统可用性报表',
                capacity: '容量使用报表',
                alarm: '告警统计报表',
                network: '网络流量报表',
                security: '安全事件报表'
            };
            reportNameInput.value = categoryNames[category] || '';
        }

        // 根据报表类型预选相关指标
        const metricsCheckboxes = document.querySelectorAll('input[name="metrics"]');
        metricsCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        const categoryMetrics = {
            performance: ['cpu', 'memory', 'response'],
            availability: ['availability'],
            capacity: ['disk'],
            alarm: ['cpu', 'memory', 'disk'],
            network: ['network'],
            security: ['availability']
        };

        const selectedMetrics = categoryMetrics[category] || [];
        selectedMetrics.forEach(metric => {
            const checkbox = document.querySelector(`input[name="metrics"][value="${metric}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // 新建报表
    createNewReport() {
        this.openCategoryDetail('performance');
        this.showNotification('创建新报表', 'info');
    }

    // 预览报表
    previewReport() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) {
            return;
        }

        this.showNotification('正在生成报表预览...', 'info');

        // 模拟预览生成
        setTimeout(() => {
            this.currentData = formData;
            this.showPreviewPage();
            this.generatePreviewData();
            this.showNotification('报表预览已生成', 'success');
        }, 1500);
    }

    // 显示预览页面
    showPreviewPage() {
        this.currentPage = 'preview';
        document.getElementById('reportDetailPage').style.display = 'none';
        document.getElementById('reportPreviewPage').style.display = 'block';

        // 更新预览页面标题和信息
        this.updatePreviewInfo();

        // 重新绑定预览页面的事件监听器
        this.bindPreviewEvents();
    }

    // 绑定预览页面事件（确保在页面显示后绑定）
    bindPreviewEvents() {
        // 返回表单按钮
        const backToFormBtn = document.getElementById('backToForm');

        if (backToFormBtn) {
            // 移除旧的事件监听器（如果存在）
            if (this.backToFormHandler) {
                backToFormBtn.removeEventListener('click', this.backToFormHandler);
            }
            // 绑定新的事件监听器
            this.backToFormHandler = () => this.backToForm();
            backToFormBtn.addEventListener('click', this.backToFormHandler);
        }

        // 刷新预览按钮
        const refreshPreviewBtn = document.getElementById('refreshPreview');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.removeEventListener('click', this.refreshPreviewHandler);
            this.refreshPreviewHandler = () => this.refreshPreview();
            refreshPreviewBtn.addEventListener('click', this.refreshPreviewHandler);
        }

        // 导出预览按钮
        const exportPreviewBtn = document.getElementById('exportPreview');
        if (exportPreviewBtn) {
            exportPreviewBtn.removeEventListener('click', this.exportPreviewHandler);
            this.exportPreviewHandler = () => this.exportPreview();
            exportPreviewBtn.addEventListener('click', this.exportPreviewHandler);
        }

        // 分享报表按钮
        const shareReportBtn = document.getElementById('shareReport');
        if (shareReportBtn) {
            shareReportBtn.removeEventListener('click', this.shareReportHandler);
            this.shareReportHandler = () => this.showShareModal();
            shareReportBtn.addEventListener('click', this.shareReportHandler);
        }

        // 表格搜索
        const tableSearch = document.getElementById('tableSearch');
        if (tableSearch) {
            tableSearch.removeEventListener('input', this.tableSearchHandler);
            this.tableSearchHandler = (e) => this.filterTableData(e.target.value);
            tableSearch.addEventListener('input', this.tableSearchHandler);
        }

        // 表格过滤
        const tableFilter = document.getElementById('tableFilter');
        if (tableFilter) {
            tableFilter.removeEventListener('change', this.tableFilterHandler);
            this.tableFilterHandler = (e) => this.filterTableByType(e.target.value);
            tableFilter.addEventListener('change', this.tableFilterHandler);
        }

        // 导出表格数据
        const exportTableBtn = document.getElementById('exportTableData');
        if (exportTableBtn) {
            exportTableBtn.removeEventListener('click', this.exportTableHandler);
            this.exportTableHandler = () => this.exportTableData();
            exportTableBtn.addEventListener('click', this.exportTableHandler);
        }

        // 分页控制
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (prevPageBtn) {
            prevPageBtn.removeEventListener('click', this.prevPageHandler);
            this.prevPageHandler = () => this.previousPage();
            prevPageBtn.addEventListener('click', this.prevPageHandler);
        }

        if (nextPageBtn) {
            nextPageBtn.removeEventListener('click', this.nextPageHandler);
            this.nextPageHandler = () => this.nextPage();
            nextPageBtn.addEventListener('click', this.nextPageHandler);
        }

        // 图表时间范围切换
        const chartTimeRange = document.getElementById('chartTimeRange');
        if (chartTimeRange) {
            chartTimeRange.removeEventListener('change', this.chartTimeRangeHandler);
            this.chartTimeRangeHandler = (e) => this.updateChartTimeRange(e.target.value);
            chartTimeRange.addEventListener('change', this.chartTimeRangeHandler);
        }
    }

    // 返回表单页面
    backToForm() {
        this.currentPage = 'detail';

        const previewPage = document.getElementById('reportPreviewPage');
        const detailPage = document.getElementById('reportDetailPage');

        if (previewPage && detailPage) {
            previewPage.style.display = 'none';
            detailPage.style.display = 'block';
            this.showNotification('返回报表编辑', 'info');
        } else {
            this.showNotification('页面切换失败', 'error');
        }
    }

    // 更新预览信息
    updatePreviewInfo() {
        const data = this.currentData;

        document.getElementById('previewReportName').textContent = data.reportName || '未命名报表';
        document.getElementById('previewTimeRange').textContent = this.getTimeRangeText(data.timeRange);
        document.getElementById('previewUpdateTime').textContent = new Date().toLocaleString('zh-CN');
        document.getElementById('previewDeviceCount').textContent = `${Math.floor(Math.random() * 200) + 50} 台设备`;
    }

    // 获取时间范围文本
    getTimeRangeText(timeRange) {
        const ranges = {
            'today': '今天',
            'week': '本周',
            'month': '本月',
            'quarter': '本季度',
            'year': '本年',
            'custom': '自定义时间'
        };
        return ranges[timeRange] || '本月';
    }

    // 生成预览数据
    generatePreviewData() {
        const reportType = this.currentData.reportType || 'performance';
        this.generateOverviewData(reportType);
        this.generateChartData(reportType);
        this.generateTableData(reportType);
    }

    // 生成概览数据
    generateOverviewData(reportType) {
        const overviewData = this.getOverviewDataByType(reportType);

        // 更新概览卡片的图标和标签
        this.updateOverviewCards(overviewData);

        // 更新数值
        const values = overviewData.values;
        document.getElementById('avgCpuUsage').textContent = values[0];
        document.getElementById('avgMemoryUsage').textContent = values[1];
        document.getElementById('avgDiskUsage').textContent = values[2];
        document.getElementById('avgNetworkUsage').textContent = values[3];
    }

    // 根据报表类型获取概览数据
    getOverviewDataByType(reportType) {
        const dataTemplates = {
            performance: {
                labels: ['平均CPU使用率', '平均内存使用率', '平均磁盘使用率', '平均网络流量'],
                icons: ['fas fa-microchip', 'fas fa-memory', 'fas fa-hdd', 'fas fa-wifi'],
                values: [
                    (Math.random() * 40 + 40).toFixed(1) + '%',
                    (Math.random() * 30 + 60).toFixed(1) + '%',
                    (Math.random() * 20 + 30).toFixed(1) + '%',
                    Math.floor(Math.random() * 500 + 100) + ' MB/s'
                ],
                trends: [
                    { direction: 'up', value: '+2.3%' },
                    { direction: 'down', value: '-1.5%' },
                    { direction: 'up', value: '+0.8%' },
                    { direction: 'up', value: '+5.2%' }
                ]
            },
            availability: {
                labels: ['系统可用性', '服务响应时间', '故障恢复时间', 'SLA达成率'],
                icons: ['fas fa-shield-alt', 'fas fa-clock', 'fas fa-tools', 'fas fa-chart-line'],
                values: [
                    (99.5 + Math.random() * 0.4).toFixed(2) + '%',
                    Math.floor(Math.random() * 50 + 10) + ' ms',
                    Math.floor(Math.random() * 30 + 5) + ' min',
                    (95 + Math.random() * 4).toFixed(1) + '%'
                ],
                trends: [
                    { direction: 'up', value: '+0.1%' },
                    { direction: 'down', value: '-5ms' },
                    { direction: 'down', value: '-2min' },
                    { direction: 'up', value: '+1.2%' }
                ]
            },
            capacity: {
                labels: ['存储使用率', '存储增长率', '预计满载时间', '存储效率'],
                icons: ['fas fa-database', 'fas fa-chart-line', 'fas fa-calendar-alt', 'fas fa-compress'],
                values: [
                    (Math.random() * 30 + 60).toFixed(1) + '%',
                    (Math.random() * 5 + 2).toFixed(1) + '%/月',
                    Math.floor(Math.random() * 12 + 6) + ' 个月',
                    (Math.random() * 20 + 75).toFixed(1) + '%'
                ],
                trends: [
                    { direction: 'up', value: '+3.2%' },
                    { direction: 'up', value: '+0.5%' },
                    { direction: 'down', value: '-1月' },
                    { direction: 'up', value: '+2.1%' }
                ]
            },
            alarm: {
                labels: ['严重告警', '重要告警', '一般告警', '告警处理率'],
                icons: ['fas fa-exclamation-triangle', 'fas fa-exclamation-circle', 'fas fa-info-circle', 'fas fa-check-circle'],
                values: [
                    Math.floor(Math.random() * 10 + 2).toString(),
                    Math.floor(Math.random() * 20 + 5).toString(),
                    Math.floor(Math.random() * 50 + 10).toString(),
                    (Math.random() * 15 + 85).toFixed(1) + '%'
                ],
                trends: [
                    { direction: 'down', value: '-2' },
                    { direction: 'up', value: '+3' },
                    { direction: 'down', value: '-5' },
                    { direction: 'up', value: '+2.3%' }
                ]
            },
            network: {
                labels: ['网络带宽使用率', '数据包丢失率', '网络延迟', '连接数'],
                icons: ['fas fa-wifi', 'fas fa-exclamation-triangle', 'fas fa-clock', 'fas fa-link'],
                values: [
                    (Math.random() * 40 + 30).toFixed(1) + '%',
                    (Math.random() * 0.5).toFixed(3) + '%',
                    Math.floor(Math.random() * 20 + 5) + ' ms',
                    Math.floor(Math.random() * 1000 + 500).toLocaleString()
                ],
                trends: [
                    { direction: 'up', value: '+5.2%' },
                    { direction: 'down', value: '-0.01%' },
                    { direction: 'down', value: '-2ms' },
                    { direction: 'up', value: '+150' }
                ]
            },
            security: {
                labels: ['安全事件', '威胁检测', '漏洞数量', '安全评分'],
                icons: ['fas fa-shield-alt', 'fas fa-search', 'fas fa-bug', 'fas fa-star'],
                values: [
                    Math.floor(Math.random() * 20 + 5).toString(),
                    Math.floor(Math.random() * 50 + 10).toString(),
                    Math.floor(Math.random() * 15 + 2).toString(),
                    Math.floor(Math.random() * 20 + 75).toString() + '/100'
                ],
                trends: [
                    { direction: 'down', value: '-3' },
                    { direction: 'up', value: '+8' },
                    { direction: 'down', value: '-2' },
                    { direction: 'up', value: '+5' }
                ]
            }
        };

        return dataTemplates[reportType] || dataTemplates.performance;
    }

    // 更新概览卡片
    updateOverviewCards(overviewData) {
        const overviewItems = document.querySelectorAll('.overview-item');

        overviewItems.forEach((item, index) => {
            if (index < overviewData.labels.length) {
                // 更新图标
                const icon = item.querySelector('.overview-icon i');
                if (icon) {
                    icon.className = overviewData.icons[index];
                }

                // 更新标签
                const label = item.querySelector('.overview-label');
                if (label) {
                    label.textContent = overviewData.labels[index];
                }

                // 更新趋势
                const trend = item.querySelector('.overview-trend');
                const trendData = overviewData.trends[index];
                if (trend && trendData) {
                    trend.className = `overview-trend ${trendData.direction}`;
                    const trendValue = trend.querySelector('span');
                    if (trendValue) {
                        trendValue.textContent = trendData.value;
                    }
                    const trendIcon = trend.querySelector('i');
                    if (trendIcon) {
                        trendIcon.className = `fas fa-arrow-${trendData.direction === 'up' ? 'up' : 'down'}`;
                    }
                }
            }
        });
    }

    // 生成图表数据
    generateChartData(reportType) {
        const canvas = document.getElementById('previewChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 销毁现有图表
        if (this.charts.preview) {
            this.charts.preview.destroy();
        }

        // 更新图表标题
        this.updateChartTitle(reportType);

        // 根据报表类型生成不同的图表
        const chartConfig = this.getChartConfigByType(reportType);
        this.charts.preview = new Chart(ctx, chartConfig);
    }

    // 更新图表标题
    updateChartTitle(reportType) {
        const chartHeader = document.querySelector('.chart-header h4');
        if (!chartHeader) return;

        const chartTitles = {
            performance: '性能趋势图',
            availability: '可用性分析图',
            capacity: '容量使用分布图',
            alarm: '告警统计分布图',
            network: '网络流量趋势图',
            security: '安全事件统计图'
        };

        chartHeader.textContent = chartTitles[reportType] || '数据趋势图';
    }

    // 根据报表类型获取图表配置
    getChartConfigByType(reportType) {
        const labels = this.generateTimeLabels();

        const chartConfigs = {
            performance: {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'CPU使用率',
                        data: this.generateRandomData(labels.length, 40, 80),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '内存使用率',
                        data: this.generateRandomData(labels.length, 60, 90),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '磁盘使用率',
                        data: this.generateRandomData(labels.length, 30, 70),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: this.getLineChartOptions('%')
            },
            availability: {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '系统可用性',
                        data: this.generateRandomData(labels.length, 99.0, 99.9),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '响应时间',
                        data: this.generateRandomData(labels.length, 10, 100),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }]
                },
                options: this.getDualAxisChartOptions()
            },
            capacity: {
                type: 'bar',
                data: {
                    labels: ['存储池A', '存储池B', '存储池C', '存储池D', '存储池E'],
                    datasets: [{
                        label: '已使用容量',
                        data: [65, 78, 45, 89, 56],
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    }, {
                        label: '可用容量',
                        data: [35, 22, 55, 11, 44],
                        backgroundColor: '#e5e7eb',
                        borderRadius: 6
                    }]
                },
                options: this.getBarChartOptions()
            },
            alarm: {
                type: 'doughnut',
                data: {
                    labels: ['严重', '重要', '次要', '警告', '信息'],
                    datasets: [{
                        data: [12, 25, 35, 18, 10],
                        backgroundColor: [
                            '#ef4444',
                            '#f59e0b',
                            '#3b82f6',
                            '#10b981',
                            '#6b7280'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: this.getDoughnutChartOptions()
            },
            network: {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '入站流量',
                        data: this.generateRandomData(labels.length, 100, 500),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '出站流量',
                        data: this.generateRandomData(labels.length, 80, 400),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '网络延迟',
                        data: this.generateRandomData(labels.length, 5, 50),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y1'
                    }]
                },
                options: this.getNetworkChartOptions()
            },
            security: {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '安全事件',
                        data: this.generateRandomData(labels.length, 0, 20),
                        backgroundColor: '#ef4444',
                        borderRadius: 6
                    }, {
                        label: '威胁检测',
                        data: this.generateRandomData(labels.length, 5, 50),
                        backgroundColor: '#f59e0b',
                        borderRadius: 6
                    }, {
                        label: '已处理',
                        data: this.generateRandomData(labels.length, 10, 60),
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }]
                },
                options: this.getBarChartOptions()
            }
        };

        return chartConfigs[reportType] || chartConfigs.performance;
    }

    // 生成时间标签
    generateTimeLabels() {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    // 生成随机数据
    generateRandomData(length, min, max) {
        return Array.from({ length }, () => Math.random() * (max - min) + min);
    }

    // 线性图表选项
    getLineChartOptions(unit = '') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + unit;
                        }
                    }
                }
            }
        };
    }

    // 双轴图表选项
    getDualAxisChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + 'ms';
                        }
                    }
                }
            }
        };
    }

    // 柱状图选项
    getBarChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true
                },
                x: {
                    stacked: true
                }
            }
        };
    }

    // 环形图选项
    getDoughnutChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        };
    }

    // 网络图表选项
    getNetworkChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + ' MB/s';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + 'ms';
                        }
                    }
                }
            }
        };
    }

    // 生成表格数据
    generateTableData(reportType) {
        const tableBody = document.querySelector('#previewTable tbody');
        if (!tableBody) return;

        // 根据报表类型生成不同的表格数据
        const sampleData = this.generateDataByType(reportType);

        // 更新表格标题
        this.updateTableHeaders(reportType);

        this.filteredData = sampleData;
        this.totalRecords = sampleData.length;
        this.currentPageIndex = 1;
        this.updateTableDisplay();
    }

    // 根据报表类型生成数据
    generateDataByType(reportType) {
        const deviceTypes = ['服务器', '网络设备', '存储设备', '安全设备'];
        const deviceNames = ['WEB-SERVER', 'DB-SERVER', 'SWITCH-CORE', 'FIREWALL', 'STORAGE'];
        const sampleData = [];

        for (let i = 1; i <= 156; i++) {
            const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
            const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)] + '-' + String(i).padStart(2, '0');
            const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            const lastUpdate = new Date(Date.now() - Math.random() * 3600000).toLocaleString('zh-CN');

            let rowData = {
                name: deviceName,
                type: deviceType,
                ip: ip,
                lastUpdate: lastUpdate
            };

            // 根据报表类型添加特定字段
            switch (reportType) {
                case 'performance':
                    rowData = {
                        ...rowData,
                        cpu: Math.floor(Math.random() * 100) + '%',
                        memory: Math.floor(Math.random() * 100) + '%',
                        disk: Math.floor(Math.random() * 100) + '%',
                        network: Math.floor(Math.random() * 1000) + ' MB/s',
                        status: Math.random() > 0.1 ? '在线' : '离线'
                    };
                    break;
                case 'availability':
                    rowData = {
                        ...rowData,
                        uptime: (99 + Math.random()).toFixed(2) + '%',
                        downtime: Math.floor(Math.random() * 60) + ' min',
                        responseTime: Math.floor(Math.random() * 100 + 10) + ' ms',
                        sla: (95 + Math.random() * 4).toFixed(1) + '%',
                        status: Math.random() > 0.05 ? '正常' : '异常'
                    };
                    break;
                case 'capacity':
                    rowData = {
                        ...rowData,
                        totalCapacity: Math.floor(Math.random() * 1000 + 500) + ' GB',
                        usedCapacity: Math.floor(Math.random() * 80 + 10) + '%',
                        freeCapacity: Math.floor(Math.random() * 500 + 100) + ' GB',
                        growthRate: (Math.random() * 5 + 1).toFixed(1) + '%/月',
                        status: Math.random() > 0.2 ? '正常' : '告警'
                    };
                    break;
                case 'alarm':
                    const alarmTypes = ['严重', '重要', '次要', '警告', '信息'];
                    const alarmSources = ['CPU', '内存', '磁盘', '网络', '服务'];
                    rowData = {
                        ...rowData,
                        alarmType: alarmTypes[Math.floor(Math.random() * alarmTypes.length)],
                        alarmSource: alarmSources[Math.floor(Math.random() * alarmSources.length)],
                        alarmCount: Math.floor(Math.random() * 20),
                        resolvedCount: Math.floor(Math.random() * 15),
                        status: Math.random() > 0.3 ? '已处理' : '待处理'
                    };
                    break;
                case 'network':
                    rowData = {
                        ...rowData,
                        bandwidth: Math.floor(Math.random() * 1000 + 100) + ' Mbps',
                        inTraffic: Math.floor(Math.random() * 500 + 50) + ' MB/s',
                        outTraffic: Math.floor(Math.random() * 400 + 40) + ' MB/s',
                        packetLoss: (Math.random() * 0.5).toFixed(3) + '%',
                        latency: Math.floor(Math.random() * 50 + 5) + ' ms',
                        status: Math.random() > 0.1 ? '正常' : '异常'
                    };
                    break;
                case 'security':
                    const threatTypes = ['恶意软件', '入侵检测', '异常访问', '数据泄露', '其他'];
                    rowData = {
                        ...rowData,
                        securityEvents: Math.floor(Math.random() * 10),
                        threatLevel: threatTypes[Math.floor(Math.random() * threatTypes.length)],
                        vulnerabilities: Math.floor(Math.random() * 5),
                        securityScore: Math.floor(Math.random() * 30 + 70),
                        status: Math.random() > 0.2 ? '安全' : '风险'
                    };
                    break;
                default:
                    // 默认性能数据
                    rowData = {
                        ...rowData,
                        cpu: Math.floor(Math.random() * 100) + '%',
                        memory: Math.floor(Math.random() * 100) + '%',
                        disk: Math.floor(Math.random() * 100) + '%',
                        network: Math.floor(Math.random() * 1000) + ' MB/s',
                        status: Math.random() > 0.1 ? '在线' : '离线'
                    };
            }

            sampleData.push(rowData);
        }

        return sampleData;
    }

    // 更新表格标题
    updateTableHeaders(reportType) {
        const tableHead = document.querySelector('#previewTable thead tr');
        if (!tableHead) return;

        const headerConfigs = {
            performance: ['设备名称', '设备类型', 'IP地址', 'CPU使用率', '内存使用率', '磁盘使用率', '网络流量', '状态', '最后更新'],
            availability: ['设备名称', '设备类型', 'IP地址', '运行时间', '停机时间', '响应时间', 'SLA达成率', '状态', '最后更新'],
            capacity: ['设备名称', '设备类型', 'IP地址', '总容量', '使用率', '剩余容量', '增长率', '状态', '最后更新'],
            alarm: ['设备名称', '设备类型', 'IP地址', '告警类型', '告警源', '告警数量', '已处理', '状态', '最后更新'],
            network: ['设备名称', '设备类型', 'IP地址', '带宽', '入站流量', '出站流量', '丢包率', '延迟', '状态'],
            security: ['设备名称', '设备类型', 'IP地址', '安全事件', '威胁等级', '漏洞数量', '安全评分', '状态', '最后更新']
        };

        const headers = headerConfigs[reportType] || headerConfigs.performance;
        tableHead.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    }

    // 更新表格显示
    updateTableDisplay() {
        const tableBody = document.querySelector('#previewTable tbody');
        if (!tableBody) return;

        const startIndex = (this.currentPageIndex - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);

        tableBody.innerHTML = '';
        pageData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = this.generateTableRowHTML(item);
            tableBody.appendChild(row);
        });

        this.updatePaginationInfo();
    }

    // 生成表格行HTML
    generateTableRowHTML(item) {
        const reportType = this.currentData.reportType || 'performance';

        // 根据报表类型生成不同的行结构
        switch (reportType) {
            case 'performance':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.cpu}</td>
                    <td>${item.memory}</td>
                    <td>${item.disk}</td>
                    <td>${item.network}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['在线', '正常'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
            case 'availability':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.uptime}</td>
                    <td>${item.downtime}</td>
                    <td>${item.responseTime}</td>
                    <td>${item.sla}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['正常'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
            case 'capacity':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.totalCapacity}</td>
                    <td>${item.usedCapacity}</td>
                    <td>${item.freeCapacity}</td>
                    <td>${item.growthRate}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['正常'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
            case 'alarm':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td><span class="alarm-type ${item.alarmType}">${item.alarmType}</span></td>
                    <td>${item.alarmSource}</td>
                    <td>${item.alarmCount}</td>
                    <td>${item.resolvedCount}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['已处理'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
            case 'network':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.bandwidth}</td>
                    <td>${item.inTraffic}</td>
                    <td>${item.outTraffic}</td>
                    <td>${item.packetLoss}</td>
                    <td>${item.latency}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['正常'])}">${item.status}</span></td>
                `;
            case 'security':
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.securityEvents}</td>
                    <td><span class="threat-level ${item.threatLevel}">${item.threatLevel}</span></td>
                    <td>${item.vulnerabilities}</td>
                    <td>${item.securityScore}/100</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['安全'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
            default:
                return `
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.ip}</td>
                    <td>${item.cpu || '--'}</td>
                    <td>${item.memory || '--'}</td>
                    <td>${item.disk || '--'}</td>
                    <td>${item.network || '--'}</td>
                    <td><span class="status-badge ${this.getStatusClass(item.status, ['在线', '正常'])}">${item.status}</span></td>
                    <td>${item.lastUpdate}</td>
                `;
        }
    }

    // 获取状态样式类
    getStatusClass(status, positiveStatuses) {
        if (positiveStatuses.includes(status)) {
            return 'success';
        } else if (status === '告警' || status === '风险' || status === '异常' || status === '待处理') {
            return 'error';
        } else {
            return 'warning';
        }
    }

    // 更新分页信息
    updatePaginationInfo() {
        const startIndex = (this.currentPageIndex - 1) * this.pageSize + 1;
        const endIndex = Math.min(this.currentPageIndex * this.pageSize, this.filteredData.length);

        document.getElementById('pageStart').textContent = startIndex;
        document.getElementById('pageEnd').textContent = endIndex;
        document.getElementById('totalRecords').textContent = this.filteredData.length;

        // 更新分页按钮状态
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.disabled = this.currentPageIndex <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPageIndex >= Math.ceil(this.filteredData.length / this.pageSize);
        }

        this.updatePageNumbers();
    }

    // 更新页码显示
    updatePageNumbers() {
        const pageNumbers = document.getElementById('pageNumbers');
        if (!pageNumbers) return;

        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const currentPage = this.currentPageIndex;

        pageNumbers.innerHTML = '';

        // 显示页码逻辑
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            this.addPageButton(pageNumbers, 1);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            this.addPageButton(pageNumbers, i, i === currentPage);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            this.addPageButton(pageNumbers, totalPages);
        }
    }

    // 添加页码按钮
    addPageButton(container, pageNum, isActive = false) {
        const button = document.createElement('button');
        button.className = `page-btn ${isActive ? 'active' : ''}`;
        button.textContent = pageNum;
        button.addEventListener('click', () => this.goToPage(pageNum));
        container.appendChild(button);
    }

    // 跳转到指定页
    goToPage(pageNum) {
        this.currentPageIndex = pageNum;
        this.updateTableDisplay();
    }

    // 上一页
    previousPage() {
        if (this.currentPageIndex > 1) {
            this.currentPageIndex--;
            this.updateTableDisplay();
        }
    }

    // 下一页
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPageIndex < totalPages) {
            this.currentPageIndex++;
            this.updateTableDisplay();
        }
    }

    // 保存报表
    saveReport() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) {
            return;
        }

        this.showNotification('正在保存报表配置...', 'info');

        // 模拟保存
        setTimeout(() => {
            this.showNotification('报表配置已保存', 'success');
            this.loadCategoryData(); // 刷新分类数据
        }, 1000);
    }

    // 生成报表
    generateReport() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) {
            return;
        }

        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            this.showNotification('报表生成完成', 'success');

            // 模拟下载文件
            this.downloadReport(formData);
        }, 2000);
    }

    // 获取表单数据
    getFormData() {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);
        const data = {};

        // 获取基本字段
        for (let [key, value] of formData.entries()) {
            if (key === 'metrics') {
                if (!data.metrics) data.metrics = [];
                data.metrics.push(value);
            } else {
                data[key] = value;
            }
        }

        // 获取复选框数据
        const metricsCheckboxes = document.querySelectorAll('input[name="metrics"]:checked');
        data.metrics = Array.from(metricsCheckboxes).map(cb => cb.value);

        // 获取多选设备类型
        const deviceTypeSelect = document.getElementById('deviceType');
        data.deviceTypes = Array.from(deviceTypeSelect.selectedOptions).map(option => option.value);

        return data;
    }

    // 验证表单
    validateForm(data) {
        if (!data.reportName) {
            this.showNotification('请输入报表名称', 'error');
            return false;
        }

        if (!data.reportType) {
            this.showNotification('请选择报表类型', 'error');
            return false;
        }

        if (!data.metrics || data.metrics.length === 0) {
            this.showNotification('请至少选择一个数据指标', 'error');
            return false;
        }

        if (data.timeRange === 'custom') {
            if (!data.startDate || !data.endDate) {
                this.showNotification('请选择自定义时间范围', 'error');
                return false;
            }

            if (new Date(data.startDate) >= new Date(data.endDate)) {
                this.showNotification('开始日期必须早于结束日期', 'error');
                return false;
            }
        }

        if (data.emailNotification === 'on' && !data.emailRecipients) {
            this.showNotification('启用邮件通知时请输入收件人邮箱', 'error');
            return false;
        }

        return true;
    }

    // 下载报表
    downloadReport(data) {
        const format = data.outputFormat || 'pdf';
        const filename = `${data.reportName}_${new Date().toISOString().split('T')[0]}.${format}`;

        // 模拟文件下载
        this.showNotification(`正在下载 ${filename}...`, 'info');

        setTimeout(() => {
            this.showNotification(`${filename} 下载完成`, 'success');
        }, 1000);
    }



    // 过滤表格数据
    filterTableData(searchText) {
        if (!this.filteredData) return;

        const originalData = this.filteredData;
        if (!searchText.trim()) {
            this.generateTableData();
            return;
        }

        const filtered = originalData.filter(item =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ip.includes(searchText) ||
            item.type.toLowerCase().includes(searchText.toLowerCase())
        );

        this.filteredData = filtered;
        this.currentPageIndex = 1;
        this.updateTableDisplay();
    }

    // 按类型过滤表格
    filterTableByType(type) {
        if (!this.filteredData) return;

        this.generateTableData(); // 重新生成数据

        if (type !== 'all') {
            this.filteredData = this.filteredData.filter(item =>
                item.type === type
            );
        }

        this.currentPageIndex = 1;
        this.updateTableDisplay();
    }

    // 导出表格数据
    exportTableData() {
        const data = this.filteredData;
        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, '报表数据.csv');
        this.showNotification('表格数据导出成功', 'success');
    }

    // 转换为CSV格式
    convertToCSV(data) {
        const headers = ['设备名称', '设备类型', 'IP地址', 'CPU使用率', '内存使用率', '磁盘使用率', '网络流量', '状态', '最后更新'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.name,
                row.type,
                row.ip,
                row.cpu,
                row.memory,
                row.disk,
                row.network,
                row.status,
                row.lastUpdate
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    // 下载CSV文件
    downloadCSV(csvContent, filename) {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 刷新预览
    refreshPreview() {
        this.showNotification('正在刷新预览数据...', 'info');
        setTimeout(() => {
            this.generatePreviewData();
            this.showNotification('预览数据已刷新', 'success');
        }, 1000);
    }

    // 导出预览
    exportPreview() {
        const format = 'pdf'; // 默认导出PDF
        this.showNotification(`正在导出${format.toUpperCase()}文件...`, 'info');

        setTimeout(() => {
            // 模拟导出
            this.showNotification(`${format.toUpperCase()}文件导出成功`, 'success');
        }, 2000);
    }

    // 更新图表时间范围
    updateChartTimeRange(timeRange) {
        this.showNotification(`切换到${timeRange}数据`, 'info');
        // 重新生成图表数据
        setTimeout(() => {
            this.generateChartData();
        }, 500);
    }

    // 显示模板模态框
    showTemplateModal() {
        document.getElementById('templateModal').classList.add('show');
        this.loadTemplateList();
    }

    // 隐藏模板模态框
    hideTemplateModal() {
        document.getElementById('templateModal').classList.remove('show');
    }

    // 切换模板标签页
    switchTemplateTab(tabName) {
        document.querySelectorAll('#templateModal .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#templateModal .tab-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`#templateModal [data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        if (tabName === 'load') {
            this.loadTemplateList();
        } else if (tabName === 'manage') {
            this.loadTemplateGrid();
        }
    }

    // 保存模板
    saveTemplate() {
        const name = document.getElementById('templateName').value;
        const description = document.getElementById('templateDescription').value;
        const category = document.getElementById('templateCategory').value;

        if (!name.trim()) {
            this.showNotification('请输入模板名称', 'error');
            return;
        }

        const template = {
            id: Date.now().toString(),
            name: name,
            description: description,
            category: category,
            config: this.getFormData(),
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
        };

        this.templates.push(template);
        localStorage.setItem('reportTemplates', JSON.stringify(this.templates));

        this.hideTemplateModal();
        this.showNotification('模板保存成功', 'success');
    }

    // 加载模板列表
    loadTemplateList() {
        const templateList = document.getElementById('templateList');
        if (!templateList) return;

        templateList.innerHTML = '';

        if (this.templates.length === 0) {
            templateList.innerHTML = '<div class="empty-state">暂无保存的模板</div>';
            return;
        }

        this.templates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.innerHTML = `
                <h5>${template.name}</h5>
                <p>${template.description || '无描述'}</p>
                <div class="template-meta">
                    <span>分类: ${template.category}</span>
                    <span>创建时间: ${new Date(template.createTime).toLocaleDateString('zh-CN')}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                this.loadTemplate(template);
            });

            templateList.appendChild(item);
        });
    }

    // 加载模板
    loadTemplate(template) {
        const config = template.config;

        // 填充表单数据
        Object.keys(config).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = config[key];
                } else if (element.tagName === 'SELECT' && element.multiple) {
                    Array.from(element.options).forEach(option => {
                        option.selected = config[key] && config[key].includes(option.value);
                    });
                } else {
                    element.value = config[key];
                }
            }
        });

        // 处理复选框组
        if (config.metrics) {
            document.querySelectorAll('input[name="metrics"]').forEach(checkbox => {
                checkbox.checked = config.metrics.includes(checkbox.value);
            });
        }

        this.hideTemplateModal();
        this.showNotification(`模板"${template.name}"加载成功`, 'success');
    }

    // 显示分享模态框
    showShareModal() {
        document.getElementById('shareModal').classList.add('show');
        this.generateShareLink();
    }

    // 隐藏分享模态框
    hideShareModal() {
        document.getElementById('shareModal').classList.remove('show');
    }

    // 生成分享链接
    generateShareLink() {
        const reportId = Math.random().toString(36).substr(2, 9);
        const shareLink = `https://example.com/report/${reportId}`;
        document.getElementById('shareLink').value = shareLink;
    }

    // 选择分享方式
    selectShareMethod(method) {
        document.querySelectorAll('.method-item').forEach(item => item.classList.remove('selected'));
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');

        // 显示对应的设置面板
        document.querySelectorAll('.setting-panel').forEach(panel => panel.classList.remove('active'));

        if (method === 'link') {
            document.getElementById('linkSettings').classList.add('active');
        } else if (method === 'email') {
            document.getElementById('emailSettings').classList.add('active');
        }
    }

    // 复制分享链接
    copyShareLink() {
        const shareLink = document.getElementById('shareLink');
        shareLink.select();
        document.execCommand('copy');
        this.showNotification('链接已复制到剪贴板', 'success');
    }

    // 确认分享
    confirmShare() {
        const selectedMethod = document.querySelector('.method-item.selected');
        if (!selectedMethod) {
            this.showNotification('请选择分享方式', 'warning');
            return;
        }

        const method = selectedMethod.dataset.method;

        switch (method) {
            case 'link':
                this.shareByLink();
                break;
            case 'email':
                this.shareByEmail();
                break;
            case 'download':
                this.shareByDownload();
                break;
            case 'print':
                this.shareByPrint();
                break;
        }
    }

    // 链接分享
    shareByLink() {
        this.showNotification('分享链接已生成', 'success');
        this.hideShareModal();
    }

    // 邮件分享
    shareByEmail() {
        const recipients = document.getElementById('emailRecipients').value;
        const subject = document.getElementById('emailSubject').value;

        if (!recipients.trim()) {
            this.showNotification('请输入收件人邮箱', 'error');
            return;
        }

        this.showNotification('正在发送邮件...', 'info');
        setTimeout(() => {
            this.showNotification('邮件发送成功', 'success');
            this.hideShareModal();
        }, 2000);
    }

    // 下载分享
    shareByDownload() {
        this.exportPreview();
        this.hideShareModal();
    }

    // 打印分享
    shareByPrint() {
        window.print();
        this.hideShareModal();
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // 设置背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
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
            if (targetPage === '统计报表.html') {
                console.log('当前已在统计报表页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
}

// 初始化报表管理器
let reportManager;
document.addEventListener('DOMContentLoaded', () => {
    reportManager = new ReportManager();
});
