import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Star,
    Download,
    Calendar,
    ExternalLink,
    Github,
    Package,
    AlertCircle,
    Grid3X3,
    List,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useServersByCategoryPaginated, useCategories } from "../hooks/useUnifiedData";
import type { MCPServer, SearchFilters, SortOption } from "../types";

const CategoryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: categories } = useCategories();

    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<SearchFilters>({});
    const [sortBy, setSortBy] = useState<SortOption>({
        key: "quality",
        label: "Quality Score",
        direction: "desc",
    });
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);

    // Use paginated hook for better performance
    const { 
        data: paginatedResult, 
        isLoading: serversLoading 
    } = useServersByCategoryPaginated(
        id!,
        currentPage,
        12, // items per page
        sortBy.key,
        sortBy.direction
    );

    const servers = paginatedResult?.data || [];
    const totalServers = paginatedResult?.total || 0;
    const hasNextPage = paginatedResult?.hasNextPage || false;
    const hasPreviousPage = paginatedResult?.hasPreviousPage || false;
    const totalPages = paginatedResult?.totalPages || 0;

    const category = categories?.find((cat) => cat.id === id);

    const sortOptions: SortOption[] = [
        { key: "name", label: "Name", direction: "asc" },
        { key: "stars", label: "Stars", direction: "desc" },
        { key: "downloads", label: "Downloads", direction: "desc" },
        { key: "quality", label: "Quality Score", direction: "desc" },
        { key: "updated", label: "Last Updated", direction: "desc" },
    ];

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, filters]);

    // Server data is already filtered and sorted on the server side
    const filteredAndSortedServers = servers;

    const ServerCard: React.FC<{ server: MCPServer }> = ({ server }) => {
        if (viewMode === "list") {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: category?.color + "20",
                                    color: category?.color,
                                }}
                            >
                                <Package className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {server.owner && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                        @{server.owner}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <Link
                                        to={`/servers/${server.slug}`}
                                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words"
                                        title={server.name}
                                    >
                                        {server.name}
                                    </Link>
                                    {server.verified && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                            Verified
                                        </span>
                                    )}
                                    {server.featured && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                                    {server.description["zh-CN"]}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {server.tags.slice(0, 4).map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {server.repository.stars.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Download className="h-4 w-4 mr-1" />
                                        <span>{server.usage.downloads.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            {new Date(server.updatedAt || server.stats.lastUpdated || new Date()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                            <div className="text-right mb-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Quality Score</div>
                                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                    {server.quality.score}/100
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    to={server.repository.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Github className="h-5 w-5" />
                                </Link>
                                <Link
                                    to={`/servers/${server.slug}`}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
                            style={{
                                backgroundColor: category?.color + "20",
                                color: category?.color,
                            }}
                        >
                            <Package className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            {server.owner && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                    @{server.owner}
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-1">
                                <Link
                                    to={`/servers/${server.slug}`}
                                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words"
                                    title={server.name}
                                >
                                    {server.name}
                                </Link>
                            </div>
                            <div className="flex gap-2">
                                {server.verified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        Verified
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4" />
                            <span className="ml-1 text-gray-900 dark:text-white font-medium text-sm">
                                {server.quality.score}/100
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {server.description["zh-CN"]}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {server.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{server.repository.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            <span>{server.usage.downloads.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link
                            to={server.repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <Github className="h-4 w-4" />
                        </Link>
                        <Link
                            to={`/servers/${server.slug}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
                        >
                            View Details <ExternalLink className="h-3 w-3 inline ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

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

                                <div className="relative">
                                    <select
                                        value={`${sortBy.key}-${sortBy.direction}`}
                                        onChange={(e) => {
                                            const [key, direction] = e.target.value.split("-");
                                            const option = sortOptions.find((opt) => opt.key === key);
                                            if (option) {
                                                setSortBy({
                                                    ...option,
                                                    direction: direction as "asc" | "desc",
                                                });
                                            }
                                        }}
                                        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        {sortOptions.map((option) => (
                                            <option
                                                key={`${option.key}-${option.direction}`}
                                                value={`${option.key}-${option.direction}`}
                                            >
                                                Sort by {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>

                            {/* Search Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Filter by name or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
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
                                                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {sub.name["en"] || sub.name["zh-CN"]}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quality Score Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Quality Score
                                </label>
                                <div className="space-y-2">
                                    {[90, 80, 70, 60].map((score) => (
                                        <label key={score} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="qualityScore"
                                                checked={filters.qualityScore === score}
                                                onChange={() =>
                                                    setFilters({
                                                        ...filters,
                                                        qualityScore: filters.qualityScore === score ? undefined : score,
                                                    })
                                                }
                                                className="border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                {score}+ Score
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Server Type Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Server Type
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.featured || false}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    featured: e.target.checked || undefined,
                                                })
                                            }
                                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.verified || false}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    verified: e.target.checked || undefined,
                                                })
                                            }
                                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Verified</span>
                                    </label>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(filters.subcategory || filters.qualityScore || filters.featured || filters.verified) && (
                                <button
                                    onClick={() => setFilters({})}
                                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Results Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400">
                                Showing {filteredAndSortedServers.length} of {totalServers} servers
                                (Page {currentPage} of {totalPages})
                            </p>
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
                            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                                {filteredAndSortedServers.map((server) => (
                                    <ServerCard key={server.id} server={server} />
                                ))}
                            </div>
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
