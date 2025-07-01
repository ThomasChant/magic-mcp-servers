import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { SSRApp } from "./ssr-app";
import { getServerBySlug, generateServerSEO } from "./server-utils";
// Import i18n to ensure it's initialized during SSR
import "./i18n";

export async function render(url: string, context?: any) {
    // Ensure URL starts with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Check if this is a server detail page
    const serverDetailMatch = normalizedUrl.match(/^\/servers\/([^\/]+)$/);
    let serverData = null;
    let seoData = null;

    // Create a new QueryClient for SSR
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: Infinity,
            },
        },
    });

    if (serverDetailMatch) {
        const slug = serverDetailMatch[1];
        try {
            serverData = await getServerBySlug(slug);
            seoData = generateServerSEO(serverData, `https://magicmcp.net${normalizedUrl}`);
            
            // Pre-populate the React Query cache with the server data
            if (serverData) {
                // Set cache for the actual slug and empty string (for SSR fallback)
                queryClient.setQueryData(["supabase", "server", slug], serverData);
                queryClient.setQueryData(["supabase", "server", ""], serverData);
                
                console.log(`✅ Pre-populated query cache for server: ${serverData.name} with slug: ${slug}`);
            }
        } catch (error) {
            console.error("Error fetching server data for SSR:", error);
        }
    }

    let html = '';
    
    try {
        html = renderToString(
            <React.StrictMode>
                <StaticRouter location={normalizedUrl}>
                    <SSRApp 
                        queryClient={queryClient}
                        ssrData={{ serverData, url: normalizedUrl }}
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
        serverData
    };
}