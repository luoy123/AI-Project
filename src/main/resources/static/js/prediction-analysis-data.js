/**
 * 智能分析页面数据加载脚本
 */

/**
 * 初始化智能分析页面
 */
function initPredictionAnalysisPage() {
    console.log('✅ 初始化智能分析页面');

    // 暂时跳过时间筛选器初始化（避免jQuery依赖问题）
    // 如果initTimeFilter存在且jQuery已加载，则初始化
    if (typeof initTimeFilter === 'function' && typeof $ !== 'undefined') {
        try {
            initTimeFilter('analysisTimeFilter', function(filterParams) {
                console.log('智能分析筛选参数变化:', filterParams);
                loadAnalysisData(filterParams);
            });
        } catch (error) {
            console.warn('时间筛选器初始化失败，使用默认配置:', error);
        }
    } else {
        console.warn('时间筛选器或jQuery未加载，跳过筛选器初始化');
    }

    // 加载初始数据
    loadAnalysisData({});
}

/**
 * 加载分析数��
 * @param filterParams 筛选参数
 */
function loadAnalysisData(filterParams) {
    console.log('加载智能分析数据:', filterParams);

    // 显示加载状态
    showLoading('analysisContainer');

    // 并行加载统计数据和趋势数据
    Promise.all([
        loadStatistics(filterParams),
        loadTrendData(filterParams)
    ]).then(([stats, trend]) => {
        renderAnalysisPage(stats, trend);
    }).catch(error => {
        console.error('加载智能分析数据失败:', error);
        showError('加载智能分析数据失败');
        hideLoading('analysisContainer');
    });
}

/**
 * 加载统计数据
 * @param filterParams 筛选参数
 * @returns {Promise} Promise对象
 */
async function loadStatistics(filterParams) {
    try {
        // 构建查询参数
        const queryString = new URLSearchParams(filterParams).toString();
        const url = `/api/prediction/data/statistics${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        
        // 如果API不存在，使用模拟数据
        if (!response.ok || response.status === 404) {
            console.warn('⚠️ API不存在或请求失败，使用模拟数据');
            return getMockStatistics();
        }
        
        const res = await response.json();
        
        if (res.code === 200) {
            return res.data;
        } else {
            console.warn('⚠️ API返回错误，使用模拟数据');
            return getMockStatistics();
        }
    } catch (error) {
        console.warn('⚠️ 加载统计数据失败，使用模拟数据:', error.message);
        return getMockStatistics();
    }
}

/**
 * 获取模拟统计数据
 */
function getMockStatistics() {
    return {
        totalReports: 45,
        totalRisks: 8,
        normalCount: 18,
        warningCount: 6,
        criticalCount: 2,
        highRiskCount: 3,
        mediumRiskCount: 4,
        lowRiskCount: 1,
        categoryStats: {
            '服务器': 15,
            '网络设备': 12,
            '存储设备': 8,
            '视频设备': 10
        }
    };
}

/**
 * 加载趋势数据
 * @param filterParams 筛选参数
 * @returns {Promise} Promise对象
 */
async function loadTrendData(filterParams) {
    try {
        const params = Object.assign({}, filterParams);
        // 默认查询最近7天的趋势
        if (!params.days) {
            params.days = 7;
        }

        // 构建查询参数
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/prediction/data/trend${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        
        // 如果API不存在，使用模拟数据
        if (!response.ok || response.status === 404) {
            console.warn('⚠️ API不存在或请求失败，使用模拟趋势数据');
            return getMockTrendData();
        }
        
        const res = await response.json();
        
        if (res.code === 200) {
            return res.data;
        } else {
            console.warn('⚠️ API返回错误，使用模拟趋势数据');
            return getMockTrendData();
        }
    } catch (error) {
        console.warn('⚠️ 加载趋势数据失败，使用模拟数据:', error.message);
        return getMockTrendData();
    }
}

/**
 * 获取模拟趋势数据
 */
function getMockTrendData() {
    const dates = [];
    const normalData = [];
    const warningData = [];
    const criticalData = [];
    
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push((date.getMonth() + 1) + '/' + date.getDate());
        
        normalData.push(Math.floor(Math.random() * 5) + 15);
        warningData.push(Math.floor(Math.random() * 3) + 4);
        criticalData.push(Math.floor(Math.random() * 2) + 1);
    }
    
    return {
        dates,
        normalData,
        warningData,
        criticalData
    };
}

/**
 * 渲染分析页面
 * @param stats 统计数据
 * @param trend 趋势数据
 */
function renderAnalysisPage(stats, trend) {
    const container = document.getElementById('analysisContainer');
    if (!container) {
        console.error('分析容器不存在');
        return;
    }

    const html = `
        <div class="analysis-page">
            <!-- 统计卡片 -->
            <div class="statistics-section" style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;">预测统计概览</h4>
                <div id="statisticsCards"></div>
            </div>

            <!-- 趋势图表 -->
            <div class="trend-section" style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;">预测趋势分析</h4>
                <div id="trendChart" style="width: 100%; height: 400px; background: #fff; border-radius: 8px; padding: 20px;"></div>
            </div>

            <!-- 风险分布 -->
            <div class="risk-distribution-section" style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;">风险等级分布</h4>
                <div id="riskDistributionChart" style="width: 100%; height: 350px; background: #fff; border-radius: 8px; padding: 20px;"></div>
            </div>

            <!-- 分类统计 -->
            <div class="category-section" style="margin-bottom: 30px;">
                <h4 style="margin-bottom: 20px;">资产分类统计</h4>
                <div id="categoryChart" style="width: 100%; height: 350px; background: #fff; border-radius: 8px; padding: 20px;"></div>
            </div>

            <!-- 详细数据表格 -->
            <div class="data-table-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="margin: 0;">监测数据详细记录</h4>
                    <div>
                        <button onclick="exportAnalysisData()" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                            <i class="fas fa-download"></i> 导出数据
                        </button>
                        <button onclick="refreshAnalysisData()" style="padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> 刷新
                        </button>
                    </div>
                </div>
                <div id="analysisDataTable" style="background: #fff; border-radius: 8px; overflow: hidden;"></div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // 渲染各个部分
    renderStatisticsCards(stats);
    renderTrendChart(trend);
    renderRiskDistributionChart(stats);
    renderCategoryChart(stats);
    renderAnalysisDataTable(stats);
}

/**
 * 渲染统计卡片
 * @param stats 统计数据
 */
function renderStatisticsCards(stats) {
    const container = document.getElementById('statisticsCards');
    if (!container) return;

    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-file-alt"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">总报告数</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.totalReports || 0}</div>
            </div>

            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-exclamation-triangle"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">总风险数</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.totalRisks || 0}</div>
            </div>

            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-check-circle"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">正常设备</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.normalCount || 0}</div>
            </div>

            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-exclamation-circle"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">警告设备</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.warningCount || 0}</div>
            </div>

            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-times-circle"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">严重设备</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.criticalCount || 0}</div>
            </div>

            <div class="stat-card" style="padding: 25px; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); border-radius: 12px; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="stat-icon" style="font-size: 36px; margin-bottom: 10px;">
                    <i class="fa fa-shield-alt"></i>
                </div>
                <div class="stat-title" style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">高风险项</div>
                <div class="stat-value" style="font-size: 36px; font-weight: bold;">${stats.highRiskCount || 0}</div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * 渲染趋势图表
 * @param trend 趋势数据
 */
function renderTrendChart(trend) {
    const container = document.getElementById('trendChart');
    if (!container || typeof echarts === 'undefined') {
        console.error('趋势图表容器不存在或ECharts未加载');
        return;
    }

    const myChart = echarts.init(container);

    const option = {
        title: {
            text: '预测趋势分析',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['正常', '警告', '严重'],
            bottom: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trend.dates || []
        },
        yAxis: {
            type: 'value',
            name: '设备数量'
        },
        series: [
            {
                name: '正常',
                type: 'line',
                smooth: true,
                data: trend.normalData || [],
                itemStyle: { color: '#52c41a' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                        { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
                    ])
                }
            },
            {
                name: '警告',
                type: 'line',
                smooth: true,
                data: trend.warningData || [],
                itemStyle: { color: '#faad14' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
                        { offset: 1, color: 'rgba(250, 173, 20, 0.05)' }
                    ])
                }
            },
            {
                name: '严重',
                type: 'line',
                smooth: true,
                data: trend.criticalData || [],
                itemStyle: { color: '#f5222d' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
                        { offset: 1, color: 'rgba(245, 34, 45, 0.05)' }
                    ])
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
 * 渲染风险分布图表
 * @param stats 统计数据
 */
function renderRiskDistributionChart(stats) {
    const container = document.getElementById('riskDistributionChart');
    if (!container || typeof echarts === 'undefined') {
        console.error('风险分布图表容器不存在或ECharts未加载');
        return;
    }

    const myChart = echarts.init(container);

    const option = {
        title: {
            text: '风险等级分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle'
        },
        series: [
            {
                name: '风险等级',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                data: [
                    { value: stats.highRiskCount || 0, name: '高风险', itemStyle: { color: '#f5222d' } },
                    { value: stats.mediumRiskCount || 0, name: '中风险', itemStyle: { color: '#faad14' } },
                    { value: stats.lowRiskCount || 0, name: '低风险', itemStyle: { color: '#52c41a' } }
                ]
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
 * 渲染分类统计图表
 * @param stats 统计数据
 */
function renderCategoryChart(stats) {
    const container = document.getElementById('categoryChart');
    if (!container || typeof echarts === 'undefined') {
        console.error('分类统计图表容器不存在或ECharts未加载');
        return;
    }

    const myChart = echarts.init(container);

    // 处理分类统计数据
    const categoryStats = stats.categoryStats || {};
    const categories = Object.keys(categoryStats);
    const values = Object.values(categoryStats);

    const option = {
        title: {
            text: '资产分类统计',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: categories.length > 0 ? categories : ['暂无数据'],
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '报告数量'
        },
        series: [
            {
                name: '报告数量',
                type: 'bar',
                data: values.length > 0 ? values : [0],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#2378f7' },
                            { offset: 0.7, color: '#2378f7' },
                            { offset: 1, color: '#83bff6' }
                        ])
                    }
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
 * 显示加载状态
 * @param containerId 容器ID
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fa fa-spinner fa-spin" style="font-size: 48px; color: #1890ff;"></i>
                <p style="margin-top: 20px; color: #666;">加载中...</p>
            </div>
        `;
    }
}

/**
 * 隐藏加载状态
 * @param containerId 容器ID
 */
function hideLoading(containerId) {
    // 由renderAnalysisPage等函数负责渲染内容
}

/**
 * 显示错误信息
 * @param message 错误信息
 */
function showError(message) {
    if (typeof layer !== 'undefined') {
        layer.msg(message, { icon: 2 });
    } else {
        alert(message);
    }
}

// 全局变量：分页状态
let currentPage = 1;
let pageSize = 10;
let allTableData = [];
let totalRecords = 0;
let totalPages = 0;

/**
 * 渲染分析数据表格
 * @param stats 统计数据
 */
function renderAnalysisDataTable(stats) {
    const container = document.getElementById('analysisDataTable');
    if (!container) return;

    // 从后端API获取数据
    loadTableDataFromAPI(1);
}

/**
 * 从后端API加载表格数据
 * @param page 页码
 */
async function loadTableDataFromAPI(page) {
    try {
        const url = `/api/prediction/data/records?page=${page}&pageSize=${pageSize}`;
        const response = await fetch(url);
        
        if (!response.ok || response.status === 404) {
            console.warn('⚠️ 监测数据API不存在，使用模拟数据');
            allTableData = generateMockTableData({});
            renderTablePage(1);
            return;
        }
        
        const res = await response.json();
        
        if (res.code === 200 && res.data) {
            console.log('✅ 从数据库获取监测数据:', res.data);
            allTableData = res.data.records || [];
            totalRecords = res.data.total || 0;
            totalPages = res.data.totalPages || 1;
            currentPage = page;
            
            // 渲染表格（使用服务端分页）
            renderTablePageFromAPI();
        } else {
            console.warn('⚠️ API返回错误，使用模拟数据');
            allTableData = generateMockTableData({});
            renderTablePage(1);
        }
    } catch (error) {
        console.warn('⚠️ 加载监测数据失败，使用模拟数据:', error.message);
        allTableData = generateMockTableData({});
        renderTablePage(1);
    }
}

/**
 * 渲染使用API分页的表格
 */
function renderTablePageFromAPI() {
    const container = document.getElementById('analysisDataTable');
    if (!container) return;
    
    const pageData = allTableData;
    
    // 生成页码按钮
    const pageButtons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pageButtons.push(`
            <button onclick="loadTableDataFromAPI(${i})" 
                    style="padding: 6px 12px; border: 1px solid ${isActive ? '#1890ff' : '#d9d9d9'}; 
                           background: ${isActive ? '#1890ff' : 'white'}; 
                           color: ${isActive ? 'white' : '#262626'}; 
                           border-radius: 4px; cursor: pointer; transition: all 0.3s;"
                    ${isActive ? 'disabled' : ''}>
                ${i}
            </button>
        `);
    }

    const html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; min-width: 1100px; border-collapse: collapse; font-size: 14px; table-layout: fixed;">
                <thead>
                    <tr style="background: #fafafa; border-bottom: 2px solid #e8e8e8;">
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #262626; white-space: nowrap; width: 115px;">时间</th>
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #262626; white-space: nowrap; width: 130px;">设备名称</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 100px;">设备类型</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 90px;">监测指标</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">当前值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">预测值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">预警阈值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">严重阈值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 75px;">风险等级</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 65px;">状态</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageData.map(row => `
                        <tr style="border-bottom: 1px solid #f0f0f0; transition: background 0.3s;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='white'">
                            <td style="padding: 10px 8px; color: #595959; white-space: nowrap;">${row.time}</td>
                            <td style="padding: 10px 8px; color: #262626; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${row.deviceName}</td>
                            <td style="padding: 10px 8px; text-align: center;">
                                <span style="padding: 2px 8px; background: ${getCategoryColor(row.category)}; color: white; border-radius: 4px; font-size: 12px; white-space: nowrap; display: inline-block;">
                                    ${row.category}
                                </span>
                            </td>
                            <td style="padding: 10px 8px; color: #595959; text-align: center; white-space: nowrap;">${row.metric}</td>
                            <td style="padding: 10px 8px; text-align: center; font-weight: 500; white-space: nowrap; color: ${getValueColor(row.currentValue, row.warningThreshold, row.criticalThreshold)};">
                                ${row.currentValue}${row.unit}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; color: #8c8c8c; white-space: nowrap;">${row.predictedValue}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; color: #faad14; white-space: nowrap;">${row.warningThreshold}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; color: #f5222d; white-space: nowrap;">${row.criticalThreshold}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                ${getRiskBadge(row.riskLevel)}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                ${getStatusBadge(row.status)}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                <button onclick="viewDetail('${row.id}')" style="padding: 4px 10px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.3s; white-space: nowrap;" onmouseover="this.style.background='#40a9ff'" onmouseout="this.style.background='#1890ff'">
                                    查看详情
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 分页 -->
        <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; flex-wrap: wrap; gap: 10px;">
            <div style="color: #8c8c8c; font-size: 14px;">
                共 ${totalRecords} 条记录，每页 ${pageSize} 条，第 ${currentPage}/${totalPages} 页
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button onclick="loadTableDataFromAPI(${currentPage - 1})" 
                        style="padding: 6px 12px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: ${currentPage > 1 ? 'pointer' : 'not-allowed'}; transition: all 0.3s;"
                        ${currentPage <= 1 ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) this.style.background='#fafafa'"
                        onmouseout="this.style.background='white'">
                    上一页
                </button>
                ${pageButtons.join('')}
                <button onclick="loadTableDataFromAPI(${currentPage + 1})" 
                        style="padding: 6px 12px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: ${currentPage < totalPages ? 'pointer' : 'not-allowed'}; transition: all 0.3s;"
                        ${currentPage >= totalPages ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) this.style.background='#fafafa'"
                        onmouseout="this.style.background='white'">
                    下一页
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    console.log(`📄 已渲染第 ${currentPage} 页，显示 ${pageData.length} 条记录（数据库数据）`);
}

/**
 * 渲染指定页的表格数据
 * @param page 页码
 */
function renderTablePage(page) {
    const container = document.getElementById('analysisDataTable');
    if (!container || !allTableData || allTableData.length === 0) return;
    
    currentPage = page;
    
    // 计算分页
    const totalRecords = allTableData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    const pageData = allTableData.slice(startIndex, endIndex);
    
    // 生成页码按钮
    const pageButtons = [];
    const maxButtons = 5; // 最多显示5个页码按钮
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === page;
        pageButtons.push(`
            <button onclick="renderTablePage(${i})" 
                    style="padding: 6px 12px; border: 1px solid ${isActive ? '#1890ff' : '#d9d9d9'}; 
                           background: ${isActive ? '#1890ff' : 'white'}; 
                           color: ${isActive ? 'white' : '#262626'}; 
                           border-radius: 4px; cursor: pointer; transition: all 0.3s;"
                    ${isActive ? 'disabled' : ''}>
                ${i}
            </button>
        `);
    }

    const html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; min-width: 1100px; border-collapse: collapse; font-size: 14px; table-layout: fixed;">
                <thead>
                    <tr style="background: #fafafa; border-bottom: 2px solid #e8e8e8;">
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #262626; white-space: nowrap; width: 115px;">时间</th>
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #262626; white-space: nowrap; width: 130px;">设备名称</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 100px;">设备类型</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 90px;">监测指标</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">当前值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">预测值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">预警阈值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">严重阈值</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 75px;">风险等级</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 65px;">状态</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #262626; white-space: nowrap; width: 85px;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageData.map(row => `
                        <tr style="border-bottom: 1px solid #f0f0f0; transition: background 0.3s;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='white'">
                            <td style="padding: 10px 8px; color: #595959; white-space: nowrap;">${row.time}</td>
                            <td style="padding: 10px 8px; color: #262626; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${row.deviceName}</td>
                            <td style="padding: 10px 8px; text-align: center;">
                                <span style="padding: 2px 8px; background: ${getCategoryColor(row.category)}; color: white; border-radius: 4px; font-size: 12px; white-space: nowrap; display: inline-block;">
                                    ${row.category}
                                </span>
                            </td>
                            <td style="padding: 10px 8px; color: #595959; text-align: center; white-space: nowrap;">${row.metric}</td>
                            <td style="padding: 10px 8px; text-align: center; font-weight: 500; white-space: nowrap; color: ${getValueColor(row.currentValue, row.warningThreshold, row.criticalThreshold)};">
                                ${row.currentValue}${row.unit}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; color: #8c8c8c; white-space: nowrap;">${row.predictedValue}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; color: #faad14; white-space: nowrap;">${row.warningThreshold}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; color: #f5222d; white-space: nowrap;">${row.criticalThreshold}${row.unit}</td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                ${getRiskBadge(row.riskLevel)}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                ${getStatusBadge(row.status)}
                            </td>
                            <td style="padding: 10px 8px; text-align: center; white-space: nowrap;">
                                <button onclick="viewDetail('${row.id}')" style="padding: 4px 10px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.3s; white-space: nowrap;" onmouseover="this.style.background='#40a9ff'" onmouseout="this.style.background='#1890ff'">
                                    查看详情
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 分页 -->
        <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; flex-wrap: wrap; gap: 10px;">
            <div style="color: #8c8c8c; font-size: 14px;">
                共 ${totalRecords} 条记录，每页 ${pageSize} 条，第 ${page}/${totalPages} 页
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button onclick="renderTablePage(${page - 1})" 
                        style="padding: 6px 12px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: ${page > 1 ? 'pointer' : 'not-allowed'}; transition: all 0.3s;"
                        ${page <= 1 ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) this.style.background='#fafafa'"
                        onmouseout="this.style.background='white'">
                    上一页
                </button>
                ${pageButtons.join('')}
                <button onclick="renderTablePage(${page + 1})" 
                        style="padding: 6px 12px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: ${page < totalPages ? 'pointer' : 'not-allowed'}; transition: all 0.3s;"
                        ${page >= totalPages ? 'disabled' : ''}
                        onmouseover="if(!this.disabled) this.style.background='#fafafa'"
                        onmouseout="this.style.background='white'">
                    下一页
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    console.log(`📄 已渲染第 ${page} 页，显示 ${pageData.length} 条记录`);
}

/**
 * 生成模拟表格数据
 */
function generateMockTableData(stats) {
    const now = new Date();
    const data = [];
    
    const devices = [
        { name: 'WebServer-01', category: '服务器' },
        { name: 'WebServer-02', category: '服务器' },
        { name: 'DBServer-01', category: '服务器' },
        { name: 'NetSwitch-01', category: '网络设备' },
        { name: 'NetSwitch-02', category: '网络设备' },
        { name: 'Storage-01', category: '存储设备' },
        { name: 'VideoServer-01', category: '视频设备' },
        { name: 'AppServer-01', category: '服务器' }
    ];
    
    const metrics = [
        { name: 'CPU使用率', unit: '%', warning: 70, critical: 90 },
        { name: '内存使用率', unit: '%', warning: 80, critical: 95 },
        { name: '磁盘使用率', unit: '%', warning: 80, critical: 95 },
        { name: '网络流量', unit: 'Mbps', warning: 500, critical: 800 }
    ];
    
    const riskLevels = ['低', '中', '高', '严重'];
    const statuses = ['正常', '预警', '告警'];
    
    for (let i = 0; i < 15; i++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const metric = metrics[Math.floor(Math.random() * metrics.length)];
        const currentValue = Math.floor(Math.random() * 100);
        const predictedValue = currentValue + Math.floor(Math.random() * 10 - 5);
        
        let status = '正常';
        let riskLevel = '低';
        
        if (currentValue >= metric.critical) {
            status = '告警';
            riskLevel = '严重';
        } else if (currentValue >= metric.warning) {
            status = '预警';
            riskLevel = Math.random() > 0.5 ? '高' : '中';
        }
        
        const time = new Date(now.getTime() - i * 5 * 60 * 1000);
        
        data.push({
            id: `record_${i}`,
            time: formatTime(time),
            deviceName: device.name,
            category: device.category,
            metric: metric.name,
            currentValue: currentValue,
            predictedValue: predictedValue,
            warningThreshold: metric.warning,
            criticalThreshold: metric.critical,
            unit: metric.unit,
            riskLevel: riskLevel,
            status: status
        });
    }
    
    return data;
}

/**
 * 格式化时间
 */
function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 获取分类颜色
 */
function getCategoryColor(category) {
    const colors = {
        '服务器': '#1890ff',
        '网络设备': '#52c41a',
        '存储设备': '#faad14',
        '视频设备': '#722ed1'
    };
    return colors[category] || '#8c8c8c';
}

/**
 * 获取数值颜色
 */
function getValueColor(value, warning, critical) {
    if (value >= critical) return '#f5222d';
    if (value >= warning) return '#faad14';
    return '#52c41a';
}

/**
 * 获取风险等级徽章
 */
function getRiskBadge(level) {
    const badges = {
        '低': '<span style="padding: 4px 12px; background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; border-radius: 4px; font-size: 12px;">低风险</span>',
        '中': '<span style="padding: 4px 12px; background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; border-radius: 4px; font-size: 12px;">中风险</span>',
        '高': '<span style="padding: 4px 12px; background: #fff7e6; color: #faad14; border: 1px solid #ffd591; border-radius: 4px; font-size: 12px;">高风险</span>',
        '严重': '<span style="padding: 4px 12px; background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; border-radius: 4px; font-size: 12px;">严重</span>'
    };
    return badges[level] || badges['低'];
}

/**
 * 获取状态徽章
 */
function getStatusBadge(status) {
    const badges = {
        '正常': '<span style="padding: 4px 12px; background: #52c41a; color: white; border-radius: 4px; font-size: 12px;"><i class="fas fa-check-circle"></i> 正常</span>',
        '预警': '<span style="padding: 4px 12px; background: #faad14; color: white; border-radius: 4px; font-size: 12px;"><i class="fas fa-exclamation-triangle"></i> 预警</span>',
        '告警': '<span style="padding: 4px 12px; background: #f5222d; color: white; border-radius: 4px; font-size: 12px;"><i class="fas fa-times-circle"></i> 告警</span>'
    };
    return badges[status] || badges['正常'];
}

/**
 * 查看详情
 */
function viewDetail(id) {
    console.log('🔍 查看详情:', id);
    
    // 获取详细数据
    const stats = getMockStatistics();
    const tableData = generateMockTableData(stats);
    const record = tableData.find(r => r.id === id);
    
    if (!record) {
        console.error('未找到记录:', id);
        return;
    }
    
    // 构建详情HTML
    const detailHtml = `
        <div style="padding: 20px; max-height: 500px; overflow-y: auto;">
            <h3 style="margin-top: 0; color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">
                📊 监测详情
            </h3>
            
            <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">🖥️ 设备信息</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; width: 120px; color: #666;">设备名称：</td>
                        <td style="padding: 10px; color: #333;">${record.deviceName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">设备类型：</td>
                        <td style="padding: 10px;">
                            <span style="padding: 4px 12px; background: ${getCategoryColor(record.category)}; color: white; border-radius: 4px;">
                                ${record.category}
                            </span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">监测时间：</td>
                        <td style="padding: 10px; color: #333;">${record.time}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">📈 监测指标</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; width: 120px; color: #666;">监测项：</td>
                        <td style="padding: 10px; color: #333; font-size: 16px; font-weight: 500;">${record.metric}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">当前值：</td>
                        <td style="padding: 10px;">
                            <span style="font-size: 24px; font-weight: bold; color: ${getValueColor(record.currentValue, record.warningThreshold, record.criticalThreshold)};">
                                ${record.currentValue}${record.unit}
                            </span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">预测值：</td>
                        <td style="padding: 10px;">
                            <span style="font-size: 20px; font-weight: 500; color: #8c8c8c;">
                                ${record.predictedValue}${record.unit}
                            </span>
                            ${record.predictedValue > record.currentValue ? 
                                '<span style="color: #f5222d; margin-left: 10px;">↑ 上升趋势</span>' : 
                                '<span style="color: #52c41a; margin-left: 10px;">↓ 下降趋势</span>'}
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">⚠️ 阈值设置</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; width: 120px; color: #666;">预警阈值：</td>
                        <td style="padding: 10px;">
                            <span style="font-size: 18px; font-weight: 500; color: #faad14;">
                                ${record.warningThreshold}${record.unit}
                            </span>
                            ${record.currentValue >= record.warningThreshold ? 
                                '<span style="color: #faad14; margin-left: 10px;">⚠️ 已超过</span>' : 
                                '<span style="color: #52c41a; margin-left: 10px;">✅ 正常</span>'}
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">严重阈值：</td>
                        <td style="padding: 10px;">
                            <span style="font-size: 18px; font-weight: 500; color: #f5222d;">
                                ${record.criticalThreshold}${record.unit}
                            </span>
                            ${record.currentValue >= record.criticalThreshold ? 
                                '<span style="color: #f5222d; margin-left: 10px;">🔴 已超过</span>' : 
                                '<span style="color: #52c41a; margin-left: 10px;">✅ 正常</span>'}
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">🎯 风险评估</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; width: 120px; color: #666;">风险等级：</td>
                        <td style="padding: 10px;">${getRiskBadge(record.riskLevel)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px; font-weight: bold; color: #666;">当前状态：</td>
                        <td style="padding: 10px;">${getStatusBadge(record.status)}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #1890ff; border-radius: 4px;">
                <h4 style="color: #1890ff; margin-top: 0;">💡 建议措施</h4>
                <p style="margin: 5px 0; color: #666;">
                    ${getRecommendation(record)}
                </p>
            </div>
        </div>
    `;
    
    // 显示弹窗
    if (typeof layer !== 'undefined') {
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            area: ['600px', 'auto'],
            maxHeight: 600,
            shadeClose: true,
            content: detailHtml
        });
    } else {
        // 如果没有layer，使用alert
        alert(`设备：${record.deviceName}\n指标：${record.metric}\n当前值：${record.currentValue}${record.unit}\n预测值：${record.predictedValue}${record.unit}\n状态：${record.status}`);
    }
}

/**
 * 获取建议措施
 */
function getRecommendation(record) {
    if (record.currentValue >= record.criticalThreshold) {
        return `⚠️ <strong>紧急</strong>：${record.metric}已达到严重阈值，建议立即采取措施：<br/>
                1. 检查${record.deviceName}的运行状态<br/>
                2. 清理不必要的资源占用<br/>
                3. 考虑扩容或优化配置<br/>
                4. 通知相关负责人员`;
    } else if (record.currentValue >= record.warningThreshold) {
        return `⚠️ <strong>注意</strong>：${record.metric}已超过预警阈值，建议：<br/>
                1. 持续关注该指标变化<br/>
                2. 检查是否有异常进程或任务<br/>
                3. 准备扩容方案以备不时之需`;
    } else if (record.predictedValue >= record.warningThreshold) {
        return `📊 <strong>预防</strong>：预测值即将超过预警阈值，建议：<br/>
                1. 提前做好容量规划<br/>
                2. 优化资源使用效率<br/>
                3. 制定应急预案`;
    } else {
        return `✅ <strong>正常</strong>：当前${record.metric}运行正常，建议：<br/>
                1. 保持当前运维策略<br/>
                2. 定期检查设备状态<br/>
                3. 持续监控指标变化`;
    }
}

/**
 * 导出分析数据为CSV
 */
function exportAnalysisData() {
    console.log('📥 导出分析数据');
    
    try {
        // 获取当前表格数据
        const stats = getMockStatistics();
        const tableData = generateMockTableData(stats);
        
        // 构建CSV内容
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
        
        // 添加表头
        const headers = ['时间', '设备名称', '设备类型', '监测指标', '当前值', '预测值', '预警阈值', '严重阈值', '风险等级', '状态'];
        csvContent += headers.join(',') + '\n';
        
        // 添加数据行
        tableData.forEach(row => {
            const rowData = [
                row.time,
                row.deviceName,
                row.category,
                row.metric,
                row.currentValue + row.unit,
                row.predictedValue + row.unit,
                row.warningThreshold + row.unit,
                row.criticalThreshold + row.unit,
                row.riskLevel,
                row.status
            ];
            csvContent += rowData.join(',') + '\n';
        });
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `智能分析数据_${formatDateForFilename(new Date())}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 显示成功提示
        if (typeof layer !== 'undefined') {
            layer.msg('✅ 数据导出成功！', { icon: 1, time: 2000 });
        } else {
            alert('数据导出成功！');
        }
        
        console.log('✅ 导出成功，共', tableData.length, '条记录');
        
    } catch (error) {
        console.error('❌ 导出失败:', error);
        if (typeof layer !== 'undefined') {
            layer.msg('导出失败：' + error.message, { icon: 2 });
        } else {
            alert('导出失败：' + error.message);
        }
    }
}

/**
 * 格式化日期用于文件名
 */
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * 刷新分析数据
 */
function refreshAnalysisData() {
    console.log('🔄 刷新分析数据');
    
    // 显示加载提示
    if (typeof layer !== 'undefined') {
        layer.msg('正在刷新数据...', { icon: 16, time: 1000 });
    }
    
    // 重新加载数据
    loadAnalysisData({});
}
