# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

### Core Development
- `npm run dev`: Start development server on port 3000 (auto-opens browser)
- `npm run build`: Build production version (includes data optimization, TypeScript compilation + Vite build)
- `npm run lint`: Run ESLint with TypeScript support
- `npm run preview`: Preview built application
- `npm run typecheck`: Run TypeScript type checking

### Testing
- `npm test`: Run Playwright E2E tests
- `npm run test:unit`: Run Vitest unit tests
- `npm run test:e2e`: Run Playwright E2E tests
- `npm run test:all`: Run all tests (unit + E2E)

### Data Management
- `npm run optimize-data`: Optimize JSON data files for production
- `npm run integrate-data`: Process and integrate server data
- `npm run todo:watch`: Monitor TODO items in real-time
- `npm run todo:check`: One-time TODO analysis

### Supabase Integration
- `npm run supabase:dev`: Start development server with Supabase data source
- `npm run supabase:build`: Build production version with Supabase
- `npm run supabase:migrate`: Migrate JSON data to Supabase database
- `npm run supabase:migrate-readmes`: Migrate README data to Supabase
- `npm run supabase:diagnose`: Diagnose Supabase connection issues
- `npm run supabase:debug-insert`: Debug data insertion into Supabase

## Project Overview

This is a React-based MCP (Model Context Protocol) Hub - a discovery platform for MCP servers. The application helps developers find, explore, and integrate MCP servers through an intuitive web interface.

## Core Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with localStorage persistence
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL) with feature flag support
- **Authentication**: Clerk (for user management and authentication)
- **Testing**: Playwright for E2E testing + Vitest for unit tests
- **Linting**: ESLint with TypeScript support
- **Content Rendering**: React Markdown with rehype-raw for HTML support
- **Animations**: React Particles with TSParticles for interactive backgrounds

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── Home/           # Home page specific components (CategoryCard, FeaturedServerCard)
│   ├── Layout/         # App layout components (Header, Footer, Layout)
│   └── [Various].tsx   # Utility components (AdaptiveText, CosmicBackground, ServerComments, etc.)
├── pages/              # Route-based page components
├── hooks/              # Custom React hooks for data fetching and state management
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── data/               # Static TypeScript data files
├── lib/                # External service configurations (Supabase client)
├── services/           # Business logic services (favorites, etc.)
├── utils/              # Utility functions (icon mapping, etc.)
└── assets/             # Static assets

public/
├── data/               # JSON data files
│   ├── categories.json
│   ├── servers-core1.json
│   └── servers-extended.json
└── structured_readme_data/  # Processed README files (if using JSON mode)

scripts/                # Data migration and utility scripts
supabase/              # Supabase schema and migration files
```

### Key Components

**State Management (`store/useAppStore.ts`)**:
- UI state: language, theme, sidebar
- Search state: query, filters, sorting
- Persistent storage for user preferences

**Data Layer (`hooks/useUnifiedData.ts`)**:
- `useServers()`: Fetch and transform server data (JSON or Supabase)
- `useCategories()`: Fetch category data with internationalization
- `useServer(id)`: Fetch individual server details
- `useFeaturedServers()`: Get featured servers
- `useServersByCategory(id)`: Filter servers by category
- `useServerReadme(id)`: Load structured README data
- `usePopularServers()`: Get popular servers (Supabase only, falls back to featured)
- `useRecentServers()`: Get recently updated servers
- `useSearchServers(query)`: Search servers by query

**Data Sources**:
- **JSON Mode**: Uses static JSON files from `public/data/`
- **Supabase Mode**: Uses PostgreSQL database with real-time capabilities
- **Feature Flag**: `VITE_USE_SUPABASE` environment variable controls data source

**Type System (`types/index.ts`)**:
- `MCPServer`: Comprehensive server interface with metadata, stats, quality scores
- `Category`: Internationalized category with subcategories
- `SearchFilters`: Advanced filtering options
- Multi-language support for all user-facing content

## Data Architecture

The application uses a unified data layer that supports both JSON files and Supabase database as data sources, controlled by the `VITE_USE_SUPABASE` environment variable.

### Dual Data Source Support

**JSON Mode (Default)**:
- Static JSON files served from `public/data/`
- Client-side filtering and searching
- No authentication required
- Suitable for static deployment

**Supabase Mode**:
- PostgreSQL database with real-time capabilities
- Server-side querying and filtering
- User authentication with Clerk
- Comments and favorites system
- Advanced features like popularity tracking

### Server Data Structure
Servers are defined with rich metadata including:
- Basic info: name, description, owner
- Categorization: category, subcategory, tags
- Repository stats: stars, forks, last updated
- Quality metrics: documentation, maintenance, community scores
- Compatibility: platforms, language versions
- Installation: npm, pip, docker, manual instructions
- User interactions: favorites, comments (Supabase mode only)

### Internationalization
All user-facing content supports 7 languages:
- English (en) - primary
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- French (fr), Japanese (ja), Korean (ko), Russian (ru)

### Data Sources

**JSON Files**:
- `public/data/categories.json`: Category definitions with i18n
- `public/data/servers-core1.json`: Core server registry
- `public/data/servers-extended.json`: Extended server data
- `public/structured_readme_data/`: Processed README files
- `src/data/categoriesData.ts`: Static category data

**Supabase Database Tables**:
- `categories`: Internationalized categories
- `servers`: Complete server registry with metadata
- `server_readmes`: Structured README content
- `featured_servers`: Curated featured servers
- `server_comments`: User comments with nested replies
- `user_favorites`: User favorite servers (with Clerk auth)

## Supabase Integration

The application integrates with Supabase for enhanced functionality including real-time data, user authentication, and advanced features.

### Environment Setup

Create a `.env.local` file with the following variables:
```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Database Schema

The Supabase database includes the following main tables:

**Categories Table**:
- Internationalized category names and descriptions
- Icon and color theming
- Subcategory relationships

**Servers Table**:
- Complete server metadata
- Repository statistics and quality metrics
- Installation instructions and compatibility info
- Search-optimized fields

**Server Comments System**:
- Nested comment structure with parent-child relationships
- User authentication via Clerk
- Real-time updates
- Moderation capabilities

### Data Migration

Use the provided scripts to migrate data from JSON to Supabase:

```bash
# Migrate all data (servers, categories, READMEs)
npm run supabase:migrate

# Migrate only README data
npm run supabase:migrate-readmes

# Debug migration issues
npm run supabase:diagnose
```

### Development Modes

**JSON Mode Development** (default):
```bash
npm run dev
```

**Supabase Mode Development**:
```bash
npm run supabase:dev
```

### Authentication Flow

The application uses Clerk for user authentication in Supabase mode:
1. Users sign up/in via Clerk
2. Clerk user ID is used to associate comments and favorites
3. Protected routes require authentication
4. User preferences sync across devices

## Development Workflow

### Adding New Servers

**For JSON Mode**:
1. Update `public/data/servers-core1.json` or `servers-extended.json` with server information
2. Ensure all required fields are populated (name, description, category, stats, etc.)
3. Add structured README data to `public/structured_readme_data/` if available
4. Run `npm run optimize-data` to process the data
5. Test search and filtering functionality

**For Supabase Mode**:
1. Add server data directly to Supabase database via admin panel or migration script
2. Use `npm run supabase:migrate` to sync from JSON if needed
3. Verify data appears correctly in the application
4. Test real-time updates and user interactions

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
// Using unified data hooks (automatically uses JSON or Supabase based on env)
const { data: servers, isLoading, error } = useServers();
const { data: server } = useServer(serverId);
const { data: featuredServers } = useFeaturedServers();
const { data: popularServers } = usePopularServers(); // Supabase only
const { data: searchResults } = useSearchServers(query);

// Check current data source
const dataSource = getDataSource(); // 'json' or 'supabase'
const usingSupabase = isUsingSupabase(); // boolean
```

### Authentication Patterns (Supabase Mode)
```typescript
// Using Clerk authentication
import { useUser } from '@clerk/clerk-react';

const { isSignedIn, user } = useUser();

// Protected routes
<ProtectedRoute>
  <FavoritesPage />
</ProtectedRoute>

// Comments and user interactions
const { data: comments } = useComments(serverId);
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

The application supports two deployment modes:

### JSON Mode Deployment (Static)
- Static SPA suitable for deployment on Vercel, Netlify, GitHub Pages
- No server-side dependencies
- All data served from static JSON files
- Build with: `npm run build`

### Supabase Mode Deployment (Full-Stack)
- Requires Supabase database and Clerk authentication setup
- Environment variables must be configured
- Supports real-time features and user authentication
- Build with: `npm run supabase:build`

### Environment Variables for Production
```env
VITE_USE_SUPABASE=true/false
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Build artifacts are generated in `dist/` directory after running the appropriate build command.