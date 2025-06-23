import { useQuery } from "@tanstack/react-query";
import type { Category, MCPServer, ProcessedREADME } from "../types";
// import categoriesData from "../data/categories.json";
import serversData from "../data/servers_integrated.json";
import categoriesData from "../data/categories_full_updated.json";

// 定义JSON数据结构接口
interface CategoryJson {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
    color: string;
    serverCount: number;
    subcategories?: SubcategoryJson[];
}

interface SubcategoryJson {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
}

// The integrated server data matches the MCPServer interface closely
// We'll type it as 'any' for flexibility during the transition

// 模拟异步数据加载
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async (): Promise<Category[]> => {
            await delay(100); // 模拟网络延迟
            // 转换数据格式以匹配类型定义
            return (categoriesData as CategoryJson[]).map((cat) => ({
                ...cat,
                name: {
                    "zh-CN": cat.name,
                    en: cat.nameEn,
                    "zh-TW": cat.nameEn,
                    fr: cat.nameEn,
                    ja: cat.nameEn,
                    ko: cat.nameEn,
                    ru: cat.nameEn,
                },
                description: {
                    "zh-CN": cat.description,
                    en: cat.descriptionEn,
                    "zh-TW": cat.descriptionEn,
                    fr: cat.descriptionEn,
                    ja: cat.descriptionEn,
                    ko: cat.descriptionEn,
                    ru: cat.descriptionEn,
                },
                subcategories:
                    cat.subcategories?.map((sub: SubcategoryJson) => ({
                        ...sub,
                        name: {
                            "zh-CN": sub.name,
                            en: sub.nameEn,
                            "zh-TW": sub.nameEn,
                            fr: sub.nameEn,
                            ja: sub.nameEn,
                            ko: sub.nameEn,
                            ru: sub.nameEn,
                        },
                        description: {
                            "zh-CN": sub.description,
                            en: sub.descriptionEn,
                            "zh-TW": sub.descriptionEn,
                            fr: sub.descriptionEn,
                            ja: sub.descriptionEn,
                            ko: sub.descriptionEn,
                            ru: sub.descriptionEn,
                        },
                    })) || [],
            }));
        },
        staleTime: 5 * 60 * 1000, // 5分钟
    });
};

// Since the data is now pre-integrated, we can simplify the transformation
const transformServerData = (server: unknown): MCPServer => {
    const serverData = server as Record<string, any>;
    // Extract owner and project name from the name field
    const nameParts = (serverData.name as string).split('/');
    const owner = nameParts.length > 1 ? nameParts[0] : '';
    const projectName = nameParts.length > 1 ? nameParts[1] : serverData.name;
    
    // The server data is already enhanced, so we mainly need to handle the format
    return {
        // Core fields
        id: serverData.id,
        name: projectName,
        owner: owner,
        slug: serverData.slug,
        fullDescription: serverData.fullDescription,
        icon: serverData.icon,
        badges: serverData.badges,
        tags: serverData.tags,
        category: serverData.category,
        subcategory: serverData.subcategory,
        serviceTypes: serverData.serviceTypes,
        techStack: Array.isArray(serverData.techStack) ? 
            serverData.techStack.map((tech: any) => typeof tech === 'string' ? tech : (tech.name || tech.label || '')) :
            [],
        links: serverData.links,
        
        // Multi-language description
        description: {
            "zh-CN": serverData.description,
            en: serverData.description,
            "zh-TW": serverData.description,
            fr: serverData.description,
            ja: serverData.description,
            ko: serverData.description,
            ru: serverData.description,
        },
        
        // Enhanced stats
        stats: serverData.stats,
        metadata: serverData.metadata,
        categorization: serverData.categorization,
        
        // Enhanced repository info (now integrated)
        repository: serverData.repository,
        
        // Enhanced installation (now integrated)
        installation: serverData.installation,
        
        // Enhanced documentation (now integrated)
        documentation: serverData.documentation,
        
        // Enhanced compatibility (now integrated)
        compatibility: serverData.compatibility,
        
        // Enhanced quality scores (now integrated)
        quality: serverData.quality,
        
        // Usage metrics
        usage: serverData.usage || {
            downloads: serverData.stats.stars * 10,
            dependents: serverData.stats.forks,
            weeklyDownloads: Math.floor(serverData.stats.stars * 2),
        },
        
        // Legacy compatibility fields
        featured: serverData.metadata.featured,
        verified: serverData.metadata.verified,
        createdAt: serverData.stats.createdAt || new Date(2024, 0, 1).toISOString(),
        updatedAt: serverData.stats.lastUpdated || new Date().toISOString(),
    };
};


export const useServers = () => {
    return useQuery({
        queryKey: ["servers"],
        queryFn: async (): Promise<MCPServer[]> => {
            await delay(200); // 模拟网络延迟
            // Transform the integrated data to MCPServer format
            return (serversData as unknown[]).map(transformServerData);
        },
        staleTime: 5 * 60 * 1000, // 5分钟
    });
};

export const useServer = (id: string) => {
    const { data: servers } = useServers();

    return useQuery({
        queryKey: ["server", id],
        queryFn: async (): Promise<MCPServer | undefined> => {
            await delay(100);
            return servers?.find((server) => server.id === id);
        },
        enabled: !!id && !!servers,
        staleTime: 5 * 60 * 1000,
    });
};

export const useFeaturedServers = () => {
    const { data: servers } = useServers();

    return useQuery({
        queryKey: ["servers", "featured"],
        queryFn: async (): Promise<MCPServer[]> => {
            await delay(150);
            return (
                servers?.filter((server) => server.featured).slice(0, 6) || []
            );
        },
        enabled: !!servers,
        staleTime: 5 * 60 * 1000,
    });
};

export const useServersByCategory = (categoryId: string) => {
    const { data: servers } = useServers();

    return useQuery({
        queryKey: ["servers", "category", categoryId],
        queryFn: async (): Promise<MCPServer[]> => {
            await delay(150);
            return (
                servers?.filter((server) => server.category === categoryId) ||
                []
            );
        },
        enabled: !!categoryId && !!servers,
        staleTime: 5 * 60 * 1000,
    });
};

// Enhanced hook to get server with integrated README data
export const useServerReadme = (serverId: string) => {
    const { data: servers } = useServers();
    
    return useQuery({
        queryKey: ["readme", serverId],
        queryFn: async (): Promise<ProcessedREADME | null> => {
            // First try to get it from the integrated data
            const server = servers?.find(s => s.id === serverId);
            if (server?.documentation?.structured) {
                return server.documentation.structured;
            }
            
            // Fallback to fetching from public directory (for backwards compatibility)
            try {
                const response = await fetch(`/structured_readme_data/${serverId}.json`);
                if (!response.ok) {
                    return null;
                }
                const data: ProcessedREADME = await response.json();
                return data;
            } catch (error) {
                console.error(`Failed to load README for ${serverId}:`, error);
                return null;
            }
        },
        enabled: !!serverId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
