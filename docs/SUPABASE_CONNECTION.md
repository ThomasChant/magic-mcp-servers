# Supabase 数据库连接指南

🔒 **安全提醒**: 此文档仅供配置参考，所有敏感信息（用户名、密码、主机地址）请从 Supabase 控制台获取，并通过环境变量管理。

## 环境变量配置

在使用数据库连接前，请先设置以下环境变量（在 `.env.local` 文件中）：

```env
SUPABASE_HOST=your_supabase_host
SUPABASE_PORT=5432
SUPABASE_DATABASE=postgres
SUPABASE_USER=your_username
SUPABASE_PASSWORD=your_password
```

## 连接信息

从 Supabase 控制台获取以下信息：
1. 进入项目设置 > Database
2. 找到 Connection string 部分

## 不同客户端的连接方式

### 1. JDBC 连接（Java/DBeaver/DataGrip）

JDBC URL 格式：
```
jdbc:postgresql://[HOST]:[PORT]/[DATABASE]?user=[USER]&password=[PASSWORD]
```

示例：
```
jdbc:postgresql://[YOUR_SUPABASE_HOST]:5432/postgres?user=[YOUR_USERNAME]&password=[YOUR_PASSWORD]
```

或者分开配置：
- **JDBC URL**: `jdbc:postgresql://[YOUR_SUPABASE_HOST]:5432/postgres`
- **Username**: `[YOUR_USERNAME]`
- **Password**: `[YOUR_PASSWORD]`

### 2. PostgreSQL 标准连接字符串

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

示例：
```
postgresql://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_SUPABASE_HOST]:5432/postgres
```

### 3. psql 命令行

```bash
psql -h [YOUR_SUPABASE_HOST] -p 5432 -d postgres -U [YOUR_USERNAME]
```

### 4. Node.js (pg 库)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  port: process.env.SUPABASE_PORT || 5432,
  database: process.env.SUPABASE_DATABASE || 'postgres',
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});
```

### 5. Python (psycopg2)

```python
import psycopg2
import os

conn = psycopg2.connect(
    host=os.getenv("SUPABASE_HOST"),
    port=int(os.getenv("SUPABASE_PORT", 5432)),
    database=os.getenv("SUPABASE_DATABASE", "postgres"),
    user=os.getenv("SUPABASE_USER"),
    password=os.getenv("SUPABASE_PASSWORD"),
    sslmode="require"
)
```

## DBeaver 配置步骤

1. 新建连接 > 选择 PostgreSQL
2. 在 Main 标签页填写：
   - **Server Host**: `[YOUR_SUPABASE_HOST]`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `[YOUR_USERNAME]`
   - **Password**: `[YOUR_PASSWORD]`

3. 在 SSL 标签页：
   - 勾选 **Use SSL**
   - SSL mode: **require**

4. 测试连接

## DataGrip 配置步骤

1. 新建数据源 > PostgreSQL
2. 配置：
   - **Host**: `[YOUR_SUPABASE_HOST]`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `[YOUR_USERNAME]`
   - **Password**: `[YOUR_PASSWORD]`

3. 在 SSH/SSL 标签：
   - 勾选 **Use SSL**
   - Mode: **Require**

## TablePlus 配置

1. 创建新连接 > PostgreSQL
2. 填写：
   - **Name**: Supabase MCP-DB
   - **Host**: `[YOUR_SUPABASE_HOST]`
   - **Port**: `5432`
   - **User**: `[YOUR_USERNAME]`
   - **Password**: `[YOUR_PASSWORD]`
   - **Database**: `postgres`
   - **SSL Mode**: Require

## 常见问题

### 1. SSL 连接错误
确保启用 SSL 连接，Supabase 要求使用 SSL。

### 2. 连接超时
- 检查网络连接
- 确认使用的是 Pooler 连接（端口 5432）
- 如果需要直连，使用端口 5432（Session 模式）或 6543（Transaction 模式）

### 3. 认证失败
- 确认用户名格式正确（包含项目 ID）
- 检查密码是否正确复制
- 确保没有多余的空格

### 4. JDBC URL 格式错误
- 必须以 `jdbc:postgresql://` 开头
- 参数使用 `?` 和 `&` 连接
- 或者分开配置用户名和密码

## 连接池配置

Supabase 提供两种连接模式：

1. **Session 模式**（端口 5432）
   - 适合长连接
   - 支持准备语句
   - 默认模式

2. **Transaction 模式**（端口 6543）
   - 适合短连接
   - 更高的并发性
   - 不支持准备语句

## 安全建议

1. **不要在代码中硬编码密码**
2. **使用环境变量存储敏感信息**
3. **在生产环境中限制 IP 访问**
4. **定期轮换数据库密码**
5. **使用最小权限原则**

## 测试连接

使用以下 SQL 测试连接：

```sql
-- 测试连接
SELECT current_database(), current_user, version();

-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 查看 MCP 服务器数量
SELECT COUNT(*) as total_servers FROM mcp_servers;
```