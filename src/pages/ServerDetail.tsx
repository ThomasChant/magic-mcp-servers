import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Star,
    Download,
    GitBranch,
    Copy,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Folder,
    Heart,
    Share,
    Calendar,
    Package,
    Database,
    Cloud,
    Search,
    Eye,
    GitFork,
    MessageSquare,
    Twitter,
    Facebook,
    Linkedin,
    Link2,
} from "lucide-react";
import { useServer, useServerReadme } from "../hooks/useData";

const ServerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: server, isLoading, error } = useServer(id!);
    const { data: readmeData } = useServerReadme(id!);
    const [activeTab, setActiveTab] = useState("overview");
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<Array<{ id: string; text: string; author: string; date: string }>>([]);
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
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                    <div className="h-12 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Server Not Found
                </h1>
                <p className="text-gray-600 mb-8">
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
                setCopiedStates({ ...copiedStates, [buttonId]: true });
                setTimeout(() => {
                    setCopiedStates({ ...copiedStates, [buttonId]: false });
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

    const handleAddComment = () => {
        if (commentText.trim()) {
            const newComment = {
                id: Date.now().toString(),
                text: commentText,
                author: "Anonymous User",
                date: new Date().toLocaleDateString()
            };
            setComments([...comments, newComment]);
            setCommentText("");
        }
    };

    const tabs = [
        { id: "overview", name: "Overview" },
        { id: "installation", name: "Installation" },
        { id: "examples", name: "Examples" },
        { id: "api-reference", name: "API Reference" },
        { id: "comments", name: "Comments" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-500 hover:text-gray-700"
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
                                    className="text-gray-500 hover:text-gray-700"
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
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    File System
                                </Link>
                            </li>
                            <li>
                                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </li>
                            <li className="text-gray-900 font-medium">
                                {server.name}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Server Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start space-x-4 mb-6 lg:mb-0">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Folder className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
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
                                <p className="text-lg text-gray-600 mb-4">
                                    {server.longDescription || server.description}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        <span className="font-medium text-gray-900">
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
                                        <span>Updated 2 days ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                            <a
                                href={server.repository.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium min-w-[140px]"
                            >
                                <GitBranch className="mr-2 h-5 w-5" />
                                View on GitHub
                            </a>
                            <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium min-w-[140px]">
                                <Heart className="mr-2 h-5 w-5" />
                                Add to Favorites
                            </button>
                            <div className="relative" ref={shareMenuRef}>
                                <button 
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium min-w-[100px]"
                                >
                                    <Share className="mr-2 h-5 w-5" />
                                    Share
                                </button>
                                {showShareMenu && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
                                        <div className="py-2">
                                            <button
                                                onClick={() => handleShare('twitter')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                            >
                                                <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                                                Share on Twitter
                                            </button>
                                            <button
                                                onClick={() => handleShare('facebook')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                            >
                                                <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                                                Share on Facebook
                                            </button>
                                            <button
                                                onClick={() => handleShare('linkedin')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                            >
                                                <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                                                Share on LinkedIn
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
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
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "overview" && (
                            <div className="prose max-w-none">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    About {server.name}
                                </h2>
                                
                                {readmeData?.overview ? (
                                    <div>
                                        <div className="text-gray-600 mb-6 whitespace-pre-wrap">
                                            {readmeData.overview.content}
                                        </div>
                                        
                                        {readmeData.overview.code_blocks.length > 0 && (
                                            <div className="space-y-4 mb-6">
                                                {readmeData.overview.code_blocks.map((block, index) => (
                                                    <div key={index} className="code-block relative bg-gray-900 rounded-lg p-4">
                                                        <button
                                                            onClick={() => copyToClipboard(block.code, `overview-code-${index}`)}
                                                            className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                        >
                                                            {copiedStates[`overview-code-${index}`] ? (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="h-4 w-4 mr-1 inline" />
                                                                    Copy
                                                                </>
                                                            )}
                                                        </button>
                                                        <pre className="text-green-400 text-sm">
                                                            <code>{block.code}</code>
                                                        </pre>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {readmeData.overview.subsections.length > 0 && (
                                            <div className="space-y-6">
                                                {readmeData.overview.subsections.map((subsection, index) => (
                                                    <div key={index}>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                            {subsection.title}
                                                        </h3>
                                                        <div className="text-gray-600 whitespace-pre-wrap">
                                                            {subsection.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-600 mb-6">
                                            {server.longDescription || server.description}
                                        </p>
                                        
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Detailed documentation is being processed. Please check back later or visit the repository for more information.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "installation" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Installation Guide
                                </h2>

                                {readmeData?.installation ? (
                                    <div>
                                        <div className="text-gray-600 mb-6 whitespace-pre-wrap">
                                            {readmeData.installation.content}
                                        </div>
                                        
                                        {readmeData.installation.code_blocks.length > 0 && (
                                            <div className="space-y-6">
                                                {readmeData.installation.code_blocks.map((block, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                                            <button
                                                                onClick={() => copyToClipboard(block.code, `install-code-${index}`)}
                                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                            >
                                                                {copiedStates[`install-code-${index}`] ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-4 w-4 mr-1 inline" />
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                            <pre className="text-green-400 text-sm">
                                                                <code>{block.code}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {readmeData.installation.subsections.length > 0 && (
                                            <div className="space-y-6 mt-6">
                                                {readmeData.installation.subsections.map((subsection, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            {subsection.title}
                                                        </h3>
                                                        <div className="text-gray-600 whitespace-pre-wrap">
                                                            {subsection.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Fallback installation methods from server data */}
                                        {server.installation.npm && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Package className="h-5 w-5 text-red-500 mr-2" />
                                                    NPM Installation
                                                </h3>
                                                <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                                    <button
                                                        onClick={() => copyToClipboard(server.installation.npm!, "fallback-npm")}
                                                        className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                    >
                                                        {copiedStates["fallback-npm"] ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4 mr-1 inline" />
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                    <pre className="text-green-400 text-sm">
                                                        <code>{server.installation.npm}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {server.installation.pip && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Package className="h-5 w-5 text-blue-500 mr-2" />
                                                    Python Installation
                                                </h3>
                                                <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                                    <button
                                                        onClick={() => copyToClipboard(server.installation.pip!, "fallback-pip")}
                                                        className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                    >
                                                        {copiedStates["fallback-pip"] ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4 mr-1 inline" />
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                    <pre className="text-green-400 text-sm">
                                                        <code>{server.installation.pip}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {server.installation.docker && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                                                    Docker Installation
                                                </h3>
                                                <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                                    <button
                                                        onClick={() => copyToClipboard(server.installation.docker!, "fallback-docker")}
                                                        className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                    >
                                                        {copiedStates["fallback-docker"] ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4 mr-1 inline" />
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                    <pre className="text-green-400 text-sm">
                                                        <code>{server.installation.docker}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "examples" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Usage Examples
                                </h2>

                                {readmeData?.examples ? (
                                    <div>
                                        <div className="text-gray-600 mb-6 whitespace-pre-wrap">
                                            {readmeData.examples.content}
                                        </div>
                                        
                                        {readmeData.examples.code_blocks.length > 0 && (
                                            <div className="space-y-6">
                                                {readmeData.examples.code_blocks.map((block, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                                            <span className="absolute top-2 left-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                                {block.language}
                                                            </span>
                                                            <button
                                                                onClick={() => copyToClipboard(block.code, `example-code-${index}`)}
                                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                            >
                                                                {copiedStates[`example-code-${index}`] ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-4 w-4 mr-1 inline" />
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                            <pre className="text-green-400 text-sm mt-6">
                                                                <code>{block.code}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {readmeData.examples.subsections.length > 0 && (
                                            <div className="space-y-6 mt-6">
                                                {readmeData.examples.subsections.map((subsection, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            {subsection.title}
                                                        </h3>
                                                        <div className="text-gray-600 whitespace-pre-wrap">
                                                            {subsection.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <p className="text-gray-600">
                                            No usage examples available. Please check the repository documentation for more information.
                                        </p>
                                        <a
                                            href={server.repository.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
                                        >
                                            View Repository
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "api-reference" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    API Reference
                                </h2>

                                {readmeData?.api_reference ? (
                                    <div>
                                        <div className="text-gray-600 mb-6 whitespace-pre-wrap">
                                            {readmeData.api_reference.content}
                                        </div>
                                        
                                        {readmeData.api_reference.code_blocks.length > 0 && (
                                            <div className="space-y-6 mb-6">
                                                {readmeData.api_reference.code_blocks.map((block, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                                            <span className="absolute top-2 left-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                                {block.language}
                                                            </span>
                                                            <button
                                                                onClick={() => copyToClipboard(block.code, `api-code-${index}`)}
                                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                                            >
                                                                {copiedStates[`api-code-${index}`] ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-1 inline" />
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-4 w-4 mr-1 inline" />
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                            <pre className="text-green-400 text-sm mt-6">
                                                                <code>{block.code}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {readmeData.api_reference.subsections.length > 0 && (
                                            <div className="space-y-6">
                                                {readmeData.api_reference.subsections.map((subsection, index) => (
                                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            {subsection.title}
                                                        </h3>
                                                        <div className="text-gray-600 whitespace-pre-wrap">
                                                            {subsection.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <p className="text-gray-600">
                                            API reference documentation is not available. Please check the repository for detailed API information.
                                        </p>
                                        <a
                                            href={server.repository.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
                                        >
                                            View Repository Documentation
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "comments" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Comments
                                </h2>

                                {/* Add Comment Form */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Add a Comment
                                    </h3>
                                    <div className="space-y-4">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Share your thoughts about this MCP server..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={4}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2 inline" />
                                                Post Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No comments yet. Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm font-semibold">
                                                                {comment.author.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{comment.author}</h4>
                                                            <p className="text-sm text-gray-500">{comment.date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="space-y-6">
                            {/* Quick Info */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Quick Info
                                </h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Version
                                        </dt>
                                        <dd className="text-sm text-gray-900">
                                            v2.1.4
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            License
                                        </dt>
                                        <dd className="text-sm text-gray-900">MIT</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Repository
                                        </dt>
                                        <dd className="text-sm">
                                            <a
                                                href={server.repository.url}
                                                className="text-blue-600 hover:text-blue-700"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {server.repository.owner}/{server.repository.name}
                                            </a>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Stars
                                        </dt>
                                        <dd className="text-sm text-gray-900">
                                            {server.repository.stars.toLocaleString()}
                                        </dd>
                                    </div>
                                    {server.repository.forks !== undefined && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Forks
                                            </dt>
                                            <dd className="text-sm text-gray-900">
                                                {server.repository.forks.toLocaleString()}
                                            </dd>
                                        </div>
                                    )}
                                    {server.repository.watchers !== undefined && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Watchers
                                            </dt>
                                            <dd className="text-sm text-gray-900">
                                                {server.repository.watchers.toLocaleString()}
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Issues
                                        </dt>
                                        <dd className="text-sm">
                                            <a
                                                href={`${server.repository.url}/issues`}
                                                className="text-blue-600 hover:text-blue-700"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {server.repository.openIssues !== undefined 
                                                    ? `${server.repository.openIssues} open issues`
                                                    : '12 open issues'
                                                }
                                            </a>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Installation Options */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Installation
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 text-red-500 mr-2" />
                                            <span className="text-sm font-medium">
                                                NPM
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard("npx @modelcontextprotocol/server-filesystem", "sidebar-npm")}
                                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            {copiedStates["sidebar-npm"] ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 text-blue-500 mr-2" />
                                            <span className="text-sm font-medium">
                                                Python
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard("pip install mcp-server-filesystem", "sidebar-python")}
                                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            {copiedStates["sidebar-python"] ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 text-blue-600 mr-2" />
                                            <span className="text-sm font-medium">
                                                Docker
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard("docker run mcphub/filesystem-server", "sidebar-docker")}
                                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            {copiedStates["sidebar-docker"] ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Compatibility */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Compatibility
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Platforms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {server.compatibility.platforms.map(
                                                (platform) => (
                                                    <span
                                                        key={platform}
                                                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                    >
                                                        {platform}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
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
                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                TypeScript
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Servers */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Related Servers
                                </h3>
                                <div className="space-y-3">
                                    <Link
                                        to="/servers/sqlite-mcp"
                                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                                <Database className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    SQLite MCP
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Database operations
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        to="/servers/aws-s3-mcp"
                                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                                <Cloud className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    AWS S3 MCP
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Cloud storage
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        to="/servers/search-mcp"
                                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                                                <Search className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    Search MCP
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    File search
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
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
