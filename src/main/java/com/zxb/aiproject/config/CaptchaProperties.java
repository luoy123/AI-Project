package com.zxb.aiproject.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "captcha")
public class CaptchaProperties {
    private Boolean enabled = true;
    private String type = "math";
    private Integer length = 4;
    private Integer expireTime = 120;
}
