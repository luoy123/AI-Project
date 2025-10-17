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

    init() {
        this.initEventListeners();
        this.loadComponents(); // 先加载所有组件数据
        this.loadBusinessTree(); // 然后加载业务树并选择默认业务
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

        // 添加业务按钮
        document.getElementById('addBusinessBtn').addEventListener('click', () => {
            this.addBusiness();
        });

        // 批量操作按钮
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });
        document.getElementById('batchStartBtn').addEventListener('click', () => {
            this.showBatchConfirm('start');
        });
        document.getElementById('batchStopBtn').addEventListener('click', () => {
            this.showBatchConfirm('stop');
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

    // 加载业务树
    loadBusinessTree() {
        this.businessData = [
            {
                id: 'business-1',
                name: '电商平台',
                icon: 'fas fa-shopping-cart',
                description: '在线购物和电子商务平台',
                children: [
                    { id: 'module-1', name: '用户服务', icon: 'fas fa-users', businessId: 'business-1' },
                    { id: 'module-2', name: '订单服务', icon: 'fas fa-file-invoice', businessId: 'business-1' },
                    { id: 'module-3', name: '支付服务', icon: 'fas fa-credit-card', businessId: 'business-1' },
                    { id: 'module-4', name: '库存服务', icon: 'fas fa-warehouse', businessId: 'business-1' },
                    { id: 'module-5', name: '商品服务', icon: 'fas fa-box', businessId: 'business-1' },
                    { id: 'module-6', name: '购物车服务', icon: 'fas fa-shopping-basket', businessId: 'business-1' }
                ]
            },
            {
                id: 'business-2',
                name: '内容管理系统',
                icon: 'fas fa-file-alt',
                description: '企业内容管理和发布平台',
                children: [
                    { id: 'module-7', name: 'CMS核心', icon: 'fas fa-edit', businessId: 'business-2' },
                    { id: 'module-8', name: '媒体服务', icon: 'fas fa-images', businessId: 'business-2' },
                    { id: 'module-9', name: '文档管理', icon: 'fas fa-folder', businessId: 'business-2' },
                    { id: 'module-10', name: '权限管理', icon: 'fas fa-shield-alt', businessId: 'business-2' }
                ]
            },
            {
                id: 'business-3',
                name: '数据分析平台',
                icon: 'fas fa-chart-bar',
                description: '大数据分析和商业智能平台',
                children: [
                    { id: 'module-11', name: '数据采集', icon: 'fas fa-download', businessId: 'business-3' },
                    { id: 'module-12', name: '数据处理', icon: 'fas fa-cogs', businessId: 'business-3' },
                    { id: 'module-13', name: '报表服务', icon: 'fas fa-chart-line', businessId: 'business-3' },
                    { id: 'module-14', name: '实时分析', icon: 'fas fa-bolt', businessId: 'business-3' },
                    { id: 'module-15', name: '机器学习', icon: 'fas fa-brain', businessId: 'business-3' }
                ]
            },
            {
                id: 'business-4',
                name: '客户服务系统',
                icon: 'fas fa-headset',
                description: '客户支持和服务管理平台',
                children: [
                    { id: 'module-16', name: '工单系统', icon: 'fas fa-ticket-alt', businessId: 'business-4' },
                    { id: 'module-17', name: '在线客服', icon: 'fas fa-comments', businessId: 'business-4' },
                    { id: 'module-18', name: '知识库', icon: 'fas fa-book', businessId: 'business-4' },
                    { id: 'module-19', name: '客户管理', icon: 'fas fa-user-tie', businessId: 'business-4' }
                ]
            },
            {
                id: 'business-5',
                name: '财务管理系统',
                icon: 'fas fa-calculator',
                description: '企业财务和会计管理系统',
                children: [
                    { id: 'module-20', name: '账务核心', icon: 'fas fa-coins', businessId: 'business-5' },
                    { id: 'module-21', name: '发票管理', icon: 'fas fa-receipt', businessId: 'business-5' },
                    { id: 'module-22', name: '报表生成', icon: 'fas fa-file-excel', businessId: 'business-5' },
                    { id: 'module-23', name: '预算管理', icon: 'fas fa-piggy-bank', businessId: 'business-5' }
                ]
            },
            {
                id: 'business-6',
                name: '人力资源系统',
                icon: 'fas fa-users-cog',
                description: '人力资源管理和员工服务平台',
                children: [
                    { id: 'module-24', name: '员工管理', icon: 'fas fa-id-card', businessId: 'business-6' },
                    { id: 'module-25', name: '考勤系统', icon: 'fas fa-clock', businessId: 'business-6' },
                    { id: 'module-26', name: '薪资管理', icon: 'fas fa-money-bill-wave', businessId: 'business-6' },
                    { id: 'module-27', name: '招聘系统', icon: 'fas fa-user-plus', businessId: 'business-6' }
                ]
            }
        ];

        // 初始化展开状态
        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }

        // 默认展开第一个业务
        this.expandedNodes.add('business-1');

        const treeContainer = document.getElementById('businessTree');
        if (!treeContainer) {
            console.error('找不到业务树容器元素');
            return;
        }

        console.log('渲染业务树，业务数量:', this.businessData.length);
        console.log('展开的节点:', Array.from(this.expandedNodes));

        treeContainer.innerHTML = this.renderBusinessTree(this.businessData);

        // 默认选中第一个业务
        this.selectBusiness('business-1');
    }

    // 渲染业务树
    renderBusinessTree(data) {
        return data.map(business => `
            <div class="tree-node">
                <div class="tree-item ${business.id === this.currentBusiness ? 'active' : ''}"
                     onclick="businessManager.selectBusiness('${business.id}')">
                    <div class="tree-toggle" onclick="businessManager.toggleBusinessNode('${business.id}', event)">
                        <i class="fas fa-chevron-${this.expandedNodes?.has(business.id) ? 'down' : 'right'}"></i>
                    </div>
                    <i class="tree-icon ${business.icon}"></i>
                    <span>${business.name}</span>
                    <span class="business-count">(${business.children?.length || 0})</span>
                </div>
                ${business.children ? `
                    <div class="tree-children ${this.expandedNodes?.has(business.id) ? 'expanded' : ''}">
                        ${business.children.map(child => `
                            <div class="tree-item module-item ${this.currentModule === child.id ? 'active' : ''}"
                                 onclick="businessManager.selectModule('${child.id}')">
                                <div class="tree-spacer"></div>
                                <i class="tree-icon ${child.icon}"></i>
                                <span>${child.name}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // 选择业务
    selectBusiness(businessId) {
        this.currentBusiness = businessId;
        this.currentModule = null; // 清除模块选择

        // 初始化展开状态
        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }
        this.expandedNodes.add(businessId); // 自动展开选中的业务

        // 重新渲染业务树
        const treeContainer = document.getElementById('businessTree');
        treeContainer.innerHTML = this.renderBusinessTree(this.businessData);

        this.loadComponentsByBusiness(businessId);
        this.updateBreadcrumb();
    }

    // 选择模块
    selectModule(moduleId) {
        this.currentModule = moduleId;

        // 重新渲染业务树
        const treeContainer = document.getElementById('businessTree');
        treeContainer.innerHTML = this.renderBusinessTree(this.businessData);

        this.loadComponentsByModule(moduleId);
        this.updateBreadcrumb();
    }

    // 切换业务节点展开状态
    toggleBusinessNode(businessId, event) {
        event.stopPropagation();

        if (!this.expandedNodes) {
            this.expandedNodes = new Set();
        }

        if (this.expandedNodes.has(businessId)) {
            this.expandedNodes.delete(businessId);
        } else {
            this.expandedNodes.add(businessId);
        }

        // 重新渲染业务树
        const treeContainer = document.getElementById('businessTree');
        treeContainer.innerHTML = this.renderBusinessTree(this.businessData);
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
    loadComponents() {
        // 创建完整的组件数据
        this.allComponents = [
            // 电商平台组件
            {
                id: 'comp-1',
                name: '用户认证服务',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://auth.example.com',
                port: 8080,
                description: '处理用户登录、注册和权限验证',
                cpu: 15.2,
                memory: 256,
                uptime: '15天3小时',
                businessId: 'business-1',
                moduleId: 'module-1'
            },
            {
                id: 'comp-2',
                name: '商品管理API',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://product.example.com',
                port: 8081,
                description: '商品信息管理和查询接口',
                cpu: 8.7,
                memory: 512,
                uptime: '7天12小时',
                businessId: 'business-1',
                moduleId: 'module-5'
            },
            {
                id: 'comp-3',
                name: '订单处理服务',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://order.example.com',
                port: 8082,
                description: '订单创建、修改和状态管理',
                cpu: 12.3,
                memory: 768,
                uptime: '5天18小时',
                businessId: 'business-1',
                moduleId: 'module-2'
            },
            {
                id: 'comp-4',
                name: '支付网关',
                type: 'microservice',
                status: 'running',
                environment: 'prod',
                url: 'https://payment.example.com',
                port: 8083,
                description: '第三方支付接口网关',
                cpu: 18.5,
                memory: 768,
                uptime: '12天6小时',
                businessId: 'business-1',
                moduleId: 'module-3'
            },
            {
                id: 'comp-5',
                name: '库存管理服务',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://inventory.example.com',
                port: 8084,
                description: '商品库存管理和预警',
                cpu: 9.8,
                memory: 512,
                uptime: '8天14小时',
                businessId: 'business-1',
                moduleId: 'module-4'
            },
            {
                id: 'comp-6',
                name: '购物车服务',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://cart.example.com',
                port: 8085,
                description: '购物车管理和持久化',
                cpu: 6.4,
                memory: 384,
                uptime: '10天7小时',
                businessId: 'business-1',
                moduleId: 'module-6'
            },

            // 内容管理系统组件
            {
                id: 'comp-7',
                name: 'CMS核心服务',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://cms.example.com',
                port: 8090,
                description: '内容管理系统核心服务',
                cpu: 14.2,
                memory: 1024,
                uptime: '20天12小时',
                businessId: 'business-2',
                moduleId: 'module-7'
            },
            {
                id: 'comp-8',
                name: '媒体处理服务',
                type: 'microservice',
                status: 'running',
                environment: 'prod',
                url: 'https://media.example.com',
                port: 8091,
                description: '图片和视频处理服务',
                cpu: 28.7,
                memory: 2048,
                uptime: '15天8小时',
                businessId: 'business-2',
                moduleId: 'module-8'
            },
            {
                id: 'comp-9',
                name: '文档管理API',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://docs.example.com',
                port: 8092,
                description: '文档存储和版本管理',
                cpu: 7.3,
                memory: 512,
                uptime: '18天5小时',
                businessId: 'business-2',
                moduleId: 'module-9'
            },
            {
                id: 'comp-10',
                name: '权限管理服务',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://auth-cms.example.com',
                port: 8093,
                description: 'CMS权限和角色管理',
                cpu: 5.1,
                memory: 256,
                uptime: '22天16小时',
                businessId: 'business-2',
                moduleId: 'module-10'
            },

            // 数据分析平台组件
            {
                id: 'comp-11',
                name: '数据采集引擎',
                type: 'microservice',
                status: 'running',
                environment: 'prod',
                url: 'https://collector.example.com',
                port: 8100,
                description: '多源数据采集和清洗',
                cpu: 22.8,
                memory: 1536,
                uptime: '12天9小时',
                businessId: 'business-3',
                moduleId: 'module-11'
            },
            {
                id: 'comp-12',
                name: '数据处理平台',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://processor.example.com',
                port: 8101,
                description: 'ETL数据处理和转换',
                cpu: 35.6,
                memory: 4096,
                uptime: '8天14小时',
                businessId: 'business-3',
                moduleId: 'module-12'
            },
            {
                id: 'comp-13',
                name: '报表生成服务',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://reports.example.com',
                port: 8102,
                description: '动态报表生成和导出',
                cpu: 16.4,
                memory: 1024,
                uptime: '25天11小时',
                businessId: 'business-3',
                moduleId: 'module-13'
            },
            {
                id: 'comp-14',
                name: '实时分析引擎',
                type: 'microservice',
                status: 'error',
                environment: 'prod',
                url: 'https://realtime.example.com',
                port: 8103,
                description: '实时数据流分析处理',
                cpu: 0,
                memory: 0,
                uptime: '服务异常',
                businessId: 'business-3',
                moduleId: 'module-14'
            },
            {
                id: 'comp-15',
                name: '机器学习平台',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://ml.example.com',
                port: 8104,
                description: '机器学习模型训练和预测',
                cpu: 45.2,
                memory: 8192,
                uptime: '6天20小时',
                businessId: 'business-3',
                moduleId: 'module-15'
            },

            // 客户服务系统组件
            {
                id: 'comp-16',
                name: '工单管理系统',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://tickets.example.com',
                port: 8110,
                description: '客户工单创建和处理',
                cpu: 11.7,
                memory: 768,
                uptime: '30天5小时',
                businessId: 'business-4',
                moduleId: 'module-16'
            },
            {
                id: 'comp-17',
                name: '在线客服平台',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://chat.example.com',
                port: 8111,
                description: '实时在线客服聊天系统',
                cpu: 19.3,
                memory: 1024,
                uptime: '18天12小时',
                businessId: 'business-4',
                moduleId: 'module-17'
            },
            {
                id: 'comp-18',
                name: '知识库系统',
                type: 'api',
                status: 'running',
                environment: 'prod',
                url: 'https://kb.example.com',
                port: 8112,
                description: '客服知识库和FAQ管理',
                cpu: 8.9,
                memory: 512,
                uptime: '45天8小时',
                businessId: 'business-4',
                moduleId: 'module-18'
            },

            // 共享组件
            {
                id: 'comp-19',
                name: 'Redis缓存集群',
                type: 'cache',
                status: 'running',
                environment: 'prod',
                url: 'redis://cache.example.com',
                port: 6379,
                description: '高性能内存缓存服务',
                cpu: 3.2,
                memory: 1024,
                uptime: '60天8小时',
                businessId: null,
                moduleId: null
            },
            {
                id: 'comp-20',
                name: 'MySQL主库',
                type: 'database',
                status: 'running',
                environment: 'prod',
                url: 'mysql://db-master.example.com',
                port: 3306,
                description: '主数据库服务器',
                cpu: 25.6,
                memory: 4096,
                uptime: '90天15小时',
                businessId: null,
                moduleId: null
            },
            {
                id: 'comp-21',
                name: '消息队列集群',
                type: 'queue',
                status: 'running',
                environment: 'prod',
                url: 'amqp://mq.example.com',
                port: 5672,
                description: '异步消息处理队列',
                cpu: 12.1,
                memory: 512,
                uptime: '75天15小时',
                businessId: null,
                moduleId: null
            },
            {
                id: 'comp-22',
                name: '文件存储服务',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://files.example.com',
                port: 8200,
                description: '分布式文件存储服务',
                cpu: 8.2,
                memory: 1024,
                uptime: '40天12小时',
                businessId: null,
                moduleId: null
            },
            {
                id: 'comp-23',
                name: '监控告警中心',
                type: 'web',
                status: 'running',
                environment: 'prod',
                url: 'https://monitor.example.com',
                port: 3000,
                description: '系统监控和告警中心',
                cpu: 8.9,
                memory: 512,
                uptime: '120天14小时',
                businessId: null,
                moduleId: null
            }
        ];

        // 默认显示所有组件
        this.components = [...this.allComponents];
        this.filteredComponents = [...this.components];

        console.log('加载组件数据:', this.components.length, '个组件');

        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
    }

    // 根据业务加载组件
    loadComponentsByBusiness(businessId) {
        this.components = this.allComponents.filter(comp =>
            comp.businessId === businessId || comp.businessId === null
        );
        this.filteredComponents = [...this.components];
        this.applyFilters(); // 重新应用当前过滤器
        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
    }

    // 根据模块加载组件
    loadComponentsByModule(moduleId) {
        this.components = this.allComponents.filter(comp =>
            comp.moduleId === moduleId
        );
        this.filteredComponents = [...this.components];
        this.applyFilters(); // 重新应用当前过滤器
        this.renderComponents();
        this.updateStats();
        this.updateBatchButtons();
    }

    // 渲染组件
    renderComponents() {
        const container = document.getElementById('componentGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredComponents.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = this.filteredComponents.map(component => 
            this.renderComponentCard(component)
        ).join('');
    }

    // 渲染组件卡片
    renderComponentCard(component) {
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

        const isListView = this.currentView === 'list';

        return `
            <div class="component-card ${isListView ? 'list-view' : ''} ${this.selectedComponents.has(component.id) ? 'selected' : ''}"
                 data-id="${component.id}" onclick="businessManager.selectComponent('${component.id}', event)">
                <input type="checkbox" class="card-checkbox"
                       ${this.selectedComponents.has(component.id) ? 'checked' : ''}
                       onclick="businessManager.toggleComponentSelection('${component.id}', event)">
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
                    <button class="action-btn primary" onclick="businessManager.showComponentDetail('${component.id}')">详情</button>
                    ${component.status === 'running' ?
                        '<button class="action-btn danger" onclick="businessManager.stopComponent(\'' + component.id + '\')">停止</button>' :
                        '<button class="action-btn primary" onclick="businessManager.startComponent(\'' + component.id + '\')">启动</button>'
                    }
                    <button class="action-btn" onclick="businessManager.restartComponent('${component.id}')">重启</button>
                    <button class="action-btn" onclick="businessManager.editComponent('${component.id}')">编辑</button>
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
    showAddComponentModal() {
        document.getElementById('addComponentModal').classList.add('show');
    }

    // 添加业务
    addBusiness() {
        const name = prompt('请输入业务名称:');
        if (name && name.trim()) {
            console.log('添加业务:', name);
            // 这里可以实现添加业务的逻辑
        }
    }

    // 启动组件
    startComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            component.status = 'running';
            this.renderComponents();
            this.updateStats();
            console.log('启动组件:', component.name);
        }
    }

    // 停止组件
    stopComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            component.status = 'stopped';
            component.cpu = 0;
            component.memory = 0;
            component.uptime = '已停止';
            this.renderComponents();
            this.updateStats();
            console.log('停止组件:', component.name);
        }
    }

    // 重启组件
    restartComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            component.status = 'running';
            this.renderComponents();
            this.updateStats();
            console.log('重启组件:', component.name);
        }
    }

    // 编辑组件
    editComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            // 填充表单数据
            document.getElementById('componentName').value = component.name;
            document.getElementById('componentType').value = component.type;
            document.getElementById('componentEnv').value = component.environment;
            document.getElementById('componentPort').value = component.port;
            document.getElementById('componentUrl').value = component.url;
            document.getElementById('componentDescription').value = component.description;

            // 显示模态框
            this.showAddComponentModal();

            // 标记为编辑模式
            document.getElementById('addComponentModal').dataset.editId = componentId;
        }
    }

    // 删除组件
    deleteComponent(componentId) {
        if (confirm('确定要删除这个组件吗？')) {
            this.components = this.components.filter(c => c.id !== componentId);
            this.filteredComponents = this.filteredComponents.filter(c => c.id !== componentId);
            this.selectedComponents.delete(componentId);
            this.renderComponents();
            this.updateStats();
            this.updateBatchButtons();
            console.log('删除组件:', componentId);
        }
    }

    // 选择组件
    selectComponent(componentId, event) {
        if (event && event.target.type === 'checkbox') {
            return; // 如果点击的是复选框，不处理卡片选择
        }
        this.showComponentDetail(componentId);
    }

    // 切换组件选择状态
    toggleComponentSelection(componentId, event) {
        event.stopPropagation();
        if (this.selectedComponents.has(componentId)) {
            this.selectedComponents.delete(componentId);
        } else {
            this.selectedComponents.add(componentId);
        }
        this.renderComponents();
        this.updateBatchButtons();
    }

    // 全选/取消全选
    toggleSelectAll() {
        if (this.selectedComponents.size === this.filteredComponents.length) {
            this.selectedComponents.clear();
        } else {
            this.filteredComponents.forEach(component => {
                this.selectedComponents.add(component.id);
            });
        }
        this.renderComponents();
        this.updateBatchButtons();
    }

    // 更新批量操作按钮状态
    updateBatchButtons() {
        const hasSelection = this.selectedComponents.size > 0;
        document.getElementById('batchStartBtn').disabled = !hasSelection;
        document.getElementById('batchStopBtn').disabled = !hasSelection;

        const selectAllBtn = document.getElementById('selectAllBtn');
        if (this.selectedComponents.size === this.filteredComponents.length && this.filteredComponents.length > 0) {
            selectAllBtn.innerHTML = '<i class="fas fa-square"></i> 取消全选';
        } else {
            selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> 全选';
        }
    }

    // 显示批量操作确认
    showBatchConfirm(action) {
        const selectedComponents = Array.from(this.selectedComponents).map(id =>
            this.components.find(c => c.id === id)
        ).filter(Boolean);

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
        components.forEach(component => {
            if (action === 'start') {
                this.startComponent(component.id);
            } else if (action === 'stop') {
                this.stopComponent(component.id);
            }
        });

        this.selectedComponents.clear();
        this.renderComponents();
        this.updateBatchButtons();

        const actionText = action === 'start' ? '启动' : '停止';
        alert(`成功${actionText} ${components.length} 个组件`);
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
        const component = this.components.find(c => c.id === componentId);
        if (!component) return;

        this.currentComponent = component;
        document.getElementById('componentDetailTitle').textContent = `${component.name} - 详情`;

        // 填充基本信息
        this.fillBasicInfo(component);
        this.fillStatusIndicators(component);
        this.fillPerformanceMetrics(component);
        this.fillDependencyList(component);

        // 显示模态框
        document.getElementById('componentDetailModal').classList.add('show');

        // 默认显示概览标签页
        this.switchTab('overview');
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

// 全局函数
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    // 清理编辑模式标记
    delete document.getElementById(modalId).dataset.editId;
    // 清空表单
    document.getElementById('componentForm').reset();
}

function saveComponent() {
    const form = document.getElementById('componentForm');
    const modal = document.getElementById('addComponentModal');
    const editId = modal.dataset.editId;

    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const componentData = {
        name: document.getElementById('componentName').value,
        type: document.getElementById('componentType').value,
        environment: document.getElementById('componentEnv').value,
        port: parseInt(document.getElementById('componentPort').value) || 8080,
        url: document.getElementById('componentUrl').value,
        description: document.getElementById('componentDescription').value
    };

    if (editId) {
        // 编辑模式
        const component = businessManager.components.find(c => c.id === editId);
        if (component) {
            Object.assign(component, componentData);
            console.log('更新组件:', component.name);
        }
    } else {
        // 新增模式
        const newComponent = {
            id: 'comp-' + Date.now(),
            ...componentData,
            status: 'stopped',
            cpu: 0,
            memory: 0,
            uptime: '未启动'
        };
        businessManager.components.push(newComponent);
        console.log('添加组件:', newComponent.name);
    }

    businessManager.filteredComponents = [...businessManager.components];
    businessManager.renderComponents();
    businessManager.updateStats();
    closeModal('addComponentModal');
}

// 初始化应用
let businessManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('开始初始化业务管理器...');
        businessManager = new BusinessManager();
        console.log('业务管理器初始化完成');
    } catch (error) {
        console.error('初始化业务管理器时出错:', error);
    }
});

// 点击模态框背景关闭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});
