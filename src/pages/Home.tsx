import React from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Star,
    Download,
    Zap,
    Shield,
    Users,
    ArrowRight,
} from "lucide-react";
import { useCategories, useFeaturedServers } from "../hooks/useData";
import { useAppStore } from "../store/useAppStore";

const Home: React.FC = () => {
    const { searchQuery, setSearchQuery } = useAppStore();
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: featuredServers, isLoading: serversLoading } =
        useFeaturedServers();

    const stats = [
        { label: "MCP 服务器", value: "200+", icon: Zap },
        { label: "月下载量", value: "50K+", icon: Download },
        { label: "活跃开发者", value: "10K+", icon: Users },
        { label: "验证服务器", value: "150+", icon: Shield },
    ];

    const features = [
        {
            title: "智能发现",
            description: "使用智能搜索和筛选功能找到完美的 MCP 服务器",
            icon: Search,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "质量保证",
            description: "社区驱动的评分和评论系统确保可靠选择",
            icon: Star,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "简单集成",
            description: "分步指南和代码示例帮助快速设置",
            icon: Zap,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "活跃社区",
            description: "与开发者连接并分享知识",
            icon: Users,
            color: "bg-orange-100 text-orange-600",
        },
    ];

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary-600 to-purple-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                            发现最优秀的
                            <span className="block text-gradient">
                                MCP 服务器
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-slide-up">
                            为您的 AI 应用寻找、评估并集成最佳的 Model Context
                            Protocol 服务器
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8 animate-scale-in">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索 MCP 服务器..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-4 text-gray-900 border border-transparent rounded-lg shadow-lg text-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                                />
                                <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/servers"
                                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                            >
                                <Zap className="mr-2 h-5 w-5" />
                                浏览服务器
                            </Link>
                            <Link
                                to="/docs"
                                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                            >
                                查看文档
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={stat.label} className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
                                    <stat.icon className="h-6 w-6 text-primary-600" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            为什么选择 MCP Hub？
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            我们为开发者提供最全面、最可靠的 MCP
                            服务器发现和集成平台
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="card-hover text-center"
                            >
                                <div
                                    className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                                >
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            热门分类
                        </h2>
                        <p className="text-xl text-gray-600">
                            探索各种类型的 MCP 服务器
                        </p>
                    </div>

                    {categoriesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="w-12 h-12 bg-gray-300 rounded-lg mb-4"></div>
                                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {categories?.slice(0, 6).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/categories/${category.id}`}
                                    className="card-hover group"
                                >
                                    <div className="flex items-center mb-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                                            style={{
                                                backgroundColor:
                                                    category.color + "20",
                                                color: category.color,
                                            }}
                                        >
                                            <div className="w-6 h-6">
                                                <div className="w-full h-full bg-current opacity-80 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {category.name["zh-CN"]}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {category.serverCount} 个服务器
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {category.description["zh-CN"]}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center">
                        <Link to="/categories" className="btn-primary">
                            查看所有分类
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Servers Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            精选服务器
                        </h2>
                        <p className="text-xl text-gray-600">
                            社区推荐的高质量 MCP 服务器
                        </p>
                    </div>

                    {serversLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {featuredServers?.map((server) => (
                                <Link
                                    key={server.id}
                                    to={`/servers/${server.id}`}
                                    className="card-hover group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {server.name}
                                        </h3>
                                        {server.verified && (
                                            <Shield
                                                className="h-5 w-5 text-green-500"
                                                title="已验证"
                                            />
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {server.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {server.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Star className="h-4 w-4 mr-1" />
                                            {server.repository.stars}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Download className="h-4 w-4 mr-1" />
                                            {(
                                                server.usage.downloads / 1000
                                            ).toFixed(1)}
                                            K
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center">
                        <Link to="/servers" className="btn-primary">
                            查看所有服务器
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        准备开始构建？
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        探索我们的 MCP 服务器集合，立即开始构建令人惊叹的 AI
                        应用
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/servers"
                            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Zap className="mr-2 h-5 w-5" />
                            浏览服务器
                        </Link>
                        <Link
                            to="/docs"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                        >
                            查看文档
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
