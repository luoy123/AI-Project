# 文件上传目录

此目录用于存储用户上传的文件（包括头像等）。

## 目录结构

```
upload/
└── yyyy/MM/dd/          # 按日期分目录
    └── [UUID].ext       # 随机UUID文件名
```

## 访问方式

- **API路径**: `/api/upload/yyyy/MM/dd/[filename]`
- **示例**: `http://localhost:1234/api/upload/2025/12/09/abc123.jpg`

## 注意事项

1. 此目录会自动创建，无需手动创建
2. 文件按日期分目录存储，便于管理
3. 此目录已在 .gitignore 中配置，不会提交到版本控制
4. 部署到新环境时，应用会自动创建此目录

## 配置

在 `application.yml` 中配置：

```yaml
file:
  upload-path: ./upload/
  max-size: 10485760  # 10MB
```

- `upload-path`: 相对路径，相对于应用运行目录
- `max-size`: 最大文件大小（字节）
