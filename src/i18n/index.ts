import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { isClientSide, isDevelopment } from "../utils/environment";

// Import all translations
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import zhCNCommon from "./locales/zh-CN/common.json";
import zhCNHome from "./locales/zh-CN/home.json";
import zhTWCommon from "./locales/zh-TW/common.json";
import zhTWHome from "./locales/zh-TW/home.json";
import frCommon from "./locales/fr/common.json";
import frHome from "./locales/fr/home.json";
import jaCommon from "./locales/ja/common.json";
import jaHome from "./locales/ja/home.json";
import koCommon from "./locales/ko/common.json";
import koHome from "./locales/ko/home.json";
import ruCommon from "./locales/ru/common.json";
import ruHome from "./locales/ru/home.json";

const resources = {
    en: {
        common: enCommon,
        home: enHome,
    },
    "zh-CN": {
        common: zhCNCommon,
        home: zhCNHome,
    },
    "zh-TW": {
        common: zhTWCommon,
        home: zhTWHome,
    },
    fr: {
        common: frCommon,
        home: frHome,
    },
    ja: {
        common: jaCommon,
        home: jaHome,
    },
    ko: {
        common: koCommon,
        home: koHome,
    },
    ru: {
        common: ruCommon,
        home: ruHome,
    },
};

// 基础i18n配置
const i18nConfig = {
    resources,
    lng: "en", // 默认语言
    fallbackLng: "en",
    
    ns: ["common", "home"],
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
            order: ['localStorage', 'navigator', 'htmlTag'],
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