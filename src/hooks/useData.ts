import { useQuery } from "@tanstack/react-query";
import type { Category, MCPServer } from "../types";
import categoriesData from "../data/categories.json";
import serversData from "../data/servers.json";

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

interface ServerJson {
    id: string;
    name: string;
    description: string;
    descriptionEn: string;
    category: string[];
    subcategory: string | string[];
    tags: string[];
    repository: {
        url: string;
        owner: string;
        name: string;
        stars: number;
        lastUpdate: string;
        forks?: number;
    };
    installation: Record<string, string | undefined>;
    documentation: {
        readme: string;
        website?: string;
        examples?: string[];
    };
    compatibility: {
        platforms: string[];
        languages: string[];
        frameworks?: string[];
    };
    quality: {
        score: number;
        factors: {
            documentation: number;
            maintenance: number;
            community: number;
            testing: number;
        };
    };
    usage: {
        downloads: number;
        dependents: number;
        popularity: number;
    };
    featured: boolean;
    official: boolean;
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

const transformServerData = (server: ServerJson): MCPServer => ({
    id: server.id,
    name: server.name,
    description: server.description,
    longDescription: server.descriptionEn,
    category: Array.isArray(server.category)
        ? server.category[0]
        : server.category,
    subcategory: Array.isArray(server.subcategory)
        ? server.subcategory[0]
        : server.subcategory,
    tags: server.tags,
    repository: {
        url: server.repository.url,
        owner: server.repository.owner,
        name: server.repository.name,
        stars: server.repository.stars,
        lastUpdated: server.repository.lastUpdate,
    },
    installation: {
        npm: server.installation.npm,
        pip: server.installation.pip,
        docker: server.installation.docker,
        manual: server.installation.manual,
    },
    documentation: {
        readme: server.documentation.readme,
        examples: Array.isArray(server.documentation.examples)
            ? server.documentation.examples.join(", ")
            : undefined,
        api: server.documentation.website,
    },
    compatibility: {
        platforms: server.compatibility.platforms,
        nodeVersion: server.compatibility.frameworks?.includes("Node.js")
            ? "16+"
            : undefined,
        pythonVersion: server.compatibility.frameworks?.includes("Python")
            ? "3.8+"
            : undefined,
    },
    quality: {
        score: server.quality.score,
        factors: {
            documentation: server.quality.factors.documentation,
            maintenance: server.quality.factors.maintenance,
            community: server.quality.factors.community,
            performance: server.quality.factors.testing || 85,
        },
    },
    usage: {
        downloads: server.usage.downloads,
        dependents: server.usage.dependents,
        weeklyDownloads: Math.floor(server.usage.downloads / 52),
    },
    featured: server.featured,
    verified: server.official || false,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: server.repository.lastUpdate || new Date().toISOString(),
});

export const useServers = () => {
    return useQuery({
        queryKey: ["servers"],
        queryFn: async (): Promise<MCPServer[]> => {
            await delay(200); // 模拟网络延迟
            // 转换数据格式以匹配类型定义
            return (serversData as ServerJson[]).map(transformServerData);
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
