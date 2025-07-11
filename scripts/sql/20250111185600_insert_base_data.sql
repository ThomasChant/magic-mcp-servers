-- MCP Link Base Data
-- Generated on: 2025-01-11
-- Description: Base data for categories and sample servers

-- Insert Categories
INSERT INTO categories (id, name_en, name_zh_cn, name_zh_tw, name_fr, name_ja, name_ko, name_ru, 
    description_en, description_zh_cn, description_zh_tw, description_fr, description_ja, description_ko, description_ru, 
    icon, color, server_count) VALUES
('filesystem', 'File System', '文件系统', '檔案系統', 'Système de fichiers', 'ファイルシステム', '파일 시스템', 'Файловая система',
    'Tools for file operations and management', '文件操作和管理工具', '檔案操作和管理工具', 'Outils pour les opérations et la gestion de fichiers', 'ファイル操作と管理のためのツール', '파일 작업 및 관리 도구', 'Инструменты для работы с файлами',
    'Folder', '#3B82F6', 0),

('database-storage', 'Database & Storage', '数据库与存储', '資料庫與儲存', 'Base de données et stockage', 'データベースとストレージ', '데이터베이스 및 스토리지', 'База данных и хранилище',
    'Database connections and data storage solutions', '数据库连接和数据存储解决方案', '資料庫連接和資料儲存解決方案', 'Connexions de base de données et solutions de stockage', 'データベース接続とデータストレージソリューション', '데이터베이스 연결 및 데이터 저장 솔루션', 'Подключения к базам данных и решения для хранения',
    'Database', '#10B981', 0),

('communication', 'Communication', '通信', '通訊', 'Communication', 'コミュニケーション', '커뮤니케이션', 'Коммуникация',
    'Messaging, email, and notification services', '消息、邮件和通知服务', '訊息、郵件和通知服務', 'Services de messagerie, email et notification', 'メッセージング、メール、通知サービス', '메시징, 이메일 및 알림 서비스', 'Сервисы обмена сообщениями и уведомлений',
    'MessageCircle', '#8B5CF6', 0),

('development', 'Development Tools', '开发工具', '開發工具', 'Outils de développement', '開発ツール', '개발 도구', 'Инструменты разработки',
    'Code analysis, generation, and development utilities', '代码分析、生成和开发工具', '程式碼分析、生成和開發工具', 'Analyse de code, génération et utilitaires de développement', 'コード分析、生成、開発ユーティリティ', '코드 분석, 생성 및 개발 유틸리티', 'Анализ кода и инструменты разработки',
    'Code', '#F59E0B', 0),

('api-integration', 'API Integration', 'API集成', 'API整合', 'Intégration API', 'API統合', 'API 통합', 'Интеграция API',
    'Third-party API connections and integrations', '第三方API连接和集成', '第三方API連接和整合', 'Connexions et intégrations API tierces', 'サードパーティAPI接続と統合', '타사 API 연결 및 통합', 'Подключения к сторонним API',
    'Link2', '#EF4444', 0),

('utilities', 'Utilities', '实用工具', '實用工具', 'Utilitaires', 'ユーティリティ', '유틸리티', 'Утилиты',
    'General purpose tools and utilities', '通用工具和实用程序', '通用工具和實用程式', 'Outils et utilitaires à usage général', '汎用ツールとユーティリティ', '범용 도구 및 유틸리티', 'Универсальные инструменты и утилиты',
    'Wrench', '#6366F1', 0),

('monitoring', 'Monitoring & Analytics', '监控与分析', '監控與分析', 'Surveillance et analyse', 'モニタリングと分析', '모니터링 및 분석', 'Мониторинг и аналитика',
    'System monitoring, logging, and analytics tools', '系统监控、日志和分析工具', '系統監控、日誌和分析工具', 'Outils de surveillance système, journalisation et analyse', 'システム監視、ログ、分析ツール', '시스템 모니터링, 로깅 및 분석 도구', 'Мониторинг системы и аналитика',
    'Activity', '#14B8A6', 0),

('ai-ml', 'AI & Machine Learning', '人工智能与机器学习', '人工智慧與機器學習', 'IA et apprentissage automatique', 'AIと機械学習', 'AI 및 머신러닝', 'ИИ и машинное обучение',
    'AI models, machine learning, and intelligent agents', 'AI模型、机器学习和智能代理', 'AI模型、機器學習和智慧代理', 'Modèles IA, apprentissage automatique et agents intelligents', 'AIモデル、機械学習、インテリジェントエージェント', 'AI 모델, 머신러닝 및 지능형 에이전트', 'ИИ модели и машинное обучение',
    'Brain', '#EC4899', 0),

('productivity', 'Business & Productivity', '商业与生产力', '商業與生產力', 'Affaires et productivité', 'ビジネスと生産性', '비즈니스 및 생산성', 'Бизнес и продуктивность',
    'Business tools and productivity enhancers', '商业工具和生产力增强器', '商業工具和生產力增強器', 'Outils commerciaux et améliorateurs de productivité', 'ビジネスツールと生産性向上ツール', '비즈니스 도구 및 생산성 향상 도구', 'Бизнес-инструменты и повышение продуктивности',
    'Briefcase', '#84CC16', 0),

('cloud-infrastructure', 'Cloud & Infrastructure', '云与基础设施', '雲與基礎設施', 'Cloud et infrastructure', 'クラウドとインフラ', '클라우드 및 인프라', 'Облако и инфраструктура',
    'Cloud services and infrastructure management', '云服务和基础设施管理', '雲服務和基礎設施管理', 'Services cloud et gestion infrastructure', 'クラウドサービスとインフラ管理', '클라우드 서비스 및 인프라 관리', 'Облачные сервисы и управление инфраструктурой',
    'Cloud', '#0EA5E9', 0),

('content', 'Content & Media', '内容与媒体', '內容與媒體', 'Contenu et médias', 'コンテンツとメディア', '콘텐츠 및 미디어', 'Контент и медиа',
    'Content management and media processing', '内容管理和媒体处理', '內容管理和媒體處理', 'Gestion de contenu et traitement média', 'コンテンツ管理とメディア処理', '콘텐츠 관리 및 미디어 처리', 'Управление контентом и обработка медиа',
    'Image', '#F97316', 0),

('finance', 'Finance & Payments', '金融与支付', '金融與支付', 'Finance et paiements', '金融と決済', '금융 및 결제', 'Финансы и платежи',
    'Financial services and payment processing', '金融服务和支付处理', '金融服務和支付處理', 'Services financiers et traitement des paiements', '金融サービスと決済処理', '금융 서비스 및 결제 처리', 'Финансовые услуги и обработка платежей',
    'CreditCard', '#78716C', 0),

('web', 'Web & Network', '网络', '網路', 'Web et réseau', 'ウェブとネットワーク', '웹 및 네트워크', 'Веб и сеть',
    'Web services, browsers, and network tools', '网络服务、浏览器和网络工具', '網路服務、瀏覽器和網路工具', 'Services web, navigateurs et outils réseau', 'ウェブサービス、ブラウザ、ネットワークツール', '웹 서비스, 브라우저 및 네트워크 도구', 'Веб-сервисы и сетевые инструменты',
    'Globe', '#06B6D4', 0),

('security', 'Security', '安全', '安全', 'Sécurité', 'セキュリティ', '보안', 'Безопасность',
    'Security tools and authentication services', '安全工具和认证服务', '安全工具和認證服務', 'Outils de sécurité et services authentification', 'セキュリティツールと認証サービス', '보안 도구 및 인증 서비스', 'Инструменты безопасности и аутентификации',
    'Shield', '#DC2626', 0),

('specialized', 'Specialized Domains', '专业领域', '專業領域', 'Domaines spécialisés', '専門分野', '전문 분야', 'Специализированные области',
    'Domain-specific and specialized tools', '特定领域和专业工具', '特定領域和專業工具', 'Outils spécifiques au domaine et spécialisés', 'ドメイン固有および専門ツール', '도메인별 및 전문 도구', 'Специализированные инструменты',
    'Layers', '#7C3AED', 0)
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_zh_cn = EXCLUDED.name_zh_cn,
    description_en = EXCLUDED.description_en,
    description_zh_cn = EXCLUDED.description_zh_cn,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW();

-- Insert Subcategories
INSERT INTO subcategories (id, category_id, name_en, name_zh_cn, name_zh_tw, name_fr, name_ja, name_ko, name_ru,
    description_en, description_zh_cn, description_zh_tw, description_fr, description_ja, description_ko, description_ru) VALUES
-- File System subcategories
('file-operations', 'filesystem', 'File Operations', '文件操作', '檔案操作', 'Opérations sur fichiers', 'ファイル操作', '파일 작업', 'Файловые операции',
    'Basic file operations like read, write, copy, move', '基本文件操作如读取、写入、复制、移动', '基本檔案操作如讀取、寫入、複製、移動', 'Opérations de base sur les fichiers', '読み取り、書き込み、コピー、移動などの基本的なファイル操作', '읽기, 쓰기, 복사, 이동과 같은 기본 파일 작업', 'Базовые операции с файлами'),

('file-search', 'filesystem', 'File Search', '文件搜索', '檔案搜尋', 'Recherche de fichiers', 'ファイル検索', '파일 검색', 'Поиск файлов',
    'Search and find files based on various criteria', '根据各种条件搜索和查找文件', '根據各種條件搜尋和查找檔案', 'Rechercher et trouver des fichiers', '様々な条件に基づいてファイルを検索', '다양한 기준으로 파일 검색 및 찾기', 'Поиск файлов по различным критериям'),

-- Database subcategories
('sql-databases', 'database-storage', 'SQL Databases', 'SQL数据库', 'SQL資料庫', 'Bases de données SQL', 'SQLデータベース', 'SQL 데이터베이스', 'SQL базы данных',
    'Relational databases like PostgreSQL, MySQL, SQLite', '关系型数据库如PostgreSQL、MySQL、SQLite', '關係型資料庫如PostgreSQL、MySQL、SQLite', 'Bases de données relationnelles', 'PostgreSQL、MySQL、SQLiteなどのリレーショナルデータベース', 'PostgreSQL, MySQL, SQLite와 같은 관계형 데이터베이스', 'Реляционные базы данных'),

('nosql-databases', 'database-storage', 'NoSQL Databases', 'NoSQL数据库', 'NoSQL資料庫', 'Bases de données NoSQL', 'NoSQLデータベース', 'NoSQL 데이터베이스', 'NoSQL базы данных',
    'Document, key-value, and graph databases', '文档、键值和图数据库', '文檔、鍵值和圖資料庫', 'Bases de données document, clé-valeur et graphe', 'ドキュメント、キーバリュー、グラフデータベース', '문서, 키-값 및 그래프 데이터베이스', 'Документные и графовые базы данных'),

-- Development subcategories
('code-generation', 'development', 'Code Generation', '代码生成', '程式碼生成', 'Génération de code', 'コード生成', '코드 생성', 'Генерация кода',
    'AI-powered code generation and scaffolding', 'AI驱动的代码生成和脚手架', 'AI驅動的程式碼生成和腳手架', 'Génération de code et échafaudage alimentés par IA', 'AI駆動のコード生成とスキャフォールディング', 'AI 기반 코드 생성 및 스캐폴딩', 'Генерация кода с помощью ИИ'),

('code-analysis', 'development', 'Code Analysis', '代码分析', '程式碼分析', 'Analyse de code', 'コード分析', '코드 분석', 'Анализ кода',
    'Static analysis, linting, and code quality tools', '静态分析、代码检查和代码质量工具', '靜態分析、程式碼檢查和程式碼品質工具', 'Analyse statique, linting et outils de qualité de code', '静的解析、リンティング、コード品質ツール', '정적 분석, 린팅 및 코드 품질 도구', 'Статический анализ и качество кода'),

-- AI subcategories
('llm-models', 'ai-ml', 'LLM Models', 'LLM模型', 'LLM模型', 'Modèles LLM', 'LLMモデル', 'LLM 모델', 'LLM модели',
    'Large Language Model integrations', '大型语言模型集成', '大型語言模型整合', 'Intégrations de grands modèles de langage', '大規模言語モデル統合', '대규모 언어 모델 통합', 'Интеграции больших языковых моделей'),

('ai-agents', 'ai-ml', 'AI Agents', 'AI代理', 'AI代理', 'Agents IA', 'AIエージェント', 'AI 에이전트', 'ИИ агенты',
    'Autonomous AI agents and assistants', '自主AI代理和助手', '自主AI代理和助手', 'Agents et assistants IA autonomes', '自律型AIエージェントとアシスタント', '자율 AI 에이전트 및 어시스턴트', 'Автономные ИИ агенты')
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name_en = EXCLUDED.name_en,
    name_zh_cn = EXCLUDED.name_zh_cn,
    description_en = EXCLUDED.description_en,
    description_zh_cn = EXCLUDED.description_zh_cn,
    updated_at = NOW();

-- Insert Sample Servers
INSERT INTO servers (
    id, name, owner, slug, description_en, description_zh_cn, full_description,
    icon, tags, category_id, subcategory_id, tech_stack, github_url,
    demo_url, docs_url, stars, forks, watchers, open_issues,
    last_updated, repo_created_at, complexity, maturity, featured, official,
    repository_owner, repository_name, platforms, quality_score,
    quality_documentation, quality_maintenance, quality_community, quality_performance
) VALUES
-- File System servers
('mcp-filesystem', 'File System MCP', 'modelcontextprotocol', 'file-system-mcp',
    'A Model Context Protocol server that provides comprehensive file system access',
    '提供全面文件系统访问的模型上下文协议服务器',
    'The File System MCP server enables AI assistants to interact with the local file system, providing read/write access, directory navigation, and file manipulation capabilities.',
    'folder-open',
    ARRAY['filesystem', 'file-operations', 'mcp', 'official'],
    'filesystem', 'file-operations',
    ARRAY['TypeScript', 'Node.js'],
    'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    NULL,
    'https://modelcontextprotocol.io/docs/servers/filesystem',
    1500, 200, 1500, 5,
    NOW(), NOW() - INTERVAL '6 months',
    'simple', 'stable', true, true,
    'modelcontextprotocol', 'servers',
    ARRAY['windows', 'macos', 'linux'],
    9.2, 9.0, 8.5, 9.0, 9.5),

-- Database servers
('mcp-postgres', 'PostgreSQL MCP', 'modelcontextprotocol', 'postgresql-mcp',
    'Connect to PostgreSQL databases via Model Context Protocol',
    '通过模型上下文协议连接到PostgreSQL数据库',
    'This MCP server provides a secure and efficient way to interact with PostgreSQL databases, supporting queries, schema inspection, and data manipulation.',
    'database',
    ARRAY['database', 'postgresql', 'sql', 'mcp'],
    'database-storage', 'sql-databases',
    ARRAY['Python', 'PostgreSQL'],
    'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    NULL,
    'https://modelcontextprotocol.io/docs/servers/postgres',
    800, 120, 800, 3,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 months',
    'medium', 'stable', true, false,
    'modelcontextprotocol', 'servers',
    ARRAY['windows', 'macos', 'linux'],
    8.5, 8.0, 8.5, 8.0, 9.0),

-- AI/ML servers
('mcp-claude', 'Claude API MCP', 'anthropic', 'claude-api-mcp',
    'Official MCP server for Claude API integration',
    'Claude API集成的官方MCP服务器',
    'Integrate Claude API capabilities into your MCP-enabled applications. This server provides seamless access to Claude models with built-in safety features.',
    'brain',
    ARRAY['ai', 'claude', 'anthropic', 'llm', 'official'],
    'ai-ml', 'llm-models',
    ARRAY['TypeScript', 'Node.js'],
    'https://github.com/anthropic/claude-mcp',
    'https://claude.ai',
    'https://docs.anthropic.com/mcp',
    5000, 600, 5000, 10,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 months',
    'medium', 'stable', true, true,
    'anthropic', 'claude-mcp',
    ARRAY['windows', 'macos', 'linux', 'web'],
    9.8, 9.5, 9.5, 9.8, 9.5),

-- Development servers
('mcp-github', 'GitHub MCP', 'modelcontextprotocol', 'github-mcp',
    'Interact with GitHub repositories, issues, and pull requests',
    '与GitHub仓库、问题和拉取请求交互',
    'A comprehensive MCP server for GitHub integration, allowing AI assistants to manage repositories, create issues, review pull requests, and more.',
    'github',
    ARRAY['github', 'git', 'development', 'version-control'],
    'development', 'code-analysis',
    ARRAY['TypeScript', 'Node.js', 'GitHub API'],
    'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    NULL,
    'https://modelcontextprotocol.io/docs/servers/github',
    2200, 350, 2200, 8,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 months',
    'complex', 'stable', true, true,
    'modelcontextprotocol', 'servers',
    ARRAY['windows', 'macos', 'linux'],
    9.0, 8.8, 8.5, 9.2, 8.5),

-- Web servers
('mcp-fetch', 'Web Fetch MCP', 'modelcontextprotocol', 'web-fetch-mcp',
    'Fetch and interact with web content via MCP',
    '通过MCP获取和交互网络内容',
    'Enable AI assistants to fetch web pages, APIs, and online resources with built-in parsing and content extraction capabilities.',
    'globe',
    ARRAY['web', 'http', 'api', 'fetch'],
    'web', NULL,
    ARRAY['Python', 'aiohttp'],
    'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    NULL,
    NULL,
    600, 80, 600, 2,
    NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 months',
    'simple', 'stable', false, false,
    'modelcontextprotocol', 'servers',
    ARRAY['windows', 'macos', 'linux'],
    7.8, 7.5, 8.0, 7.5, 8.0);

-- Update server counts for categories
UPDATE categories SET server_count = (
    SELECT COUNT(*) FROM servers WHERE servers.category_id = categories.id
);

-- Insert some sample featured servers data
UPDATE servers SET featured = true 
WHERE id IN ('mcp-filesystem', 'mcp-postgres', 'mcp-claude', 'mcp-github');

-- Create sample user favorites (requires user authentication in production)
-- These are just examples and would normally be created by authenticated users
-- INSERT INTO user_favorites (user_id, server_id) VALUES
-- ('sample-user-1', 'mcp-filesystem'),
-- ('sample-user-1', 'mcp-claude'),
-- ('sample-user-2', 'mcp-github');

-- Insert sample comments (requires user authentication in production)
-- INSERT INTO server_comments (server_id, user_id, user_name, content) VALUES
-- ('mcp-claude', 'sample-user-1', 'Alice', 'Great integration with Claude! Works seamlessly.'),
-- ('mcp-filesystem', 'sample-user-2', 'Bob', 'Essential tool for file operations. Highly recommended!');

-- Verify data insertion
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Subcategories inserted:', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Servers inserted:', COUNT(*) FROM servers;