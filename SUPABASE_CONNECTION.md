# Supabase 数据库连接指南

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
jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres?user=postgres.lptsvryohchbklxcyoyc&password=xgCT84482819
```

或者分开配置：
- **JDBC URL**: `jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres`
- **Username**: `postgres.lptsvryohchbklxcyoyc`
- **Password**: `xgCT84482819`

### 2. PostgreSQL 标准连接字符串

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

示例：
```
postgresql://postgres.lptsvryohchbklxcyoyc:xgCT84482819@aws-0-us-east-2.pooler.supabase.com:5432/postgres
```

### 3. psql 命令行

```bash
psql -h aws-0-us-east-2.pooler.supabase.com -p 5432 -d postgres -U postgres.lptsvryohchbklxcyoyc
```

### 4. Node.js (pg 库)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.lptsvryohchbklxcyoyc',
  password: 'xgCT84482819',
  ssl: {
    rejectUnauthorized: false
  }
});
```

### 5. Python (psycopg2)

```python
import psycopg2

conn = psycopg2.connect(
    host="aws-0-us-east-2.pooler.supabase.com",
    port=5432,
    database="postgres",
    user="postgres.lptsvryohchbklxcyoyc",
    password="xgCT84482819",
    sslmode="require"
)
```

## DBeaver 配置步骤

1. 新建连接 > 选择 PostgreSQL
2. 在 Main 标签页填写：
   - **Server Host**: `aws-0-us-east-2.pooler.supabase.com`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres.lptsvryohchbklxcyoyc`
   - **Password**: `xgCT84482819`

3. 在 SSL 标签页：
   - 勾选 **Use SSL**
   - SSL mode: **require**

4. 测试连接

## DataGrip 配置步骤

1. 新建数据源 > PostgreSQL
2. 配置：
   - **Host**: `aws-0-us-east-2.pooler.supabase.com`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres.lptsvryohchbklxcyoyc`
   - **Password**: `xgCT84482819`

3. 在 SSH/SSL 标签：
   - 勾选 **Use SSL**
   - Mode: **Require**

## TablePlus 配置

1. 创建新连接 > PostgreSQL
2. 填写：
   - **Name**: Supabase MCP-DB
   - **Host**: `aws-0-us-east-2.pooler.supabase.com`
   - **Port**: `5432`
   - **User**: `postgres.lptsvryohchbklxcyoyc`
   - **Password**: `xgCT84482819`
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