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
    fullDescription: (dbServer.description_en as string) || "", // Use description_en as fallback
    icon: (dbServer.icon as string) || "",
    category: (dbServer.category_id as string) || "",
    subcategory: "", // Default empty as field not selected
    tags: (dbServer.tags as string[]) || [],
    techStack: [], // Default empty as field not selected
    featured: (dbServer.featured as boolean) || false,
    verified: (dbServer.official as boolean) || false,
    metadata: {
      qualityScore: (dbServer.quality_score as number) || 0,
      maturity: "stable", // Default value
      complexity: "medium", // Default value
      maintenanceStatus: "active", // Default value
    },
    repository: {
      owner: (dbServer.owner as string) || "",
      name: (dbServer.name as string) || "", // Use name as fallback
      url: "", // Default empty as field not selected
      stars: (dbServer.stars as number) || 0,
      forks: 0, // Default value as field not selected
      watchers: 0, // Default value as field not selected
      issues: 0, // Default value as field not selected
      lastCommit: "", // Default empty as field not selected
      language: "", // Default empty as field not selected
    },
    stats: {
      createdAt: (dbServer.created_at as string) || "",
      lastUpdated: (dbServer.last_updated as string) || "",
      downloads: 0, // Default value as field may not exist
    },
    installation: {
      npm: "", // Default empty as field not selected
      pip: "", // Default empty as field not selected
      docker: "", // Default empty as field not selected
      manual: "", // Default empty as field not selected
      uv: "", // Default empty as field not selected
    },
    compatibility: {
      platforms: [], // Default empty as field not selected
      pythonVersion: "", // Default empty as field not selected
      nodeVersion: "", // Default empty as field not selected
    },
    documentation: {
      readme: "", // Default empty as field not selected
      examples: [], // Default empty as field not selected
      apiDocs: "", // Default empty as field not selected
    },
    usage: {
      downloads: 0, // Default empty as field not selected
      dependents: 0, // Default empty as field not selected
    },
  };
}

// Server-side function to fetch server data by slug
export async function getServerBySlug(slug: string): Promise<MCPServer | null> {
  if (!slug) return null;

  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
                    
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
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

  const title = `${server.name} MCP Server - ${server.category} | Magic MCP`;
  
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
    
  // Optimize description length (150-160 characters recommended)
  const fullDescription = cleanDescription.length > 155 
    ? cleanDescription.substring(0, 152) + "..." 
    : cleanDescription;

  return {
    title,
    description: fullDescription,
    ogTitle: title,
    ogDescription: fullDescription,
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: fullDescription,
    twitterImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: [
      "MCP",
      "Model Context Protocol", 
      server.name,
      server.category,
      "Claude MCP",
      "AI integration",
      ...server.tags.slice(0, 3), // Limit tags to avoid keyword stuffing
      ...server.techStack.slice(0, 2), // Limit tech stack
    ].filter(Boolean).join(", "),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": server.name,
      "description": fullDescription,
      "url": server.repository.url,
      "downloadUrl": server.repository.url,
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": server.category,
      "operatingSystem": server.compatibility.platforms.join(", "),
      "programmingLanguage": server.repository.language,
      "keywords": server.tags.join(", "),
      "author": {
        "@type": "Person",
        "name": server.owner,
        "url": `https://github.com/${server.owner}`
      },
      "publisher": {
        "@type": "Organization", 
        "name": "Magic MCP",
        "url": "https://magicmcp.net"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": server.repository.stars > 0 ? Math.min(5, Math.max(1, server.repository.stars / 50)) : 4,
        "reviewCount": server.repository.stars,
        "bestRating": 5,
        "worstRating": 1
      },
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": server.repository.stars
        },
        {
          "@type": "InteractionCounter", 
          "interactionType": "https://schema.org/ShareAction",
          "userInteractionCount": server.repository.forks
        }
      ],
      "datePublished": server.stats.createdAt,
      "dateModified": server.stats.lastUpdated,
      "version": "latest",
      "license": "Open Source",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Magic MCP",
        "url": "https://magicmcp.net"
      }
    }
  };
}

// Server-side function to fetch README data by server slug
export async function getServerReadmeBySlug(slug: string): Promise<ServerReadme | null> {
  if (!slug) return null;

  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
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
      .select('filename, project_name, extracted_content, extracted_installation, extracted_api_reference')
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
      extractedContent: data.extracted_content,
      extractedInstallation: data.extracted_installation,
      extractedApiReference: data.extracted_api_reference
    };
  } catch (err) {
    console.error(`Error fetching README for server ${slug}:`, err);
    return null;
  }
}

// Generate SEO metadata for home page
export function generateHomeSEO(url: string) {
  return {
    title: "Magic MCP - Model Context Protocol Server Discovery",
    description: "Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools.",
    ogTitle: "Magic MCP - Model Context Protocol Server Discovery Platform",
    ogDescription: "Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools.",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP, Model Context Protocol, AI tools, servers, database integration, API, development tools, Claude MCP, AI agents",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Magic MCP",
      "url": "https://magicmcp.net",
      "description": "Model Context Protocol server discovery platform",
      "publisher": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net",
        "logo": {
          "@type": "ImageObject",
          "url": "https://magicmcp.net/og-image.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://magicmcp.net/servers?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Servers",
        "description": "Curated list of Model Context Protocol servers",
        "numberOfItems": 200
      }
    }
  };
}

// Generate SEO metadata for servers listing page  
export function generateServersListSEO(url: string) {
  return {
    title: "MCP Server Directory - Browse All Servers | Magic MCP",
    description: "Browse the complete Model Context Protocol server directory. 1500+ veerified servers for databases, filesystems, API integration, and development tools.",
    ogTitle: "MCP Server Directory - Browse All Servers | Magic MCP", 
    ogDescription: "Browse the complete Model Context Protocol server directory. 1500+ verified MCP servers for databases, filesystems, API integration, and development tools.",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP servers, Model Context Protocol, server directory, database integration, API tools, development tools, Claude MCP",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "MCP Server Directory",
      "description": "Complete directory of Model Context Protocol servers",
      "url": url,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://magicmcp.net"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Servers",
            "item": url
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Servers",
        "description": "Collection of Model Context Protocol servers",
        "numberOfItems": 1500
      }
    }
  };
}

// Generate SEO metadata for categories page
export function generateCategoriesListSEO(url: string) {
  return {
    title: "MCP Server Categories - Browse by Function | Magic MCP",
    description: "Browse Model Context Protocol servers by category. Includes databases, filesystems, API integration, development tools, AI assistants and more.",
    ogTitle: "MCP Server Categories - Browse by Function | Magic MCP",
    ogDescription: "Browse Model Context Protocol servers by category. Includes databases, filesystems, API integration, development tools, AI assistants and more.",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png", 
    canonicalUrl: url,
    keywords: "MCP categories, Model Context Protocol, server categories, databases, filesystems, API integration, development tools, Claude MCP",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "MCP Server Categories",
      "description": "Model Context Protocol servers organized by function",
      "url": url,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://magicmcp.net"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Categories",
            "item": url
          }
        ]
      },
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
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
      title: "Category Not Found - Magic MCP",
      description: "The requested MCP server category could not be found.",
      ogTitle: "Category Not Found - Magic MCP",
      ogDescription: "The requested MCP server category could not be found.",
      ogUrl: url,
      ogImage: "https://magicmcp.net/og-image.png",
      canonicalUrl: url,
    };
  }

  const categoryName = category.name_en || category.name_zh_cn || category.name || "Unknown Category";
  const categoryDesc = category.description_en || category.description_zh_cn || category.description || "";
  
  const title = `${categoryName} MCP Servers | Magic MCP`;
  const description = categoryDesc ? 
    `Explore ${categoryName} Model Context Protocol servers. ${categoryDesc}` :
    `Browse all ${categoryName} Model Context Protocol servers to find tools that meet your needs.`;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: `MCP, Model Context Protocol, ${categoryName}, servers, tools, Claude MCP, AI integration`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryName} MCP Servers`,
      "description": description,
      "url": url,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://magicmcp.net"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Categories",
            "item": "https://magicmcp.net/categories"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": categoryName,
            "item": url
          }
        ]
      },
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
    title: "Documentation - How to Use MCP Servers | Magic MCP",
    description: "Learn how to install, configure, and use Model Context Protocol servers. Includes detailed setup guides, best practices, and troubleshooting.",
    ogTitle: "Documentation - How to Use MCP Servers | Magic MCP",
    ogDescription: "Learn how to install, configure, and use Model Context Protocol servers. Includes detailed setup guides, best practices, and troubleshooting.",
    ogUrl: url,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: url,
    keywords: "MCP documentation, Model Context Protocol, installation guide, configuration tutorial, setup instructions, Claude MCP, AI integration",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "name": "MCP Server Usage Documentation",
      "description": "Complete guide for using Model Context Protocol servers",
      "url": url,
      "author": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net",
        "logo": {
          "@type": "ImageObject",
          "url": "https://magicmcp.net/og-image.png"
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://magicmcp.net"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Documentation",
            "item": url
          }
        ]
      },
      "mainEntity": {
        "@type": "HowTo",
        "name": "How to Install and Use MCP Servers",
        "description": "Step-by-step guide to get started with Model Context Protocol servers"
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
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
      .order('stars', { ascending: false })
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

// Server-side function to get categories data for categories page
export async function getCategoriesData(): Promise<any[] | null> {
  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    console.log('🏗️ Fetching categories data for SSR...');

    // Get categories with basic information
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('id, name_en, description_en, icon, color')
      .order('name_en');

    if (error) {
      console.error('Categories query error:', error);
      return null;
    }

    console.log(`✅ Fetched ${categoriesData?.length || 0} categories for SSR`);
    
    // Transform the data to match the expected format
    const transformedCategories = categoriesData?.map(cat => ({
      id: cat.id,
      name: {
        en: cat.name_en,
        "zh-CN": cat.name_en, // Fallback to English for now
      },
      description: {
        en: cat.description_en,
        "zh-CN": cat.description_en, // Fallback to English for now
      },
      icon: cat.icon,
      color: cat.color,
      serverCount: 0, // Will be populated by client-side hooks
      subcategories: [], // Will be populated by client-side hooks
    })) || [];
    
    return transformedCategories;

  } catch (err) {
    console.error('Error fetching categories data:', err);
    return null;
  }
}

export async function getServersPageData(): Promise<{
  servers?: MCPServer[];
  categories?: any[];
  serverStats?: any;
} | null> {
  // For SSR, try different environment variable sources
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for SSR');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    console.error('Please check your .env.local file');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  try {
    console.log('📋 Fetching servers page data from Supabase...');
    
    // Fetch servers data for the first page (default sort by stars desc)
    const { data: serversData, error: serversError } = await supabase
      .from('servers_with_details')
      .select(`
        id, name, owner, slug, description_en, 
        icon, category_id, tags,
        featured, official, 
        stars, created_at, last_updated
      `)
      .order('stars', { ascending: false })
      .limit(36); // First page limit to match Servers component
    
    if (serversError) {
      console.error('Servers query error:', serversError);
      return null;
    }

    console.log(`✅ Fetched ${serversData?.length || 0} servers for SSR`);

    // Transform servers data
    const transformedServers = serversData?.map(transformServer) || [];

    // Also fetch categories for filters
    const categoriesData = await getCategoriesData();
    
    // Basic server stats for the page
    const serverStats = {
      total: transformedServers.length,
      categories: categoriesData?.length || 0,
      averageStars: transformedServers.length > 0 
        ? Math.round(transformedServers.reduce((sum, s) => sum + (s.repository.stars || 0), 0) / transformedServers.length)
        : 0,
      activeRepos: transformedServers.filter(s => s.repository.stars > 0).length,
    };

    return {
      servers: transformedServers,
      categories: categoriesData,
      serverStats,
    };

  } catch (err) {
    console.error('Error fetching servers page data:', err);
    return null;
  }
}
