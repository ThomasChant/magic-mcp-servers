import { useMemo } from 'react';
import type { MCPServer } from '../types';
import type { StarServer } from './useTopStarServers';

interface StarData {
  id: string;
  server: MCPServer | StarServer;
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

const getStarSize = (stars: number, maxStars: number): 'small' | 'medium' | 'large' | 'extra-large' => {
  const percentage = maxStars > 0 ? stars / maxStars : 0;
  if (percentage >= 0.8) return 'extra-large';
  if (percentage >= 0.6) return 'large';
  if (percentage >= 0.4) return 'medium';
  return 'small';
};

const getStarBrightness = (stars: number, maxStars: number): number => {
  const percentage = maxStars > 0 ? stars / maxStars : 0;
  if (percentage >= 0.8) return 1.0;
  if (percentage >= 0.6) return 0.85;
  if (percentage >= 0.4) return 0.7;
  return 0.55;
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
  servers: (MCPServer | StarServer)[], 
  options: UseStarDataOptions = {}
): StarData[] => {
  const {
    maxStars = 500,
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
        (server.description?.["zh-CN"] || '').toLowerCase().includes(query) ||
        (server.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (enableCategoryFilter && selectedCategory) {
      filteredServers = filteredServers.filter(server => 
        server.category === selectedCategory
      );
    }

    // Sort by star count to get top 20% by stars
    const serversByStars = filteredServers
      .map(server => ({
        server,
        stars: server.stats?.stars || server.repository?.stars || 0
      }))
      .sort((a, b) => b.stars - a.stars);

    // Calculate top 20% threshold
    // const top20PercentCount = Math.max(1, Math.ceil(serversByStars.length * 0.2));
    // const topStarServers = serversByStars.slice(0, top20PercentCount);
    
    // Limit to maxStars for performance
    const selectedServers = serversByStars
        .slice(0, maxStars)
        .map((item) => item.server);

    // Generate positions for stars
    const positions = generateStarPositions(selectedServers.length);

    // Find the maximum star count for scaling
    const starCnt = [
      ...selectedServers.map(server =>
        server.stats?.stars || server.repository?.stars || 0
      )
    ]

    const sumStars = starCnt.reduce((sum, curr) => sum + curr, 0);
    const avgStars = sumStars / selectedServers.length;

    // Create star data
    return selectedServers.map((server, index) => {
      const stars = server.stats?.stars || server.repository?.stars || 0;
      const size = getStarSize(stars, avgStars);
      const brightness = getStarBrightness(stars, avgStars);
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
        color: '#ffffff',
        categoryColor,
        zIndex,
      };
    });
  }, [servers, maxStars, enableCategoryFilter, selectedCategory, searchQuery]);
};

export type { StarData };