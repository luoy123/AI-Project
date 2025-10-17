-- ====================================
-- 第二阶段：权限管理 + 设备监控 + 告警规则
-- ====================================

USE `aiops_db`;

-- ====================================
-- 1. 权限管理模块
-- ====================================

-- 角色表
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0-禁用, 1-启用',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `permission_name` VARCHAR(50) NOT NULL COMMENT '权限名称',
    `permission_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父权限ID',
    `type` VARCHAR(20) DEFAULT 'menu' COMMENT '类型：menu-菜单, button-按钮, api-接口',
    `path` VARCHAR(200) DEFAULT NULL COMMENT '路径',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 用户角色关联表
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
    `role_id` BIGINT(20) NOT NULL COMMENT '角色ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 角色权限关联表
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `role_id` BIGINT(20) NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT(20) NOT NULL COMMENT '权限ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 登录日志表
DROP TABLE IF EXISTS `sys_login_log`;
CREATE TABLE `sys_login_log` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT '登录IP',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '登录地点',
    `browser` VARCHAR(50) DEFAULT NULL COMMENT '浏览器',
    `os` VARCHAR(50) DEFAULT NULL COMMENT '操作系统',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0-失败, 1-成功',
    `message` VARCHAR(200) DEFAULT NULL COMMENT '提示消息',
    `login_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    PRIMARY KEY (`id`),
    KEY `idx_username` (`username`),
    KEY `idx_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- ====================================
-- 2. 设备监控模块
-- ====================================

-- 设备监控数据表
DROP TABLE IF EXISTS `device_monitor`;
CREATE TABLE `device_monitor` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `device_id` BIGINT(20) NOT NULL COMMENT '设备ID',
    `cpu_usage` DECIMAL(5,2) DEFAULT NULL COMMENT 'CPU使用率(%)',
    `memory_usage` DECIMAL(5,2) DEFAULT NULL COMMENT '内存使用率(%)',
    `disk_usage` DECIMAL(5,2) DEFAULT NULL COMMENT '磁盘使用率(%)',
    `network_in` BIGINT DEFAULT NULL COMMENT '入网流量(KB/s)',
    `network_out` BIGINT DEFAULT NULL COMMENT '出网流量(KB/s)',
    `status` VARCHAR(20) DEFAULT 'normal' COMMENT '状态：normal-正常, warning-警告, error-错误',
    `collect_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '采集时间',
    PRIMARY KEY (`id`),
    KEY `idx_device_id` (`device_id`),
    KEY `idx_collect_time` (`collect_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备监控数据表';

-- 设备性能历史表
DROP TABLE IF EXISTS `device_performance`;
CREATE TABLE `device_performance` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `device_id` BIGINT(20) NOT NULL COMMENT '设备ID',
    `metric_name` VARCHAR(50) NOT NULL COMMENT '指标名称',
    `metric_value` DECIMAL(10,2) NOT NULL COMMENT '指标值',
    `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位',
    `record_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_device_metric` (`device_id`, `metric_name`),
    KEY `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备性能历史表';

-- ====================================
-- 3. 告警规则模块
-- ====================================

-- 告警规则表
DROP TABLE IF EXISTS `alert_rule`;
CREATE TABLE `alert_rule` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `device_type` VARCHAR(50) DEFAULT NULL COMMENT '设备类型',
    `metric_name` VARCHAR(50) NOT NULL COMMENT '监控指标',
    `operator` VARCHAR(20) NOT NULL COMMENT '运算符：>, <, >=, <=, ==',
    `threshold` DECIMAL(10,2) NOT NULL COMMENT '阈值',
    `severity` VARCHAR(20) NOT NULL COMMENT '告警级别：critical, warning, info',
    `duration` INT DEFAULT 60 COMMENT '持续时间(秒)',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `description` TEXT DEFAULT NULL COMMENT '规则描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_metric_name` (`metric_name`),
    KEY `idx_device_type` (`device_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警规则表';

-- 告警联系人表
DROP TABLE IF EXISTS `alert_contact`;
CREATE TABLE `alert_contact` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `wechat` VARCHAR(50) DEFAULT NULL COMMENT '微信号',
    `position` VARCHAR(50) DEFAULT NULL COMMENT '职位',
    `notify_method` VARCHAR(50) DEFAULT 'email,sms' COMMENT '通知方式：email,sms,wechat',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警联系人表';

-- 告警分组表
DROP TABLE IF EXISTS `alert_group`;
CREATE TABLE `alert_group` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `group_name` VARCHAR(100) NOT NULL COMMENT '分组名称',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `contact_ids` TEXT DEFAULT NULL COMMENT '联系人ID列表(JSON)',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警分组表';

-- ====================================
-- 初始化数据
-- ====================================

-- 初始化角色
INSERT INTO `sys_role` (`role_name`, `role_code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有所有权限'),
('管理员', 'admin', '系统管理员'),
('运维人员', 'ops', '运维操作人员'),
('普通用户', 'user', '只读用户');

-- 初始化权限（菜单）
INSERT INTO `sys_permission` (`permission_name`, `permission_code`, `parent_id`, `type`, `path`, `icon`, `sort_order`) VALUES
('系统总览', 'dashboard', NULL, 'menu', '/总览.html', 'fa-dashboard', 1),
('设备管理', 'device', NULL, 'menu', '/设备管理.html', 'fa-server', 2),
('告警中心', 'alert', NULL, 'menu', '/告警中心.html', 'fa-bell', 3),
('网络拓扑', 'topology', NULL, 'menu', '/网络拓扑.html', 'fa-project-diagram', 4),
('业务管理', 'business', NULL, 'menu', '/业务管理.html', 'fa-briefcase', 5),
('运维工具', 'ops-tools', NULL, 'menu', '/运维工具.html', 'fa-tools', 6),
('统计报表', 'report', NULL, 'menu', '/统计报表.html', 'fa-chart-bar', 7),
('系统设置', 'settings', NULL, 'menu', '/设置.html', 'fa-cog', 8);

-- 初始化用户角色关联（admin用户为管理员）
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1),  -- admin -> super_admin
(2, 4),  -- user -> user
(3, 3);  -- test -> ops

-- 初始化告警规则
INSERT INTO `alert_rule` (`rule_name`, `metric_name`, `operator`, `threshold`, `severity`, `description`) VALUES
('CPU使用率过高', 'cpu_usage', '>', 90.00, 'critical', 'CPU使用率超过90%'),
('内存使用率过高', 'memory_usage', '>', 85.00, 'warning', '内存使用率超过85%'),
('磁盘使用率过高', 'disk_usage', '>', 80.00, 'warning', '磁盘使用率超过80%'),
('网络流量异常', 'network_in', '>', 1000000.00, 'info', '入网流量超过1GB/s');

-- 初始化告警联系人
INSERT INTO `alert_contact` (`name`, `phone`, `email`, `position`) VALUES
('运维负责人', '13800138000', 'ops@example.com', '运维经理'),
('网络管理员', '13800138001', 'network@example.com', '网络工程师'),
('系统管理员', '13800138002', 'sysadmin@example.com', '系统工程师');
