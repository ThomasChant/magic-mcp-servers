import { useQuery } from "@tanstack/react-query";
import type { Category, MCPServer, ProcessedREADME } from "../types";

// 定义优化后的数据结构接口
interface CoreServerData {
    id: string;
    name: string;
    owner: string;
    slug: string;
    description: string; // Updated to match actual data structure
    category: string;
    subcategory?: string;
    featured: boolean;
    verified: boolean;
    stats: {
        stars: number;
        forks: number;
        lastUpdated: string;
    };
    qualityScore: number;
    tags: string[];
    links: {
        github: string;
        npm: string;
        docs: string;
    };
}

interface ExtendedServerData {
    [serverId: string]: {
        fullDescription?: string;
        techStack: (string | { name?: string; label?: string })[];
        serviceTypes: string[];
        quality: {
            score: number;
            factors: {
                documentation: number;
                maintenance: number;
                community: number;
                performance: number;
            };
        };
        metadata: Record<string, unknown>;
        categorization: Record<string, unknown>;
        usage: {
            downloads: number;
            dependents: number;
            weeklyDownloads: number;
        };
        installation: {
            npm?: string;
            pip?: string;
            docker?: string;
            manual?: string;
            uv?: string;
            instructions: Array<{ type?: string; content?: string; description?: string }>;
        };
        repository: {
            url: string;
            owner: string;
            name: string;
            stars: number;
            forks: number;
            lastUpdated: string;
            watchers: number;
            openIssues: number;
        };
        compatibility: {
            platforms: string[];
            nodeVersion?: string;
            pythonVersion?: string;
            requirements: string[];
        };
        documentation: {
            hasReadme: boolean;
            hasExamples: boolean;
            hasApiReference: boolean;
            hasInstallation: boolean;
            api?: string;
        };
        allTags: string[];
        badges: Array<{ name?: string; type?: string; color?: string }>;
        icon?: string;
    };
}

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

// 模拟异步数据加载
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 合并核心数据和扩展数据为完整的 MCPServer 对象
function mergeServerData(coreData: CoreServerData[], extendedData: ExtendedServerData): MCPServer[] {
    return coreData.map(core => {
        const extended = extendedData[core.id] || {};
        
        return {
            // 核心字段
            id: core.id,
            name: core.name,
            owner: core.owner,
            slug: core.slug,
            fullDescription: extended.fullDescription || core.description,
            icon: extended.icon || "",
            badges: (extended.badges || []).map(badge => ({
                type: badge.type || "default",
                label: badge.name || "",
                color: badge.color || "gray",
                icon: ""
            })),
            tags: extended.allTags || core.tags,
            category: core.category,
            subcategory: core.subcategory || "",
            serviceTypes: (extended.serviceTypes || []).map(type => ({
                type: type,
                label: type,
                icon: "",
                description: ""
            })),
            techStack: (extended.techStack || []).map(tech => 
                typeof tech === 'string' ? tech : (tech.name || tech.label || '')
            ),
            links: {
                github: core.links.github,
                demo: null,
                docs: extended.documentation?.api || core.links.docs || null
            },
            
            // 多语言描述 - 转换单个描述到多语言格式
            description: {
                "zh-CN": core.description,
                en: core.description,
                "zh-TW": core.description,
                fr: core.description,
                ja: core.description,
                ko: core.description,
                ru: core.description,
            },
            
            // 统计信息
            stats: {
                ...core.stats,
                createdAt: (extended.metadata as Record<string, unknown>)?.createdAt as string || new Date(2024, 0, 1).toISOString()
            },
            metadata: {
                complexity: (extended.metadata as Record<string, unknown>)?.complexity as string || "medium",
                maturity: (extended.metadata as Record<string, unknown>)?.maturity as string || "stable",
                deployment: (extended.metadata as Record<string, unknown>)?.deployment as string[] || ["cloud", "local"],
                featured: core.featured,
                verified: core.verified
            },
            categorization: extended.categorization || {
                confidence: 0.8,
                reason: "Automatically categorized",
                matched_keywords: []
            },
            
            // 仓库信息
            repository: extended.repository || {
                url: core.links.github,
                owner: core.owner,
                name: core.name.split('/')[1] || core.name,
                stars: core.stats.stars,
                forks: core.stats.forks,
                lastUpdated: core.stats.lastUpdated,
                watchers: core.stats.stars,
                openIssues: 0,
            },
            
            // 安装信息
            installation: {
                npm: extended.installation?.npm || undefined,
                pip: extended.installation?.pip || undefined,
                docker: extended.installation?.docker || undefined,
                manual: extended.installation?.manual || undefined,
                uv: extended.installation?.uv || undefined,
                instructions: (extended.installation?.instructions || []).map(inst => ({
                    type: inst.type || "bash",
                    content: inst.content || "",
                    description: inst.description || ""
                }))
            },
            
            // 文档信息
            documentation: {
                readme: extended.fullDescription || core.description,
                overview: undefined,
                installation: undefined,
                examples: undefined,
                api_reference: undefined,
                api: extended.documentation?.api || core.links.docs || undefined,
                structured: undefined
            },
            
            // 兼容性信息
            compatibility: extended.compatibility || {
                platforms: ['web', 'desktop'],
                nodeVersion: undefined,
                pythonVersion: undefined,
                requirements: []
            },
            
            // 质量评分
            quality: extended.quality || {
                score: core.qualityScore,
                factors: {
                    documentation: 60,
                    maintenance: 50,
                    community: 40,
                    performance: 85
                }
            },
            
            // 使用统计
            usage: extended.usage || {
                downloads: core.stats.stars * 10,
                dependents: core.stats.forks,
                weeklyDownloads: Math.floor(core.stats.stars * 2),
            },
            
            // 兼容性字段
            featured: core.featured,
            verified: core.verified,
            createdAt: (extended.metadata as Record<string, unknown>)?.createdAt as string || new Date(2024, 0, 1).toISOString(),
            updatedAt: core.stats.lastUpdated,
        };
    });
}

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async (): Promise<Category[]> => {
            await delay(100); // 模拟网络延迟
            const response = await fetch("/data/categories.json");
            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }
            const categoriesData = await response.json() as CategoryJson[];
            
            // 转换数据格式以匹配类型定义
            return categoriesData.map((cat) => ({
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

// 核心数据加载 Hook - 立即加载，用于初始页面渲染
export const useCoreServers = () => {
    return useQuery({
        queryKey: ["servers", "core"],
        queryFn: async (): Promise<CoreServerData[]> => {
            await delay(200); // 模拟网络延迟
            const response = await fetch("/data/servers-core.json");
            if (!response.ok) {
                throw new Error("Failed to fetch core server data");
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5分钟
    });
};

// 扩展数据加载 Hook - 按需加载
export const useExtendedServers = () => {
    return useQuery({
        queryKey: ["servers", "extended"],
        queryFn: async (): Promise<ExtendedServerData> => {
            await delay(300); // 模拟网络延迟
            const response = await fetch("/data/servers-extended.json");
            if (!response.ok) {
                throw new Error("Failed to fetch extended server data");
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5分钟
    });
};

// 主要的服务器数据 Hook - 合并核心和扩展数据
export const useServers = () => {
    const { data: coreData, error: coreError } = useCoreServers();
    const { data: extendedData } = useExtendedServers();

    return useQuery({
        queryKey: ["servers", "merged", !!coreData, !!extendedData],
        queryFn: async (): Promise<MCPServer[]> => {
            if (coreError) {
                throw coreError;
            }
            if (!coreData) {
                throw new Error("Core data not available");
            }
            
            // 如果扩展数据还没加载完，使用核心数据创建基础对象
            const extended = extendedData || {};
            return mergeServerData(coreData, extended);
        },
        enabled: !!coreData || !!coreError,
        staleTime: 5 * 60 * 1000,
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

// 优化的 README 数据加载 Hook
export const useServerReadme = (serverId: string) => {
    return useQuery({
        queryKey: ["readme", serverId],
        queryFn: async (): Promise<ProcessedREADME | null> => {
            if (!serverId) return null;
            
            try {
                const response = await fetch(`/data/readme/${serverId}.json`);
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

// 搜索索引 Hook - 用于快速客户端搜索
export const useSearchIndex = () => {
    return useQuery({
        queryKey: ["search", "index"],
        queryFn: async () => {
            const response = await fetch("/data/search-index.json");
            if (!response.ok) {
                throw new Error("Failed to fetch search index");
            }
            return response.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// README 索引 Hook - 用于了解哪些服务器有文档
export const useReadmeIndex = () => {
    return useQuery({
        queryKey: ["readme", "index"],
        queryFn: async () => {
            const response = await fetch("/data/readme/index.json");
            if (!response.ok) {
                throw new Error("Failed to fetch README index");
            }
            return response.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};