import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Package,
    AlertCircle,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useServersByCategoryPaginated, useCategories } from "../hooks/useUnifiedData";
import type { SearchFilters } from "../types";
import { ServerCard, ServerListItem } from "../components/ServerCard";
import { BatchScoreProvider } from "../components/BatchScoreProvider";
import { BatchUserVoteProvider } from "../components/BatchUserVoteProvider";

const CategoryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: categories } = useCategories();

    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<SearchFilters>({});
    const [quickFilter, setQuickFilter] = useState("all");
    
    // Platform and Language filters - same as Servers page
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
    const [sortBy, setSortBy] = useState("stars"); // 默认按star数排序
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);

    // Use paginated hook for better performance with filters
    const { 
        data: paginatedResult, 
        isLoading: serversLoading
    } = useServersByCategoryPaginated(
        id!,
        currentPage,
        12, // items per page
        sortBy,
        sortOrder,
        {
            search: searchQuery.trim() || undefined,
            subcategory: filters.subcategory,
            platforms: filters.platforms || [],
            languages: filters.languages || [],
            featured: quickFilter === "featured" || filters.featured,
            verified: quickFilter === "official" || filters.verified,
            popular: quickFilter === "popular",
        }
    );


    const servers = paginatedResult?.data || [];
    const totalServers = paginatedResult?.total || 0;
    const hasNextPage = paginatedResult?.hasNextPage || false;
    const hasPreviousPage = paginatedResult?.hasPreviousPage || false;
    const totalPages = paginatedResult?.totalPages || 0;

    const category = categories?.find((cat) => cat.id === id);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, sortOrder, filters, searchQuery, quickFilter]);

    // Server data is already filtered and sorted on the server side
    const filteredAndSortedServers = servers;
    
    // Extract server IDs for batch score fetching
    const serverIds = React.useMemo(() => servers.map(server => server.id), [servers]);

    if (!category && !serversLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="text-red-400 dark:text-red-500 mb-4">
                    <AlertCircle className="h-12 w-12 mx-auto" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Category Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Sorry, we couldn't find the category you're looking for.
                </p>
                <Link
                    to="/categories"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        to="/categories"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Categories
                    </Link>

                    {/* Category Header */}
                    {category && (
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center mb-6 lg:mb-0">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center mr-6"
                                    style={{
                                        backgroundColor: category.color + "20",
                                        color: category.color,
                                    }}
                                >
                                    <Package className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {category.name["en"] || category.name["zh-CN"]}
                                        </h1>
                                        <span
                                            className="text-sm bg-white dark:bg-gray-700 bg-opacity-20 px-3 py-1 rounded-full"
                                            style={{
                                                backgroundColor: category.color + "20",
                                                color: category.color,
                                            }}
                                        >
                                            {totalServers} servers
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">
                                        {category.description["en"] || category.description["zh-CN"]}
                                    </p>
                                    
                                    {/* Subcategories */}
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {category.subcategories.map((sub) => (
                                                <span
                                                    key={sub.id}
                                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                                    onClick={() => setFilters({
                                                        ...filters,
                                                        subcategory: filters.subcategory === sub.id ? undefined : sub.id
                                                    })}
                                                    style={{
                                                        backgroundColor: filters.subcategory === sub.id ? category.color + "20" : undefined,
                                                        color: filters.subcategory === sub.id ? category.color : undefined,
                                                    }}
                                                >
                                                    {sub.name["en"] || sub.name["zh-CN"]}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* View Toggle and Sort */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md ${
                                            viewMode === "grid"
                                                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                                                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md ${
                                            viewMode === "list"
                                                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
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
                                    <option value="stars-desc">Sort by GitHub Stars (High to Low)</option>
                                    <option value="stars-asc">Sort by GitHub Stars (Low to High)</option>
                                    <option value="total_score-desc">Sort by Community Score (High to Low)</option>
                                    <option value="total_score-asc">Sort by Community Score (Low to High)</option>
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
                    )}
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
                                        setFilters({});
                                        setSearchQuery("");
                                        setQuickFilter("all");
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
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Subcategory Filter */}
                            {category?.subcategories && category.subcategories.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Subcategories
                                    </label>
                                    <div className="space-y-2">
                                        {category.subcategories.map((sub) => (
                                            <label key={sub.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.subcategory === sub.id}
                                                    onChange={(e) =>
                                                        setFilters({
                                                            ...filters,
                                                            subcategory: e.target.checked ? sub.id : undefined,
                                                        })
                                                    }
                                                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {sub.name["en"] || sub.name["zh-CN"]}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                                checked={filters.platforms?.includes(platform.id) || false}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            platforms: [...(filters.platforms || []), platform.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            platforms: filters.platforms?.filter(p => p !== platform.id) || []
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
                                                checked={filters.languages?.includes(language.id) || false}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            languages: [...(filters.languages || []), language.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            languages: filters.languages?.filter(l => l !== language.id) || []
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
                        {/* Results Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-medium">{filteredAndSortedServers.length}</span> of{" "}
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
                        {serversLoading ? (
                            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mr-3"></div>
                                            <div className="flex-1">
                                                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredAndSortedServers.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <Search className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    No servers found in this category
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    Try adjusting your filters or search for different terms
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => {
                                            setFilters({});
                                            setSearchQuery("");
                                            setQuickFilter("all");
                                        }}
                                        className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                    <Link
                                        to="/categories"
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Browse Categories
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <BatchUserVoteProvider serverIds={serverIds}>
                                <BatchScoreProvider serverIds={serverIds}>
                                    {viewMode === "grid" ? (
                                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                            {filteredAndSortedServers.map((server) => (
                                                <ServerCard key={server.id} server={server} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredAndSortedServers.map((server) => (
                                                <ServerListItem key={server.id} server={server} />
                                            ))}
                                        </div>
                                    )}
                                </BatchScoreProvider>
                            </BatchUserVoteProvider>
                        )}

                        {/* Pagination */}
                        {!serversLoading && totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-medium">{filteredAndSortedServers.length}</span> of{" "}
                                    <span className="font-medium">{totalServers}</span> servers
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
                                                            ? "bg-primary-600 text-white"
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

export default CategoryDetail;
