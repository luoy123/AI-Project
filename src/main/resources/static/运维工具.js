// 运维工具管理类
class OperationToolsManager {
    constructor() {
        this.currentTool = 'filemanager';
        this.currentPath = '/home/admin';
        this.selectedFiles = new Set();
        this.fileHistory = ['/home/admin'];
        this.historyIndex = 0;
        this.terminalHistory = [];
        this.terminalHistoryIndex = -1;
        this.performanceCharts = {};
        this.monitoringInterval = null;
        this.isMonitoring = false;

        this.init();
    }

    init() {
        this.initEventListeners();
        // 默认显示文件管理器
        this.switchTool('filemanager');
    }

    // 初始化事件监听器
    initEventListeners() {
        // 工具标签切换
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.switchTool(tool);
            });
        });

        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFiles(e.target.value);
            });
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCurrentTool();
            });
        }

        // 文件管理器事件
        this.initFileManagerEvents();
        
        // 终端事件
        this.initTerminalEvents();
        
        // 快速访问事件
        this.initQuickAccessEvents();

        // 侧边栏导航事件
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span').textContent;
                console.log('导航到:', itemText);
                this.navigateToPage(itemText);
            });
        });
    }

    // 初始化文件管理器事件
    initFileManagerEvents() {
        // 导航按钮
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const upBtn = document.getElementById('upBtn');
        const pathGoBtn = document.getElementById('pathGoBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => this.navigateBack());
        }
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => this.navigateForward());
        }
        if (upBtn) {
            upBtn.addEventListener('click', () => this.navigateUp());
        }
        if (pathGoBtn) {
            pathGoBtn.addEventListener('click', () => this.navigateToPath());
        }

        // 路径输入框回车事件
        const pathInput = document.getElementById('pathInput');
        if (pathInput) {
            pathInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigateToPath();
                }
            });
        }

        // 文件操作按钮
        const newFolderBtn = document.getElementById('newFolderBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => this.createNewFolder());
        }
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadFiles());
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadSelected());
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelected());
        }

        // 文件上传输入
        const fileUploadInput = document.getElementById('fileUploadInput');
        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
    }

    // 初始化终端事件
    initTerminalEvents() {
        const terminalInput = document.getElementById('terminalInput');
        const newTerminalBtn = document.getElementById('newTerminalBtn');
        const clearTerminalBtn = document.getElementById('clearTerminalBtn');
        const fullscreenTerminalBtn = document.getElementById('fullscreenTerminalBtn');

        if (terminalInput) {
            terminalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(e.target.value);
                    e.target.value = '';
                }
                if (e.key === 'ArrowUp') {
                    this.showPreviousCommand();
                }
                if (e.key === 'ArrowDown') {
                    this.showNextCommand();
                }
            });
        }

        if (newTerminalBtn) {
            newTerminalBtn.addEventListener('click', () => this.createNewTerminal());
        }
        if (clearTerminalBtn) {
            clearTerminalBtn.addEventListener('click', () => this.clearTerminal());
        }
        if (fullscreenTerminalBtn) {
            fullscreenTerminalBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }

    // 初始化快速访问事件
    initQuickAccessEvents() {
        document.querySelectorAll('.quick-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const path = e.currentTarget.dataset.path;
                this.navigateToPath(path);
            });
        });
    }

    // 切换工具
    switchTool(tool) {
        // 更新标签状态
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const targetTab = document.querySelector(`[data-tool="${tool}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // 更新面板显示
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(tool);
        if (targetPanel) {
            targetPanel.classList.add('active');
        } else {
            console.error(`工具面板未找到: ${tool}`);
            return;
        }

        // 更新当前工具
        this.currentTool = tool;

        // 更新面包屑
        this.updateBreadcrumb(tool);

        // 根据工具类型执行特定操作
        switch (tool) {
            case 'filemanager':
                this.loadFileList();
                break;
            case 'terminal':
                this.focusTerminal();
                break;
            case 'systeminfo':
                this.loadSystemInfo();
                break;
            case 'processmanager':
                this.loadProcessList();
                break;
            case 'logviewer':
                this.loadLogFiles();
                break;
            case 'backup':
                this.loadBackupList();
                break;
            case 'network':
                this.initNetworkTools();
                break;
            case 'performance':
                this.initPerformanceMonitor();
                break;
            case 'security':
                this.initSecurityTools();
                break;
            case 'database':
                this.initDatabaseTools();
                break;
        }
    }

    // 切换视图
    switchView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // 根据视图类型更新文件列表显示
        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.className = `file-list ${view}-view`;
            this.loadFileList();
        }
    }

    // 更新面包屑
    updateBreadcrumb(tool) {
        const toolNames = {
            filemanager: '文件管理器',
            terminal: '终端工具',
            systeminfo: '系统信息',
            processmanager: '进程管理',
            logviewer: '日志查看',
            backup: '备份恢复'
        };

        const currentPathElement = document.getElementById('currentPath');
        if (currentPathElement) {
            currentPathElement.textContent = toolNames[tool] || '未知工具';
        }
    }

    // 搜索文件
    searchFiles(query) {
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            if (fileName.includes(query.toLowerCase())) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 刷新当前工具
    refreshCurrentTool() {
        switch (this.currentTool) {
            case 'filemanager':
                this.loadFileList();
                this.showNotification('文件列表已刷新', 'success');
                break;
            case 'terminal':
                this.showNotification('终端已刷新', 'success');
                break;
            case 'systeminfo':
                this.loadSystemInfo();
                this.showNotification('系统信息已刷新', 'success');
                break;
            default:
                this.showNotification('已刷新', 'success');
        }
    }

    // 加载文件列表
    loadFileList() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        // 模拟文件数据
        const files = this.generateMockFiles();

        // 清空现有内容
        fileList.innerHTML = '';

        // 添加文件项
        files.forEach(file => {
            const fileItem = this.createFileItem(file);
            fileList.appendChild(fileItem);
        });

        this.updateNavigationButtons();
        this.updatePathDisplay();
    }

    // 生成模拟文件数据
    generateMockFiles() {
        const files = [
            { name: '..', type: 'directory', size: '-', modified: '-', permissions: 'drwxr-xr-x' },
            { name: 'Documents', type: 'directory', size: '-', modified: '2024-01-15 10:30', permissions: 'drwxr-xr-x' },
            { name: 'Downloads', type: 'directory', size: '-', modified: '2024-01-14 16:45', permissions: 'drwxr-xr-x' },
            { name: 'Pictures', type: 'directory', size: '-', modified: '2024-01-13 09:20', permissions: 'drwxr-xr-x' },
            { name: 'config.txt', type: 'file', size: '2.5 KB', modified: '2024-01-15 14:22', permissions: '-rw-r--r--' },
            { name: 'script.sh', type: 'file', size: '1.8 KB', modified: '2024-01-15 11:15', permissions: '-rwxr-xr-x' },
            { name: 'data.json', type: 'file', size: '15.7 KB', modified: '2024-01-14 18:30', permissions: '-rw-r--r--' },
            { name: 'backup.tar.gz', type: 'file', size: '125.3 MB', modified: '2024-01-12 22:10', permissions: '-rw-r--r--' },
            { name: 'log.txt', type: 'file', size: '8.9 KB', modified: '2024-01-15 15:45', permissions: '-rw-r--r--' },
            { name: 'image.png', type: 'file', size: '2.1 MB', modified: '2024-01-13 12:00', permissions: '-rw-r--r--' }
        ];

        return files;
    }

    // 创建文件项元素
    createFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.filename = file.name;
        item.dataset.type = file.type;

        const iconClass = file.type === 'directory' ? 'fas fa-folder folder' : 'fas fa-file file';
        
        item.innerHTML = `
            <div class="file-name">
                <i class="file-icon ${iconClass}"></i>
                <span>${file.name}</span>
            </div>
            <div class="file-size">${file.size}</div>
            <div class="file-type">${file.type === 'directory' ? '文件夹' : '文件'}</div>
            <div class="file-modified">${file.modified}</div>
            <div class="file-permissions">${file.permissions}</div>
        `;

        // 添加点击事件
        item.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.toggleFileSelection(item);
            } else {
                this.selectFile(item);
            }
        });

        // 添加双击事件
        item.addEventListener('dblclick', () => {
            if (file.type === 'directory') {
                this.navigateToDirectory(file.name);
            } else {
                this.openFile(file.name);
            }
        });

        return item;
    }

    // 选择文件
    selectFile(item) {
        document.querySelectorAll('.file-item').forEach(f => f.classList.remove('selected'));
        item.classList.add('selected');
        this.selectedFiles.clear();
        this.selectedFiles.add(item.dataset.filename);
        this.updateActionButtons();
    }

    // 切换文件选择状态
    toggleFileSelection(item) {
        item.classList.toggle('selected');
        if (item.classList.contains('selected')) {
            this.selectedFiles.add(item.dataset.filename);
        } else {
            this.selectedFiles.delete(item.dataset.filename);
        }
        this.updateActionButtons();
    }

    // 更新操作按钮状态
    updateActionButtons() {
        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        const hasSelection = this.selectedFiles.size > 0;
        
        if (downloadBtn) downloadBtn.disabled = !hasSelection;
        if (deleteBtn) deleteBtn.disabled = !hasSelection;
    }

    // 导航到目录
    navigateToDirectory(dirname) {
        if (dirname === '..') {
            this.navigateUp();
        } else {
            const newPath = this.currentPath === '/' ? `/${dirname}` : `${this.currentPath}/${dirname}`;
            this.navigateToPath(newPath);
        }
    }

    // 导航到指定路径
    navigateToPath(path) {
        if (!path) {
            path = document.getElementById('pathInput').value;
        }
        
        this.currentPath = path;
        this.addToHistory(path);
        this.updatePathDisplay();
        this.loadFileList();
        this.selectedFiles.clear();
        this.updateActionButtons();
    }

    // 返回上级目录
    navigateUp() {
        if (this.currentPath !== '/') {
            const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
            this.navigateToPath(parentPath);
        }
    }

    // 后退导航
    navigateBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.fileHistory[this.historyIndex];
            this.updatePathDisplay();
            this.loadFileList();
            this.updateNavigationButtons();
        }
    }

    // 前进导航
    navigateForward() {
        if (this.historyIndex < this.fileHistory.length - 1) {
            this.historyIndex++;
            this.currentPath = this.fileHistory[this.historyIndex];
            this.updatePathDisplay();
            this.loadFileList();
            this.updateNavigationButtons();
        }
    }

    // 添加到历史记录
    addToHistory(path) {
        // 移除当前位置之后的历史记录
        this.fileHistory = this.fileHistory.slice(0, this.historyIndex + 1);
        // 添加新路径
        this.fileHistory.push(path);
        this.historyIndex = this.fileHistory.length - 1;
        this.updateNavigationButtons();
    }

    // 更新导航按钮状态
    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const upBtn = document.getElementById('upBtn');

        if (backBtn) {
            backBtn.disabled = this.historyIndex <= 0;
        }
        if (forwardBtn) {
            forwardBtn.disabled = this.historyIndex >= this.fileHistory.length - 1;
        }
        if (upBtn) {
            upBtn.disabled = this.currentPath === '/';
        }
    }

    // 更新路径显示
    updatePathDisplay() {
        const pathInput = document.getElementById('pathInput');
        if (pathInput) {
            pathInput.value = this.currentPath;
        }
    }

    // 创建新文件夹
    createNewFolder() {
        const name = prompt('请输入文件夹名称:');
        if (name && name.trim()) {
            this.showNotification(`文件夹 "${name}" 创建成功`, 'success');
            this.loadFileList();
        }
    }

    // 上传文件
    uploadFiles() {
        const fileInput = document.getElementById('fileUploadInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    // 处理文件上传
    handleFileUpload(files) {
        if (files.length > 0) {
            this.showNotification(`正在上传 ${files.length} 个文件...`, 'info');
            // 模拟上传过程
            setTimeout(() => {
                this.showNotification(`${files.length} 个文件上传成功`, 'success');
                this.loadFileList();
            }, 2000);
        }
    }

    // 下载选中文件
    downloadSelected() {
        if (this.selectedFiles.size > 0) {
            this.showNotification(`正在下载 ${this.selectedFiles.size} 个文件...`, 'info');
            // 模拟下载过程
            setTimeout(() => {
                this.showNotification('文件下载完成', 'success');
            }, 1500);
        }
    }

    // 删除选中文件
    deleteSelected() {
        if (this.selectedFiles.size > 0) {
            const confirmed = confirm(`确定要删除选中的 ${this.selectedFiles.size} 个文件吗？`);
            if (confirmed) {
                this.showNotification(`${this.selectedFiles.size} 个文件已删除`, 'success');
                this.selectedFiles.clear();
                this.loadFileList();
                this.updateActionButtons();
            }
        }
    }

    // 打开文件
    openFile(filename) {
        this.showNotification(`正在打开文件: ${filename}`, 'info');
    }

    // 执行终端命令
    executeCommand(command) {
        if (!command.trim()) return;

        // 添加到历史记录
        this.terminalHistory.push(command);
        this.terminalHistoryIndex = this.terminalHistory.length;

        // 显示命令
        this.addTerminalLine(`admin@server:${this.currentPath}$ ${command}`, 'command');

        // 模拟命令执行
        setTimeout(() => {
            const output = this.simulateCommand(command);
            this.addTerminalLine(output, 'output');
        }, 100);
    }

    // 模拟命令执行
    simulateCommand(command) {
        const cmd = command.trim().toLowerCase();
        
        if (cmd === 'ls' || cmd === 'ls -la') {
            return 'total 48\ndrwxr-xr-x  8 admin admin 4096 Jan 15 10:30 .\ndrwxr-xr-x  3 root  root  4096 Jan 10 09:15 ..\n-rw-r--r--  1 admin admin  220 Jan 10 09:15 .bash_logout\n-rw-r--r--  1 admin admin 3771 Jan 10 09:15 .bashrc\ndrwxr-xr-x  2 admin admin 4096 Jan 15 10:30 Documents\ndrwxr-xr-x  2 admin admin 4096 Jan 14 16:45 Downloads';
        } else if (cmd === 'pwd') {
            return this.currentPath;
        } else if (cmd === 'whoami') {
            return 'admin';
        } else if (cmd === 'date') {
            return new Date().toString();
        } else if (cmd === 'uptime') {
            return 'up 15 days,  8:32,  2 users,  load average: 0.15, 0.25, 0.18';
        } else if (cmd === 'df -h') {
            return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       500G  325G  150G  65% /\n/dev/sda2       1.0T  450G  550G  45% /home';
        } else if (cmd === 'ps aux') {
            return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1 225316  9012 ?        Ss   Jan01   0:02 /sbin/init\nroot         2  0.0  0.0      0     0 ?        S    Jan01   0:00 [kthreadd]';
        } else if (cmd.startsWith('cd ')) {
            const newPath = cmd.substring(3).trim();
            if (newPath === '..') {
                this.navigateUp();
            } else if (newPath.startsWith('/')) {
                this.navigateToPath(newPath);
            } else {
                const fullPath = this.currentPath === '/' ? `/${newPath}` : `${this.currentPath}/${newPath}`;
                this.navigateToPath(fullPath);
            }
            return '';
        } else if (cmd === 'clear') {
            this.clearTerminal();
            return '';
        } else if (cmd === 'help') {
            return 'Available commands:\nls, pwd, whoami, date, uptime, df, ps, cd, clear, help\nType any command to execute it.';
        } else {
            return `bash: ${command}: command not found`;
        }
    }

    // 添加终端行
    addTerminalLine(text, type = 'output') {
        const terminalOutput = document.getElementById('terminalOutput');
        if (!terminalOutput) return;

        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        if (type === 'command') {
            line.innerHTML = `<span class="terminal-prompt">admin@server:${this.currentPath}$</span> <span class="terminal-text">${text.substring(text.indexOf('$') + 1)}</span>`;
        } else {
            line.innerHTML = `<span class="terminal-text">${text}</span>`;
        }

        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // 显示上一个命令
    showPreviousCommand() {
        if (this.terminalHistoryIndex > 0) {
            this.terminalHistoryIndex--;
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                terminalInput.value = this.terminalHistory[this.terminalHistoryIndex];
            }
        }
    }

    // 显示下一个命令
    showNextCommand() {
        if (this.terminalHistoryIndex < this.terminalHistory.length - 1) {
            this.terminalHistoryIndex++;
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                terminalInput.value = this.terminalHistory[this.terminalHistoryIndex];
            }
        } else {
            this.terminalHistoryIndex = this.terminalHistory.length;
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                terminalInput.value = '';
            }
        }
    }

    // 清空终端
    clearTerminal() {
        const terminalOutput = document.getElementById('terminalOutput');
        if (terminalOutput) {
            terminalOutput.innerHTML = '<div class="terminal-line"><span class="terminal-prompt">admin@server:~$</span> <span class="terminal-text">终端已清空</span></div>';
        }
    }

    // 聚焦终端
    focusTerminal() {
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.focus();
        }
    }

    // 创建新终端
    createNewTerminal() {
        this.showNotification('新终端标签页已创建', 'success');
    }

    // 切换全屏
    toggleFullscreen() {
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.toggle('fullscreen');
            this.showNotification('终端全屏模式已切换', 'info');
        }
    }

    // 加载系统信息
    loadSystemInfo() {
        // 系统信息已在HTML中静态定义，这里可以添加动态更新逻辑
        this.showNotification('系统信息已加载', 'success');
    }

    // 加载进程列表
    loadProcessList() {
        // 创建进程管理面板
        this.createProcessManagerPanel();
        this.showNotification('进程列表已加载', 'success');
    }

    // 创建进程管理面板
    createProcessManagerPanel() {
        const processPanel = document.getElementById('processmanager');
        if (!processPanel) return;

        processPanel.innerHTML = `
            <div class="process-manager">
                <div class="process-header">
                    <h3>进程管理</h3>
                    <div class="process-actions">
                        <button class="btn btn-primary" id="refreshProcesses">
                            <i class="fas fa-sync-alt"></i> 刷新
                        </button>
                        <button class="btn btn-danger" id="killProcess" disabled>
                            <i class="fas fa-times"></i> 结束进程
                        </button>
                    </div>
                </div>
                <div class="process-stats">
                    <div class="stat-item">
                        <span class="stat-label">总进程数:</span>
                        <span class="stat-value">156</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">运行中:</span>
                        <span class="stat-value">89</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">休眠:</span>
                        <span class="stat-value">67</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">CPU使用率:</span>
                        <span class="stat-value">15.6%</span>
                    </div>
                </div>
                <div class="process-list">
                    <div class="process-list-header">
                        <div class="process-header-item">PID</div>
                        <div class="process-header-item">进程名</div>
                        <div class="process-header-item">用户</div>
                        <div class="process-header-item">CPU%</div>
                        <div class="process-header-item">内存%</div>
                        <div class="process-header-item">状态</div>
                    </div>
                    <div class="process-items" id="processItems">
                        ${this.generateProcessItems()}
                    </div>
                </div>
            </div>
        `;

        // 绑定进程管理事件
        this.bindProcessManagerEvents();
    }

    // 生成进程项
    generateProcessItems() {
        const processes = [
            { pid: 1, name: 'systemd', user: 'root', cpu: 0.1, memory: 0.2, status: 'S', command: '/sbin/init', startTime: '2024-01-01 00:00:01' },
            { pid: 2, name: 'kthreadd', user: 'root', cpu: 0.0, memory: 0.0, status: 'S', command: '[kthreadd]', startTime: '2024-01-01 00:00:01' },
            { pid: 156, name: 'nginx', user: 'www-data', cpu: 2.3, memory: 1.5, status: 'S', command: 'nginx: master process', startTime: '2024-01-15 08:30:15' },
            { pid: 157, name: 'nginx', user: 'www-data', cpu: 1.8, memory: 1.2, status: 'S', command: 'nginx: worker process', startTime: '2024-01-15 08:30:16' },
            { pid: 158, name: 'nginx', user: 'www-data', cpu: 1.5, memory: 1.1, status: 'S', command: 'nginx: worker process', startTime: '2024-01-15 08:30:16' },
            { pid: 234, name: 'mysqld', user: 'mysql', cpu: 5.8, memory: 12.3, status: 'S', command: '/usr/sbin/mysqld', startTime: '2024-01-15 08:25:30' },
            { pid: 345, name: 'apache2', user: 'www-data', cpu: 3.2, memory: 4.7, status: 'S', command: '/usr/sbin/apache2 -k start', startTime: '2024-01-15 08:28:45' },
            { pid: 346, name: 'apache2', user: 'www-data', cpu: 2.1, memory: 3.8, status: 'S', command: '/usr/sbin/apache2 -k start', startTime: '2024-01-15 08:28:46' },
            { pid: 456, name: 'redis-server', user: 'redis', cpu: 1.1, memory: 2.8, status: 'S', command: '/usr/bin/redis-server', startTime: '2024-01-15 08:32:10' },
            { pid: 567, name: 'node', user: 'admin', cpu: 8.5, memory: 15.6, status: 'R', command: 'node /app/server.js', startTime: '2024-01-15 09:15:22' },
            { pid: 678, name: 'python3', user: 'admin', cpu: 4.2, memory: 8.9, status: 'S', command: 'python3 /opt/monitor/app.py', startTime: '2024-01-15 09:20:33' },
            { pid: 789, name: 'sshd', user: 'root', cpu: 0.1, memory: 0.3, status: 'S', command: '/usr/sbin/sshd -D', startTime: '2024-01-15 08:22:15' },
            { pid: 890, name: 'cron', user: 'root', cpu: 0.0, memory: 0.1, status: 'S', command: '/usr/sbin/cron -f', startTime: '2024-01-15 08:21:45' },
            { pid: 901, name: 'rsyslog', user: 'syslog', cpu: 0.2, memory: 0.5, status: 'S', command: '/usr/sbin/rsyslogd -n', startTime: '2024-01-15 08:21:30' },
            { pid: 1012, name: 'docker', user: 'root', cpu: 1.5, memory: 3.2, status: 'S', command: '/usr/bin/dockerd', startTime: '2024-01-15 08:35:20' },
            { pid: 1123, name: 'containerd', user: 'root', cpu: 0.8, memory: 2.1, status: 'S', command: '/usr/bin/containerd', startTime: '2024-01-15 08:35:18' },
            { pid: 1234, name: 'prometheus', user: 'prometheus', cpu: 2.7, memory: 6.4, status: 'S', command: '/usr/local/bin/prometheus', startTime: '2024-01-15 08:40:12' },
            { pid: 1345, name: 'grafana-server', user: 'grafana', cpu: 1.9, memory: 4.3, status: 'S', command: '/usr/sbin/grafana-server', startTime: '2024-01-15 08:42:30' },
            { pid: 1456, name: 'elasticsearch', user: 'elasticsearch', cpu: 6.2, memory: 18.7, status: 'S', command: '/usr/share/elasticsearch/bin/elasticsearch', startTime: '2024-01-15 08:38:45' },
            { pid: 1567, name: 'kibana', user: 'kibana', cpu: 2.4, memory: 7.8, status: 'S', command: '/usr/share/kibana/bin/kibana', startTime: '2024-01-15 08:45:15' },
            { pid: 1678, name: 'logstash', user: 'logstash', cpu: 3.1, memory: 9.2, status: 'S', command: '/usr/share/logstash/bin/logstash', startTime: '2024-01-15 08:43:20' },
            { pid: 1789, name: 'zabbix_server', user: 'zabbix', cpu: 1.3, memory: 3.6, status: 'S', command: '/usr/sbin/zabbix_server', startTime: '2024-01-15 08:50:10' },
            { pid: 1890, name: 'postfix', user: 'postfix', cpu: 0.3, memory: 1.2, status: 'S', command: '/usr/lib/postfix/sbin/master', startTime: '2024-01-15 08:26:40' },
            { pid: 1901, name: 'fail2ban-server', user: 'root', cpu: 0.2, memory: 0.8, status: 'S', command: '/usr/bin/python3 /usr/bin/fail2ban-server', startTime: '2024-01-15 08:28:20' },
            { pid: 2012, name: 'ntpd', user: 'ntp', cpu: 0.1, memory: 0.2, status: 'S', command: '/usr/sbin/ntpd -p /var/run/ntpd.pid', startTime: '2024-01-15 08:24:35' },
            { pid: 2123, name: 'snmpd', user: 'snmp', cpu: 0.4, memory: 1.1, status: 'S', command: '/usr/sbin/snmpd', startTime: '2024-01-15 08:29:50' },
            { pid: 2234, name: 'collectd', user: 'collectd', cpu: 0.6, memory: 1.8, status: 'S', command: '/usr/sbin/collectd', startTime: '2024-01-15 08:33:25' },
            { pid: 2345, name: 'filebeat', user: 'root', cpu: 0.9, memory: 2.3, status: 'S', command: '/usr/share/filebeat/bin/filebeat', startTime: '2024-01-15 08:47:10' },
            { pid: 2456, name: 'metricbeat', user: 'root', cpu: 0.7, memory: 1.9, status: 'S', command: '/usr/share/metricbeat/bin/metricbeat', startTime: '2024-01-15 08:48:30' },
            { pid: 2567, name: 'java', user: 'tomcat', cpu: 7.3, memory: 22.4, status: 'R', command: 'java -Xmx2g -jar /opt/tomcat/bin/bootstrap.jar', startTime: '2024-01-15 08:55:45' },
            { pid: 2678, name: 'php-fpm', user: 'www-data', cpu: 2.8, memory: 5.6, status: 'S', command: 'php-fpm: master process', startTime: '2024-01-15 08:31:20' }
        ];

        // 随机化一些数据使其更真实
        processes.forEach(proc => {
            proc.cpu = (proc.cpu + (Math.random() - 0.5) * 2).toFixed(1);
            proc.memory = (proc.memory + (Math.random() - 0.5) * 3).toFixed(1);
            if (proc.cpu < 0) proc.cpu = 0.0;
            if (proc.memory < 0) proc.memory = 0.0;
        });

        return processes.map(proc => `
            <div class="process-item" data-pid="${proc.pid}" title="${proc.command}">
                <div class="process-cell">${proc.pid}</div>
                <div class="process-cell">
                    <div class="process-name">${proc.name}</div>
                    <div class="process-command">${proc.command.length > 30 ? proc.command.substring(0, 30) + '...' : proc.command}</div>
                </div>
                <div class="process-cell">${proc.user}</div>
                <div class="process-cell">${proc.cpu}%</div>
                <div class="process-cell">${proc.memory}%</div>
                <div class="process-cell">
                    <span class="process-status ${proc.status === 'R' ? 'running' : 'sleeping'}">${proc.status}</span>
                </div>
            </div>
        `).join('');
    }

    // 绑定进程管理事件
    bindProcessManagerEvents() {
        const refreshBtn = document.getElementById('refreshProcesses');
        const killBtn = document.getElementById('killProcess');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadProcessList();
            });
        }

        if (killBtn) {
            killBtn.addEventListener('click', () => {
                this.killSelectedProcess();
            });
        }

        // 进程项点击事件
        document.querySelectorAll('.process-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.process-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                killBtn.disabled = false;
            });
        });
    }

    // 结束选中进程
    killSelectedProcess() {
        const selectedProcess = document.querySelector('.process-item.selected');
        if (selectedProcess) {
            const pid = selectedProcess.dataset.pid;
            const confirmed = confirm(`确定要结束进程 ${pid} 吗？`);
            if (confirmed) {
                this.showNotification(`进程 ${pid} 已结束`, 'success');
                this.loadProcessList();
            }
        }
    }

    // 加载日志文件
    loadLogFiles() {
        this.createLogViewerPanel();
        this.showNotification('日志查看器已加载', 'success');
    }

    // 创建日志查看面板
    createLogViewerPanel() {
        const logPanel = document.getElementById('logviewer');
        if (!logPanel) return;

        logPanel.innerHTML = `
            <div class="log-viewer">
                <div class="log-header">
                    <h3>日志查看器</h3>
                    <div class="log-controls">
                        <select id="logFileSelect" class="log-select">
                            <option value="/var/log/syslog">系统日志 (syslog)</option>
                            <option value="/var/log/auth.log">认证日志 (auth.log)</option>
                            <option value="/var/log/nginx/access.log">Nginx访问日志</option>
                            <option value="/var/log/nginx/error.log">Nginx错误日志</option>
                            <option value="/var/log/mysql/error.log">MySQL错误日志</option>
                        </select>
                        <button class="btn btn-primary" id="refreshLog">
                            <i class="fas fa-sync-alt"></i> 刷新
                        </button>
                        <button class="btn btn-secondary" id="downloadLog">
                            <i class="fas fa-download"></i> 下载
                        </button>
                    </div>
                </div>
                <div class="log-filters">
                    <input type="text" id="logSearch" placeholder="搜索日志内容..." class="log-search">
                    <select id="logLevel" class="log-level">
                        <option value="">所有级别</option>
                        <option value="ERROR">错误</option>
                        <option value="WARN">警告</option>
                        <option value="INFO">信息</option>
                        <option value="DEBUG">调试</option>
                    </select>
                    <input type="datetime-local" id="logStartTime" class="log-time">
                    <input type="datetime-local" id="logEndTime" class="log-time">
                </div>
                <div class="log-content">
                    <div class="log-lines" id="logLines">
                        ${this.generateLogLines()}
                    </div>
                </div>
                <div class="log-footer">
                    <span class="log-info">显示最近 100 行日志</span>
                    <div class="log-pagination">
                        <button class="btn btn-sm" id="prevLogPage">上一页</button>
                        <span class="page-info">1 / 10</span>
                        <button class="btn btn-sm" id="nextLogPage">下一页</button>
                    </div>
                </div>
            </div>
        `;

        this.bindLogViewerEvents();
    }

    // 生成日志行
    generateLogLines() {
        const logs = [
            { time: '2024-01-15 15:45:23', level: 'INFO', source: 'systemd', message: 'System startup completed successfully' },
            { time: '2024-01-15 15:44:12', level: 'WARN', source: 'kernel', message: 'High memory usage detected: 85% (6.8GB/8GB)' },
            { time: '2024-01-15 15:43:45', level: 'ERROR', source: 'mysql', message: 'Failed to connect to database server: Connection refused (111)' },
            { time: '2024-01-15 15:42:30', level: 'INFO', source: 'sshd', message: 'User admin logged in from 192.168.1.100 port 22' },
            { time: '2024-01-15 15:41:15', level: 'DEBUG', source: 'nginx', message: 'Processing request: GET /api/status HTTP/1.1' },
            { time: '2024-01-15 15:40:58', level: 'INFO', source: 'backup', message: 'Backup process completed successfully: /backup/system_20240115.tar.gz' },
            { time: '2024-01-15 15:39:42', level: 'WARN', source: 'disk-monitor', message: 'Disk space low on /var partition: 90% used (45GB/50GB)' },
            { time: '2024-01-15 15:38:27', level: 'ERROR', source: 'systemctl', message: 'Service nginx failed to restart: Job for nginx.service failed' },
            { time: '2024-01-15 15:37:15', level: 'INFO', source: 'cron', message: 'Scheduled job executed: /usr/local/bin/cleanup.sh' },
            { time: '2024-01-15 15:36:48', level: 'WARN', source: 'fail2ban', message: 'Found 192.168.1.200 - 3 failed login attempts' },
            { time: '2024-01-15 15:35:33', level: 'INFO', source: 'docker', message: 'Container web-app-1 started successfully' },
            { time: '2024-01-15 15:34:22', level: 'ERROR', source: 'php-fpm', message: 'PHP Fatal error: Uncaught exception in /var/www/app.php:127' },
            { time: '2024-01-15 15:33:11', level: 'DEBUG', source: 'apache2', message: 'mod_rewrite: redirect /old-page to /new-page [R=301,L]' },
            { time: '2024-01-15 15:32:05', level: 'INFO', source: 'postfix', message: 'Email sent successfully to user@example.com' },
            { time: '2024-01-15 15:31:44', level: 'WARN', source: 'redis', message: 'Memory usage warning: 512MB used of 1GB allocated' },
            { time: '2024-01-15 15:30:33', level: 'INFO', source: 'zabbix', message: 'Host monitoring data collected: CPU 45%, Memory 67%' },
            { time: '2024-01-15 15:29:28', level: 'ERROR', source: 'elasticsearch', message: 'Cluster health status changed to YELLOW: unassigned shards detected' },
            { time: '2024-01-15 15:28:17', level: 'DEBUG', source: 'filebeat', message: 'Harvester started for file: /var/log/nginx/access.log' },
            { time: '2024-01-15 15:27:09', level: 'INFO', source: 'prometheus', message: 'Metrics scraped from target: http://localhost:9100/metrics' },
            { time: '2024-01-15 15:26:55', level: 'WARN', source: 'grafana', message: 'Dashboard query timeout: query took 30s to execute' },
            { time: '2024-01-15 15:25:42', level: 'INFO', source: 'ufw', message: 'Firewall rule added: ALLOW 443/tcp from anywhere' },
            { time: '2024-01-15 15:24:31', level: 'ERROR', source: 'tomcat', message: 'Application deployment failed: /opt/tomcat/webapps/app.war' },
            { time: '2024-01-15 15:23:18', level: 'DEBUG', source: 'collectd', message: 'Plugin cpu: collected 4 values in 0.001s' },
            { time: '2024-01-15 15:22:07', level: 'INFO', source: 'ntpd', message: 'Time synchronized with server: pool.ntp.org' },
            { time: '2024-01-15 15:21:44', level: 'WARN', source: 'snmpd', message: 'SNMP request from unauthorized host: 192.168.1.250' },
            { time: '2024-01-15 15:20:33', level: 'INFO', source: 'logrotate', message: 'Log rotation completed for /var/log/syslog' },
            { time: '2024-01-15 15:19:22', level: 'ERROR', source: 'bind9', message: 'DNS query failed: NXDOMAIN for invalid.example.com' },
            { time: '2024-01-15 15:18:11', level: 'DEBUG', source: 'rsyslog', message: 'Message forwarded to remote syslog server: 192.168.1.10' },
            { time: '2024-01-15 15:17:05', level: 'INFO', source: 'kernel', message: 'USB device connected: /dev/sdb1 (16GB USB Drive)' },
            { time: '2024-01-15 15:16:44', level: 'WARN', source: 'smartd', message: 'SMART warning: /dev/sda shows 5 reallocated sectors' },
            { time: '2024-01-15 15:15:33', level: 'INFO', source: 'systemd', message: 'Service postgresql started successfully' },
            { time: '2024-01-15 15:14:22', level: 'ERROR', source: 'mongodb', message: 'Connection pool exhausted: max 100 connections reached' },
            { time: '2024-01-15 15:13:11', level: 'DEBUG', source: 'node', message: 'Express server listening on port 3000' },
            { time: '2024-01-15 15:12:05', level: 'INFO', source: 'certbot', message: 'SSL certificate renewed for domain: example.com' },
            { time: '2024-01-15 15:11:44', level: 'WARN', source: 'haproxy', message: 'Backend server 192.168.1.101:80 is down' },
            { time: '2024-01-15 15:10:33', level: 'INFO', source: 'jenkins', message: 'Build #125 completed successfully for project web-app' },
            { time: '2024-01-15 15:09:28', level: 'ERROR', source: 'gitlab', message: 'Git push failed: repository size limit exceeded (2GB)' },
            { time: '2024-01-15 15:08:17', level: 'DEBUG', source: 'supervisor', message: 'Process worker-1 restarted due to memory limit' },
            { time: '2024-01-15 15:07:09', level: 'INFO', source: 'backup-script', message: 'Database backup completed: mysql_20240115_150709.sql' },
            { time: '2024-01-15 15:06:55', level: 'WARN', source: 'temperature', message: 'CPU temperature high: 78°C (threshold: 75°C)' }
        ];

        return logs.map(log => `
            <div class="log-line ${log.level.toLowerCase()}">
                <span class="log-time">${log.time}</span>
                <span class="log-level ${log.level.toLowerCase()}">${log.level}</span>
                <span class="log-source">[${log.source}]</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
    }

    // 绑定日志查看器事件
    bindLogViewerEvents() {
        const logFileSelect = document.getElementById('logFileSelect');
        const refreshLogBtn = document.getElementById('refreshLog');
        const downloadLogBtn = document.getElementById('downloadLog');
        const logSearch = document.getElementById('logSearch');

        if (logFileSelect) {
            logFileSelect.addEventListener('change', () => {
                this.loadLogFile(logFileSelect.value);
            });
        }

        if (refreshLogBtn) {
            refreshLogBtn.addEventListener('click', () => {
                this.refreshLogFile();
            });
        }

        if (downloadLogBtn) {
            downloadLogBtn.addEventListener('click', () => {
                this.downloadLogFile();
            });
        }

        if (logSearch) {
            logSearch.addEventListener('input', (e) => {
                this.filterLogLines(e.target.value);
            });
        }
    }

    // 加载日志文件
    loadLogFile(filepath) {
        this.showNotification(`正在加载日志文件: ${filepath}`, 'info');
        // 这里可以添加实际的日志加载逻辑
    }

    // 刷新日志文件
    refreshLogFile() {
        this.loadLogFiles();
    }

    // 下载日志文件
    downloadLogFile() {
        this.showNotification('日志文件下载已开始', 'success');
    }

    // 过滤日志行
    filterLogLines(query) {
        const logLines = document.querySelectorAll('.log-line');
        logLines.forEach(line => {
            const message = line.querySelector('.log-message').textContent.toLowerCase();
            if (message.includes(query.toLowerCase())) {
                line.style.display = '';
            } else {
                line.style.display = 'none';
            }
        });
    }

    // 加载备份列表
    loadBackupList() {
        this.createBackupPanel();
        this.showNotification('备份恢复工具已加载', 'success');
    }

    // 创建备份面板
    createBackupPanel() {
        const backupPanel = document.getElementById('backup');
        if (!backupPanel) return;

        backupPanel.innerHTML = `
            <div class="backup-manager">
                <div class="backup-header">
                    <h3>备份恢复管理</h3>
                    <div class="backup-actions">
                        <button class="btn btn-primary" id="createBackup">
                            <i class="fas fa-plus"></i> 创建备份
                        </button>
                        <button class="btn btn-success" id="restoreBackup" disabled>
                            <i class="fas fa-undo"></i> 恢复备份
                        </button>
                        <button class="btn btn-danger" id="deleteBackup" disabled>
                            <i class="fas fa-trash"></i> 删除备份
                        </button>
                    </div>
                </div>
                <div class="backup-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-archive"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">12</div>
                            <div class="stat-label">备份总数</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-hdd"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">2.5 GB</div>
                            <div class="stat-label">总大小</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">2小时前</div>
                            <div class="stat-label">最近备份</div>
                        </div>
                    </div>
                </div>
                <div class="backup-list">
                    <div class="backup-list-header">
                        <div class="backup-header-item">备份名称</div>
                        <div class="backup-header-item">创建时间</div>
                        <div class="backup-header-item">大小</div>
                        <div class="backup-header-item">类型</div>
                        <div class="backup-header-item">状态</div>
                    </div>
                    <div class="backup-items" id="backupItems">
                        ${this.generateBackupItems()}
                    </div>
                </div>
            </div>
        `;

        this.bindBackupManagerEvents();
    }

    // 生成备份项
    generateBackupItems() {
        const backups = [
            {
                name: 'system_full_backup_20240115_133000',
                time: '2024-01-15 13:30:00',
                size: '1.2 GB',
                type: '完整系统备份',
                status: '完成',
                description: '包含系统文件、配置和用户数据',
                location: '/backup/system/',
                compression: 'gzip',
                checksum: 'a1b2c3d4e5f6...'
            },
            {
                name: 'mysql_database_backup_20240115_120000',
                time: '2024-01-15 12:00:00',
                size: '256 MB',
                type: '数据库备份',
                status: '完成',
                description: 'MySQL数据库完整备份',
                location: '/backup/database/',
                compression: 'gzip',
                checksum: 'f6e5d4c3b2a1...'
            },
            {
                name: 'config_backup_20240114_184500',
                time: '2024-01-14 18:45:00',
                size: '15 MB',
                type: '配置备份',
                status: '完成',
                description: '系统配置文件备份',
                location: '/backup/config/',
                compression: 'tar.gz',
                checksum: 'b2c3d4e5f6a1...'
            },
            {
                name: 'system_full_backup_20240114_133000',
                time: '2024-01-14 13:30:00',
                size: '1.1 GB',
                type: '完整系统备份',
                status: '完成',
                description: '包含系统文件、配置和用户数据',
                location: '/backup/system/',
                compression: 'gzip',
                checksum: 'c3d4e5f6a1b2...'
            },
            {
                name: 'logs_backup_20240113_201500',
                time: '2024-01-13 20:15:00',
                size: '89 MB',
                type: '日志备份',
                status: '完成',
                description: '系统和应用日志备份',
                location: '/backup/logs/',
                compression: 'bzip2',
                checksum: 'd4e5f6a1b2c3...'
            },
            {
                name: 'postgresql_backup_20240113_150000',
                time: '2024-01-13 15:00:00',
                size: '445 MB',
                type: '数据库备份',
                status: '完成',
                description: 'PostgreSQL数据库备份',
                location: '/backup/database/',
                compression: 'gzip',
                checksum: 'e5f6a1b2c3d4...'
            },
            {
                name: 'docker_volumes_backup_20240112_220000',
                time: '2024-01-12 22:00:00',
                size: '678 MB',
                type: 'Docker备份',
                status: '完成',
                description: 'Docker容器数据卷备份',
                location: '/backup/docker/',
                compression: 'tar.gz',
                checksum: 'f6a1b2c3d4e5...'
            },
            {
                name: 'web_content_backup_20240112_180000',
                time: '2024-01-12 18:00:00',
                size: '234 MB',
                type: 'Web内容备份',
                status: '完成',
                description: '网站文件和静态资源备份',
                location: '/backup/web/',
                compression: 'gzip',
                checksum: 'a1b2c3d4e5f6...'
            },
            {
                name: 'certificates_backup_20240111_120000',
                time: '2024-01-11 12:00:00',
                size: '2.3 MB',
                type: '证书备份',
                status: '完成',
                description: 'SSL证书和密钥备份',
                location: '/backup/certs/',
                compression: 'tar.gz',
                checksum: 'b2c3d4e5f6a1...'
            },
            {
                name: 'system_incremental_20240111_020000',
                time: '2024-01-11 02:00:00',
                size: '156 MB',
                type: '增量备份',
                status: '完成',
                description: '系统增量备份（基于20240110）',
                location: '/backup/incremental/',
                compression: 'gzip',
                checksum: 'c3d4e5f6a1b2...'
            },
            {
                name: 'monitoring_data_backup_20240110_230000',
                time: '2024-01-10 23:00:00',
                size: '89 MB',
                type: '监控数据备份',
                status: '完成',
                description: 'Prometheus和Grafana数据备份',
                location: '/backup/monitoring/',
                compression: 'tar.gz',
                checksum: 'd4e5f6a1b2c3...'
            },
            {
                name: 'user_data_backup_20240110_140000',
                time: '2024-01-10 14:00:00',
                size: '567 MB',
                type: '用户数据备份',
                status: '完成',
                description: '用户主目录和个人文件备份',
                location: '/backup/users/',
                compression: 'gzip',
                checksum: 'e5f6a1b2c3d4...'
            },
            {
                name: 'system_backup_20240109_failed',
                time: '2024-01-09 13:30:00',
                size: '0 B',
                type: '完整系统备份',
                status: '失败',
                description: '备份过程中磁盘空间不足',
                location: '/backup/system/',
                compression: 'gzip',
                checksum: '无'
            },
            {
                name: 'emergency_backup_20240108_235900',
                time: '2024-01-08 23:59:00',
                size: '2.1 GB',
                type: '紧急备份',
                status: '完成',
                description: '系统维护前的紧急完整备份',
                location: '/backup/emergency/',
                compression: 'gzip',
                checksum: 'f6a1b2c3d4e5...'
            },
            {
                name: 'weekly_backup_20240107_020000',
                time: '2024-01-07 02:00:00',
                size: '1.8 GB',
                type: '周备份',
                status: '完成',
                description: '每周定期完整备份',
                location: '/backup/weekly/',
                compression: 'gzip',
                checksum: 'a1b2c3d4e5f6...'
            }
        ];

        return backups.map(backup => `
            <div class="backup-item" data-backup="${backup.name}" title="${backup.description}">
                <div class="backup-cell">
                    <div class="backup-name">${backup.name}</div>
                    <div class="backup-description">${backup.description}</div>
                </div>
                <div class="backup-cell">${backup.time}</div>
                <div class="backup-cell">${backup.size}</div>
                <div class="backup-cell">
                    <div class="backup-type">${backup.type}</div>
                    <div class="backup-compression">${backup.compression}</div>
                </div>
                <div class="backup-cell">
                    <span class="backup-status ${backup.status === '完成' ? 'success' : backup.status === '失败' ? 'failed' : 'running'}">${backup.status}</span>
                </div>
            </div>
        `).join('');
    }

    // 绑定备份管理事件
    bindBackupManagerEvents() {
        const createBtn = document.getElementById('createBackup');
        const restoreBtn = document.getElementById('restoreBackup');
        const deleteBtn = document.getElementById('deleteBackup');

        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.createNewBackup();
            });
        }

        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.restoreSelectedBackup();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteSelectedBackup();
            });
        }

        // 备份项点击事件
        document.querySelectorAll('.backup-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.backup-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                restoreBtn.disabled = false;
                deleteBtn.disabled = false;
                this.showBackupDetails(item.dataset.backup);
            });
        });
    }

    // 创建新备份
    createNewBackup() {
        const backupName = prompt('请输入备份名称:');
        if (backupName && backupName.trim()) {
            this.showNotification(`正在创建备份: ${backupName}`, 'info');
            setTimeout(() => {
                this.showNotification(`备份 "${backupName}" 创建成功`, 'success');
                this.loadBackupList();
            }, 3000);
        }
    }

    // 恢复选中备份
    restoreSelectedBackup() {
        const selectedBackup = document.querySelector('.backup-item.selected');
        if (selectedBackup) {
            const backupName = selectedBackup.dataset.backup;
            const confirmed = confirm(`确定要恢复备份 "${backupName}" 吗？此操作将覆盖当前数据。`);
            if (confirmed) {
                this.showNotification(`正在恢复备份: ${backupName}`, 'info');
                setTimeout(() => {
                    this.showNotification(`备份 "${backupName}" 恢复成功`, 'success');
                }, 5000);
            }
        }
    }

    // 删除选中备份
    deleteSelectedBackup() {
        const selectedBackup = document.querySelector('.backup-item.selected');
        if (selectedBackup) {
            const backupName = selectedBackup.dataset.backup;
            const confirmed = confirm(`确定要删除备份 "${backupName}" 吗？此操作不可恢复。`);
            if (confirmed) {
                this.showNotification(`备份 "${backupName}" 已删除`, 'success');
                this.loadBackupList();
            }
        }
    }

    // 显示备份详情
    showBackupDetails(backupName) {
        const backupManager = document.querySelector('.backup-manager');
        let detailsPanel = backupManager.querySelector('.backup-details');

        if (!detailsPanel) {
            detailsPanel = document.createElement('div');
            detailsPanel.className = 'backup-details';
            backupManager.appendChild(detailsPanel);
        }

        // 模拟备份详细信息
        const backupDetails = {
            name: backupName,
            size: '1.2 GB',
            files: 15678,
            directories: 234,
            compression: 'gzip',
            checksum: 'a1b2c3d4e5f6789...',
            location: '/backup/system/',
            duration: '15分钟 32秒',
            method: '完整备份',
            encryption: '是 (AES-256)',
            retention: '30天'
        };

        detailsPanel.innerHTML = `
            <div class="details-header">
                <h4>备份详情</h4>
                <button class="btn btn-sm btn-secondary" onclick="this.closest('.backup-details').style.display='none'">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
            <div class="details-content">
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">备份名称:</span>
                        <span class="detail-value">${backupDetails.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">文件大小:</span>
                        <span class="detail-value">${backupDetails.size}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">文件数量:</span>
                        <span class="detail-value">${backupDetails.files.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">目录数量:</span>
                        <span class="detail-value">${backupDetails.directories}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">压缩方式:</span>
                        <span class="detail-value">${backupDetails.compression}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">校验和:</span>
                        <span class="detail-value checksum">${backupDetails.checksum}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">存储位置:</span>
                        <span class="detail-value">${backupDetails.location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">备份耗时:</span>
                        <span class="detail-value">${backupDetails.duration}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">备份方式:</span>
                        <span class="detail-value">${backupDetails.method}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">加密状态:</span>
                        <span class="detail-value">${backupDetails.encryption}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">保留期限:</span>
                        <span class="detail-value">${backupDetails.retention}</span>
                    </div>
                </div>

                <div class="backup-actions-detail">
                    <button class="btn btn-primary" onclick="alert('备份验证已开始')">
                        <i class="fas fa-check-circle"></i> 验证备份
                    </button>
                    <button class="btn btn-info" onclick="alert('备份信息已导出')">
                        <i class="fas fa-file-export"></i> 导出信息
                    </button>
                    <button class="btn btn-warning" onclick="alert('备份已挂载到 /mnt/backup')">
                        <i class="fas fa-folder-open"></i> 挂载查看
                    </button>
                </div>
            </div>
        `;

        detailsPanel.style.display = 'block';
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // 根据类型设置背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 初始化网络工具
    initNetworkTools() {
        // Ping测试
        const startPingBtn = document.getElementById('startPing');
        if (startPingBtn) {
            startPingBtn.addEventListener('click', () => this.startPingTest());
        }

        // 端口扫描
        const startScanBtn = document.getElementById('startScan');
        if (startScanBtn) {
            startScanBtn.addEventListener('click', () => this.startPortScan());
        }

        // 网络信息
        const getNetworkInfoBtn = document.getElementById('getNetworkInfo');
        if (getNetworkInfoBtn) {
            getNetworkInfoBtn.addEventListener('click', () => this.getNetworkInfo());
        }

        // DNS查询
        const startDnsQueryBtn = document.getElementById('startDnsQuery');
        if (startDnsQueryBtn) {
            startDnsQueryBtn.addEventListener('click', () => this.startDnsQuery());
        }
    }

    // 开始Ping测试
    startPingTest() {
        const target = document.getElementById('pingTarget').value;
        const count = document.getElementById('pingCount').value;
        const resultsDiv = document.getElementById('pingResults');

        if (!target.trim()) {
            this.showNotification('请输入目标地址', 'error');
            return;
        }

        resultsDiv.innerHTML = `正在ping ${target}，发送 ${count} 个数据包...\n`;
        this.showNotification('Ping测试已开始', 'info');

        // 模拟ping测试
        let currentCount = 0;
        const interval = setInterval(() => {
            currentCount++;
            const time = Math.random() * 50 + 10;
            const ttl = Math.floor(Math.random() * 10) + 60;

            resultsDiv.innerHTML += `来自 ${target} 的回复: 字节=32 时间=${time.toFixed(1)}ms TTL=${ttl}\n`;
            resultsDiv.scrollTop = resultsDiv.scrollHeight;

            if (currentCount >= count) {
                clearInterval(interval);
                resultsDiv.innerHTML += `\n${target} 的 Ping 统计信息:\n`;
                resultsDiv.innerHTML += `    数据包: 已发送 = ${count}，已接收 = ${count}，丢失 = 0 (0% 丢失)\n`;
                resultsDiv.innerHTML += `往返行程的估计时间(以毫秒为单位):\n`;
                resultsDiv.innerHTML += `    最短 = ${(time - 10).toFixed(1)}ms，最长 = ${(time + 10).toFixed(1)}ms，平均 = ${time.toFixed(1)}ms\n`;
                this.showNotification('Ping测试完成', 'success');
            }
        }, 1000);
    }

    // 开始端口扫描
    startPortScan() {
        const target = document.getElementById('scanTarget').value;
        const portStart = parseInt(document.getElementById('portStart').value);
        const portEnd = parseInt(document.getElementById('portEnd').value);
        const resultsDiv = document.getElementById('scanResults');

        if (!target.trim()) {
            this.showNotification('请输入目标主机', 'error');
            return;
        }

        if (portStart > portEnd) {
            this.showNotification('起始端口不能大于结束端口', 'error');
            return;
        }

        resultsDiv.innerHTML = `正在扫描 ${target} 的端口 ${portStart}-${portEnd}...\n`;
        this.showNotification('端口扫描已开始', 'info');

        // 模拟端口扫描
        const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
        let scannedPorts = 0;
        const totalPorts = portEnd - portStart + 1;

        const scanInterval = setInterval(() => {
            const currentPort = portStart + scannedPorts;

            if (commonPorts.includes(currentPort) && Math.random() > 0.3) {
                resultsDiv.innerHTML += `端口 ${currentPort}: 开放\n`;
            }

            scannedPorts++;

            if (scannedPorts >= totalPorts || scannedPorts >= 50) { // 限制扫描数量
                clearInterval(scanInterval);
                resultsDiv.innerHTML += `\n扫描完成。共扫描 ${scannedPorts} 个端口。\n`;
                resultsDiv.scrollTop = resultsDiv.scrollHeight;
                this.showNotification('端口扫描完成', 'success');
            }
        }, 100);
    }

    // 获取网络信息
    getNetworkInfo() {
        const networkInfoDiv = document.getElementById('networkInfo');

        // 模拟网络接口信息
        const interfaces = [
            { name: 'eth0', ip: '192.168.1.100', status: 'UP', speed: '1000 Mbps' },
            { name: 'lo', ip: '127.0.0.1', status: 'UP', speed: 'Unknown' },
            { name: 'wlan0', ip: '192.168.0.50', status: 'UP', speed: '150 Mbps' }
        ];

        networkInfoDiv.innerHTML = '';
        interfaces.forEach(iface => {
            const item = document.createElement('div');
            item.className = 'interface-item';
            item.innerHTML = `
                <div class="interface-name">${iface.name}</div>
                <div class="interface-details">
                    <span>IP: ${iface.ip}</span>
                    <span>状态: ${iface.status}</span>
                    <span>速度: ${iface.speed}</span>
                </div>
            `;
            networkInfoDiv.appendChild(item);
        });

        this.showNotification('网络信息已更新', 'success');
    }

    // 开始DNS查询
    startDnsQuery() {
        const domain = document.getElementById('dnsQuery').value;
        const type = document.getElementById('dnsType').value;
        const resultsDiv = document.getElementById('dnsResults');

        if (!domain.trim()) {
            this.showNotification('请输入域名', 'error');
            return;
        }

        resultsDiv.innerHTML = `正在查询 ${domain} 的 ${type} 记录...\n`;
        this.showNotification('DNS查询已开始', 'info');

        // 模拟DNS查询
        setTimeout(() => {
            const mockResults = {
                'A': ['172.217.160.142', '172.217.160.143'],
                'AAAA': ['2404:6800:4008:c07::8a', '2404:6800:4008:c07::8b'],
                'MX': ['10 smtp.gmail.com', '20 smtp2.gmail.com'],
                'NS': ['ns1.google.com', 'ns2.google.com'],
                'TXT': ['v=spf1 include:_spf.google.com ~all']
            };

            const results = mockResults[type] || ['查询结果不可用'];
            resultsDiv.innerHTML += `\n${domain} 的 ${type} 记录:\n`;
            results.forEach(result => {
                resultsDiv.innerHTML += `${result}\n`;
            });
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
            this.showNotification('DNS查询完成', 'success');
        }, 1500);
    }

    // 初始化性能监控
    initPerformanceMonitor() {
        const startBtn = document.getElementById('startMonitor');
        const stopBtn = document.getElementById('stopMonitor');
        const exportBtn = document.getElementById('exportMonitorData');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPerformanceMonitoring());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopPerformanceMonitoring());
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPerformanceData());
        }

        this.initPerformanceCharts();
    }

    // 初始化性能图表
    initPerformanceCharts() {
        const chartIds = ['cpuChart', 'memoryChart', 'diskChart', 'networkChart'];

        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.performanceCharts[chartId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: Array.from({length: 20}, (_, i) => ''),
                        datasets: [{
                            data: Array.from({length: 20}, () => 0),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { display: false },
                            y: {
                                display: false,
                                min: 0,
                                max: 100
                            }
                        },
                        elements: {
                            line: { borderWidth: 2 }
                        }
                    }
                });
            }
        });
    }

    // 开始性能监控
    startPerformanceMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.showNotification('性能监控已开始', 'success');

        this.monitoringInterval = setInterval(() => {
            this.updatePerformanceData();
        }, 2000);

        document.getElementById('startMonitor').disabled = true;
        document.getElementById('stopMonitor').disabled = false;
    }

    // 停止性能监控
    stopPerformanceMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        clearInterval(this.monitoringInterval);
        this.showNotification('性能监控已停止', 'info');

        document.getElementById('startMonitor').disabled = false;
        document.getElementById('stopMonitor').disabled = true;
    }

    // 更新性能数据
    updatePerformanceData() {
        // 生成模拟数据
        const cpuUsage = Math.random() * 40 + 30;
        const memoryUsage = Math.random() * 30 + 50;
        const diskIO = Math.random() * 100 + 50;
        const networkTraffic = Math.random() * 1000 + 500;

        // 更新显示值
        document.getElementById('cpuValue').textContent = cpuUsage.toFixed(1) + '%';
        document.getElementById('memoryValue').textContent = memoryUsage.toFixed(1) + '%';
        document.getElementById('diskValue').textContent = (diskIO / 10).toFixed(1) + ' MB/s';
        document.getElementById('networkValue').textContent = (networkTraffic / 10).toFixed(1) + ' KB/s';

        // 更新图表
        this.updateChart('cpuChart', cpuUsage);
        this.updateChart('memoryChart', memoryUsage);
        this.updateChart('diskChart', diskIO);
        this.updateChart('networkChart', networkTraffic / 10);

        // 更新系统负载
        document.getElementById('load1').textContent = (Math.random() * 0.5 + 0.1).toFixed(2);
        document.getElementById('load5').textContent = (Math.random() * 0.5 + 0.2).toFixed(2);
        document.getElementById('load15').textContent = (Math.random() * 0.5 + 0.15).toFixed(2);
    }

    // 更新图表数据
    updateChart(chartId, value) {
        const chart = this.performanceCharts[chartId];
        if (chart) {
            const data = chart.data.datasets[0].data;
            data.shift();
            data.push(value);
            chart.update('none');
        }
    }

    // 导出性能数据
    exportPerformanceData() {
        const data = {
            timestamp: new Date().toISOString(),
            cpu: document.getElementById('cpuValue').textContent,
            memory: document.getElementById('memoryValue').textContent,
            disk: document.getElementById('diskValue').textContent,
            network: document.getElementById('networkValue').textContent,
            load: {
                load1: document.getElementById('load1').textContent,
                load5: document.getElementById('load5').textContent,
                load15: document.getElementById('load15').textContent
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('性能数据已导出', 'success');
    }

    // 初始化安全工具
    initSecurityTools() {
        const manageFirewallBtn = document.getElementById('manageFirewall');
        const checkSSLBtn = document.getElementById('checkSSL');
        const startSecurityScanBtn = document.getElementById('startSecurityScan');
        const analyzeLoginsBtn = document.getElementById('analyzeLogins');

        if (manageFirewallBtn) {
            manageFirewallBtn.addEventListener('click', () => this.manageFirewall());
        }
        if (checkSSLBtn) {
            checkSSLBtn.addEventListener('click', () => this.checkSSLCertificate());
        }
        if (startSecurityScanBtn) {
            startSecurityScanBtn.addEventListener('click', () => this.startSecurityScan());
        }
        if (analyzeLoginsBtn) {
            analyzeLoginsBtn.addEventListener('click', () => this.analyzeLogins());
        }
    }

    // 管理防火墙
    manageFirewall() {
        const modal = this.createFirewallModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // 创建防火墙管理模态框
    createFirewallModal() {
        const modal = document.createElement('div');
        modal.className = 'firewall-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>防火墙规则管理</h3>
                    <button class="modal-close" onclick="this.closest('.firewall-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="firewall-controls">
                        <button class="btn btn-primary" onclick="this.closest('.firewall-modal').querySelector('.add-rule-form').style.display='block'">
                            <i class="fas fa-plus"></i> 添加规则
                        </button>
                        <button class="btn btn-success" onclick="alert('防火墙已重启')">
                            <i class="fas fa-sync-alt"></i> 重启防火墙
                        </button>
                        <button class="btn btn-warning" onclick="alert('规则已重新加载')">
                            <i class="fas fa-redo"></i> 重新加载
                        </button>
                    </div>

                    <div class="add-rule-form" style="display: none;">
                        <h4>添加新规则</h4>
                        <div class="form-grid">
                            <div class="input-group">
                                <label>动作:</label>
                                <select id="ruleAction">
                                    <option value="ALLOW">允许</option>
                                    <option value="DENY">拒绝</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>端口:</label>
                                <input type="text" id="rulePort" placeholder="80 或 80/tcp">
                            </div>
                            <div class="input-group">
                                <label>来源:</label>
                                <input type="text" id="ruleSource" placeholder="anywhere 或 192.168.1.0/24">
                            </div>
                            <div class="input-group">
                                <label>描述:</label>
                                <input type="text" id="ruleDescription" placeholder="规则描述">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-primary" onclick="alert('规则已添加')">添加规则</button>
                            <button class="btn btn-secondary" onclick="this.closest('.add-rule-form').style.display='none'">取消</button>
                        </div>
                    </div>

                    <div class="firewall-rules-table">
                        <h4>当前规则</h4>
                        <table class="rules-table">
                            <thead>
                                <tr>
                                    <th>序号</th>
                                    <th>动作</th>
                                    <th>端口</th>
                                    <th>来源</th>
                                    <th>描述</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td><span class="rule-action allow">ALLOW</span></td>
                                    <td>22/tcp</td>
                                    <td>anywhere</td>
                                    <td>SSH访问</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="alert('规则已删除')">删除</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td><span class="rule-action allow">ALLOW</span></td>
                                    <td>80/tcp</td>
                                    <td>anywhere</td>
                                    <td>HTTP访问</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="alert('规则已删除')">删除</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td><span class="rule-action allow">ALLOW</span></td>
                                    <td>443/tcp</td>
                                    <td>anywhere</td>
                                    <td>HTTPS访问</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="alert('规则已删除')">删除</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td><span class="rule-action deny">DENY</span></td>
                                    <td>*</td>
                                    <td>192.168.1.100</td>
                                    <td>阻止特定IP</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="alert('规则已删除')">删除</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // 添加模态框样式
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '10000',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
        });

        return modal;
    }

    // 检查SSL证书
    checkSSLCertificate() {
        const domain = document.getElementById('sslDomain').value;
        const resultsDiv = document.getElementById('sslResults');

        if (!domain.trim()) {
            this.showNotification('请输入域名', 'error');
            return;
        }

        resultsDiv.innerHTML = `正在检查 ${domain} 的SSL证书...\n`;
        this.showNotification('SSL证书检查已开始', 'info');

        setTimeout(() => {
            const isValid = Math.random() > 0.3;
            const daysLeft = Math.floor(Math.random() * 90) + 10;
            const issuer = ['Let\'s Encrypt Authority X3', 'DigiCert Inc', 'GlobalSign', 'Comodo CA'][Math.floor(Math.random() * 4)];

            resultsDiv.innerHTML = `SSL证书检查结果 - ${domain}\n`;
            resultsDiv.innerHTML += `${'='.repeat(50)}\n`;
            resultsDiv.innerHTML += `状态: ${isValid ? '✓ 有效' : '✗ 无效/过期'}\n`;
            resultsDiv.innerHTML += `颁发者: ${issuer}\n`;
            resultsDiv.innerHTML += `算法: RSA 2048位\n`;
            resultsDiv.innerHTML += `有效期开始: ${new Date(Date.now() - 86400000 * 30).toLocaleDateString()}\n`;
            resultsDiv.innerHTML += `有效期结束: ${new Date(Date.now() + 86400000 * daysLeft).toLocaleDateString()}\n`;
            resultsDiv.innerHTML += `剩余天数: ${daysLeft}天\n`;
            resultsDiv.innerHTML += `序列号: ${Math.random().toString(16).substr(2, 16).toUpperCase()}\n`;

            if (daysLeft < 30) {
                resultsDiv.innerHTML += `\n⚠️  警告: 证书将在30天内过期！\n`;
            }

            resultsDiv.innerHTML += `\n证书链验证: ${isValid ? '通过' : '失败'}\n`;
            resultsDiv.innerHTML += `OCSP状态: ${Math.random() > 0.5 ? '良好' : '未知'}\n`;

            this.showNotification('SSL证书检查完成', isValid ? 'success' : 'warning');
        }, 2000);
    }

    // 开始安全扫描
    startSecurityScan() {
        const progressDiv = document.getElementById('securityScanProgress');
        const progressFill = progressDiv.querySelector('.progress-fill');
        const progressText = progressDiv.querySelector('.progress-text');

        progressDiv.style.display = 'block';
        this.showNotification('安全扫描已开始', 'info');

        const scanSteps = [
            '初始化扫描引擎...',
            '检查开放端口...',
            '扫描已知漏洞...',
            '检查恶意软件...',
            '分析系统配置...',
            '检查弱密码...',
            '验证SSL/TLS配置...',
            '生成扫描报告...'
        ];

        let progress = 0;
        let stepIndex = 0;

        const scanInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;

            progressFill.style.width = progress + '%';

            if (stepIndex < scanSteps.length && progress > (stepIndex + 1) * 12.5) {
                progressText.textContent = scanSteps[stepIndex];
                stepIndex++;
            } else {
                progressText.textContent = `扫描中... ${Math.floor(progress)}%`;
            }

            if (progress >= 100) {
                clearInterval(scanInterval);
                progressText.textContent = '扫描完成';

                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    this.showSecurityScanResults();
                }, 1000);
            }
        }, 500);
    }

    // 显示安全扫描结果
    showSecurityScanResults() {
        const modal = document.createElement('div');
        modal.className = 'scan-results-modal';

        const vulnerabilities = [
            { level: 'high', name: 'SSH弱密码', description: '检测到SSH服务使用弱密码', solution: '更改为强密码' },
            { level: 'medium', name: '未使用HTTPS', description: '部分服务未启用HTTPS加密', solution: '配置SSL证书' },
            { level: 'low', name: '系统更新', description: '系统存在可用更新', solution: '执行系统更新' },
            { level: 'info', name: '防火墙配置', description: '防火墙配置正常', solution: '无需操作' }
        ];

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>安全扫描报告</h3>
                    <button class="modal-close" onclick="this.closest('.scan-results-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="scan-summary">
                        <div class="summary-item">
                            <span class="summary-label">扫描时间:</span>
                            <span class="summary-value">${new Date().toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">发现问题:</span>
                            <span class="summary-value">${vulnerabilities.length} 项</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">风险等级:</span>
                            <span class="summary-value risk-medium">中等</span>
                        </div>
                    </div>

                    <div class="vulnerabilities-list">
                        <h4>发现的问题</h4>
                        ${vulnerabilities.map(vuln => `
                            <div class="vulnerability-item ${vuln.level}">
                                <div class="vuln-header">
                                    <span class="vuln-level">${vuln.level.toUpperCase()}</span>
                                    <span class="vuln-name">${vuln.name}</span>
                                </div>
                                <div class="vuln-description">${vuln.description}</div>
                                <div class="vuln-solution">建议: ${vuln.solution}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="scan-actions">
                        <button class="btn btn-primary" onclick="alert('报告已导出')">
                            <i class="fas fa-download"></i> 导出报告
                        </button>
                        <button class="btn btn-success" onclick="alert('修复向导已启动')">
                            <i class="fas fa-tools"></i> 自动修复
                        </button>
                    </div>
                </div>
            </div>
        `;

        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        document.body.appendChild(modal);
        this.showNotification('安全扫描完成，发现 ' + vulnerabilities.length + ' 个问题', 'warning');
    }

    // 分析登录日志
    analyzeLogins() {
        const modal = document.createElement('div');
        modal.className = 'login-analysis-modal';

        const loginData = [
            { time: '2024-01-15 15:45:23', user: 'admin', ip: '192.168.1.100', status: 'success', location: '本地网络' },
            { time: '2024-01-15 15:30:12', user: 'admin', ip: '192.168.1.100', status: 'success', location: '本地网络' },
            { time: '2024-01-15 14:22:45', user: 'root', ip: '203.0.113.45', status: 'failed', location: '美国' },
            { time: '2024-01-15 14:22:30', user: 'root', ip: '203.0.113.45', status: 'failed', location: '美国' },
            { time: '2024-01-15 14:22:15', user: 'root', ip: '203.0.113.45', status: 'failed', location: '美国' },
            { time: '2024-01-15 13:15:33', user: 'user1', ip: '192.168.1.105', status: 'success', location: '本地网络' },
            { time: '2024-01-15 12:45:21', user: 'admin', ip: '10.0.0.50', status: 'success', location: 'VPN' },
            { time: '2024-01-15 11:30:18', user: 'guest', ip: '198.51.100.23', status: 'failed', location: '英国' }
        ];

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>登录日志分析</h3>
                    <button class="modal-close" onclick="this.closest('.login-analysis-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="analysis-summary">
                        <div class="summary-cards">
                            <div class="summary-card">
                                <h4>今日登录</h4>
                                <span class="card-value">23</span>
                                <span class="card-trend up">+15%</span>
                            </div>
                            <div class="summary-card">
                                <h4>失败尝试</h4>
                                <span class="card-value warning">5</span>
                                <span class="card-trend down">-20%</span>
                            </div>
                            <div class="summary-card">
                                <h4>异常IP</h4>
                                <span class="card-value danger">2</span>
                                <span class="card-trend up">+100%</span>
                            </div>
                            <div class="summary-card">
                                <h4>成功率</h4>
                                <span class="card-value">78%</span>
                                <span class="card-trend down">-5%</span>
                            </div>
                        </div>
                    </div>

                    <div class="login-details">
                        <h4>最近登录记录</h4>
                        <div class="login-table-container">
                            <table class="login-table">
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>用户</th>
                                        <th>IP地址</th>
                                        <th>状态</th>
                                        <th>位置</th>
                                        <th>风险</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${loginData.map(login => `
                                        <tr class="${login.status}">
                                            <td>${login.time}</td>
                                            <td>${login.user}</td>
                                            <td>${login.ip}</td>
                                            <td>
                                                <span class="status-badge ${login.status === 'success' ? 'success' : 'error'}">
                                                    ${login.status === 'success' ? '成功' : '失败'}
                                                </span>
                                            </td>
                                            <td>${login.location}</td>
                                            <td>
                                                <span class="risk-level ${login.location === '本地网络' ? 'low' : login.status === 'failed' ? 'high' : 'medium'}">
                                                    ${login.location === '本地网络' ? '低' : login.status === 'failed' ? '高' : '中'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="analysis-actions">
                        <button class="btn btn-primary" onclick="alert('详细报告已生成')">
                            <i class="fas fa-chart-bar"></i> 生成详细报告
                        </button>
                        <button class="btn btn-warning" onclick="alert('异常IP已加入黑名单')">
                            <i class="fas fa-ban"></i> 阻止异常IP
                        </button>
                        <button class="btn btn-info" onclick="alert('告警规则已设置')">
                            <i class="fas fa-bell"></i> 设置告警
                        </button>
                    </div>
                </div>
            </div>
        `;

        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        document.body.appendChild(modal);
        this.showNotification('登录日志分析完成', 'success');
    }

    // 初始化数据库工具
    initDatabaseTools() {
        const testConnectionBtn = document.getElementById('testConnection');
        const connectDBBtn = document.getElementById('connectDB');
        const executeQueryBtn = document.getElementById('executeQuery');
        const clearQueryBtn = document.getElementById('clearQuery');
        const formatQueryBtn = document.getElementById('formatQuery');
        const exportResultsBtn = document.getElementById('exportResults');
        const startBackupBtn = document.getElementById('startBackup');

        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testDatabaseConnection());
        }
        if (connectDBBtn) {
            connectDBBtn.addEventListener('click', () => this.connectToDatabase());
        }
        if (executeQueryBtn) {
            executeQueryBtn.addEventListener('click', () => this.executeQuery());
        }
        if (clearQueryBtn) {
            clearQueryBtn.addEventListener('click', () => this.clearQuery());
        }
        if (formatQueryBtn) {
            formatQueryBtn.addEventListener('click', () => this.formatQuery());
        }
        if (exportResultsBtn) {
            exportResultsBtn.addEventListener('click', () => this.exportQueryResults());
        }
        if (startBackupBtn) {
            startBackupBtn.addEventListener('click', () => this.startDatabaseBackup());
        }

        // 数据库标签页切换
        document.querySelectorAll('.db-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchDatabaseTab(tabName);
            });
        });

        // 数据库类型变化时更新端口
        const dbTypeSelect = document.getElementById('dbType');
        if (dbTypeSelect) {
            dbTypeSelect.addEventListener('change', (e) => {
                this.updateDefaultPort(e.target.value);
            });
        }
    }

    // 更新默认端口
    updateDefaultPort(dbType) {
        const portInput = document.getElementById('dbPort');
        const defaultPorts = {
            mysql: 3306,
            postgresql: 5432,
            mongodb: 27017,
            redis: 6379
        };

        if (portInput && defaultPorts[dbType]) {
            portInput.value = defaultPorts[dbType];
        }
    }

    // 测试数据库连接
    testDatabaseConnection() {
        const host = document.getElementById('dbHost').value;
        const port = document.getElementById('dbPort').value;
        const dbName = document.getElementById('dbName').value;
        const user = document.getElementById('dbUser').value;
        const password = document.getElementById('dbPassword').value;
        const dbType = document.getElementById('dbType').value;

        if (!host || !port || !user) {
            this.showNotification('请填写必要的连接信息', 'error');
            return;
        }

        this.showNotification('正在测试数据库连接...', 'info');

        // 模拟连接测试
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% 成功率

            if (success) {
                this.showNotification(`连接到 ${dbType.toUpperCase()} ${host}:${port} 成功`, 'success');

                // 显示连接信息
                const connectionInfo = document.createElement('div');
                connectionInfo.className = 'connection-info';
                connectionInfo.innerHTML = `
                    <h4>连接信息</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">数据库类型:</span>
                            <span class="info-value">${dbType.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">服务器版本:</span>
                            <span class="info-value">${this.getRandomVersion(dbType)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">字符集:</span>
                            <span class="info-value">UTF-8</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">连接状态:</span>
                            <span class="info-value success">已连接</span>
                        </div>
                    </div>
                `;

                // 将连接信息插入到连接表单后面
                const connectionForm = document.querySelector('.connection-form');
                const existingInfo = connectionForm.parentNode.querySelector('.connection-info');
                if (existingInfo) {
                    existingInfo.remove();
                }
                connectionForm.parentNode.appendChild(connectionInfo);

            } else {
                this.showNotification('连接失败，请检查连接参数', 'error');
            }
        }, 1500);
    }

    // 获取随机版本号
    getRandomVersion(dbType) {
        const versions = {
            mysql: ['8.0.32', '5.7.40', '8.0.28'],
            postgresql: ['15.1', '14.6', '13.9'],
            mongodb: ['6.0.3', '5.0.14', '4.4.18'],
            redis: ['7.0.7', '6.2.8', '6.0.17']
        };

        const typeVersions = versions[dbType] || ['1.0.0'];
        return typeVersions[Math.floor(Math.random() * typeVersions.length)];
    }

    // 连接到数据库
    connectToDatabase() {
        this.showNotification('正在建立数据库连接...', 'info');

        setTimeout(() => {
            this.showNotification('数据库连接已建立', 'success');

            // 启用查询相关按钮
            document.getElementById('executeQuery').disabled = false;
            document.getElementById('formatQuery').disabled = false;

            // 加载数据库结构
            this.loadDatabaseSchema();
        }, 1000);
    }

    // 加载数据库结构
    loadDatabaseSchema() {
        const schemaInfo = document.createElement('div');
        schemaInfo.className = 'schema-info';
        schemaInfo.innerHTML = `
            <h4>数据库结构</h4>
            <div class="schema-tree">
                <div class="schema-item">
                    <i class="fas fa-database"></i>
                    <span>test_db</span>
                    <div class="schema-children">
                        <div class="schema-item">
                            <i class="fas fa-table"></i>
                            <span>users (1,234 rows)</span>
                        </div>
                        <div class="schema-item">
                            <i class="fas fa-table"></i>
                            <span>orders (5,678 rows)</span>
                        </div>
                        <div class="schema-item">
                            <i class="fas fa-table"></i>
                            <span>products (890 rows)</span>
                        </div>
                        <div class="schema-item">
                            <i class="fas fa-table"></i>
                            <span>categories (45 rows)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const connectionPanel = document.querySelector('.db-connection-panel');
        const existingSchema = connectionPanel.querySelector('.schema-info');
        if (existingSchema) {
            existingSchema.remove();
        }
        connectionPanel.appendChild(schemaInfo);
    }

    // 执行查询
    executeQuery() {
        const query = document.getElementById('sqlQuery').value;
        const resultsTable = document.getElementById('resultsTable');

        if (!query.trim()) {
            this.showNotification('请输入SQL查询语句', 'error');
            return;
        }

        this.showNotification('正在执行查询...', 'info');

        setTimeout(() => {
            const queryType = query.trim().toLowerCase();
            let mockData = [];
            let affectedRows = 0;

            if (queryType.startsWith('select')) {
                // SELECT 查询返回数据
                mockData = this.generateMockQueryResults(query);
            } else if (queryType.startsWith('insert')) {
                affectedRows = Math.floor(Math.random() * 5) + 1;
            } else if (queryType.startsWith('update')) {
                affectedRows = Math.floor(Math.random() * 10) + 1;
            } else if (queryType.startsWith('delete')) {
                affectedRows = Math.floor(Math.random() * 3) + 1;
            } else {
                // 其他查询类型
                mockData = [{ result: 'Query executed successfully' }];
            }

            let tableHTML = '';

            if (mockData.length > 0) {
                // 显示查询结果
                tableHTML = '<table class="data-table"><thead><tr>';
                Object.keys(mockData[0]).forEach(key => {
                    tableHTML += `<th>${key}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';

                mockData.forEach(row => {
                    tableHTML += '<tr>';
                    Object.values(row).forEach(value => {
                        tableHTML += `<td>${value}</td>`;
                    });
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';

                tableHTML += `<div class="query-info">查询返回 ${mockData.length} 行记录</div>`;
            } else if (affectedRows > 0) {
                // 显示影响行数
                tableHTML = `<div class="query-result">查询执行成功，影响 ${affectedRows} 行记录</div>`;
            } else {
                tableHTML = '<div class="query-result">查询执行成功</div>';
            }

            resultsTable.innerHTML = tableHTML;
            this.showNotification('查询执行完成', 'success');
        }, 1000);
    }

    // 生成模拟查询结果
    generateMockQueryResults(query) {
        const queryLower = query.toLowerCase();

        if (queryLower.includes('users')) {
            return [
                { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2024-01-15 10:30:00', status: 'active' },
                { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2024-01-14 16:45:00', status: 'active' },
                { id: 3, username: 'bob_johnson', email: 'bob@example.com', created_at: '2024-01-13 09:20:00', status: 'inactive' },
                { id: 4, username: 'alice_brown', email: 'alice@example.com', created_at: '2024-01-12 14:15:00', status: 'active' },
                { id: 5, username: 'charlie_wilson', email: 'charlie@example.com', created_at: '2024-01-11 11:30:00', status: 'pending' }
            ];
        } else if (queryLower.includes('orders')) {
            return [
                { order_id: 1001, user_id: 1, product_name: 'Laptop', amount: 1299.99, order_date: '2024-01-15', status: 'completed' },
                { order_id: 1002, user_id: 2, product_name: 'Mouse', amount: 29.99, order_date: '2024-01-15', status: 'pending' },
                { order_id: 1003, user_id: 1, product_name: 'Keyboard', amount: 79.99, order_date: '2024-01-14', status: 'shipped' },
                { order_id: 1004, user_id: 3, product_name: 'Monitor', amount: 299.99, order_date: '2024-01-14', status: 'completed' }
            ];
        } else if (queryLower.includes('products')) {
            return [
                { product_id: 1, name: 'Laptop', category: 'Electronics', price: 1299.99, stock: 25, supplier: 'TechCorp' },
                { product_id: 2, name: 'Mouse', category: 'Accessories', price: 29.99, stock: 150, supplier: 'PeripheralInc' },
                { product_id: 3, name: 'Keyboard', category: 'Accessories', price: 79.99, stock: 80, supplier: 'PeripheralInc' },
                { product_id: 4, name: 'Monitor', category: 'Electronics', price: 299.99, stock: 45, supplier: 'DisplayTech' }
            ];
        } else {
            // 通用结果
            return [
                { column1: 'value1', column2: 'value2', column3: 'value3' },
                { column1: 'value4', column2: 'value5', column3: 'value6' },
                { column1: 'value7', column2: 'value8', column3: 'value9' }
            ];
        }
    }

    // 清空查询
    clearQuery() {
        document.getElementById('sqlQuery').value = '';
        document.getElementById('resultsTable').innerHTML = '<div class="no-results">请执行查询以查看结果</div>';
        this.showNotification('查询已清空', 'info');
    }

    // 格式化查询
    formatQuery() {
        const queryTextarea = document.getElementById('sqlQuery');
        let query = queryTextarea.value;

        if (!query.trim()) {
            this.showNotification('请先输入SQL语句', 'warning');
            return;
        }

        // 简单的SQL格式化
        query = query.replace(/\s+/g, ' ').trim();
        query = query.replace(/SELECT/gi, 'SELECT\n  ');
        query = query.replace(/FROM/gi, '\nFROM');
        query = query.replace(/WHERE/gi, '\nWHERE');
        query = query.replace(/AND/gi, '\n  AND');
        query = query.replace(/OR/gi, '\n  OR');
        query = query.replace(/ORDER BY/gi, '\nORDER BY');
        query = query.replace(/GROUP BY/gi, '\nGROUP BY');
        query = query.replace(/HAVING/gi, '\nHAVING');
        query = query.replace(/LIMIT/gi, '\nLIMIT');
        query = query.replace(/INSERT INTO/gi, 'INSERT INTO');
        query = query.replace(/VALUES/gi, '\nVALUES');
        query = query.replace(/UPDATE/gi, 'UPDATE');
        query = query.replace(/SET/gi, '\nSET');
        query = query.replace(/DELETE FROM/gi, 'DELETE FROM');

        queryTextarea.value = query;
        this.showNotification('查询已格式化', 'success');
    }

    // 导出查询结果
    exportQueryResults() {
        const resultsTable = document.querySelector('#resultsTable .data-table');

        if (!resultsTable) {
            this.showNotification('没有可导出的查询结果', 'warning');
            return;
        }

        // 提取表格数据
        const headers = Array.from(resultsTable.querySelectorAll('thead th')).map(th => th.textContent);
        const rows = Array.from(resultsTable.querySelectorAll('tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
        );

        // 生成CSV内容
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // 下载文件
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('查询结果已导出', 'success');
    }

    // 开始数据库备份
    startDatabaseBackup() {
        const backupType = document.getElementById('backupType').value;
        const fileName = document.getElementById('backupFileName').value;

        if (!fileName.trim()) {
            this.showNotification('请输入备份文件名', 'error');
            return;
        }

        this.showNotification(`正在创建${this.getBackupTypeText(backupType)}备份: ${fileName}`, 'info');

        // 模拟备份进度
        const progressModal = this.createBackupProgressModal(fileName, backupType);
        document.body.appendChild(progressModal);
        progressModal.style.display = 'flex';

        let progress = 0;
        const backupInterval = setInterval(() => {
            progress += Math.random() * 10 + 5;
            if (progress > 100) progress = 100;

            const progressBar = progressModal.querySelector('.progress-fill');
            const progressText = progressModal.querySelector('.progress-text');

            progressBar.style.width = progress + '%';
            progressText.textContent = `备份进度: ${Math.floor(progress)}%`;

            if (progress >= 100) {
                clearInterval(backupInterval);
                progressText.textContent = '备份完成';

                setTimeout(() => {
                    progressModal.remove();
                    this.showNotification(`备份 ${fileName} 创建成功`, 'success');
                }, 1000);
            }
        }, 300);
    }

    // 获取备份类型文本
    getBackupTypeText(type) {
        const types = {
            full: '完整',
            schema: '结构',
            data: '数据'
        };
        return types[type] || '完整';
    }

    // 创建备份进度模态框
    createBackupProgressModal(fileName, backupType) {
        const modal = document.createElement('div');
        modal.className = 'backup-progress-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>数据库备份</h3>
                </div>
                <div class="modal-body">
                    <div class="backup-info">
                        <div class="info-item">
                            <span class="info-label">文件名:</span>
                            <span class="info-value">${fileName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">备份类型:</span>
                            <span class="info-value">${this.getBackupTypeText(backupType)}备份</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">开始时间:</span>
                            <span class="info-value">${new Date().toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="backup-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">准备备份...</div>
                    </div>
                </div>
            </div>
        `;

        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '10000',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
        });

        return modal;
    }

    // 切换数据库标签页
    switchDatabaseTab(tabName) {
        document.querySelectorAll('.db-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.db-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Panel`).classList.add('active');

        // 根据标签页加载相应内容
        if (tabName === 'monitor') {
            this.loadDatabaseMonitorData();
        }
    }

    // 加载数据库监控数据
    loadDatabaseMonitorData() {
        // 更新监控统计数据
        const stats = {
            connections: Math.floor(Math.random() * 50) + 20,
            queries: Math.floor(Math.random() * 200) + 50,
            cacheHit: (Math.random() * 10 + 90).toFixed(1),
            slowQueries: Math.floor(Math.random() * 10)
        };

        document.querySelector('.monitor-stats .stat-card:nth-child(1) .stat-value').textContent = stats.connections;
        document.querySelector('.monitor-stats .stat-card:nth-child(2) .stat-value').textContent = stats.queries;
        document.querySelector('.monitor-stats .stat-card:nth-child(3) .stat-value').textContent = stats.cacheHit + '%';
        document.querySelector('.monitor-stats .stat-card:nth-child(4) .stat-value').textContent = stats.slowQueries;

        // 添加慢查询列表
        const monitorPanel = document.getElementById('monitorPanel');
        let slowQueriesSection = monitorPanel.querySelector('.slow-queries-section');

        if (!slowQueriesSection) {
            slowQueriesSection = document.createElement('div');
            slowQueriesSection.className = 'slow-queries-section';
            slowQueriesSection.innerHTML = `
                <h4>慢查询记录</h4>
                <div class="slow-queries-list">
                    <div class="slow-query-item">
                        <div class="query-text">SELECT * FROM users WHERE email LIKE '%@gmail.com%' ORDER BY created_at DESC</div>
                        <div class="query-stats">
                            <span class="query-time">执行时间: 2.34s</span>
                            <span class="query-count">执行次数: 15</span>
                        </div>
                    </div>
                    <div class="slow-query-item">
                        <div class="query-text">SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'pending'</div>
                        <div class="query-stats">
                            <span class="query-time">执行时间: 1.87s</span>
                            <span class="query-count">执行次数: 8</span>
                        </div>
                    </div>
                    <div class="slow-query-item">
                        <div class="query-text">UPDATE products SET stock = stock - 1 WHERE id IN (SELECT product_id FROM order_items WHERE order_id = 1001)</div>
                        <div class="query-stats">
                            <span class="query-time">执行时间: 1.23s</span>
                            <span class="query-count">执行次数: 3</span>
                        </div>
                    </div>
                </div>
            `;
            monitorPanel.appendChild(slowQueriesSection);
        }
    }

    // 侧边栏导航功能
    navigateToPage(menuItem) {
        const pageMap = {
            '总览': '总览.html',
            '视图': '视图.html',
            '告警中心': '告警中心.html',
            '设备管理': '设备管理.html',
            '网络拓扑': '网络拓扑.html',
            '统计报表': '统计报表.html',
            '运维工具': '运维工具.html',
            '业务管理': '业务管理.html',
            '网络管理': '网络管理.html',
            '视频管理': '视频管理.html',
            '机房管理': '机房管理.html',
            '资产管理': '资产管理.html',
            '运维管理': '运维管理.html',
            'CMDB': 'CMDB.html',
            '日志管理': '日志管理.html',
            '智能预测管理': '智能预测管理.html',
            '云平台': '云平台.html',
            '设置': '设置.html',
            '对接配置': '对接配置.html'
        };

        const targetPage = pageMap[menuItem];
        if (targetPage) {
            // 如果是当前页面，不进行跳转
            if (targetPage === '运维工具.html') {
                console.log('当前已在运维工具页面');
                return;
            }

            console.log('跳转到页面:', targetPage);
            window.location.href = targetPage;
        } else {
            console.log('未找到对应页面:', menuItem);
            alert('该功能正在开发中...');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new OperationToolsManager();
});
