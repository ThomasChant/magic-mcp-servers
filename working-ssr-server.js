import fs from "node:fs/promises";
import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3004;
const isProduction = true;

// SSR-first approach: Handle dynamic routes before static files
app.use("*", async (req, res) => {
    try {
        const url = req.originalUrl;

        // Handle static files first
        if (
            url.match(
                /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/
            )
        ) {
            // Try to serve static file
            try {
                const staticPath = `./dist/client${url}`;
                const fileContent = await fs.readFile(staticPath);
                const ext = url.split(".").pop().toLowerCase();
                const mimeTypes = {
                    js: "application/javascript",
                    mjs: "application/javascript",
                    css: "text/css",
                    png: "image/png",
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    gif: "image/gif",
                    svg: "image/svg+xml",
                    ico: "image/x-icon",
                    woff: "font/woff",
                    woff2: "font/woff2",
                    ttf: "font/ttf",
                    eot: "application/vnd.ms-fontobject",
                    json: "application/json",
                    xml: "application/xml",
                    txt: "text/plain",
                    webmanifest: "application/manifest+json",
                };

                res.setHeader(
                    "Content-Type",
                    mimeTypes[ext] || "application/octet-stream"
                );
                res.setHeader(
                    "Cache-Control",
                    "public, max-age=31536000, immutable"
                );
                return res.status(200).send(fileContent);
            } catch (staticError) {
                return res.status(404).end();
            }
        }

        console.log(`📡 Processing: ${url}`);

        // Define pages that need SSR
        const isServerDetailPage = url.match(/^\/servers\/[^\/]+$/);
        const isHomePage = url === "/" || url === "";
        const isServersListPage = url === "/servers";
        const isCategoriesListPage = url === "/categories";
        const isCategoryDetailPage = url.match(/^\/categories\/[^\/]+$/);

        const needsSSR =
            isServerDetailPage ||
            isHomePage ||
            isServersListPage ||
            isCategoriesListPage ||
            isCategoryDetailPage;

        if (needsSSR) {
            const pageType = isHomePage
                ? "home page"
                : isServerDetailPage
                ? "server detail page"
                : isServersListPage
                ? "servers list page"
                : isCategoriesListPage
                ? "categories list page"
                : isCategoryDetailPage
                ? "category detail page"
                : "page";
            console.log(`🚀 Doing SSR for ${pageType}: ${url}`);

            try {
                // Import SSR module
                const serverModule = await import(
                    "./dist/server/entry-server.js"
                );

                // Execute SSR
                const { html: renderedHtml, seoData } =
                    await serverModule.render(url);
                console.log(
                    `✅ SSR completed, HTML length: ${
                        renderedHtml?.length || 0
                    }`
                );

                // Read template
                const template = await fs.readFile("./index-ssr.html", "utf-8");

                // Update asset paths for production
                let finalHtml = template.replace(
                    'src="/src/entry-client.tsx"',
                    'type="module" crossorigin src="/assets/client-ssr-C7Wy1hAj.js"'
                );

                // Add missing CSS and preload links
                finalHtml = finalHtml.replace(
                    "</head>",
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

                    finalHtml = finalHtml.replace(
                        "<!--app-head-->",
                        dynamicHead
                    );
                    console.log(`✅ SEO data injected for: ${seoData.title}`);
                } else {
                    finalHtml = finalHtml.replace("<!--app-head-->", "");
                }

                // Inject rendered HTML
                finalHtml = finalHtml.replace(
                    "<!--app-html-->",
                    renderedHtml || ""
                );
                console.log(`✅ HTML content injected`);

                // Verify the injection worked
                const hasContent = !finalHtml.includes('<div id="root"></div>');
                console.log(`✅ Root div has content: ${hasContent}`);

                res.status(200)
                    .set({ "Content-Type": "text/html" })
                    .send(finalHtml);
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