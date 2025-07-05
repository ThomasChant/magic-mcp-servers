import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import sirv from "sirv";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, '..', p);

// Create Express app
const app = express();

// Add compression middleware
app.use(compression());

// Serve static files in production
app.use("/assets", sirv(resolve("dist/client/assets"), { 
    immutable: true,
    maxAge: 31536000 // 1 year
}));

// Serve static files
app.use(sirv(resolve("dist/client"), { 
    gzip: true,
    single: false
}));

// Main SSR handler
app.use("*", async (req, res) => {
    try {
        const url = req.originalUrl.replace("/", "");

        // Read template - try production build first, fallback to SSR template
        let template;
        try {
            template = await fs.readFile(resolve("dist/client/index.html"), "utf-8");
        } catch (e) {
            // Fallback to SSR template if production build not found
            template = await fs.readFile(resolve("index-ssr.html"), "utf-8");
        }

        // Import render function from server build
        const { render } = await import("../dist/server/entry-server.js");
        
        // Render the app
        const { html, seoData } = await render(url || "/");
        
        // Helper function to escape HTML
        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Inject SEO data
        const dynamicHead = `
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
        
        // Replace placeholders
        const finalHtml = template
            .replace(`<!--app-head-->`, dynamicHead)
            .replace(`<!--app-html-->`, html);
        
        // Send the rendered page
        res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
    } catch (e) {
        console.error("SSR Error:", e);
        res.status(500).end(e.stack);
    }
});

export default app;