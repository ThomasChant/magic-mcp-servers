import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Search,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useServersPaginated, useCategories } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import { ServerCard, ServerListItem } from "../components/ServerCard";

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
    const [sortBy, setSortBy] = useState("upvotes"); // 默认按使用人数排序
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
        } else if (quickFilter === "latest") {
            result.latest = true;
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

    
    // Format star count like GitHub
    // const formatStarCount = (count: number): string => {
    //     if (count >= 1000000) {
    //         const m = count / 1000000;
    //         return m >= 10 ? Math.floor(m) + 'm' : m.toFixed(1) + 'm';
    //     } else if (count >= 1000) {
    //         const k = count / 1000;
    //         return k >= 10 ? Math.floor(k) + 'k' : k.toFixed(1) + 'k';
    //     }
    //     return count.toString();
    // };

    // Server data is already filtered and sorted on the server side
    const filteredAndSortedServers = servers;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, quickFilter, filters, sortBy, sortOrder]);

    // Servers are already paginated from the server
    const paginatedServers = filteredAndSortedServers;

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
                                <option value="upvotes-desc">Sort by Usage Count (High to Low)</option>
                                <option value="upvotes-asc">Sort by Usage Count (Low to High)</option>
                                <option value="stars-desc">Sort by GitHub Stars (High to Low)</option>
                                <option value="stars-asc">Sort by GitHub Stars (Low to High)</option>
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
                                                {category.name?.en || category.name_en || category.id} ({category.serverCount || 0})
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
                                {["all", "official", "featured", "popular", "latest"].map((filter) => (
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