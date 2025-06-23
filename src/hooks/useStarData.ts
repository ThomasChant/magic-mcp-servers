import { useMemo } from 'react';
import type { MCPServer } from '../types';

interface StarData {
  id: string;
  server: MCPServer;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  brightness: number;
  color: string;
  categoryColor: string;
  zIndex: number;
}

interface UseStarDataOptions {
  maxStars?: number;
  enableCategoryFilter?: boolean;
  selectedCategory?: string;
  searchQuery?: string;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'database': '#3b82f6',         // blue
    'ai-ml': '#8b5cf6',           // purple  
    'development': '#10b981',      // green
    'cloud-infrastructure': '#06b6d4', // cyan
    'business-productivity': '#f59e0b', // amber
    'communication': '#ec4899',    // pink
    'content-media': '#84cc16',    // lime
    'finance-payments': '#22c55e', // green
    'utilities': '#6b7280',        // gray
    'web-network': '#f97316',      // orange
    'specialized': '#64748b',      // slate
  };
  return colors[category] || '#6b7280';
};

const getStarSize = (stars: number): 'small' | 'medium' | 'large' | 'extra-large' => {
  if (stars >= 50) return 'extra-large';
  if (stars >= 11) return 'large';
  if (stars >= 1) return 'medium';
  return 'small';
};

const getStarBrightness = (forks: number): number => {
  if (forks >= 20) return 1.0;
  if (forks >= 6) return 0.8;
  if (forks >= 1) return 0.6;
  return 0.4;
};

const generateStarPositions = (count: number): Array<{x: number, y: number}> => {
  const positions: Array<{x: number, y: number}> = [];
  const minDistance = 8; // Minimum distance between stars (percentage)
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let position: {x: number, y: number};
    
    do {
      position = {
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      attempts++;
    } while (
      attempts < 50 && 
      positions.some(pos => {
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      })
    );
    
    positions.push(position);
  }
  
  return positions;
};

export const useStarData = (
  servers: MCPServer[], 
  options: UseStarDataOptions = {}
): StarData[] => {
  const {
    maxStars = 250,
    enableCategoryFilter = false,
    selectedCategory,
    searchQuery = '',
  } = options;

  return useMemo(() => {
    if (!servers || servers.length === 0) return [];

    // Filter servers based on search and category
    let filteredServers = servers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredServers = filteredServers.filter(server =>
        server.name.toLowerCase().includes(query) ||
        server.description["zh-CN"].toLowerCase().includes(query) ||
        server.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (enableCategoryFilter && selectedCategory) {
      filteredServers = filteredServers.filter(server => 
        server.category === selectedCategory
      );
    }

    // Sort by popularity (stars + forks + quality score)
    const sortedServers = filteredServers
      .map(server => ({
        server,
        popularity: (server.stats?.stars || 0) * 3 + 
                   (server.stats?.forks || 0) * 2 + 
                   (server.quality?.score || 0) * 0.1 +
                   (server.metadata?.featured ? 50 : 0) +
                   (server.metadata?.verified ? 25 : 0)
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, maxStars)
      .map(item => item.server);

    // Generate positions for stars
    const positions = generateStarPositions(sortedServers.length);

    // Create star data
    return sortedServers.map((server, index) => {
      const stars = server.stats?.stars || 0;
      const forks = server.stats?.forks || 0;
      const size = getStarSize(stars);
      const brightness = getStarBrightness(forks);
      const categoryColor = getCategoryColor(server.category);
      
      // Calculate z-index based on popularity
      const zIndex = Math.floor(brightness * 10) + (size === 'extra-large' ? 20 : size === 'large' ? 15 : size === 'medium' ? 10 : 5);

      return {
        id: server.id,
        server,
        x: positions[index].x,
        y: positions[index].y,
        size,
        brightness,
        color: categoryColor,
        categoryColor,
        zIndex,
      };
    });
  }, [servers, maxStars, enableCategoryFilter, selectedCategory, searchQuery]);
};

export type { StarData };