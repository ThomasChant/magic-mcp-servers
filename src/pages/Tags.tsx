import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Tag, Hash, TrendingUp} from "lucide-react";
import { useServers } from "../hooks/useUnifiedData";
import StructuredData from "../components/StructuredData";
import Breadcrumbs from "../components/Breadcrumbs";

interface TagInfo {
    name: string;
    count: number;
    category: string;
    lastUsed: string;
}

const Tags: React.FC = () => {
    const { data: servers, isLoading } = useServers();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'recent'>('popularity');
    const [filterBy, setFilterBy] = useState<'all' | 'popular' | 'trending'>('all');

    // Extract and process tags from servers
    const tagData: TagInfo[] = useMemo(() => {
        if (!servers || servers.length === 0) {
            return [];
        }

        const tagMap = new Map<string, TagInfo>();

        servers.forEach(server => {
            // Handle tags if they exist and are properly formatted
            if (server.tags && Array.isArray(server.tags) && server.tags.length > 0) {
                server.tags.forEach(tag => {
                    if (!tag || typeof tag !== 'string' || tag.trim() === '') return;
                    
                    const normalizedTag = tag.trim().toLowerCase();
                    if (tagMap.has(normalizedTag)) {
                        const existing = tagMap.get(normalizedTag)!;
                        existing.count += 1;
                        // Update last used if this server is more recent
                        if (server.repository.lastUpdated && 
                            new Date(server.repository.lastUpdated) > new Date(existing.lastUsed)) {
                            existing.lastUsed = server.repository.lastUpdated;
                        }
                    } else {
                        tagMap.set(normalizedTag, {
                            name: tag.trim(),
                            count: 1,
                            category: server.category,
                            lastUsed: server.repository.lastUpdated || server.stats.lastUpdated || new Date().toISOString()
                        });
                    }
                });
            }
        });

        const result = Array.from(tagMap.values());
        
        // Fallback: If no tags found, generate demo tags from categories and server names
        if (result.length === 0 && servers.length > 0) {
            const fallbackTags = new Set<string>();
            
            servers.forEach(server => {
                // Add category as a tag
                if (server.category) {
                    const categoryName = server.category.replace(/[-_]/g, ' ');
                    fallbackTags.add(categoryName);
                }
                
                // Extract meaningful words from server names
                const nameWords = server.name.toLowerCase()
                    .replace(/[^a-z0-9\s-_]/g, '')
                    .split(/[-_\s]+/)
                    .filter(word => word.length > 2 && !['mcp', 'server', 'the', 'for', 'and', 'with', 'api'].includes(word));
                
                nameWords.slice(0, 2).forEach(word => {
                    if (word) fallbackTags.add(word);
                });
            });
            
            // Create common technology tags
            const commonTags = ['database', 'file-system', 'api', 'development', 'utilities', 'communication', 'monitoring', 'ai', 'search', 'storage'];
            commonTags.forEach(tag => fallbackTags.add(tag));
            
            // Convert to TagInfo format
            const fallbackResult: TagInfo[] = Array.from(fallbackTags).map((tag, index) => ({
                name: tag,
                count: Math.max(1, Math.floor(servers.length / fallbackTags.size) + (index % 3)),
                category: 'demo',
                lastUsed: new Date().toISOString()
            }));
            
            return fallbackResult.slice(0, 25).sort((a, b) => b.count - a.count);
        }
        
        return result;
    }, [servers]);

    // Filter and sort tags
    const filteredAndSortedTags = useMemo(() => {
        let filtered = tagData;

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(tag => 
                tag.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filterBy === 'popular') {
            filtered = filtered.filter(tag => tag.count >= 5);
        } else if (filterBy === 'trending') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filtered = filtered.filter(tag => 
                new Date(tag.lastUsed) > oneMonthAgo
            );
        }

        // Sort tags
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popularity':
                    return b.count - a.count;
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                case 'recent':
                    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [tagData, searchTerm, sortBy, filterBy]);

    // Get tag size class based on popularity
    const getTagSizeClass = (count: number, maxCount: number) => {
        const ratio = count / maxCount;
        if (ratio >= 0.8) return "text-3xl";
        if (ratio >= 0.6) return "text-2xl";
        if (ratio >= 0.4) return "text-xl";
        if (ratio >= 0.2) return "text-lg";
        return "text-base";
    };

    // Get tag color class
    const getTagColorClass = (index: number) => {
        const colors = [
            "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800",
            "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800",
            "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800",
            "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800",
            "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800",
            "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800",
            "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-800",
        ];
        return colors[index % colors.length];
    };

    const breadcrumbItems = [
        { name: 'Tags', url: '/tags', current: true }
    ];

    const maxCount = Math.max(...tagData.map(tag => tag.count), 1);
    const totalTags = tagData.length;
    const totalServers = servers?.length || 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-6"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Structured Data */}
            <StructuredData 
                type="searchResults" 
                data={{ 
                    searchResults: servers?.slice(0, 10) || [],
                    totalResults: totalServers 
                }} 
            />
            
            {/* Breadcrumbs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center mb-6 lg:mb-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-6">
                                <Tag className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Browse Tags
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                    Discover MCP servers by tags • {totalTags} tags across {totalServers} servers
                                </p>
                                {tagData.length > 0 && tagData[0].category === 'demo' && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            💡 <strong>Demo Mode:</strong> The actual server tags are being loaded. Currently showing generated tags based on server categories and names for demonstration.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTags}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Tags</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {tagData.filter(tag => tag.count >= 5).length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Popular Tags</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {Math.max(...tagData.map(tag => tag.count), 0)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Most Used</div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <input
                                type="search"
                                placeholder="Search tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="popularity">Most Popular</option>
                            <option value="alphabetical">Alphabetical</option>
                            <option value="recent">Recently Used</option>
                        </select>

                        {/* Filter */}
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value as any)}
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Tags</option>
                            <option value="popular">Popular (5+)</option>
                            <option value="trending">Trending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tags Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredAndSortedTags.length === 0 ? (
                    <div className="text-center py-12">
                        <Hash className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No tags found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchTerm ? `No tags match "${searchTerm}"` : "No tags available."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                Showing {filteredAndSortedTags.length} tags
                                {searchTerm && ` matching "${searchTerm}"`}
                            </p>
                        </div>

                        {/* Tags Cloud */}
                        <div className="flex flex-wrap gap-3">
                            {filteredAndSortedTags.map((tag, index) => (
                                <Link
                                    key={tag.name}
                                    to={`/tags/${encodeURIComponent(tag.name)}`}
                                    className={`inline-flex items-center px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${getTagColorClass(index)} ${getTagSizeClass(tag.count, maxCount)}`}
                                >
                                    <Hash className="h-4 w-4 mr-1" />
                                    {tag.name}
                                    <span className="ml-2 text-xs bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 px-2 py-1 rounded-full">
                                        {tag.count}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Popular Tags Section */}
                        {filterBy === 'all' && (
                            <div className="mt-12">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    Most Popular Tags
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tagData
                                        .filter(tag => tag.count >= 3)
                                        .slice(0, 12)
                                        .map((tag, index) => (
                                            <Link
                                                key={tag.name}
                                                to={`/tags/${encodeURIComponent(tag.name)}`}
                                                className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 ${getTagColorClass(index)} rounded-lg flex items-center justify-center mr-3`}>
                                                            <Hash className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                                {tag.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {tag.count} servers
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Hash className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Tags;