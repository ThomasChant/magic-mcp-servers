import React from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Star,
    Download,
    Github,
    ExternalLink,
    Copy,
    CheckCircle,
    AlertCircle,
    Users,
    TrendingUp,
} from "lucide-react";
import { useServer } from "../hooks/useData";

const ServerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: server, isLoading, error } = useServer(id!);

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
                    服务器未找到
                </h1>
                <p className="text-gray-600 mb-8">
                    抱歉，我们找不到您要查找的 MCP 服务器。
                </p>
                <Link
                    to="/servers"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回服务器列表
                </Link>
            </div>
        );
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // 这里可以添加一个 toast 通知
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                to="/servers"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回服务器列表
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {server.name}
                            </h1>
                            {server.verified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    已验证
                                </span>
                            )}
                            {server.featured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    特色推荐
                                </span>
                            )}
                        </div>
                        <p className="text-xl text-gray-600 mb-4">
                            {server.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {server.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                        <a
                            href={server.repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            查看源码
                        </a>
                        {server.documentation.readme && (
                            <a
                                href={server.documentation.readme}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                查看文档
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {server.repository.stars.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                            GitHub Stars
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                            <Download className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {server.usage.downloads.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">总下载量</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {server.quality.score}/100
                        </div>
                        <div className="text-sm text-gray-600">质量评分</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {server.usage.dependents}
                        </div>
                        <div className="text-sm text-gray-600">依赖项目</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Long Description */}
                    {server.longDescription && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                详细描述
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {server.longDescription}
                            </p>
                        </div>
                    )}

                    {/* Installation */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            安装方式
                        </h2>
                        <div className="space-y-4">
                            {server.installation.npm && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        NPM 安装
                                    </h3>
                                    <div className="relative">
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                            <code>
                                                {server.installation.npm}
                                            </code>
                                        </pre>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    server.installation.npm!
                                                )
                                            }
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {server.installation.pip && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Python 安装
                                    </h3>
                                    <div className="relative">
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                            <code>
                                                {server.installation.pip}
                                            </code>
                                        </pre>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    server.installation.pip!
                                                )
                                            }
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {server.installation.docker && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Docker 安装
                                    </h3>
                                    <div className="relative">
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                            <code>
                                                {server.installation.docker}
                                            </code>
                                        </pre>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    server.installation.docker!
                                                )
                                            }
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            质量指标
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(server.quality.factors).map(
                                ([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 capitalize">
                                                {key === "documentation"
                                                    ? "文档质量"
                                                    : key === "maintenance"
                                                    ? "维护状态"
                                                    : key === "community"
                                                    ? "社区活跃度"
                                                    : "性能表现"}
                                            </span>
                                            <span className="text-gray-900 font-medium">
                                                {value}/100
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Repository Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            仓库信息
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">所有者</span>
                                <span className="text-gray-900 font-medium">
                                    {server.repository.owner}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">仓库名</span>
                                <span className="text-gray-900 font-medium">
                                    {server.repository.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">最后更新</span>
                                <span className="text-gray-900">
                                    {new Date(
                                        server.repository.lastUpdated
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Compatibility */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            兼容性
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600 block mb-1">
                                    支持平台
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {server.compatibility.platforms.map(
                                        (platform) => (
                                            <span
                                                key={platform}
                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {platform}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            {server.compatibility.nodeVersion && (
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">
                                        Node.js 版本
                                    </span>
                                    <span className="text-gray-900">
                                        {server.compatibility.nodeVersion}
                                    </span>
                                </div>
                            )}

                            {server.compatibility.pythonVersion && (
                                <div>
                                    <span className="text-sm text-gray-600 block mb-1">
                                        Python 版本
                                    </span>
                                    <span className="text-gray-900">
                                        {server.compatibility.pythonVersion}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            相关链接
                        </h3>
                        <div className="space-y-3">
                            <a
                                href={server.repository.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                <Github className="mr-2 h-4 w-4" />
                                GitHub 仓库
                            </a>
                            {server.documentation.readme && (
                                <a
                                    href={server.documentation.readme}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    文档
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerDetail;
