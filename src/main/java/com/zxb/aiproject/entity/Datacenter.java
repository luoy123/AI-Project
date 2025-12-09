package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 数据中心/机房实体
 */
@Data
@TableName("datacenter")
public class Datacenter implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 机房名称
     */
    private String name;

    /**
     * 机房编码
     */
    private String code;

    /**
     * 地址
     */
    private String address;

    /**
     * 面积(平方米)
     */
    private BigDecimal area;

    /**
     * 楼层数
     */
    private Integer floorCount;

    /**
     * 机柜总数
     */
    private Integer cabinetCount;

    /**
     * 电力容量(kW)
     */
    private BigDecimal powerCapacity;

    /**
     * 制冷容量(kW)
     */
    private BigDecimal coolingCapacity;

    /**
     * 状态
     */
    private String status;

    /**
     * 负责人
     */
    private String manager;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
