package com.zxb.aiproject.utils;

import com.zxb.aiproject.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 密码验证工具类
 * 根据系统配置验证密码强度
 */
@Component
public class PasswordValidator {

    @Autowired
    private SystemConfigService systemConfigService;

    /**
     * 验证密码是否符合安全策略
     * @param password 密码
     * @return 验证结果消息，null表示验证通过
     */
    public String validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            return "密码不能为空";
        }

        // 获取配置
        Integer minLength = systemConfigService.getIntegerValue("security.minPasswordLength", 10);
        Integer maxLength = systemConfigService.getIntegerValue("security.maxPasswordLength", 16);
        Boolean requireUppercase = systemConfigService.getBooleanValue("security.requireUppercase", true);
        Boolean requireLowercase = systemConfigService.getBooleanValue("security.requireLowercase", true);
        Boolean requireNumber = systemConfigService.getBooleanValue("security.requireNumber", true);
        Boolean requireSpecialChar = systemConfigService.getBooleanValue("security.requireSpecialChar", true);

        // 验证长度
        if (password.length() < minLength) {
            return "密码长度不能少于" + minLength + "位";
        }
        if (password.length() > maxLength) {
            return "密码长度不能超过" + maxLength + "位";
        }

        // 统计需要满足的条件
        List<String> missingRequirements = new ArrayList<>();
        int satisfiedCount = 0;

        // 验证大写字母
        if (requireUppercase) {
            if (Pattern.compile("[A-Z]").matcher(password).find()) {
                satisfiedCount++;
            } else {
                missingRequirements.add("大写字母");
            }
        }

        // 验证小写字母
        if (requireLowercase) {
            if (Pattern.compile("[a-z]").matcher(password).find()) {
                satisfiedCount++;
            } else {
                missingRequirements.add("小写字母");
            }
        }

        // 验证数字
        if (requireNumber) {
            if (Pattern.compile("[0-9]").matcher(password).find()) {
                satisfiedCount++;
            } else {
                missingRequirements.add("数字");
            }
        }

        // 验证特殊字符
        if (requireSpecialChar) {
            if (Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]").matcher(password).find()) {
                satisfiedCount++;
            } else {
                missingRequirements.add("特殊字符");
            }
        }

        // 至少需要满足两项
        int requiredCount = 0;
        if (requireUppercase) requiredCount++;
        if (requireLowercase) requiredCount++;
        if (requireNumber) requiredCount++;
        if (requireSpecialChar) requiredCount++;

        if (satisfiedCount < Math.min(2, requiredCount)) {
            return "密码必须包含至少两种类型的字符，缺少：" + String.join("、", missingRequirements);
        }

        return null; // 验证通过
    }

    /**
     * 检查密码是否过期
     * @param passwordUpdatedAt 密码更新时间
     * @return true表示已过期
     */
    public boolean isPasswordExpired(java.util.Date passwordUpdatedAt) {
        if (passwordUpdatedAt == null) {
            return false;
        }

        Boolean enablePasswordExpiry = systemConfigService.getBooleanValue("security.enablePasswordExpiry", false);
        if (!enablePasswordExpiry) {
            return false;
        }

        Integer expiryDays = systemConfigService.getIntegerValue("security.passwordExpiryDays", 30);
        
        // 计算过期日期
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        calendar.setTime(passwordUpdatedAt);
        calendar.add(java.util.Calendar.DAY_OF_MONTH, expiryDays);
        java.util.Date expiryDate = calendar.getTime();
        
        // 检查是否已过期
        return new java.util.Date().after(expiryDate);
    }
}
