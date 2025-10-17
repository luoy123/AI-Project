// 网络拓扑管理系统
class NetworkTopology {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.minimapCanvas = null;
        this.minimapCtx = null;
        this.devices = [];
        this.connections = [];
        this.selectedDevice = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.currentTool = 'select';
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.deviceIdCounter = 1;

        // 连线工具相关
        this.linkingDevice = null;
        this.isLinking = false;
        this.tempLinkEnd = { x: 0, y: 0 };
        this.selectedConnection = null;

        // 平移工具相关
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };

        // 文本工具相关
        this.textLabels = [];
        this.isAddingText = false;
        this.editingText = null;
        this.selectedText = null;
        this.isDraggingText = false;
        this.textIdCounter = 1;

        // 新增功能相关
        this.showGrid = false;
        this.snapToGrid = false;
        this.gridSize = 20;
        this.showLabels = true;
        this.showConnections = true;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.settings = {
            theme: 'light',
            deviceIconSize: 40,
            enableSnapping: true,
            enableAnimation: true,
            showTooltips: true,
            autoSaveInterval: 300
        };

        this.init();
    }

    init() {
        this.initCanvas();
        this.initEventListeners();
        this.initDeviceTree();
        this.render();
    }

    // 初始化画布
    initCanvas() {
        this.canvas = document.getElementById('topologyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // 调整画布大小
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.minimapCanvas.width = 200;
        this.minimapCanvas.height = 150;
        
        this.render();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 画布事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
/*  */
        // 工具栏事件
        document.getElementById('selectTool').addEventListener('click', () => this.setTool('select'));
        document.getElementById('panTool').addEventListener('click', () => this.setTool('pan'));
        document.getElementById('zoomTool').addEventListener('click', () => this.setTool('zoom'));
        document.getElementById('linkTool').addEventListener('click', () => this.setTool('link'));
        document.getElementById('textTool').addEventListener('click', () => this.setTool('text'));

        // 缩放控制
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('fitToScreen').addEventListener('click', () => this.fitToScreen());

        // 文件操作
        document.getElementById('newTopology').addEventListener('click', () => this.newTopology());
        document.getElementById('openTopology').addEventListener('click', () => this.openTopology());
        document.getElementById('saveTopology').addEventListener('click', () => this.saveTopology());
        document.getElementById('exportTopology').addEventListener('click', () => this.showExportModal());
        document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // 撤销重做
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // 对齐工具
        document.getElementById('alignLeft').addEventListener('click', () => this.alignDevices('left'));
        document.getElementById('alignCenter').addEventListener('click', () => this.alignDevices('center'));
        document.getElementById('alignRight').addEventListener('click', () => this.alignDevices('right'));

        // 视图控制
        document.getElementById('showGrid').addEventListener('click', () => this.toggleGrid());
        document.getElementById('snapToGrid').addEventListener('click', () => this.toggleSnapToGrid());
        document.getElementById('showLabels').addEventListener('click', () => this.toggleLabels());
        document.getElementById('showConnections').addEventListener('click', () => this.toggleConnections());

        // 设置按钮
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

        // 设备面板功能
        document.getElementById('refreshDevices').addEventListener('click', () => this.refreshDeviceList());
        document.getElementById('expandAll').addEventListener('click', () => this.expandAllNodes());
        document.getElementById('collapseAll').addEventListener('click', () => this.collapseAllNodes());

        // 搜索和过滤
        document.getElementById('deviceSearch').addEventListener('input', (e) => this.filterDevices(e.target.value));
        document.getElementById('deviceFilter').addEventListener('change', (e) => this.filterByType(e.target.value));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.filterByStatus(e.target.value));

        // 属性面板
        document.getElementById('closePropPanel').addEventListener('click', () => this.closePropertyPanel());
        document.getElementById('applyProperties').addEventListener('click', () => this.applyProperties());
        document.getElementById('resetProperties').addEventListener('click', () => this.resetProperties());
        document.getElementById('deleteDevice').addEventListener('click', () => this.deleteSelectedDevice());
        document.getElementById('refreshMonitoring').addEventListener('click', () => this.refreshMonitoringData());

        // 模态框事件
        this.initModalEvents();
    }

    // 初始化模态框事件
    initModalEvents() {
        // 导出模态框
        document.getElementById('closeExportModal').addEventListener('click', () => this.hideExportModal());
        document.getElementById('cancelExport').addEventListener('click', () => this.hideExportModal());
        document.getElementById('confirmExport').addEventListener('click', () => this.confirmExport());

        // 设置模态框
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

        // 设置标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });

        // 文件输入
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    // 初始化设备树
    initDeviceTree() {
        // 树节点展开/折叠
        document.querySelectorAll('.tree-node-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const node = toggle.closest('.tree-node');
                const children = node.querySelector('.tree-node-children');
                if (children) {
                    children.classList.toggle('expanded');
                    toggle.classList.toggle('expanded');
                }
            });
        });

        // 默认展开网络设备节点
        this.expandNetworkDevicesDefault();

        // 设备拖拽
        document.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const deviceData = {
                    type: item.dataset.deviceType,
                    name: item.dataset.deviceName || this.getDeviceTypeName(item.dataset.deviceType)
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(deviceData));
            });
            item.draggable = true;
        });

        // 画布拖放
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const deviceDataStr = e.dataTransfer.getData('text/plain');
            let deviceData;

            try {
                deviceData = JSON.parse(deviceDataStr);
            } catch (error) {
                // 兼容旧格式，如果解析失败则认为是设备类型字符串
                deviceData = {
                    type: deviceDataStr,
                    name: this.getDeviceTypeName(deviceDataStr)
                };
            }

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addDevice(deviceData.type, x, y, deviceData.name);
        });
    }

    // 设置当前工具
    setTool(tool) {
        // 取消当前操作
        this.isLinking = false;
        this.linkingDevice = null;
        this.isPanning = false;
        this.isAddingText = false;
        this.editingText = null;
        this.selectedDevice = null;
        this.selectedText = null;
        this.selectedConnection = null;

        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + 'Tool').classList.add('active');

        // 更改鼠标样式
        const cursors = {
            'select': 'default',
            'pan': 'grab',
            'zoom': 'zoom-in',
            'link': 'crosshair',
            'text': 'crosshair'
        };
        this.canvas.style.cursor = cursors[tool] || 'default';

        this.render();
    }

    // 鼠标按下事件
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'select') {
            // 清除之前的选中状态
            this.selectedDevice = null;
            this.selectedText = null;
            this.selectedConnection = null;
            this.isDragging = false;
            this.isDraggingText = false;

            // 按优先级检测对象
            const textLabel = this.getTextAt(x, y);
            const device = this.getDeviceAt(x, y);
            const connection = this.getConnectionAt(x, y);

            // 优先检测文本标签（因为文本可能覆盖在设备上）
            if (textLabel && !textLabel.isEditing) {
                this.selectedText = textLabel;
                this.isDraggingText = true;
                // 计算画布坐标的拖拽偏移
                const canvasX = (x / this.zoomLevel) - this.panOffset.x;
                const canvasY = (y / this.zoomLevel) - this.panOffset.y;
                this.dragOffset.x = canvasX - textLabel.x;
                this.dragOffset.y = canvasY - textLabel.y;
                this.canvas.style.cursor = 'grabbing';
            } else if (device) {
                this.selectedDevice = device;
                this.isDragging = true;
                // 计算画布坐标的拖拽偏移
                const canvasX = (x / this.zoomLevel) - this.panOffset.x;
                const canvasY = (y / this.zoomLevel) - this.panOffset.y;
                this.dragOffset.x = canvasX - device.x;
                this.dragOffset.y = canvasY - device.y;
                this.canvas.style.cursor = 'grabbing';
            } else if (connection) {
                this.selectedConnection = connection;
                this.canvas.style.cursor = 'pointer';
            } else {
                // 点击空白区域，清除所有选中状态
                this.editingText = null;
                this.closePropertyPanel();
            }

            this.render();
        } else if (this.currentTool === 'pan') {
            this.isPanning = true;
            this.lastPanPoint.x = x;
            this.lastPanPoint.y = y;
            this.canvas.style.cursor = 'grabbing';
        } else if (this.currentTool === 'zoom') {
            // 缩放工具：左键放大，右键缩小
            if (e.button === 0) {
                this.zoomAt(x, y, 1.2);
            }
        } else if (this.currentTool === 'text') {
            // 如果点击到现有文本，编辑它；否则创建新文本
            const textLabel = this.getTextAt(x, y);
            if (textLabel && !textLabel.isEditing) {
                this.editingText = textLabel;
                textLabel.isEditing = true;
                this.showInlineTextEditor(textLabel);
            } else if (!textLabel) {
                this.addTextLabel(x, y);
            }
        } else if (this.currentTool === 'link') {
            const device = this.getDeviceAt(x, y);
            if (device) {
                if (!this.isLinking) {
                    // 开始连线
                    this.linkingDevice = device;
                    this.isLinking = true;
                    this.tempLinkEnd.x = x;
                    this.tempLinkEnd.y = y;
                } else {
                    // 完成连线
                    if (device !== this.linkingDevice) {
                        this.addConnection(this.linkingDevice.id, device.id);
                    }
                    this.isLinking = false;
                    this.linkingDevice = null;
                }
            } else if (this.isLinking) {
                // 取消连线
                this.isLinking = false;
                this.linkingDevice = null;
            }
        }

        this.render();
    }

    // 鼠标移动事件
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.isDragging && this.selectedDevice && this.currentTool === 'select') {
            // 转换鼠标坐标到画布坐标
            const canvasX = (x / this.zoomLevel) - this.panOffset.x;
            const canvasY = (y / this.zoomLevel) - this.panOffset.y;

            // 计算新位置并限制在画布范围内
            const newX = Math.max(30, Math.min((this.canvas.width / this.zoomLevel) - 30, canvasX - this.dragOffset.x));
            const newY = Math.max(30, Math.min((this.canvas.height / this.zoomLevel) - 30, canvasY - this.dragOffset.y));

            this.selectedDevice.x = newX;
            this.selectedDevice.y = newY;
            this.render();
        } else if (this.isDraggingText && this.selectedText && this.currentTool === 'select') {
            // 转换鼠标坐标到画布坐标
            const canvasX = (x / this.zoomLevel) - this.panOffset.x;
            const canvasY = (y / this.zoomLevel) - this.panOffset.y;

            // 计算新位置并限制在画布范围内
            const newX = Math.max(50, Math.min((this.canvas.width / this.zoomLevel) - 50, canvasX - this.dragOffset.x));
            const newY = Math.max(20, Math.min((this.canvas.height / this.zoomLevel) - 20, canvasY - this.dragOffset.y));

            this.selectedText.x = newX;
            this.selectedText.y = newY;
            this.render();
        } else if (this.isPanning && this.currentTool === 'pan') {
            // 平移画布
            const deltaX = x - this.lastPanPoint.x;
            const deltaY = y - this.lastPanPoint.y;

            this.panOffset.x += deltaX / this.zoomLevel;
            this.panOffset.y += deltaY / this.zoomLevel;

            this.lastPanPoint.x = x;
            this.lastPanPoint.y = y;
            this.render();
        } else if (this.currentTool === 'select') {
            // 鼠标悬停效果
            const device = this.getDeviceAt(x, y);
            const textLabel = this.getTextAt(x, y);
            const connection = this.getConnectionAt(x, y);
            if (device || textLabel || connection) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        } else if (this.currentTool === 'text') {
            // 文本工具悬停效果
            const textLabel = this.getTextAt(x, y);
            if (textLabel) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }
        } else if (this.currentTool === 'link' && this.isLinking) {
            // 连线时更新临时线条终点
            this.tempLinkEnd.x = x;
            this.tempLinkEnd.y = y;
            this.render();
        }
    }

    // 鼠标释放事件
    handleMouseUp(e) {
        this.isDragging = false;
        this.isDraggingText = false;
        this.isPanning = false;

        if (this.currentTool === 'select') {
            this.canvas.style.cursor = 'default';
        } else if (this.currentTool === 'pan') {
            this.canvas.style.cursor = 'grab';
        }
    }

    // 鼠标滚轮事件
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoomLevel *= delta;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));
        this.updateZoomDisplay();
        this.render();
    }

    // 双击事件
    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const device = this.getDeviceAt(x, y);
        const textLabel = this.getTextAt(x, y);

        if (device) {
            this.showPropertyPanel(device);
        } else if (textLabel) {
            this.editingText = textLabel;
            textLabel.isEditing = true;
            this.showInlineTextEditor(textLabel);
        }
    }

    // 右键菜单事件
    handleRightClick(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'zoom') {
            // 缩放工具：右键缩小
            this.zoomAt(x, y, 0.8);
            return;
        }

        const device = this.getDeviceAt(x, y);
        const connection = this.getConnectionAt(x, y);
        const textLabel = this.getTextAt(x, y);

        if (device) {
            this.selectedDevice = device;
            this.showDeviceContextMenu(e.clientX, e.clientY);
            this.render();
        } else if (connection) {
            this.selectedConnection = connection;
            this.showConnectionContextMenu(e.clientX, e.clientY);
        } else if (textLabel) {
            this.editingText = textLabel;
            this.showTextContextMenu(e.clientX, e.clientY);
        }
    }

    // 键盘事件
    handleKeyDown(e) {
        // 删除键删除选中对象
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedDevice) {
                this.deleteSelectedDevice();
            } else if (this.selectedText) {
                this.deleteSelectedText();
            } else if (this.editingText) {
                this.deleteSelectedText();
            } else if (this.selectedConnection) {
                this.deleteSelectedConnection();
            }
        }

        // ESC键取消选择和连线
        if (e.key === 'Escape') {
            this.selectedDevice = null;
            this.selectedText = null;
            this.selectedConnection = null;
            this.isLinking = false;
            this.linkingDevice = null;
            this.editingText = null;
            this.hideInlineTextEditor();
            this.closePropertyPanel();
            this.hideContextMenu();
            this.render();
        }

        // 方向键移动设备或文本
        if ((this.selectedDevice || this.selectedText) && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const target = this.selectedDevice || this.selectedText;

            switch (e.key) {
                case 'ArrowUp':
                    target.y -= step;
                    break;
                case 'ArrowDown':
                    target.y += step;
                    break;
                case 'ArrowLeft':
                    target.x -= step;
                    break;
                case 'ArrowRight':
                    target.x += step;
                    break;
            }
            this.render();
        }
    }

    // 添加设备
    addDevice(type, x, y, customName = null) {
        const device = {
            id: this.deviceIdCounter++,
            type: type,
            x: x,
            y: y,
            name: customName ? customName + ' ' + this.deviceIdCounter : this.getDeviceTypeName(type) + ' ' + this.deviceIdCounter,
            ip: '192.168.1.' + this.deviceIdCounter,
            status: 'online'
        };

        this.devices.push(device);
        this.render();
    }

    // 添加连接
    addConnection(fromId, toId) {
        // 检查是否已存在连接
        const existingConnection = this.connections.find(conn =>
            (conn.from === fromId && conn.to === toId) ||
            (conn.from === toId && conn.to === fromId)
        );

        if (!existingConnection) {
            this.connections.push({
                id: Date.now(),
                from: fromId,
                to: toId,
                type: 'ethernet'
            });
        }
    }

    // 添加文本标签
    addTextLabel(x, y) {
        const textLabel = {
            id: this.textIdCounter++,
            x: x,
            y: y,
            text: '新文本',
            fontSize: 14,
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 8,
            isEditing: true
        };
        this.textLabels.push(textLabel);
        this.editingText = textLabel;
        this.showInlineTextEditor(textLabel);
        this.render();
    }

    // 获取指定位置的文本标签
    getTextAt(x, y) {
        // 转换鼠标坐标到画布坐标
        const canvasX = (x / this.zoomLevel) - this.panOffset.x;
        const canvasY = (y / this.zoomLevel) - this.panOffset.y;

        // 设置字体以正确测量文本宽度
        this.ctx.font = '14px Arial';

        for (let i = this.textLabels.length - 1; i >= 0; i--) {
            const text = this.textLabels[i];

            // 如果正在编辑，跳过
            if (text.isEditing) {
                continue;
            }

            this.ctx.font = `${text.fontSize}px Arial`;
            const textWidth = this.ctx.measureText(text.text).width;
            const width = textWidth + text.padding * 2;
            const height = text.fontSize + text.padding * 2;

            if (canvasX >= text.x - width/2 && canvasX <= text.x + width/2 &&
                canvasY >= text.y - height/2 && canvasY <= text.y + height/2) {
                return text;
            }
        }
        return null;
    }

    // 显示内联文本编辑器
    showInlineTextEditor(textLabel) {
        // 移除已存在的编辑器
        this.hideInlineTextEditor();

        // 获取画布在页面中的位置和缩放
        const canvasRect = this.canvas.getBoundingClientRect();

        // 计算文本在屏幕上的实际位置
        const screenX = canvasRect.left + (textLabel.x * this.zoomLevel) + (this.panOffset.x * this.zoomLevel);
        const screenY = canvasRect.top + (textLabel.y * this.zoomLevel) + (this.panOffset.y * this.zoomLevel);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = textLabel.text;
        input.id = 'inlineTextEditor';
        input.className = 'inline-text-editor';

        // 设置样式
        Object.assign(input.style, {
            position: 'fixed',
            left: (screenX - 60) + 'px',
            top: (screenY - 12) + 'px',
            width: '120px',
            height: '24px',
            fontSize: textLabel.fontSize + 'px',
            color: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            padding: '4px 8px',
            zIndex: '10000',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
        });

        // 添加到body
        document.body.appendChild(input);

        // 立即聚焦并选中文本
        requestAnimationFrame(() => {
            input.focus();
            input.select();
        });

        // 处理输入完成
        const finishEditing = () => {
            const newText = input.value.trim();
            if (newText) {
                textLabel.text = newText;
            } else {
                // 删除空文本
                this.textLabels = this.textLabels.filter(t => t !== textLabel);
            }
            textLabel.isEditing = false;
            this.hideInlineTextEditor();
            this.editingText = null;
            this.render();
        };

        // 取消编辑
        const cancelEditing = () => {
            if (textLabel.text === '新文本') {
                this.textLabels = this.textLabels.filter(t => t !== textLabel);
            }
            textLabel.isEditing = false;
            this.hideInlineTextEditor();
            this.editingText = null;
            this.render();
        };

        // 事件监听
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditing();
            }
        });

        // 防止鼠标事件冒泡
        input.addEventListener('mousedown', (e) => e.stopPropagation());
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('dblclick', (e) => e.stopPropagation());
    }

    // 隐藏内联文本编辑器
    hideInlineTextEditor() {
        const editor = document.getElementById('inlineTextEditor');
        if (editor) {
            editor.remove();
        }
    }

    // 使用prompt编辑文本
    editTextWithPrompt(textLabel) {
        const newText = prompt('编辑文本内容:', textLabel.text);
        if (newText !== null) {
            if (newText.trim()) {
                textLabel.text = newText.trim();
            } else {
                // 删除空文本
                this.textLabels = this.textLabels.filter(t => t !== textLabel);
            }
            this.editingText = null;
            this.render();
        }
    }

    // 显示文本编辑器（保留用于右键菜单）
    showTextEditor(textLabel) {
        textLabel.isEditing = true;
        this.showInlineTextEditor(textLabel);
    }

    // 在指定位置缩放
    zoomAt(x, y, factor) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));

        // 调整平移偏移以保持缩放中心点
        const zoomChange = this.zoomLevel / oldZoom;
        this.panOffset.x = (this.panOffset.x - x / oldZoom) * zoomChange + x / this.zoomLevel;
        this.panOffset.y = (this.panOffset.y - y / oldZoom) * zoomChange + y / this.zoomLevel;

        this.updateZoomDisplay();
        this.render();
    }

    // 获取设备类型名称
    getDeviceTypeName(type) {
        const names = {
            'router': '路由器',
            'switch': '交换机',
            'firewall': '防火墙',
            'server': '服务器',
            'wireless': '无线设备',
            'security': '安全设备',
            'storage': '存储设备'
        };
        return names[type] || '设备';
    }

    // 获取指定位置的设备
    getDeviceAt(x, y) {
        // 转换鼠标坐标到画布坐标
        const canvasX = (x / this.zoomLevel) - this.panOffset.x;
        const canvasY = (y / this.zoomLevel) - this.panOffset.y;

        for (let i = this.devices.length - 1; i >= 0; i--) {
            const device = this.devices[i];
            const distance = Math.sqrt((canvasX - device.x) ** 2 + (canvasY - device.y) ** 2);
            if (distance <= 30) {
                return device;
            }
        }
        return null;
    }

    // 获取指定位置的连接线
    getConnectionAt(x, y) {
        // 转换鼠标坐标到画布坐标
        const canvasX = (x / this.zoomLevel) - this.panOffset.x;
        const canvasY = (y / this.zoomLevel) - this.panOffset.y;

        for (let conn of this.connections) {
            const device1 = this.devices.find(d => d.id === conn.from);
            const device2 = this.devices.find(d => d.id === conn.to);

            if (device1 && device2) {
                const distance = this.distanceToLine(canvasX, canvasY, device1.x, device1.y, device2.x, device2.y);
                if (distance <= 8) { // 增加检测范围
                    return conn;
                }
            }
        }
        return null;
    }

    // 计算点到线段的距离
    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 渲染画布
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 保存上下文
        this.ctx.save();
        
        // 应用缩放和平移
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制连接线
        this.drawConnections();
        
        // 绘制设备
        this.drawDevices();

        // 绘制文本标签
        this.drawTextLabels();

        // 恢复上下文
        this.ctx.restore();
        
        // 渲染小地图
        this.renderMinimap();
    }

    // 绘制网格
    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width / this.zoomLevel; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height / this.zoomLevel);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height / this.zoomLevel; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width / this.zoomLevel, y);
            this.ctx.stroke();
        }
    }

    // 绘制连接线
    drawConnections() {
        this.connections.forEach(conn => {
            const device1 = this.devices.find(d => d.id === conn.from);
            const device2 = this.devices.find(d => d.id === conn.to);

            if (device1 && device2) {
                // 检查是否为选中的连接
                const isSelected = conn === this.selectedConnection;

                // 设置连接线样式
                this.ctx.strokeStyle = isSelected ? '#f59e0b' : '#60a5fa';
                this.ctx.lineWidth = isSelected ? 4 : 2;

                // 如果选中，先绘制一条更粗的背景线
                if (isSelected) {
                    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
                    this.ctx.lineWidth = 8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(device1.x, device1.y);
                    this.ctx.lineTo(device2.x, device2.y);
                    this.ctx.stroke();

                    // 恢复前景线样式
                    this.ctx.strokeStyle = '#f59e0b';
                    this.ctx.lineWidth = 4;
                }

                // 绘制连接线
                this.ctx.beginPath();
                this.ctx.moveTo(device1.x, device1.y);
                this.ctx.lineTo(device2.x, device2.y);
                this.ctx.stroke();

                // 绘制连接点
                this.drawConnectionPoint(device1.x, device1.y, isSelected);
                this.drawConnectionPoint(device2.x, device2.y, isSelected);
            }
        });

        // 绘制临时连线
        if (this.isLinking && this.linkingDevice) {
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);

            this.ctx.beginPath();
            this.ctx.moveTo(this.linkingDevice.x, this.linkingDevice.y);
            this.ctx.lineTo(this.tempLinkEnd.x, this.tempLinkEnd.y);
            this.ctx.stroke();

            this.ctx.setLineDash([]);
        }
    }

    // 绘制连接点
    drawConnectionPoint(x, y, isSelected = false) {
        this.ctx.fillStyle = isSelected ? '#f59e0b' : '#60a5fa';
        this.ctx.beginPath();
        this.ctx.arc(x, y, isSelected ? 4 : 3, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = isSelected ? 2 : 1;
        this.ctx.stroke();
    }

    // 绘制设备
    drawDevices() {
        this.devices.forEach(device => {
            this.drawDevice(device);
        });
    }

    // 绘制文本标签
    drawTextLabels() {
        this.textLabels.forEach(textLabel => {
            this.drawTextLabel(textLabel);
        });
    }

    // 绘制单个文本标签
    drawTextLabel(textLabel) {
        // 如果正在编辑，不绘制文本内容
        if (textLabel.isEditing) {
            return;
        }

        this.ctx.font = `${textLabel.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const textWidth = this.ctx.measureText(textLabel.text).width;
        const width = textWidth + textLabel.padding * 2;
        const height = textLabel.fontSize + textLabel.padding * 2;

        // 绘制背景
        this.ctx.fillStyle = textLabel.backgroundColor;
        this.ctx.fillRect(
            textLabel.x - width/2,
            textLabel.y - height/2,
            width,
            height
        );

        // 绘制边框
        const isSelected = textLabel === this.selectedText || textLabel === this.editingText;
        this.ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = isSelected ? 2 : 1;
        this.ctx.strokeRect(
            textLabel.x - width/2,
            textLabel.y - height/2,
            width,
            height
        );

        // 绘制文本
        this.ctx.fillStyle = textLabel.color;
        this.ctx.fillText(textLabel.text, textLabel.x, textLabel.y);
    }

    // 绘制单个设备
    drawDevice(device) {
        const isSelected = device === this.selectedDevice;
        const isDragging = this.isDragging && isSelected;

        // 拖拽时的阴影效果
        if (isDragging) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
        }

        // 设备图标背景
        this.ctx.fillStyle = this.getDeviceColor(device);
        this.ctx.beginPath();
        this.ctx.arc(device.x, device.y, 25, 0, 2 * Math.PI);
        this.ctx.fill();

        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // 选中状态边框
        if (isSelected) {
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // 选中状态的外圈
            this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(device.x, device.y, 35, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        // 设备图标
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px FontAwesome';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.getDeviceIcon(device.type), device.x, device.y);

        // 设备名称
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(device.name, device.x, device.y + 40);

        // 状态指示器
        this.ctx.fillStyle = this.getStatusColor(device.status);
        this.ctx.beginPath();
        this.ctx.arc(device.x + 20, device.y - 20, 5, 0, 2 * Math.PI);
        this.ctx.fill();

        // 状态指示器边框
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    // 获取设备颜色
    getDeviceColor(device) {
        const colors = {
            'router': '#f59e0b',
            'switch': '#10b981',
            'firewall': '#ef4444',
            'server': '#3b82f6'
        };
        return colors[device.type] || '#6b7280';
    }

    // 获取设备图标
    getDeviceIcon(type) {
        const icons = {
            'router': '🔀',
            'switch': '🔗',
            'firewall': '🛡️',
            'server': '🖥️'
        };
        return icons[type] || '📱';
    }

    // 获取状态颜色
    getStatusColor(status) {
        const colors = {
            'online': '#10b981',
            'offline': '#ef4444',
            'warning': '#f59e0b'
        };
        return colors[status] || '#6b7280';
    }

    // 渲染小地图
    renderMinimap() {
        this.minimapCtx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        // 绘制设备在小地图上
        this.devices.forEach(device => {
            const x = (device.x / this.canvas.width) * this.minimapCanvas.width;
            const y = (device.y / this.canvas.height) * this.minimapCanvas.height;
            
            this.minimapCtx.fillStyle = this.getDeviceColor(device);
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(x, y, 3, 0, 2 * Math.PI);
            this.minimapCtx.fill();
        });
    }

    // 显示属性面板
    showPropertyPanel(device) {
        this.selectedDevice = device;
        document.getElementById('deviceName').value = device.name;
        document.getElementById('deviceIP').value = device.ip;
        document.getElementById('deviceType').value = device.type;
        document.getElementById('deviceStatus').value = device.status;
        document.getElementById('propertyPanel').classList.add('open');
    }

    // 关闭属性面板
    closePropertyPanel() {
        document.getElementById('propertyPanel').classList.remove('open');
    }

    // 应用属性
    applyProperties() {
        if (this.selectedDevice) {
            this.selectedDevice.name = document.getElementById('deviceName').value;
            this.selectedDevice.ip = document.getElementById('deviceIP').value;
            this.selectedDevice.type = document.getElementById('deviceType').value;
            this.selectedDevice.status = document.getElementById('deviceStatus').value;
            this.render();
        }
    }

    // 删除选中设备
    deleteSelectedDevice() {
        if (this.selectedDevice) {
            // 确认删除
            if (confirm(`确定要删除设备 "${this.selectedDevice.name}" 吗？`)) {
                // 删除相关连接
                this.connections = this.connections.filter(conn =>
                    conn.from !== this.selectedDevice.id && conn.to !== this.selectedDevice.id
                );

                // 删除设备
                this.devices = this.devices.filter(d => d !== this.selectedDevice);
                this.selectedDevice = null;
                this.closePropertyPanel();
                this.hideContextMenu();
                this.render();
            }
        }
    }

    // 显示设备右键菜单
    showDeviceContextMenu(x, y) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        menu.innerHTML = `
            <div class="context-menu-item" onclick="topology.showPropertyPanel(topology.selectedDevice)">
                <i class="fas fa-edit"></i> 编辑属性
            </div>
            <div class="context-menu-item" onclick="topology.duplicateDevice()">
                <i class="fas fa-copy"></i> 复制设备
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item delete" onclick="topology.deleteSelectedDevice()">
                <i class="fas fa-trash"></i> 删除设备
            </div>
        `;

        document.body.appendChild(menu);

        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    // 显示连接线右键菜单
    showConnectionContextMenu(x, y) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        menu.innerHTML = `
            <div class="context-menu-item delete" onclick="topology.deleteSelectedConnection()">
                <i class="fas fa-unlink"></i> 删除连接
            </div>
        `;

        document.body.appendChild(menu);

        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    // 显示文本标签右键菜单
    showTextContextMenu(x, y) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        menu.innerHTML = `
            <div class="context-menu-item" onclick="topology.editTextLabel()">
                <i class="fas fa-edit"></i> 编辑文本
            </div>
            <div class="context-menu-item" onclick="topology.changeTextStyle()">
                <i class="fas fa-palette"></i> 修改样式
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item delete" onclick="topology.deleteSelectedText()">
                <i class="fas fa-trash"></i> 删除文本
            </div>
        `;

        document.body.appendChild(menu);

        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    // 隐藏右键菜单
    hideContextMenu() {
        const menu = document.getElementById('contextMenu');
        if (menu) {
            menu.remove();
        }
    }

    // 复制设备
    duplicateDevice() {
        if (this.selectedDevice) {
            const newDevice = {
                ...this.selectedDevice,
                id: this.deviceIdCounter++,
                name: this.selectedDevice.name + ' (副本)',
                x: this.selectedDevice.x + 50,
                y: this.selectedDevice.y + 50
            };
            this.devices.push(newDevice);
            this.selectedDevice = newDevice;
            this.hideContextMenu();
            this.render();
        }
    }

    // 删除选中的连接
    deleteSelectedConnection() {
        if (this.selectedConnection) {
            this.connections = this.connections.filter(conn => conn !== this.selectedConnection);
            this.selectedConnection = null;
            this.hideContextMenu();
            this.render();
        }
    }

    // 编辑文本标签
    editTextLabel() {
        if (this.editingText) {
            this.editingText.isEditing = true;
            this.showInlineTextEditor(this.editingText);
            this.hideContextMenu();
        }
    }

    // 修改文本样式
    changeTextStyle() {
        if (this.editingText) {
            const fontSize = prompt('请输入字体大小 (8-72):', this.editingText.fontSize);
            if (fontSize && !isNaN(fontSize)) {
                const size = Math.max(8, Math.min(72, parseInt(fontSize)));
                this.editingText.fontSize = size;
            }

            const color = prompt('请输入文字颜色 (如: #ffffff, white):', this.editingText.color);
            if (color && color.trim()) {
                this.editingText.color = color.trim();
            }

            const bgColor = prompt('请输入背景颜色 (如: rgba(0,0,0,0.7)):', this.editingText.backgroundColor);
            if (bgColor && bgColor.trim()) {
                this.editingText.backgroundColor = bgColor.trim();
            }

            this.hideContextMenu();
            this.render();
        }
    }

    // 删除选中的文本
    deleteSelectedText() {
        const textToDelete = this.selectedText || this.editingText;
        if (textToDelete) {
            this.textLabels = this.textLabels.filter(text => text !== textToDelete);
            this.selectedText = null;
            this.editingText = null;
            this.hideContextMenu();
            this.render();
        }
    }

    // 缩放功能
    zoomIn() {
        this.zoomLevel *= 1.2;
        this.zoomLevel = Math.min(5, this.zoomLevel);
        this.updateZoomDisplay();
        this.render();
    }

    zoomOut() {
        this.zoomLevel *= 0.8;
        this.zoomLevel = Math.max(0.1, this.zoomLevel);
        this.updateZoomDisplay();
        this.render();
    }

    fitToScreen() {
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.updateZoomDisplay();
        this.render();
    }

    updateZoomDisplay() {
        document.querySelector('.zoom-level').textContent = Math.round(this.zoomLevel * 100) + '%';
    }

    // 保存拓扑
    saveTopology() {
        const data = {
            devices: this.devices,
            connections: this.connections
        };
        localStorage.setItem('networkTopology', JSON.stringify(data));
        alert('拓扑图已保存');
    }

    // 导出拓扑
    exportTopology() {
        const data = {
            devices: this.devices,
            connections: this.connections
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'network_topology.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // 全屏切换
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // 新建拓扑
    newTopology() {
        if (confirm('确定要新建拓扑图吗？当前未保存的更改将丢失。')) {
            this.devices = [];
            this.connections = [];
            this.textLabels = [];
            this.selectedDevice = null;
            this.selectedConnection = null;
            this.selectedText = null;
            this.history = [];
            this.historyIndex = -1;
            this.render();
            this.updateStatusBar();
            this.showNotification('新建拓扑图成功', 'success');
        }
    }

    // 打开拓扑
    openTopology() {
        document.getElementById('fileInput').click();
    }

    // 处理文件加载
    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.loadTopologyData(data);
                this.showNotification('拓扑图加载成功', 'success');
            } catch (error) {
                this.showNotification('文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 加载拓扑数据
    loadTopologyData(data) {
        this.devices = data.devices || [];
        this.connections = data.connections || [];
        this.textLabels = data.textLabels || [];
        this.deviceIdCounter = Math.max(...this.devices.map(d => d.id), 0) + 1;
        this.render();
        this.updateStatusBar();
    }

    // 显示导出模态框
    showExportModal() {
        document.getElementById('exportModal').classList.add('show');
    }

    // 隐藏导出模态框
    hideExportModal() {
        document.getElementById('exportModal').classList.remove('show');
    }

    // 确认导出
    confirmExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const quality = document.getElementById('exportQuality').value;
        const includeBackground = document.getElementById('includeBackground').checked;
        const includeGrid = document.getElementById('includeGrid').checked;

        this.exportTopologyAdvanced(format, { quality, includeBackground, includeGrid });
        this.hideExportModal();
    }

    // 高级导出功能
    exportTopologyAdvanced(format = 'png', options = {}) {
        if (format === 'json') {
            const data = {
                devices: this.devices,
                connections: this.connections,
                textLabels: this.textLabels,
                settings: this.settings
            };
            this.downloadJSON(data, 'topology.json');
            return;
        }

        // 创建临时画布用于导出
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // 绘制背景
        if (options.includeBackground) {
            exportCtx.fillStyle = '#ffffff';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        // 绘制网格
        if (options.includeGrid && this.showGrid) {
            this.drawGrid(exportCtx);
        }

        // 绘制拓扑内容
        this.drawDevices(exportCtx);
        this.drawConnections(exportCtx);
        if (this.showLabels) {
            this.drawTextLabels(exportCtx);
        }

        // 导出图片
        const dataURL = exportCanvas.toDataURL(`image/${format}`, parseFloat(options.quality || 0.8));
        this.downloadImage(dataURL, `topology.${format}`);
        this.showNotification(`导出${format.toUpperCase()}成功`, 'success');
    }

    // 下载JSON文件
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 下载图片
    downloadImage(dataURL, filename) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
    }

    // 撤销
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.render();
            this.updateStatusBar();
            this.showNotification('撤销成功', 'info');
        }
    }

    // 重做
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.render();
            this.updateStatusBar();
            this.showNotification('重做成功', 'info');
        }
    }

    // 保存状态到历史记录
    saveState() {
        const state = {
            devices: JSON.parse(JSON.stringify(this.devices)),
            connections: JSON.parse(JSON.stringify(this.connections)),
            textLabels: JSON.parse(JSON.stringify(this.textLabels))
        };

        // 删除当前位置之后的历史记录
        this.history = this.history.slice(0, this.historyIndex + 1);

        // 添加新状态
        this.history.push(state);

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    // 恢复状态
    restoreState(state) {
        this.devices = JSON.parse(JSON.stringify(state.devices));
        this.connections = JSON.parse(JSON.stringify(state.connections));
        this.textLabels = JSON.parse(JSON.stringify(state.textLabels));
    }

    // 对齐设备
    alignDevices(alignment) {
        const selectedDevices = this.devices.filter(device => device.selected);
        if (selectedDevices.length < 2) {
            this.showNotification('请选择至少两个设备', 'warning');
            return;
        }

        this.saveState();

        switch (alignment) {
            case 'left':
                const leftX = Math.min(...selectedDevices.map(d => d.x));
                selectedDevices.forEach(device => device.x = leftX);
                break;
            case 'center':
                const centerX = selectedDevices.reduce((sum, d) => sum + d.x, 0) / selectedDevices.length;
                selectedDevices.forEach(device => device.x = centerX);
                break;
            case 'right':
                const rightX = Math.max(...selectedDevices.map(d => d.x));
                selectedDevices.forEach(device => device.x = rightX);
                break;
        }

        this.render();
        this.showNotification(`${alignment === 'left' ? '左' : alignment === 'center' ? '居中' : '右'}对齐完成`, 'success');
    }

    // 切换网格显示
    toggleGrid() {
        this.showGrid = !this.showGrid;
        document.getElementById('showGrid').classList.toggle('active', this.showGrid);
        this.render();
        this.showNotification(`网格${this.showGrid ? '显示' : '隐藏'}`, 'info');
    }

    // 切换网格吸附
    toggleSnapToGrid() {
        this.snapToGrid = !this.snapToGrid;
        document.getElementById('snapToGrid').classList.toggle('active', this.snapToGrid);
        this.showNotification(`网格吸附${this.snapToGrid ? '开启' : '关闭'}`, 'info');
    }

    // 切换标签显示
    toggleLabels() {
        this.showLabels = !this.showLabels;
        document.getElementById('showLabels').classList.toggle('active', this.showLabels);
        this.render();
        this.showNotification(`标签${this.showLabels ? '显示' : '隐藏'}`, 'info');
    }

    // 切换连接显示
    toggleConnections() {
        this.showConnections = !this.showConnections;
        document.getElementById('showConnections').classList.toggle('active', this.showConnections);
        this.render();
        this.showNotification(`连接${this.showConnections ? '显示' : '隐藏'}`, 'info');
    }

    // 显示设置模态框
    showSettingsModal() {
        document.getElementById('settingsModal').classList.add('show');
    }

    // 隐藏设置模态框
    hideSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    // 切换设置标签页
    switchSettingsTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // 重置设置
    resetSettings() {
        this.settings = {
            theme: 'light',
            deviceIconSize: 40,
            enableSnapping: true,
            enableAnimation: true,
            showTooltips: true,
            autoSaveInterval: 300
        };
        this.applySettings();
        this.showNotification('设置已重置', 'info');
    }

    // 保存设置
    saveSettings() {
        // 获取设置值
        this.settings.theme = document.getElementById('theme').value;
        this.settings.deviceIconSize = parseInt(document.getElementById('deviceIconSize').value);
        this.settings.enableSnapping = document.getElementById('enableSnapping').checked;
        this.settings.enableAnimation = document.getElementById('enableAnimation').checked;
        this.settings.showTooltips = document.getElementById('showTooltips').checked;
        this.settings.autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value);
        this.gridSize = parseInt(document.getElementById('gridSize').value);

        this.applySettings();
        localStorage.setItem('topologySettings', JSON.stringify(this.settings));
        this.hideSettingsModal();
        this.showNotification('设置已保存', 'success');
    }

    // 应用设置
    applySettings() {
        // 应用主题
        document.body.className = this.settings.theme === 'dark' ? 'dark-theme' : '';

        // 更新UI显示
        document.getElementById('deviceIconSizeValue').textContent = this.settings.deviceIconSize + 'px';
        document.getElementById('gridSizeValue').textContent = this.gridSize + 'px';

        this.render();
    }

    // 刷新设备列表
    refreshDeviceList() {
        this.showNotification('设备列表已刷新', 'info');
    }

    // 展开所有节点
    expandAllNodes() {
        document.querySelectorAll('.tree-node-children').forEach(children => {
            children.style.display = 'block';
        });
        document.querySelectorAll('.tree-node-toggle i').forEach(icon => {
            icon.className = 'fas fa-chevron-down';
        });
        this.showNotification('已展开所有节点', 'info');
    }

    // 收起所有节点
    collapseAllNodes() {
        document.querySelectorAll('.tree-node-children').forEach(children => {
            children.style.display = 'none';
        });
        document.querySelectorAll('.tree-node-toggle i').forEach(icon => {
            icon.className = 'fas fa-chevron-right';
        });
        this.showNotification('已收起所有节点', 'info');
    }

    // 默认展开网络设备节点
    expandNetworkDevicesDefault() {
        // 查找网络设备的根节点
        const networkDeviceNode = document.querySelector('.tree-node');
        if (networkDeviceNode) {
            const children = networkDeviceNode.querySelector('.tree-node-children');
            const toggle = networkDeviceNode.querySelector('.tree-node-toggle');

            if (children && toggle) {
                // 添加展开类
                children.classList.add('expanded');
                toggle.classList.add('expanded');

                // 更新图标
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-chevron-down';
                }

                // 展开所有设备类别子节点
                const categoryNodes = children.querySelectorAll('.tree-node');
                categoryNodes.forEach(categoryNode => {
                    const categoryChildren = categoryNode.querySelector('.tree-node-children');
                    const categoryToggle = categoryNode.querySelector('.tree-node-toggle');

                    if (categoryChildren && categoryToggle) {
                        categoryChildren.classList.add('expanded');
                        categoryToggle.classList.add('expanded');

                        const categoryIcon = categoryToggle.querySelector('i');
                        if (categoryIcon) {
                            categoryIcon.className = 'fas fa-chevron-down';
                        }
                    }
                });
            }
        }
    }

    // 过滤设备
    filterDevices(searchText) {
        const deviceItems = document.querySelectorAll('.device-item');
        deviceItems.forEach(item => {
            const label = item.querySelector('.tree-node-label').textContent.toLowerCase();
            const match = label.includes(searchText.toLowerCase());
            item.style.display = match ? 'flex' : 'none';
        });
    }

    // 按类型过滤
    filterByType(type) {
        const deviceItems = document.querySelectorAll('.device-item');
        deviceItems.forEach(item => {
            const deviceType = item.dataset.deviceType;
            const match = type === 'all' || deviceType === type;
            item.style.display = match ? 'flex' : 'none';
        });
    }

    // 按状态过滤
    filterByStatus(status) {
        // 这里可以根据设备状态进行过滤
        this.showNotification(`按状态过滤: ${status}`, 'info');
    }

    // 重置属性
    resetProperties() {
        if (this.selectedDevice) {
            this.populatePropertyPanel(this.selectedDevice);
            this.showNotification('属性已重置', 'info');
        }
    }

    // 刷新监控数据
    refreshMonitoringData() {
        if (this.selectedDevice) {
            // 模拟获取监控数据
            const cpuUsage = Math.floor(Math.random() * 100) + '%';
            const memoryUsage = Math.floor(Math.random() * 100) + '%';
            const networkTraffic = Math.floor(Math.random() * 1000) + ' MB/s';
            const responseTime = Math.floor(Math.random() * 100) + ' ms';

            document.getElementById('cpuUsage').textContent = cpuUsage;
            document.getElementById('memoryUsage').textContent = memoryUsage;
            document.getElementById('networkTraffic').textContent = networkTraffic;
            document.getElementById('responseTime').textContent = responseTime;

            this.showNotification('监控数据已刷新', 'success');
        }
    }

    // 更新状态栏
    updateStatusBar() {
        document.getElementById('deviceCount').textContent = `设备: ${this.devices.length}`;
        document.getElementById('connectionCount').textContent = `连接: ${this.connections.length}`;
        document.getElementById('lastSaved').textContent = '刚刚保存';
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 全局变量，用于右键菜单访问
let topology;

// 初始化网络拓扑
document.addEventListener('DOMContentLoaded', () => {
    topology = new NetworkTopology();

    // 初始化侧边栏导航
    initSidebarNavigation();
});

// 侧边栏导航功能
function initSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemText = this.querySelector('span').textContent;
            console.log('导航到:', itemText);
            navigateToPage(itemText);
        });
    });
}

function navigateToPage(menuItem) {
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
        if (targetPage === '网络拓扑.html') {
            console.log('当前已在网络拓扑页面');
            return;
        }

        console.log('跳转到页面:', targetPage);
        window.location.href = targetPage;
    } else {
        console.log('未找到对应页面:', menuItem);
        alert('该功能正在开发中...');
    }
}
