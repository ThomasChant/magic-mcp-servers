import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

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

// Serve HTML
app.use("*", async (req, res) => {
    try {
        const url = req.originalUrl.replace(base, "");

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
            // Production: Progressive SSR approach
            template = await fs.readFile("./dist/client/index.html", "utf-8");
            
            console.log(`🚀 Attempting SSR for: ${url}`);
            
            try {
                // Try to import and use SSR
                const serverModule = await import("./dist/server/entry-server.js");
                console.log("✅ SSR module imported successfully");
                
                const { html: renderedHtml } = serverModule.render(url);
                console.log("✅ SSR render completed successfully");
                
                // Inject the rendered HTML into the template
                const finalHtml = template.replace(`<div id="root"></div>`, `<div id="root">${renderedHtml}</div>`);
                
                console.log("✅ HTML injection completed");
                res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
                return;
                
            } catch (ssrError) {
                console.error("❌ SSR failed, falling back to client-side rendering:", ssrError.message);
                // Fallback to enhanced client-side rendering with SEO meta
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