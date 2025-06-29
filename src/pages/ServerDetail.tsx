import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Star,
    Download,
    GitBranch,
    // Copy and CheckCircle now handled by StructuredReadme component
    AlertCircle,
    ChevronRight,
    Folder,
    Share,
    Calendar,
    Database,
    Cloud,
    Search,
    Eye,
    GitFork,
    Brain,
    MessageCircle,
    // MessageSquare removed as comments are handled separately
    Twitter,
    Facebook,
    Linkedin,
    Link2,
} from "lucide-react";
import { useServer, useServerReadme } from "../hooks/useUnifiedData";
import { useRelatedServers } from "../hooks/useRelatedServers";
import StructuredReadme from "../components/StructuredReadme";
import ServerCommentsWithReplies from "../components/ServerCommentsWithReplies";
import { FavoriteButton } from "../components/FavoriteButton";

const ServerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: server, isLoading, error } = useServer(id!);
    console.log("server", server)
    const { data: readmeData, isLoading: readmeLoading } = useServerReadme(server?.owner+"_"+server?.name || '');
    const { relatedServers, isLoading: relatedLoading } = useRelatedServers(server, 10);
    // Remove activeTab state as we're using StructuredReadme component
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [showShareMenu, setShowShareMenu] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !server) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="text-red-400 mb-4">
                    <AlertCircle className="h-12 w-12 mx-auto" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Server Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Sorry, we couldn't find the MCP server you're looking for.
                </p>
                <Link
                    to="/servers"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Server List
                </Link>
            </div>
        );
    }

    const copyToClipboard = (text: string, buttonId?: string) => {
        navigator.clipboard.writeText(text).then(() => {
            if (buttonId) {
                setCopiedStates(prev => ({ ...prev, [buttonId]: true }));
                setTimeout(() => {
                    setCopiedStates(prev => ({ ...prev, [buttonId]: false }));
                }, 2000);
            }
        });
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const title = `Check out ${server?.name} - ${server?.description}`;
        
        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                copyToClipboard(url, 'share-link');
                setShowShareMenu(false);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            setShowShareMenu(false);
        }
    };

    // Comment functionality moved to separate component if needed

    // Tabs removed - using StructuredReadme component

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </li>
                            <li>
                                <Link
                                    to="/servers"
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Servers
                                </Link>
                            </li>
                            <li>
                                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </li>
                            <li>
                                <Link
                                    to={`/categories/${server.category}`}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {server.category}
                                </Link>
                            </li>
                            <li>
                                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </li>
                            <li className="text-gray-900 dark:text-white font-medium">
                                {server.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Server Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start space-x-4 mb-6 lg:mb-0">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Folder className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {server.name}
                                    </h1>
                                    <div className="flex items-center space-x-2">
                                        {server.verified && (
                                            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                                Official
                                            </span>
                                        )}
                                        {server.featured && (
                                            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                    {server.fullDescription || server.description.en || server.description["zh-CN"]}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {server.repository.stars.toLocaleString()}
                                        </span>
                                        <span className="ml-1">stars</span>
                                    </div>
                                    {server.repository.forks !== undefined && (
                                        <div className="flex items-center">
                                            <GitFork className="h-4 w-4 mr-1" />
                                            <span>{server.repository.forks.toLocaleString()} forks</span>
                                        </div>
                                    )}
                                    {server.repository.watchers !== undefined && (
                                        <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            <span>{server.repository.watchers.toLocaleString()} watchers</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Download className="h-4 w-4 mr-1" />
                                        <span>{server.usage.downloads.toLocaleString()} downloads</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>Updated {server.stats.lastUpdated ? new Date(server.stats.lastUpdated).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row sm:flex-row gap-3 min-w-fit">
                            <a
                                href={server.repository.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-2 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-sm min-w-[140px]"
                            >
                                <GitBranch className="mr-2 h-5 w-5" />
                                View on GitHub
                            </a>
                            <FavoriteButton 
                                serverId={server.id}
                                showText={true}
                                size="lg"
                                className="min-w-[140px] border-2 shadow-sm hover:shadow-md"
                            />
                            <div className="relative" ref={shareMenuRef}>
                                <button 
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md font-sm min-w-[100px]"
                                >
                                    <Share className="mr-2 h-5 w-5" />
                                    Share
                                </button>
                                {showShareMenu && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 z-10 overflow-hidden">
                                        <div className="py-2">
                                            <button
                                                onClick={() => handleShare('twitter')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-150"
                                            >
                                                <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                                                Share on Twitter
                                            </button>
                                            <button
                                                onClick={() => handleShare('facebook')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-150"
                                            >
                                                <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                                                Share on Facebook
                                            </button>
                                            <button
                                                onClick={() => handleShare('linkedin')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-150"
                                            >
                                                <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                                                Share on LinkedIn
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                                            >
                                                <Link2 className="h-4 w-4 mr-3 text-gray-500" />
                                                {copiedStates['share-link'] ? 'Copied!' : 'Copy Link'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        {/* Documentation Content */}
                        {readmeLoading ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                                <div className="animate-pulse">
                                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/6"></div>
                                    </div>
                                </div>
                            </div>
                        ) : readmeData ? (
                            <StructuredReadme 
                                readme={readmeData}
                                copiedStates={copiedStates}
                                onCopy={copyToClipboard}
                            />
                        ) : server?.documentation?.readme ? (
                            <StructuredReadme 
                                readme={{
                                    filename: 'README.md',
                                    projectName: server.name,
                                    rawContent: server.documentation.readme
                                }}
                                copiedStates={copiedStates}
                                onCopy={copyToClipboard}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    About {server.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {server.fullDescription || server.description.en || server.description["zh-CN"]}
                                </p>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Detailed documentation is being processed. Please check back later or visit the repository for more information.
                                    </p>
                                    <a
                                        href={server.repository.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        <Link2 className="ml-1 h-4 w-4" />
                                        View Repository
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Content is now handled by StructuredReadme component above */}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="space-y-6">
                            {/* Quick Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Quick Info
                                </h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Category
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-white">
                                            {server.category}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Maturity
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-white">{server.metadata.maturity}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Repository
                                        </dt>
                                        <dd className="text-sm">
                                            <a
                                                href={server.repository.url}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {server.repository.owner}/{server.repository.name}
                                            </a>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Stars
                                        </dt>
                                        <dd className="text-sm text-gray-900 dark:text-white">
                                            {server.repository.stars.toLocaleString()}
                                        </dd>
                                    </div>
                                    {server.repository.forks !== undefined && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Forks
                                            </dt>
                                            <dd className="text-sm text-gray-900 dark:text-white">
                                                {server.repository.forks.toLocaleString()}
                                            </dd>
                                        </div>
                                    )}
                                    {server.repository.watchers !== undefined && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Watchers
                                            </dt>
                                            <dd className="text-sm text-gray-900 dark:text-white">
                                                {server.repository.watchers.toLocaleString()}
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Issues
                                        </dt>
                                        <dd className="text-sm">
                                            <a
                                                href={`${server.repository.url}/issues`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Issues
                                            </a>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Installation Options */}
                            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Installation
                                </h3>
                                <div className="space-y-3">
                                    {server.installation.npm && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <Package className="h-4 w-4 text-red-500 mr-2" />
                                                <span className="text-sm font-medium">
                                                    NPM
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(`npm install ${server.installation.npm}`, "sidebar-npm")}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                {copiedStates["sidebar-npm"] ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    )}
                                    {server.installation.pip && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <Package className="h-4 w-4 text-blue-500 mr-2" />
                                                <span className="text-sm font-medium">
                                                    Python
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(`pip install ${server.installation.pip}`, "sidebar-python")}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                {copiedStates["sidebar-python"] ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    )}
                                    {server.installation.docker && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <Package className="h-4 w-4 text-blue-600 mr-2" />
                                                <span className="text-sm font-medium">
                                                    Docker
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(server.installation.docker!, "sidebar-docker")}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                {copiedStates["sidebar-docker"] ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    )}
                                    {server.installation.uv && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <Package className="h-4 w-4 text-purple-500 mr-2" />
                                                <span className="text-sm font-medium">
                                                    UV
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(server.installation.uv!, "sidebar-uv")}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                            >
                                                {copiedStates["sidebar-uv"] ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    )}
                                    {!server.installation.npm && !server.installation.pip && !server.installation.docker && !server.installation.uv && (
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-500">See installation tab for detailed instructions</p>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Compatibility */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Compatibility
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Platforms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {server.compatibility.platforms.map(
                                                (platform) => (
                                                    <span
                                                        key={platform}
                                                        className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded"
                                                    >
                                                        {platform}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Languages
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {server.compatibility.pythonVersion && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                    Python {server.compatibility.pythonVersion}
                                                </span>
                                            )}
                                            {server.compatibility.nodeVersion && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                    Node.js {server.compatibility.nodeVersion}
                                                </span>
                                            )}
                                            {server.techStack.map(tech => (
                                                <span key={tech} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Servers */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Related Servers
                                </h3>
                                {relatedLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="animate-pulse p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg mr-3"></div>
                                                    <div>
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-1"></div>
                                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : relatedServers && relatedServers.length > 0 ? (
                                    <div className="space-y-3">
                                        {relatedServers.map((relatedServer) => {
                                            // Get category-based icon and color
                                            const getServerIcon = () => {
                                                const category = relatedServer.category?.toLowerCase() || '';
                                                const tags = relatedServer.tags?.join(' ').toLowerCase() || '';
                                                const combined = `${category} ${tags}`;
                                                
                                                if (combined.includes('database') || combined.includes('sql')) {
                                                    return <Database className="h-4 w-4 text-white" />;
                                                } else if (combined.includes('storage') || combined.includes('cloud') || combined.includes('s3')) {
                                                    return <Cloud className="h-4 w-4 text-white" />;
                                                } else if (combined.includes('search') || combined.includes('file')) {
                                                    return <Search className="h-4 w-4 text-white" />;
                                                } else if (combined.includes('communication') || combined.includes('slack') || combined.includes('messaging')) {
                                                    return <MessageCircle className="h-4 w-4 text-white" />;
                                                } else if (combined.includes('ai') || combined.includes('ml')) {
                                                    return <Brain className="h-4 w-4 text-white" />;
                                                } else if (combined.includes('development') || combined.includes('github') || combined.includes('git')) {
                                                    return <GitBranch className="h-4 w-4 text-white" />;
                                                } else {
                                                    return <Folder className="h-4 w-4 text-white" />;
                                                }
                                            };
                                            
                                            const getServerColor = () => {
                                                const category = relatedServer.category?.toLowerCase() || '';
                                                const tags = relatedServer.tags?.join(' ').toLowerCase() || '';
                                                const combined = `${category} ${tags}`;
                                                
                                                if (combined.includes('database') || combined.includes('sql')) {
                                                    return 'bg-green-600';
                                                } else if (combined.includes('storage') || combined.includes('cloud') || combined.includes('s3')) {
                                                    return 'bg-purple-600';
                                                } else if (combined.includes('search') || combined.includes('file')) {
                                                    return 'bg-orange-600';
                                                } else if (combined.includes('communication') || combined.includes('slack') || combined.includes('messaging')) {
                                                    return 'bg-blue-600';
                                                } else if (combined.includes('ai') || combined.includes('ml')) {
                                                    return 'bg-pink-600';
                                                } else if (combined.includes('development') || combined.includes('github') || combined.includes('git')) {
                                                    return 'bg-indigo-600';
                                                } else {
                                                    return 'bg-gray-600';
                                                }
                                            };
                                            
                                            return (
                                                <Link
                                                    key={relatedServer.id}
                                                    to={`/servers/${relatedServer.id}`}
                                                    className="block p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center flex-1 min-w-0">
                                                            <div className={`w-8 h-8 ${getServerColor()} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                                                                {getServerIcon()}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {relatedServer.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {relatedServer.description?.en || relatedServer.description?.["zh-CN"] || 'No description available'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-3">
                                                            <Star className="h-3 w-3 text-yellow-500" />
                                                            <span>{relatedServer.repository?.stars || 0}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No related servers found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Comments Section */}
                <div className="mt-8">
                    <ServerCommentsWithReplies serverId={server.id} />
                </div>
            </div>

            {/* CSS for hover effects */}
            <style>{`
                .code-block:hover .copy-button {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default ServerDetail;
