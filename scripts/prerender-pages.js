import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to escape HTML
const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Pages to prerender
const PAGES_TO_PRERENDER = [
    {
        path: '/',
        filename: 'index.html',
        description: 'Home page'
    },
    {
        path: '/servers',
        filename: 'servers.html',
        description: 'Servers list page'
    },
    {
        path: '/categories',
        filename: 'categories.html',
        description: 'Categories page'
    }
];

// Generic prerender function
async function prerenderPage(routePath, filename, description) {
    console.log(`🔄 Pre-rendering ${description} (${routePath})...`);
    
    try {
        // Import SSR render function
        const { render } = await import('../dist/server/entry-server.js');
        
        // Render the page with error handling
        let result;
        try {
            result = await render(routePath === '/' ? '/' : routePath.replace('/', ''));
        } catch (renderError) {
            console.error(`⚠️ Render error for ${routePath}:`, renderError.message);
            
            // Check if it's a network/fetch error
            if (renderError.message.includes('fetch failed') || renderError.message.includes('network')) {
                console.log(`📡 Network error detected for ${routePath}. This may be due to:`);
                console.log('   - Local network restrictions');
                console.log('   - Proxy/firewall settings');
                console.log('   - Supabase connectivity issues');
                console.log(`   Prerendering ${description} will be skipped, but SSR will work fine in production.`);
                
                // Return gracefully without failing the build
                return { 
                    success: false, 
                    error: `Network error during prerendering ${description} (non-critical)`,
                    skipBuild: true 
                };
            }
            
            throw renderError;
        }
        
        if (!result.html || !result.seoData) {
            console.warn(`⚠️ Incomplete render result for ${routePath}. Skipping prerendering.`);
            return { 
                success: false, 
                error: `Incomplete render result for ${description}`,
                skipBuild: true 
            };
        }
        
        // Read SSR template
        let template = await fs.readFile('./index-ssr.html', 'utf-8');
        
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
        
        // Update asset paths for production
        try {
            const assetsDir = await fs.readdir('./dist/client/assets');
            const indexJSFile = assetsDir.find(file => file.startsWith('index-') && file.endsWith('.js'));
            const indexCSSFile = assetsDir.find(file => file.startsWith('index-') && file.endsWith('.css'));
            
            console.log(`📦 Found assets for ${routePath}:`, { indexJSFile, indexCSSFile });
            
            // Update script src to use the correct hashed filename
            if (indexJSFile) {
                template = template.replace('src="/src/entry-client.tsx"', `type="module" crossorigin src="/assets/${indexJSFile}"`);
            }
            
            // Add CSS link to head if found
            if (indexCSSFile) {
                template = template.replace('</head>', `    <link rel="stylesheet" crossorigin href="/assets/${indexCSSFile}">
  </head>`);
            }
        } catch (assetsError) {
            console.warn(`⚠️ Could not update asset paths for ${routePath}:`, assetsError.message);
        }
        
        // Ensure both static and client directories exist for proper deployment
        const staticDir = path.join(__dirname, '../dist/static');
        const clientDir = path.join(__dirname, '../dist/client');
        
        try {
            await fs.access(staticDir);
        } catch {
            await fs.mkdir(staticDir, { recursive: true });
        }
        
        try {
            await fs.access(clientDir);
        } catch {
            await fs.mkdir(clientDir, { recursive: true });
        }
        
        // Save prerendered page to both locations
        // 1. Static directory (for local development and reference)
        const staticFilePath = path.join(staticDir, filename);
        await fs.writeFile(staticFilePath, template, 'utf-8');
        
        // 2. Client directory (for Vercel deployment)
        const clientFilePath = path.join(clientDir, filename);
        await fs.writeFile(clientFilePath, template, 'utf-8');
        
        // Create metadata file
        const metadata = {
            generatedAt: new Date().toISOString(),
            htmlSize: template.length,
            route: routePath,
            type: 'static-prerender'
        };
        
        const metadataPath = path.join(staticDir, `${filename}.meta.json`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        
        console.log(`✅ ${description} pre-rendered successfully`);
        console.log(`📁 Static file: ${staticFilePath}`);
        console.log(`🚀 Client file: ${clientFilePath}`);
        console.log(`📊 HTML size: ${template.length} characters`);
        console.log(`⏱️ Generated at: ${metadata.generatedAt}`);
        
        return { success: true, metadata };
        
    } catch (error) {
        console.error(`❌ ${description} pre-rendering failed:`, error.message);
        console.error('Stack trace:', error.stack);
        return { success: false, error: error.message };
    }
}

// Main prerender function
async function prerenderAllPages() {
    console.log('🚀 Starting multi-page pre-rendering...');
    
    const results = [];
    
    for (const page of PAGES_TO_PRERENDER) {
        const result = await prerenderPage(page.path, page.filename, page.description);
        results.push({ ...page, ...result });
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const skipped = results.filter(r => r.skipBuild).length;
    const failed = results.filter(r => !r.success && !r.skipBuild).length;
    
    console.log('\n📋 Pre-rendering Summary:');
    console.log(`✅ Successful: ${successful} pages`);
    console.log(`⚠️ Skipped: ${skipped} pages`);
    console.log(`❌ Failed: ${failed} pages`);
    
    if (successful > 0) {
        console.log('\n🎉 Successfully pre-rendered pages:');
        results.filter(r => r.success).forEach(r => {
            console.log(`  - ${r.description} (${r.path}) → ${r.filename}`);
        });
    }
    
    if (skipped > 0) {
        console.log('\n⚠️ Skipped pages (non-critical):');
        results.filter(r => r.skipBuild).forEach(r => {
            console.log(`  - ${r.description} (${r.path}) → ${r.error}`);
        });
    }
    
    if (failed > 0) {
        console.log('\n❌ Failed pages:');
        results.filter(r => !r.success && !r.skipBuild).forEach(r => {
            console.log(`  - ${r.description} (${r.path}) → ${r.error}`);
        });
    }
    
    return {
        successful,
        skipped,
        failed,
        results
    };
}

// Run prerendering if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    prerenderAllPages()
        .then((summary) => {
            if (summary.successful > 0 || summary.skipped > 0) {
                console.log('\n🎉 Multi-page pre-rendering completed!');
                console.log(`✅ Pages ready for production: ${summary.successful}`);
                if (summary.skipped > 0) {
                    console.log(`⚠️ Pages skipped (will use SSR): ${summary.skipped}`);
                }
                process.exit(0);
            } else {
                console.error('\n💥 Multi-page pre-rendering failed completely!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('\n💥 Unexpected error during multi-page pre-rendering:', error);
            process.exit(1);
        });
}

export { prerenderAllPages, prerenderPage };