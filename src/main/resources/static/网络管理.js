// 网络管理类
class NetworkManager {
    constructor() {
        this.devices = [];
        this.filteredDevices = [];
        this.stats = {
            apiGateway: { total: 0, normal: 0, error: 0 },
            acController: { total: 0, normal: 0, error: 0 }
        };
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadMockData();
        this.updateStats();
        this.renderDevices();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchDevices(e.target.value);
        });

        // 过滤器
        document.getElementById('deviceTypeFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        document.getElementById('locationFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // 添加设备按钮
        document.getElementById('addDeviceBtn').addEventListener('click', () => {
            this.showAddDeviceModal();
        });

        // 添加设备表单提交
        document.getElementById('addDeviceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDevice();
        });

        // 模态框关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // 侧边栏导航事件
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span').textContent;
                console.log('导航到:', itemText);
                this.navigateToPage(itemText);
            });
        });
    }

    // 加载模拟数据
    loadMockData() {
        this.devices = [
            {
                id: 'device-1',
                name: '核心交换机-01',
                type: 'switch',
                ip: '192.168.1.10',
                mac: '00:1B:44:11:3A:B7',
                brand: 'Cisco',
                model: 'Catalyst 9300',
                location: 'datacenter',
                status: 'online',
                uptime: '45天',
                description: '数据中心核心交换机'
            },
            {
                id: 'device-2',
                name: '边界路由器-01',
                type: 'router',
                ip: '192.168.1.1',
                mac: '00:1B:44:11:3A:B8',
                brand: 'Huawei',
                model: 'NE40E-X8',
                location: 'datacenter',
                status: 'online',
                uptime: '30天',
                description: '边界路由器'
            },
            {
                id: 'device-3',
                name: '防火墙-01',
                type: 'firewall',
                ip: '192.168.1.254',
                mac: '00:1B:44:11:3A:B9',
                brand: 'Fortinet',
                model: 'FortiGate 600E',
                location: 'datacenter',
                status: 'warning',
                uptime: '15天',
                description: '边界防火墙'
            }
        ];

        this.filteredDevices = [...this.devices];
    }

    // 更新统计数据
    updateStats() {
        // 计算API网关统计
        const apiGateways = this.devices.filter(device => device.type === 'gateway');
        this.stats.apiGateway.total = apiGateways.length;
        this.stats.apiGateway.normal = apiGateways.filter(d => d.status === 'online').length;
        this.stats.apiGateway.error = apiGateways.filter(d => d.status === 'offline' || d.status === 'warning').length;

        // 计算AC控制器统计
        const acControllers = this.devices.filter(device => device.type === 'ap');
        this.stats.acController.total = acControllers.length;
        this.stats.acController.normal = acControllers.filter(d => d.status === 'online').length;
        this.stats.acController.error = acControllers.filter(d => d.status === 'offline' || d.status === 'warning').length;

        this.renderStats();
    }

    // 渲染统计数据
    renderStats() {
        const statCards = document.querySelectorAll('.stat-card');
        
        // API网关统计
        if (statCards[0]) {
            const apiCard = statCards[0];
            apiCard.querySelector('.stat-number').textContent = this.stats.apiGateway.total;
            const statItems = apiCard.querySelectorAll('.stat-item .stat-value');
            if (statItems[0]) statItems[0].textContent = this.stats.apiGateway.normal;
            if (statItems[1]) statItems[1].textContent = this.stats.apiGateway.error;
        }

        // AC控制器统计
        if (statCards[1]) {
            const acCard = statCards[1];
            acCard.querySelector('.stat-number').textContent = this.stats.acController.total;
            const statItems = acCard.querySelectorAll('.stat-item .stat-value');
            if (statItems[0]) statItems[0].textContent = this.stats.acController.normal;
            if (statItems[1]) statItems[1].textContent = this.stats.acController.error;
        }
    }

    // 搜索设备
    searchDevices(query) {
        if (!query.trim()) {
            this.filteredDevices = [...this.devices];
        } else {
            this.filteredDevices = this.devices.filter(device =>
                device.name.toLowerCase().includes(query.toLowerCase()) ||
                device.ip.includes(query) ||
                device.mac.toLowerCase().includes(query.toLowerCase()) ||
                device.brand.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.renderDevices();
    }

    // 应用过滤器
    applyFilters() {
        const typeFilter = document.getElementById('deviceTypeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const locationFilter = document.getElementById('locationFilter').value;

        this.filteredDevices = this.devices.filter(device => {
            const typeMatch = !typeFilter || device.type === typeFilter;
            const statusMatch = !statusFilter || device.status === statusFilter;
            const locationMatch = !locationFilter || device.location === locationFilter;
            
            return typeMatch && statusMatch && locationMatch;
        });

        this.renderDevices();
    }

    // 渲染设备列表
    renderDevices() {
        const container = document.getElementById('deviceList');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredDevices.length === 0) {
            container.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        container.innerHTML = this.filteredDevices.map(device => 
            this.renderDeviceItem(device)
        ).join('');
    }

    // 渲染设备项
    renderDeviceItem(device) {
        const typeLabels = {
            'router': '路由器',
            'switch': '交换机',
            'firewall': '防火墙',
            'ap': '无线AP',
            'gateway': '网关'
        };

        const statusLabels = {
            'online': '在线',
            'offline': '离线',
            'warning': '告警'
        };

        return `
            <div class="device-item" data-id="${device.id}">
                <div class="table-cell">
                    <div class="device-name">${device.name}</div>
                    <div style="font-size: 12px; color: #6c757d;">${typeLabels[device.type] || device.type}</div>
                </div>
                <div class="table-cell">${device.mac}</div>
                <div class="table-cell">${device.ip}</div>
                <div class="table-cell">${device.brand}</div>
                <div class="table-cell">${device.model || '-'}</div>
                <div class="table-cell">
                    <div class="device-status ${device.status}">
                        <span class="status-dot"></span>
                        <span>${statusLabels[device.status]}</span>
                    </div>
                </div>
                <div class="table-cell">
                    <div class="device-actions">
                        <button class="action-btn primary" onclick="networkManager.viewDevice('${device.id}')">详情</button>
                        <button class="action-btn primary" onclick="networkManager.editDevice('${device.id}')">编辑</button>
                        <button class="action-btn danger" onclick="networkManager.deleteDevice('${device.id}')">删除</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 显示添加设备模态框
    showAddDeviceModal() {
        const modal = document.getElementById('addDeviceModal');
        modal.classList.add('show');
        
        // 重置表单
        document.getElementById('addDeviceForm').reset();
    }

    // 关闭模态框
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    // 添加设备
    addDevice() {
        const form = document.getElementById('addDeviceForm');
        const formData = new FormData(form);
        
        const newDevice = {
            id: 'device-' + Date.now(),
            name: formData.get('deviceName'),
            type: formData.get('deviceType'),
            ip: formData.get('ipAddress'),
            mac: formData.get('macAddress') || '',
            brand: formData.get('brand') || '',
            model: '',
            location: formData.get('location') || 'datacenter',
            status: 'online',
            uptime: '0天',
            description: formData.get('description') || ''
        };

        this.devices.push(newDevice);
        this.applyFilters();
        this.updateStats();
        this.closeModal('addDeviceModal');
        
        // 显示成功消息
        this.showMessage('设备添加成功！', 'success');
    }

    // 查看设备详情
    viewDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            alert(`设备详情：\n名称：${device.name}\nIP：${device.ip}\n状态：${device.status}\n运行时间：${device.uptime}`);
        }
    }

    // 编辑设备
    editDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            // 这里可以实现编辑功能
            alert('编辑功能待实现');
        }
    }

    // 删除设备
    deleteDevice(deviceId) {
        if (confirm('确定要删除这个设备吗？')) {
            this.devices = this.devices.filter(d => d.id !== deviceId);
            this.applyFilters();
            this.updateStats();
            this.showMessage('设备删除成功！', 'success');
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 简单的消息提示
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 3000;
            font-size: 14px;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    // 侧边栏导航功能
    navigateToPage(menuItem) {
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
            if (targetPage === '网络管理.html') {
                console.log('当前已在网络管理页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
}

// 全局函数
function closeModal(modalId) {
    networkManager.closeModal(modalId);
}

// 初始化应用
let networkManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化网络管理器...');
        networkManager = new NetworkManager();
        console.log('网络管理器初始化完成');
    } catch (error) {
        console.error('初始化网络管理器时出错:', error);
    }
});
