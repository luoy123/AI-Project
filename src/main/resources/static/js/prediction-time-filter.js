/**
 * 预测数据时间筛选组件
 * 用于预测报告、预测风险、智能分析页面
 */

// 全局变量
let currentPredictionTime = null; // 当前选择的预测天数 (1/3/7/30)
let currentTimeRange = 'all'; // 当前选择的时间范围

/**
 * 初始化时间筛选器
 * @param containerId 容器ID
 * @param onChangeCallback 变化回调函数
 */
function initTimeFilter(containerId, onChangeCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('时间筛选器容器不存在:', containerId);
        return;
    }

    const html = `
        <div class="time-filter-container" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f5f5f5; border-radius: 4px; margin-bottom: 20px;">
            <div class="filter-group">
                <label style="margin-right: 8px; font-weight: 500;">预测天数:</label>
                <select id="predictionTimeSelect" class="form-control" style="width: 120px; display: inline-block;">
                    <option value="">全部</option>
                    <option value="1">1天</option>
                    <option value="3">3天</option>
                    <option value="7">7天</option>
                    <option value="30">30天</option>
                </select>
            </div>

            <div class="filter-group">
                <label style="margin-right: 8px; font-weight: 500;">时间范围:</label>
                <select id="timeRangeSelect" class="form-control" style="width: 150px; display: inline-block;">
                    <option value="all">全部时间</option>
                    <option value="today">今天</option>
                    <option value="yesterday">昨天</option>
                    <option value="last7days">最近7天</option>
                    <option value="last30days">最近30天</option>
                    <option value="custom">自定义</option>
                </select>
            </div>

            <div id="customTimeRange" class="filter-group" style="display: none;">
                <label style="margin-right: 8px;">开始时间:</label>
                <input type="datetime-local" id="startTime" class="form-control" style="width: 180px; display: inline-block;">
                <label style="margin: 0 8px;">结束时间:</label>
                <input type="datetime-local" id="endTime" class="form-control" style="width: 180px; display: inline-block;">
            </div>

            <button id="applyFilterBtn" class="btn btn-primary" style="margin-left: auto;">
                <i class="fa fa-filter"></i> 应用筛选
            </button>

            <button id="resetFilterBtn" class="btn btn-default">
                <i class="fa fa-refresh"></i> 重置
            </button>
        </div>
    `;

    container.innerHTML = html;

    // 绑定事件
    bindFilterEvents(onChangeCallback);
}

/**
 * 绑定筛选器事件
 */
function bindFilterEvents(onChangeCallback) {
    // 预测天数变化
    $('#predictionTimeSelect').on('change', function() {
        const value = $(this).val();
        currentPredictionTime = value ? parseInt(value) : null;
        console.log('预测天数变化:', currentPredictionTime);
    });

    // 时间范围变化
    $('#timeRangeSelect').on('change', function() {
        currentTimeRange = $(this).val();
        console.log('时间范围变化:', currentTimeRange);

        // 显示/隐藏自定义时间范围
        if (currentTimeRange === 'custom') {
            $('#customTimeRange').show();
        } else {
            $('#customTimeRange').hide();
        }
    });

    // 应用筛选按钮
    $('#applyFilterBtn').on('click', function() {
        const filterParams = getFilterParams();
        console.log('应用筛选:', filterParams);

        if (onChangeCallback) {
            onChangeCallback(filterParams);
        }
    });

    // 重置按钮
    $('#resetFilterBtn').on('click', function() {
        resetFilter();
        if (onChangeCallback) {
            onChangeCallback(getFilterParams());
        }
    });
}

/**
 * 获取筛选参数
 * @returns {Object} 筛选参数对象
 */
function getFilterParams() {
    const params = {};

    // 预测天数
    if (currentPredictionTime) {
        params.predictionTime = currentPredictionTime;
    }

    // 时间范围
    const { startTime, endTime } = getTimeRange();
    if (startTime) {
        params.startTime = startTime;
    }
    if (endTime) {
        params.endTime = endTime;
    }

    return params;
}

/**
 * 根据选择的时间范围获取开始和结束时间
 * @returns {Object} {startTime, endTime}
 */
function getTimeRange() {
    const now = new Date();
    let startTime = null;
    let endTime = null;

    switch (currentTimeRange) {
        case 'today':
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endTime = now;
            break;

        case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            endTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
            break;

        case 'last7days':
            startTime = new Date(now);
            startTime.setDate(startTime.getDate() - 7);
            endTime = now;
            break;

        case 'last30days':
            startTime = new Date(now);
            startTime.setDate(startTime.getDate() - 30);
            endTime = now;
            break;

        case 'custom':
            const startInput = document.getElementById('startTime').value;
            const endInput = document.getElementById('endTime').value;
            if (startInput) {
                startTime = new Date(startInput);
            }
            if (endInput) {
                endTime = new Date(endInput);
            }
            break;

        case 'all':
        default:
            // 不设置时间范围
            break;
    }

    return {
        startTime: startTime ? formatDateTime(startTime) : null,
        endTime: endTime ? formatDateTime(endTime) : null
    };
}

/**
 * 格式化日期时间为ISO格式
 * @param date Date对象
 * @returns {string} ISO格式字符串
 */
function formatDateTime(date) {
    return date.toISOString().slice(0, 19);
}

/**
 * 重置筛选器
 */
function resetFilter() {
    currentPredictionTime = null;
    currentTimeRange = 'all';

    $('#predictionTimeSelect').val('');
    $('#timeRangeSelect').val('all');
    $('#customTimeRange').hide();
    $('#startTime').val('');
    $('#endTime').val('');

    console.log('筛选器已重置');
}

/**
 * 设置预测天数（外部调用）
 * @param days 预测天数
 */
function setPredictionTime(days) {
    currentPredictionTime = days;
    $('#predictionTimeSelect').val(days || '');
}

/**
 * 设置时间范围（外部调用）
 * @param range 时间范围
 */
function setTimeRange(range) {
    currentTimeRange = range;
    $('#timeRangeSelect').val(range).trigger('change');
}

/**
 * 获取当前筛选状态
 * @returns {Object} 当前筛选状态
 */
function getFilterStatus() {
    return {
        predictionTime: currentPredictionTime,
        timeRange: currentTimeRange,
        params: getFilterParams()
    };
}
