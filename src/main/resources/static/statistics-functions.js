// 日志统计页面相关函数

// 检查Chart.js是否可用
function isChartAvailable() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js未加载，无法创建图表');
        return false;
    }
    return true;
}

function normalizeTrendData(data) {
    if (!data || !data.hourlyData) {
        return { labels: [], datasets: [] };
    }
    const severityColors = {
        0: { label: 'Emergency', color: '#dc3545' },
        1: { label: 'Alert', color: '#fd7e14' },
        2: { label: 'Critical', color: '#e83e8c' },
        3: { label: 'Error', color: '#ff6f61' },
        4: { label: 'Warning', color: '#ffc107' },
        5: { label: 'Notice', color: '#17a2b8' },
        6: { label: 'Info', color: '#28a745' },
        7: { label: 'Debug', color: '#6c757d' }
    };

    const grouped = {};
    data.hourlyData.forEach(item => {
        const hour = item.time_hour || item.timeHour || item.timeHourStr;
        const severity = item.severity;
        if (!hour) return;
        if (!grouped[hour]) {
            grouped[hour] = Array(8).fill(0);
        }
        if (severity !== undefined && severity >= 0 && severity <= 7) {
            grouped[hour][severity] = item.log_count || item.logCount || 0;
        }
    });

    const labels = Object.keys(grouped).sort();
    const datasets = Object.keys(severityColors).map(sev => {
        const colorInfo = severityColors[sev];
        return {
            label: colorInfo.label,
            data: labels.map(label => grouped[label][sev]),
            borderColor: colorInfo.color,
            backgroundColor: `${colorInfo.color}33`,
            tension: 0.1
        };
    });

    return { labels, datasets };
}

// 绑定统计页面事件
function bindStatisticsEvents() {
    // 时间范围选择器
    const timeRangeSelect = document.getElementById('statsTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const customRange = document.getElementById('customStatsRange');
            if (this.value === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                loadStatisticsData();
            }
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshStatsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadStatisticsData);
    }
    
    
    // 自定义时间范围
    const startTime = document.getElementById('statsStartTime');
    const endTime = document.getElementById('statsEndTime');
    if (startTime && endTime) {
        startTime.addEventListener('change', loadStatisticsData);
        endTime.addEventListener('change', loadStatisticsData);
    }
}

// 加载统计数据
async function loadStatisticsData() {
    console.log('开始加载统计数据...');
    
    // 检查Chart.js是否已加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js未加载，等待加载...');
        // 等待一段时间后重试
        setTimeout(loadStatisticsData, 1000);
        return;
    }
    
    try {
        // 获取时间范围
        const timeRange = getStatsTimeRange();
        
        // 并行加载所有统计数据
        const [
            summaryData,
            trendData,
            sourceData,
            severityData,
            facilityData,
            rulesData
        ] = await Promise.all([
            loadSummaryStats(timeRange),
            loadTrendStats(timeRange),
            loadSourceStats(timeRange),
            loadSeverityStats(timeRange),
            loadFacilityStats(timeRange),
            loadRulesStats(timeRange)
        ]);
        
        // 更新统计卡片
        updateSummaryCards(summaryData);
        
        // 更新图表
        updateTrendChart(normalizeTrendData(trendData));
        updateSourceChart(sourceData);
        updateSeverityChart(severityData);
        updateFacilityChart(facilityData);
        updateRulesChart(rulesData);
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showError('加载统计数据失败');
    }
}

// 获取统计时间范围
function getStatsTimeRange() {
    const timeRangeSelect = document.getElementById('statsTimeRange');
    const timeRange = timeRangeSelect ? timeRangeSelect.value : '7d';
    
    let startTime, endTime;
    const now = new Date();
    
    switch(timeRange) {
        case 'today':
        case '24h':
            // 今天：从今天0点到今天24点
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            console.log('今天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case '7d':
            // 最近7天：从今天24点往前推7天
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            startTime = new Date(endTime);
            startTime.setDate(startTime.getDate() - 6); // 使用setDate方法正确处理跨月
            startTime.setHours(0, 0, 0, 0); // 设置为0点
            console.log('最近7天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case '30d':
            // 最近30天：从今天24点往前推30天
            endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            startTime = new Date(endTime);
            startTime.setDate(startTime.getDate() - 29); // 使用setDate方法正确处理跨月
            startTime.setHours(0, 0, 0, 0); // 设置为0点
            console.log('最近30天时间范围:', {
                start: startTime.toLocaleString(),
                end: endTime.toLocaleString()
            });
            break;
        case 'custom':
            const startInput = document.getElementById('statsStartTime');
            const endInput = document.getElementById('statsEndTime');
            startTime = startInput ? new Date(startInput.value) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
            endTime = endInput ? new Date(endInput.value) : now;
            break;
        default:
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            endTime = now;
    }
    
    // 转换为本地时间字符串，避免时区问题
    function toLocalISOString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    
    const startTimeStr = toLocalISOString(startTime);
    const endTimeStr = toLocalISOString(endTime);
    
    console.log('时间范围:', {
        range: timeRange,
        start: startTimeStr,
        end: endTimeStr,
        startLocal: startTime.toLocaleString(),
        endLocal: endTime.toLocaleString()
    });
    
    return {
        startTime: startTimeStr,
        endTime: endTimeStr,
        range: timeRange
    };
}

// 加载汇总统计
async function loadSummaryStats(timeRange) {
    try {
        // 默认使用接收时间，这样能查到所有今天插入的数据
        const response = await fetch(`/api/logs/statistics/summary?startTime=${encodeURIComponent(timeRange.startTime)}&endTime=${encodeURIComponent(timeRange.endTime)}&timeField=received_at`);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            console.error('加载汇总统计失败:', result.message);
            return getDefaultSummaryData();
        }
    } catch (error) {
        console.error('加载汇总统计异常:', error);
        return getDefaultSummaryData();
    }
}

// 加载趋势统计
async function loadTrendStats(timeRange) {
    try {
        const response = await fetch(`/api/logs/statistics/trend?startTime=${encodeURIComponent(timeRange.startTime)}&endTime=${encodeURIComponent(timeRange.endTime)}`);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            console.error('加载趋势统计失败:', result.message);
            return getDefaultTrendData();
        }
    } catch (error) {
        console.error('加载趋势统计异常:', error);
        return getDefaultTrendData();
    }
}

// 加载来源统计
async function loadSourceStats(timeRange) {
    try {
        const response = await fetch(`/api/logs/statistics/sources?startTime=${encodeURIComponent(timeRange.startTime)}&endTime=${encodeURIComponent(timeRange.endTime)}&limit=5`);
        const result = await response.json();
        
        if (result.code === 200) {
            console.log('来源统计数据:', result.data);
            return result.data;
        } else {
            console.error('加载来源统计失败:', result.message);
            return { labels: [], values: [] };  // 返回空数据而非假数据
        }
    } catch (error) {
        console.error('加载来源统计异常:', error);
        return { labels: [], values: [] };  // 返回空数据而非假数据
    }
}

// 加载严重性统计
async function loadSeverityStats(timeRange) {
    try {
        const response = await fetch(`/api/logs/statistics/severity?startTime=${timeRange.startTime}&endTime=${timeRange.endTime}`);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            console.error('加载严重性统计失败:', result.message);
            return getDefaultSeverityData();
        }
    } catch (error) {
        console.error('加载严重性统计异常:', error);
        return getDefaultSeverityData();
    }
}

// 加载设备类型统计
async function loadFacilityStats(timeRange) {
    try {
        const response = await fetch(`/api/logs/statistics/device-types?startTime=${timeRange.startTime}&endTime=${timeRange.endTime}`);
        const result = await response.json();
        
        if (result.code === 200) {
            console.log('设备类型统计数据:', result.data);
            return result.data;
        } else {
            console.error('加载设备类型统计失败:', result.message);
            return { labels: [], values: [], deviceTypes: [] };
        }
    } catch (error) {
        console.error('加载设备类型统计异常:', error);
        return { labels: [], values: [], deviceTypes: [] };
    }
}

// 加载事件统计
async function loadEventsStats(timeRange) {
    try {
        const response = await fetch(`/api/logs/statistics/events?startTime=${timeRange.startTime}&endTime=${timeRange.endTime}&limit=10`);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            console.error('加载事件统计失败:', result.message);
            return getDefaultEventsData();
        }
    } catch (error) {
        console.error('加载事件统计异常:', error);
        return getDefaultEventsData();
    }
}

// 加载规则统计
async function loadRulesStats(timeRange) {
    try {
        console.log('加载规则统计，时间范围:', timeRange);
        const response = await fetch(`/api/logs/statistics/rules?startTime=${timeRange.startTime}&endTime=${timeRange.endTime}&limit=5`);
        const result = await response.json();
        
        if (result.code === 200) {
            console.log('规则统计数据:', result.data);
            return result.data;
        } else {
            console.error('加载规则统计失败:', result.message);
            return { labels: [], values: [], ruleIds: [] };
        }
    } catch (error) {
        console.error('加载规则统计异常:', error);
        return { labels: [], values: [], ruleIds: [] };
    }
}

// 更新统计卡片
function updateSummaryCards(data) {
    document.getElementById('totalLogsCount').textContent = formatNumber(data.totalLogs || 0);
    document.getElementById('totalDevicesCount').textContent = formatNumber(data.totalDevices || 0);
    
    // 为统计卡片添加点击事件
    addSummaryCardClickEvents();
}

// 为统计卡片添加点击事件
function addSummaryCardClickEvents() {
    // 总日志数卡片点击 - 显示所有日志
    const totalLogsCard = document.querySelector('.stat-card:nth-child(1)');
    if (totalLogsCard) {
        totalLogsCard.style.cursor = 'pointer';
        totalLogsCard.onclick = () => jumpToLogList('all', '');
    }
    
    // 设备总数卡片点击 - 跳转到syslog日志页面显示所有日志
    const totalDevicesCard = document.querySelector('.stat-card:nth-child(2)');
    if (totalDevicesCard) {
        totalDevicesCard.style.cursor = 'pointer';
        totalDevicesCard.onclick = () => jumpToLogList('all', '', '设备总数');
    }
}

// 更新趋势图表
function updateTrendChart(data) {
    const ctx = document.getElementById('logTrendChart');
    if (!ctx) return;
    
    // 检查Chart.js是否可用
    if (!isChartAvailable()) return;
    
    // 销毁现有图表
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    // 检查是否有数据
    const labels = data.labels || [];
    const datasets = data.datasets || [];
    
    if (labels.length === 0 || datasets.length === 0) {
        console.warn('日志趋势: 暂无数据');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // 计算所有数据集的最大值
    let maxValue = 0;
    datasets.forEach(dataset => {
        const datasetMax = Math.max(...(dataset.data || []));
        if (datasetMax > maxValue) {
            maxValue = datasetMax;
        }
    });
    
    // 计算建议的最大值：在最大值基础上增加20%
    const suggestedMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;
    
    console.log(`日志趋势: ${labels.length}个时间点, ${datasets.length}个数据集, 最大值=${maxValue}, 图表最大值=${suggestedMax}`);
    
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,  // 根据数据动态设置建议最大值
                    ticks: {
                        precision: 0,  // 只显示整数
                        stepSize: Math.ceil(suggestedMax / 5),  // 动态计算刻度间隔
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '日志数量'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,  // 标签最大旋转角度
                        minRotation: 0,   // 标签最小旋转角度
                        autoSkip: true,   // 自动跳过部分标签避免拥挤
                        maxTicksLimit: 12 // 最多显示12个刻度
                    },
                    title: {
                        display: true,
                        text: '时间'
                    }
                }
            }
        }
    });
}

// 更新来源图表
function updateSourceChart(data) {
    const ctx = document.getElementById('logSourceChart');
    if (!ctx) return;
    
    // 检查Chart.js是否可用
    if (!isChartAvailable()) return;
    
    if (charts.sourceChart) {
        charts.sourceChart.destroy();
    }
    
    // 检查是否有数据
    const values = data.values || [];
    const labels = data.labels || [];
    
    if (values.length === 0 || labels.length === 0) {
        console.warn('日志来源TOP5: 暂无数据');
        // 显示空状态提示
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // 计算合理的最大值，根据实际数据动态调整
    const maxValue = Math.max(...values);
    // 计算建议的最大值：在最大值基础上增加20%，确保图表美观且有空间
    const suggestedMax = Math.ceil(maxValue * 1.2);
    
    console.log(`日志来源TOP5: ${labels.length}个来源, 最大值=${maxValue}, 图表最大值=${suggestedMax}`);
    
    charts.sourceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '日志数量',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,  // 根据数据动态设置建议最大值
                    ticks: {
                        precision: 0,  // 只显示整数
                        stepSize: Math.ceil(suggestedMax / 5),  // 动态计算刻度间隔
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '日志数量'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const sourceIp = labels[index];
                    jumpToLogList('source_ip', sourceIp);
                }
            }
        }
    });
}

// 更新严重性图表
function updateSeverityChart(data) {
    const ctx = document.getElementById('severityChart');
    if (!ctx) return;
    
    // 检查Chart.js是否可用
    if (!isChartAvailable()) return;
    
    if (charts.severityChart) {
        charts.severityChart.destroy();
    }
    
    // 检查是否有数据
    const values = data.values || [];
    const labels = data.labels || [];
    
    if (values.length === 0 || labels.length === 0) {
        console.warn('严重性分布: 暂无数据');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    console.log(`严重性分布: ${labels.length}个级别`, labels, values);
    
    const severityColors = [
        '#dc3545', // Emergency - 红色
        '#fd7e14', // Alert - 橙色
        '#e83e8c', // Critical - 粉红色
        '#dc3545', // Error - 红色
        '#ffc107', // Warning - 黄色
        '#17a2b8', // Notice - 青色
        '#28a745', // Info - 绿色
        '#6c757d'  // Debug - 灰色
    ];
    
    charts.severityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels || [],
            datasets: [{
                data: data.values || [],
                backgroundColor: severityColors.slice(0, data.labels?.length || 0),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const severityLabels = data.labels || [];
                    const severityName = severityLabels[index];
                    
                    // 根据严重性名称映射到级别
                    const severityMapping = {
                        'Emergency': 0,
                        'Alert': 1,
                        'Critical': 2,
                        'Error': 3,
                        'Warning': 4,
                        'Notice': 5,
                        'Info': 6,
                        'Debug': 7
                    };
                    
                    const severityLevel = severityMapping[severityName] !== undefined ? 
                        severityMapping[severityName] : index;
                    
                    console.log('点击严重性图表:', severityName, '级别:', severityLevel);
                    // 传递中文名称用于显示，但实际过滤使用级别
                    jumpToLogList('severity', severityLevel, severityName);
                }
            }
        }
    });
}

// 更新设备类型图表
function updateFacilityChart(data) {
    const ctx = document.getElementById('facilityChart');
    if (!ctx) return;
    
    // 检查Chart.js是否可用
    if (!isChartAvailable()) return;
    
    if (charts.facilityChart) {
        charts.facilityChart.destroy();
    }
    
    // 检查是否有数据
    const values = data.values || [];
    const labels = data.labels || [];
    const deviceTypes = data.deviceTypes || [];
    
    if (values.length === 0 || labels.length === 0) {
        console.warn('设备类型分布: 暂无数据');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    console.log(`设备类型分布: ${labels.length}种类型`, labels, deviceTypes);
    
    charts.facilityChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#FF6384',  // 服务器 - 粉红
                    '#36A2EB',  // 网络设备 - 蓝色
                    '#FFCE56',  // 存储设备 - 黄色
                    '#4BC0C0'   // 视频设备 - 青色
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const deviceTypeName = labels[index];
                    const deviceType = deviceTypes[index];
                    console.log(`点击设备类型: ${deviceTypeName} (${deviceType})`);
                    // 跳转到syslog日志页面并应用设备类型筛选
                    jumpToLogListByDeviceType(deviceType, deviceTypeName);
                }
            }
        }
    });
}

// 更新规则图表
function updateRulesChart(data) {
    const ctx = document.getElementById('rulesChart');
    if (!ctx) {
        console.warn('找不到rulesChart元素');
        return;
    }
    
    // 检查Chart.js是否可用
    if (!isChartAvailable()) return;
    
    if (charts.rulesChart) {
        charts.rulesChart.destroy();
    }
    
    // 检查是否有数据
    const values = data.values || [];
    const labels = data.labels || [];
    const ruleIds = data.ruleIds || [];
    
    if (values.length === 0 || labels.length === 0) {
        console.warn('匹配规则TOP5: 暂无数据');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // 计算合理的最大值，根据实际数据动态调整
    const maxValue = Math.max(...values);
    // 计算建议的最大值：在最大值基础上增加20%，确保图表美观且有空间
    const suggestedMax = Math.ceil(maxValue * 1.2);
    
    console.log(`匹配规则TOP5: ${labels.length}个规则, 最大值=${maxValue}, 图表最大值=${suggestedMax}`);
    
    charts.rulesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '匹配次数',
                data: values,
                backgroundColor: 'rgba(33, 150, 243, 0.8)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
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
                x: {
                    ticks: {
                        autoSkip: false,  // 不自动跳过标签
                        maxRotation: 45,  // 标签最大旋转角度
                        minRotation: 45,  // 标签最小旋转角度
                        font: {
                            size: 10  // 字体大小
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,  // 根据数据动态设置建议最大值
                    ticks: {
                        precision: 0,  // 只显示整数
                        stepSize: Math.ceil(suggestedMax / 5),  // 动态计算刻度间隔
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '匹配次数'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const ruleName = labels[index];
                    const ruleId = ruleIds[index];
                    console.log('点击规则图表:', ruleName, '规则ID:', ruleId);
                    // 跳转到syslog日志页面并应用规则筛选
                    jumpToLogListByRule(ruleId, ruleName);
                }
            }
        }
    });
}

// 格式化数字显示
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 默认数据生成函数
function getDefaultSummaryData() {
    return {
        totalLogs: 1234,
        alertLogs: 56,
        errorLogs: 23,
        activeDevices: 45,
        totalDevices: 45
    };
}

function getDefaultTrendData() {
    const labels = [];
    const datasets = [
        {
            label: 'Emergency',
            data: [],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.1
        },
        {
            label: 'Error',
            data: [],
            borderColor: '#fd7e14',
            backgroundColor: 'rgba(253, 126, 20, 0.1)',
            tension: 0.1
        },
        {
            label: 'Warning',
            data: [],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.1
        },
        {
            label: 'Info',
            data: [],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.1
        }
    ];
    
    // 生成24小时的模拟数据
    for (let i = 0; i < 24; i++) {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i));
        labels.push(hour.getHours() + ':00');
        
        datasets[0].data.push(Math.floor(Math.random() * 5));
        datasets[1].data.push(Math.floor(Math.random() * 15));
        datasets[2].data.push(Math.floor(Math.random() * 30));
        datasets[3].data.push(Math.floor(Math.random() * 50));
    }
    
    return { labels, datasets };
}

function getDefaultSourceData() {
    // 不再返回假数据，返回空数据让用户知道没有数据
    return {
        labels: [],
        values: []
    };
}

function getDefaultSeverityData() {
    return {
        labels: ['Info', 'Warning', 'Error', 'Critical', 'Emergency'],
        values: [45, 25, 15, 10, 5]
    };
}

function getDefaultFacilityData() {
    return {
        labels: ['Local0', 'Daemon', 'Kernel', 'User', 'Mail'],
        values: [40, 25, 20, 10, 5]
    };
}

function getDefaultEventsData() {
    return {
        labels: ['系统启动', '登录失败', '网络异常', '磁盘告警', '服务重启'],
        values: [25, 20, 15, 12, 8]
    };
}

// 跳转到日志列表页面，并应用过滤条件
function jumpToLogList(filterType, filterValue, displayName) {
    console.log('跳转到日志列表:', filterType, filterValue, displayName || '');
    
    clearSyslogFiltersForJump();
    switch (filterType) {
        case 'source_ip':
            window.currentSourceIP = filterValue;
            break;
        case 'severity':
            if (filterValue !== undefined && filterValue !== null) {
                window.currentSeverities = [parseInt(filterValue)];
            }
            break;
        case 'device_type':
            if (filterValue) {
                window.currentDeviceTypes = [String(filterValue).toUpperCase()];
            }
            break;
        case 'matched_rule_id':
            if (filterValue) {
                window.currentRuleIds = [parseInt(filterValue)];
            }
            break;
        case 'matched_event_id':
            if (filterValue) {
                window.currentEventIds = [parseInt(filterValue)];
            }
            break;
        default:
            break;
    }

    const filterPayload = {};
    if (window.currentDeviceTypes && window.currentDeviceTypes.length > 0) {
        filterPayload.deviceTypes = window.currentDeviceTypes;
    }
    if (window.currentSeverities && window.currentSeverities.length > 0) {
        filterPayload.severities = window.currentSeverities;
    }
    if (window.currentRuleIds && window.currentRuleIds.length > 0) {
        filterPayload.ruleIds = window.currentRuleIds;
    }
    if (window.currentEventIds && window.currentEventIds.length > 0) {
        filterPayload.eventIds = window.currentEventIds;
    }
    if (window.currentSourceIP) {
        filterPayload.sourceIP = window.currentSourceIP;
    }
    if (Object.keys(filterPayload).length > 0) {
        localStorage.setItem('syslogPersistentFilter', JSON.stringify(filterPayload));
    } else {
        localStorage.removeItem('syslogPersistentFilter');
    }

    // 获取当前选择的时间范围
    const timeRangeSelect = document.getElementById('statsTimeRange');
    const currentTimeRange = timeRangeSelect ? timeRangeSelect.value : '7d';
    console.log('当前统计页面时间范围:', currentTimeRange);
    
    // 保存时间范围到全局变量，供syslog页面使用
    window.statisticsTimeRange = currentTimeRange;
    
    // 切换到syslog日志页面
    const syslogNodes = document.querySelectorAll('.node-item .node-text');
    let syslogNode = null;
    
    syslogNodes.forEach(node => {
        if (node.textContent.trim() === 'Syslog日志') {
            syslogNode = node;
        }
    });
    
    if (syslogNode) {
        syslogNode.parentElement.click();
    } else {
        // 如果找不到节点，直接调用加载函数
        if (typeof loadTabContent === 'function') {
            loadTabContent('syslog');
        } else {
            // 如果在日志管理页面外，尝试跳转
            window.location.href = '/api/日志管理.html';
        }
    }
    
    // 等待页面切换完成后应用过滤条件和时间范围
    setTimeout(() => {
        console.log('开始同步时间范围和应用过滤条件');
        
        // 检查页面元素是否已加载
        const checkElements = () => {
            const timeRangeSelect = document.getElementById('timeRange');
            const searchInput = document.getElementById('searchKeyword');
            
            if (timeRangeSelect && searchInput) {
                console.log('页面元素已加载，开始应用设置');
                
                // 同步时间范围
                syncTimeRangeToSyslog(currentTimeRange);
                
                // 应用过滤条件
                setTimeout(() => {
                    applyLogFilter(filterType, filterValue, displayName);
                    
                    // 最终加载数据
                    setTimeout(() => {
                        console.log('执行最终数据加载');
                        if (typeof loadSyslogData === 'function') {
                            loadSyslogData();
                        } else {
                            console.error('loadSyslogData函数不存在');
                        }
                        
                        // 如果还是没有数据，尝试点击刷新按钮
                        setTimeout(() => {
                            const refreshBtn = document.querySelector('.btn-primary');
                            if (refreshBtn && refreshBtn.textContent.includes('刷新')) {
                                console.log('自动点击刷新按钮');
                                refreshBtn.click();
                            }
                        }, 1000);
                    }, 300);
                }, 200);
            } else {
                console.log('页面元素未加载，等待重试...');
                setTimeout(checkElements, 200);
            }
        };
        
        checkElements();
    }, 1000);
}

// 同步时间范围到syslog页面
function syncTimeRangeToSyslog(statsTimeRange) {
    console.log('同步时间范围到syslog页面:', statsTimeRange);
    
    // 统计页面和syslog页面的时间范围映射
    const timeRangeMapping = {
        'today': 'today',
        '7d': 'week',
        '30d': 'month',
        'custom': 'custom'
    };
    
    const syslogTimeRange = timeRangeMapping[statsTimeRange] || 'week';
    console.log('映射到syslog时间范围:', syslogTimeRange);
    
    // 设置syslog页面的时间范围选择器
    const syslogTimeRangeSelect = document.getElementById('timeRange');
    if (syslogTimeRangeSelect) {
        syslogTimeRangeSelect.value = syslogTimeRange;
        console.log('已设置syslog时间范围选择器:', syslogTimeRange);
        
        // 显示同步提示
        showSyncNotification(statsTimeRange, syslogTimeRange);
    } else {
        console.warn('未找到syslog时间范围选择器');
    }
}

// 显示时间范围同步提示
function showSyncNotification(statsTimeRange, syslogTimeRange) {
    const timeRangeNames = {
        'today': '今天',
        '7d': '最近7天',
        '30d': '最近30天',
        'custom': '自定义范围'
    };
    
    const statsName = timeRangeNames[statsTimeRange] || statsTimeRange;
    const message = `已同步统计页面时间范围: ${statsName}`;
    
    // 创建提示元素
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 应用日志过滤条件
function applyLogFilter(filterType, filterValue, displayName) {
    console.log('应用过滤条件:', filterType, filterValue, displayName || '');
    console.log('当前页面元素检查:');
    console.log('- searchKeyword元素:', document.getElementById('searchKeyword'));
    console.log('- severity-btn元素:', document.querySelectorAll('.severity-btn').length);
    
    try {
        // 根据过滤类型设置相应的过滤条件
        switch (filterType) {
            case 'source_ip':
                // 设置IP过滤
                const searchInput = document.getElementById('searchKeyword');
                if (searchInput) {
                    searchInput.value = filterValue;
                    // 触发搜索事件
                    const event = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(event);
                }
                break;
                
            case 'severity':
                // 设置严重性过滤 - 点击对应的严重性按钮
                const severityBtn = document.querySelector(`[data-severity="${filterValue}"]`);
                if (severityBtn) {
                    // 先移除所有active状态
                    document.querySelectorAll('.severity-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    // 激活目标按钮
                    severityBtn.classList.add('active');
                    severityBtn.click();
                }
                break;
                
            case 'severity_range':
                // 设置严重性范围过滤（如0-3表示错误级别）
                if (filterValue === '0-3') {
                    // 清除过滤模式标记，使用严重性过滤
                    window.currentFilterMode = null;
                    
                    // 点击错误级别按钮
                    const errorBtn = document.querySelector('[data-severity="3"]');
                    if (errorBtn) {
                        document.querySelectorAll('.severity-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        errorBtn.classList.add('active');
                        errorBtn.click();
                    }
                }
                break;
                
            case 'matched_event_id':
                // 设置事件ID过滤（使用专门的事件ID参数）
                if (typeof currentEventIds !== 'undefined') {
                    // 清空搜索框，避免干扰
                    const eventSearchInput = document.getElementById('searchKeyword');
                    if (eventSearchInput) {
                        eventSearchInput.value = '';
                    }
                    
                    // 设置事件ID过滤
                    currentEventIds = [filterValue];
                    console.log('设置事件ID过滤:', currentEventIds);
                } else {
                    console.error('currentEventIds变量未定义');
                }
                break;
                
            case 'device_type':
                // 设置设备类型过滤
                const deviceTypeSelect = document.getElementById('deviceTypeFilter');
                if (deviceTypeSelect) {
                    console.log('设置设备类型过滤:', filterValue);
                    deviceTypeSelect.value = filterValue;
                    // 触发change事件
                    const changeEvent = new Event('change', { bubbles: true });
                    deviceTypeSelect.dispatchEvent(changeEvent);
                } else {
                    console.error('设备类型下拉框未找到');
                }
                break;
                
            case 'matched_rule_id':
                // 设置规则ID过滤
                if (typeof currentRuleIds !== 'undefined') {
                    // 清空搜索框，避免干扰
                    const ruleSearchInput = document.getElementById('searchKeyword');
                    if (ruleSearchInput) {
                        ruleSearchInput.value = '';
                    }
                    
                    // 设置规则ID过滤
                    currentRuleIds = [filterValue];
                    console.log('设置规则ID过滤:', currentRuleIds);
                } else {
                    console.error('currentRuleIds变量未定义');
                }
                break;
                
            case 'facility':
                // 设置Facility过滤（使用专门的facility参数）
                if (typeof currentFacilities !== 'undefined') {
                    // 清空搜索框，避免干扰
                    const facilitySearchInput = document.getElementById('searchKeyword');
                    if (facilitySearchInput) {
                        facilitySearchInput.value = '';
                    }
                    
                    // 设置facility过滤，filterValue应该是数字
                    const facilityValue = parseInt(filterValue);
                    if (!isNaN(facilityValue)) {
                        currentFacilities = [facilityValue];
                        console.log('设置Facility过滤:', currentFacilities);
                    } else {
                        console.error('无效的Facility值:', filterValue);
                    }
                } else {
                    console.error('currentFacilities变量未定义');
                }
                break;
                
            case 'is_alert':
                // 设置告警过滤 - 需要修改syslog页面支持alertOnly参数
                // 暂时使用搜索关键词作为替代方案
                const alertSearchInput = document.getElementById('searchKeyword');
                if (alertSearchInput) {
                    alertSearchInput.value = '';  // 清空搜索框
                    // 触发搜索事件
                    const event = new Event('input', { bubbles: true });
                    alertSearchInput.dispatchEvent(event);
                }
                
                // 设置一个标记，表示当前是告警过滤模式
                window.currentFilterMode = 'alert';
                
                // 手动触发数据加载
                setTimeout(() => {
                    if (typeof loadSyslogData === 'function') {
                        loadSyslogData();
                    }
                }, 100);
                break;
                
            case 'all':
                // 清除所有过滤条件
                const allSearchInput = document.getElementById('searchKeyword');
                if (allSearchInput) {
                    allSearchInput.value = '';
                    // 触发搜索事件
                    const event = new Event('input', { bubbles: true });
                    allSearchInput.dispatchEvent(event);
                }
                // 重置严重性过滤到"全部"
                const allBtn = document.querySelector('[data-severity="all"]');
                if (allBtn) {
                    document.querySelectorAll('.severity-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    allBtn.classList.add('active');
                    allBtn.click();
                }
                // 清除事件ID过滤
                if (typeof currentEventIds !== 'undefined') {
                    currentEventIds = [];
                    console.log('清除事件ID过滤');
                }
                // 清除Facility过滤
                if (typeof currentFacilities !== 'undefined') {
                    currentFacilities = [];
                    console.log('清除Facility过滤');
                }
                // 清除过滤模式标记
                window.currentFilterMode = null;
                break;
                
            default:
                console.warn('未知的过滤类型:', filterType);
        }
        
        // 显示过滤提示
        showFilterNotification(filterType, displayName || filterValue);
        
        console.log('过滤条件已应用，数据加载将由主流程控制');
        
    } catch (error) {
        console.error('应用过滤条件失败:', error);
    }
}

// 显示过滤提示
function showFilterNotification(filterType, filterValue) {
    const filterTypeNames = {
        'source_ip': 'IP地址',
        'severity': '严重性级别',
        'severity_range': '错误级别',
        'matched_event_id': '匹配事件',
        'facility': 'Facility',
        'device_type': '设备类型',
        'is_alert': '告警日志',
        'all': '所有日志'
    };
    
    const typeName = filterTypeNames[filterType] || filterType;
    let message;
    
    if (filterType === 'all') {
        message = '已显示所有日志';
    } else if (filterType === 'is_alert') {
        message = '已过滤显示告警日志';
    } else if (filterType === 'severity_range') {
        message = '已过滤显示错误级别日志';
    } else {
        message = `已过滤显示 ${typeName}: ${filterValue} 的日志`;
    }
    
    // 创建提示元素
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 跳转到日志列表页面并应用设备类型筛选
function jumpToLogListByDeviceType(deviceType, deviceTypeName) {
    console.log(`跳转到日志列表-设备类型: ${deviceTypeName} (${deviceType})`);
    
    // 使用通用跳转函数，传递device_type作为filterType
    jumpToLogList('device_type', deviceType, deviceTypeName);
}

// 跳转到日志列表页面并应用规则筛选
function jumpToLogListByRule(ruleId, ruleName) {
    console.log(`跳转到日志列表-匹配规则: ${ruleName} (ID: ${ruleId})`);
    
    // 使用通用跳转函数，传递matched_rule_id作为filterType
    jumpToLogList('matched_rule_id', ruleId, ruleName);
}

function clearSyslogFiltersForJump() {
    window.currentDeviceTypes = [];
    window.currentEventIds = [];
    window.currentRuleIds = [];
    window.currentSeverities = null;
    window.currentSourceIP = null;
    window.currentHostname = null;
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('syslogPersistentFilter');
    }
}
