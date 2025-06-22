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

const Home: React.FC = () => {
    const { searchQuery, setSearchQuery } = useAppStore();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Discover the Best
                            <span className="block text-blue-200">MCP Servers</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Your gateway to enhanced AI capabilities. Explore, integrate, and supercharge your applications with Model Context Protocol servers.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="relative rounded-xl p-2" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Search for MCP servers, categories, or features..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-4 bg-white rounded-lg border-0 focus:ring-2 focus:ring-blue-400 text-lg"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    <Search className="h-4 w-4 mr-2 inline" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            <div className="rounded-lg p-4 text-center" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div className="text-3xl font-bold text-white">200+</div>
                                <div className="text-blue-200">MCP Servers</div>
                            </div>
                            <div className="rounded-lg p-4 text-center" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div className="text-3xl font-bold text-white">10</div>
                                <div className="text-blue-200">Categories</div>
                            </div>
                            <div className="rounded-lg p-4 text-center" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div className="text-3xl font-bold text-white">50K+</div>
                                <div className="text-blue-200">Downloads</div>
                            </div>
                            <div className="rounded-lg p-4 text-center" style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-blue-200">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover MCP servers organized by functionality and use case
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* File System Category */}
                        <Link
                            to="/categories/filesystem"
                            className="bg-blue-50 rounded-xl p-6 cursor-pointer border border-blue-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Folder className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                File System
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                File operations and cloud storage integration
                            </p>
                            <div className="text-blue-600 font-medium text-sm">
                                25 servers
                            </div>
                        </Link>

                        {/* Database Category */}
                        <Link
                            to="/categories/database"
                            className="bg-green-50 rounded-xl p-6 cursor-pointer border border-green-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                <Database className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Database
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                SQL and NoSQL database connections
                            </p>
                            <div className="text-green-600 font-medium text-sm">
                                30 servers
                            </div>
                        </Link>

                        {/* Communication Category */}
                        <Link
                            to="/categories/communication"
                            className="bg-purple-50 rounded-xl p-6 cursor-pointer border border-purple-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <MessageCircle className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Communication
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Messaging and notification services
                            </p>
                            <div className="text-purple-600 font-medium text-sm">
                                18 servers
                            </div>
                        </Link>

                        {/* Development Tools */}
                        <Link
                            to="/categories/development"
                            className="bg-indigo-50 rounded-xl p-6 cursor-pointer border border-indigo-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Code className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Development
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Git, CI/CD, and code analysis tools
                            </p>
                            <div className="text-indigo-600 font-medium text-sm">
                                22 servers
                            </div>
                        </Link>

                        {/* AI/ML Category */}
                        <Link
                            to="/categories/ai-ml"
                            className="bg-pink-50 rounded-xl p-6 cursor-pointer border border-pink-100 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                                <Brain className="text-white text-xl w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                AI/ML
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Machine learning and AI services
                            </p>
                            <div className="text-pink-600 font-medium text-sm">
                                15 servers
                            </div>
                        </Link>
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            to="/categories"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View All Categories
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Servers Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Featured Servers
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Handpicked MCP servers recommended by our community
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Featured Server 1 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                        <Folder className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Filesystem MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 font-medium">4.8</span>
                                    </div>
                                    <div className="text-sm text-gray-500">1.2k stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Comprehensive file system operations with support for local and cloud storage integration.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    file-system
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    storage
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    cloud
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Featured Server 2 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                        <Database className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            PostgreSQL MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 font-medium">4.6</span>
                                    </div>
                                    <div className="text-sm text-gray-500">856 stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Advanced PostgreSQL integration with support for complex queries and analytics.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    postgresql
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    database
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    sql
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Featured Server 3 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                        <MessageCircle className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Slack MCP
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                Official
                                            </span>
                                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                                Popular
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="ml-1 text-gray-900 font-medium">4.7</span>
                                    </div>
                                    <div className="text-sm text-gray-500">1.1k stars</div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Seamless Slack integration for messaging, channel management, and bot automation.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    slack
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    messaging
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    bot
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                    className="text-blue-600 hover:text-blue-700 font-medium"
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
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse All Servers
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Enhance Your AI Applications?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Join thousands of developers using MCP servers to build more capable and intelligent applications.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/servers"
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Rocket className="mr-2 h-5 w-5" />
                            Get Started
                        </Link>
                        <Link
                            to="/docs"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
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