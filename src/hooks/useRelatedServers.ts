import { useMemo } from 'react';
import { useServersPaginated } from './useUnifiedData';
import type { MCPServer } from '../types';

interface RelatedServer {
  server: MCPServer;
  relevanceScore: number;
  matchType: 'subcategory' | 'category' | 'tags';
}

/**
 * Hook to get related servers based on the current server's category, subcategory, and tags
 * @param currentServer - The current server to find related servers for
 * @param maxResults - Maximum number of related servers to return (default: 10)
 * @returns Array of related servers sorted by relevance
 */
export const useRelatedServers = (currentServer: MCPServer | null | undefined, maxResults: number = 10) => {
  // Get a larger set of servers to find related ones - use pagination with a large limit
  const { data: serversResult, isLoading } = useServersPaginated(1, 200, 'stars', 'desc'); // Get top 200 servers
  const allServers = serversResult?.data || [];

  const relatedServers = useMemo(() => {
    if (!currentServer || !allServers || allServers.length === 0) {
      return [];
    }

    const candidates: RelatedServer[] = [];

    // Filter out the current server and calculate relevance scores
    allServers.forEach((server) => {
      if (server.id === currentServer.id) {
        return; // Skip the current server
      }

      let relevanceScore = 0;
      let matchType: 'subcategory' | 'category' | 'tags' = 'tags';

      // Priority 1: Same subcategory (highest relevance)
      if (server.subcategory && currentServer.subcategory && 
          server.subcategory.trim() !== '' && currentServer.subcategory.trim() !== '' &&
          server.subcategory === currentServer.subcategory) {
        relevanceScore += 100;
        matchType = 'subcategory';
      }
      
      // Priority 2: Same category (medium relevance) - only if no subcategory match
      else if (server.category === currentServer.category) {
        relevanceScore += 50;
        matchType = 'category';
        
        // Additional points if both have subcategories but they're different
        if (server.subcategory && currentServer.subcategory && 
            server.subcategory.trim() !== '' && currentServer.subcategory.trim() !== '' &&
            server.subcategory !== currentServer.subcategory) {
          relevanceScore += 10; // Small bonus for being in same category with different subcategory
        }
      }

      // Priority 3: Shared tags (lower relevance, but accumulative)
      const currentTags = new Set(currentServer.tags || []);
      const serverTags = server.tags || [];
      const sharedTags = serverTags.filter(tag => currentTags.has(tag));
      
      if (sharedTags.length > 0) {
        relevanceScore += Math.min(sharedTags.length * 10, 30); // Max 30 points from tags
        if (matchType === 'tags') {
          matchType = 'tags';
        }
      }

      // Bonus points for quality and popularity
      if (server.quality?.score) {
        relevanceScore += Math.min(server.quality.score / 10, 10); // Max 10 bonus points
      }
      
      if (server.repository?.stars) {
        relevanceScore += Math.min(Math.log10(server.repository.stars + 1) * 2, 8); // Max 8 bonus points
      }

      // Bonus for featured/verified servers
      if (server.featured) {
        relevanceScore += 5;
      }
      if (server.verified) {
        relevanceScore += 3;
      }

      // Only include servers with some relevance
      if (relevanceScore > 0) {
        candidates.push({
          server,
          relevanceScore,
          matchType
        });
      }
    });

    // Sort by relevance score (descending) and limit results
    return candidates
      .sort((a, b) => {
        // Primary sort: relevance score
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        
        // Secondary sort: quality score
        const aQuality = a.server.quality?.score || 0;
        const bQuality = b.server.quality?.score || 0;
        if (bQuality !== aQuality) {
          return bQuality - aQuality;
        }
        
        // Tertiary sort: stars
        const aStars = a.server.repository?.stars || 0;
        const bStars = b.server.repository?.stars || 0;
        return bStars - aStars;
      })
      .slice(0, maxResults)
      .map(item => item.server);
  }, [currentServer, allServers, maxResults]);

  return {
    relatedServers,
    isLoading
  };
};