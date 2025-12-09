package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

/**
 * 文件上传Controller
 */
@Slf4j
@RestController
@RequestMapping("/file")
@Api(tags = "文件上传")
public class FileUploadController {

    @Value("${file.upload-path:/data/upload/}")
    private String uploadPath;

    @Value("${file.max-size:10485760}")
    private Long maxSize;

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    @ApiOperation("上传文件")
    public Result<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择要上传的文件");
        }

        if (file.getSize() > maxSize) {
            return Result.error("文件大小不能超过 " + (maxSize / 1024 / 1024) + "MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return Result.error("文件名不能为空");
        }

        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            extension = originalFilename.substring(lastDotIndex);
        }

        String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
        String datePath = new SimpleDateFormat("yyyy/MM/dd").format(new Date());
        String fullPath = uploadPath + datePath;

        try {
            Path directoryPath = Paths.get(fullPath);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            String filePath = fullPath + File.separator + newFilename;
            File destFile = new File(filePath);
            file.transferTo(destFile);

            // 返回文件访问路径（使用/api/upload路径）
            String relativePath = "/api/upload/" + datePath + "/" + newFilename;
            log.info("文件上传成功: {}", relativePath);

            return Result.success(relativePath);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 上传头像
     */
    @PostMapping("/upload/avatar")
    @ApiOperation("上传头像")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择要上传的头像");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return Result.error("只能上传图片文件");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            return Result.error("头像大小不能超过 2MB");
        }

        return uploadFile(file);
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/delete")
    @ApiOperation("删除文件")
    public Result<Boolean> deleteFile(@RequestParam String filePath) {
        try {
            String fullPath = uploadPath + filePath.replace("/upload/", "");
            File file = new File(fullPath);

            if (file.exists() && file.isFile()) {
                boolean deleted = file.delete();
                if (deleted) {
                    log.info("文件删除成功: {}", filePath);
                    return Result.success(true);
                } else {
                    return Result.error("文件删除失败");
                }
            } else {
                return Result.error("文件不存在");
            }

        } catch (Exception e) {
            log.error("文件删除失败", e);
            return Result.error("文件删除失败: " + e.getMessage());
        }
    }
}
