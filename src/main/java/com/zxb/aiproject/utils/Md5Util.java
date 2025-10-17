package com.zxb.aiproject.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Slf4j
@Component
public class Md5Util {

    //盐值：增强安全性
    private static final String SALT = "AI_project_2024";

    //1。盐值加密算法

    /**
     * 1.判空和构建盐值字符串
     * 2.获取md5实例对象
     * 3.计算摘要
     * 4.遍历字节数组（固定为16个字节）转变成每个字节都变成2个16进制数，在进行拼接。
     * 5.返回结构，和进行异常处理。
     * @param str
     * @return
     */
    public static String encrypt(String  str){
        if(str == null || str.isEmpty()){
            return null;
        }
        //1.加盐
        String saltedStr = str + SALT;
        //2.获取md5实例对象
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(saltedStr.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for(byte b : digest){
                String hex = Integer.toHexString(b & 0xff);
                if(hex.length() == 1){
                    sb.append("0");
                }
                sb.append(hex);
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("MD5加密失败",e);
            throw new RuntimeException(e);
        }

    }

    /**
     *  盐值不加密：和上面的区别就是不和盐值进行拼接
     */
    public static String encryptWithoutSalt(String str){
        if(str == null || str.isEmpty()){
            return null;
        }

        //2.获取md5实例对象
        MessageDigest md = null;
        try {
            md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(str.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for(byte b : digest){
                String s = Integer.toHexString(b & 0xff);
                if(s.length()  == 1){
                    sb.append("0");
                }
                sb.append(s);
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("加密失败",e);
            throw new RuntimeException(e);
        }

    }

    /**
     * 验证密码
     * @param rawPassWord
     * @param encryptPassWord
     * @return
     */
    public static boolean verify(String rawPassWord,String encryptPassWord){
        if(rawPassWord == null || encryptPassWord == null){
            return false;
        }
        String encrypt = encrypt(rawPassWord);
        return encrypt.equals(encryptPassWord);
    }

    /**
     * 多次加密
     * @param str
     * @param times
     * @return
     */
    public static String encryptMultiple(String str,int times){
        if(str == null || str.isEmpty()){
            return null;
        }
        String result = str;
        for(int i = 0; i < times; i++){
            result = encrypt(result);
        }
        return result;
    }

}
