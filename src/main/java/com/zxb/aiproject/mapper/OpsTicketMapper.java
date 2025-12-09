package com.zxb.aiproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zxb.aiproject.entity.OpsTicket;
import org.apache.ibatis.annotations.*;

/**
 * 工单主表Mapper
 */
@Mapper
public interface OpsTicketMapper extends BaseMapper<OpsTicket> {

    /**
     * 分页查询工单列表
     */
    @Select("SELECT t.* " +
            "FROM ops_ticket t " +
            "WHERE t.deleted = 0 " +
            "AND (#{status} IS NULL OR t.status = #{status}) " +
            "AND (#{creatorId} IS NULL OR t.creator_id = #{creatorId}) " +
            "AND (#{assigneeId} IS NULL OR t.assignee_id = #{assigneeId}) " +
            "ORDER BY t.created_at DESC")
    IPage<OpsTicket> selectTicketPage(Page<OpsTicket> page, 
                                     @Param("status") String status,
                                     @Param("creatorId") Long creatorId,
                                     @Param("assigneeId") Long assigneeId);

    /**
     * 查询未派发工单列表（支持筛选和搜索）
     */
    @SelectProvider(type = OpsTicketSqlProvider.class, method = "selectUnassignedTickets")
    IPage<OpsTicket> selectUnassignedTickets(Page<OpsTicket> page, 
                                            @Param("creatorId") Long creatorId,
                                            @Param("typeKey") String typeKey,
                                            @Param("priorityKey") String priorityKey,
                                            @Param("createdDate") String createdDate,
                                            @Param("keyword") String keyword);
    
    /**
     * SQL提供者类
     */
    class OpsTicketSqlProvider {
        public String selectUnassignedTickets(@Param("creatorId") Long creatorId,
                                              @Param("typeKey") String typeKey,
                                              @Param("priorityKey") String priorityKey,
                                              @Param("createdDate") String createdDate,
                                              @Param("keyword") String keyword) {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT t.* FROM ops_ticket t WHERE t.deleted = 0 ");
            
            // 关键：只查询未派发的工单（assignee_id为NULL 且 状态为pending）
            sql.append("AND t.assignee_id IS NULL ");
            sql.append("AND t.status = 'pending' ");
            
            System.out.println("=== 未派发工单查询条件 ===");
            System.out.println("creatorId: " + creatorId);
            System.out.println("typeKey: " + typeKey);
            System.out.println("priorityKey: " + priorityKey);
            System.out.println("createdDate: " + createdDate);
            System.out.println("keyword: " + keyword);
            
            if (creatorId != null) {
                sql.append("AND t.creator_id = #{creatorId} ");
            }
            
            if (typeKey != null && !typeKey.isEmpty()) {
                sql.append("AND t.type_key = #{typeKey} ");
            }
            
            if (priorityKey != null && !priorityKey.isEmpty()) {
                sql.append("AND t.priority_key = #{priorityKey} ");
            }
            
            if (createdDate != null && !createdDate.isEmpty()) {
                sql.append("AND DATE(t.created_at) = #{createdDate} ");
            }
            
            if (keyword != null && !keyword.isEmpty()) {
                sql.append("AND (t.title LIKE CONCAT('%', #{keyword}, '%') ");
                sql.append("OR t.description LIKE CONCAT('%', #{keyword}, '%') ");
                sql.append("OR t.ticket_no LIKE CONCAT('%', #{keyword}, '%')) ");
            }
            
            sql.append("ORDER BY t.created_at DESC");
            
            String finalSql = sql.toString();
            System.out.println("生成的SQL: " + finalSql);
            System.out.println("预期结果: 只显示 assignee_id IS NULL 且 status = 'pending' 的工单");
            System.out.println("========================");
            
            return finalSql;
        }
    }

    /**
     * 查询我的工单列表（显示所有分配给我的工单，支持筛选）
     */
    @Select("<script>" +
            "SELECT t.* " +
            "FROM ops_ticket t " +
            "WHERE t.assignee_id = #{assigneeId} " +
            "AND t.deleted = 0 " +
            "<if test='status != null and status != \"\"'>" +
            "  AND t.status = #{status} " +
            "</if>" +
            "<if test='typeKey != null and typeKey != \"\"'>" +
            "  AND t.type_key = #{typeKey} " +
            "</if>" +
            "<if test='priorityKey != null and priorityKey != \"\"'>" +
            "  AND t.priority_key = #{priorityKey} " +
            "</if>" +
            "<if test='keyword != null and keyword != \"\"'>" +
            "  AND (t.title LIKE CONCAT('%', #{keyword}, '%') OR t.description LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "ORDER BY " +
            "  CASE " +
            "    WHEN t.status = 'pending' THEN 1 " +
            "    WHEN t.status = 'processing' THEN 2 " +
            "    WHEN t.status = 'resolved' THEN 3 " +
            "    WHEN t.status = 'closed' THEN 4 " +
            "    ELSE 5 " +
            "  END, " +
            "  t.created_at DESC " +
            "</script>")
    IPage<OpsTicket> selectMyTickets(Page<OpsTicket> page, 
                                     @Param("assigneeId") Long assigneeId,
                                     @Param("status") String status,
                                     @Param("typeKey") String typeKey,
                                     @Param("priorityKey") String priorityKey,
                                     @Param("keyword") String keyword);
}
