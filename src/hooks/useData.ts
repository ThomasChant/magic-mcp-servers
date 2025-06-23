import { useQuery } from "@tanstack/react-query";
import type { Category, MCPServer, ProcessedREADME } from "../types";
// import categoriesData from "../data/categories.json";
import serversData from "../data/serversnew.json";
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

// 新的服务器数据结构已经与MCPServer接口匹配，只需要简单的类型转换
interface ServerDataJson {
    id: string;
    name: string;
    slug: string;
    description: string;
    fullDescription: string;
    icon: string;
    badges: Array<{
        type: string;
        label: string;
        color: string;
        icon: string;
    }>;
    tags: string[];
    category: string;
    subcategory: string;
    serviceTypes: Array<{
        type: string;
        label: string;
        icon: string;
        description: string;
    }>;
    techStack: Array<{
        name: string;
        icon: string;
        color: string;
    }>;
    links: {
        github: string;
        demo?: string | null;
        docs?: string | null;
    };
    stats: {
        stars: number;
        forks: number;
        lastUpdated: string;
        createdAt: string;
    };
    metadata: {
        complexity: string;
        maturity: string;
        deployment: string[];
        featured: boolean;
        verified: boolean;
    };
    categorization?: {
        confidence: number;
        reason: string;
        matched_keywords: string[];
    };
}

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

const transformServerData = (server: ServerDataJson): MCPServer => {
    // 从 "username/project-name" 格式中提取用户名和项目名
    const nameParts = server.name.split('/');
    const owner = nameParts.length > 1 ? nameParts[0] : '';
    const projectName = nameParts.length > 1 ? nameParts[1] : server.name;
    
    return {
        // 核心字段 - 直接映射
        id: server.id,
        name: projectName,
        owner: owner,
        slug: server.slug,
        fullDescription: server.fullDescription,
        icon: server.icon,
        badges: server.badges,
        tags: server.tags,
        category: server.category,
        subcategory: server.subcategory,
        serviceTypes: server.serviceTypes,
        techStack: server.techStack.map(tech => tech.name),
        links: server.links,
    
    // 多语言描述 - 使用description字段填充所有语言
    description: {
        "zh-CN": server.description,
        en: server.description,
        "zh-TW": server.description,
        fr: server.description,
        ja: server.description,
        ko: server.description,
        ru: server.description,
    },
    
    // 统计信息映射
    stats: {
        stars: server.stats.stars,
        forks: server.stats.forks,
        lastUpdated: server.stats.lastUpdated || new Date().toISOString(),
        createdAt: server.stats.createdAt || new Date(2024, 0, 1).toISOString(),
    },
    
    // 元数据映射
    metadata: {
        complexity: server.metadata.complexity,
        maturity: server.metadata.maturity,
        deployment: server.metadata.deployment,
        featured: server.metadata.featured,
        verified: server.metadata.verified,
    },
    
    // 分类信息
    categorization: server.categorization,
    
    // 向后兼容字段 - 根据新数据结构生成
    repository: {
        url: server.links.github,
        owner: server.links.github.split('/').slice(-2, -1)[0] || '',
        name: server.links.github.split('/').pop() || server.name,
        stars: server.stats.stars,
        lastUpdated: server.stats.lastUpdated || new Date().toISOString(),
        forks: server.stats.forks,
    },
    
    // 默认兼容字段
    installation: {
        npm: undefined,
        pip: undefined,
        docker: undefined,
        manual: server.links.docs || undefined,
    },
    
    documentation: {
        readme: server.fullDescription,
        api: server.links.docs || undefined,
        examples: undefined,
    },
    
    compatibility: {
        platforms: ["web", "desktop"],
        nodeVersion: server.techStack.some(tech => tech.name.toLowerCase().includes('node')) ? "16+" : undefined,
        pythonVersion: server.techStack.some(tech => tech.name.toLowerCase().includes('python')) ? "3.8+" : undefined,
    },
    
    // 基于复杂度和成熟度生成质量分数
    quality: {
        score: getQualityScore(server.metadata.complexity, server.metadata.maturity, server.stats.stars),
        factors: {
            documentation: getDocumentationScore(server.fullDescription, server.links.docs),
            maintenance: getMaintenanceScore(server.metadata.maturity, server.stats.lastUpdated),
            community: getCommunityScore(server.stats.stars, server.stats.forks),
            performance: 85, // 默认性能分数
        },
    },
    
    usage: {
        downloads: server.stats.stars * 10, // 基于星数估算下载量
        dependents: server.stats.forks,
        weeklyDownloads: Math.floor(server.stats.stars * 2),
    },
    
        // 简化的兼容字段
        featured: server.metadata.featured,
        verified: server.metadata.verified,
        createdAt: server.stats.createdAt || new Date(2024, 0, 1).toISOString(),
        updatedAt: server.stats.lastUpdated || new Date().toISOString(),
    };
};

// 辅助函数：根据复杂度、成熟度和星数计算质量分数
const getQualityScore = (complexity: string, maturity: string, stars: number): number => {
    let score = 70; // 基础分数
    
    // 根据成熟度调整
    switch (maturity.toLowerCase()) {
        case 'stable':
        case 'production':
            score += 20;
            break;
        case 'beta':
        case 'testing':
            score += 10;
            break;
        case 'alpha':
        case 'experimental':
            score += 0;
            break;
        default:
            score += 5;
    }
    
    // 根据复杂度调整
    switch (complexity.toLowerCase()) {
        case 'simple':
        case 'basic':
            score += 5;
            break;
        case 'moderate':
        case 'intermediate':
            score += 0;
            break;
        case 'complex':
        case 'advanced':
            score -= 5;
            break;
    }
    
    // 根据星数调整
    if (stars > 100) score += 10;
    else if (stars > 50) score += 5;
    else if (stars > 10) score += 2;
    
    return Math.min(100, Math.max(0, score));
};

// 辅助函数：计算文档分数
const getDocumentationScore = (description: string, docsLink?: string | null): number => {
    let score = 60;
    if (description && description.length > 100) score += 20;
    if (docsLink) score += 20;
    return Math.min(100, score);
};

// 辅助函数：计算维护分数
const getMaintenanceScore = (maturity: string, lastUpdated: string): number => {
    let score = 50;
    
    // 根据成熟度
    if (maturity.toLowerCase() === 'stable') score += 30;
    else if (maturity.toLowerCase() === 'beta') score += 20;
    else score += 10;
    
    // 根据更新时间（如果有的话）
    if (lastUpdated) {
        const updateDate = new Date(lastUpdated);
        const now = new Date();
        const daysSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpdate < 30) score += 20;
        else if (daysSinceUpdate < 90) score += 10;
        else if (daysSinceUpdate < 180) score += 5;
    }
    
    return Math.min(100, score);
};

// 辅助函数：计算社区分数
const getCommunityScore = (stars: number, forks: number): number => {
    let score = 40;
    
    // 基于星数
    if (stars > 1000) score += 40;
    else if (stars > 500) score += 30;
    else if (stars > 100) score += 20;
    else if (stars > 50) score += 15;
    else if (stars > 10) score += 10;
    else score += 5;
    
    // 基于fork数
    if (forks > 100) score += 20;
    else if (forks > 50) score += 15;
    else if (forks > 10) score += 10;
    else if (forks > 5) score += 5;
    
    return Math.min(100, score);
};

export const useServers = () => {
    return useQuery({
        queryKey: ["servers"],
        queryFn: async (): Promise<MCPServer[]> => {
            await delay(200); // 模拟网络延迟
            // 转换数据格式以匹配类型定义
            return (serversData as ServerDataJson[]).map(transformServerData);
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

// Hook to load structured README data
export const useServerReadme = (serverId: string) => {
    return useQuery({
        queryKey: ["readme", serverId],
        queryFn: async (): Promise<ProcessedREADME | null> => {
            try {
                // Load structured README data from the processed directory
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
