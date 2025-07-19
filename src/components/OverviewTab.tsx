import React from 'react';
import { 
    Star, 
    Lightbulb, 
    Target, 
    Zap, 
    CheckCircle, 
    Users,
    ArrowRight,
    ExternalLink 
} from 'lucide-react';
import type { ExtractedOverview } from '../types';

interface OverviewTabProps {
    overview: ExtractedOverview | null | undefined;
    repositoryUrl: string;
    isLoading?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
    overview, 
    repositoryUrl, 
    isLoading = false 
}) => {
    if (isLoading) {
        return (
            <div className="p-6 animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-full"></div>
                <div className="space-y-4">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!overview?.introduction) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <div className="flex items-start">
                        <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Overview Coming Soon
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                                We're currently processing this server's overview information. 
                                The detailed overview will be available shortly.
                            </p>
                            <a
                                href={`${repositoryUrl}#readme`}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full README on GitHub
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { introduction } = overview;

    return (
        <div className="p-6 space-y-6">
            {/* Title and Summary */}
            <div className="space-y-3">
                {introduction.title && (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {introduction.title}
                    </h2>
                )}
                {introduction.summary && (
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {introduction.summary}
                    </p>
                )}
            </div>

            {/* Motivation Section */}
            {introduction.motivation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                Why This Server?
                            </h3>
                            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                                {introduction.motivation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Core Functionality */}
            {introduction.core_functionality && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            How It Works
                        </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {introduction.core_functionality}
                    </p>
                </div>
            )}

            {/* Key Features */}
            {introduction.key_features && introduction.key_features.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <Star className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Key Features
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {introduction.key_features.map((feature, index) => (
                            <div 
                                key={index}
                                className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Use Cases */}
            {introduction.use_cases && introduction.use_cases.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Use Cases
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {introduction.use_cases.map((useCase, index) => (
                            <div 
                                key={index}
                                className="p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                            >
                                <h4 className="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
                                    {useCase.scenario}
                                </h4>
                                <p className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">
                                    {useCase.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Unique Value */}
            {introduction.unique_value && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="bg-purple-600 dark:bg-purple-500 rounded-full p-2 mr-4 flex-shrink-0">
                            <Star className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                                What Makes It Special
                            </h3>
                            <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                                {introduction.unique_value}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    );
};

export default OverviewTab;