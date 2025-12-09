package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 机柜实体
 */
@Data
@TableName("datacenter_cabinet")
public class DatacenterCabinet implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 数据中心ID
     */
    private Long datacenterId;

    /**
     * 机柜编号
     */
    private String cabinetNumber;

    /**
     * 行号
     */
    private String rowNumber;

    /**
     * 列号
     */
    private String columnNumber;

    /**
     * U位数量
     */
    private Integer uCount;

    /**
     * 已使用U位
     */
    private Integer usedU;

    /**
     * 电力容量(kW)
     */
    private BigDecimal powerCapacity;

    /**
     * 电力使用(kW)
     */
    private BigDecimal powerUsage;

    /**
     * 状态
     */
    private String status;

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
