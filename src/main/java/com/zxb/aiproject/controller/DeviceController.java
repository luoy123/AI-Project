package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.Asset;
import com.zxb.aiproject.service.AssetService;
import com.zxb.aiproject.service.AssetCategoryService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 设备管理控制器
 * 统一使用asset表作为数据源
 */
@Slf4j
@RestController
@RequestMapping("/device")
@Api(tags = "设备管理")
public class DeviceController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private AssetCategoryService assetCategoryService;

    @GetMapping("/list")
    @ApiOperation("获取设备列表")
    public Result<List<Map<String, Object>>> getDevices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        try {
            // groupId 和 categoryId 都表示分类ID
            Long effectiveCategoryId = categoryId != null ? categoryId : groupId;
            List<Asset> assets = assetService.getAssetList(effectiveCategoryId, null, status, keyword);

            // 过滤掉视频管理分类的设备（分类ID 4及其子分类15-22）
            List<Map<String, Object>> deviceList = new java.util.ArrayList<>();
            for (Asset asset : assets) {
                Long catId = asset.getCategoryId();
                // 排除视频管理分类（分类4及其子分类15-22）
                if (catId != null && (catId == 4 || (catId >= 15 && catId <= 22))) {
                    continue;
                }

                Map<String, Object> device = new java.util.HashMap<>();
                device.put("id", asset.getId());
                device.put("name", asset.getDeviceName() != null ? asset.getDeviceName() : asset.getAssetName());
                device.put("ip", asset.getIpAddress());
                device.put("status", asset.getAssetStatus() != null ? asset.getAssetStatus() : "offline");
                device.put("type", getDeviceTypeFromCategory(asset.getCategoryId()));
                device.put("groupId", asset.getCategoryId());
                device.put("categoryId", asset.getCategoryId());
                device.put("location", asset.getLocation());
                device.put("description", asset.getDescription());
                device.put("manufacturer", asset.getManufacturer());
                device.put("model", asset.getModel());
                device.put("serialNumber", asset.getSerialNumber());
                device.put("lastUpdate", asset.getUpdateTime());
                device.put("createTime", asset.getCreateTime());
                deviceList.add(device);
            }

            return Result.success(deviceList);
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
            return Result.error("获取设备列表失败");
        }
    }

    @GetMapping("/{id}")
    @ApiOperation("获取设备详情")
    public Result<Map<String, Object>> getDeviceById(@PathVariable Long id) {
        try {
            Asset asset = assetService.getAssetById(id);
            if (asset == null) {
                return Result.error("设备不存在");
            }

            Map<String, Object> device = new java.util.HashMap<>();
            device.put("id", asset.getId());
            device.put("name", asset.getDeviceName() != null ? asset.getDeviceName() : asset.getAssetName());
            device.put("ip", asset.getIpAddress());
            device.put("status", asset.getAssetStatus());
            device.put("type", getDeviceTypeFromCategory(asset.getCategoryId()));
            device.put("groupId", asset.getCategoryId());
            device.put("location", asset.getLocation());
            device.put("description", asset.getDescription());
            device.put("manufacturer", asset.getManufacturer());
            device.put("model", asset.getModel());
            device.put("serialNumber", asset.getSerialNumber());

            return Result.success(device);
        } catch (Exception e) {
            log.error("获取设备详情失败，ID: {}", id, e);
            return Result.error("获取设备详情失败");
        }
    }

    @PostMapping("/add")
    @ApiOperation("添加设备")
    public Result<String> addDevice(@RequestBody Map<String, Object> deviceData) {
        try {
            log.info("添加设备，参数：{}", deviceData);

            Asset asset = new Asset();
            asset.setDeviceName((String) deviceData.get("name"));
            asset.setAssetName((String) deviceData.get("name"));
            asset.setIpAddress((String) deviceData.get("ip"));
            asset.setAssetStatus((String) deviceData.getOrDefault("status", "offline"));
            asset.setLocation((String) deviceData.get("location"));
            asset.setDescription((String) deviceData.get("description"));
            asset.setManufacturer((String) deviceData.get("manufacturer"));
            asset.setModel((String) deviceData.get("model"));
            asset.setSerialNumber((String) deviceData.get("serialNumber"));

            // 设置分类ID
            Object categoryIdObj = deviceData.get("categoryId");
            if (categoryIdObj == null) {
                categoryIdObj = deviceData.get("groupId");
            }
            if (categoryIdObj != null) {
                asset.setCategoryId(Long.valueOf(categoryIdObj.toString()));
            }

            boolean success = assetService.addAsset(asset);
            if (success) {
                return Result.success("设备添加成功");
            } else {
                return Result.error("设备添加失败");
            }
        } catch (Exception e) {
            log.error("添加设备失败", e);
            return Result.error("添加设备失败: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    @ApiOperation("更新设备")
    public Result<String> updateDevice(@RequestBody Map<String, Object> deviceData) {
        try {
            log.info("更新设备，参数：{}", deviceData);

            Object idObj = deviceData.get("id");
            if (idObj == null) {
                return Result.error("设备ID不能为空");
            }

            Long id = Long.valueOf(idObj.toString());
            Asset asset = assetService.getAssetById(id);
            if (asset == null) {
                return Result.error("设备不存在");
            }

            // 更新字段
            if (deviceData.get("name") != null) {
                asset.setDeviceName((String) deviceData.get("name"));
                asset.setAssetName((String) deviceData.get("name"));
            }
            if (deviceData.get("ip") != null) {
                asset.setIpAddress((String) deviceData.get("ip"));
            }
            if (deviceData.get("status") != null) {
                asset.setAssetStatus((String) deviceData.get("status"));
            }
            if (deviceData.get("location") != null) {
                asset.setLocation((String) deviceData.get("location"));
            }
            if (deviceData.get("description") != null) {
                asset.setDescription((String) deviceData.get("description"));
            }
            if (deviceData.get("manufacturer") != null) {
                asset.setManufacturer((String) deviceData.get("manufacturer"));
            }
            if (deviceData.get("model") != null) {
                asset.setModel((String) deviceData.get("model"));
            }
            if (deviceData.get("categoryId") != null) {
                asset.setCategoryId(Long.valueOf(deviceData.get("categoryId").toString()));
            } else if (deviceData.get("groupId") != null) {
                asset.setCategoryId(Long.valueOf(deviceData.get("groupId").toString()));
            }

            boolean success = assetService.updateAsset(asset);
            if (success) {
                return Result.success("设备更新成功");
            } else {
                return Result.error("设备更新失败");
            }
        } catch (Exception e) {
            log.error("更新设备失败", e);
            return Result.error("更新设备失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @ApiOperation("删除设备")
    public Result<String> deleteDevice(@PathVariable Long id) {
        try {
            log.info("删除设备，ID：{}", id);
            boolean success = assetService.deleteAsset(id);
            if (success) {
                return Result.success("设备删除成功");
            } else {
                return Result.error("设备删除失败");
            }
        } catch (Exception e) {
            log.error("删除设备失败，ID: {}", id, e);
            return Result.error("删除设备失败");
        }
    }

    @DeleteMapping("/batch")
    @ApiOperation("批量删除设备")
    public Result<String> batchDeleteDevices(@RequestBody List<Long> ids) {
        try {
            log.info("批量删除设备，IDs：{}", ids);
            if (ids == null || ids.isEmpty()) {
                return Result.error("请选择要删除的设备");
            }

            boolean success = assetService.batchDeleteAssets(ids);
            if (success) {
                return Result.success("批量删除成功");
            } else {
                return Result.error("批量删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除设备失败", e);
            return Result.error("批量删除失败");
        }
    }

    @PutMapping("/{id}/status")
    @ApiOperation("更新设备状态")
    public Result<String> updateDeviceStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            log.info("更新设备状态，ID：{}，状态：{}", id, status);
            boolean success = assetService.updateAssetStatus(id, status);
            if (success) {
                return Result.success("设备状态更新成功");
            } else {
                return Result.error("设备状态更新失败");
            }
        } catch (Exception e) {
            log.error("更新设备状态失败", e);
            return Result.error("更新设备状态失败");
        }
    }

    @GetMapping("/statistics")
    @ApiOperation("获取设备统计信息")
    public Result<Map<String, Object>> getDeviceStatistics() {
        try {
            Map<String, Object> overview = assetService.getAssetOverview();

            Map<String, Object> statistics = new java.util.HashMap<>();
            statistics.put("totalCount", overview.get("totalCount"));
            statistics.put("statusCounts", overview.get("deviceStatusCounts"));
            statistics.put("typeCounts", overview.get("categoryCounts"));

            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取设备统计信息失败", e);
            return Result.error("获取设备统计信息失败");
        }
    }

    @GetMapping("/groups/tree")
    @ApiOperation("获取设备分组树")
    public Result<List<Map<String, Object>>> getDeviceGroupTree() {
        try {
            List<Map<String, Object>> tree = assetCategoryService.getDeviceCategoryTree();

            List<Map<String, Object>> deviceGroupTree = new java.util.ArrayList<>();
            for (Map<String, Object> category : tree) {
                Map<String, Object> group = new java.util.HashMap<>();
                group.put("id", category.get("id"));
                group.put("name", category.get("name") != null ? category.get("name") : category.get("categoryName"));
                group.put("icon", category.get("icon"));
                group.put("deviceCount", category.get("count"));

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> childCategories = (List<Map<String, Object>>) category.get("children");
                if (childCategories != null && !childCategories.isEmpty()) {
                    List<Map<String, Object>> children = new java.util.ArrayList<>();
                    for (Map<String, Object> childCategory : childCategories) {
                        Map<String, Object> child = new java.util.HashMap<>();
                        child.put("id", childCategory.get("id"));
                        child.put("name", childCategory.get("name") != null ? childCategory.get("name")
                                : childCategory.get("categoryName"));
                        child.put("icon", childCategory.get("icon"));
                        child.put("deviceCount", childCategory.get("count"));
                        children.add(child);
                    }
                    group.put("children", children);
                }

                deviceGroupTree.add(group);
            }

            return Result.success(deviceGroupTree);
        } catch (Exception e) {
            log.error("获取设备分组树失败", e);
            return Result.error("获取设备分组树失败");
        }
    }

    @PostMapping("/import")
    @ApiOperation("导入设备")
    public Result<Map<String, Object>> importDevices(@RequestParam("file") MultipartFile file) {
        try {
            log.info("导入设备，文件名：{}", file.getOriginalFilename());

            if (file.isEmpty()) {
                return Result.error("请选择要导入的文件");
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
                return Result.error("请上传Excel文件（.xlsx或.xls格式）");
            }

            InputStream inputStream = file.getInputStream();
            Workbook workbook;
            if (fileName.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else {
                workbook = new HSSFWorkbook(inputStream);
            }

            Sheet sheet = workbook.getSheetAt(0);
            int successCount = 0;
            int failCount = 0;
            List<String> errors = new ArrayList<>();

            // 从第2行开始读取（第1行是标题）
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    Asset asset = new Asset();

                    // 设备名称（必填）
                    Cell nameCell = row.getCell(0);
                    if (nameCell == null || getCellValue(nameCell).isEmpty()) {
                        errors.add("第" + (i + 1) + "行：设备名称不能为空");
                        failCount++;
                        continue;
                    }
                    String name = getCellValue(nameCell);
                    asset.setDeviceName(name);
                    asset.setAssetName(name);

                    // IP地址
                    Cell ipCell = row.getCell(1);
                    if (ipCell != null) {
                        asset.setIpAddress(getCellValue(ipCell));
                    }

                    // 设备类型/分类ID
                    Cell typeCell = row.getCell(2);
                    if (typeCell != null) {
                        String typeValue = getCellValue(typeCell);
                        Long categoryId = getCategoryIdFromType(typeValue);
                        asset.setCategoryId(categoryId);
                    }

                    // 状态（转换中文状态为数据库值）
                    Cell statusCell = row.getCell(3);
                    if (statusCell != null) {
                        asset.setAssetStatus(getStatusValue(getCellValue(statusCell)));
                    } else {
                        asset.setAssetStatus("offline");
                    }

                    // 位置
                    Cell locationCell = row.getCell(4);
                    if (locationCell != null) {
                        asset.setLocation(getCellValue(locationCell));
                    }

                    // 备注
                    Cell descCell = row.getCell(5);
                    if (descCell != null) {
                        asset.setDescription(getCellValue(descCell));
                    }

                    // 制造商
                    Cell manufacturerCell = row.getCell(6);
                    if (manufacturerCell != null) {
                        asset.setManufacturer(getCellValue(manufacturerCell));
                    }

                    // 型号
                    Cell modelCell = row.getCell(7);
                    if (modelCell != null) {
                        asset.setModel(getCellValue(modelCell));
                    }

                    asset.setCreateTime(LocalDateTime.now());
                    asset.setUpdateTime(LocalDateTime.now());

                    boolean success = assetService.addAsset(asset);
                    if (success) {
                        successCount++;
                    } else {
                        failCount++;
                        errors.add("第" + (i + 1) + "行：保存失败");
                    }
                } catch (Exception e) {
                    failCount++;
                    errors.add("第" + (i + 1) + "行：" + e.getMessage());
                }
            }

            workbook.close();
            inputStream.close();

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("successCount", successCount);
            result.put("failCount", failCount);
            result.put("errors", errors);

            log.info("导入完成，成功：{}，失败：{}", successCount, failCount);
            return Result.success(result);

        } catch (Exception e) {
            log.error("导入设备失败", e);
            return Result.error("导入失败：" + e.getMessage());
        }
    }

    @GetMapping("/export")
    @ApiOperation("导出设备")
    public void exportDevices(HttpServletResponse response,
            @RequestParam(required = false) Long categoryId) {
        try {
            log.info("导出设备，分类ID：{}", categoryId);

            List<Asset> assets = assetService.getAssetList(categoryId, null, null, null);

            // 过滤掉视频设备
            List<Asset> deviceAssets = new ArrayList<>();
            for (Asset asset : assets) {
                Long catId = asset.getCategoryId();
                if (catId == null || (catId != 4 && !(catId >= 15 && catId <= 22))) {
                    deviceAssets.add(asset);
                }
            }

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("设备列表");

            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] headers = { "设备名称", "IP地址", "设备类型", "状态", "位置", "备注", "制造商", "型号" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 填充数据
            int rowNum = 1;
            for (Asset asset : deviceAssets) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(asset.getDeviceName() != null ? asset.getDeviceName() : "");
                row.createCell(1).setCellValue(asset.getIpAddress() != null ? asset.getIpAddress() : "");
                row.createCell(2).setCellValue(getDeviceTypeFromCategory(asset.getCategoryId()));
                row.createCell(3).setCellValue(getStatusDisplayName(asset.getAssetStatus()));
                row.createCell(4).setCellValue(asset.getLocation() != null ? asset.getLocation() : "");
                row.createCell(5).setCellValue(asset.getDescription() != null ? asset.getDescription() : "");
                row.createCell(6).setCellValue(asset.getManufacturer() != null ? asset.getManufacturer() : "");
                row.createCell(7).setCellValue(asset.getModel() != null ? asset.getModel() : "");
            }

            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename=" +
                    URLEncoder.encode("设备列表.xlsx", "UTF-8"));

            workbook.write(response.getOutputStream());
            workbook.close();

            log.info("导出完成，共{}条记录", deviceAssets.size());

        } catch (Exception e) {
            log.error("导出设备失败", e);
        }
    }

    @GetMapping("/template")
    @ApiOperation("下载导入模板")
    public void downloadTemplate(HttpServletResponse response) {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("设备导入模板");

            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] headers = { "设备名称*", "IP地址", "设备类型", "状态", "位置", "备注", "制造商", "型号" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 添加示例数据
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("示例服务器");
            exampleRow.createCell(1).setCellValue("192.168.1.100");
            exampleRow.createCell(2).setCellValue("服务器");
            exampleRow.createCell(3).setCellValue("在线");
            exampleRow.createCell(4).setCellValue("机房A");
            exampleRow.createCell(5).setCellValue("Web服务器");
            exampleRow.createCell(6).setCellValue("Dell");
            exampleRow.createCell(7).setCellValue("PowerEdge R740");

            // 添加说明行
            Row noteRow = sheet.createRow(2);
            noteRow.createCell(0).setCellValue("【状态可选值：在线、离线、维护中】");

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename=" +
                    URLEncoder.encode("设备导入模板.xlsx", "UTF-8"));

            workbook.write(response.getOutputStream());
            workbook.close();

        } catch (Exception e) {
            log.error("下载模板失败", e);
        }
    }

    /**
     * 获取单元格的字符串值
     */
    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    /**
     * 根据类型字符串获取分类ID
     */
    private Long getCategoryIdFromType(String type) {
        if (type == null || type.isEmpty())
            return 1L;
        type = type.toLowerCase();
        switch (type) {
            case "server":
            case "服务器":
                return 5L; // Web服务器
            case "network":
            case "网络设备":
            case "switch":
            case "交换机":
                return 8L;
            case "router":
            case "路由器":
                return 9L;
            case "firewall":
            case "防火墙":
                return 10L;
            case "storage":
            case "存储":
            case "存储设备":
                return 13L;
            default:
                return 1L;
        }
    }

    /**
     * 根据资产分类ID获取设备类型
     */
    private String getDeviceTypeFromCategory(Long categoryId) {
        if (categoryId == null) {
            return "unknown";
        }

        // 服务器类别：1(父分类), 5-Web服务器, 6-数据库服务器, 7-应用服务器
        if (categoryId == 1 || (categoryId >= 5 && categoryId <= 7)) {
            return "server";
        }
        // 网络设备：2(父分类), 8-交换机, 9-路由器, 10-防火墙, 11-无线AP, 12-网关
        else if (categoryId == 2 || (categoryId >= 8 && categoryId <= 12)) {
            return "network";
        }
        // 存储设备：3(父分类), 13-NAS, 14-SAN
        else if (categoryId == 3 || (categoryId >= 13 && categoryId <= 14)) {
            return "storage";
        }

        return "other";
    }

    /**
     * 状态值转中文显示
     */
    private String getStatusDisplayName(String status) {
        if (status == null)
            return "离线";
        switch (status.toLowerCase()) {
            case "online":
            case "running":
                return "在线";
            case "offline":
            case "stopped":
                return "离线";
            case "warning":
            case "maintenance":
                return "维护中";
            default:
                return status;
        }
    }

    /**
     * 中文状态转数据库值
     */
    private String getStatusValue(String displayName) {
        if (displayName == null)
            return "offline";
        switch (displayName.trim()) {
            case "在线":
            case "online":
            case "running":
                return "online";
            case "离线":
            case "offline":
            case "stopped":
                return "offline";
            case "维护中":
            case "warning":
            case "maintenance":
                return "warning";
            default:
                return displayName.toLowerCase();
        }
    }
}
