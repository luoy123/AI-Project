/**
 * Chart.js 备用加载器
 * 当CDN无法访问时提供基本的图表功能
 */

// 如果Chart.js未加载，提供一个简单的备用实现
if (typeof Chart === 'undefined') {
    console.warn('Chart.js未加载，使用备用实现');
    
    // 简单的Chart构造函数
    window.Chart = function(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this.data = config.data;
        
        // 创建简单的饼图
        if (config.type === 'doughnut') {
            this.createDoughnutChart();
        }
        
        return this;
    };
    
    // 添加版本信息
    Chart.version = '备用版本';
    
    // 创建环形图的方法
    Chart.prototype.createDoughnutChart = function() {
        const canvas = this.ctx;
        const ctx = canvas.getContext('2d');
        const data = this.data.datasets[0].data;
        const labels = this.data.labels;
        const colors = this.data.datasets[0].backgroundColor;
        
        // 设置canvas尺寸
        canvas.width = 300;
        canvas.height = 300;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;
        const innerRadius = 50;
        
        // 计算总数
        const total = data.reduce((sum, value) => sum + value, 0);
        
        if (total === 0) {
            // 如果没有数据，显示灰色圆环
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
            ctx.closePath();
            ctx.fillStyle = '#e6e6e6';
            ctx.fill();
            
            // 显示"暂无数据"
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', centerX, centerY);
            return;
        }
        
        // 绘制环形图
        let startAngle = -Math.PI / 2;
        
        data.forEach((value, index) => {
            if (value > 0) {
                const sliceAngle = (value / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                ctx.closePath();
                ctx.fillStyle = colors[index];
                ctx.fill();
                
                startAngle += sliceAngle;
            }
        });
        
        // 显示总数
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(total.toString(), centerX, centerY);
        
        // 创建简单的图例
        this.createLegend();
        
        console.log('备用环形图创建完成');
    };
    
    // 创建图例
    Chart.prototype.createLegend = function() {
        const canvas = this.ctx;
        const container = canvas.parentElement;
        
        // 移除旧图例
        const oldLegend = container.querySelector('.chart-legend-fallback');
        if (oldLegend) {
            oldLegend.remove();
        }
        
        // 创建新图例
        const legend = document.createElement('div');
        legend.className = 'chart-legend-fallback';
        legend.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
            font-size: 12px;
        `;
        
        const data = this.data.datasets[0].data;
        const labels = this.data.labels;
        const colors = this.data.datasets[0].backgroundColor;
        
        data.forEach((value, index) => {
            if (value > 0) {
                const item = document.createElement('div');
                item.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;
                
                const colorBox = document.createElement('div');
                colorBox.style.cssText = `
                    width: 12px;
                    height: 12px;
                    background-color: ${colors[index]};
                    border-radius: 2px;
                `;
                
                const text = document.createElement('span');
                text.textContent = `${labels[index]}: ${value}`;
                
                item.appendChild(colorBox);
                item.appendChild(text);
                legend.appendChild(item);
            }
        });
        
        container.appendChild(legend);
    };
    
    // 更新方法
    Chart.prototype.update = function() {
        const ctx = this.ctx.getContext('2d');
        ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
        this.createDoughnutChart();
    };
    
    // 销毁方法
    Chart.prototype.destroy = function() {
        const ctx = this.ctx.getContext('2d');
        ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
        
        const legend = this.ctx.parentElement.querySelector('.chart-legend-fallback');
        if (legend) {
            legend.remove();
        }
    };
    
    console.log('Chart.js备用实现已加载');
}
