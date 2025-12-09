package com.zxb.aiproject.vo;

import lombok.Data;
import java.util.Date;

/**
 * 用户组VO
 */
@Data
public class UserGroupVO {

    /**
     * 主键ID
     */
    private Long id;

    /**
     * 用户组名称
     */
    private String groupName;

    /**
     * 用户组编码
     */
    private String groupCode;

    /**
     * 用户组描述
     */
    private String description;

    /**
     * 状态：0-禁用, 1-启用
     */
    private Integer status;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 备注
     */
    private String remark;

    /**
     * 用户数量
     */
    private Integer userCount;
}
