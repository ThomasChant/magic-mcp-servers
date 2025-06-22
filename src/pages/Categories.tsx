import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Folder,
    Database,
    MessageCircle,
    Code,
    Brain,
    Search,
    BarChart3,
    Plug,
    CheckSquare,
    Shield,
    FileText,
    Wrench,
    Star,
    Cloud,
} from "lucide-react";
const Categories: React.FC = () => {
    const [activeTab, setActiveTab] = useState("filesystem");

    const mainCategories = [
        {
            id: "filesystem",
            name: "File System",
            description: "File operations, directory management, and cloud storage integration",
            icon: Folder,
            gradient: "category-gradient-1",
            serverCount: 25,
            tags: ["Local Files", "Cloud Storage", "File Search"],
            popular: "Filesystem MCP",
            color: "blue",
        },
        {
            id: "database",
            name: "Database",
            description: "SQL and NoSQL database connections, queries, and data management",
            icon: Database,
            gradient: "category-gradient-2",
            serverCount: 30,
            tags: ["SQL", "NoSQL", "Analytics"],
            popular: "PostgreSQL MCP",
            color: "green",
        },
        {
            id: "communication",
            name: "Communication",
            description: "Messaging, notifications, email, and chat platform integrations",
            icon: MessageCircle,
            gradient: "category-gradient-3",
            serverCount: 18,
            tags: ["Slack", "Email", "SMS"],
            popular: "Slack MCP",
            color: "purple",
        },
        {
            id: "development",
            name: "Development Tools",
            description: "Git operations, CI/CD, code analysis, and development utilities",
            icon: Code,
            gradient: "category-gradient-4",
            serverCount: 22,
            tags: ["Git", "CI/CD", "Code Analysis"],
            popular: "GitHub MCP",
            color: "orange",
        },
        {
            id: "ai-ml",
            name: "AI/ML",
            description: "Machine learning models, data processing, and AI service integrations",
            icon: Brain,
            gradient: "category-gradient-5",
            serverCount: 15,
            tags: ["ML Models", "Data Processing", "Inference"],
            popular: "OpenAI MCP",
            color: "red",
        },
        {
            id: "search",
            name: "Search",
            description: "Web search, document search, and information retrieval services",
            icon: Search,
            gradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
            serverCount: 12,
            tags: ["Web Search", "Elasticsearch", "Vector Search"],
            popular: "Brave Search MCP",
            color: "indigo",
        },
    ];

    const additionalCategories = [
        { id: "monitoring", name: "Monitoring", icon: BarChart3, serverCount: 8, description: "System monitoring, logging, and performance analytics", color: "blue" },
        { id: "api-integration", name: "API Integration", icon: Plug, serverCount: 14, description: "Third-party API wrappers and service integrations", color: "green" },
        { id: "productivity", name: "Productivity", icon: CheckSquare, serverCount: 10, description: "Task management, calendar, and productivity tools", color: "purple" },
        { id: "security", name: "Security", icon: Shield, serverCount: 6, description: "Security scanning, authentication, and encryption tools", color: "red" },
        { id: "content", name: "Content Management", icon: FileText, serverCount: 9, description: "CMS integration, content processing, and publishing", color: "yellow" },
        { id: "utilities", name: "Utilities", icon: Wrench, serverCount: 11, description: "General utilities, converters, and helper tools", color: "gray" },
    ];

    const featuredServers = {
        filesystem: [
            { name: "Filesystem MCP", icon: Folder, rating: 4.8, badge: "Official", badgeColor: "blue", description: "Comprehensive file system operations with cloud storage support" },
            { name: "AWS S3 MCP", icon: Cloud, rating: 4.6, badge: "Featured", badgeColor: "green", description: "AWS S3 integration for cloud file storage and management" },
            { name: "File Search MCP", icon: Search, rating: 4.4, badge: "Popular", badgeColor: "orange", description: "Advanced file search and indexing capabilities" },
        ],
        database: [
            { name: "PostgreSQL MCP", icon: Database, rating: 4.6, badge: "Official", badgeColor: "blue", description: "Advanced PostgreSQL integration with analytics" },
            { name: "MySQL MCP", icon: Database, rating: 4.5, badge: "Featured", badgeColor: "green", description: "Reliable MySQL database operations" },
            { name: "MongoDB MCP", icon: Database, rating: 4.3, badge: "Popular", badgeColor: "orange", description: "NoSQL MongoDB integration" },
        ],
        communication: [
            { name: "Slack MCP", icon: MessageCircle, rating: 4.7, badge: "Official", badgeColor: "blue", description: "Seamless Slack workspace integration" },
            { name: "Discord MCP", icon: MessageCircle, rating: 4.4, badge: "Featured", badgeColor: "green", description: "Discord bot and server management" },
            { name: "Email MCP", icon: MessageCircle, rating: 4.2, badge: "Popular", badgeColor: "orange", description: "Email automation and management" },
        ],
        development: [
            { name: "GitHub MCP", icon: Code, rating: 4.9, badge: "Official", badgeColor: "blue", description: "Complete GitHub repository management" },
            { name: "GitLab MCP", icon: Code, rating: 4.5, badge: "Featured", badgeColor: "green", description: "GitLab CI/CD and project management" },
            { name: "Jenkins MCP", icon: Code, rating: 4.1, badge: "Popular", badgeColor: "orange", description: "Jenkins automation and build management" },
        ],
        "ai-ml": [
            { name: "OpenAI MCP", icon: Brain, rating: 4.8, badge: "Official", badgeColor: "blue", description: "OpenAI API integration and model access" },
            { name: "Hugging Face MCP", icon: Brain, rating: 4.6, badge: "Featured", badgeColor: "green", description: "Hugging Face model hub integration" },
            { name: "TensorFlow MCP", icon: Brain, rating: 4.4, badge: "Popular", badgeColor: "orange", description: "TensorFlow model serving and training" },
        ],
    };

    const isLoading = false;

    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center animate-pulse">
                            <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
                <div className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                                    <div className="h-32 bg-gray-200"></div>
                                    <div className="p-6">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Server Categories
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Explore MCP servers organized by functionality and use case. Find the perfect server for your AI application needs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Overview */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">10</div>
                            <div className="text-gray-600">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">127</div>
                            <div className="text-gray-600">Total Servers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">45K+</div>
                            <div className="text-gray-600">Downloads</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">98%</div>
                            <div className="text-gray-600">Uptime</div>
                        </div>
                    </div>

                    {/* Main Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {mainCategories.map((category) => (
                            <div key={category.id} className="category-card bg-white rounded-xl shadow-lg overflow-hidden hover-lift">
                                <div className={`${category.gradient} p-6 text-white`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                                            {category.serverCount} servers
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                                    <p className={`text-${category.color}-100 text-sm`}>
                                        {category.description}
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {category.tags.map((tag, index) => (
                                            <span key={index} className={`bg-${category.color}-100 text-${category.color}-800 text-xs px-2 py-1 rounded`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            Most Popular: {category.popular}
                                        </span>
                                        <Link
                                            to={`/servers?category=${category.id}`}
                                            className={`text-${category.color}-600 hover:text-${category.color}-700 font-medium text-sm`}
                                        >
                                            Browse
                                            <ArrowRight className="w-4 h-4 ml-1 inline" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Categories */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {additionalCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/servers?category=${category.id}`}
                                    className={`group p-4 border border-gray-200 rounded-lg hover:border-${category.color}-300 hover:bg-${category.color}-50 transition-colors`}
                                >
                                    <div className="flex items-center mb-3">
                                        <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-${category.color}-200`}>
                                            <category.icon className={`w-5 h-5 text-${category.color}-600`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                            <span className="text-sm text-gray-500">{category.serverCount} servers</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{category.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured by Category */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Featured Servers by Category
                        </h2>
                        <p className="text-lg text-gray-600">
                            Top-rated servers from each major category
                        </p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {mainCategories.slice(0, 5).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(category.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === category.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Featured Servers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredServers[activeTab as keyof typeof featuredServers]?.map((server, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover-lift">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 bg-${mainCategories.find(c => c.id === activeTab)?.color}-600 rounded-lg flex items-center justify-center mr-3`}>
                                            <server.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{server.name}</h3>
                                            <span className={`bg-${server.badgeColor}-100 text-${server.badgeColor}-800 text-xs px-2 py-1 rounded-full`}>
                                                {server.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="ml-1 text-gray-900 font-medium text-sm">{server.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{server.description}</p>
                                <Link
                                    to="/servers/filesystem-mcp"
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View Details <ArrowRight className="w-4 h-4 ml-1 inline" />
                                </Link>
                            </div>
                        ))}
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
        </div>
    );
};

export default Categories;