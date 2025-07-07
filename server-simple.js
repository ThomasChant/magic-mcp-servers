import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

// Create Express app
const app = express();

// Add Vite or production middlewares
let vite;
if (!isProduction) {
    const { createServer } = await import("vite");
    vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        base,
    });
    app.use(vite.middlewares);
} else {
    // Production: Simple static file server
    const compression = (await import("compression")).default;
    const sirv = (await import("sirv")).default;
    app.use(compression());
    app.use(base, sirv("./dist/client", { extensions: [] }));
}

// Import sitemap generators (keep these for SEO)
import { 
    generateMainSitemap, 
    generateServersSitemap, 
    generateCategoriesSitemap, 
    generateTagsSitemap,
    generateSitemapIndex 
} from "./src/utils/sitemapGenerator.js";

// Sitemap routes
app.get('/sitemap.xml', async (req, res) => {
    try {
        const sitemap = await generateMainSitemap();
        res.set('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating main sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/sitemap-servers.xml', async (req, res) => {
    try {
        const sitemap = await generateServersSitemap();
        res.set('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating servers sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/sitemap-categories.xml', async (req, res) => {
    try {
        const sitemap = await generateCategoriesSitemap();
        res.set('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating categories sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/sitemap-tags.xml', async (req, res) => {
    try {
        const sitemap = await generateTagsSitemap();
        res.set('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating tags sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/sitemap-index.xml', async (req, res) => {
    try {
        const sitemapIndex = generateSitemapIndex();
        res.set('Content-Type', 'application/xml');
        res.send(sitemapIndex);
    } catch (error) {
        console.error('Error generating sitemap index:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Helper function to determine if a route needs SSR
function needsSSR(url) {
    // Normalize URL - ensure it starts with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Core pages that need SSR for SEO
    const ssrRoutes = [
        '/',                    // Home page
        '/servers',             // Server list page
        '/categories',          // Categories page
    ];
    
    // Dynamic routes that need SSR
    const dynamicSSRRoutes = [
        '/servers/',            // Server detail pages
        '/categories/',         // Category detail pages
    ];
    
    // Check exact matches
    if (ssrRoutes.includes(normalizedUrl)) {
        return true;
    }
    
    // Check dynamic routes
    return dynamicSSRRoutes.some(route => normalizedUrl.startsWith(route));
}

// Helper function to inject SEO data into template
function injectSEOData(template, seoData, url) {
    const escapeHtml = (text) => text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    let dynamicHead;
    
    if (seoData) {
        // Server-specific SEO data
        dynamicHead = `
    <title>${escapeHtml(seoData.title)}</title>
    <meta name="description" content="${escapeHtml(seoData.description)}" />
    <meta name="keywords" content="${escapeHtml(seoData.keywords)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="${escapeHtml(seoData.ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(seoData.ogDescription)}" />
    <meta property="og:url" content="${escapeHtml(seoData.ogUrl)}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="${escapeHtml(seoData.ogTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(seoData.ogDescription)}" />
    <meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(seoData.structuredData, null, 2)}
    </script>`;
    } else {
        // Default SEO for non-server pages
        const defaultSeoUrl = `https://magicmcp.net${url}`;
        dynamicHead = `
    <title>Magic MCP - Model Context Protocol Server Discovery</title>
    <meta name="description" content="Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools." />
    <meta name="keywords" content="MCP, Model Context Protocol, AI tools, servers, database integration, API, development tools, Claude MCP, AI agents" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="Magic MCP - Model Context Protocol Server Discovery Platform" />
    <meta property="og:description" content="Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools." />
    <meta property="og:url" content="${defaultSeoUrl}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="Magic MCP - Model Context Protocol Server Discovery Platform" />
    <meta property="twitter:description" content="Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools." />
    <meta property="twitter:url" content="${defaultSeoUrl}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${defaultSeoUrl}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
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
    </script>`;
    }
    
    return template.replace('<!--app-head-->', dynamicHead);
}

// Main SSR handler
app.use("*", async (req, res, next) => {
    try {
        const url = req.originalUrl.replace(base, "");

        // Skip SSR for static assets and API routes
        const skipSSR = [
            ".js",
            ".css",
            ".json",
            ".ico",
            ".png",
            ".jpg",
            ".jpeg",
            ".svg",
            ".woff",
            ".woff2",
            ".ttf",
            ".eot",
            ".map",
            ".well-known",
            "api/",
            "_next/",
            "static/",
            "assets/",
        ].some((ext) => url.includes(ext));

        if (skipSSR) {
            // Don't handle static assets here - let static file server handle them
            return next();
        }

        console.log(`📡 Processing request: ${url}`);

        let template;

        if (!isProduction) {
            // Development: Use Vite dev server with CSR
            template = await fs.readFile("./index.html", "utf-8");
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).send(template);
            return;
        }

        // Production: Decide between SSR and CSR
        if (needsSSR(url)) {
            console.log(`🚀 Using SSR for: ${url}`);

            try {
                // Import SSR render function
                const serverModule = await import(
                    "./dist/server/assets/entry-server.D-o6L2Uw.js"
                );
                const { html: renderedHtml, seoData } =
                    await serverModule.render(url);

                // Load SSR template
                template = await fs.readFile("./index-ssr.html", "utf-8");

                // Inject SEO data
                template = injectSEOData(template, seoData, url);

                // Inject rendered HTML
                const finalHtml = template.replace(
                    "<!--app-html-->",
                    renderedHtml || ""
                );

                console.log(
                    `✅ SSR completed for ${url} (${finalHtml.length} chars)`
                );
                res.status(200)
                    .set({ "Content-Type": "text/html" })
                    .send(finalHtml);
                return;
            } catch (ssrError) {
                console.error("❌ SSR failed for", url, ":", ssrError.message);
                console.error("Falling back to CSR");

                // Fallback to CSR
                template = await fs.readFile(
                    "./dist/client/index.html",
                    "utf-8"
                );
                res.status(200)
                    .set({ "Content-Type": "text/html" })
                    .send(template);
                return;
            }
        } else {
            // Use CSR for non-critical pages
            console.log(`🎯 Using CSR for: ${url}`);
            template = await fs.readFile("./dist/client/index.html", "utf-8");
            res.status(200).set({ "Content-Type": "text/html" }).send(template);
            return;
        }
    } catch (e) {
        if (vite) {
            vite.ssrFixStacktrace(e);
        }
        console.error("Server error:", e);
        res.status(500).end(e.stack);
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server started at http://localhost:${port}`);
    
    if (isProduction) {
        console.log(`✅ Production mode - SSR enabled for core pages`);
        console.log(`📄 SSR pages: /, /servers, /categories, /servers/*, /categories/*`);
        console.log(`⚡ CSR pages: /favorites, /docs, /about, etc.`);
    } else {
        console.log(`🔧 Development mode - using Vite dev server`);
    }
});