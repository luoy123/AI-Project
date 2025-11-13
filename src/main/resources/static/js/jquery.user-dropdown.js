/**
 * jQuery用户下拉菜单插件
 * 使用方法：$('#user-dropdown-container').userDropdown();
 */

(function($) {
    'use strict';

    $.fn.userDropdown = function(options) {
        // 默认配置
        const settings = $.extend({
            username: '管理员',
            avatarSrc: '1.png',
            onSwitchAccount: function() {
                if (confirm('确定要切换账号吗？')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    window.location.href = '登录.html';
                }
            },
            onLogout: function() {
                if (confirm('确定要退出登录吗？')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '登录.html';
                }
            }
        }, options);

        return this.each(function() {
            const $container = $(this);

            // HTML模板
            const template = `
                <div class="user-info" id="userInfo">
                    <span id="username">${settings.username}</span>
                    <img src="${settings.avatarSrc}" alt="用户头像">
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
            `;

            // CSS样式
            const styles = `
                <style id="user-dropdown-styles">
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
                </style>
            `;

            // 注入样式（只注入一次）
            if ($('#user-dropdown-styles').length === 0) {
                $('head').append(styles);
            }

            // 注入HTML
            $container.html(template);

            // 从localStorage加载用户名
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                $('#username').text(storedUsername);
            }

            // 绑定事件
            const $userInfo = $('#userInfo');
            const $userDropdown = $('#userDropdown');

            $userInfo.on('click', function(e) {
                e.stopPropagation();
                $userInfo.toggleClass('active');
                $userDropdown.toggleClass('show');
            });

            $(document).on('click', function() {
                $userInfo.removeClass('active');
                $userDropdown.removeClass('show');
            });

            $userDropdown.on('click', function(e) {
                e.stopPropagation();
            });

            $('#switchAccount').on('click', settings.onSwitchAccount);
            $('#logout').on('click', settings.onLogout);
        });
    };

})(jQuery);
