// 视图页面交互逻辑

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化视图控制器
    initViewController();
    // 初始化图表
    initCharts();
    // 初始化侧边栏交互
    initSidebar();
});

/**
 * 初始化视图控制器
 */
function initViewController() {
    // 获取所有视图选项卡和面板
    const tabButtons = document.querySelectorAll('.tab-btn');
    const viewPanels = document.querySelectorAll('.view-panel');

    // 为每个选项卡添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标视图
            const targetView = this.getAttribute('data-view');

            // 移除所有选项卡的活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前选项卡的活动状态
            this.classList.add('active');

            // 隐藏所有视图面板
            viewPanels.forEach(panel => panel.classList.remove('active'));
            // 显示目标视图面板
            document.getElementById(`${targetView}-view`).classList.add('active');

            // 如果是首次切换到该视图，初始化相关内容
            if (targetView === 'dashboard' && !window.dashboardInitialized) {
                initDashboardView();
            } else if (targetView === 'route' && !window.routeInitialized) {
                initRouteView();
            } else if (targetView === 'visio' && !window.visioInitialized) {
                initVisioView();
            } else if (targetView === 'room' && !window.roomInitialized) {
                initRoomView();
            } else if (targetView === 'line' && !window.lineInitialized) {
                initLineView();
            }
        });
    });
}

/**
 * 初始化图表
 */
function initCharts() {
    // 检查是否加载了Chart.js
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }

    // 系统概览图表
    const systemOverviewCtx = document.getElementById('systemOverviewChart');
    if (systemOverviewCtx) {
        new Chart(systemOverviewCtx, {
            type: 'doughnut',
            data: {
                labels: ['服务器', '网络设备', '存储设备', '安全设备'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: '设备类型分布'
                    }
                }
            }
        });
    }

    // 资源使用情况图表
    const resourceUsageCtx = document.getElementById('resourceUsageChart');
    if (resourceUsageCtx) {
        new Chart(resourceUsageCtx, {
            type: 'bar',
            data: {
                labels: ['CPU', '内存', '磁盘', '网络'],
                datasets: [{
                    label: '使用率 (%)',
                    data: [65, 45, 78, 32],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '系统资源使用情况'
                    }
                }
            }
        });
    }

    // 机房温度图表
    const temperatureCtx = document.getElementById('temperatureChart');
    if (temperatureCtx) {
        new Chart(temperatureCtx, {
            type: 'line',
            data: {
                labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                datasets: [{
                    label: '温度 (°C)',
                    data: [22, 23, 24, 25, 24, 23],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 18,
                        max: 30
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '机房温度变化'
                    }
                }
            }
        });
    }

    // 机房湿度图表
    const humidityCtx = document.getElementById('humidityChart');
    if (humidityCtx) {
        new Chart(humidityCtx, {
            type: 'line',
            data: {
                labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
                datasets: [{
                    label: '湿度 (%)',
                    data: [45, 42, 40, 38, 41, 43],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        max: 60
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '机房湿度变化'
                    }
                }
            }
        });
    }

    // 专线流量图表
    const lineTrafficCtx = document.getElementById('lineTrafficChart');
    if (lineTrafficCtx) {
        new Chart(lineTrafficCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: '北京-上海',
                    data: [320, 280, 450, 420, 480, 456],
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    tension: 0.3
                }, {
                    label: '上海-广州',
                    data: [280, 250, 350, 320, 380, 320],
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    tension: 0.3
                }, {
                    label: '广州-深圳',
                    data: [450, 420, 650, 720, 780, 750],
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '流量 (Mbps)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '时间'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '专线流量趋势'
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
}

/**
 * 初始化仪表盘视图
 */
function initDashboardView() {
    window.dashboardInitialized = true;
    // 这里可以添加仪表盘视图的初始化逻辑
    console.log('Dashboard view initialized');
}

/**
 * 初始化设备视图
 */
function initDevicesView() {
    window.devicesInitialized = true;
    // 这里可以添加设备视图的初始化逻辑
    console.log('Devices view initialized');
}

/**
 * 初始化网络视图
 */
function initNetworkView() {
    window.networkInitialized = true;
    // 这里可以添加网络视图的初始化逻辑
    console.log('Network view initialized');
}

/**
 * 初始化链路航线图视图
 */
function initRouteView() {
    window.routeInitialized = true;
    // 初始化链路航线图
    initRouteMap();
    console.log('Route view initialized');
}

/**
 * 初始化Visio视图
 */
function initVisioView() {
    window.visioInitialized = true;
    // 这里可以添加Visio视图的初始化逻辑
    initVisioControls();
    console.log('Visio view initialized');
}

/**
 * 初始化机房仪表盘视图
 */
function initRoomView() {
    window.roomInitialized = true;
    // 初始化机房布局图
    // 延迟初始化，确保SVG元素已渲染
setTimeout(initRoomLayout, 100);
    console.log('Room view initialized');
}

/**
 * 初始化专线大屏视图
 */
function initLineView() {
    window.lineInitialized = true;
    // 这里可以添加专线大屏视图的初始化逻辑
    initLineStatus();
    console.log('Line view initialized');
}

/**
 * 初始化链路航线图
 */
function initRouteMap() {
    const svg = document.getElementById('routeMap');
    if (!svg) return;

    // 这里使用简单的SVG绘制示例链路图
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // 清空SVG
    svg.innerHTML = '';

    // 设置SVG视口
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 定义城市坐标
    const cities = {
        '北京': { x: 100, y: 100 },
        '上海': { x: 300, y: 150 },
        '广州': { x: 300, y: 350 },
        '深圳': { x: 350, y: 380 },
        '成都': { x: 100, y: 300 }
    };

    // 绘制城市节点
    for (const city in cities) {
        const { x, y } = cities[city];
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 10);
        circle.setAttribute('fill', '#3b82f6');
        svg.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y - 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#333');
        text.textContent = city;
        svg.appendChild(text);
    }

    // 绘制链路
    const routes = [
        { from: '北京', to: '上海', status: 'online' },
        { from: '上海', to: '广州', status: 'online' },
        { from: '广州', to: '深圳', status: 'warning' },
        { from: '北京', to: '成都', status: 'online' },
        { from: '上海', to: '成都', status: 'critical' }
    ];

    for (const route of routes) {
        const { from, to, status } = route;
        const fromCity = cities[from];
        const toCity = cities[to];

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 使用贝塞尔曲线绘制曲线
        const controlX1 = (fromCity.x + toCity.x) / 2;
        const controlY1 = fromCity.y - 50;
        const controlX2 = (fromCity.x + toCity.x) / 2;
        const controlY2 = toCity.y - 50;

        const d = `M ${fromCity.x} ${fromCity.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toCity.x} ${toCity.y}`;
        line.setAttribute('d', d);

        // 设置链路状态样式
        let strokeColor = '#10b981'; // 正常
        let strokeWidth = 3;

        if (status === 'warning') {
            strokeColor = '#f59e0b'; // 警告
        } else if (status === 'critical') {
            strokeColor = '#ef4444'; // 故障
            strokeWidth = 4;
            line.setAttribute('stroke-dasharray', '5,5');
        }

        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('fill', 'none');
        svg.appendChild(line);
    }
}

/**
 * 初始化Visio视图控件
 */
function initVisioControls() {
    const zoomInBtn = document.querySelector('.visio-controls button:nth-child(1)');
    const zoomOutBtn = document.querySelector('.visio-controls button:nth-child(2)');
    const panBtn = document.querySelector('.visio-controls button:nth-child(3)');
    const resetBtn = document.querySelector('.visio-controls button:nth-child(4)');
    const exportBtn = document.querySelector('.visio-controls button:nth-child(5)');
    const visioImage = document.querySelector('.visio-image');

    let scale = 1;
    let isPanning = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            scale += 0.1;
            updateVisioTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(0.5, scale - 0.1);
            updateVisioTransform();
        });
    }

    if (panBtn) {
        panBtn.addEventListener('click', () => {
            isPanning = !isPanning;
            panBtn.textContent = isPanning ? '平移 (已激活)' : '平移';
            visioImage.style.cursor = isPanning ? 'move' : 'default';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateVisioTransform();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('导出功能已触发');
            // 实际项目中这里会实现导出功能
        });
    }

    if (visioImage) {
        visioImage.addEventListener('mousedown', (e) => {
            if (isPanning) {
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateVisioTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            isPanning = false;
            if (panBtn) {
                panBtn.textContent = '平移';
            }
            if (visioImage) {
                visioImage.style.cursor = 'default';
            }
        });
    }

    function updateVisioTransform() {
        if (visioImage) {
            visioImage.style.transform = `scale(${scale}) translate(${translateX/scale}px, ${translateY/scale}px)`;
        }
    }
}

/**
 * 初始化机房布局图
 */
function initRoomLayout() {
    const svg = document.getElementById('roomLayout');
    if (!svg) return;

    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // 清空SVG
    svg.innerHTML = '';

    // 设置SVG视口
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 定义边距
    const margin = 60;

    // 绘制机房轮廓
    const room = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    room.setAttribute('x', margin);
    room.setAttribute('y', margin);
    room.setAttribute('width', width - 2 * margin);
    room.setAttribute('height', height - 2 * margin);
    room.setAttribute('fill', '#f1f5f9');
    room.setAttribute('stroke', '#94a3b8');
    room.setAttribute('stroke-width', '2');
    svg.appendChild(room);

    // 计算内部可用空间
    const innerWidth = width - 2 * margin;
    const innerHeight = height - 2 * margin;

    // 绘制机柜
    const rackWidth = 60;
    const rackHeight = 80; // 减少机柜高度
    const gap = 15; // 减少间隙
    const rows = 2;
    const cols = 4;

    // 计算机柜区域总宽度和高度
    const racksTotalWidth = cols * rackWidth + (cols - 1) * gap;
    const racksTotalHeight = rows * rackHeight + (rows - 1) * gap;

    // 计算机柜起始位置(居中放置)
    const racksStartX = margin + (innerWidth - racksTotalWidth) / 2;
    const racksStartY = margin + 20; // 顶部留出一些空间

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = racksStartX + j * (rackWidth + gap);
            const y = racksStartY + i * (rackHeight + gap);

            // 确保机柜在机房内部
            if (x + rackWidth > width - margin || y + rackHeight > height - margin) {
                continue;
            }

            const rack = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rack.setAttribute('x', x);
            rack.setAttribute('y', y);
            rack.setAttribute('width', rackWidth);
            rack.setAttribute('height', rackHeight);
            rack.setAttribute('fill', '#e2e8f0');
            rack.setAttribute('stroke', '#64748b');
            rack.setAttribute('stroke-width', '1');
            svg.appendChild(rack);

            // 机柜编号
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + rackWidth / 2);
            text.setAttribute('y', y + 15);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#333');
            text.setAttribute('font-size', '12');
            text.textContent = `机柜 ${i+1}-${j+1}`;
            svg.appendChild(text);

            // 状态指示灯
            const statusLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            statusLight.setAttribute('cx', x + rackWidth - 10);
            statusLight.setAttribute('cy', y + 10);
            statusLight.setAttribute('r', 5);
            // 随机状态
            const statuses = ['#10b981', '#f59e0b', '#ef4444'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            statusLight.setAttribute('fill', status);
            svg.appendChild(statusLight);
        }
    }

    // 绘制空调 - 右侧中间位置
    const acWidth = 60;
    const acHeight = 70; // 减少空调高度
    const acX = width - margin - acWidth - 15; // 右侧留出边距和间隙
    const acY = margin + (innerHeight - acHeight) / 2; // 垂直居中

    // 确保空调在机房内部
    if (acX >= margin && acY >= margin && acX + acWidth <= width - margin && acY + acHeight <= height - margin) {
        const ac = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ac.setAttribute('x', acX);
        ac.setAttribute('y', acY);
        ac.setAttribute('width', acWidth);
        ac.setAttribute('height', acHeight);
        ac.setAttribute('fill', '#bfdbfe');
        ac.setAttribute('stroke', '#3b82f6');
        ac.setAttribute('stroke-width', '1');
        svg.appendChild(ac);

        const acText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        acText.setAttribute('x', acX + acWidth / 2);
        acText.setAttribute('y', acY + acHeight / 2);
        acText.setAttribute('text-anchor', 'middle');
        acText.setAttribute('dominant-baseline', 'middle');
        acText.setAttribute('fill', '#333');
        acText.textContent = '空调';
        svg.appendChild(acText);
    }

    // 绘制UPS - 底部中间位置
    const upsWidth = 70; // 减少UPS宽度
    const upsHeight = 50; // 减少UPS高度
    const upsX = margin + (innerWidth - upsWidth) / 2; // 水平居中
    const upsY = height - margin - upsHeight - 15; // 底部留出边距和间隙

    // 确保UPS在机房内部
    if (upsX >= margin && upsY >= margin && upsX + upsWidth <= width - margin && upsY + upsHeight <= height - margin) {
        const ups = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ups.setAttribute('x', upsX);
        ups.setAttribute('y', upsY);
        ups.setAttribute('width', upsWidth);
        ups.setAttribute('height', upsHeight);
        ups.setAttribute('fill', '#d1fae5');
        ups.setAttribute('stroke', '#10b981');
        ups.setAttribute('stroke-width', '1');
        svg.appendChild(ups);

        const upsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        upsText.setAttribute('x', upsX + upsWidth / 2);
        upsText.setAttribute('y', upsY + upsHeight / 2);
        upsText.setAttribute('text-anchor', 'middle');
        upsText.setAttribute('dominant-baseline', 'middle');
        upsText.setAttribute('fill', '#333');
        upsText.textContent = 'UPS';
        svg.appendChild(upsText);
    }
}

/**
 * 初始化专线状态
 */
function initLineStatus() {
    // 设置专线状态颜色
    const lineStatuses = document.querySelectorAll('.line-status');
    lineStatuses.forEach(status => {
        if (status.classList.contains('online')) {
            status.style.backgroundColor = '#10b981';
        } else if (status.classList.contains('warning')) {
            status.style.backgroundColor = '#f59e0b';
        } else if (status.classList.contains('critical')) {
            status.style.backgroundColor = '#ef4444';
        }
    });

    // 设置统计值颜色
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(value => {
        if (value.classList.contains('online')) {
            value.style.color = '#10b981';
        } else if (value.classList.contains('warning')) {
            value.style.color = '#f59e0b';
        } else if (value.classList.contains('critical')) {
            value.style.color = '#ef4444';
        }
    });
}

/**
 * 初始化侧边栏交互
 */
function initSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemText = this.querySelector('span').textContent;
            console.log('导航到:', itemText);

            // 根据菜单项跳转到对应页面
            navigateToPage(itemText);
        });
    });
}

/**
 * 侧边栏导航功能
 */
function navigateToPage(menuItem) {
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
        if (targetPage === '视图.html') {
            console.log('当前已在视图页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}