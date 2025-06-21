import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import { useCategories } from "../hooks/useData";

const Categories: React.FC = () => {
    const { data: categories, isLoading } = useCategories();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    MCP 服务器分类
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    按功能分类浏览 Model Context Protocol
                    服务器，找到适合您项目需求的解决方案
                </p>
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                                <div className="flex-1">
                                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                            <div className="flex flex-wrap gap-2">
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((category) => (
                        <Link
                            key={category.id}
                            to={`/categories/${category.id}`}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
                        >
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                                    style={{
                                        backgroundColor: category.color + "20",
                                        color: category.color,
                                    }}
                                >
                                    <Package className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                        {category.name["zh-CN"]}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {category.serverCount} 个服务器
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {category.description["zh-CN"]}
                            </p>

                            {/* Subcategories */}
                            {category.subcategories &&
                                category.subcategories.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {category.subcategories
                                                .slice(0, 3)
                                                .map((sub) => (
                                                    <span
                                                        key={sub.id}
                                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {sub.name["zh-CN"]}
                                                    </span>
                                                ))}
                                            {category.subcategories.length >
                                                3 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                    +
                                                    {category.subcategories
                                                        .length - 3}{" "}
                                                    更多
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                                查看分类详情
                                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!isLoading && categories && categories.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Package className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        暂无分类数据
                    </h3>
                    <p className="text-gray-600">
                        分类数据正在加载中，请稍后再试
                    </p>
                </div>
            )}

            {/* Feature Section */}
            <div className="mt-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        没有找到您需要的分类？
                    </h2>
                    <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
                        我们正在不断扩展 MCP
                        服务器生态系统。如果您有特定需求或想要贡献新的服务器，请联系我们。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/docs"
                            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            查看开发文档
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                        >
                            了解更多
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
