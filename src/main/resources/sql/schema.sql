-- ====================================
-- 人工智能运维平台数据库初始化脚本
-- ====================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `aiops_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `aiops_db`;

-- ====================================
-- 1. 用户表
-- ====================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色：admin-管理员, user-普通用户',
    `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0-禁用, 1-启用',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_status` (`status`),
    KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ====================================
-- 2. 设备表
-- ====================================
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL COMMENT '设备名称',
    `ip` VARCHAR(50) NOT NULL COMMENT 'IP地址',
    `type` VARCHAR(50) NOT NULL COMMENT '设备类型：server-服务器, switch-交换机, router-路由器等',
    `status` VARCHAR(20) DEFAULT 'offline' COMMENT '状态：online-在线, offline-离线, maintenance-维护中',
    `group_id` BIGINT(20) DEFAULT NULL COMMENT '分组ID',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '物理位置',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `manufacturer` VARCHAR(100) DEFAULT NULL COMMENT '厂商',
    `model` VARCHAR(100) DEFAULT NULL COMMENT '型号',
    `serial_number` VARCHAR(100) DEFAULT NULL COMMENT '序列号',
    `os_version` VARCHAR(100) DEFAULT NULL COMMENT '操作系统版本',
    `cpu_cores` INT DEFAULT NULL COMMENT 'CPU核数',
    `memory_size` INT DEFAULT NULL COMMENT '内存大小（GB）',
    `disk_size` INT DEFAULT NULL COMMENT '磁盘大小（GB）',
    `last_update` DATETIME DEFAULT NULL COMMENT '最后更新时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ip` (`ip`),
    KEY `idx_type` (`type`),
    KEY `idx_status` (`status`),
    KEY `idx_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

-- ====================================
-- 3. 设备分组表
-- ====================================
DROP TABLE IF EXISTS `device_group`;
CREATE TABLE `device_group` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL COMMENT '分组名称',
    `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父分组ID',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备分组表';

-- ====================================
-- 4. 告警表
-- ====================================
DROP TABLE IF EXISTS `alert`;
CREATE TABLE `alert` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `severity` VARCHAR(20) NOT NULL COMMENT '严重级别：critical-严重, warning-警告, info-信息',
    `message` VARCHAR(500) NOT NULL COMMENT '告警消息',
    `device_id` BIGINT(20) DEFAULT NULL COMMENT '设备ID',
    `device_name` VARCHAR(100) DEFAULT NULL COMMENT '设备名称',
    `device_type` VARCHAR(50) DEFAULT NULL COMMENT '设备类型',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-活动, acknowledged-已确认, resolved-已解决',
    `description` TEXT DEFAULT NULL COMMENT '详细描述',
    `metric_name` VARCHAR(100) DEFAULT NULL COMMENT '指标名称',
    `metric_value` VARCHAR(100) DEFAULT NULL COMMENT '指标值',
    `threshold` VARCHAR(100) DEFAULT NULL COMMENT '阈值',
    `occurred_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
    `acknowledged_time` DATETIME DEFAULT NULL COMMENT '确认时间',
    `resolved_time` DATETIME DEFAULT NULL COMMENT '解决时间',
    `acknowledged_by` VARCHAR(50) DEFAULT NULL COMMENT '确认人',
    `resolved_by` VARCHAR(50) DEFAULT NULL COMMENT '解决人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_severity` (`severity`),
    KEY `idx_status` (`status`),
    KEY `idx_device_id` (`device_id`),
    KEY `idx_occurred_time` (`occurred_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警表';

-- ====================================
-- 5. 业务管理表
-- ====================================
DROP TABLE IF EXISTS `business`;
CREATE TABLE `business` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL COMMENT '业务名称',
    `code` VARCHAR(50) NOT NULL COMMENT '业务编码',
    `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父业务ID',
    `type` VARCHAR(50) DEFAULT NULL COMMENT '业务类型',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `owner` VARCHAR(50) DEFAULT NULL COMMENT '负责人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务表';

-- ====================================
-- 6. 业务组件表
-- ====================================
DROP TABLE IF EXISTS `business_component`;
CREATE TABLE `business_component` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `business_id` BIGINT(20) NOT NULL COMMENT '业务ID',
    `name` VARCHAR(100) NOT NULL COMMENT '组件名称',
    `type` VARCHAR(50) NOT NULL COMMENT '组件类型：web-Web服务, db-数据库, cache-缓存等',
    `status` VARCHAR(20) DEFAULT 'stopped' COMMENT '状态：running-运行中, stopped-已停止, error-错误',
    `device_id` BIGINT(20) DEFAULT NULL COMMENT '所在设备ID',
    `port` INT DEFAULT NULL COMMENT '端口号',
    `version` VARCHAR(50) DEFAULT NULL COMMENT '版本',
    `config` TEXT DEFAULT NULL COMMENT '配置信息（JSON）',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_business_id` (`business_id`),
    KEY `idx_device_id` (`device_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务组件表';

-- ====================================
-- 初始化数据
-- ====================================

-- 初始化用户（密码都是：123456，加密后的BCrypt）
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/1Q2V/JWpQAa', '管理员', 'admin', 1),
('user', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/1Q2V/JWpQAa', '普通用户', 'user', 1),
('test', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE/1Q2V/JWpQAa', '测试用户', 'user', 1);

-- 初始化设备分组
INSERT INTO `device_group` (`name`, `parent_id`, `icon`, `sort_order`) VALUES
('服务器', NULL, 'fa-server', 1),
('Web服务器', 1, 'fa-globe', 1),
('数据库服务器', 1, 'fa-database', 2),
('应用服务器', 1, 'fa-cogs', 3),
('网络设备', NULL, 'fa-network-wired', 2),
('交换机', 5, 'fa-project-diagram', 1),
('路由器', 5, 'fa-route', 2),
('防火墙', 5, 'fa-shield-alt', 3),
('存储设备', NULL, 'fa-hdd', 3),
('NAS存储', 9, 'fa-archive', 1),
('SAN存储', 9, 'fa-server', 2);

-- 初始化设备
INSERT INTO `device` (`name`, `ip`, `type`, `status`, `group_id`, `location`, `description`) VALUES
('主服务器', '192.168.1.12', 'server', 'online', 2, '机房A-机柜1', '主管理服务器'),
('主交换机', '192.168.1.1', 'switch', 'online', 6, '机房A-网络区', '核心网络交换设备');

-- 初始化告警
INSERT INTO `alert` (`severity`, `message`, `device_name`, `device_type`, `status`, `description`) VALUES
('critical', '服务器CPU使用率超过90%', 'SRV-001', 'server', 'active', '服务器SRV-001的CPU使用率持续超过90%，可能影响系统性能。'),
('warning', '网络延迟异常', 'NET-002', 'network', 'acknowledged', '网络设备NET-002检测到延迟异常，平均延迟超过100ms。'),
('info', '存储空间使用率达到80%', 'STO-003', 'storage', 'resolved', '存储设备STO-003的空间使用率达到80%，建议清理或扩容。');
