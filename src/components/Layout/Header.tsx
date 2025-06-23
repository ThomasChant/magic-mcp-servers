import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Globe, Sun, Moon } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Language } from "../../types/language";

const Header: React.FC = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {
        language,
        theme,
        searchQuery,
        setLanguage,
        toggleTheme,
        setSearchQuery,
    } = useAppStore();

    const navigation = [
        { name: "Home", href: "/", current: location.pathname === "/" },
        {
            name: "Servers",
            href: "/servers",
            current: location.pathname === "/servers",
        },
        {
            name: "Categories",
            href: "/categories",
            current: location.pathname === "/categories",
        },
        { name: "Documentation", href: "/docs", current: location.pathname === "/docs" },
        {
            name: "About",
            href: "/about",
            current: location.pathname === "/about",
        },
    ];

    const languages = [
        { code: "zh-CN", name: "简体中文" },
        { code: "en", name: "English" },
        { code: "zh-TW", name: "繁體中文" },
        { code: "ja", name: "日本語" },
        { code: "ko", name: "한국어" },
        { code: "fr", name: "Français" },
        { code: "ru", name: "Русский" },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white text-sm font-bold">
                                    M
                                </span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                MCP Hub
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                            : "text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Search and Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="Search servers..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    data-testid="header-search-input"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === "light" ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </button>

                        {/* Language Selector */}
                        <div className="relative group">
                            <button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors">
                                <Globe className="h-5 w-5 mr-1" />
                                <span className="text-sm">{language}</span>
                            </button>

                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() =>
                                            setLanguage(lang.code as Language)
                                        }
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                                            language === lang.code
                                                ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                                : "text-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {/* Mobile Search */}
                            <div className="relative mb-3">
                                <input
                                    type="text"
                                    placeholder="Search servers..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>

                            {/* Mobile Menu Items */}
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50"
                                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Header;
