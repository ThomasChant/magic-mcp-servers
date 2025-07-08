import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    Code,
    Search,
    Copy,
    Check,
    ArrowRight,
    Star,
    Users,
    Shield,
    Plug,
    ExpandIcon as Expand,
    Settings,
    Database,
    MessageCircle,
    Folder,
    Rocket,
    LayoutGrid,
    Info,
} from "lucide-react";

const Docs: React.FC = () => {
    const { t } = useTranslation('docs');
    const [activeSection, setActiveSection] = useState("introduction");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Handle copy functionality
    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Handle scroll spy for active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section[id]");
            const scrollPosition = window.scrollY + 200;

            sections.forEach((section) => {
                const element = section as HTMLElement;
                const top = element.offsetTop;
                const height = element.offsetHeight;

                if (scrollPosition >= top && scrollPosition < top + height) {
                    setActiveSection(element.id);
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(sectionId);
        }
    };

    // Navigation item component
    const NavItem = ({ sectionId, children, className = "" }: { sectionId: string; children: React.ReactNode; className?: string }) => (
        <button
            onClick={() => scrollToSection(sectionId)}
            className={`block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full text-left transition-colors ${
                activeSection === sectionId
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-3 border-blue-600 dark:border-blue-400"
                    : ""
            } ${className}`}
        >
            {children}
        </button>
    );

    // Code block component
    const CodeBlock = ({ code, id }: { code: string; id: string }) => (
        <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 mb-3">
            <button
                onClick={() => copyToClipboard(code, id)}
                className="absolute top-2 right-2 bg-gray-700 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                {copiedCode === id ? (
                    <>
                        <Check className="inline mr-1" size={12} />
                        {t('buttons.copied')}
                    </>
                ) : (
                    <>
                        <Copy className="inline mr-1" size={12} />
                        {t('buttons.copy')}
                    </>
                )}
            </button>
            <pre className="text-green-400 dark:text-green-300 text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            {t('header.title')}
                        </h1>
                        <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
                            {t('header.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                {t('header.title')}
                            </h3>

                            <nav className="space-y-1">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        {t('navigation.gettingStarted')}
                                    </h4>
                                    <NavItem sectionId="introduction">
                                        {t('navigation.introduction')}
                                    </NavItem>
                                    <NavItem sectionId="quick-start">
                                        {t('navigation.quickStart')}
                                    </NavItem>
                                    <NavItem sectionId="installation">
                                        {t('navigation.installation')}
                                    </NavItem>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        {t('navigation.coreConcepts')}
                                    </h4>
                                    <NavItem sectionId="what-is-mcp">
                                        {t('navigation.whatIsMcp')}
                                    </NavItem>
                                    <NavItem sectionId="server-types">
                                        {t('navigation.serverTypes')}
                                    </NavItem>
                                    <NavItem sectionId="integration">
                                        {t('navigation.integration')}
                                    </NavItem>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        {t('navigation.advanced')}
                                    </h4>
                                    <NavItem sectionId="custom-servers">
                                        {t('navigation.customServers')}
                                    </NavItem>
                                    <NavItem sectionId="best-practices">
                                        {t('navigation.bestPractices')}
                                    </NavItem>
                                    <NavItem sectionId="troubleshooting">
                                        {t('navigation.troubleshooting')}
                                    </NavItem>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        {t('navigation.reference')}
                                    </h4>
                                    <NavItem sectionId="api-reference">
                                        {t('navigation.apiReference')}
                                    </NavItem>
                                    <NavItem sectionId="examples">
                                        {t('navigation.examples')}
                                    </NavItem>
                                    <NavItem sectionId="faq">{t('navigation.faq')}</NavItem>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                            {/* Introduction Section */}
                            <section id="introduction" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('introduction.title')}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                    {t('introduction.description')}
                                </p>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <Info
                                                className="text-blue-400 dark:text-blue-400"
                                                size={20}
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                <strong>{t('introduction.newToMcp')}</strong> {t('introduction.mcpDescription')}{" "}
                                                <button
                                                    onClick={() =>
                                                        scrollToSection(
                                                            "what-is-mcp"
                                                        )
                                                    }
                                                    className="underline hover:no-underline"
                                                >
                                                    {t('introduction.learnMore')}
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t('introduction.keyFeatures')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Search
                                                className="text-blue-600 dark:text-blue-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {t('introduction.smartDiscovery.title')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('introduction.smartDiscovery.description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Star
                                                className="text-green-600 dark:text-green-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {t('introduction.qualityRatings.title')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('introduction.qualityRatings.description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Code
                                                className="text-purple-600 dark:text-purple-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {t('introduction.easyIntegration.title')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('introduction.easyIntegration.description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3 mt-1">
                                            <Users
                                                className="text-orange-600 dark:text-orange-400"
                                                size={16}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {t('introduction.activeCommunity.title')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('introduction.activeCommunity.description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Quick Start Section */}
                            <section id="quick-start" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('quickStart.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('quickStart.description')}
                                </p>

                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {t('quickStart.step1.title')}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {t('quickStart.step1.description')}
                                            </p>
                                            <Link
                                                to="/servers"
                                                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                            >
                                                {t('quickStart.step1.browseServers')}
                                                <ArrowRight
                                                    className="ml-1"
                                                    size={16}
                                                />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {t('quickStart.step2.title')}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {t('quickStart.step2.description')}
                                            </p>
                                            <div className="group">
                                                <CodeBlock
                                                    code="npx @modelcontextprotocol/server-filesystem"
                                                    id="install-cmd"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {t('quickStart.step3.title')}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {t('quickStart.step3.description')}
                                            </p>
                                            <div className="group">
                                                <CodeBlock
                                                    code={`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}`}
                                                    id="config-cmd"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                                            ✓
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {t('quickStart.step4.title')}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {t('quickStart.step4.description')}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    scrollToSection("examples")
                                                }
                                                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                                            >
                                                {t('quickStart.step4.viewExamples')}
                                                <ArrowRight
                                                    className="ml-1"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Installation Section */}
                            <section id="installation" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('installation.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('installation.description')}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('installation.npmInstallation.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('installation.npmInstallation.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="npm install @modelcontextprotocol/server-filesystem"
                                                id="npm-install"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('installation.pythonInstallation.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('installation.pythonInstallation.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="pip install mcp-server-filesystem"
                                                id="pip-install"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('installation.dockerInstallation.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('installation.dockerInstallation.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="docker run -p 3000:3000 mcp-hub/filesystem-server"
                                                id="docker-install"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* What is MCP Section */}
                            <section id="what-is-mcp" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('whatIsMcp.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('whatIsMcp.description')}
                                </p>

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        {t('whatIsMcp.keyBenefits')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <Shield
                                                className="text-blue-600 dark:text-blue-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {t('whatIsMcp.secureDataAccess')}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Plug
                                                className="text-green-600 dark:text-green-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {t('whatIsMcp.standardizedIntegration')}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Expand
                                                className="text-purple-600 dark:text-purple-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {t('whatIsMcp.scalableArchitecture')}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Settings
                                                className="text-orange-600 dark:text-orange-400 mr-3"
                                                size={20}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {t('whatIsMcp.easyMaintenance')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t('whatIsMcp.howMcpWorks')}
                                </h3>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('whatIsMcp.clientServerArchitecture')}
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('whatIsMcp.standardizedProtocol')}
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('whatIsMcp.resourceAccess')}
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('whatIsMcp.secureBoundaries')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Server Types Section */}
                            <section id="server-types" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('serverTypes.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('serverTypes.description')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Folder
                                                    className="text-blue-600 dark:text-blue-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {t('serverTypes.fileSystem.title')}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('serverTypes.fileSystem.description')}
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.fileSystem.readWrite')}
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.fileSystem.cloudStorage')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Database
                                                    className="text-green-600 dark:text-green-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {t('serverTypes.database.title')}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('serverTypes.database.description')}
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.database.sql')}
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.database.nosql')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <MessageCircle
                                                    className="text-purple-600 dark:text-purple-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {t('serverTypes.communication.title')}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('serverTypes.communication.description')}
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.communication.slack')}
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.communication.email')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-700/50">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                                                <Code
                                                    className="text-orange-600 dark:text-orange-400"
                                                    size={20}
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {t('serverTypes.development.title')}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('serverTypes.development.description')}
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.development.git')}
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded mr-2">
                                                {t('serverTypes.development.cicd')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Integration Section */}
                            <section id="integration" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('integration.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('integration.description')}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('integration.configurationSetup.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('integration.configurationSetup.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`{
  "mcpServers": {
    "myserver": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}`}
                                                id="integration-config"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('integration.connectionTesting.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('integration.connectionTesting.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code="mcp-cli test-connection myserver"
                                                id="test-connection"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Building Servers Section */}
                            <section id="custom-servers" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('customServers.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('customServers.description')}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('customServers.serverStructure.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('customServers.serverStructure.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0'
});

// Add your resources and tools here
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'custom://data',
        name: 'Custom Data',
        description: 'My custom data source'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);`}
                                                id="server-structure"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Best Practices Section */}
                            <section id="best-practices" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('bestPractices.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('bestPractices.description')}
                                </p>

                                <div className="space-y-6">
                                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4">
                                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                                            {t('bestPractices.security.title')}
                                        </h3>
                                        <ul className="text-green-700 dark:text-green-300 space-y-1">
                                            <li>
                                                • {t('bestPractices.security.validateInput')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.security.implementAuth')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.security.useEnvVars')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.security.updateDependencies')}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4">
                                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                            {t('bestPractices.performance.title')}
                                        </h3>
                                        <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                                            <li>
                                                • {t('bestPractices.performance.implementCaching')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.performance.useConnectionPooling')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.performance.optimizeResources')}
                                            </li>
                                            <li>
                                                • {t('bestPractices.performance.monitorMetrics')}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Troubleshooting Section */}
                            <section id="troubleshooting" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('troubleshooting.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('troubleshooting.description')}
                                </p>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('troubleshooting.connectionFailures.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('troubleshooting.connectionFailures.description')}
                                        </p>
                                        <ul className="text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>
                                                • {t('troubleshooting.connectionFailures.checkProcess')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.connectionFailures.verifyPaths')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.connectionFailures.ensureDependencies')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.connectionFailures.checkLogs')}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('troubleshooting.permissionErrors.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('troubleshooting.permissionErrors.description')}
                                        </p>
                                        <ul className="text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                            <li>
                                                • {t('troubleshooting.permissionErrors.verifyPermissions')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.permissionErrors.checkAccess')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.permissionErrors.ensureCredentials')}
                                            </li>
                                            <li>
                                                • {t('troubleshooting.permissionErrors.reviewPolicies')}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* API Reference Section */}
                            <section id="api-reference" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('apiReference.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('apiReference.description')}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('apiReference.coreMethods')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    resources/list
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {t('apiReference.resourcesList')}
                                                </p>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    resources/read
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {t('apiReference.resourcesRead')}
                                                </p>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
                                                <h4 className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                    tools/list
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {t('apiReference.toolsList')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Examples Section */}
                            <section id="examples" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('examples.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('examples.description')}
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('examples.fileSystemServer.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('examples.fileSystemServer.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`// Configuration
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/home/user/documents"
      ]
    }
  }
}

// Usage in AI application
// The AI can now read and write files in /home/user/documents`}
                                                id="filesystem-example"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            {t('examples.databaseServer.title')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                                            {t('examples.databaseServer.description')}
                                        </p>
                                        <div className="group">
                                            <CodeBlock
                                                code={`// Configuration
{
  "mcpServers": {
    "database": {
      "command": "mcp-postgres-server",
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db"
      }
    }
  }
}

// The AI can now query your database
// Example: "Show me all users created in the last week"`}
                                                id="database-example"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section id="faq" className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    {t('faq.title')}
                                </h2>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('faq.choosingServer.question')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('faq.choosingServer.answer')}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('faq.security.question')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('faq.security.answer')}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('faq.multipleServers.question')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('faq.multipleServers.answer')}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-700/50">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {t('faq.contribute.question')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {t('faq.contribute.answer')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Call to Action */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg p-8 text-center text-white">
                                <h2 className="text-2xl font-bold mb-4">
                                    {t('callToAction.title')}
                                </h2>
                                <p className="text-blue-100 dark:text-blue-200 mb-6">
                                    {t('callToAction.description')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/servers"
                                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        <Rocket className="mr-2" size={20} />
                                        {t('callToAction.browseServers')}
                                    </Link>
                                    <Link
                                        to="/categories"
                                        className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 dark:hover:text-blue-700 transition-colors"
                                    >
                                        <LayoutGrid
                                            className="mr-2"
                                            size={20}
                                        />
                                        {t('callToAction.viewCategories')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Docs;