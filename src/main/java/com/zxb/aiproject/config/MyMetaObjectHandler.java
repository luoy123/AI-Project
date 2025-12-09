package com.zxb.aiproject.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * MyBatis-Plus 自动填充处理器
 * 自动填充创建时间和更新时间
 */
@Slf4j
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    /**
     * 插入时自动填充
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("开始插入填充... 实体类: {}", metaObject.getOriginalObject().getClass().getName());
        
        LocalDateTime now = LocalDateTime.now();
        Date dateNow = new Date();
        
        // 自动填充创建时间 - 支持多种字段名和类型
        this.setFieldValueByType(metaObject, "createdAt", now, dateNow);
        this.setFieldValueByType(metaObject, "createTime", now, dateNow);
        
        // 自动填充更新时间 - 支持多种字段名和类型
        this.setFieldValueByType(metaObject, "updatedAt", now, dateNow);
        this.setFieldValueByType(metaObject, "updateTime", now, dateNow);
    }

    /**
     * 更新时自动填充
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("开始更新填充... 实体类: {}", metaObject.getOriginalObject().getClass().getName());
        
        LocalDateTime now = LocalDateTime.now();
        Date dateNow = new Date();
        
        // 自动填充更新时间 - 支持多种字段名和类型，强制填充
        this.setFieldValueByType(metaObject, "updatedAt", now, dateNow);
        this.setFieldValueByType(metaObject, "updateTime", now, dateNow);
    }
    
    /**
     * 根据字段类型设置字段值：支持LocalDateTime和Date类型
     */
    private void setFieldValueByType(MetaObject metaObject, String fieldName, LocalDateTime localDateTime, Date date) {
        if (metaObject.hasSetter(fieldName)) {
            // 获取字段类型
            Class<?> fieldType = metaObject.getSetterType(fieldName);
            
            if (LocalDateTime.class.equals(fieldType)) {
                log.info("填充LocalDateTime字段: {} = {}", fieldName, localDateTime);
                metaObject.setValue(fieldName, localDateTime);
            } else if (Date.class.equals(fieldType)) {
                log.info("填充Date字段: {} = {}", fieldName, date);
                metaObject.setValue(fieldName, date);
            } else {
                log.warn("不支持的时间字段类型: {} - {}", fieldName, fieldType);
            }
        }
    }
}
