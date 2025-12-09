// 简单的用户头像和退出功能
(function() {
    'use strict';
    
    console.log('👤 用户头像脚本加载...');
    
    // 等待DOM加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatar);
    } else {
        initAvatar();
    }
    
    function initAvatar() {
        const container = document.getElementById('simple-avatar-container');
        
        if (!container) {
            console.warn('⚠️  未找到头像容器，稍后重试...');
            setTimeout(initAvatar, 500);
            return;
        }
        
        // 从sessionStorage获取用户信息
        const userInfo = sessionStorage.getItem('userInfo');
        let username = 'Admin';
        
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                username = user.username || user.name || 'Admin';
            } catch (e) {
                console.warn('⚠️  解析用户信息失败:', e);
            }
        }
        
        // 创建头像HTML
        container.innerHTML = `
            <div class="avatar-wrapper" style="position: relative; cursor: pointer;">
                <div class="avatar-circle" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ${username.charAt(0).toUpperCase()}
                </div>
                <div class="avatar-dropdown" style="
                    position: absolute;
                    top: 45px;
                    right: 0;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    min-width: 150px;
                    display: none;
                    z-index: 1000;
                    overflow: hidden;
                ">
                    <div class="dropdown-header" style="
                        padding: 12px 16px;
                        border-bottom: 1px solid #f0f0f0;
                        font-weight: 600;
                        color: #333;
                    ">
                        ${username}
                    </div>
                    <div class="dropdown-item" onclick="handleLogout()" style="
                        padding: 10px 16px;
                        cursor: pointer;
                        color: #666;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='#f8f9fa';this.style.color='#333'" onmouseout="this.style.background='white';this.style.color='#666'">
                        <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>
                        退出登录
                    </div>
                </div>
            </div>
        `;
        
        // 绑定点击事件
        const avatarCircle = container.querySelector('.avatar-circle');
        const dropdown = container.querySelector('.avatar-dropdown');
        
        avatarCircle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            dropdown.style.display = 'none';
        });
        
        console.log('✅ 用户头像初始化完成:', username);
    }
    
    // 退出登录函数
    window.handleLogout = function() {
        console.log('🚪 退出登录...');
        
        // 清除session
        sessionStorage.clear();
        
        // 跳转到登录页
        const contextPath = window.location.pathname.startsWith('/api') ? '/api' : '';
        window.location.href = contextPath + '/login.html';
    };
    
})();
