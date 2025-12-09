/**
 * 预测报告页面数据加载脚本
 */

/**
 * 初始化预测报告页面
 */
function initPredictionReportPage() {
    console.log('初始化预测报告页面');

    // 初始化时间筛选器
    initTimeFilter('reportTimeFilter', function(filterParams) {
        console.log('预测报告筛选参数变化:', filterParams);
        loadPredictionReports(filterParams);
    });

    // 加载初始数据
    loadPredictionReports({});
}

/**
 * 加载预测报告数据
 * @param filterParams 筛选参数
 */
function loadPredictionReports(filterParams) {
    console.log('加载预测报告数据:', filterParams);

    // 显示加载状态
    showLoading('reportTableContainer');

    $.ajax({
        url: '/api/prediction/data/reports',
        method: 'GET',
        data: filterParams,
        success: function(res) {
            console.log('预测报告数据:', res);
            if (res.code === 200) {
                renderReportTable(res.data);
            } else {
                showError('加载预测报告失败: ' + res.message);
                hideLoading('reportTableContainer');
            }
        },
        error: function(xhr) {
            console.error('加载预测报告失败:', xhr);
            showError('加载预测报告失败: ' + xhr.statusText);
            hideLoading('reportTableContainer');
        }
    });
}

/**
 * 渲染报告表格
 * @param reports 报告数据数组
 */
function renderReportTable(reports) {
    const container = document.getElementById('reportTableContainer');
    if (!container) {
        console.error('报告表格容器不存在');
        return;
    }

    if (!reports || reports.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fa fa-inbox" style="font-size: 64px; margin-bottom: 20px;"></i>
                <p style="font-size: 16px;">暂无预测报告数据</p>
                <p style="font-size: 14px;">请调整筛选条件或等待系统生成报告</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="table table-striped table-bordered" id="reportDataTable">
            <thead>
                <tr>
                    <th>报告名称</th>
                    <th>资产分类</th>
                    <th>品牌</th>
                    <th>预测天数</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    reports.forEach(report => {
        const statusBadge = getStatusBadge(report.status);
        const predictionTimeText = report.predictionTime ? report.predictionTime + '天' : '-';
        const createTime = report.createdAt ? formatDateTime(report.createdAt) : '-';

        html += `
            <tr>
                <td>${report.reportName || '-'}</td>
                <td>${report.categoryId || '-'}</td>
                <td>${report.brand || '-'}</td>
                <td>${predictionTimeText}</td>
                <td>${statusBadge}</td>
                <td>${createTime}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewReportDetail(${report.id})">
                        <i class="fa fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="viewReportChart(${report.id})">
                        <i class="fa fa-chart-line"></i> 图表
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // 初始化DataTables
    if ($.fn.DataTable) {
        $('#reportDataTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/zh.json'
            },
            order: [[5, 'desc']], // 按创建时间倒序
            pageLength: 20,
            destroy: true // 允许重新初始化
        });
    }
}

/**
 * 获取状态徽章HTML
 * @param status 状态
 * @returns {string} HTML字符串
 */
function getStatusBadge(status) {
    const badges = {
        'NORMAL': '<span class="badge badge-success">正常</span>',
        'WARNING': '<span class="badge badge-warning">警告</span>',
        'CRITICAL': '<span class="badge badge-danger">严重</span>'
    };
    return badges[status] || '<span class="badge badge-secondary">未知</span>';
}

/**
 * 查看报告详情
 * @param reportId 报告ID
 */
function viewReportDetail(reportId) {
    console.log('查看报告详情:', reportId);

    $.ajax({
        url: '/api/prediction/data/reports',
        method: 'GET',
        data: { id: reportId },
        success: function(res) {
            if (res.code === 200 && res.data && res.data.length > 0) {
                const report = res.data[0];
                showReportDetailModal(report);
            } else {
                showError('报告不存在');
            }
        },
        error: function(xhr) {
            showError('加载报告详情失败: ' + xhr.statusText);
        }
    });
}

/**
 * 显示报告详情模态框
 * @param report 报告对象
 */
function showReportDetailModal(report) {
    const modalHtml = `
        <div class="modal fade" id="reportDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">预测报告详情</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="report-detail">
                            <div class="detail-row">
                                <label>报告名称:</label>
                                <span>${report.reportName || '-'}</span>
                            </div>
                            <div class="detail-row">
                                <label>资产分类:</label>
                                <span>${report.categoryId || '-'}</span>
                            </div>
                            <div class="detail-row">
                                <label>品牌:</label>
                                <span>${report.brand || '-'}</span>
                            </div>
                            <div class="detail-row">
                                <label>预测天数:</label>
                                <span>${report.predictionTime || '-'}天</span>
                            </div>
                            <div class="detail-row">
                                <label>状态:</label>
                                <span>${getStatusBadge(report.status)}</span>
                            </div>
                            <div class="detail-row">
                                <label>创建时间:</label>
                                <span>${formatDateTime(report.createdAt)}</span>
                            </div>
                            <div class="detail-row">
                                <label>更新时间:</label>
                                <span>${formatDateTime(report.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 移除旧的模态框
    $('#reportDetailModal').remove();

    // 添加新的模态框
    $('body').append(modalHtml);

    // 显示模态框
    $('#reportDetailModal').modal('show');
}

/**
 * 查看报告图表
 * @param reportId 报告ID
 */
function viewReportChart(reportId) {
    console.log('查看报告图表:', reportId);

    $.ajax({
        url: '/api/prediction/data/reports',
        method: 'GET',
        data: { id: reportId },
        success: function(res) {
            if (res.code === 200 && res.data && res.data.length > 0) {
                const report = res.data[0];
                if (report.chartData) {
                    try {
                        const chartData = JSON.parse(report.chartData);
                        showReportChartModal(report, chartData);
                    } catch (e) {
                        showError('图表数据格式错误');
                    }
                } else {
                    showError('该报告暂无图表数据');
                }
            } else {
                showError('报告不存在');
            }
        },
        error: function(xhr) {
            showError('加载报告图表失败: ' + xhr.statusText);
        }
    });
}

/**
 * 显示报告图表模态框
 * @param report 报告对象
 * @param chartData 图表数据
 */
function showReportChartModal(report, chartData) {
    const modalHtml = `
        <div class="modal fade" id="reportChartModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${report.reportName} - 图表</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="reportChartContainer" style="width: 100%; height: 400px;"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 移除旧的模态框
    $('#reportChartModal').remove();

    // 添加新的模态框
    $('body').append(modalHtml);

    // 显示模态框
    $('#reportChartModal').modal('show');

    // 渲染图表
    $('#reportChartModal').on('shown.bs.modal', function() {
        renderReportChart('reportChartContainer', chartData);
    });
}

/**
 * 渲染报告图表
 * @param containerId 容器ID
 * @param chartData 图表数据
 */
function renderReportChart(containerId, chartData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('图表容器不存在');
        return;
    }

    // 使用ECharts渲染
    if (typeof echarts !== 'undefined') {
        const myChart = echarts.init(container);
        myChart.setOption(chartData);
    } else {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">图表库未加载</p>';
    }
}

/**
 * 格式化日期时间
 * @param dateTime 日期时间字符串或对象
 * @returns {string} 格式化后的字符串
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    // 由renderReportTable等函数负责渲染内容
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

/**
 * 显示成功信息
 * @param message 成功信息
 */
function showSuccess(message) {
    if (typeof layer !== 'undefined') {
        layer.msg(message, { icon: 1 });
    } else {
        alert(message);
    }
}
