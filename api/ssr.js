import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, '..', p);

export default async function handler(req, res) {
    try {
        const url = req.url;
        
        // Skip SSR for static files
        if (url.match(/\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/)) {
            return res.status(404).end();
        }

        // Read HTML template
        let template;
        try {
            template = await fs.readFile(resolve("dist/client/index.html"), "utf-8");
        } catch (e) {
            template = await fs.readFile(resolve("index-ssr.html"), "utf-8");
        }

        // Import render function from server build
        const { render } = await import("../dist/server/entry-server.js");
        
        // Render the app
        const { html, seoData } = await render(url.replace(/^\//, '') || "/");
        
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
    
    <!-- Open Graph -->
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
        
        // Set headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.status(200).send(finalHtml);
    } catch (e) {
        console.error("SSR Error:", e);
        res.status(500).send(`<html><body><h1>Server Error</h1><pre>${e.stack}</pre></body></html>`);
    }
}