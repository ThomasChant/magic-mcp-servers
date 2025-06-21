import React from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    Github,
    ExternalLink,
    Mail,
    Users,
    Target,
    Lightbulb,
    ArrowRight,
} from "lucide-react";

const About: React.FC = () => {
    const features = [
        {
            title: "全面的服务器目录",
            description: "收录最全面的 MCP 服务器集合，涵盖各种功能领域",
            icon: Target,
        },
        {
            title: "智能搜索与筛选",
            description: "强大的搜索功能和多维度筛选，快速找到所需服务器",
            icon: Lightbulb,
        },
        {
            title: "社区驱动",
            description: "开放的社区平台，鼓励贡献和分享优质服务器",
            icon: Users,
        },
        {
            title: "持续更新",
            description: "定期更新服务器信息，确保内容的时效性和准确性",
            icon: Heart,
        },
    ];

    const team = [
        {
            name: "开发团队",
            role: "全栈开发",
            description: "负责平台的设计、开发和维护",
            avatar: "👨‍💻",
        },
        {
            name: "社区管理",
            role: "内容管理",
            description: "维护服务器数据库，审核社区贡献",
            avatar: "👩‍💼",
        },
        {
            name: "技术支持",
            role: "用户支持",
            description: "为用户提供技术支持和使用指导",
            avatar: "🛠️",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    关于 MCP Hub
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    我们致力于为 Model Context Protocol
                    生态系统构建最全面、最友好的服务器发现平台
                </p>
            </div>

            {/* Mission Section */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 mb-16 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">我们的使命</h2>
                    <p className="text-lg text-primary-100 mb-8">
                        让每一个开发者都能轻松找到并使用合适的 MCP 服务器， 推动
                        AI
                        应用与外部系统的无缝集成，促进整个生态系统的健康发展。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                简化发现
                            </h3>
                            <p className="text-sm text-primary-100">
                                让开发者快速找到所需的 MCP 服务器
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                促进创新
                            </h3>
                            <p className="text-sm text-primary-100">
                                鼓励新服务器的开发和创新应用
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">
                                建设社区
                            </h3>
                            <p className="text-sm text-primary-100">
                                构建活跃、互助的开发者社区
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                    平台特色
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                                    <feature.icon className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                    团队介绍
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <div
                            key={member.name}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="text-4xl mb-4">{member.avatar}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {member.name}
                            </h3>
                            <p className="text-primary-600 font-medium mb-3">
                                {member.role}
                            </p>
                            <p className="text-gray-600 text-sm">
                                {member.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Open Source Section */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        开源项目
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        MCP Hub 是一个完全开源的项目，我们欢迎社区的贡献和反馈
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://github.com/your-org/mcp-hub"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Github className="mr-2 h-5 w-5" />
                            查看源代码
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                        <Link
                            to="/docs"
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            贡献指南
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    联系我们
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    有问题、建议或想要合作？我们很乐意听到您的声音
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:hello@mcphub.dev"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Mail className="mr-2 h-5 w-5" />
                        发送邮件
                    </a>
                    <a
                        href="https://github.com/your-org/mcp-hub/discussions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        <Github className="mr-2 h-5 w-5" />
                        GitHub 讨论
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
