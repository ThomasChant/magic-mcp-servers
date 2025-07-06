import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://magicmcp.net';

// Create Supabase client
function createSupabaseClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not found in environment variables');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Get all servers with pagination
async function getAllServers() {
    const supabase = createSupabaseClient();
    console.log('📋 Fetching all servers...');
    
    try {
        const pageSize = 1000;
        let allServers = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from('servers_with_details')
                .select('id, slug, name, owner, last_updated, stars', { count: 'exact' })
                .order('stars', { ascending: false })
                .range(from, to);
            
            if (error) {
                console.error(`❌ Error fetching servers (page ${page + 1}):`, error);
                break;
            }
            
            if (data && data.length > 0) {
                allServers = [...allServers, ...data];
                console.log(`✅ Loaded ${data.length} servers from page ${page + 1} (total: ${allServers.length})`);
            }

            hasMore = data && data.length === pageSize && (!count || allServers.length < count);
            page++;
        }
        
        console.log(`🎉 Total servers loaded: ${allServers.length}`);
        return allServers;
    } catch (error) {
        console.error('❌ Error in getAllServers:', error);
        return [];
    }
}

// Get all categories
async function getAllCategories() {
    const supabase = createSupabaseClient();
    console.log('📂 Fetching all categories...');
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name_en, description_en')
            .order('name_en');
        
        if (error) {
            console.error('❌ Error fetching categories:', error);
            return [];
        }
        
        console.log(`✅ Loaded ${data?.length || 0} categories`);
        return data || [];
    } catch (error) {
        console.error('❌ Error in getAllCategories:', error);
        return [];
    }
}

// Get all unique tags
async function getAllTags() {
    const supabase = createSupabaseClient();
    console.log('🏷️ Fetching all tags...');
    
    try {
        const { data, error } = await supabase
            .from('servers_with_details')
            .select('tags')
            .not('tags', 'is', null);
        
        if (error) {
            console.error('❌ Error fetching tags:', error);
            return [];
        }
        
        const allTags = new Set();
        data?.forEach(server => {
            if (server.tags && Array.isArray(server.tags)) {
                server.tags.forEach(tag => {
                    if (tag && typeof tag === 'string') {
                        allTags.add(tag.trim());
                    }
                });
            }
        });
        
        const tagArray = Array.from(allTags).sort();
        console.log(`✅ Found ${tagArray.length} unique tags`);
        return tagArray;
    } catch (error) {
        console.error('❌ Error in getAllTags:', error);
        return [];
    }
}

// Generate sitemap XML
function generateSitemapXml(urls) {
    const urlElements = urls.map(({ url, lastmod, changefreq, priority }) => {
        const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
        const changefreqTag = changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '';
        const priorityTag = priority ? `\n    <priority>${priority}</priority>` : '';
        
        return `  <url>
    <loc>${url}</loc>${lastmodTag}${changefreqTag}${priorityTag}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

// Generate main sitemap
async function generateMainSitemap() {
    console.log('🌐 Generating main sitemap...');
    
    const staticPages = [
        {
            url: `${baseUrl}/`,
            changefreq: 'daily',
            priority: '1.0',
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/servers`,
            changefreq: 'daily', 
            priority: '0.9',
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/categories`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/docs`,
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/favorites`,
            changefreq: 'weekly',
            priority: '0.6',
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/tags`,
            changefreq: 'daily',
            priority: '0.8',
            lastmod: new Date().toISOString().split('T')[0]
        }
    ];

    return generateSitemapXml(staticPages);
}

// Generate servers sitemap
async function generateServersSitemap() {
    console.log('🖥️ Generating servers sitemap...');
    
    const servers = await getAllServers();
    if (servers.length === 0) {
        console.warn('⚠️ No servers found, generating empty sitemap');
        return generateSitemapXml([]);
    }
    
    const serverUrls = servers.map(server => {
        const lastmod = server.last_updated ? 
            new Date(server.last_updated).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
            
        // Higher priority for popular servers (more stars)
        let priority = '0.7';
        if (server.stars > 1000) priority = '0.9';
        else if (server.stars > 100) priority = '0.8';
        
        return {
            url: `${baseUrl}/servers/${server.slug}`,
            changefreq: 'weekly',
            priority,
            lastmod
        };
    });

    console.log(`✅ Generated ${serverUrls.length} server URLs`);
    return generateSitemapXml(serverUrls);
}

// Generate categories sitemap
async function generateCategoriesSitemap() {
    console.log('📂 Generating categories sitemap...');
    
    const categories = await getAllCategories();
    if (categories.length === 0) {
        console.warn('⚠️ No categories found, generating empty sitemap');
        return generateSitemapXml([]);
    }
    
    const categoryUrls = categories.map(category => ({
        url: `${baseUrl}/categories/${category.id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: new Date().toISOString().split('T')[0]
    }));

    console.log(`✅ Generated ${categoryUrls.length} category URLs`);
    return generateSitemapXml(categoryUrls);
}

// Generate tags sitemap
async function generateTagsSitemap() {
    console.log('🏷️ Generating tags sitemap...');
    
    const tags = await getAllTags();
    if (tags.length === 0) {
        console.warn('⚠️ No tags found, generating empty sitemap');
        return generateSitemapXml([]);
    }
    
    const tagUrls = tags.map(tag => ({
        url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
        changefreq: 'weekly', 
        priority: '0.6',
        lastmod: new Date().toISOString().split('T')[0]
    }));

    console.log(`✅ Generated ${tagUrls.length} tag URLs`);
    return generateSitemapXml(tagUrls);
}

// Generate complete sitemap with all URLs
async function generateCompleteSitemap() {
    console.log('🌐 Generating complete sitemap with all URLs...');
    
    const [servers, categories, tags] = await Promise.all([
        getAllServers(),
        getAllCategories(), 
        getAllTags()
    ]);
    
    const allUrls = [];
    
    // Static pages
    const staticPages = [
        { url: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { url: `${baseUrl}/servers`, changefreq: 'daily', priority: '0.9' },
        { url: `${baseUrl}/categories`, changefreq: 'weekly', priority: '0.8' },
        { url: `${baseUrl}/docs`, changefreq: 'monthly', priority: '0.7' },
        { url: `${baseUrl}/favorites`, changefreq: 'weekly', priority: '0.6' },
        { url: `${baseUrl}/tags`, changefreq: 'daily', priority: '0.8' }
    ];
    
    staticPages.forEach(page => {
        allUrls.push({
            ...page,
            lastmod: new Date().toISOString().split('T')[0]
        });
    });
    
    // Server detail pages
    servers.forEach(server => {
        const lastmod = server.last_updated ? 
            new Date(server.last_updated).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
            
        let priority = '0.7';
        if (server.stars > 1000) priority = '0.9';
        else if (server.stars > 100) priority = '0.8';
        
        allUrls.push({
            url: `${baseUrl}/servers/${server.slug}`,
            changefreq: 'weekly',
            priority,
            lastmod
        });
    });
    
    // Category detail pages
    categories.forEach(category => {
        allUrls.push({
            url: `${baseUrl}/categories/${category.id}`,
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: new Date().toISOString().split('T')[0]
        });
    });
    
    // Tag pages
    tags.forEach(tag => {
        allUrls.push({
            url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
            changefreq: 'weekly',
            priority: '0.6',
            lastmod: new Date().toISOString().split('T')[0]
        });
    });
    
    console.log(`🎉 Complete sitemap includes ${allUrls.length} URLs:`);
    console.log(`   - ${staticPages.length} static pages`);
    console.log(`   - ${servers.length} server detail pages`);
    console.log(`   - ${categories.length} category detail pages`);
    console.log(`   - ${tags.length} tag pages`);
    
    return generateSitemapXml(allUrls);
}

// Generate sitemap index
function generateSitemapIndex() {
    console.log('📋 Generating sitemap index...');
    
    const sitemaps = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-servers.xml`, 
        `${baseUrl}/sitemap-categories.xml`,
        `${baseUrl}/sitemap-tags.xml`,
        `${baseUrl}/sitemap-complete.xml`
    ];

    const sitemapElements = sitemaps.map(sitemap => 
        `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting sitemap generation...');
        
        // Create output directory
        const outputDir = path.join(__dirname, '..', 'public');
        await fs.mkdir(outputDir, { recursive: true });
        
        // Generate all sitemaps
        const [
            mainSitemap,
            serversSitemap,
            categoriesSitemap,
            tagsSitemap,
            completeSitemap,
            sitemapIndex
        ] = await Promise.all([
            generateMainSitemap(),
            generateServersSitemap(),
            generateCategoriesSitemap(),
            generateTagsSitemap(),
            generateCompleteSitemap(),
            generateSitemapIndex()
        ]);
        
        // Write sitemap files
        const files = [
            { name: 'sitemap.xml', content: mainSitemap },
            { name: 'sitemap-servers.xml', content: serversSitemap },
            { name: 'sitemap-categories.xml', content: categoriesSitemap },
            { name: 'sitemap-tags.xml', content: tagsSitemap },
            { name: 'sitemap-complete.xml', content: completeSitemap },
            { name: 'sitemapindex.xml', content: sitemapIndex }
        ];
        
        for (const file of files) {
            const filePath = path.join(outputDir, file.name);
            await fs.writeFile(filePath, file.content, 'utf-8');
            console.log(`✅ Generated: ${file.name} (${file.content.length} chars)`);
        }
        
        // Also copy to dist/client for production
        const distDir = path.join(__dirname, '..', 'dist', 'client');
        try {
            await fs.mkdir(distDir, { recursive: true });
            for (const file of files) {
                const filePath = path.join(distDir, file.name);
                await fs.writeFile(filePath, file.content, 'utf-8');
            }
            console.log('✅ Copied sitemaps to dist/client for production');
        } catch (error) {
            console.warn('⚠️ Could not copy to dist/client (build may not exist yet)');
        }
        
        console.log('🎉 All sitemaps generated successfully!');
        console.log('\n📁 Generated files:');
        files.forEach(file => {
            console.log(`   - ${file.name}`);
        });
        
        console.log('\n🌐 URLs:');
        console.log(`   - Main sitemap: ${baseUrl}/sitemap.xml`);
        console.log(`   - Complete sitemap: ${baseUrl}/sitemap-complete.xml`);
        console.log(`   - Sitemap index: ${baseUrl}/sitemapindex.xml`);
        
    } catch (error) {
        console.error('❌ Error generating sitemaps:', error);
        process.exit(1);
    }
}

// Run the script
main();