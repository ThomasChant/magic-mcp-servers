import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Search,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    Filter,
    X
} from "lucide-react";
import { useServersPaginated, useCategories } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import { ServerCard, ServerListItem } from "../components/ServerCard";
import { BatchScoreProvider } from "../components/BatchScoreProvider";
import { BatchUserVoteProvider } from "../components/BatchUserVoteProvider";

const Servers: React.FC = () => {
    const { t } = useTranslation(['server', 'common']);
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
    const [sortBy, setSortBy] = useState("stars"); // 默认按star数排序
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [quickFilter, setQuickFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(getInitialFilters());
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        } else if (quickFilter === "official") {
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
    
    // Extract server IDs for batch score fetching
    const serverIds = useMemo(() => servers.map(server => server.id), [servers]);
    
    // Server data is already filtered and sorted on the server side
    const filteredAndSortedServers = servers;
    
    // Servers are already paginated from the server
    const paginatedServers = filteredAndSortedServers;

    const platformFilters = [
        { id: "web", name: t('platforms.web') },
        { id: "desktop", name: t('platforms.desktop') },
        { id: "mobile", name: t('platforms.mobile') },
        { id: "cloud", name: t('platforms.cloud') },
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

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, quickFilter, filters, sortBy, sortOrder]);

    // Prevent body scroll when mobile filters are open
    useEffect(() => {
        if (mobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileFiltersOpen]);

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('list.error')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{t('list.errorMessage')}</p>
                    <div className="text-red-500 mb-4">{t('error')}: {String(serversError)}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {t('list.retry')}
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
                                {t('hero.title')}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                {t('hero.subtitle')}
                                <span className="block text-sm mt-1">
                                    {t('hero.serverCount', { count: totalServers, categoryCount: categories?.length || 0 })}
                                </span>
                            </p>
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="md:hidden mb-6">
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative shadow-md"
                            >
                                <Filter className="h-5 w-5" />
                                <span className="text-sm font-medium">{t('list.filters')}</span>
                                {/* Filter Count Badge */}
                                {(filters.categories.length + filters.platforms.length + filters.languages.length + (sidebarSearch ? 1 : 0)) > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                        {filters.categories.length + filters.platforms.length + filters.languages.length + (sidebarSearch ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* View Toggle and Sort */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('list.view')}</span>
                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === "grid"
                                                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === "list"
                                                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSortBy, newSortOrder] = e.target.value.split('-');
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder as 'asc' | 'desc');
                                    }}
                                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto md:min-w-[200px] shadow-sm"
                                >
                                    <option value="stars-desc">{t('sort.starsDesc')}</option>
                                    <option value="stars-asc">{t('sort.starsAsc')}</option>
                                    <option value="upvotes-desc">{t('sort.usageCountDesc')}</option>
                                    <option value="upvotes-asc">{t('sort.usageCountAsc')}</option>
                                    <option value="name-asc">{t('sort.nameAsc')}</option>
                                    <option value="name-desc">{t('sort.nameDesc')}</option>
                                    <option value="repo_created_at-desc">{t('sort.createdDesc')}</option>
                                    <option value="repo_created_at-asc">{t('sort.createdAsc')}</option>
                                    <option value="last_updated-desc">{t('sort.updatedDesc')}</option>
                                    <option value="last_updated-asc">{t('sort.updatedAsc')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Overlay */}
                    {mobileFiltersOpen && (
                        <div className="md:hidden fixed inset-0 z-50 flex">
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
                                onClick={() => setMobileFiltersOpen(false)}
                            />
                            
                            {/* Filter Panel */}
                            <div className="relative bg-white dark:bg-gray-800 w-80 max-w-full h-full overflow-y-auto shadow-xl animate-slide-in-left">
                                {/* Close Button */}
                                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('list.filters')}
                                    </h3>
                                    <button
                                        onClick={() => setMobileFiltersOpen(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                                
                                {/* Filter Content */}
                                <div className="p-6">
                                    {/* Search Filter */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('list.search')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="search"
                                                placeholder={t('hero.searchPlaceholder')}
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
                                            {t('list.categories')}
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
                                                        {category.name?.en || category.id} ({category.serverCount || 0})
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Platform Filter */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            {t('list.platform')}
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
                                            {t('list.language')}
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

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {/* Clear All Button */}
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
                                            className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            {t('list.clearAll')}
                                        </button>
                                        
                                        {/* Apply Filters Button */}
                                        <button
                                            onClick={() => setMobileFiltersOpen(false)}
                                            className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            {t('common.apply')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Sidebar Filters */}
                    <div className="hidden md:block md:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('list.filters')}
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
                                    {t('list.clearAll')}
                                </button>
                            </div>

                            {/* Search Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('list.search')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="search"
                                        placeholder={t('hero.searchPlaceholder')}
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
                                    {t('list.categories')}
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
                                                {category.name?.en || category.id} ({category.serverCount || 0})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {t('list.platform')}
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
                                    {t('list.language')}
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
                    <div className="w-full md:w-3/4">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {t('list.showing', { start: paginatedServers.length, total: totalServers })} {t('list.page', { current: currentPage, total: totalPages })}
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
                                        {t(`list.${filter}`)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Server Grid/List */}
                        {paginatedServers.length > 0 ? (
                            <BatchUserVoteProvider serverIds={serverIds}>
                                <BatchScoreProvider serverIds={serverIds}>
                                    {viewMode === "grid" ? (
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
                                    )}
                                </BatchScoreProvider>
                            </BatchUserVoteProvider>
                        ) : (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t('list.noResults')}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t('list.tryAdjusting')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('list.showingResults', { count: paginatedServers.length, total: totalServers })}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!hasPreviousPage}
                                        className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        {t('list.previous')}
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
                                        {t('list.next')}
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