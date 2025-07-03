import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Calendar, ArrowRight } from 'lucide-react';
import type { MCPServer } from '../../types';
import { FavoriteButton } from '../FavoriteButton';

interface FeaturedServerCardProps {
    server: MCPServer;
    getCategoryIcon: (category: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    formatLastUpdated: (dateString: string) => string;
}

const FeaturedServerCard: React.FC<FeaturedServerCardProps> = React.memo(({
    server,
    getCategoryIcon,
    getCategoryColor,
    formatLastUpdated
}) => {
    return (
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg server-card" data-testid={`featured-server-result-${server.id}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1 mr-4">
                    <div className={`w-10 h-10 ${getCategoryColor(server.category)} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                        {getCategoryIcon(server.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                        {server.owner && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                @{server.owner}
                            </div>
                        )}
                        <h3 
                            className="text-base font-semibold text-gray-900 dark:text-white truncate"
                            title={server.name}
                        >
                            {server.name}
                        </h3>
                        <div className="flex items-center flex-wrap gap-1 mt-1">
                            {server.verified && (
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                    Official
                                </span>
                            )}
                            {server.featured && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-2">
                    <FavoriteButton 
                        serverId={server.id} 
                        size="sm"
                        className="mb-2"
                    />
                    <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-gray-900 dark:text-white font-medium">
                            {(server.quality.score / 20).toFixed(1)}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {server.repository.stars >= 1000 
                            ? `${(server.repository.stars / 1000).toFixed(1)}k` 
                            : server.repository.stars} stars
                    </div>
                </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
                {server.fullDescription || server.description["zh-CN"]}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {server.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        <Download className="w-4 h-4 mr-1 inline" />
                        {server.usage.downloads >= 1000 
                            ? `${(server.usage.downloads / 1000).toFixed(0)}k` 
                            : server.usage.downloads}
                    </span>
                    <span>
                        <Calendar className="w-4 h-4 mr-1 inline" />
                        Updated {formatLastUpdated(server.repository.lastUpdated)}
                    </span>
                </div>
                <Link
                    to={`/servers/${server.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1 inline" />
                </Link>
            </div>
        </div>
    );
});

FeaturedServerCard.displayName = 'FeaturedServerCard';

export default FeaturedServerCard;