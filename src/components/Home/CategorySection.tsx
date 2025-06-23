import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Download, Calendar } from "lucide-react";
import type { MCPServer, Category } from "../../types";

interface CategorySectionProps {
    category: Category;
    servers: MCPServer[];
    getCategoryIcon: (category: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    formatLastUpdated: (dateString: string) => string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    servers,
    getCategoryIcon,
    getCategoryColor,
    formatLastUpdated,
}) => {
    const displayServers = servers.slice(0, 10);

    if (displayServers.length === 0) {
        return null;
    }

    return (
        <section id={`category-${category.id}`} className="mb-16 scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl ${getCategoryColor(category.id)} flex items-center justify-center mr-4`}>
                        {getCategoryIcon(category.id)}
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {category.name.en}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {category.description.en}
                        </p>
                    </div>
                </div>
                <Link
                    to={`/categories/${category.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                    More
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayServers.map((server) => (
                    <Link
                        key={server.id}
                        to={`/servers/${server.id}`}
                        className="block group"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-lg ${getCategoryColor(server.category)} flex items-center justify-center mr-3`}>
                                        {getCategoryIcon(server.category)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {server.owner && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                @{server.owner}
                                            </div>
                                        )}
                                        <h3 
                                            className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-truncate-improved hover-tooltip"
                                            data-tooltip={server.name}
                                        >
                                            {server.name}
                                        </h3>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <Star className="h-3 w-3 mr-1" />
                                            {server.repository.stars}
                                        </div>
                                    </div>
                                </div>
                                {server.verified && (
                                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                                        Verified
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                {server.description["zh-CN"]}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {server.tags.slice(0, 2).map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {server.tags.length > 2 && (
                                    <span className="text-gray-400 dark:text-gray-500 text-xs px-2 py-1">
                                        +{server.tags.length - 2}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Download className="h-3 w-3 mr-1" />
                                    {server.usage.downloads >= 1000 
                                        ? `${Math.floor(server.usage.downloads / 1000)}k` 
                                        : server.usage.downloads}
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatLastUpdated(server.repository.lastUpdated)}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;