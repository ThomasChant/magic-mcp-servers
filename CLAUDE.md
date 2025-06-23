# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev`: Start development server on port 3000 (auto-opens browser)
- `npm run build`: Build production version (TypeScript compilation + Vite build)
- `npm run lint`: Run ESLint with TypeScript support
- `npm run preview`: Preview built application
- `npm test`: Run Playwright E2E tests
- `npm run todo:watch`: Monitor TODO items in real-time
- `npm run todo:check`: One-time TODO analysis

## Project Overview

This is a React-based MCP (Model Context Protocol) Hub - a discovery platform for MCP servers. The application helps developers find, explore, and integrate MCP servers through an intuitive web interface.

## Core Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with localStorage persistence
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Testing**: Playwright for E2E testing
- **Linting**: ESLint with TypeScript support

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── Home/           # Home page specific components
│   ├── Layout/         # App layout components (Header, Footer, Layout)
│   └── [Various].tsx   # Utility components (AdaptiveText, CosmicBackground, etc.)
├── pages/              # Route-based page components
├── hooks/              # Custom React hooks for data fetching
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── data/               # Static JSON data files
└── assets/             # Static assets
```

### Key Components

**State Management (`store/useAppStore.ts`)**:
- UI state: language, theme, sidebar
- Search state: query, filters, sorting
- Persistent storage for user preferences

**Data Layer (`hooks/useData.ts`)**:
- `useServers()`: Fetch and transform server data
- `useCategories()`: Fetch category data with internationalization
- `useServer(id)`: Fetch individual server details
- `useFeaturedServers()`: Get featured servers
- `useServersByCategory(id)`: Filter servers by category
- `useServerReadme(id)`: Load structured README data

**Type System (`types/index.ts`)**:
- `MCPServer`: Comprehensive server interface with metadata, stats, quality scores
- `Category`: Internationalized category with subcategories
- `SearchFilters`: Advanced filtering options
- Multi-language support for all user-facing content

## Data Architecture

### Server Data Structure
Servers are defined with rich metadata including:
- Basic info: name, description, owner
- Categorization: category, subcategory, tags
- Repository stats: stars, forks, last updated
- Quality metrics: documentation, maintenance, community scores
- Compatibility: platforms, language versions
- Installation: npm, pip, docker, manual instructions

### Internationalization
All user-facing content supports 7 languages:
- English (en) - primary
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- French (fr), Japanese (ja), Korean (ko), Russian (ru)

### Data Sources
- `data/serversnew.json`: Main server registry
- `data/categories_full_updated.json`: Category definitions
- `public/structured_readme_data/`: Processed README files

## Development Workflow

### Adding New Servers
1. Update `src/data/serversnew.json` with server information
2. Ensure all required fields are populated
3. Add structured README data to `public/structured_readme_data/` if available
4. Test search and filtering functionality

### Component Development
- Follow existing patterns in `components/` directory
- Use TypeScript strictly - all components are typed
- Utilize Tailwind CSS classes for styling
- Implement responsive design patterns
- Use Zustand store for global state, local state for component-specific data

### State Management Patterns
```typescript
// Reading state
const { language, theme, searchQuery } = useAppStore();

// Updating state
const { setLanguage, toggleTheme, setSearchQuery } = useAppStore();
```

### Data Fetching Patterns
```typescript
// Using data hooks
const { data: servers, isLoading, error } = useServers();
const { data: server } = useServer(serverId);
```

## Configuration Files

### Vite (`vite.config.ts`)
- React plugin enabled
- Path alias: `@` → `./src`
- Dev server on port 3000 with auto-open

### TypeScript
- Strict mode enabled
- Uses composite project configuration (`tsconfig.app.json`, `tsconfig.node.json`)

### Tailwind (`tailwind.config.js`)
- Custom color palette with primary blue theme
- Dark mode support via class strategy
- Custom animations: fade-in, slide-up, scale-in
- Inter font as default sans-serif

### ESLint (`eslint.config.js`)
- TypeScript ESLint configuration
- React hooks and refresh plugins
- Ignores `dist` directory

### Playwright (`playwright.config.ts`)
- E2E testing on Chromium
- Base URL: `http://localhost:3001`
- Comprehensive feature completeness tests in `tests/incomplete-features.spec.ts`

## Testing Strategy

The project includes comprehensive E2E tests that verify:
- Home page functionality and search
- Server listing and filtering
- Category navigation
- Server detail pages
- Mobile responsiveness
- Theme and language switching
- Error handling (404 pages)

Run tests with: `npm test` or `npx playwright test`

## Code Style Guidelines

- Use ES modules (import/export)
- Prefer TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS utility classes
- Implement proper error boundaries
- Add loading states for async operations
- Support both light and dark themes
- Ensure mobile responsiveness

## Common Development Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route to `src/App.tsx`
3. Update navigation in `src/components/Layout/Header.tsx`
4. Add appropriate TypeScript types

### Implementing Search Features
- Use `useAppStore` for search state management
- Filter data in components using derived state
- Implement debouncing for search input
- Support multiple filter criteria simultaneously

### Styling Components
- Use Tailwind CSS utility classes
- Follow dark mode patterns: `dark:text-white`
- Implement responsive breakpoints: `sm:`, `md:`, `lg:`
- Use custom animations from Tailwind config

## Performance Considerations

- TanStack Query handles caching and background updates
- Images are optimized and lazy-loaded where appropriate
- Bundle size is optimized through Vite's tree-shaking
- State persistence reduces unnecessary API calls
- Responsive images and proper asset optimization

## Deployment Notes

The application is a static SPA suitable for deployment on:
- Vercel, Netlify, GitHub Pages
- Any static hosting service
- CDN with SPA routing support

Build artifacts are generated in `dist/` directory after running `npm run build`.