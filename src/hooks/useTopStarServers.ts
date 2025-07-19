import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Simplified interface for star display
export interface StarServer {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: {
    "zh-CN": string;
    en: string;
    [key: string]: string; // Allow other language keys
  };
  tags: string[];
  stats?: {
    stars: number;
  };
  repository?: {
    stars: number;
  };
  metadata?: {
    featured: boolean;
    verified: boolean;
  };
  // Additional optional fields for compatibility
  owner?: string;
  quality?: { score: number };
}

export const useTopStarServers = (limit: number = 300) => {
  return useQuery({
    queryKey: ['topStarServers', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servers_with_details')
        .select(`
          id,
          name,
          slug,
          category_id,
          description_en,
          description_zh_cn,
          tags,
          stars,
          featured,
          verified
        `)
        .order('stars', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top star servers:', error);
        throw error;
      }

      // Transform data to ensure stars field is available
      const transformedData = (data || []).map(server => {
        // Get star count directly from database field
        const stars = server.stars || 0;
        
        return {
          id: server.id,
          name: server.name,
          slug: server.slug,
          category: server.category_id,
          description: {
            "zh-CN": server.description_zh_cn || server.description_en || '',
            en: server.description_en || ''
          },
          tags: server.tags || [],
          stats: {
            stars: stars
          },
          repository: {
            stars: stars
          },
          metadata: {
            featured: server.featured || false,
            verified: server.verified || false
          },
          owner: server.slug?.split('/')?.[0] || ''
        } as StarServer;
      });
            
      return transformedData;
    },
    // Cache for 5 minutes to reduce database load
    staleTime: 5 * 60 * 1000
  });
};