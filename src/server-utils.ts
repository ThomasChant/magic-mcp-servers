import { createClient } from '@supabase/supabase-js';
import type { MCPServer, ServerReadme } from "./types";

// Helper function to transform database server to app MCPServer type (server-side version)
function transformServer(dbServer: Record<string, unknown>): MCPServer {
  return {
    id: dbServer.id as string,
    name: dbServer.name as string,
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
    category: (dbServer.category as string) || "",
    subcategory: (dbServer.subcategory as string) || "",
    tags: (dbServer.tags as string[]) || [],
    techStack: (dbServer.tech_stack as string[]) || [],
    featured: (dbServer.featured as boolean) || false,
    verified: (dbServer.verified as boolean) || false,
    metadata: {
      qualityScore: (dbServer.quality_score as number) || 0,
      maturity: (dbServer.maturity as string) || "unknown",
      complexity: (dbServer.complexity as string) || "medium",
      maintenanceStatus: (dbServer.maintenance_status as string) || "unknown",
    },
    repository: {
      owner: (dbServer.owner as string) || "",
      name: (dbServer.repository_name as string) || "",
      url: (dbServer.repository_url as string) || "",
      stars: (dbServer.stars as number) || 0,
      forks: (dbServer.forks as number) || 0,
      watchers: (dbServer.watchers as number) || 0,
      issues: (dbServer.issues as number) || 0,
      lastCommit: (dbServer.last_commit as string) || "",
      language: (dbServer.language as string) || "",
    },
    stats: {
      createdAt: (dbServer.created_at as string) || "",
      lastUpdated: (dbServer.last_updated as string) || "",
      downloads: (dbServer.downloads as number) || 0,
    },
    installation: {
      npm: (dbServer.installation_npm as string) || "",
      pip: (dbServer.installation_pip as string) || "",
      docker: (dbServer.installation_docker as string) || "",
      manual: (dbServer.installation_manual as string) || "",
      uv: (dbServer.installation_uv as string) || "",
    },
    compatibility: {
      platforms: (dbServer.platforms as string[]) || [],
      pythonVersion: (dbServer.python_version as string) || "",
      nodeVersion: (dbServer.node_version as string) || "",
    },
    documentation: {
      readme: (dbServer.readme as string) || "",
      examples: (dbServer.examples as string[]) || [],
      apiDocs: (dbServer.api_docs as string) || "",
    },
    usage: {
      downloads: (dbServer.downloads as number) || 0,
      dependents: (dbServer.dependents as number) || 0,
    },
  };
}

// Server-side function to fetch server data by slug
export async function getServerBySlug(slug: string): Promise<MCPServer | null> {
  if (!slug) return null;

  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://lptsvryohchbklxcyoyc.supabase.co';
                    
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdHN2cnlvaGNoYmtseGN5b3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODY0MzUsImV4cCI6MjA2NjY2MjQzNX0.hEleXmYktD79nKq4Q6Ow-9KF0RWRgGOJjXLgglyK2GQ';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabase
      .from('servers_with_details')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error(`Failed to fetch server with slug ${slug}:`, error.message);
      return null;
    }

    return data ? transformServer(data) : null;
  } catch (err) {
    console.error(`Error fetching server with slug ${slug}:`, err);
    return null;
  }
}

// Generate SEO metadata for server detail page
export function generateServerSEO(server: MCPServer | null, url: string) {
  if (!server) {
    return {
      title: "Server Not Found - Magic MCP",
      description: "The requested MCP server could not be found.",
      ogTitle: "Server Not Found - Magic MCP",
      ogDescription: "The requested MCP server could not be found.",
      ogUrl: url,
      ogImage: "https://magicmcp.net/og-image.png",
      canonicalUrl: url,
    };
  }

  const description = server.fullDescription || 
    server.description.en || 
    server.description["zh-CN"] || 
    `${server.name} - A Model Context Protocol server`;

  const title = `${server.name} - ${server.category} MCP Server | Magic MCP`;
  
  // Clean and truncate description - ensure proper encoding and HTML safety
  const cleanDescription = description
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, ' ') // Replace emojis with space
    .replace(/[\uFFFD\uFFF9-\uFFFB]/g, '') // Remove replacement/special characters
    .replace(/&/g, '&amp;') // Escape HTML entities
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/<|>/g, '')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
    
  const fullDescription = cleanDescription.length > 160 
    ? cleanDescription.substring(0, 157) + "..." 
    : cleanDescription;

  return {
    title,
    description: fullDescription,
    ogTitle: title,
    ogDescription: fullDescription,
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: [
      "MCP",
      "Model Context Protocol",
      server.name,
      server.category,
      ...server.tags,
      ...server.techStack,
    ].join(", "),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": server.name,
      "description": fullDescription,
      "url": server.repository.url,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": server.compatibility.platforms.join(", "),
      "programmingLanguage": server.repository.language,
      "author": {
        "@type": "Person",
        "name": server.owner
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": server.repository.stars > 0 ? Math.min(5, server.repository.stars / 100) : 4,
        "reviewCount": server.repository.stars
      },
      "datePublished": server.stats.createdAt,
      "dateModified": server.stats.lastUpdated,
    }
  };
}

// Server-side function to fetch README data by server slug
export async function getServerReadmeBySlug(slug: string): Promise<ServerReadme | null> {
  if (!slug) return null;

  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://lptsvryohchbklxcyoyc.supabase.co';
                    
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdHN2cnlvaGNoYmtseGN5b3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODY0MzUsImV4cCI6MjA2NjY2MjQzNX0.hEleXmYktD79nKq4Q6Ow-9KF0RWRgGOJjXLgglyK2GQ';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    // First get the server ID by slug
    const { data: serverData, error: serverError } = await supabase
      .from('servers_with_details')
      .select('id')
      .eq('slug', slug)
      .single();

    if (serverError || !serverData) {
      console.log(`Server not found for slug ${slug}:`, serverError?.message);
      return null;
    }

    // Then get the README data using server ID
    const { data, error } = await supabase
      .from('server_readmes')
      .select('*')
      .eq('server_id', serverData.id)
      .maybeSingle();

    if (error) {
      console.warn(`README fetch error for server ${slug}:`, error);
      return null;
    }

    if (!data) {
      console.log(`No README found for server ${slug}`);
      return null;
    }

    return {
      filename: data.filename,
      projectName: data.project_name,
      rawContent: data.raw_content,
    };
  } catch (err) {
    console.error(`Error fetching README for server ${slug}:`, err);
    return null;
  }
}

// Generate SEO metadata for home page
export function generateHomeSEO(url: string) {
  return {
    title: "Magic MCP - Model Context Protocol 服务器发现平台",
    description: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。浏览超过200个高质量的MCP服务器，涵盖数据库、文件系统、API集成等各种功能领域。",
    ogTitle: "Magic MCP - Model Context Protocol 服务器发现平台",
    ogDescription: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。浏览超过200个高质量的MCP服务器，涵盖数据库、文件系统、API集成等各种功能领域。",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP, Model Context Protocol, AI工具, 服务器, 数据库集成, API, 开发工具",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Magic MCP",
      "url": "https://magicmcp.net",
      "description": "Model Context Protocol 服务器发现平台",
      "publisher": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://magicmcp.net/servers?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  };
}

// Generate SEO metadata for servers listing page  
export function generateServersListSEO(url: string) {
  return {
    title: "MCP 服务器目录 - 浏览所有服务器 | Magic MCP",
    description: "浏览完整的 Model Context Protocol 服务器目录。超过200个经过验证的MCP服务器，涵盖数据库、文件系统、API集成、开发工具等各个领域。",
    ogTitle: "MCP 服务器目录 - 浏览所有服务器 | Magic MCP", 
    ogDescription: "浏览完整的 Model Context Protocol 服务器目录。超过200个经过验证的MCP服务器，涵盖数据库、文件系统、API集成、开发工具等各个领域。",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP服务器, Model Context Protocol, 服务器目录, 数据库集成, API工具, 开发工具",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "MCP 服务器目录",
      "description": "Model Context Protocol 服务器完整目录",
      "url": url,
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Servers",
        "description": "Collection of Model Context Protocol servers"
      }
    }
  };
}

// Generate SEO metadata for categories page
export function generateCategoriesListSEO(url: string) {
  return {
    title: "MCP 服务器分类 - 按功能浏览 | Magic MCP",
    description: "按功能分类浏览 Model Context Protocol 服务器。包括数据库、文件系统、API集成、开发工具、AI助手等多个分类，快速找到适合的MCP服务器。",
    ogTitle: "MCP 服务器分类 - 按功能浏览 | Magic MCP",
    ogDescription: "按功能分类浏览 Model Context Protocol 服务器。包括数据库、文件系统、API集成、开发工具、AI助手等多个分类，快速找到适合的MCP服务器。",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png", 
    canonicalUrl: url,
    keywords: "MCP分类, Model Context Protocol, 服务器分类, 数据库, 文件系统, API集成, 开发工具",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "MCP 服务器分类",
      "description": "Model Context Protocol 服务器按功能分类",
      "url": url,
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Categories",
        "description": "Categories of Model Context Protocol servers"
      }
    }
  };
}

// Server-side function to fetch category data by ID
export async function getCategoryById(categoryId: string): Promise<any | null> {
  if (!categoryId) return null;

  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://lptsvryohchbklxcyoyc.supabase.co';
                    
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdHN2cnlvaGNoYmtseGN5b3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODY0MzUsImV4cCI6MjA2NjY2MjQzNX0.hEleXmYktD79nKq4Q6Ow-9KF0RWRgGOJjXLgglyK2GQ';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      console.error(`Failed to fetch category with id ${categoryId}:`, error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Error fetching category with id ${categoryId}:`, err);
    return null;
  }
}

// Generate SEO metadata for category detail page
export function generateCategorySEO(category: any | null, url: string) {
  if (!category) {
    return {
      title: "分类未找到 - Magic MCP",
      description: "请求的MCP服务器分类未找到。",
      ogTitle: "分类未找到 - Magic MCP",
      ogDescription: "请求的MCP服务器分类未找到。",
      ogUrl: url,
      ogImage: "https://magicmcp.net/og-image.png",
      canonicalUrl: url,
    };
  }

  const categoryName = category.name_zh_cn || category.name_en || category.name || "未知分类";
  const categoryDesc = category.description_zh_cn || category.description_en || category.description || "";
  
  const title = `${categoryName} MCP 服务器 | Magic MCP`;
  const description = categoryDesc ? 
    `探索 ${categoryName} 类别的 Model Context Protocol 服务器。${categoryDesc}` :
    `浏览 ${categoryName} 类别下的所有 Model Context Protocol 服务器，找到适合您需求的工具。`;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: `MCP, Model Context Protocol, ${categoryName}, 服务器, 工具`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryName} MCP Servers`,
      "description": description,
      "url": url,
      "mainEntity": {
        "@type": "ItemList",
        "name": `${categoryName} Servers`,
        "description": `Collection of ${categoryName} Model Context Protocol servers`
      }
    }
  };
}

// Generate SEO metadata for docs page
export function generateDocsSEO(url: string) {
  return {
    title: "文档 - 如何使用 MCP 服务器 | Magic MCP",
    description: "学习如何安装、配置和使用 Model Context Protocol 服务器。包含详细的设置指南、最佳实践和常见问题解答。",
    ogTitle: "文档 - 如何使用 MCP 服务器 | Magic MCP",
    ogDescription: "学习如何安装、配置和使用 Model Context Protocol 服务器。包含详细的设置指南、最佳实践和常见问题解答。",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP文档, Model Context Protocol, 安装指南, 配置教程, 使用说明",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "name": "MCP 服务器使用文档",
      "description": "Model Context Protocol 服务器完整使用指南",
      "url": url,
      "author": {
        "@type": "Organization",
        "name": "Magic MCP"
      }
    }
  };
}

// Server-side function to fetch home page data
export async function getHomePageData(): Promise<{
  serverStats?: any;
  categories?: any[];
  featuredServers?: MCPServer[];
  recentServers?: MCPServer[];
  homeServers?: MCPServer[];
} | null> {
  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://lptsvryohchbklxcyoyc.supabase.co';
                    
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdHN2cnlvaGNoYmtseGN5b3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODY0MzUsImV4cCI6MjA2NjY2MjQzNX0.hEleXmYktD79nKq4Q6Ow-9KF0RWRgGOJjXLgglyK2GQ';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    console.log('🏠 Fetching home page data from Supabase...');
    
    // Fetch multiple data sources in parallel
    const [
      serversResult,
      categoriesResult,
      featuredResult
    ] = await Promise.all([
      // Get server stats
      supabase
        .from('servers_with_details')
        .select('stars, last_updated, featured, verified', { count: 'exact' })
        .limit(1000),
      
      // Get categories with counts
      supabase
        .from('categories')
        .select('id, name_en, description_en, icon, color', { count: 'exact' }),
      
      // Get featured servers
      supabase
        .from('servers_with_details')
        .select('*')
        .eq('featured', true)
        .order('stars', { ascending: false })
        .limit(6)
    ]);

    console.log('📊 Supabase queries completed');

    if (serversResult.error) {
      console.error('Server stats query error:', serversResult.error);
      throw new Error(`Failed to fetch server stats: ${serversResult.error.message}`);
    }

    if (categoriesResult.error) {
      console.error('Categories query error:', categoriesResult.error);
    }

    if (featuredResult.error) {
      console.error('Featured servers query error:', featuredResult.error);
    }

    const { data: serversData, count: totalServers } = serversResult;
    const { data: categoriesData, count: totalCategories } = categoriesResult;
    const { data: featuredData } = featuredResult;

    // Calculate server statistics
    let serverStats = null;
    if (serversData && serversData.length > 0) {
      const totalStars = serversData.reduce((sum, server) => {
        const stars = server.stars || 0;
        return sum + (typeof stars === 'number' ? stars : 0);
      }, 0);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeRepos = serversData.filter(server => {
        if (!server.last_updated) return false;
        const lastUpdated = new Date(server.last_updated);
        return lastUpdated > thirtyDaysAgo;
      }).length;
      
      const featuredCount = serversData.filter(s => s.featured === true).length;
      const verifiedCount = serversData.filter(s => s.verified === true).length;

      serverStats = {
        totalServers: totalServers || 0,
        totalStars,
        averageStars: totalServers > 0 ? Math.round(totalStars / totalServers) : 0,
        activeRepos,
        uniqueCategories: totalCategories || 0,
        featuredCount,
        verifiedCount,
      };
    }

    // Transform featured servers
    const featuredServers = featuredData ? featuredData.map(transformServer) : [];

    // Get some servers for the home page Servers component
    console.log('🔍 Fetching home servers for SSR...');
    const homeServersResult = await supabase
      .from('servers_with_details')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(36); // Match the default limit in Servers component

    console.log('📊 Home servers query result:', {
      data: homeServersResult.data ? `${homeServersResult.data.length} servers` : 'null',
      error: homeServersResult.error ? homeServersResult.error.message : 'none'
    });

    let homeServers: MCPServer[] = [];
    if (homeServersResult.data && !homeServersResult.error) {
      homeServers = homeServersResult.data.map(transformServer);
      console.log(`✅ Transformed ${homeServers.length} home servers for SSR`);
    } else {
      console.log('❌ No home servers data or error occurred:', homeServersResult.error?.message);
    }

    console.log(`✅ Home page data prepared - ${totalServers} servers, ${totalCategories} categories, ${featuredServers.length} featured, ${homeServers.length} home servers`);

    return {
      serverStats,
      categories: categoriesData || [],
      featuredServers,
      recentServers: [], // Could add recent servers query if needed
      homeServers,
    };

  } catch (err) {
    console.error('Error fetching home page data:', err);
    return null;
  }
}