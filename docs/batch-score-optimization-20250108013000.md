# Batch Score Query Optimization

## Overview
This optimization reduces the number of Supabase API requests by batching server score queries when displaying multiple servers on a page.

## Problem
Previously, each `VoteButtons` component made an individual query to fetch its server's score. On pages displaying 36 servers, this resulted in 36 separate API calls.

## Solution
Implemented a `BatchScoreProvider` component that:
1. Accepts an array of server IDs
2. Makes a single batch query using the SQL IN clause
3. Provides scores to child components via React Context
4. Falls back to individual queries when not wrapped in provider

## Implementation Details

### BatchScoreProvider Component
- Located at: `src/components/BatchScoreProvider.tsx`
- Uses `useServerScores` hook for batch fetching
- Provides scores via React Context

### Modified Components
1. **VoteButtons** (`src/components/VoteButtons.tsx`)
   - Now checks for batch-provided score first
   - Falls back to individual query if not in batch context
   - Fixed logic to prevent unnecessary individual queries

2. **Servers Page** (`src/pages/Servers.tsx`)
   - Wraps server list with `BatchScoreProvider`
   - Extracts server IDs from current page data

3. **CategoryDetail Page** (`src/pages/CategoryDetail.tsx`)
   - Same optimization as Servers page

4. **Favorites Page** (`src/pages/Favorites.tsx`)
   - Added BatchScoreProvider for favorite servers
   - Optimizes score queries for user's saved servers

5. **TagDetail Page** (`src/pages/TagDetail.tsx`)
   - Added BatchScoreProvider for tag-filtered servers
   - Reduces queries when browsing servers by tag

6. **ServerDetail Page** (`src/pages/ServerDetail.tsx`)
   - Added BatchScoreProvider for single server vote button
   - Ensures consistency across all pages

## Performance Impact
- **Before**: 36 API calls per page (one per server)
- **After**: 1 API call per page (batch query)
- **Reduction**: 97% fewer API calls

## Usage Example
```tsx
const serverIds = useMemo(() => servers.map(s => s.id), [servers]);

<BatchScoreProvider serverIds={serverIds}>
  {servers.map(server => (
    <ServerCard key={server.id} server={server} />
  ))}
</BatchScoreProvider>
```

## Benefits
1. Reduced API calls improve page load performance
2. Lower Supabase usage costs
3. Better user experience with faster data loading
4. Backwards compatible - components work with or without provider