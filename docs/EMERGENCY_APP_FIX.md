# EMERGENCY APPLICATION FIX

## Problem
The `servers_with_details` view is broken or missing, causing the entire application to fail.

## Immediate Solution
Temporarily use the base `mcp_servers` table directly while we fix the database view.

## Apply This Fix

### 1. Update useSupabaseData.ts

Replace the problematic query in `src/hooks/useSupabaseData.ts` around line 420:

**FIND THIS CODE:**
```typescript
supabase
  .from('servers_with_details')
  .select('stars, last_updated, featured, verified', { count: 'exact' })
  .limit(1000),
```

**REPLACE WITH:**
```typescript
supabase
  .from('mcp_servers')
  .select('stars, last_updated, featured, verified', { count: 'exact' })
  .limit(1000),
```

### 2. Update all other queries

Find all instances of `'servers_with_details'` and temporarily replace with `'mcp_servers'`:

**Search and Replace:**
- FROM: `'servers_with_details'`
- TO: `'mcp_servers'`

### 3. Handle missing voting columns

Since `mcp_servers` doesn't have voting columns, add default values:

**In the transform functions, add:**
```typescript
// Add default voting data for now
total_score: Math.floor((dbServer.stars as number || 0) / 10),
upvotes: 0,
downvotes: 0,
vote_score: 0,
total_votes: 0,
is_monorepo: false,
```

## Quick Test

After making these changes:
```bash
npm run dev
```

The application should load without column ambiguity errors.

## Next Steps

1. Apply the emergency fix above to get the app working
2. Then properly fix the database view using ULTIMATE_DB_FIX.sql
3. Once database is fixed, revert the application changes

This is a temporary workaround to get the application functional while we resolve the database issue.