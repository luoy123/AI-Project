/**
 * 智能预测管理 - 概览页面
 * 数据加载和渲染
 */

// 饼图实例
let deviceFaultPieChart = null;

// ResizeObserver实例
let chartResizeObserver = null;

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 调整所有图表大小
 */
function resizeAllCharts() {
    console.log('📐 触发图表resize');
    if (deviceFaultPieChart) {
        try {
            deviceFaultPieChart.resize();
        } catch (e) {
            console.warn('饼图resize失败:', e);
        }
    }
    if (typeof alertTrendChart !== 'undefined' && alertTrendChart) {
        try {
            alertTrendChart.resize();
        } catch (e) {
            console.warn('趋势图resize失败:', e);
        }
    }
}

// 防抖的resize函数
const debouncedResize = debounce(resizeAllCharts, 150);

/**
 * 初始化图表自适应监听
 */
function initChartResizeObserver() {
    // 清理旧的observer
    if (chartResizeObserver) {
        chartResizeObserver.disconnect();
    }
    
    // 使用ResizeObserver监听容器大小变化
    if (typeof ResizeObserver !== 'undefined') {
        chartResizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    debouncedResize();
                }
            }
        });
        
        // 监听饼图容器
        const pieContainer = document.getElementById('deviceFaultChart');
        if (pieContainer) {
            chartResizeObserver.observe(pieContainer);
        }
        
        // 监听趋势图容器
        const trendContainer = document.getElementById('alertTrendChart');
        if (trendContainer) {
            chartResizeObserver.observe(trendContainer);
        }
        
        // 监听概览页面容器
        const overviewPage = document.getElementById('page-stats-overview');
        if (overviewPage) {
            chartResizeObserver.observe(overviewPage);
        }
        
        console.log('✅ ResizeObserver已初始化');
    }
}

/**
 * 页面可见性变化时重新调整图表
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        setTimeout(resizeAllCharts, 200);
    }
}

// 监听页面可见性变化
document.addEventListener('visibilitychange', handleVisibilityChange);

/**
 * 加载概览页面所有数据
 */
async function loadOverviewPage() {
    try {
        // 显示加载状态
        showLoading();
        
        // 并行加载所有数据
        await Promise.all([
            loadOverviewStats(),
            loadDeviceFaultRatio(),
            loadAlertStats(),
            loadServerFaultStats(),
            loadOtherDeviceFaultStats()
        ]);
        
        // 隐藏加载状态
        hideLoading();
        
        // 初始化图表自适应监听
        setTimeout(() => {
            initChartResizeObserver();
            // 确保初始渲染后调整一次大小
            resizeAllCharts();
        }, 500);
        
        console.log('概览页面数据加载完成');
    } catch (error) {
        console.error('加载概览页面失败:', error);
        hideLoading();
        showError('数据加载失败，请刷新页面重试');
    }
}

/**
 * 1. 加载智能分析能力统计
 */
async function loadOverviewStats() {
    try {
        const data = await PredictionAPI.getOverviewStats();
        
        // 更新统计数字
        updateStatValue('totalTrainingObjects', data.totalTrainingObjects || 0);
        updateStatValue('enabledStrategies', data.enabledStrategies || 0);
        updateStatValue('totalTrainingModels', data.totalTrainingModels || 0);
        updateStatValue('totalTrainingRecords', data.totalTrainingRecords || 0);
        
    } catch (error) {
        console.error('加载概览统计失败:', error);
    }
}

/**
 * 2. 加载设备分类故障占比（饼图）- 从prediction_report表获取
 */
async function loadDeviceFaultRatio() {
    try {
        const predictionTime = document.getElementById('predictionTimeSelect')?.value || 1;
        
        // 使用新API：从prediction_report表查询统计数据
        const response = await fetch(`/api/prediction/v2/reports/statistics`);
        const result = await response.json();
        
        console.log('📊 设备故障占比数据（新API）:', result);
        
        if (result.code !== 200) {
            throw new Error(result.message || '查询失败');
        }
        
        const reports = result.data || [];
        
        // 筛选出符合预测天数的报告
        const filteredReports = reports.filter(r => r.predictDays === parseInt(predictionTime));
        
        // 计算总设备数和故障率
        let totalDevices = 0;
        let totalFaultDevices = 0; // 故障设备 = 预警设备 + 严重设备
        const chartData = [];
        
        // 用于分组：服务器 vs 其他
        let serverDevices = 0;
        let otherDevices = 0;
        
        filteredReports.forEach(report => {
            totalDevices += report.totalDevices || 0;
            // 故障设备 = 预警设备 + 风险设备
            const faultDevices = (report.warningDevices || 0) + (report.riskDevices || 0);
            totalFaultDevices += faultDevices;
            
            // 按分类分组：服务器(categoryId=1) vs 其他
            if (report.categoryId === 1) {
                serverDevices += report.totalDevices || 0;
            } else {
                otherDevices += report.totalDevices || 0;
            }
        });
        
        // 构造图表数据：服务器 vs 其他
        if (serverDevices > 0) {
            chartData.push({
                name: '服务器',
                value: serverDevices
            });
        }
        if (otherDevices > 0) {
            chartData.push({
                name: '其他',
                value: otherDevices
            });
        }
        
        const faultRate = totalDevices > 0 ? (totalFaultDevices / totalDevices * 100) : 0;
        
        // 更新总设备数
        const totalDevicesElement = document.querySelector('.device-total-count');
        if (totalDevicesElement) {
            totalDevicesElement.textContent = totalDevices;
        }
        
        // 更新设备故障率
        const faultRateElement = document.querySelector('.fault-rate strong');
        if (faultRateElement) {
            faultRateElement.textContent = faultRate.toFixed(2) + '%';
            
            // 根据故障率设置颜色
            if (faultRate > 10) {
                faultRateElement.style.color = '#ef4444'; // 红色
            } else if (faultRate > 5) {
                faultRateElement.style.color = '#f59e0b'; // 橙色
            } else {
                faultRateElement.style.color = '#10b981'; // 绿色
            }
        }
        
        // 渲染饼图
        renderDeviceFaultPieChart(chartData);
        
    } catch (error) {
        console.error('加载设备故障占比失败:', error);
    }
}

/**
 * 3. 加载预测告警统计 - 从prediction_risk表获取
 */
async function loadAlertStats() {
    try {
        const predictionTime = document.getElementById('predictionTimeSelect')?.value || 1;
        
        // 使用新API：从prediction_risk表查询统计数据
        const response = await fetch(`/api/prediction/v2/risks/statistics`);
        const result = await response.json();
        
        console.log('📊 告警统计数据（新API）:', result);
        
        if (result.code !== 200) {
            throw new Error(result.message || '查询失败');
        }
        
        const risks = result.data || [];
        
        // 统计各级别的风险数量
        let totalAlerts = risks.length;
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        
        risks.forEach(risk => {
            const level = (risk.riskLevel || '').toLowerCase();
            if (level === 'critical') criticalCount++;
            else if (level === 'high') highCount++;
            else if (level === 'medium') mediumCount++;
            else if (level === 'low') lowCount++;
        });
        
        // 更新告警数字
        updateStatValue('totalAlerts', totalAlerts);
        updateStatValue('criticalCount', criticalCount);
        updateStatValue('warningCount', highCount + mediumCount); // 高+中风险作为预警
        updateStatValue('infoCount', lowCount); // 低风险作为信息
        
        // 隐藏或显示"暂无数据"提示
        const noDataPlaceholder = document.querySelector('.overview-card .no-data-placeholder');
        if (noDataPlaceholder) {
            if (totalAlerts > 0) {
                noDataPlaceholder.style.display = 'none';
            } else {
                noDataPlaceholder.style.display = 'flex';
            }
        }
        
        // 渲染告警趋势图
        renderAlertTrendChart(risks);
        
    } catch (error) {
        console.error('加载告警统计失败:', error);
    }
}

/**
 * 4. 加载服务器故障预测统计 - 从prediction_report表获取
 */
async function loadServerFaultStats() {
    try {
        const predictionTime = document.getElementById('predictionTimeSelect')?.value || 1;
        
        // 使用新API：查询服务器分类（categoryId=1）的报告
        const response = await fetch(`/api/prediction/v2/reports?categoryId=1&predictDays=${predictionTime}`);
        const result = await response.json();
        
        console.log('🖥️ 服务器故障统计（新API）:', result);
        
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            console.warn('无服务器预测报告数据');
            return;
        }
        
        const report = result.data[0]; // 取第一条报告
        
        // 更新服务器卡片UI
        updateStatValue('serverTotalDevices', report.totalDevices || 0);
        updateStatValue('serverNormalCount', report.normalDevices || 0);
        updateStatValue('serverWarningCount', report.warningDevices || 0);
        updateStatValue('serverFaultCount', report.riskDevices || 0);
        updateStatValue('serverTrainCount', report.totalDevices || 0); // 训练对象数暂用总设备数
        updateStatValue('serverPredictionCount', report.predictedFailures || 0);
        
        // 更新状态标识
        updateStatusBadge('serverStatusBadge', report.riskDevices || 0);
        
    } catch (error) {
        console.error('加载服务器故障统计失败:', error);
    }
}

/**
 * 5. 加载其他设备故障预测统计 - 从prediction_report表获取（网络、存储、视频）
 */
async function loadOtherDeviceFaultStats() {
    try {
        const predictionTime = document.getElementById('predictionTimeSelect')?.value || 1;
        
        // 使用新API：查询网络(2)、存储(3)、视频(4)分类的报告
        const response = await fetch(`/api/prediction/v2/reports?predictDays=${predictionTime}`);
        const result = await response.json();
        
        console.log('📟 其他设备故障统计（新API）:', result);
        
        if (result.code !== 200 || !result.data) {
            console.warn('无其他设备预测报告数据');
            return;
        }
        
        // 筛选出非服务器的分类（categoryId != 1）
        const otherReports = result.data.filter(r => r.categoryId !== 1);
        
        // 汇总统计
        let totalDevices = 0;
        let normalDevices = 0;
        let warningDevices = 0;
        let riskDevices = 0;
        let predictedFailures = 0;
        
        otherReports.forEach(report => {
            totalDevices += report.totalDevices || 0;
            normalDevices += report.normalDevices || 0;
            warningDevices += report.warningDevices || 0;
            riskDevices += report.riskDevices || 0;
            predictedFailures += report.predictedFailures || 0;
        });
        
        // 更新其他设备卡片UI
        updateStatValue('otherTotalDevices', totalDevices);
        updateStatValue('otherNormalCount', normalDevices);
        updateStatValue('otherWarningCount', warningDevices);
        updateStatValue('otherFaultCount', riskDevices);
        updateStatValue('otherTrainCount', totalDevices); // 训练对象数暂用总设备数
        updateStatValue('otherPredictionCount', predictedFailures);
        
        // 更新状态标识
        updateStatusBadge('otherStatusBadge', riskDevices);
        
    } catch (error) {
        console.error('加载其他设备故障统计失败:', error);
    }
}

/**
 * 渲染设备故障饼图
 */
function renderDeviceFaultPieChart(pieData) {
    const chartContainer = document.getElementById('deviceFaultPieChart');
    if (!chartContainer) {
        console.error('❌ 图表容器未找到');
        return;
    }
    
    // 如果图表已存在，先销毁
    if (deviceFaultPieChart) {
        deviceFaultPieChart.dispose();
        deviceFaultPieChart = null;
    }
    
    // 确保容器有明确的尺寸
    if (!chartContainer.style.width) {
        chartContainer.style.width = '100%';
    }
    if (!chartContainer.style.height) {
        chartContainer.style.height = '280px';
    }
    
    // 等待容器完全可见（最多重试20次，避免无限循环）
    let retryCount = 0;
    const maxRetries = 20;
    
    const initChart = () => {
        const width = chartContainer.offsetWidth;
        const height = chartContainer.offsetHeight;
        const isVisible = chartContainer.offsetParent !== null;
        
        if (retryCount === 0 || retryCount === maxRetries || (width > 0 && height > 0)) {
            console.log('📐 容器尺寸:', {
                width, height,
                isVisible,
                visible: width > 0 && height > 0,
                retryCount
            });
        }
        
        if (width === 0 || height === 0 || !isVisible) {
            retryCount++;
            if (retryCount >= maxRetries) {
                console.warn('⚠️ 容器尺寸始终为0或不可见，已达到最大重试次数，停止初始化');
                // 即使容器不可见，也尝试初始化（可能在后续显示时会正常）
                if (width > 0 && height > 0) {
                    console.log('📊 尽管容器可能不可见，但尺寸有效，尝试初始化...');
                } else {
                    return;
                }
            } else {
                setTimeout(initChart, 300);
                return;
            }
        }
        
        // 初始化ECharts
        try {
            deviceFaultPieChart = echarts.init(chartContainer);
            console.log('✅ ECharts实例已创建');
            
            // 渲染数据
            renderChartWithData(pieData);
            
            // 延迟resize多次，确保正确显示
            [100, 300, 600, 1000].forEach(delay => {
                setTimeout(() => {
                    if (deviceFaultPieChart) {
                        deviceFaultPieChart.resize();
                        console.log(`📊 resize完成 (${delay}ms)`);
                    }
                }, delay);
            });
        } catch (error) {
            console.error('❌ 初始化图表失败:', error);
        }
    };
    
    // 延迟初始化，确保DOM完全渲染和页面切换完成
    // 增加延迟时间，确保页面完全显示
    setTimeout(initChart, 1500);
}

/**
 * 使用数据渲染图表
 */
function renderChartWithData(pieData) {
    if (!deviceFaultPieChart) return;
    
    console.log('📊 原始饼图数据:', pieData);
    
    // 只显示两个分类：服务器 和 其他
    // 过滤并聚合数据，确保只有这两类
    const filteredData = [];
    
    // 查找服务器相关的数据项（可能名称是"服务器OS"、"服务器"等）
    const serverItem = pieData.find(item => 
        item.name && (item.name.includes('服务器') || item.name.includes('Server'))
    );
    const otherItems = pieData.filter(item => 
        !item.name || (!item.name.includes('服务器') && !item.name.includes('Server'))
    );
    
    // 添加服务器数据
    if (serverItem && serverItem.value > 0) {
        filteredData.push({
            name: '服务器',
            value: parseInt(serverItem.value) || 0
        });
    }
    
    // 聚合其他所有分类
    const otherTotal = otherItems.reduce((sum, item) => sum + (parseInt(item.value) || 0), 0);
    if (otherTotal > 0) {
        filteredData.push({
            name: '其他',
            value: otherTotal
        });
    }
    
    // 如果没有数据，显示空状态
    if (filteredData.length === 0) {
        filteredData.push(
            { name: '服务器', value: 0 },
            { name: '其他', value: 0 }
        );
    }
    
    console.log('📊 处理后的饼图数据:', filteredData);
    
    // 美化后的配置选项
    const option = {
        // 工具提示
        tooltip: {
            trigger: 'item',
            formatter: '<b>{b}</b><br/>数量: {c}台<br/>占比: {d}%',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            textStyle: {
                color: '#333',
                fontSize: 14,
                lineHeight: 22
            },
            padding: [12, 16],
            extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;'
        },
        // 图例 - 只显示分类名称
        legend: {
            show: true,
            orient: 'vertical',
            right: 20,
            top: 20,
            itemGap: 18,
            itemWidth: 12,
            itemHeight: 12,
            icon: 'circle',
            textStyle: {
                fontSize: 14,
                color: '#666',
                fontWeight: '500'
            }
        },
        // 图表系列 - 完整圆环
        series: [
            {
                name: '设备分类',
                type: 'pie',
                radius: ['65%', '95%'],  // 超大圆环，两倍大小
                center: ['42%', '52%'],  // 居中偏左
                avoidLabelOverlap: false,
                // 精美样式
                itemStyle: {
                    borderRadius: 15,
                    borderColor: '#fff',
                    borderWidth: 5,
                    shadowBlur: 20,
                    shadowColor: 'rgba(0, 0, 0, 0.15)',
                    shadowOffsetY: 8
                },
                // 标签隐藏
                label: {
                    show: false
                },
                // 精美高亮效果
                emphasis: {
                    label: {
                        show: false  // 隐藏标签，只保留tooltip
                    },
                    itemStyle: {
                        shadowBlur: 30,
                        shadowOffsetX: 0,
                        shadowOffsetY: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        borderWidth: 6,
                        borderColor: '#fff'
                    },
                    scale: true,
                    scaleSize: 12
                },
                labelLine: {
                    show: false
                },
                // 数据
                data: filteredData,
                // 精美渐变色方案
                color: [
                    {
                        type: 'radial',
                        x: 0.5, y: 0.5, r: 0.8,
                        colorStops: [
                            { offset: 0, color: '#8B5CF6' },
                            { offset: 0.5, color: '#667eea' },
                            { offset: 1, color: '#4C1D95' }
                        ]
                    },
                    {
                        type: 'radial',
                        x: 0.5, y: 0.5, r: 0.8,
                        colorStops: [
                            { offset: 0, color: '#10B981' },
                            { offset: 0.5, color: '#059669' },
                            { offset: 1, color: '#064E3B' }
                        ]
                    }
                ],
                // 动画
                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return idx * 100;
                }
            }
        ]
    };

    deviceFaultPieChart.setOption(option);
    console.log('✅ 图表配置已设置');
}

/**
        const warningCount = cat.warning_count || 0;
        const riskCount = cat.risk_count || 0;
        
        // 根据故障率确定状态
        let status = '正常';
        let statusClass = 'normal';
        if (faultRate > 10) {
            status = '高风险';
            statusClass = 'high';
        } else if (faultRate > 5) {
            status = '警告';
            statusClass = 'warning';
        }
        
        return `
            <div class="category-item" style="padding: 16px; margin-bottom: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid ${faultRate > 10 ? '#ef4444' : faultRate > 5 ? '#f59e0b' : '#10b981'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="category-name" style="font-weight: 600; font-size: 15px; color: #1f2937;">
                        ${cat.category_name || '未知分类'}
                    </div>
                    <span class="status-badge ${statusClass}" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; background: ${faultRate > 10 ? '#fee2e2' : faultRate > 5 ? '#fed7aa' : '#d1fae5'}; color: ${faultRate > 10 ? '#991b1b' : faultRate > 5 ? '#92400e' : '#065f46'};">
                        ${status}
                    </span>
                </div>
                <div class="category-stats" style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #6b7280;">
                    <span class="device-count">
                        <i class="fas fa-server" style="margin-right: 4px; color: #667eea;"></i>
                        总数: <strong>${assetCount}</strong>
                    </span>
                    <span class="fault-rate">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 4px; color: ${faultRate > 10 ? '#ef4444' : faultRate > 5 ? '#f59e0b' : '#10b981'};"></i>
                        故障率: <strong style="color: ${faultRate > 10 ? '#ef4444' : faultRate > 5 ? '#f59e0b' : '#10b981'};">${faultRate.toFixed(2)}%</strong>
                    </span>
                    <span class="fault-devices">
                        <i class="fas fa-bug" style="margin-right: 4px; color: #f59e0b;"></i>
                        故障: <strong>${faultDeviceCount}</strong>
                    </span>
                    ${warningCount > 0 ? `<span class="warning-count"><i class="fas fa-bell" style="margin-right: 4px; color: #f59e0b;"></i>警告: <strong>${warningCount}</strong></span>` : ''}
                    ${riskCount > 0 ? `<span class="risk-count"><i class="fas fa-shield-alt" style="margin-right: 4px; color: #ef4444;"></i>风险: <strong>${riskCount}</strong></span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    listContainer.innerHTML = html;
}

/**
 * 更新统计数值
 */
function updateStatValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // 数字动画效果
        animateValue(element, 0, value, 1000);
    }
}

/**
 * 数字动画
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + range * progress);
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 更新状态标识（正常/故障）
 */
function updateStatusBadge(elementId, faultDevices) {
    const badge = document.getElementById(elementId);
    if (!badge) return;
    
    const icon = badge.querySelector('i');
    const label = badge.querySelector('.status-label');
    
    if (faultDevices > 0) {
        // 有故障设备
        badge.className = 'detail-stat-item status-fault';
        if (icon) icon.className = 'fas fa-exclamation-triangle';
        if (label) label.textContent = '故障';
    } else {
        // 正常
        badge.className = 'detail-stat-item status-normal';
        if (icon) icon.className = 'fas fa-check-circle';
        if (label) label.textContent = '正常';
    }
}

/**
 * 显示加载状态
 */
function showLoading() {
    const loadingEl = document.getElementById('loadingOverlay');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    const loadingEl = document.getElementById('loadingOverlay');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    alert(message);
}

/**
 * 预测时间下拉框变化事件 - 全局时间过滤
 */
function onPredictionTimeChange() {
    const predictionTime = document.getElementById('predictionTimeSelect')?.value || 1;
    
    console.log(`🔄 预测时间变化: ${predictionTime}天`);
    
    // 显示全局加载状态
    showGlobalLoading();
    
    // 并行刷新所有时间相关模块
    Promise.all([
        loadDeviceFaultRatio(),          // 设备故障占比
        loadAlertStats(),                // 预测告警统计
        loadServerFaultStats(),          // 服务器故障统计
        loadOtherDeviceFaultStats(),     // 其他设备故障统计
        // loadOverviewStats() 不需要时间过滤，保持不变
    ]).then(() => {
        hideGlobalLoading();
        updateTimeLabels(predictionTime);
        showToast(`已切换到最近${predictionTime}天的数据`, 'success');
    }).catch(error => {
        console.error('全局时间过滤失败:', error);
        hideGlobalLoading();
        showToast('数据加载失败，请重试', 'error');
    });
}

/**
 * 显示全局加载状态
 */
function showGlobalLoading() {
    // 为所有相关模块添加加载状态
    const modules = [
        'deviceFaultRatioChart',
        'alertStatsContainer', 
        'categoryFaultRatesContainer'
    ];
    
    modules.forEach(moduleId => {
        const element = document.getElementById(moduleId);
        if (element) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        }
    });
    
    // 显示加载提示
    const loadingTip = document.createElement('div');
    loadingTip.id = 'globalLoadingTip';
    loadingTip.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.8); color: white; padding: 20px; 
                    border-radius: 8px; z-index: 9999;">
            <i class="fas fa-spinner fa-spin"></i> 正在加载数据...
        </div>
    `;
    document.body.appendChild(loadingTip);
}

/**
 * 隐藏全局加载状态
 */
function hideGlobalLoading() {
    // 恢复所有模块状态
    const modules = [
        'deviceFaultRatioChart',
        'alertStatsContainer',
        'categoryFaultRatesContainer'
    ];
    
    modules.forEach(moduleId => {
        const element = document.getElementById(moduleId);
        if (element) {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    });
    
    // 移除加载提示
    const loadingTip = document.getElementById('globalLoadingTip');
    if (loadingTip) {
        loadingTip.remove();
    }
}

/**
 * 更新时间标识
 */
function updateTimeLabels(predictionTime) {
    const timeText = `最近${predictionTime}天`;
    
    // 更新各个模块的时间标识
    const timeLabels = document.querySelectorAll('.time-badge, .time-label');
    timeLabels.forEach(label => {
        label.textContent = timeText;
    });
    
    console.log(`📅 时间标识已更新: ${timeText}`);
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; 
                    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'}; 
                    color: white; padding: 12px 20px; border-radius: 4px; z-index: 10000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Prediction Overview JS loaded');
    
    // 延迟加载，等待页面完全渲染
    setTimeout(() => {
        const overviewPage = document.getElementById('page-stats-overview');
        console.log('📄 Overview page element:', overviewPage);
        
        if (overviewPage) {
            // 检查页面是否可见（active类表示当前显示）
            if (overviewPage.classList.contains('active')) {
                console.log('✅ Loading overview data...');
                loadOverviewPage();
            } else {
                console.log('⏳ Overview page not active, waiting for user click');
            }
            
            // 使用MutationObserver监听页面可见性变化
            const visibilityObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('active')) {
                            console.log('📄 概览页面变为可见，触发resize');
                            setTimeout(resizeAllCharts, 100);
                            setTimeout(resizeAllCharts, 300);
                        }
                    }
                });
            });
            
            visibilityObserver.observe(overviewPage, {
                attributes: true,
                attributeFilter: ['class']
            });
            console.log('✅ 可见性MutationObserver已初始化');
        } else {
            console.warn('⚠️ Overview page element not found');
        }
    }, 500);
});

// 监听页面切换事件（当用户点击智能统计菜单时）
document.addEventListener('click', function(e) {
    // 检查是否点击了智能统计相关的菜单
    const target = e.target;
    if (target.textContent && (target.textContent.includes('智能统计') || target.textContent.includes('概览'))) {
        setTimeout(() => {
            const overviewPage = document.getElementById('page-stats-overview');
            if (overviewPage && overviewPage.classList.contains('active')) {
                console.log('🔄 Overview page activated, loading data...');
                loadOverviewPage();
                
                // 页面切换后，确保所有图表resize
                setTimeout(() => {
                    resizeAllCharts();
                    console.log('📊 页面切换后所有图表已resize');
                }, 100);
                // 再次延迟resize以确保完全显示
                setTimeout(resizeAllCharts, 500);
            }
        }, 300);
    }
});

// 全局窗口resize监听（使用防抖）
window.addEventListener('resize', debouncedResize);

/**
 * 渲染告警趋势图
 */
let alertTrendChart = null;

function renderAlertTrendChart(risks) {
    const chartContainer = document.getElementById('alertTrendChart');
    if (!chartContainer) {
        console.error('❌ 告警趋势图容器未找到');
        return;
    }
    
    // 如果图表已存在，先销毁
    if (alertTrendChart) {
        alertTrendChart.dispose();
        alertTrendChart = null;
    }
    
    // 按日期统计告警数量（模拟最近7天的数据）
    const today = new Date();
    const dates = [];
    const criticalData = [];
    const highData = [];
    const mediumData = [];
    const lowData = [];
    
    // 生成最近7天的日期
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push((date.getMonth() + 1) + '/' + date.getDate());
        
        // 模拟数据：根据风险等级随机分布
        // 实际应用中应该从后端获取历史数据
        if (i === 0) {
            // 今天的数据使用真实统计
            let critical = 0, high = 0, medium = 0, low = 0;
            risks.forEach(risk => {
                const level = (risk.riskLevel || '').toLowerCase();
                if (level === 'critical') critical++;
                else if (level === 'high') high++;
                else if (level === 'medium') medium++;
                else if (level === 'low') low++;
            });
            criticalData.push(critical);
            highData.push(high);
            mediumData.push(medium);
            lowData.push(low);
        } else {
            // 历史数据模拟（实际应从后端获取）
            criticalData.push(Math.floor(Math.random() * 3));
            highData.push(Math.floor(Math.random() * 4) + 1);
            mediumData.push(Math.floor(Math.random() * 5) + 2);
            lowData.push(Math.floor(Math.random() * 3));
        }
    }
    
    // 延迟初始化，确保容器可见
    setTimeout(() => {
        try {
            alertTrendChart = echarts.init(chartContainer);
            
            const option = {
                grid: {
                    left: '3%',
                    right: '3%',
                    top: '15%',
                    bottom: '10%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#e9ecef',
                    borderWidth: 1,
                    textStyle: {
                        color: '#333',
                        fontSize: 12
                    },
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach(item => {
                            result += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:5px;"></span>`;
                            result += `${item.seriesName}: ${item.value}<br/>`;
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['严重', '高', '中', '低'],
                    top: 0,
                    textStyle: {
                        fontSize: 11,
                        color: '#666'
                    },
                    itemWidth: 12,
                    itemHeight: 8
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLine: {
                        lineStyle: {
                            color: '#e9ecef'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#999'
                    }
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            color: '#f5f5f5',
                            type: 'dashed'
                        }
                    },
                    axisLabel: {
                        fontSize: 10,
                        color: '#999'
                    }
                },
                series: [
                    {
                        name: '严重',
                        type: 'line',
                        data: criticalData,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#ef4444'
                        },
                        itemStyle: {
                            color: '#ef4444'
                        },
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: 'rgba(239, 68, 68, 0.3)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(239, 68, 68, 0.05)'
                                }]
                            }
                        }
                    },
                    {
                        name: '高',
                        type: 'line',
                        data: highData,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#f59e0b'
                        },
                        itemStyle: {
                            color: '#f59e0b'
                        }
                    },
                    {
                        name: '中',
                        type: 'line',
                        data: mediumData,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#3b82f6'
                        },
                        itemStyle: {
                            color: '#3b82f6'
                        }
                    },
                    {
                        name: '低',
                        type: 'line',
                        data: lowData,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#10b981'
                        },
                        itemStyle: {
                            color: '#10b981'
                        }
                    }
                ]
            };
            
            alertTrendChart.setOption(option);
            console.log('✅ 告警趋势图已创建');
            
            // 延迟resize确保正确显示
            setTimeout(() => {
                if (alertTrendChart) {
                    alertTrendChart.resize();
                }
            }, 100);
        } catch (error) {
            console.error('❌ 初始化告警趋势图失败:', error);
        }
    }, 1500);
}

// 暴露全局函数，允许外部调用
window.resizeOverviewCharts = resizeAllCharts;
window.reloadOverviewPage = loadOverviewPage;
