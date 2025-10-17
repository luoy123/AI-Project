package com.zxb.aiproject.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Component
@Data
@ConfigurationProperties(prefix = "file")

public class FileProperties {

    private String uploadPath;

    private Long maxSize;

}
