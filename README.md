# MCP Hub - Model Context Protocol 服务器发现平台

🚀 **全栈AI辅助开发的现代化MCP服务器发现平台**

MCP Hub 是一个专为 Model Context Protocol (MCP) 生态系统设计的现代化服务器发现和展示平台。我们致力于为开发者提供最全面、最友好的 MCP 服务器目录，帮助您快速找到并集成适合的解决方案。

## 🌟 在线演示

**🔗 [立即体验 MCP Hub](https://magicmcp.net)** 

### 📱 快速预览
- 🏠 [首页](https://magicmcp.net) - 发现和探索MCP服务器
- 🔍 [服务器列表](https://magicmcp.net/servers) - 搜索和筛选MCP服务器
- 📁 [分类浏览](https://magicmcp.net/categories) - 按功能分类探索
- ❤️ [收藏功能](https://magicmcp.net/favorites) - 个人收藏管理
- 🌐 [多语言](https://magicmcp.net/zh-CN) - 7种语言支持

> 💡 **提示**：网站支持深色模式，点击右上角切换主题！

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-org/mcp-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ 项目特色

### 🎯 核心功能
- **全面的服务器目录**: 收录丰富的高质量 MCP 服务器，涵盖数据库、文件系统、API集成等各种功能领域
- **智能搜索与筛选**: 强大的全文搜索、多维度筛选和智能推荐系统
- **详细的服务器信息**: 每个服务器都有详细的描述、安装指南、兼容性信息和质量评分
- **用户认证与互动**: 基于Clerk的用户认证，支持收藏、评论和评分功能
- **实时数据同步**: 使用Supabase实现实时数据更新和跨设备同步

### 🎨 用户体验
- **现代化UI设计**: 精美的界面设计，支持深色模式和炫酷的宇宙背景效果
- **响应式设计**: 完美适配桌面端和移动端，随时随地浏览
- **国际化支持**: 支持7种语言（中文、英文、法文、日文、韩文、俄文、繁体中文）
- **性能优化**: 服务端分页、虚拟滚动、图片懒加载等性能优化

### 🔧 开发者友好
- **AI辅助开发**: 使用Claude AI协助开发，提供高质量的代码和最佳实践
- **现代化技术栈**: React 19、TypeScript、Tailwind CSS、Supabase
- **完整的SEO优化**: 服务端渲染、sitemap生成、meta优化
- **开源友好**: MIT许可证，完整的开发文档和测试覆盖

## 🛠️ 技术栈

### 🎨 前端技术
- **核心框架**: React 19 + TypeScript
- **构建工具**: Vite 6.0
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand (带localStorage持久化)
- **数据获取**: TanStack Query (React Query)
- **路由管理**: React Router
- **图标组件**: Lucide React
- **粒子动画**: TSParticles
- **内容渲染**: React Markdown + rehype-raw
- **国际化**: i18next + react-i18next

### 🗄️ 后端与数据
- **数据库**: Supabase (PostgreSQL)
- **认证系统**: Clerk (用户管理和认证)
- **实时功能**: Supabase Realtime
- **API接口**: Supabase REST API
- **服务端**: Express + Node.js

### 🚀 部署与运维
- **部署平台**: Vercel (简化SSR配置)
- **SEO优化**: 服务端渲染 + sitemap自动生成
- **缓存策略**: TanStack Query + Supabase缓存

### 🧪 测试与质量
- **E2E测试**: Playwright
- **单元测试**: Vitest + Testing Library
- **代码规范**: ESLint + TypeScript严格模式

## 📦 快速开始

### 🔧 前提条件

- **Node.js**: 18.0 或更高版本
- **包管理器**: npm 或 yarn
- **Git**: 用于版本控制

### 🚀 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/your-org/mcp-hub.git
cd mcp-hub
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
# 复制环境变量示例
cp .env.example .env.local

# 编辑 .env.local 文件，配置必要的环境变量
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk 认证配置
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# GitHub Token（可选，用于获取仓库统计）
GITHUB_TOKEN=your_github_token
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **打开浏览器访问** `http://localhost:3000`

### 🏗️ 构建与部署

#### 本地构建
```bash
# 标准构建
npm run build

# Vercel优化构建（推荐）
npm run build:vercel

# 预览构建结果
npm run preview
```

#### 部署到Vercel
```bash
# 一键部署
npm run build:vercel
vercel --prod
```

### 📊 数据迁移

如果你需要迁移数据到Supabase：

```bash
# 使用scripts-back中的工具脚本
cd scripts-back

# 迁移所有数据
node ts/migrate-to-supabase.ts

# 仅迁移README数据
node ts/migrate-readmes-only.ts

# 诊断连接问题
node ts/diagnose-supabase.ts
```

### 🔄 GitHub统计更新

项目支持自动更新GitHub仓库统计：

```bash
# 使用scripts-back中的工具脚本
cd scripts-back

# 更新所有仓库统计
node ts/update-github-stats.ts

# 测试GitHub API限制
node ts/test-rate-limiting.ts

# 检查GitHub统计
node ts/check-github-stats.ts
```

## 📁 项目结构

```
mcp-hub/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Home/           # 首页专用组件
│   │   │   ├── CategoryCard.tsx
│   │   │   └── FeaturedServerCard.tsx
│   │   ├── Layout/         # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── AdaptiveText.tsx    # 自适应文本组件
│   │   ├── CosmicBackground.tsx # 宇宙背景效果
│   │   ├── ServerCard.tsx      # 服务器卡片
│   │   ├── ServerComments.tsx  # 评论系统
│   │   ├── FavoriteButton.tsx  # 收藏按钮
│   │   └── SearchBar.tsx       # 搜索栏
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Servers.tsx     # 服务器列表
│   │   ├── ServerDetail.tsx # 服务器详情
│   │   ├── Categories.tsx  # 分类列表
│   │   ├── CategoryDetail.tsx # 分类详情
│   │   ├── Favorites.tsx   # 收藏页面
│   │   ├── Search.tsx      # 搜索页面
│   │   ├── Docs.tsx        # 文档页面
│   │   └── About.tsx       # 关于页面
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useUnifiedData.ts   # 统一数据获取
│   │   ├── useSupabaseData.ts  # Supabase数据
│   │   └── useFavoritesSync.ts # 收藏同步
│   ├── store/              # 状态管理
│   │   └── useAppStore.ts  # 应用状态
│   ├── services/           # 业务逻辑
│   │   └── favorites.ts    # 收藏服务
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 通用类型
│   ├── lib/                # 外部服务配置
│   │   └── supabase.ts     # Supabase客户端
│   ├── utils/              # 工具函数
│   │   └── iconMapping.ts  # 图标映射
│   ├── data/               # 静态数据（JSON模式）
│   │   ├── categories.json # 分类数据
│   │   └── servers.json    # 服务器数据
│   └── assets/             # 静态资源
├── public/                 # 公共文件
│   ├── data/               # JSON数据文件
│   └── structured_readme_data/ # 处理后的README
├── scripts/                # 构建必须脚本
│   ├── update-html-assets.js    # HTML资源更新
│   ├── generate-complete-sitemap.js # 站点地图生成
│   └── deploy-sitemaps.js       # 站点地图部署
├── scripts-back/           # 开发工具脚本
│   ├── ts/                # TypeScript工具
│   ├── python/            # Python脚本
│   ├── sql/               # 数据库脚本
│   └── config/            # 配置工具
├── supabase/              # Supabase配置
│   ├── migrations/        # 数据库迁移
│   └── schema.sql         # 数据库结构
├── tests/                 # 测试文件
│   ├── e2e/              # E2E测试
│   └── unit/             # 单元测试
├── docs/                  # 文档
│   ├── VERCEL-SIMPLIFIED-SSR.md
│   └── SUPABASE_INTEGRATION.md
├── api/                   # Vercel API函数
│   └── ssr.js            # SSR处理
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── tailwind.config.js     # Tailwind CSS配置
├── vite.config.ts         # Vite配置
├── playwright.config.ts   # Playwright配置
└── vercel.json           # Vercel部署配置
```

## 🎯 主要功能

### 🔍 服务器发现
- **智能搜索**: 支持全文搜索、标签筛选、类别过滤
- **高级筛选**: 按评分、更新时间、流行度等多维度筛选
- **服务器详情**: 详细的安装指南、兼容性信息、质量评分
- **相关推荐**: 基于用户行为的智能推荐系统

### 👤 用户功能
- **用户认证**: 基于Clerk的安全登录系统
- **收藏系统**: 跨设备同步的收藏功能
- **评论互动**: 用户评论、回复、点赞系统
- **个人中心**: 用户收藏、评论历史管理

### 🎨 界面体验
- **现代化设计**: 精美的Material Design界面
- **深色模式**: 支持自动切换和手动切换
- **炫酷特效**: 宇宙星空背景、粒子动画
- **响应式布局**: 完美适配手机、平板、桌面

### 🌐 国际化
- **多语言支持**: 7种语言完整本地化
- **自动检测**: 基于浏览器语言自动切换
- **手动切换**: 用户可手动选择语言
- **SEO优化**: 每种语言都有独立的SEO优化

### ⚡ 性能优化
- **服务端分页**: 减少数据传输，提升加载速度
- **图片懒加载**: 按需加载图片资源
- **缓存策略**: TanStack Query智能缓存
- **代码分割**: 按需加载页面组件

### 🔧 开发者特性
- **实时同步**: 基于Supabase的实时数据更新
- **API友好**: Supabase RESTful API接口
- **扩展性**: 易于添加新功能和自定义
- **类型安全**: TypeScript严格模式保证代码质量

## 🔧 开发指南

### 🚀 开发命令

```bash
# 开发服务器
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run build:vercel     # Vercel优化构建
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # 运行ESLint

# 测试（使用原生工具）
npx playwright test      # E2E测试
npx vitest               # 单元测试
npx tsc --noEmit         # TypeScript类型检查

# 站点地图生成
npm run sitemap:generate  # 生成sitemap
npm run sitemap:build     # 构建sitemap

# 开发工具（在scripts-back目录）
cd scripts-back && node debug-current-state.ts  # 调试当前状态
```

### 📝 添加新的服务器

**通过Supabase Dashboard（推荐）**：
1. 登录Supabase Dashboard
2. 在`servers`表中添加新记录
3. 填写必要字段：name, description, category_id, repository_url等
4. 系统会自动同步到前端

**通过数据迁移脚本**：
```bash
# 添加服务器数据到JSON文件
# 然后使用scripts-back中的迁移工具
cd scripts-back
node ts/migrate-to-supabase.ts
```

### 🏷️ 添加新的分类

1. 在Supabase的`categories`表中添加新分类
2. 配置多语言支持的名称和描述
3. 设置图标和颜色主题
4. 更新相关服务器的category_id

### 🎨 自定义样式

项目使用Tailwind CSS，支持完整的样式定制：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### 🔌 API集成

项目提供了完整的API接口：

```typescript
// 获取服务器列表
const { data: servers } = useServersPaginated(page, limit, sortBy, sortOrder, filters);

// 获取单个服务器
const { data: server } = useServer(serverId);

// 获取分类列表
const { data: categories } = useCategories();

// 收藏操作
const { toggleFavorite } = useFavoritesService();
```

### 🧪 测试

项目包含基本的测试配置：

```bash
# E2E测试
npx playwright test

# 单元测试
npx vitest

# 代码规范检查
npm run lint

# TypeScript类型检查
npx tsc --noEmit
```

### 📊 性能监控

项目包含基本的开发工具：

- **ESLint**: 代码质量检查
- **TypeScript**: 类型安全保证
- **Playwright**: E2E测试框架

### 🔧 调试技巧

```bash
# 启用调试模式
DEBUG=true npm run dev

# 查看数据库连接状态
npm run supabase:diagnose

# 测试GitHub API限制
npm run github:test-rate-limiting
```

## 🌐 国际化支持

项目支持完整的国际化功能：

### 🗣️ 支持的语言
- 🇺🇸 English (en) - 主要语言
- 🇨🇳 简体中文 (zh-CN) - 完整支持
- 🇹🇼 繁体中文 (zh-TW) - 完整支持
- 🇫🇷 Français (fr) - 完整支持
- 🇯🇵 日本語 (ja) - 完整支持
- 🇰🇷 한국어 (ko) - 完整支持
- 🇷🇺 Русский (ru) - 完整支持

### 🔧 国际化特性
- **自动检测**: 基于浏览器语言自动切换
- **手动切换**: 用户可在界面中手动选择语言
- **URL路由**: 支持语言前缀的URL路由 (例如: `/zh-CN/servers`)
- **SEO优化**: 每种语言都有独立的SEO元数据
- **实时切换**: 无需刷新页面即可切换语言

### 📝 添加新语言

1. **创建翻译文件**
```bash
# 创建新的语言文件
cp src/locales/en.json src/locales/de.json
```

2. **翻译内容**
```json
{
  "home": "Startseite",
  "servers": "Server",
  "categories": "Kategorien"
}
```

3. **更新语言配置**
```typescript
// src/i18n/config.ts
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  // ...
];
```

## 🤝 贡献指南

我们欢迎社区贡献！您可以：

1. 报告 Bug 或提出功能建议
2. 提交 Pull Request 改进代码
3. 添加新的 MCP 服务器到目录
4. 改进文档和翻译

### 贡献步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/introduction)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [问题反馈](https://github.com/your-org/mcp-hub/issues)
- [讨论区](https://github.com/your-org/mcp-hub/discussions)

## 📈 性能特性

项目采用现代化的性能优化方案：

### ⚡ 核心优化
- **服务端分页**: 减少数据传输量
- **组件懒加载**: 按需加载页面组件
- **图片优化**: 原生懒加载 + WebP支持
- **缓存策略**: TanStack Query智能缓存

### 🎯 SEO优化
- **服务端渲染**: 关键页面SSR支持
- **站点地图**: 自动生成sitemap.xml
- **Meta标签**: 完整的SEO meta数据
- **多语言SEO**: 7种语言的SEO优化

## 🚀 部署指南

### Vercel部署（推荐）

1. **一键部署**
```bash
# 构建Vercel优化版本
npm run build:vercel

# 部署到Vercel
vercel --prod
```

2. **环境变量配置**
在Vercel Dashboard中设置：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

3. **域名配置**
- 在Vercel中配置自定义域名
- 启用HTTPS和CDN加速
- 配置重定向规则

### 其他部署选项

**Netlify**:
```bash
# 构建
npm run build

# 部署
netlify deploy --prod --dir=dist
```

**自托管**:
```bash
# 构建
npm run build

# 使用任何静态文件服务器
serve -s dist
```

## 🤝 贡献指南

我们欢迎社区贡献！以下是参与项目的方式：

### 💡 贡献类型
- 🐛 **Bug报告**: 发现并报告问题
- 🚀 **功能建议**: 提出新功能想法
- 📝 **文档改进**: 改进项目文档
- 🌐 **翻译**: 添加或改进多语言支持
- 🎨 **UI/UX**: 改进界面设计
- 📊 **性能优化**: 提升应用性能

### 📋 贡献步骤

1. **Fork项目**
```bash
# Fork项目到你的GitHub账户
# 然后克隆到本地
git clone https://github.com/your-username/mcp-hub.git
```

2. **创建分支**
```bash
# 创建功能分支
git checkout -b feature/amazing-feature

# 或者创建修复分支
git checkout -b fix/important-bug
```

3. **开发和测试**
```bash
# 安装依赖
npm install

# 开发
npm run dev

# 测试与检查
npx playwright test      # E2E测试
npm run lint            # 代码规范
npx tsc --noEmit        # 类型检查
```

4. **提交更改**
```bash
# 提交更改
git add .
git commit -m "feat: add amazing feature"

# 推送到GitHub
git push origin feature/amazing-feature
```

5. **创建Pull Request**
- 在GitHub上创建Pull Request
- 详细描述你的更改
- 确保所有测试通过
- 等待代码审查

### 📝 提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

```bash
# 功能
git commit -m "feat: add user authentication"

# 修复
git commit -m "fix: resolve search pagination issue"

# 文档
git commit -m "docs: update README with new features"

# 性能
git commit -m "perf: optimize server list loading"
```

## 📞 联系我们

### 💬 社区交流
- 💬 **GitHub Discussions**: [讨论区](https://github.com/your-org/mcp-hub/discussions)
- 🐛 **Bug Reports**: [Issues](https://github.com/your-org/mcp-hub/issues)
- 💡 **Feature Requests**: [Issues](https://github.com/your-org/mcp-hub/issues)

### 📧 联系方式
- 📧 **Email**: hello@mcphub.dev
- 🐦 **Twitter**: [@mcphub_dev](https://twitter.com/mcphub_dev)
- 📱 **Discord**: [加入我们的Discord社区](https://discord.gg/mcp-hub)

### 🔗 相关链接

- 🌐 **在线演示**: [MCP Hub 演示](https://your-mcp-hub-demo.vercel.app)
- 📖 **项目文档**: [GitHub Repo](https://github.com/your-org/mcp-hub)
- 🚀 **一键部署**: [Deploy to Vercel](https://vercel.com/import/project?template=https://github.com/your-org/mcp-hub)
- 📘 **MCP 官方文档**: [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- 🎯 **Awesome MCP**: [优秀MCP服务器集合](https://github.com/punkpeye/awesome-mcp-servers)

### 🌟 支持项目

如果这个项目对你有帮助，请考虑：
- ⭐ 给项目一个Star
- 🔄 分享给其他开发者
- 💝 成为项目贡献者
- ☕ [请我们喝杯咖啡](https://buymeacoffee.com/mcphub)

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

### 🎉 特别感谢

- 💙 **Claude AI**: 协助开发和代码优化
- 🚀 **Vercel**: 提供优秀的部署平台
- 🗄️ **Supabase**: 提供强大的后端服务
- 🔐 **Clerk**: 提供安全的用户认证
- 🎨 **Tailwind CSS**: 提供优秀的CSS框架
- 👥 **开源社区**: 感谢所有贡献者的支持

---

**感谢您对 MCP Hub 的关注和支持！** 🚀

*这个项目是使用AI（Claude）辅助开发的现代化Web应用的典型案例。我们相信AI将成为未来开发的重要工具，而不是替代品。*
