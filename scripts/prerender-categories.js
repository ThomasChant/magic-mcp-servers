import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Static prerender script for categories page
async function prerenderCategories() {
    console.log('🚀 Starting categories page pre-rendering...');
    
    try {
        // Import SSR render function
        const { render } = await import('../dist/server/entry-server.js');
        
        // Render categories page with error handling
        console.log('📋 Rendering categories page...');
        let result;
        
        try {
            result = await render('/categories');
        } catch (renderError) {
            console.error('⚠️ Render error:', renderError.message);
            
            // Check if it's a network/fetch error
            if (renderError.message.includes('fetch failed') || renderError.message.includes('network')) {
                console.log('📡 Network error detected. This may be due to:');
                console.log('   - Local network restrictions');
                console.log('   - Proxy/firewall settings');
                console.log('   - Supabase connectivity issues');
                console.log('   Prerendering will be skipped, but SSR will work fine in production.');
                
                // Return gracefully without failing the build
                return { 
                    success: false, 
                    error: 'Network error during prerendering (non-critical)',
                    skipBuild: true 
                };
            }
            
            throw renderError;
        }
        
        if (!result.html || !result.seoData) {
            console.warn('⚠️ Incomplete render result. Skipping prerendering.');
            return { 
                success: false, 
                error: 'Incomplete render result',
                skipBuild: true 
            };
        }
        
        // Read SSR template
        let template = await fs.readFile('./index-ssr.html', 'utf-8');
        
        // Helper function to escape HTML
        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
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
            const clientSSRFile = assetsDir.find(file => file.startsWith('client-ssr-'));
            const clientFile = assetsDir.find(file => file.startsWith('client-') && file.endsWith('.js') && !file.includes('ssr'));
            const queryClientJSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.js'));
            const queryClientCSSFile = assetsDir.find(file => file.startsWith('queryClient-') && file.endsWith('.css'));
            
            if (clientSSRFile) {
                template = template.replace('src="/src/entry-client.tsx"', `type="module" crossorigin src="/assets/${clientSSRFile}"`);
            }
            
            if (clientFile && queryClientJSFile && queryClientCSSFile) {
                template = template.replace('</head>', `    <link rel="modulepreload" crossorigin href="/assets/${clientFile}">
    <link rel="modulepreload" crossorigin href="/assets/${queryClientJSFile}">
    <link rel="stylesheet" crossorigin href="/assets/${queryClientCSSFile}">
  </head>`);
            }
        } catch (assetsError) {
            console.warn("⚠️ Could not update asset paths:", assetsError.message);
        }
        
        // Ensure static directory exists
        const staticDir = path.join(__dirname, '../dist/static');
        try {
            await fs.access(staticDir);
        } catch {
            await fs.mkdir(staticDir, { recursive: true });
        }
        
        // Save prerendered categories page
        const categoriesPath = path.join(staticDir, 'categories.html');
        await fs.writeFile(categoriesPath, template, 'utf-8');
        
        // Create metadata file
        const metadata = {
            generatedAt: new Date().toISOString(),
            htmlSize: template.length,
            route: '/categories',
            type: 'static-prerender'
        };
        
        const metadataPath = path.join(staticDir, 'categories.meta.json');
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        
        console.log(`✅ Categories page pre-rendered successfully`);
        console.log(`📁 Static file: ${categoriesPath}`);
        console.log(`📊 HTML size: ${template.length} characters`);
        console.log(`⏱️ Generated at: ${metadata.generatedAt}`);
        
        return { success: true, metadata };
        
    } catch (error) {
        console.error('❌ Categories pre-rendering failed:', error.message);
        console.error('Stack trace:', error.stack);
        return { success: false, error: error.message };
    }
}

// Run prerendering if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    prerenderCategories()
        .then((result) => {
            if (result.success) {
                console.log('🎉 Categories pre-rendering completed successfully!');
                process.exit(0);
            } else if (result.skipBuild) {
                console.log('⚠️ Categories pre-rendering skipped (non-critical error)');
                console.log('✅ Build can continue - SSR will work fine in production');
                process.exit(0); // Exit successfully to allow build to continue
            } else {
                console.error('💥 Categories pre-rendering failed!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

export { prerenderCategories };