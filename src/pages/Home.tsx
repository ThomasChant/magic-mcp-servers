import React from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Star,
    Download,
    Calendar,
    ArrowRight,
    Rocket,
    Book,
    Folder,
    Database,
    MessageCircle,
    Code,
    Brain,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import CosmicBackground from "../components/CosmicBackground";

const Home: React.FC = () => {
    const { searchQuery, setSearchQuery } = useAppStore();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden cosmic-bg min-h-screen flex items-center">
                <CosmicBackground />
                
                {/* Additional visible test stars */}
                <div className="star large" style={{ left: '10%', top: '20%', animationDelay: '0s', zIndex: 2, position: 'absolute' }}></div>
                <div className="star large" style={{ left: '90%', top: '30%', animationDelay: '1s', zIndex: 2, position: 'absolute' }}></div>
                <div className="star medium" style={{ left: '30%', top: '40%', animationDelay: '0.5s', zIndex: 2, position: 'absolute' }}></div>
                <div className="star medium" style={{ left: '70%', top: '60%', animationDelay: '1.5s', zIndex: 2, position: 'absolute' }}></div>
                <div className="star small" style={{ left: '50%', top: '15%', animationDelay: '0.3s', zIndex: 2, position: 'absolute' }}></div>
                <div className="star small" style={{ left: '80%', top: '80%', animationDelay: '2s', zIndex: 2, position: 'absolute' }}></div>
                
                
                
                {/* Test photons */}
                <div className="photon" style={{ top: '25%', animationDelay: '0s', zIndex: 3 }}></div>
                <div className="photon" style={{ top: '55%', animationDelay: '2s', zIndex: 3 }}></div>
                <div className="photon" style={{ top: '75%', animationDelay: '4s', zIndex: 3 }}></div>
                
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
                                    type="text"
                                    placeholder="Search for MCP servers, categories, or features..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg border-0 focus:ring-2 focus:ring-blue-400 text-lg"
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
                                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">200+</div>
                                <div className="text-gray-300">MCP Servers</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(147, 51, 234, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">10</div>
                                <div className="text-gray-300">Categories</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-300 to-white bg-clip-text text-transparent">50K+</div>
                                <div className="text-gray-300">Downloads</div>
                            </div>
                            <div className="rounded-lg p-4 text-center hover-lift" style={{
                                background: 'rgba(249, 115, 22, 0.1)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)'
                            }}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-white bg-clip-text text-transparent">24/7</div>
                                <div className="text-gray-300">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Discover MCP servers organized by functionality and use case
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* File System Category */}
                        <Link
                            to="/categories/filesystem"
                            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 cursor-pointer border border-blue-100 dark:border-blue-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Folder className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                File System
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                File operations and cloud storage integration
                            </p>
                            <div className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                25 servers
                            </div>
                        </Link>

                        {/* Database Category */}
                        <Link
                            to="/categories/database"
                            className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 cursor-pointer border border-green-100 dark:border-green-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                <Database className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Database
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                SQL and NoSQL database connections
                            </p>
                            <div className="text-green-600 dark:text-green-400 font-medium text-sm">
                                30 servers
                            </div>
                        </Link>

                        {/* Communication Category */}
                        <Link
                            to="/categories/communication"
                            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 cursor-pointer border border-purple-100 dark:border-purple-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <MessageCircle className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Communication
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                Messaging and notification services
                            </p>
                            <div className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                                18 servers
                            </div>
                        </Link>

                        {/* Development Tools */}
                        <Link
                            to="/categories/development"
                            className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 cursor-pointer border border-indigo-100 dark:border-indigo-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Code className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Development
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                Git, CI/CD, and code analysis tools
                            </p>
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                                22 servers
                            </div>
                        </Link>

                        {/* AI/ML Category */}
                        <Link
                            to="/categories/ai-ml"
                            className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 cursor-pointer border border-pink-100 dark:border-pink-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                                <Brain className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                AI/ML
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                Machine learning and AI services
                            </p>
                            <div className="text-pink-600 dark:text-pink-400 font-medium text-sm">
                                15 servers
                            </div>
                        </Link>
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            to="/categories"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            View All Categories
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Servers Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Featured Servers
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Handpicked MCP servers recommended by our community
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Featured Server 1 */}
                        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                        <Folder className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Filesystem MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 dark:text-white font-medium">4.8</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">1.2k stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Comprehensive file system operations with support for local and cloud storage integration.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    file-system
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    storage
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    cloud
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>
                                        <Download className="w-4 h-4 mr-1 inline" />
                                        15k
                                    </span>
                                    <span>
                                        <Calendar className="w-4 h-4 mr-1 inline" />
                                        Updated 2d ago
                                    </span>
                                </div>
                                <Link
                                    to="/servers/filesystem-mcp"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Featured Server 2 */}
                        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                        <Database className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            PostgreSQL MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 dark:text-white font-medium">4.6</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">856 stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Advanced PostgreSQL integration with support for complex queries and analytics.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    postgresql
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    database
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    sql
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>
                                        <Download className="w-4 h-4 mr-1 inline" />
                                        12k
                                    </span>
                                    <span>
                                        <Calendar className="w-4 h-4 mr-1 inline" />
                                        Updated 1w ago
                                    </span>
                                </div>
                                <Link
                                    to="/servers/postgresql-mcp"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Featured Server 3 */}
                        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                        <MessageCircle className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Slack MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                                                Popular
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 dark:text-white font-medium">4.7</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">1.1k stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Seamless Slack integration for messaging, channel management, and bot automation.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    slack
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    messaging
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                    bot
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>
                                        <Download className="w-4 h-4 mr-1 inline" />
                                        18k
                                    </span>
                                    <span>
                                        <Calendar className="w-4 h-4 mr-1 inline" />
                                        Updated 3d ago
                                    </span>
                                </div>
                                <Link
                                    to="/servers/slack-mcp"
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            to="/servers"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            Browse All Servers
                            <ArrowRight className="ml-2 h-4 w-4" />
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