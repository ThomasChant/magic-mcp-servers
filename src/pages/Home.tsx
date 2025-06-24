import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    ArrowRight,
    Rocket,
    Book,
    Folder,
    Database,
    MessageCircle,
    Code,
    Brain,
    Activity,
    Link2,
    Briefcase,
    Shield,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import ParticleHero from "../components/ParticleHero";
import { useServers, useCategories } from "../hooks/useData";
import CategorySection from "../components/Home/CategorySection";

// Helper functions moved outside component to prevent recreation on every render
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'filesystem':
            return <Folder className="text-white w-5 h-5" />;
        case 'database':
            return <Database className="text-white w-5 h-5" />;
        case 'communication':
            return <MessageCircle className="text-white w-5 h-5" />;
        case 'development':
            return <Code className="text-white w-5 h-5" />;
        case 'api-integration':
            return <Link2 className="text-white w-5 h-5" />;
        case 'search':
            return <Search className="text-white w-5 h-5" />;
        case 'ai-ml':
            return <Brain className="text-white w-5 h-5" />;
        case 'monitoring':
            return <Activity className="text-white w-5 h-5" />;
        case 'productivity':
            return <Briefcase className="text-white w-5 h-5" />;
        case 'security':
            return <Shield className="text-white w-5 h-5" />;
        default:
            return <Code className="text-white w-5 h-5" />;
    }
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'filesystem':
            return 'bg-blue-600';
        case 'database':
            return 'bg-green-600';
        case 'communication':
            return 'bg-purple-600';
        case 'development':
            return 'bg-indigo-600';
        case 'api-integration':
            return 'bg-teal-600';
        case 'search':
            return 'bg-orange-600';
        case 'ai-ml':
            return 'bg-pink-600';
        case 'monitoring':
            return 'bg-yellow-600';
        case 'productivity':
            return 'bg-lime-600';
        case 'security':
            return 'bg-red-600';
        default:
            return 'bg-gray-600';
    }
};

const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return `${Math.ceil(diffDays / 30)}m ago`;
};

const Home: React.FC = () => {
    const { searchQuery, setSearchQuery } = useAppStore();
    const { data: allServers } = useServers();
    const { data: categories } = useCategories();
    
    // Memoize expensive calculations
    const statistics = useMemo(() => {
        // Use all servers for overall statistics, not filtered ones
        if (!allServers || allServers.length === 0) {
            return {
                totalServers: 0,
                totalDownloads: 0,
                uniqueCategories: 0,
                averageQualityScore: 90
            };
        }
        
        const totalServers = allServers.length;
        const totalDownloads = allServers.reduce((sum, server) => sum + (server.usage?.downloads || 0), 0);
        const uniqueCategories = new Set(allServers.map(server => server.category)).size;
        const averageQualityScore = Math.round(
            allServers.reduce((sum, server) => sum + (server.quality?.score || 90), 0) / allServers.length
        );
        
        return {
            totalServers,
            totalDownloads,
            uniqueCategories,
            averageQualityScore
        };
    }, [allServers]);

    // Filter servers based on search query
    const filteredServers = useMemo(() => {
        if (!allServers || !searchQuery.trim()) return allServers;
        
        const query = searchQuery.toLowerCase().trim();
        return allServers.filter(server => 
            server.name.toLowerCase().includes(query) ||
            server.description["zh-CN"].toLowerCase().includes(query) ||
            server.description.en.toLowerCase().includes(query) ||
            (server.fullDescription && server.fullDescription.toLowerCase().includes(query)) ||
            server.tags.some(tag => tag.toLowerCase().includes(query)) ||
            server.category.toLowerCase().includes(query) ||
            (server.owner && server.owner.toLowerCase().includes(query))
        );
    }, [allServers, searchQuery]);

    // Group servers by category
    const serversByCategory = useMemo(() => {
        if (!filteredServers || !categories) return {};
        
        const grouped: Record<string, typeof filteredServers> = {};
        categories.forEach(category => {
            grouped[category.id] = filteredServers.filter(server => server.category === category.id);
        });
        
        return grouped;
    }, [filteredServers, categories]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden cosmic-bg h-[80vh] flex items-center" style={{ isolation: 'isolate' }}>
                <ParticleHero 
                    servers={allServers || []}
                    searchQuery={searchQuery}
                    maxStars={200}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30" style={{ zIndex: 5 }}></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32" style={{ zIndex: 10 }}>
                    <div className="text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10">
                            Discover the Best
                            <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">MCP Servers</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto relative z-10">
                            Your gateway to enhanced AI capabilities. Explore, integrate, and supercharge your applications with Model Context Protocol servers.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8 relative z-10">
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
                                    className="w-full px-6 py-4 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg border-0 focus:ring-2 focus:ring-blue-400 text-lg"
                                    data-testid="home-search-input"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
                                    <Search className="h-4 w-4 mr-2 inline" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative z-10">
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(100, 255, 218, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(100, 255, 218, 0.3)',
                                boxShadow: '0 8px 32px rgba(100, 255, 218, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                                    {statistics.totalServers > 0 ? `${statistics.totalServers}+` : '200+'}
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
                                    {statistics.uniqueCategories > 0 ? statistics.uniqueCategories : '10'}
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
                                    {statistics.totalDownloads > 0 
                                        ? statistics.totalDownloads >= 1000 
                                            ? `${Math.floor(statistics.totalDownloads / 1000)}K+` 
                                            : `${statistics.totalDownloads}+`
                                        : '50K+'
                                    }
                                </div>
                                <div className="text-gray-300">Downloads</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(249, 115, 22, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-white bg-clip-text text-transparent">
                                    {statistics.averageQualityScore}%
                                </div>
                                <div className="text-gray-300">Quality Score</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Servers by Category Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Navigation */}
                    {categories && (
                        <div className="flex flex-wrap justify-space-between gap-4 mb-16">
                            {categories.map((category) => {
                                const categoryServers = serversByCategory[category.id] || [];
                                if (categoryServers.length === 0) return null;
                                
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            const element = document.getElementById(`category-${category.id}`);
                                            if (element) {
                                                element.scrollIntoView({ 
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }
                                        }}
                                        className="group flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer"
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${getCategoryColor(category.id)} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                                            {getCategoryIcon(category.id)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {category.name.en}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {categoryServers.length} servers
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {categories && allServers ? (
                        categories.map((category) => {
                            const categoryServers = serversByCategory[category.id] || [];
                            return (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    servers={categoryServers}
                                    getCategoryIcon={getCategoryIcon}
                                    getCategoryColor={getCategoryColor}
                                    formatLastUpdated={formatLastUpdated}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center">
                            <div className="animate-pulse loading spinner" data-testid="loading-skeleton">
                                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 mx-auto mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-8"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg mr-3"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                                </div>
                                            </div>
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                            <div className="flex gap-2 mb-4">
                                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/servers"
                            className="inline-flex items-center px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Browse All Servers
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

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
                            to="/servers"
                            className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-800 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors"
                        >
                            <Rocket className="mr-2 h-5 w-5" />
                            Get Started
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
    );
};

export default Home;