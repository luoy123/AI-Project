/**
 * API 配置文件
 * 统一管理所有 API 请求的基础路径
 *
 * 使用方法：
 * 1. 在 HTML 中引入此文件：<script src="/js/api-config.js"></script>
 * 2. 使用 API_CONFIG.BASE_URL 获取基础路径
 * 3. 示例：fetch(API_CONFIG.BASE_URL + '/user/list')
 */

const API_CONFIG = {
    // API 基础路径 - 使用相对路径，自动适配当前域名和端口
    BASE_URL: '/api',

    // 上传文件访问路径
    UPLOAD_URL: '/api/upload',

    // 获取完整的 API URL
    getApiUrl: function(path) {
        // 确保 path 以 / 开头
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        return this.BASE_URL + path;
    },

    // 获取上传文件的完整 URL
    getUploadUrl: function(path) {
        // 如果 path 已经包含 /api/upload，直接返回
        if (path.startsWith('/api/upload')) {
            return path;
        }
        // 确保 path 以 / 开头
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        return this.UPLOAD_URL + path;
    },

    // 获取当前应用的完整基础 URL（包含协议、域名、端口）
    getFullBaseUrl: function() {
        return window.location.origin + this.BASE_URL;
    }
};

// 兼容旧代码：如果代码中使用了 window.API_BASE_URL
window.API_BASE_URL = API_CONFIG.BASE_URL;

console.log('✅ API配置已加载:', {
    baseUrl: API_CONFIG.BASE_URL,
    uploadUrl: API_CONFIG.UPLOAD_URL,
    fullBaseUrl: API_CONFIG.getFullBaseUrl()
});
