import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Search,
    Calendar,
    ArrowRight,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    Folder,
    Database,
    MessageCircle,
    Bot,
    FileText,
    GitBranch,
    Star,
} from "lucide-react";
import { useServersPaginated, useCategories } from "../hooks/useUnifiedData";
import type { MCPServer } from "../types";
import { FavoriteButton } from "../components/FavoriteButton";
import VoteButtons from "../components/VoteButtons";
import { useAppStore } from "../store/useAppStore";

// Extended interface for JSON data structure
interface ServerData extends Omit<MCPServer, 'verified'> {
    official?: boolean;
    descriptionEn?: string;
    repository: MCPServer['repository'] & {
        lastUpdate?: string;
    };
}

const Servers: React.FC = () => {
    const location = useLocation();
    
    // Get global search query from app store
    const { searchQuery } = useAppStore();
    
    // Get initial category from URL query parameters
    const getInitialFilters = () => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        
        return {
            categories: categoryParam ? [categoryParam] : [] as string[],
            platforms: [] as string[],
            languages: [] as string[],
            status: [] as string[],
        };
    };

    // State management
    const [sidebarSearch, setSidebarSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("stars"); // 默认按星标数排序
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [quickFilter, setQuickFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(getInitialFilters());

    // Handle global search query immediately (from home page search)
    useEffect(() => {
        if (searchQuery.trim()) {
            setDebouncedSearch(searchQuery.trim());
            // Sync the local search input with global search (avoid triggering local debounce)
            if (sidebarSearch !== searchQuery) {
                setSidebarSearch(searchQuery);
            }
            // Reset to first page when searching
            setCurrentPage(1);
        } else if (searchQuery === '') {
            // If global search is cleared, clear debounced search too
            setDebouncedSearch('');
        }
    }, [searchQuery, sidebarSearch]);

    // Debounce local sidebar search input to avoid excessive API calls
    useEffect(() => {
        // Only apply debounce if there's no global search query active
        if (!searchQuery.trim()) {
            const timer = setTimeout(() => {
                setDebouncedSearch(sidebarSearch.trim());
                // Reset to first page when local search changes
                setCurrentPage(1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [sidebarSearch, searchQuery]);

    // Update filters when URL changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        
        if (categoryParam && !filters.categories.includes(categoryParam)) {
            setFilters(prevFilters => ({
                ...prevFilters,
                categories: [categoryParam]
            }));
        }
    }, [location.search, filters.categories]);

    // Get real categories with server counts
    const { data: categories } = useCategories();

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, quickFilter]);

    // Build filters for the hook
    const hookFilters = useMemo(() => {
        const result: Record<string, unknown> = {};
        
        if (debouncedSearch.trim()) {
            result.search = debouncedSearch.trim();
        }
        
        if (filters.categories.length > 0) {
           result.category = filters.categories;
        }
        
        if (filters.platforms.length > 0) {
            result.platforms = filters.platforms;
        }
        
        if (filters.languages.length > 0) {
            result.languages = filters.languages;
        }
        
        if (quickFilter === "featured") {
            result.featured = true;
        } else if (quickFilter === "verified") {
            result.verified = true;
        } else if (quickFilter === "popular") {
            result.popular = true;
        }
        
        return Object.keys(result).length > 0 ? result : undefined;
    }, [debouncedSearch, filters, quickFilter]);

    // Use paginated hook
    const { 
        data: paginatedResult, 
        isLoading: serversLoading, 
        error: serversError 
    } = useServersPaginated(
        currentPage,
        36, // items per page
        sortBy,
        sortOrder,
        hookFilters
    );

    const servers = paginatedResult?.data || [];
    const totalServers = paginatedResult?.total || 0;
    const hasNextPage = paginatedResult?.hasNextPage || false;
    const hasPreviousPage = paginatedResult?.hasPreviousPage || false;
    const totalPages = paginatedResult?.totalPages || 0;

    const platformFilters = [
        { id: "web", name: "Web" },
        { id: "desktop", name: "Desktop" },
        { id: "mobile", name: "Mobile" },
        { id: "cloud", name: "Cloud" },
    ];

    const languageFilters = [
        // 主流编程语言
        { id: "Python", name: "Python" },
        { id: "JavaScript", name: "JavaScript" },
        { id: "TypeScript", name: "TypeScript" },
        { id: "Java", name: "Java" },
        { id: "Go", name: "Go" },
        { id: "Rust", name: "Rust" },
        { id: "C#", name: "C#" },
        { id: "PHP", name: "PHP" },
        { id: "Ruby", name: "Ruby" },
        { id: "C++", name: "C++" },
        { id: "C", name: "C" },
        { id: "Swift", name: "Swift" },
        { id: "Kotlin", name: "Kotlin" },
        { id: "Dart", name: "Dart" },
        
        // 前端技术
        { id: "HTML", name: "HTML" },
        { id: "CSS", name: "CSS" },
        { id: "SCSS", name: "SCSS" },
        { id: "Vue", name: "Vue" },
        
        // 脚本和Shell
        { id: "Shell", name: "Shell" },
        { id: "PowerShell", name: "PowerShell" },
        { id: "Batchfile", name: "Batch" },
        
        // 配置和工具
        { id: "Dockerfile", name: "Docker" },
        { id: "Makefile", name: "Makefile" },
        { id: "CMake", name: "CMake" },
        
        // 数据和科学计算
        { id: "R", name: "R" },
        { id: "MATLAB", name: "MATLAB" },
        { id: "Jupyter Notebook", name: "Jupyter" },
        
        // 其他重要语言
        { id: "Lua", name: "Lua" },
        { id: "Clojure", name: "Clojure" },
        { id: "Solidity", name: "Solidity" },
        { id: "HCL", name: "HCL" },
        { id: "Nix", name: "Nix" }
    ];

    // Get server icon based on category or tags
    const getServerIcon = (server: ServerData) => {
        const tags = server.tags.join(" ").toLowerCase();
        const category = Array.isArray(server.category) ? server.category.join(" ").toLowerCase() : server.category.toLowerCase();
        const combined = `${tags} ${category}`;
        
        if (combined.includes("file") || combined.includes("storage")) {
            return <Folder className="h-5 w-5 text-white" />;
        } else if (combined.includes("database") || combined.includes("sql")) {
            return <Database className="h-5 w-5 text-white" />;
        } else if (combined.includes("communication") || combined.includes("slack") || combined.includes("messaging")) {
            return <MessageCircle className="h-5 w-5 text-white" />;
        } else if (combined.includes("ai") || combined.includes("ml") || combined.includes("search")) {
            return <Bot className="h-5 w-5 text-white" />;
        } else if (combined.includes("development") || combined.includes("github") || combined.includes("git")) {
            return <Bot className="h-5 w-5 text-white" />;
        } else {
            return <FileText className="h-5 w-5 text-white" />;
        }
    };

    // Get server icon background color
    const getServerIconBg = (server: ServerData) => {
        const tags = server.tags.join(" ").toLowerCase();
        const category = Array.isArray(server.category) ? server.category.join(" ").toLowerCase() : server.category.toLowerCase();
        const combined = `${tags} ${category}`;
        
        if (combined.includes("file") || combined.includes("storage")) {
            return "bg-blue-600";
        } else if (combined.includes("database") || combined.includes("sql")) {
            return server.name.toLowerCase().includes("sqlite") ? "bg-yellow-600" : "bg-green-600";
        } else if (combined.includes("communication") || combined.includes("slack") || combined.includes("messaging")) {
            return "bg-purple-600";
        } else if (combined.includes("ai") || combined.includes("ml") || combined.includes("search")) {
            return "bg-red-600";
        } else if (combined.includes("development") || combined.includes("github") || combined.includes("git")) {
            return "bg-indigo-600";
        } else {
            return "bg-yellow-600";
        }
    };


    // Format star count like GitHub
    const formatStarCount = (count: number): string => {
        if (count >= 1000000) {
            const m = count / 1000000;
            return m >= 10 ? Math.floor(m) + 'm' : m.toFixed(1) + 'm';
        } else if (count >= 1000) {
            const k = count / 1000;
            return k >= 10 ? Math.floor(k) + 'k' : k.toFixed(1) + 'k';
        }
        return count.toString();
    };

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return "today";
        
        // Calculate years, months, weeks, and days
        const years = Math.floor(diffInDays / 365);
        const months = Math.floor((diffInDays % 365) / 30);
        const weeks = Math.floor((diffInDays % 30) / 7);
        const days = diffInDays % 7;
        
        // Build array of time units
        const units: { value: number; label: string }[] = [];
        if (years > 0) units.push({ value: years, label: "y" });
        if (months > 0) units.push({ value: months, label: "m" });
        if (weeks > 0) units.push({ value: weeks, label: "w" });
        if (days > 0) units.push({ value: days, label: "d" });
        
        // Take only the two largest units
        const displayUnits = units.slice(0, 2);
        
        // Format the output
        return displayUnits.map(unit => `${unit.value}${unit.label}`).join('');
    };

    const isPopular = (server: ServerData) => {
        return server.stats.stars >= 1000 || server.stats.forks >= 100;
    };

    // Detect if server is part of a monorepo
    const getMonorepoInfo = (githubUrl: string) => {
        if (!githubUrl) return null;
        
        // Pattern to match monorepo URLs like github.com/owner/repo/tree/main/path
        const monorepoPattern = /github\.com\/([^/]+\/[^/]+)\/(tree|blob)\/[^/]+\/(.+)/;
        const match = githubUrl.match(monorepoPattern);
        
        if (match) {
            return {
                parentRepo: match[1],
                path: match[3]
            };
        }
        
        return null;
    };

    // Server data is already filtered and sorted on the server side
    const filteredAndSortedServers = servers;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, quickFilter, filters, sortBy, sortOrder]);

    // Servers are already paginated from the server
    const paginatedServers = filteredAndSortedServers;

    const ServerCard: React.FC<{ server: ServerData }> = ({ server }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover-lift flex flex-col justify-between h-full">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                    <Link to={`/servers/${server.slug}`} className="flex items-center min-w-0 flex-1 mr-4">
                        <div
                            className={`w-10 h-10 ${getServerIconBg(
                                server
                            )} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}
                        >
                            {getServerIcon(server)}
                        </div>
                        <div className="min-w-0 flex-1">
                            {server.owner && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                    @{server.owner}
                                </div>
                            )}
                            <h3 className="server-name text-base font-semibold text-gray-900 dark:text-white truncate" title={server.name}>
                                {server.name}
                            </h3>
                            <div className="flex items-center flex-wrap gap-1 mt-1">
                                {server.official && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Official
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Featured
                                    </span>
                                )}
                                {isPopular(server) && (
                                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Popular
                                    </span>
                                )}
                                {getMonorepoInfo(server.repository.url) && (
                                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-medium">
                                        <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                                        Monorepo
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    <div className="text-right flex-shrink-0 space-y-2">
                        <FavoriteButton
                            serverId={server.id}
                            size="sm"
                            className="mb-2"
                        />
                    </div>
                </div>

                <Link to={`/servers/${server.slug}`}>
                    <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {server.descriptionEn || server.description["zh-CN"]}
                    </p>
                </Link>

                <div className="flex flex-wrap gap-1 mb-4">
                    {server.tags.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="server-stats flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {formatStarCount(server.stats.stars || 0)}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTimeAgo(
                            server.stats.createdAt ||
                                server.repository.lastUpdate ||
                                server.repository.lastUpdated ||
                                ""
                        )}
                    </span>
                </div>
                
                {/* 投票按钮 */}
                <VoteButtons 
                    serverId={server.id}
                    size="sm"
                    className="ml-2"
                />
                {/* <Link to={`/servers/${server.slug}`}>
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-sm text-sm flex items-end">
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                </Link> */}
            </div>
        </div>
    );

    // Server List Item Component
    const ServerListItem: React.FC<{ server: ServerData }> = ({ server }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover-lift cursor-pointer mb-4">
            <div className="flex items-center justify-between">
                <Link to={`/servers/${server.slug}`} className="flex items-center min-w-0 flex-1">
                    <div
                        className={`w-12 h-12 ${getServerIconBg(
                            server
                        )} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}
                    >
                        {getServerIcon(server)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="server-name text-base font-semibold text-gray-900 dark:text-white truncate" title={server.name}>
                                {server.name}
                            </h3>
                            {server.owner && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    @{server.owner}
                                </span>
                            )}
                            <div className="flex items-center flex-wrap gap-1">
                                {server.official && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Official
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Featured
                                    </span>
                                )}
                                {isPopular(server) && (
                                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Popular
                                    </span>
                                )}
                                {getMonorepoInfo(server.repository.url) && (
                                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-medium">
                                        <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                                        Monorepo
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                            {server.descriptionEn ||
                                server.description["zh-CN"]}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {formatStarCount(server.stats.stars || 0)}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTimeAgo(
                                    server.stats.createdAt ||
                                        server.repository.lastUpdate ||
                                        server.repository.lastUpdated ||
                                        ""
                                )}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {server.tags
                                    .slice(0, 2)
                                    .map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>
                </Link>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <FavoriteButton serverId={server.id} size="sm" />
                    <VoteButtons 
                        serverId={server.id}
                        size="sm"
                    />
                    <Link to={`/servers/${server.slug}`}>
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center">
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );

    if (serversLoading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen" data-testid="loading">
                {/* 加载状态UI */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (serversError) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error loading servers</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load server data. Please try again later.</p>
                    <div className="text-red-500 mb-4">Error: {String(serversError)}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                MCP Servers
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Discover and integrate powerful Model Context Protocol servers
                                <span className="block text-sm mt-1">
                                    {totalServers} servers available across {categories?.length || 0} categories
                                </span>
                            </p>
                        </div>

                        {/* View Toggle and Sort */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-md ${
                                        viewMode === "grid"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-md ${
                                        viewMode === "list"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder as 'asc' | 'desc');
                                }}
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="total_score-desc">Sort by Community Score (High to Low)</option>
                                <option value="total_score-asc">Sort by Community Score (Low to High)</option>
                                <option value="stars-desc">Sort by GitHub Stars (High to Low)</option>
                                <option value="stars-asc">Sort by GitHub Stars (Low to High)</option>
                                <option value="quality_score-desc">Sort by Quality (High to Low)</option>
                                <option value="quality_score-asc">Sort by Quality (Low to High)</option>
                                <option value="name-asc">Sort by Name (A to Z)</option>
                                <option value="name-desc">Sort by Name (Z to A)</option>
                                <option value="repo_created_at-desc">Sort by Created (Newest First)</option>
                                <option value="repo_created_at-asc">Sort by Created (Oldest First)</option>
                                <option value="last_updated-desc">Sort by Updated (Recent First)</option>
                                <option value="last_updated-asc">Sort by Updated (Oldest First)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Filters
                                </h3>
                                <button
                                    onClick={() => {
                                        setFilters({
                                            categories: [],
                                            platforms: [],
                                            languages: [],
                                            status: [],
                                        });
                                        setSidebarSearch("");
                                        setDebouncedSearch("");
                                    }}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Search Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="search"
                                        placeholder="Filter by name or description..."
                                        value={sidebarSearch}
                                        onChange={(e) => setSidebarSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Categories
                                </label>
                                <div className="space-y-2">
                                    {categories?.map((category) => (
                                        <label key={category.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.categories.includes(category.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            categories: [...filters.categories, category.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            categories: filters.categories.filter(c => c !== category.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                {category.name.en} ({category.serverCount || 0})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Platform
                                </label>
                                <div className="space-y-2">
                                    {platformFilters.map((platform) => (
                                        <label key={platform.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.platforms.includes(platform.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            platforms: [...filters.platforms, platform.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            platforms: filters.platforms.filter(p => p !== platform.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                {platform.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Language Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Language
                                </label>
                                <div className="space-y-2">
                                    {languageFilters.map((language) => (
                                        <label key={language.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.languages.includes(language.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            languages: [...filters.languages, language.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            languages: filters.languages.filter(l => l !== language.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                {language.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-medium">{paginatedServers.length}</span> of{" "}
                                <span className="font-medium">{totalServers}</span> servers
                                (Page {currentPage} of {totalPages})
                            </div>

                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-2">
                                {["all", "official", "featured", "popular"].map((filter) => (
                                    <span
                                        key={filter}
                                        onClick={() => setQuickFilter(filter)}
                                        className={`filter-tag px-3 py-1 rounded-full text-xs cursor-pointer ${
                                            quickFilter === filter
                                                ? "active bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Server Grid/List */}
                        {paginatedServers.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedServers.map((server) => (
                                        <ServerCard key={server.id} server={server} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {paginatedServers.map((server) => (
                                        <ServerListItem key={server.id} server={server} />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No matching servers found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Try adjusting your search terms or filters
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-medium">{paginatedServers.length}</span> of{" "}
                                    <span className="font-medium">{totalServers}</span> results
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!hasPreviousPage}
                                        className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        {/* Show page numbers */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-2 text-sm rounded-md ${
                                                        currentPage === pageNum
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        {totalPages > 5 && currentPage < totalPages - 2 && (
                                            <>
                                                <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                                                <button
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!hasNextPage}
                                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Servers;