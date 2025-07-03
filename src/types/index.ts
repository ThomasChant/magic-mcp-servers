import { type LucideIcon } from "lucide-react";

export interface MCPServer {
    id: string;
    name: string;
    owner: string;
    slug: string;
    description: {
        "zh-CN": string,
        en: string,
        "zh-TW": string,
        fr: string,
        ja: string,
        ko: string,
        ru: string
    },
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
    techStack: string[];
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
    // Legacy interface compatibility - made required to avoid undefined errors
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
        uv?: string;
        manual?: string;
        instructions?: Array<{
            type: string;
            content: string;
            description: string;
        }>;
    };
    documentation: {
        readme: string;
        examples?: string;
        api?: string;
        overview?: ExtractedSection | null;
        installation?: ExtractedSection | null;
        api_reference?: ExtractedSection | null;
        structured?: Record<string, unknown> | null;
    };
    compatibility: {
        platforms: string[];
        nodeVersion?: string;
        pythonVersion?: string;
        requirements?: string[];
    };
    quality: {
        score: number;
        factors: {
            documentation: number;
            maintenance: number;
            community: number;
            performance?: number;
        };
    };
    usage: {
        downloads: number;
        dependents: number;
        weeklyDownloads?: number;
    };
    featured?: boolean;
    verified?: boolean;
    latest?: boolean;
    createdAt?: string;
    updatedAt?: string;
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
    icon: LucideIcon;
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


export interface ServerReadme {
    filename: string;
    projectName: string;
    rawContent: string;
}

// Comment types for Supabase integration
export interface Comment {
    id: string;
    server_id: string;
    user_id: string;
    user_name: string;
    user_email?: string;
    content: string;
    parent_id?: string | null;
    level?: number;
    created_at: string;
    updated_at: string;
    replies?: Comment[];
    reply_count?: number;
}

export interface CommentInsert {
    server_id: string;
    user_id: string;
    user_name: string;
    user_email?: string;
    content: string;
    parent_id?: string | null;
}

export interface CommentUpdate {
    content: string;
}

export interface CommentWithReplies extends Comment {
    replies: Comment[];
}