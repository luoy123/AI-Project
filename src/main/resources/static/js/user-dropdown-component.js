/**
 * 用户下拉菜单 Web Component
 * 使用方法：<user-dropdown></user-dropdown>
 */

class UserDropdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.bindEvents();
        this.loadUsername();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    position: relative;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: background-color 0.3s;
                }
                .user-info:hover {
                    background-color: #f0f0f0;
                }
                .username {
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-left: 10px;
                    margin-right: 8px;
                }
                .chevron {
                    font-size: 12px;
                    color: #666;
                    transition: transform 0.3s;
                }
                .user-info.active .chevron {
                    transform: rotate(180deg);
                }
                .dropdown {
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
                .dropdown.show {
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
                .dropdown-item:first-child {
                    border-radius: 8px 8px 0 0;
                }
                .dropdown-item:last-child {
                    border-radius: 0 0 8px 8px;
                }
                .dropdown-item:hover {
                    background-color: #f5f5f5;
                }
                .dropdown-item.logout:hover {
                    background-color: #fee;
                    color: #e53e3e;
                }
                .icon {
                    margin-right: 10px;
                    width: 16px;
                    text-align: center;
                }
                .divider {
                    height: 1px;
                    background-color: #e5e5e5;
                    margin: 4px 0;
                }
            </style>

            <div class="user-info" id="userInfo">
                <span class="username" id="username">管理员</span>
                <img class="avatar" src="1.png" alt="用户头像">
                <span class="chevron">▼</span>
                <div class="dropdown" id="dropdown">
                    <div class="dropdown-item" id="switchAccount">
                        <span class="icon">🔄</span>
                        <span>切换账号</span>
                    </div>
                    <div class="divider"></div>
                    <div class="dropdown-item logout" id="logout">
                        <span class="icon">🚪</span>
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const userInfo = this.shadowRoot.getElementById('userInfo');
        const dropdown = this.shadowRoot.getElementById('dropdown');
        const switchAccountBtn = this.shadowRoot.getElementById('switchAccount');
        const logoutBtn = this.shadowRoot.getElementById('logout');

        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            userInfo.classList.toggle('active');
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            userInfo.classList.remove('active');
            dropdown.classList.remove('show');
        });

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        switchAccountBtn.addEventListener('click', () => this.switchAccount());
        logoutBtn.addEventListener('click', () => this.logout());
    }

    loadUsername() {
        const username = localStorage.getItem('username');
        const usernameElement = this.shadowRoot.getElementById('username');
        if (username) {
            usernameElement.textContent = username;
        }
    }

    switchAccount() {
        if (confirm('确定要切换账号吗？')) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '登录.html';
        }
    }

    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('refreshToken');
            window.location.href = '登录.html';
        }
    }
}

// 注册自定义元素
customElements.define('user-dropdown', UserDropdown);
