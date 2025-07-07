import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { isClientSide, isDevelopment } from "../utils/environment";

// Import all translations
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enServer from "./locales/en/server.json";
import enFavorites from "./locales/en/favorites.json";
import enCategory from "./locales/en/category.json";
import enDocs from "./locales/en/docs.json";
import enProfile from "./locales/en/profile.json";
import zhCNCommon from "./locales/zh-CN/common.json";
import zhCNHome from "./locales/zh-CN/home.json";
import zhCNServer from "./locales/zh-CN/server.json";
import zhCNFavorites from "./locales/zh-CN/favorites.json";
import zhCNCategory from "./locales/zh-CN/category.json";
import zhCNDocs from "./locales/zh-CN/docs.json";
import zhCNProfile from "./locales/zh-CN/profile.json";
import zhTWCommon from "./locales/zh-TW/common.json";
import zhTWHome from "./locales/zh-TW/home.json";
import zhTWServer from "./locales/zh-TW/server.json";
import zhTWFavorites from "./locales/zh-TW/favorites.json";
import zhTWCategory from "./locales/zh-TW/category.json";
import zhTWDocs from "./locales/zh-TW/docs.json";
import zhTWProfile from "./locales/zh-TW/profile.json";
import frCommon from "./locales/fr/common.json";
import frHome from "./locales/fr/home.json";
import frServer from "./locales/fr/server.json";
import frFavorites from "./locales/fr/favorites.json";
import frCategory from "./locales/fr/category.json";
import frDocs from "./locales/fr/docs.json";
import frProfile from "./locales/fr/profile.json";
import jaCommon from "./locales/ja/common.json";
import jaHome from "./locales/ja/home.json";
import jaServer from "./locales/ja/server.json";
import jaFavorites from "./locales/ja/favorites.json";
import jaCategory from "./locales/ja/category.json";
import jaDocs from "./locales/ja/docs.json";
import jaProfile from "./locales/ja/profile.json";
import koCommon from "./locales/ko/common.json";
import koHome from "./locales/ko/home.json";
import koServer from "./locales/ko/server.json";
import koFavorites from "./locales/ko/favorites.json";
import koCategory from "./locales/ko/category.json";
import koDocs from "./locales/ko/docs.json";
import koProfile from "./locales/ko/profile.json";
import ruCommon from "./locales/ru/common.json";
import ruHome from "./locales/ru/home.json";
import ruServer from "./locales/ru/server.json";
import ruFavorites from "./locales/ru/favorites.json";
import ruCategory from "./locales/ru/category.json";
import ruDocs from "./locales/ru/docs.json";
import ruProfile from "./locales/ru/profile.json";

const resources = {
    en: {
        common: enCommon,
        home: enHome,
        server: enServer,
        favorites: enFavorites,
        category: enCategory,
        docs: enDocs,
        profile: enProfile,
    },
    "zh-CN": {
        common: zhCNCommon,
        home: zhCNHome,
        server: zhCNServer,
        favorites: zhCNFavorites,
        category: zhCNCategory,
        docs: zhCNDocs,
        profile: zhCNProfile,
    },
    "zh-TW": {
        common: zhTWCommon,
        home: zhTWHome,
        server: zhTWServer,
        favorites: zhTWFavorites,
        category: zhTWCategory,
        docs: zhTWDocs,
        profile: zhTWProfile,
    },
    fr: {
        common: frCommon,
        home: frHome,
        server: frServer,
        favorites: frFavorites,
        category: frCategory,
        docs: frDocs,
        profile: frProfile,
    },
    ja: {
        common: jaCommon,
        home: jaHome,
        server: jaServer,
        favorites: jaFavorites,
        category: jaCategory,
        docs: jaDocs,
        profile: jaProfile,
    },
    ko: {
        common: koCommon,
        home: koHome,
        server: koServer,
        favorites: koFavorites,
        category: koCategory,
        docs: koDocs,
        profile: koProfile,
    },
    ru: {
        common: ruCommon,
        home: ruHome,
        server: ruServer,
        favorites: ruFavorites,
        category: ruCategory,
        docs: ruDocs,
        profile: ruProfile,
    },
};

// 基础i18n配置
const i18nConfig = {
    resources,
    lng: "en", // 默认语言
    fallbackLng: "en",
    
    ns: ["common", "home", "server", "category", "docs", "profile", "favorites"],
    defaultNS: "common",
    
    interpolation: {
        escapeValue: false, // React已经默认转义
    },
    
    react: {
        useSuspense: false, // 禁用Suspense以兼容SSR
    },
    
    // 根据环境调整配置
    debug: isClientSide() && isDevelopment(),
    
    // SSR兼容性设置
    cleanCode: true,
    
    // 客户端特定配置
    ...(isClientSide() && {
        // 只在客户端启用语言检测和缓存
        detection: {
            order: ['path', 'localStorage', 'navigator', 'htmlTag'],
            lookupFromPathIndex: 0,
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
            excludeCacheFor: ['cimode'],
        }
    })
};

// 初始化i18n
if (isClientSide()) {
    // 客户端：启用语言检测
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init(i18nConfig);
} else {
    // 服务端：不使用语言检测，避免browser-only代码
    i18n
        .use(initReactI18next)
        .init(i18nConfig);
}

// 开发环境日志
if (isDevelopment() && isClientSide()) {
    console.log('🌍 i18n initialized on client side');
    console.log('📝 Available languages:', Object.keys(resources));
    console.log('🎯 Current language:', i18n.language);
}

export default i18n;