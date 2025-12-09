/**
 * 智能预测管理 - API调用模块
 * 基础URL配置和API调用函数
 */

const PredictionAPI = {
    baseURL: '/api/prediction',

    /**
     * 1. 获取概览统计数据
     */
    getOverviewStats: async function() {
        try {
            const response = await fetch(`${this.baseURL}/overview/stats`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取概览统计失败:', error);
            throw error;
        }
    },

    /**
     * 2. 获取设备故障占比
     */
    getDeviceFaultRatio: async function(predictionTime = 1) {
        try {
            const response = await fetch(`${this.baseURL}/overview/device-fault-ratio?predictionTime=${predictionTime}`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取设备故障占比失败:', error);
            throw error;
        }
    },

    /**
     * 3. 获取分类故障率列表
     */
    getCategoryFaultRates: async function(predictionTime = 1) {
        try {
            const response = await fetch(`${this.baseURL}/overview/category-fault-rates?predictionTime=${predictionTime}`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取分类故障率失败:', error);
            throw error;
        }
    },

    /**
     * 4. 获取预测告警统计
     */
    getAlertStats: async function(predictionTime = 1) {
        try {
            const response = await fetch(`${this.baseURL}/overview/alerts?predictionTime=${predictionTime}`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取告警统计失败:', error);
            throw error;
        }
    },

    /**
     * 5. 获取服务器故障预测统计
     */
    getServerFaultStats: async function(predictionTime = 1) {
        try {
            const response = await fetch(`${this.baseURL}/overview/server-fault-stats?predictionTime=${predictionTime}`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取服务器故障统计失败:', error);
            throw error;
        }
    },

    /**
     * 6. 获取其他设备故障预测统计
     */
    getOtherDeviceFaultStats: async function(predictionTime = 1) {
        try {
            const response = await fetch(`${this.baseURL}/overview/other-device-fault-stats?predictionTime=${predictionTime}`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取其他设备故障统计失败:', error);
            throw error;
        }
    },

    /**
     * 7. 获取预测报告分类列表
     */
    getReportCategories: async function() {
        try {
            const response = await fetch(`${this.baseURL}/reports/categories`);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取报告分类失败:', error);
            throw error;
        }
    },

    /**
     * 6. 获取预测报告列表
     */
    getReports: async function(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${this.baseURL}/reports?${queryString}` : `${this.baseURL}/reports`;
            const response = await fetch(url);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取预测报告失败:', error);
            throw error;
        }
    },

    /**
     * 6. 获取预测风险列表
     */
    getRisks: async function(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${this.baseURL}/risks?${queryString}` : `${this.baseURL}/risks`;
            const response = await fetch(url);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取预测风险失败:', error);
            throw error;
        }
    },

    /**
     * 7. 获取监测数据
     */
    getMonitoringData: async function(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${this.baseURL}/monitoring/data?${queryString}` : `${this.baseURL}/monitoring/data`;
            const response = await fetch(url);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取监测数据失败:', error);
            throw error;
        }
    },

    /**
     * 8. 获取算法模型服务列表
     */
    getAlgorithmServices: async function(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${this.baseURL}/services?${queryString}` : `${this.baseURL}/services`;
            const response = await fetch(url);
            const result = await response.json();
            if (result.code === 200) {
                return result.data;
            }
            throw new Error(result.message);
        } catch (error) {
            console.error('获取算法服务失败:', error);
            throw error;
        }
    }
};

// 导出API对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PredictionAPI;
}
