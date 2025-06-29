import {
  useSupabaseCategories,
  useSupabaseServers,
  useSupabaseServer,
  useSupabaseFeaturedServers,
  useSupabaseServersByCategory,
  useSupabasePopularServers,
  useSupabaseRecentServers,
  useSupabaseSearchServers,
  useSupabaseServerReadme
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

export const useSearchServers = (query: string) => {
  return useSupabaseSearchServers(query);
};

// Data source info - always Supabase now
export const getDataSource = () => 'supabase';
export const isUsingSupabase = () => true;