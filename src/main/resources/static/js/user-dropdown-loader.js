/**
 * 用户下拉菜单动态加载器
 * 使用方法：在页面中添加 <div id="user-dropdown-container"></div>
 * 然后引入此脚本即可自动加载
 */

(function() {
    'use strict';

    const UserDropdownLoader = {
        // HTML模板
        template: `
            <div class="user-info" id="userInfo">
                <span id="username">管理员</span>
                <img id="userAvatar" src="1.png" alt="用户头像">
                <i class="fas fa-chevron-down"></i>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" id="switchAccount">
                        <i class="fas fa-exchange-alt"></i>
                        <span>切换账号</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" id="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        `,

        // CSS样式
        styles: `
            .user-info {
                display: flex;
                align-items: center;
                position: relative;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 8px;
                transition: background-color 0.3s;
            }
            .user-info:hover { background-color: #f0f0f0; }
            .user-info #username {
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }
            .user-info img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-left: 10px;
                margin-right: 8px;
            }
            .user-info .fa-chevron-down {
                font-size: 12px;
                color: #666;
                transition: transform 0.3s;
            }
            .user-info.active .fa-chevron-down {
                transform: rotate(180deg);
            }
            .user-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                min-width: 180px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            .user-dropdown.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .dropdown-item {
                padding: 12px 16px;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: background-color 0.2s;
                color: #333;
                font-size: 14px;
            }
            .dropdown-item:first-child { border-radius: 8px 8px 0 0; }
            .dropdown-item:last-child { border-radius: 0 0 8px 8px; }
            .dropdown-item:hover { background-color: #f5f5f5; }
            .dropdown-item i {
                margin-right: 10px;
                width: 16px;
                text-align: center;
                color: #666;
            }
            .dropdown-item#logout:hover {
                background-color: #fee;
                color: #e53e3e;
            }
            .dropdown-item#logout:hover i { color: #e53e3e; }
            .dropdown-divider {
                height: 1px;
                background-color: #e5e5e5;
                margin: 4px 0;
            }
        `,

        // 初始化
        init: function() {
            this.injectStyles();
            this.injectHTML();
            this.bindEvents();
            this.loadUsername();
            this.loadAvatar();
            this.listenAvatarUpdate();
        },

        // 注入样式
        injectStyles: function() {
            if (document.getElementById('user-dropdown-styles')) return;

            const style = document.createElement('style');
            style.id = 'user-dropdown-styles';
            style.textContent = this.styles;
            document.head.appendChild(style);
        },

        // 注入HTML
        injectHTML: function() {
            const container = document.getElementById('user-dropdown-container');
            if (!container) {
                console.warn('未找到 #user-dropdown-container 容器');
                return;
            }
            container.innerHTML = this.template;
        },

        // 绑定事件
        bindEvents: function() {
            const userInfo = document.getElementById('userInfo');
            const userDropdown = document.getElementById('userDropdown');
            const switchAccountBtn = document.getElementById('switchAccount');
            const logoutBtn = document.getElementById('logout');

            if (!userInfo || !userDropdown) return;

            userInfo.addEventListener('click', function(e) {
                e.stopPropagation();
                userInfo.classList.toggle('active');
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', function() {
                userInfo.classList.remove('active');
                userDropdown.classList.remove('show');
            });

            userDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            if (switchAccountBtn) {
                switchAccountBtn.addEventListener('click', this.switchAccount);
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', this.logout);
            }
        },

        // 加载用户名
        loadUsername: function() {
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                // 从localStorage读取username，如果没有则显示"管理员"
                const username = localStorage.getItem('username');
                usernameElement.textContent = username || '管理员';
            }
        },

        // 加载用户头像
        loadAvatar: function() {
            const avatarElement = document.getElementById('userAvatar');
            if (avatarElement) {
                const avatar = localStorage.getItem('userAvatar');
                if (avatar && avatar !== 'null' && avatar !== '') {
                    avatarElement.src = avatar;
                    console.log('加载用户头像:', avatar);
                } else {
                    avatarElement.src = '1.png';
                    console.log('使用默认头像');
                }
            }
        },

        // 监听头像更新
        listenAvatarUpdate: function() {
            const self = this;
            
            // 监听自定义事件（同页面内更新）
            window.addEventListener('avatarUpdated', function(e) {
                console.log('收到头像更新事件:', e.detail);
                const avatarElement = document.getElementById('userAvatar');
                if (avatarElement && e.detail && e.detail.avatar) {
                    avatarElement.src = e.detail.avatar;
                    console.log('头像已更新为:', e.detail.avatar);
                }
            });

            // 监听localStorage变化（跨页面更新）
            window.addEventListener('storage', function(e) {
                if (e.key === 'userAvatar') {
                    console.log('localStorage头像变化:', e.newValue);
                    const avatarElement = document.getElementById('userAvatar');
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
        },

        // 切换账号
        switchAccount: function() {
            if (confirm('确定要切换账号吗？')) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('realname');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('userInfo');
                window.location.href = '登录.html';
            }
        },

        // 退出登录
        logout: function() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('realname');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('userInfo');
                window.location.href = '登录.html';
            }
        }
    };

    // 页面加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            UserDropdownLoader.init();
        });
    } else {
        UserDropdownLoader.init();
    }

    // 暴露到全局（可选）
    window.UserDropdownLoader = UserDropdownLoader;
})();
