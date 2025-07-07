import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Star,
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
    FileText,
    MessageSquare,
    Copy,
    CheckCircle,
    ExternalLink,
    Code2,
    Terminal,
} from "lucide-react";
import { useServer, useServerReadme } from "../hooks/useUnifiedData";
import { useRelatedServers } from "../hooks/useRelatedServers";
import StructuredReadme from "../components/StructuredReadme";
import ServerCommentsWithReplies from "../components/ServerCommentsWithReplies";
import { FavoriteButton } from "../components/FavoriteButton";
import VoteButtons from "../components/VoteButtons";
import ServerTooltip from "../components/ServerTooltip";
import InstallationTab from "../components/InstallationTab";
import APIReferenceTab from "../components/APIReferenceTab";
import { ClientOnly } from "../components/ClientOnly";
const ServerDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: server, isLoading, error } = useServer(slug!);
    console.log("server", server)

    const { relatedServers, isLoading: relatedLoading } = useRelatedServers(server, 30);
    const [activeTab, setActiveTab] = useState<'overview' | 'installation' | 'api-reference' | 'comments'>('overview');
    const { data: readmeData, isLoading: readmeLoading } = useServerReadme(server?.id || '');
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

    // Extract MCP configuration from README content
    const extractConfigFromReadme = () => {
        if (!readmeData?.rawContent && !server?.documentation?.readme) {
            return null;
        }

        const content = readmeData?.rawContent || server?.documentation?.readme || '';
        
        // Look for JSON code blocks that contain mcpServers configuration
        const codeBlockRegex = /```(?:json|javascript)?\s*\n?([\s\S]*?)\n?```/gi;
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            try {
                const jsonStr = match[1].trim();
                const parsed = JSON.parse(jsonStr);
                
                // Check if this JSON contains mcpServers configuration
                if (parsed.mcpServers || parsed.command || parsed.args) {
                    if (parsed.mcpServers) {
                        return parsed;
                    } else if (parsed.command || parsed.args) {
                        // If it's a single server config, wrap it
                        return {
                            mcpServers: {
                                [server.name]: parsed
                            }
                        };
                    }
                }
            } catch (error) {
                // Continue searching if JSON parse fails
                console.error('Error extracting config from README:', error);
                continue;
            }
        }
        
        return null;
    };

    // Get the configuration to use (from README or generated)
    const getMcpConfiguration = () => {
        try {
            const extractedConfig = extractConfigFromReadme();
            if (extractedConfig && extractedConfig.mcpServers && Object.keys(extractedConfig.mcpServers).length > 0) {
                return extractedConfig;
            }
        } catch (error) {
            console.error('Error extracting config from README:', error);
        }

        // Fallback to generated configuration
        const fallbackConfig = {
            mcpServers: {
                [server.name]: {
                    command: server.installation?.npm 
                        ? "npx" 
                        : server.installation?.pip
                        ? "python"
                        : "node",
                    args: server.installation?.npm 
                        ? ["-y", server.installation.npm]
                        : server.installation?.pip
                        ? ["-m", server.installation.pip]
                        : ["index.js"]
                }
            }
        };

        return fallbackConfig;
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
                    <div className="w-full">
                        <div className="flex items-start space-x-4 w-full">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Folder className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                                    <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {server.name}
                                        </h1>
                                        <div className="flex items-center space-x-2">
                                            {server.official && (
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
                                    <div className="flex flex-row items-center gap-2">
                                        {/* <a
                                            href={server.repository.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                            title="View on GitHub"
                                        >
                                            <GitBranch className="h-4 w-4" />
                                        </a> */}
                                        <ClientOnly>
                                            <FavoriteButton
                                                serverId={server.id}
                                                showText={false}
                                                size="sm"
                                                className="shadow-sm hover:shadow-md"
                                            />
                                        </ClientOnly>
                                        <div className="relative" ref={shareMenuRef}>
                                            <button
                                                onClick={() =>
                                                    setShowShareMenu(!showShareMenu)
                                                }
                                                className="inline-flex items-center justify-center w-8 h-8 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                                title="Share"
                                            >
                                                <Share className="h-4 w-4" />
                                            </button>
                                            {showShareMenu && (
                                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 z-10 overflow-hidden">
                                                    <div className="py-2">
                                                        <button
                                                            onClick={() =>
                                                                handleShare("twitter")
                                                            }
                                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                                        >
                                                            <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                                                            Share on Twitter
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleShare("facebook")
                                                            }
                                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                                        >
                                                            <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                                                            Share on Facebook
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleShare("linkedin")
                                                            }
                                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                                        >
                                                            <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                                                            Share on LinkedIn
                                                        </button>
                                                        <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                                                        <button
                                                            onClick={() =>
                                                                handleShare("copy")
                                                            }
                                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                                                        >
                                                            <Link2 className="h-4 w-4 mr-3 text-gray-500" />
                                                            {copiedStates["share-link"]
                                                                ? "Copied!"
                                                                : "Copy Link"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                    {server.fullDescription || server.description.en || server.description["zh-CN"]}

                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <ClientOnly>
                                        <VoteButtons
                                            serverId={server.id}
                                            size="md"
                                            showScore={true}
                                            className="flex items-center"
                                        />
                                    </ClientOnly>
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
                                            <span>
                                                {server.repository.forks.toLocaleString()}{" "}
                                                forks
                                            </span>
                                        </div>
                                    )}
                                    {server.repository.watchers !==
                                        undefined && (
                                        <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            <span>
                                                {server.repository.watchers.toLocaleString()}{" "}
                                                watchers
                                            </span>
                                        </div>
                                    )}
                                    {/* <div className="flex items-center">
                                        <Download className="h-4 w-4 mr-1" />
                                        <span>{server.usage.downloads.toLocaleString()} downloads</span>
                                    </div> */}
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            CreatedAt{" "}
                                            {server.stats.createdAt
                                                ? new Date(
                                                      server.stats.createdAt
                                                  ).toLocaleDateString()
                                                : "Recently"}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            Updated{" "}
                                            {server.stats.lastUpdated
                                                ? new Date(
                                                      server.stats.lastUpdated
                                                  ).toLocaleDateString()
                                                : "Recently"}
                                        </span>
                                    </div>
                                </div>

                                {/* Tags Section */}
                                {server.tags && server.tags.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            {server.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded font-medium hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                                                >
                                                    <Link to={`/tags/${tag}`}>#{tag}</Link>
                                                </span>
                                            ))}
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
                    {/* Main Content with Tabs */}
                    <div className="lg:w-2/3">
                        {/* Tab Navigation */}
                        <div className="bg-white dark:bg-gray-800 rounded-t-xl border border-gray-200 dark:border-gray-700 border-b-0">
                            <div className="flex space-x-0">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'overview'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Overview
                                </button>
                               
                                <button
                                    onClick={() => setActiveTab('installation')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'installation'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}
                                >
                                    <Terminal className="h-4 w-4 mr-2" />
                                    Installation
                                </button>
                                
                                <button
                                    onClick={() => setActiveTab('api-reference')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'api-reference'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}
                                >
                                    <Code2 className="h-4 w-4 mr-2" />
                                    API Reference
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'comments'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Comments
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-b-xl border border-gray-200 dark:border-gray-700 border-t-0">
                            {activeTab === 'overview' ? (
                                <div className="p-6">
                                    {/* Documentation Content */}
                                    {readmeLoading ? (
                                        <div className="animate-pulse">
                                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-1/3"></div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/6"></div>
                                            </div>
                                        </div>
                                    ) : readmeData ? (
                                        <div className="-m-6">
                                            <StructuredReadme 
                                                readme={readmeData}
                                                copiedStates={copiedStates}
                                                onCopy={copyToClipboard}
                                            />
                                        </div>
                                    ) : server?.documentation?.readme ? (
                                        <div className="-m-6">
                                            <StructuredReadme 
                                                readme={{
                                                    filename: 'README.md',
                                                    projectName: server.name,
                                                    rawContent: server.documentation.readme
                                                }}
                                                copiedStates={copiedStates}
                                                onCopy={copyToClipboard}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                                About {server.name}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                                {server.fullDescription ||
                                                    server.description.en ||
                                                    server.description["zh-CN"]}
                                            </p>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Detailed documentation is being
                                                    processed. Please check back later or
                                                    visit the repository for more
                                                    information.
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
                                </div>
                            ) : activeTab === 'installation' ? (
                                <InstallationTab
                                    installation={readmeData?.extractedInstallation}
                                    repositoryUrl={server.repository.url}
                                    copiedStates={copiedStates}
                                    onCopy={copyToClipboard}
                                />
                            ) : activeTab === 'api-reference' ? (
                                <APIReferenceTab
                                    apiReference={readmeData?.extractedApiReference}
                                    repositoryUrl={server.repository.url}
                                    copiedStates={copiedStates}
                                    onCopy={copyToClipboard}
                                />
                            ) : activeTab === 'comments' ? (
                                <div className="p-6">
                                    {/* Comments Section */}
                                    <ClientOnly>
                                        <ServerCommentsWithReplies serverId={server.id} />
                                    </ClientOnly>
                                </div>
                            ) : (
                                <div className="p-6">
                                    {/* Config Section */}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                        MCP Server Configuration
                                    </h3>
                                    
                                    {/* Configuration JSON */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Configuration JSON
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {extractConfigFromReadme() 
                                                        ? "Extracted from README documentation" 
                                                        : "Auto-generated based on installation method"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const config = getMcpConfiguration();
                                                    copyToClipboard(JSON.stringify(config, null, 2), 'config-json');
                                                }}
                                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    copiedStates['config-json']
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                {copiedStates['config-json'] ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Configuration
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                            <code className="text-sm">{JSON.stringify(getMcpConfiguration(), null, 2)}</code>
                                        </pre>
                                    </div>

                                    {/* Quick Open in Clients */}
                                    <div className="mb-8">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Quick Open in AI Clients
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Claude Desktop */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <Terminal className="h-5 w-5 text-blue-600 mr-2" />
                                                        <h5 className="font-medium text-gray-900 dark:text-white">Claude Desktop</h5>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const fullConfig = getMcpConfiguration();
                                                            const serverConfig = fullConfig.mcpServers[server.name] || Object.values(fullConfig.mcpServers)[0];
                                                            copyToClipboard(JSON.stringify({ [server.name]: serverConfig }, null, 2), 'claude-config');
                                                        }}
                                                        className={`text-xs px-3 py-1.5 rounded transition-colors flex-shrink-0 ${
                                                            copiedStates['claude-config']
                                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                    >
                                                        {copiedStates['claude-config'] ? 'Copied!' : 'Copy Config'}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    Add to your Claude Desktop config file
                                                </p>
                                                
                                                {/* macOS Path */}
                                                <div className="mb-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">macOS:</span>
                                                        <button
                                                            onClick={() => copyToClipboard(`~/Library/Application Support/Claude/claude_desktop_config.json`, 'claude-path-mac')}
                                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                copiedStates['claude-path-mac']
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                            }`}
                                                        >
                                                            {copiedStates['claude-path-mac'] ? 'Copied!' : 'Copy'}
                                                        </button>
                                                    </div>
                                                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block w-full break-all">
                                                        ~/Library/Application Support/Claude/claude_desktop_config.json
                                                    </code>
                                                </div>

                                                {/* Windows Path */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Windows:</span>
                                                        <button
                                                            onClick={() => copyToClipboard(`%APPDATA%\\Claude\\claude_desktop_config.json`, 'claude-path-win')}
                                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                copiedStates['claude-path-win']
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                            }`}
                                                        >
                                                            {copiedStates['claude-path-win'] ? 'Copied!' : 'Copy'}
                                                        </button>
                                                    </div>
                                                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block w-full break-all">
                                                        %APPDATA%\Claude\claude_desktop_config.json
                                                    </code>
                                                </div>
                                            </div>

                                            {/* Cursor */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <Code2 className="h-5 w-5 text-purple-600 mr-2" />
                                                        <h5 className="font-medium text-gray-900 dark:text-white">Cursor</h5>
                                                    </div>
                                                    <a
                                                        href={(() => {
                                                            try {
                                                                const fullConfig = getMcpConfiguration();
                                                                const serverConfig = fullConfig.mcpServers[server.name] || Object.values(fullConfig.mcpServers)[0];
                                                                
                                                                if (!serverConfig) {
                                                                    return '#';
                                                                }
                                                                
                                                                // For Cursor, we need to format the command properly
                                                                const cursorConfig = {
                                                                    command: Array.isArray(serverConfig.args) && serverConfig.args.length > 0
                                                                        ? `${serverConfig.command} ${serverConfig.args.join(' ')}`
                                                                        : serverConfig.command || 'node index.js'
                                                                };
                                                                
                                                                const encodedConfig = btoa(JSON.stringify(cursorConfig));
                                                                return `https://cursor.com/en/install-mcp?name=${encodeURIComponent(server.name)}&config=${encodeURIComponent(encodedConfig)}`;
                                                            } catch (error) {
                                                                console.error('Error generating Cursor URL:', error);
                                                                return '#';
                                                            }
                                                        })()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition-colors flex-shrink-0"
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        Quick Install
                                                    </a>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    Click to install directly in Cursor
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Install URL:</span>
                                                        <button
                                                            onClick={() => {
                                                                try {
                                                                    const fullConfig = getMcpConfiguration();
                                                                    const serverConfig = fullConfig.mcpServers[server.name] || Object.values(fullConfig.mcpServers)[0];
                                                                    
                                                                    if (!serverConfig) {
                                                                        copyToClipboard('Configuration not available', 'cursor-url');
                                                                        return;
                                                                    }
                                                                    
                                                                    // For Cursor, we need to format the command properly
                                                                    const cursorConfig = {
                                                                        command: Array.isArray(serverConfig.args) && serverConfig.args.length > 0
                                                                            ? `${serverConfig.command} ${serverConfig.args.join(' ')}`
                                                                            : serverConfig.command || 'node index.js'
                                                                    };
                                                                    
                                                                    const encodedConfig = btoa(JSON.stringify(cursorConfig));
                                                                    const url = `https://cursor.com/en/install-mcp?name=${encodeURIComponent(server.name)}&config=${encodeURIComponent(encodedConfig)}`;
                                                                    copyToClipboard(url, 'cursor-url');
                                                                } catch (error) {
                                                                    console.error('Error generating Cursor URL:', error);
                                                                    copyToClipboard('Error generating URL', 'cursor-url');
                                                                }
                                                            }}
                                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                copiedStates['cursor-url']
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                            }`}
                                                        >
                                                            {copiedStates['cursor-url'] ? 'Copied!' : 'Copy URL'}
                                                        </button>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border">
                                                        <code className="text-xs text-gray-700 dark:text-gray-300 break-all leading-relaxed">
                                                            {(() => {
                                                                try {
                                                                    const fullConfig = getMcpConfiguration();
                                                                    const serverConfig = fullConfig.mcpServers[server.name] || Object.values(fullConfig.mcpServers)[0];
                                                                    
                                                                    if (!serverConfig) {
                                                                        return 'Configuration not available';
                                                                    }
                                                                    
                                                                    // For Cursor, we need to format the command properly
                                                                    const cursorConfig = {
                                                                        command: Array.isArray(serverConfig.args) && serverConfig.args.length > 0
                                                                            ? `${serverConfig.command} ${serverConfig.args.join(' ')}`
                                                                            : serverConfig.command || 'node index.js'
                                                                    };
                                                                    
                                                                    const encodedConfig = btoa(JSON.stringify(cursorConfig));
                                                                    return `https://cursor.com/en/install-mcp?name=${encodeURIComponent(server.name)}&config=${encodeURIComponent(encodedConfig)}`;
                                                                } catch (error) {
                                                                    console.error('Error generating Cursor URL:', error);
                                                                    return 'Error generating URL';
                                                                }
                                                            })()}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cline */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <Terminal className="h-5 w-5 text-green-600 mr-2" />
                                                        <h5 className="font-medium text-gray-900 dark:text-white">Cline</h5>
                                                    </div>
                                                    <a
                                                        href="https://github.com/cline/cline#mcp-support"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors flex-shrink-0"
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        Docs
                                                    </a>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    VS Code extension with MCP support
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Setup:</span>
                                                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                        Settings → MCP Servers
                                                    </code>
                                                </div>
                                            </div>

                                            {/* Others */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <Code2 className="h-5 w-5 text-orange-600 mr-2" />
                                                        <h5 className="font-medium text-gray-900 dark:text-white">Other Clients</h5>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    Works with any MCP-compatible client
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Compatible with:</span>
                                                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                        Claude Code, Void, Trae, etc.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Installation Instructions */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                            Quick Setup Instructions
                                        </h4>
                                        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                            <li>1. Copy the configuration JSON above</li>
                                            <li>2. Open your AI client's MCP configuration file</li>
                                            <li>3. Paste the configuration into the mcpServers section</li>
                                            <li>4. Restart your AI client to load the new server</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>

                    
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
                                                {server.repository.owner}/
                                                {server.repository.name}
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
                                    {server.repository.watchers !==
                                        undefined && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Watchers
                                            </dt>
                                            <dd className="text-sm text-gray-900 dark:text-white">
                                                {server.repository.watchers.toLocaleString()}
                                            </dd>
                                        </div>
                                    )}
                                    {/* <div>
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
                                    </div> */}
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

                            {/* Tags Section */}
                            {server.tags && server.tags.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {server.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded font-medium"
                                            >
                                                <Link to={`/servers?tag=${tag}`}>#{tag}</Link>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                            {server.compatibility
                                                .pythonVersion && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                    Python{" "}
                                                    {
                                                        server.compatibility
                                                            .pythonVersion
                                                    }
                                                </span>
                                            )}
                                            {server.compatibility
                                                .nodeVersion && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                    Node.js{" "}
                                                    {
                                                        server.compatibility
                                                            .nodeVersion
                                                    }
                                                </span>
                                            )}
                                            {server.techStack.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                    {/* Related Servers Section */}
                    <div className="mt-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Related Servers
                                </h3>
                                {relatedLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="animate-pulse p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg mr-3"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : relatedServers && relatedServers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {relatedServers.map((relatedServer) => {
                                            // Get category-based icon and color
                                            const getServerIcon = () => {
                                                const category = relatedServer.category?.toLowerCase() || '';
                                                const tags = relatedServer.tags?.join(' ').toLowerCase() || '';
                                                const combined = `${category} ${tags}`;
                                                
                                                if (combined.includes('database') || combined.includes('sql')) {
                                                    return <Database className="h-5 w-5 text-white" />;
                                                } else if (combined.includes('storage') || combined.includes('cloud') || combined.includes('s3')) {
                                                    return <Cloud className="h-5 w-5 text-white" />;
                                                } else if (combined.includes('search') || combined.includes('file')) {
                                                    return <Search className="h-5 w-5 text-white" />;
                                                } else if (combined.includes('communication') || combined.includes('slack') || combined.includes('messaging')) {
                                                    return <MessageCircle className="h-5 w-5 text-white" />;
                                                } else if (combined.includes('ai') || combined.includes('ml')) {
                                                    return <Brain className="h-5 w-5 text-white" />;
                                                } else if (combined.includes('development') || combined.includes('github') || combined.includes('git')) {
                                                    return <GitBranch className="h-5 w-5 text-white" />;
                                                } else {
                                                    return <Folder className="h-5 w-5 text-white" />;
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
                                            
                                            const fullDescription = relatedServer.fullDescription || 
                                                relatedServer.description?.en || 
                                                relatedServer.description?.["zh-CN"] || 
                                                'No description available';
                                                
                                            const shortDescription = fullDescription.length > 80 
                                                ? fullDescription.substring(0, 80) + '...' 
                                                : fullDescription;
                                            
                                            return (
                                                <ServerTooltip
                                                    key={relatedServer.id}
                                                    server={relatedServer}
                                                    delay={300}
                                                >
                                                    <Link
                                                        to={`/servers/${relatedServer.slug}`}
                                                        className="group block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                                                    >
                                                        <div className="flex items-start space-x-3 mb-3">
                                                            <div className={`w-10 h-10 ${getServerColor()} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                                                                {getServerIcon()}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={relatedServer.name}>
                                                                    {relatedServer.name}
                                                                </h4>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {relatedServer.category}
                                                                    </span>
                                                                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                                                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                                                        <span>{relatedServer.repository?.stars || 0}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                                            {shortDescription}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 mt-3">
                                                            {relatedServer.tags?.slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="inline-flex items-center px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-[10px] rounded font-medium"
                                                                >
                                                                   <Link to={`/servers?tag=${tag}`} > #{tag}</Link>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </Link>
                                                </ServerTooltip>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <h4 className="text-lg font-medium mb-2">No related servers found</h4>
                                        <p className="text-sm">We couldn't find any servers related to this one.</p>
                                    </div>
                                )}
                            </div>
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
