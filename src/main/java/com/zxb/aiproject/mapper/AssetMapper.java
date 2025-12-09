package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zxb.aiproject.entity.Asset;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 资产Mapper接口
 */
@Mapper
public interface AssetMapper extends BaseMapper<Asset> {

    /**
     * 获取资产统计数据（按分类）
     */
    @Select("SELECT * FROM v_asset_statistics")
    List<Map<String, Object>> getCategoryStatistics();

    /**
     * 获取即将到期保修的资产
     */
    @Select("SELECT * FROM v_warranty_expiring")
    List<Map<String, Object>> getWarrantyExpiringAssets();
}
