package com.zxb.aiproject.vo;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class CaptchaVO {
    /**
     * 验证码
     */
    private String key;

    /**
     * 验证码图片
     */
    private String image;
}
