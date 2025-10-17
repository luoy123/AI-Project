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
        //生成验证码
        String key = IdUtil.simpleUUID();

        LineCaptcha lineCaptcha;
        String code;
        if("math".equals(captchaProperties.getType())){
            //数字运算验证码
            lineCaptcha = CaptchaUtil.createLineCaptcha(120, 40);
            lineCaptcha.setGenerator(new MathGenerator());
            //对于数学运算，getCode()返回算式（如"27+88="），需要计算结果
            String mathExpr = lineCaptcha.getCode();
            //去掉等号，计算结果
            code = mathExpr.replace("=", "").trim();
            //使用ScriptEngine计算表达式
            try {
                javax.script.ScriptEngineManager manager = new javax.script.ScriptEngineManager();
                javax.script.ScriptEngine engine = manager.getEngineByName("JavaScript");
                code = String.valueOf(engine.eval(code));
            } catch (Exception e) {
                log.error("计算验证码表达式失败: {}", mathExpr, e);
                code = "0";
            }
        }else {
            lineCaptcha = CaptchaUtil.createLineCaptcha(120, 40, captchaProperties.getLength(), captchaProperties.getLength());
            code = lineCaptcha.getCode();
        }
        log.info("生成的验证码,key={},code={}",key,code);

        //存入到redis中
        redisTemplate.opsForValue().set(
                CAPTCHA_KEY_PREFIX + key,
                code,
                captchaProperties.getExpireTime(),
                TimeUnit.MINUTES
        );

        //返回Base64编码的验证码图片
        return new CaptchaVO(key, lineCaptcha.getImageBase64Data());
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

}
