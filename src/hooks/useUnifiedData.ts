import {
    useCategories as useJsonCategories,
    useServers as useJsonServers,
    useServer as useJsonServer,
    useFeaturedServers as useJsonFeaturedServers,
    useServersByCategory as useJsonServersByCategory,
    useServerReadme as useJsonServerReadme
} from "./useData";

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

// Feature flag to toggle between JSON and Supabase
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Unified data hooks that automatically use the correct data source
export const useCategories = () => {
  const supabaseResult = useSupabaseCategories();
  const jsonResult = useJsonCategories();
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

export const useServers = () => {
  const supabaseResult = useSupabaseServers();
  const jsonResult = useJsonServers();
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

export const useServer = (id: string) => {
  const supabaseResult = useSupabaseServer(id);
  const jsonResult = useJsonServer(id);
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

export const useFeaturedServers = () => {
  const supabaseResult = useSupabaseFeaturedServers();
  const jsonResult = useJsonFeaturedServers();
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

export const useServersByCategory = (categoryId: string) => {
  const supabaseResult = useSupabaseServersByCategory(categoryId);
  const jsonResult = useJsonServersByCategory(categoryId);
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

export const useServerReadme = (serverId: string) => {
  const supabaseResult = useSupabaseServerReadme(serverId);
  const jsonResult = useJsonServerReadme(serverId);
  return USE_SUPABASE ? supabaseResult : jsonResult;
};

// Supabase-only hooks (fallback to empty data for JSON)
export const usePopularServers = () => {
  const supabaseResult = useSupabasePopularServers();
  const featuredServers = useJsonFeaturedServers();
  
  if (USE_SUPABASE) {
    return supabaseResult;
  }
  
  // Fallback: use featured servers for JSON mode
  return {
    ...featuredServers,
    data: featuredServers.data?.slice(0, 10) || []
  };
};

export const useRecentServers = () => {
  const supabaseResult = useSupabaseRecentServers();
  const allServers = useJsonServers();
  
  if (USE_SUPABASE) {
    return supabaseResult;
  }
  
  // Fallback: sort JSON servers by last updated
  return {
    ...allServers,
    data: allServers.data
      ?.sort((a, b) => new Date(b.stats.lastUpdated).getTime() - new Date(a.stats.lastUpdated).getTime())
      .slice(0, 10) || []
  };
};

export const useSearchServers = (query: string) => {
  const supabaseResult = useSupabaseSearchServers(query);
  const allServers = useJsonServers();
  
  if (USE_SUPABASE) {
    return supabaseResult;
  }
  
  // Fallback: filter JSON servers locally
  return {
    ...allServers,
    data: allServers.data?.filter(server => 
      server.name.toLowerCase().includes(query.toLowerCase()) ||
      server.fullDescription.toLowerCase().includes(query.toLowerCase()) ||
      server.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ) || []
  };
};

// Data source info
export const getDataSource = () => USE_SUPABASE ? 'supabase' : 'json';
export const isUsingSupabase = () => USE_SUPABASE;