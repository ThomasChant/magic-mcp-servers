# Supabase收藏功能设置指南

## 概述

收藏功能现在直接存储在Supabase数据库中，而不是通过Clerk的用户元数据。这提供了更好的性能、可扩展性和功能特性。

## 数据库迁移

### 1. 创建收藏表

运行以下SQL脚本在Supabase中创建必要的表和策略：

```bash
# 在Supabase SQL编辑器中运行
cat supabase/migrations/create_favorites_table.sql
```

或者直接复制并执行文件中的SQL命令。

### 2. 验证表创建

确认以下表已正确创建：
- `user_favorites` - 主收藏表
- `user_favorite_servers` - 带有服务器详情的视图

### 3. 检查权限

确认RLS（行级安全）策略已正确设置：
- 任何人都可以查看收藏（用于计数）
- 任何人都可以管理收藏（使用Clerk用户ID）

## 环境变量

确保以下环境变量已正确设置：

```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 功能特性

### 基本功能
- ✅ 添加/移除收藏
- ✅ 跨设备同步（需要Clerk认证）
- ✅ 离线支持（本地存储）
- ✅ 自动数据迁移

### 高级功能
- ✅ 分类过滤
- ✅ 实时更新
- ✅ 批量操作
- ✅ 公开收藏计数

## 数据迁移

现有的本地收藏数据将在用户首次登录时自动迁移到Supabase。

### 手动迁移（可选）

如果需要手动触发迁移：

```typescript
import { migrateFavoritesToSupabase } from './src/utils/migrateFavorites';

// 在浏览器控制台中运行
const result = await migrateFavoritesToSupabase();
console.log('Migration result:', result);
```

## 测试

使用提供的测试工具验证功能：

```typescript
import { testSupabaseFavorites, logTestResults } from './src/utils/testSupabaseFavorites';

// 在浏览器控制台中运行
const testResult = await testSupabaseFavorites();
logTestResults(testResult);
```

## 故障排除

### 常见问题

1. **SQL错误：column "id" specified more than once**
   - 问题：视图创建时列名冲突
   - 快速解决：复制`QUICK_FIX.sql`内容，在Supabase SQL编辑器中运行
   - 或者运行修复脚本：
   ```sql
   -- 在Supabase SQL编辑器中运行
   \i supabase/migrations/fix_favorites_view.sql
   ```

2. **权限错误**
   - 检查RLS策略是否正确设置
   - 确认Supabase anon key有正确的权限

3. **迁移失败**
   - 检查网络连接
   - 验证Clerk用户已正确认证
   - 查看浏览器控制台错误日志

4. **同步问题**
   - 检查`useFavoritesSync` hook是否正常工作
   - 验证Clerk认证状态变化处理

### 调试

启用调试日志：

```typescript
// 在浏览器控制台中
localStorage.setItem('debug', 'favorites:*');
```

## 安全考虑

- 使用Clerk用户ID作为唯一标识符
- RLS策略防止用户访问他人的收藏
- 所有数据传输使用HTTPS
- 敏感操作需要用户认证

## 性能优化

- 使用批量操作减少数据库调用
- 实现客户端缓存减少网络请求
- 索引优化查询性能
- 分页支持大量收藏数据