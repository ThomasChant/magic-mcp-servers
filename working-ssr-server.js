import fs from "node:fs/promises";
import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3004;
const isProduction = true;

// Serve static files from dist/client
app.use(express.static('./dist/client'));

// Serve HTML with working SSR
app.use("*", async (req, res) => {
    try {
        const url = req.originalUrl;
        console.log(`📡 Processing: ${url}`);
        
        // Only do SSR for server detail pages
        const isServerDetailPage = url.match(/^\/servers\/[^\/]+$/);
        
        if (isServerDetailPage) {
            console.log(`🚀 Doing SSR for server detail page: ${url}`);
            
            try {
                // Import SSR module
                const serverModule = await import("./dist/server/entry-server.js");
                
                // Execute SSR
                const { html: renderedHtml, seoData } = await serverModule.render(url);
                console.log(`✅ SSR completed, HTML length: ${renderedHtml?.length || 0}`);
                
                // Read template
                const template = await fs.readFile("./index-ssr.html", "utf-8");
                
                // Update asset paths for production
                let finalHtml = template.replace(
                    'src="/src/entry-client.tsx"', 
                    'type="module" crossorigin src="/assets/client-ssr-C7Wy1hAj.js"'
                );
                
                // Add missing CSS and preload links
                finalHtml = finalHtml.replace(
                    '</head>',
                    `    <link rel="modulepreload" crossorigin href="/assets/App-BJ1Zc2qx.js">
    <link rel="modulepreload" crossorigin href="/assets/index-BKm06T18.js">
    <link rel="stylesheet" crossorigin href="/assets/index-Cw0W-wPH.css">
  </head>`
                );
                
                // Inject dynamic SEO
                if (seoData) {
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
    <link rel="canonical" href="${seoData.canonicalUrl}" />`;
                    
                    finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
                    console.log(`✅ SEO data injected for: ${seoData.title}`);
                } else {
                    finalHtml = finalHtml.replace('<!--app-head-->', '');
                }
                
                // Inject rendered HTML
                finalHtml = finalHtml.replace('<!--app-html-->', renderedHtml || '');
                console.log(`✅ HTML content injected`);
                
                // Verify the injection worked
                const hasContent = !finalHtml.includes('<div id="root"></div>');
                console.log(`✅ Root div has content: ${hasContent}`);
                
                res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
                console.log(`✅ Response sent for ${url}`);
                return;
                
            } catch (ssrError) {
                console.error("❌ SSR failed:", ssrError.message);
                console.error("❌ SSR stack:", ssrError.stack);
                // Don't fallback, let's see the actual error
                res.status(500).send(`SSR Error: ${ssrError.message}`);
                return;
            }
        }
        
        // For non-server pages, serve the basic client-side version
        console.log(`📄 Serving client-side rendering for: ${url}`);
        const template = await fs.readFile("./dist/client/index.html", "utf-8");
        res.status(200).set({ "Content-Type": "text/html" }).send(template);
        
    } catch (e) {
        console.error("💥 Server error:", e.message);
        console.error("💥 Server stack:", e.stack);
        res.status(500).send(`Server Error: ${e.message}`);
    }
});

// Start server
app.listen(port, () => {
    console.log(`🔥 Working SSR server started at http://localhost:${port}`);
    console.log(`🔍 Test with: http://localhost:${port}/servers/InditexTech_mcp-teams-server`);
});