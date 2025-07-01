import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Supported languages
export const locales = ["en", "zh-CN", "zh-TW", "fr", "ja", "ko", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";

// Language display names
export const languageNames: Record<Locale, string> = {
    "zh-CN": "简体中文",
    "en": "English",
    "zh-TW": "繁體中文",
    "ja": "日本語",
    "ko": "한국어",
    "fr": "Français",
    "ru": "Русский",
};

// Initialize i18n
export function initI18n(locale: string, resources?: any) {
    const instance = i18n.createInstance();
    
    instance
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            lng: locale,
            fallbackLng: defaultLocale,
            resources,
            ns: ["common", "home", "server", "category", "docs"],
            defaultNS: "common",
            interpolation: {
                escapeValue: false, // React already escapes values
            },
            detection: {
                order: ["path", "querystring", "cookie", "localStorage", "navigator"],
                lookupFromPathIndex: 0,
                caches: ["localStorage", "cookie"],
            },
            backend: {
                loadPath: "/locales/{{lng}}/{{ns}}.json",
            },
            react: {
                useSuspense: false, // Important for SSR
            },
        });

    return instance;
}

// Helper function to get locale from URL path
export function getLocaleFromPath(path: string): Locale {
    const segments = path.split("/").filter(Boolean);
    const maybeLocale = segments[0];
    
    if (locales.includes(maybeLocale as Locale)) {
        return maybeLocale as Locale;
    }
    
    return defaultLocale;
}

// Helper function to generate localized paths
export function getLocalizedPath(path: string, locale: Locale): string {
    const currentLocale = getLocaleFromPath(path);
    const pathWithoutLocale = path.replace(new RegExp(`^/${currentLocale}`), "");
    
    if (locale === defaultLocale) {
        return pathWithoutLocale || "/";
    }
    
    return `/${locale}${pathWithoutLocale}`;
}