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
                const serverDetailFile = assetsDir.find(file => file.startsWith('ServerDetail-'));
                const queryClientJSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.js'));
                const queryClientCSSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.css'));
                
                console.log(`✅ Found assets: ${clientSSRFile}, ${serverDetailFile}, ${queryClientJSFile}, ${queryClientCSSFile}`);
                
                template = template.replace('src="/src/entry-client.tsx"', `type="module" crossorigin src="/assets/${clientSSRFile}"`);
                template = template.replace('</head>', `    <link rel="modulepreload" crossorigin href="/assets/${serverDetailFile}">
    <link rel="modulepreload" crossorigin href="/assets/${queryClientJSFile}">
    <link rel="stylesheet" crossorigin href="/assets/${queryClientCSSFile}">
  </head>`);
                console.log(`✅ Asset paths updated`);
                
                let finalHtml = template;
                
                // Inject dynamic SEO metadata if available
                if (seoData) {
                    console.log(`✅ Injecting SEO data: ${seoData.title}`);
                    
                    // Inject dynamic head content
                    const dynamicHead = `
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}" />
    <meta name="keywords" content="${seoData.keywords}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="${seoData.ogTitle}" />
    <meta property="og:description" content="${seoData.ogDescription}" />
    <meta property="og:url" content="${seoData.ogUrl}" />
    <meta property="og:image" content="${seoData.ogImage}" />
    
    <!-- Twitter -->
    <meta property="twitter:title" content="${seoData.ogTitle}" />
    <meta property="twitter:description" content="${seoData.ogDescription}" />
    <meta property="twitter:url" content="${seoData.ogUrl}" />
    <meta property="twitter:image" content="${seoData.ogImage}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${seoData.canonicalUrl}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(seoData.structuredData, null, 2)}
    </script>`;
                    
                    finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
                    console.log(`✅ SEO injection completed`);
                } else {
                    // Default SEO for non-server pages
                    finalHtml = finalHtml.replace('<!--app-head-->', '');
                    console.log(`✅ No SEO data, cleared placeholder`);
                }
                
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

// Start http server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});