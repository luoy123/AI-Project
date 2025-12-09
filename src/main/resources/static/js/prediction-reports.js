/**
 * 预测报告管理页面JavaScript
 */

// 全局变量
let currentServiceId = 30; // 默认服务ID
let currentReports = [];
let currentPage = 1;
const pageSize = 10;

// 页面初始化
$(document).ready(function() {
    initializePage();
    loadReportsList();
    bindEvents();
});

/**
 * 初始化页面
 */
function initializePage() {
    // 设置当前时间
    $('#currentTime').text(new Date().toLocaleString());
    
    // 初始化服务选择器
    initServiceSelector();
    
    // 初始化报告类型过滤器
    initReportTypeFilter();
}

/**
 * 初始化服务选择器
 */
function initServiceSelector() {
    const serviceSelector = $('#serviceSelector');
    serviceSelector.empty();
    
    // 添加默认选项
    const services = [
        {id: 30, name: '智能预测服务A'},
        {id: 31, name: '智能预测服务B'},
        {id: 32, name: '智能预测服务C'}
    ];
    
    services.forEach(service => {
        serviceSelector.append(`<option value="${service.id}">${service.name}</option>`);
    });
    
    serviceSelector.val(currentServiceId);
}

/**
 * 初始化报告类型过滤器
 */
function initReportTypeFilter() {
    const typeFilter = $('#reportTypeFilter');
    typeFilter.empty();
    
    const reportTypes = [
        {value: '', text: '全部类型'},
        {value: 'HEALTH', text: '健康度报告'},
        {value: 'TREND', text: '趋势分析'},
        {value: 'SUMMARY', text: '综合摘要'},
        {value: 'ANOMALY', text: '异常分析'}
    ];
    
    reportTypes.forEach(type => {
        typeFilter.append(`<option value="${type.value}">${type.text}</option>`);
    });
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 服务选择变化
    $('#serviceSelector').on('change', function() {
        currentServiceId = $(this).val();
        loadReportsList();
        loadReportStatistics();
    });
    
    // 报告类型过滤变化
    $('#reportTypeFilter').on('change', function() {
        loadReportsList();
    });
    
    // 刷新按钮
    $('#refreshBtn').on('click', function() {
        loadReportsList();
        loadReportStatistics();
        showToast('数据已刷新', 'success');
    });
    
    // 生成报告按钮
    $('#generateHealthBtn').on('click', () => generateReport('HEALTH'));
    $('#generateTrendBtn').on('click', () => generateReport('TREND'));
    $('#generateSummaryBtn').on('click', () => generateReport('SUMMARY'));
    
    // 趋势分析按钮
    $('#trendAnalysisBtn').on('click', showTrendAnalysis);
    
    // 分页按钮
    $('#prevPageBtn').on('click', () => changePage(-1));
    $('#nextPageBtn').on('click', () => changePage(1));
}

/**
 * 加载报告列表
 */
async function loadReportsList() {
    try {
        showLoading('reportsList');
        
        const reportType = $('#reportTypeFilter').val();
        const params = new URLSearchParams({
            serviceId: currentServiceId,
            limit: pageSize * 5 // 获取更多数据用于分页
        });
        
        if (reportType) {
            params.append('reportType', reportType);
        }
        
        const response = await fetch(`/api/prediction/reports/latest?${params}`);
        const result = await response.json();
        
        if (result.code === 200) {
            currentReports = result.data || [];
            renderReportsList();
            updatePagination();
        } else {
            throw new Error(result.message || '获取报告列表失败');
        }
        
    } catch (error) {
        console.error('加载报告列表失败:', error);
        showToast('加载报告列表失败: ' + error.message, 'error');
        $('#reportsList').html('<div class="text-center text-muted py-4">加载失败</div>');
    } finally {
        hideLoading('reportsList');
    }
}

/**
 * 渲染报告列表
 */
function renderReportsList() {
    const container = $('#reportsList');
    container.empty();
    
    if (currentReports.length === 0) {
        container.html('<div class="text-center text-muted py-4">暂无报告数据</div>');
        return;
    }
    
    // 分页处理
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageReports = currentReports.slice(startIndex, endIndex);
    
    pageReports.forEach(report => {
        const reportCard = createReportCard(report);
        container.append(reportCard);
    });
}

/**
 * 创建报告卡片
 */
function createReportCard(report) {
    const healthScore = report.healthScore ? (report.healthScore * 100).toFixed(1) : 'N/A';
    const healthLevel = getHealthLevel(report.healthScore);
    const healthColor = getHealthColor(report.healthScore);
    
    const reportTypeText = getReportTypeText(report.reportType);
    const reportTypeColor = getReportTypeColor(report.reportType);
    
    return `
        <div class="report-card" data-report-id="${report.id}">
            <div class="report-header">
                <div class="report-title">
                    <h5>${report.reportTitle}</h5>
                    <span class="report-type-badge ${reportTypeColor}">${reportTypeText}</span>
                </div>
                <div class="report-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewReportDetail(${report.id})">
                        <i class="fas fa-eye"></i> 查看详情
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="downloadReport(${report.id})">
                        <i class="fas fa-download"></i> 下载
                    </button>
                </div>
            </div>
            
            <div class="report-content">
                <div class="report-metrics">
                    <div class="metric-item">
                        <span class="metric-label">健康度评分</span>
                        <span class="metric-value ${healthColor}">${healthScore}分 (${healthLevel})</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">预测次数</span>
                        <span class="metric-value">${report.totalPredictions || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">异常检测</span>
                        <span class="metric-value">${report.anomalyCount || 0}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">准确率</span>
                        <span class="metric-value">${report.accuracyRate ? (report.accuracyRate * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="report-summary">
                    <p>${report.summary || '暂无摘要'}</p>
                </div>
                
                <div class="report-footer">
                    <span class="report-time">
                        <i class="fas fa-clock"></i> ${formatDateTime(report.reportTime)}
                    </span>
                    <span class="report-period">
                        <i class="fas fa-calendar"></i> ${formatDateTime(report.periodStart)} ~ ${formatDateTime(report.periodEnd)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 获取健康度等级
 */
function getHealthLevel(healthScore) {
    if (!healthScore) return '未知';
    const score = healthScore * 100;
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '较差';
    return '危险';
}

/**
 * 获取健康度颜色
 */
function getHealthColor(healthScore) {
    if (!healthScore) return 'text-muted';
    const score = healthScore * 100;
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-info';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
}

/**
 * 获取报告类型文本
 */
function getReportTypeText(reportType) {
    const typeMap = {
        'HEALTH': '健康度报告',
        'TREND': '趋势分析',
        'SUMMARY': '综合摘要',
        'ANOMALY': '异常分析'
    };
    return typeMap[reportType] || reportType;
}

/**
 * 获取报告类型颜色
 */
function getReportTypeColor(reportType) {
    const colorMap = {
        'HEALTH': 'badge-success',
        'TREND': 'badge-info',
        'SUMMARY': 'badge-primary',
        'ANOMALY': 'badge-warning'
    };
    return colorMap[reportType] || 'badge-secondary';
}

/**
 * 生成报告
 */
async function generateReport(reportType) {
    try {
        showLoading('generateReportModal');
        
        const response = await fetch(`/api/prediction/reports/generate/${reportType.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `serviceId=${currentServiceId}`
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            showToast(`${getReportTypeText(reportType)}生成成功`, 'success');
            loadReportsList();
            loadReportStatistics();
        } else {
            throw new Error(result.message || '生成报告失败');
        }
        
    } catch (error) {
        console.error('生成报告失败:', error);
        showToast('生成报告失败: ' + error.message, 'error');
    } finally {
        hideLoading('generateReportModal');
    }
}

/**
 * 查看报告详情
 */
function viewReportDetail(reportId) {
    const report = currentReports.find(r => r.id === reportId);
    if (!report) {
        showToast('报告不存在', 'error');
        return;
    }
    
    // 填充详情模态框
    $('#detailReportTitle').text(report.reportTitle);
    $('#detailReportType').text(getReportTypeText(report.reportType));
    $('#detailHealthScore').text(report.healthScore ? (report.healthScore * 100).toFixed(1) + '分' : 'N/A');
    $('#detailTotalPredictions').text(report.totalPredictions || 0);
    $('#detailAnomalyCount').text(report.anomalyCount || 0);
    $('#detailAccuracyRate').text(report.accuracyRate ? (report.accuracyRate * 100).toFixed(1) + '%' : 'N/A');
    $('#detailSummary').text(report.summary || '暂无摘要');
    
    // 解析关键发现
    try {
        const keyFindings = JSON.parse(report.keyFindings || '[]');
        const findingsList = $('#detailKeyFindings');
        findingsList.empty();
        keyFindings.forEach(finding => {
            findingsList.append(`<li>${finding}</li>`);
        });
    } catch (e) {
        $('#detailKeyFindings').html('<li>解析关键发现失败</li>');
    }
    
    // 解析建议措施
    try {
        const recommendations = JSON.parse(report.recommendations || '[]');
        const recommendationsList = $('#detailRecommendations');
        recommendationsList.empty();
        recommendations.forEach(rec => {
            recommendationsList.append(`<li>${rec}</li>`);
        });
    } catch (e) {
        $('#detailRecommendations').html('<li>解析建议措施失败</li>');
    }
    
    $('#detailAnalysis').text(report.detailedAnalysis || '暂无详细分析');
    $('#detailReportTime').text(formatDateTime(report.reportTime));
    $('#detailPeriod').text(`${formatDateTime(report.periodStart)} ~ ${formatDateTime(report.periodEnd)}`);
    
    // 显示模态框
    $('#reportDetailModal').modal('show');
}

/**
 * 显示趋势分析
 */
async function showTrendAnalysis() {
    try {
        showLoading('trendAnalysisModal');
        
        const response = await fetch(`/api/prediction/reports/trend/analysis?serviceId=${currentServiceId}&days=7`);
        const result = await response.json();
        
        if (result.code === 200) {
            const trendData = result.data;
            renderTrendAnalysis(trendData);
            $('#trendAnalysisModal').modal('show');
        } else {
            throw new Error(result.message || '获取趋势分析失败');
        }
        
    } catch (error) {
        console.error('获取趋势分析失败:', error);
        showToast('获取趋势分析失败: ' + error.message, 'error');
    } finally {
        hideLoading('trendAnalysisModal');
    }
}

/**
 * 渲染趋势分析
 */
function renderTrendAnalysis(trendData) {
    $('#trendOverallDirection').text(getTrendDirectionText(trendData.overallDirection));
    $('#trendOverallConfidence').text((trendData.overallConfidence * 100).toFixed(1) + '%');
    $('#trendDescription').text(trendData.description || '暂无描述');
    
    // 健康度趋势
    if (trendData.healthTrend) {
        $('#healthTrendDirection').text(getTrendDirectionText(trendData.healthTrend.direction));
        $('#healthTrendConfidence').text((trendData.healthTrend.confidence * 100).toFixed(1) + '%');
        $('#healthTrendDescription').text(trendData.healthTrend.description || '');
    }
    
    // 准确率趋势
    if (trendData.accuracyTrend) {
        $('#accuracyTrendDirection').text(getTrendDirectionText(trendData.accuracyTrend.direction));
        $('#accuracyTrendConfidence').text((trendData.accuracyTrend.confidence * 100).toFixed(1) + '%');
        $('#accuracyTrendDescription').text(trendData.accuracyTrend.description || '');
    }
    
    // 异常率趋势
    if (trendData.anomalyTrend) {
        $('#anomalyTrendDirection').text(getTrendDirectionText(trendData.anomalyTrend.direction));
        $('#anomalyTrendConfidence').text((trendData.anomalyTrend.confidence * 100).toFixed(1) + '%');
        $('#anomalyTrendDescription').text(trendData.anomalyTrend.description || '');
    }
}

/**
 * 获取趋势方向文本
 */
function getTrendDirectionText(direction) {
    const directionMap = {
        'IMPROVING': '持续改善',
        'STABLE': '保持稳定',
        'DECLINING': '有所下降',
        'ERROR': '分析错误',
        'UNKNOWN': '未知'
    };
    return directionMap[direction] || direction;
}

/**
 * 加载报告统计信息
 */
async function loadReportStatistics() {
    try {
        const response = await fetch(`/api/prediction/reports/statistics?serviceId=${currentServiceId}`);
        const result = await response.json();
        
        if (result.code === 200) {
            const stats = result.data;
            $('#totalReportsCount').text(stats.totalReportCount || 0);
            $('#healthReportsCount').text(stats.healthReportCount || 0);
            $('#trendReportsCount').text(stats.trendReportCount || 0);
            $('#summaryReportsCount').text(stats.summaryReportCount || 0);
        }
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}

/**
 * 分页处理
 */
function changePage(delta) {
    const totalPages = Math.ceil(currentReports.length / pageSize);
    const newPage = currentPage + delta;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderReportsList();
        updatePagination();
    }
}

/**
 * 更新分页信息
 */
function updatePagination() {
    const totalPages = Math.ceil(currentReports.length / pageSize);
    $('#currentPageInfo').text(`第 ${currentPage} 页，共 ${totalPages} 页`);
    
    $('#prevPageBtn').prop('disabled', currentPage <= 1);
    $('#nextPageBtn').prop('disabled', currentPage >= totalPages);
}

/**
 * 下载报告
 */
function downloadReport(reportId) {
    // 这里可以实现报告下载功能
    showToast('报告下载功能开发中...', 'info');
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN');
}

/**
 * 显示加载状态
 */
function showLoading(elementId) {
    $(`#${elementId}`).addClass('loading');
}

/**
 * 隐藏加载状态
 */
function hideLoading(elementId) {
    $(`#${elementId}`).removeClass('loading');
}

/**
 * 显示Toast消息
 */
function showToast(message, type = 'info') {
    // 这里可以使用现有的Toast组件
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 简单的alert实现，实际项目中应该使用更好的Toast组件
    if (type === 'error') {
        alert('错误: ' + message);
    } else if (type === 'success') {
        alert('成功: ' + message);
    }
}
