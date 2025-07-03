# Frontend Monorepo Name Handling Implementation

## Overview

This document explains the frontend approach for handling monorepo project names. Instead of modifying the database views, we process the names on the frontend when transforming data from the database.

## Implementation

### 1. Utility Function (`src/utils/monorepoNameExtractor.ts`)

Created a dedicated utility function to extract directory names from GitHub URLs:

```typescript
export function extractMonorepoName(githubUrl: string, originalName: string): string {
  // Handles two main URL patterns:
  // 1. /tree/branch/directory (e.g., https://github.com/owner/repo/tree/main/src/filesystem)
  // 2. /blob/branch/directory/file (e.g., https://github.com/owner/repo/blob/main/src/git/file.ts)
  
  // Returns the directory path with cleaned characters
  // Falls back to original name if extraction fails
}
```

### 2. Data Transformation Hook (`src/hooks/useSupabaseData.ts`)

Modified the `transformServer` function to process monorepo names:

```typescript
function transformServer(dbServer: Record<string, unknown>): MCPServer {
  // Extract monorepo name if this is a monorepo project
  const originalName = dbServer.name as string;
  const isMonorepo = dbServer.is_monorepo as boolean;
  const githubUrl = dbServer.github_url as string;
  const processedName = isMonorepo 
    ? extractMonorepoName(githubUrl, originalName)
    : originalName;

  return {
    id: dbServer.id as string,
    name: processedName,  // Use processed name
    // ... rest of the transformation
  };
}
```

## URL Pattern Handling

### Tree URLs
- **Pattern**: `https://github.com/owner/repo/tree/main/subdirectory`
- **Extraction**: Final directory name only
- **Example**: `https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem` → `filesystem`

### Blob URLs
- **Pattern**: `https://github.com/owner/repo/blob/main/subdirectory/file.ts`
- **Extraction**: Final directory name only (removes filename and parent paths)
- **Example**: `https://github.com/owner/repo/blob/main/src/git/index.ts` → `git`

### Fallback
- If URL doesn't match patterns, returns original name
- Handles edge cases gracefully

## Benefits of Frontend Approach

### 1. **No Database Changes Required**
- No need to modify complex database views
- No risk of breaking existing functionality
- Easier to deploy and rollback

### 2. **Flexible and Maintainable**
- Easy to modify extraction logic
- Can add new URL patterns without database migrations
- Testable with unit tests

### 3. **Performance**
- Processing happens during data transformation (already required)
- No additional database queries
- Minimal performance impact

### 4. **Safe and Reversible**
- Original data remains unchanged in database
- Can easily disable or modify behavior
- No data loss risk

## Testing

### Test Script
Created `scripts/test-monorepo-name-extraction-20250703185500.ts` to verify:
- Utility function works correctly with various URL patterns
- Database integration works as expected
- Frontend transformation processes names correctly

### Run Tests
```bash
npm run test:monorepo-names
```

## Usage in Components

All existing components will automatically use the processed names since they use the hooks that call `transformServer`. No component changes needed:

- `useServers()` - Shows processed names
- `useServersPaginated()` - Shows processed names
- `useServer(id)` - Shows processed name for individual server
- `useSearchServers()` - Shows processed names in search results

## Example Transformations

| Original Name | GitHub URL | Processed Name |
|---------------|------------|----------------|
| `servers` | `https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem` | `filesystem` |
| `servers` | `https://github.com/modelcontextprotocol/servers/tree/main/src/git` | `git` |
| `servers` | `https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite` | `sqlite` |
| `servers` | `https://github.com/modelcontextprotocol/servers/tree/main/src/slack` | `slack` |
| `UI-TARS-desktop` | `https://github.com/bytedance/UI-TARS-desktop/tree/main/packages/agent-infra/mcp-servers/browser` | `browser` |
| `regular-repo` | `https://github.com/owner/regular-repo` | `regular-repo` |

## Implementation Status

✅ **Completed:**
- Utility function created and imported
- Data transformation hook updated
- Test script created and added to package.json
- Documentation created

✅ **Ready for use:**
- All server data will show processed names
- Monorepo projects will display directory names
- Regular projects remain unchanged

## Future Enhancements

1. **Add more URL patterns** if needed
2. **Customize name formatting** (e.g., replace slashes with dashes)
3. **Add configuration options** for different extraction strategies
4. **Cache processed names** if performance becomes an issue

## Verification

To verify the implementation is working:

1. Run the test script: `npm run test:monorepo-names`
2. Check the application in browser
3. Look for monorepo projects showing directory names instead of duplicate repository names

The frontend approach provides a clean, maintainable solution that processes monorepo names without requiring database changes.