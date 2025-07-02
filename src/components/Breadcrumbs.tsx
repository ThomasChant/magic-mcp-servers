import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    url: string;
    current?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav className={`flex ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {/* Home link */}
                <li className="inline-flex items-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>

                {/* Dynamic breadcrumb items */}
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {item.current ? (
                            <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                                {item.name}
                            </span>
                        ) : (
                            <Link
                                to={item.url}
                                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white md:ml-2"
                            >
                                {item.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;