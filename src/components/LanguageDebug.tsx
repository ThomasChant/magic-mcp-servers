import React from "react";
import { useTranslation } from "react-i18next";

const LanguageDebug: React.FC = () => {
    const { t, i18n } = useTranslation("common");
    
    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg z-50">
            <div className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">
                    语言切换调试信息
                </div>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                    <div>当前语言: <span className="font-mono font-semibold">{i18n.language}</span></div>
                    <div>导航-首页: <span className="font-semibold">{t("nav.home")}</span></div>
                    <div>导航-服务器: <span className="font-semibold">{t("nav.servers")}</span></div>
                    <div>搜索占位符: <span className="font-semibold">{t("header.searchPlaceholder")}</span></div>
                    <div>登录按钮: <span className="font-semibold">{t("auth.signIn")}</span></div>
                </div>
            </div>
        </div>
    );
};

export default LanguageDebug;