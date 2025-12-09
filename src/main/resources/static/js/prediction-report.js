/**
 * 智能预测管理 - 预测报告页面
 * 负责加载分类列表和预测报告数据
 */

const PredictionReport = {
    currentCategory: null,
    currentStatus: 'normal',
    currentPredictionTime: 1,
    currentReports: [],
    healthChart: null,

    /**
     * 初始化预测报告页面
     */
    init: function() {
        console.log('🚀 Initializing Prediction Report page...');
        this.loadCategories();
        this.bindEvents();
    },

    /**
     * 加载分类列表（从asset_category表，包含子分类）
     */
    loadCategories: async function() {
        try {
            console.log('📋 Loading asset category tree...');
            // 从asset_category表获取完整分类树
            const response = await fetch('/api/prediction/enhanced-reports/categories/tree');
            const result = await response.json();
            const categoryTree = result.code === 200 ? result.data : [];
            
            if (categoryTree && categoryTree.length > 0) {
                this.renderCategoryTree(categoryTree);
                console.log(`✅ Loaded ${categoryTree.length} parent categories with subcategories`);
            } else {
                console.warn('⚠️ No categories found');
                this.showEmptyCategories();
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            this.showEmptyCategories();
        }
    },

    /**
     * 渲染分类树（包含子分类）
     */
    renderCategoryTree: function(categoryTree) {
        const sidebar = document.querySelector('.report-sidebar');
        if (!sidebar) {
            console.error('❌ Report sidebar not found');
            return;
        }

        // 清空现有分类
        sidebar.innerHTML = '';

        // 渲染每个父分类及其子分类
        categoryTree.forEach(parentCategory => {
            // 渲染父分类
            const parentDiv = document.createElement('div');
            parentDiv.className = 'sidebar-category parent';
            parentDiv.dataset.categoryId = parentCategory.id;
            parentDiv.dataset.categoryName = parentCategory.categoryName || parentCategory.category_name;
            
            const parentText = document.createElement('span');
            parentText.className = 'category-text';
            parentText.textContent = parentCategory.categoryName || parentCategory.category_name;
            parentDiv.appendChild(parentText);
            
            // 添加展开/收起图标
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.innerHTML = '▼';
            parentDiv.appendChild(expandIcon);
            
            sidebar.appendChild(parentDiv);
            
            // 渲染子分类
            if (parentCategory.children && parentCategory.children.length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'subcategory-container';
                
                parentCategory.children.forEach(childCategory => {
                    const childDiv = document.createElement('div');
                    childDiv.className = 'sidebar-category child';
                    childDiv.dataset.categoryId = childCategory.id;
                    childDiv.dataset.categoryName = childCategory.categoryName || childCategory.category_name;
                    childDiv.dataset.parentId = parentCategory.id;
                    
                    const childText = document.createElement('span');
                    childText.className = 'category-text';
                    childText.textContent = childCategory.categoryName || childCategory.category_name;
                    childDiv.appendChild(childText);
                    
                    // 如果有设备数量，显示数量
                    if (childCategory.deviceCount > 0) {
                        const count = document.createElement('span');
                        count.className = 'category-count';
                        count.textContent = `(${childCategory.deviceCount})`;
                        childDiv.appendChild(count);
                    }
                    
                    childrenContainer.appendChild(childDiv);
                });
                
                sidebar.appendChild(childrenContainer);
            }
        });

        // 绑定分类点击事件
        this.bindCategoryClick();
    },

    /**
     * 渲染分类列表（原方法保留作为备用）
     */
    renderCategories: function(categories) {
        const sidebar = document.querySelector('.report-sidebar');
        if (!sidebar) {
            console.error('❌ Report sidebar not found');
            return;
        }

        // 清空现有分类
        sidebar.innerHTML = '';

        // 添加"当前分类"标题
        const headerDiv = document.createElement('div');
        headerDiv.className = 'sidebar-category header';
        headerDiv.innerHTML = '<span class="category-text">当前分类</span>';
        sidebar.appendChild(headerDiv);

        // 按父分类分组
        const grouped = this.groupCategoriesByParent(categories);
        
        // 渲染每个父分类及其子分类
        Object.keys(grouped).forEach(parentId => {
            const items = grouped[parentId];
            
            items.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'sidebar-category';
                categoryDiv.dataset.categoryId = category.id;
                categoryDiv.dataset.categoryName = category.categoryName || category.category_name;
                
                const text = document.createElement('span');
                text.className = 'category-text';
                text.textContent = category.categoryName || category.category_name;
                categoryDiv.appendChild(text);
                
                // 如果有报告数量，显示数量
                if (category.report_count > 0) {
                    const count = document.createElement('span');
                    count.className = 'category-count';
                    count.textContent = `(${category.report_count})`;
                    categoryDiv.appendChild(count);
                }
                
                sidebar.appendChild(categoryDiv);
            });
        });

        // 绑定分类点击事件
        this.bindCategoryClick();
    },

    /**
     * 按父分类分组
     */
    groupCategoriesByParent: function(categories) {
        const grouped = {};
        categories.forEach(cat => {
            const parentId = cat.parent_id || 0;
            if (!grouped[parentId]) {
                grouped[parentId] = [];
            }
            grouped[parentId].push(cat);
        });
        return grouped;
    },

    /**
     * 显示空分类提示
     */
    showEmptyCategories: function() {
        const sidebar = document.querySelector('.report-sidebar');
        if (sidebar) {
            sidebar.innerHTML = `
                <div class="sidebar-category header">
                    <span class="category-text">当前分类</span>
                </div>
                <div class="empty-message">
                    <i class="fas fa-inbox"></i>
                    <p>暂无分类数据</p>
                </div>
            `;
        }
    },

    /**
     * 显示分类加载错误
     */
    showCategoryError: function() {
        const sidebar = document.querySelector('.report-sidebar');
        if (sidebar) {
            sidebar.innerHTML = `
                <div class="sidebar-category header">
                    <span class="category-text">当前分类</span>
                </div>
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>加载分类失败</p>
                    <button onclick="PredictionReport.loadCategories()">重试</button>
                </div>
            `;
        }
    },

    /**
     * 绑定分类点击事件
     */
    bindCategoryClick: function() {
        const categories = document.querySelectorAll('.report-sidebar .sidebar-category:not(.header)');
        categories.forEach(category => {
            category.addEventListener('click', (e) => {
                // 如果是父分类，处理展开/收起
                if (category.classList.contains('parent')) {
                    e.preventDefault();
                    this.toggleParentCategory(category);
                    return;
                }
                
                // 子分类或普通分类的点击处理
                // 移除其他分类的选中状态
                categories.forEach(c => c.classList.remove('active'));
                
                // 添加当前分类的选中状态
                category.classList.add('active');
                
                // 获取分类信息
                const categoryId = category.dataset.categoryId;
                const categoryName = category.dataset.categoryName;
                
                console.log(`🔍 Selected category: ${categoryName} (ID: ${categoryId})`);
                
                // 保存当前分类
                this.currentCategory = { id: categoryId, name: categoryName };
                
                // 加载该分类的报告
                this.loadReports(categoryId);
            });
        });
    },

    /**
     * 切换父分类的展开/收起状态
     */
    toggleParentCategory: function(parentCategory) {
        const isExpanded = parentCategory.classList.contains('expanded');
        const subcategoryContainer = parentCategory.nextElementSibling;
        
        if (isExpanded) {
            // 收起
            parentCategory.classList.remove('expanded');
            parentCategory.classList.add('collapsed');
            if (subcategoryContainer && subcategoryContainer.classList.contains('subcategory-container')) {
                subcategoryContainer.style.display = 'none';
            }
            console.log('📁 Collapsed parent category:', parentCategory.dataset.categoryName);
        } else {
            // 展开
            parentCategory.classList.remove('collapsed');
            parentCategory.classList.add('expanded');
            if (subcategoryContainer && subcategoryContainer.classList.contains('subcategory-container')) {
                subcategoryContainer.style.display = 'block';
            }
            console.log('📂 Expanded parent category:', parentCategory.dataset.categoryName);
        }
    },

    /**
     * 绑定事件监听
     */
    bindEvents: function() {
        console.log('🔗 Binding prediction report events...');
        
        // 预测时间过滤器 - 修复事件监听
        const timeFilter = document.getElementById('reportPredictionTimeFilter');
        if (timeFilter) {
            console.log('✅ Found prediction time filter');
            timeFilter.addEventListener('change', (e) => {
                this.currentPredictionTime = parseInt(e.target.value) || 1;
                console.log(`⏰ Prediction time changed to: ${this.currentPredictionTime} days`);
                
                if (this.currentCategory) {
                    console.log(`📄 Reloading reports for category ${this.currentCategory.id} with time filter`);
                    this.loadReports(this.currentCategory.id);
                } else {
                    console.warn('⚠️ No category selected');
                }
            });
        } else {
            console.warn('⚠️ Prediction time filter not found');
        }
    },

    /**
     * 加载智能预测报告和健康度数据
     */
    loadReports: async function(categoryId) {
        try {
            console.log(`📄 Loading enhanced reports for category: ${categoryId}, predictionTime: ${this.currentPredictionTime} days`);
            
            // 使用混合API策略：优先使用动态API，如果失败则回退到静态API
            const reportsUrl = categoryId 
                ? `/api/prediction/enhanced-reports/latest?serviceId=30&categoryId=${categoryId}&limit=20&predictionTime=${this.currentPredictionTime}`
                : `/api/prediction/enhanced-reports/latest?serviceId=30&limit=20`;
            
            const healthStatsUrl = categoryId
                ? `/api/prediction/enhanced-reports/health-stats?categoryId=${categoryId}&days=${this.currentPredictionTime}`
                : `/api/prediction/enhanced-reports/health-stats`;
            
            // 并行加载智能报告和健康度数据，使用时间参数
            const [reportsResponse, healthResponse] = await Promise.all([
                fetch(reportsUrl),
                fetch(healthStatsUrl)
            ]);
            
            const reportsResult = await reportsResponse.json();
            const healthResult = await healthResponse.json();
            
            const reports = reportsResult.code === 200 ? reportsResult.data : [];
            const healthTrend = healthResult.code === 200 ? healthResult.data : null;
            
            console.log(`✅ Loaded ${reports.length} reports for category ${categoryId}`);
            
            if (reports && reports.length > 0) {
                this.renderReports(reports, healthTrend);
            } else {
                console.log('⚠️ No reports found for this category');
                this.showEmptyReports();
            }
        } catch (error) {
            console.error('❌ Failed to load reports:', error);
            this.showReportError();
        }
    },

    /**
     * 渲染智能预测报告和健康度图表
     */
    renderReports: function(reports, healthTrend) {
        const chartContainer = document.querySelector('.report-chart-container');
        if (!chartContainer) {
            console.error('❌ Chart container not found');
            return;
        }

        this.currentReports = reports;
        
        // 检查是否有报告数据
        if (!reports || reports.length === 0) {
            console.warn('⚠️ No reports available for this category');
            this.showEmptyReports();
            return;
        }
        
        // 渲染报告列表和简化的健康度统计
        chartContainer.innerHTML = `
            <div class="enhanced-reports-container" style="width: 100%; overflow: hidden;">
                <div class="health-stats-simple" style="margin-bottom: 20px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div class="stats-header" style="margin-bottom: 15px;">
                        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #303133;"><i class="fas fa-heartbeat" style="color: #67C23A; margin-right: 8px;"></i> 设备健康度统计</h4>
                    </div>
                    <div class="stats-cards" id="healthStatsCards">
                        <div class="loading" style="text-align: center; padding: 20px; color: #909399;">加载中...</div>
                    </div>
                </div>
                <div class="reports-list" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div class="reports-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e4e7ed;">
                        <h4 style="margin: 0; font-size: 18px; font-weight: 600; color: #303133;"><i class="fas fa-list" style="color: #409EFF; margin-right: 8px;"></i> 智能预测报告</h4>
                        <span class="report-count" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">${reports.length}条报告</span>
                    </div>
                    <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; overflow: hidden;">
                        ${reports.map(report => this.renderEnhancedReportCard(report)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // 加载健康度统计数据
        this.loadHealthStats();
    },

    /**
     * 加载健康度统计数据
     */
    loadHealthStats: async function() {
        try {
            // 构建API URL，如果有当前分类则传递分类ID
            let url = '/api/prediction/enhanced-reports/health-stats';
            if (this.currentCategory && this.currentCategory.id) {
                url += `?categoryId=${this.currentCategory.id}`;
                console.log(`📊 Loading health stats for category: ${this.currentCategory.name} (ID: ${this.currentCategory.id})`);
            } else {
                console.log('📊 Loading health stats for all categories');
            }
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.code === 200) {
                console.log('✅ Health stats loaded:', result.data);
                this.renderHealthStats(result.data);
            } else {
                console.error('获取健康度统计失败:', result.message);
                this.showHealthStatsError();
            }
        } catch (error) {
            console.error('加载健康度统计失败:', error);
            this.showHealthStatsError();
        }
    },

    /**
     * 渲染健康度统计
     */
    renderHealthStats: function(stats) {
        const statsContainer = document.getElementById('healthStatsCards');
        if (!statsContainer) return;
        
        // 显示当前分类信息
        const categoryInfo = this.currentCategory ? 
            `当前分类: ${this.currentCategory.name}` : '全部分类';
        
        statsContainer.innerHTML = `
            <div class="stats-info-header">
                <div class="category-info">${categoryInfo}</div>
                <div class="health-standard" title="${stats.healthStandard || '健康度 >= 70% 为正常，< 70% 为异常'}">
                    <i class="fas fa-info-circle"></i> 判断标准: 健康度 ≥ 70% 为正常
                </div>
            </div>
            <div class="stats-cards-grid simplified">
                <div class="stat-card normal">
                    <div class="stat-icon">✓</div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.normalCount}</div>
                        <div class="stat-label">正常设备</div>
                    </div>
                </div>
                <div class="stat-card abnormal">
                    <div class="stat-icon">⚠</div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.abnormalCount}</div>
                        <div class="stat-label">异常设备</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 显示健康度统计错误
     */
    showHealthStatsError: function() {
        const statsContainer = document.getElementById('healthStatsCards');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>加载统计数据失败</p>
            </div>
        `;
    },

    /**
     * 渲染增强的报告卡片
     */
    renderEnhancedReportCard: function(report) {
        const healthScore = report.healthScore ? (report.healthScore * 100).toFixed(1) : 'N/A';
        const healthLevel = this.getHealthLevel(report.healthScore);
        const healthColor = this.getHealthColor(report.healthScore);
        
        // 安全处理报告标题，移除可能导致显示问题的字符
        const safeTitle = (report.reportTitle || '预测报告').replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_]/g, '');
        
        return `
            <div class="enhanced-report-card" data-report-id="${report.id}" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 0;">
                <div class="report-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #e4e7ed; padding-bottom: 10px;">
                    <h5 class="report-title" style="margin: 0; font-size: 16px; font-weight: 600; color: #303133;">${safeTitle}</h5>
                    <span class="health-badge ${healthColor}" style="padding: 5px 15px; border-radius: 20px; font-weight: 600; font-size: 14px;">${healthScore}分</span>
                </div>
                <div class="report-metrics" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div class="metric-item" style="background: #f5f7fa; padding: 10px; border-radius: 6px;">
                        <span class="metric-label" style="display: block; font-size: 12px; color: #909399; margin-bottom: 5px;">健康度</span>
                        <span class="metric-value ${healthColor}" style="display: block; font-size: 16px; font-weight: 600;">${healthLevel}</span>
                    </div>
                    <div class="metric-item" style="background: #f5f7fa; padding: 10px; border-radius: 6px;">
                        <span class="metric-label" style="display: block; font-size: 12px; color: #909399; margin-bottom: 5px;">预测次数</span>
                        <span class="metric-value" style="display: block; font-size: 16px; font-weight: 600; color: #303133;">${report.totalPredictions || 0}</span>
                    </div>
                    <div class="metric-item" style="background: #f5f7fa; padding: 10px; border-radius: 6px;">
                        <span class="metric-label" style="display: block; font-size: 12px; color: #909399; margin-bottom: 5px;">异常检测</span>
                        <span class="metric-value" style="display: block; font-size: 16px; font-weight: 600; color: #F56C6C;">${report.anomalyCount || 0}</span>
                    </div>
                    <div class="metric-item" style="background: #f5f7fa; padding: 10px; border-radius: 6px;">
                        <span class="metric-label" style="display: block; font-size: 12px; color: #909399; margin-bottom: 5px;">准确率</span>
                        <span class="metric-value" style="display: block; font-size: 16px; font-weight: 600; color: #67C23A;">${report.accuracyRate ? (report.accuracyRate * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                </div>
                <div class="report-actions" style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button class="btn-view-detail" 
                            onclick="console.log('点击查看详情，reportId:${report.id}'); PredictionReport.viewReportDetail(${report.id}); return false;" 
                            style="flex: 1; padding: 8px 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(102, 126, 234, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(102, 126, 234, 0.3)'">
                        <i class="fas fa-eye"></i> 查看详情
                    </button>
                    <button class="btn-view-trend" 
                            onclick="console.log('点击趋势分析，serviceId:${report.serviceId}'); PredictionReport.showTrendAnalysis(${report.serviceId}); return false;" 
                            style="flex: 1; padding: 8px 15px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s; box-shadow: 0 2px 4px rgba(240, 147, 251, 0.3);"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(240, 147, 251, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(240, 147, 251, 0.3)'">
                        <i class="fas fa-chart-line"></i> 趋势分析
                    </button>
                </div>
                <div class="report-footer" style="padding-top: 10px; border-top: 1px solid #e4e7ed;">
                    <small style="color: #909399; font-size: 12px;"><i class="fas fa-clock"></i> ${this.formatDate(report.reportTime)}</small>
                </div>
            </div>
        `;
    },
    
    /**
     * 渲染原始报告卡片（保持兼容性）
     */
    renderReportCard: function(report) {
        const statusClass = this.getStatusClass(report.status);
        const statusText = this.getStatusText(report.status);
        
        return `
            <div class="report-card ${statusClass}">
                <div class="report-card-header">
                    <h5 class="report-title">${report.report_name || report.asset_name || report.reportTitle}</h5>
                    <span class="report-status ${statusClass}">${statusText}</span>
                </div>
                <div class="report-card-body">
                    <div class="report-info">
                        <div class="info-item">
                            <i class="fas fa-server"></i>
                            <span>设备: ${report.asset_name}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tags"></i>
                            <span>分类: ${report.category_name}</span>
                        </div>
                        ${report.brand ? `
                        <div class="info-item">
                            <i class="fas fa-trademark"></i>
                            <span>品牌: ${report.brand}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>预测时间: ${report.prediction_time}天</span>
                        </div>
                    </div>
                    ${report.chart_data ? `
                    <div class="report-chart">
                        <button class="btn-view-chart" onclick="PredictionReport.showChartData(${report.id}, '${report.chart_data}')">
                            <i class="fas fa-chart-line"></i> 查看图表数据
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div class="report-card-footer">
                    <small>创建时间: ${this.formatDate(report.created_at)}</small>
                </div>
            </div>
        `;
    },

    /**
     * 获取状态样式类
     */
    getStatusClass: function(status) {
        const statusMap = {
            'NORMAL': 'status-normal',
            'WARNING': 'status-warning',
            'ABNORMAL': 'status-abnormal',
            'normal': 'status-normal',
            'warning': 'status-warning',
            'abnormal': 'status-abnormal'
        };
        return statusMap[status] || 'status-normal';
    },

    /**
     * 获取状态文本
     */
    getStatusText: function(status) {
        const textMap = {
            'NORMAL': '正常',
            'WARNING': '预警',
            'ABNORMAL': '异常',
            'normal': '正常',
            'warning': '预警',
            'abnormal': '异常'
        };
        return textMap[status] || '正常';
    },

    /**
     * 格式化日期
     */
    formatDate: function(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 显示图表数据（新增方法）
     */
    showChartData: function(reportId, chartDataStr) {
        try {
            const chartData = JSON.parse(chartDataStr);
            console.log('📊 Chart data for report', reportId, ':', chartData);
            
            // TODO: 使用ECharts或其他图表库展示数据
            alert(`图表数据：\n${JSON.stringify(chartData, null, 2)}`);
        } catch (error) {
            console.error('❌ Failed to parse chart data:', error);
            alert('图表数据解析失败');
        }
    },

    /**
     * 显示空报告状态
     */
    showEmptyReports: function() {
        const chartContainer = document.querySelector('.report-chart-container');
        if (chartContainer) {
            const categoryName = this.currentCategory ? this.currentCategory.name : '该分类';
            chartContainer.innerHTML = `
                <div style="background: white; border-radius: 8px; padding: 60px 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <i class="fas fa-inbox" style="font-size: 80px; color: #C0C4CC; opacity: 0.6;"></i>
                    </div>
                    <h3 style="color: #606266; margin-bottom: 15px; font-size: 20px;">暂无预测报告数据</h3>
                    <p style="color: #909399; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                        ${categoryName}下还没有生成任何预测报告<br>
                        请稍后再试或选择其他分类查看
                    </p>
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%); padding: 20px; border-radius: 8px; display: inline-block;">
                        <div style="font-size: 14px; color: #606266;">
                            <i class="fas fa-lightbulb" style="color: #E6A23C; margin-right: 8px;"></i>
                            <strong>提示：</strong>
                        </div>
                        <div style="font-size: 13px; color: #909399; margin-top: 10px; text-align: left;">
                            • 报告由系统自动生成<br>
                            • 如需立即生成报告，请联系管理员<br>
                            • 可以尝试选择其他设备分类
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * 显示报告加载错误
     */
    showReportError: function() {
        const chartContainer = document.querySelector('.report-chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-placeholder error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>加载报告失败</p>
                </div>
            `;
        }
    },

    /**
     * 查看报告详情
     */
    viewReportDetail: async function(reportId) {
        console.log(`\n========== 查看报告详情 ==========`);
        console.log(`📄 Report ID: ${reportId}`);
        console.log(`📄 Type: ${typeof reportId}`);
        
        if (!reportId || reportId === 'undefined' || reportId === 'null') {
            console.error('❌ Invalid reportId:', reportId);
            alert('报告ID无效，无法查看详情');
            return;
        }
        
        try {
            console.log(`🌐 Fetching report from: /api/prediction/enhanced-reports/${reportId}`);
            
            // 显示加载提示
            this.showLoadingModal('正在加载报告详情...');
            
            // 从API获取报告详情
            const response = await fetch(`/api/prediction/enhanced-reports/${reportId}`);
            console.log(`📥 Response status: ${response.status}`);
            
            const result = await response.json();
            console.log(`📊 Response data:`, result);
            
            // 关闭加载提示
            this.closeLoadingModal();
            
            if (result.code !== 200 || !result.data) {
                console.error('❌ API returned error:', result);
                alert('获取报告详情失败: ' + (result.message || '未知错误'));
                return;
            }
            
            const report = result.data;
            console.log('✅ Report loaded successfully:', report.reportTitle);
            
            // 安全处理文本，移除可能导致显示问题的字符
            const safeTitle = (report.reportTitle || '预测报告详情').replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_\s]/g, '');
            const safeSummary = (report.summary || '暂无摘要信息').replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_\s，。、！？：；""''（）【】《》]/g, '');
            
            // 创建模态框显示详情
            const modalHTML = `
                <div class="modal-overlay" id="reportDetailModal" onclick="if(event.target === this) this.remove()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                    <div class="modal-content report-detail-modal" style="background: white; border-radius: 8px; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e4e7ed; display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0;"><i class="fas fa-file-alt"></i> ${safeTitle}</h3>
                            <button class="modal-close" onclick="PredictionReport.closeModal('reportDetailModal')" style="border: none; background: none; font-size: 24px; cursor: pointer; color: #909399;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" style="padding: 20px;">
                            <!-- 基本信息 -->
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-info-circle"></i> 基本信息</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                    <div><span style="color: #909399;">设备ID:</span> <strong>${report.deviceId || 'N/A'}</strong></div>
                                    <div><span style="color: #909399;">报告类型:</span> <strong>${report.reportType || 'N/A'}</strong></div>
                                    <div><span style="color: #909399;">报告周期:</span> <strong>${report.reportPeriod || 'N/A'}</strong></div>
                                    <div><span style="color: #909399;">生成时间:</span> <strong>${this.formatDate(report.reportTime)}</strong></div>
                                </div>
                            </div>

                            <!-- 统计数据 -->
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-chart-bar"></i> 统计数据</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                    <div style="padding: 15px; background: #f0f9ff; border-radius: 6px;">
                                        <div style="font-size: 24px; font-weight: 600; color: #409EFF;">${report.totalPredictions || 0}</div>
                                        <div style="color: #606266; margin-top: 5px;">总预测次数</div>
                                    </div>
                                    <div style="padding: 15px; background: #fef0f0; border-radius: 6px;">
                                        <div style="font-size: 24px; font-weight: 600; color: #F56C6C;">${report.anomalyCount || 0}</div>
                                        <div style="color: #606266; margin-top: 5px;">异常检测次数</div>
                                    </div>
                                    <div style="padding: 15px; background: #f0f9ff; border-radius: 6px;">
                                        <div style="font-size: 24px; font-weight: 600; color: #67C23A;">${report.accuracyRate ? (report.accuracyRate * 100).toFixed(1) + '%' : 'N/A'}</div>
                                        <div style="color: #606266; margin-top: 5px;">预测准确率</div>
                                    </div>
                                    <div style="padding: 15px; background: ${report.healthScore >= 0.7 ? '#f0f9ff' : '#fef0f0'}; border-radius: 6px;">
                                        <div style="font-size: 24px; font-weight: 600; color: ${report.healthScore >= 0.7 ? '#67C23A' : '#F56C6C'};">${report.healthScore ? (report.healthScore * 100).toFixed(1) : 'N/A'}</div>
                                        <div style="color: #606266; margin-top: 5px;">健康度评分</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 告警统计 -->
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-bell"></i> 告警统计</h4>
                                <div style="display: flex; gap: 15px;">
                                    <div style="flex: 1; padding: 10px; background: #fef0f0; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                                        <i class="fas fa-exclamation-circle" style="color: #F56C6C; font-size: 20px;"></i>
                                        <span>严重告警: <strong>${report.criticalAlerts || 0}</strong>条</span>
                                    </div>
                                    <div style="flex: 1; padding: 10px; background: #fdf6ec; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                                        <i class="fas fa-exclamation-triangle" style="color: #E6A23C; font-size: 20px;"></i>
                                        <span>警告告警: <strong>${report.warningAlerts || 0}</strong>条</span>
                                    </div>
                                    <div style="flex: 1; padding: 10px; background: #f0f9ff; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                                        <i class="fas fa-info-circle" style="color: #409EFF; font-size: 20px;"></i>
                                        <span>信息告警: <strong>${report.infoAlerts || 0}</strong>条</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 摘要 -->
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-clipboard-list"></i> 报告摘要</h4>
                                <div style="padding: 15px; background: #f5f7fa; border-radius: 6px; line-height: 1.6;">
                                    ${safeSummary}
                                </div>
                            </div>

                            <!-- 关键发现 -->
                            ${report.keyFindings ? `
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-search"></i> 关键发现</h4>
                                <ul style="list-style: none; padding: 0;">
                                    ${JSON.parse(report.keyFindings).map(finding => {
                                        const safeFinding = finding.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_\s，。、！？：；""''（）【】《》]/g, '');
                                        return `<li style="padding: 8px 0; border-bottom: 1px solid #e4e7ed;"><i class="fas fa-check-circle" style="color: #67C23A; margin-right: 8px;"></i>${safeFinding}</li>`;
                                    }).join('')}
                                </ul>
                            </div>
                            ` : ''}

                            <!-- 建议 -->
                            ${report.recommendations ? `
                            <div class="detail-section" style="margin-bottom: 20px;">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-lightbulb"></i> 优化建议</h4>
                                <ul style="list-style: none; padding: 0;">
                                    ${JSON.parse(report.recommendations).map(rec => {
                                        const safeRec = rec.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_\s，。、！？：；""''（）【】《》]/g, '');
                                        return `<li style="padding: 8px 0; border-bottom: 1px solid #e4e7ed;"><i class="fas fa-arrow-right" style="color: #409EFF; margin-right: 8px;"></i>${safeRec}</li>`;
                                    }).join('')}
                                </ul>
                            </div>
                            ` : ''}

                            <!-- 时间范围 -->
                            <div class="detail-section">
                                <h4 style="margin-bottom: 15px; color: #303133;"><i class="fas fa-clock"></i> 统计时间范围</h4>
                                <div style="display: flex; gap: 30px;">
                                    <span><strong>开始时间:</strong> ${this.formatDate(report.periodStart)}</span>
                                    <span><strong>结束时间:</strong> ${this.formatDate(report.periodEnd)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #e4e7ed; text-align: right;">
                            <button onclick="PredictionReport.closeModal('reportDetailModal')" style="padding: 8px 20px; background: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-check"></i> 确定
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 先移除可能存在的旧模态框
            const oldModal = document.getElementById('reportDetailModal');
            if (oldModal) {
                oldModal.remove();
            }
            
            // 直接插入HTML到body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            console.log('✅ Modal displayed successfully');
            
            // 禁止body滚动
            document.body.style.overflow = 'hidden';
            
            // 监听模态框关闭事件
            const modal = document.getElementById('reportDetailModal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        PredictionReport.closeModal('reportDetailModal');
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Failed to load report detail:', error);
            this.closeLoadingModal();
            alert('加载报告详情失败: ' + error.message);
        }
    },

    /**
     * 显示加载模态框
     */
    showLoadingModal: function(message) {
        const loadingHTML = `
            <div class="modal-overlay" id="loadingModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001;">
                <div style="background: white; padding: 30px 50px; border-radius: 8px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="font-size: 40px; color: #409EFF; margin-bottom: 15px;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <div style="font-size: 16px; color: #606266;">${message || '加载中...'}</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    },

    /**
     * 关闭加载模态框
     */
    closeLoadingModal: function() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * 显示趋势分析
     */
    showTrendAnalysis: async function(serviceId) {
        console.log(`\n========== 显示趋势分析 ==========`);
        console.log(`📈 Service ID: ${serviceId}`);
        console.log(`📈 Current Category:`, this.currentCategory);
        
        if (!serviceId || serviceId === 'undefined' || serviceId === 'null') {
            console.error('❌ Invalid serviceId:', serviceId);
            alert('服务ID无效，无法查看趋势');
            return;
        }
        
        try {
            // 创建简单的趋势分析模态框
            const modalHTML = `
                <div class="modal-overlay" id="trendModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                    <div class="modal-content" style="background: white; border-radius: 8px; width: 80%; max-width: 1000px; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e4e7ed; display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0;"><i class="fas fa-chart-line" style="color: #f5576c; margin-right: 10px;"></i>健康度趋势分析</h3>
                            <button onclick="PredictionReport.closeModal('trendModal')" style="border: none; background: none; font-size: 24px; cursor: pointer; color: #909399;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" style="padding: 30px; text-align: center;">
                            <div style="margin-bottom: 30px;">
                                <i class="fas fa-chart-area" style="font-size: 80px; color: #667eea; opacity: 0.6;"></i>
                            </div>
                            <h4 style="color: #303133; margin-bottom: 20px;">趋势分析功能</h4>
                            <p style="color: #606266; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                                该功能将展示设备健康度的历史趋势变化，包括：<br>
                                📊 7天/30天健康度变化曲线<br>
                                📈 异常率趋势分析<br>
                                🎯 预测准确率变化<br>
                                ⚠️ 告警频率统计
                            </p>
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
                                <strong>服务ID: ${serviceId}</strong>
                                ${this.currentCategory ? `<br><strong>分类: ${this.currentCategory.name}</strong>` : ''}
                            </div>
                            <p style="color: #909399; font-size: 14px;">
                                💡 此功能即将上线，敬请期待！
                            </p>
                        </div>
                        <div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid #e4e7ed; text-align: right;">
                            <button onclick="PredictionReport.closeModal('trendModal')" style="padding: 8px 20px; background: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-check"></i> 确定
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 先移除可能存在的旧模态框
            const oldModal = document.getElementById('trendModal');
            if (oldModal) {
                oldModal.remove();
            }
            
            // 直接插入HTML到body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            console.log('✅ Trend analysis modal displayed successfully');
            
            // 禁止body滚动
            document.body.style.overflow = 'hidden';
            
            // 监听模态框关闭事件
            const modal = document.getElementById('trendModal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        PredictionReport.closeModal('trendModal');
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Failed to show trend analysis:', error);
            alert('显示趋势分析失败: ' + error.message);
        }
    },

    /**
     * 关闭模态框
     */
    closeModal: function(modalId) {
        console.log(`🔒 Closing modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            // 恢复body滚动
            document.body.style.overflow = '';
            console.log('✅ Modal closed successfully');
        }
    }
};

// 为enhanced版本提供备用方法名
PredictionReport.viewReportDetailBase = PredictionReport.viewReportDetail;
PredictionReport.showTrendAnalysisBase = PredictionReport.showTrendAnalysis;

// 全局函数：在页面切换时调用
window.initPredictionReportPage = function() {
    console.log('📋 Initializing Prediction Report page...');
    PredictionReport.init();
};

// 预测风险页面初始化（与预测报告使用相同的入口模式）
window.initPredictionRiskPage = function() {
    console.log('📋 Initializing Prediction Risk page...');
    if (window.PredictionRisk && typeof window.PredictionRisk.init === 'function') {
        window.PredictionRisk.init();
    } else {
        console.warn('PredictionRisk 对象未定义，无法初始化预测风险页面');
    }
};

// 监听页面切换事件，初始化预测报告页面和预测风险页面
document.addEventListener('DOMContentLoaded', () => {
    // 监听子页面切换
    const reportSubPage = document.getElementById('page-stats-report');
    const riskSubPage = document.getElementById('page-stats-risk');
    
    if (reportSubPage) {
        const reportObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active') || 
                    mutation.target.style.display === 'block') {
                    console.log('📋 Prediction Report page is now visible, initializing...');
                    window.initPredictionReportPage();
                }
            });
        });

        reportObserver.observe(reportSubPage, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    if (riskSubPage) {
        const riskObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active') || 
                    mutation.target.style.display === 'block') {
                    console.log('📋 Prediction Risk page is now visible, initializing...');
                    window.initPredictionRiskPage();
                }
            });
        });

        riskObserver.observe(riskSubPage, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
});

console.log('🚀 Prediction Report JS loaded');
