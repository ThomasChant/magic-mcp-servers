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

// Simplified SSR logic - only render SEO-critical pages
function needsSSR(url) {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Core pages that need SSR for SEO
    const ssrRoutes = ['/', '/servers', '/categories'];
    const dynamicSSRRoutes = ['/servers/', '/categories/'];
    
    return ssrRoutes.includes(normalizedUrl) || 
           dynamicSSRRoutes.some(route => normalizedUrl.startsWith(route));
}

export default async function handler(req, res) {
    try {
        const url = req.url;

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

        console.log(`📡 Processing request: ${routePath}`);
        console.log(`🎯 Needs SSR: ${requiresSSR ? "Yes" : "No"}`);

        // Load template - prioritize SSR template with placeholders
        let template;
        try {
            // For SSR, we should use the template with placeholders, not the built client file
            template = await fs.readFile(resolve("index-ssr.html"), "utf-8");
            console.log(
                `📄 Using SSR template: index-ssr.html (${template.length} chars)`
            );
        } catch (e) {
            console.log(
                `⚠️ SSR template not found, falling back to client template`
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
            } catch (e2) {
                console.error(`❌ No template found: ${e2.message}`);
                throw new Error("No HTML template found for SSR");
            }
        }

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
    <link rel="canonical" href="https://magicmcp.net${routePath}" />`;

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

        // Check for prerendered static files first
        const staticFiles = {
            "/": "index.html",
            "/servers": "servers.html",
            "/categories": "categories.html",
        };

        const staticFileName = staticFiles[routePath];
        if (staticFileName) {
            // Try client directory first (Vercel deployment location)
            const clientFilePath = resolve(`dist/client/${staticFileName}`);
            try {
                await fs.access(clientFilePath);
                const staticContent = await fs.readFile(
                    clientFilePath,
                    "utf-8"
                );

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
                    const staticContent = await fs.readFile(
                        staticFilePath,
                        "utf-8"
                    );

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
        const { render } = await import("../dist/server/entry-server.js");

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

        // Render the app with the full URL path
        console.log(`🎨 Calling render function for: ${routePath}`);
        const renderResult = await render(routePath);
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