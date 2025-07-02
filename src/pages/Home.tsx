import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Star,
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
    Rocket,
    Book,
} from "lucide-react";
import { useServersPaginated, useCategories, useServerStats } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import ParticleHero from "../components/ParticleHero";
import { useTopStarServers, type StarServer } from "../hooks/useTopStarServers";
import type { MCPServer } from "../types";
import ProgressiveEllipsis from "../components/ProgressiveEllipsis";
import { FavoriteButton } from "../components/FavoriteButton";

// Extended interface for JSON data structure
interface ServerData extends Omit<MCPServer, 'verified'> {
    official?: boolean;
    descriptionEn?: string;
    repository: MCPServer['repository'] & {
        lastUpdate?: string;
    };
}

const Home: React.FC = () => {
    // State management
    const [sidebarSearch, setSidebarSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("stars");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [quickFilter, setQuickFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        categories: [] as string[],
        platforms: [] as string[],
        languages: [] as string[],
        status: [] as string[],
    });

    // Get app store state
    const { searchQuery, setSearchQuery } = useAppStore();
    
    // Get data for hero section
    const { data: serverStats } = useServerStats();
    const { data: topStarServers } = useTopStarServers(300);

    // Use server stats for statistics display with fallbacks
    const statistics = useMemo(() => {
        if (serverStats) {
            return {
                totalServers: serverStats.totalServers,
                averageStars: serverStats.averageStars || 0,
                uniqueCategories: serverStats.uniqueCategories,
                activeRepos: serverStats.activeRepos || 0
            };
        }
        
        return {
            totalServers: 0,
            averageStars: 0,
            uniqueCategories: 0,
            activeRepos: 0
        };
    }, [serverStats]);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(sidebarSearch);
        }, 1000); // 500ms delay

        return () => clearTimeout(timer);
    }, [sidebarSearch]);

    // Get real categories with server counts
    const { data: categories } = useCategories();

    // Build filters for the hook
    const hookFilters = useMemo(() => {
        const result: Record<string, unknown> = {};
        
        if (debouncedSearch.trim()) {
            result.search = debouncedSearch.trim();
        }
        
        if (filters.categories.length > 0) {
            result.category = filters.categories[0]; // For simplicity, use first category
        }
        
        if (quickFilter === "featured") {
            result.featured = true;
        } else if (quickFilter === "verified") {
            result.verified = true;
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
        12, // items per page
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
        { id: "python", name: "Python" },
        { id: "typescript", name: "TypeScript" },
        { id: "javascript", name: "JavaScript" },
        { id: "go", name: "Go" },
        { id: "rust", name: "Rust" },
        { id: "java", name: "Java" },
    ];

    const statusFilters = [
        { id: "official", name: "Official" },
        { id: "featured", name: "Featured" },
        { id: "verified", name: "Verified" },
        { id: "popular", name: "Popular" },
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

    // Format numbers
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
        }
        return num.toString();
    };

    // Format time ago - matching demo format exactly
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return "today";
        if (diffInDays === 1) return "1d ago";
        if (diffInDays === 2) return "2d ago";
        if (diffInDays === 3) return "3d ago";
        if (diffInDays === 5) return "5d ago";
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInDays < 14) return "1w ago";
        return `${Math.floor(diffInDays / 7)}w ago`;
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
        <Link to={`/servers/${server.slug}`}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover-lift cursor-pointer"
                data-testid="server-card"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center min-w-0 flex-1 mr-4">
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
                            <h3
                                className="server-name text-lg font-semibold text-gray-900 dark:text-white"
                                data-testid="server-name"
                            >
                                <ProgressiveEllipsis
                                    text={server.name}
                                    maxLength={15}
                                    preserveStart={6}
                                    preserveEnd={4}
                                />
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                                {server.official && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                        Official
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                                        Featured
                                    </span>
                                )}
                                {server.usage.downloads >= 10000 && (
                                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full">
                                        Popular
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-2">
                        <FavoriteButton
                            serverId={server.id}
                            size="sm"
                            className="mb-2"
                        />
                    </div>
                </div>

                <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {server.descriptionEn || server.description["zh-CN"]}
                </p>

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

                <div className="flex items-center justify-between">
                    <div className="server-stats flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />{" "}
                            {formatNumber(server.repository.stars)} stars
                        </div>
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3" />
                            {formatTimeAgo(
                                server.repository.lastUpdate ||
                                    server.repository.lastUpdated ||
                                    ""
                            )}
                        </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs flex items-center">
                        View Details
                        <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    );

    // Server List Item Component
    const ServerListItem: React.FC<{ server: ServerData }> = ({ server }) => (
        <Link to={`/servers/${server.slug}`}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover-lift cursor-pointer mb-4"
                data-testid="server-list-item"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                        <div
                            className={`w-12 h-12 ${getServerIconBg(
                                server
                            )} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}
                        >
                            {getServerIcon(server)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3
                                    className="server-name text-lg font-semibold text-gray-900 dark:text-white"
                                    data-testid="server-name"
                                >
                                    <ProgressiveEllipsis
                                        text={server.name}
                                        maxLength={25}
                                        preserveStart={10}
                                        preserveEnd={8}
                                    />
                                </h3>
                                {server.owner && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        @{server.owner}
                                    </span>
                                )}
                                <div className="flex items-center space-x-2">
                                    {server.official && (
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                            Official
                                        </span>
                                    )}
                                    {server.featured && (
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                                            Featured
                                        </span>
                                    )}
                                    {server.usage.downloads >= 10000 && (
                                        <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full">
                                            Popular
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                                {server.descriptionEn ||
                                    server.description["zh-CN"]}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <Star className="mr-1.5 h-4 w-4 fill-current text-yellow-500" />{" "}
                                    {formatNumber(server.repository.stars)}{" "}
                                    stars
                                </div>
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatTimeAgo(
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
                    </div>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                        <FavoriteButton serverId={server.id} size="sm" />
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center">
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );

    if (serversLoading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen" data-testid="loading">
                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-1/4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="space-y-4">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:w-3/4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(9)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                                            <div>
                                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden cosmic-bg h-[80vh] flex items-center" style={{ isolation: 'isolate' }}>
                <ParticleHero 
                    servers={(topStarServers || []) as (MCPServer | StarServer)[]}
                    searchQuery={searchQuery}
                    maxStars={300}
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30 pointer-events-none" style={{ zIndex: 5 }}></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 pointer-events-none" style={{ zIndex: 10 }}>
                    <div className="text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10">
                            Discover the Best
                            <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">MCP Servers</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto relative z-10">
                            Your gateway to enhanced AI capabilities. Explore, integrate, and supercharge your applications with Model Context Protocol servers.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8 relative z-10 pointer-events-auto">
                            <div className="relative rounded-xl p-2" style={{
                                background: 'rgba(100, 255, 218, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(100, 255, 218, 0.3)',
                                boxShadow: '0 8px 32px rgba(100, 255, 218, 0.1)'
                            }}>
                                <input
                                    type="search"
                                    placeholder="Search for MCP servers, categories, or features..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg border-0 text-lg"
                                    data-testid="home-search-input"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
                                    <Search className="h-4 w-4 mr-2 inline" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative z-10 pointer-events-auto">
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(100, 255, 218, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(100, 255, 218, 0.3)',
                                boxShadow: '0 8px 32px rgba(100, 255, 218, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                                    {statistics.totalServers > 0 ? statistics.totalServers.toLocaleString() : '...'}
                                </div>
                                <div className="text-gray-300">MCP Servers</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(147, 51, 234, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">
                                    {statistics.uniqueCategories > 0 ? statistics.uniqueCategories : '...'}
                                </div>
                                <div className="text-gray-300">Categories</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-300 to-white bg-clip-text text-transparent">
                                    {statistics.averageStars > 0 
                                        ? statistics.averageStars >= 1000
                                            ? `${Math.floor(statistics.averageStars / 1000)}K`
                                            : statistics.averageStars.toLocaleString()
                                        : '...'
                                    }
                                </div>
                                <div className="text-gray-300">Avg Stars</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(249, 115, 22, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-white bg-clip-text text-transparent">
                                    {statistics.activeRepos > 0 ? statistics.activeRepos.toLocaleString() : '...'}
                                </div>
                                <div className="text-gray-300">Active Repos</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servers Section */}
            <div className="bg-gray-50 dark:bg-gray-900">
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
                                <option value="stars-desc">Sort by Stars (High to Low)</option>
                                <option value="stars-asc">Sort by Stars (Low to High)</option>
                                <option value="downloads-desc">Sort by Downloads (High to Low)</option>
                                <option value="downloads-asc">Sort by Downloads (Low to High)</option>
                                <option value="quality_score-desc">Sort by Quality (High to Low)</option>
                                <option value="quality_score-asc">Sort by Quality (Low to High)</option>
                                <option value="name-asc">Sort by Name (A to Z)</option>
                                <option value="name-desc">Sort by Name (Z to A)</option>
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

                            {/* Status Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Status
                                </label>
                                <div className="space-y-2">
                                    {statusFilters.map((status) => (
                                        <label key={status.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.status.includes(status.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({
                                                            ...filters,
                                                            status: [...filters.status, status.id]
                                                        });
                                                    } else {
                                                        setFilters({
                                                            ...filters,
                                                            status: filters.status.filter(s => s !== status.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                {status.name}
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
                                                ? "active"
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

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 dark:bg-blue-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Enhance Your AI Applications?
                    </h2>
                    <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-3xl mx-auto">
                        Join thousands of developers using MCP servers to build more capable and intelligent applications.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/categories"
                            className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-800 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors"
                        >
                            <Rocket className="mr-2 h-5 w-5" />
                            Browse Categories
                        </Link>
                        <Link
                            to="/docs"
                            className="inline-flex items-center px-8 py-4 border-2 border-white dark:border-blue-200 text-white dark:text-blue-200 font-medium rounded-lg hover:bg-white dark:hover:bg-blue-200 hover:text-blue-600 dark:hover:text-blue-800 transition-colors"
                        >
                            <Book className="mr-2 h-5 w-5" />
                            Read Documentation
                        </Link>
                    </div>
                </div>
            </section>
            </div>
        </div>
    );
};

export default Home;