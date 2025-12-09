/**
 * 预测报告页面 - 新版
 * 功能：展示分类树和预测报告图表
 */

// 全局变量 - 预测报告新版专用
let predictionReportSelectedCategory = null;
let predictionReportTime = 1;

/**
 * 初始化预测报告页面（新版）
 */
function initPredictionReportPageNew() {
    console.log('=== 初始化预测报告页面（新版） ===');
    console.log('当前URL:', window.location.href);
    console.log('分类树容器存在:', !!document.getElementById('predictionCategoryTree'));
    
    // 加载分类树
    loadCategoryTree();
    
    // 绑定事件
    bindPredictionReportEvents();
}

// 立即覆盖旧的初始化函数
window.initPredictionReportPage = initPredictionReportPageNew;

// 确保函数在页面加载后可用
if (typeof initPredictionReportPage === 'undefined') {
    window.initPredictionReportPage = initPredictionReportPageNew;
}

console.log('✅ prediction-report-new.js 已加载，初始化函数已就绪');

/**
 * 加载分类树数据
 */
async function loadCategoryTree() {
    try {
        console.log('开始加载分类树...');
        
        // 调用后端API获取完整的分类树（包含视频管理）
        const response = await fetch('/api/asset-category/tree');
        const result = await response.json();
        
        console.log('分类树数据:', result);
        
        if (result.code === 200 && result.data) {
            renderCategoryTree(result.data);
        } else {
            showError('加载分类失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('加载分类树失败:', error);
        showError('加载分类失败: ' + error.message);
    }
}

/**
 * 渲染分类树
 * @param {Array} categories - 分类数据数组
 */
function renderCategoryTree(categories) {
    const treeContainer = document.getElementById('predictionCategoryTree');
    
    if (!categories || categories.length === 0) {
        treeContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #909399; font-size: 14px;">暂无分类数据</div>';
        return;
    }
    
    // 构建分类树HTML
    let html = '<div class="category-tree-list">';
    
    // 添加"全部"选项
    html += `
        <div class="category-item category-all" data-category-id="all" data-category-name="全部" style="padding: 10px 12px; cursor: pointer; border-radius: 4px; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #606266; transition: all 0.3s;">
            <i class="fas fa-list" style="width: 16px; color: #409eff;"></i>
            <span>全部</span>
        </div>
    `;
    
    // 渲染分类数据
    categories.forEach(category => {
        // 如果有子分类，计算子分类的总设备数
        let totalCount = category.count || 0;
        if (category.children && category.children.length > 0) {
            totalCount = category.children.reduce((sum, child) => {
                return sum + (child.count || 0);
            }, 0);
        }
        
        // 渲染分类项，传入汇总后的数量
        html += renderCategoryItem(category, 0, totalCount);
    });
    
    html += '</div>';
    
    treeContainer.innerHTML = html;
    
    // 绑定点击事件
    bindCategoryClickEvents();
}

/**
 * 渲染单个分类项（递归）
 * @param {Object} category - 分类对象
 * @param {Number} level - 层级（用于缩进）
 * @param {Number} overrideCount - 覆盖显示的数量（可选，用于大类汇总）
 */
function renderCategoryItem(category, level = 0, overrideCount = null) {
    const indent = level * 15; // 每级缩进15px
    const hasChildren = category.children && category.children.length > 0;
    const iconClass = category.icon || 'fa-folder';
    
    // 兼容多种字段名：name, categoryName, category_name
    const categoryName = category.name || category.categoryName || category.category_name || '未命名';
    
    // 使用覆盖的数量（如果提供），否则使用原始的count
    const displayCount = overrideCount !== null ? overrideCount : category.count;
    
    // 获取父类ID（如果有）
    const parentId = category.parentId || category.parent_id || '';
    
    let html = `
        <div class="category-item" data-category-id="${category.id}" data-category-name="${categoryName}" data-parent-id="${parentId}"
             style="padding: 10px 12px; cursor: pointer; border-radius: 4px; margin-bottom: 3px; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #606266; transition: all 0.3s; padding-left: ${12 + indent}px;">
            ${hasChildren ? '<i class="fas fa-chevron-right category-toggle" style="width: 12px; font-size: 10px; transition: transform 0.3s;"></i>' : '<span style="width: 12px;"></span>'}
            <i class="fas ${iconClass}" style="width: 16px; color: #409eff;"></i>
            <span class="category-name">${categoryName}</span>
            ${displayCount !== undefined ? `<span style="margin-left: auto; color: #909399; font-size: 12px;">(${displayCount})</span>` : ''}
        </div>
    `;
    
    // 如果有子分类，递归渲染
    if (hasChildren) {
        html += `<div class="category-children" style="display: none;">`;
        category.children.forEach(child => {
            html += renderCategoryItem(child, level + 1);
        });
        html += `</div>`;
    }
    
    return html;
}

/**
 * 绑定分类点击事件
 */
function bindCategoryClickEvents() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        // 点击分类名称
        item.addEventListener('click', function(e) {
            // 如果点击的是展开/折叠图标，只处理展开折叠
            if (e.target.classList.contains('category-toggle')) {
                toggleCategory(this);
                return;
            }
            
            // 判断是否是大类（有子分类的）
            const hasChildren = this.nextElementSibling && 
                               this.nextElementSibling.classList.contains('category-children');
            
            if (hasChildren) {
                // 大类：只展开/折叠，不显示内容
                toggleCategory(this);
            } else {
                // 小类：显示预测报告
                selectCategory(this);
            }
        });
    });
}

/**
 * 展开/折叠分类
 */
function toggleCategory(categoryItem) {
    const childrenContainer = categoryItem.nextElementSibling;
    const toggleIcon = categoryItem.querySelector('.category-toggle');
    
    if (childrenContainer && childrenContainer.classList.contains('category-children')) {
        const isExpanded = childrenContainer.style.display !== 'none';
        
        if (isExpanded) {
            // 折叠
            childrenContainer.style.display = 'none';
            if (toggleIcon) {
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        } else {
            // 展开
            childrenContainer.style.display = 'block';
            if (toggleIcon) {
                toggleIcon.style.transform = 'rotate(90deg)';
            }
        }
    }
}

/**
 * 选中分类
 */
function selectCategory(categoryItem) {
    // 移除所有选中状态
    document.querySelectorAll('.category-item').forEach(item => {
        item.style.background = '';
        item.style.color = '#606266';
    });
    
    // 添加选中状态
    categoryItem.style.background = '#f0f9ff';
    categoryItem.style.color = '#409eff';
    
    // 获取分类信息
    const categoryId = categoryItem.dataset.categoryId;
    const categoryName = categoryItem.dataset.categoryName;
    const parentId = categoryItem.dataset.parentId; // 获取父类ID
    
    predictionReportSelectedCategory = categoryId;
    
    console.log('选中分类:', categoryId, categoryName, '父类ID:', parentId);
    
    // 更新右侧标题
    document.getElementById('currentCategoryName').textContent = categoryName;
    
    // 加载该分类的预测报告
    loadPredictionReport(categoryId, categoryName);
}

/**
 * 加载预测报告 - 加载该分类下所有设备的报告列表
 * @param {String} categoryId - 分类ID
 * @param {String} categoryName - 分类名称
 */
async function loadPredictionReport(categoryId, categoryName) {
    const chartContent = document.getElementById('predictionChartContent');
    
    const predictionReportTime = document.getElementById('reportPredictionTimeSelect')?.value || 7;
    
    try {
        // 显示加载中
        chartContent.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #6366f1;"></i>
            </div>
        `;
        
        // 1. 先尝试从后端API获取设备预测报告
        let deviceReports = [];
        try {
            const apiUrl = `/api/prediction/device-reports?categoryId=${categoryId}&predictDays=${predictionReportTime}`;
            console.log('🔗 API请求URL:', apiUrl, '预测时间值:', predictionReportTime);
            const reportsResponse = await fetch(apiUrl);
            const reportsResult = await reportsResponse.json();
            console.log('📊 后端预测报告数据:', reportsResult);
            
            if (reportsResult.code === 200 && reportsResult.data && reportsResult.data.length > 0) {
                // 使用后端数据，转换字段名以匹配前端格式
                deviceReports = reportsResult.data.map(report => ({
                    id: report.id,
                    deviceId: report.deviceId,
                    deviceName: report.deviceName,
                    deviceIp: report.deviceIp,
                    categoryId: report.categoryId,
                    categoryName: report.categoryName,
                    predictDays: report.predictDays,
                    currentStatus: report.currentStatus,
                    healthScore: report.healthScore,
                    failureProbability: report.failureProbability,
                    riskLevel: report.riskLevel,
                    cpuUsage: report.cpuUsage,
                    memoryUsage: report.memoryUsage,
                    diskUsage: report.diskUsage,
                    networkTraffic: report.networkTraffic,
                    temperature: report.temperature,
                    trend: report.trend,
                    trendDescription: report.trendDescription,
                    riskFactors: report.riskFactors,
                    recommendations: report.recommendations,
                    metricsHistory: report.metricsHistory,
                    confidenceLevel: report.confidenceLevel
                }));
                console.log('✅ 使用后端预测报告数据:', deviceReports.length, '条');
            }
        } catch (apiError) {
            console.warn('⚠️ 后端API调用失败，尝试使用设备数据生成报告:', apiError);
        }
        
        // 2. 如果后端没有数据，获取设备列表并生成报告
        if (deviceReports.length === 0) {
            const assetsResponse = await fetch(`/api/asset/list/category/${categoryId}`);
            const assetsResult = await assetsResponse.json();
            
            console.log('📊 分类设备数据:', assetsResult);
            
            if (assetsResult.code !== 200 || !assetsResult.data || assetsResult.data.length === 0) {
                chartContent.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #909399;">
                        <div style="text-align: center;">
                            <i class="fas fa-inbox" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                            <p style="font-size: 14px; margin: 0;">暂无${categoryName}下的设备</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            const devices = assetsResult.data;
            
            // 为每个设备生成预测报告（后备方案）
            deviceReports = devices.map(device => generateDeviceReport(device, predictionReportTime));
            console.log('⚠️ 使用生成的预测报告数据:', deviceReports.length, '条');
        }
        
        // 3. 渲染设备报告列表
        renderDeviceReportsList(deviceReports, categoryName);
        
    } catch (error) {
        console.error('加载预测报告失败:', error);
        chartContent.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #f56c6c;">
                <div style="text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.5; margin-bottom: 15px;"></i>
                    <p style="font-size: 14px; margin: 0;">加载失败，请稍后重试</p>
                </div>
            </div>
        `;
    }
}

/**
 * 渲染报告内容
 * @param {Object} report - 报告数据
 * @param {String} categoryName - 分类名称
 */
function renderReportContent(report, categoryName) {
    const chartContent = document.getElementById('predictionChartContent');
    
    // 获取健康状态的样式
    const getHealthStatusStyle = (status) => {
        const styles = {
            'healthy': { bg: '#ecfdf5', color: '#10b981', text: '健康' },
            'warning': { bg: '#fef3c7', color: '#f59e0b', text: '预警' },
            'critical': { bg: '#fee2e2', color: '#ef4444', text: '严重' }
        };
        return styles[status] || styles.healthy;
    };
    
    // 获取风险等级的样式
    const getRiskLevelStyle = (level) => {
        const styles = {
            'low': { bg: '#ecfdf5', color: '#10b981', text: '低风险' },
            'medium': { bg: '#fef3c7', color: '#f59e0b', text: '中风险' },
            'high': { bg: '#fee2e2', color: '#ef4444', text: '高风险' },
            'critical': { bg: '#fce7f3', color: '#ec4899', text: '严重风险' }
        };
        return styles[level] || styles.low;
    };
    
    const healthStatus = getHealthStatusStyle(report.healthStatus);
    const riskLevel = getRiskLevelStyle(report.riskLevel);
    
    chartContent.innerHTML = `
        <div style="padding: 20px;">
            <!-- 报告摘要 -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 20px; font-weight: 600;">
                        <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                        ${categoryName} 预测报告
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                        预测周期: ${report.predictDays} 天
                    </div>
                </div>
                <div style="opacity: 0.95; font-size: 14px; line-height: 1.6;">
                    ${report.reportSummary || '暂无摘要'}
                </div>
            </div>
            
            <!-- 关键指标 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">总设备数</div>
                    <div style="font-size: 28px; font-weight: 600; color: #303133;">${report.totalDevices || 0}</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">正常设备</div>
                    <div style="font-size: 28px; font-weight: 600; color: #67c23a;">${report.normalDevices || 0}</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">预警设备</div>
                    <div style="font-size: 28px; font-weight: 600; color: #e6a23c;">${report.warningDevices || 0}</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">风险设备</div>
                    <div style="font-size: 28px; font-weight: 600; color: #f56c6c;">${report.riskDevices || 0}</div>
                </div>
            </div>
            
            <!-- 健康状态与风险评估 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 14px; color: #606266; margin-bottom: 12px; font-weight: 500;">健康状态</div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 48px; font-weight: 600; color: ${healthStatus.color};">${report.healthScore || 0}</div>
                        <div>
                            <div style="background: ${healthStatus.bg}; color: ${healthStatus.color}; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; margin-bottom: 4px;">
                                ${healthStatus.text}
                            </div>
                            <div style="font-size: 12px; color: #909399;">健康评分</div>
                        </div>
                    </div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="font-size: 14px; color: #606266; margin-bottom: 12px; font-weight: 500;">风险评估</div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 36px; font-weight: 600; color: ${riskLevel.color};">${(report.failureProbability || 0).toFixed(1)}%</div>
                        <div>
                            <div style="background: ${riskLevel.bg}; color: ${riskLevel.color}; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; margin-bottom: 4px;">
                                ${riskLevel.text}
                            </div>
                            <div style="font-size: 12px; color: #909399;">故障概率</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 查看详细报告按钮 -->
            <div style="text-align: center; margin-top: 24px;">
                <button onclick="showDetailedReport(${report.id})" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s;" 
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'"
                        onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">
                    <i class="fas fa-file-alt" style="margin-right: 8px;"></i>
                    查看详细报告
                </button>
            </div>
        </div>
    `;
}

/**
 * 绑定事件
 */
function bindPredictionReportEvents() {
    // 预测时间选择器
    const timeSelect = document.getElementById('reportPredictionTimeSelect');
    if (timeSelect) {
        timeSelect.addEventListener('change', function() {
            predictionReportTime = parseInt(this.value);
            console.log('切换预测时间:', predictionReportTime);
            
            // 如果已选中分类，重新加载报告
            if (predictionReportSelectedCategory) {
                const categoryName = document.getElementById('currentCategoryName').textContent;
                loadPredictionReport(predictionReportSelectedCategory, categoryName);
            }
        });
    }
}

/**
 * 显示详细报告弹窗
 * @param {Number} reportId - 报告ID
 */
async function showDetailedReport(reportId) {
    try {
        const response = await fetch(`/api/prediction/v2/reports/${reportId}`);
        const result = await response.json();
        
        if (result.code !== 200 || !result.data) {
            alert('获取报告详情失败');
            return;
        }
        
        const report = result.data;
        
        const modalHTML = `
            <div id="detailReportModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;" onclick="closeDetailModal(event)">
                <div style="background: white; width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 20px; font-weight: 600;"><i class="fas fa-file-alt" style="margin-right: 8px;"></i>${report.categoryName} 详细预测报告</div>
                            <button onclick="closeDetailModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">✕</button>
                        </div>
                    </div>
                    <div style="padding: 24px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                                <div><div style="font-size: 12px; color: #909399;">预测周期</div><div style="font-size: 16px; font-weight: 500;">${report.predictDays} 天</div></div>
                                <div><div style="font-size: 12px; color: #909399;">置信度</div><div style="font-size: 16px; font-weight: 500; color: #67c23a;">${(report.confidenceLevel || 0).toFixed(1)}%</div></div>
                            </div>
                        </div>
                        ${report.reportSummary ? `<div style="margin-bottom: 24px;"><h3 style="font-size: 16px; margin: 0 0 16px 0;">报告摘要</h3><div style="background: #f8f9fa; padding: 16px; border-radius: 4px;"><p style="margin: 0; font-size: 14px; line-height: 1.8;">${report.reportSummary}</p></div></div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('显示详细报告失败:', error);
        alert('显示详细报告失败');
    }
}

/**
 * 关闭详细报告弹窗
 */
function closeDetailModal(event) {
    if (!event || event.target.id === 'detailReportModal') {
        const modal = document.getElementById('detailReportModal');
        if (modal) modal.remove();
    }
}

// 导出全局函数
window.initPredictionReportPageNew = initPredictionReportPageNew;
window.loadCategoryTree = loadCategoryTree;
window.showDetailedReport = showDetailedReport;
window.closeDetailModal = closeDetailModal;
