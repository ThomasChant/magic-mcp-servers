import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, '..', p);

// MIME type mapping
const mimeTypes = {
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

// Helper function to update asset paths dynamically
async function updateAssetPaths(template) {
    try {
        const assetsDir = resolve('dist/client/assets');
        const files = await fs.readdir(assetsDir);
        
        // Find the correct asset files
        const indexJSFile = files.find(file => file.startsWith('index-') && file.endsWith('.js'));
        const indexCSSFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));
        
        console.log(`📦 Found assets: JS=${indexJSFile}, CSS=${indexCSSFile}`);
        
        let updatedTemplate = template;
        
        // Update JS file reference
        if (indexJSFile) {
            // Replace any existing JS script reference
            updatedTemplate = updatedTemplate.replace(
                /src="\/assets\/index-[^"]+\.js"/g,
                `src="/assets/${indexJSFile}"`
            );
            // Also handle entry-client.tsx fallback
            updatedTemplate = updatedTemplate.replace(
                'src="/src/entry-client.tsx"',
                `type="module" crossorigin src="/assets/${indexJSFile}"`
            );
        }
        
        // Add CSS if not present and file exists
        if (indexCSSFile && !updatedTemplate.includes(`/assets/${indexCSSFile}`)) {
            // Remove any existing CSS links to avoid duplicates
            updatedTemplate = updatedTemplate.replace(
                /<link[^>]+href="\/assets\/index-[^"]+\.css"[^>]*>/g,
                ''
            );
            // Add the correct CSS link before </head>
            updatedTemplate = updatedTemplate.replace(
                '</head>',
                `    <link rel="stylesheet" crossorigin href="/assets/${indexCSSFile}">\n  </head>`
            );
        }
        
        console.log(`✅ Asset paths updated in template`);
        return updatedTemplate;
        
    } catch (error) {
        console.warn(`⚠️ Could not update asset paths:`, error.message);
        return template;
    }
}

// Simplified SSR logic - only render SEO-critical pages
function needsSSR(url) {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Extract locale from URL if present
    const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
    const localeMatch = normalizedUrl.match(localePattern);
    
    let pathWithoutLocale = normalizedUrl;
    if (localeMatch) {
        // Remove locale prefix to check the actual route
        pathWithoutLocale = localeMatch[2] || '/';
    }
    
    // Core pages that need SSR for SEO
    const ssrRoutes = ['/', '/servers', '/categories'];
    const dynamicSSRRoutes = ['/servers/', '/categories/'];
    
    return ssrRoutes.includes(pathWithoutLocale) || 
           dynamicSSRRoutes.some(route => pathWithoutLocale.startsWith(route));
}

export default async function handler(req, res) {
    try {
        const url = req.url;
        
        // Debug: Log environment info
        console.log("🔍 Vercel Environment Debug:");
        console.log("  - Current working directory:", process.cwd());
        console.log("  - __dirname:", __dirname);
        console.log("  - NODE_ENV:", process.env.NODE_ENV);
        console.log("  - VERCEL:", process.env.VERCEL);
        console.log("  - Request URL:", url);

        // Handle static files
        if (
            url.match(
                /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/
            )
        ) {
            try {
                // Try assets directory first
                let filePath = resolve(`dist/client/assets${url}`);
                let fileExists = false;

                try {
                    await fs.access(filePath);
                    fileExists = true;
                } catch {
                    // Try root client directory
                    filePath = resolve(`dist/client${url}`);
                    try {
                        await fs.access(filePath);
                        fileExists = true;
                    } catch {
                        fileExists = false;
                    }
                }

                if (fileExists) {
                    const fileContent = await fs.readFile(filePath);
                    const mimeType = getMimeType(filePath);

                    res.setHeader("Content-Type", mimeType);
                    res.setHeader(
                        "Cache-Control",
                        "public, max-age=31536000, immutable"
                    );
                    return res.status(200).send(fileContent);
                }
            } catch (error) {
                console.error("Static file error:", error);
            }

            return res.status(404).end();
        }

        // 🚀 Simplified SSR: Check if this route needs SSR
        const routePath = url === "/" ? "/" : url;
        const requiresSSR = needsSSR(routePath);
        
        // Extract locale from URL if present
        const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
        const localeMatch = routePath.match(localePattern);
        const locale = localeMatch ? localeMatch[1] : 'en';
        const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : routePath;

        console.log(`📡 Processing request: ${routePath}`);
        console.log(
            `🔍 URL analysis: original="${url}", normalized="${routePath}", locale="${locale}", pathWithoutLocale="${pathWithoutLocale}"`
        );
        console.log(`🎯 Needs SSR: ${requiresSSR ? "Yes" : "No"}`);
        console.log(`🏠 Is home page: ${routePath === "/"}`);

        // Special logging for home page
        if (routePath === "/") {
            console.log(`🏠 HOME PAGE DETECTED - Should use SSR!`);
        }

        // Load template - prioritize SSR template with placeholders
        let template;
        try {
            // In Vercel deployment, try dist/client directory first
            template = await fs.readFile(
                resolve("dist/client/index-ssr.html"),
                "utf-8"
            );
            console.log(
                `📄 Using SSR template: dist/client/index-ssr.html (${template.length} chars)`
            );
        } catch (e) {
            try {
                // Fallback to root directory for local development
                template = await fs.readFile(
                    resolve("index-ssr.html"),
                    "utf-8"
                );
                console.log(
                    `📄 Using SSR template: index-ssr.html (${template.length} chars)`
                );
            } catch (e2) {
                console.log(
                    `⚠️ SSR templates not found, falling back to client template`
                );
                try {
                    template = await fs.readFile(
                        resolve("dist/client/index.html"),
                        "utf-8"
                    );
                    console.log(
                        `📄 Using client template: dist/client/index.html (${template.length} chars)`
                    );
                    // Check if this template has placeholders
                    if (
                        !template.includes("<!--app-head-->") ||
                        !template.includes("<!--app-html-->")
                    ) {
                        console.warn(
                            `⚠️ Client template missing SSR placeholders - SSR may not work correctly`
                        );
                    }
                } catch (e3) {
                    console.error(`❌ No template found: ${e3.message}`);
                    throw new Error("No HTML template found for SSR");
                }
            }
        }

        // 🔧 Update asset paths dynamically
        template = await updateAssetPaths(template);

        if (!requiresSSR) {
            // 🏃‍♂️ CSR Mode: Return basic template for client-side rendering
            console.log(`⚡ Using CSR for: ${routePath}`);

            // Basic SEO for non-SSR pages
            const basicHead = `
    <title>Magic MCP - Model Context Protocol Server Discovery</title>
    <meta name="description" content="Discover and integrate the best Model Context Protocol (MCP) servers for AI applications." />
    <meta name="keywords" content="MCP, Model Context Protocol, AI tools, servers, Claude MCP, AI integration" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Magic MCP - Model Context Protocol Server Discovery" />
    <meta property="og:description" content="Discover and integrate the best Model Context Protocol (MCP) servers for AI applications." />
    <meta property="og:url" content="https://magicmcp.net${routePath}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://magicmcp.net${routePath}" />
    
    <!-- Language alternate links -->
    <link rel="alternate" hreflang="en" href="https://magicmcp.net${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-CN" href="https://magicmcp.net/zh-CN${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-TW" href="https://magicmcp.net/zh-TW${pathWithoutLocale}" />
    <link rel="alternate" hreflang="fr" href="https://magicmcp.net/fr${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ja" href="https://magicmcp.net/ja${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ko" href="https://magicmcp.net/ko${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ru" href="https://magicmcp.net/ru${pathWithoutLocale}" />
    <link rel="alternate" hreflang="x-default" href="https://magicmcp.net${pathWithoutLocale}" />`;

            const finalHtml = template
                .replace(`<!--app-head-->`, basicHead)
                .replace(`<!--app-html-->`, '<div id="root"></div>');

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader(
                "Cache-Control",
                "public, max-age=3600, s-maxage=3600"
            );
            res.setHeader("X-Render-Mode", "CSR");

            return res.status(200).send(finalHtml);
        }

        // 🎨 SSR Mode: Full server-side rendering for SEO-critical pages
        console.log(`🚀 Using SSR for: ${routePath}`);

        // For home page, always use dynamic SSR for better content
        if (routePath === "/") {
            console.log(`🏠 FORCING DYNAMIC SSR FOR HOME PAGE`);
        }

        // Check for prerendered static files first (skip home page)
        const staticFiles = {
            "/servers": "servers.html",
            "/categories": "categories.html",
        };

        const staticFileName = staticFiles[routePath];
        if (staticFileName && routePath !== "/") {
            // Try client directory first (Vercel deployment location)
            const clientFilePath = resolve(`dist/client/${staticFileName}`);
            try {
                await fs.access(clientFilePath);
                let staticContent = await fs.readFile(clientFilePath, "utf-8");

                // 🔧 Update asset paths for prerendered files too
                staticContent = await updateAssetPaths(staticContent);

                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.setHeader(
                    "Cache-Control",
                    "public, max-age=3600, s-maxage=3600"
                );
                res.setHeader("X-Prerendered", "true");
                res.setHeader("X-Prerendered-Source", "client");
                console.log(`✅ Serving prerendered file: ${clientFilePath}`);
                return res.status(200).send(staticContent);
            } catch {
                // Fallback to static directory
                const staticFilePath = resolve(`dist/static/${staticFileName}`);
                try {
                    await fs.access(staticFilePath);
                    let staticContent = await fs.readFile(
                        staticFilePath,
                        "utf-8"
                    );

                    // 🔧 Update asset paths for prerendered files too
                    staticContent = await updateAssetPaths(staticContent);

                    res.setHeader("Content-Type", "text/html; charset=utf-8");
                    res.setHeader(
                        "Cache-Control",
                        "public, max-age=3600, s-maxage=3600"
                    );
                    res.setHeader("X-Prerendered", "true");
                    res.setHeader("X-Prerendered-Source", "static");
                    console.log(
                        `✅ Serving prerendered file: ${staticFilePath}`
                    );
                    return res.status(200).send(staticContent);
                } catch {
                    // No prerendered file found, proceed with dynamic SSR
                    console.log(
                        `⚠️ Prerendered file not found in client or static: ${staticFileName}`
                    );
                }
            }
        }

        // Import render function from server build
        // In Vercel environment, the path might be different
        let render;
        
        // Debug: Check what files exist
        console.log("🔍 Checking for entry-server.js...");
        const possiblePaths = [
            "../dist/server/entry-server.js",
            "./dist/server/entry-server.js",
            resolve("dist/server/entry-server.js"),
            "/var/task/dist/server/entry-server.js", // Vercel function path
            path.join(process.cwd(), "dist/server/entry-server.js")
        ];
        
        for (const testPath of possiblePaths) {
            try {
                await fs.access(testPath);
                console.log(`✅ File exists at: ${testPath}`);
            } catch {
                console.log(`❌ File not found at: ${testPath}`);
            }
        }
        
        // Also check dist directory structure
        try {
            const distPath = resolve("dist");
            const distContents = await fs.readdir(distPath);
            console.log("📁 Contents of dist directory:", distContents);
            
            const serverPath = resolve("dist/server");
            const serverContents = await fs.readdir(serverPath);
            console.log("📁 Contents of dist/server directory:", serverContents);
        } catch (e) {
            console.log("❌ Could not read dist directory:", e.message);
        }
        
        // Try multiple import strategies for Vercel compatibility
        let importError = null;
        const importStrategies = [
            // Strategy 1: Relative path from api directory
            async () => {
                const module = await import("../dist/server/entry-server.js");
                console.log("✅ Loaded entry-server using relative path from api/");
                return module.render;
            },
            // Strategy 2: Path from project root (Vercel's working directory)
            async () => {
                const entryPath = path.join(process.cwd(), "dist/server/entry-server.js");
                const module = await import(entryPath);
                console.log("✅ Loaded entry-server using cwd path:", entryPath);
                return module.render;
            },
            // Strategy 3: Using file URL
            async () => {
                const entryPath = new URL(
                    "../dist/server/entry-server.js",
                    import.meta.url
                ).pathname;
                const module = await import(entryPath);
                console.log("✅ Loaded entry-server using file URL:", entryPath);
                return module.render;
            },
            // Strategy 4: Vercel's /var/task directory
            async () => {
                const module = await import("/var/task/dist/server/entry-server.js");
                console.log("✅ Loaded entry-server from /var/task/");
                return module.render;
            }
        ];

        for (const strategy of importStrategies) {
            try {
                render = await strategy();
                break;
            } catch (e) {
                importError = e;
                console.log("❌ Import strategy failed:", e.message);
            }
        }

        if (!render) {
            console.error("❌ All import strategies failed. Last error:", importError);
            console.warn("⚠️ Falling back to client-side rendering");
            
            // Fallback to CSR with basic SEO
            const basicHead = `
    <title>Magic MCP - Model Context Protocol Server Discovery</title>
    <meta name="description" content="Discover and integrate the best Model Context Protocol (MCP) servers for AI applications." />
    <meta name="keywords" content="MCP, Model Context Protocol, AI tools, servers, Claude MCP, AI integration" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Magic MCP - Model Context Protocol Server Discovery" />
    <meta property="og:description" content="Discover and integrate the best Model Context Protocol (MCP) servers for AI applications." />
    <meta property="og:url" content="https://magicmcp.net${routePath}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://magicmcp.net${routePath}" />
    
    <!-- Language alternate links -->
    <link rel="alternate" hreflang="en" href="https://magicmcp.net${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-CN" href="https://magicmcp.net/zh-CN${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-TW" href="https://magicmcp.net/zh-TW${pathWithoutLocale}" />
    <link rel="alternate" hreflang="fr" href="https://magicmcp.net/fr${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ja" href="https://magicmcp.net/ja${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ko" href="https://magicmcp.net/ko${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ru" href="https://magicmcp.net/ru${pathWithoutLocale}" />
    <link rel="alternate" hreflang="x-default" href="https://magicmcp.net${pathWithoutLocale}" />`;

            const finalHtml = template
                .replace(`<!--app-head-->`, basicHead)
                .replace(`<!--app-html-->`, '<div id="root"></div>');

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
            res.setHeader("X-Render-Mode", "CSR-Fallback");
            res.setHeader("X-SSR-Error", importError?.message || "Unknown error");

            return res.status(200).send(finalHtml);
        }

        // Add detailed debug logging for dynamic routes
        if (
            routePath.includes("/servers/") ||
            routePath.includes("/categories/")
        ) {
            console.log(`🔄 Dynamic SSR rendering for: ${routePath}`);
            console.log(
                `🔄 About to call render function with URL: ${routePath}`
            );
        }

        // Render the app with the full URL path and locale
        console.log(`🎨 Calling render function for: ${routePath} (locale: ${locale})`);
        const renderResult = await render(routePath, { locale });
        console.log(`🎨 Render result:`, {
            hasHtml: !!renderResult.html,
            htmlLength: renderResult.html?.length || 0,
            hasSeoData: !!renderResult.seoData,
            hasServerData: !!renderResult.serverData,
            hasAdditionalData: !!renderResult.additionalData,
        });

        const { html, seoData } = renderResult;

        // Helper function to escape HTML
        const escapeHtml = (text) =>
            text
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        // Inject SEO data
        const dynamicHead = `
    <title>${escapeHtml(seoData.title)}</title>
    <meta name="description" content="${escapeHtml(seoData.description)}" />
    <meta name="keywords" content="${escapeHtml(seoData.keywords)}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(seoData.ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(
        seoData.ogDescription
    )}" />
    <meta property="og:url" content="${escapeHtml(seoData.ogUrl)}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="${escapeHtml(seoData.ogTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(
        seoData.ogDescription
    )}" />
    <meta property="twitter:url" content="${escapeHtml(seoData.ogUrl)}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />
    
    <!-- Language alternate links -->
    ${seoData.hreflangTags ? seoData.hreflangTags : `
    <link rel="alternate" hreflang="en" href="https://magicmcp.net${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-CN" href="https://magicmcp.net/zh-CN${pathWithoutLocale}" />
    <link rel="alternate" hreflang="zh-TW" href="https://magicmcp.net/zh-TW${pathWithoutLocale}" />
    <link rel="alternate" hreflang="fr" href="https://magicmcp.net/fr${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ja" href="https://magicmcp.net/ja${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ko" href="https://magicmcp.net/ko${pathWithoutLocale}" />
    <link rel="alternate" hreflang="ru" href="https://magicmcp.net/ru${pathWithoutLocale}" />
    <link rel="alternate" hreflang="x-default" href="https://magicmcp.net${pathWithoutLocale}" />
    `}
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(seoData.structuredData, null, 2)}
    </script>`;

        // Replace placeholders with debug logging
        console.log(
            `🔄 Template replacement - original length: ${template.length}`
        );
        console.log(
            `🔄 Template has <!--app-head-->: ${template.includes(
                "<!--app-head-->"
            )}`
        );
        console.log(
            `🔄 Template has <!--app-html-->: ${template.includes(
                "<!--app-html-->"
            )}`
        );
        console.log(`🔄 Rendered HTML length: ${html.length}`);
        console.log(`🔄 Dynamic head length: ${dynamicHead.length}`);

        const finalHtml = template
            .replace(`<!--app-head-->`, dynamicHead)
            .replace(`<!--app-html-->`, html);

        console.log(`🔄 Final HTML length: ${finalHtml.length}`);

        // Set headers based on route type
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        // Dynamic caching strategy based on route
        if (
            routePath.includes("/servers/") ||
            routePath.includes("/categories/")
        ) {
            // Dynamic pages - shorter cache for real-time updates
            res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300"); // 5 minutes
            res.setHeader("X-Render-Mode", "SSR-Dynamic");
        } else {
            // Static-like pages - longer cache
            res.setHeader(
                "Cache-Control",
                "public, max-age=3600, s-maxage=3600"
            ); // 1 hour
            res.setHeader("X-Render-Mode", "SSR-Static");
        }

        res.status(200).send(finalHtml);
    } catch (e) {
        console.error("SSR Error:", e);
        res.status(500).send(
            `<html><body><h1>Server Error</h1><pre>${e.stack}</pre></body></html>`
        );
    }
} 