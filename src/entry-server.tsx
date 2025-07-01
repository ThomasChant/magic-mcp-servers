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
  generateDocsSEO
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
        docs: normalizedUrl === '/docs',
    };

    const fullUrl = `https://magicmcp.net${normalizedUrl}`;

    try {
        if (routes.home) {
            console.log(`🏠 Processing home page SSR`);
            seoData = generateHomeSEO(fullUrl);
            
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
                queryClient.setQueryData(["supabase", "server", slug], serverData);
                queryClient.setQueryData(["supabase", "server", ""], serverData);
                console.log(`✅ Pre-populated query cache for server: ${serverData.name}`);
            }
            
            // Pre-populate the React Query cache with README data
            if (readmeData && serverData) {
                queryClient.setQueryData(["supabase", "readme", serverData.id], readmeData);
                queryClient.setQueryData(["supabase", "readme", slug], readmeData);
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