import React from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Code,
    ExternalLink,
    Download,
    Terminal,
    Users,
    Zap,
    Shield,
    ArrowRight,
} from "lucide-react";

const Docs: React.FC = () => {
    const sections = [
        {
            title: "快速开始",
            description: "了解 MCP 基础概念并运行您的第一个服务器",
            icon: Zap,
            color: "bg-blue-100 text-blue-600",
            items: [
                "什么是 Model Context Protocol?",
                "安装 MCP 工具",
                "创建您的第一个 MCP 服务器",
                "集成到 AI 应用中",
            ],
        },
        {
            title: "开发指南",
            description: "深入了解如何开发和部署 MCP 服务器",
            icon: Code,
            color: "bg-green-100 text-green-600",
            items: [
                "MCP 协议规范",
                "服务器开发最佳实践",
                "API 参考文档",
                "调试和测试",
            ],
        },
        {
            title: "部署指南",
            description: "学习如何在生产环境中部署 MCP 服务器",
            icon: Shield,
            color: "bg-purple-100 text-purple-600",
            items: ["生产环境配置", "安全最佳实践", "性能优化", "监控和日志"],
        },
        {
            title: "社区资源",
            description: "加入 MCP 社区并获取更多资源",
            icon: Users,
            color: "bg-orange-100 text-orange-600",
            items: ["GitHub 讨论区", "示例项目", "贡献指南", "常见问题解答"],
        },
    ];

    const quickLinks = [
        {
            title: "MCP 官方文档",
            description: "查看官方的 Model Context Protocol 文档",
            url: "https://modelcontextprotocol.io/introduction",
            icon: BookOpen,
        },
        {
            title: "GitHub 仓库",
            description: "浏览 MCP 相关的开源项目",
            url: "https://github.com/punkpeye/awesome-mcp-servers",
            icon: Code,
        },
        {
            title: "开发工具",
            description: "下载 MCP 开发工具和 SDK",
            url: "/servers?category=development",
            icon: Download,
        },
        {
            title: "示例代码",
            description: "查看 MCP 服务器实现示例",
            url: "/servers?featured=true",
            icon: Terminal,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    MCP 开发文档
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    学习如何使用 Model Context Protocol 构建强大的 AI
                    应用集成解决方案
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://modelcontextprotocol.io/introduction"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <BookOpen className="mr-2 h-5 w-5" />
                        查看官方文档
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                    <Link
                        to="/servers"
                        className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        浏览服务器
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* What is MCP Section */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 mb-16 text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">
                        什么是 Model Context Protocol?
                    </h2>
                    <div className="text-lg text-primary-100 space-y-4 mb-8">
                        <p>
                            Model Context Protocol (MCP)
                            是一个开放协议，旨在标准化AI模型与外部数据源和工具的连接方式。
                            它就像是AI应用的"USB-C端口"，为AI模型提供了一种统一的方式来访问各种外部资源。
                        </p>
                        <p>
                            通过 MCP，开发者可以轻松地将 AI
                            模型连接到数据库、API、文件系统和其他服务，
                            而无需为每个集成编写自定义代码。
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                标准化连接
                            </h3>
                            <p className="text-sm text-primary-100">
                                统一的协议规范，简化AI应用与外部系统的集成
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                开放生态
                            </h3>
                            <p className="text-sm text-primary-100">
                                开源协议，社区驱动，支持多种编程语言和平台
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                易于扩展
                            </h3>
                            <p className="text-sm text-primary-100">
                                模块化设计，支持快速开发和部署新的集成功能
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentation Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {sections.map((section, index) => (
                    <div
                        key={section.title}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center mb-4">
                            <div
                                className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mr-4`}
                            >
                                <section.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                                <p className="text-gray-600">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {section.items.map((item, itemIndex) => (
                                <li
                                    key={itemIndex}
                                    className="flex items-center text-gray-700"
                                >
                                    <ArrowRight className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                    快速链接
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickLinks.map((link, index) => (
                        <a
                            key={link.title}
                            href={link.url}
                            target={
                                link.url.startsWith("http")
                                    ? "_blank"
                                    : undefined
                            }
                            rel={
                                link.url.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                            }
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                                <link.icon className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2 group-hover:text-primary-600 transition-colors">
                                {link.title}
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                {link.description}
                            </p>
                        </a>
                    ))}
                </div>
            </div>

            {/* Architecture Overview */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                    MCP 架构概览
                </h2>
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Host 应用
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Claude
                                    Desktop、Cursor等AI应用，作为MCP客户端运行
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    MCP 协议
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    基于JSON-RPC 2.0的标准化通信协议
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    MCP 服务器
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    提供具体功能的服务器，如数据库连接、文件操作等
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            通过标准化的协议，AI应用可以无缝连接到各种外部服务和数据源
                        </p>
                    </div>
                </div>
            </div>

            {/* Getting Started CTA */}
            <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    准备开始了吗？
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    浏览我们的服务器集合，找到适合您项目的 MCP
                    服务器，或者学习如何创建自己的服务器。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/servers"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        浏览服务器
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <a
                        href="https://modelcontextprotocol.io/introduction"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        阅读官方文档
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Docs;
