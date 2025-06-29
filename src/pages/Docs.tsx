import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Code,
    Search,
    Copy,
    Check,
    ArrowRight,
    Star,
    Users,
    Shield,
    Plug,
    ExpandIcon as Expand,
    Settings,
    Database,
    MessageCircle,
    Folder,
    Rocket,
    LayoutGrid,
    Info,
} from "lucide-react";

const Docs: React.FC = () => {
    const [activeSection, setActiveSection] = useState("introduction");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Handle copy functionality
    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Handle scroll spy for active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section[id]");
            const scrollPosition = window.scrollY + 200;

            sections.forEach((section) => {
                const element = section as HTMLElement;
                const top = element.offsetTop;
                const height = element.offsetHeight;

                if (scrollPosition >= top && scrollPosition < top + height) {
                    setActiveSection(element.id);
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(sectionId);
        }
    };

    // Navigation item component
    const NavItem = ({ sectionId, children, className = "" }: { sectionId: string; children: React.ReactNode; className?: string }) => (
        <button
            onClick={() => scrollToSection(sectionId)}
            className={`block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full text-left transition-colors ${
                activeSection === sectionId
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-3 border-blue-600 dark:border-blue-400"
                    : ""
            } ${className}`}
        >
            {children}
        </button>
    );

    // Code block component
    const CodeBlock = ({ code, id }: { code: string; id: string }) => (
        <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 mb-3">
            <button
                onClick={() => copyToClipboard(code, id)}
                className="absolute top-2 right-2 bg-gray-700 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                {copiedCode === id ? (
                    <>
                        <Check className="inline mr-1" size={12} />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy className="inline mr-1" size={12} />
                        Copy
                    </>
                )}
            </button>
            <pre className="text-green-400 dark:text-green-300 text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            Documentation
                        </h1>
                        <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
                            Everything you need to know about discovering,
                            integrating, and using MCP servers effectively.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Documentation
                            </h3>

                            <nav className="space-y-1">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Getting Started
                                    </h4>
                                    <NavItem sectionId="introduction">
                                        Introduction
                                    </NavItem>
                                    <NavItem sectionId="quick-start">
                                        Quick Start
                                    </NavItem>
                                    <NavItem sectionId="installation">
                                        Installation
                                    </NavItem>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Core Concepts
                                    </h4>
                                    <NavItem sectionId="what-is-mcp">
                                        What is MCP?
                                    </NavItem>
                                    <NavItem sectionId="server-types">
                                        Server Types
                                    </NavItem>
                                    <NavItem sectionId="integration">
                                        Integration Guide
                                    </NavItem>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Advanced
                                    </h4>
                                    <NavItem sectionId="custom-servers">
                                        Building Servers
                                    </NavItem>
                                    <NavItem sectionId="best-practices">
                                        Best Practices
                                    </NavItem>
                                    <NavItem sectionId="troubleshooting">
                                        Troubleshooting
                                    </NavItem>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Reference
                                    </h4>
                                    <NavItem sectionId="api-reference">
                                        API Reference
                                    </NavItem>
                                    <NavItem sectionId="examples">
                                        Examples
                                    </NavItem>
                                    <NavItem sectionId="faq">FAQ</NavItem>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                            {/* Introduction Section */}
                            <section id="introduction" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Introduction to Magic MCP
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                    Magic MCP is your comprehensive platform for
                                    discovering, evaluating, and integrating
                                    Model Context Protocol (MCP) servers.
                                    Whether you're building AI applications or
                                    enhancing existing systems, Magic MCP
                                    provides the tools and resources you need.
                                </p>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <Info
                                                className="text-blue-400 dark:text-blue-400"
                                                size={20}
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                <strong>New to MCP?</strong> The
                                                Model Context Protocol is a
                                                standardized way for AI
                                                applications to connect with
                                                external data sources and tools.{" "}
                                                <button
                                                    onClick={() =>
                                                        scrollToSection(
                                                            "what-is-mcp"
                                                        )
                                                    }
                                                    className="underline hover:no-underline"
                                                >
                                                    Learn more about MCP →
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Key Features
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Search
                                                className="text-blue-600 dark:text-blue-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Smart Discovery
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Find the perfect MCP server
                                                using intelligent search and
                                                filtering
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Star
                                                className="text-green-600 dark:text-green-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Quality Ratings
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Community-driven ratings and
                                                reviews for reliable choices
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Code
                                                className="text-purple-600 dark:text-purple-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Easy Integration
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Step-by-step guides and code
                                                examples for quick setup
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Users
                                                className="text-orange-600 dark:text-orange-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Active Community
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Connect with developers and
                                                share knowledge
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Quick Start Section */}
                            <section id="quick-start" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Quick Start Guide
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Get up and running with MCP servers in just
                                    a few minutes. Follow these simple steps to
                                    integrate your first server.
                                </p>

                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                Discover a Server
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                Browse our catalog or use the
                                                search function to find a server
                                                that meets your needs.
                                            </p>
                                            <Link
                                                to="/servers"
                                                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                            >
                                                Browse Servers
                                                <ArrowRight
                                                    className="ml-1"
                                                    size={16}
                                                />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                Install the Server
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                Follow the installation
                                                instructions for your preferred
                                                method (npm, pip, Docker).
                                            </p>
                                            <div className="group">
                                                <CodeBlock
                                                    code="npx @modelcontextprotocol/server-filesystem"
                                                    id="install-cmd"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                Configure Your Application
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                Connect your AI application to
                                                the MCP server using the
                                                provided configuration.
                                            </p>
                                            <div className="group">
                                                <CodeBlock
                                                    code={`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}`}
                                                    id="config-cmd"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            ✓
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                Start Building
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                Your MCP server is now ready!
                                                Start building amazing
                                                AI-powered applications.
                                            </p>
                                            <button
                                                onClick={() =>
                                                    scrollToSection("examples")
                                                }
                                                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                                            >
                                                View Examples
                                                <ArrowRight
                                                    className="ml-1"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Installation Section */}
                            <section id="installation" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Installation
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    MCP servers can be installed using various
                                    package managers and deployment methods.
                                    Choose the method that best fits your
                                    development environment.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            NPM Installation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            For Node.js-based MCP servers:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="npm install @modelcontextprotocol/server-filesystem"
                                                id="npm-install"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Python Installation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            For Python-based MCP servers:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="pip install mcp-server-filesystem"
                                                id="pip-install"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Docker Installation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Run MCP servers in containers:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="docker run -p 3000:3000 mcp-hub/filesystem-server"
                                                id="docker-install"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* What is MCP Section */}
                            <section id="what-is-mcp" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    What is Model Context Protocol?
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    The Model Context Protocol (MCP) is an open
                                    standard that enables AI applications to
                                    securely connect with external data sources,
                                    tools, and services. It provides a
                                    standardized way for AI models to access and
                                    interact with various resources while
                                    maintaining security and control.
                                </p>

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Key Benefits
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <Shield
                                                className="text-blue-600 dark:text-blue-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                Secure data access
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Plug
                                                className="text-green-600 dark:text-green-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                Standardized integration
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Expand
                                                className="text-purple-600 dark:text-purple-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                Scalable architecture
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Settings
                                                className="text-orange-600 dark:text-orange-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                Easy maintenance
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    How MCP Works
                                </h3>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <strong>
                                                Client-Server Architecture:
                                            </strong>
                                            AI applications (clients) connect to
                                            MCP servers that provide specific
                                            capabilities
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <strong>
                                                Standardized Protocol:
                                            </strong>
                                            All communication follows the MCP
                                            specification for consistency
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <strong>Resource Access:</strong>
                                            Servers expose resources (data,
                                            tools, prompts) that clients can
                                            discover and use
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <strong>Secure Boundaries:</strong>{" "}
                                            Each server operates within defined
                                            security boundaries and permissions
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Server Types Section */}
                            <section id="server-types" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Server Types & Categories
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    MCP servers come in various types, each
                                    designed for specific use cases.
                                    Understanding these categories helps you
                                    choose the right server for your needs.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Folder
                                                    className="text-blue-600 dark:text-blue-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                File System
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Access and manipulate files and
                                            directories with secure boundaries.
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                Read/Write
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                Cloud Storage
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Database
                                                    className="text-green-600 dark:text-green-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Database
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Connect to SQL and NoSQL databases
                                            for data operations.
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                SQL
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                NoSQL
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <MessageCircle
                                                    className="text-purple-600 dark:text-purple-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Communication
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Integrate with messaging and
                                            notification platforms.
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                Slack
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                Email
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Code
                                                    className="text-orange-600 dark:text-orange-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Development
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Access development tools, version
                                            control, and CI/CD systems.
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                Git
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                CI/CD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Integration Section */}
                            <section id="integration" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Integration Guide
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Integrating MCP servers with your AI
                                    application requires configuring the
                                    connection and understanding the available
                                    resources and tools.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Configuration Setup
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Add your MCP server configuration to
                                            your application's config file:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`{
  "mcpServers": {
    "myserver": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}`}
                                                id="integration-config"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Connection Testing
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Test your connection to ensure the
                                            server is responding correctly:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="mcp-cli test-connection myserver"
                                                id="test-connection"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Building Servers Section */}
                            <section id="custom-servers" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Building Custom Servers
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Create your own MCP servers to expose custom
                                    functionality and data sources to AI
                                    applications.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Server Structure
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            A basic MCP server implementation:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0'
});

// Add your resources and tools here
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'custom://data',
        name: 'Custom Data',
        description: 'My custom data source'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);`}
                                                id="server-structure"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Best Practices Section */}
                            <section id="best-practices" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Best Practices
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Follow these best practices to ensure
                                    optimal performance, security, and
                                    maintainability of your MCP server
                                    implementations.
                                </p>

                                <div className="space-y-6">
                                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4">
                                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                                            Security
                                        </h3>
                                        <ul className="text-green-700 dark:text-green-300 space-y-1">
                                            <li>
                                                • Always validate input
                                                parameters
                                            </li>
                                            <li>
                                                • Implement proper
                                                authentication and authorization
                                            </li>
                                            <li>
                                                • Use environment variables for
                                                sensitive data
                                            </li>
                                            <li>
                                                • Regularly update dependencies
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4">
                                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                            Performance
                                        </h3>
                                        <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                                            <li>
                                                • Implement caching for
                                                frequently accessed data
                                            </li>
                                            <li>
                                                • Use connection pooling for
                                                database connections
                                            </li>
                                            <li>
                                                • Optimize resource loading and
                                                memory usage
                                            </li>
                                            <li>
                                                • Monitor and log performance
                                                metrics
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Troubleshooting Section */}
                            <section id="troubleshooting" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Troubleshooting
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Common issues and solutions when working
                                    with MCP servers.
                                </p>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Connection Failures
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            If your MCP server fails to connect:
                                        </p>
                                        <ul className="text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>
                                                • Check that the server process
                                                is running
                                            </li>
                                            <li>
                                                • Verify the configuration file
                                                paths
                                            </li>
                                            <li>
                                                • Ensure all required
                                                dependencies are installed
                                            </li>
                                            <li>
                                                • Check the server logs for
                                                error messages
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Permission Errors
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            For file system or resource access
                                            issues:
                                        </p>
                                        <ul className="text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>
                                                • Verify file and directory
                                                permissions
                                            </li>
                                            <li>
                                                • Check that the server has
                                                access to required paths
                                            </li>
                                            <li>
                                                • Ensure API keys and
                                                credentials are correct
                                            </li>
                                            <li>
                                                • Review security policies and
                                                access controls
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* API Reference Section */}
                            <section id="api-reference" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    API Reference
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Complete reference for the MCP protocol
                                    methods and data structures.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Core Methods
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    resources/list
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Lists all available
                                                    resources from the server.
                                                </p>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    resources/read
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Reads the contents of a
                                                    specific resource.
                                                </p>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    tools/list
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Lists all available tools
                                                    provided by the server.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Examples Section */}
                            <section id="examples" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Examples
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Practical examples of MCP server
                                    implementations and integrations.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            File System Server
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            A simple file system server that
                                            provides read/write access to a
                                            specific directory:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`// Configuration
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/home/user/documents"
      ]
    }
  }
}

// Usage in AI application
// The AI can now read and write files in /home/user/documents`}
                                                id="filesystem-example"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Database Server
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            Connect to a PostgreSQL database and
                                            execute queries:
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`// Configuration
{
  "mcpServers": {
    "database": {
      "command": "mcp-postgres-server",
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db"
      }
    }
  }
}

// The AI can now query your database
// Example: "Show me all users created in the last week"`}
                                                id="database-example"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section id="faq" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Frequently Asked Questions
                                </h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            How do I choose the right MCP
                                            server?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Consider your specific use case, the
                                            type of data or functionality you
                                            need, and the server's compatibility
                                            with your tech stack. Use our
                                            filtering and search features to
                                            narrow down options, and check
                                            community ratings and reviews.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Are MCP servers secure?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Yes, MCP servers are designed with
                                            security in mind. They operate
                                            within defined boundaries, support
                                            permission controls, and follow the
                                            MCP security specifications. Always
                                            review the server's documentation
                                            and configure appropriate access
                                            controls.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Can I use multiple MCP servers
                                            together?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Absolutely! Most AI applications use
                                            multiple MCP servers to access
                                            different types of resources. The
                                            MCP protocol is designed to support
                                            multiple concurrent server
                                            connections.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            How do I contribute a new server?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            We welcome community contributions!
                                            You can submit your MCP server
                                            through our GitHub repository or
                                            contact us directly. Make sure your
                                            server follows MCP specifications
                                            and includes proper documentation.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Call to Action */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg p-8 text-center text-white">
                                <h2 className="text-2xl font-bold mb-4">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-blue-100 dark:text-blue-200 mb-6">
                                    Explore our collection of MCP servers and
                                    start building amazing AI applications
                                    today.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/servers"
                                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        <Rocket className="mr-2" size={20} />
                                        Browse Servers
                                    </Link>
                                    <Link
                                        to="/categories"
                                        className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 dark:hover:text-blue-700 transition-colors"
                                    >
                                        <LayoutGrid
                                            className="mr-2"
                                            size={20}
                                        />
                                        View Categories
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Docs;