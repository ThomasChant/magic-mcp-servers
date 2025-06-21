# MCP Hub - Model Context Protocol 服务器发现平台

MCP Hub 是一个专为 Model Context Protocol (MCP) 生态系统设计的服务器发现和展示平台。我们致力于为开发者提供最全面、最友好的 MCP 服务器目录，帮助您快速找到并集成适合的解决方案。

## 🚀 项目特色

- **全面的服务器目录**: 收录最全面的 MCP 服务器集合，涵盖数据库、文件系统、API集成等各种功能领域
- **智能搜索与筛选**: 强大的搜索功能和多维度筛选，帮助您快速找到所需的服务器
- **详细的服务器信息**: 每个服务器都有详细的描述、安装指南、兼容性信息和质量评分
- **响应式设计**: 完美适配桌面端和移动端，随时随地浏览
- **社区驱动**: 开放的平台，鼓励社区贡献和分享优质服务器

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **图标**: Lucide React
- **路由**: React Router

## 📦 安装与运行

### 前提条件

- Node.js 16.0 或更高版本
- npm 或 yarn

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/your-org/mcp-hub.git
cd mcp-hub/mcp-hub-react
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

## 📁 项目结构

```
mcp-hub-react/
├── src/
│   ├── components/          # 可复用组件
│   │   └── Layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Servers.tsx     # 服务器列表
│   │   ├── ServerDetail.tsx # 服务器详情
│   │   ├── Categories.tsx  # 分类列表
│   │   ├── CategoryDetail.tsx # 分类详情
│   │   ├── Docs.tsx        # 文档页面
│   │   └── About.tsx       # 关于页面
│   ├── hooks/              # 自定义 Hooks
│   │   └── useData.ts      # 数据获取 Hooks
│   ├── store/              # 状态管理
│   │   └── useAppStore.ts  # 应用状态
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 通用类型
│   ├── data/               # 静态数据
│   │   ├── categories.json # 分类数据
│   │   └── servers.json    # 服务器数据
│   └── assets/             # 静态资源
├── public/                 # 公共文件
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.js     # Tailwind CSS 配置
└── vite.config.ts         # Vite 配置
```

## 🎯 主要功能

### 服务器发现
- 浏览所有可用的 MCP 服务器
- 按分类筛选服务器
- 搜索特定功能的服务器
- 查看服务器的详细信息和使用指南

### 分类管理
- 按功能领域组织服务器
- 支持多级分类结构
- 每个分类都有详细的描述和服务器统计

### 用户体验
- 响应式设计，支持各种设备
- 直观的用户界面
- 快速的搜索和筛选功能
- 详细的服务器信息展示

## 🔧 开发指南

### 添加新的服务器

1. 编辑 `src/data/servers.json` 文件
2. 按照现有格式添加服务器信息
3. 确保包含所有必要字段：名称、描述、分类、仓库信息等

### 添加新的分类

1. 编辑 `src/data/categories.json` 文件
2. 添加新的分类定义，包括多语言支持
3. 更新相关服务器的分类字段

### 自定义样式

项目使用 Tailwind CSS，您可以：
- 修改 `tailwind.config.js` 来定制主题
- 在 `src/index.css` 中添加全局样式
- 使用 Tailwind 的实用类进行样式定制

## 🌐 国际化支持

项目设计了国际化架构，当前支持中文，未来计划支持：
- 英语 (en)
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 法语 (fr)
- 日语 (ja)
- 韩语 (ko)
- 俄语 (ru)

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

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 📧 Email: hello@mcphub.dev
- 💬 GitHub Discussions: [讨论区](https://github.com/your-org/mcp-hub/discussions)
- 🐛 Bug Reports: [Issues](https://github.com/your-org/mcp-hub/issues)

---

感谢您对 MCP Hub 的关注和支持！🚀
