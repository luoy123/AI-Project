# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-project (AIOps Platform) is a Spring Boot-based intelligent operations management system for IT infrastructure. It provides comprehensive monitoring, alerting, asset management, log analysis, network management, and predictive analytics capabilities.

**Tech Stack:**
- Spring Boot 2.6.13 + Java 8
- MyBatis-Plus 3.5.3.1 for ORM
- MySQL 8.0.33 database
- Redis for caching and session management
- JWT for authentication
- Knife4j (Swagger) for API documentation
- Thymeleaf for server-side rendering

## Build and Run Commands

### Development
```bash
# Build the project
mvn clean package

# Run the application
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Run specific test class
mvn test -Dtest=YourTestClass

# Skip tests during build
mvn clean package -DskipTests
```

### Application Access
- **Server Port:** 1234
- **Context Path:** `/api`
- **Base URL:** `http://localhost:1234/api`
- **API Documentation:** `http://localhost:1234/doc.html` (Knife4j UI)
- **Static Resources:** Served from `src/main/resources/static/`

### Database
- **Database:** `aiops_db`
- **Connection:** `jdbc:mysql://localhost:3306/aiops_db`
- **Credentials:** Configured in `application.yml`
- **SQL Scripts:** Located in `src/main/resources/sql/` and `sql/` directories

## Architecture Overview

### Multi-Package Structure
The application uses **dual package scanning** to support modular architecture:
- `com.zxb.aiproject.*` - Main application package
- `com.aiops.*` - Extended/plugin modules

Both packages are scanned for components and mappers (see `AiProjectApplication.java:7-8`).

### Authentication Flow
Authentication is handled through a **custom JWT interceptor** rather than Spring Security filters:

1. **Spring Security** ([SecurityConfig.java](src/main/java/com/zxb/aiproject/config/SecurityConfig.java)) - Only provides `PasswordEncoder` bean, all requests bypass Security filters
2. **JWT Interceptor** ([JwtInterceptor.java](src/main/java/com/zxb/aiproject/interceptor/JwtInterceptor.java)) - Handles actual authentication:
   - Intercepts all `/api/**` requests
   - Validates JWT tokens from `Authorization: Bearer <token>` header or `?token=` query param
   - Stores username in request attributes for controller access
   - Returns 401 with JSON error for unauthorized requests

3. **Excluded Paths** ([WebConfig.java:62-68](src/main/java/com/zxb/aiproject/config/WebConfig.java#L62-L68)):
   - `/api/user/login`
   - `/api/user/captcha`
   - `/api/user/verify-admin-password`

### Layer Architecture

**Standard Three-Layer Pattern:**
```
Controller → Service → Mapper → Database
     ↓          ↓         ↓
    DTO      Entity    XML
```

**Key Patterns:**
- **Controllers** return `Result<T>` wrapper (see `com.zxb.aiproject.common.result.Result`)
- **Services** use MyBatis-Plus `ServiceImpl<Mapper, Entity>` base class
- **Mappers** extend `BaseMapper<Entity>` with custom XML for complex queries
- **Entities** use MyBatis-Plus annotations (`@TableName`, `@TableId`, `@TableLogic`)
- **DTOs** separate request/response models from entities

### MyBatis-Plus Configuration

**Important Settings** ([application.yml:55-67](src/main/resources/application.yml#L55-L67)):
- **Mapper Locations:** `classpath*:/mapper/**/*.xml`
- **Type Aliases:** `com.zxb.aiproject.entity`
- **Logical Delete:** `deleted` field (1=deleted, 0=active)
- **ID Strategy:** Auto-increment
- **Camel Case:** Enabled for column mapping
- **SQL Logging:** Stdout (development mode)

**Auto-Fill Fields** ([MyMetaObjectHandler.java](src/main/java/com/zxb/aiproject/config/MyMetaObjectHandler.java)):
- `createTime` - Auto-filled on insert
- `updateTime` - Auto-filled on insert/update

### Static Resources and File Upload

**File Upload Configuration:**
- Upload path: `E:/modern-blog/AI-project2/upload/` (configurable in `application.yml`)
- Max size: 10MB
- Access URLs: `/upload/**` or `/api/upload/**`
- Handler: [FileUploadController.java](src/main/java/com/zxb/aiproject/controller/FileUploadController.java)

**Static Resources:**
- Location: `src/main/resources/static/`
- Cache disabled in development (period: 0)
- Includes HTML pages, JS, CSS, and frontend assets

### Date/Time Handling

**Jackson Configuration** ([application.yml:38-42](src/main/resources/application.yml#L38-L42)):
- Format: `yyyy-MM-dd HH:mm:ss`
- Timezone: `GMT+8`
- Null handling: Exclude null fields from JSON

**Custom Converter** ([WebConfig.java:31-54](src/main/java/com/zxb/aiproject/config/WebConfig.java#L31-L54)):
- Supports ISO format: `2025-10-22T00:00:00`
- Supports standard format: `2025-10-22 00:00:00`
- Used for request parameter binding

## Key Domain Modules

### 1. Alert Management
- **Controllers:** `AlertController`
- **Entities:** `alert`, `alert_rule`, `alert_contact`
- Real-time monitoring and alerting system

### 2. Asset Management
- **Controllers:** `AssetController`
- **Entities:** `asset`, `asset_category`
- **Views:** `v_asset_*` (multiple statistics views)
- IT asset lifecycle management with category hierarchy

### 3. Business Management
- **Controllers:** `BusinessController`, `BusinessComponentController`, `BusinessQueryController`
- **Entities:** `business`, `business_component`, `component_dependencies`
- Business service topology and dependency mapping

### 4. Device Management
- **Controllers:** `DeviceController`, `DeviceConfigController`, `ViewDeviceController`
- **Entities:** `device_snapshot`, `device_config_backup`, `device_version_history`
- Network device configuration and version control

### 5. Log Management
- **Controllers:** `LogController`, `LogControllerSimple`, `SyslogMatchController`
- **Entities:** `t_log_syslog`, `t_log_snmptrap`, `t_log_events`, `t_log_rules`
- Centralized log collection and analysis with rule-based matching

### 6. Network Management
- **Controllers:** `NetworkDeviceController`, `NetworkLineController`, `NetworkConfigController`
- **Entities:** `network_line`, `line_performance`
- Network topology and performance monitoring

### 7. Operations Ticketing
- **Controllers:** `OpsTicketController`, `TicketImportController`, `TicketPriorityController`, `TicketTypeController`, `TicketSourceController`
- **Entities:** `ops_ticket`, `ticket_priority`, `ticket_type`, `ticket_source`, `ticket_upload_history`
- IT service desk with Excel import/export (EasyExcel)

### 8. Predictive Analytics
- **Controllers:** `PredictionController`
- **Entities:** `prediction_*` (9 tables for ML/AI features)
- AI-powered predictive maintenance and anomaly detection

### 9. User Management
- **Controllers:** `UserController`, `UserGroupController`
- **Entities:** `sys_user`, `sys_role`, `sys_permission`, `sys_user_group`
- RBAC with user groups and role-based permissions

### 10. Datacenter Management
- **Controllers:** `DatacenterController`
- Physical datacenter and cabinet management

## Database Schema Notes

### View Naming Convention
Views use `v_` prefix for aggregated/computed data:
- `v_asset_device_unified` - Unified asset-device view
- `v_asset_statistics` - Asset statistics
- `v_business_component_stats` - Business component metrics
- `v_warranty_expiring_assets` - Warranty expiration tracking

### Table Prefixes
- `sys_*` - System/admin tables (users, roles, permissions)
- `t_log_*` - Log-related tables
- `prediction_*` - AI/ML prediction tables
- No prefix - Domain entity tables

## Common Development Patterns

### Adding a New API Endpoint

1. **Create Entity** (if new table):
```java
@Data
@TableName("your_table")
public class YourEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```

2. **Create Mapper**:
```java
@Mapper
public interface YourMapper extends BaseMapper<YourEntity> {
    // Custom queries in XML if needed
}
```

3. **Create Service**:
```java
@Service
public class YourServiceImpl extends ServiceImpl<YourMapper, YourEntity> implements YourService {
    // Business logic
}
```

4. **Create Controller**:
```java
@RestController
@RequestMapping("/your-module")
@Api(tags = "Your Module")
public class YourController {
    @Autowired
    private YourService yourService;

    @GetMapping("/list")
    @ApiOperation("List items")
    public Result<List<YourEntity>> list() {
        return Result.success(yourService.list());
    }
}
```

### Exception Handling
Global exception handler: [GlobalExceptionHandler.java](src/main/java/com/zxb/aiproject/common/exception/ClobalExceptionHandler.java)
- Catches `BusinessException` and returns structured error response
- Use `throw new BusinessException(ResultCode.XXX)` for business errors

### Adding JWT-Protected Endpoints
By default, all `/api/**` endpoints require JWT authentication. To exclude:
1. Add path to `WebConfig.addInterceptors()` exclusion list
2. Restart application

### Working with SQL Scripts
- **Schema changes:** Add to `src/main/resources/sql/`
- **Test data:** Use `insert-*-data.sql` naming convention
- **Migrations:** No formal migration tool; apply scripts manually to database

## Configuration Files

### application.yml
Main configuration file with sections for:
- Server (port, context-path)
- Database (MySQL connection pool)
- Redis (caching)
- JWT (secret, expiration)
- File upload (path, size limits)
- MyBatis-Plus (mapper locations, logical delete)
- Logging (levels, file output)

### pom.xml
Key dependencies:
- Spring Boot 2.6.13
- MyBatis-Plus 3.5.3.1
- MySQL 8.0.33
- JWT (java-jwt 4.4.0)
- Hutool utilities 5.8.20
- Knife4j 3.0.3
- EasyExcel 3.3.2
- FastJSON2 2.0.32

## Testing

### Database Testing
Use MCP MySQL service to query database:
```bash
# Connect to database (credentials from application.yml)
# List tables
# Query data
```

### API Testing
- **Knife4j UI:** `http://localhost:1234/doc.html`
- **Test files:** `playwright-tests/` directory contains E2E tests
- **Manual testing:** Use test HTML files in `src/main/resources/static/test-*.html`

## Logging

**Configuration** ([application.yml:94-103](src/main/resources/application.yml#L94-L103)):
- Console: Formatted with timestamp, thread, level, logger
- File: `logs/aiops.log` (10MB max, 30 days retention)
- Debug level for `com.aiops` and Spring Security

**MyBatis SQL Logging:**
- Enabled via `log-impl: org.apache.ibatis.logging.stdout.StdOutImpl`
- Prints all SQL statements to console (development only)

## Important Notes

### Security Considerations
- JWT secret is in `application.yml` - should be externalized for production
- Database credentials in config file - use environment variables in production
- CSRF disabled for REST API
- CORS allows all origins in development

### Performance
- Redis caching configured but usage depends on service implementation
- HikariCP connection pool: 5-20 connections
- Static resource caching disabled in development
- MyBatis cache disabled

### Multi-Module Support
The application supports plugin-style modules via dual package scanning. New modules can be added under `com.aiops.*` without modifying core application code.
