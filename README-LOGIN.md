# Clerk 登录功能配置指南

## 快速开始

### 1. 获取 Clerk API 密钥

1. 访问 [Clerk Dashboard](https://dashboard.clerk.dev)
2. 创建新应用或选择现有应用
3. 在 API Keys 页面复制 Publishable Key
4. 将密钥添加到 `.env.local` 文件中：

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. 配置登录提供商

在 Clerk Dashboard 中：

1. 进入 **User & Authentication** → **Social Connections**
2. 启用 Google 和 GitHub 登录：
   - **Google**: 点击配置，按照指引设置 Google OAuth 应用
   - **GitHub**: 点击配置，按照指引设置 GitHub OAuth 应用

### 3. 功能特性

✅ **已实现的功能**：
- Clerk Provider 集成
- 响应式登录按钮（桌面端和移动端）
- 用户头像和下拉菜单
- 受保护的用户资料页面
- 自动重定向未登录用户
- 支持 Google 和 GitHub 社交登录
- 深色模式支持

### 4. 页面和组件

- **登录组件**: 集成在 Header 中，支持模态框登录
- **用户资料页面**: `/profile` - 显示用户详细信息
- **保护路由**: `ProtectedRoute` 组件保护需要认证的页面
- **用户按钮**: 显示用户头像，提供账户管理选项

### 5. 使用说明

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 点击 "Sign In" 按钮
3. 选择 Google 或 GitHub 登录
4. 登录成功后可以：
   - 查看用户资料
   - 访问受保护的页面
   - 管理账户设置

### 6. 自定义样式

登录组件使用了项目的 Tailwind CSS 主题：
- 主色调：`primary-600`
- 支持深色模式
- 响应式设计

### 7. 安全考虑

- 环境变量已配置在 `.env.local` 中（不会提交到 Git）
- 使用 Clerk 的安全最佳实践
- 受保护的路由自动重定向未认证用户

### 8. 故障排除

**常见问题**：

1. **"Missing Clerk publishable key" 错误**
   - 确保 `.env.local` 文件存在并包含正确的 `VITE_CLERK_PUBLISHABLE_KEY`

2. **社交登录不工作**
   - 检查 Clerk Dashboard 中的社交连接配置
   - 确保回调 URL 正确设置

3. **开发环境配置**
   - 本地开发 URL: `http://localhost:3001`（如果 3000 端口被占用）
   - 确保在 Clerk Dashboard 中添加了正确的域名

## 技术实现细节

- **框架**: React 19 + TypeScript
- **认证**: Clerk
- **路由**: React Router v7
- **样式**: Tailwind CSS
- **构建工具**: Vite

登录功能已完全集成到现有的 MCP Hub 应用中，保持了原有的设计风格和用户体验。