// 业务管理类
class BusinessManager {
    constructor() {
        this.currentBusiness = null;
        this.currentModule = null;
        this.components = [];
        this.allComponents = [];
        this.filteredComponents = [];
        this.currentView = 'grid';
        this.selectedComponents = new Set();
        this.currentComponent = null;
        this.monitoringCharts = {};
        this.logUpdateInterval = null;
        this.expandedNodes = new Set();
        this.businessData = [];

        this.init();
    }

    async init() {
        this.initEventListeners();
        this.initBusinessEvents(); // 初始化业务相关事件
        await this.loadComponents(); // 先加载所有组件数据
        await this.loadBusinessTree(); // 然后加载业务树并选择默认业务
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchComponents(e.target.value);
        });

        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                console.log('切换视图到:', view);
                this.switchView(view);
            });
        });

        // 过滤器
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        document.getElementById('envFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // 添加组件按钮
        document.getElementById('addComponentBtn').addEventListener('click', () => {
            this.showAddComponentModal();
        });

        // 添加业务按钮事件在 initBusinessEvents() 中处理

        // 批量操作按钮 - 先移除可能存在的事件监听器，再添加新的
        const selectAllBtn = document.getElementById('selectAllBtn');
        const batchStartBtn = document.getElementById('batchStartBtn');
        const batchStopBtn = document.getElementById('batchStopBtn');
        
        // 移除可能存在的旧事件监听器
        selectAllBtn.replaceWith(selectAllBtn.cloneNode(true));
        batchStartBtn.replaceWith(batchStartBtn.cloneNode(true));
        batchStopBtn.replaceWith(batchStopBtn.cloneNode(true));
        
        // 重新获取元素并添加事件监听器
        document.getElementById('selectAllBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('全选按钮被点击');
            this.toggleSelectAll();
        });
        document.getElementById('batchStartBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showBatchConfirm('start');
        });
        document.getElementById('batchStopBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.executeBatchStop();
        });
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportComponents();
        });

        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 日志刷新
        document.getElementById('refreshLogs')?.addEventListener('click', () => {
            this.refreshLogs();
        });

        // 配置保存
        document.getElementById('saveConfig')?.addEventListener('click', () => {
            this.saveConfig();
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

    // 初始化业务相关事件
    initBusinessEvents() {
        // 新增业务按钮
        const addBusinessBtn = document.getElementById('addBusinessBtn');
        if (addBusinessBtn) {
            addBusinessBtn.addEventListener('click', () => {
                this.openAddBusinessModal();
            });
        }

        // 业务类型选择切换
        document.querySelectorAll('input[name="businessType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleParentBusinessGroup(e.target.value);
            });
        });

        // 业务编码实时验证
        const businessCodeInput = document.getElementById('businessCode');
        if (businessCodeInput) {
            let debounceTimer;
            businessCodeInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.validateBusinessCode(e.target.value);
                }, 500);
            });
        }

        // 业务名称自动生成编码
        const businessNameInput = document.getElementById('businessName');
        if (businessNameInput && businessCodeInput) {
            businessNameInput.addEventListener('input', (e) => {
                if (!businessCodeInput.value) {
                    const autoCode = this.generateBusinessCode(e.target.value);
                    businessCodeInput.value = autoCode;
                    this.validateBusinessCode(autoCode);
                }
            });
        }
    }

    // 打开新增业务模态框
    openAddBusinessModal() {
        // 重置表单
        this.resetBusinessForm();
        
        // 加载父业务选项
        this.loadParentBusinessOptions();
        
        // 显示模态框
        this.showModal('addBusinessModal');
        
        // 聚焦到业务名称输入框
        setTimeout(() => {
            document.getElementById('businessName').focus();
        }, 100);
    }

    // 重置业务表单
    resetBusinessForm() {
        const form = document.getElementById('businessForm');
        if (form) {
            form.reset();
        }
        
        // 重置业务类型为根业务
        document.querySelector('input[name="businessType"][value="root"]').checked = true;
        this.toggleParentBusinessGroup('root');
        
        // 清除验证信息
        const codeValidation = document.getElementById('codeValidation');
        if (codeValidation) {
            codeValidation.innerHTML = '';
            codeValidation.className = 'code-validation';
        }

        // 隐藏预览区域
        const previewArea = document.getElementById('businessPreview');
        if (previewArea) {
            previewArea.style.display = 'none';
        }

        // 重置状态和优先级为默认值
        document.getElementById('businessStatus').value = 'active';
        document.getElementById('businessPriority').value = 'medium';
    }

    // 切换父业务选择组的显示
    toggleParentBusinessGroup(businessType) {
        const parentGroup = document.getElementById('parentBusinessGroup');
        const parentSelect = document.getElementById('parentBusinessSelect');
        
        if (businessType === 'child') {
            parentGroup.style.display = 'block';
            parentGroup.classList.add('show');
            parentSelect.required = true;
        } else {
            parentGroup.style.display = 'none';
            parentGroup.classList.remove('show');
            parentSelect.required = false;
            parentSelect.value = '';
        }
    }

    // 加载父业务选项
    async loadParentBusinessOptions() {
        try {
            const response = await fetch('/api/business/root');
            const result = await response.json();
            
            const parentSelect = document.getElementById('parentBusinessSelect');
            parentSelect.innerHTML = '<option value="">请选择父业务</option>';
            
            if (result.success && result.data) {
                result.data.forEach(business => {
                    const option = document.createElement('option');
                    option.value = business.id;
                    option.textContent = business.name;
                    parentSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('加载父业务选项失败:', error);
            this.showNotification('加载父业务选项失败', 'error');
        }
    }

    // 验证业务编码
    async validateBusinessCode(code) {
        const codeValidation = document.getElementById('codeValidation');
        
        if (!code) {
            codeValidation.innerHTML = '';
            codeValidation.className = 'code-validation';
            return;
        }

        // 基本格式验证
        const codePattern = /^[a-z0-9-]+$/;
        if (!codePattern.test(code)) {
            codeValidation.innerHTML = '<i class="fas fa-times"></i> 编码只能包含小写字母、数字和短横线';
            codeValidation.className = 'code-validation invalid';
            return false;
        }

        // 显示检查中状态
        codeValidation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检查中...';
        codeValidation.className = 'code-validation checking';

        try {
            const response = await fetch(`/api/business/check-code?code=${encodeURIComponent(code)}`);
            const result = await response.json();
            
            if (result.success) {
                if (result.isUnique) {
                    codeValidation.innerHTML = '<i class="fas fa-check"></i> 编码可用';
                    codeValidation.className = 'code-validation valid';
                    return true;
                } else {
                    codeValidation.innerHTML = '<i class="fas fa-times"></i> 编码已存在';
                    codeValidation.className = 'code-validation invalid';
                    return false;
                }
            } else {
                codeValidation.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 验证失败';
                codeValidation.className = 'code-validation invalid';
                return false;
            }
        } catch (error) {
            console.error('验证业务编码失败:', error);
            codeValidation.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 验证失败';
            codeValidation.className = 'code-validation invalid';
            return false;
        }
    }

    // 根据业务名称生成编码
    generateBusinessCode(name) {
        if (!name) return '';
        
        return name
            .toLowerCase()
            .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
            .replace(/[^a-z0-9\s-]/g, '') // 只保留字母、数字、空格和短横线
            .replace(/\s+/g, '-') // 空格替换为短横线
            .replace(/-+/g, '-') // 多个短横线合并为一个
            .replace(/^-|-$/g, ''); // 移除首尾的短横线
    }

    // 保存业务
    async saveBusiness() {
        try {
            // 获取表单数据
            const formData = this.getBusinessFormData();
            
            // 验证表单
            if (!this.validateBusinessForm(formData)) {
                return;
            }

            // 显示加载状态
            const saveBtn = document.querySelector('#addBusinessModal .btn-primary');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
            saveBtn.disabled = true;

            // 发送请求
            const response = await fetch('/api/business/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('业务创建成功', 'success');
                this.closeModal('addBusinessModal');
                this.loadBusinessTree(); // 重新加载业务树
            } else {
                this.showNotification(result.message || '业务创建失败', 'error');
            }

        } catch (error) {
            console.error('保存业务失败:', error);
            this.showNotification('业务创建失败', 'error');
        } finally {
            // 恢复按钮状态
            const saveBtn = document.querySelector('#addBusinessModal .btn-primary');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 保存';
            saveBtn.disabled = false;
        }
    }

    // 获取业务表单数据
    getBusinessFormData() {
        const businessType = document.querySelector('input[name="businessType"]:checked').value;
        const parentId = businessType === 'child' ? document.getElementById('parentBusinessSelect').value : null;
        
        return {
            businessType: businessType,
            parentId: parentId ? parseInt(parentId) : null,
            name: document.getElementById('businessName').value.trim(),
            code: document.getElementById('businessCode').value.trim(),
            type: document.getElementById('businessTypeSelect').value,
            status: document.getElementById('businessStatus').value,
            priority: document.getElementById('businessPriority').value,
            owner: document.getElementById('businessOwner').value.trim(),
            description: document.getElementById('businessDescription').value.trim()
        };
    }

    // 验证业务表单
    validateBusinessForm(formData) {
        if (!formData.name) {
            this.showNotification('请输入业务名称', 'error');
            document.getElementById('businessName').focus();
            return false;
        }

        if (!formData.code) {
            this.showNotification('请输入业务编码', 'error');
            document.getElementById('businessCode').focus();
            return false;
        }

        if (formData.businessType === 'child' && !formData.parentId) {
            this.showNotification('请选择父业务', 'error');
            document.getElementById('parentBusinessSelect').focus();
            return false;
        }

        return true;
    }

    // 预览业务信息
    previewBusiness() {
        try {
            const formData = this.getBusinessFormData();
            
            // 更新预览内容
            document.getElementById('previewBusinessType').textContent = 
                formData.businessType === 'root' ? '根业务（大类）' : '子业务';
            
            // 父业务信息
            const parentGroup = document.getElementById('previewParentGroup');
            if (formData.businessType === 'child' && formData.parentId) {
                const parentSelect = document.getElementById('parentBusinessSelect');
                const selectedOption = parentSelect.options[parentSelect.selectedIndex];
                document.getElementById('previewParent').textContent = selectedOption.text;
                parentGroup.style.display = 'block';
            } else {
                parentGroup.style.display = 'none';
            }
            
            document.getElementById('previewName').textContent = formData.name || '未填写';
            document.getElementById('previewCode').textContent = formData.code || '未填写';
            
            // 业务类型映射
            const typeMap = {
                'platform': '平台',
                'service': '服务',
                'module': '模块',
                'component': '组件',
                'system': '系统',
                'application': '应用'
            };
            document.getElementById('previewType').textContent = typeMap[formData.type] || formData.type;
            
            // 状态映射
            const statusMap = {
                'active': '活跃',
                'inactive': '非活跃',
                'planning': '规划中',
                'deprecated': '已废弃'
            };
            document.getElementById('previewStatus').textContent = statusMap[formData.status] || formData.status;
            
            // 优先级映射
            const priorityMap = {
                'high': '高',
                'medium': '中',
                'low': '低'
            };
            document.getElementById('previewPriority').textContent = priorityMap[formData.priority] || formData.priority;
            
            document.getElementById('previewOwner').textContent = formData.owner || '未指定';
            document.getElementById('previewDescription').textContent = formData.description || '无描述';
            
            // 显示预览区域
            const previewArea = document.getElementById('businessPreview');
            previewArea.style.display = 'block';
            previewArea.scrollIntoView({ behavior: 'smooth' });
            
            this.showNotification('预览已生成', 'info');
            
        } catch (error) {
            console.error('预览生成失败:', error);
            this.showNotification('预览生成失败', 'error');
        }
    }

    // 显示模态框
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭模态框
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            
            // 特殊处理添加组件模态框
            if (modalId === 'addComponentModal') {
                console.log('关闭添加组件模态框，清理状态');
                // 清除编辑模式标记
                delete modal.dataset.editId;
                
                // 重置表单
                const form = document.getElementById('componentForm');
                if (form) {
                    form.reset();
                }
                
                console.log('添加组件模态框状态已清理');
            }
            
            // 恢复背景滚动
            document.body.style.overflow = 'auto';
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 加载业务树
    async loadBusinessTree() {
        try {
            // 从后端API加载业务树数据
            const response = await fetch('/api/business/tree');
            const result = await response.json();
            
            console.log('API响应:', result);
            
            if (result.success && result.data) {
                this.businessData = result.data;
                console.log('从后端加载业务数据成功:', this.businessData.length, '个业务');
                console.log('业务数据详情:', this.businessData);
            } else {
                console.warn('后端返回的业务数据为空，使用空数组');
                console.log('API响应详情:', result);
                this.businessData = [];
            }
        } catch (error) {
            console.error('加载业务树数据失败:', error);
            this.businessData = [];
        }

        // 初始化展开状态
        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }

        const treeContainer = document.getElementById('businessTree');
        if (!treeContainer) {
            console.error('找不到业务树容器元素');
            return;
        }

        // 渲染业务树
        this.renderBusinessTreeContainer();

        // 计算每个业务的组件数量
        await this.calculateBusinessComponentCounts();

        // 如果有业务数据，默认选中第一个业务
        if (this.businessData.length > 0) {
            const firstBusiness = this.businessData[0];
            const firstBusinessId = String(firstBusiness.id);
            this.expandedNodes.add(firstBusinessId);
            this.selectBusiness(firstBusinessId);
        }
    }

    // 渲染业务树容器
    renderBusinessTreeContainer() {
        const treeContainer = document.getElementById('businessTree');
        
        if (this.businessData.length === 0) {
            // 显示空状态
            treeContainer.innerHTML = `
                <div class="business-tree-empty">
                    <i class="fas fa-sitemap"></i>
                    <h4>暂无业务数据</h4>
                    <p>点击上方"新增业务"按钮开始创建您的第一个业务</p>
                    <button class="btn btn-primary btn-sm" onclick="window.businessManager.openAddBusinessModal()">
                        <i class="fas fa-plus"></i>
                        新增业务
                    </button>
                </div>
            `;
        } else {
            // 渲染业务树
            console.log('渲染业务树，业务数量:', this.businessData.length);
            console.log('展开的节点:', Array.from(this.expandedNodes));
            treeContainer.innerHTML = this.renderBusinessTree(this.businessData);
        }
    }

    // 渲染业务树
    renderBusinessTree(data) {
        return data.map(business => {
            const businessId = String(business.id);
            const isExpanded = this.expandedNodes?.has(businessId);
            const isActive = businessId === String(this.currentBusiness);
            
            return `
            <div class="tree-node">
                <div class="tree-item ${isActive ? 'active' : ''}"
                     onclick="window.businessManager.selectBusiness('${businessId}')">
                    <div class="tree-toggle" onclick="window.businessManager.toggleBusinessNode('${businessId}', event)">
                        <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'}"></i>
                    </div>
                    <i class="tree-icon ${business.icon || 'fas fa-folder'}"></i>
                    <span class="business-name">${business.name}</span>
                    <span class="business-count" data-count="${business.componentCount || 0}">${business.componentCount || 0}</span>
                </div>
                ${business.children && business.children.length > 0 ? `
                    <div class="tree-children ${isExpanded ? 'expanded' : ''}">
                        ${business.children.map(child => {
                            const childId = String(child.id);
                            const isChildActive = childId === String(this.currentModule);
                            return `
                            <div class="tree-item module-item ${isChildActive ? 'active' : ''}"
                                 onclick="window.businessManager.selectModule('${childId}')">
                                <div class="tree-spacer"></div>
                                <i class="tree-icon ${child.icon || 'fas fa-cog'}"></i>
                                <span class="business-name">${child.name}</span>
                                <span class="business-count" data-count="${child.componentCount || 0}">${child.componentCount || 0}</span>
                            </div>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>`;
        }).join('');
    }

    // 选择业务
    selectBusiness(businessId) {
        const id = String(businessId);
        this.currentBusiness = id;
        this.currentModule = null; // 清除模块选择

        console.log('=== 选择业务开始 ===');
        console.log('传入的businessId:', businessId, '类型:', typeof businessId);
        console.log('转换后的id:', id, '类型:', typeof id);
        console.log('当前业务数据:', this.businessData);

        // 查找对应的业务数据
        const business = this.businessData.find(b => String(b.id) === id);
        console.log('找到的业务数据:', business);

        // 初始化展开状态
        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }
        
        // 检查是否需要展开（重新渲染）
        const needsRerender = !this.expandedNodes.has(id);
        this.expandedNodes.add(id); // 自动展开选中的业务

        // 智能更新业务树
        if (needsRerender) {
            console.log('需要重新渲染业务树（展开新节点）');
            this.renderBusinessTreeContainer();
        } else {
            console.log('只更新选中状态（避免重新渲染）');
            this.updateTreeSelection();
        }

        console.log('准备加载业务组件，businessId:', id);
        this.loadComponentsByBusiness(id);
        this.updateBreadcrumb();
        console.log('=== 选择业务结束 ===');
    }

    // 选择模块
    selectModule(moduleId) {
        const id = String(moduleId);
        this.currentModule = id;

        console.log('选择模块:', id);

        // 只更新选中状态，不重新渲染整个树
        console.log('选择子业务，只更新选中状态（避免刷新感）');
        this.updateTreeSelection();

        this.loadComponentsByModule(id);
        this.updateBreadcrumb();
    }

    // 只更新树的选中状态，不重新渲染整个树
    updateTreeSelection() {
        // 移除所有现有的active类
        const allTreeItems = document.querySelectorAll('.tree-item');
        allTreeItems.forEach(item => {
            item.classList.remove('active');
        });

        // 为当前选中的业务添加active类
        if (this.currentBusiness) {
            const businessItem = document.querySelector(`[onclick*="selectBusiness('${this.currentBusiness}')"]`);
            if (businessItem) {
                businessItem.classList.add('active');
            }
        }

        // 为当前选中的模块添加active类
        if (this.currentModule) {
            const moduleItem = document.querySelector(`[onclick*="selectModule('${this.currentModule}')"]`);
            if (moduleItem) {
                moduleItem.classList.add('active');
            }
        }
    }

    // 切换业务节点展开状态
    toggleBusinessNode(businessId, event) {
        event.stopPropagation();

        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }

        // 确保ID是字符串类型
        const id = String(businessId);
        
        console.log('切换业务节点:', id, '当前展开状态:', this.expandedNodes.has(id));

        if (this.expandedNodes.has(id)) {
            this.expandedNodes.delete(id);
            console.log('折叠业务:', id);
        } else {
            this.expandedNodes.add(id);
            console.log('展开业务:', id);
        }

        console.log('更新后的展开节点:', Array.from(this.expandedNodes));

        // 重新渲染业务树
        this.renderBusinessTreeContainer();
    }

    // 更新面包屑导航
    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        let breadcrumbHtml = '<span class="breadcrumb-item">业务管理</span>';

        if (this.currentBusiness) {
            const business = this.businessData.find(b => b.id === this.currentBusiness);
            if (business) {
                breadcrumbHtml += '<i class="fas fa-chevron-right"></i>';
                breadcrumbHtml += `<span class="breadcrumb-item">${business.name}</span>`;

                if (this.currentModule) {
                    const module = business.children?.find(m => m.id === this.currentModule);
                    if (module) {
                        breadcrumbHtml += '<i class="fas fa-chevron-right"></i>';
                        breadcrumbHtml += `<span class="breadcrumb-item active">${module.name}</span>`;
                    }
                } else {
                    breadcrumbHtml = breadcrumbHtml.replace('breadcrumb-item">', 'breadcrumb-item active">');
                }
            }
        }

        breadcrumb.innerHTML = breadcrumbHtml;
    }

    // 加载组件数据
    async loadComponents() {
        try {
            // 从后端API加载组件数据
            const response = await fetch('/api/business-component/list');
            const result = await response.json();
            
            console.log('组件API响应:', result);
            
            if (result.success && result.data) {
                this.allComponents = result.data;
                console.log('从后端加载组件数据成功:', this.allComponents.length, '个组件');
            } else {
                console.warn('后端返回的组件数据为空，使用空数组');
                this.allComponents = [];
            }
        } catch (error) {
            console.error('加载组件数据失败:', error);
            this.allComponents = [];
        }

        // 初始化当前显示的组件
        this.components = [...this.allComponents];
        this.filteredComponents = [...this.components];

        console.log('加载组件数据:', this.components.length, '个组件');

        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
    }

    // 计算每个业务的组件数量
    async calculateBusinessComponentCounts() {
        console.log('=== 开始计算业务组件数量 ===');
        
        // 为每个业务计算组件数量
        for (let business of this.businessData) {
            try {
                if (business.children && business.children.length > 0) {
                    // 父业务：计算所有子业务的组件总数
                    let totalCount = 0;
                    
                    for (let child of business.children) {
                        const childCount = await this.getBusinessComponentCount(child.id);
                        child.componentCount = childCount;
                        totalCount += childCount;
                    }
                    
                    business.componentCount = totalCount;
                    console.log(`父业务 ${business.name} (${business.id}): ${totalCount} 个组件`);
                } else {
                    // 子业务或独立业务：直接计算组件数量
                    const count = await this.getBusinessComponentCount(business.id);
                    business.componentCount = count;
                    console.log(`业务 ${business.name} (${business.id}): ${count} 个组件`);
                }
            } catch (error) {
                console.error(`计算业务 ${business.name} 组件数量失败:`, error);
                business.componentCount = 0;
            }
        }
        
        console.log('=== 业务组件数量计算完成 ===');
        
        // 重新渲染业务树以显示组件数量
        this.renderBusinessTreeContainer();
    }

    // 获取单个业务的组件数量
    async getBusinessComponentCount(businessId) {
        try {
            const response = await fetch(`/api/business-component/business/${businessId}`);
            if (!response.ok) {
                return 0;
            }
            
            const result = await response.json();
            if (result.success && result.data) {
                return result.data.length;
            }
            return 0;
        } catch (error) {
            console.error(`获取业务 ${businessId} 组件数量失败:`, error);
            return 0;
        }
    }

    // 根据业务加载组件
    async loadComponentsByBusiness(businessId) {
        try {
            console.log('=== 开始加载业务组件 ===');
            console.log('businessId:', businessId);
            
            // 查找当前业务数据
            const currentBusiness = this.businessData.find(b => String(b.id) === String(businessId));
            console.log('当前业务数据:', currentBusiness);
            
            // 判断是否为父业务（有子业务）
            const hasChildren = currentBusiness && currentBusiness.children && currentBusiness.children.length > 0;
            console.log('是否为父业务:', hasChildren);
            
            if (hasChildren) {
                // 父业务：加载所有子业务的组件
                console.log('加载父业务下所有子业务的组件');
                const childBusinessIds = currentBusiness.children.map(child => child.id);
                console.log('子业务IDs:', childBusinessIds);
                
                let allComponents = [];
                
                // 并行请求所有子业务的组件
                const promises = childBusinessIds.map(async (childId) => {
                    try {
                        const url = `/api/business-component/business/${childId}`;
                        console.log(`请求子业务 ${childId} 的组件:`, url);
                        
                        const response = await fetch(url);
                        if (!response.ok) {
                            console.warn(`子业务 ${childId} 请求失败:`, response.status);
                            return [];
                        }
                        
                        const result = await response.json();
                        if (result.success && result.data) {
                            console.log(`子业务 ${childId} 返回 ${result.data.length} 个组件`);
                            return result.data;
                        }
                        return [];
                    } catch (error) {
                        console.error(`加载子业务 ${childId} 组件失败:`, error);
                        return [];
                    }
                });
                
                const results = await Promise.all(promises);
                allComponents = results.flat(); // 合并所有子业务的组件
                
                console.log('父业务组件汇总完成，总计:', allComponents.length, '个组件');
                this.components = allComponents;
                
            } else {
                // 子业务或没有子业务的业务：直接加载该业务的组件
                console.log('加载单个业务的组件');
                const url = `/api/business-component/business/${businessId}`;
                console.log('请求URL:', url);
                
                const response = await fetch(url);
                console.log('HTTP响应状态:', response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('业务组件API响应:', result);
                
                if (result.success && result.data) {
                    this.components = result.data;
                    console.log('从后端加载业务组件成功:', this.components.length, '个组件');
                } else {
                    console.warn('后端返回的业务组件数据为空或失败');
                    this.components = [];
                }
            }
            
            console.log('最终组件数据详情:', this.components);
            
        } catch (error) {
            console.error('=== 加载业务组件失败 ===');
            console.error('错误类型:', error.name);
            console.error('错误消息:', error.message);
            console.error('完整错误:', error);
            this.components = [];
        }
        
        console.log('设置filteredComponents，数量:', this.components.length);
        this.filteredComponents = [...this.components];
        this.applyFilters(); // 重新应用当前过滤器
        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
        console.log('=== 业务组件加载完成 ===');
    }

    // 根据模块加载组件 (实际上是子业务)
    async loadComponentsByModule(moduleId) {
        console.log('=== 加载模块组件（实际是子业务）===');
        console.log('moduleId:', moduleId);
        
        // 子业务实际上也是业务，所以调用业务组件API
        try {
            const url = `/api/business-component/business/${moduleId}`;
            console.log('模块组件请求URL:', url);
            
            const response = await fetch(url);
            console.log('模块组件HTTP响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('模块组件API响应:', result);
            
            if (result.success && result.data) {
                this.components = result.data;
                console.log('从后端加载模块组件成功:', this.components.length, '个组件');
                console.log('模块组件数据详情:', this.components);
            } else {
                console.warn('后端返回的模块组件数据为空或失败');
                console.log('模块API响应详情:', result);
                this.components = [];
            }
        } catch (error) {
            console.error('=== 加载模块组件失败 ===');
            console.error('错误类型:', error.name);
            console.error('错误消息:', error.message);
            console.error('完整错误:', error);
            this.components = [];
        }
        
        console.log('设置模块filteredComponents，数量:', this.components.length);
        this.filteredComponents = [...this.components];
        this.applyFilters(); // 重新应用当前过滤器
        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
        console.log('=== 模块组件加载完成 ===');
    }

    // 渲染组件
    renderComponents() {
        console.log('=== 渲染组件 ===');
        console.log('过滤组件数量:', this.filteredComponents.length);
        console.log('选中组件数量:', this.selectedComponents.size);
        console.log('选中的ID:', Array.from(this.selectedComponents));
        
        const container = document.getElementById('componentGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredComponents.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        // 渲染每个组件并检查选中状态
        const htmlParts = this.filteredComponents.map(component => {
            const normalizedId = String(component.id);
            const isSelected = this.selectedComponents.has(normalizedId);
            console.log(`渲染组件 ${component.name} (ID: ${normalizedId}): ${isSelected ? '选中' : '未选中'}`);
            return this.renderComponentCard(component);
        });
        
        container.innerHTML = htmlParts.join('');
        console.log('组件渲染完成');
    }

    // 渲染组件卡片
    renderComponentCard(component) {
        const typeLabels = {
            'web': 'Web服务',
            'api': 'API服务',
            'database': '数据库',
            'cache': '缓存',
            'queue': '消息队列',
            'microservice': '微服务',
            'gateway': '网关',
            'registry': '注册中心',
            'config': '配置中心',
            'monitoring': '监控服务',
            'logging': '日志服务',
            'storage': '存储服务',
            'scheduler': '调度服务',
            'adapter': '适配器'
        };

        const envLabels = {
            'prod': '生产环境',
            'test': '测试环境',
            'dev': '开发环境'
        };

        const isListView = this.currentView === 'list';

        // 统一ID格式
        const normalizedId = String(component.id);
        
        return `
            <div class="component-card ${isListView ? 'list-view' : ''} ${this.selectedComponents.has(normalizedId) ? 'selected' : ''}"
                 data-id="${normalizedId}" onclick="businessManager.selectComponent('${normalizedId}', event)">
                <input type="checkbox" class="card-checkbox"
                       ${this.selectedComponents.has(normalizedId) ? 'checked' : ''}
                       onclick="businessManager.toggleComponentSelection('${normalizedId}', event)">
                <div class="card-header">
                    <div class="component-info">
                        <h4>${component.name}</h4>
                        <span class="component-type">${typeLabels[component.type] || component.type}</span>
                    </div>
                    <div class="component-status status-${component.status}">
                        <span class="status-dot"></span>
                        <span>${this.getStatusText(component.status)}</span>
                    </div>
                </div>
                
                <div class="component-details">
                    ${isListView ? `
                        <div class="detail-item">
                            <span class="detail-label">环境:</span>
                            <span class="detail-value">${envLabels[component.environment] || component.environment}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">端口:</span>
                            <span class="detail-value">${component.port}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CPU:</span>
                            <span class="detail-value">${component.cpu}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">内存:</span>
                            <span class="detail-value">${component.memory}MB</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">运行时间:</span>
                            <span class="detail-value">${component.uptime}</span>
                        </div>
                    ` : `
                        <div class="detail-item">
                            <span class="detail-label">环境:</span>
                            <span class="detail-value">${envLabels[component.environment] || component.environment}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">地址:</span>
                            <span class="detail-value">${component.url}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">端口:</span>
                            <span class="detail-value">${component.port}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CPU:</span>
                            <span class="detail-value">${component.cpu}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">内存:</span>
                            <span class="detail-value">${component.memory}MB</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">运行时间:</span>
                            <span class="detail-value">${component.uptime}</span>
                        </div>
                    `}
                </div>
                
                <div class="component-actions">
                    <button class="action-btn primary" onclick="event.stopPropagation(); safeCall('showComponentDetail', '${normalizedId}')">详情</button>
                    ${component.status === 'running' ?
                        '<button class="action-btn danger" onclick="event.stopPropagation(); safeCall(\'stopComponent\', \'' + normalizedId + '\')">停止</button>' :
                        '<button class="action-btn primary" onclick="event.stopPropagation(); safeCall(\'startComponent\', \'' + normalizedId + '\')">启动</button>'
                    }
                    <button class="action-btn" onclick="event.stopPropagation(); safeCall('restartComponent', '${normalizedId}')">重启</button>
                    <button class="action-btn" onclick="event.stopPropagation(); safeCall('editComponent', '${normalizedId}')">编辑</button>
                </div>
            </div>
        `;
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'running': '运行中',
            'stopped': '已停止',
            'error': '异常'
        };
        return statusMap[status] || status;
    }

    // 更新统计信息
    updateStats() {
        const total = this.components.length;
        const running = this.components.filter(c => c.status === 'running').length;
        const stopped = this.components.filter(c => c.status === 'stopped').length;
        const error = this.components.filter(c => c.status === 'error').length;

        document.getElementById('totalComponents').textContent = total;
        document.getElementById('runningComponents').textContent = running;
        document.getElementById('stoppedComponents').textContent = stopped;
        document.getElementById('errorComponents').textContent = error;
    }

    // 搜索组件
    searchComponents(query) {
        if (!query.trim()) {
            this.filteredComponents = [...this.components];
        } else {
            this.filteredComponents = this.components.filter(component =>
                component.name.toLowerCase().includes(query.toLowerCase()) ||
                component.description.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.renderComponents();
    }

    // 应用过滤器
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const envFilter = document.getElementById('envFilter').value;

        this.filteredComponents = this.components.filter(component => {
            return (!statusFilter || component.status === statusFilter) &&
                   (!typeFilter || component.type === typeFilter) &&
                   (!envFilter || component.environment === envFilter);
        });

        this.renderComponents();
    }

    // 切换视图
    switchView(view) {
        console.log('switchView 被调用，参数:', view);
        this.currentView = view;

        // 更新按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('按钮状态已更新');
        } else {
            console.error('找不到对应的视图按钮:', view);
        }

        // 更新容器样式
        const container = document.getElementById('componentGrid');
        if (container) {
            const newClassName = view === 'grid' ? 'component-grid' : 'component-list';
            container.className = newClassName;
            console.log('容器样式已更新为:', newClassName);
        } else {
            console.error('找不到组件容器');
        }

        // 重新渲染组件以应用新的视图样式
        this.renderComponents();

        console.log('视图切换完成，当前视图:', this.currentView);
    }

    // 显示添加组件模态框
    showAddComponentModal(isEdit = false) {
        console.log('显示添加组件模态框, 编辑模式:', isEdit);
        
        // 获取模态框和表单元素
        const modal = document.getElementById('addComponentModal');
        const form = document.getElementById('componentForm');
        
        // 强制清理之前的状态（防止状态残留）
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            if (!isEdit) {
                delete modal.dataset.editId;
            }
        }
        
        // 只有在新增模式下才检查业务层级权限
        if (!isEdit) {
            // 优先检查 currentModule（子业务），如果没有则检查 currentBusiness
            const targetBusinessId = this.currentModule || this.currentBusiness;
            
            // 检查是否选择了业务
            if (!targetBusinessId) {
                alert('请先选择一个业务');
                return;
            }
            
            // 检查当前选择的业务是否为子业务（可以添加组件）
            const targetBusinessData = this.businessData.find(b => String(b.id) === String(targetBusinessId));
            console.log('目标业务数据:', targetBusinessData);
            
            if (targetBusinessData && targetBusinessData.children && targetBusinessData.children.length > 0) {
                // 这是父业务，不能直接添加组件
                alert('请选择具体的业务模块（如用户服务、订单服务等）来添加组件，不能在父级业务中直接添加组件。');
                return;
            }
            
            // 清空表单（只在新增模式下清空）
            const form = document.getElementById('componentForm');
            if (form) {
                form.reset();
            }
            
            // 清除编辑模式标记
            const modal = document.getElementById('addComponentModal');
            if (modal) {
                delete modal.dataset.editId;
            }
        }
        
        // 显示模态框
        if (modal) {
            // 确保模态框正确显示
            modal.style.display = 'flex';
            modal.classList.add('show');
            // 禁用背景滚动
            document.body.style.overflow = 'hidden';
        }
        
        console.log('组件模态框已显示, 编辑模式:', isEdit);
    }

    // 删除了错误的addBusiness方法，使用openAddBusinessModal代替

    // 启动组件
    async startComponent(componentId) {
        console.log('=== 启动组件方法被调用 ===');
        console.log('componentId:', componentId, '类型:', typeof componentId);
        
        // 尝试不同的ID匹配方式
        let component = this.components.find(c => c.id === componentId);
        if (!component) {
            component = this.components.find(c => String(c.id) === String(componentId));
        }
        if (!component) {
            component = this.components.find(c => Number(c.id) === Number(componentId));
        }
        console.log('找到的组件:', component);
        
        if (component) {
            try {
                // 先更新前端状态
                const originalStatus = component.status;
                component.status = 'running';
                this.renderComponents();
                this.updateStats();
                
                // 调用后端API更新状态
                const response = await fetch(`/api/business-component/status/${component.id}?status=running`, {
                    method: 'PUT'
                });
                
                if (!response.ok) {
                    // 如果后端更新失败，恢复原状态
                    component.status = originalStatus;
                    this.renderComponents();
                    this.updateStats();
                    throw new Error(`HTTP错误: ${response.status}`);
                }
                
                const result = await response.json();
                if (!result.success) {
                    // 如果后端返回失败，恢复原状态
                    component.status = originalStatus;
                    this.renderComponents();
                    this.updateStats();
                    throw new Error(result.message || '更新失败');
                }
                
                console.log('启动组件成功:', component.name);
                
            } catch (error) {
                console.error('启动组件失败:', error);
                this.showNotification(`启动组件失败: ${error.message}`, 'error');
            }
        } else {
            console.error('未找到组件:', componentId);
            alert('未找到指定的组件');
        }
    }

    // 停止组件
    async stopComponent(componentId) {
        console.log('=== 停止组件方法被调用 ===');
        console.log('componentId:', componentId, '类型:', typeof componentId);
        
        // 尝试不同的ID匹配方式
        let component = this.components.find(c => c.id === componentId);
        if (!component) {
            component = this.components.find(c => String(c.id) === String(componentId));
        }
        if (!component) {
            component = this.components.find(c => Number(c.id) === Number(componentId));
        }
        console.log('找到的组件:', component);
        
        if (component) {
            try {
                // 先更新前端状态
                const originalStatus = component.status;
                const originalCpu = component.cpu;
                const originalMemory = component.memory;
                const originalUptime = component.uptime;
                
                component.status = 'stopped';
                component.cpu = 0;
                component.memory = 0;
                component.uptime = '已停止';
                this.renderComponents();
                this.updateStats();
                
                // 调用后端API更新状态
                const response = await fetch(`/api/business-component/status/${component.id}?status=stopped`, {
                    method: 'PUT'
                });
                
                if (!response.ok) {
                    // 如果后端更新失败，恢复原状态
                    component.status = originalStatus;
                    component.cpu = originalCpu;
                    component.memory = originalMemory;
                    component.uptime = originalUptime;
                    this.renderComponents();
                    this.updateStats();
                    throw new Error(`HTTP错误: ${response.status}`);
                }
                
                const result = await response.json();
                if (!result.success) {
                    // 如果后端返回失败，恢复原状态
                    component.status = originalStatus;
                    component.cpu = originalCpu;
                    component.memory = originalMemory;
                    component.uptime = originalUptime;
                    this.renderComponents();
                    this.updateStats();
                    throw new Error(result.message || '更新失败');
                }
                
                console.log('停止组件成功:', component.name);
                
            } catch (error) {
                console.error('停止组件失败:', error);
                this.showNotification(`停止组件失败: ${error.message}`, 'error');
            }
        } else {
            console.error('未找到组件:', componentId);
            alert('未找到指定的组件');
        }
    }

    // 重启组件
    restartComponent(componentId) {
        // 尝试不同的ID匹配方式
        let component = this.components.find(c => c.id === componentId);
        if (!component) {
            component = this.components.find(c => String(c.id) === String(componentId));
        }
        if (!component) {
            component = this.components.find(c => Number(c.id) === Number(componentId));
        }
        if (component) {
            component.status = 'running';
            this.renderComponents();
            this.updateStats();
            console.log('重启组件:', component.name);
        }
    }

    // 编辑组件
    editComponent(componentId) {
        // 尝试不同的ID匹配方式
        let component = this.components.find(c => c.id === componentId);
        if (!component) {
            component = this.components.find(c => String(c.id) === String(componentId));
        }
        if (!component) {
            component = this.components.find(c => Number(c.id) === Number(componentId));
        }
        if (component) {
            // 填充表单数据
            document.getElementById('componentName').value = component.name;
            document.getElementById('componentType').value = component.type;
            document.getElementById('componentEnv').value = component.environment;
            document.getElementById('componentPort').value = component.port;
            document.getElementById('componentUrl').value = component.url;
            document.getElementById('componentDescription').value = component.description;

            // 显示模态框（编辑模式）
            this.showAddComponentModal(true);

            // 标记为编辑模式
            document.getElementById('addComponentModal').dataset.editId = componentId;
        }
    }

    // 删除组件
    deleteComponent(componentId) {
        if (confirm('确定要删除这个组件吗？')) {
            // 使用更灵活的ID匹配方式
            this.components = this.components.filter(c => 
                c.id !== componentId && 
                String(c.id) !== String(componentId) && 
                Number(c.id) !== Number(componentId)
            );
            this.filteredComponents = this.filteredComponents.filter(c => 
                c.id !== componentId && 
                String(c.id) !== String(componentId) && 
                Number(c.id) !== Number(componentId)
            );
            // 删除选中状态时也要考虑ID格式
            this.selectedComponents.delete(String(componentId));
            this.renderComponents();
            this.updateStats();
            this.updateBatchButtons();
            console.log('删除组件:', componentId);
        }
    }

    // 选择组件
    selectComponent(componentId, event) {
        // 如果点击的是复选框，不处理卡片选择
        if (event && event.target.type === 'checkbox') {
            return;
        }
        
        // 如果点击的是操作按钮，不处理卡片选择
        if (event && event.target.closest('.component-actions')) {
            return;
        }
        
        // 点击卡片区域时，切换选择状态
        this.toggleComponentSelection(componentId, event);
    }

    // 切换组件选择状态
    toggleComponentSelection(componentId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        console.log('切换组件选择状态:', componentId, '类型:', typeof componentId);
        
        // 统一ID格式，确保选择状态的一致性
        const normalizedId = String(componentId);
        
        if (this.selectedComponents.has(normalizedId)) {
            this.selectedComponents.delete(normalizedId);
            console.log('取消选择组件:', normalizedId);
        } else {
            this.selectedComponents.add(normalizedId);
            console.log('选择组件:', normalizedId);
        }
        
        console.log('当前选中的组件:', Array.from(this.selectedComponents));
        
        this.renderComponents();
        this.updateBatchButtons();
    }

    // 全选/取消全选
    toggleSelectAll() {
        console.log('=== 全选/取消全选操作 ===');
        console.log('当前选中数量:', this.selectedComponents.size);
        console.log('过滤组件数量:', this.filteredComponents.length);
        console.log('过滤组件:', this.filteredComponents.map(c => ({id: c.id, name: c.name})));
        
        if (this.filteredComponents.length === 0) {
            console.warn('没有可选择的组件');
            alert('当前没有可选择的组件，请先选择一个业务');
            return;
        }
        
        if (this.selectedComponents.size === this.filteredComponents.length && this.filteredComponents.length > 0) {
            console.log('执行取消全选');
            this.selectedComponents.clear();
        } else {
            console.log('执行全选');
            // 先清空现有选择，避免重复
            this.selectedComponents.clear();
            
            this.filteredComponents.forEach(component => {
                // 统一ID格式
                const normalizedId = String(component.id);
                this.selectedComponents.add(normalizedId);
                console.log('添加选中组件:', normalizedId, component.name);
            });
        }
        
        console.log('操作后选中数量:', this.selectedComponents.size);
        console.log('选中的组件ID:', Array.from(this.selectedComponents));
        
        this.renderComponents();
        this.updateBatchButtons();
    }

    // 更新批量操作按钮状态
    updateBatchButtons() {
        const hasSelection = this.selectedComponents.size > 0;
        console.log('更新批量操作按钮状态:', {
            selectedCount: this.selectedComponents.size,
            hasSelection: hasSelection,
            selectedIds: Array.from(this.selectedComponents)
        });
        
        document.getElementById('batchStartBtn').disabled = !hasSelection;
        document.getElementById('batchStopBtn').disabled = !hasSelection;

        const selectAllBtn = document.getElementById('selectAllBtn');
        if (this.selectedComponents.size === this.filteredComponents.length && this.filteredComponents.length > 0) {
            selectAllBtn.innerHTML = '<i class="fas fa-square"></i> 取消全选';
        } else {
            selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> 全选';
        }
        
        // 更新添加组件按钮状态
        this.updateAddComponentButton();
    }
    
    // 更新添加组件按钮状态
    updateAddComponentButton() {
        const addComponentBtn = document.getElementById('addComponentBtn');
        if (!addComponentBtn) return;
        
        // 优先检查 currentModule（子业务），如果没有则检查 currentBusiness
        const targetBusinessId = this.currentModule || this.currentBusiness;
        
        if (!targetBusinessId) {
            // 没有选择业务
            addComponentBtn.disabled = true;
            addComponentBtn.title = '请先选择一个业务';
            return;
        }
        
        // 检查目标业务是否为父业务
        const targetBusinessData = this.businessData.find(b => String(b.id) === String(targetBusinessId));
        const isParentBusiness = targetBusinessData && targetBusinessData.children && targetBusinessData.children.length > 0;
        
        console.log('updateAddComponentButton 检查:', {
            currentBusiness: this.currentBusiness,
            currentModule: this.currentModule,
            targetBusinessId: targetBusinessId,
            isParentBusiness: isParentBusiness
        });
        
        if (isParentBusiness) {
            // 选择的是父业务
            addComponentBtn.disabled = true;
            addComponentBtn.title = '请选择具体的业务模块（如用户服务、订单服务等）来添加组件';
        } else {
            // 选择的是子业务，可以添加组件
            addComponentBtn.disabled = false;
            addComponentBtn.title = '添加新的业务组件';
        }
    }

    // 显示批量操作确认
    showBatchConfirm(action) {
        console.log('=== 批量操作确认 ===');
        console.log('操作类型:', action);
        console.log('选中的组件ID:', Array.from(this.selectedComponents));
        console.log('选中组件数量:', this.selectedComponents.size);
        console.log('所有组件:', this.components.map(c => ({id: c.id, name: c.name, type: typeof c.id, status: c.status})));
        
        const selectedComponents = Array.from(this.selectedComponents).map(id => {
            console.log(`查找组件ID: ${id} (类型: ${typeof id})`);
            
            // 使用多种匹配方式查找组件
            let component = this.components.find(c => c.id === id);
            if (!component) {
                component = this.components.find(c => String(c.id) === String(id));
                if (component) console.log('通过字符串匹配找到组件:', component.name);
            }
            if (!component) {
                component = this.components.find(c => Number(c.id) === Number(id));
                if (component) console.log('通过数字匹配找到组件:', component.name);
            }
            
            if (!component) {
                console.warn(`未找到ID为 ${id} 的组件`);
            }
            
            return component;
        }).filter(Boolean);
        
        console.log('找到的选中组件:', selectedComponents.map(c => ({name: c.name, status: c.status})));

        if (selectedComponents.length === 0) {
            alert('请先选择要操作的组件');
            return;
        }

        const actionText = action === 'start' ? '启动' : '停止';
        document.getElementById('batchConfirmTitle').textContent = `批量${actionText}确认`;
        document.getElementById('batchConfirmMessage').textContent =
            `确定要${actionText}以下 ${selectedComponents.length} 个组件吗？`;

        const listContainer = document.getElementById('selectedComponentsList');
        listContainer.innerHTML = selectedComponents.map(component => `
            <div class="selected-component-item">
                <span>${component.name}</span>
                <span class="component-status status-${component.status}">
                    <span class="status-dot"></span>
                    ${this.getStatusText(component.status)}
                </span>
            </div>
        `).join('');

        document.getElementById('confirmBatchAction').onclick = () => {
            this.executeBatchAction(action, selectedComponents);
            closeModal('batchConfirmModal');
        };

        document.getElementById('batchConfirmModal').classList.add('show');
    }

    // 执行批量操作
    executeBatchAction(action, components) {
        console.log('=== 执行批量操作 ===');
        console.log('操作类型:', action);
        console.log('操作组件数量:', components.length);
        console.log('操作组件:', components.map(c => ({id: c.id, name: c.name})));
        
        if (components.length === 0) {
            console.warn('没有组件可操作');
            alert('没有找到可操作的组件');
            return;
        }
        
        let successCount = 0;
        components.forEach(component => {
            try {
                console.log(`${action === 'start' ? '启动' : '停止'}组件:`, component.name, '(ID:', component.id, ')');
                if (action === 'start') {
                    this.startComponent(component.id);
                } else if (action === 'stop') {
                    this.stopComponent(component.id);
                }
                successCount++;
            } catch (error) {
                console.error(`操作组件 ${component.name} 失败:`, error);
            }
        });

        this.selectedComponents.clear();
        this.renderComponents();
        this.updateBatchButtons();

        const actionText = action === 'start' ? '启动' : '停止';
        console.log(`批量操作完成: 成功${actionText} ${successCount}/${components.length} 个组件`);
        // 使用轻量级通知替代弹窗
        this.showNotification(`成功${actionText} ${successCount} 个组件`, 'success');
    }

    // 直接执行批量停止（无确认弹窗）
    executeBatchStop() {
        console.log('=== 直接执行批量停止 ===');
        
        // 获取选中的组件
        const selectedComponents = Array.from(this.selectedComponents).map(id => {
            // 使用多种匹配方式查找组件
            let component = this.components.find(c => c.id === id);
            if (!component) {
                component = this.components.find(c => String(c.id) === String(id));
            }
            if (!component) {
                component = this.components.find(c => Number(c.id) === Number(id));
            }
            return component;
        }).filter(Boolean);

        console.log('选中的组件:', selectedComponents.map(c => c.name));

        if (selectedComponents.length === 0) {
            this.showNotification('请先选择要停止的组件', 'warning');
            return;
        }

        // 直接执行停止操作
        let successCount = 0;
        selectedComponents.forEach(component => {
            try {
                console.log(`停止组件: ${component.name} (ID: ${component.id})`);
                this.stopComponent(component.id);
                successCount++;
            } catch (error) {
                console.error(`停止组件 ${component.name} 失败:`, error);
            }
        });

        // 清空选择并更新界面
        this.selectedComponents.clear();
        this.renderComponents();
        this.updateBatchButtons();

        console.log(`批量停止完成: 成功停止 ${successCount}/${selectedComponents.length} 个组件`);
        
        // 显示简单的成功提示
        if (successCount > 0) {
            // 创建一个简单的提示，不是弹窗
            this.showNotification(`成功停止 ${successCount} 个组件`, 'success');
        }
    }

    // 导出组件信息
    exportComponents() {
        const data = this.filteredComponents.map(component => ({
            名称: component.name,
            类型: component.type,
            状态: this.getStatusText(component.status),
            环境: component.environment,
            地址: component.url,
            端口: component.port,
            CPU使用率: component.cpu + '%',
            内存使用: component.memory + 'MB',
            运行时间: component.uptime,
            描述: component.description
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `业务组件_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 转换为CSV格式
    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        return '\ufeff' + csvContent; // 添加BOM以支持中文
    }

    // 显示组件详情
    showComponentDetail(componentId) {
        console.log('=== 显示组件详情方法被调用 ===');
        console.log('componentId:', componentId, '类型:', typeof componentId);
        console.log('当前组件数据:', this.components);
        console.log('当前过滤组件数据:', this.filteredComponents);
        
        // 尝试不同的ID匹配方式，处理类型转换问题
        let component = this.components.find(c => c.id === componentId);
        if (!component) {
            // 尝试字符串比较
            component = this.components.find(c => String(c.id) === String(componentId));
        }
        if (!component) {
            // 尝试数字比较
            component = this.components.find(c => Number(c.id) === Number(componentId));
        }
        console.log('找到的组件:', component);
        
        if (!component) {
            console.error('未找到组件:', componentId);
            console.error('当前组件数据状态:');
            console.error('- 总组件数:', this.components.length);
            console.error('- 过滤组件数:', this.filteredComponents.length);
            console.error('- 当前业务:', this.currentBusiness);
            console.error('- 当前模块:', this.currentModule);
            
            // 提供更详细的错误信息
            if (this.components.length === 0) {
                alert('当前没有加载任何组件数据，请先选择一个业务或刷新页面重试');
            } else {
                alert(`未找到ID为 ${componentId} 的组件。当前共有 ${this.components.length} 个组件。`);
            }
            return;
        }

        this.currentComponent = component;
        
        // 检查模态框元素是否存在
        const modalElement = document.getElementById('componentDetailModal');
        if (!modalElement) {
            console.error('未找到组件详情模态框元素');
            alert(`组件详情：
名称：${component.name}
类型：${component.type}
状态：${component.status}
环境：${component.environment}
端口：${component.port}
地址：${component.url}`);
            return;
        }
        
        document.getElementById('componentDetailTitle').textContent = `${component.name} - 详情`;

        // 填充基本信息
        this.fillBasicInfo(component);
        this.fillStatusIndicators(component);
        this.fillPerformanceMetrics(component);
        this.fillDependencyList(component);

        // 显示模态框
        modalElement.classList.add('show');

        // 默认显示概览标签页
        this.switchTab('overview');
        
        console.log('组件详情显示完成');
    }

    // 填充基本信息
    fillBasicInfo(component) {
        const typeLabels = {
            'web': 'Web服务',
            'api': 'API服务',
            'database': '数据库',
            'cache': '缓存',
            'queue': '消息队列',
            'microservice': '微服务'
        };

        const envLabels = {
            'prod': '生产环境',
            'test': '测试环境',
            'dev': '开发环境'
        };

        document.getElementById('basicInfo').innerHTML = `
            <div class="info-item">
                <span class="info-label">组件名称:</span>
                <span class="info-value">${component.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">组件类型:</span>
                <span class="info-value">${typeLabels[component.type]}</span>
            </div>
            <div class="info-item">
                <span class="info-label">部署环境:</span>
                <span class="info-value">${envLabels[component.environment]}</span>
            </div>
            <div class="info-item">
                <span class="info-label">服务地址:</span>
                <span class="info-value">${component.url}</span>
            </div>
            <div class="info-item">
                <span class="info-label">服务端口:</span>
                <span class="info-value">${component.port}</span>
            </div>
            <div class="info-item">
                <span class="info-label">组件描述:</span>
                <span class="info-value">${component.description}</span>
            </div>
        `;
    }

    // 填充状态指示器
    fillStatusIndicators(component) {
        const indicators = [
            {
                label: '服务状态',
                status: component.status === 'running' ? 'healthy' :
                       component.status === 'error' ? 'error' : 'warning',
                text: this.getStatusText(component.status)
            },
            {
                label: '健康检查',
                status: component.status === 'running' ? 'healthy' : 'error',
                text: component.status === 'running' ? '正常' : '异常'
            },
            {
                label: '连接状态',
                status: component.status === 'running' ? 'healthy' : 'error',
                text: component.status === 'running' ? '已连接' : '连接失败'
            }
        ];

        document.getElementById('statusIndicators').innerHTML = indicators.map(indicator => `
            <div class="status-indicator ${indicator.status}">
                <i class="fas fa-circle"></i>
                <span>${indicator.label}: ${indicator.text}</span>
            </div>
        `).join('');
    }

    // 填充性能指标
    fillPerformanceMetrics(component) {
        document.getElementById('performanceMetrics').innerHTML = `
            <div class="metric-item">
                <div class="metric-value">${component.cpu}%</div>
                <div class="metric-label">CPU使用率</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${component.memory}MB</div>
                <div class="metric-label">内存使用</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${Math.floor(Math.random() * 100)}ms</div>
                <div class="metric-label">响应时间</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${component.uptime}</div>
                <div class="metric-label">运行时间</div>
            </div>
        `;
    }

    // 填充依赖关系
    fillDependencyList(component) {
        const dependencies = [
            { name: 'MySQL数据库', status: 'connected' },
            { name: 'Redis缓存', status: 'connected' },
            { name: '消息队列', status: component.status === 'running' ? 'connected' : 'disconnected' },
            { name: '配置中心', status: 'connected' }
        ];

        document.getElementById('dependencyList').innerHTML = dependencies.map(dep => `
            <div class="dependency-item">
                <div class="dependency-status ${dep.status}"></div>
                <span>${dep.name}</span>
                <span style="margin-left: auto; font-size: 12px; color: #64748b;">
                    ${dep.status === 'connected' ? '已连接' : '连接失败'}
                </span>
            </div>
        `).join('');
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新标签页内容
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // 根据标签页加载相应内容
        switch (tabName) {
            case 'monitoring':
                this.loadMonitoringCharts();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'config':
                this.loadConfig();
                break;
        }
    }

    // 加载监控图表
    loadMonitoringCharts() {
        // 这里可以集成真实的图表库，如Chart.js
        console.log('加载监控图表');
        // 模拟图表数据
        this.drawSimpleChart('cpuChart', 'CPU使用率');
        this.drawSimpleChart('memoryChart', '内存使用率');
        this.drawSimpleChart('networkChart', '网络流量');
        this.drawSimpleChart('responseChart', '响应时间');
    }

    // 绘制简单图表
    drawSimpleChart(canvasId, title) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制简单的折线图
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const points = 20;
        for (let i = 0; i < points; i++) {
            const x = (canvas.width / points) * i;
            const y = canvas.height - (Math.random() * canvas.height * 0.8 + canvas.height * 0.1);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    // 加载日志
    loadLogs() {
        const logs = [
            { time: '2024-01-15 10:30:15', level: 'info', message: '服务启动成功' },
            { time: '2024-01-15 10:30:20', level: 'info', message: '数据库连接建立' },
            { time: '2024-01-15 10:35:42', level: 'warn', message: '内存使用率较高: 85%' },
            { time: '2024-01-15 10:40:18', level: 'error', message: '连接超时: timeout after 30s' },
            { time: '2024-01-15 10:45:33', level: 'info', message: '处理请求: GET /api/users' },
            { time: '2024-01-15 10:50:12', level: 'debug', message: '缓存命中率: 92%' }
        ];

        document.getElementById('logsContent').innerHTML = logs.map(log => `
            <div class="log-entry ${log.level}">
                [${log.time}] [${log.level.toUpperCase()}] ${log.message}
            </div>
        `).join('');
    }

    // 加载配置
    loadConfig() {
        const config = {
            server: {
                port: this.currentComponent?.port || 8080,
                host: '0.0.0.0',
                timeout: 30000
            },
            database: {
                host: 'localhost',
                port: 3306,
                name: 'business_db',
                pool: {
                    min: 5,
                    max: 20
                }
            },
            cache: {
                host: 'localhost',
                port: 6379,
                ttl: 3600
            },
            logging: {
                level: 'info',
                file: '/var/log/app.log'
            }
        };

        document.getElementById('configContent').value = JSON.stringify(config, null, 2);
    }

    // 刷新日志
    refreshLogs() {
        this.loadLogs();
        console.log('日志已刷新');
    }

    // 保存配置
    saveConfig() {
        const config = document.getElementById('configContent').value;
        try {
            JSON.parse(config); // 验证JSON格式
            console.log('配置已保存:', config);
            alert('配置保存成功');
        } catch (error) {
            alert('配置格式错误，请检查JSON语法');
        }
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
            if (targetPage === '业务管理.html') {
                console.log('当前已在业务管理页面');
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

// 检查地址和端口冲突
function checkAddressPortConflict(url, port, excludeId = null) {
    console.log('=== 检查地址端口冲突 ===');
    console.log('检查地址:', url);
    console.log('检查端口:', port);
    console.log('排除ID:', excludeId);
    
    if (!url || !port) {
        console.log('地址或端口为空，跳过冲突检查');
        return null;
    }
    
    // 标准化URL（移除协议、路径等，只保留主机部分）
    const normalizeUrl = (inputUrl) => {
        try {
            // 如果是完整URL
            if (inputUrl.includes('://')) {
                const urlObj = new URL(inputUrl);
                return urlObj.hostname || urlObj.host;
            }
            // 如果是IP地址或域名
            return inputUrl.split(':')[0]; // 移除可能的端口号
        } catch (e) {
            // 如果解析失败，直接返回原始值
            return inputUrl.split(':')[0];
        }
    };
    
    const normalizedUrl = normalizeUrl(url);
    console.log('标准化后的地址:', normalizedUrl);
    
    // 在当前业务的所有组件中查找冲突
    const allComponents = window.businessManager ? window.businessManager.components : [];
    console.log('检查组件总数:', allComponents.length);
    
    for (const component of allComponents) {
        // 排除当前编辑的组件
        if (excludeId && String(component.id) === String(excludeId)) {
            continue;
        }
        
        if (component.url && component.port) {
            const componentNormalizedUrl = normalizeUrl(component.url);
            const componentPort = parseInt(component.port);
            
            console.log(`检查组件 ${component.name}:`, {
                原始地址: component.url,
                标准化地址: componentNormalizedUrl,
                端口: componentPort
            });
            
            // 如果地址相同且端口相同，则冲突
            if (componentNormalizedUrl === normalizedUrl && componentPort === parseInt(port)) {
                console.log('发现冲突:', component.name);
                return {
                    id: component.id,
                    name: component.name,
                    url: component.url,
                    port: component.port
                };
            }
        }
    }
    
    console.log('未发现冲突');
    return null;
}

// 删除重复的closeModal函数定义

async function saveComponent() {
    console.log('=== 保存组件开始 ===');
    
    const form = document.getElementById('componentForm');
    const modal = document.getElementById('addComponentModal');
    const editId = modal.dataset.editId;

    console.log('编辑ID:', editId);
    console.log('当前业务ID:', businessManager.currentBusiness);

    // 验证表单
    if (!form.checkValidity()) {
        console.log('表单验证失败');
        form.reportValidity();
        return;
    }
    
    console.log('表单验证通过');

    const componentData = {
        name: document.getElementById('componentName').value,
        type: document.getElementById('componentType').value,
        environment: document.getElementById('componentEnv').value,
        port: parseInt(document.getElementById('componentPort').value) || 8080,
        url: document.getElementById('componentUrl').value,
        description: document.getElementById('componentDescription').value,
        status: 'stopped',
        uptime: '未启动',
        cpuUsage: 0,
        memoryUsage: 0
    };

    // 检查地址和端口冲突
    const conflict = checkAddressPortConflict(componentData.url, componentData.port, editId);
    if (conflict) {
        const mode = editId ? '编辑' : '添加';
        alert(`地址和端口冲突！\n已存在组件：${conflict.name}\n地址：${conflict.url}\n端口：${conflict.port}\n\n无法${mode}组件，请修改地址或端口后重试。`);
        return;
    }

    try {
        if (editId) {
            // 编辑模式 - 调用后端更新API
            const response = await fetch(`/api/business-component/update/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(componentData)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || '更新失败');
            }

            // 更新前端数据
            const component = businessManager.components.find(c => String(c.id) === String(editId));
            if (component) {
                Object.assign(component, result.data);
                console.log('更新组件成功:', component.name);
            }
        } else {
            // 新增模式 - 调用后端创建API
            // 需要添加businessId，优先使用 currentModule（子业务）
            const targetBusinessId = businessManager.currentModule || businessManager.currentBusiness;
            if (targetBusinessId) {
                componentData.businessId = parseInt(targetBusinessId);
                console.log('设置组件业务ID为:', componentData.businessId);
            } else {
                throw new Error('请先选择一个业务');
            }

            const response = await fetch('/api/business-component/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(componentData)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || '创建失败');
            }

            // 添加到前端数据
            businessManager.components.push(result.data);
            console.log('添加组件成功:', result.data.name);
        }

        // 更新前端显示
        businessManager.filteredComponents = [...businessManager.components];
        businessManager.renderComponents();
        businessManager.updateStats();
        closeModal('addComponentModal');
        
        // 显示成功提示
        if (businessManager.showNotification) {
            businessManager.showNotification(editId ? '组件更新成功' : '组件添加成功', 'success');
        }

    } catch (error) {
        console.error('保存组件失败:', error);
        alert(`保存组件失败: ${error.message}`);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('=== 开始初始化业务管理器 ===');
        window.businessManager = new BusinessManager();
        console.log('业务管理器实例创建完成');
        
        // 调用初始化方法
        await window.businessManager.init();
        console.log('=== 业务管理器初始化完成 ===');
        
        // 验证businessManager是否正确设置
        console.log('window.businessManager:', window.businessManager);
        console.log('businessManager方法检查:');
        console.log('- showComponentDetail:', typeof window.businessManager.showComponentDetail);
        console.log('- startComponent:', typeof window.businessManager.startComponent);
        console.log('- stopComponent:', typeof window.businessManager.stopComponent);
        console.log('- toggleSelectAll:', typeof window.businessManager.toggleSelectAll);
        
        // 验证按钮元素是否存在
        const selectAllBtn = document.getElementById('selectAllBtn');
        const batchStartBtn = document.getElementById('batchStartBtn');
        const batchStopBtn = document.getElementById('batchStopBtn');
        
        console.log('按钮元素检查:');
        console.log('- selectAllBtn:', selectAllBtn ? '存在' : '不存在');
        console.log('- batchStartBtn:', batchStartBtn ? '存在' : '不存在');
        console.log('- batchStopBtn:', batchStopBtn ? '存在' : '不存在');
        
        // 测试按钮点击事件
        if (selectAllBtn) {
            console.log('全选按钮事件监听器已绑定');
        } else {
            console.error('全选按钮不存在，无法绑定事件');
        }
        
    } catch (error) {
        console.error('=== 初始化业务管理器时出错 ===');
        console.error('错误详情:', error);
        console.error('错误堆栈:', error.stack);
        alert('页面初始化失败，请刷新重试');
    }
});

// 点击模态框背景关闭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// 全局函数，供HTML onclick事件调用
function closeModal(modalId) {
    if (window.businessManager) {
        window.businessManager.closeModal(modalId);
    } else {
        console.error('businessManager未初始化');
        alert('页面未完全加载，请稍后重试');
    }
}

function saveBusiness() {
    if (window.businessManager) {
        window.businessManager.saveBusiness();
    } else {
        console.error('businessManager未初始化');
        alert('页面未完全加载，请稍后重试');
    }
}


// 全局错误处理函数
function safeCall(methodName, ...args) {
    if (window.businessManager && typeof window.businessManager[methodName] === 'function') {
        try {
            return window.businessManager[methodName](...args);
        } catch (error) {
            console.error(`调用 ${methodName} 时出错:`, error);
            alert(`操作失败: ${error.message}`);
        }
    } else {
        console.error(`businessManager未初始化或方法 ${methodName} 不存在`);
        alert('页面未完全加载，请刷新页面重试');
    }
}

// 调试函数：测试全选功能
function debugSelectAllFunction() {
    console.log('=== 调试全选功能 ===');
    
    if (window.businessManager) {
        console.log('当前组件数据:');
        window.businessManager.filteredComponents.forEach((component, index) => {
            const normalizedId = String(component.id);
            const isSelected = window.businessManager.selectedComponents.has(normalizedId);
            console.log(`${index + 1}. ${component.name}:`, {
                原始ID: component.id,
                ID类型: typeof component.id,
                标准化ID: normalizedId,
                是否选中: isSelected
            });
        });
        
        console.log('selectedComponents内容:', Array.from(window.businessManager.selectedComponents));
        console.log('selectedComponents大小:', window.businessManager.selectedComponents.size);
        
        // 测试全选
        console.log('执行全选测试...');
        window.businessManager.toggleSelectAll();
        
        // 检查全选后的状态
        console.log('全选后的状态:');
        window.businessManager.filteredComponents.forEach((component, index) => {
            const normalizedId = String(component.id);
            const isSelected = window.businessManager.selectedComponents.has(normalizedId);
            console.log(`${index + 1}. ${component.name}: ${isSelected ? '✓选中' : '✗未选中'}`);
        });
    } else {
        console.error('businessManager不存在');
    }
}

// 调试函数：测试按钮功能
function debugButtonFunctions() {
    console.log('=== 调试按钮功能 ===');
    
    // 检查按钮元素
    const selectAllBtn = document.getElementById('selectAllBtn');
    const batchStartBtn = document.getElementById('batchStartBtn');
    const batchStopBtn = document.getElementById('batchStopBtn');
    
    console.log('按钮元素状态:');
    console.log('- 全选按钮:', selectAllBtn ? '存在' : '不存在', selectAllBtn);
    console.log('- 批量启动按钮:', batchStartBtn ? '存在' : '不存在', batchStartBtn);
    console.log('- 批量停止按钮:', batchStopBtn ? '存在' : '不存在', batchStopBtn);
    
    if (batchStartBtn) {
        console.log('- 批量启动按钮状态:', batchStartBtn.disabled ? '禁用' : '启用');
    }
    if (batchStopBtn) {
        console.log('- 批量停止按钮状态:', batchStopBtn.disabled ? '禁用' : '启用');
    }
    
    // 检查businessManager
    if (window.businessManager) {
        console.log('businessManager存在');
        console.log('- toggleSelectAll方法:', typeof window.businessManager.toggleSelectAll);
        console.log('- showBatchConfirm方法:', typeof window.businessManager.showBatchConfirm);
        
        // 手动测试全选功能
        console.log('手动测试全选功能...');
        try {
            window.businessManager.toggleSelectAll();
            console.log('全选功能调用成功');
        } catch (error) {
            console.error('全选功能调用失败:', error);
        }
    } else {
        console.error('businessManager不存在');
    }
}

// 调试函数：测试批量操作
function debugBatchOperation() {
    console.log('=== 调试批量操作 ===');
    
    if (window.businessManager) {
        const selectedIds = Array.from(window.businessManager.selectedComponents);
        console.log('选中的组件ID:', selectedIds);
        console.log('选中数量:', selectedIds.length);
        
        // 检查每个选中的ID能否找到对应的组件
        selectedIds.forEach(id => {
            const component1 = window.businessManager.components.find(c => c.id === id);
            const component2 = window.businessManager.components.find(c => String(c.id) === String(id));
            const component3 = window.businessManager.components.find(c => Number(c.id) === Number(id));
            
            console.log(`ID ${id}:`, {
                严格匹配: component1 ? component1.name : '未找到',
                字符串匹配: component2 ? component2.name : '未找到',
                数字匹配: component3 ? component3.name : '未找到'
            });
        });
        
        // 检查按钮状态
        const batchStartBtn = document.getElementById('batchStartBtn');
        const batchStopBtn = document.getElementById('batchStopBtn');
        console.log('批量启动按钮状态:', batchStartBtn ? !batchStartBtn.disabled : '按钮不存在');
        console.log('批量停止按钮状态:', batchStopBtn ? !batchStopBtn.disabled : '按钮不存在');
    } else {
        console.log('businessManager不存在');
    }
}

// 调试函数：测试组件选择
function debugComponentSelection() {
    console.log('=== 调试组件选择状态 ===');
    
    if (window.businessManager) {
        console.log('当前选中的组件ID:', Array.from(window.businessManager.selectedComponents));
        console.log('组件总数:', window.businessManager.components.length);
        console.log('过滤组件数:', window.businessManager.filteredComponents.length);
        
        // 检查每个组件的选择状态
        window.businessManager.filteredComponents.forEach(component => {
            const normalizedId = String(component.id);
            const isSelected = window.businessManager.selectedComponents.has(normalizedId);
            console.log(`组件 ${component.name} (ID: ${component.id}, 标准化: ${normalizedId}) - 选中: ${isSelected}`);
        });
    } else {
        console.log('businessManager不存在');
    }
}

// 调试函数：测试组件查找
function debugComponentSearch(componentId) {
    console.log('=== 调试组件查找 ===');
    console.log('传入的componentId:', componentId, '类型:', typeof componentId);
    
    if (window.businessManager) {
        console.log('businessManager存在');
        console.log('组件总数:', window.businessManager.components.length);
        console.log('所有组件ID:', window.businessManager.components.map(c => ({id: c.id, type: typeof c.id, name: c.name})));
        
        // 测试不同的查找方式
        const exact = window.businessManager.components.find(c => c.id === componentId);
        const string = window.businessManager.components.find(c => String(c.id) === String(componentId));
        const number = window.businessManager.components.find(c => Number(c.id) === Number(componentId));
        
        console.log('严格匹配结果:', exact);
        console.log('字符串匹配结果:', string);
        console.log('数字匹配结果:', number);
    } else {
        console.log('businessManager不存在');
    }
}

// 综合问题诊断函数
function diagnoseProblem() {
    console.log('=== 综合问题诊断 ===');
    
    // 1. 检查businessManager
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    console.log('✅ businessManager存在');
    
    // 2. 检查全选按钮元素
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (!selectAllBtn) {
        console.error('❌ 全选按钮元素不存在');
        return;
    }
    console.log('✅ 全选按钮元素存在:', selectAllBtn);
    
    // 3. 检查组件数据
    const componentCount = window.businessManager.filteredComponents.length;
    console.log('📊 当前组件数量:', componentCount);
    if (componentCount === 0) {
        console.error('❌ 没有组件数据，请先选择一个业务');
        return;
    }
    
    // 4. 手动测试全选按钮点击
    console.log('🔄 手动触发全选按钮点击...');
    selectAllBtn.click();
    
    // 5. 延迟检查结果
    setTimeout(() => {
        console.log('📋 检查全选结果:');
        console.log('   - 选中组件数量:', window.businessManager.selectedComponents.size);
        console.log('   - 选中的ID:', Array.from(window.businessManager.selectedComponents));
        
        // 6. 检查DOM元素
        const componentCards = document.querySelectorAll('.component-card');
        const selectedCards = document.querySelectorAll('.component-card.selected');
        const checkedBoxes = document.querySelectorAll('.card-checkbox:checked');
        
        console.log('🎯 DOM状态检查:');
        console.log('   - 总组件卡片:', componentCards.length);
        console.log('   - 选中的卡片:', selectedCards.length);
        console.log('   - 勾选的复选框:', checkedBoxes.length);
        
        // 7. 检查CSS样式是否加载
        if (componentCards.length > 0) {
            const firstCard = componentCards[0];
            const computedStyle = window.getComputedStyle(firstCard);
            console.log('🎨 CSS样式检查 (第一个卡片):');
            console.log('   - 边框颜色:', computedStyle.borderColor);
            console.log('   - 背景颜色:', computedStyle.backgroundColor);
            console.log('   - 阴影:', computedStyle.boxShadow);
        }
        
        // 8. 给出诊断结果
        if (window.businessManager.selectedComponents.size === componentCount) {
            console.log('✅ 全选功能正常工作');
            if (selectedCards.length === componentCount && checkedBoxes.length === componentCount) {
                console.log('✅ CSS样式正常应用');
            } else {
                console.log('❌ CSS样式可能有问题，建议强制刷新页面 (Ctrl+F5)');
            }
        } else {
            console.log('❌ 全选功能有问题');
        }
    }, 200);
}

// 测试CSS样式应用
function testCSSStyles() {
    console.log('=== 测试CSS样式应用 ===');
    
    if (!window.businessManager) {
        console.error('businessManager不存在');
        return;
    }
    
    // 1. 先执行全选
    console.log('1. 执行全选');
    window.businessManager.toggleSelectAll();
    
    // 2. 检查DOM元素的样式
    setTimeout(() => {
        console.log('2. 检查DOM元素样式');
        
        const componentCards = document.querySelectorAll('.component-card');
        console.log('找到组件卡片数量:', componentCards.length);
        
        componentCards.forEach((card, index) => {
            const checkbox = card.querySelector('.card-checkbox');
            const isSelected = card.classList.contains('selected');
            const isChecked = checkbox ? checkbox.checked : false;
            
            console.log(`组件 ${index + 1}:`, {
                hasSelectedClass: isSelected,
                checkboxChecked: isChecked,
                cardClasses: card.className,
                checkboxElement: checkbox ? '存在' : '不存在'
            });
            
            // 检查第一个组件的详细样式
            if (index === 0) {
                const computedStyle = window.getComputedStyle(card);
                console.log('第一个组件的计算样式:', {
                    borderColor: computedStyle.borderColor,
                    boxShadow: computedStyle.boxShadow,
                    backgroundColor: computedStyle.backgroundColor
                });
            }
        });
    }, 100);
}

// 简单的全选测试函数
function testSelectAll() {
    console.log('=== 简单全选测试 ===');
    
    if (!window.businessManager) {
        console.error('businessManager不存在');
        return;
    }
    
    const bm = window.businessManager;
    
    // 1. 检查当前状态
    console.log('1. 当前状态检查:');
    console.log('   - 过滤组件数量:', bm.filteredComponents.length);
    console.log('   - 选中组件数量:', bm.selectedComponents.size);
    
    if (bm.filteredComponents.length === 0) {
        console.error('没有组件可选择，请先选择一个业务');
        return;
    }
    
    // 2. 清空当前选择
    console.log('2. 清空当前选择');
    bm.selectedComponents.clear();
    
    // 3. 手动添加所有组件到选择集合
    console.log('3. 手动添加所有组件');
    bm.filteredComponents.forEach((component, index) => {
        const normalizedId = String(component.id);
        bm.selectedComponents.add(normalizedId);
        console.log(`   添加: ${component.name} (ID: ${normalizedId})`);
    });
    
    // 4. 检查添加后的状态
    console.log('4. 添加后状态:');
    console.log('   - 选中组件数量:', bm.selectedComponents.size);
    console.log('   - 选中的ID:', Array.from(bm.selectedComponents));
    
    // 5. 重新渲染
    console.log('5. 重新渲染组件');
    bm.renderComponents();
    
    // 6. 更新按钮状态
    console.log('6. 更新按钮状态');
    bm.updateBatchButtons();
    
    console.log('全选测试完成');
}

// 调试批量启动问题
function debugBatchStart() {
    console.log('=== 调试批量启动问题 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    console.log('📊 当前状态:');
    console.log('   - 总组件数:', window.businessManager.components.length);
    console.log('   - 过滤组件数:', window.businessManager.filteredComponents.length);
    console.log('   - 选中组件数:', window.businessManager.selectedComponents.size);
    console.log('   - 选中的ID:', Array.from(window.businessManager.selectedComponents));
    
    // 检查每个组件的状态和选择情况
    console.log('🔍 组件详细状态:');
    window.businessManager.filteredComponents.forEach((component, index) => {
        const normalizedId = String(component.id);
        const isSelected = window.businessManager.selectedComponents.has(normalizedId);
        console.log(`${index + 1}. ${component.name}:`, {
            ID: component.id,
            状态: component.status,
            是否选中: isSelected,
            标准化ID: normalizedId
        });
    });
    
    // 检查DOM中的选择状态
    console.log('🎯 DOM选择状态:');
    const checkedBoxes = document.querySelectorAll('.card-checkbox:checked');
    const selectedCards = document.querySelectorAll('.component-card.selected');
    console.log('   - 勾选的复选框数量:', checkedBoxes.length);
    console.log('   - 选中的卡片数量:', selectedCards.length);
    
    // 手动选择一个停止的组件进行测试
    const stoppedComponents = window.businessManager.filteredComponents.filter(c => c.status === 'stopped');
    if (stoppedComponents.length > 0) {
        console.log('🔄 手动选择一个停止的组件进行测试...');
        const testComponent = stoppedComponents[0];
        console.log('测试组件:', testComponent.name, '状态:', testComponent.status);
        
        // 清空当前选择
        window.businessManager.selectedComponents.clear();
        
        // 选择这个组件
        const normalizedId = String(testComponent.id);
        window.businessManager.selectedComponents.add(normalizedId);
        
        // 重新渲染
        window.businessManager.renderComponents();
        window.businessManager.updateBatchButtons();
        
        console.log('✅ 已选择组件:', testComponent.name);
        console.log('   - 选中组件数:', window.businessManager.selectedComponents.size);
        console.log('   - 批量启动按钮状态:', document.getElementById('batchStartBtn').disabled ? '禁用' : '启用');
        
        // 测试批量启动确认
        setTimeout(() => {
            console.log('🚀 测试批量启动确认...');
            window.businessManager.showBatchConfirm('start');
        }, 1000);
    } else {
        console.log('❌ 没有找到停止状态的组件');
    }
}

// 测试无弹窗的组件操作
function testNoPopupOperations() {
    console.log('=== 测试无弹窗的组件操作 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    const componentCount = window.businessManager.filteredComponents.length;
    console.log('📊 当前组件数量:', componentCount);
    
    if (componentCount === 0) {
        console.error('❌ 没有组件数据，请先选择一个业务');
        return;
    }
    
    // 1. 测试单个组件停止（无弹窗）
    console.log('🔄 测试单个组件停止...');
    const firstComponent = window.businessManager.filteredComponents[0];
    if (firstComponent) {
        console.log(`停止组件: ${firstComponent.name}`);
        window.businessManager.stopComponent(firstComponent.id);
        console.log('✅ 单个组件停止完成（应该没有弹窗）');
    }
    
    // 2. 测试批量停止（无弹窗）
    setTimeout(() => {
        console.log('🔄 测试批量停止...');
        
        // 选择几个组件
        window.businessManager.selectedComponents.clear();
        window.businessManager.filteredComponents.slice(0, 3).forEach(component => {
            window.businessManager.selectedComponents.add(String(component.id));
        });
        
        console.log('选中了', window.businessManager.selectedComponents.size, '个组件');
        window.businessManager.renderComponents();
        
        // 执行批量停止
        setTimeout(() => {
            window.businessManager.executeBatchStop();
            console.log('✅ 批量停止完成（应该只有轻量级通知，没有弹窗）');
        }, 100);
    }, 500);
}

// 测试批量停止功能
function testBatchStop() {
    console.log('=== 测试批量停止功能 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    const componentCount = window.businessManager.filteredComponents.length;
    console.log('📊 当前组件数量:', componentCount);
    
    if (componentCount === 0) {
        console.error('❌ 没有组件数据，请先选择一个业务');
        return;
    }
    
    // 1. 先全选所有组件
    console.log('🔄 全选所有组件');
    window.businessManager.selectedComponents.clear();
    window.businessManager.filteredComponents.forEach(component => {
        window.businessManager.selectedComponents.add(String(component.id));
    });
    window.businessManager.renderComponents();
    window.businessManager.updateBatchButtons();
    
    console.log('选中组件数量:', window.businessManager.selectedComponents.size);
    
    // 2. 测试批量停止
    setTimeout(() => {
        console.log('🛑 测试批量停止...');
        window.businessManager.executeBatchStop();
        
        // 3. 检查结果
        setTimeout(() => {
            const runningComponents = window.businessManager.components.filter(c => c.status === 'running');
            const stoppedComponents = window.businessManager.components.filter(c => c.status === 'stopped');
            
            console.log('📊 停止后状态统计:');
            console.log('   - 运行中组件:', runningComponents.length);
            console.log('   - 已停止组件:', stoppedComponents.length);
            console.log('   - 选中组件数量:', window.businessManager.selectedComponents.size);
            
            if (window.businessManager.selectedComponents.size === 0) {
                console.log('✅ 批量停止功能正常！选择已清空');
            } else {
                console.log('❌ 批量停止后选择没有清空');
            }
        }, 200);
    }, 100);
}

// 测试修复后的全选功能
function testFixedSelectAll() {
    console.log('=== 测试修复后的全选功能 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    const componentCount = window.businessManager.filteredComponents.length;
    console.log('📊 当前组件数量:', componentCount);
    
    if (componentCount === 0) {
        console.error('❌ 没有组件数据，请先选择一个业务');
        return;
    }
    
    // 确保开始时没有选中任何组件
    console.log('🔄 清空当前选择');
    window.businessManager.selectedComponents.clear();
    window.businessManager.renderComponents();
    
    // 等待一下再测试全选
    setTimeout(() => {
        console.log('🎯 测试全选功能...');
        console.log('点击前选中数量:', window.businessManager.selectedComponents.size);
        
        // 手动调用全选方法（避免DOM事件问题）
        window.businessManager.toggleSelectAll();
        
        setTimeout(() => {
            const selectedCount = window.businessManager.selectedComponents.size;
            console.log('点击后选中数量:', selectedCount);
            
            if (selectedCount === componentCount) {
                console.log('✅ 全选功能正常！');
                
                // 检查DOM状态
                const selectedCards = document.querySelectorAll('.component-card.selected');
                const checkedBoxes = document.querySelectorAll('.card-checkbox:checked');
                
                console.log('🎯 DOM检查:');
                console.log('   - 选中的卡片:', selectedCards.length);
                console.log('   - 勾选的复选框:', checkedBoxes.length);
                
                if (selectedCards.length === componentCount && checkedBoxes.length === componentCount) {
                    console.log('✅ 页面显示也正常！');
                } else {
                    console.log('❌ 页面显示有问题，可能是CSS问题');
                    console.log('建议运行: refreshCSS()');
                }
            } else {
                console.log('❌ 全选功能仍有问题');
            }
        }, 100);
    }, 100);
}

// 测试地址端口冲突检查
function testAddressPortConflict() {
    console.log('=== 测试地址端口冲突检查 ===');
    
    if (!window.businessManager || !window.businessManager.components) {
        console.error('❌ businessManager或组件数据不存在');
        return;
    }
    
    console.log('📊 当前组件列表:');
    window.businessManager.components.forEach(comp => {
        console.log(`  - ${comp.name}: ${comp.url}:${comp.port}`);
    });
    
    // 测试用例
    const testCases = [
        {
            name: '测试1: 完全相同的地址和端口',
            url: 'http://user-auth:8080',
            port: 8080,
            expectConflict: true
        },
        {
            name: '测试2: 相同IP不同端口',
            url: 'http://user-auth:8081',
            port: 8081,
            expectConflict: false
        },
        {
            name: '测试3: 不同地址相同端口',
            url: 'http://order-api:8080',
            port: 8080,
            expectConflict: false
        },
        {
            name: '测试4: IP地址格式',
            url: '192.168.1.100',
            port: 8080,
            expectConflict: false
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`\n🧪 ${testCase.name}`);
        console.log(`   输入: ${testCase.url}:${testCase.port}`);
        
        const conflict = checkAddressPortConflict(testCase.url, testCase.port);
        const hasConflict = conflict !== null;
        
        console.log(`   结果: ${hasConflict ? '冲突' : '无冲突'}`);
        if (conflict) {
            console.log(`   冲突组件: ${conflict.name} (${conflict.url}:${conflict.port})`);
        }
        
        const result = hasConflict === testCase.expectConflict ? '✅ 通过' : '❌ 失败';
        console.log(`   预期: ${testCase.expectConflict ? '冲突' : '无冲突'} - ${result}`);
    });
    
    console.log('\n🎯 测试完成！');
}

// 强制重置添加组件状态
function resetAddComponentState() {
    console.log('=== 强制重置添加组件状态 ===');
    
    // 1. 重置模态框
    const modal = document.getElementById('addComponentModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        delete modal.dataset.editId;
        console.log('✅ 模态框状态已重置');
    }
    
    // 2. 重置表单
    const form = document.getElementById('componentForm');
    if (form) {
        form.reset();
        console.log('✅ 表单已重置');
    }
    
    // 3. 恢复背景滚动
    document.body.style.overflow = 'auto';
    
    // 4. 更新按钮状态
    if (window.businessManager) {
        window.businessManager.updateAddComponentButton();
        console.log('✅ 按钮状态已更新');
        
        const addBtn = document.getElementById('addComponentBtn');
        if (addBtn) {
            console.log('🔘 按钮当前状态:');
            console.log('   - 禁用:', addBtn.disabled);
            console.log('   - 标题:', addBtn.title);
        }
    }
    
    console.log('🎉 状态重置完成，现在可以正常使用添加组件功能');
}

// 调试添加组件状态重置问题
function debugAddComponentState() {
    console.log('=== 调试添加组件状态重置问题 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 1. 检查当前状态
    console.log('📊 当前状态:');
    console.log('   - currentBusiness:', window.businessManager.currentBusiness);
    console.log('   - currentModule:', window.businessManager.currentModule);
    
    // 2. 检查模态框状态
    const modal = document.getElementById('addComponentModal');
    console.log('📋 模态框状态:');
    console.log('   - 模态框存在:', modal ? '是' : '否');
    if (modal) {
        console.log('   - 模态框可见:', modal.classList.contains('show'));
        console.log('   - 编辑ID:', modal.dataset.editId);
        console.log('   - 模态框类名:', modal.className);
    }
    
    // 3. 检查按钮状态
    const addBtn = document.getElementById('addComponentBtn');
    console.log('🔘 添加组件按钮:');
    console.log('   - 按钮存在:', addBtn ? '是' : '否');
    if (addBtn) {
        console.log('   - 按钮禁用:', addBtn.disabled);
        console.log('   - 按钮标题:', addBtn.title);
        console.log('   - 事件监听器:', addBtn.onclick ? '有onclick' : '无onclick');
    }
    
    // 4. 检查表单状态
    const form = document.getElementById('componentForm');
    console.log('📝 表单状态:');
    console.log('   - 表单存在:', form ? '是' : '否');
    if (form) {
        const formData = new FormData(form);
        console.log('   - 表单数据:');
        for (let [key, value] of formData.entries()) {
            console.log(`     ${key}: ${value}`);
        }
    }
    
    // 5. 强制重置状态
    console.log('🔄 强制重置状态...');
    if (modal) {
        modal.classList.remove('show');
        delete modal.dataset.editId;
        console.log('   - 已隐藏模态框并清除编辑ID');
    }
    
    if (form) {
        form.reset();
        console.log('   - 已重置表单');
    }
    
    // 6. 更新按钮状态
    window.businessManager.updateAddComponentButton();
    console.log('   - 已更新按钮状态');
    
    // 7. 测试点击
    if (addBtn && !addBtn.disabled) {
        console.log('🔄 测试按钮点击...');
        setTimeout(() => {
            addBtn.click();
            setTimeout(() => {
                const modalVisible = modal && modal.classList.contains('show');
                console.log('   - 点击结果:', modalVisible ? '模态框显示' : '模态框未显示');
            }, 100);
        }, 100);
    }
}

// 专门调试用户服务添加组件问题
function debugUserServiceAddComponent() {
    console.log('=== 调试用户服务添加组件问题 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 1. 检查当前状态
    console.log('📊 当前状态:');
    console.log('   - 当前业务ID:', window.businessManager.currentBusiness);
    console.log('   - 当前模块ID:', window.businessManager.currentModule);
    
    // 2. 检查是否在用户服务
    if (String(window.businessManager.currentBusiness) !== '29') {
        console.log('⚠️ 当前不在用户服务，自动切换到用户服务...');
        window.businessManager.selectBusiness(29);
        
        setTimeout(() => {
            debugUserServiceAddComponent();
        }, 1000);
        return;
    }
    
    console.log('✅ 当前在用户服务 (ID: 29)');
    
    // 3. 检查业务数据
    const userServiceData = window.businessManager.businessData.find(b => 
        String(b.id) === '29'
    );
    console.log('   - 用户服务数据:', userServiceData);
    
    if (userServiceData) {
        const hasChildren = userServiceData.children && userServiceData.children.length > 0;
        console.log('   - 是否为父业务:', hasChildren);
        console.log('   - 应该可以添加组件:', !hasChildren);
    }
    
    // 4. 检查添加组件按钮
    const addBtn = document.getElementById('addComponentBtn');
    console.log('🔘 添加组件按钮状态:');
    console.log('   - 按钮存在:', addBtn ? '是' : '否');
    if (addBtn) {
        console.log('   - 按钮禁用:', addBtn.disabled);
        console.log('   - 按钮可见:', addBtn.offsetParent !== null);
        console.log('   - 按钮文本:', addBtn.textContent.trim());
        console.log('   - 按钮标题:', addBtn.title);
        
        // 检查按钮的事件监听器
        console.log('   - 点击事件:', addBtn.onclick ? '有onclick' : '无onclick');
    }
    
    // 5. 检查模态框
    const modal = document.getElementById('addComponentModal');
    console.log('📋 模态框状态:');
    console.log('   - 模态框存在:', modal ? '是' : '否');
    if (modal) {
        console.log('   - 模态框可见:', modal.classList.contains('show'));
    }
    
    // 6. 手动测试按钮功能
    if (addBtn && !addBtn.disabled) {
        console.log('🔄 手动测试按钮点击...');
        
        // 监听模态框变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.id === 'addComponentModal') {
                        console.log('📋 模态框状态变化:', target.classList.contains('show') ? '显示' : '隐藏');
                    }
                }
            });
        });
        
        if (modal) {
            observer.observe(modal, { attributes: true });
        }
        
        // 点击按钮
        try {
            console.log('   - 执行按钮点击...');
            addBtn.click();
            
            setTimeout(() => {
                observer.disconnect();
                const modalVisible = modal && modal.classList.contains('show');
                console.log('   - 点击结果: 模态框', modalVisible ? '已显示' : '未显示');
                
                if (!modalVisible) {
                    console.log('💡 建议检查:');
                    console.log('   1. 控制台是否有JavaScript错误');
                    console.log('   2. 运行: window.businessManager.showAddComponentModal(false)');
                    console.log('   3. 检查CSS样式是否正确加载');
                }
            }, 200);
        } catch (error) {
            console.error('   - 点击出错:', error);
            observer.disconnect();
        }
    } else {
        console.log('⚠️ 按钮被禁用或不存在');
        console.log('💡 尝试强制调用: window.businessManager.showAddComponentModal(false)');
    }
}

// 快速选择子业务进行测试
function selectChildBusinessForTest() {
    console.log('=== 快速选择子业务进行测试 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 找到当前父业务的第一个子业务
    const currentBusinessData = window.businessManager.businessData.find(b => 
        String(b.id) === String(window.businessManager.currentBusiness)
    );
    
    if (currentBusinessData && currentBusinessData.children && currentBusinessData.children.length > 0) {
        const firstChild = currentBusinessData.children[0];
        console.log('🎯 自动选择子业务:', firstChild.name, '(ID:', firstChild.id, ')');
        
        // 选择第一个子业务
        window.businessManager.selectBusiness(firstChild.id);
        
        setTimeout(() => {
            // 检查按钮状态
            const addBtn = document.getElementById('addComponentBtn');
            console.log('✅ 选择子业务后的状态:');
            console.log('   - 当前业务ID:', window.businessManager.currentBusiness);
            console.log('   - 添加组件按钮禁用:', addBtn ? addBtn.disabled : '按钮不存在');
            console.log('   - 按钮标题:', addBtn ? addBtn.title : '按钮不存在');
            
            if (addBtn && !addBtn.disabled) {
                console.log('🎉 现在可以点击添加组件按钮了！');
                console.log('💡 或者运行: testAddComponent()');
            }
        }, 500);
    } else {
        console.log('❌ 当前业务没有子业务');
    }
}

// 调试添加组件按钮问题
function debugAddComponentButton() {
    console.log('=== 调试添加组件按钮问题 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 1. 检查当前业务选择状态
    console.log('📊 当前状态:');
    console.log('   - 当前业务ID:', window.businessManager.currentBusiness);
    console.log('   - 当前模块ID:', window.businessManager.currentModule);
    
    // 2. 检查业务数据
    const currentBusinessData = window.businessManager.businessData.find(b => 
        String(b.id) === String(window.businessManager.currentBusiness)
    );
    console.log('   - 当前业务数据:', currentBusinessData);
    
    if (currentBusinessData) {
        const hasChildren = currentBusinessData.children && currentBusinessData.children.length > 0;
        console.log('   - 是否为父业务:', hasChildren);
        console.log('   - 子业务数量:', hasChildren ? currentBusinessData.children.length : 0);
    }
    
    // 3. 检查添加组件按钮
    const addBtn = document.getElementById('addComponentBtn');
    console.log('🔘 添加组件按钮检查:');
    console.log('   - 按钮存在:', addBtn ? '是' : '否');
    if (addBtn) {
        console.log('   - 按钮禁用:', addBtn.disabled);
        console.log('   - 按钮标题:', addBtn.title);
        console.log('   - 按钮样式:', addBtn.className);
        console.log('   - 按钮可见:', addBtn.offsetParent !== null);
    }
    
    // 4. 检查事件监听器
    console.log('🎧 事件监听器检查:');
    console.log('   - showAddComponentModal方法:', typeof window.businessManager.showAddComponentModal);
    
    // 5. 检查模态框
    const modal = document.getElementById('addComponentModal');
    console.log('📋 模态框检查:');
    console.log('   - 模态框存在:', modal ? '是' : '否');
    if (modal) {
        console.log('   - 模态框可见:', modal.classList.contains('show'));
        console.log('   - 模态框样式:', modal.className);
    }
    
    // 6. 手动测试按钮点击
    if (addBtn && !addBtn.disabled) {
        console.log('🔄 手动测试按钮点击...');
        try {
            addBtn.click();
            setTimeout(() => {
                const modalVisible = modal && modal.classList.contains('show');
                console.log('   - 点击后模态框显示:', modalVisible ? '是' : '否');
            }, 100);
        } catch (error) {
            console.error('   - 点击出错:', error);
        }
    } else {
        console.log('⚠️ 按钮被禁用或不存在，无法测试点击');
    }
    
    // 7. 给出建议
    console.log('💡 排查建议:');
    if (!window.businessManager.currentBusiness) {
        console.log('   - 请确保已选择业务');
    } else if (addBtn && addBtn.disabled) {
        console.log('   - 按钮被禁用，检查业务类型是否正确');
    } else if (!modal) {
        console.log('   - 模态框不存在，检查HTML结构');
    } else {
        console.log('   - 检查控制台是否有JavaScript错误');
    }
}

// 测试业务层级和添加组件权限
function testBusinessHierarchy() {
    console.log('=== 测试业务层级和添加组件权限 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    console.log('📊 业务数据分析:');
    window.businessManager.businessData.forEach(business => {
        const hasChildren = business.children && business.children.length > 0;
        const isCurrentBusiness = String(business.id) === String(window.businessManager.currentBusiness);
        
        console.log(`${isCurrentBusiness ? '👉' : '  '} ${business.name} (ID: ${business.id}):`, {
            类型: hasChildren ? '父业务' : '子业务',
            子业务数量: hasChildren ? business.children.length : 0,
            可添加组件: !hasChildren,
            当前选中: isCurrentBusiness
        });
        
        if (hasChildren) {
            business.children.forEach(child => {
                const isCurrentChild = String(child.id) === String(window.businessManager.currentBusiness);
                console.log(`${isCurrentChild ? '  👉' : '    '} └─ ${child.name} (ID: ${child.id}): 可添加组件`);
            });
        }
    });
    
    // 检查当前添加组件按钮状态
    const addBtn = document.getElementById('addComponentBtn');
    if (addBtn) {
        console.log('🔘 添加组件按钮状态:');
        console.log('   - 是否禁用:', addBtn.disabled);
        console.log('   - 提示信息:', addBtn.title);
    }
    
    console.log('💡 使用建议:');
    console.log('   - 父业务（如电商平台）：只能查看所有子业务的组件，不能直接添加');
    console.log('   - 子业务（如用户服务）：可以添加和管理自己的组件');
}

// 测试数据库字段修复
function testDatabaseFix() {
    console.log('=== 测试数据库字段修复 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    if (!window.businessManager.currentBusiness) {
        console.error('❌ 请先选择一个业务');
        return;
    }
    
    console.log('🔄 创建测试组件数据...');
    
    const testData = {
        name: '测试组件-' + Date.now(),
        type: 'api',
        environment: 'test',
        port: 8080,
        url: 'http://localhost:8080',
        description: '这是一个测试组件，用于验证数据库字段修复',
        status: 'stopped',
        uptime: '未启动',
        cpuUsage: 0,
        memoryUsage: 0,
        businessId: parseInt(window.businessManager.currentBusiness)
    };
    
    console.log('📤 发送测试数据到后端...');
    console.log('测试数据:', testData);
    
    fetch('/api/business-component/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    })
    .then(response => {
        console.log('📥 收到响应:', response.status, response.statusText);
        return response.json();
    })
    .then(result => {
        console.log('📋 响应结果:', result);
        if (result.success) {
            console.log('✅ 数据库字段修复成功！组件创建成功');
            console.log('新组件ID:', result.data.id);
            
            // 刷新组件列表
            if (window.businessManager.loadComponents) {
                window.businessManager.loadComponents(window.businessManager.currentBusiness);
            }
        } else {
            console.error('❌ 组件创建失败:', result.message);
        }
    })
    .catch(error => {
        console.error('❌ 请求失败:', error);
        console.log('💡 如果仍然出现字段错误，请确认已执行SQL脚本并重启应用');
    });
}

// 验证saveComponent函数
function verifySaveComponent() {
    console.log('=== 验证saveComponent函数 ===');
    
    // 检查函数是否存在
    if (typeof saveComponent === 'function') {
        console.log('✅ saveComponent函数存在');
    } else {
        console.error('❌ saveComponent函数不存在');
        return;
    }
    
    // 检查businessManager
    if (window.businessManager) {
        console.log('✅ businessManager存在');
        console.log('   - currentBusiness:', window.businessManager.currentBusiness);
    } else {
        console.error('❌ businessManager不存在');
    }
    
    // 检查表单元素
    const form = document.getElementById('componentForm');
    const modal = document.getElementById('addComponentModal');
    
    console.log('📋 表单元素检查:');
    console.log('   - componentForm:', form ? '存在' : '不存在');
    console.log('   - addComponentModal:', modal ? '存在' : '不存在');
    
    if (form) {
        const fields = [
            'componentName',
            'componentType', 
            'componentEnv',
            'componentPort',
            'componentUrl',
            'componentDescription'
        ];
        
        console.log('📝 表单字段检查:');
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            console.log(`   - ${fieldId}: ${field ? '存在' : '不存在'}`);
        });
    }
    
    console.log('🎯 现在可以尝试点击"添加组件"按钮测试功能');
}

// 测试添加组件功能
function testAddComponent() {
    console.log('=== 测试添加组件功能 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 1. 检查当前业务选择状态
    console.log('📊 当前状态检查:');
    console.log('   - 当前业务ID:', window.businessManager.currentBusiness);
    console.log('   - 当前模块ID:', window.businessManager.currentModule);
    console.log('   - 组件数量:', window.businessManager.components.length);
    
    if (!window.businessManager.currentBusiness) {
        console.error('❌ 没有选择业务，请先选择一个业务');
        return;
    }
    
    // 2. 检查添加组件按钮
    const addBtn = document.getElementById('addComponentBtn');
    if (!addBtn) {
        console.error('❌ 添加组件按钮不存在');
        return;
    }
    console.log('✅ 添加组件按钮存在');
    
    // 3. 检查模态框
    const modal = document.getElementById('addComponentModal');
    if (!modal) {
        console.error('❌ 添加组件模态框不存在');
        return;
    }
    console.log('✅ 添加组件模态框存在');
    
    // 4. 模拟点击添加组件按钮
    console.log('🔄 模拟点击添加组件按钮...');
    addBtn.click();
    
    // 5. 检查模态框是否显示
    setTimeout(() => {
        const isVisible = modal.classList.contains('show');
        console.log('模态框显示状态:', isVisible ? '✅ 显示' : '❌ 隐藏');
        
        if (isVisible) {
            console.log('🎯 可以手动填写表单并测试保存功能');
            console.log('   1. 填写组件名称');
            console.log('   2. 选择组件类型');
            console.log('   3. 填写其他信息');
            console.log('   4. 点击保存按钮');
            console.log('   5. 观察控制台输出和网络请求');
        }
    }, 100);
}

// 测试数据持久化功能
function testDataPersistence() {
    console.log('=== 测试数据持久化功能 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    const componentCount = window.businessManager.filteredComponents.length;
    console.log('📊 当前组件数量:', componentCount);
    
    if (componentCount === 0) {
        console.log('❌ 没有组件数据，请先选择一个业务');
        return;
    }
    
    // 1. 测试组件状态更新持久化
    console.log('🔄 测试组件状态更新持久化...');
    const testComponent = window.businessManager.filteredComponents[0];
    console.log('测试组件:', testComponent.name, '当前状态:', testComponent.status);
    
    // 切换状态
    const newStatus = testComponent.status === 'running' ? 'stopped' : 'running';
    console.log(`将组件状态从 ${testComponent.status} 改为 ${newStatus}`);
    
    if (newStatus === 'running') {
        window.businessManager.startComponent(testComponent.id);
    } else {
        window.businessManager.stopComponent(testComponent.id);
    }
    
    console.log('✅ 状态更新已发送到后端，请刷新页面验证数据是否持久化');
    
    // 2. 提示用户如何验证
    setTimeout(() => {
        console.log('🔍 验证步骤:');
        console.log('1. 等待几秒钟确保API调用完成');
        console.log('2. 刷新页面 (F5)');
        console.log('3. 选择相同的业务');
        console.log('4. 检查组件状态是否保持了刚才的更改');
        console.log('5. 如果状态保持不变，说明数据持久化成功！');
    }, 1000);
}

// 模拟用户手动选择组件的操作
function simulateManualSelection() {
    console.log('=== 模拟用户手动选择组件 ===');
    
    if (!window.businessManager) {
        console.error('❌ businessManager不存在');
        return;
    }
    
    // 1. 清空当前选择
    console.log('🔄 清空当前选择');
    window.businessManager.selectedComponents.clear();
    window.businessManager.renderComponents();
    window.businessManager.updateBatchButtons();
    
    // 2. 找到一些停止状态的组件
    const stoppedComponents = window.businessManager.filteredComponents.filter(c => c.status === 'stopped');
    console.log('📊 停止状态的组件:', stoppedComponents.map(c => c.name));
    
    if (stoppedComponents.length === 0) {
        console.log('❌ 没有停止状态的组件，先停止一些组件');
        // 停止前几个组件
        window.businessManager.filteredComponents.slice(0, 3).forEach(component => {
            window.businessManager.stopComponent(component.id);
        });
        
        // 重新获取停止的组件
        setTimeout(() => {
            simulateManualSelection();
        }, 100);
        return;
    }
    
    // 3. 手动选择前两个停止的组件
    console.log('🔄 手动选择前两个停止的组件');
    const componentsToSelect = stoppedComponents.slice(0, 2);
    
    componentsToSelect.forEach(component => {
        const normalizedId = String(component.id);
        console.log(`选择组件: ${component.name} (ID: ${normalizedId})`);
        
        // 模拟点击组件卡片
        window.businessManager.toggleComponentSelection(component.id, null);
    });
    
    // 4. 检查选择状态
    setTimeout(() => {
        console.log('📊 选择后的状态:');
        console.log('   - 选中组件数:', window.businessManager.selectedComponents.size);
        console.log('   - 选中的ID:', Array.from(window.businessManager.selectedComponents));
        console.log('   - 批量启动按钮状态:', document.getElementById('batchStartBtn').disabled ? '禁用' : '启用');
        
        // 5. 尝试批量启动
        if (window.businessManager.selectedComponents.size > 0) {
            console.log('🚀 尝试批量启动...');
            window.businessManager.showBatchConfirm('start');
        } else {
            console.log('❌ 没有选中任何组件');
        }
    }, 200);
}

// 强制刷新CSS的函数
function refreshCSS() {
    console.log('🔄 强制刷新CSS文件...');
    
    // 找到业务管理CSS文件的link标签
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
        if (link.href.includes('业务管理.css')) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href + '?v=' + Date.now();
            
            // 替换旧的CSS文件
            link.parentNode.insertBefore(newLink, link.nextSibling);
            link.parentNode.removeChild(link);
            
            console.log('✅ CSS文件已刷新:', newLink.href);
        }
    });
    
    // 等待CSS加载完成后重新渲染
    setTimeout(() => {
        if (window.businessManager) {
            window.businessManager.renderComponents();
            console.log('✅ 组件已重新渲染');
        }
    }, 100);
}

// businessManager将在DOMContentLoaded事件中初始化
