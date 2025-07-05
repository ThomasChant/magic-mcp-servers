import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { SSRApp } from "./ssr-app";
import { 
  getServerBySlug, 
  generateServerSEO, 
  getServerReadmeBySlug,
  generateHomeSEO,
  generateServersListSEO,
  generateCategoriesListSEO,
  getCategoryById,
  generateCategorySEO,
  generateDocsSEO,
  getHomePageData
} from "./server-utils";
// Import i18n to ensure it's initialized during SSR
import "./i18n";

export async function render(url: string, context?: any) {
    // Ensure URL starts with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Initialize data variables
    let serverData = null;
    let readmeData = null;
    let categoryData = null;
    let seoData = null;
    let additionalData = {};

    // Create a new QueryClient for SSR
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: Infinity,
            },
        },
    });

    // Route pattern matching for different page types
    const routes = {
        home: normalizedUrl === '/',
        serversList: normalizedUrl === '/servers',
        serverDetail: normalizedUrl.match(/^\/servers\/([^/]+)$/),
        categoriesList: normalizedUrl === '/categories',
        categoryDetail: normalizedUrl.match(/^\/categories\/([^/]+)$/),
        tagsList: normalizedUrl === '/tags',
        tagDetail: normalizedUrl.match(/^\/tags\/([^/]+)$/),
        docs: normalizedUrl === '/docs',
    };

    const fullUrl = `https://magicmcp.net${normalizedUrl}`;

    try {
        if (routes.home) {
            console.log(`🏠 Processing home page SSR`);
            seoData = generateHomeSEO(fullUrl);
            
            // Fetch home page data for SSR
            const homeData = await getHomePageData();
            if (homeData) {
                // Pre-populate QueryClient cache with home page data
                if (homeData.serverStats) {
                    queryClient.setQueryData(["supabase", "server-stats"], homeData.serverStats);
                    console.log(`✅ Pre-populated server stats cache`);
                }
                
                if (homeData.categories && homeData.categories.length > 0) {
                    queryClient.setQueryData(["supabase", "categories"], homeData.categories);
                    console.log(`✅ Pre-populated categories cache with ${homeData.categories.length} categories`);
                }
                
                if (homeData.featuredServers && homeData.featuredServers.length > 0) {
                    queryClient.setQueryData(["supabase", "servers", "featured"], homeData.featuredServers);
                    console.log(`✅ Pre-populated featured servers cache with ${homeData.featuredServers.length} servers`);
                }
                
                // Pre-populate paginated servers cache for the home page Servers component
                if (homeData.homeServers && homeData.homeServers.length > 0) {
                    const paginatedResult = {
                        data: homeData.homeServers,
                        total: homeData.homeServers.length,
                        hasNextPage: false,
                        hasPreviousPage: false,
                        currentPage: 1,
                        totalPages: 1,
                    };
                    
                    // Cache for the default parameters that Servers component uses on first load
                    queryClient.setQueryData(
                        ["supabase", "servers", "paginated", 1, 36, "upvotes", "desc", undefined], 
                        paginatedResult
                    );
                    console.log(`✅ Pre-populated paginated servers cache with ${homeData.homeServers.length} servers`);
                }
                
                // Store home data in additional data
                additionalData.homeData = homeData;
            }
            
        } else if (routes.serversList) {
            console.log(`📋 Processing servers list page SSR`);
            seoData = generateServersListSEO(fullUrl);
            
        } else if (routes.serverDetail) {
            const slug = routes.serverDetail[1];
            console.log(`📄 Processing server detail page SSR for: ${slug}`);
            
            // Fetch both server data and README data in parallel
            const [fetchedServerData, fetchedReadmeData] = await Promise.all([
                getServerBySlug(slug),
                getServerReadmeBySlug(slug)
            ]);
            
            serverData = fetchedServerData;
            readmeData = fetchedReadmeData;
            seoData = generateServerSEO(serverData, fullUrl);
            
            // Pre-populate the React Query cache with server data
            if (serverData) {
                queryClient.setQueryData(["server", slug], serverData);
                console.log(`✅ Pre-populated query cache for server: ${serverData.name}`);
            }
            
            // Pre-populate the React Query cache with README data
            if (readmeData && serverData) {
                queryClient.setQueryData(["supabase", "readme", serverData.id], readmeData);
                console.log(`✅ Pre-populated README cache for server: ${serverData.name}`);
            }
            
        } else if (routes.categoriesList) {
            console.log(`🗂️ Processing categories list page SSR`);
            seoData = generateCategoriesListSEO(fullUrl);
            
        } else if (routes.categoryDetail) {
            const categoryId = routes.categoryDetail[1];
            console.log(`🗂️ Processing category detail page SSR for: ${categoryId}`);
            
            // Fetch category data
            categoryData = await getCategoryById(categoryId);
            seoData = generateCategorySEO(categoryData, fullUrl);
            
            // Pre-populate the React Query cache with category data
            if (categoryData) {
                queryClient.setQueryData(["supabase", "category", categoryId], categoryData);
                console.log(`✅ Pre-populated query cache for category: ${categoryData.name_en || categoryData.name}`);
            }
            
        } else if (routes.tagsList) {
            console.log(`🏷️ Processing tags list page SSR`);
            seoData = {
                title: "标签 - Magic MCP",
                description: "浏览所有可用的 MCP 服务器标签。",
                ogTitle: "标签 - Magic MCP",
                ogDescription: "浏览所有可用的 MCP 服务器标签。",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: "MCP, 标签, tags, Model Context Protocol",
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "MCP 服务器标签",
                    "description": "浏览所有可用的 MCP 服务器标签",
                    "url": fullUrl
                }
            };
            
        } else if (routes.tagDetail) {
            const tag = routes.tagDetail[1];
            const decodedTag = decodeURIComponent(tag);
            console.log(`🏷️ Processing tag detail page SSR for: ${decodedTag}`);
            
            seoData = {
                title: `标签: ${decodedTag} - Magic MCP`,
                description: `浏览所有标记为 "${decodedTag}" 的 MCP 服务器。`,
                ogTitle: `标签: ${decodedTag} - Magic MCP`,
                ogDescription: `浏览所有标记为 "${decodedTag}" 的 MCP 服务器。`,
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: `MCP, ${decodedTag}, 标签, Model Context Protocol`,
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": `MCP 服务器 - ${decodedTag}`,
                    "description": `所有标记为 "${decodedTag}" 的 MCP 服务器`,
                    "url": fullUrl,
                    "keywords": decodedTag
                }
            };
            
        } else if (routes.docs) {
            console.log(`📚 Processing docs page SSR`);
            seoData = generateDocsSEO(fullUrl);
            
        } else {
            console.log(`❓ Unknown route, using default SEO: ${normalizedUrl}`);
            // For unknown routes, generate basic SEO
            seoData = {
                title: "Magic MCP - Model Context Protocol 服务器发现平台",
                description: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
                ogTitle: "Magic MCP - Model Context Protocol 服务器发现平台",
                ogDescription: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: "MCP, Model Context Protocol, AI工具, 服务器",
            };
        }
        
        // Store all SSR data for context
        additionalData = {
            serverData,
            readmeData,
            categoryData,
            pageType: Object.keys(routes).find(key => routes[key]) || 'unknown',
            url: normalizedUrl
        };
        
    } catch (error) {
        console.error("Error during SSR data fetching:", error);
        // Fallback SEO for errors
        seoData = {
            title: "Magic MCP - Model Context Protocol 服务器发现平台",
            description: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
            ogTitle: "Magic MCP - Model Context Protocol 服务器发现平台", 
            ogDescription: "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
            ogUrl: fullUrl,
            ogImage: "https://magicmcp.net/og-image.png",
            canonicalUrl: fullUrl,
        };
    }

    let html = '';
    
    try {
        html = renderToString(
            <React.StrictMode>
                <StaticRouter location={normalizedUrl}>
                    <SSRApp 
                        queryClient={queryClient}
                        ssrData={additionalData}
                    />
                </StaticRouter>
            </React.StrictMode>
        );
    } catch (renderError) {
        console.error("SSR render error:", renderError);
        console.error("Error details:", renderError instanceof Error ? renderError.message : renderError);
        // Return empty HTML on error but keep SEO data
        html = '';
    }
    
    return { 
        html,
        seoData,
        serverData, // Keep for backward compatibility
        additionalData
    };
}