import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    Heart,
    Cloud,
    CloudOff,
    AlertCircle,
    RefreshCw,
    Filter,
    Grid3X3,
    List,
} from "lucide-react";
import { useServers, useCategories } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import { ServerCard, ServerListItem } from "../components/ServerCard";
import { BatchScoreProvider } from "../components/BatchScoreProvider";
import { BatchUserVoteProvider } from "../components/BatchUserVoteProvider";
import { useFavoritesSync } from "../hooks/useFavoritesSync";
import type { MCPServer } from "../types";

interface ServerData extends Omit<MCPServer, "verified"> {
    official?: boolean;
    descriptionEn?: string;
    repository: MCPServer["repository"] & {
        lastUpdate?: string;
    };
}

// Pure CSR Favorites component
const Favorites: React.FC = () => {
    const { t } = useTranslation(["favorites", "common"]);
    const { data: servers, isLoading, error } = useServers();
    const { data: categories } = useCategories();
    const { favorites, favoriteViewMode, setFavoriteViewMode } = useAppStore();

    // Get sync data for cloud sync functionality (safe version that doesn't require ClerkProvider)
    const syncStatus = useFavoritesSync();
    const { isOnline, favoritesError, retrySync, isSignedIn } = syncStatus;

    // Filter state
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // 使用ref跟踪favorites的实际内容，避免Set对象引用变化导致的重渲染
    const favoritesContentRef = useRef<string>("");
    const stableFavoritesRef = useRef<Set<string>>(new Set());

    // 只在favorites内容实际变化时更新
    const currentContent = Array.from(favorites).sort().join(",");
    if (currentContent !== favoritesContentRef.current) {
        favoritesContentRef.current = currentContent;
        stableFavoritesRef.current = new Set(favorites);
    }

    const favoriteServers = useMemo(() => {
        if (!servers) return [];
        let filtered = servers.filter((server) =>
            stableFavoritesRef.current.has(server.id)
        );

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((server) =>
                selectedCategories.includes(server.category)
            );
        }

        return filtered;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [servers, currentContent, selectedCategories]);

    // Extract server IDs for batch score fetching
    const favoriteServerIds = useMemo(
        () => favoriteServers.map((server) => server.id),
        [favoriteServers]
    );

    // Count servers per category from favorites
    const categoryCounts = useMemo(() => {
        if (!servers || !categories) return {};

        const counts: Record<string, number> = {};
        servers.forEach((server) => {
            if (stableFavoritesRef.current.has(server.id)) {
                counts[server.category] = (counts[server.category] || 0) + 1;
            }
        });
        return counts;
    }, [servers, categories, currentContent]);

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {t("error")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {t("errorMessage")}
                    </p>
                    <div className="text-red-500 mb-4">
                        {t("error")}: {String(error)}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {t("retry")}
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
                            {t("title")}
                        </h1>

                        <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("view")}
                                </span>
                                <button
                                    onClick={() => setFavoriteViewMode("grid")}
                                    className={`p-2 rounded-md ${
                                        favoriteViewMode === "grid"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setFavoriteViewMode("list")}
                                    className={`p-2 rounded-md ${
                                        favoriteViewMode === "list"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Sync Status */}
                            <div className="flex items-center gap-3">
                                {favoritesError ? (
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{t("syncFailed")}</span>
                                        <button
                                            onClick={retrySync}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 rounded hover:bg-red-200 dark:hover:bg-red-800"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            {t("retry")}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        {isOnline ? (
                                            <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <CloudOff className="h-4 w-4 text-gray-400" />
                                        )}
                                        <span>
                                            {isOnline
                                                ? t("synced")
                                                : t("localOnly")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {t("subtitle")}
                        <span className="block text-sm mt-1">
                            {selectedCategories.length > 0 ? (
                                <>
                                    {t("description", {
                                        count: favoriteServers.length,
                                        total:
                                            servers?.filter((s) =>
                                                stableFavoritesRef.current.has(
                                                    s.id
                                                )
                                            ).length || 0,
                                        plural:
                                            favoriteServers.length !== 1
                                                ? "s"
                                                : "",
                                    })}
                                </>
                            ) : (
                                <>
                                    {t("categoryInfo", {
                                        count: favoriteServers.length,
                                        plural:
                                            favoriteServers.length !== 1
                                                ? "s"
                                                : "",
                                    })}
                                </>
                            )}
                            {!isSignedIn && (
                                <span className="text-amber-600 dark:text-amber-400 ml-2">
                                    {t("syncStatus")}
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
                                        {t("filterByCategory")}
                                    </h3>
                                    {selectedCategories.length > 0 && (
                                        <button
                                            onClick={() =>
                                                setSelectedCategories([])
                                            }
                                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {t("clear")}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {categories.map((category) => {
                                        const categoryCount =
                                            categoryCounts[category.id] || 0;
                                        if (categoryCount === 0) return null;

                                        return (
                                            <label
                                                key={category.id}
                                                className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1.5 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(
                                                        category.id
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCategories(
                                                                [
                                                                    ...selectedCategories,
                                                                    category.id,
                                                                ]
                                                            );
                                                        } else {
                                                            setSelectedCategories(
                                                                selectedCategories.filter(
                                                                    (c) =>
                                                                        c !==
                                                                        category.id
                                                                )
                                                            );
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
                    <div
                        className={
                            categories && categories.length > 0
                                ? "lg:flex-1"
                                : "w-full"
                        }
                    >
                        {favoriteServers.length > 0 ? (
                            <BatchUserVoteProvider serverIds={favoriteServerIds}>
                                <BatchScoreProvider serverIds={favoriteServerIds}>
                                    {favoriteViewMode === "grid" ? (
                                        <div
                                            className={`grid grid-cols-1 gap-6 ${
                                                categories && categories.length > 0
                                                    ? "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                                                    : "md:grid-cols-2 xl:grid-cols-3"
                                            }`}
                                        >
                                            {favoriteServers.map((server) => (
                                                <ServerCard
                                                    key={server.slug}
                                                    server={server as ServerData}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {favoriteServers.map((server) => (
                                                <ServerListItem
                                                    key={server.slug}
                                                    server={server as ServerData}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </BatchScoreProvider>
                            </BatchUserVoteProvider>
                        ) : selectedCategories.length > 0 ? (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <Filter className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t("noFavoritesInCategory")}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {t("noFavoritesInCategoryDescription")}
                                    </p>
                                    <button
                                        onClick={() =>
                                            setSelectedCategories([])
                                        }
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {t("clearFilter")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t("noFavoritesYet")}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {t("noFavoritesYetDescription")}
                                    </p>
                                    <Link
                                        to="/servers"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {t("browseServers")}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Favorites;
