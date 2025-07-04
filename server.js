import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

// Static cache configuration
const STATIC_CACHE_DIR = path.join(__dirname, "static-cache");
const HOME_STATIC_FILE = path.join(STATIC_CACHE_DIR, "home.html");
const HOME_META_FILE = path.join(STATIC_CACHE_DIR, "home-meta.json");

// Static cache functions
async function ensureStaticDir() {
    try {
        await fs.access(STATIC_CACHE_DIR);
    } catch {
        await fs.mkdir(STATIC_CACHE_DIR, { recursive: true });
    }
}

async function generateStaticHome() {
    if (!isProduction) {
        console.log("⚠️ Static generation skipped in development mode");
        return { success: false, error: "Development mode" };
    }

    try {
        console.log("🏗️ Generating static home page...");
        const startTime = Date.now();
        
        await ensureStaticDir();
        
        // Import and use SSR render function
        const serverModule = await import("./dist/server/entry-server.js");
        const result = await serverModule.render("/");
        
        if (!result.html || !result.seoData) {
            throw new Error("Failed to render home page");
        }
        
        // Read template and inject content
        let template = await fs.readFile("./index-ssr.html", "utf-8");
        
        // Helper function to escape HTML
        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Inject SEO data
        const dynamicHead = `
    <title>${escapeHtml(result.seoData.title)}</title>
    <meta name="description" content="${escapeHtml(result.seoData.description)}" />
    <meta name="keywords" content="${escapeHtml(result.seoData.keywords)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="${escapeHtml(result.seoData.ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(result.seoData.ogDescription)}" />
    <meta property="og:url" content="${escapeHtml(result.seoData.ogUrl)}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="${escapeHtml(result.seoData.ogTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(result.seoData.ogDescription)}" />
    <meta property="twitter:url" content="${escapeHtml(result.seoData.ogUrl)}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(result.seoData.canonicalUrl)}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(result.seoData.structuredData, null, 2)}
    </script>`;
        
        template = template.replace('<!--app-head-->', dynamicHead);
        template = template.replace('<!--app-html-->', result.html);
        
        // Update asset paths
        try {
            const assetsDir = await fs.readdir("./dist/client/assets");
            const clientSSRFile = assetsDir.find(file => file.startsWith('client-ssr-'));
            const clientFile = assetsDir.find(file => file.startsWith('client-') && file.endsWith('.js') && !file.includes('ssr'));
            const queryClientJSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.js'));
            const queryClientCSSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.css'));
            
            if (clientSSRFile) {
                template = template.replace('src="/src/entry-client.tsx"', `type="module" crossorigin src="/assets/${clientSSRFile}"`);
            }
            
            if (clientFile && queryClientJSFile && queryClientCSSFile) {
                template = template.replace('</head>', `    <link rel="modulepreload" crossorigin href="/assets/${clientFile}">
    <link rel="modulepreload" crossorigin href="/assets/${queryClientJSFile}">
    <link rel="stylesheet" crossorigin href="/assets/${queryClientCSSFile}">
  </head>`);
            }
        } catch (assetsError) {
            console.warn("⚠️ Could not update asset paths:", assetsError.message);
        }
        
        // Save static HTML and metadata
        await fs.writeFile(HOME_STATIC_FILE, template, "utf-8");
        
        const metadata = {
            generatedAt: new Date().toISOString(),
            renderTime: Date.now() - startTime,
            htmlSize: template.length,
            version: "1.0"
        };
        await fs.writeFile(HOME_META_FILE, JSON.stringify(metadata, null, 2), "utf-8");
        
        console.log(`✅ Static home page generated (${metadata.renderTime}ms, ${metadata.htmlSize} chars)`);
        return { success: true, metadata };
        
    } catch (error) {
        console.error("❌ Static home generation failed:", error.message);
        return { success: false, error: error.message };
    }
}

async function getStaticHome() {
    try {
        const [html, metaContent] = await Promise.all([
            fs.readFile(HOME_STATIC_FILE, "utf-8"),
            fs.readFile(HOME_META_FILE, "utf-8")
        ]);
        
        const metadata = JSON.parse(metaContent);
        return { html, metadata, exists: true };
    } catch {
        return { exists: false };
    }
}

async function isStaticHomeExpired() {
    try {
        const metaContent = await fs.readFile(HOME_META_FILE, "utf-8");
        const metadata = JSON.parse(metaContent);
        const generatedAt = new Date(metadata.generatedAt);
        const hoursSinceGeneration = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceGeneration >= 1;
    } catch {
        return true; // 文件不存在视为过期
    }
}

// Create http server
const app = express();

// Add Vite or respective production middlewares
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

// Import sitemap generators
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

// Serve HTML - only for non-static routes
app.use("*", async (req, res) => {
    try {
        const url = req.originalUrl.replace(base, "");
        
        // Skip SSR for static assets and API routes
        const skipSSR = [
            '.js', '.css', '.json', '.ico', '.png', '.jpg', '.jpeg', 
            '.svg', '.woff', '.woff2', '.ttf', '.eot', '.map',
            '.well-known', 'api/', '_next/', 'static/'
        ].some(ext => url.includes(ext));
        
        if (skipSSR) {
            return res.status(404).send('Not found');
        }
        
        console.log(`📡 Processing request: ${url}`);

        // Special handling for home page - check static cache first
        if (url === '' || url === '/') {
            if (isProduction) {
                console.log(`🏠 Home page request - checking static cache`);
                
                const staticHome = await getStaticHome();
                const isExpired = await isStaticHomeExpired();
                
                if (staticHome.exists && !isExpired) {
                    console.log(`✅ Serving static home page (generated: ${staticHome.metadata.generatedAt})`);
                    return res.status(200).set({ "Content-Type": "text/html" }).send(staticHome.html);
                } else {
                    console.log(`⚠️ Static home ${!staticHome.exists ? 'not found' : 'expired'} - regenerating in background`);
                    
                    // Generate static home in background (don't wait)
                    generateStaticHome().catch(error => {
                        console.error("Background static generation failed:", error);
                    });
                    
                    // Fall through to normal SSR for this request
                }
            }
        }

        let template;
        let render;

        if (!isProduction) {
            // Development: Use Vite dev server
            template = await fs.readFile("./index.html", "utf-8");
            template = await vite.transformIndexHtml(url, template);
            // For development, we'll use client-side rendering for now
            res.status(200).set({ "Content-Type": "text/html" }).send(template);
            return;
        } else {
            // Production: SSR with dynamic SEO
            console.log(`🚀 Starting SSR for: ${url}`);
            
            try {
                // Try to import and use SSR
                const serverModule = await import("./dist/server/entry-server.js");
                console.log(`✅ SSR module imported`);
                
                const { html: renderedHtml, seoData } = await serverModule.render(url);
                console.log(`✅ SSR completed, HTML length: ${renderedHtml?.length || 0}, has SEO: ${!!seoData}`);
                
                // Use root index-ssr.html template and manually inject asset paths
                template = await fs.readFile("./index-ssr.html", "utf-8");
                console.log(`✅ Template read, length: ${template.length}`);
                
                // Update asset paths for production - dynamically find correct files
                const assetsDir = await fs.readdir("./dist/client/assets");
                const clientSSRFile = assetsDir.find(file => file.startsWith('client-ssr-'));
                const clientFile = assetsDir.find(file => file.startsWith('client-') && file.endsWith('.js') && !file.includes('ssr'));
                const queryClientJSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.js'));
                const queryClientCSSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.css'));
                
                console.log(`✅ Found assets: clientSSR=${clientSSRFile}, client=${clientFile}, queryJS=${queryClientJSFile}, queryCSS=${queryClientCSSFile}`);
                
                if (clientSSRFile) {
                    template = template.replace('src="/src/entry-client.tsx"', `type="module" crossorigin src="/assets/${clientSSRFile}"`);
                }
                
                if (clientFile && queryClientJSFile && queryClientCSSFile) {
                    template = template.replace('</head>', `    <link rel="modulepreload" crossorigin href="/assets/${clientFile}">
    <link rel="modulepreload" crossorigin href="/assets/${queryClientJSFile}">
    <link rel="stylesheet" crossorigin href="/assets/${queryClientCSSFile}">
  </head>`);
                }
                console.log(`✅ Asset paths updated`);
                
                let finalHtml = template;
                
                // Inject dynamic SEO metadata - either server-specific or default
                let dynamicHead;
                
                if (seoData) {
                    console.log(`✅ Injecting server-specific SEO data: ${seoData.title}`);
                    
                    // Helper function to escape HTML attributes
                    const escapeHtml = (text) => text
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    
                    // Inject server-specific SEO content
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
                    console.log(`✅ Injecting default SEO data for: ${url}`);
                    
                    // Default SEO for non-server pages
                    const defaultSeoUrl = `https://magicmcp.net${url}`;
                    dynamicHead = `
    <title>Magic MCP - Model Context Protocol 服务器发现平台</title>
    <meta name="description" content="发现并集成最优秀的 Model Context Protocol (MCP) 服务器。浏览超过200个高质量的MCP服务器，涵盖数据库、文件系统、API集成等各种功能领域。" />
    <meta name="keywords" content="MCP, Model Context Protocol, AI工具, 服务器, 数据库集成, API, 开发工具" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="Magic MCP - Model Context Protocol 服务器发现平台" />
    <meta property="og:description" content="发现并集成最优秀的 Model Context Protocol (MCP) 服务器。浏览超过200个高质量的MCP服务器，涵盖数据库、文件系统、API集成等各种功能领域。" />
    <meta property="og:url" content="${defaultSeoUrl}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="Magic MCP - Model Context Protocol 服务器发现平台" />
    <meta property="twitter:description" content="发现并集成最优秀的 Model Context Protocol (MCP) 服务器。浏览超过200个高质量的MCP服务器，涵盖数据库、文件系统、API集成等各种功能领域。" />
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
    </script>`;
                }
                
                finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
                console.log(`✅ SEO injection completed`);
                
                // Inject the rendered HTML into the template
                console.log(`✅ Injecting HTML content, length: ${renderedHtml?.length || 0}`);
                finalHtml = finalHtml.replace('<!--app-html-->', renderedHtml || '');
                
                // Verify injection worked
                const hasEmptyRoot = finalHtml.includes('<div id="root"></div>');
                console.log(`✅ Root div is empty after injection: ${hasEmptyRoot}`);
                console.log(`✅ Final HTML length: ${finalHtml.length}`);
                
                res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
                console.log(`✅ Response sent successfully`);
                return;
                
            } catch (ssrError) {
                console.error("❌ SSR failed, falling back to client-side rendering:", ssrError.message);
                console.error("❌ SSR Error stack:", ssrError.stack);
                
                // Fallback to basic client-side rendering
                template = await fs.readFile("./dist/client/index.html", "utf-8");
                res.status(200).set({ "Content-Type": "text/html" }).send(template);
                return;
            }
        }
        
    } catch (e) {
        if (vite) {
            vite.ssrFixStacktrace(e);
        }
        console.error("Server error:", e);
        res.status(500).end(e.stack);
    }
});

// Initialize static cache and set up cron job
async function initializeStaticCache() {
    if (isProduction) {
        console.log("🏗️ Initializing static cache system...");
        
        // Generate initial static home page
        const result = await generateStaticHome();
        if (result.success) {
            console.log("✅ Initial static home page generated");
        } else {
            console.warn("⚠️ Initial static generation failed:", result.error);
        }
        
        // Set up cron job to regenerate every hour (at minute 0)
        cron.schedule('0 * * * *', async () => {
            console.log("⏰ Hourly static home page regeneration started");
            try {
                const result = await generateStaticHome();
                if (result.success) {
                    console.log("✅ Scheduled static home page regeneration completed");
                } else {
                    console.error("❌ Scheduled static generation failed:", result.error);
                }
            } catch (error) {
                console.error("❌ Cron job error:", error);
            }
        }, {
            scheduled: true,
            timezone: "UTC"
        });
        
        console.log("✅ Static cache system initialized with hourly regeneration");
    }
}

// Start http server and initialize static cache
app.listen(port, async () => {
    console.log(`Server started at http://localhost:${port}`);
    
    // Initialize static cache system
    await initializeStaticCache();
});