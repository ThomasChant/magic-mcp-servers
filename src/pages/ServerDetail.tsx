import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
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
} from "lucide-react";
import { useServer } from "../hooks/useData";

const ServerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: server, isLoading, error } = useServer(id!);
    const [activeTab, setActiveTab] = useState("overview");
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

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

    const tabs = [
        { id: "overview", name: "Overview" },
        { id: "installation", name: "Installation" },
        { id: "examples", name: "Examples" },
        { id: "api-reference", name: "API Reference" },
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
                                <ChevronRight className="h-4 w-4 text-gray-400" />
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
                                <ChevronRight className="h-4 w-4 text-gray-400" />
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
                                <ChevronRight className="h-4 w-4 text-gray-400" />
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
                                            4.8
                                        </span>
                                        <span className="ml-1">
                                            ({server.repository.stars.toLocaleString()} stars)
                                        </span>
                                    </div>
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

                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href={server.repository.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <GitBranch className="mr-2 h-4 w-4" />
                                View on GitHub
                            </a>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Heart className="mr-2 h-4 w-4" />
                                Add to Favorites
                            </button>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Share className="mr-2 h-4 w-4" />
                                Share
                            </button>
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
                                <p className="text-gray-600 mb-6">
                                    The Filesystem MCP server provides comprehensive file system operations for Model Context Protocol applications. It enables AI models to safely interact with file systems, supporting both local and cloud storage backends.
                                </p>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Key Features
                                </h3>
                                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                                    <li>
                                        Safe file and directory operations with configurable permissions
                                    </li>
                                    <li>
                                        Support for local file systems and cloud storage (S3, Google Cloud, Azure)
                                    </li>
                                    <li>File search and filtering capabilities</li>
                                    <li>
                                        Metadata extraction and file type detection
                                    </li>
                                    <li>Streaming support for large files</li>
                                    <li>
                                        Comprehensive error handling and logging
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Use Cases
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Document Processing
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Enable AI models to read, analyze, and process documents from various sources.
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Code Analysis
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Allow AI to examine codebases, perform static analysis, and generate insights.
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Data Pipeline
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Integrate with data processing workflows for automated file management.
                                        </p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Content Management
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Build intelligent content management systems with AI-powered file operations.
                                        </p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Security & Permissions
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    The server implements robust security measures including:
                                </p>
                                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                                    <li>
                                        Configurable access controls and permission boundaries
                                    </li>
                                    <li>Path traversal protection</li>
                                    <li>File type restrictions and validation</li>
                                    <li>Audit logging for all operations</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === "installation" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Installation Guide
                                </h2>

                                <div className="space-y-6">
                                    {/* NPM Installation */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Package className="h-5 w-5 text-red-500 mr-2" />
                                            NPM Installation
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Install and run directly using npx:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard("npx @modelcontextprotocol/server-filesystem", "npm-install")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["npm-install"] ? (
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
                                                <code>npx @modelcontextprotocol/server-filesystem</code>
                                            </pre>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            This will start the server with default configuration.
                                        </p>
                                    </div>

                                    {/* Python Installation */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Package className="h-5 w-5 text-blue-500 mr-2" />
                                            Python Installation
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Install using pip:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard("pip install mcp-server-filesystem", "pip-install")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["pip-install"] ? (
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
                                                <code>pip install mcp-server-filesystem</code>
                                            </pre>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Then run the server:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard("mcp-filesystem-server", "python-run")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["python-run"] ? (
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
                                                <code>mcp-filesystem-server</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Docker Installation */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Package className="h-5 w-5 text-blue-600 mr-2" />
                                            Docker Installation
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Run using Docker:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard("docker run -p 3000:3000 -v /path/to/files:/data mcphub/filesystem-server", "docker-run")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["docker-run"] ? (
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
                                                <code>docker run -p 3000:3000 -v /path/to/files:/data mcphub/filesystem-server</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Configuration */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Configuration
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Create a configuration file{" "}
                                            <code className="bg-gray-100 px-2 py-1 rounded">
                                                config.json
                                            </code>
                                            :
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                            <button
                                                onClick={() => copyToClipboard(`{
  "rootPath": "/allowed/path",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  },
  "maxFileSize": "10MB",
  "allowedExtensions": [".txt", ".json", ".md"]
}`, "config-json")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["config-json"] ? (
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
                                                <code>
{`{
  "rootPath": "/allowed/path",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  },
  "maxFileSize": "10MB",
  "allowedExtensions": [".txt", ".json", ".md"]
}`}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "examples" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Usage Examples
                                </h2>

                                <div className="space-y-6">
                                    {/* Basic File Operations */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Basic File Operations
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Read a file and get its contents:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard(`const response = await mcp.call('filesystem/read', {
  path: '/documents/example.txt'
});
console.log(response.content);`, "example-read")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["example-read"] ? (
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
                                                <code>
{`const response = await mcp.call('filesystem/read', {
  path: '/documents/example.txt'
});
console.log(response.content);`}
                                                </code>
                                            </pre>
                                        </div>

                                        <p className="text-gray-600 mb-4">
                                            Write content to a file:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                            <button
                                                onClick={() => copyToClipboard(`await mcp.call('filesystem/write', {
  path: '/documents/output.txt',
  content: 'Hello, World!',
  encoding: 'utf8'
});`, "example-write")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["example-write"] ? (
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
                                                <code>
{`await mcp.call('filesystem/write', {
  path: '/documents/output.txt',
  content: 'Hello, World!',
  encoding: 'utf8'
});`}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Directory Operations */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Directory Operations
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            List directory contents:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard(`const files = await mcp.call('filesystem/list', {
  path: '/documents',
  recursive: true,
  filter: '*.txt'
});
console.log(files);`, "example-list")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["example-list"] ? (
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
                                                <code>
{`const files = await mcp.call('filesystem/list', {
  path: '/documents',
  recursive: true,
  filter: '*.txt'
});
console.log(files);`}
                                                </code>
                                            </pre>
                                        </div>

                                        <p className="text-gray-600 mb-4">
                                            Create a directory:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                            <button
                                                onClick={() => copyToClipboard(`await mcp.call('filesystem/mkdir', {
  path: '/documents/new-folder',
  recursive: true
});`, "example-mkdir")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["example-mkdir"] ? (
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
                                                <code>
{`await mcp.call('filesystem/mkdir', {
  path: '/documents/new-folder',
  recursive: true
});`}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* File Search */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            File Search
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Search for files by name pattern:
                                        </p>
                                        <div className="code-block relative bg-gray-900 rounded-lg p-4">
                                            <button
                                                onClick={() => copyToClipboard(`const results = await mcp.call('filesystem/search', {
  path: '/documents',
  pattern: '*.json',
  maxResults: 50,
  includeContent: false
});`, "example-search")}
                                                className="copy-button absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 opacity-0 transition-opacity duration-200"
                                            >
                                                {copiedStates["example-search"] ? (
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
                                                <code>
{`const results = await mcp.call('filesystem/search', {
  path: '/documents',
  pattern: '*.json',
  maxResults: 50,
  includeContent: false
});`}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "api-reference" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    API Reference
                                </h2>

                                <div className="space-y-6">
                                    {/* Read Method */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            filesystem/read
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Read the contents of a file.
                                        </p>

                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Parameters:
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">
                                                            Parameter
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Type
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Required
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Description
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            path
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">Yes</td>
                                                        <td className="px-4 py-2">
                                                            File path to read
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            encoding
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">No</td>
                                                        <td className="px-4 py-2">
                                                            File encoding (default: utf8)
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Write Method */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            filesystem/write
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Write content to a file.
                                        </p>

                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Parameters:
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">
                                                            Parameter
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Type
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Required
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Description
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            path
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">Yes</td>
                                                        <td className="px-4 py-2">
                                                            File path to write
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            content
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">Yes</td>
                                                        <td className="px-4 py-2">
                                                            Content to write
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            encoding
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">No</td>
                                                        <td className="px-4 py-2">
                                                            File encoding (default: utf8)
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* List Method */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            filesystem/list
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            List directory contents.
                                        </p>

                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Parameters:
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">
                                                            Parameter
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Type
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Required
                                                        </th>
                                                        <th className="px-4 py-2 text-left">
                                                            Description
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            path
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">Yes</td>
                                                        <td className="px-4 py-2">
                                                            Directory path to list
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            recursive
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            boolean
                                                        </td>
                                                        <td className="px-4 py-2">No</td>
                                                        <td className="px-4 py-2">
                                                            List subdirectories recursively
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-mono">
                                                            filter
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            string
                                                        </td>
                                                        <td className="px-4 py-2">No</td>
                                                        <td className="px-4 py-2">
                                                            File pattern filter (e.g., *.txt)
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
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
                                            Issues
                                        </dt>
                                        <dd className="text-sm">
                                            <a
                                                href={`${server.repository.url}/issues`}
                                                className="text-blue-600 hover:text-blue-700"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                12 open issues
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
