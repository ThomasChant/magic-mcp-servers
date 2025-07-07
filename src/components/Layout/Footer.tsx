import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                                <span className="text-white dark:text-white text-sm font-bold">
                                    M
                                </span>
                            </div>
                            <span className="text-xl font-bold text-white dark:text-gray-100">
                                {t('footer.brand')}
                            </span>
                        </div>
                        <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-md">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">
                            {t('footer.quickLinks')}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.home')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/servers"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.browseServers')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.categories')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/tags"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.tags')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/docs"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.documentation')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">
                            {t('footer.resources')}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://modelcontextprotocol.io/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.apiReference')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://modelcontextprotocol.io/introduction"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.developerGuide')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/modelcontextprotocol"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                                >
                                    {t('footer.community')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 dark:border-gray-700 pt-8 mt-8 transition-colors duration-200">
                    <p className="text-center text-gray-400 dark:text-gray-500">
                        {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;