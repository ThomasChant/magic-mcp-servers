import React from 'react';
import type { MCPServer } from '../types';

interface StructuredDataProps {
    type: 'website' | 'server' | 'breadcrumbs' | 'searchResults';
    data?: {
        server?: MCPServer;
        breadcrumbs?: Array<{ name: string; url: string }>;
        searchResults?: MCPServer[];
        totalResults?: number;
    };
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
    const generateStructuredData = () => {
        const baseUrl = 'https://magicmcp.net';

        switch (type) {
            case 'website':
                return {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Magic MCP Hub",
                    "url": baseUrl,
                    "description": "Discover and integrate the best Model Context Protocol (MCP) servers. Browse over 1000+ high-quality MCP servers covering databases, file systems, API integrations, and more.",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Magic MCP Hub",
                        "url": baseUrl,
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/logo.png`,
                            "width": 512,
                            "height": 512
                        }
                    },
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": `${baseUrl}/servers?search={search_term_string}`
                        },
                        "query-input": "required name=search_term_string"
                    },
                    "sameAs": [
                        "https://github.com/your-org/mcp-hub",
                        "https://twitter.com/mcphub"
                    ]
                };

            case 'server': {
                if (!data?.server) return null;
                const server = data.server;
                return {
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": server.name,
                    "description": server.fullDescription || server.description?.en || server.description?.["zh-CN"] || '',
                    "url": `${baseUrl}/servers/${server.slug}`,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": server.compatibility?.platforms?.join(', ') || "Cross-platform",
                    "programmingLanguage": server.techStack || [],
                    "author": {
                        "@type": "Person",
                        "name": server.owner || "Unknown"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Magic MCP Hub",
                        "url": baseUrl
                    },
                    "downloadUrl": server.repository?.url,
                    "codeRepository": server.repository?.url,
                    "license": "MIT",
                    "version": "latest",
                    "dateCreated": server.stats?.createdAt,
                    "dateModified": server.repository?.lastUpdated || server.stats?.lastUpdated,
                    "interactionStatistic": [
                        {
                            "@type": "InteractionCounter",
                            "interactionType": "https://schema.org/LikeAction",
                            "userInteractionCount": server.repository?.stars || 0
                        },
                        {
                            "@type": "InteractionCounter", 
                            "interactionType": "https://schema.org/DownloadAction",
                            "userInteractionCount": server.usage?.downloads || 0
                        }
                    ],
                    "keywords": server.tags?.join(', ') || '',
                    "category": server.category,
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": server.stats?.stars ? {
                        "@type": "AggregateRating",
                        "ratingValue": server.stats.stars,
                        "bestRating": 100,
                        "worstRating": 0,
                        "ratingCount": 1
                    } : undefined
                };
            }

            case 'breadcrumbs':
                if (!data?.breadcrumbs || data.breadcrumbs.length === 0) return null;
                return {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": data.breadcrumbs.map((crumb, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": crumb.name,
                        "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
                    }))
                };

            case 'searchResults':
                if (!data?.searchResults || data.searchResults.length === 0) return null;
                return {
                    "@context": "https://schema.org",
                    "@type": "SearchResultsPage",
                    "name": "MCP Server Search Results",
                    "url": `${baseUrl}/servers`,
                    "description": `Found ${data.totalResults || data.searchResults.length} MCP servers`,
                    "mainEntity": {
                        "@type": "ItemList",
                        "numberOfItems": data.totalResults || data.searchResults.length,
                        "itemListElement": data.searchResults.slice(0, 10).map((server, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "item": {
                                "@type": "SoftwareApplication",
                                "name": server.name,
                                "description": server.description?.en || server.description?.["zh-CN"] || '',
                                "url": `${baseUrl}/servers/${server.slug}`,
                                "author": {
                                    "@type": "Person",
                                    "name": server.owner || "Unknown"
                                },
                                "dateModified": server.repository?.lastUpdated,
                                "interactionStatistic": {
                                    "@type": "InteractionCounter",
                                    "interactionType": "https://schema.org/LikeAction",
                                    "userInteractionCount": server.repository?.stars || 0
                                }
                            }
                        }))
                    }
                };

            default:
                return null;
        }
    };

    const structuredData = generateStructuredData();

    if (!structuredData) {
        return null;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData, null, 2)
            }}
        />
    );
};

export default StructuredData;