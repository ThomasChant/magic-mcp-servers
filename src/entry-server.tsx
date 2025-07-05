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
  getHomePageData,
  getCategoriesData
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
            
            // Fetch categories data for SSR
            const categoriesData = await getCategoriesData();
            if (categoriesData && categoriesData.length > 0) {
                // Pre-populate QueryClient cache with categories data
                queryClient.setQueryData(["supabase", "categories"], categoriesData);
                console.log(`✅ Pre-populated categories cache with ${categoriesData.length} categories for SSR`);
            }
            
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
                title: "MCP Server Tags - Browse by Technology | Magic MCP",
                description: "Browse all available MCP server tags. Find servers by programming language, technology stack, and functionality.",
                ogTitle: "MCP Server Tags - Browse by Technology | Magic MCP",
                ogDescription: "Browse all available MCP server tags. Find servers by programming language, technology stack, and functionality.",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: "MCP tags, Model Context Protocol, server tags, programming languages, technology stack, Claude MCP",
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "MCP Server Tags",
                    "description": "Browse all available MCP server tags",
                    "url": fullUrl,
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
                                "name": "Tags",
                                "item": fullUrl
                            }
                        ]
                    }
                }
            };
            
        } else if (routes.tagDetail) {
            const tag = routes.tagDetail[1];
            const decodedTag = decodeURIComponent(tag);
            console.log(`🏷️ Processing tag detail page SSR for: ${decodedTag}`);
            
            seoData = {
                title: `${decodedTag} MCP Servers - Magic MCP`,
                description: `Browse all Model Context Protocol servers tagged with "${decodedTag}". Find servers built with ${decodedTag} technology.`,
                ogTitle: `${decodedTag} MCP Servers - Magic MCP`,
                ogDescription: `Browse all Model Context Protocol servers tagged with "${decodedTag}". Find servers built with ${decodedTag} technology.`,
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: `MCP, ${decodedTag}, Model Context Protocol, servers, technology, Claude MCP, ${decodedTag} integration`,
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": `MCP Servers - ${decodedTag}`,
                    "description": `All MCP servers tagged with "${decodedTag}"`,
                    "url": fullUrl,
                    "keywords": decodedTag,
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
                                "name": "Tags",
                                "item": "https://magicmcp.net/tags"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": decodedTag,
                                "item": fullUrl
                            }
                        ]
                    }
                }
            };
            
        } else if (routes.docs) {
            console.log(`📚 Processing docs page SSR`);
            seoData = generateDocsSEO(fullUrl);
            
        } else {
            console.log(`❓ Unknown route, using default SEO: ${normalizedUrl}`);
            // For unknown routes, generate basic SEO
            seoData = {
                title: "Magic MCP - Model Context Protocol Server Discovery",
                description: "Discover and integrate the best Model Context Protocol (MCP) servers for AI applications.",
                ogTitle: "Magic MCP - Model Context Protocol Server Discovery",
                ogDescription: "Discover and integrate the best Model Context Protocol (MCP) servers for AI applications.",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords: "MCP, Model Context Protocol, AI tools, servers, Claude MCP, AI integration",
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