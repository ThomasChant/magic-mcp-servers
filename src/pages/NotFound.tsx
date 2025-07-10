import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

const NotFoundPage: React.FC = () => {
    const { t } = useTranslation("common");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 Visual Element */}
                <div className="relative mb-8">
                    <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 opacity-20 select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <Compass className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin-slow" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("notFound.title", "页面未找到")}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                    {t("notFound.description", "抱歉，您访问的页面不存在或已被移动到其他位置。")}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 min-w-[140px]"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        {t("common.backToHome", "返回首页")}
                    </Link>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg min-w-[140px]"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t("common.goBack", "返回上页")}
                    </button>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
                    <Link
                        to="/servers"
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200 group"
                    >
                        <Search className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t("nav.servers", "服务器")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t("notFound.browseServers", "浏览所有服务器")}
                        </p>
                    </Link>

                    <Link
                        to="/categories"
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200 group"
                    >
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded mx-auto mb-2 group-hover:scale-110 transition-transform duration-200"></div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t("nav.categories", "分类")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t("notFound.browseCategories", "按分类浏览")}
                        </p>
                    </Link>

                    <Link
                        to="/docs"
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200 group"
                    >
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded mx-auto mb-2 group-hover:scale-110 transition-transform duration-200"></div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t("nav.documentation", "文档")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t("notFound.readDocs", "查看文档")}
                        </p>
                    </Link>
                </div>

                {/* Search Suggestion */}
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        💡 {t("notFound.searchTip", "提示：您可以使用搜索功能快速找到需要的内容")}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        {t("notFound.reportIssue", "如果您认为这是一个错误，请联系我们")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;