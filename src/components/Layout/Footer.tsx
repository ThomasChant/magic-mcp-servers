import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, MessageCircle, Heart } from "lucide-react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white text-sm font-bold">
                                    M
                                </span>
                            </div>
                            <span className="text-xl font-bold">MCP Hub</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            您发现和集成最优秀的 Model Context Protocol
                            服务器的门户，助力 AI 能力提升。
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                                title="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Discord"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">快速链接</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    首页
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/servers"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    浏览服务器
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    分类
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/docs"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    文档
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">资源</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    API 参考
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    开发指南
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    社区
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    支持
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 flex items-center justify-center">
                        © 2024 MCP Hub. 用
                        <Heart className="h-4 w-4 mx-1 text-red-500" />为 AI
                        社区打造
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
