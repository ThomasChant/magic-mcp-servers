/**
 * Extract directory name from GitHub URL for monorepo projects
 * Handles URLs like:
 * - https://github.com/owner/repo/tree/main/subdirectory
 * - https://github.com/owner/repo/blob/main/subdirectory/file.ts
 * Returns the final directory name only (e.g., "slack" instead of "src/slack")
 */
export function extractMonorepoName(githubUrl: string, originalName: string): string {
  if (!githubUrl) return originalName;
  
  // For URLs like: https://github.com/owner/repo/tree/main/subdirectory
  if (githubUrl.includes('/tree/')) {
    const match = githubUrl.match(/\/tree\/[^/]+\/(.+)$/);
    if (match) {
      const directoryPath = match[1];
      // Remove any trailing slashes
      const cleanPath = directoryPath.replace(/\/$/, '');
      // Get the last directory name (after the last slash)
      const finalDirName = cleanPath.split('/').pop() || cleanPath;
      return finalDirName.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
  }
  
  // For URLs like: https://github.com/owner/repo/blob/main/subdirectory/file.ts
  if (githubUrl.includes('/blob/')) {
    const match = githubUrl.match(/\/blob\/[^/]+\/(.+)$/);
    if (match) {
      const fullPath = match[1];
      const pathParts = fullPath.split('/');
      
      // If there's only a file (no directories), return original name
      if (pathParts.length === 1) {
        return originalName;
      }
      
      // Get the last directory (before the filename)
      const lastDir = pathParts[pathParts.length - 1];
      return lastDir.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
  }
  
  // If we can't extract a directory, return the original name
  return originalName;
}