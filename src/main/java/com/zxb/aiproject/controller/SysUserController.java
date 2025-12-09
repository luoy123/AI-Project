package com.zxb.aiproject.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.entity.User;
import com.zxb.aiproject.mapper.UserMapper;
import com.zxb.aiproject.utils.Md5Util;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 系统用户管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/sys-user")
@CrossOrigin
public class SysUserController {

    @Autowired
    private UserMapper userMapper;

    /**
     * 获取用户列表（分页）
     */
    @GetMapping("/list")
    public Map<String, Object> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("获取用户列表: page={}, pageSize={}, keyword={}, status={}", page, pageSize, keyword, status);
            
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            
            // 关键字搜索（用户名、真实姓名、邮箱）
            if (StringUtils.hasText(keyword)) {
                queryWrapper.and(wrapper -> wrapper
                        .like(User::getUsername, keyword)
                        .or().like(User::getRealName, keyword)
                        .or().like(User::getEmail, keyword)
                        .or().like(User::getPhone, keyword));
            }
            
            // 状态筛选
            if (status != null) {
                queryWrapper.eq(User::getStatus, status);
            }
            
            // 按创建时间倒序
            queryWrapper.orderByDesc(User::getCreateTime);
            
            // 分页查询
            Page<User> pageResult = userMapper.selectPage(new Page<>(page, pageSize), queryWrapper);
            
            // 清除密码信息
            for (User user : pageResult.getRecords()) {
                user.setPassword(null);
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("list", pageResult.getRecords());
            data.put("total", pageResult.getTotal());
            data.put("page", page);
            data.put("pageSize", pageSize);
            data.put("totalPages", pageResult.getPages());
            
            result.put("code", 200);
            result.put("data", data);
            result.put("message", "获取成功");
            
        } catch (Exception e) {
            log.error("获取用户列表失败", e);
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 根据ID获取用户详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            User user = userMapper.selectById(id);
            if (user != null) {
                user.setPassword(null); // 不返回密码
                result.put("code", 200);
                result.put("data", user);
                result.put("message", "获取成功");
            } else {
                result.put("code", 404);
                result.put("message", "用户不存在");
            }
        } catch (Exception e) {
            log.error("获取用户详情失败", e);
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 新增用户
     */
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            String username = (String) params.get("username");
            String realName = (String) params.get("realName");
            String password = (String) params.get("password");
            String email = (String) params.get("email");
            String phone = (String) params.get("phone");
            String role = (String) params.get("role");
            Integer status = params.get("status") != null ? Integer.parseInt(params.get("status").toString()) : 1;
            String avatar = (String) params.get("avatar");
            
            log.info("新增用户: username={}, realName={}", username, realName);
            
            // 验证必填字段
            if (!StringUtils.hasText(username)) {
                result.put("code", 400);
                result.put("message", "用户名不能为空");
                return result;
            }
            if (!StringUtils.hasText(password)) {
                result.put("code", 400);
                result.put("message", "密码不能为空");
                return result;
            }
            
            // 检查用户名是否已存在
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getUsername, username);
            User existingUser = userMapper.selectOne(queryWrapper);
            if (existingUser != null) {
                result.put("code", 400);
                result.put("message", "用户名已存在");
                return result;
            }
            
            // 创建用户
            User user = new User();
            user.setUsername(username);
            user.setRealName(realName);
            user.setPassword(Md5Util.encrypt(password)); // MD5加密
            user.setEmail(email);
            user.setPhone(phone);
            user.setRole(role != null ? role : "user");
            user.setStatus(status);
            user.setAvatar(avatar);
            user.setCreateTime(new Date());
            user.setUpdateTime(new Date());
            user.setPasswordUpdatedAt(new Date());
            user.setDeleted(0);
            user.setLoginAttempts(0);
            
            int rows = userMapper.insert(user);
            
            if (rows > 0) {
                result.put("code", 200);
                result.put("message", "新增成功");
                result.put("data", user.getId());
            } else {
                result.put("code", 500);
                result.put("message", "新增失败");
            }
            
        } catch (Exception e) {
            log.error("新增用户失败", e);
            result.put("code", 500);
            result.put("message", "新增失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 更新用户
     */
    @PutMapping("/update/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("更新用户: id={}", id);
            
            User user = userMapper.selectById(id);
            if (user == null) {
                result.put("code", 404);
                result.put("message", "用户不存在");
                return result;
            }
            
            String username = (String) params.get("username");
            String realName = (String) params.get("realName");
            String password = (String) params.get("password");
            String email = (String) params.get("email");
            String phone = (String) params.get("phone");
            String role = (String) params.get("role");
            Integer status = params.get("status") != null ? Integer.parseInt(params.get("status").toString()) : null;
            String avatar = (String) params.get("avatar");
            
            // 检查用户名是否被其他用户占用
            if (StringUtils.hasText(username) && !username.equals(user.getUsername())) {
                LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
                queryWrapper.eq(User::getUsername, username);
                User existingUser = userMapper.selectOne(queryWrapper);
                if (existingUser != null) {
                    result.put("code", 400);
                    result.put("message", "用户名已被占用");
                    return result;
                }
                user.setUsername(username);
            }
            
            // 更新字段
            if (StringUtils.hasText(realName)) {
                user.setRealName(realName);
            }
            if (StringUtils.hasText(password)) {
                user.setPassword(Md5Util.encrypt(password));
                user.setPasswordUpdatedAt(new Date());
            }
            if (email != null) {
                user.setEmail(email);
            }
            if (phone != null) {
                user.setPhone(phone);
            }
            if (role != null) {
                user.setRole(role);
            }
            if (status != null) {
                user.setStatus(status);
            }
            if (avatar != null) {
                user.setAvatar(avatar);
            }
            
            user.setUpdateTime(new Date());
            
            int rows = userMapper.updateById(user);
            
            if (rows > 0) {
                result.put("code", 200);
                result.put("message", "更新成功");
            } else {
                result.put("code", 500);
                result.put("message", "更新失败");
            }
            
        } catch (Exception e) {
            log.error("更新用户失败", e);
            result.put("code", 500);
            result.put("message", "更新失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/delete/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("删除用户: id={}", id);
            
            User user = userMapper.selectById(id);
            if (user == null) {
                result.put("code", 404);
                result.put("message", "用户不存在");
                return result;
            }
            
            // 不允许删除admin用户
            if ("admin".equals(user.getUsername())) {
                result.put("code", 400);
                result.put("message", "不能删除管理员账户");
                return result;
            }
            
            // 逻辑删除
            int rows = userMapper.deleteById(id);
            
            if (rows > 0) {
                result.put("code", 200);
                result.put("message", "删除成功");
            } else {
                result.put("code", 500);
                result.put("message", "删除失败");
            }
            
        } catch (Exception e) {
            log.error("删除用户失败", e);
            result.put("code", 500);
            result.put("message", "删除失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 切换用户状态
     */
    @PutMapping("/toggle-status/{id}")
    public Map<String, Object> toggleStatus(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            User user = userMapper.selectById(id);
            if (user == null) {
                result.put("code", 404);
                result.put("message", "用户不存在");
                return result;
            }
            
            // 不允许禁用admin用户
            if ("admin".equals(user.getUsername()) && user.getStatus() == 1) {
                result.put("code", 400);
                result.put("message", "不能禁用管理员账户");
                return result;
            }
            
            // 切换状态
            user.setStatus(user.getStatus() == 1 ? 0 : 1);
            user.setUpdateTime(new Date());
            
            int rows = userMapper.updateById(user);
            
            if (rows > 0) {
                result.put("code", 200);
                result.put("message", user.getStatus() == 1 ? "启用成功" : "禁用成功");
                result.put("data", user.getStatus());
            } else {
                result.put("code", 500);
                result.put("message", "操作失败");
            }
            
        } catch (Exception e) {
            log.error("切换用户状态失败", e);
            result.put("code", 500);
            result.put("message", "操作失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 重置用户密码
     */
    @PutMapping("/reset-password/{id}")
    public Map<String, Object> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            String newPassword = params.get("password");
            
            if (!StringUtils.hasText(newPassword)) {
                result.put("code", 400);
                result.put("message", "新密码不能为空");
                return result;
            }
            
            User user = userMapper.selectById(id);
            if (user == null) {
                result.put("code", 404);
                result.put("message", "用户不存在");
                return result;
            }
            
            user.setPassword(Md5Util.encrypt(newPassword));
            user.setPasswordUpdatedAt(new Date());
            user.setUpdateTime(new Date());
            user.setLoginAttempts(0); // 重置登录失败次数
            user.setLockedUntil(null); // 解除锁定
            
            int rows = userMapper.updateById(user);
            
            if (rows > 0) {
                result.put("code", 200);
                result.put("message", "密码重置成功");
            } else {
                result.put("code", 500);
                result.put("message", "密码重置失败");
            }
            
        } catch (Exception e) {
            log.error("重置密码失败", e);
            result.put("code", 500);
            result.put("message", "重置失败：" + e.getMessage());
        }
        return result;
    }

    /**
     * 批量导入用户
     */
    @PostMapping("/import")
    public Map<String, Object> importUsers(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        
        if (file.isEmpty()) {
            result.put("code", 400);
            result.put("message", "请选择要上传的文件");
            return result;
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null) {
            result.put("code", 400);
            result.put("message", "文件名无效");
            return result;
        }
        
        try {
            List<Map<String, String>> userDataList;
            
            // 根据文件类型解析
            if (filename.endsWith(".csv")) {
                userDataList = parseCsvFile(file);
            } else if (filename.endsWith(".xlsx")) {
                userDataList = parseExcelFile(file, true);
            } else if (filename.endsWith(".xls")) {
                userDataList = parseExcelFile(file, false);
            } else {
                result.put("code", 400);
                result.put("message", "不支持的文件格式，请上传CSV或Excel文件");
                return result;
            }
            
            if (userDataList.isEmpty()) {
                result.put("code", 400);
                result.put("message", "文件中没有有效数据");
                return result;
            }
            
            // 导入用户
            int successCount = 0;
            int failCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (int i = 0; i < userDataList.size(); i++) {
                Map<String, String> userData = userDataList.get(i);
                try {
                    String importResult = importSingleUser(userData);
                    if (importResult == null) {
                        successCount++;
                    } else {
                        failCount++;
                        errors.add("第" + (i + 2) + "行: " + importResult);
                    }
                } catch (Exception e) {
                    failCount++;
                    errors.add("第" + (i + 2) + "行: " + e.getMessage());
                }
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("total", userDataList.size());
            data.put("success", successCount);
            data.put("fail", failCount);
            data.put("errors", errors.size() > 10 ? errors.subList(0, 10) : errors);
            
            result.put("code", 200);
            result.put("message", "导入完成，成功" + successCount + "条，失败" + failCount + "条");
            result.put("data", data);
            
        } catch (Exception e) {
            log.error("导入用户失败", e);
            result.put("code", 500);
            result.put("message", "导入失败：" + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 解析CSV文件
     */
    private List<Map<String, String>> parseCsvFile(MultipartFile file) throws Exception {
        List<Map<String, String>> dataList = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return dataList;
            }
            
            // 解析表头
            String[] headers = headerLine.split(",");
            Map<String, Integer> headerIndex = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                headerIndex.put(headers[i].trim().toLowerCase(), i);
            }
            
            // 解析数据行
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                String[] values = line.split(",", -1);
                Map<String, String> rowData = new HashMap<>();
                
                // 映射字段
                mapField(rowData, "username", headerIndex, values, "用户名", "username", "登录名");
                mapField(rowData, "realName", headerIndex, values, "真实姓名", "realname", "显示名称", "姓名");
                mapField(rowData, "email", headerIndex, values, "邮箱", "email");
                mapField(rowData, "phone", headerIndex, values, "手机号", "phone", "电话");
                mapField(rowData, "password", headerIndex, values, "密码", "password");
                mapField(rowData, "role", headerIndex, values, "角色", "role");
                
                if (StringUtils.hasText(rowData.get("username"))) {
                    dataList.add(rowData);
                }
            }
        }
        
        return dataList;
    }
    
    /**
     * 解析Excel文件
     */
    private List<Map<String, String>> parseExcelFile(MultipartFile file, boolean isXlsx) throws Exception {
        List<Map<String, String>> dataList = new ArrayList<>();
        
        try (Workbook workbook = isXlsx ? 
                new XSSFWorkbook(file.getInputStream()) : 
                new HSSFWorkbook(file.getInputStream())) {
            
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() < 2) {
                return dataList;
            }
            
            // 解析表头
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> headerIndex = new HashMap<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    headerIndex.put(getCellValue(cell).toLowerCase(), i);
                }
            }
            
            // 解析数据行
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Map<String, String> rowData = new HashMap<>();
                
                // 映射字段
                mapExcelField(rowData, "username", headerIndex, row, "用户名", "username", "登录名");
                mapExcelField(rowData, "realName", headerIndex, row, "真实姓名", "realname", "显示名称", "姓名");
                mapExcelField(rowData, "email", headerIndex, row, "邮箱", "email");
                mapExcelField(rowData, "phone", headerIndex, row, "手机号", "phone", "电话");
                mapExcelField(rowData, "password", headerIndex, row, "密码", "password");
                mapExcelField(rowData, "role", headerIndex, row, "角色", "role");
                
                if (StringUtils.hasText(rowData.get("username"))) {
                    dataList.add(rowData);
                }
            }
        }
        
        return dataList;
    }
    
    /**
     * 映射CSV字段
     */
    private void mapField(Map<String, String> rowData, String targetField, 
            Map<String, Integer> headerIndex, String[] values, String... possibleNames) {
        for (String name : possibleNames) {
            Integer idx = headerIndex.get(name.toLowerCase());
            if (idx != null && idx < values.length) {
                String value = values[idx].trim();
                if (StringUtils.hasText(value)) {
                    rowData.put(targetField, value);
                    return;
                }
            }
        }
    }
    
    /**
     * 映射Excel字段
     */
    private void mapExcelField(Map<String, String> rowData, String targetField,
            Map<String, Integer> headerIndex, Row row, String... possibleNames) {
        for (String name : possibleNames) {
            Integer idx = headerIndex.get(name.toLowerCase());
            if (idx != null) {
                Cell cell = row.getCell(idx);
                if (cell != null) {
                    String value = getCellValue(cell);
                    if (StringUtils.hasText(value)) {
                        rowData.put(targetField, value);
                        return;
                    }
                }
            }
        }
    }
    
    /**
     * 获取单元格值
     */
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double num = cell.getNumericCellValue();
                if (num == Math.floor(num)) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
    
    /**
     * 导入单个用户
     */
    private String importSingleUser(Map<String, String> userData) {
        String username = userData.get("username");
        String realName = userData.get("realName");
        String email = userData.get("email");
        String phone = userData.get("phone");
        String password = userData.get("password");
        String role = userData.get("role");
        
        // 验证必填字段
        if (!StringUtils.hasText(username)) {
            return "用户名不能为空";
        }
        if (!StringUtils.hasText(realName)) {
            realName = username; // 默认使用用户名作为真实姓名
        }
        
        // 检查用户名是否已存在
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        User existingUser = userMapper.selectOne(queryWrapper);
        if (existingUser != null) {
            return "用户名已存在";
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(username);
        user.setRealName(realName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(Md5Util.encrypt(StringUtils.hasText(password) ? password : "123456")); // 默认密码
        user.setRole(StringUtils.hasText(role) ? role : "user");
        user.setStatus(1);
        user.setCreateTime(new Date());
        user.setUpdateTime(new Date());
        user.setPasswordUpdatedAt(new Date());
        user.setDeleted(0);
        user.setLoginAttempts(0);
        
        int rows = userMapper.insert(user);
        return rows > 0 ? null : "保存失败";
    }
    
    /**
     * 下载导入模板
     */
    @GetMapping("/import-template")
    public void downloadTemplate(javax.servlet.http.HttpServletResponse response) {
        try {
            response.setContentType("text/csv;charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename=user_import_template.csv");
            
            // 添加BOM以支持Excel正确识别UTF-8
            response.getOutputStream().write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
            
            String template = "用户名,真实姓名,邮箱,手机号,密码,角色\n" +
                    "zhangsan,张三,zhangsan@example.com,13800138001,123456,user\n" +
                    "lisi,李四,lisi@example.com,13800138002,123456,ops\n";
            
            response.getWriter().write(template);
            response.getWriter().flush();
            
        } catch (Exception e) {
            log.error("下载模板失败", e);
        }
    }
}
