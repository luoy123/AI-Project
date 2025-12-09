/**
 * 设备报告辅助函数
 */

/**
 * 为设备生成预测报告（模拟数据）
 * @param {Object} device - 设备对象
 * @param {Number} predictDays - 预测天数
 * @returns {Object} 设备预测报告
 */
function generateDeviceReport(device, predictDays) {
    // 基于设备ID生成随机但稳定的数据
    const seed = device.id || 1;
    const random = (min, max) => {
        const x = Math.sin(seed * 9999) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
    };
    
    // 生成健康评分（60-100）
    const healthScore = 60 + random(0, 40);
    
    // 根据健康评分确定状态
    let currentStatus, riskLevel;
    if (healthScore >= 90) {
        currentStatus = 'normal';
        riskLevel = 'low';
    } else if (healthScore >= 75) {
        currentStatus = 'warning';
        riskLevel = 'medium';
    } else {
        currentStatus = 'critical';
        riskLevel = 'high';
    }
    
    // 生成性能指标
    const cpuUsage = 30 + random(0, 60);
    const memoryUsage = 40 + random(0, 50);
    const diskUsage = 30 + random(0, 60);
    
    // 生成故障概率（与健康评分反相关）
    const failureProbability = (100 - healthScore) * 0.3;
    
    // 生成时序数据（用于图表）
    const metricsHistory = {
        cpu: Array.from({length: 7}, (_, i) => cpuUsage + random(-10, 10)),
        memory: Array.from({length: 7}, (_, i) => memoryUsage + random(-8, 8)),
        timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
    };
    
    return {
        id: device.id,
        deviceId: device.id,
        deviceName: device.name || device.assetName || '未命名设备',
        deviceIp: device.ip || device.ipAddress || '-',
        categoryId: device.categoryId,
        categoryName: device.categoryName || '',
        predictDays: predictDays,
        currentStatus: currentStatus,
        healthScore: healthScore.toFixed(1),
        failureProbability: failureProbability.toFixed(1),
        riskLevel: riskLevel,
        cpuUsage: cpuUsage.toFixed(1),
        memoryUsage: memoryUsage.toFixed(1),
        diskUsage: diskUsage.toFixed(1),
        metricsHistory: JSON.stringify(metricsHistory),
        trend: healthScore >= 85 ? 'stable' : (healthScore >= 70 ? 'rising' : 'declining'),
        trendDescription: `设备运行${healthScore >= 85 ? '稳定' : (healthScore >= 70 ? '正常' : '需要关注')}`,
        confidenceLevel: 85 + random(0, 10)
    };
}

/**
 * 渲染设备报告列表
 * @param {Array} deviceReports - 设备报告数组
 * @param {String} categoryName - 分类名称
 */
function renderDeviceReportsList(deviceReports, categoryName) {
    const chartContent = document.getElementById('predictionChartContent');
    
    // 保存到全局变量供详情弹窗使用
    window.currentDeviceReports = deviceReports;
    
    if (!deviceReports || deviceReports.length === 0) {
        chartContent.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #909399;">
                <div style="text-align: center;">
                    <i class="fas fa-inbox" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p style="font-size: 14px; margin: 0;">暂无设备报告</p>
                </div>
            </div>
        `;
        return;
    }
    
    // 统计数据
    const totalDevices = deviceReports.length;
    const normalDevices = deviceReports.filter(r => r.currentStatus === 'normal').length;
    const warningDevices = deviceReports.filter(r => r.currentStatus === 'warning').length;
    const criticalDevices = deviceReports.filter(r => r.currentStatus === 'critical').length;
    
    let html = `
        <div style="padding: 20px;">
            <!-- 分类标题 -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    <i class="fas fa-server" style="margin-right: 8px;"></i>
                    ${categoryName} 设备预测报告
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                    共 ${totalDevices} 台设备 | 正常: ${normalDevices} | 预警: ${warningDevices} | 严重: ${criticalDevices}
                </div>
            </div>
            
            <!-- 设备报告卡片列表 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px;">
    `;
    
    deviceReports.forEach(report => {
        const statusConfig = getStatusConfig(report.currentStatus);
        const riskConfig = getRiskConfig(report.riskLevel);
        
        html += `
            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; transition: all 0.3s;" 
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'"
                 onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'">
                <!-- 设备头部 -->
                <div style="background: ${statusConfig.gradient}; padding: 16px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-size: 16px; font-weight: 600;">
                            <i class="fas fa-server" style="margin-right: 6px;"></i>
                            ${report.deviceName}
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                            ${report.deviceIp}
                        </div>
                    </div>
                    <div style="font-size: 12px; opacity: 0.9;">
                        ${report.trendDescription}
                    </div>
                </div>
                
                <!-- 健康评分 -->
                <div style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">健康评分</div>
                            <div style="font-size: 32px; font-weight: 600; color: ${statusConfig.color};">${report.healthScore}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: ${statusConfig.bg}; color: ${statusConfig.color}; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; margin-bottom: 6px;">
                                ${statusConfig.text}
                            </div>
                            <div style="background: ${riskConfig.bg}; color: ${riskConfig.color}; padding: 4px 10px; border-radius: 4px; font-size: 12px;">
                                ${riskConfig.text}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 性能指标 -->
                <div style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <div>
                            <div style="font-size: 11px; color: #909399; margin-bottom: 4px;">CPU</div>
                            <div style="font-size: 16px; font-weight: 500; color: ${report.cpuUsage > 80 ? '#f56c6c' : '#606266'};">${report.cpuUsage}%</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #909399; margin-bottom: 4px;">内存</div>
                            <div style="font-size: 16px; font-weight: 500; color: ${report.memoryUsage > 80 ? '#f56c6c' : '#606266'};">${report.memoryUsage}%</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #909399; margin-bottom: 4px;">磁盘</div>
                            <div style="font-size: 16px; font-weight: 500; color: ${report.diskUsage > 80 ? '#f56c6c' : '#606266'};">${report.diskUsage}%</div>
                        </div>
                    </div>
                </div>
                
                <!-- 故障概率 -->
                <div style="padding: 16px; background: #fafafa;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 12px; color: #909399;">故障概率</span>
                        <span style="font-size: 16px; font-weight: 600; color: ${riskConfig.color};">${report.failureProbability}%</span>
                    </div>
                    <button onclick="showDeviceReportDetail(${report.deviceId})" 
                            style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.opacity='0.9'"
                            onmouseout="this.style.opacity='1'">
                        <i class="fas fa-chart-line" style="margin-right: 6px;"></i>
                        查看详细报告
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    chartContent.innerHTML = html;
}

/**
 * 获取状态配置
 */
function getStatusConfig(status) {
    const configs = {
        'normal': {
            bg: '#ecfdf5',
            color: '#10b981',
            text: '正常',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
        'warning': {
            bg: '#fef3c7',
            color: '#f59e0b',
            text: '预警',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        },
        'critical': {
            bg: '#fee2e2',
            color: '#ef4444',
            text: '严重',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        }
    };
    return configs[status] || configs.normal;
}

/**
 * 获取风险配置
 */
function getRiskConfig(level) {
    const configs = {
        'low': { bg: '#ecfdf5', color: '#10b981', text: '低风险' },
        'medium': { bg: '#fef3c7', color: '#f59e0b', text: '中风险' },
        'high': { bg: '#fee2e2', color: '#ef4444', text: '高风险' }
    };
    return configs[level] || configs.low;
}

/**
 * 显示设备报告详情
 */
function showDeviceReportDetail(deviceId) {
    // 从当前页面的设备报告中查找对应的设备
    const allDeviceReports = window.currentDeviceReports || [];
    const report = allDeviceReports.find(r => r.deviceId === deviceId);
    
    if (!report) {
        alert('未找到设备报告数据');
        return;
    }
    
    // 解析时序数据
    let metricsHistory = { cpu: [], memory: [], timestamps: [] };
    try {
        if (report.metricsHistory) {
            metricsHistory = JSON.parse(report.metricsHistory);
        }
    } catch (e) {
        console.error('解析时序数据失败:', e);
    }
    
    const statusConfig = getStatusConfig(report.currentStatus);
    const riskConfig = getRiskConfig(report.riskLevel);
    
    const modalHTML = `
        <div id="deviceReportDetailModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeDeviceDetailModal(event)">
            <div style="background: white; width: 100%; max-width: 1000px; max-height: 90vh; overflow-y: auto; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                <!-- 头部 -->
                <div style="background: ${statusConfig.gradient}; padding: 24px; border-radius: 16px 16px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-size: 24px; font-weight: 600;">
                            <i class="fas fa-server" style="margin-right: 10px;"></i>
                            ${report.deviceName}
                        </div>
                        <button onclick="closeDeviceDetailModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; transition: all 0.3s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            ✕
                        </button>
                    </div>
                    <div style="display: flex; gap: 16px; font-size: 14px; opacity: 0.95;">
                        <span><i class="fas fa-network-wired" style="margin-right: 6px;"></i>${report.deviceIp}</span>
                        <span><i class="fas fa-tag" style="margin-right: 6px;"></i>${report.categoryName}</span>
                        <span><i class="fas fa-calendar" style="margin-right: 6px;"></i>预测周期: ${report.predictDays}天</span>
                    </div>
                </div>
                
                <!-- 内容区域 -->
                <div style="padding: 24px;">
                    <!-- 关键指标卡片 -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                        <!-- 健康评分 -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 12px; border-left: 4px solid ${statusConfig.color};">
                            <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">健康评分</div>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="font-size: 48px; font-weight: 700; color: ${statusConfig.color};">${report.healthScore}</div>
                                <div>
                                    <div style="background: ${statusConfig.bg}; color: ${statusConfig.color}; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                                        ${statusConfig.text}
                                    </div>
                                    <div style="font-size: 12px; color: #6c757d;">${report.trendDescription}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 风险评估 -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 12px; border-left: 4px solid ${riskConfig.color};">
                            <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">风险评估</div>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="font-size: 48px; font-weight: 700; color: ${riskConfig.color};">${report.failureProbability}%</div>
                                <div>
                                    <div style="background: ${riskConfig.bg}; color: ${riskConfig.color}; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                                        ${riskConfig.text}
                                    </div>
                                    <div style="font-size: 12px; color: #6c757d;">故障概率</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 性能指标 -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #212529;">
                            <i class="fas fa-chart-bar" style="margin-right: 8px; color: #6366f1;"></i>
                            性能指标
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">CPU使用率</div>
                                <div style="font-size: 32px; font-weight: 600; color: ${report.cpuUsage > 80 ? '#ef4444' : '#212529'}; margin-bottom: 4px;">${report.cpuUsage}%</div>
                                <div style="width: 100%; height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${report.cpuUsage}%; height: 100%; background: ${report.cpuUsage > 80 ? '#ef4444' : '#6366f1'}; transition: width 0.3s;"></div>
                                </div>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">内存使用率</div>
                                <div style="font-size: 32px; font-weight: 600; color: ${report.memoryUsage > 80 ? '#ef4444' : '#212529'}; margin-bottom: 4px;">${report.memoryUsage}%</div>
                                <div style="width: 100%; height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${report.memoryUsage}%; height: 100%; background: ${report.memoryUsage > 80 ? '#ef4444' : '#6366f1'}; transition: width 0.3s;"></div>
                                </div>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">磁盘使用率</div>
                                <div style="font-size: 32px; font-weight: 600; color: ${report.diskUsage > 80 ? '#ef4444' : '#212529'}; margin-bottom: 4px;">${report.diskUsage}%</div>
                                <div style="width: 100%; height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${report.diskUsage}%; height: 100%; background: ${report.diskUsage > 80 ? '#ef4444' : '#6366f1'}; transition: width 0.3s;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 趋势图表 -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #212529;">
                            <i class="fas fa-chart-line" style="margin-right: 8px; color: #6366f1;"></i>
                            24小时趋势
                        </h3>
                        <div id="deviceTrendChart" style="width: 100%; height: 300px;"></div>
                    </div>
                    
                    <!-- 置信度 -->
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; text-align: center;">
                        <span style="font-size: 14px; color: #6c757d;">预测置信度：</span>
                        <span style="font-size: 18px; font-weight: 600; color: #10b981;">${report.confidenceLevel.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 渲染趋势图表
    setTimeout(() => {
        renderDeviceTrendChart(metricsHistory);
    }, 100);
}

/**
 * 渲染设备趋势图表
 */
function renderDeviceTrendChart(metricsHistory) {
    const chartDom = document.getElementById('deviceTrendChart');
    if (!chartDom || !window.echarts) {
        console.error('图表容器或ECharts库未找到');
        return;
    }
    
    const myChart = window.echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e9ecef',
            borderWidth: 1,
            textStyle: { color: '#212529' },
            axisPointer: { type: 'cross' }
        },
        legend: {
            data: ['CPU使用率', '内存使用率'],
            top: 0,
            textStyle: { fontSize: 12 }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '40px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: metricsHistory.timestamps || [],
            axisLine: { lineStyle: { color: '#e9ecef' } },
            axisLabel: { color: '#6c757d', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: '#e9ecef' } },
            axisLabel: { color: '#6c757d', fontSize: 11, formatter: '{value}%' },
            splitLine: { lineStyle: { color: '#f8f9fa' } }
        },
        series: [
            {
                name: 'CPU使用率',
                type: 'line',
                smooth: true,
                data: metricsHistory.cpu || [],
                itemStyle: { color: '#6366f1' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                            { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                        ]
                    }
                }
            },
            {
                name: '内存使用率',
                type: 'line',
                smooth: true,
                data: metricsHistory.memory || [],
                itemStyle: { color: '#10b981' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                        ]
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

/**
 * 关闭设备详情弹窗
 */
function closeDeviceDetailModal(event) {
    if (!event || event.target.id === 'deviceReportDetailModal') {
        const modal = document.getElementById('deviceReportDetailModal');
        if (modal) modal.remove();
    }
}

// 导出到全局
window.generateDeviceReport = generateDeviceReport;
window.renderDeviceReportsList = renderDeviceReportsList;
window.showDeviceReportDetail = showDeviceReportDetail;
window.closeDeviceDetailModal = closeDeviceDetailModal;
