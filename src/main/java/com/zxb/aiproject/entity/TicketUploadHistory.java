package com.zxb.aiproject.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工单上传历史记录
 */
@Data
@TableName("ticket_upload_history")
public class TicketUploadHistory {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 文件名
     */
    @TableField("file_name")
    private String fileName;

    /**
     * 文件大小(字节)
     */
    @TableField("file_size")
    private Long fileSize;

    /**
     * 文件类型(excel/csv/txt)
     */
    @TableField("file_type")
    private String fileType;

    /**
     * 上传人ID
     */
    @TableField("uploader_id")
    private Long uploaderId;

    /**
     * 上传人姓名
     */
    @TableField("uploader_name")
    private String uploaderName;

    /**
     * 处理状态(processing/completed/failed)
     */
    @TableField("status")
    private String status;

    /**
     * 总记录数
     */
    @TableField("total_count")
    private Integer totalCount;

    /**
     * 成功导入数
     */
    @TableField("success_count")
    private Integer successCount;

    /**
     * 失败记录数
     */
    @TableField("fail_count")
    private Integer failCount;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;

    /**
     * 文件保存路径
     */
    @TableField("file_path")
    private String filePath;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除
     */
    @TableLogic
    @TableField("deleted")
    private Boolean deleted;
}
