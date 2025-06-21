# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000 (configured in vite.config.ts)
- `npm run build` - Build for production (runs TypeScript check first: `tsc -b && vite build`)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React-based MCP (Model Context Protocol) server discovery platform built with modern TypeScript tooling.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom primary color scheme and animations
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query) with 5-minute stale time
- **Routing**: React Router v7 with nested routes
- **Icons**: Lucide React

### Core Architecture Patterns

**Data Management**:
- JSON-based data storage in `src/data/` (categories.json, servers.json)
- Custom hooks in `src/hooks/useData.ts` handle data transformation from JSON to TypeScript interfaces
- Query caching with TanStack Query for performance
- Simulated async loading with delays for better UX

**State Architecture**:
- Zustand store (`src/store/useAppStore.ts`) manages UI state, search filters, and user preferences
- Persistent storage for language, theme, filters, and sort preferences
- Centralized state for search functionality across components

**Type System**:
- Comprehensive TypeScript interfaces in `src/types/` for MCPServer, Category, SearchFilters
- Internationalization support built into data structures (7 languages supported)
- Transform layer between JSON data format and application types

**Component Structure**:
- Layout wrapper with nested routing structure
- Page components in `src/pages/` for main routes (Home, Servers, Categories, etc.)
- Reusable components in `src/components/Layout/` (Header, Footer, Layout)

### Key Features Implementation

**Internationalization**: 
- Type-safe language system with Language union type
- Multi-language data structures throughout categories and descriptions
- Currently displays Chinese (zh-CN) with English fallbacks

**Search & Filtering**:
- Complex filtering system with category, tags, quality score, and compatibility filters
- Multiple sort options (name, stars, downloads, quality, updated)
- Search state persisted in Zustand store

**Data Transformation**:
- JSON data transformed to match TypeScript interfaces in useData hooks
- Repository information extracted and formatted
- Quality scoring system with multiple factors (documentation, maintenance, community, performance)

### File Structure Notes

The project follows a feature-based organization:
- `src/pages/` contains route components
- `src/components/Layout/` for layout components
- `src/hooks/` for data fetching logic
- `src/store/` for global state management
- `src/types/` for TypeScript definitions
- `src/data/` for static JSON data

### Development Notes

- Vite dev server configured to open automatically on port 3000
- Path alias `@` configured for `./src` in vite.config.ts
- ESLint configured with TypeScript, React hooks, and React refresh rules
- Tailwind configured with custom primary color palette and animations
- All queries have 2 retries and 5-minute stale time by default