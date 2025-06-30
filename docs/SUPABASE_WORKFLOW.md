# Supabase 数据迁移工作流程

## 概述

本项目现在支持两种数据源：
1. **JSON 文件**（默认）- 适用于开发和简单部署
2. **Supabase 数据库** - 适用于生产环境的可扩展解决方案

## 快速开始

### 1. 设置 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 创建新项目
2. 记录以下信息：
   - Project URL
   - Anon Key (公开密钥)
   - Service Key (服务密钥，仅用于数据迁移)

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的 Supabase 配置
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # 仅用于数据迁移
```

### 3. 创建数据库表结构

#### 方法 A：使用 SQL 编辑器（推荐）

1. 打开 Supabase 控制台的 SQL 编辑器
2. 复制 `supabase/schema.sql` 的内容
3. 执行 SQL 脚本

#### 方法 B：使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 执行数据库迁移
supabase db push
```

### 4. 导入数据

我们提供了两种数据导入方式：

#### 方法 A：使用 SQL 文件（推荐用于一次性导入）

```bash
# 生成 SQL 导入文件
npm run supabase:sql

# 这会生成 supabase/data-import.sql 文件
# 包含所有数据的批量插入语句
```

然后在 Supabase SQL 编辑器中执行生成的 SQL 文件。

#### 方法 B：使用 TypeScript 迁移脚本（适用于增量更新）

```bash
# 运行迁移脚本
npm run supabase:migrate

# 需要设置 SUPABASE_SERVICE_KEY 环境变量
```

### 5. 启动应用

```bash
# 使用 Supabase 作为数据源
npm run supabase:dev

# 或者构建生产版本
npm run supabase:build
```

## 数据统计

当前数据集包含：
- 📦 10 个主分类，39 个子分类
- 🏷️ 1,517 个唯一标签
- 🖥️ 1,842 个 MCP 服务器
- 🔗 5,526 个服务器-标签关系
- 🚀 3,684 个部署配置项

## 切换数据源

通过环境变量控制数据源：

```bash
# 使用 JSON 文件（默认）
VITE_USE_SUPABASE=false npm run dev

# 使用 Supabase 数据库
VITE_USE_SUPABASE=true npm run dev
```

## 项目结构

```
mcp-db/
├── supabase/
│   ├── schema.sql         # 数据库表结构
│   └── data-import.sql    # 批量导入 SQL（生成的）
├── scripts/
│   ├── json-to-sql.ts     # JSON 转 SQL 脚本
│   └── migrate-to-supabase.ts  # API 迁移脚本
├── src/
│   ├── lib/
│   │   └── supabase.ts    # Supabase 客户端配置
│   └── hooks/
│       ├── useData.ts     # JSON 数据 hooks
│       ├── useSupabaseData.ts  # Supabase 数据 hooks
│       └── useUnifiedData.ts   # 统一数据接口
└── .env.example           # 环境变量示例
```

## 优势

### Supabase 的优势
- ✅ **实时更新** - 数据变更立即反映
- ✅ **高级搜索** - PostgreSQL 全文搜索
- ✅ **可扩展性** - 轻松处理大量数据
- ✅ **性能优化** - 数据库索引和缓存
- ✅ **安全性** - 行级安全策略 (RLS)

### 保持向后兼容
- ✅ JSON 文件仍然可用
- ✅ 无需修改组件代码
- ✅ 统一的数据接口
- ✅ 轻松切换数据源

## 故障排除

### 常见问题

1. **数据导入失败**
   - 确保数据库表已创建
   - 检查 Service Key 是否正确
   - 查看 SQL 错误信息

2. **应用无法连接**
   - 验证环境变量设置
   - 确保 URL 和 Anon Key 正确
   - 检查网络连接

3. **性能问题**
   - 检查数据库索引
   - 使用 Supabase 控制台监控查询
   - 启用查询优化

### 调试模式

```javascript
// 在浏览器控制台启用调试
localStorage.setItem('supabase.debug', 'true');
```

## 下一步

- 📊 添加实时数据更新功能
- 🔍 实现高级搜索功能
- 📈 添加数据分析仪表板
- 🔒 实现用户认证和权限管理

## 支持

- Supabase 文档：https://supabase.com/docs
- 项目问题：提交 GitHub Issue
- 社区支持：Supabase Discord