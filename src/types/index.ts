export interface MCPServer {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    category: string;
    subcategory: string;
    tags: string[];
    repository: {
        url: string;
        owner: string;
        name: string;
        stars: number;
        lastUpdated: string;
        forks?: number;
        watchers?: number;
        openIssues?: number;
    };
    installation: {
        npm?: string;
        pip?: string;
        docker?: string;
        manual?: string;
    };
    documentation: {
        readme: string;
        examples?: string;
        api?: string;
    };
    compatibility: {
        platforms: string[];
        nodeVersion?: string;
        pythonVersion?: string;
    };
    quality: {
        score: number;
        factors: {
            documentation: number;
            maintenance: number;
            community: number;
            performance: number;
        };
    };
    usage: {
        downloads: number;
        dependents: number;
        weeklyDownloads: number;
    };
    featured: boolean;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: {
        en: string;
        "zh-CN": string;
        "zh-TW": string;
        fr: string;
        ja: string;
        ko: string;
        ru: string;
    };
    description: {
        en: string;
        "zh-CN": string;
        "zh-TW": string;
        fr: string;
        ja: string;
        ko: string;
        ru: string;
    };
    icon: string;
    color: string;
    subcategories: Subcategory[];
    serverCount: number;
}

export interface Subcategory {
    id: string;
    name: {
        en: string;
        "zh-CN": string;
        "zh-TW": string;
        fr: string;
        ja: string;
        ko: string;
        ru: string;
    };
    description: {
        en: string;
        "zh-CN": string;
        "zh-TW": string;
        fr: string;
        ja: string;
        ko: string;
        ru: string;
    };
}

export interface SearchFilters {
    category?: string;
    subcategory?: string;
    tags?: string[];
    compatibility?: string[];
    qualityScore?: number;
    featured?: boolean;
    verified?: boolean;
}

export interface SortOption {
    key: "name" | "stars" | "downloads" | "quality" | "updated";
    label: string;
    direction: "asc" | "desc";
}

export interface AppState {
    language: "en" | "zh-CN" | "zh-TW" | "fr" | "ja" | "ko" | "ru";
    theme: "light" | "dark";
    searchQuery: string;
    filters: SearchFilters;
    sortBy: SortOption;
}

export interface PaginationInfo {
    current: number;
    total: number;
    perPage: number;
}

// Structured README data interfaces
export interface ExtractedSection {
    title: string;
    content: string;
    code_blocks: Array<{
        language: string;
        code: string;
    }>;
    subsections: Array<{
        title: string;
        content: string;
    }>;
}

export interface ProcessedREADME {
    filename: string;
    project_name: string;
    overview?: ExtractedSection;
    installation?: ExtractedSection;
    examples?: ExtractedSection;
    api_reference?: ExtractedSection;
    raw_content: string;
}
