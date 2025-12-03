-- ====================================
-- 第四阶段：云平台 + 运维管理 + 日志管理 + 报表 + 智能预测 + 其他模块
-- ====================================

USE `aiops_db`;

-- ====================================
-- 1. 云平台模块
-- ====================================

-- 云平台表
DROP TABLE IF EXISTS `cloud_platform`;
CREATE TABLE `cloud_platform` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `platform_name` VARCHAR(100) NOT NULL COMMENT '平台名称',
    `platform_type` VARCHAR(50) NOT NULL COMMENT '平台类型：aliyun,tencent,aws,azure,vmware',
    `api_endpoint` VARCHAR(200) DEFAULT NULL COMMENT 'API端点',
    `access_key` VARCHAR(200) DEFAULT NULL COMMENT 'AccessKey',
    `secret_key` VARCHAR(200) DEFAULT NULL COMMENT 'SecretKey',
    `region` VARCHAR(50) DEFAULT NULL COMMENT '区域',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云平台表';

-- 云实例表
DROP TABLE IF EXISTS `cloud_instance`;
CREATE TABLE `cloud_instance` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `platform_id` BIGINT(20) NOT NULL COMMENT '云平台ID',
    `instance_id` VARCHAR(100) NOT NULL COMMENT '实例ID',
    `instance_name` VARCHAR(100) DEFAULT NULL COMMENT '实例名称',
    `instance_type` VARCHAR(50) DEFAULT NULL COMMENT '实例类型',
    `cpu` INT DEFAULT NULL COMMENT 'CPU核数',
    `memory` INT DEFAULT NULL COMMENT '内存(GB)',
    `disk` INT DEFAULT NULL COMMENT '磁盘(GB)',
    `os_type` VARCHAR(50) DEFAULT NULL COMMENT '操作系统',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `status` VARCHAR(20) DEFAULT 'running' COMMENT '状态：running,stopped,terminated',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_platform_id` (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云实例表';

-- 云资源表
DROP TABLE IF EXISTS `cloud_resource`;
CREATE TABLE `cloud_resource` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `platform_id` BIGINT(20) NOT NULL COMMENT '云平台ID',
    `resource_type` VARCHAR(50) NOT NULL COMMENT '资源类型：storage,network,database',
    `resource_name` VARCHAR(100) NOT NULL COMMENT '资源名称',
    `resource_id` VARCHAR(100) DEFAULT NULL COMMENT '资源ID',
    `capacity` VARCHAR(50) DEFAULT NULL COMMENT '容量',
    `usage` VARCHAR(50) DEFAULT NULL COMMENT '使用量',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_platform_id` (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云资源表';

-- ====================================
-- 2. 运维管理模块
-- ====================================

-- 运维工具表
DROP TABLE IF EXISTS `ops_tool`;
CREATE TABLE `ops_tool` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `tool_name` VARCHAR(100) NOT NULL COMMENT '工具名称',
    `tool_type` VARCHAR(50) NOT NULL COMMENT '工具类型：ssh,ftp,telnet,script',
    `tool_path` VARCHAR(200) DEFAULT NULL COMMENT '工具路径',
    `config` TEXT DEFAULT NULL COMMENT '配置信息(JSON)',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运维工具表';

-- 运维任务表
DROP TABLE IF EXISTS `ops_task`;
CREATE TABLE `ops_task` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `task_name` VARCHAR(100) NOT NULL COMMENT '任务名称',
    `task_type` VARCHAR(50) NOT NULL COMMENT '任务类型：deploy,backup,check,upgrade',
    `target_devices` TEXT DEFAULT NULL COMMENT '目标设备(JSON)',
    `execute_time` DATETIME DEFAULT NULL COMMENT '执行时间',
    `cron_expression` VARCHAR(100) DEFAULT NULL COMMENT 'Cron表达式',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending,running,success,failed',
    `result` TEXT DEFAULT NULL COMMENT '执行结果',
    `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运维任务表';

-- 运维脚本表
DROP TABLE IF EXISTS `ops_script`;
CREATE TABLE `ops_script` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `script_name` VARCHAR(100) NOT NULL COMMENT '脚本名称',
    `script_type` VARCHAR(50) DEFAULT 'shell' COMMENT '脚本类型：shell,python,sql',
    `script_content` TEXT NOT NULL COMMENT '脚本内容',
    `parameters` TEXT DEFAULT NULL COMMENT '参数定义(JSON)',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运维脚本表';

-- 工作流表
DROP TABLE IF EXISTS `ops_workflow`;
CREATE TABLE `ops_workflow` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `workflow_name` VARCHAR(100) NOT NULL COMMENT '工作流名称',
    `workflow_type` VARCHAR(50) DEFAULT 'approval' COMMENT '工作流类型',
    `steps` TEXT DEFAULT NULL COMMENT '步骤定义(JSON)',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流表';

-- 工单表
DROP TABLE IF EXISTS `ops_ticket`;
CREATE TABLE `ops_ticket` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `ticket_no` VARCHAR(50) NOT NULL COMMENT '工单号',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `ticket_type` VARCHAR(50) NOT NULL COMMENT '工单类型：incident,change,problem',
    `priority` VARCHAR(20) DEFAULT 'medium' COMMENT '优先级：low,medium,high,urgent',
    `status` VARCHAR(20) DEFAULT 'open' COMMENT '状态：open,processing,closed',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `submitter` VARCHAR(50) DEFAULT NULL COMMENT '提交人',
    `assignee` VARCHAR(50) DEFAULT NULL COMMENT '处理人',
    `submit_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    `close_time` DATETIME DEFAULT NULL COMMENT '关闭时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ticket_no` (`ticket_no`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- ====================================
-- 3. 日志管理模块
-- ====================================

-- 系统日志表
DROP TABLE IF EXISTS `system_log`;
CREATE TABLE `system_log` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `log_level` VARCHAR(20) DEFAULT 'info' COMMENT '日志级别：debug,info,warn,error',
    `log_type` VARCHAR(50) DEFAULT NULL COMMENT '日志类型',
    `module` VARCHAR(50) DEFAULT NULL COMMENT '模块',
    `message` TEXT DEFAULT NULL COMMENT '日志消息',
    `stack_trace` TEXT DEFAULT NULL COMMENT '堆栈信息',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_log_level` (`log_level`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

-- 操作日志表
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `operation` VARCHAR(100) NOT NULL COMMENT '操作',
    `method` VARCHAR(200) DEFAULT NULL COMMENT '方法名',
    `params` TEXT DEFAULT NULL COMMENT '参数',
    `result` TEXT DEFAULT NULL COMMENT '结果',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `execution_time` BIGINT DEFAULT NULL COMMENT '执行时间(ms)',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0-失败, 1-成功',
    `error_msg` TEXT DEFAULT NULL COMMENT '错误信息',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_username` (`username`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ====================================
-- 4. 统计报表模块
-- ====================================

-- 报表模板表
DROP TABLE IF EXISTS `report_template`;
CREATE TABLE `report_template` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `template_name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `report_type` VARCHAR(50) NOT NULL COMMENT '报表类型：device,alert,performance',
    `sql_query` TEXT DEFAULT NULL COMMENT 'SQL查询',
    `chart_type` VARCHAR(50) DEFAULT NULL COMMENT '图表类型：line,bar,pie',
    `chart_config` TEXT DEFAULT NULL COMMENT '图表配置(JSON)',
    `schedule` VARCHAR(50) DEFAULT NULL COMMENT '生成计划：daily,weekly,monthly',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表模板表';

-- 报表数据表
DROP TABLE IF EXISTS `report_data`;
CREATE TABLE `report_data` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `template_id` BIGINT(20) NOT NULL COMMENT '模板ID',
    `report_name` VARCHAR(100) NOT NULL COMMENT '报表名称',
    `data_content` LONGTEXT DEFAULT NULL COMMENT '报表数据(JSON)',
    `file_path` VARCHAR(200) DEFAULT NULL COMMENT '文件路径',
    `generate_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
    PRIMARY KEY (`id`),
    KEY `idx_template_id` (`template_id`),
    KEY `idx_generate_time` (`generate_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报表数据表';

-- ====================================
-- 5. 智能预测模块
-- ====================================

-- 预测模型表（设备+指标组合）
DROP TABLE IF EXISTS `prediction_model`;
CREATE TABLE `prediction_model` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `service_id` BIGINT(20) NOT NULL COMMENT '服务ID',
    `device_category` VARCHAR(100) NOT NULL COMMENT '设备小类',
    `monitoring_type` VARCHAR(50) NOT NULL COMMENT '监控类型',
    `monitoring_metric` VARCHAR(100) NOT NULL COMMENT '监控指标',
    `model_version` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态: 1-启用, 0-停用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_prediction_model_service_id` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预测模型表（设备+指标组合）';

-- 预测结果表
DROP TABLE IF EXISTS `prediction_result`;
CREATE TABLE `prediction_result` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `model_id` BIGINT(20) NOT NULL COMMENT '模型ID',
    `device_id` BIGINT(20) DEFAULT NULL COMMENT '设备ID',
    `metric_name` VARCHAR(50) NOT NULL COMMENT '指标名称',
    `predicted_value` DECIMAL(10,2) NOT NULL COMMENT '预测值',
    `actual_value` DECIMAL(10,2) DEFAULT NULL COMMENT '实际值',
    `confidence` DECIMAL(5,2) DEFAULT NULL COMMENT '置信度(%)',
    `prediction_time` DATETIME DEFAULT NULL COMMENT '预测时间',
    `target_time` DATETIME DEFAULT NULL COMMENT '目标时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_model_id` (`model_id`),
    KEY `idx_device_id` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预测结果表';

-- ====================================
-- 6. 视频管理模块
-- ====================================

-- 摄像头表
DROP TABLE IF EXISTS `video_camera`;
CREATE TABLE `video_camera` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `camera_name` VARCHAR(100) NOT NULL COMMENT '摄像头名称',
    `camera_code` VARCHAR(50) NOT NULL COMMENT '摄像头编号',
    `camera_type` VARCHAR(50) DEFAULT 'network' COMMENT '摄像头类型',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `port` INT DEFAULT 554 COMMENT '端口',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `password` VARCHAR(100) DEFAULT NULL COMMENT '密码',
    `stream_url` VARCHAR(200) DEFAULT NULL COMMENT '视频流地址',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '安装位置',
    `status` VARCHAR(20) DEFAULT 'online' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_camera_code` (`camera_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='摄像头表';

-- 录像记录表
DROP TABLE IF EXISTS `video_record`;
CREATE TABLE `video_record` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `camera_id` BIGINT(20) NOT NULL COMMENT '摄像头ID',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
    `duration` INT DEFAULT NULL COMMENT '时长(秒)',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_camera_id` (`camera_id`),
    KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='录像记录表';

-- ====================================
-- 7. 其他模块
-- ====================================

-- 自定义视图表
DROP TABLE IF EXISTS `custom_view`;
CREATE TABLE `custom_view` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
    `view_name` VARCHAR(100) NOT NULL COMMENT '视图名称',
    `view_type` VARCHAR(50) DEFAULT 'dashboard' COMMENT '视图类型',
    `layout_config` TEXT DEFAULT NULL COMMENT '布局配置(JSON)',
    `widgets` TEXT DEFAULT NULL COMMENT '组件配置(JSON)',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='自定义视图表';

-- 对接配置表
DROP TABLE IF EXISTS `integration_config`;
CREATE TABLE `integration_config` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `system_name` VARCHAR(100) NOT NULL COMMENT '系统名称',
    `system_type` VARCHAR(50) NOT NULL COMMENT '系统类型',
    `api_url` VARCHAR(200) DEFAULT NULL COMMENT 'API地址',
    `api_key` VARCHAR(200) DEFAULT NULL COMMENT 'API密钥',
    `api_secret` VARCHAR(200) DEFAULT NULL COMMENT 'API密钥',
    `sync_interval` INT DEFAULT 300 COMMENT '同步间隔(秒)',
    `sync_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用同步',
    `config_data` TEXT DEFAULT NULL COMMENT '配置数据(JSON)',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `last_sync_time` DATETIME DEFAULT NULL COMMENT '最后同步时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对接配置表';

-- 系统配置表
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT DEFAULT NULL COMMENT '配置值',
    `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '配置分类',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `is_system` TINYINT(1) DEFAULT 0 COMMENT '是否系统配置',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 业务关系表
DROP TABLE IF EXISTS `business_relation`;
CREATE TABLE `business_relation` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `source_business_id` BIGINT(20) NOT NULL COMMENT '源业务ID',
    `target_business_id` BIGINT(20) NOT NULL COMMENT '目标业务ID',
    `relation_type` VARCHAR(50) DEFAULT 'depend' COMMENT '关系类型：depend,invoke,contain',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_source_business` (`source_business_id`),
    KEY `idx_target_business` (`target_business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务关系表';

-- 仪表板统计表
DROP TABLE IF EXISTS `dashboard_statistics`;
CREATE TABLE `dashboard_statistics` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `stat_date` DATE NOT NULL COMMENT '统计日期',
    `total_devices` INT DEFAULT 0 COMMENT '设备总数',
    `online_devices` INT DEFAULT 0 COMMENT '在线设备数',
    `total_alerts` INT DEFAULT 0 COMMENT '告警总数',
    `critical_alerts` INT DEFAULT 0 COMMENT '严重告警数',
    `avg_cpu_usage` DECIMAL(5,2) DEFAULT 0.00 COMMENT '平均CPU使用率',
    `avg_memory_usage` DECIMAL(5,2) DEFAULT 0.00 COMMENT '平均内存使用率',
    `network_traffic` BIGINT DEFAULT 0 COMMENT '网络流量(字节)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仪表板统计表';

-- ====================================
-- 初始化数据
-- ====================================

-- 系统配置初始化
INSERT INTO `system_config` (`config_key`, `config_value`, `category`, `description`) VALUES
('system.name', 'AI运维平台', 'system', '系统名称'),
('system.version', '1.0.0', 'system', '系统版本'),
('alert.notify.enabled', 'true', 'alert', '是否启用告警通知'),
('report.auto.generate', 'true', 'report', '是否自动生成报表');

-- 运维工具初始化
INSERT INTO `ops_tool` (`tool_name`, `tool_type`, `description`) VALUES
('SSH终端', 'ssh', 'SSH远程终端工具'),
('文件传输', 'ftp', '文件上传下载工具'),
('脚本执行', 'script', '批量脚本执行工具');
