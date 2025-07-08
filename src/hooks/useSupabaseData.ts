import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Category, MCPServer, ServerReadme } from "../types";
import { type LucideIcon, Database, Code, Search, MessageCircle, Brain, Wrench, CheckSquare, Shield, FileText, Cloud, Briefcase, DollarSign, Layers, Folder, BarChart3, Plug, Settings, Globe, Image, CreditCard, Activity, Link2 } from "lucide-react";
import type { FeaturedServer } from "./useFeaturedServers";
import { extractMonorepoName } from "../utils/monorepoNameExtractor";

// Comprehensive icon name mapping for all categories
const iconNameMap: { [key: string]: LucideIcon } = {
  // Basic icon names (as stored in database)
  'Database': Database,
  'Code': Code,
  'Search': Search,
  'MessageCircle': MessageCircle,
  'Brain': Brain,
  'Wrench': Wrench,
  'CheckSquare': CheckSquare,
  'Shield': Shield,
  'FileText': FileText,
  'Cloud': Cloud,
  'Briefcase': Briefcase,
  'DollarSign': DollarSign,
  'Layers': Layers,
  'Folder': Folder,
  'BarChart3': BarChart3,
  'Plug': Plug,
  'Settings': Settings,
  'Globe': Globe,
  'Image': Image,
  'CreditCard': CreditCard,
  'Activity': Activity,
  'Link2': Link2,

  // Lowercase variants
  'database': Database,
  'code': Code,
  'search': Search,
  'messagecircle': MessageCircle,
  'brain': Brain,
  'wrench': Wrench,
  'checksquare': CheckSquare,
  'shield': Shield,
  'filetext': FileText,
  'cloud': Cloud,
  'briefcase': Briefcase,
  'dollarsign': DollarSign,
  'layers': Layers,
  'folder': Folder,
  'barchart3': BarChart3,
  'plug': Plug,
  'settings': Settings,
  'globe': Globe,
  'image': Image,
  'creditcard': CreditCard,
  'activity': Activity,
  'link2': Link2,

  // Category-specific mappings (matching database category IDs)
  'filesystem': Folder,
  'database-storage': Database,
  'communication': MessageCircle,
  'communication-collaboration': MessageCircle,
  'development': Code,
  'development-tools': Code,
  'api-integration': Link2,
  'utilities': Wrench,
  'utilities-tools': Wrench,
  'monitoring': Activity,
  'ai-ml': Brain,
  'ai-machine-learning': Brain,
  'productivity': Briefcase,
  'business-productivity': Briefcase,
  'cloud-infrastructure': Cloud,
  'content': Image,
  'content-media': Image,
  'finance': CreditCard,
  'finance-payments': CreditCard,
  'web': Globe,
  'web-network': Globe,
  'security': Shield,
  'specialized': Layers,
  'specialized-domains': Layers,
};

// Helper function to transform database category to app Category type
function transformCategory(dbCategory: Record<string, unknown>, subcategories: Record<string, unknown>[] = []): Category {
  return {
    id: dbCategory.id as string,
    name: {
      "zh-CN": dbCategory.name_zh_cn as string,
      en: dbCategory.name_en as string,
      "zh-TW": (dbCategory.name_zh_tw || dbCategory.name_en) as string,
      fr: (dbCategory.name_fr || dbCategory.name_en) as string,
      ja: (dbCategory.name_ja || dbCategory.name_en) as string,
      ko: (dbCategory.name_ko || dbCategory.name_en) as string,
      ru: (dbCategory.name_ru || dbCategory.name_en) as string,
    },
    description: {
      "zh-CN": dbCategory.description_zh_cn as string,
      en: dbCategory.description_en as string,
      "zh-TW": (dbCategory.description_zh_tw || dbCategory.description_en) as string,
      fr: (dbCategory.description_fr || dbCategory.description_en) as string,
      ja: (dbCategory.description_ja || dbCategory.description_en) as string,
      ko: (dbCategory.description_ko || dbCategory.description_en) as string,
      ru: (dbCategory.description_ru || dbCategory.description_en) as string,
    },
    icon: iconNameMap[dbCategory.icon as string] || Settings,
    color: (dbCategory.color || "#6B7280") as string,
    serverCount: dbCategory.server_count as number,
    subcategories: subcategories.map(sub => ({
      id: sub.id as string,
      name: {
        "zh-CN": sub.name_zh_cn as string,
        en: sub.name_en as string,
        "zh-TW": (sub.name_zh_tw || sub.name_en) as string,
        fr: (sub.name_fr || sub.name_en) as string,
        ja: (sub.name_ja || sub.name_en) as string,
        ko: (sub.name_ko || sub.name_en) as string,
        ru: (sub.name_ru || sub.name_en) as string,
      },
      description: {
        "zh-CN": sub.description_zh_cn as string,
        en: sub.description_en as string,
        "zh-TW": (sub.description_zh_tw || sub.description_en) as string,
        fr: (sub.description_fr || sub.description_en) as string,
        ja: (sub.description_ja || sub.description_en) as string,
        ko: (sub.description_ko || sub.description_en) as string,
        ru: (sub.description_ru || sub.description_en) as string,
      },
    })),
  };
}

// Helper function to transform database server to app MCPServer type
export function transformServer(dbServer: Record<string, unknown>): MCPServer {
  // Extract monorepo name if this is a monorepo project
  const originalName = dbServer.name as string;
  const githubUrl = dbServer.github_url as string;
  const processedName = extractMonorepoName(githubUrl, originalName);
  return {
    id: dbServer.id as string,
    name: processedName,
    owner: dbServer.owner as string,
    slug: dbServer.slug as string,
    description: {
      "zh-CN": (dbServer.description_zh_cn as string) || "",
      en: (dbServer.description_en as string) || "",
      "zh-TW": (dbServer.description_zh_tw as string) || (dbServer.description_en as string) || "",
      fr: (dbServer.description_fr as string) || (dbServer.description_en as string) || "",
      ja: (dbServer.description_ja as string) || (dbServer.description_en as string) || "",
      ko: (dbServer.description_ko as string) || (dbServer.description_en as string) || "",
      ru: (dbServer.description_ru as string) || (dbServer.description_en as string) || "",
    },
    fullDescription: (dbServer.full_description as string) || "",
    icon: (dbServer.icon as string) || "",
    badges: [], // Will be populated separately if needed
    tags: (dbServer.tags as string[]) || [],
    category: (dbServer.category_id as string) || "",
    subcategory: (dbServer.subcategory_id as string) || "",
    serviceTypes: [],
    techStack: (dbServer.tech_stack as string[]) || [],
    links: {
      github: (dbServer.github_url as string) || "",
      demo: (dbServer.demo_url as string) || null,
      docs: (dbServer.docs_url as string) || null,
    },
    stats: {
      stars: (dbServer.stars as number) || 0,
      forks: (dbServer.forks as number) || 0,
      lastUpdated: (dbServer.last_updated as string) || new Date().toISOString(),
      createdAt: (dbServer.repo_created_at as string) || new Date().toISOString(),
    },
    metadata: {
      complexity: (dbServer.complexity as string) || "medium",
      maturity: (dbServer.maturity as string) || "stable",
      deployment: [], // Will be populated separately if needed
      featured: (dbServer.featured as boolean) || false,
      official: (dbServer.official as boolean) || false,
    },
    categorization: {
      confidence: (dbServer.categorization_confidence as number) || 0.8,
      reason: (dbServer.categorization_reason as string) || "",
      matched_keywords: (dbServer.categorization_keywords as string[]) || [],
    },
    repository: {
      url: (dbServer.github_url as string) || "",
      owner: (dbServer.repository_owner as string) || "",
      name: (dbServer.repository_name as string) || "",
      stars: (dbServer.stars as number) || 0,
      lastUpdated: (dbServer.last_updated as string) || new Date().toISOString(),
      forks: (dbServer.forks as number) || 0,
      watchers: (dbServer.watchers as number) || 0,
      openIssues: (dbServer.open_issues as number) || 0,
    },
    installation: {
      instructions: [], // Will be populated separately if needed
    },
    documentation: {
      readme: (dbServer.readme_content as string) || "",
      api: (dbServer.api_reference as string) || undefined,
      overview: null,
      installation: null,
      examples: undefined,
      api_reference: undefined,
      structured: undefined,
    },
    compatibility: {
      platforms: (dbServer.platforms as string[]) || [],
      nodeVersion: (dbServer.node_version as string) || undefined,
      pythonVersion: (dbServer.python_version as string) || undefined,
      requirements: (dbServer.requirements as string[]) || [],
    },
    quality: {
      score: (dbServer.quality_score as number) || 0,
      factors: {
        documentation: (dbServer.quality_documentation as number) || 0,
        maintenance: (dbServer.quality_maintenance as number) || 0,
        community: (dbServer.quality_community as number) || 0,
        performance: (dbServer.quality_performance as number) || 0,
      },
    },
    usage: {
      downloads: (dbServer.downloads as number) || 0,
      dependents: (dbServer.dependents as number) || 0,
      weeklyDownloads: (dbServer.weekly_downloads as number) || 0,
    },
    featured: (dbServer.featured as boolean) || false,
    latest: (() => {
      // Check if the repository was created within the last 10 days
      const createdAt = new Date(dbServer.repo_created_at as string);
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return createdAt > tenDaysAgo;
    })(),
    createdAt: (dbServer.repo_created_at as string) || new Date().toISOString(),
    updatedAt: (dbServer.last_updated as string) || new Date().toISOString(),
  };
}

// Helper function to transform database server to FeaturedServer type
function transformToFeaturedServer(dbServer: Record<string, unknown>): FeaturedServer | null {
  // Only transform servers that have complete featured server data
  if (!dbServer.featured || !dbServer.featured_icon || !dbServer.featured_rating || !dbServer.featured_badge) {
    return null;
  }

  const iconComponent = iconNameMap[dbServer.featured_icon as string] || FileText;
  
  // Ensure badge value conforms to union type
  const validBadge: "Official" | "Featured" | "Popular" = 
    dbServer.featured_badge === "Official" || dbServer.featured_badge === "Featured" || dbServer.featured_badge === "Popular" 
      ? dbServer.featured_badge as "Official" | "Featured" | "Popular"
      : "Featured";

  return {
    name: dbServer.name as string,
    icon: iconComponent,
    rating: parseFloat(dbServer.featured_rating as string) || 3.5,
    badge: validBadge,
    badgeColor: (dbServer.featured_badge_color as string) || "green",
    description: (dbServer.description_en as string) || (dbServer.full_description as string) || "",
    slug: dbServer.slug as string
  };
}

// Categories hook
export const useSupabaseCategories = () => {
  return useQuery({
    queryKey: ["supabase", "categories"],
    queryFn: async (): Promise<Category[]> => {
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase.from('categories').select('*').order('name_en'),
        supabase.from('subcategories').select('*').order('name_en'),
      ]);

      if (categoriesResult.error) {
        throw new Error(`Failed to fetch categories: ${categoriesResult.error.message}`);
      }

      if (subcategoriesResult.error) {
        throw new Error(`Failed to fetch subcategories: ${subcategoriesResult.error.message}`);
      }

      const categories = categoriesResult.data || [];
      const subcategories = subcategoriesResult.data || [];

      return categories.map(category => {
        const categorySubcategories = subcategories.filter(
          sub => sub.category_id === category.id
        );
        return transformCategory(category, categorySubcategories);
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Servers hook with enhanced data - WARNING: Loads all servers, use paginated version for better performance
export const useSupabaseServers = () => {
  return useQuery({
    queryKey: ["supabase", "servers"],
    queryFn: async (): Promise<MCPServer[]> => {
      const pageSize = 1000;
      let allServers: Record<string, unknown>[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
          .from('servers_with_details')
          .select('*', { count: 'exact' })
          .order('stars', { ascending: false })
          .range(from, to);

        if (error) {
          throw new Error(`Failed to fetch servers (page ${page + 1}): ${error.message}`);
        }

        if (data && data.length > 0) {
          allServers = [...allServers, ...data];
        }

        // 检查是否还有更多数据
        hasMore = data && data.length === pageSize && (!count || allServers.length < count);
        page++;
      }

      return allServers.map(transformServer);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Paginated servers hook - optimized for large datasets
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export const useSupabaseServersPaginated = (
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc',
  filters?: {
    search?: string;
    category?: string | string[];
    platforms?: string[];
    languages?: string[];
    featured?: boolean;
    verified?: boolean;
    qualityScore?: number;
    tags?: string[];
    popular?: boolean;
    latest?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["supabase", "servers", "paginated", page, limit, sortBy, sortOrder, filters],
    queryFn: async (): Promise<PaginatedResult<MCPServer>> => {
      let query = supabase
        .from('servers_with_details')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%,full_description.ilike.%${filters.search}%`);
      }
      
      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          if (filters.category.length > 0) {
            query = query.in('category_id', filters.category);
          }
        } else {
          query = query.eq('category_id', filters.category);
        }
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.verified) {
        query = query.eq('official', true);
      }

      if (filters?.qualityScore) {
        query = query.gte('quality_score', filters.qualityScore);
      }

      if (filters?.tags && filters.tags.length > 0) {
        // Filter servers that contain ANY of the selected tags
        const tagFilters = filters.tags.map(tag => `tags.cs.{"${tag}"}`);
        query = query.or(tagFilters.join(','));
      }

      if (filters?.popular) {
        query = query.or(`stars.gte.1000,forks.gte.100`);
      }

      if (filters?.latest) {
        // Filter for repositories created in the last 10 days
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 60);
        query = query.gte('repo_created_at', tenDaysAgo.toISOString());
      }

      if (filters?.platforms && filters.platforms.length > 0) {
        // Use overlaps operator to check if platforms array contains any of the selected platforms
        query = query.overlaps('platforms', filters.platforms);
      }

      if (filters?.languages && filters.languages.length > 0) {
        // Use overlaps operator to check if tech_stack array contains any of the selected languages
        query = query.overlaps('tech_stack', filters.languages);
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
      query = query.order(actualSortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch paginated servers: ${error.message}`);
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
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated results
  });
};

// Server stats for home page - lightweight version
export const useSupabaseServerStats = () => {
  return useQuery({
    queryKey: ["supabase", "server-stats"],
    queryFn: async () => {
      try {
        // Run multiple queries in parallel for better performance
        const [serversResult, categoriesResult] = await Promise.all([
          // Get server count and sample data for calculations
          supabase
            .from('servers_with_details')
            .select('stars, last_updated, featured, verified', { count: 'exact' })
            .limit(1000),
          
          // Get total categories count directly from categories table
          supabase
            .from('categories')
            .select('id', { count: 'exact', head: true })
        ]);

        if (serversResult.error) {
          console.error('Server stats query error:', serversResult.error);
          throw new Error(`Failed to fetch server stats: ${serversResult.error.message}`);
        }

        if (categoriesResult.error) {
          console.error('Categories count query error:', categoriesResult.error);
        }

        const { data: serversData, count: totalServers } = serversResult;
        const { count: totalCategories } = categoriesResult;

        console.log('Server stats - total servers:', totalServers);
        console.log('Server stats - total categories:', totalCategories);
        console.log('Server stats - sample data:', serversData?.slice(0, 2));

        if (!serversData || serversData.length === 0) {
          console.warn('No server data found');
          return {
            totalServers: totalServers || 0,
            totalStars: 0,
            averageStars: 0,
            activeRepos: 0,
            uniqueCategories: totalCategories || 0,
            featuredCount: 0,
            verifiedCount: 0,
          };
        }

        // Calculate stats from available data
        const serverCount = totalServers || serversData.length;
        
        // Calculate total GitHub stars
        const totalStars = serversData.reduce((sum, server) => {
          const stars = server.stars || 0;
          return sum + (typeof stars === 'number' ? stars : 0);
        }, 0);
        
        // Calculate active repos (repos updated in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeRepos = serversData.filter(server => {
          if (!server.last_updated) return false;
          const lastUpdated = new Date(server.last_updated);
          return lastUpdated > thirtyDaysAgo;
        }).length;
        
        const featuredCount = serversData.filter(s => s.featured === true).length;
        const verifiedCount = serversData.filter(s => s.verified === true).length;
        const uniqueCategories = totalCategories || 0;

        const stats = {
          totalServers: serverCount,
          totalStars,
          averageStars: serverCount > 0 ? Math.round(totalStars / serverCount) : 0,
          activeRepos,
          uniqueCategories,
          featuredCount,
          verifiedCount,
        };

        console.log('Final calculated stats:', stats);
        return stats;
      } catch (error) {
        console.error('Failed to fetch server stats:', error);
        // Return default stats on error
        return {
          totalServers: 0,
          totalStars: 0,
          averageStars: 0,
          activeRepos: 0,
          uniqueCategories: 0,
          featuredCount: 0,
          verifiedCount: 0,
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

// Servers by category with pagination
export const useSupabaseServersByCategoryPaginated = (
  categoryId: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc',
  filters?: {
    search?: string;
    subcategory?: string;
    platforms?: string[];
    languages?: string[];
    qualityScore?: number;
    featured?: boolean;
    verified?: boolean;
    popular?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["supabase", "servers", "category", categoryId, "paginated", page, limit, sortBy, sortOrder, filters],
    queryFn: async (): Promise<PaginatedResult<MCPServer>> => {
      if (!categoryId) {
        return {
          data: [],
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currentPage: page,
          totalPages: 0,
        };
      }

      let query = supabase
        .from('servers_with_details')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId);

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%,full_description.ilike.%${filters.search}%`);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory_id', filters.subcategory);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.verified) {
        query = query.eq('official', true);
      }

      if (filters?.qualityScore) {
        query = query.gte('quality_score', filters.qualityScore);
      }

      if (filters?.popular) {
        query = query.or(`stars.gte.1000,forks.gte.100`);
      }

      if (filters?.platforms && filters.platforms.length > 0) {
        // Use overlaps operator to check if platforms array contains any of the selected platforms
        query = query.overlaps('platforms', filters.platforms);
      }

      if (filters?.languages && filters.languages.length > 0) {
        // Use overlaps operator to check if tech_stack array contains any of the selected languages
        query = query.overlaps('tech_stack', filters.languages);
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
      query = query.order(actualSortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch servers by category: ${error.message}`);
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
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Home page optimized hook - gets categories with limited servers for each
export const useSupabaseHomePageData = () => {
  return useQuery({
    queryKey: ["supabase", "home-page-data"],
    queryFn: async () => {
      // Get categories
      const categoriesResult = await supabase
        .from('categories')
        .select('*')
        .order('name_en');

      if (categoriesResult.error) {
        throw new Error(`Failed to fetch categories: ${categoriesResult.error.message}`);
      }

      // Get top servers for each category (limit 6 per category) + total count
      const categoriesWithServers = await Promise.all(
        (categoriesResult.data || []).map(async (category) => {
          // Get both sample servers and total count in parallel
          const [serversResult, countResult] = await Promise.all([
            supabase
              .from('servers_with_details')
              .select('*')
              .eq('category_id', category.id)
              .order('stars', { ascending: false })
              .limit(6),
            
            supabase
              .from('servers_with_details')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id)
          ]);

          if (serversResult.error) {
            console.warn(`Failed to fetch servers for category ${category.id}:`, serversResult.error);
          }

          if (countResult.error) {
            console.warn(`Failed to fetch count for category ${category.id}:`, countResult.error);
          }

          const transformedCategory = transformCategory(category);
          const servers = serversResult.data ? serversResult.data.map(transformServer) : [];
          const totalCount = countResult.count || servers.length;

          // Update category with server count
          return {
            category: {
              ...transformedCategory,
              serverCount: totalCount
            },
            servers,
          };
        })
      );

      return categoriesWithServers;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized search with pagination
export const useSupabaseSearchServersPaginated = (
  query: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'stars',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useQuery({
    queryKey: ["supabase", "servers", "search", "paginated", query, page, limit, sortBy, sortOrder],
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

      let queryBuilder = supabase
        .from('servers_with_details')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${query}%,description_en.ilike.%${query}%,full_description.ilike.%${query}%`);

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
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Single server hook
export const useSupabaseServer = (slug: string) => {
  return useQuery({
    queryKey: ["supabase", "server", slug || ''],
    queryFn: async (): Promise<MCPServer | null> => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(`Failed to fetch server: ${error.message}`);
      }

      return data ? transformServer(data) : null;
    },
    enabled: true, // Always enabled to allow cached data retrieval in SSR
    staleTime: 5 * 60 * 1000,
  });
};

// Featured servers hook
export const useSupabaseFeaturedServers = () => {
  return useQuery({
    queryKey: ["supabase", "servers", "featured"],
    queryFn: async (): Promise<MCPServer[]> => {
      const { data, error } = await supabase
        .from('featured_servers')
        .select('*')
        .limit(6);

      if (error) {
        throw new Error(`Failed to fetch featured servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Servers by category hook
export const useSupabaseServersByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["supabase", "servers", "category", categoryId],
    queryFn: async (): Promise<MCPServer[]> => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .eq('category_id', categoryId)
        .order('stars', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch servers by category: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Popular servers hook
export const useSupabasePopularServers = () => {
  return useQuery({
    queryKey: ["supabase", "servers", "popular"],
    queryFn: async (): Promise<MCPServer[]> => {
      const { data, error } = await supabase
        .from('popular_servers')
        .select('*')
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch popular servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Recent servers hook
export const useSupabaseRecentServers = () => {
  return useQuery({
    queryKey: ["supabase", "servers", "recent"],
    queryFn: async (): Promise<MCPServer[]> => {
      const { data, error } = await supabase
        .from('recent_servers')
        .select('*')
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch recent servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Search servers hook
export const useSupabaseSearchServers = (query: string) => {
  return useQuery({
    queryKey: ["supabase", "servers", "search", query],
    queryFn: async (): Promise<MCPServer[]> => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from('servers_with_details')
        .select('*')
        .or(`name.ilike.%${query}%,description_en.ilike.%${query}%,full_description.ilike.%${query}%`)
        .order('stars', { ascending: false });

      if (error) {
        throw new Error(`Failed to search servers: ${error.message}`);
      }

      return (data || []).map(transformServer);
    },
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Server README hook
export const useSupabaseServerReadme = (serverId: string) => {
  return useQuery({
    queryKey: ["supabase", "readme", serverId],
    queryFn: async (): Promise<ServerReadme | null> => {
      if (!serverId || serverId.trim() === '') {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('server_readmes')
          .select('*')
          .eq('server_id', serverId)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results

        if (error) {
          console.warn(`README fetch error for server ${serverId}:`, error);
          return null; // Return null instead of throwing for any error
        }

        if (!data) {
          console.log(`No README found for server ${serverId}`);
          return null;
        }

        return {
          filename: data.filename,
          projectName: data.project_name,
          rawContent: data.raw_content,
          extractedInstallation: data.extracted_installation,
          extractedApiReference: data.extracted_api_reference,
          extractionStatus: data.extraction_status,
          extractedAt: data.extracted_at,
        };
      } catch (error) {
        console.warn(`README fetch failed for server ${serverId}:`, error);
        return null; // Always return null on error instead of throwing
      }
    },
    enabled: !!serverId && serverId.trim() !== '',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on failure
  });
};

// Featured servers by category hook
export const useSupabaseFeaturedServersByCategory = () => {
  return useQuery({
    queryKey: ["supabase", "featured-servers-by-category"],
    queryFn: async (): Promise<Record<string, FeaturedServer[]>> => {
      const { data, error } = await supabase
        .from('featured_servers_by_category')
        .select('*')
        .order('category_id')
        .order('featured_rating', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch featured servers by category: ${error.message}`);
      }

      const result: Record<string, FeaturedServer[]> = {};
      
      (data || []).forEach(dbServer => {
        const featuredServer = transformToFeaturedServer(dbServer);
        if (featuredServer && dbServer.category_id) {
          if (!result[dbServer.category_id]) {
            result[dbServer.category_id] = [];
          }
          result[dbServer.category_id].push(featuredServer);
        }
      });

      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get featured servers by category ID (utility function)
export const getSupabaseFeaturedServersByCategory = (categoryId: string, featuredData?: Record<string, FeaturedServer[]>): FeaturedServer[] => {
  if (featuredData) {
    return featuredData[categoryId] || [];
  }
  return [];
};

// Popular tags hook
export interface PopularTag {
  tag: string;
  count: number;
}

export const useSupabasePopularTags = (limit: number = 12) => {
  return useQuery({
    queryKey: ["supabase", "popular-tags", limit],
    queryFn: async (): Promise<PopularTag[]> => {
      const { data, error } = await supabase
        .from('servers_with_details')
        .select('tags');

      if (error) {
        throw new Error(`Failed to fetch popular tags: ${error.message}`);
      }

      // Count tag frequency
      const tagCounts: Record<string, number> = {};
      
      (data || []).forEach(server => {
        if (server.tags && Array.isArray(server.tags)) {
          server.tags.forEach((tag: string) => {
            if (tag && tag.trim()) {
              const cleanTag = tag.trim().toLowerCase();
              tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
            }
          });
        }
      });

      // Convert to array and sort by frequency
      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return popularTags;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};