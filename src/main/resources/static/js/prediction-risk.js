/**
 * 预测风险页面数据加载脚本（新版，风格与预测报告保持一致）
 */

window.PredictionRisk = {
    currentFilters: {
        time: 1,
        riskLevel: '',    // 风险等级
        status: '',
        failureType: '',  // 故障类型
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
        const levelFilter = document.getElementById('riskLevelFilter');
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

        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.currentFilters.riskLevel = e.target.value || '';
                console.log(`⚠️ 风险等级筛选变更: ${this.currentFilters.riskLevel || '全部'}`);
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
                this.currentFilters.failureType = e.target.value || '';
                console.log(`🎯 故障类型筛选变更: ${this.currentFilters.failureType || '全部'}`);
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
     * 加载风险数据 - 从prediction_risk表获取
     */
    loadRisks: async function() {
        const params = new URLSearchParams({
            predictDays: this.currentFilters.time
        });

        if (this.currentFilters.status) {
            params.append('status', this.currentFilters.status);
        }
        if (this.currentFilters.keyword) {
            params.append('targetName', this.currentFilters.keyword);
        }

        console.log(`📡 加载预测风险数据（新API）, 参数: {predictDays: ${this.currentFilters.time}}`);

        this.showLoading();

        try {
            // 使用新的API接口
            const response = await fetch(`/api/prediction/v2/risks?${params.toString()}`);
            const result = await response.json();
            console.log('预测风险数据返回:', result);

            if (result.code === 200 && result.data) {
                this.currentRisks = result.data;
                
                // 提取故障类型并填充下拉框
                this.populateFailureTypeFilter(result.data);
                
                // 应用前端筛选
                let filteredData = result.data;
                
                // 风险等级筛选
                if (this.currentFilters.riskLevel) {
                    filteredData = filteredData.filter(r => 
                        r.riskLevel && r.riskLevel.toLowerCase() === this.currentFilters.riskLevel.toLowerCase()
                    );
                }
                
                // 故障类型筛选
                if (this.currentFilters.failureType) {
                    filteredData = filteredData.filter(r => r.failureType === this.currentFilters.failureType);
                }
                
                this.renderRiskStatistics(filteredData);
                this.renderRiskList(filteredData);
            } else {
                console.error('加载风险数据失败:', result.message);
                this.currentRisks = [];
                this.renderRiskList([]);
            }
        } catch (error) {
            console.error('请求风险数据异常:', error);
            this.currentRisks = [];
            this.renderRiskList([]);
        }
    },
    
    /**
     * 填充故障类型下拉框
     */
    populateFailureTypeFilter: function(risks) {
        const targetFilter = document.getElementById('riskTargetFilter');
        if (!targetFilter) return;
        
        // 提取所有唯一的故障类型
        const failureTypes = new Set();
        risks.forEach(risk => {
            if (risk.failureType) {
                failureTypes.add(risk.failureType);
            }
        });
        
        // 保存当前选中的值
        const currentValue = this.currentFilters.failureType;
        
        // 清空并重新填充选项
        targetFilter.innerHTML = '<option value="">全部故障类型</option>';
        Array.from(failureTypes).sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (type === currentValue) {
                option.selected = true;
            }
            targetFilter.appendChild(option);
        });
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
            const riskTime = risk.predictedTime ? this.formatDateTime(risk.predictedTime) : '-';

            html += `
                <div class="risk-item ${riskLevelClass}" style="background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border-left: 4px solid #e5e7eb;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                <i class="fas fa-exclamation-triangle" style="color:#f59e0b;"></i>
                                <span style="font-size:15px; font-weight:600; color:#1f2937;">
                                    ${risk.targetName || '未知对象'} · ${risk.categoryName || '未知类别'}
                                </span>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#6b7280;">
                                <span class="risk-level-badge" style="padding:2px 8px; border-radius:999px; background:#fef3c7; color:#92400e; font-weight:600;">
                                    ${riskLevelText}
                                </span>
                                <span>预测天数：${risk.predictDays || '-'} 天</span>
                                <span>预测时间：${riskTime}</span>
                            </div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div style="font-size:13px; color:#4b5563; line-height:1.7; margin-top:6px;">
                        <strong>故障类型：</strong>${risk.failureType || '未知'}<br>
                        <strong>故障描述：</strong>${risk.failureDescription || '暂无描述'}<br>
                        <strong>故障概率：</strong>${(risk.failureProbability || 0).toFixed(1)}%
                    </div>
                    ${risk.rootCause ? `
                    <div style="font-size:13px; color:#4b5563; margin-top:4px;">
                        <strong>根本原因：</strong>${risk.rootCause}
                    </div>` : ''}
                    <div style="margin-top:14px; padding-top:12px; border-top:1px dashed #e5e7eb; display:flex; gap:8px; flex-wrap:wrap;">
                        <button type="button" style="border:none; padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; display:flex; align-items:center; gap:6px;" onclick="PredictionRisk.viewRiskDetail(${risk.id})">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                        <button type="button" style="border:none; padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; display:flex; align-items:center; gap:6px;" onclick="PredictionRisk.handleRisk(${risk.id})">
                            <i class="fas fa-tools"></i> 处理风险
                        </button>
                        ${risk.status === 'active' ? `
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
        // 兼容大小写
        const critical = risks.filter(r => r.riskLevel && r.riskLevel.toLowerCase() === 'critical').length;
        const high = risks.filter(r => r.riskLevel && r.riskLevel.toLowerCase() === 'high').length;
        const medium = risks.filter(r => r.riskLevel && r.riskLevel.toLowerCase() === 'medium').length;
        const low = risks.filter(r => r.riskLevel && r.riskLevel.toLowerCase() === 'low').length;

        const html = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:14px;">
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">总风险数</div>
                    <div style="font-size:32px; font-weight:700; color:#111827;">${total}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">严重风险</div>
                    <div style="font-size:32px; font-weight:700; color:#991b1b;">${critical}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">高风险</div>
                    <div style="font-size:32px; font-weight:700; color:#dc2626;">${high}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">中风险</div>
                    <div style="font-size:32px; font-weight:700; color:#f97316;">${medium}</div>
                </div>
                <div class="stat-card" style="background:#fff; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">低风险</div>
                    <div style="font-size:32px; font-weight:700; color:#22c55e;">${low}</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /** 获取风险等级样式 */
    getRiskLevelClass: function(level) {
        if (!level) return 'risk-unknown';
        const levelLower = level.toLowerCase();
        const map = {
            'critical': 'risk-critical',
            'high': 'risk-high',
            'medium': 'risk-medium',
            'low': 'risk-low'
        };
        return map[levelLower] || 'risk-unknown';
    },

    /** 获取风险等级文本 */
    getRiskLevelText: function(level) {
        if (!level) return '未知';
        const levelLower = level.toLowerCase();
        const map = {
            'critical': '严重风险',
            'high': '高风险',
            'medium': '中风险',
            'low': '低风险'
        };
        return map[levelLower] || '未知';
    },

    /** 获取状态徽章 HTML */
    getRiskStatusBadge: function(status) {
        if (!status) return '<span class="badge">未知</span>';
        const statusLower = status.toLowerCase();
        const map = {
            'active': '<span class="badge warning">活跃</span>',
            'pending': '<span class="badge warning">待处理</span>',
            'processing': '<span class="badge info">处理中</span>',
            'resolved': '<span class="badge success">已解决</span>',
            'acknowledged': '<span class="badge info">已确认</span>'
        };
        return map[statusLower] || '<span class="badge">未知</span>';
    },

    /** 查看风险详情 */
    viewRiskDetail: function(riskId) {
        console.log('查看风险详情:', riskId);
        
        const risk = this.currentRisks.find(r => r.id === riskId);
        if (!risk) {
            alert('未找到风险数据');
            return;
        }
        
        const levelConfig = this.getRiskLevelConfig(risk.riskLevel);
        const statusBadge = this.getRiskStatusBadge(risk.status);
        
        // 解析建议列表
        let recommendations = [];
        try {
            if (risk.recommendations) {
                recommendations = typeof risk.recommendations === 'string' 
                    ? JSON.parse(risk.recommendations) 
                    : risk.recommendations;
            }
        } catch (e) {
            console.error('解析建议失败:', e);
        }
        
        const modalHTML = `
            <div id="riskDetailModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="window.PredictionRisk.closeDetailModal(event)">
                <div style="background: white; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                    <!-- 头部 -->
                    <div style="background: ${levelConfig.gradient}; padding: 24px; border-radius: 16px 16px 0 0; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="font-size: 24px; font-weight: 600;">
                                <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                                ${risk.targetName}
                            </div>
                            <button onclick="window.PredictionRisk.closeDetailModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px;">✕</button>
                        </div>
                        <div style="display: flex; gap: 16px; font-size: 14px; opacity: 0.95;">
                            <span><i class="fas fa-tag" style="margin-right: 6px;"></i>${risk.categoryName}</span>
                            <span><i class="fas fa-calendar" style="margin-right: 6px;"></i>预测: ${risk.predictDays}天</span>
                        </div>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div style="padding: 24px;">
                        <!-- 关键指标 -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 18px; border-radius: 12px; border-left: 4px solid ${levelConfig.color};">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 6px;">风险等级</div>
                                <div style="font-size: 24px; font-weight: 700; color: ${levelConfig.color};">${levelConfig.text}</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 18px; border-radius: 12px;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 6px;">风险评分</div>
                                <div style="font-size: 24px; font-weight: 700; color: #111827;">${risk.riskScore || 0}</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 18px; border-radius: 12px;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 6px;">故障概率</div>
                                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${risk.failureProbability || 0}%</div>
                            </div>
                        </div>
                        
                        <!-- 故障信息 -->
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #212529;">
                                <i class="fas fa-info-circle" style="margin-right: 8px; color: #6366f1;"></i>
                                故障信息
                            </h3>
                            <div style="display: grid; gap: 12px;">
                                <div><strong>故障类型：</strong>${risk.failureType || '-'}</div>
                                <div><strong>故障描述：</strong>${risk.failureDescription || '-'}</div>
                                <div><strong>根本原因：</strong>${risk.rootCause || '-'}</div>
                                <div><strong>影响等级：</strong>${risk.impactLevel || '-'}</div>
                                <div><strong>影响描述：</strong>${risk.impactDescription || '-'}</div>
                            </div>
                        </div>
                        
                        <!-- 预测时间 -->
                        <div style="background: #fff3cd; padding: 16px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-clock" style="font-size: 24px; color: #f59e0b;"></i>
                                <div>
                                    <div style="font-size: 12px; color: #856404;">预计发生时间</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #856404;">${this.formatDateTime(risk.predictedTime)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 处理建议 -->
                        ${recommendations.length > 0 ? `
                        <div style="background: #d1ecf1; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #0c5460;">
                                <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                                处理建议
                            </h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${recommendations.map(rec => `
                                    <li style="margin-bottom: 8px; color: #0c5460;">
                                        <strong>${rec.action}</strong>
                                        ${rec.priority ? `<span style="margin-left: 8px; padding: 2px 8px; background: #fff; border-radius: 4px; font-size: 12px;">${rec.priority}</span>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        <!-- 状态和操作 -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
                            <div>
                                <span style="font-size: 14px; color: #6c757d;">当前状态：</span>
                                ${statusBadge}
                            </div>
                            <div style="display: flex; gap: 12px;">
                                ${risk.status !== 'resolved' ? `
                                    <button onclick="window.PredictionRisk.resolveRisk(${risk.id})" style="padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                                        <i class="fas fa-check-circle"></i> 标记已解决
                                    </button>
                                ` : `
                                    <span style="color: #10b981; font-weight: 600; font-size: 16px;">
                                        <i class="fas fa-check-circle"></i> 已解决
                                    </span>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /** 获取风险等级配置 */
    getRiskLevelConfig: function(level) {
        if (!level) return { color: '#6c757d', text: '未知', gradient: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' };
        const levelLower = level.toLowerCase();
        const configs = {
            'critical': { color: '#991b1b', text: '严重风险', gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' },
            'high': { color: '#dc2626', text: '高风险', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
            'medium': { color: '#f97316', text: '中风险', gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' },
            'low': { color: '#22c55e', text: '低风险', gradient: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)' }
        };
        return configs[levelLower] || configs.low;
    },
    
    /** 关闭详情弹窗 */
    closeDetailModal: function(event) {
        if (!event || event.target.id === 'riskDetailModal') {
            const modal = document.getElementById('riskDetailModal');
            if (modal) modal.remove();
        }
    },

    /** 处理风险 */
    handleRisk: async function(riskId) {
        console.log('处理风险:', riskId);
        
        // 关闭详情弹窗
        this.closeDetailModal();
        
        const risk = this.currentRisks.find(r => r.id === riskId);
        if (!risk) {
            alert('未找到风险数据');
            return;
        }
        
        // 显示处理表单弹窗
        const modalHTML = `
            <div id="handleRiskModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; width: 100%; max-width: 600px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px 16px 0 0; color: white;">
                        <h3 style="margin: 0; font-size: 20px;">
                            <i class="fas fa-wrench" style="margin-right: 10px;"></i>
                            处理风险
                        </h3>
                    </div>
                    <div style="padding: 24px;">
                        <div style="margin-bottom: 16px;">
                            <strong>风险对象：</strong>${risk.targetName}
                        </div>
                        <div style="margin-bottom: 16px;">
                            <strong>故障类型：</strong>${risk.failureType}
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">处理说明：</label>
                            <textarea id="handleNote" rows="4" style="width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 8px; font-size: 14px;" placeholder="请输入处理说明..."></textarea>
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button onclick="document.getElementById('handleRiskModal').remove()" style="padding: 10px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                取消
                            </button>
                            <button onclick="window.PredictionRisk.submitHandleRisk(${riskId})" style="padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                <i class="fas fa-check"></i> 确认处理
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /** 提交处理风险 */
    submitHandleRisk: async function(riskId) {
        const note = document.getElementById('handleNote').value.trim();
        if (!note) {
            alert('请输入处理说明');
            return;
        }
        
        try {
            // 调用后端API更新状态为processing
            const response = await fetch(`/api/prediction/v2/risks/${riskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'processing',
                    note: note
                })
            });
            
            const result = await response.json();
            if (result.code === 200) {
                this.showSuccess('风险已标记为处理中');
                document.getElementById('handleRiskModal').remove();
                this.loadRisks();
            } else {
                alert('操作失败：' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('处理风险失败:', error);
            alert('操作失败，请稍后重试');
        }
    },

    /** 标记为已解决 */
    resolveRisk: async function(riskId) {
        console.log('标记风险已解决:', riskId);
        
        if (!confirm('确认标记该风险为已解决？')) {
            return;
        }
        
        // 关闭详情弹窗
        this.closeDetailModal();
        
        try {
            // 调用后端API更新状态为resolved
            const response = await fetch(`/api/prediction/v2/risks/${riskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'resolved'
                })
            });
            
            const result = await response.json();
            if (result.code === 200) {
                this.showSuccess('风险已标记为已解决');
                this.loadRisks();
            } else {
                alert('操作失败：' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('标记已解决失败:', error);
            alert('操作失败，请稍后重试');
        }
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

// 导出全局初始化函数，供HTML调用
window.initPredictionRiskPage = function() {
    console.log('🔧 initPredictionRiskPage() 被调用，转发到 PredictionRisk.init()');
    if (window.PredictionRisk && typeof window.PredictionRisk.init === 'function') {
        window.PredictionRisk.init();
    } else {
        console.error('❌ PredictionRisk.init 不存在！');
    }
};

// 加载确认日志
console.log('🚀 Prediction Risk JS (new version) loaded! window.PredictionRisk type:', typeof window.PredictionRisk);
if (typeof window.PredictionRisk !== 'undefined') {
    console.log('✅ window.PredictionRisk.init exists:', typeof window.PredictionRisk.init === 'function');
}
console.log('✅ window.initPredictionRiskPage exported:', typeof window.initPredictionRiskPage === 'function');
