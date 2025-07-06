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

export default async function handler(req, res) {
    try {
        const url = req.url;
        
        // Handle static files
        if (url.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/)) {
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
                    
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    return res.status(200).send(fileContent);
                }
            } catch (error) {
                console.error('Static file error:', error);
            }
            
            return res.status(404).end();
        }

        // Check for prerendered static files first
        const staticFiles = {
            '/': 'index.html',
            '/servers': 'servers.html', 
            '/categories': 'categories.html'
        };
        
        const staticFileName = staticFiles[url];
        if (staticFileName) {
            // Try client directory first (Vercel deployment location)
            const clientFilePath = resolve(`dist/client/${staticFileName}`);
            try {
                await fs.access(clientFilePath);
                const staticContent = await fs.readFile(clientFilePath, "utf-8");
                
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
                res.setHeader('X-Prerendered', 'true');
                res.setHeader('X-Prerendered-Source', 'client');
                console.log(`✅ Serving prerendered file: ${clientFilePath}`);
                return res.status(200).send(staticContent);
            } catch {
                // Fallback to static directory
                const staticFilePath = resolve(`dist/static/${staticFileName}`);
                try {
                    await fs.access(staticFilePath);
                    const staticContent = await fs.readFile(staticFilePath, "utf-8");
                    
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
                    res.setHeader('X-Prerendered', 'true');
                    res.setHeader('X-Prerendered-Source', 'static');
                    console.log(`✅ Serving prerendered file: ${staticFilePath}`);
                    return res.status(200).send(staticContent);
                } catch {
                    // No prerendered file found, proceed with SSR
                    console.log(`⚠️ Prerendered file not found in client or static: ${staticFileName}`);
                }
            }
        }

        // Handle SSR for HTML pages
        let template;
        try {
            // Use the SSR template file first - it has the correct placeholders
            template = await fs.readFile(resolve("index-ssr.html"), "utf-8");
        } catch (e) {
            // Fallback to the root template if SSR template is not available
            template = await fs.readFile(resolve("index.html"), "utf-8");
        }

        // Import render function from server build
        const { render } = await import("../dist/server/entry-server.js");
        
        // Parse route and extract parameters for dynamic SSR
        const routePath = url === '/' ? '/' : url;
        
        // Add debug logging for all routes
        console.log(`🔄 SSR processing route: ${routePath}`);
        
        // Add detailed debug logging for dynamic routes
        if (routePath.includes('/servers/') || routePath.includes('/categories/')) {
            console.log(`🔄 Dynamic SSR rendering for: ${routePath}`);
        }
        
        // Render the app with the full URL path
        const { html, seoData } = await render(routePath);
        
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
        
        // Set headers based on route type
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        
        // Dynamic caching strategy based on route
        if (routePath.includes('/servers/') || routePath.includes('/categories/')) {
            // Dynamic pages - shorter cache for real-time updates
            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes
            res.setHeader('X-SSR-Dynamic', 'true');
        } else {
            // Static-like pages - longer cache
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 1 hour
            res.setHeader('X-SSR-Static', 'true');
        }
        
        res.status(200).send(finalHtml);
    } catch (e) {
        console.error("SSR Error:", e);
        res.status(500).send(`<html><body><h1>Server Error</h1><pre>${e.stack}</pre></body></html>`);
    }
}