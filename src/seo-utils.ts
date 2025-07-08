import i18n from "i18next";
import type { MCPServer, Category } from "./types";

export interface SEOData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage?: string;
  canonicalUrl: string;
  keywords: string;
  hreflangTags?: string;
  structuredData?: object;
}

// Generate hreflang tags for all supported locales
function generateHreflangTags(pathWithoutLocale: string): string {
  const supportedLocales = ['en', 'zh-CN', 'zh-TW', 'fr', 'ja', 'ko', 'ru'];
  const hreflangTags = supportedLocales.map(lang => {
    const urlPath = lang === 'en' ? pathWithoutLocale : `/${lang}${pathWithoutLocale}`;
    return `<link rel="alternate" hreflang="${lang}" href="https://magicmcp.net${urlPath}" />`;
  }).join('\n    ');
  return hreflangTags + '\n    <link rel="alternate" hreflang="x-default" href="https://magicmcp.net' + pathWithoutLocale + '" />';
}

// Locale-aware home page SEO
export function generateLocalizedHomeSEO(url: string, locale: string = 'en'): SEOData {
  // Extract path without locale
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : '/';
  
  // Use translations with fallback to English
  const title = i18n.t('home:seo.title', { lng: locale }) || 
    "Magic MCP - Model Context Protocol Server Discovery";
  const description = i18n.t('home:seo.description', { lng: locale }) || 
    "Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools.";
  const ogTitle = i18n.t('home:seo.ogTitle', { lng: locale }) || 
    "Magic MCP - Model Context Protocol Server Discovery Platform";
  const ogDescription = i18n.t('home:seo.ogDescription', { lng: locale }) || 
    "Discover and integrate the best Model Context Protocol (MCP) servers. Browse 1000+ high-quality MCP servers for databases, filesystems, APIs, and development tools.";
  const keywords = i18n.t('home:seo.keywords', { lng: locale }) || 
    "MCP, Model Context Protocol, AI tools, servers, database integration, API, development tools, Claude MCP, AI agents";

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Magic MCP",
      "url": "https://magicmcp.net",
      "description": description,
      "publisher": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net",
        "logo": {
          "@type": "ImageObject",
          "url": "https://magicmcp.net/og-image.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://magicmcp.net/servers?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Servers",
        "description": "Curated list of Model Context Protocol servers",
        "numberOfItems": 200
      }
    }
  };
}

// Locale-aware servers list SEO
export function generateLocalizedServersListSEO(url: string, locale: string = 'en'): SEOData {
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/servers') : '/servers';

  // Complete multi-language SEO support
  const seoContent = {
    'en': {
      title: "MCP Server Directory - Browse All Servers | Magic MCP",
      description: "Browse the complete Model Context Protocol server directory. 1500+ verified servers for databases, filesystems, API integration, and development tools.",
      keywords: "MCP servers, Model Context Protocol, server directory, database integration, API tools, development tools, Claude MCP",
      breadcrumbHome: "Home",
      breadcrumbServers: "Servers"
    },
    'zh-CN': {
      title: "MCP 服务器目录 - 浏览所有服务器 | Magic MCP",
      description: "浏览完整的 Model Context Protocol 服务器目录。1500+ 验证的服务器，用于数据库、文件系统、API 集成和开发工具。",
      keywords: "MCP 服务器, Model Context Protocol, 服务器目录, 数据库集成, API 工具, 开发工具, Claude MCP",
      breadcrumbHome: "首页",
      breadcrumbServers: "服务器"
    },
    'zh-TW': {
      title: "MCP 伺服器目錄 - 瀏覽所有伺服器 | Magic MCP",
      description: "瀏覽完整的 Model Context Protocol 伺服器目錄。1500+ 驗證的伺服器，用於資料庫、檔案系統、API 整合和開發工具。",
      keywords: "MCP 伺服器, Model Context Protocol, 伺服器目錄, 資料庫整合, API 工具, 開發工具, Claude MCP",
      breadcrumbHome: "首頁",
      breadcrumbServers: "伺服器"
    },
    'fr': {
      title: "Répertoire de Serveurs MCP - Parcourir Tous les Serveurs | Magic MCP",
      description: "Parcourez le répertoire complet des serveurs Model Context Protocol. Plus de 1500 serveurs vérifiés pour bases de données, systèmes de fichiers, intégration API et outils de développement.",
      keywords: "serveurs MCP, Model Context Protocol, répertoire serveurs, intégration base de données, outils API, outils développement, Claude MCP",
      breadcrumbHome: "Accueil",
      breadcrumbServers: "Serveurs"
    },
    'ja': {
      title: "MCPサーバーディレクトリ - 全サーバーを閲覧 | Magic MCP",
      description: "完全なModel Context Protocolサーバーディレクトリを閲覧してください。データベース、ファイルシステム、API統合、開発ツール用の1500以上の検証済みサーバー。",
      keywords: "MCPサーバー, Model Context Protocol, サーバーディレクトリ, データベース統合, APIツール, 開発ツール, Claude MCP",
      breadcrumbHome: "ホーム",
      breadcrumbServers: "サーバー"
    },
    'ko': {
      title: "MCP 서버 디렉토리 - 모든 서버 탐색 | Magic MCP",
      description: "완전한 Model Context Protocol 서버 디렉토리를 탐색하세요. 데이터베이스, 파일 시스템, API 통합 및 개발 도구용 1500개 이상의 검증된 서버.",
      keywords: "MCP 서버, Model Context Protocol, 서버 디렉토리, 데이터베이스 통합, API 도구, 개발 도구, Claude MCP",
      breadcrumbHome: "홈",
      breadcrumbServers: "서버"
    },
    'ru': {
      title: "Каталог MCP Серверов - Просмотр Всех Серверов | Magic MCP",
      description: "Просматривайте полный каталог серверов Model Context Protocol. Более 1500 проверенных серверов для баз данных, файловых систем, интеграции API и инструментов разработки.",
      keywords: "MCP серверы, Model Context Protocol, каталог серверов, интеграция БД, API инструменты, инструменты разработки, Claude MCP",
      breadcrumbHome: "Главная",
      breadcrumbServers: "Серверы"
    }
  };

  const content = seoContent[locale] || seoContent['en'];
  const { title, description, keywords, breadcrumbHome, breadcrumbServers } = content;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": `https://magicmcp.net${url}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": breadcrumbHome,
            "item": locale === 'en' ? "https://magicmcp.net" : `https://magicmcp.net/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumbServers,
            "item": `https://magicmcp.net${url}`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "MCP Servers",
        "description": description,
        "numberOfItems": 1500
      }
    }
  };
}

// Locale-aware categories list SEO
export function generateLocalizedCategoriesListSEO(url: string, locale: string = 'en'): SEOData {
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/categories') : '/categories';

  // Complete multi-language SEO support for categories
  const seoContent = {
    'en': {
      title: "MCP Server Categories - Browse by Function | Magic MCP",
      description: "Browse Model Context Protocol servers by category. Includes databases, filesystems, API integration, development tools, AI assistants and more.",
      keywords: "MCP categories, Model Context Protocol, server categories, databases, filesystems, API integration, development tools, Claude MCP",
      breadcrumbHome: "Home",
      breadcrumbCategories: "Categories",
      mcpCategories: "MCP Categories"
    },
    'zh-CN': {
      title: "MCP 服务器分类 - 按功能浏览 | Magic MCP",
      description: "按分类浏览 Model Context Protocol 服务器。包括数据库、文件系统、API 集成、开发工具、AI 助手等。",
      keywords: "MCP 分类, Model Context Protocol, 服务器分类, 数据库, 文件系统, API 集成, 开发工具, Claude MCP",
      breadcrumbHome: "首页",
      breadcrumbCategories: "分类",
      mcpCategories: "MCP 分类"
    },
    'zh-TW': {
      title: "MCP 伺服器分類 - 按功能瀏覽 | Magic MCP",
      description: "按分類瀏覽 Model Context Protocol 伺服器。包括資料庫、檔案系統、API 整合、開發工具、AI 助手等。",
      keywords: "MCP 分類, Model Context Protocol, 伺服器分類, 資料庫, 檔案系統, API 整合, 開發工具, Claude MCP",
      breadcrumbHome: "首頁",
      breadcrumbCategories: "分類",
      mcpCategories: "MCP 分類"
    },
    'fr': {
      title: "Catégories de Serveurs MCP - Parcourir par Fonction | Magic MCP",
      description: "Parcourez les serveurs Model Context Protocol par catégorie. Comprend bases de données, systèmes de fichiers, intégration API, outils de développement, assistants IA et plus.",
      keywords: "catégories MCP, Model Context Protocol, catégories serveurs, bases de données, systèmes de fichiers, intégration API, outils développement, Claude MCP",
      breadcrumbHome: "Accueil",
      breadcrumbCategories: "Catégories",
      mcpCategories: "Catégories MCP"
    },
    'ja': {
      title: "MCPサーバーカテゴリ - 機能別閲覧 | Magic MCP",
      description: "Model Context Protocolサーバーをカテゴリ別に閲覧してください。データベース、ファイルシステム、API統合、開発ツール、AIアシスタントなどが含まれます。",
      keywords: "MCPカテゴリ, Model Context Protocol, サーバーカテゴリ, データベース, ファイルシステム, API統合, 開発ツール, Claude MCP",
      breadcrumbHome: "ホーム",
      breadcrumbCategories: "カテゴリ",
      mcpCategories: "MCPカテゴリ"
    },
    'ko': {
      title: "MCP 서버 카테고리 - 기능별 탐색 | Magic MCP",
      description: "Model Context Protocol 서버를 카테고리별로 탐색하세요. 데이터베이스, 파일 시스템, API 통합, 개발 도구, AI 어시스턴트 등이 포함됩니다.",
      keywords: "MCP 카테고리, Model Context Protocol, 서버 카테고리, 데이터베이스, 파일 시스템, API 통합, 개발 도구, Claude MCP",
      breadcrumbHome: "홈",
      breadcrumbCategories: "카테고리",
      mcpCategories: "MCP 카테고리"
    },
    'ru': {
      title: "Категории MCP Серверов - Просмотр по Функциям | Magic MCP",
      description: "Просматривайте серверы Model Context Protocol по категориям. Включает базы данных, файловые системы, интеграцию API, инструменты разработки, ИИ-помощники и многое другое.",
      keywords: "категории MCP, Model Context Protocol, категории серверов, базы данных, файловые системы, интеграция API, инструменты разработки, Claude MCP",
      breadcrumbHome: "Главная",
      breadcrumbCategories: "Категории",
      mcpCategories: "Категории MCP"
    }
  };

  const content = seoContent[locale] || seoContent['en'];
  const { title, description, keywords, breadcrumbHome, breadcrumbCategories, mcpCategories } = content;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": `https://magicmcp.net${url}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": breadcrumbHome,
            "item": locale === 'en' ? "https://magicmcp.net" : `https://magicmcp.net/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumbCategories,
            "item": `https://magicmcp.net${url}`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": mcpCategories,
        "description": description
      }
    }
  };
}

// Locale-aware server detail SEO
export function generateLocalizedServerSEO(server: MCPServer, url: string, locale: string = 'en'): SEOData {
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || `/servers/${server.slug}`) : `/servers/${server.slug}`;

  // Get localized description
  const description = server.description[locale] || server.description.en || server.fullDescription || "";
  
  // Complete multi-language SEO support for server details
  const seoLabels = {
    'en': {
      titleSuffix: "MCP Server",
      keywordTemplate: "MCP server, Model Context Protocol, Claude MCP, AI integration",
      breadcrumbHome: "Home",
      breadcrumbServers: "Servers"
    },
    'zh-CN': {
      titleSuffix: "MCP 服务器",
      keywordTemplate: "MCP 服务器, Model Context Protocol, Claude MCP, AI 集成",
      breadcrumbHome: "首页",
      breadcrumbServers: "服务器"
    },
    'zh-TW': {
      titleSuffix: "MCP 伺服器",
      keywordTemplate: "MCP 伺服器, Model Context Protocol, Claude MCP, AI 整合",
      breadcrumbHome: "首頁",
      breadcrumbServers: "伺服器"
    },
    'fr': {
      titleSuffix: "Serveur MCP",
      keywordTemplate: "serveur MCP, Model Context Protocol, Claude MCP, intégration IA",
      breadcrumbHome: "Accueil",
      breadcrumbServers: "Serveurs"
    },
    'ja': {
      titleSuffix: "MCPサーバー",
      keywordTemplate: "MCPサーバー, Model Context Protocol, Claude MCP, AI統合",
      breadcrumbHome: "ホーム",
      breadcrumbServers: "サーバー"
    },
    'ko': {
      titleSuffix: "MCP 서버",
      keywordTemplate: "MCP 서버, Model Context Protocol, Claude MCP, AI 통합",
      breadcrumbHome: "홈",
      breadcrumbServers: "서버"
    },
    'ru': {
      titleSuffix: "MCP Сервер",
      keywordTemplate: "MCP сервер, Model Context Protocol, Claude MCP, интеграция ИИ",
      breadcrumbHome: "Главная",
      breadcrumbServers: "Серверы"
    }
  };

  const labels = seoLabels[locale] || seoLabels['en'];
  const title = `${server.name} - ${labels.titleSuffix} | Magic MCP`;

  const metaDescription = description.length > 160 
    ? description.substring(0, 157) + "..."
    : description;

  const keywords = `${server.name}, ${labels.keywordTemplate}, ${server.tags.join(', ')}`;

  return {
    title,
    description: metaDescription,
    ogTitle: title,
    ogDescription: metaDescription,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: server.icon || "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": server.name,
      "description": description,
      "url": `https://magicmcp.net${url}`,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": server.compatibility.platforms.join(', ') || "Cross-platform",
      "programmingLanguage": server.repository.language || "JavaScript",
      "author": {
        "@type": "Person",
        "name": server.owner
      },
      "downloadUrl": server.repository.url,
      "version": "latest",
      "dateCreated": server.stats.createdAt,
      "dateModified": server.stats.lastUpdated,
      "aggregateRating": server.repository.stars > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": Math.min(5, Math.max(1, (server.repository.stars / 100) + 3)),
        "bestRating": 5,
        "worstRating": 1,
        "ratingCount": server.repository.stars
      } : undefined,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": labels.breadcrumbHome,
            "item": locale === 'en' ? "https://magicmcp.net" : `https://magicmcp.net/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": labels.breadcrumbServers,
            "item": locale === 'en' ? "https://magicmcp.net/servers" : `https://magicmcp.net/${locale}/servers`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": server.name,
            "item": `https://magicmcp.net${url}`
          }
        ]
      }
    }
  };
}

// Locale-aware category detail SEO
export function generateLocalizedCategorySEO(category: Category | null, url: string, locale: string = 'en'): SEOData {
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || `/categories/${category?.id}`) : `/categories/${category?.id}`;

  if (!category) {
    const title = locale === 'zh-CN' ? "分类未找到 - Magic MCP" : "Category Not Found - Magic MCP";
    const description = locale === 'zh-CN' ? "找不到请求的 MCP 服务器分类。" : "The requested MCP server category could not be found.";
    
    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogUrl: `https://magicmcp.net${url}`,
      ogImage: "https://magicmcp.net/og-image.png",
      canonicalUrl: `https://magicmcp.net${url}`,
      keywords: "",
      hreflangTags: generateHreflangTags(pathWithoutLocale),
    };
  }

  const categoryName = category.name[locale] || category.name.en || "Unknown Category";
  const categoryDesc = category.description[locale] || category.description.en || "";
  
  // Complete multi-language SEO support for category details
  const seoTemplates = {
    'en': {
      titleSuffix: "MCP Servers",
      exploreTemplate: "Explore {categoryName} Model Context Protocol servers. {categoryDesc}",
      browseTemplate: "Browse all {categoryName} Model Context Protocol servers to find tools that meet your needs.",
      keywordTemplate: "MCP, Model Context Protocol, servers, tools, Claude MCP, AI integration",
      breadcrumbHome: "Home",
      breadcrumbCategories: "Categories",
      serversLabel: "Servers",
      collectionLabel: "Collection of {categoryName} Model Context Protocol servers"
    },
    'zh-CN': {
      titleSuffix: "MCP 服务器",
      exploreTemplate: "探索 {categoryName} Model Context Protocol 服务器。{categoryDesc}",
      browseTemplate: "浏览所有 {categoryName} Model Context Protocol 服务器，找到满足您需求的工具。",
      keywordTemplate: "MCP, Model Context Protocol, 服务器, 工具, Claude MCP, AI 集成",
      breadcrumbHome: "首页",
      breadcrumbCategories: "分类",
      serversLabel: "服务器",
      collectionLabel: "{categoryName} Model Context Protocol 服务器集合"
    },
    'zh-TW': {
      titleSuffix: "MCP 伺服器",
      exploreTemplate: "探索 {categoryName} Model Context Protocol 伺服器。{categoryDesc}",
      browseTemplate: "瀏覽所有 {categoryName} Model Context Protocol 伺服器，找到滿足您需求的工具。",
      keywordTemplate: "MCP, Model Context Protocol, 伺服器, 工具, Claude MCP, AI 整合",
      breadcrumbHome: "首頁",
      breadcrumbCategories: "分類",
      serversLabel: "伺服器",
      collectionLabel: "{categoryName} Model Context Protocol 伺服器集合"
    },
    'fr': {
      titleSuffix: "Serveurs MCP",
      exploreTemplate: "Explorez les serveurs Model Context Protocol {categoryName}. {categoryDesc}",
      browseTemplate: "Parcourez tous les serveurs Model Context Protocol {categoryName} pour trouver des outils qui répondent à vos besoins.",
      keywordTemplate: "MCP, Model Context Protocol, serveurs, outils, Claude MCP, intégration IA",
      breadcrumbHome: "Accueil",
      breadcrumbCategories: "Catégories",
      serversLabel: "Serveurs",
      collectionLabel: "Collection de serveurs Model Context Protocol {categoryName}"
    },
    'ja': {
      titleSuffix: "MCPサーバー",
      exploreTemplate: "{categoryName} Model Context Protocolサーバーを探索してください。{categoryDesc}",
      browseTemplate: "ニーズに合うツールを見つけるために、すべての{categoryName} Model Context Protocolサーバーを閲覧してください。",
      keywordTemplate: "MCP, Model Context Protocol, サーバー, ツール, Claude MCP, AI統合",
      breadcrumbHome: "ホーム",
      breadcrumbCategories: "カテゴリ",
      serversLabel: "サーバー",
      collectionLabel: "{categoryName} Model Context Protocolサーバーのコレクション"
    },
    'ko': {
      titleSuffix: "MCP 서버",
      exploreTemplate: "{categoryName} Model Context Protocol 서버를 탐색하세요. {categoryDesc}",
      browseTemplate: "필요에 맞는 도구를 찾기 위해 모든 {categoryName} Model Context Protocol 서버를 탐색하세요.",
      keywordTemplate: "MCP, Model Context Protocol, 서버, 도구, Claude MCP, AI 통합",
      breadcrumbHome: "홈",
      breadcrumbCategories: "카테고리",
      serversLabel: "서버",
      collectionLabel: "{categoryName} Model Context Protocol 서버 컬렉션"
    },
    'ru': {
      titleSuffix: "MCP Серверы",
      exploreTemplate: "Исследуйте серверы Model Context Protocol {categoryName}. {categoryDesc}",
      browseTemplate: "Просматривайте все серверы Model Context Protocol {categoryName}, чтобы найти инструменты, отвечающие вашим потребностям.",
      keywordTemplate: "MCP, Model Context Protocol, серверы, инструменты, Claude MCP, интеграция ИИ",
      breadcrumbHome: "Главная",
      breadcrumbCategories: "Категории",
      serversLabel: "Серверы",
      collectionLabel: "Коллекция серверов Model Context Protocol {categoryName}"
    }
  };

  const template = seoTemplates[locale] || seoTemplates['en'];
  const title = `${categoryName} ${template.titleSuffix} | Magic MCP`;
  
  const description = categoryDesc ? 
    template.exploreTemplate.replace('{categoryName}', categoryName).replace('{categoryDesc}', categoryDesc) :
    template.browseTemplate.replace('{categoryName}', categoryName);

  const keywords = `${template.keywordTemplate}, ${categoryName}`;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": `https://magicmcp.net${url}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": template.breadcrumbHome,
            "item": locale === 'en' ? "https://magicmcp.net" : `https://magicmcp.net/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": template.breadcrumbCategories,
            "item": locale === 'en' ? "https://magicmcp.net/categories" : `https://magicmcp.net/${locale}/categories`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": categoryName,
            "item": `https://magicmcp.net${url}`
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": `${categoryName} ${template.serversLabel}`,
        "description": template.collectionLabel.replace('{categoryName}', categoryName)
      }
    }
  };
}

// Locale-aware docs SEO
export function generateLocalizedDocsSEO(url: string, locale: string = 'en'): SEOData {
  const localePattern = /^\/(zh-CN|zh-TW|fr|ja|ko|ru)(\/.*)?$/;
  const localeMatch = url.match(localePattern);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/docs') : '/docs';

  // Complete multi-language SEO support for docs
  const seoContent = {
    'en': {
      title: "Documentation - How to Use MCP Servers | Magic MCP",
      description: "Learn how to install, configure, and use Model Context Protocol servers. Includes detailed setup guides, best practices, and troubleshooting.",
      keywords: "MCP documentation, Model Context Protocol, installation guide, configuration tutorial, setup instructions, Claude MCP, AI integration",
      breadcrumbHome: "Home",
      breadcrumbDocs: "Documentation",
      howToTitle: "How to Install and Use MCP Servers",
      howToDescription: "Step-by-step guide to get started with Model Context Protocol servers"
    },
    'zh-CN': {
      title: "文档 - 如何使用 MCP 服务器 | Magic MCP",
      description: "学习如何安装、配置和使用 Model Context Protocol 服务器。包括详细的设置指南、最佳实践和故障排除。",
      keywords: "MCP 文档, Model Context Protocol, 安装指南, 配置教程, 设置说明, Claude MCP, AI 集成",
      breadcrumbHome: "首页",
      breadcrumbDocs: "文档",
      howToTitle: "如何安装和使用 MCP 服务器",
      howToDescription: "使用 Model Context Protocol 服务器的分步指南"
    },
    'zh-TW': {
      title: "文件 - 如何使用 MCP 伺服器 | Magic MCP",
      description: "學習如何安裝、配置和使用 Model Context Protocol 伺服器。包括詳細的設置指南、最佳實踐和故障排除。",
      keywords: "MCP 文件, Model Context Protocol, 安裝指南, 配置教程, 設置說明, Claude MCP, AI 整合",
      breadcrumbHome: "首頁",
      breadcrumbDocs: "文件",
      howToTitle: "如何安裝和使用 MCP 伺服器",
      howToDescription: "使用 Model Context Protocol 伺服器的分步指南"
    },
    'fr': {
      title: "Documentation - Comment Utiliser les Serveurs MCP | Magic MCP",
      description: "Apprenez à installer, configurer et utiliser les serveurs Model Context Protocol. Comprend des guides de configuration détaillés, meilleures pratiques et dépannage.",
      keywords: "documentation MCP, Model Context Protocol, guide installation, tutoriel configuration, instructions configuration, Claude MCP, intégration IA",
      breadcrumbHome: "Accueil",
      breadcrumbDocs: "Documentation",
      howToTitle: "Comment Installer et Utiliser les Serveurs MCP",
      howToDescription: "Guide étape par étape pour débuter avec les serveurs Model Context Protocol"
    },
    'ja': {
      title: "ドキュメント - MCPサーバーの使用方法 | Magic MCP",
      description: "Model Context Protocolサーバーのインストール、設定、使用方法を学習してください。詳細なセットアップガイド、ベストプラクティス、トラブルシューティングが含まれます。",
      keywords: "MCP ドキュメント, Model Context Protocol, インストールガイド, 設定チュートリアル, セットアップ手順, Claude MCP, AI統合",
      breadcrumbHome: "ホーム",
      breadcrumbDocs: "ドキュメント",
      howToTitle: "MCPサーバーのインストールと使用方法",
      howToDescription: "Model Context Protocolサーバーを始めるためのステップバイステップガイド"
    },
    'ko': {
      title: "문서 - MCP 서버 사용 방법 | Magic MCP",
      description: "Model Context Protocol 서버를 설치, 구성 및 사용하는 방법을 배우세요. 상세한 설정 가이드, 모범 사례 및 문제 해결이 포함됩니다.",
      keywords: "MCP 문서, Model Context Protocol, 설치 가이드, 구성 튜토리얼, 설정 지침, Claude MCP, AI 통합",
      breadcrumbHome: "홈",
      breadcrumbDocs: "문서",
      howToTitle: "MCP 서버 설치 및 사용 방법",
      howToDescription: "Model Context Protocol 서버 시작을 위한 단계별 가이드"
    },
    'ru': {
      title: "Документация - Как Использовать MCP Серверы | Magic MCP",
      description: "Изучите, как устанавливать, настраивать и использовать серверы Model Context Protocol. Включает подробные руководства по настройке, лучшие практики и устранение неполадок.",
      keywords: "MCP документация, Model Context Protocol, руководство установки, учебник настройки, инструкции настройки, Claude MCP, интеграция ИИ",
      breadcrumbHome: "Главная",
      breadcrumbDocs: "Документация",
      howToTitle: "Как Установить и Использовать MCP Серверы",
      howToDescription: "Пошаговое руководство по началу работы с серверами Model Context Protocol"
    }
  };

  const content = seoContent[locale] || seoContent['en'];
  const { title, description, keywords, breadcrumbHome, breadcrumbDocs, howToTitle, howToDescription } = content;

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://magicmcp.net${url}`,
    ogImage: "https://magicmcp.net/og-image.png",
    canonicalUrl: `https://magicmcp.net${url}`,
    keywords,
    hreflangTags: generateHreflangTags(pathWithoutLocale),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "name": title,
      "description": description,
      "url": `https://magicmcp.net${url}`,
      "author": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Magic MCP",
        "url": "https://magicmcp.net",
        "logo": {
          "@type": "ImageObject",
          "url": "https://magicmcp.net/og-image.png"
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": breadcrumbHome,
            "item": locale === 'en' ? "https://magicmcp.net" : `https://magicmcp.net/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": breadcrumbDocs,
            "item": `https://magicmcp.net${url}`
          }
        ]
      },
      "mainEntity": {
        "@type": "HowTo",
        "name": howToTitle,
        "description": howToDescription
      }
    }
  };
}