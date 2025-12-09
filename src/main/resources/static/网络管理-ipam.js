// IP地址管理(IPAM)功能实现

// 全局变量
let currentSubnet = null;
let selectedIPs = new Set();
let networkData = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeIPAM();
    loadNetworkTree();
    loadDashboardData();
});

// 初始化选项卡切换
function initializeTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 切换激活状态
            tabItems.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });
}

// 初始化IPAM功能
function initializeIPAM() {
    // 添加网络按钮
    document.getElementById('addNetworkBtn')?.addEventListener('click', () => {
        openModal('addNetworkModal');
    });
    
    // 扫描网络按钮
    document.getElementById('scanNetworkBtn')?.addEventListener('click', scanNetwork);
    
    // 返回概览按钮
    document.getElementById('backToDashboard')?.addEventListener('click', () => {
        document.getElementById('ipamDashboard').style.display = 'block';
        document.getElementById('ipamDetail').style.display = 'none';
    });
    
    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // IP状态过滤
    document.getElementById('ipStatusFilter')?.addEventListener('change', function() {
        filterIPsByStatus(this.value);
    });
    
    // 全选IP
    document.getElementById('selectAllIPs')?.addEventListener('change', function() {
        toggleSelectAllIPs(this.checked);
    });
    
    // 批量操作按钮
    document.getElementById('batchReserveBtn')?.addEventListener('click', batchReserveIPs);
    document.getElementById('batchTrustBtn')?.addEventListener('click', batchTrustIPs);
    document.getElementById('batchDeleteBtn')?.addEventListener('click', batchDeleteIPs);
    
    // 添加网络表单提交
    document.getElementById('addNetworkForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addNetwork();
    });
}

// 加载网络树
function loadNetworkTree() {
    // 模拟数据
    networkData = [
        {
            id: 1,
            name: '总部网络',
            type: 'root',
            children: [
                {
                    id: 2,
                    name: '核心交换区',
                    type: 'group',
                    children: [
                        {
                            id: 3,
                            name: '服务器网段',
                            network: '192.168.1.0/24',
                            type: 'subnet',
                            used: 45,
                            total: 254
                        },
                        {
                            id: 4,
                            name: '数据库网段',
                            network: '192.168.2.0/24',
                            type: 'subnet',
                            used: 12,
                            total: 254
                        }
                    ]
                },
                {
                    id: 5,
                    name: '办公区',
                    type: 'group',
                    children: [
                        {
                            id: 6,
                            name: '办公网段A',
                            network: '192.168.10.0/24',
                            type: 'subnet',
                            used: 128,
                            total: 254
                        },
                        {
                            id: 7,
                            name: '办公网段B',
                            network: '192.168.11.0/24',
                            type: 'subnet',
                            used: 95,
                            total: 254
                        }
                    ]
                }
            ]
        },
        {
            id: 8,
            name: '分支机构',
            type: 'root',
            children: [
                {
                    id: 9,
                    name: '北京分部',
                    network: '10.1.0.0/16',
                    type: 'subnet',
                    used: 256,
                    total: 65534
                }
            ]
        }
    ];
    
    renderNetworkTree();
}

// 渲染网络树
function renderNetworkTree() {
    const treeContainer = document.getElementById('networkTree');
    treeContainer.innerHTML = '';
    
    networkData.forEach(node => {
        treeContainer.appendChild(createTreeNode(node));
    });
}

// 创建树节点
function createTreeNode(node, level = 0) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.style.marginLeft = `${level * 15}px`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tree-node-content';
    contentDiv.dataset.nodeId = node.id;
    
    // 展开/折叠按钮
    if (node.children && node.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = 'tree-node-toggle';
        toggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTreeNode(nodeDiv);
        });
        contentDiv.appendChild(toggle);
    } else {
        const spacer = document.createElement('span');
        spacer.style.width = '20px';
        spacer.style.display = 'inline-block';
        contentDiv.appendChild(spacer);
    }
    
    // 图标
    const icon = document.createElement('span');
    icon.className = 'tree-node-icon';
    if (node.type === 'root') {
        icon.innerHTML = '<i class="fas fa-building"></i>';
    } else if (node.type === 'group') {
        icon.innerHTML = '<i class="fas fa-folder"></i>';
    } else {
        icon.innerHTML = '<i class="fas fa-network-wired"></i>';
    }
    contentDiv.appendChild(icon);
    
    // 标签
    const label = document.createElement('span');
    label.className = 'tree-node-label';
    label.textContent = node.name;
    if (node.network) {
        label.textContent += ` (${node.network})`;
    }
    contentDiv.appendChild(label);
    
    // 使用率徽章
    if (node.type === 'subnet' && node.total) {
        const badge = document.createElement('span');
        badge.className = 'tree-node-badge';
        const percentage = Math.round((node.used / node.total) * 100);
        badge.textContent = `${percentage}%`;
        contentDiv.appendChild(badge);
    }
    
    // 点击事件
    contentDiv.addEventListener('click', () => {
        selectTreeNode(contentDiv, node);
    });
    
    // 右键菜单
    contentDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, node);
    });
    
    nodeDiv.appendChild(contentDiv);
    
    // 子节点
    if (node.children && node.children.length > 0) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-node-children';
        node.children.forEach(child => {
            childrenDiv.appendChild(createTreeNode(child, level + 1));
        });
        nodeDiv.appendChild(childrenDiv);
    }
    
    return nodeDiv;
}

// 切换树节点展开/折叠
function toggleTreeNode(nodeDiv) {
    const toggle = nodeDiv.querySelector('.tree-node-toggle');
    const children = nodeDiv.querySelector('.tree-node-children');
    
    if (children) {
        if (children.classList.contains('show')) {
            children.classList.remove('show');
            toggle.classList.remove('expanded');
        } else {
            children.classList.add('show');
            toggle.classList.add('expanded');
        }
    }
}

// 选择树节点
function selectTreeNode(contentDiv, node) {
    // 移除其他节点的激活状态
    document.querySelectorAll('.tree-node-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // 激活当前节点
    contentDiv.classList.add('active');
    
    // 如果是子网，显示详情
    if (node.type === 'subnet') {
        currentSubnet = node;
        showSubnetDetail(node);
    }
}

// 显示子网详情
function showSubnetDetail(subnet) {
    document.getElementById('ipamDashboard').style.display = 'none';
    document.getElementById('ipamDetail').style.display = 'block';
    
    // 更新子网信息
    document.getElementById('subnetTitle').textContent = `${subnet.name} (${subnet.network})`;
    document.getElementById('networkAddress').textContent = subnet.network.split('/')[0];
    document.getElementById('subnetMask').textContent = '255.255.255.0';
    document.getElementById('gateway').textContent = subnet.network.split('/')[0].replace(/\d+$/, '1');
    document.getElementById('vlanId').textContent = subnet.vlan || '-';
    document.getElementById('usageRate').textContent = `${Math.round((subnet.used / subnet.total) * 100)}%`;
    
    // 生成IP网格
    generateIPGrid(subnet);
}

// 生成IP网格
function generateIPGrid(subnet) {
    const gridContainer = document.getElementById('ipGrid');
    gridContainer.innerHTML = '';
    
    // 解析网络地址
    const [baseIP, cidr] = subnet.network.split('/');
    const ipParts = baseIP.split('.').map(Number);
    const totalIPs = Math.min(256, subnet.total + 2); // 限制显示数量
    
    // 生成IP单元格
    for (let i = 0; i < totalIPs; i++) {
        const ip = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`;
        const cell = document.createElement('div');
        cell.className = 'ip-cell';
        cell.textContent = i;
        cell.dataset.ip = ip;
        
        // 随机分配状态（实际应从后端获取）
        if (i === 0) {
            cell.classList.add('reserved');
            cell.title = '网络地址';
        } else if (i === 1) {
            cell.classList.add('gateway');
            cell.title = '网关';
        } else if (i === 255) {
            cell.classList.add('reserved');
            cell.title = '广播地址';
        } else if (i <= subnet.used) {
            cell.classList.add('used');
            cell.title = `${ip}\n已使用`;
        } else {
            cell.classList.add('available');
            cell.title = `${ip}\n可用`;
        }
        
        // 点击事件
        cell.addEventListener('click', () => {
            showIPDetail(ip, cell.classList.contains('used'));
        });
        
        gridContainer.appendChild(cell);
    }
    
    // 同时生成列表视图数据
    generateIPList(subnet);
}

// 生成IP列表
function generateIPList(subnet) {
    const tbody = document.getElementById('ipTableBody');
    tbody.innerHTML = '';
    
    const [baseIP, cidr] = subnet.network.split('/');
    const ipParts = baseIP.split('.').map(Number);
    
    // 只显示已使用的IP
    for (let i = 1; i <= subnet.used && i < 50; i++) {
        const ip = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`;
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><input type="checkbox" class="ip-checkbox" data-ip="${ip}"></td>
            <td>${ip}</td>
            <td>00:1A:2B:${i.toString(16).padStart(2, '0')}:${(i*2).toString(16).padStart(2, '0')}:${(i*3).toString(16).padStart(2, '0')}</td>
            <td><span class="status-badge ${i === 1 ? 'reserved' : 'used'}">${i === 1 ? '网关' : '已使用'}</span></td>
            <td>Device-${i}</td>
            <td>Switch-01 Port ${i}</td>
            <td>${new Date(Date.now() - i * 86400000).toLocaleDateString()}</td>
            <td>${new Date(Date.now() - Math.random() * 3600000).toLocaleString()}</td>
            <td>
                <button class="btn-icon" onclick="showIPDetail('${ip}', true)" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editIP('${ip}')" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    }
    
    // 绑定复选框事件
    document.querySelectorAll('.ip-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedIPs);
    });
}

// 切换视图
function switchView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.closest('.view-btn').classList.add('active');
    
    if (view === 'grid') {
        document.getElementById('ipGridView').style.display = 'block';
        document.getElementById('ipListView').style.display = 'none';
    } else {
        document.getElementById('ipGridView').style.display = 'none';
        document.getElementById('ipListView').style.display = 'block';
    }
}

// 显示IP详情
function showIPDetail(ip, isUsed) {
    openModal('ipDetailModal');
    
    document.getElementById('modalIPAddress').textContent = ip;
    document.getElementById('modalMACAddress').textContent = isUsed ? '00:1A:2B:3C:4D:5E' : '-';
    document.getElementById('modalStatus').textContent = isUsed ? '已使用' : '可用';
    document.getElementById('modalDeviceName').textContent = isUsed ? `Device-${ip.split('.')[3]}` : '-';
    document.getElementById('modalSwitchPort').textContent = isUsed ? 'Switch-01 Port 1' : '-';
    document.getElementById('modalFirstSeen').textContent = isUsed ? new Date().toLocaleDateString() : '-';
    document.getElementById('modalLastSeen').textContent = isUsed ? new Date().toLocaleString() : '-';
}

// 更新选中的IP
function updateSelectedIPs() {
    selectedIPs.clear();
    document.querySelectorAll('.ip-checkbox:checked').forEach(checkbox => {
        selectedIPs.add(checkbox.dataset.ip);
    });
    
    const count = selectedIPs.size;
    if (count > 0) {
        document.getElementById('batchActions').style.display = 'flex';
        document.getElementById('selectedCount').textContent = count;
    } else {
        document.getElementById('batchActions').style.display = 'none';
    }
}

// 全选/取消全选
function toggleSelectAllIPs(checked) {
    document.querySelectorAll('.ip-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateSelectedIPs();
}

// 加载仪表盘数据
function loadDashboardData() {
    // 模拟数据
    document.getElementById('availableIPs').textContent = '1,234';
    document.getElementById('usedIPs').textContent = '567';
    document.getElementById('reservedIPs').textContent = '89';
    document.getElementById('conflictIPs').textContent = '3';
    
    // 加载图表
    loadIPUsageChart();
    loadSubnetUsageChart();
    loadConflictList();
    loadNewIPList();
}

// 加载IP使用率图表
function loadIPUsageChart() {
    // 这里应该使用Chart.js或ECharts
    console.log('加载IP使用率图表');
}

// 加载子网利用率图表
function loadSubnetUsageChart() {
    console.log('加载子网利用率图表');
}

// 加载冲突列表
function loadConflictList() {
    const list = document.getElementById('conflictList');
    // 模拟数据
    const conflicts = [
        { ip: '192.168.1.100', time: '2小时前', message: 'IP冲突：MAC地址不匹配' },
        { ip: '192.168.1.150', time: '5小时前', message: 'IP冲突：重复分配' }
    ];
    
    if (conflicts.length === 0) {
        list.innerHTML = '<div class="empty-message">暂无冲突记录</div>';
    } else {
        list.innerHTML = conflicts.map(c => `
            <div class="alert-item">
                <div class="alert-item-time">${c.time}</div>
                <div class="alert-item-content">${c.ip} - ${c.message}</div>
            </div>
        `).join('');
    }
}

// 加载新发现IP列表
function loadNewIPList() {
    const list = document.getElementById('newIPList');
    // 模拟数据
    const newIPs = [
        { ip: '192.168.1.200', time: '1小时前', device: '未知设备' },
        { ip: '192.168.1.201', time: '3小时前', device: '未知设备' }
    ];
    
    if (newIPs.length === 0) {
        list.innerHTML = '<div class="empty-message">暂无新发现IP</div>';
    } else {
        list.innerHTML = newIPs.map(n => `
            <div class="alert-item" style="border-color: #FF9800; background: #fff8e1;">
                <div class="alert-item-time">${n.time}</div>
                <div class="alert-item-content">${n.ip} - ${n.device}</div>
            </div>
        `).join('');
    }
}

// 扫描网络
function scanNetwork() {
    console.log('开始扫描网络...');
    // 显示加载提示
    alert('网络扫描功能开发中...');
}

// 添加网络
function addNetwork() {
    const formData = new FormData(document.getElementById('addNetworkForm'));
    const data = Object.fromEntries(formData);
    
    console.log('添加网络:', data);
    
    // 这里应该调用API
    alert('网络添加成功！');
    closeModal('addNetworkModal');
    
    // 重新加载网络树
    loadNetworkTree();
}

// 批量预留IP
function batchReserveIPs() {
    console.log('批量预留IP:', Array.from(selectedIPs));
    alert(`已预留 ${selectedIPs.size} 个IP地址`);
}

// 批量标记信任
function batchTrustIPs() {
    console.log('批量标记信任:', Array.from(selectedIPs));
    alert(`已标记 ${selectedIPs.size} 个IP为信任设备`);
}

// 批量删除IP
function batchDeleteIPs() {
    if (confirm(`确定要删除选中的 ${selectedIPs.size} 个IP吗？`)) {
        console.log('批量删除IP:', Array.from(selectedIPs));
        alert('删除成功！');
        selectedIPs.clear();
        updateSelectedIPs();
    }
}

// 显示右键菜单
function showContextMenu(event, node) {
    // 移除已存在的菜单
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    const menuItems = [
        { icon: 'fa-plus', text: '新增子网', action: () => console.log('新增子网', node) },
        { icon: 'fa-search', text: '扫描子网', action: () => console.log('扫描子网', node) },
        { divider: true },
        { icon: 'fa-edit', text: '重命名', action: () => console.log('重命名', node) },
        { icon: 'fa-trash', text: '删除', action: () => console.log('删除', node) }
    ];
    
    menuItems.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('div');
            divider.className = 'context-menu-divider';
            menu.appendChild(divider);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>`;
            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });
            menu.appendChild(menuItem);
        }
    });
    
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
}

// 模态框操作
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 导出函数供HTML使用
window.showIPDetail = showIPDetail;
window.editIP = function(ip) {
    console.log('编辑IP:', ip);
    alert('编辑功能开发中...');
};
window.closeModal = closeModal;
