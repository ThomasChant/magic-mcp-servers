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
      // Extract the directory path and clean it up
      const directoryPath = match[1];
      // Remove any trailing slashes
      const cleanPath = directoryPath.replace(/\/$/, '');
      // Get only the final directory name (after the last slash)
      const finalDirName = cleanPath.split('/').pop() || cleanPath;
      return finalDirName.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
  }
  
  // For URLs like: https://github.com/owner/repo/blob/main/subdirectory/file.ts
  if (githubUrl.includes('/blob/')) {
    const match = githubUrl.match(/\/blob\/[^/]+\/(.+)$/);
    if (match) {
      let directoryPath = match[1];
      // Remove filename if present (anything after the last slash)
      directoryPath = directoryPath.replace(/\/[^/]*$/, '');
      // Remove any trailing slashes
      const cleanPath = directoryPath.replace(/\/$/, '');
      // Get only the final directory name (after the last slash)
      const finalDirName = cleanPath.split('/').pop() || cleanPath;
      return finalDirName.replace(/[^a-zA-Z0-9-_]/g, '-');
    }
  }
  
  // If we can't extract a directory, return the original name
  return originalName;
}