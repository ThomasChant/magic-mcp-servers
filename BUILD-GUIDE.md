# 构建指南

## 构建选项

### 1. 完整构建（推荐）
```bash
npm run build
```
- 构建客户端代码
- 构建服务端 SSR 代码  
- 尝试预渲染（失败不会中断构建）

### 2. 仅 SSR 构建（跳过预渲染）
```bash
npm run build:ssr
```
- 构建客户端代码
- 构建服务端 SSR 代码
- 跳过预渲染步骤

### 3. 强制预渲染
```bash
npm run build:prerender
```
- 仅运行预渲染
- 失败会中断进程

## 常见问题

### 预渲染失败但不影响 SSR

如果看到类似错误：
```
Categories query error: {
  message: 'TypeError: fetch failed'
}
```

**原因**：
- 本地网络限制
- 防火墙/代理设置
- Supabase 连接问题

**解决方案**：
- 使用 `npm run build:ssr` 跳过预渲染
- 或使用 `npm run build`（会自动跳过失败的预渲染）

**注意**：预渲染失败不会影响生产环境的 SSR 功能。

## Vercel 部署

Vercel 部署会自动使用 `npm run build`，预渲染失败不会影响部署。

## 本地测试

```bash
# 构建
npm run build

# 启动 SSR 服务器
npm run serve
```

访问 http://localhost:5173 查看 SSR 效果。