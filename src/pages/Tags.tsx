import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Tag, Hash, TrendingUp, Filter, SortAsc, Sparkles, Star, Flame} from "lucide-react";
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

    // Get tag size class based on popularity with enhanced styling
    const getTagSizeClass = (count: number, maxCount: number) => {
        const ratio = count / maxCount;
        if (ratio >= 0.8) return "text-xl px-6 py-3 shadow-lg";
        if (ratio >= 0.6) return "text-lg px-5 py-2.5 shadow-md";
        if (ratio >= 0.4) return "text-base px-4 py-2 shadow-sm";
        if (ratio >= 0.2) return "text-sm px-3 py-1.5 shadow-sm";
        return "text-xs px-2 py-1";
    };

    // Get enhanced tag color class with gradients and better effects
    const getTagColorClass = (index: number, count: number, maxCount: number) => {
        const ratio = count / maxCount;
        const isPopular = ratio >= 0.6;
        
        const baseColors = [
            // Blue gradient
            isPopular 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-500/20" 
                : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 border-blue-200 dark:border-blue-700",
            // Green gradient
            isPopular 
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 border-emerald-500/20" 
                : "bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 text-emerald-700 dark:text-emerald-300 hover:from-emerald-100 hover:to-green-200 dark:hover:from-emerald-900/50 dark:hover:to-green-800/50 border-emerald-200 dark:border-emerald-700",
            // Purple gradient
            isPopular 
                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 border-purple-500/20" 
                : "bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-violet-200 dark:hover:from-purple-900/50 dark:hover:to-violet-800/50 border-purple-200 dark:border-purple-700",
            // Orange gradient
            isPopular 
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 border-orange-500/20" 
                : "bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 text-orange-700 dark:text-orange-300 hover:from-orange-100 hover:to-amber-200 dark:hover:from-orange-900/50 dark:hover:to-amber-800/50 border-orange-200 dark:border-orange-700",
            // Pink gradient
            isPopular 
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 border-pink-500/20" 
                : "bg-gradient-to-r from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 text-pink-700 dark:text-pink-300 hover:from-pink-100 hover:to-rose-200 dark:hover:from-pink-900/50 dark:hover:to-rose-800/50 border-pink-200 dark:border-pink-700",
            // Cyan gradient
            isPopular 
                ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 border-cyan-500/20" 
                : "bg-gradient-to-r from-cyan-50 to-teal-100 dark:from-cyan-900/30 dark:to-teal-800/30 text-cyan-700 dark:text-cyan-300 hover:from-cyan-100 hover:to-teal-200 dark:hover:from-cyan-900/50 dark:hover:to-teal-800/50 border-cyan-200 dark:border-cyan-700",
            // Indigo gradient
            isPopular 
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 border-indigo-500/20" 
                : "bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-800/30 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-blue-200 dark:hover:from-indigo-900/50 dark:hover:to-blue-800/50 border-indigo-200 dark:border-indigo-700",
        ];
        return baseColors[index % baseColors.length];
    };

    // Get tag icon based on count
    const getTagIcon = (count: number, maxCount: number) => {
        const ratio = count / maxCount;
        if (ratio >= 0.8) return Flame;
        if (ratio >= 0.6) return Star;
        if (ratio >= 0.4) return Sparkles;
        return Hash;
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
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center mb-8 lg:mb-0">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mr-6 shadow-xl transform rotate-3">
                                    <Tag className="h-10 w-10 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                                    <Sparkles className="h-3 w-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                                    Browse Tags
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                    Discover MCP servers by tags • <span className="font-semibold text-blue-600 dark:text-blue-400">{totalTags}</span> tags across <span className="font-semibold text-purple-600 dark:text-purple-400">{totalServers}</span> servers
                                </p>
                                {tagData.length > 0 && tagData[0].category === 'demo' && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl backdrop-blur-sm">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                                            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                            <strong>Demo Mode:</strong> The actual server tags are being loaded. Currently showing generated tags based on server categories and names for demonstration.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalTags}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Total Tags</div>
                            </div>
                            <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                    {tagData.filter(tag => tag.count >= 5).length}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Popular Tags</div>
                            </div>
                            <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {Math.max(...tagData.map(tag => tag.count), 0)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Most Used</div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search and Filters */}
                    <div className="mt-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            {/* Search */}
                            <div className="relative flex-1 w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type="search"
                                    placeholder="Search tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                                />
                            </div>

                            {/* Filters Container */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                {/* Sort */}
                                <div className="relative">
                                    <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'popularity' | 'alphabetical' | 'recent')}
                                        className="pl-10 pr-8 py-4 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer min-w-[160px]"
                                    >
                                        <option value="popularity">Most Popular</option>
                                        <option value="alphabetical">Alphabetical</option>
                                        <option value="recent">Recently Used</option>
                                    </select>
                                </div>

                                {/* Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    <select
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value as 'all' | 'popular' | 'trending')}
                                        className="pl-10 pr-8 py-4 bg-white/90 dark:bg-gray-700/90 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer min-w-[140px]"
                                    >
                                        <option value="all">All Tags</option>
                                        <option value="popular">Popular (5+)</option>
                                        <option value="trending">Trending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tags Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredAndSortedTags.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative inline-block mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                                <Hash className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Search className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No tags found
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            {searchTerm 
                                ? `No tags match "${searchTerm}". Try a different search term or browse all available tags.` 
                                : "No tags are currently available. Tags will appear here as servers are categorized."
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                                    Showing <span className="font-bold text-blue-600 dark:text-blue-400 mx-1">{filteredAndSortedTags.length}</span> tags
                                    {searchTerm && (
                                        <>
                                            <span className="mx-1">matching</span>
                                            <span className="font-bold text-purple-600 dark:text-purple-400">"{searchTerm}"</span>
                                        </>
                                    )}
                                </p>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Live results
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Tags Cloud */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            {filteredAndSortedTags.map((tag, index) => {
                                const TagIcon = getTagIcon(tag.count, maxCount);
                                const ratio = tag.count / maxCount;
                                return (
                                    <Link
                                        key={tag.name}
                                        to={`/tags/${encodeURIComponent(tag.name)}`}
                                        className={`group inline-flex items-center font-medium rounded-2xl border transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95 ${getTagColorClass(index, tag.count, maxCount)} ${getTagSizeClass(tag.count, maxCount)}`}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <TagIcon className={`${ratio >= 0.6 ? 'h-5 w-5' : 'h-4 w-4'} mr-2 group-hover:rotate-12 transition-transform duration-300`} />
                                        <span className="font-semibold">{tag.name}</span>
                                        <span className={`ml-2 ${ratio >= 0.6 ? 'text-white/80' : 'text-current opacity-70'} font-bold px-2 py-0.5 rounded-full text-xs ${ratio >= 0.6 ? 'bg-white/20' : 'bg-current/10'} min-w-[24px] text-center`}>
                                            {tag.count}
                                        </span>
                                        {ratio >= 0.8 && (
                                            <div className="ml-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Enhanced Popular Tags Section */}
                        {filterBy === 'all' && (
                            <div className="mt-16">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                                        Most Popular Tags
                                    </h2>
                                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                                        <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                                        <span>Tags with 3+ servers</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {tagData
                                        .filter(tag => tag.count >= 3)
                                        .slice(0, 12)
                                        .map((tag, index) => {
                                            const TagIcon = getTagIcon(tag.count, maxCount);
                                            const ratio = tag.count / maxCount;
                                            return (
                                                <Link
                                                    key={tag.name}
                                                    to={`/tags/${encodeURIComponent(tag.name)}`}
                                                    className="group relative p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                                                    style={{
                                                        animationDelay: `${index * 100}ms`,
                                                    }}
                                                >
                                                    {/* Background gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    
                                                    <div className="relative flex items-center justify-between">
                                                        <div className="flex items-center flex-1 min-w-0">
                                                            <div className={`w-12 h-12 ${getTagColorClass(index, tag.count, maxCount)} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                                                <TagIcon className="h-6 w-6" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate text-lg">
                                                                    {tag.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{tag.count}</span>
                                                                    <span className="ml-1">servers</span>
                                                                    {ratio >= 0.8 && (
                                                                        <Flame className="h-3 w-3 ml-2 text-orange-500 animate-pulse" />
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                                                            <Hash className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Popularity indicator */}
                                                    {ratio >= 0.6 && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                                            <Star className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
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