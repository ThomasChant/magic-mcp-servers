import { useQuery } from "@tanstack/react-query";
import { 
  useSupabaseCategories, 
  useSupabaseServers, 
  useSupabaseServersPaginated,
  useSupabaseServersByCategoryPaginated,
  useSupabaseHomePageData,
  useSupabaseServerStats,
  useSupabasePopularTags,
  transformServer,
  type PopularTag
} from "./useSupabaseData";
import { supabase } from "../lib/supabase";
import type { MCPServer } from "../types";

// Define and export PaginatedResult interface
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

// Re-export PopularTag interface
export type { PopularTag };

// Re-export main hooks for unified API
export const useCategories = useSupabaseCategories;
export const useServers = useSupabaseServers;
export const useServersPaginated = useSupabaseServersPaginated;
export const useServersByCategory = (categoryId: string) => {
  console.warn('useServersByCategory is deprecated. Use useServersByCategoryPaginated instead for better performance.');
  const { data: paginatedResult } = useSupabaseServersByCategoryPaginated(categoryId, 1, 1000);
  return {
    data: paginatedResult?.data || [],
    isLoading: false,
    error: null
  };
};
export const useServersByCategoryPaginated = useSupabaseServersByCategoryPaginated;
export const useHomePageData = useSupabaseHomePageData;
export const useServerStats = useSupabaseServerStats;
export const usePopularTags = useSupabasePopularTags;

// Search servers with full-text search and tag filtering
export const useSearchServersPaginated = (
  query: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useQuery({
    queryKey: ["search", "servers", "paginated", query, page, limit, sortBy, sortOrder],
    queryFn: async (): Promise<PaginatedResult<MCPServer>> => {
      if (!query.trim()) {
        return {
          data: [],
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currentPage: page,
          totalPages: 0,
        };
      }

      // Parse search query for special syntax
      let searchFilter = '';
      let tagFilter = '';
      
      // Check if query contains tag: syntax
      const tagMatch = query.match(/tag:([^\s]+)/);
      if (tagMatch) {
        tagFilter = tagMatch[1];
        // Remove tag: part from search query
        searchFilter = query.replace(/tag:[^\s]+\s*/, '').trim();
      } else {
        searchFilter = query.trim();
      }

      let queryBuilder = supabase
        .from('servers_with_details')
        .select('*', { count: 'exact' });

      // Apply tag filter if specified
      if (tagFilter) {
        // Use array contains operation to find servers with the specific tag
        // Try both exact match and case-insensitive search
        queryBuilder = queryBuilder.or(
          `tags.cs.{${tagFilter}},tags.cs.{${tagFilter.toLowerCase()}},tags.cs.{${tagFilter.toUpperCase()}}`
        );
      }

      // Apply text search if there's a search term
      if (searchFilter) {
        // Search in name, description, and full_description fields
        queryBuilder = queryBuilder.or(
          `name.ilike.%${searchFilter}%,description_en.ilike.%${searchFilter}%,full_description.ilike.%${searchFilter}%`
        );
      }

      // Map sort field to actual database column names
      const sortColumnMap: Record<string, string> = {
        'quality': 'quality_score',
        'stars': 'stars',
        'updated': 'last_updated',
        'created': 'repo_created_at',
        'name': 'name',
        'downloads': 'downloads',
        'forks': 'forks'
      };
      
      const actualSortColumn = sortColumnMap[sortBy] || sortBy;

      // Apply sorting
      queryBuilder = queryBuilder.order(actualSortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) {
        console.error('Search error:', error);
        throw new Error(`Failed to search servers: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: (data || []).map(transformServer),
        total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        currentPage: page,
        totalPages,
      };
    },
    enabled: !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds for search results
  });
};

// Legacy search hook - deprecated
export const useSearchServers = (query: string) => {
  console.warn('useSearchServers is deprecated. Use useSearchServersPaginated instead for better performance.');
  const { data: paginatedResult } = useSearchServersPaginated(query, 1, 1000);
  return {
    data: paginatedResult?.data || [],
    isLoading: false,
    error: null
  };
};

// Server by slug/id
export const useServer = (slug: string) => {
  return useQuery({
    queryKey: ["server", slug],
    queryFn: async (): Promise<MCPServer | null> => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw new Error(`Failed to fetch server: ${error.message}`);
      }

      return data ? transformServer(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Featured servers
export const useFeaturedServers = () => {
  return useQuery({
    queryKey: ["featured", "servers"],
    queryFn: async (): Promise<MCPServer[]> => {
      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .eq('featured', true)
        .order('stars', { ascending: false })
        .limit(12);

      if (error) {
        throw new Error(`Failed to fetch featured servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Popular servers (alias for featured)
export const usePopularServers = useFeaturedServers;

// Recent servers
export const useRecentServers = () => {
  return useQuery({
    queryKey: ["recent", "servers"],
    queryFn: async (): Promise<MCPServer[]> => {
      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(12);

      if (error) {
        throw new Error(`Failed to fetch recent servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Server README
export const useServerReadme = (serverId: string) => {
  return useQuery({
    queryKey: ["server", "readme", serverId],
    queryFn: async () => {
      if (!serverId) return null;

      const { data, error } = await supabase
        .from('server_readmes')
        .select('*')
        .eq('server_id', serverId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch README: ${error.message}`);
      }

      return data;
    },
    enabled: !!serverId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};