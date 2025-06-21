import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Filter,
    Star,
    Download,
    Calendar,
    ExternalLink,
    Github,
    ChevronDown,
    ArrowUpDown,
} from "lucide-react";
import { useServers, useCategories } from "../hooks/useData";
import type { MCPServer, SearchFilters, SortOption } from "../types";

const Servers: React.FC = () => {
    const { data: servers, isLoading: serversLoading } = useServers();
    const { data: categories } = useCategories();

    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [sortBy, setSortBy] = useState<SortOption>({
        key: "quality",
        label: "质量评分",
        direction: "desc",
    });

    const sortOptions: SortOption[] = [
        { key: "name", label: "名称", direction: "asc" },
        { key: "stars", label: "星数", direction: "desc" },
        { key: "downloads", label: "下载量", direction: "desc" },
        { key: "quality", label: "质量评分", direction: "desc" },
        { key: "updated", label: "更新时间", direction: "desc" },
    ];

    const filteredAndSortedServers = useMemo(() => {
        if (!servers) return [];

        let filtered = servers.filter((server) => {
            // 搜索过滤
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (
                    !server.name.toLowerCase().includes(query) &&
                    !server.description.toLowerCase().includes(query) &&
                    !server.tags.some((tag) =>
                        tag.toLowerCase().includes(query)
                    )
                ) {
                    return false;
                }
            }

            // 分类过滤
            if (
                filters.category &&
                !server.category.includes(filters.category)
            ) {
                return false;
            }

            // 子分类过滤
            if (
                filters.subcategory &&
                !server.subcategory.includes(filters.subcategory)
            ) {
                return false;
            }

            // 特色/验证过滤
            if (filters.featured && !server.featured) {
                return false;
            }

            if (filters.verified && !server.verified) {
                return false;
            }

            // 质量评分过滤
            if (
                filters.qualityScore &&
                server.quality.score < filters.qualityScore
            ) {
                return false;
            }

            return true;
        });

        // 排序
        filtered.sort((a, b) => {
            let aValue: number | string;
            let bValue: number | string;

            switch (sortBy.key) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "stars":
                    aValue = a.repository.stars;
                    bValue = b.repository.stars;
                    break;
                case "downloads":
                    aValue = a.usage.downloads;
                    bValue = b.usage.downloads;
                    break;
                case "quality":
                    aValue = a.quality.score;
                    bValue = b.quality.score;
                    break;
                case "updated":
                    aValue = new Date(a.updatedAt).getTime();
                    bValue = new Date(b.updatedAt).getTime();
                    break;
                default:
                    return 0;
            }

            if (sortBy.direction === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [servers, searchQuery, filters, sortBy]);

    const ServerCard: React.FC<{ server: MCPServer }> = ({ server }) => {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                to={`/servers/${server.id}`}
                                className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                                {server.name}
                            </Link>
                            {server.verified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    已验证
                                </span>
                            )}
                            {server.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    特色
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 mb-3">
                            {server.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {server.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <Link
                            to={server.repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link
                            to={`/servers/${server.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            <span>
                                {server.repository.stars.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>
                                {server.usage.downloads.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {new Date(
                                    server.updatedAt
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>质量评分:</span>
                        <span className="font-medium text-primary-600">
                            {server.quality.score}/100
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    MCP 服务器
                </h1>
                <p className="text-lg text-gray-600">
                    发现并集成最优秀的 Model Context Protocol 服务器
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索服务器..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={`${sortBy.key}-${sortBy.direction}`}
                            onChange={(e) => {
                                const [key, direction] =
                                    e.target.value.split("-");
                                const option = sortOptions.find(
                                    (opt) => opt.key === key
                                );
                                if (option) {
                                    setSortBy({
                                        ...option,
                                        direction: direction as "asc" | "desc",
                                    });
                                }
                            }}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {sortOptions.map((option) => (
                                <option
                                    key={`${option.key}-${option.direction}`}
                                    value={`${option.key}-${option.direction}`}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ArrowUpDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="h-5 w-5" />
                        筛选
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                                showFilters ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                分类
                            </label>
                            <select
                                value={filters.category || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        category: e.target.value || undefined,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">所有分类</option>
                                {categories?.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name["zh-CN"]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quality Score Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                最低质量评分
                            </label>
                            <select
                                value={filters.qualityScore || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        qualityScore: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">任意评分</option>
                                <option value="90">90+</option>
                                <option value="80">80+</option>
                                <option value="70">70+</option>
                                <option value="60">60+</option>
                            </select>
                        </div>

                        {/* Featured Filter */}
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.featured || false}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            featured:
                                                e.target.checked || undefined,
                                        })
                                    }
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    仅显示特色服务器
                                </span>
                            </label>
                        </div>

                        {/* Verified Filter */}
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.verified || false}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            verified:
                                                e.target.checked || undefined,
                                        })
                                    }
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    仅显示已验证服务器
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                    找到 {filteredAndSortedServers.length} 个服务器
                </p>
            </div>

            {/* Server Grid */}
            {serversLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
                        >
                            <div className="h-6 bg-gray-300 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="flex gap-2 mb-4">
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex justify-between">
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAndSortedServers.map((server) => (
                        <ServerCard key={server.id} server={server} />
                    ))}
                </div>
            )}

            {!serversLoading && filteredAndSortedServers.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        未找到匹配的服务器
                    </h3>
                    <p className="text-gray-600">尝试调整搜索条件或筛选选项</p>
                </div>
            )}
        </div>
    );
};

export default Servers;
