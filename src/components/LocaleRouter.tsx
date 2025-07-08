import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { locales, defaultLocale, type Locale } from "../i18n/config";

interface LocaleRouterProps {
    children: React.ReactNode;
}

/**
 * LocaleRouter component handles URL-based locale detection and routing
 * It detects the locale from the URL path and updates the i18n language accordingly
 */
export const LocaleRouter: React.FC<LocaleRouterProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { setLanguage } = useAppStore();

    // Extract locale from current path
    const getLocaleFromPath = (path: string): { locale: Locale; pathWithoutLocale: string } => {
        const segments = path.split("/").filter(Boolean);
        const maybeLocale = segments[0];
        
        if (locales.includes(maybeLocale as Locale)) {
            return {
                locale: maybeLocale as Locale,
                pathWithoutLocale: `/${segments.slice(1).join("/")}`
            };
        }
        
        return {
            locale: defaultLocale,
            pathWithoutLocale: path
        };
    };

    useEffect(() => {
        const { locale, pathWithoutLocale } = getLocaleFromPath(location.pathname);
        
        // Update i18n language if it's different from current
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
            setLanguage(locale);
        }
        
        // Handle redirect for default locale
        // If URL starts with /en/, redirect to path without locale prefix
        if (locale === defaultLocale && location.pathname.startsWith(`/${defaultLocale}/`)) {
            navigate(pathWithoutLocale + location.search + location.hash, { replace: true });
        }
    }, [location.pathname, i18n, setLanguage, navigate]);

    return <>{children}</>;
};

/**
 * Hook to get locale-aware navigation functions
 */
export const useLocaleRouter = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const getLocaleFromPath = (path: string): { locale: Locale; pathWithoutLocale: string } => {
        const segments = path.split("/").filter(Boolean);
        const maybeLocale = segments[0];
        
        if (locales.includes(maybeLocale as Locale)) {
            return {
                locale: maybeLocale as Locale,
                pathWithoutLocale: `/${segments.slice(1).join("/")}`
            };
        }
        
        return {
            locale: defaultLocale,
            pathWithoutLocale: path
        };
    };

    const getLocalizedPath = (path: string, locale?: Locale): string => {
        const targetLocale = locale || (i18n.language as Locale);
        const { pathWithoutLocale } = getLocaleFromPath(path);
        
        if (targetLocale === defaultLocale) {
            return pathWithoutLocale || "/";
        }
        
        return `/${targetLocale}${pathWithoutLocale}`;
    };

    const navigateToLocale = (locale: Locale) => {
        const { pathWithoutLocale } = getLocaleFromPath(location.pathname);
        const newPath = getLocalizedPath(pathWithoutLocale, locale);
        navigate(newPath + location.search + location.hash);
    };

    const getCurrentLocale = (): Locale => {
        const { locale } = getLocaleFromPath(location.pathname);
        return locale;
    };

    return {
        getLocalizedPath,
        navigateToLocale,
        getCurrentLocale,
        currentLocale: getCurrentLocale()
    };
};

export default LocaleRouter;