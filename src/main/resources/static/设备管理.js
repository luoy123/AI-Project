// 设备管理系统
class DeviceManager {
    constructor() {
        this.devices = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.selectedGroup = null;
        this.searchKeyword = '';
        this.editingDevice = null;
        
        this.init();
    }

    init() {
        this.initializeData();
        this.renderDeviceTree();
        this.renderDeviceTable();
        this.bindEvents();
    }

    // 初始化示例数据
    initializeData() {
        this.deviceGroups = [
            {
                id: 'servers',
                name: '服务器',
                icon: 'fas fa-server',
                children: [
                    { id: 'web-servers', name: 'Web服务器', icon: 'fas fa-globe', count: 1 },
                    { id: 'db-servers', name: '数据库服务器', icon: 'fas fa-database', count: 0 },
                    { id: 'app-servers', name: '应用服务器', icon: 'fas fa-cogs', count: 0 }
                ]
            },
            {
                id: 'network',
                name: '网络设备',
                icon: 'fas fa-network-wired',
                children: [
                    { id: 'switches', name: '交换机', icon: 'fas fa-project-diagram', count: 1 },
                    { id: 'routers', name: '路由器', icon: 'fas fa-route', count: 0 },
                    { id: 'firewalls', name: '防火墙', icon: 'fas fa-shield-alt', count: 0 }
                ]
            },
            {
                id: 'storage',
                name: '存储设备',
                icon: 'fas fa-hdd',
                children: [
                    { id: 'nas', name: 'NAS存储', icon: 'fas fa-archive', count: 0 },
                    { id: 'san', name: 'SAN存储', icon: 'fas fa-server', count: 0 }
                ]
            }
        ];

        this.devices = [
            {
                id: 1,
                name: 'admin',
                ip: '192.168.1.12',
                type: 'server',
                status: 'online',
                lastUpdate: '2023-07-15 09:26:07',
                description: '主管理服务器',
                group: 'web-servers'
            },
            {
                id: 2,
                name: '主交换机',
                ip: '127.0.0.1',
                type: 'switch',
                status: 'online',
                lastUpdate: '2023-06-30 23:27:09',
                description: '核心网络交换设备',
                group: 'switches'
            }
        ];

        // 更新设备分组计数
        this.updateGroupCounts();
    }

    // 更新分组设备计数
    updateGroupCounts() {
        this.deviceGroups.forEach(group => {
            if (group.children) {
                group.children.forEach(child => {
                    child.count = this.devices.filter(device => device.group === child.id).length;
                });
            }
        });
    }

    // 渲染设备树
    renderDeviceTree() {
        const treeContainer = document.getElementById('deviceTree');
        treeContainer.innerHTML = '';

        this.deviceGroups.forEach(group => {
            const groupElement = this.createTreeNode(group, true);
            treeContainer.appendChild(groupElement);
        });
    }

    // 创建树节点
    createTreeNode(node, isGroup = false) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'tree-node-content';
        contentDiv.dataset.nodeId = node.id;

        if (isGroup && node.children) {
            const toggleDiv = document.createElement('div');
            toggleDiv.className = 'tree-node-toggle';
            toggleDiv.innerHTML = '<i class="fas fa-chevron-right"></i>';
            contentDiv.appendChild(toggleDiv);
        } else {
            const spacer = document.createElement('div');
            spacer.style.width = '16px';
            spacer.style.marginRight = '8px';
            contentDiv.appendChild(spacer);
        }

        const iconDiv = document.createElement('div');
        iconDiv.className = 'tree-node-icon';
        iconDiv.innerHTML = `<i class="${node.icon}"></i>`;
        contentDiv.appendChild(iconDiv);

        const labelDiv = document.createElement('div');
        labelDiv.className = 'tree-node-label';
        labelDiv.textContent = node.name;
        contentDiv.appendChild(labelDiv);

        if (node.count !== undefined) {
            const countDiv = document.createElement('div');
            countDiv.className = 'tree-node-count';
            countDiv.textContent = node.count;
            contentDiv.appendChild(countDiv);
        }

        nodeDiv.appendChild(contentDiv);

        // 添加子节点
        if (isGroup && node.children) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'tree-node-children';
            
            node.children.forEach(child => {
                const childNode = this.createTreeNode(child, false);
                childrenDiv.appendChild(childNode);
            });
            
            nodeDiv.appendChild(childrenDiv);
        }

        return nodeDiv;
    }

    // 渲染设备表格
    renderDeviceTable() {
        const tbody = document.getElementById('deviceTableBody');
        tbody.innerHTML = '';

        let filteredDevices = this.devices;

        // 按分组筛选
        if (this.selectedGroup) {
            filteredDevices = filteredDevices.filter(device => device.group === this.selectedGroup);
        }

        // 按关键词搜索
        if (this.searchKeyword) {
            filteredDevices = filteredDevices.filter(device => 
                device.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                device.ip.includes(this.searchKeyword) ||
                device.description.toLowerCase().includes(this.searchKeyword.toLowerCase())
            );
        }

        // 分页
        this.totalPages = Math.ceil(filteredDevices.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageDevices = filteredDevices.slice(startIndex, endIndex);

        pageDevices.forEach(device => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" data-device-id="${device.id}"></td>
                <td>${device.name}</td>
                <td>${device.ip}</td>
                <td>${this.getDeviceTypeText(device.type)}</td>
                <td><span class="status-badge status-${device.status}">${this.getStatusText(device.status)}</span></td>
                <td>${device.lastUpdate}</td>
                <td>${device.description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="deviceManager.editDevice(${device.id})">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn-action btn-delete" onclick="deviceManager.deleteDevice(${device.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.renderPagination(filteredDevices.length);
    }

    // 渲染分页
    renderPagination(totalItems) {
        const pagination = document.getElementById('pagination');
        const info = document.createElement('div');
        info.className = 'pagination-info';
        info.textContent = `共 ${totalItems} 条记录，第 ${this.currentPage} 页，共 ${this.totalPages} 页`;

        const controls = document.createElement('div');
        controls.className = 'pagination-controls';

        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '上一页';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        controls.appendChild(prevBtn);

        // 页码按钮
        for (let i = 1; i <= this.totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            controls.appendChild(pageBtn);
        }

        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = '下一页';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        controls.appendChild(nextBtn);

        pagination.innerHTML = '';
        pagination.appendChild(info);
        pagination.appendChild(controls);
    }

    // 绑定事件
    bindEvents() {
        // 树节点点击事件
        document.getElementById('deviceTree').addEventListener('click', (e) => {
            const toggle = e.target.closest('.tree-node-toggle');
            const content = e.target.closest('.tree-node-content');

            if (toggle) {
                this.toggleTreeNode(toggle);
            } else if (content) {
                this.selectTreeNode(content);
            }
        });

        // 搜索事件
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchKeyword = e.target.value;
            this.currentPage = 1;
            this.renderDeviceTable();
        });

        // 添加设备按钮
        document.getElementById('addDeviceBtn').addEventListener('click', () => {
            this.showDeviceModal();
        });

        // 模态框事件
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideDeviceModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideDeviceModal();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveDevice();
        });

        // 全选事件
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#deviceTableBody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });

        // 导入导出按钮事件
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importDevices();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportDevices();
        });

        // 树操作按钮事件
        document.querySelector('.tree-actions').addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-icon');
            if (!btn) return;

            const icon = btn.querySelector('i');
            if (icon.classList.contains('fa-expand-arrows-alt')) {
                this.expandAllNodes();
            } else if (icon.classList.contains('fa-compress-arrows-alt')) {
                this.collapseAllNodes();
            } else if (icon.classList.contains('fa-sync-alt')) {
                this.refreshTree();
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

    // 切换树节点展开/折叠
    toggleTreeNode(toggle) {
        const node = toggle.closest('.tree-node');
        const children = node.querySelector('.tree-node-children');
        const icon = toggle.querySelector('i');

        if (children) {
            children.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
        }
    }

    // 选择树节点
    selectTreeNode(content) {
        // 移除之前的选中状态
        document.querySelectorAll('.tree-node-content.selected').forEach(node => {
            node.classList.remove('selected');
        });

        // 添加选中状态
        content.classList.add('selected');
        
        // 设置选中的分组
        this.selectedGroup = content.dataset.nodeId;
        this.currentPage = 1;
        this.renderDeviceTable();
    }

    // 跳转到指定页
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.renderDeviceTable();
        }
    }

    // 显示设备模态框
    showDeviceModal(device = null) {
        this.editingDevice = device;
        const modal = document.getElementById('deviceModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('deviceForm');

        // 填充设备分组选项
        this.populateGroupOptions();

        if (device) {
            title.textContent = '编辑设备';
            this.fillDeviceForm(device);
        } else {
            title.textContent = '添加设备';
            form.reset();
        }

        modal.style.display = 'block';
    }

    // 填充设备分组选项
    populateGroupOptions() {
        const groupSelect = document.getElementById('deviceGroup');
        groupSelect.innerHTML = '<option value="">请选择</option>';

        this.deviceGroups.forEach(group => {
            if (group.children) {
                group.children.forEach(child => {
                    const option = document.createElement('option');
                    option.value = child.id;
                    option.textContent = `${group.name} - ${child.name}`;
                    groupSelect.appendChild(option);
                });
            }
        });
    }

    // 隐藏设备模态框
    hideDeviceModal() {
        document.getElementById('deviceModal').style.display = 'none';
        this.editingDevice = null;
    }

    // 填充设备表单
    fillDeviceForm(device) {
        document.getElementById('deviceName').value = device.name;
        document.getElementById('deviceIP').value = device.ip;
        document.getElementById('deviceType').value = device.type;
        document.getElementById('deviceGroup').value = device.group;
        document.getElementById('deviceStatus').value = device.status;
        document.getElementById('deviceDescription').value = device.description;
    }

    // 保存设备
    saveDevice() {
        const form = document.getElementById('deviceForm');
        const formData = new FormData(form);

        // 验证必填字段
        if (!formData.get('deviceName') || !formData.get('deviceIP') || !formData.get('deviceType')) {
            alert('请填写所有必填字段');
            return;
        }

        const deviceData = {
            name: formData.get('deviceName'),
            ip: formData.get('deviceIP'),
            type: formData.get('deviceType'),
            group: formData.get('deviceGroup'),
            status: formData.get('deviceStatus') || 'online',
            description: formData.get('deviceDescription') || '',
            lastUpdate: new Date().toLocaleString('zh-CN')
        };

        if (this.editingDevice) {
            // 编辑现有设备
            const index = this.devices.findIndex(d => d.id === this.editingDevice.id);
            if (index !== -1) {
                this.devices[index] = { ...this.devices[index], ...deviceData };
            }
        } else {
            // 添加新设备
            deviceData.id = Date.now();
            this.devices.push(deviceData);
        }

        // 更新分组计数并重新渲染
        this.updateGroupCounts();
        this.renderDeviceTree();
        this.hideDeviceModal();
        this.renderDeviceTable();
    }

    // 编辑设备
    editDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            this.showDeviceModal(device);
        }
    }

    // 删除设备
    deleteDevice(deviceId) {
        if (confirm('确定要删除这个设备吗？')) {
            this.devices = this.devices.filter(d => d.id !== deviceId);
            this.updateGroupCounts();
            this.renderDeviceTree();
            this.renderDeviceTable();
        }
    }

    // 获取设备类型文本
    getDeviceTypeText(type) {
        const types = {
            'server': '服务器',
            'switch': '交换机',
            'router': '路由器',
            'firewall': '防火墙',
            'storage': '存储设备'
        };
        return types[type] || type;
    }

    // 获取状态文本
    getStatusText(status) {
        const statuses = {
            'online': '在线',
            'offline': '离线',
            'maintenance': '维护中'
        };
        return statuses[status] || status;
    }

    // 展开所有节点
    expandAllNodes() {
        const toggles = document.querySelectorAll('.tree-node-toggle');
        toggles.forEach(toggle => {
            const children = toggle.closest('.tree-node').querySelector('.tree-node-children');
            if (children) {
                children.classList.add('expanded');
                toggle.classList.add('expanded');
            }
        });
    }

    // 折叠所有节点
    collapseAllNodes() {
        const toggles = document.querySelectorAll('.tree-node-toggle');
        toggles.forEach(toggle => {
            const children = toggle.closest('.tree-node').querySelector('.tree-node-children');
            if (children) {
                children.classList.remove('expanded');
                toggle.classList.remove('expanded');
            }
        });
    }

    // 刷新树
    refreshTree() {
        this.updateGroupCounts();
        this.renderDeviceTree();
    }

    // 导入设备
    importDevices() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (Array.isArray(data)) {
                            data.forEach(device => {
                                device.id = Date.now() + Math.random();
                                this.devices.push(device);
                            });
                            this.updateGroupCounts();
                            this.renderDeviceTree();
                            this.renderDeviceTable();
                            alert(`成功导入 ${data.length} 个设备`);
                        }
                    } catch (error) {
                        alert('文件格式错误，请选择正确的JSON文件');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // 导出设备
    exportDevices() {
        const data = JSON.stringify(this.devices, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devices_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
            if (targetPage === '设备管理.html') {
                console.log('当前已在设备管理页面');
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

// 初始化设备管理器
let deviceManager;
document.addEventListener('DOMContentLoaded', () => {
    deviceManager = new DeviceManager();
});

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    const modal = document.getElementById('deviceModal');
    if (e.target === modal) {
        deviceManager.hideDeviceModal();
    }
});
