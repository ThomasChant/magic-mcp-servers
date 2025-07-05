# Vercel SSR 部署指南

本项目支持在 Vercel 上进行服务端渲染（SSR）部署。

## 部署步骤

1. **确保代码已提交到 Git**
   ```bash
   git add .
   git commit -m "feat: 添加 Vercel SSR 支持"
   git push
   ```

2. **在 Vercel 中导入项目**
   - 访问 https://vercel.com/new
   - 导入您的 Git 仓库
   - Vercel 会自动检测配置

3. **环境变量配置**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NODE_ENV=production
   ```

## 技术实现

### SSR 配置
- **API 路由**: `/api/ssr.js` 处理所有页面请求
- **构建命令**: `npm run build` 构建客户端和服务端代码
- **静态资源**: 通过 CDN 服务，带有长期缓存头

### 性能优化
1. **页面缓存**: 
   - 服务器页面缓存 1 小时
   - 分类页面缓存 24 小时
   - 静态资源永久缓存

2. **Edge 缓存**: 使用 `stale-while-revalidate` 策略

3. **函数配置**: 
   - 最大执行时间: 30 秒
   - 自动扩展

### 文件结构
```
/api
  └── ssr.js          # Vercel SSR 函数
/dist
  ├── client/         # 客户端构建文件
  └── server/         # 服务端构建文件
vercel.json           # Vercel 配置
```

## 切换回 SPA 模式

如果需要切换回单页应用（SPA）模式：

1. 修改 `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build:client",
     "outputDirectory": "dist/client",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. 删除 `/api` 目录

## 调试

### 本地测试 SSR
```bash
npm run build
npm run serve
```

### 查看 Vercel 函数日志
访问 Vercel 控制台的 Functions 标签页查看实时日志。

## 注意事项

1. **Clerk 认证**: SSR 模式下，Clerk 只在客户端初始化
2. **环境变量**: 确保所有 `VITE_` 前缀的变量在构建时可用
3. **动态导入**: 某些组件可能需要使用动态导入以避免 SSR 错误

## Edge Runtime 选项（实验性）

如果需要更好的性能，可以使用 Edge Runtime：

1. 修改 `vercel.json` 中的 rewrite：
   ```json
   {
     "source": "/(.*)",
     "destination": "/api/ssr-edge"
   }
   ```

2. Edge Runtime 限制：
   - 不支持 Node.js API
   - 需要轻量级的 SSR 实现
   - 更快的冷启动时间

## 常见问题

### Q: 部署失败，提示找不到模块
A: 确保 `npm install --force` 在 `vercel.json` 中配置

### Q: SSR 页面没有 SEO 数据
A: 检查 `entry-server.tsx` 中的 SEO 数据生成逻辑

### Q: 静态资源 404
A: 确保构建输出目录结构正确，检查 rewrites 配置

### Q: 如何选择 Node.js Runtime 还是 Edge Runtime？
A: 
- **Node.js Runtime** (`/api/ssr.js`): 完整的 SSR 功能，支持所有 Node.js API
- **Edge Runtime** (`/api/ssr-edge.js`): 更快的响应时间，但功能有限