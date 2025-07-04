import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ServerCard, ServerListItem } from "../components/ServerCard";
import {
    ArrowLeft,
    Search,
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    Tag,
} from "lucide-react";
import { useSearchServersPaginated } from "../hooks/useUnifiedData";
import type { SortOption } from "../types";
const TagDetail: React.FC = () => {
    const { tag } = useParams<{ tag: string }>();
    const decodedTag = decodeURIComponent(tag || '');

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>({
        key: "stars",
        label: "Quality Score",
        direction: "desc",
    });
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);

    // Search for servers with the specific tag
    const { 
        data: paginatedResult, 
        isLoading: serversLoading 
    } = useSearchServersPaginated(
        `tag:${decodedTag}${searchQuery ? ` ${searchQuery}` : ''}`,
        currentPage,
        12, // items per page
        sortBy.key,
        sortBy.direction
    );

    const servers = paginatedResult?.data || [];
    const totalServers = paginatedResult?.total || 0;
    const hasNextPage = paginatedResult?.hasNextPage || false;
    const hasPrevPage = currentPage > 1;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        to="/servers"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Servers
                    </Link>

                    {/* Tag Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center mb-6 lg:mb-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-6">
                                <Tag className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        #{decodedTag}
                                    </h1>
                                    <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                        {totalServers} servers
                                    </span>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Servers tagged with "{decodedTag}"
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="Search within tag..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </div>

                            {/* View Mode */}
                            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${
                                        viewMode === "grid"
                                            ? "bg-primary-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 ${
                                        viewMode === "list"
                                            ? "bg-primary-600 text-white"
                                            : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {serversLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading servers...</p>
                    </div>
                ) : servers.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No servers found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            No servers match the tag "{decodedTag}"{searchQuery && " and your search criteria"}.
                        </p>
                        <Link
                            to="/servers"
                            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                        >
                            Browse All Servers
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Found {totalServers} servers with tag "{decodedTag}"
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                            <select
                                value={`${sortBy.key}-${sortBy.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortBy({
                                        key: key as 'quality' | 'stars' | 'lastUpdated' | 'name',
                                        label: key,
                                        direction: direction as 'asc' | 'desc'
                                    });
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="quality-desc">Quality Score</option>
                                <option value="stars-desc">Most Stars</option>
                                <option value="stars-asc">Least Stars</option>
                                <option value="lastUpdated-desc">Recently Updated</option>
                                <option value="lastUpdated-asc">Oldest Updated</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                            </select>
                        </div>

                        {/* Servers Grid/List */}
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {servers.map((server) => (
                                    <ServerCard key={server.id} server={server} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 mb-8">
                                {servers.map((server) => (
                                    <ServerListItem key={server.id} server={server} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {(hasPrevPage || hasNextPage) && (
                            <div className="flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={!hasPrevPage}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        hasPrevPage
                                            ? "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={!hasNextPage}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        hasNextPage
                                            ? "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TagDetail;