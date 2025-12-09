/**
 * 预测风险页面数据加载脚本（新版，风格与预测报告保持一致）
 */

const PredictionRisk = {
    currentFilters: {
        time: 1,
        status: '',
        target: '',
        keyword: ''
    },
    currentRisks: [],

    /**
     * 初始化预测风险页面
     */
    init: function() {
        console.log('\n========== 初始化预测风险页面 =========');

        const container = document.getElementById('page-stats-risk');
        if (!container) {
            console.warn('预测风险子页面容器不存在，跳过初始化');
            return;
        }

        this.bindEvents();
        this.loadRisks();
    },

    /**
     * 绑定筛选和搜索事件
     */
    bindEvents: function() {
        const timeFilter = document.getElementById('riskTimeFilter');
        const statusFilter = document.getElementById('riskStatusFilter');
        const targetFilter = document.getElementById('riskTargetFilter');
        const keywordInput = document.getElementById('riskKeyword');
        const searchBtn = document.getElementById('riskSearchBtn');

        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.currentFilters.time = parseInt(e.target.value, 10) || 1;
                console.log(`⏰ 风险预测时间筛选变更: ${this.currentFilters.time} 天`);
                this.loadRisks();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value || '';
                console.log(`🚦 风险状态筛选变更: ${this.currentFilters.status || '全部'}`);
                this.loadRisks();
            });
        }

        if (targetFilter) {
            targetFilter.addEventListener('change', (e) => {
                this.currentFilters.target = e.target.value || '';
                console.log(`🎯 监测对象筛选变更: ${this.currentFilters.target || '全部'}`);
                this.loadRisks();
            });
        }

        if (keywordInput && searchBtn) {
            const triggerSearch = () => {
                this.currentFilters.keyword = keywordInput.value.trim();
                console.log(`🔍 关键字搜索: ${this.currentFilters.keyword || '无'}`);
                this.loadRisks();
            };

            searchBtn.addEventListener('click', triggerSearch);
            keywordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    triggerSearch();
                }
            });
        }
    },

    /**
     * 加载预测风险数据
     */
    loadRisks: async function() {
        const params = new URLSearchParams();
        if (this.currentFilters.time) params.append('days', this.currentFilters.time);
        if (this.currentFilters.status) params.append('status', this.currentFilters.status);
        if (this.currentFilters.target) params.append('target', this.currentFilters.target);
        if (this.currentFilters.keyword) params.append('keyword', this.currentFilters.keyword);

        console.log('📡 加载预测风险数据, 参数:', Object.fromEntries(params.entries()));

        this.showLoading();

        try {
            const response = await fetch(`/api/prediction/data/risks?${params.toString()}`);
            const result = await response.json();
            console.log('预测风险数据返回:', result);

            if (result.code === 200 && Array.isArray(result.data)) {
                this.currentRisks = result.data;
                this.renderRiskStatistics(result.data || []);
                this.renderRiskList(result.data || []);
            } else {
                this.currentRisks = [];
                this.renderRiskStatistics([]);
                this.renderRiskList([]);
                this.showError('加载预测风险失败: ' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('加载预测风险失败:', error);
            this.currentRisks = [];
            this.renderRiskStatistics([]);
            this.renderRiskList([]);
            this.showError('加载预测风险失败: ' + error.message);
        }
    },

    /**
     * 渲染风险列表
     */
    renderRiskList: function(risks) {
        const container = document.getElementById('riskListContainer');
        const countDisplay = document.getElementById('riskCountDisplay');

        if (!container) {
            console.error('风险列表容器不存在');
            return;
        }

        if (countDisplay) {
            countDisplay.textContent = `共 ${risks.length} 条风险记录`;
        }

        if (!risks || risks.length === 0) {
            container.innerHTML = `
                <div style="background: white; border-radius: 12px; padding: 60px 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; margin-top: 8px;">
                    <div style="margin-bottom: 24px;">
                        <i class="fas fa-folder-open" style="font-size: 72px; color: #C0C4CC; opacity: 0.7;"></i>
                    </div>
                    <h3 style="color: #606266; margin-bottom: 12px; font-size: 20px;">暂无预测风险数据</h3>
                    <p style="color: #909399; font-size: 14px; line-height: 1.8; margin-bottom: 24px;">
                        当前筛选条件下未检测到任何风险记录<br>
                        系统运行正常，请继续保持关注。
                    </p>
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%); padding: 16px 20px; border-radius: 10px; display: inline-block;">
                        <div style="font-size: 13px; color: #606266;">
                            <i class="fas fa-lightbulb" style="color: #E6A23C; margin-right: 8px;"></i>
                            <strong>提示：</strong>
                        </div>
                        <div style="font-size: 12px; color: #909399; margin-top: 8px; text-align: left;">
                            • 可以尝试放宽预测时间范围<br>
                            • 可切换不同风险状态或监测对象查看<br>
                            • 如需确认风险规则，请联系管理员
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        let html = '<div class="risk-list" style="display: flex; flex-direction: column; gap: 16px;">';

        risks.forEach((risk) => {
            const riskLevelClass = this.getRiskLevelClass(risk.riskLevel);
            const riskLevelText = this.getRiskLevelText(risk.riskLevel);
            const statusBadge = this.getRiskStatusBadge(risk.status);
            const riskTime = risk.recentRiskTime ? this.formatDateTime(risk.recentRiskTime) : '-';

            html += `
                <div class="risk-item ${riskLevelClass}" style="background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border-left: 4px solid #e5e7eb;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                <i class="fas fa-exclamation-triangle" style="color:#f59e0b;"></i>
                                <span style="font-size:15px; font-weight:600; color:#1f2937;">
                                    ${risk.riskZone || '未知区域'} · ${risk.monitoringCategory || '未知类别'}
                                </span>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#6b7280;">
                                <span class="risk-level-badge" style="padding:2px 8px; border-radius:999px; background:#fef3c7; color:#92400e; font-weight:600;">
                                    ${riskLevelText}
                                </span>
                                <span>预测天数：${risk.predictionTime || '-'} 天</span>
                                <span>最近风险时间：${riskTime}</span>
                            </div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div style="font-size:13px; color:#4b5563; line-height:1.7; margin-top:6px;">
                        <strong>风险描述：</strong>${risk.riskDescription || '暂无描述'}
                    </div>
                    ${risk.delayShortcut ? `
                    <div style="font-size:13px; color:#4b5563; margin-top:4px;">
                        <strong>延迟快捷方式：</strong>${risk.delayShortcut}
                    </div>` : ''}
                    <div style="margin-top:14px; padding-top:12px; border-top:1px dashed #e5e7eb; display:flex; gap:8px; flex-wrap:wrap;">
                        <button type="button" style="border:none; padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; display:flex; align-items:center; gap:6px;" onclick="PredictionRisk.viewRiskDetail(${risk.id})">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                        <button type="button" style="border:none; padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; display:flex; align-items:center; gap:6px;" onclick="PredictionRisk.handleRisk(${risk.id})">
                            <i class="fas fa-tools"></i> 处理风险
                        </button>
                        ${risk.status === 'PENDING' ? `
                        <button type="button" style="border:none; padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; display:flex; align-items:center; gap:6px;" onclick="PredictionRisk.resolveRisk(${risk.id})">
                            <i class="fas fa-check"></i> 标记已解决
                        </button>` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * 渲染风险统计
     */
    renderRiskStatistics: function(risks) {
        const container = document.getElementById('riskStatisticsContainer');
        if (!container) {
            console.log('风险统计容器不存在，跳过渲染');
            return;
        }

        const total = risks.length;
        const high = risks.filter(r => r.riskLevel === 'HIGH').length;
        const medium = risks.filter(r => r.riskLevel === 'MEDIUM').length;
        const low = risks.filter(r => r.riskLevel === 'LOW').length;
        const pending = risks.filter(r => r.status === 'PENDING').length;
        const resolved = risks.filter(r => r.status === 'RESOLVED').length;

        const html = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:14px;">
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">总风险数</div>
                    <div style="font-size:26px; font-weight:700; color:#111827;">${total}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">高风险</div>
                    <div style="font-size:26px; font-weight:700; color:#dc2626;">${high}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">中风险</div>
                    <div style="font-size:26px; font-weight:700; color:#f97316;">${medium}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">低风险</div>
                    <div style="font-size:26px; font-weight:700; color:#22c55e;">${low}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">待处理</div>
                    <div style="font-size:26px; font-weight:700; color:#2563eb;">${pending}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:12px; color:#6b7280; margin-bottom:6px;">已解决</div>
                    <div style="font-size:26px; font-weight:700; color:#16a34a;">${resolved}</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /** 获取风险等级样式 */
    getRiskLevelClass: function(level) {
        const map = {
            HIGH: 'risk-high',
            MEDIUM: 'risk-medium',
            LOW: 'risk-low'
        };
        return map[level] || 'risk-unknown';
    },

    /** 获取风险等级文本 */
    getRiskLevelText: function(level) {
        const map = {
            HIGH: '高风险',
            MEDIUM: '中风险',
            LOW: '低风险'
        };
        return map[level] || '未知';
    },

    /** 获取状态徽章 HTML */
    getRiskStatusBadge: function(status) {
        const map = {
            PENDING: '<span class="badge warning">待处理</span>',
            PROCESSING: '<span class="badge">处理中</span>',
            RESOLVED: '<span class="badge success">已解决</span>'
        };
        return map[status] || '<span class="badge">未知</span>';
    },

    /** 查看风险详情 */
    viewRiskDetail: function(riskId) {
        console.log('查看风险详情:', riskId);
        this.showSuccess('查看风险详情功能开发中...');
    },

    /** 处理风险 */
    handleRisk: function(riskId) {
        console.log('处理风险:', riskId);
        this.showSuccess('处理风险功能开发中...');
    },

    /** 标记为已解决 */
    resolveRisk: function(riskId) {
        console.log('标记风险已解决:', riskId);
        if (!confirm('确认标记该风险为已解决？')) {
            return;
        }
        this.showSuccess('风险已标记为已解决（示例，未真正调用后端）');
        this.loadRisks();
    },

    /** 格式化时间 */
    formatDateTime: function(dateTime) {
        if (!dateTime) return '-';
        const date = new Date(dateTime);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${mi}:${s}`;
    },

    /** 显示加载占位 */
    showLoading: function() {
        const container = document.getElementById('riskListContainer');
        if (!container) return;
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <i class="fas fa-spinner fa-spin" style="font-size:40px; color:#6366f1;"></i>
                <p style="margin-top:16px; color:#4b5563; font-size:14px;">正在加载预测风险数据...</p>
            </div>
        `;
    },

    /** 显示错误信息 */
    showError: function(message) {
        if (typeof layer !== 'undefined') {
            layer.msg(message, { icon: 2 });
        } else {
            alert(message);
        }
    },

    /** 显示成功信息 */
    showSuccess: function(message) {
        if (typeof layer !== 'undefined') {
            layer.msg(message, { icon: 1 });
        } else {
            alert(message);
        }
    }
};

/**
 * 获取风险等级样式类
 * @param level 风险等级
 * @returns {string} CSS类名
 */
function getRiskLevelClass(level) {
    const classes = {
        'HIGH': 'risk-high',
        'MEDIUM': 'risk-medium',
        'LOW': 'risk-low'
    };
    return classes[level] || 'risk-unknown';
}

/**
 * 获取风险等级文本
 * @param level 风险等级
 * @returns {string} 文本
 */
function getRiskLevelText(level) {
    const texts = {
        'HIGH': '高风险',
        'MEDIUM': '中风险',
        'LOW': '低风险'
    };
    return texts[level] || '未知';
}

/**
 * 获取风险状态徽章
 * @param status 状态
 * @returns {string} HTML字符串
 */
function getRiskStatusBadge(status) {
    const badges = {
        'PENDING': '<span class="badge badge-warning">待处理</span>',
        'PROCESSING': '<span class="badge badge-info">处理中</span>',
        'RESOLVED': '<span class="badge badge-success">已解决</span>'
    };
    return badges[status] || '<span class="badge badge-secondary">未知</span>';
}

/**
 * 查看风险详情
 * @param riskId 风险ID
 */
function viewRiskDetail(riskId) {
    console.log('查看风险详情:', riskId);
    showSuccess('查看风险详情功能开发中...');
    // TODO: 实现风险详情查看
}

/**
 * 处理风险
 * @param riskId 风险ID
 */
function handleRisk(riskId) {
    console.log('处理风险:', riskId);
    showSuccess('处理风险功能开发中...');
    // TODO: 实现风险处理
}

/**
 * 标记风险已解决
 * @param riskId 风险ID
 */
function resolveRisk(riskId) {
    console.log('标记风险已解决:', riskId);

    if (!confirm('确认标记该风险为已解决？')) {
        return;
    }

    // TODO: 调用后端API更新风险状态
    showSuccess('风险已标记为已解决');

    // 重新加载数据
    const filterParams = getFilterParams();
    loadPredictionRisks(filterParams);
}

/**
 * 格式化日期时间
 * @param dateTime 日期时间字符串或对象
 * @returns {string} 格式化后的字符串
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 显示加载状态
 * @param containerId 容器ID
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fa fa-spinner fa-spin" style="font-size: 48px; color: #1890ff;"></i>
                <p style="margin-top: 20px; color: #666;">加载中...</p>
            </div>
        `;
    }
}

/**
 * 隐藏加载状态
 * @param containerId 容器ID
 */
function hideLoading(containerId) {
    // 由renderRiskList等函数负责渲染内容
}

/**
 * 显示错误信息
 * @param message 错误信息
 */
function showError(message) {
    if (typeof layer !== 'undefined') {
        layer.msg(message, { icon: 2 });
    } else {
        alert(message);
    }
}

/**
 * 显示成功信息
 * @param message 成功信息
 */
function showSuccess(message) {
    if (typeof layer !== 'undefined') {
        layer.msg(message, { icon: 1 });
    } else {
        alert(message);
    }
}
