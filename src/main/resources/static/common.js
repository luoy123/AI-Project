/**
 * 通用工具函数
 * 提供认证检查、带认证的fetch请求等功能
 */

/**
 * 检查用户是否已登录
 * @returns {string|boolean} 返回token或false
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录！');
        window.location.href = '/登录.html';
        return false;
    }
    return token;
}

/**
 * 带认证的fetch请求封装
 * 自动携带token，处理401未授权响应
 * @param {string} url - 请求URL
 * @param {object} options - fetch选项
 * @returns {Promise} 返回Promise对象
 */
function fetchWithAuth(url, options = {}) {
    const token = checkAuth();
    if (!token) {
        return Promise.reject(new Error('未登录'));
    }

    // 合并请求头，添加Authorization
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers: headers
    }).then(response => {
        // 处理401未授权
        if (response.status === 401) {
            alert('登录已过期，请重新登录');
            localStorage.clear();
            window.location.href = '/登录.html';
            throw new Error('Unauthorized');
        }

        // 处理其他HTTP错误
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
    }).catch(error => {
        console.error('请求失败:', error);
        throw error;
    });
}

/**
 * GET请求封装
 * @param {string} url - 请求URL
 * @returns {Promise} 返回Promise对象
 */
function getRequest(url) {
    return fetchWithAuth(url, {
        method: 'GET'
    });
}

/**
 * POST请求封装
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} 返回Promise对象
 */
function postRequest(url, data) {
    return fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT请求封装
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据
 * @returns {Promise} 返回Promise对象
 */
function putRequest(url, data) {
    return fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE请求封装
 * @param {string} url - 请求URL
 * @returns {Promise} 返回Promise对象
 */
function deleteRequest(url) {
    return fetchWithAuth(url, {
        method: 'DELETE'
    });
}

/**
 * 获取当前登录用户信息
 * @returns {object|null} 用户信息对象或null
 */
function getCurrentUser() {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
        try {
            return JSON.parse(userInfoStr);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            return null;
        }
    }
    return null;
}

/**
 * 退出登录
 */
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除本地存储
        localStorage.clear();
        // 跳转到登录页
        window.location.href = '/登录.html';
    }
}

/**
 * 防抖函数
 * @param {function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {function} 返回防抖后的函数
 */
function debounce(func, delay = 300) {
    let timer = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或字符串
 * @param {string} format - 格式化模板，默认'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 显示加载提示
 * @param {string} message - 提示消息
 */
function showLoading(message = '加载中...') {
    // 简单实现，可以根据需要使用更复杂的加载组件
    console.log('Loading:', message);
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
    console.log('Loading hidden');
}

// 页面加载时自动检查认证（排除登录页面）
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    // 如果不是登录页面，则检查认证
    if (!currentPage.includes('登录.html')) {
        checkAuth();
    }
});
