import {
  useSupabaseCategories,
  useSupabaseServers,
  useSupabaseServer,
  useSupabaseFeaturedServers,
  useSupabaseServersByCategory,
  useSupabasePopularServers,
  useSupabaseRecentServers,
  useSupabaseSearchServers,
  useSupabaseServerReadme,
  useSupabaseServersPaginated,
  useSupabaseServerStats,
  useSupabaseServersByCategoryPaginated,
  useSupabaseHomePageData,
  useSupabaseSearchServersPaginated,
  type PaginatedResult
} from "./useSupabaseData";

// Unified data hooks - now only using Supabase
export const useCategories = () => {
  return useSupabaseCategories();
};

export const useServers = () => {
  return useSupabaseServers();
};

export const useServer = (id: string) => {
  return useSupabaseServer(id);
};

export const useFeaturedServers = () => {
  return useSupabaseFeaturedServers();
};

export const useServersByCategory = (categoryId: string) => {
  return useSupabaseServersByCategory(categoryId);
};

export const useServerReadme = (serverId: string) => {
  return useSupabaseServerReadme(serverId);
};

export const usePopularServers = () => {
  return useSupabasePopularServers();
};

export const useRecentServers = () => {
  return useSupabaseRecentServers();
};

// Legacy hook - use useSearchServersPaginated instead for better performance
export const useSearchServers = (query: string) => {
  console.warn('useSearchServers is deprecated. Use useSearchServersPaginated instead for better performance.');
  return useSupabaseSearchServers(query);
};

// Optimized hooks for better performance
export const useServersPaginated = (
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc',
  filters?: {
    search?: string;
    category?: string;
    platforms?: string[];
    languages?: string[];
    featured?: boolean;
    verified?: boolean;
    qualityScore?: number;
  }
) => {
  return useSupabaseServersPaginated(page, limit, sortBy, sortOrder, filters);
};

export const useServerStats = () => {
  return useSupabaseServerStats();
};

export const useServersByCategoryPaginated = (
  categoryId: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useSupabaseServersByCategoryPaginated(categoryId, page, limit, sortBy, sortOrder);
};

export const useHomePageData = () => {
  return useSupabaseHomePageData();
};

export const useSearchServersPaginated = (
  query: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useSupabaseSearchServersPaginated(query, page, limit, sortBy, sortOrder);
};

// Export PaginatedResult type for component use
export type { PaginatedResult };

// Data source info - always Supabase now
export const getDataSource = () => 'supabase';
export const isUsingSupabase = () => true;