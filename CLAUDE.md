# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

### Core Development
- `npm run dev`: Start development server on port 3000 (auto-opens browser)
- `npm run build`: Build production version (TypeScript compilation + Vite build)
- `npm run lint`: Run ESLint with TypeScript support
- `npm run preview`: Preview built application
- `npm run typecheck`: Run TypeScript type checking

### Testing
- `npm test`: Run Playwright E2E tests
- `npm run test:unit`: Run Vitest unit tests
- `npm run test:e2e`: Run Playwright E2E tests
- `npm run test:all`: Run all tests (unit + E2E)

### TODO Management
- `npm run todo:watch`: Monitor TODO items in real-time
- `npm run todo:check`: One-time TODO analysis

### Supabase Integration
- `npm run dev`: Start development server (now uses Supabase by default)
- `npm run build`: Build production version (now uses Supabase by default)
- `npm run supabase:migrate`: Migrate JSON data to Supabase database
- `npm run supabase:migrate-readmes`: Migrate README data to Supabase
- `npm run supabase:diagnose`: Diagnose Supabase connection issues
- `npm run supabase:debug-insert`: Debug data insertion into Supabase

### GitHub Integration
- `npm run github:update-stats`: Fetch latest GitHub repository stats (stars, forks, watchers) and update database
- `npm run github:test-rate-limiting`: Test rate limiting logic and environment setup
- `npm run github:test-delay`: Test actual delay timing configuration

#### Enhanced Rate Limiting Features
The GitHub stats updater includes advanced flow control to prevent rate limiting:

**Smart Rate Limiting:**
- ✅ **Dynamic delays** based on remaining API quota
- ✅ **Exponential backoff** with jitter for retries  
- ✅ **Real-time rate limit monitoring** from GitHub headers
- ✅ **Automatic waiting** when rate limit is exceeded
- ✅ **Batch processing** for large datasets
- ✅ **Progress tracking** with detailed status updates

**Usage Options:**
```bash
# Basic update (processes all servers)
npm run github:update-stats

# Batch mode (recommended for large datasets)
npm run github:update-stats -- --batch --batch-size=50

# Update specific server only
npm run github:update-stats -- --server=server-id-here

# Dry run (test without database updates)
npm run github:update-stats -- --dry-run

# Show help and options
npm run github:update-stats -- --help

# Test rate limiting logic
npm run github:test-rate-limiting
```

#### GitHub API Rate Limits
- **Without token**: 60 requests per hour (750ms delay between requests)
- **With token**: 5,000 requests per hour (200ms delay between requests)

**To use with higher rate limits:**
1. Create a Personal Access Token at https://github.com/settings/tokens/new
2. Select scope: `public_repo` (for reading public repository data)
3. Add to your `.env.local` file: `GITHUB_TOKEN=your_token_here`
4. Run: `npm run github:update-stats`

#### Production Recommendations

**For Regular Updates:**
- Use `--batch` mode for processing large datasets
- Set up GitHub token for higher rate limits
- Monitor rate limit usage with built-in tracking
- Schedule updates during off-peak hours

**For Initial Setup:**
- Start with `npm run github:test-rate-limiting` to verify configuration
- Use `--dry-run` to test before making database changes
- Process in small batches first: `--batch --batch-size=10`

#### Automated Updates
Consider setting up a scheduled job (cron, GitHub Actions, etc.) to run the update script periodically:

```bash
# Daily update with batch processing
0 2 * * * npm run github:update-stats -- --batch --batch-size=100

# Weekly full update
0 3 * * 0 npm run github:update-stats
```

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

The application uses Supabase as the primary and only data source for all data operations.

### Data Source

**Supabase Database**:
- PostgreSQL database with real-time capabilities
- Server-side querying and filtering
- User authentication with Clerk
- Comments and favorites system
- Advanced features like popularity tracking
- Full-text search and advanced filtering

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

### Development Mode

**Development with Supabase**:
```bash
npm run dev
```

### Authentication Flow

The application uses Clerk for user authentication:
1. Users sign up/in via Clerk
2. Clerk user ID is used to associate comments and favorites
3. Protected routes require authentication
4. User preferences sync across devices

### Favorites System

The application includes a comprehensive favorites system with Supabase integration:

**Architecture**:
- **Local Storage**: Favorites stored locally when user not authenticated
- **Supabase Database**: Favorites synced to Supabase when user authenticated
- **Cross-Device Sync**: Favorites automatically sync across devices for authenticated users
- **Migration**: Local favorites automatically migrated to Supabase on first login

**Database Structure**:
```sql
-- user_favorites table in Supabase
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,      -- Clerk user ID
    server_id TEXT NOT NULL,    -- MCP server ID
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(user_id, server_id)
);
```

**Key Services**:
- `useSupabaseFavoritesService()`: Main service for favorites management
- `useFavoritesSync()`: Handles authentication state changes and sync
- `FavoriteButton`: UI component with real-time sync status

**Features**:
- Real-time favorites updates across the application
- Offline support with automatic sync when online
- Category-based filtering on favorites page
- Public favorite counts for popular servers
- Batch operations for performance optimization

## Development Workflow

### Adding New Servers

**Adding Server Data**:
1. Add server data directly to Supabase database via admin panel or migration script
2. Use `npm run supabase:migrate` to sync from external data sources if needed
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
// IMPORTANT: Use optimized hooks for better performance

// For pages requiring paginated server data
const { data: paginatedResult, isLoading, error } = useServersPaginated(
  page, 
  limit, 
  sortBy, 
  sortOrder, 
  filters
);

// For home page - optimized with limited servers per category
const { data: homePageData } = useHomePageData();
const { data: serverStats } = useServerStats();

// For category pages - with pagination
const { data: categoryResult } = useServersByCategoryPaginated(
  categoryId, 
  page, 
  limit, 
  sortBy, 
  sortOrder
);

// For search - with pagination
const { data: searchResult } = useSearchServersPaginated(
  query, 
  page, 
  limit, 
  sortBy, 
  sortOrder
);

// Legacy hooks (avoid for performance)
const { data: servers } = useServers(); // WARNING: Loads all servers
const { data: server } = useServer(serverId); // OK for single server
const { data: featuredServers } = useFeaturedServers(); // OK for small datasets

// Check current data source (always 'supabase' now)
const dataSource = getDataSource(); // 'supabase'
const usingSupabase = isUsingSupabase(); // always true
```

### Authentication Patterns
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

The application implements several performance optimizations:

### Database Query Optimization
- **Paginated Data Loading**: All major data fetching now uses server-side pagination to avoid loading large datasets
- **Optimized Home Page**: `useHomePageData()` loads only necessary data (6 servers per category) instead of all servers
- **Server-Side Filtering**: Search and filtering operations happen in Supabase, reducing client-side processing
- **Lightweight Statistics**: `useServerStats()` fetches only aggregated data for dashboard statistics

### Recommended Hook Usage
```typescript
// ✅ RECOMMENDED: Use paginated hooks
useServersPaginated(page, limit, sortBy, sortOrder, filters)
useServersByCategoryPaginated(categoryId, page, limit, sortBy, sortOrder)  
useSearchServersPaginated(query, page, limit, sortBy, sortOrder)
useHomePageData() // Optimized for home page
useServerStats() // Lightweight statistics

// ⚠️ AVOID: These load all data at once
useServers() // WARNING: Loads all servers - use only when necessary
useSearchServers(query) // Use paginated version instead
```

### Data Loading Strategy
- **Home Page**: Loads categories + 6 servers per category + aggregated statistics from database
- **Servers Page**: 12 servers per page with server-side filtering and sorting
- **Category Page**: 12 servers per page for specific category with pagination  
- **Search Results**: 50 results for home page, 12 results per page on dedicated search pages
- **Statistics**: Real-time calculation from database with fallback to cached data

### Search Implementation
- **Database-Powered Search**: All search queries now use Supabase full-text search capabilities
- **Real-Time Results**: Search results are fetched directly from database, not client-side filtering
- **Optimized Performance**: Paginated search results reduce data transfer and improve response time

### Other Optimizations
- TanStack Query handles caching and background updates
- Images are optimized and lazy-loaded where appropriate
- Bundle size is optimized through Vite's tree-shaking
- State persistence reduces unnecessary API calls
- Responsive images and proper asset optimization

## Deployment Notes

The application is a full-stack SPA with database backend:

### Production Deployment
- Requires Supabase database and Clerk authentication setup
- Environment variables must be configured
- Supports real-time features and user authentication
- Build with: `npm run build`

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Build artifacts are generated in `dist/` directory after running the appropriate build command.

### SEO Considerations
- **Sitemap Generation**: `sitemapGenerator.js` generates a sitemap.xml file for search engines
- **Metadata**: Each server page includes metadata for SEO, including title, description, and tags
- **Social Media Sharing**: Optimized images and rich preview cards for social media sharing
- **Robots.txt**: `robots.txt` file is generated to allow search engines to crawl the site and follow the sitemap
- **Canonical URLs**: Each server page has a canonical URL to prevent duplicate content
- **Language Alternates**: Each server page has language alternates for multi-language support
- **Open Graph**: Each server page has Open Graph metadata for social sharing
- **Twitter Cards**: Each server page has Twitter Card metadata for social sharing
- **Breadcrumbs**: Breadcrumbs are included on server detail pages for navigation
- **Robots.txt**: `robots.txt` file is generated to allow search engines to crawl the site
- **Sitemap.xml**: Sitemap.xml file is generated to allow search engines to crawl the site
- reference @SEO核心知识点与实战案例大全 to do seo