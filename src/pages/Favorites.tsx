import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Star,
    Download,
    Calendar,
    ArrowRight,
    Heart,
    Folder,
    Database,
    MessageCircle,
    Bot,
    FileText,
    Cloud,
    CloudOff,
    AlertCircle,
    RefreshCw,
    Filter,
} from "lucide-react";
import { useServers, useCategories } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import { FavoriteButton } from "../components/FavoriteButton";
import ProgressiveEllipsis from "../components/ProgressiveEllipsis";
import { useFavoritesSync } from "../hooks/useFavoritesSync";
import type { MCPServer } from "../types";

interface ServerData extends Omit<MCPServer, 'verified'> {
    official?: boolean;
    descriptionEn?: string;
    repository: MCPServer['repository'] & {
        lastUpdate?: string;
    };
}

const Favorites: React.FC = () => {
    const { data: servers, isLoading, error } = useServers();
    const { data: categories } = useCategories();
    const { favorites } = useAppStore();
    const syncData = useFavoritesSync();
    const { isOnline, favoritesError, retrySync, isSignedIn } = syncData;
    
    // Filter state
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // 使用ref跟踪favorites的实际内容，避免Set对象引用变化导致的重渲染
    const favoritesContentRef = useRef<string>('');
    const stableFavoritesRef = useRef<Set<string>>(new Set());
    
    // 只在favorites内容实际变化时更新
    const currentContent = Array.from(favorites).sort().join(',');
    if (currentContent !== favoritesContentRef.current) {
        favoritesContentRef.current = currentContent;
        stableFavoritesRef.current = new Set(favorites);
    }

    const favoriteServers = useMemo(() => {
        if (!servers) return [];
        let filtered = servers.filter((server) => stableFavoritesRef.current.has(server.id));
        
        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((server) => selectedCategories.includes(server.category));
        }
        
        return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [servers, currentContent, selectedCategories]);
    
    // Count servers per category from favorites
    const categoryCounts = useMemo(() => {
        if (!servers || !categories) return {};
        
        const counts: Record<string, number> = {};
        servers.forEach(server => {
            if (stableFavoritesRef.current.has(server.id)) {
                counts[server.category] = (counts[server.category] || 0) + 1;
            }
        });
        return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [servers, categories, currentContent]);

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

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
        }
        return num.toString();
    };

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

    const ServerCard: React.FC<{ server: ServerData }> = ({ server }) => (
        <Link to={`/servers/${server.slug}`}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover-lift cursor-pointer"
                data-testid="favorite-server-card"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center min-w-0 flex-1 mr-4">
                        <div className={`w-10 h-10 ${getServerIconBg(server)} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                            {getServerIcon(server)}
                        </div>
                        <div className="min-w-0 flex-1">
                            {server.owner && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                    @{server.owner}
                                </div>
                            )}
                            <h3 className="server-name text-lg font-semibold text-gray-900 dark:text-white" data-testid="server-name">
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
                        <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-gray-900 dark:text-white font-medium text-sm">
                                {(server.quality.score / 20).toFixed(1)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(server.repository.stars)} stars
                        </div>
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
                        <span className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {formatNumber(server.usage.downloads)}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatTimeAgo(server.repository.lastUpdate || server.repository.lastUpdated || "")}
                        </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center">
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                </div>
            </div>
        </Link>
    );

    if (isLoading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
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
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error loading favorites</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load server data. Please try again later.</p>
                    <div className="text-red-500 mb-4">Error: {String(error)}</div>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
                            My Favorites
                        </h1>
                        
                        {/* Sync Status */}
                        {isSignedIn && (
                            <div className="flex items-center gap-3">
                                {favoritesError ? (
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Sync failed</span>
                                        <button
                                            onClick={retrySync}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`flex items-center gap-2 text-sm ${
                                        isOnline 
                                            ? "text-green-600 dark:text-green-400" 
                                            : "text-amber-600 dark:text-amber-400"
                                    }`}>
                                        {isOnline ? (
                                            <>
                                                <Cloud className="h-4 w-4" />
                                                <span>Synced</span>
                                            </>
                                        ) : (
                                            <>
                                                <CloudOff className="h-4 w-4" />
                                                <span>Local only</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Your saved MCP servers for quick access
                        <span className="block text-sm mt-1">
                            {selectedCategories.length > 0 ? (
                                <>
                                    Showing {favoriteServers.length} of{' '}
                                    {servers?.filter(s => stableFavoritesRef.current.has(s.id)).length || 0}{' '}
                                    favorite server{favoriteServers.length !== 1 ? 's' : ''}
                                </>
                            ) : (
                                <>
                                    {favoriteServers.length} server{favoriteServers.length !== 1 ? 's' : ''} in your favorites
                                </>
                            )}
                            {!isSignedIn && (
                                <span className="text-amber-600 dark:text-amber-400 ml-2">
                                    • Sign in to sync across devices
                                </span>
                            )}
                        </span>
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar with category filters */}
                    {categories && categories.length > 0 && (
                        <div className="lg:w-1/4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Filter className="h-5 w-5 mr-2" />
                                        Filter by Category
                                    </h3>
                                    {selectedCategories.length > 0 && (
                                        <button
                                            onClick={() => setSelectedCategories([])}
                                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {categories.map((category) => {
                                        const categoryCount = categoryCounts[category.id] || 0;
                                        if (categoryCount === 0) return null;

                                        return (
                                            <label key={category.id} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1.5 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCategories([...selectedCategories, category.id]);
                                                        } else {
                                                            setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 mr-3"
                                                />
                                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                                    {category.name.en}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({categoryCount})
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main content */}
                    <div className={categories && categories.length > 0 ? "lg:flex-1" : "w-full"}>
                        {favoriteServers.length > 0 ? (
                            <div className={`grid grid-cols-1 gap-6 ${
                                categories && categories.length > 0 
                                    ? "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" 
                                    : "md:grid-cols-2 xl:grid-cols-3"
                            }`}>
                                {favoriteServers.map((server) => (
                                    <ServerCard key={server.id} server={server as ServerData} />
                                ))}
                            </div>
                        ) : (
                            selectedCategories.length > 0 ? (
                                <div className="text-center py-12">
                                    <div className="max-w-md mx-auto">
                                        <Filter className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No favorites in selected categories
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Try selecting different categories or clear the filter
                                        </p>
                                        <button
                                            onClick={() => setSelectedCategories([])}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="max-w-md mx-auto">
                                        <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No favorites yet
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Start exploring MCP servers and save your favorites for quick access
                                        </p>
                                        <Link
                                            to="/servers"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Browse Servers
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Favorites;