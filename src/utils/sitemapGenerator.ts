import { getAllServers, getAllCategories } from '../server-utils';

export interface SitemapUrl {
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
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

export async function generateMainSitemap(baseUrl: string = 'https://magicmcp.net'): Promise<string> {
    const staticPages: SitemapUrl[] = [
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
        }
    ];

    return generateSitemapXml(staticPages);
}

export async function generateServersSitemap(baseUrl: string = 'https://magicmcp.net'): Promise<string> {
    try {
        const servers = await getAllServers();
        const serverUrls: SitemapUrl[] = servers.map(server => ({
            url: `${baseUrl}/servers/${server.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: server.repository.lastUpdated ? 
                new Date(server.repository.lastUpdated).toISOString().split('T')[0] : 
                new Date().toISOString().split('T')[0]
        }));

        return generateSitemapXml(serverUrls);
    } catch (error) {
        console.error('Error generating servers sitemap:', error);
        return generateSitemapXml([]);
    }
}

export async function generateCategoriesSitemap(baseUrl: string = 'https://magicmcp.net'): Promise<string> {
    try {
        const categories = await getAllCategories();
        const categoryUrls: SitemapUrl[] = categories.map(category => ({
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

export async function generateTagsSitemap(baseUrl: string = 'https://magicmcp.net'): Promise<string> {
    try {
        const servers = await getAllServers();
        const allTags = new Set<string>();
        
        servers.forEach(server => {
            server.tags.forEach(tag => allTags.add(tag));
        });

        const tagUrls: SitemapUrl[] = Array.from(allTags).map(tag => ({
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

export function generateSitemapIndex(baseUrl: string = 'https://magicmcp.net'): string {
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