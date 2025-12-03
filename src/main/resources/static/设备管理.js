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

    async init() {
        this.initializeData();
        this.bindEvents();
        this.initLocationCascade(); // 初始化位置级联选择事件监听
        
        // 先加载分组数据，再加载设备数据，确保正确的顺序
        await this.loadDeviceGroupsFromAPI();
        await this.loadDevicesFromAPI(); // 这个方法内部会调用 updateGroupCounts, renderDeviceTree 和 renderDeviceTable
        
        // 检查URL参数，如果有selectGroup参数，自动选中对应分组
        this.handleUrlParameters();
        
        console.log('页面初始化完成');
    }

    // 处理URL参数
    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const selectGroup = urlParams.get('selectGroup') || urlParams.get('groupId'); // 支持两种参数名
        const groupType = urlParams.get('groupType');
        const groupName = urlParams.get('groupName'); // 获取分组名称
        const deviceId = urlParams.get('deviceId');
        
        if (selectGroup) {
            console.log('从URL参数选中分组:', selectGroup, groupType, groupName);
            console.log('当前设备分组数据:', this.deviceGroups);
            
            // 如果有分组名称，显示提示信息
            if (groupName) {
                console.log(`正在加载 ${groupName} 分组的设备...`);
            }
            
            // 延迟执行，确保DOM已渲染
            setTimeout(() => {
                // 先检查分组是否存在
                const groupExists = this.findGroupById(selectGroup);
                console.log('查找分组结果:', groupExists);
                
                if (groupExists) {
                    this.selectGroupById(selectGroup, groupType || 'parent');
                } else {
                    console.warn('未找到分组ID:', selectGroup, '尝试更长延迟...');
                    // 如果没找到，再延迟一次
                    setTimeout(() => {
                        this.selectGroupById(selectGroup, groupType || 'parent');
                    }, 500);
                }
                
                // 如果有deviceId参数，进一步高亮显示特定设备
                if (deviceId) {
                    setTimeout(() => {
                        this.highlightDevice(deviceId);
                    }, 800);
                }
            }, 500);
        } else if (deviceId) {
            // 只有deviceId参数，不选中分组，只高亮显示设备
            console.log('从URL参数高亮设备:', deviceId);
            setTimeout(() => {
                this.highlightDevice(deviceId);
            }, 500);
        }
    }
    
    // 查找分组
    findGroupById(groupId) {
        const id = parseInt(groupId);
        for (const group of this.deviceGroups) {
            if (group.id === id) {
                return { group, type: 'parent' };
            }
            if (group.children) {
                for (const child of group.children) {
                    if (child.id === id) {
                        return { group: child, type: 'child', parent: group };
                    }
                }
            }
        }
        return null;
    }

    // 根据ID选中分组
    selectGroupById(groupId, groupType) {
        console.log('根据ID选中分组:', groupId, groupType);
        
        // 先查找分组信息，确定它是父分组还是子分组
        const groupInfo = this.findGroupById(groupId);
        console.log('分组信息:', groupInfo);
        
        // 查找对应的DOM元素
        const nodeContent = document.querySelector(`[data-node-id="${groupId}"]`);
        if (nodeContent) {
            // 如果是子分组，需要先展开其父分组
            if (groupInfo && groupInfo.type === 'child') {
                console.log('这是子分组，需要展开父分组:', groupInfo.parent.name);
                this.expandParentGroup(nodeContent);
            }
            // 如果是父分组，先展开它（如果有子节点）
            else if (groupInfo && groupInfo.type === 'parent') {
                console.log('这是父分组，检查是否有子节点需要展开');
                const parentNode = nodeContent.closest('.tree-node');
                if (parentNode) {
                    const toggle = parentNode.querySelector('.tree-node-toggle');
                    const children = parentNode.querySelector('.tree-node-children');
                    
                    // 展开父分组
                    if (toggle && children) {
                        toggle.classList.add('expanded');
                        children.classList.add('expanded');
                        children.style.display = 'block'; // 确保显示
                        console.log('展开父分组:', groupId, groupInfo.group.name);
                    } else {
                        console.log('父分组没有子节点或toggle元素');
                    }
                }
            }
            
            // 选中分组
            this.selectTreeNode(nodeContent);
            
            // 滚动到选中的节点
            setTimeout(() => {
                nodeContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            
            console.log('成功选中分组:', groupId);
        } else {
            console.warn('未找到分组节点DOM:', groupId);
            console.log('可用的所有节点:', document.querySelectorAll('[data-node-id]'));
            
            // 如果没找到，尝试延迟再次查找（DOM可能还没渲染完成）
            setTimeout(() => {
                const retryNodeContent = document.querySelector(`[data-node-id="${groupId}"]`);
                if (retryNodeContent) {
                    console.log('延迟重试成功找到分组节点');
                    this.selectGroupById(groupId, groupType);
                } else {
                    console.error('重试后仍未找到分组节点，groupId:', groupId);
                }
            }, 300);
        }
    }

    // 展开父分组
    expandParentGroup(childNodeContent) {
        // 查找父分组节点
        const childNode = childNodeContent.closest('.tree-node');
        const parentContainer = childNode?.closest('.tree-node-children');
        const parentNode = parentContainer?.closest('.tree-node');
        
        if (parentNode) {
            const toggle = parentNode.querySelector('.tree-node-toggle');
            const children = parentNode.querySelector('.tree-node-children');
            const parentNodeContent = parentNode.querySelector('.tree-node-content');
            const parentGroupId = parentNodeContent?.getAttribute('data-node-id');
            
            // 展开父分组
            if (toggle && children) {
                toggle.classList.add('expanded');
                children.classList.add('expanded');
                children.style.display = 'block'; // 确保显示
                console.log('展开父分组以显示子分组:', parentGroupId);
                
                // 添加展开动画效果
                children.style.maxHeight = children.scrollHeight + 'px';
                
                // 如果父分组还有父分组，递归展开
                const grandParentContainer = parentNode.closest('.tree-node-children');
                const grandParentNode = grandParentContainer?.closest('.tree-node');
                if (grandParentNode) {
                    this.expandParentGroup(parentNodeContent);
                }
            }
        }
    }

    // 高亮显示特定设备
    highlightDevice(deviceId) {
        console.log('高亮显示设备:', deviceId);
        
        // 查找设备行
        const deviceRow = document.querySelector(`tr[data-device-id="${deviceId}"]`);
        if (deviceRow) {
            // 添加高亮样式
            deviceRow.classList.add('highlight-device');
            
            // 滚动到设备行
            deviceRow.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // 3秒后移除高亮
            setTimeout(() => {
                deviceRow.classList.remove('highlight-device');
            }, 3000);
            
            console.log('成功高亮设备:', deviceId);
        } else {
            console.warn('未找到设备行:', deviceId);
        }
    }

    // 从后端API加载设备数据（从资产表）
    async loadDevicesFromAPI() {
        try {
            // 修改为从资产表获取设备数据，只获取三类设备（排除视频管理设备）
            const response = await fetch('/api/asset/list?deviceManagementOnly=true');
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                // 将Asset数据转换为设备管理页面需要的格式
                this.devices = result.data.map(asset => ({
                    id: asset.id,
                    name: asset.deviceName || asset.assetName,
                    ip: asset.ipAddress || '',
                    status: asset.assetStatus || 'offline',
                    type: this.getDeviceTypeFromCategory(asset.categoryId),
                    groupId: asset.categoryId,
                    location: asset.location || '',
                    description: asset.description || '',
                    serialNumber: asset.serialNumber || '',
                    lastUpdate: asset.updateTime || asset.createTime,
                    createTime: asset.createTime
                }));
                
                // 调试：打印设备数据结构
                console.log('从资产表加载的设备数据:', this.devices);
                if (this.devices.length > 0) {
                    console.log('第一个设备的结构:', this.devices[0]);
                }
                
                this.updateGroupCounts();
                this.renderDeviceTree();
                this.renderDeviceTable();
            }
        } catch (error) {
            console.log('无法连接到后端API，使用本地示例数据');
            console.error('错误详情:', error);
            // 即使API失败，也要渲染界面
            this.renderDeviceTree();
            this.renderDeviceTable();
        }
    }

    // 从后端加载设备分组（从资产分类）
    async loadDeviceGroupsFromAPI() {
        try {
            // 修改为从资产分类获取设备分组数据（过滤掉视频管理）
            const response = await fetch('/api/asset/category/device-tree');
            const result = await response.json();
            
            if (result.code === 200 && result.data && result.data.length > 0) {
                console.log('从资产分类加载的分组数据:', result.data);
                this.deviceGroups = this.transformGroupData(result.data);
                console.log('转换后的分组数据:', this.deviceGroups);
            } else {
                console.log('API返回空数据，使用默认分组数据');
                this.deviceGroups = this.getDefaultDeviceGroups();
                console.log('使用默认分组数据:', this.deviceGroups);
            }
        } catch (error) {
            console.log('无法连接到后端API，使用默认分组数据');
            console.error('错误详情:', error);
            this.deviceGroups = this.getDefaultDeviceGroups();
        }
    }

    // 获取默认的设备分组数据
    getDefaultDeviceGroups() {
        return [
            {
                id: 1,
                name: '服务器',
                parentId: null,
                level: 1,
                type: 'server',
                icon: 'fas fa-server',
                children: [
                    { id: 11, name: 'Web服务器', parentId: 1, level: 2, type: 'server', icon: 'fas fa-globe' },
                    { id: 12, name: '数据库服务器', parentId: 1, level: 2, type: 'server', icon: 'fas fa-database' },
                    { id: 13, name: '应用服务器', parentId: 1, level: 2, type: 'server', icon: 'fas fa-cogs' }
                ]
            },
            {
                id: 2,
                name: '网络设备',
                parentId: null,
                level: 1,
                type: 'network',
                icon: 'fas fa-network-wired',
                children: [
                    { id: 21, name: '交换机', parentId: 2, level: 2, type: 'network', icon: 'fas fa-project-diagram' },
                    { id: 22, name: '路由器', parentId: 2, level: 2, type: 'network', icon: 'fas fa-route' },
                    { id: 23, name: '防火墙', parentId: 2, level: 2, type: 'network', icon: 'fas fa-shield-alt' }
                ]
            },
            {
                id: 3,
                name: '存储设备',
                parentId: null,
                level: 1,
                type: 'storage',
                icon: 'fas fa-hdd',
                children: [
                    { id: 31, name: 'NAS存储', parentId: 3, level: 2, type: 'storage', icon: 'fas fa-archive' },
                    { id: 32, name: 'SAN存储', parentId: 3, level: 2, type: 'storage', icon: 'fas fa-server' }
                ]
            }
        ];
    }

    // 转换后端分组数据格式
    transformGroupData(groups) {
        const iconMap = {
            '服务器': 'fas fa-server',
            'Web服务器': 'fas fa-globe',
            '数据库服务器': 'fas fa-database',
            '应用服务器': 'fas fa-cogs',
            '网络设备': 'fas fa-network-wired',
            '交换机': 'fas fa-project-diagram',
            '路由器': 'fas fa-route',
            '防火墙': 'fas fa-shield-alt',
            '无线AP': 'fas fa-wifi',
            '网关': 'fas fa-door-open',
            '存储设备': 'fas fa-hdd',
            'NAS存储': 'fas fa-archive',
            'SAN存储': 'fas fa-server'
        };

        return groups.map(group => ({
            id: group.id,
            name: group.categoryName || group.name,
            icon: iconMap[group.categoryName || group.name] || group.icon || 'fas fa-folder',
            children: group.children ? group.children.map(child => ({
                id: child.id,
                name: child.categoryName || child.name,
                icon: iconMap[child.categoryName || child.name] || child.icon || 'fas fa-file',
                count: child.count || child.deviceCount || 0
            })) : [],
            count: group.count || group.deviceCount || 0
        }));
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
                    { id: 'firewalls', name: '防火墙', icon: 'fas fa-shield-alt', count: 0 },
                    { id: 'wireless-ap', name: '无线AP', icon: 'fas fa-wifi', count: 0 },
                    { id: 'gateways', name: '网关', icon: 'fas fa-door-open', count: 0 }
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

        // 初始化为空数组，数据将从后端API加载
        this.devices = [];

        // 不在初始化时更新计数，等待数据加载完成后再更新
    }

    // 更新分组设备计数
    updateGroupCounts() {
        console.log('开始更新分组计数，设备总数:', this.devices.length);
        
        // 调试：打印所有设备的类型信息
        console.log('=== 设备类型分析 ===');
        this.devices.forEach((device, index) => {
            console.log(`设备 ${index + 1}: ${device.name}`);
            console.log(`  - type: "${device.type}"`);
            console.log(`  - groupId: ${device.groupId} (类型: ${typeof device.groupId})`);
        });
        console.log('=== 分组结构分析 ===');
        this.deviceGroups.forEach(group => {
            console.log(`分组: ${group.name} (ID: ${group.id})`);
            if (group.children) {
                group.children.forEach(child => {
                    console.log(`  子分组: ${child.name} (ID: ${child.id})`);
                });
            }
        });
        console.log('=== 开始分组匹配 ===');

        this.deviceGroups.forEach(group => {
            if (group.children) {
                group.children.forEach(child => {
                    // 计算该子分组的设备数量 - 使用数字ID匹配
                    child.count = this.devices.filter(device => {
                        // 直接匹配数字分组ID（优先级最高）
                        if (device.groupId === child.id) {
                            console.log(`✓ 设备 ${device.name} 直接匹配分组 ${child.name} (ID: ${child.id})`);
                            return true;
                        }
                        
                        // 只有当设备没有groupId时，才根据类型进行智能分组（防止重复计数）
                        if (device.groupId !== undefined && device.groupId !== null) {
                            return false;
                        }
                        
                        const deviceType = device.type;
                        let typeMatch = false;
                        
                        // 精确匹配分组名称（避免重复计数）
                        if (child.name === 'Web服务器' && deviceType === 'server') {
                            typeMatch = true;
                        } else if (child.name === '交换机' && deviceType === 'switch') {
                            typeMatch = true;
                        } else if (child.name === '路由器' && deviceType === 'router') {
                            typeMatch = true;
                        } else if (child.name === '防火墙' && deviceType === 'network') {
                            typeMatch = true;
                        } else if (child.name === '无线AP' && deviceType === 'wireless-ap') {
                            typeMatch = true;
                        } else if (child.name === '网关' && deviceType === 'gateway') {
                            typeMatch = true;
                        } else if (child.name === 'NAS存储' && deviceType === 'storage') {
                            typeMatch = true;
                        }
                        
                        if (typeMatch) {
                            console.log(`✓ 设备 ${device.name} (${deviceType}) 类型匹配分组 ${child.name}`);
                        }
                        
                        return typeMatch;
                    }).length;
                    
                    console.log(`分组 ${child.name}: ${child.count} 台设备`);
                });
                
                // 更新父分组的总数
                group.count = group.children.reduce((sum, child) => sum + child.count, 0);
                console.log(`父分组 ${group.name} 总计: ${group.count} 台设备`);
            }
        });
        
        console.log('分组计数更新完成');
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
            console.log(`筛选分组: ${this.selectedGroup}, 类型: ${this.selectedGroupType}`);
            
            const selectedGroupId = parseInt(this.selectedGroup);
            
            if (this.selectedGroupType === 'parent') {
                // 父分组：显示该大类下所有子分组的设备
                console.log('父分组筛选：显示所有子分组的设备');
                
                // 获取父分组信息
                const parentGroup = this.deviceGroups.find(group => group.id == selectedGroupId);
                if (parentGroup && parentGroup.children) {
                    console.log(`父分组 ${parentGroup.name} 包含 ${parentGroup.children.length} 个子分组`);
                    
                    // 获取所有子分组的ID
                    const childGroupIds = parentGroup.children.map(child => child.id);
                    console.log('子分组IDs:', childGroupIds);
                    
                    filteredDevices = filteredDevices.filter(device => {
                        // 直接匹配任一子分组ID
                        const directMatch = childGroupIds.includes(device.groupId);
                        if (directMatch) {
                            console.log(`✓ 设备 ${device.name} 匹配子分组ID ${device.groupId}`);
                            return true;
                        }
                        
                        // 根据设备类型匹配（针对没有groupId的设备）
                        if (device.groupId === undefined || device.groupId === null) {
                            const deviceType = device.type;
                            let typeMatch = false;
                            
                            // 根据父分组名称进行类型匹配
                            if (parentGroup.name === '服务器' && deviceType === 'server') {
                                typeMatch = true;
                            } else if (parentGroup.name === '网络设备' && deviceType === 'network') {
                                typeMatch = true;
                            } else if (parentGroup.name === '存储设备' && deviceType === 'storage') {
                                typeMatch = true;
                            }
                            
                            if (typeMatch) {
                                console.log(`✓ 设备 ${device.name} (${deviceType}) 类型匹配父分组 ${parentGroup.name}`);
                            }
                            
                            return typeMatch;
                        }
                        
                        return false;
                    });
                }
            } else {
                // 子分组：只显示该子分组的设备
                console.log('子分组筛选：显示特定子分组的设备');
                
                filteredDevices = filteredDevices.filter(device => {
                    // 直接匹配数字分组ID（优先级最高）
                    const directMatch = device.groupId === selectedGroupId;
                    if (directMatch) {
                        console.log(`✓ 设备 ${device.name} 直接匹配分组ID ${selectedGroupId}`);
                        return true;
                    }
                    
                    // 根据设备类型和分组名称进行智能匹配（针对没有groupId的设备）
                    if (device.groupId === undefined || device.groupId === null) {
                        const deviceType = device.type;
                        
                        // 获取分组名称
                        let groupName = '';
                        this.deviceGroups.forEach(group => {
                            if (group.children) {
                                group.children.forEach(child => {
                                    if (child.id == this.selectedGroup) {
                                        groupName = child.name;
                                    }
                                });
                            }
                        });
                        
                        // 精确的智能类型匹配
                        let typeMatch = false;
                        if (groupName === 'Web服务器' && deviceType === 'server') {
                            typeMatch = true;
                        } else if (groupName === '交换机' && deviceType === 'switch') {
                            typeMatch = true;
                        } else if (groupName === '路由器' && deviceType === 'router') {
                            typeMatch = true;
                        } else if (groupName === '防火墙' && deviceType === 'network') {
                            typeMatch = true;
                        } else if (groupName === '无线AP' && deviceType === 'wireless-ap') {
                            typeMatch = true;
                        } else if (groupName === '网关' && deviceType === 'gateway') {
                            typeMatch = true;
                        } else if (groupName === 'NAS存储' && deviceType === 'storage') {
                            typeMatch = true;
                        }
                        
                        if (typeMatch) {
                            console.log(`✓ 设备 ${device.name} (${deviceType}) 类型匹配分组 ${groupName}`);
                        }
                        
                        return typeMatch;
                    }
                    
                    return false;
                });
            }
            
            console.log(`筛选结果: ${filteredDevices.length} 台设备`);
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
            row.setAttribute('data-device-id', device.id);
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
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetDeviceForm();
        });

        // 设备类型选择事件
        document.getElementById('deviceType').addEventListener('change', (e) => {
            this.populateGroupOptions(e.target.value);
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
        // 获取节点信息
        const nodeId = content.dataset.nodeId;
        const labelElement = content.querySelector('.tree-node-label');
        const groupName = labelElement ? labelElement.textContent : '未知分组';
        
        console.log(`点击分组: ${groupName} (ID: ${nodeId})`);
        
        // 检查是否为父分组（服务器、网络设备、存储设备）
        const isParentGroup = this.isParentGroup(nodeId, groupName);
        
        if (isParentGroup) {
            console.log(`${groupName} 是父分组，显示该大类下所有子分组的设备`);
            // 父分组更新选中状态，并显示所有子分组的设备
            document.querySelectorAll('.tree-node-content.selected').forEach(node => {
                node.classList.remove('selected');
            });
            content.classList.add('selected');
            
            // 设置为父分组ID，用于筛选该大类下的所有设备
            this.selectedGroup = nodeId;
            this.selectedGroupType = 'parent'; // 标记为父分组
            this.currentPage = 1;
            this.renderDeviceTable();
            return;
        }
        
        // 子分组正常处理
        console.log(`${groupName} 是子分组，显示对应设备`);
        
        // 移除之前的选中状态
        document.querySelectorAll('.tree-node-content.selected').forEach(node => {
            node.classList.remove('selected');
        });

        // 添加选中状态
        content.classList.add('selected');
        
        // 设置选中的分组
        this.selectedGroup = nodeId;
        this.selectedGroupType = 'child'; // 标记为子分组
        
        console.log('当前设备总数:', this.devices.length);
        
        this.currentPage = 1;
        this.renderDeviceTable();
    }

    // 判断是否为父分组
    isParentGroup(nodeId, groupName) {
        // 根据分组名称判断
        const parentGroupNames = ['服务器', '网络设备', '存储设备'];
        if (parentGroupNames.includes(groupName)) {
            return true;
        }
        
        // 根据分组结构判断（检查是否有子分组）
        for (const group of this.deviceGroups) {
            if (group.id == nodeId && group.children && group.children.length > 0) {
                console.log(`分组 ${groupName} 有 ${group.children.length} 个子分组，判定为父分组`);
                return true;
            }
        }
        
        return false;
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

        if (device) {
            title.textContent = '编辑设备';
            // 初始化U位列表，然后填充设备表单
            this.initUPositions();
            this.fillDeviceForm(device);
        } else {
            title.textContent = '添加设备';
            form.reset();
            // 添加设备时，清空分组选项，等待用户选择设备类型
            this.populateGroupOptions();
            // 初始化U位列表
            this.initUPositions();
        }

        modal.style.display = 'block';
    }

    // 根据category_id获取设备类型
    getCategoryTypeFromId(categoryId) {
        if (!categoryId) return '';
        
        // 根据category_id范围判断设备类型
        // 服务器类: 5-7 (Web服务器、数据库服务器、应用服务器)
        if (categoryId >= 5 && categoryId <= 7) {
            return 'server';
        }
        // 网络设备类: 8-12 (交换机、路由器、防火墙、无线AP、网关)
        else if (categoryId >= 8 && categoryId <= 12) {
            return 'network';
        }
        // 存储设备类: 13-14 (NAS存储、SAN存储)
        else if (categoryId >= 13 && categoryId <= 14) {
            return 'storage';
        }
        
        return '';
    }

    // 填充设备分组选项
    populateGroupOptions(deviceType = null) {
        const groupSelect = document.getElementById('deviceGroup');
        
        if (!deviceType) {
            groupSelect.innerHTML = '<option value="">请先选择设备类型</option>';
            return;
        }
        
        groupSelect.innerHTML = '<option value="">请选择设备分组</option>';
        
        console.log('选择的设备类型:', deviceType);
        console.log('当前分组数据:', this.deviceGroups);

        // 根据设备类型过滤分组
        this.deviceGroups.forEach(group => {
            console.log(`检查分组: ${group.name} (ID: ${group.id})`);
            
            let shouldInclude = false;
            
            // 根据分组名称匹配设备类型
            if (deviceType === 'server' && group.name === '服务器') {
                shouldInclude = true;
            } else if (deviceType === 'network' && group.name === '网络设备') {
                shouldInclude = true;
            } else if (deviceType === 'storage' && group.name === '存储设备') {
                shouldInclude = true;
            }
            
            if (shouldInclude && group.children) {
                console.log(`添加 ${group.name} 的子分组:`, group.children);
                group.children.forEach(child => {
                    const option = document.createElement('option');
                    option.value = child.id;
                    option.textContent = child.name;
                    groupSelect.appendChild(option);
                });
            }
        });
        
        console.log('分组选项已更新');
    }

    // 隐藏设备模态框
    hideDeviceModal() {
        document.getElementById('deviceModal').style.display = 'none';
        this.editingDevice = null;
    }

    // 填充设备表单
    fillDeviceForm(device) {
        // 基本信息
        document.getElementById('assetCode').value = device.assetCode || '';
        document.getElementById('assetName').value = device.assetName || device.name || '';
        document.getElementById('deviceName').value = device.name || '';
        document.getElementById('deviceIP').value = device.ip || '';
        document.getElementById('macAddress').value = device.macAddress || '';
        document.getElementById('serialNumber').value = device.serialNumber || '';
        
        // 分类信息 - 将category_id或groupId转换为设备类型
        const categoryId = device.categoryId || device.groupId;
        const deviceType = this.getCategoryTypeFromId(categoryId);
        document.getElementById('deviceType').value = deviceType;
        
        console.log('设备分类信息:', {
            categoryId: categoryId,
            deviceType: deviceType,
            originalType: device.type
        });
        
        // 根据设备类型填充分组选项
        this.populateGroupOptions(deviceType);
        
        // 设置设备分组（使用categoryId或groupId）
        document.getElementById('deviceGroup').value = categoryId || '';
        
        // 状态信息（使用assetStatus字段）
        document.getElementById('assetStatus').value = device.assetStatus || device.status || 'offline';
        
        // 位置信息 - 解析location字符串并设置级联选择
        const location = device.location || '';
        document.getElementById('location').value = location;
        
        if (location) {
            // 解析位置字符串：如 "主机房-机柜A1-U05"
            this.parseAndSetLocation(location);
        }
        
        // 其他信息
        document.getElementById('tags').value = device.tags || '';
        document.getElementById('deviceDescription').value = device.description || '';
        
        console.log('填充设备表单:', {
            name: device.name,
            type: device.type,
            groupId: device.groupId,
            group: device.group
        });
    }

    // 保存设备
    async saveDevice() {
        const form = document.getElementById('deviceForm');
        const formData = new FormData(form);

        // 验证必填字段
        if (!formData.get('assetName') || !formData.get('deviceName') || !formData.get('deviceType') || !formData.get('deviceGroup') || !formData.get('assetStatus')) {
            alert('请填写所有必填字段（资产名称、设备名称、设备类型、设备分组、设备状态）');
            return;
        }

        // 构建设备数据对象（映射到Asset实体）
        const deviceData = {
            // 基本信息
            assetCode: formData.get('assetCode') || this.generateAssetCode(),
            assetName: formData.get('assetName'),
            deviceName: formData.get('deviceName'),
            ipAddress: formData.get('deviceIP') || null,
            macAddress: formData.get('macAddress') || null,
            serialNumber: formData.get('serialNumber') || null,
            
            // 分类信息
            categoryId: parseInt(formData.get('deviceGroup')),
            
            // 状态信息
            assetStatus: formData.get('assetStatus') || 'offline',
            
            // 位置信息
            location: formData.get('location') || null,
            
            // 其他信息
            tags: formData.get('tags') || null,
            description: formData.get('deviceDescription') || null
        };

        try {
            if (this.editingDevice) {
                // 编辑模式 - 更新设备
                deviceData.id = this.editingDevice.id;
                
                console.log('更新设备数据:', deviceData);
                
                const response = await fetch(`/api/asset/${this.editingDevice.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deviceData)
                });

                const result = await response.json();
                
                if (response.ok && result.code === 200) {
                    // 更新成功，重新加载设备列表
                    await this.loadDevicesFromAPI();
                    alert('设备更新成功');
                } else {
                    const errorMsg = result.message || result.msg || '更新失败';
                    alert('更新失败: ' + errorMsg);
                    return;
                }
            } else {
                // 添加模式 - 新增设备
                console.log('添加设备数据:', deviceData);
                
                const response = await fetch('/api/asset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deviceData)
                });

                const result = await response.json();
                
                if (response.ok && result.code === 200) {
                    // 添加成功，重新加载设备列表
                    await this.loadDevicesFromAPI();
                    alert('设备添加成功');
                } else {
                    const errorMsg = result.message || result.msg || '添加失败';
                    alert('添加失败: ' + errorMsg);
                    return;
                }
            }

            // 关闭模态框（loadDevicesFromAPI会自动更新列表和分组计数）
            this.hideDeviceModal();
            
        } catch (error) {
            console.error('保存设备失败:', error);
            alert('保存设备失败：' + error.message);
        }
    }

    // 编辑设备
    editDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            this.showDeviceModal(device);
        }
    }

    // 删除设备
    async deleteDevice(deviceId) {
        if (!confirm('确定要删除这个设备吗？')) {
            return;
        }
        
        try {
            console.log('=== 开始删除设备 ===');
            console.log('删除设备 ID:', deviceId);
            console.log('删除前设备总数:', this.devices.length);
            
            const response = await fetch(`/api/device/${deviceId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            console.log('删除响应:', result);
            
            if (response.ok && result.code === 200) {
                console.log('删除成功，重新加载设备列表...');
                
                // 重新加载设备列表
                await this.loadDevicesFromAPI();
                
                console.log('重新加载后设备总数:', this.devices.length);
                console.log('=== 删除完成 ===');
                
                alert('设备删除成功');
            } else {
                const errorMsg = result.message || result.msg || '删除失败';
                console.error('删除失败:', errorMsg);
                alert('删除失败: ' + errorMsg);
            }
        } catch (error) {
            console.error('删除设备失败:', error);
            alert('删除设备失败: ' + error.message);
        }
    }

    // 获取设备类型文本
    getDeviceTypeText(type) {
        const types = {
            // 大类（兼容旧数据）
            'server': '服务器',
            'network': '网络设备',
            'storage': '存储设备',
            
            // 服务器子类型
            'web-server': 'Web服务器',
            'database-server': '数据库服务器',
            'app-server': '应用服务器',
            
            // 网络设备子类型
            'switch': '交换机',
            'router': '路由器',
            'firewall': '防火墙',
            'wireless-ap': '无线AP',
            'gateway': '网关',
            
            // 存储设备子类型
            'nas-storage': 'NAS存储',
            'san-storage': 'SAN存储'
        };
        return types[type] || type;
    }

    // 获取状态文本
    getStatusText(status) {
        const statuses = {
            'online': '在线',
            'running': '在线',
            'offline': '离线',
            'stopped': '离线',
            'maintenance': '维护中',
            'warning': '维护中',
            'fault': '故障'
        };
        return statuses[status] || status;
    }

    // 生成资产编号
    generateAssetCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        
        return `AST-${year}${month}${day}-${hour}${minute}${second}`;
    }

    // 根据分类ID获取设备类型
    getDeviceTypeFromCategory(categoryId) {
        if (!categoryId) return 'unknown';
        
        // 根据分类ID映射到具体的设备子类型
        switch (parseInt(categoryId)) {
            // 服务器类型
            case 5: // Web服务器
                return 'web-server';
            case 6: // 数据库服务器
                return 'database-server';
            case 7: // 应用服务器
                return 'app-server';
            
            // 网络设备类型 - 返回具体子类型
            case 8: // 交换机
                return 'switch';
            case 9: // 路由器
                return 'router';
            case 10: // 防火墙
                return 'firewall';
            case 11: // 无线AP
                return 'wireless-ap';
            case 12: // 网关
                return 'gateway';
            
            // 存储设备类型
            case 13: // NAS存储
                return 'nas-storage';
            case 14: // SAN存储
                return 'san-storage';
            
            default:
                return 'unknown';
        }
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
        console.log('刷新分组树和设备列表');
        
        // 清除选中的分组，显示所有设备
        this.selectedGroup = null;
        this.selectedGroupType = null;
        
        // 移除所有选中状态
        document.querySelectorAll('.tree-node-content.selected').forEach(node => {
            node.classList.remove('selected');
        });
        
        // 更新分组计数
        this.updateGroupCounts();
        
        // 重新渲染分组树
        this.renderDeviceTree();
        
        // 重新渲染设备表格（显示所有设备）
        this.renderDeviceTable();
        
        console.log('刷新完成，显示所有设备');
    }

    // 导入设备
    importDevices() {
        console.log('📂 导入设备功能被调用');
        
        // 保存this引用
        const self = this;
        
        // 创建隐藏的文件输入框
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.style.display = 'none';
        
        // 必须将元素添加到DOM才能在某些浏览器中正常工作
        document.body.appendChild(input);
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            console.log('📄 选择的文件:', file ? file.name : '无');
            
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    console.log('📤 开始上传文件...');
                    const response = await fetch('/api/device/import', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    console.log('📥 服务器响应:', result);
                    
                    if (result.code === 200) {
                        const data = result.data;
                        alert(`导入完成！\n成功：${data.successCount} 条\n失败：${data.failCount} 条`);
                        if (data.errors && data.errors.length > 0) {
                            console.log('导入错误详情:', data.errors);
                        }
                        // 重新加载设备列表
                        self.loadDevicesFromAsset();
                    } else {
                        alert('导入失败：' + result.message);
                    }
                } catch (error) {
                    console.error('导入失败:', error);
                    alert('导入失败：' + error.message);
                }
            }
            
            // 清理：移除临时的input元素
            document.body.removeChild(input);
        };
        
        // 触发文件选择对话框
        console.log('🔘 触发文件选择对话框...');
        input.click();
    }

    // 导出设备（调用后端API下载Excel）
    exportDevices() {
        window.location.href = '/api/device/export';
    }
    
    // 下载导入模板
    downloadTemplate() {
        window.location.href = '/api/device/template';
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
            '数字大屏': '大屏展示.html',
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

    // 重置表单
    resetDeviceForm() {
        const form = document.getElementById('deviceForm');
        form.reset();
        
        // 重置分组选项
        this.populateGroupOptions();
        
        // 设置默认值
        document.getElementById('assetStatus').value = 'offline';
        
        console.log('表单已重置');
    }
    
    // 初始化位置级联选择
    initLocationCascade() {
        console.log('🏢 初始化位置选择事件监听');
        
        const cabinetSelect = document.getElementById('cabinetSelect');
        const uPositionSelect = document.getElementById('uPositionSelect');
        const locationInput = document.getElementById('location');
        
        if (!cabinetSelect || !uPositionSelect) {
            console.error('位置选择元素未找到');
            return;
        }
        
        // 机柜选择变化
        cabinetSelect.addEventListener('change', () => {
            this.updateLocationString();
        });
        
        // U位选择变化
        uPositionSelect.addEventListener('change', () => {
            this.updateLocationString();
        });
    }
    
    // 初始化U位列表（U01-U40）
    initUPositions() {
        const uPositionSelect = document.getElementById('uPositionSelect');
        if (!uPositionSelect) {
            console.error('uPositionSelect元素未找到');
            return;
        }
        
        let html = '<option value="">请选择U位</option>';
        for (let i = 1; i <= 40; i++) {
            const uNumber = `U${i.toString().padStart(2, '0')}`;
            html += `<option value="${uNumber}">${uNumber}</option>`;
        }
        uPositionSelect.innerHTML = html;
        
        console.log('✅ 初始化U位列表：U01-U40');
    }
    
    // 更新完整位置字符串
    updateLocationString() {
        const cabinetSelect = document.getElementById('cabinetSelect');
        const uPositionSelect = document.getElementById('uPositionSelect');
        const locationInput = document.getElementById('location');
        
        const cabinet = cabinetSelect.value; // 值就是"主机房-机柜A1"
        const uPosition = uPositionSelect.value;
        
        let location = '';
        if (cabinet) {
            location = cabinet;
            if (uPosition) {
                location += `-${uPosition}`;
            }
        }
        
        locationInput.value = location;
        console.log('更新位置:', location);
    }
    
    // 解析location字符串并设置级联选择
    parseAndSetLocation(locationStr) {
        console.log('📍 解析位置字符串:', locationStr);
        
        if (!locationStr) {
            console.warn('位置字符串为空');
            return;
        }
        
        // 解析格式：主机房-机柜A1-U05
        const parts = locationStr.split('-');
        if (parts.length < 2) {
            console.warn('位置格式不正确:', locationStr);
            return;
        }
        
        // 提取机柜和U位
        const cabinetPart = `${parts[0]}-${parts[1]}`; // "主机房-机柜A1"
        const uPosition = parts.length > 2 ? parts[2] : ''; // "U05"
        
        console.log('解析结果:', { cabinetPart, uPosition });
        
        // 设置机柜
        const cabinetSelect = document.getElementById('cabinetSelect');
        cabinetSelect.value = cabinetPart;
        
        // 设置U位
        const uPositionSelect = document.getElementById('uPositionSelect');
        uPositionSelect.value = uPosition;
        
        console.log('✅ 位置设置完成');
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
