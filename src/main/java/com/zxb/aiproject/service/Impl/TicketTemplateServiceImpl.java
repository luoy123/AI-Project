package com.zxb.aiproject.service.Impl;

import com.zxb.aiproject.service.TicketTemplateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 工单导入模板服务实现
 *
 * 说明：
 * - 当前前端已经内置了模板生成逻辑（在运维管理.js 中动态生成 CSV），
 *   这里提供一个最小可用的后端实现，保证 Controller 注入正常，且
 *   通过 /api/tickets/import/template/* 访问时也能下载到可用示例。
 */
@Slf4j
@Service
public class TicketTemplateServiceImpl implements TicketTemplateService {

    private static final String EXCEL_CSV_TEMPLATE = "\uFEFF" +
            "标题,描述,优先级,类型,来源,创建人,期望完成时间\n" +
            "【紧急】生产环境数据库服务器宕机,生产环境MySQL主库突然宕机所有业务系统无法访问数据库。需要立即排查原因并恢复服务。影响范围：全部生产系统,urgent,incident,system_monitor,张三,2025-11-15 10:00:00\n" +
            "CRM系统版本升级至v3.0,计划将CRM系统从v2.5升级到v3.0版本。升级时间：本周六凌晨2:00-6:00。需要提前做好数据备份和回滚预案,high,change,user_report,王五,2025-11-16 09:30:00\n" +
            "应用服务器性能优化,Web应用服务器CPU使用率长期维持在85%以上需要进行性能分析和优化。建议检查应用程序代码数据库查询缓存策略等,medium,maintenance,user_report,钱七,2025-11-20 18:00:00\n" +
            "数据库备份策略咨询,希望咨询如何制定合理的数据库备份策略包括全量备份和增量备份的时间安排备份保留周期等,low,consultation,email,周九,2025-11-25 18:00:00\n" +
            "新员工账号开通申请,新员工张三入职需要开通OA系统邮箱VPN等系统的访问权限。部门：技术部,medium,service,user_report,吴十,2025-11-18 09:00:00\n";

    private static final String TEXT_TEMPLATE = "【紧急】生产环境数据库服务器宕机\n" +
            "生产环境MySQL主库突然宕机所有业务系统无法访问数据库。需要立即排查原因并恢复服务。影响范围：全部生产系统。\n" +
            "优先级: urgent (P1紧急)\n" +
            "类型: incident (故障处理)\n" +
            "来源: system_monitor (监控系统)\n" +
            "创建人: 张三\n" +
            "期望完成时间: 2025-11-15 10:00:00\n" +
            "\n" +
            "【示例】应用服务器性能优化\n" +
            "Web应用服务器CPU使用率长期维持在85%以上，需要进行性能分析和优化。建议检查应用程序代码、数据库查询、缓存策略等。\n" +
            "优先级: medium\n" +
            "类型: maintenance\n" +
            "来源: user_report\n" +
            "创建人: 王五\n";

    @Override
    public void downloadExcelTemplate(HttpServletResponse response) throws Exception {
        // 使用 CSV 作为 Excel 可打开的模板
        writeCsvToResponse(response, EXCEL_CSV_TEMPLATE, "工单批量导入模板.csv");
    }

    @Override
    public void downloadCsvTemplate(HttpServletResponse response) throws Exception {
        writeCsvToResponse(response, EXCEL_CSV_TEMPLATE, "工单批量导入模板.csv");
    }

    @Override
    public void downloadTextTemplate(HttpServletResponse response) throws Exception {
        String fileName = "工单文本导入示例.txt";
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("text/plain;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=" +
                URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

        try (OutputStream os = response.getOutputStream()) {
            os.write(TEXT_TEMPLATE.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }
    }

    private void writeCsvToResponse(HttpServletResponse response, String content, String fileName) throws Exception {
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=" +
                URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()));

        try (OutputStream os = response.getOutputStream()) {
            os.write(content.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }
    }
}
