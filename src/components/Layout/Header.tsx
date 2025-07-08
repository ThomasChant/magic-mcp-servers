import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/useAppStore";
import { ClientOnly } from "../ClientOnly";
import LocaleLink from "../LocaleLink";
import { useLocaleRouter } from "../LocaleRouter";
import { languageNames, locales } from "../../i18n/config";
import logoImg from "../../assets/logo.png";

import { 
    AuthSectionWithClerk, 
    MobileAuthSectionWithClerk,
    AuthSectionSSR,
    MobileAuthSectionSSR 
} from "./AuthSection";

// SSR兼容的Header组件，不包含Clerk功能
const HeaderSSR: React.FC = () => {
    const { t } = useTranslation("common");
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { navigateToLocale, currentLocale, getLocalizedPath } = useLocaleRouter();
    // const { isSignedIn } = useUser();
    const {
        theme,
        searchQuery,
        toggleTheme,
        setSearchQuery,
    } = useAppStore();


    // Handle search functionality
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        // If on home page, search immediately; if on other pages, wait for Enter or explicit search
        const homePath = getLocalizedPath("/");
        if (location.pathname === homePath || location.pathname === "/") {
            // On home page, search is immediate
            return;
        }
    };

    // Handle search navigation (for non-home pages)
    const handleSearchSubmit = (query: string) => {
        setSearchQuery(query);
        // Navigate to home page if not already there and there's a search query
        const homePath = getLocalizedPath("/");
        if (query.trim() && location.pathname !== homePath && location.pathname !== "/") {
            navigate(homePath);
        }
    };

    // Handle search input key down
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            handleSearchSubmit(target.value);
        }
    };

    const navigation = [
        { 
            name: t("nav.home"), 
            href: "/", 
            current: location.pathname === "/" || location.pathname === getLocalizedPath("/")
        },
        {
            name: t("nav.servers"),
            href: "/servers",
            current: location.pathname === "/servers" || location.pathname === getLocalizedPath("/servers"),
        },
        {
            name: t("nav.categories"),
            href: "/categories",
            current: location.pathname === "/categories" || location.pathname === getLocalizedPath("/categories"),
        },
        {
            name: t("nav.favorites"),
            href: "/favorites",
            current: location.pathname === "/favorites" || location.pathname === getLocalizedPath("/favorites"),
        },
        { 
            name: t("nav.documentation"), 
            href: "/docs", 
            current: location.pathname === "/docs" || location.pathname === getLocalizedPath("/docs")
        },
    ];

    // const languages = [
    //     { code: "zh-CN", name: "简体中文" },
    //     { code: "en", name: "English" },
    //     { code: "zh-TW", name: "繁體中文" },
    //     { code: "ja", name: "日本語" },
    //     { code: "ko", name: "한국어" },
    //     { code: "fr", name: "Français" },
    //     { code: "ru", name: "Русский" },
    // ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <LocaleLink to="/" className="flex items-center">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                {/* <span className="text-white text-sm font-bold">
                                    M
                                </span> */}
                                <img src={logoImg} alt="Magic MCP" className="rounded" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {t('footer.brand')}
                            </span>
                        </LocaleLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigation.map((item) => (
                                <LocaleLink
                                    key={item.name}
                                    to={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                            : "text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {item.name}
                                </LocaleLink>
                            ))}
                        </div>
                    </div>

                    {/* Search and Controls */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Search */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder={t("header.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyPress}
                                    className="w-48 xl:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"

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
                        <ClientOnly fallback={
                            <div className="flex items-center p-2 text-gray-600 dark:text-gray-300 rounded-md">
                                <Globe className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">{currentLocale}</span>
                            </div>
                        }>
                            <div className="relative group">
                                <button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors" title={t("language.selectLanguage")}>
                                    <Globe className="h-5 w-5 mr-1" />
                                    <span className="text-sm font-medium">{currentLocale}</span>
                                </button>

                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    {locales.map((locale) => (
                                        <button
                                            key={locale}
                                            onClick={() => {
                                                console.log(`切换语言到: ${locale}`);
                                                navigateToLocale(locale);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                                                currentLocale === locale
                                                    ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                                    : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {languageNames[locale]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </ClientOnly>

                        
                        <AuthSectionSSR />
                        
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
                                    placeholder={t("header.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyPress}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>

                            {/* Mobile Auth Section */}
                            <MobileAuthSectionSSR />

                            {/* Mobile Menu Items */}
                            {navigation.map((item) => (
                                <LocaleLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {item.name}
                                </LocaleLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// 客户端Header组件，包含完整Clerk功能
const HeaderWithClerk: React.FC = () => {
    const { t } = useTranslation("common");
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { navigateToLocale, currentLocale, getLocalizedPath } = useLocaleRouter();
    const {
        theme,
        searchQuery,
        toggleTheme,
        setSearchQuery,
    } = useAppStore();

    // Handle search functionality
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        // If on home page, search immediately; if on other pages, wait for Enter or explicit search
        const homePath = getLocalizedPath("/");
        if (location.pathname === homePath || location.pathname === "/") {
            // On home page, search is immediate
            return;
        }
    };

    // Handle search navigation (for non-home pages)
    const handleSearchSubmit = (query: string) => {
        setSearchQuery(query);
        // Navigate to home page if not already there and there's a search query
        const homePath = getLocalizedPath("/");
        if (query.trim() && location.pathname !== homePath && location.pathname !== "/") {
            navigate(homePath);
        }
    };

    // Handle search input key down
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            handleSearchSubmit(target.value);
        }
    };

    const navigation = [
        { 
            name: t("nav.home"), 
            href: "/", 
            current: location.pathname === "/" || location.pathname === getLocalizedPath("/")
        },
        {
            name: t("nav.servers"),
            href: "/servers",
            current: location.pathname === "/servers" || location.pathname === getLocalizedPath("/servers"),
        },
        {
            name: t("nav.categories"),
            href: "/categories",
            current: location.pathname === "/categories" || location.pathname === getLocalizedPath("/categories"),
        },
        {
            name: t("nav.favorites"),
            href: "/favorites",
            current: location.pathname === "/favorites" || location.pathname === getLocalizedPath("/favorites"),
        },
        { 
            name: t("nav.documentation"), 
            href: "/docs", 
            current: location.pathname === "/docs" || location.pathname === getLocalizedPath("/docs")
        },
    ];

    // const languages = [
    //     { code: "zh-CN", name: "简体中文" },
    //     { code: "en", name: "English" },
    //     { code: "zh-TW", name: "繁體中文" },
    //     { code: "ja", name: "日本語" },
    //     { code: "ko", name: "한국어" },
    //     { code: "fr", name: "Français" },
    //     { code: "ru", name: "Русский" },
    // ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <LocaleLink to="/" className="flex items-center">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                {/* <span className="text-white text-sm font-bold">
                                    M
                                </span> */}
                                <img src={logoImg} alt="Magic MCP" className="rounded"/>
                                
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {t('footer.brand')}
                            </span>
                        </LocaleLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigation.map((item) => (
                                <LocaleLink
                                    key={item.name}
                                    to={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                            : "text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {item.name}
                                </LocaleLink>
                            ))}
                        </div>
                    </div>

                    {/* Search and Controls */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Search */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder={t("header.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyPress}
                                    className="w-48 xl:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-transparent"

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
                        <ClientOnly fallback={
                            <div className="flex items-center p-2 text-gray-600 dark:text-gray-300 rounded-md">
                                <Globe className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">{currentLocale}</span>
                            </div>
                        }>
                            <div className="relative group">
                                <button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors" title={t("language.selectLanguage")}>
                                    <Globe className="h-5 w-5 mr-1" />
                                    <span className="text-sm font-medium">{currentLocale}</span>
                                </button>

                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    {locales.map((locale) => (
                                        <button
                                            key={locale}
                                            onClick={() => {
                                                console.log(`切换语言到: ${locale}`);
                                                navigateToLocale(locale);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                                                currentLocale === locale
                                                    ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                                    : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {languageNames[locale]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </ClientOnly>

                        {/* Auth Section */}
                        <AuthSectionWithClerk />

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
                                    placeholder={t("header.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleSearchKeyPress}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>

                            {/* Mobile Auth Section */}
                            <MobileAuthSectionWithClerk setMobileMenuOpen={setMobileMenuOpen} />

                            {/* Mobile Menu Items */}
                            {navigation.map((item) => (
                                <LocaleLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                        item.current
                                            ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50"
                                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {item.name}
                                </LocaleLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// 主Header组件 - 根据运行环境选择合适的版本
const Header: React.FC = () => {
    return (
        <ClientOnly fallback={<HeaderSSR />}>
            <HeaderWithClerk />
        </ClientOnly>
    );
};

export default Header;
