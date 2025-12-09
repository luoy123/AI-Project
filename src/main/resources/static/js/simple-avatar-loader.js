/**
 * 简单头像加载器
 * 只显示头像，不包含下拉菜单功能
 * 使用方法：在页面中添加 <div id="simple-avatar-container"></div>
 * 然后引入此脚本即可自动加载
 */

(function() {
    'use strict';

    const SimpleAvatarLoader = {
        // HTML模板 - 只有头像
        template: `
            <div class="simple-avatar" id="simpleAvatar">
                <img id="simpleAvatarImg" src="1.png" alt="用户头像">
            </div>
        `,

        // CSS样式
        styles: `
            .simple-avatar {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5px;
            }
            
            .simple-avatar img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #e5e7eb;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .simple-avatar img:hover {
                border-color: #3b82f6;
                transform: scale(1.05);
            }
        `,

        // 初始化
        init: function() {
            this.injectStyles();
            this.injectHTML();
            this.loadAvatar();
            this.listenAvatarUpdate();
        },

        // 注入样式
        injectStyles: function() {
            if (document.getElementById('simple-avatar-styles')) return;

            const style = document.createElement('style');
            style.id = 'simple-avatar-styles';
            style.textContent = this.styles;
            document.head.appendChild(style);
        },

        // 注入HTML
        injectHTML: function() {
            const container = document.getElementById('simple-avatar-container');
            if (!container) {
                console.warn('未找到 #simple-avatar-container 容器');
                return;
            }
            container.innerHTML = this.template;
        },

        // 加载用户头像
        loadAvatar: function() {
            const avatarElement = document.getElementById('simpleAvatarImg');
            if (avatarElement) {
                // 先尝试修复URL格式
                this.fixAvatarUrl();
                
                const avatar = localStorage.getItem('userAvatar');
                if (avatar && avatar !== 'null' && avatar !== '') {
                    avatarElement.src = avatar;
                    console.log('简单头像加载:', avatar);
                } else {
                    avatarElement.src = '1.png';
                    console.log('使用默认头像');
                }
            }
        },

        // 修复头像URL格式
        fixAvatarUrl: function() {
            const userAvatar = localStorage.getItem('userAvatar');
            if (userAvatar && userAvatar.startsWith('/upload/')) {
                const fixedUrl = userAvatar.replace('/upload/', '/api/upload/');
                localStorage.setItem('userAvatar', fixedUrl);
                console.log('修复头像URL:', userAvatar, '->', fixedUrl);
                
                // 同时修复userInfo中的头像
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    if (userInfo.avatar && userInfo.avatar.startsWith('/upload/')) {
                        userInfo.avatar = userInfo.avatar.replace('/upload/', '/api/upload/');
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    }
                } catch (e) {
                    console.error('修复userInfo头像失败:', e);
                }
            }
        },

        // 监听头像更新
        listenAvatarUpdate: function() {
            const self = this;
            
            // 监听自定义事件（同页面内更新）
            window.addEventListener('avatarUpdated', function(e) {
                console.log('简单头像收到更新事件:', e.detail);
                const avatarElement = document.getElementById('simpleAvatarImg');
                if (avatarElement && e.detail && e.detail.avatar) {
                    avatarElement.src = e.detail.avatar;
                    console.log('简单头像已更新为:', e.detail.avatar);
                }
            });

            // 监听localStorage变化（跨页面更新）
            window.addEventListener('storage', function(e) {
                if (e.key === 'userAvatar') {
                    console.log('简单头像localStorage变化:', e.newValue);
                    const avatarElement = document.getElementById('simpleAvatarImg');
                    if (avatarElement) {
                        const newAvatar = e.newValue;
                        if (newAvatar && newAvatar !== 'null' && newAvatar !== '') {
                            avatarElement.src = newAvatar;
                        } else {
                            avatarElement.src = '1.png';
                        }
                    }
                }
            });
        }
    };

    // 页面加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SimpleAvatarLoader.init();
        });
    } else {
        SimpleAvatarLoader.init();
    }

    // 暴露到全局（可选）
    window.SimpleAvatarLoader = SimpleAvatarLoader;
})();
