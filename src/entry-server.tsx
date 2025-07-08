import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { SSRApp } from "./ssr-app";
import { 
  getServerBySlug, 
  getServerReadmeBySlug,
  getCategoryById,
  getHomePageData,
  getCategoriesData,
  getServersPageData
} from "./server-utils";
import {
  generateLocalizedHomeSEO,
  generateLocalizedServersListSEO,
  generateLocalizedCategoriesListSEO,
  generateLocalizedCategorySEO,
  generateLocalizedServerSEO,
  generateLocalizedDocsSEO
} from "./seo-utils";
import type { MCPServer, ServerReadme, Category } from "./types";
// Import i18n to ensure it's initialized during SSR
import "./i18n";
import i18n from "i18next";

interface HomeData {
    serverStats?: unknown;
    categories?: unknown[];
    featuredServers?: unknown[];
    homeServers?: unknown[];
    [key: string]: unknown;
}

interface ServersPageData {
    servers?: unknown[];
    categories?: unknown[];
    serverStats?: unknown;
    [key: string]: unknown;
}

interface AdditionalData {
    serverData?: MCPServer;
    readmeData?: ServerReadme;
    categoryData?: Category;
    pageType?: string;
    url?: string;
    homeData?: HomeData;
    serversPageData?: ServersPageData;
}

export async function render(url: string, options?: { locale?: string }) {
    // Ensure URL starts with /
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    
    // Extract locale from URL if present
    const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
    const localeMatch = normalizedUrl.match(localePattern);
    const detectedLocale = localeMatch ? localeMatch[1] : 'en';
    const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : normalizedUrl;
    
    // Use provided locale or detected locale
    const locale = options?.locale || detectedLocale;
    
    // Set the locale for i18n
    if (locale !== i18n.language) {
        await i18n.changeLanguage(locale);
    }

    // Initialize data variables
    let serverData: MCPServer | null = null;
    let readmeData: ServerReadme | null = null;
    let categoryData: Category | null = null;
    let seoData = null;
    let additionalData: AdditionalData = {};

    // Create a new QueryClient for SSR
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: Infinity,
            },
        },
    });

    // Route pattern matching for different page types (using path without locale)
    const routes = {
        home: pathWithoutLocale === "/",
        serversList: pathWithoutLocale === "/servers",
        serverDetail: pathWithoutLocale.match(/^\/servers\/([^/]+)$/),
        categoriesList: pathWithoutLocale === "/categories",
        categoryDetail: pathWithoutLocale.match(/^\/categories\/([^/]+)$/),
        tagsList: pathWithoutLocale === "/tags",
        tagDetail: pathWithoutLocale.match(/^\/tags\/([^/]+)$/),
        docs: pathWithoutLocale === "/docs",
    };

    // Debug logging for route matching
    console.log(`📍 Route matching for: ${normalizedUrl} (locale: ${locale}, pathWithoutLocale: ${pathWithoutLocale})`);
    console.log(`📍 Route matches:`, {
        home: !!routes.home,
        serversList: !!routes.serversList,
        serverDetail: !!routes.serverDetail,
        categoriesList: !!routes.categoriesList,
        categoryDetail: !!routes.categoryDetail,
    });

    const fullUrl = `https://magicmcp.net${normalizedUrl}`;
    const baseUrlWithoutLocale = `https://magicmcp.net${pathWithoutLocale}`;
    
    // Generate hreflang tags
    const supportedLocales = ['en', 'zh-CN', 'zh-TW', 'fr', 'ja', 'ko', 'ru'];
    const hreflangTags = supportedLocales.map(lang => {
        const urlPath = lang === 'en' ? pathWithoutLocale : `/${lang}${pathWithoutLocale}`;
        return `<link rel="alternate" hreflang="${lang}" href="https://magicmcp.net${urlPath}" />`;
    }).join('\n    ') + '\n    <link rel="alternate" hreflang="x-default" href="' + baseUrlWithoutLocale + '" />';

    try {
        if (routes.home) {
            console.log(`🏠 Processing home page SSR`);
            seoData = generateLocalizedHomeSEO(fullUrl, locale);

            // Fetch home page data for SSR
            const homeData = await getHomePageData();
            if (homeData) {
                // Pre-populate QueryClient cache with home page data
                if (homeData.serverStats) {
                    queryClient.setQueryData(
                        ["supabase", "server-stats"],
                        homeData.serverStats
                    );
                    console.log(`✅ Pre-populated server stats cache`);
                }

                if (homeData.categories && homeData.categories.length > 0) {
                    queryClient.setQueryData(
                        ["supabase", "categories"],
                        homeData.categories
                    );
                    console.log(
                        `✅ Pre-populated categories cache with ${homeData.categories.length} categories`
                    );
                }

                if (
                    homeData.featuredServers &&
                    homeData.featuredServers.length > 0
                ) {
                    queryClient.setQueryData(
                        ["supabase", "servers", "featured"],
                        homeData.featuredServers
                    );
                    console.log(
                        `✅ Pre-populated featured servers cache with ${homeData.featuredServers.length} servers`
                    );
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
                        [
                            "supabase",
                            "servers",
                            "paginated",
                            1,
                            36,
                            "upvotes",
                            "desc",
                            undefined,
                        ],
                        paginatedResult
                    );
                    console.log(
                        `✅ Pre-populated paginated servers cache with ${homeData.homeServers.length} servers`
                    );
                }

                // Store home data in additional data
                additionalData.homeData = homeData;
            }
        } else if (routes.serversList) {
            console.log(`📋 Processing servers list page SSR`);
            seoData = generateLocalizedServersListSEO(fullUrl, locale);

            // Fetch servers page data for SSR
            const serversPageData = await getServersPageData();
            if (serversPageData) {
                // Pre-populate QueryClient cache with servers data
                if (
                    serversPageData.servers &&
                    serversPageData.servers.length > 0
                ) {
                    const paginatedResult = {
                        data: serversPageData.servers,
                        total: serversPageData.servers.length,
                        hasNextPage: false,
                        hasPreviousPage: false,
                        currentPage: 1,
                        totalPages: 1,
                    };

                    // Cache for the default parameters that Servers component uses
                    queryClient.setQueryData(
                        [
                            "supabase",
                            "servers",
                            "paginated",
                            1,
                            36,
                            "upvotes",
                            "desc",
                            undefined,
                        ],
                        paginatedResult
                    );
                    console.log(
                        `✅ Pre-populated servers cache with ${serversPageData.servers.length} servers`
                    );
                }

                if (
                    serversPageData.categories &&
                    serversPageData.categories.length > 0
                ) {
                    queryClient.setQueryData(
                        ["supabase", "categories"],
                        serversPageData.categories
                    );
                    console.log(
                        `✅ Pre-populated categories cache with ${serversPageData.categories.length} categories`
                    );
                }

                if (serversPageData.serverStats) {
                    queryClient.setQueryData(
                        ["supabase", "server-stats"],
                        serversPageData.serverStats
                    );
                    console.log(`✅ Pre-populated server stats cache`);
                }

                // Store servers data in additional data
                additionalData.serversPageData = serversPageData;
            }
        } else if (routes.serverDetail) {
            const slug = routes.serverDetail[1];
            console.log(`📄 Processing server detail page SSR for: ${slug}`);

            try {
                // Fetch both server data and README data in parallel
                const [fetchedServerData, fetchedReadmeData] =
                    await Promise.all([
                        getServerBySlug(slug),
                        getServerReadmeBySlug(slug),
                    ]);

                serverData = fetchedServerData;
                readmeData = fetchedReadmeData;

                if (serverData) {
                    console.log(
                        `✅ Server data found for slug "${slug}": ${serverData.name}`
                    );
                    seoData = generateLocalizedServerSEO(serverData, fullUrl, locale);

                    // Pre-populate the React Query cache with server data
                    queryClient.setQueryData(["server", slug], serverData);
                    console.log(
                        `✅ Pre-populated query cache for server: ${serverData.name}`
                    );

                    // Pre-populate the React Query cache with README data
                    if (readmeData) {
                        queryClient.setQueryData(
                            ["supabase", "readme", serverData.id],
                            readmeData
                        );
                        console.log(
                            `✅ Pre-populated README cache for server: ${serverData.name}`
                        );
                    } else {
                        console.log(
                            `⚠️ No README data found for server: ${serverData.name}`
                        );
                    }
                } else {
                    console.error(`❌ No server found for slug: ${slug}`);
                    // Generate a not-found SEO for better error handling
                    seoData = {
                        title: "Server Not Found | Magic MCP",
                        description:
                            "The requested MCP server could not be found.",
                        keywords:
                            "MCP, Model Context Protocol, server not found",
                        ogTitle: "Server Not Found | Magic MCP",
                        ogDescription:
                            "The requested MCP server could not be found.",
                        ogUrl: fullUrl,
                        canonicalUrl: fullUrl,
                        structuredData: {
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            name: "Server Not Found",
                            url: fullUrl,
                        },
                    };
                }
            } catch (serverDetailError) {
                console.error(
                    `❌ Error fetching server detail for slug "${slug}":`,
                    serverDetailError
                );
                // Still generate basic SEO data to avoid rendering errors
                seoData = {
                    title: "Error Loading Server | Magic MCP",
                    description:
                        "There was an error loading the requested MCP server.",
                    keywords: "MCP, Model Context Protocol, server error",
                    ogTitle: "Error Loading Server | Magic MCP",
                    ogDescription:
                        "There was an error loading the requested MCP server.",
                    ogUrl: fullUrl,
                    canonicalUrl: fullUrl,
                    structuredData: {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "Server Error",
                        url: fullUrl,
                    },
                };
            }
        } else if (routes.categoriesList) {
            console.log(`🗂️ Processing categories list page SSR`);
            seoData = generateLocalizedCategoriesListSEO(fullUrl, locale);

            // Fetch categories data for SSR
            const categoriesData = await getCategoriesData();
            if (categoriesData && categoriesData.length > 0) {
                // Pre-populate QueryClient cache with categories data
                queryClient.setQueryData(
                    ["supabase", "categories"],
                    categoriesData
                );
                console.log(
                    `✅ Pre-populated categories cache with ${categoriesData.length} categories for SSR`
                );
            }
        } else if (routes.categoryDetail) {
            const categoryId = routes.categoryDetail[1];
            console.log(
                `🗂️ Processing category detail page SSR for: ${categoryId}`
            );

            // Fetch category data
            categoryData = await getCategoryById(categoryId);
            seoData = generateLocalizedCategorySEO(categoryData, fullUrl, locale);

            // Pre-populate the React Query cache with category data
            if (categoryData) {
                queryClient.setQueryData(
                    ["supabase", "category", categoryId],
                    categoryData
                );
                console.log(
                    `✅ Pre-populated query cache for category: ${
                        categoryData.name.en || categoryData.name
                    }`
                );
            }
        } else if (routes.tagsList) {
            console.log(`🏷️ Processing tags list page SSR`);
            seoData = {
                title: "MCP Server Tags - Browse by Technology | Magic MCP",
                description:
                    "Browse all available MCP server tags. Find servers by programming language, technology stack, and functionality.",
                ogTitle: "MCP Server Tags - Browse by Technology | Magic MCP",
                ogDescription:
                    "Browse all available MCP server tags. Find servers by programming language, technology stack, and functionality.",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords:
                    "MCP tags, Model Context Protocol, server tags, programming languages, technology stack, Claude MCP",
                structuredData: {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    name: "MCP Server Tags",
                    description: "Browse all available MCP server tags",
                    url: fullUrl,
                    breadcrumb: {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Home",
                                item: "https://magicmcp.net",
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Tags",
                                item: fullUrl,
                            },
                        ],
                    },
                },
            };
            // Manually add hreflang tags for tag pages
            seoData.hreflangTags = hreflangTags;
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
                    name: `MCP Servers - ${decodedTag}`,
                    description: `All MCP servers tagged with "${decodedTag}"`,
                    url: fullUrl,
                    keywords: decodedTag,
                    breadcrumb: {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Home",
                                item: "https://magicmcp.net",
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Tags",
                                item: "https://magicmcp.net/tags",
                            },
                            {
                                "@type": "ListItem",
                                position: 3,
                                name: decodedTag,
                                item: fullUrl,
                            },
                        ],
                    },
                },
            };
            // Manually add hreflang tags for tag detail pages
            seoData.hreflangTags = hreflangTags;
        } else if (routes.docs) {
            console.log(`📚 Processing docs page SSR`);
            seoData = generateLocalizedDocsSEO(fullUrl, locale);
        } else {
            console.log(
                `❓ Unknown route, using default SEO: ${normalizedUrl}`
            );
            // For unknown routes, generate basic SEO
            seoData = {
                title: "Magic MCP - Model Context Protocol Server Discovery",
                description:
                    "Discover and integrate the best Model Context Protocol (MCP) servers for AI applications.",
                ogTitle: "Magic MCP - Model Context Protocol Server Discovery",
                ogDescription:
                    "Discover and integrate the best Model Context Protocol (MCP) servers for AI applications.",
                ogUrl: fullUrl,
                ogImage: "https://magicmcp.net/og-image.png",
                canonicalUrl: fullUrl,
                keywords:
                    "MCP, Model Context Protocol, AI tools, servers, Claude MCP, AI integration",
            };
            // Manually add hreflang tags for unknown pages
            seoData.hreflangTags = hreflangTags;
        }

        // Store all SSR data for context
        additionalData = {
            serverData: serverData || undefined,
            readmeData: readmeData || undefined,
            categoryData: categoryData || undefined,
            pageType:
                Object.keys(routes).find((key) => {
                    const route = routes[key as keyof typeof routes];
                    return !!route;
                }) || "unknown",
            url: normalizedUrl,
        };
    } catch (error) {
        console.error("Error during SSR data fetching:", error);
        // Fallback SEO for errors
        seoData = {
            title: "Magic MCP - Model Context Protocol 服务器发现平台",
            description:
                "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
            ogTitle: "Magic MCP - Model Context Protocol 服务器发现平台",
            ogDescription:
                "发现并集成最优秀的 Model Context Protocol (MCP) 服务器。",
            ogUrl: fullUrl,
            ogImage: "https://magicmcp.net/og-image.png",
            canonicalUrl: fullUrl,
        };
    }

    let html = "";

    try {
        console.log(
            `🎭 About to render React components for: ${normalizedUrl}`
        );
        console.log(`🎭 SSR data provided:`, {
            hasServerData: !!additionalData.serverData,
            hasReadmeData: !!additionalData.readmeData,
            hasCategoryData: !!additionalData.categoryData,
            pageType: additionalData.pageType,
        });

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

        console.log(
            `✅ React rendering successful for: ${normalizedUrl}, HTML length: ${html.length}`
        );

        // Check if the HTML actually contains content
        if (html.length < 100) {
            console.warn(
                `⚠️ Suspiciously short HTML output for: ${normalizedUrl}`
            );
            console.warn(`⚠️ HTML content: ${html}`);
        }
    } catch (renderError) {
        console.error("❌ SSR render error:", renderError);
        console.error(
            "❌ Error details:",
            renderError instanceof Error ? renderError.message : renderError
        );
        console.error(
            "❌ Error stack:",
            renderError instanceof Error
                ? renderError.stack
                : "No stack available"
        );

        // Return empty HTML on error but keep SEO data
        html = "";
    }

    return {
        html,
        seoData,
        serverData, // Keep for backward compatibility
        additionalData,
    };
}