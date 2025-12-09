package com.zxb.aiproject.dto;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 用户-用户组关联DTO
 */
@Data
public class UserGroupRelationDto {

    /**
     * 用户组ID
     */
    @NotNull(message = "用户组ID不能为空")
    private Long groupId;

    /**
     * 用户ID列表
     */
    @NotEmpty(message = "用户ID列表不能为空")
    private List<Long> userIds;
}
