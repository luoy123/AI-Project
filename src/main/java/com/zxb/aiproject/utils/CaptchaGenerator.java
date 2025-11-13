package com.zxb.aiproject.utils;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.LineCaptcha;
import cn.hutool.captcha.generator.MathGenerator;
import cn.hutool.core.util.IdUtil;
import com.zxb.aiproject.config.CaptchaProperties;
import com.zxb.aiproject.vo.CaptchaVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class CaptchaGenerator {

    @Autowired
    private CaptchaProperties captchaProperties;

    @Autowired
    private RedisTemplate<String,String> redisTemplate;

    private static final String CAPTCHA_KEY_PREFIX = "captcha:";

    /**
     * 生成验证码
     */
    public CaptchaVO generateCaptcha() {
        try {
            log.info("开始生成验证码，类型={}", captchaProperties.getType());
            
            //生成验证码
            String key = IdUtil.simpleUUID();

            LineCaptcha lineCaptcha;
            String code;
            if("math".equals(captchaProperties.getType())){
                //数字运算验证码
                log.debug("创建数学运算验证码");
                lineCaptcha = CaptchaUtil.createLineCaptcha(120, 40);
                lineCaptcha.setGenerator(new MathGenerator());
                //对于数学运算，getCode()返回算式（如"27+88="），需要计算结果
                String mathExpr = lineCaptcha.getCode();
                log.debug("生成的数学表达式: {}", mathExpr);
                //去掉等号，计算结果
                String expr = mathExpr.replace("=", "").trim();
                //使用简单的Java代码计算表达式（避免Java版本兼容性问题）
                try {
                    code = String.valueOf(calculateMathExpression(expr));
                    log.debug("计算结果: {}", code);
                } catch (Exception e) {
                    log.error("计算验证码表达式失败: {}", mathExpr, e);
                    code = "0";
                }
            }else {
                log.debug("创建字符验证码，长度={}", captchaProperties.getLength());
                lineCaptcha = CaptchaUtil.createLineCaptcha(120, 40, captchaProperties.getLength(), captchaProperties.getLength());
                code = lineCaptcha.getCode();
            }
            log.info("生成的验证码,key={},code={}",key,code);

            //存入到redis中
            log.debug("保存验证码到Redis，key={}, 过期时间={}分钟", CAPTCHA_KEY_PREFIX + key, captchaProperties.getExpireTime());
            redisTemplate.opsForValue().set(
                    CAPTCHA_KEY_PREFIX + key,
                    code,
                    captchaProperties.getExpireTime(),
                    TimeUnit.MINUTES
            );
            log.debug("验证码已保存到Redis");

            //返回Base64编码的验证码图片
            String imageBase64 = lineCaptcha.getImageBase64Data();
            log.debug("验证码图片Base64长度: {}", imageBase64 != null ? imageBase64.length() : 0);
            
            return new CaptchaVO(key, imageBase64);
        } catch (Exception e) {
            log.error("生成验证码过程出错", e);
            throw new RuntimeException("生成验证码失败: " + e.getMessage(), e);
        }
    }

    public boolean verifyCaptcha(String key,String code){
        if(!captchaProperties.getEnabled()){
            return true;//说明没有启动验证码
        }
        String redisKey = CAPTCHA_KEY_PREFIX + key;
        String redisCode = redisTemplate.opsForValue().get(redisKey);
        log.info("redisCode:{}",redisCode);

        if(redisCode == null){
            log.warn("验证码过期：{}",key);
            return false;
        }

        //单次验证有效，验证后删除。
        redisTemplate.delete(redisKey);

        boolean result = redisCode.equalsIgnoreCase(code);
        log.info("验证码校验,key={},input={},cached={},result={}",key,code,redisCode,result);
        return result;
    }

    /**
     * 计算简单的数学表达式（仅支持加减法）
     * 例如："12+34" -> 46, "56-23" -> 33
     */
    private int calculateMathExpression(String expr) {
        // 去除空格
        expr = expr.replaceAll("\\s+", "");
        
        // 查找运算符
        if (expr.contains("+")) {
            String[] parts = expr.split("\\+");
            return Integer.parseInt(parts[0]) + Integer.parseInt(parts[1]);
        } else if (expr.contains("-")) {
            // 处理减法，需要小心负数
            int operatorIndex = expr.lastIndexOf("-");
            if (operatorIndex > 0) {
                String part1 = expr.substring(0, operatorIndex);
                String part2 = expr.substring(operatorIndex + 1);
                return Integer.parseInt(part1) - Integer.parseInt(part2);
            }
        } else if (expr.contains("*")) {
            String[] parts = expr.split("\\*");
            return Integer.parseInt(parts[0]) * Integer.parseInt(parts[1]);
        } else if (expr.contains("/")) {
            String[] parts = expr.split("/");
            return Integer.parseInt(parts[0]) / Integer.parseInt(parts[1]);
        }
        
        // 如果没有运算符，直接返回数字
        return Integer.parseInt(expr);
    }

}
