// 专线管理功能实现

// 全局变量
let currentLine = null;
let linesData = [];
let alertsData = [];

// 初始化专线管理
document.addEventListener('DOMContentLoaded', function() {
    initializeLineManagement();
});

function initializeLineManagement() {
    // 加载专线数据
    loadLinesData();
    
    // 绑定事件
    bindLineEvents();
}

// 绑定专线管理事件
function bindLineEvents() {
    // 生成报告
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    
    // 添加专线
    document.getElementById('addLineBtn')?.addEventListener('click', () => {
        alert('添加专线功能开发中...');
    });
    
    // 返回列表
    document.getElementById('backToLineDashboard')?.addEventListener('click', () => {
        document.getElementById('lineDashboard').style.display = 'block';
        document.getElementById('lineDetail').style.display = 'none';
    });
    
    // 刷新数据
    document.getElementById('refreshLineBtn')?.addEventListener('click', refreshLineData);
    
    // 编辑专线
    document.getElementById('editLineBtn')?.addEventListener('click', () => {
        alert('编辑专线功能开发中...');
    });
    
    // 删除专线
    document.getElementById('deleteLineBtn')?.addEventListener('click', deleteLine);
    
    // 下载报告
    document.getElementById('downloadReportBtn')?.addEventListener('click', downloadReport);
    
    // 过滤器
    document.getElementById('lineStatusFilter')?.addEventListener('change', filterLines);
    document.getElementById('lineProviderFilter')?.addEventListener('change', filterLines);
    document.getElementById('lineTypeFilter')?.addEventListener('change', filterLines);
    document.getElementById('lineSearchInput')?.addEventListener('input', filterLines);
    
    // 时间范围选择
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const range = this.dataset.range;
            loadPerformanceCharts(range);
        });
    });
    
    // 告警时间过滤
    document.getElementById('alertTimeFilter')?.addEventListener('change', function() {
        loadAlertHistory(this.value);
    });
}

// 加载专线数据
function loadLinesData() {
    // 模拟数据
    linesData = [
        {
            id: 1,
            name: '北京-上海专线',
            circuitId: 'CT-BJ-SH-001',
            provider: '中国电信',
            providerCode: 'china-telecom',
            type: 'MPLS',
            typeCode: 'mpls',
            bandwidth: '100Mbps',
            endpointA: '北京数据中心',
            endpointB: '上海数据中心',
            status: 'normal',
            latency: 25.3,
            jitter: 3.2,
            packetLoss: 0.02,
            bandwidthUsage: 45,
            activationDate: '2023-01-15',
            expiryDate: '2025-01-15',
            sla: {
                latency: 50,
                jitter: 10,
                packetLoss: 0.1,
                availability: 99.9
            }
        },
        {
            id: 2,
            name: '北京-广州专线',
            circuitId: 'CU-BJ-GZ-002',
            provider: '中国联通',
            providerCode: 'china-unicom',
            type: 'IPLC',
            typeCode: 'iplc',
            bandwidth: '200Mbps',
            endpointA: '北京总部',
            endpointB: '广州分部',
            status: 'warning',
            latency: 48.5,
            jitter: 8.7,
            packetLoss: 0.08,
            bandwidthUsage: 78,
            activationDate: '2023-03-20',
            expiryDate: '2025-03-20',
            sla: {
                latency: 50,
                jitter: 10,
                packetLoss: 0.1,
                availability: 99.9
            }
        },
        {
            id: 3,
            name: '上海-深圳专线',
            circuitId: 'CM-SH-SZ-003',
            provider: '中国移动',
            providerCode: 'china-mobile',
            type: 'IEPL',
            typeCode: 'iepl',
            bandwidth: '500Mbps',
            endpointA: '上海数据中心',
            endpointB: '深圳数据中心',
            status: 'fault',
            latency: 120.5,
            jitter: 25.3,
            packetLoss: 2.5,
            bandwidthUsage: 15,
            activationDate: '2023-06-10',
            expiryDate: '2025-06-10',
            sla: {
                latency: 50,
                jitter: 10,
                packetLoss: 0.1,
                availability: 99.9
            }
        },
        {
            id: 4,
            name: '北京-成都专线',
            circuitId: 'CT-BJ-CD-004',
            provider: '中国电信',
            providerCode: 'china-telecom',
            type: 'MPLS',
            typeCode: 'mpls',
            bandwidth: '100Mbps',
            endpointA: '北京总部',
            endpointB: '成都分部',
            status: 'normal',
            latency: 32.1,
            jitter: 4.5,
            packetLoss: 0.03,
            bandwidthUsage: 52,
            activationDate: '2023-08-01',
            expiryDate: '2025-08-01',
            sla: {
                latency: 50,
                jitter: 10,
                packetLoss: 0.1,
                availability: 99.9
            }
        },
        {
            id: 5,
            name: '上海-杭州专线',
            circuitId: 'CU-SH-HZ-005',
            provider: '中国联通',
            providerCode: 'china-unicom',
            type: '互联网专线',
            typeCode: 'internet',
            bandwidth: '1Gbps',
            endpointA: '上海办公室',
            endpointB: '杭州办公室',
            status: 'normal',
            latency: 15.8,
            jitter: 2.1,
            packetLoss: 0.01,
            bandwidthUsage: 35,
            activationDate: '2024-01-10',
            expiryDate: '2026-01-10',
            sla: {
                latency: 30,
                jitter: 5,
                packetLoss: 0.05,
                availability: 99.5
            }
        }
    ];
    
    // 更新统计数据
    updateLineStats();
    
    // 渲染专线卡片
    renderLineCards();
}

// 更新统计数据
function updateLineStats() {
    const normalCount = linesData.filter(l => l.status === 'normal').length;
    const warningCount = linesData.filter(l => l.status === 'warning').length;
    const faultCount = linesData.filter(l => l.status === 'fault').length;
    const totalCount = linesData.length;
    
    document.getElementById('normalLineCount').textContent = normalCount;
    document.getElementById('warningLineCount').textContent = warningCount;
    document.getElementById('faultLineCount').textContent = faultCount;
    document.getElementById('totalLineCount').textContent = totalCount;
}

// 渲染专线卡片
function renderLineCards() {
    const container = document.getElementById('lineCards');
    container.innerHTML = '';
    
    if (linesData.length === 0) {
        container.innerHTML = `
            <div class="empty-lines">
                <i class="fas fa-network-wired"></i>
                <p>暂无专线数据</p>
            </div>
        `;
        return;
    }
    
    linesData.forEach(line => {
        const card = document.createElement('div');
        card.className = `line-card status-${line.status}`;
        card.onclick = () => viewLineDetail(line.id);
        
        const statusText = {
            'normal': '正常',
            'warning': '警告',
            'fault': '故障'
        }[line.status];
        
        const latencyClass = line.latency > line.sla.latency ? 'bad' : line.latency > line.sla.latency * 0.8 ? 'warning' : 'good';
        const jitterClass = line.jitter > line.sla.jitter ? 'bad' : line.jitter > line.sla.jitter * 0.8 ? 'warning' : 'good';
        const packetLossClass = line.packetLoss > line.sla.packetLoss ? 'bad' : line.packetLoss > line.sla.packetLoss * 0.8 ? 'warning' : 'good';
        
        card.innerHTML = `
            <div class="line-card-header">
                <div class="line-card-title">${line.name}</div>
                <span class="line-status-badge ${line.status}">${statusText}</span>
            </div>
            <div class="line-card-info">
                <div class="line-card-info-item">
                    <div class="line-card-info-label">运营商</div>
                    <div class="line-card-info-value">${line.provider}</div>
                </div>
                <div class="line-card-info-item">
                    <div class="line-card-info-label">类型</div>
                    <div class="line-card-info-value">${line.type}</div>
                </div>
                <div class="line-card-info-item">
                    <div class="line-card-info-label">带宽</div>
                    <div class="line-card-info-value">${line.bandwidth}</div>
                </div>
                <div class="line-card-info-item">
                    <div class="line-card-info-label">电路ID</div>
                    <div class="line-card-info-value">${line.circuitId}</div>
                </div>
                <div class="line-card-info-item">
                    <div class="line-card-info-label">端点A</div>
                    <div class="line-card-info-value">${line.endpointA}</div>
                </div>
                <div class="line-card-info-item">
                    <div class="line-card-info-label">端点B</div>
                    <div class="line-card-info-value">${line.endpointB}</div>
                </div>
            </div>
            <div class="line-card-metrics">
                <div class="line-card-metric">
                    <div class="line-card-metric-label">延迟</div>
                    <div class="line-card-metric-value ${latencyClass}">${line.latency}ms</div>
                </div>
                <div class="line-card-metric">
                    <div class="line-card-metric-label">抖动</div>
                    <div class="line-card-metric-value ${jitterClass}">${line.jitter}ms</div>
                </div>
                <div class="line-card-metric">
                    <div class="line-card-metric-label">丢包率</div>
                    <div class="line-card-metric-value ${packetLossClass}">${line.packetLoss}%</div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 过滤专线
function filterLines() {
    const statusFilter = document.getElementById('lineStatusFilter').value;
    const providerFilter = document.getElementById('lineProviderFilter').value;
    const typeFilter = document.getElementById('lineTypeFilter').value;
    const searchText = document.getElementById('lineSearchInput').value.toLowerCase();
    
    const filtered = linesData.filter(line => {
        const matchStatus = !statusFilter || line.status === statusFilter;
        const matchProvider = !providerFilter || line.providerCode === providerFilter;
        const matchType = !typeFilter || line.typeCode === typeFilter;
        const matchSearch = !searchText || 
            line.name.toLowerCase().includes(searchText) ||
            line.circuitId.toLowerCase().includes(searchText);
        
        return matchStatus && matchProvider && matchType && matchSearch;
    });
    
    // 临时替换数据并重新渲染
    const originalData = linesData;
    linesData = filtered;
    renderLineCards();
    linesData = originalData;
}

// 查看专线详情
function viewLineDetail(lineId) {
    currentLine = linesData.find(l => l.id === lineId);
    if (!currentLine) return;
    
    // 显示详情页
    document.getElementById('lineDashboard').style.display = 'none';
    document.getElementById('lineDetail').style.display = 'block';
    
    // 更新基本信息
    const statusText = {
        'normal': '正常',
        'warning': '警告',
        'fault': '故障'
    }[currentLine.status];
    
    document.getElementById('lineDetailName').textContent = currentLine.name;
    document.getElementById('lineDetailStatus').textContent = statusText;
    document.getElementById('lineDetailStatus').className = `line-status-badge ${currentLine.status}`;
    
    // 更新概览信息
    document.getElementById('circuitId').textContent = currentLine.circuitId;
    document.getElementById('provider').textContent = currentLine.provider;
    document.getElementById('lineType').textContent = currentLine.type;
    document.getElementById('bandwidth').textContent = currentLine.bandwidth;
    document.getElementById('endpointA').textContent = currentLine.endpointA;
    document.getElementById('endpointB').textContent = currentLine.endpointB;
    document.getElementById('activationDate').textContent = currentLine.activationDate;
    document.getElementById('expiryDate').textContent = currentLine.expiryDate;
    
    // 更新SLA标准
    document.getElementById('slaLatency').textContent = `≤ ${currentLine.sla.latency}ms`;
    document.getElementById('slaJitter').textContent = `≤ ${currentLine.sla.jitter}ms`;
    document.getElementById('slaPacketLoss').textContent = `≤ ${currentLine.sla.packetLoss}%`;
    document.getElementById('slaAvailability').textContent = `≥ ${currentLine.sla.availability}%`;
    
    // 更新实时指标
    updateRealtimeMetrics();
    
    // 加载性能图表
    loadPerformanceCharts('1h');
    
    // 加载告警历史
    loadAlertHistory('7d');
}

// 更新实时指标
function updateRealtimeMetrics() {
    if (!currentLine) return;
    
    // 延迟
    document.getElementById('currentLatency').textContent = `${currentLine.latency} ms`;
    const latencyStatus = currentLine.latency > currentLine.sla.latency ? 'error' : 
                         currentLine.latency > currentLine.sla.latency * 0.8 ? 'warning' : '';
    document.getElementById('latencyStatus').textContent = 
        currentLine.latency > currentLine.sla.latency ? '超出SLA' : '正常';
    document.getElementById('latencyStatus').className = `metric-status ${latencyStatus}`;
    
    // 抖动
    document.getElementById('currentJitter').textContent = `${currentLine.jitter} ms`;
    const jitterStatus = currentLine.jitter > currentLine.sla.jitter ? 'error' : 
                        currentLine.jitter > currentLine.sla.jitter * 0.8 ? 'warning' : '';
    document.getElementById('jitterStatus').textContent = 
        currentLine.jitter > currentLine.sla.jitter ? '超出SLA' : '正常';
    document.getElementById('jitterStatus').className = `metric-status ${jitterStatus}`;
    
    // 丢包率
    document.getElementById('currentPacketLoss').textContent = `${currentLine.packetLoss} %`;
    const packetLossStatus = currentLine.packetLoss > currentLine.sla.packetLoss ? 'error' : 
                            currentLine.packetLoss > currentLine.sla.packetLoss * 0.8 ? 'warning' : '';
    document.getElementById('packetLossStatus').textContent = 
        currentLine.packetLoss > currentLine.sla.packetLoss ? '超出SLA' : '正常';
    document.getElementById('packetLossStatus').className = `metric-status ${packetLossStatus}`;
    
    // 带宽利用率
    document.getElementById('currentBandwidth').textContent = `${currentLine.bandwidthUsage} %`;
    const bandwidthStatus = currentLine.bandwidthUsage > 80 ? 'warning' : '';
    document.getElementById('bandwidthStatus').textContent = 
        currentLine.bandwidthUsage > 80 ? '使用率较高' : '正常';
    document.getElementById('bandwidthStatus').className = `metric-status ${bandwidthStatus}`;
}

// 加载性能图表
function loadPerformanceCharts(range) {
    console.log('加载性能图表，时间范围:', range);
    // 这里应该使用Chart.js或ECharts绘制图表
    // 图表数据应该从后端API获取
}

// 加载告警历史
function loadAlertHistory(timeRange) {
    // 模拟告警数据
    alertsData = [
        {
            time: '2025-01-29 10:30:00',
            type: '延迟超标',
            level: 'warning',
            content: '专线延迟达到48.5ms，接近SLA阈值',
            duration: '15分钟',
            status: 'resolved'
        },
        {
            time: '2025-01-28 15:20:00',
            type: '丢包率异常',
            level: 'critical',
            content: '专线丢包率达到2.5%，严重超出SLA标准',
            duration: '2小时',
            status: 'resolved'
        },
        {
            time: '2025-01-27 08:45:00',
            type: '抖动异常',
            level: 'warning',
            content: '专线抖动达到8.7ms，接近SLA阈值',
            duration: '30分钟',
            status: 'resolved'
        },
        {
            time: '2025-01-26 14:10:00',
            type: '带宽利用率高',
            level: 'info',
            content: '专线带宽利用率达到85%',
            duration: '1小时',
            status: 'resolved'
        }
    ];
    
    renderAlertTable();
}

// 渲染告警表格
function renderAlertTable() {
    const tbody = document.getElementById('alertTableBody');
    tbody.innerHTML = '';
    
    if (alertsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">暂无告警记录</td></tr>';
        return;
    }
    
    alertsData.forEach(alert => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${alert.time}</td>
            <td>${alert.type}</td>
            <td><span class="alert-level ${alert.level}">${alert.level === 'critical' ? '严重' : alert.level === 'warning' ? '警告' : '信息'}</span></td>
            <td>${alert.content}</td>
            <td>${alert.duration}</td>
            <td><span class="alert-status ${alert.status}">${alert.status === 'resolved' ? '已解决' : '活跃'}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// 刷新专线数据
function refreshLineData() {
    console.log('刷新专线数据');
    alert('正在刷新数据...');
    
    // 模拟刷新
    setTimeout(() => {
        updateRealtimeMetrics();
        alert('数据刷新完成！');
    }, 1000);
}

// 生成报告
function generateReport() {
    console.log('生成可用性报告');
    alert('正在生成报告，请稍候...');
}

// 下载报告
function downloadReport() {
    console.log('下载可用性报告');
    alert('报告下载功能开发中...');
}

// 删除专线
function deleteLine() {
    if (!currentLine) return;
    
    if (confirm(`确定要删除专线"${currentLine.name}"吗？\n\n删除后将无法恢复，所有相关的性能数据和告警历史也将被删除。`)) {
        console.log('删除专线:', currentLine.id);
        
        // 从数据中移除
        const index = linesData.findIndex(l => l.id === currentLine.id);
        if (index > -1) {
            linesData.splice(index, 1);
        }
        
        // 显示删除成功提示
        alert(`专线"${currentLine.name}"已成功删除！`);
        
        // 返回列表页
        document.getElementById('lineDashboard').style.display = 'block';
        document.getElementById('lineDetail').style.display = 'none';
        
        // 更新统计和列表
        updateLineStats();
        renderLineCards();
        
        currentLine = null;
    }
}

// 导出函数供HTML使用
window.viewLineDetail = viewLineDetail;
