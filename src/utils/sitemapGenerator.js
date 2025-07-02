import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side data access
function createSupabaseClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not found, using empty data for sitemap');
        return null;
    }
    
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side data fetching functions with pagination
async function getAllServers() {
    const supabase = createSupabaseClient();
    if (!supabase) return [];
    
    try {
        const pageSize = 1000;
        let allServers = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from('mcp_servers')
                .select('slug, github_url, updated_at', { count: 'exact' })
                .range(from, to);
            
            if (error) {
                console.error(`Error fetching servers for sitemap (page ${page + 1}):`, error);
                return allServers; // Return what we have so far
            }
            
            if (data && data.length > 0) {
                allServers = [...allServers, ...data];
            }

            // Check if there's more data
            hasMore = data && data.length === pageSize && (!count || allServers.length < count);
            page++;
        }
        
        return allServers;
    } catch (error) {
        console.error('Error in getAllServers:', error);
        return [];
    }
}

async function getAllCategories() {
    const supabase = createSupabaseClient();
    if (!supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id');
        
        if (error) {
            console.error('Error fetching categories for sitemap:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getAllCategories:', error);
        return [];
    }
}

export function generateSitemapXml(urls) {
    const urlElements = urls.map(({ url, lastmod, changefreq, priority }) => {
        const lastmodTag = lastmod ? `    <lastmod>${lastmod}</lastmod>` : '';
        const changefreqTag = changefreq ? `    <changefreq>${changefreq}</changefreq>` : '';
        const priorityTag = priority ? `    <priority>${priority}</priority>` : '';
        
        return `  <url>
    <loc>${url}</loc>${lastmodTag}${changefreqTag}${priorityTag}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

export async function generateMainSitemap(baseUrl = 'https://magicmcp.net') {
    const staticPages = [
        {
            url: `${baseUrl}/`,
            changefreq: 'daily',
            priority: 1.0,
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/servers`,
            changefreq: 'daily',
            priority: 0.9,
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/categories`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/docs`,
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/favorites`,
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: new Date().toISOString().split('T')[0]
        },
        {
            url: `${baseUrl}/tags`,
            changefreq: 'daily',
            priority: 0.8,
            lastmod: new Date().toISOString().split('T')[0]
        }
    ];

    return generateSitemapXml(staticPages);
}

export async function generateServersSitemap(baseUrl = 'https://magicmcp.net') {
    try {
        const servers = await getAllServers();
        const serverUrls = servers.map(server => ({
            url: `${baseUrl}/servers/${server.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: server.updated_at ? 
                new Date(server.updated_at).toISOString().split('T')[0] : 
                new Date().toISOString().split('T')[0]
        }));

        return generateSitemapXml(serverUrls);
    } catch (error) {
        console.error('Error generating servers sitemap:', error);
        return generateSitemapXml([]);
    }
}

export async function generateCategoriesSitemap(baseUrl = 'https://magicmcp.net') {
    try {
        const categories = await getAllCategories();
        const categoryUrls = categories.map(category => ({
            url: `${baseUrl}/categories/${category.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString().split('T')[0]
        }));

        return generateSitemapXml(categoryUrls);
    } catch (error) {
        console.error('Error generating categories sitemap:', error);
        return generateSitemapXml([]);
    }
}

export async function generateTagsSitemap(baseUrl = 'https://magicmcp.net') {
    try {
        const servers = await getAllServers();
        const allTags = new Set();
        
        servers.forEach(server => {
            if (server.tags && Array.isArray(server.tags)) {
                server.tags.forEach(tag => allTags.add(tag));
            }
        });

        const tagUrls = Array.from(allTags).map(tag => ({
            url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: new Date().toISOString().split('T')[0]
        }));

        return generateSitemapXml(tagUrls);
    } catch (error) {
        console.error('Error generating tags sitemap:', error);
        return generateSitemapXml([]);
    }
}

export function generateSitemapIndex(baseUrl = 'https://magicmcp.net') {
    const sitemaps = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-servers.xml`,
        `${baseUrl}/sitemap-categories.xml`,
        `${baseUrl}/sitemap-tags.xml`
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