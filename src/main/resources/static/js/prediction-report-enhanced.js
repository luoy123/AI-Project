/**
 * 预测报告增强功能
 * 健康度图表和辅助方法
 */

// 扩展PredictionReport对象
Object.assign(PredictionReport, {
    
    /**
     * 计算平均健康度评分
     */
    getAvgHealthScore: function(reports) {
        if (!reports || reports.length === 0) return 0;
        
        const validScores = reports.filter(r => r.healthScore && r.healthScore > 0);
        if (validScores.length === 0) return 0;
        
        const sum = validScores.reduce((acc, r) => acc + (r.healthScore * 100), 0);
        return Math.round(sum / validScores.length);
    },
    
    /**
     * 获取健康度等级（简化为正常/异常）
     */
    getHealthLevel: function(healthScore) {
        if (!healthScore) return '未知';
        const score = typeof healthScore === 'number' ? healthScore * 100 : healthScore;
        return score >= 70 ? '正常' : '异常';
    },
    
    /**
     * 获取健康度颜色（简化为正常/异常）
     */
    getHealthColor: function(healthScore) {
        if (!healthScore) return 'text-muted';
        const score = typeof healthScore === 'number' ? healthScore * 100 : healthScore;
        return score >= 70 ? 'text-success' : 'text-danger';
    },
    
    /**
     * 渲染健康度图表
     */
    renderHealthChart: function(reports, healthTrend) {
        // 检查ECharts是否可用
        if (typeof echarts === 'undefined') {
            console.warn('ECharts not loaded, loading from CDN...');
            this.loadECharts(() => {
                this.renderHealthChart(reports, healthTrend);
            });
            return;
        }
        
        const chartDom = document.getElementById('healthChart');
        if (!chartDom) {
            console.error('Health chart container not found');
            return;
        }
        
        // 销毁现有图表
        if (this.healthChart) {
            this.healthChart.dispose();
        }
        
        this.healthChart = echarts.init(chartDom);
        
        // 准备图表数据
        const chartData = this.prepareHealthChartData(reports);
        
        const option = {
            title: {
                text: '设备健康度分布',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}个 ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['优秀', '良好', '一般', '较差', '危险']
            },
            series: [
                {
                    name: '健康度分布',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: chartData
                }
            ],
            color: ['#28a745', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545']
        };
        
        this.healthChart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            if (this.healthChart) {
                this.healthChart.resize();
            }
        });
    },
    
    /**
     * 准备健康度图表数据
     */
    prepareHealthChartData: function(reports) {
        const distribution = {
            '优秀': 0,
            '良好': 0,
            '一般': 0,
            '较差': 0,
            '危险': 0
        };
        
        reports.forEach(report => {
            if (report.healthScore) {
                const level = this.getHealthLevel(report.healthScore);
                distribution[level]++;
            }
        });
        
        return Object.keys(distribution).map(key => ({
            value: distribution[key],
            name: key
        }));
    },
    
    /**
     * 加载ECharts库
     */
    loadECharts: function(callback) {
        if (typeof echarts !== 'undefined') {
            callback();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
        script.onload = callback;
        script.onerror = () => {
            console.error('Failed to load ECharts');
            // 显示简单的文本统计
            this.renderSimpleHealthStats();
        };
        document.head.appendChild(script);
    },
    
    /**
     * 渲染简单的健康度统计（ECharts加载失败时的备选方案）
     */
    renderSimpleHealthStats: function() {
        const chartDom = document.getElementById('healthChart');
        if (!chartDom) return;
        
        const reports = this.currentReports || [];
        const distribution = this.prepareHealthChartData(reports);
        
        chartDom.innerHTML = `
            <div class="simple-health-stats">
                <h5>健康度分布统计</h5>
                <div class="stats-grid">
                    ${distribution.map(item => `
                        <div class="stat-item">
                            <div class="stat-name">${item.name}</div>
                            <div class="stat-count">${item.value}个</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * 查看报告详情 - 使用基础版本的实现
     */
    viewReportDetail: function(reportId) {
        console.log(`点击查看详情，reportId:${reportId}`);
        // 调用基础版本的方法，但先确保它存在
        if (typeof PredictionReport.viewReportDetailBase === 'function') {
            return PredictionReport.viewReportDetailBase(reportId);
        }
        
        // 如果基础方法不存在，使用简化版本
        alert(`查看报告详情 - ID: ${reportId}\n功能开发中...`);
    },
    
    /**
     * 显示报告详情模态框
     */
    showReportDetailModal: function(report) {
        const modalHtml = `
            <div class="modal fade" id="reportDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-file-alt"></i> ${report.reportTitle || '预测报告详情'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <strong>健康度评分:</strong>
                                    <span class="h5 ${this.getHealthColor(report.healthScore)}">
                                        ${report.healthScore ? (report.healthScore * 100).toFixed(1) + '分' : 'N/A'}
                                        (${this.getHealthLevel(report.healthScore)})
                                    </span>
                                </div>
                                <div class="col-md-6">
                                    <strong>报告类型:</strong> ${report.reportType || 'HEALTH'}
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <strong>预测次数:</strong><br>
                                    <span class="h5">${report.totalPredictions || 0}</span>
                                </div>
                                <div class="col-md-3">
                                    <strong>异常检测:</strong><br>
                                    <span class="h5">${report.anomalyCount || 0}</span>
                                </div>
                                <div class="col-md-3">
                                    <strong>准确率:</strong><br>
                                    <span class="h5">${report.accuracyRate ? (report.accuracyRate * 100).toFixed(1) + '%' : 'N/A'}</span>
                                </div>
                                <div class="col-md-3">
                                    <strong>告警数:</strong><br>
                                    <span class="h5">${(report.criticalAlerts || 0) + (report.warningAlerts || 0) + (report.infoAlerts || 0)}</span>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <strong>报告摘要:</strong>
                                <div class="p-3 bg-light rounded mt-2">
                                    ${report.summary || '暂无摘要'}
                                </div>
                            </div>
                            
                            ${report.keyFindings ? `
                            <div class="mb-3">
                                <strong>关键发现:</strong>
                                <ul class="mt-2">
                                    ${this.parseJsonArray(report.keyFindings).map(finding => `<li>${finding}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            ${report.recommendations ? `
                            <div class="mb-3">
                                <strong>建议措施:</strong>
                                <ul class="mt-2">
                                    ${this.parseJsonArray(report.recommendations).map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>生成时间:</strong> ${this.formatDate(report.reportTime)}
                                </div>
                                <div class="col-md-6">
                                    <strong>统计周期:</strong> ${this.formatDate(report.periodStart)} ~ ${this.formatDate(report.periodEnd)}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除现有模态框
        const existingModal = document.getElementById('reportDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('reportDetailModal'));
        modal.show();
    },
    
    /**
     * 显示趋势分析 - 使用基础版本的实现
     */
    showTrendAnalysis: function(serviceId) {
        console.log(`点击趋势分析，serviceId:${serviceId}`);
        // 调用基础版本的方法，但先确保它存在
        if (typeof PredictionReport.showTrendAnalysisBase === 'function') {
            return PredictionReport.showTrendAnalysisBase(serviceId);
        }
        
        // 如果基础方法不存在，使用简化版本
        alert(`趋势分析功能 - 服务ID: ${serviceId}\n功能即将上线，敬请期待！`);
    },
    
    /**
     * 显示趋势分析模态框
     */
    showTrendAnalysisModal: function(trendData) {
        const modalHtml = `
            <div class="modal fade" id="trendAnalysisModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-chart-line"></i> 趋势分析报告
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <h6>综合趋势</h6>
                                <div class="trend-item">
                                    <div>趋势方向: <span class="trend-direction">${this.getTrendDirectionText(trendData.overallDirection)}</span></div>
                                    <div>置信度: <span>${(trendData.overallConfidence * 100).toFixed(1)}%</span></div>
                                    <div class="mt-2">${trendData.description || ''}</div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <h6>健康度趋势</h6>
                                    <div class="trend-item">
                                        <div>方向: <span class="trend-direction">${this.getTrendDirectionText(trendData.healthTrend?.direction)}</span></div>
                                        <div>置信度: <span>${trendData.healthTrend ? (trendData.healthTrend.confidence * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <h6>准确率趋势</h6>
                                    <div class="trend-item">
                                        <div>方向: <span class="trend-direction">${this.getTrendDirectionText(trendData.accuracyTrend?.direction)}</span></div>
                                        <div>置信度: <span>${trendData.accuracyTrend ? (trendData.accuracyTrend.confidence * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <h6>异常率趋势</h6>
                                    <div class="trend-item">
                                        <div>方向: <span class="trend-direction">${this.getTrendDirectionText(trendData.anomalyTrend?.direction)}</span></div>
                                        <div>置信度: <span>${trendData.anomalyTrend ? (trendData.anomalyTrend.confidence * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除现有模态框
        const existingModal = document.getElementById('trendAnalysisModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('trendAnalysisModal'));
        modal.show();
    },
    
    /**
     * 获取趋势方向文本
     */
    getTrendDirectionText: function(direction) {
        const directionMap = {
            'IMPROVING': '持续改善',
            'STABLE': '保持稳定',
            'DECLINING': '有所下降',
            'ERROR': '分析错误',
            'UNKNOWN': '未知'
        };
        return directionMap[direction] || direction || '未知';
    },
    
    /**
     * 解析JSON数组
     */
    parseJsonArray: function(jsonStr) {
        try {
            return JSON.parse(jsonStr || '[]');
        } catch (e) {
            return [];
        }
    }
});

console.log('🚀 Prediction Report Enhanced JS loaded');
