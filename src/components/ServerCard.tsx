import React from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    ArrowRight,
    Folder,
    Database,
    MessageCircle,
    Bot,
    FileText,
    GitBranch,
} from "lucide-react";
import type { MCPServer } from "../types";
import { FavoriteButton } from "./FavoriteButton";
import VoteButtons from "./VoteButtons";
import { ClientOnly } from "./ClientOnly";

// Extended interface for JSON data structure compatibility
interface ServerData extends Omit<MCPServer, 'verified'> {
    official?: boolean;
    descriptionEn?: string;
    repository: MCPServer['repository'] & {
        lastUpdate?: string;
    };
}

 // Get server icon based on category or tags
 const getServerIcon = (server: ServerData) => {
    const tags = server.tags.join(" ").toLowerCase();
    const category = Array.isArray(server.category) ? server.category.join(" ").toLowerCase() : server.category.toLowerCase();
    const combined = `${tags} ${category}`;
    
    if (combined.includes("file") || combined.includes("storage")) {
        return <Folder className="h-5 w-5 text-white" />;
    } else if (combined.includes("database") || combined.includes("sql")) {
        return <Database className="h-5 w-5 text-white" />;
    } else if (combined.includes("communication") || combined.includes("slack") || combined.includes("messaging")) {
        return <MessageCircle className="h-5 w-5 text-white" />;
    } else if (combined.includes("ai") || combined.includes("ml") || combined.includes("search")) {
        return <Bot className="h-5 w-5 text-white" />;
    } else if (combined.includes("development") || combined.includes("github") || combined.includes("git")) {
        return <Bot className="h-5 w-5 text-white" />;
    } else {
        return <FileText className="h-5 w-5 text-white" />;
    }
};




// Format time ago
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    
    // Calculate years, months, weeks, and days
    const years = Math.floor(diffInDays / 365);
    const months = Math.floor((diffInDays % 365) / 30);
    const weeks = Math.floor((diffInDays % 30) / 7);
    const days = diffInDays % 7;
    
    // Build array of time units
    const units: { value: number; label: string }[] = [];
    if (years > 0) units.push({ value: years, label: "y" });
    if (months > 0) units.push({ value: months, label: "m" });
    if (weeks > 0) units.push({ value: weeks, label: "w" });
    if (days > 0) units.push({ value: days, label: "d" });
    
    // Take only the two largest units
    const displayUnits = units.slice(0, 2);
    
    // Format the output
    return displayUnits.map(unit => `${unit.value}${unit.label}`).join(' ');
};

// Detect if server is part of a monorepo
const getMonorepoInfo = (githubUrl: string) => {
    if (!githubUrl) return null;
    
    // Pattern to match monorepo URLs like github.com/owner/repo/tree/main/path
    const monorepoPattern = /github\.com\/([^/]+\/[^/]+)\/(tree|blob)\/[^/]+\/(.+)/;
    const match = githubUrl.match(monorepoPattern);
    
    if (match) {
        return {
            parentRepo: match[1],
            path: match[3]
        };
    }
    
    return null;
};


const getServerIconBg = (server: ServerData | MCPServer) => {
    const tags = server.tags.join(" ").toLowerCase();
    const category = Array.isArray(server.category) ? server.category.join(" ").toLowerCase() : server.category.toLowerCase();
    const combined = `${tags} ${category}`;
    
    if (combined.includes("file") || combined.includes("storage")) {
        return "bg-blue-600";
    } else if (combined.includes("database") || combined.includes("sql")) {
        return server.name.toLowerCase().includes("sqlite") ? "bg-yellow-600" : "bg-green-600";
    } else if (combined.includes("communication") || combined.includes("slack") || combined.includes("messaging")) {
        return "bg-purple-600";
    } else if (combined.includes("ai") || combined.includes("ml") || combined.includes("search")) {
        return "bg-red-600";
    } else if (combined.includes("development") || combined.includes("github") || combined.includes("git")) {
        return "bg-indigo-600";
    } else {
        return "bg-yellow-600";
    }
};

const isPopular = (server: ServerData | MCPServer) => {
    return (server.stats?.stars || 0) >= 1000 || (server.repository?.stars || 0) >= 1000 || (server.stats?.forks || 0) >= 100 || (server.repository?.forks || 0) >= 100;
};

// Server Card Props
interface ServerCardProps {
    server: ServerData | MCPServer;
}

// Server List Item Props
interface ServerListItemProps {
    server: ServerData | MCPServer;
}

// Server Card Component for Grid View
export const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
    const serverData = server as ServerData;
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between h-full">
            <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                    <Link to={`/servers/${server.slug}`} className="flex items-center min-w-0 flex-1 mr-4">
                        <div
                            className={`w-10 h-10 ${getServerIconBg(server)} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}
                        >
                            {getServerIcon(server)}
                        </div>
                        <div className="min-w-0 flex-1">
                            {server.owner && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                                    @{server.owner}
                                </div>
                            )}
                            <h3 className="server-name text-base font-semibold text-gray-900 dark:text-white truncate" title={server.name}>
                                {server.name}
                            </h3>
                            <div className="flex items-center flex-wrap gap-1 mt-1">
                                {serverData.official && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Official
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Featured
                                    </span>
                                )}
                                {isPopular(server) && (
                                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Popular
                                    </span>
                                )}
                                {getMonorepoInfo(server.repository.url) && (
                                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-medium">
                                        <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                                        Monorepo
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    <div className="text-right flex-shrink-0 space-y-2">
                        <ClientOnly>
                            <FavoriteButton
                                serverId={server.id}
                                size="sm"
                                className="mb-2"
                            />
                        </ClientOnly>
                    </div>
                </div>

                <Link to={`/servers/${server.slug}`}>
                    <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {serverData.descriptionEn || server.description["zh-CN"] || server.description.en}
                    </p>
                </Link>

                <div className="flex flex-wrap gap-1 mb-4">
                    {server.tags.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="server-stats flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTimeAgo(
                            server.createdAt ||
                                server.stats?.createdAt ||
                                serverData.repository?.lastUpdate ||
                                server.repository?.lastUpdated ||
                                ""
                        )}
                    </span>
                </div>
                
                <ClientOnly>
                    <VoteButtons 
                        serverId={server.id}
                        size="sm"
                        className="ml-2"
                    />
                </ClientOnly>
            </div>
        </div>
    );
};

// Server List Item Component for List View
export const ServerListItem: React.FC<ServerListItemProps> = ({ server }) => {
    const serverData = server as ServerData;
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer mb-4">
            <div className="flex items-center justify-between">
                <Link to={`/servers/${server.slug}`} className="flex items-center min-w-0 flex-1">
                    <div
                        className={`w-12 h-12 ${getServerIconBg(server)} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}
                    >
                        {getServerIcon(server)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="server-name text-base font-semibold text-gray-900 dark:text-white truncate" title={server.name}>
                                {server.name}
                            </h3>
                            {server.owner && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    @{server.owner}
                                </span>
                            )}
                            <div className="flex items-center flex-wrap gap-1">
                                {serverData.official && (
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Official
                                    </span>
                                )}
                                {server.featured && (
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Featured
                                    </span>
                                )}
                                {isPopular(server) && (
                                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                        Popular
                                    </span>
                                )}
                                {getMonorepoInfo(server.repository.url) && (
                                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-medium">
                                        <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                                        Monorepo
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="server-description text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                            {serverData.descriptionEn || server.description["zh-CN"] || server.description.en}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTimeAgo(
                                    server.createdAt ||
                                        server.stats?.createdAt ||
                                        serverData.repository?.lastUpdate ||
                                        server.repository?.lastUpdated ||
                                        ""
                                )}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {server.tags
                                    .slice(0, 2)
                                    .map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>
                </Link>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <ClientOnly>
                        <FavoriteButton serverId={server.id} size="sm" />
                    </ClientOnly>
                    <ClientOnly>
                        <VoteButtons 
                            serverId={server.id}
                            size="sm"
                        />
                    </ClientOnly>
                    <Link to={`/servers/${server.slug}`}>
                        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center">
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};