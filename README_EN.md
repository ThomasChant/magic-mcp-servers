# MCP Hub - Model Context Protocol Server Discovery Platform

🚀 **Modern MCP Server Discovery Platform with Full-Stack AI-Assisted Development**

> 📖 **English Version**: [README_EN.md](README_EN.md) | 中文版本: [README.md](README.md)

Magic MCP Hub is a modern server discovery and showcase platform designed for the Model Context Protocol (MCP) ecosystem. We are committed to providing developers with the most comprehensive and user-friendly MCP server directory, helping you quickly find and integrate suitable solutions.

## 🌟 Live Demo

**🔗 [Try it Now](https://magicmcp.net)** 

### 📱 Quick Preview
- 🏠 [Home](https://magicmcp.net) - Discover and explore MCP servers
- 🔍 [Server List](https://magicmcp.net/servers) - Search and filter MCP servers
- 📁 [Browse by Category](https://magicmcp.net/categories) - Explore by functionality
- ❤️ [Favorites](https://magicmcp.net/favorites) - Personal favorites management
- 🌐 [Multi-language](https://magicmcp.net/en) - Support for 7 languages

> 💡 **Tip**: The website supports dark mode - click the top right corner to switch themes!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-org/mcp-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ Key Features

### 🎯 Core Functionality
- **Comprehensive Server Directory**: A rich collection of high-quality MCP servers covering databases, file systems, API integrations, and more
- **Smart Search & Filtering**: Powerful full-text search, multi-dimensional filtering, and intelligent recommendation system
- **Detailed Server Information**: Each server includes detailed descriptions, installation guides, compatibility information, and quality scores
- **User Authentication & Interaction**: Clerk-based user authentication supporting favorites, comments, and ratings
- **Real-time Data Sync**: Real-time data updates and cross-device synchronization using Supabase

### 🎨 User Experience
- **Modern UI Design**: Beautiful interface design with dark mode support and stunning cosmic background effects
- **Responsive Design**: Perfect adaptation for desktop and mobile devices, browse anywhere, anytime
- **Internationalization**: Support for 7 languages (Chinese, English, French, Japanese, Korean, Russian, Traditional Chinese)
- **Performance Optimization**: Server-side pagination, virtual scrolling, lazy image loading, and other performance optimizations

### 🔧 Developer Friendly
- **AI-Assisted Development**: Developed with Claude AI assistance, providing high-quality code and best practices
- **Modern Tech Stack**: React 19, TypeScript, Tailwind CSS, Supabase
- **Complete SEO Optimization**: Server-side rendering, sitemap generation, meta optimization
- **Open Source Friendly**: MIT license, complete development documentation and test coverage

## 🛠️ Tech Stack

### 🎨 Frontend Technologies
- **Core Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with localStorage persistence)
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router
- **Icon Components**: Lucide React
- **Particle Animation**: TSParticles
- **Content Rendering**: React Markdown + rehype-raw
- **Internationalization**: i18next + react-i18next

### 🗄️ Backend & Data
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (user management and authentication)
- **Real-time Features**: Supabase Realtime
- **API Interface**: Supabase REST API
- **Server**: Express + Node.js

### 🚀 Deployment & Operations
- **Deployment Platform**: Vercel (simplified SSR configuration)
- **SEO Optimization**: Server-side rendering + automatic sitemap generation
- **Caching Strategy**: TanStack Query + Supabase caching

### 🧪 Testing & Quality
- **E2E Testing**: Playwright
- **Unit Testing**: Vitest + Testing Library
- **Code Standards**: ESLint + TypeScript strict mode

## 📦 Quick Start

### 🔧 Prerequisites

- **Node.js**: 18.0 or higher
- **Package Manager**: npm or yarn
- **Git**: For version control

### 🚀 Local Development

1. **Clone Repository**
```bash
git clone https://github.com/your-org/mcp-hub.git
cd mcp-hub
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
# Copy environment variables example
cp .env.example .env.local

# Edit .env.local file and configure necessary environment variables
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# GitHub Token (optional, for repository statistics)
GITHUB_TOKEN=your_github_token
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open browser and visit** `http://localhost:3000`

### 🏗️ Build & Deploy

#### Local Build
```bash
# Standard build
npm run build

# Vercel optimized build (recommended)
npm run build:vercel

# Preview build results
npm run preview
```

#### Deploy to Vercel
```bash
# One-click deployment
npm run build:vercel
vercel --prod
```

### 📊 Data Migration

If you need to migrate data to Supabase:

```bash
# Use tool scripts in scripts-back
cd scripts-back

# Migrate all data
node ts/migrate-to-supabase.ts

# Migrate only README data
node ts/migrate-readmes-only.ts

# Diagnose connection issues
node ts/diagnose-supabase.ts
```

### 🔄 GitHub Statistics Update

The project supports automatic GitHub repository statistics updates:

```bash
# Use tool scripts in scripts-back
cd scripts-back

# Update all repository statistics
node ts/update-github-stats.ts

# Test GitHub API limits
node ts/test-rate-limiting.ts

# Check GitHub statistics
node ts/check-github-stats.ts
```

## 📁 Project Structure

```
mcp-hub/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Home/           # Home page specific components
│   │   │   ├── CategoryCard.tsx
│   │   │   └── FeaturedServerCard.tsx
│   │   ├── Layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── AdaptiveText.tsx    # Adaptive text component
│   │   ├── CosmicBackground.tsx # Cosmic background effect
│   │   ├── ServerCard.tsx      # Server card
│   │   ├── ServerComments.tsx  # Comment system
│   │   ├── FavoriteButton.tsx  # Favorite button
│   │   └── SearchBar.tsx       # Search bar
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Home page
│   │   ├── Servers.tsx     # Server list
│   │   ├── ServerDetail.tsx # Server details
│   │   ├── Categories.tsx  # Category list
│   │   ├── CategoryDetail.tsx # Category details
│   │   ├── Favorites.tsx   # Favorites page
│   │   ├── Search.tsx      # Search page
│   │   ├── Docs.tsx        # Documentation page
│   │   └── About.tsx       # About page
│   ├── hooks/              # Custom hooks
│   │   ├── useUnifiedData.ts   # Unified data fetching
│   │   ├── useSupabaseData.ts  # Supabase data
│   │   └── useFavoritesSync.ts # Favorites sync
│   ├── store/              # State management
│   │   └── useAppStore.ts  # App state
│   ├── services/           # Business logic
│   │   └── favorites.ts    # Favorites service
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Common types
│   ├── lib/                # External service configuration
│   │   └── supabase.ts     # Supabase client
│   ├── utils/              # Utility functions
│   │   └── iconMapping.ts  # Icon mapping
│   ├── data/               # Static data (JSON mode)
│   │   ├── categories.json # Category data
│   │   └── servers.json    # Server data
│   └── assets/             # Static assets
├── public/                 # Public files
├── scripts/                # Build required scripts
│   ├── update-html-assets.js    # HTML asset updates
│   ├── generate-complete-sitemap.js # Sitemap generation
│   └── deploy-sitemaps.js       # Sitemap deployment
├── tests/                 # Test files
│   ├── e2e/              # E2E tests
│   └── unit/             # Unit tests
├── docs/                  # Documentation
│   ├── VERCEL-SIMPLIFIED-SSR.md
│   └── SUPABASE_INTEGRATION.md
├── api/                   # Vercel API functions
│   └── ssr.js            # SSR handling
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
├── playwright.config.ts   # Playwright configuration
└── vercel.json           # Vercel deployment configuration
```

## 🎯 Main Features

### 🔍 Server Discovery
- **Smart Search**: Full-text search, tag filtering, category filtering
- **Advanced Filtering**: Multi-dimensional filtering by rating, update time, popularity, etc.
- **Server Details**: Detailed installation guides, compatibility information, quality scores
- **Related Recommendations**: Intelligent recommendation system based on user behavior

### 👤 User Features
- **User Authentication**: Secure login system based on Clerk
- **Favorites System**: Cross-device synchronized favorites
- **Comment Interaction**: User comments, replies, and like system
- **Personal Center**: User favorites and comment history management

### 🎨 Interface Experience
- **Modern Design**: Beautiful Material Design interface
- **Dark Mode**: Supports automatic and manual switching
- **Cool Effects**: Cosmic starry background, particle animations
- **Responsive Layout**: Perfect adaptation for mobile, tablet, and desktop

### 🌐 Internationalization
- **Multi-language Support**: Complete localization for 7 languages
- **Auto Detection**: Automatic switching based on browser language
- **Manual Switching**: Users can manually select language
- **SEO Optimization**: Independent SEO optimization for each language

### ⚡ Performance Optimization
- **Server-side Pagination**: Reduces data transfer, improves loading speed
- **Image Lazy Loading**: On-demand image resource loading
- **Caching Strategy**: TanStack Query intelligent caching
- **Code Splitting**: On-demand loading of page components

### 🔧 Developer Features
- **Real-time Sync**: Real-time data updates based on Supabase
- **API Friendly**: Supabase RESTful API interface
- **Extensibility**: Easy to add new features and customizations
- **Type Safety**: TypeScript strict mode ensures code quality

## 🔧 Development Guide

### 🚀 Development Commands

```bash
# Development server
npm run dev              # Start development server
npm run build            # Build production version
npm run build:vercel     # Vercel optimized build
npm run preview          # Preview build results

# Code quality
npm run lint             # Run ESLint

# Testing (using native tools)
npx playwright test      # E2E testing
npx vitest               # Unit testing
npx tsc --noEmit         # TypeScript type checking

# Sitemap generation
npm run sitemap:generate  # Generate sitemap
npm run sitemap:build     # Build sitemap

# Development tools (in scripts-back directory)
cd scripts-back && node debug-current-state.ts  # Debug current state
```

### 📝 Adding New Servers

**Via Supabase Dashboard (Recommended)**:
1. Log in to Supabase Dashboard
2. Add new record in `servers` table
3. Fill in required fields: name, description, category_id, repository_url, etc.
4. System will automatically sync to frontend

**Via Data Migration Scripts**:
```bash
# Add server data to JSON files
# Then use migration tools in scripts-back
cd scripts-back
node ts/migrate-to-supabase.ts
```

### 🏷️ Adding New Categories

1. Add new category in Supabase `categories` table
2. Configure multi-language support names and descriptions
3. Set icon and color theme
4. Update category_id for related servers

### 🎨 Custom Styling

The project uses Tailwind CSS with full styling customization support:

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

### 🔌 API Integration

The project provides complete API interfaces:

```typescript
// Get server list
const { data: servers } = useServersPaginated(page, limit, sortBy, sortOrder, filters);

// Get single server
const { data: server } = useServer(serverId);

// Get category list
const { data: categories } = useCategories();

// Favorite operations
const { toggleFavorite } = useFavoritesService();
```

### 🧪 Testing

The project includes basic testing configuration:

```bash
# E2E testing
npx playwright test

# Unit testing
npx vitest

# Code standards check
npm run lint

# TypeScript type checking
npx tsc --noEmit
```

### 📊 Performance Monitoring

The project includes basic development tools:

- **ESLint**: Code quality checking
- **TypeScript**: Type safety guarantee
- **Playwright**: E2E testing framework

### 🔧 Debugging Tips

```bash
# Enable debug mode
DEBUG=true npm run dev

# Check database connection status
npm run supabase:diagnose

# Test GitHub API limits
npm run github:test-rate-limiting
```

## 🌐 Internationalization Support

The project supports complete internationalization features:

### 🗣️ Supported Languages
- 🇺🇸 English (en) - Primary language
- 🇨🇳 简体中文 (zh-CN) - Full support
- 🇹🇼 繁体中文 (zh-TW) - Full support
- 🇫🇷 Français (fr) - Full support
- 🇯🇵 日本語 (ja) - Full support
- 🇰🇷 한국어 (ko) - Full support
- 🇷🇺 Русский (ru) - Full support

### 🔧 Internationalization Features
- **Auto Detection**: Automatic switching based on browser language
- **Manual Switching**: Users can manually select language in the interface
- **URL Routing**: Support for language prefix URL routing (e.g., `/en/servers`)
- **SEO Optimization**: Independent SEO metadata for each language
- **Real-time Switching**: Language switching without page refresh

### 📝 Adding New Languages

1. **Create Translation Files**
```bash
# Create new language file
cp src/locales/en.json src/locales/de.json
```

2. **Translate Content**
```json
{
  "home": "Home",
  "servers": "Servers",
  "categories": "Categories"
}
```

3. **Update Language Configuration**
```typescript
// src/i18n/config.ts
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  // ...
];
```

## 🤝 Contributing

We welcome community contributions! You can:

1. Report bugs or suggest features
2. Submit Pull Requests to improve code
3. Add new MCP servers to the directory
4. Improve documentation and translations

### Contributing Steps

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 💡 Contribution Types
- 🐛 **Bug Reports**: Find and report issues
- 🚀 **Feature Suggestions**: Propose new feature ideas
- 📝 **Documentation**: Improve project documentation
- 🌐 **Translation**: Add or improve multi-language support
- 🎨 **UI/UX**: Improve interface design
- 📊 **Performance**: Enhance application performance

### 📋 Contribution Process

1. **Fork Project**
```bash
# Fork project to your GitHub account
# Then clone to local
git clone https://github.com/your-username/mcp-hub.git
```

2. **Create Branch**
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Or create fix branch
git checkout -b fix/important-bug
```

3. **Develop and Test**
```bash
# Install dependencies
npm install

# Development
npm run dev

# Testing and checking
npx playwright test      # E2E testing
npm run lint            # Code standards
npx tsc --noEmit        # Type checking
```

4. **Submit Changes**
```bash
# Commit changes
git add .
git commit -m "feat: add amazing feature"

# Push to GitHub
git push origin feature/amazing-feature
```

5. **Create Pull Request**
- Create Pull Request on GitHub
- Describe your changes in detail
- Ensure all tests pass
- Wait for code review

### 📝 Commit Standards

Use [Conventional Commits](https://www.conventionalcommits.org/) standards:

```bash
# Features
git commit -m "feat: add user authentication"

# Fixes
git commit -m "fix: resolve search pagination issue"

# Documentation
git commit -m "docs: update README with new features"

# Performance
git commit -m "perf: optimize server list loading"
```

## 📞 Contact Us

### 💬 Community Communication
- 💬 **GitHub Discussions**: [Discussion Forum](https://github.com/your-org/mcp-hub/discussions)
- 🐛 **Bug Reports**: [Issues](https://github.com/your-org/mcp-hub/issues)
- 💡 **Feature Requests**: [Issues](https://github.com/your-org/mcp-hub/issues)

### 📧 Contact Information
- 📧 **Email**: hello@mcphub.dev
- 🐦 **Twitter**: [@mcphub_dev](https://twitter.com/mcphub_dev)
- 📱 **Discord**: [Join our Discord community](https://discord.gg/mcp-hub)

### 🔗 Related Links

- 🌐 **Live Demo**: [MCP Hub Demo](https://your-mcp-hub-demo.vercel.app)
- 📖 **Project Documentation**: [GitHub Repo](https://github.com/your-org/mcp-hub)
- 🚀 **One-click Deploy**: [Deploy to Vercel](https://vercel.com/import/project?template=https://github.com/your-org/mcp-hub)
- 📘 **MCP Official Documentation**: [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- 🎯 **Awesome MCP**: [Awesome MCP Servers Collection](https://github.com/punkpeye/awesome-mcp-servers)

### 🌟 Support the Project

If this project has been helpful to you, please consider:
- ⭐ Give the project a Star
- 🔄 Share with other developers
- 💝 Become a project contributor
- ☕ [Buy us a coffee](https://buymeacoffee.com/mcphub)

## 📈 Performance Features

The project adopts modern performance optimization solutions:

### ⚡ Core Optimizations
- **Server-side Pagination**: Reduces data transfer volume
- **Component Lazy Loading**: On-demand loading of page components
- **Image Optimization**: Native lazy loading + WebP support
- **Caching Strategy**: TanStack Query intelligent caching

### 🎯 SEO Optimization
- **Server-side Rendering**: SSR support for key pages
- **Sitemap**: Automatic sitemap.xml generation
- **Meta Tags**: Complete SEO meta data
- **Multi-language SEO**: SEO optimization for 7 languages

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

1. **One-click Deployment**
```bash
# Build Vercel optimized version
npm run build:vercel

# Deploy to Vercel
vercel --prod
```

2. **Environment Variables Configuration**
Set in Vercel Dashboard:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

3. **Domain Configuration**
- Configure custom domain in Vercel
- Enable HTTPS and CDN acceleration
- Configure redirect rules

### Other Deployment Options

**Netlify**:
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Self-hosting**:
```bash
# Build
npm run build

# Use any static file server
serve -s dist
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Special Thanks

- 💙 **Claude AI**: Assistance with development and code optimization
- 🚀 **Vercel**: Providing excellent deployment platform
- 🗄️ **Supabase**: Providing powerful backend services
- 🔐 **Clerk**: Providing secure user authentication
- 🎨 **Tailwind CSS**: Providing excellent CSS framework
- 👥 **Open Source Community**: Thanks to all contributors for their support

---

**Thank you for your attention and support for MCP Hub!** 🚀

*This project is a typical case of modern web application development with AI (Claude) assistance. We believe AI will become an important tool for future development, not a replacement.*