-- ====================================
-- 第三阶段：网络管理 + CMDB + 资产管理 + 机房管理
-- ====================================

USE `aiops_db`;

-- ====================================
-- 1. 网络管理模块
-- ====================================

-- 网段管理表
DROP TABLE IF EXISTS `network_segment`;
CREATE TABLE `network_segment` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `segment_name` VARCHAR(100) NOT NULL COMMENT '网段名称',
    `network_address` VARCHAR(50) NOT NULL COMMENT '网络地址',
    `subnet_mask` VARCHAR(50) NOT NULL COMMENT '子网掩码',
    `gateway` VARCHAR(50) DEFAULT NULL COMMENT '网关',
    `vlan_id` INT DEFAULT NULL COMMENT 'VLAN ID',
    `purpose` VARCHAR(100) DEFAULT NULL COMMENT '用途',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_network_address` (`network_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网段管理表';

-- 网络设备表
DROP TABLE IF EXISTS `network_device`;
CREATE TABLE `network_device` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `device_name` VARCHAR(100) NOT NULL COMMENT '设备名称',
    `device_type` VARCHAR(50) NOT NULL COMMENT '设备类型：switch,router,firewall',
    `ip_address` VARCHAR(50) NOT NULL COMMENT 'IP地址',
    `mac_address` VARCHAR(50) DEFAULT NULL COMMENT 'MAC地址',
    `port_count` INT DEFAULT NULL COMMENT '端口数量',
    `manufacturer` VARCHAR(100) DEFAULT NULL COMMENT '厂商',
    `model` VARCHAR(100) DEFAULT NULL COMMENT '型号',
    `firmware_version` VARCHAR(50) DEFAULT NULL COMMENT '固件版本',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '位置',
    `status` VARCHAR(20) DEFAULT 'online' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网络设备表';

-- 网络流量表
DROP TABLE IF EXISTS `network_flow`;
CREATE TABLE `network_flow` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `device_id` BIGINT(20) NOT NULL COMMENT '设备ID',
    `interface_name` VARCHAR(50) NOT NULL COMMENT '接口名称',
    `in_bytes` BIGINT DEFAULT 0 COMMENT '入流量(字节)',
    `out_bytes` BIGINT DEFAULT 0 COMMENT '出流量(字节)',
    `in_packets` BIGINT DEFAULT 0 COMMENT '入包数',
    `out_packets` BIGINT DEFAULT 0 COMMENT '出包数',
    `bandwidth_usage` DECIMAL(5,2) DEFAULT 0.00 COMMENT '带宽使用率(%)',
    `record_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_device_id` (`device_id`),
    KEY `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网络流量表';

-- 拓扑节点表
DROP TABLE IF EXISTS `topology_node`;
CREATE TABLE `topology_node` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `node_name` VARCHAR(100) NOT NULL COMMENT '节点名称',
    `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型',
    `device_id` BIGINT(20) DEFAULT NULL COMMENT '关联设备ID',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `position_x` INT DEFAULT 0 COMMENT 'X坐标',
    `position_y` INT DEFAULT 0 COMMENT 'Y坐标',
    `status` VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拓扑节点表';

-- 拓扑连接表
DROP TABLE IF EXISTS `topology_link`;
CREATE TABLE `topology_link` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `source_node_id` BIGINT(20) NOT NULL COMMENT '源节点ID',
    `target_node_id` BIGINT(20) NOT NULL COMMENT '目标节点ID',
    `link_type` VARCHAR(50) DEFAULT 'ethernet' COMMENT '连接类型',
    `bandwidth` VARCHAR(20) DEFAULT NULL COMMENT '带宽',
    `status` VARCHAR(20) DEFAULT 'up' COMMENT '状态：up,down',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_source_node` (`source_node_id`),
    KEY `idx_target_node` (`target_node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拓扑连接表';

-- 拓扑地图表
DROP TABLE IF EXISTS `topology_map`;
CREATE TABLE `topology_map` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `map_name` VARCHAR(100) NOT NULL COMMENT '地图名称',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `layout_config` TEXT DEFAULT NULL COMMENT '布局配置(JSON)',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拓扑地图表';

-- ====================================
-- 2. CMDB模块
-- ====================================

-- 配置项表
DROP TABLE IF EXISTS `cmdb_ci`;
CREATE TABLE `cmdb_ci` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `ci_name` VARCHAR(100) NOT NULL COMMENT 'CI名称',
    `ci_code` VARCHAR(100) NOT NULL COMMENT 'CI编码',
    `ci_type` VARCHAR(50) NOT NULL COMMENT 'CI类型',
    `ci_category` VARCHAR(50) DEFAULT NULL COMMENT 'CI分类',
    `status` VARCHAR(20) DEFAULT 'in_use' COMMENT '状态',
    `owner` VARCHAR(50) DEFAULT NULL COMMENT '负责人',
    `department` VARCHAR(100) DEFAULT NULL COMMENT '所属部门',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ci_code` (`ci_code`),
    KEY `idx_ci_type` (`ci_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置项表';

-- CI关系表
DROP TABLE IF EXISTS `cmdb_ci_relation`;
CREATE TABLE `cmdb_ci_relation` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `source_ci_id` BIGINT(20) NOT NULL COMMENT '源CIID',
    `target_ci_id` BIGINT(20) NOT NULL COMMENT '目标CIID',
    `relation_type` VARCHAR(50) NOT NULL COMMENT '关系类型：depend,contain,connect',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_source_ci` (`source_ci_id`),
    KEY `idx_target_ci` (`target_ci_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CI关系表';

-- CI属性表
DROP TABLE IF EXISTS `cmdb_ci_attribute`;
CREATE TABLE `cmdb_ci_attribute` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `ci_id` BIGINT(20) NOT NULL COMMENT 'CIID',
    `attribute_name` VARCHAR(100) NOT NULL COMMENT '属性名称',
    `attribute_value` TEXT DEFAULT NULL COMMENT '属性值',
    `attribute_type` VARCHAR(50) DEFAULT 'string' COMMENT '属性类型',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_ci_id` (`ci_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CI属性表';

-- ====================================
-- 3. 资产管理模块
-- ====================================

-- 资产表
DROP TABLE IF EXISTS `asset`;
CREATE TABLE `asset` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `asset_code` VARCHAR(100) NOT NULL COMMENT '资产编号',
    `asset_name` VARCHAR(100) NOT NULL COMMENT '资产名称',
    `category_id` BIGINT(20) DEFAULT NULL COMMENT '分类ID',
    `brand` VARCHAR(100) DEFAULT NULL COMMENT '品牌',
    `model` VARCHAR(100) DEFAULT NULL COMMENT '型号',
    `serial_number` VARCHAR(100) DEFAULT NULL COMMENT '序列号',
    `purchase_date` DATE DEFAULT NULL COMMENT '采购日期',
    `purchase_price` DECIMAL(10,2) DEFAULT NULL COMMENT '采购价格',
    `warranty_expire` DATE DEFAULT NULL COMMENT '保修到期日',
    `status` VARCHAR(20) DEFAULT 'in_use' COMMENT '状态：in_use,idle,scrapped',
    `owner` VARCHAR(50) DEFAULT NULL COMMENT '使用人',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '存放位置',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_asset_code` (`asset_code`),
    KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产表';

-- 资产分类表
DROP TABLE IF EXISTS `asset_category`;
CREATE TABLE `asset_category` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `category_name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父分类ID',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产分类表';

-- 维保记录表
DROP TABLE IF EXISTS `asset_maintenance`;
CREATE TABLE `asset_maintenance` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `asset_id` BIGINT(20) NOT NULL COMMENT '资产ID',
    `maintenance_type` VARCHAR(50) NOT NULL COMMENT '维保类型：repair,maintain,upgrade',
    `maintenance_date` DATE NOT NULL COMMENT '维保日期',
    `cost` DECIMAL(10,2) DEFAULT NULL COMMENT '费用',
    `vendor` VARCHAR(100) DEFAULT NULL COMMENT '服务商',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_asset_id` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维保记录表';

-- ====================================
-- 4. 机房管理模块
-- ====================================

-- 数据中心表
DROP TABLE IF EXISTS `datacenter`;
CREATE TABLE `datacenter` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(100) NOT NULL COMMENT '机房名称',
    `code` VARCHAR(50) NOT NULL COMMENT '机房编码',
    `address` VARCHAR(200) DEFAULT NULL COMMENT '地址',
    `area` DECIMAL(10,2) DEFAULT NULL COMMENT '面积(平方米)',
    `floor_count` INT DEFAULT NULL COMMENT '楼层数',
    `cabinet_count` INT DEFAULT NULL COMMENT '机柜总数',
    `power_capacity` DECIMAL(10,2) DEFAULT NULL COMMENT '电力容量(kW)',
    `cooling_capacity` DECIMAL(10,2) DEFAULT NULL COMMENT '制冷容量(kW)',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `manager` VARCHAR(50) DEFAULT NULL COMMENT '负责人',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据中心表';

-- 机柜表
DROP TABLE IF EXISTS `datacenter_cabinet`;
CREATE TABLE `datacenter_cabinet` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `datacenter_id` BIGINT(20) NOT NULL COMMENT '数据中心ID',
    `cabinet_number` VARCHAR(50) NOT NULL COMMENT '机柜编号',
    `row_number` VARCHAR(10) DEFAULT NULL COMMENT '行号',
    `column_number` VARCHAR(10) DEFAULT NULL COMMENT '列号',
    `u_count` INT DEFAULT 42 COMMENT 'U位数量',
    `used_u` INT DEFAULT 0 COMMENT '已使用U位',
    `power_capacity` DECIMAL(10,2) DEFAULT NULL COMMENT '电力容量(kW)',
    `power_usage` DECIMAL(10,2) DEFAULT 0.00 COMMENT '电力使用(kW)',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cabinet_number` (`datacenter_id`, `cabinet_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机柜表';

-- 机房电力表
DROP TABLE IF EXISTS `datacenter_power`;
CREATE TABLE `datacenter_power` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `datacenter_id` BIGINT(20) NOT NULL COMMENT '数据中心ID',
    `total_capacity` DECIMAL(10,2) NOT NULL COMMENT '总容量(kW)',
    `used_capacity` DECIMAL(10,2) DEFAULT 0.00 COMMENT '使用容量(kW)',
    `voltage` DECIMAL(10,2) DEFAULT NULL COMMENT '电压(V)',
    `record_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_datacenter_id` (`datacenter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机房电力表';

-- 机房制冷表
DROP TABLE IF EXISTS `datacenter_cooling`;
CREATE TABLE `datacenter_cooling` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `datacenter_id` BIGINT(20) NOT NULL COMMENT '数据中心ID',
    `temperature` DECIMAL(5,2) DEFAULT NULL COMMENT '温度(℃)',
    `humidity` DECIMAL(5,2) DEFAULT NULL COMMENT '湿度(%)',
    `cooling_capacity` DECIMAL(10,2) DEFAULT NULL COMMENT '制冷容量(kW)',
    `record_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_datacenter_id` (`datacenter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机房制冷表';

-- ====================================
-- 初始化数据
-- ====================================

-- 网段数据
INSERT INTO `network_segment` (`segment_name`, `network_address`, `subnet_mask`, `gateway`, `purpose`) VALUES
('内网管理段', '192.168.1.0', '255.255.255.0', '192.168.1.1', '管理网络'),
('业务网段', '10.0.0.0', '255.255.0.0', '10.0.0.1', '业务应用');

-- 资产分类
INSERT INTO `asset_category` (`category_name`, `parent_id`) VALUES
('IT设备', NULL),
('服务器', 1),
('网络设备', 1),
('存储设备', 1),
('办公设备', NULL);

-- 数据中心
INSERT INTO `datacenter` (`name`, `code`, `address`, `manager`, `phone`) VALUES
('主数据中心', 'DC01', '北京市海淀区XX路XX号', '张三', '010-12345678');
