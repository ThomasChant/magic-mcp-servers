import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useCategories } from "../hooks/useUnifiedData";
import { useAppStore } from "../store/useAppStore";
import { useServers } from "../hooks/useUnifiedData";
import { useFeaturedServersByCategory, getFeaturedServersByCategory } from "../hooks/useFeaturedServers";

const Categories: React.FC = () => {
  const [activeTab, setActiveTab] = useState("database");
  const { data: categories, isLoading } = useCategories();
  const { data: servers } = useServers();
  const { data: featuredServers } = useFeaturedServersByCategory();
  const { language } = useAppStore();
  const isZh = language === "zh-CN";

  // Take first 6 categories as main categories
  const mainCategories = categories?.sort((a, b) => b.serverCount - a.serverCount)?.slice(0, 6) || [];
  const additionalCategories = categories?.slice(6) || [];
  
  // Calculate total stats from actual server data
  console.log('servers count0', servers?.length);
  console.log('servers count1', categories?.reduce((sum, cat) => sum + cat.serverCount, 0));
  const totalServers = categories?.reduce((sum, cat) => sum + cat.serverCount, 0) || 0;
  const totalDownloads = servers?.reduce((sum, server) => sum + (server.usage?.downloads || 0), 0) || 0;
  const averageUptime = 98; // This could be calculated from server health data if available

  if (isLoading || !categories) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isZh ? "服务器分类" : "Server Categories"}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {isZh 
                ? "按功能和用例探索MCP服务器。找到适合您AI应用需求的完美服务器。"
                : "Explore MCP servers organized by functionality and use case. Find the perfect server for your AI application needs."}
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
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {isZh ? "分类" : "Categories"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalServers}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {isZh ? "服务器总数" : "Total Servers"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalDownloads >= 1000 ? `${Math.floor(totalDownloads / 1000)}K+` : `${totalDownloads}+`}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {isZh ? "下载量" : "Downloads"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {averageUptime}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {isZh ? "在线率" : "Uptime"}
              </div>
            </div>
          </div>

          {/* Main Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {mainCategories.map((category) => (
              <div
                key={category.id}
                className="category-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover-lift"
              >
                <div 
                  className="p-6 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}CC 100%)` 
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {category.serverCount} {isZh ? "个服务器" : "servers"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {isZh ? category.name["zh-CN"] : category.name.en}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {isZh ? category.description["zh-CN"] : category.description.en}
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.id}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {isZh ? sub.name["zh-CN"] : sub.name.en}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.subcategories.length} {isZh ? "个子分类" : "subcategories"}
                    </span>
                    <Link
                      to={`/servers?category=${category.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center"
                    >
                      {isZh ? "浏览" : "Browse"}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {isZh ? "所有分类" : "All Categories"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/servers?category=${category.id}`}
                  className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {isZh ? category.name["zh-CN"] : category.name.en}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.serverCount} {isZh ? "个服务器" : "servers"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {isZh ? category.description["zh-CN"] : category.description.en}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured by Category */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isZh ? "分类精选服务器" : "Featured Servers by Category"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isZh ? "每个主要分类的高评分服务器" : "Top-rated servers from each major category"}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {isZh ? category.name["zh-CN"] : category.name.en}
              </button>
            ))}
          </div>

          {/* Featured Servers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedServersByCategory(activeTab, featuredServers).map((server, index) => {
              const activeCategoryData = categories.find((c) => c.id === activeTab);
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-white"
                        style={{ backgroundColor: activeCategoryData?.color }}
                      >
                        <server.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {server.name}
                        </h3>
                        <span
                          className={`bg-${server.badgeColor}-100 dark:bg-${server.badgeColor}-900/30 text-${server.badgeColor}-800 dark:text-${server.badgeColor}-200 text-xs px-2 py-1 rounded-full`}
                        >
                          {server.badge}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-gray-900 dark:text-white font-medium text-sm">
                          {server.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {server.description}
                  </p>
                  <Link
                    to={`/servers/${server.slug || server.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center"
                  >
                    {isZh ? "查看详情" : "View Details"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/servers"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isZh ? "浏览所有服务器" : "Browse All Servers"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;