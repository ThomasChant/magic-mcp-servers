import { createClient } from '@supabase/supabase-js';
import type { Database } from './lib/supabase';
import type { MCPServer } from "./types";

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
  let supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://lptsvryohchbklxcyoyc.supabase.co';
                    
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
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
  
  const fullDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

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