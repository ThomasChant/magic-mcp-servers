-- MCP Link Database Schema
-- Generated on: 2025-01-11
-- Description: Complete database schema for MCP Link application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_zh_cn TEXT NOT NULL,
    name_zh_tw TEXT,
    name_fr TEXT,
    name_ja TEXT,
    name_ko TEXT,
    name_ru TEXT,
    description_en TEXT NOT NULL,
    description_zh_cn TEXT NOT NULL,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    icon TEXT NOT NULL DEFAULT 'Settings',
    color TEXT NOT NULL DEFAULT '#6B7280',
    server_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_zh_cn TEXT NOT NULL,
    name_zh_tw TEXT,
    name_fr TEXT,
    name_ja TEXT,
    name_ko TEXT,
    name_ru TEXT,
    description_en TEXT NOT NULL,
    description_zh_cn TEXT NOT NULL,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Servers table
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_zh_cn TEXT,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    full_description TEXT,
    icon TEXT,
    tags TEXT[] DEFAULT '{}',
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    tech_stack TEXT[] DEFAULT '{}',
    github_url TEXT NOT NULL,
    demo_url TEXT,
    docs_url TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    repo_created_at TIMESTAMPTZ DEFAULT NOW(),
    complexity TEXT DEFAULT 'medium' CHECK (complexity IN ('simple', 'medium', 'complex')),
    maturity TEXT DEFAULT 'stable' CHECK (maturity IN ('experimental', 'beta', 'stable', 'mature')),
    featured BOOLEAN DEFAULT FALSE,
    official BOOLEAN DEFAULT FALSE,
    categorization_confidence FLOAT DEFAULT 0.8,
    categorization_reason TEXT,
    categorization_keywords TEXT[] DEFAULT '{}',
    repository_owner TEXT,
    repository_name TEXT,
    readme_content TEXT,
    api_reference TEXT,
    platforms TEXT[] DEFAULT '{}',
    node_version TEXT,
    python_version TEXT,
    requirements TEXT[] DEFAULT '{}',
    quality_score FLOAT DEFAULT 0,
    quality_documentation FLOAT DEFAULT 0,
    quality_maintenance FLOAT DEFAULT 0,
    quality_community FLOAT DEFAULT 0,
    quality_performance FLOAT DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    dependents INTEGER DEFAULT 0,
    weekly_downloads INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Server READMEs table
CREATE TABLE IF NOT EXISTS server_readmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    project_name TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    extracted_content JSONB,
    extracted_installation JSONB,
    extracted_api_reference JSONB,
    extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
    extraction_error TEXT,
    extracted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(server_id)
);

-- 5. Featured servers table (view or materialized view)
CREATE VIEW featured_servers AS
SELECT * FROM servers WHERE featured = TRUE;

-- 6. Popular servers view (based on stars and forks)
CREATE VIEW popular_servers AS
SELECT * FROM servers 
WHERE stars >= 1000 OR forks >= 100
ORDER BY stars DESC;

-- 7. Recent servers view (recently updated)
CREATE VIEW recent_servers AS
SELECT * FROM servers 
WHERE last_updated >= NOW() - INTERVAL '30 days'
ORDER BY last_updated DESC;

-- 8. User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, server_id)
);

-- 9. Server comments table
CREATE TABLE IF NOT EXISTS server_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES server_comments(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Servers with details view (comprehensive server information)
CREATE VIEW servers_with_details AS
SELECT 
    s.*,
    -- Add computed fields for featured servers
    CASE 
        WHEN s.featured = TRUE THEN s.icon 
        ELSE NULL 
    END as featured_icon,
    CASE 
        WHEN s.featured = TRUE THEN COALESCE(s.quality_score, 3.5)::TEXT
        ELSE NULL 
    END as featured_rating,
    CASE 
        WHEN s.official = TRUE THEN 'Official'
        WHEN s.featured = TRUE THEN 'Featured'
        WHEN s.stars >= 1000 THEN 'Popular'
        ELSE NULL
    END as featured_badge,
    CASE 
        WHEN s.official = TRUE THEN 'blue'
        WHEN s.featured = TRUE THEN 'green'
        WHEN s.stars >= 1000 THEN 'yellow'
        ELSE 'gray'
    END as featured_badge_color,
    -- Add verified field
    s.official as verified
FROM servers s;

-- 11. Featured servers by category view
CREATE VIEW featured_servers_by_category AS
SELECT 
    s.*,
    s.icon as featured_icon,
    COALESCE(s.quality_score, 3.5)::TEXT as featured_rating,
    CASE 
        WHEN s.official = TRUE THEN 'Official'
        WHEN s.featured = TRUE THEN 'Featured'
        WHEN s.stars >= 1000 THEN 'Popular'
        ELSE 'Featured'
    END as featured_badge,
    CASE 
        WHEN s.official = TRUE THEN 'blue'
        WHEN s.featured = TRUE THEN 'green'
        WHEN s.stars >= 1000 THEN 'yellow'
        ELSE 'green'
    END as featured_badge_color
FROM servers s
WHERE s.featured = TRUE
ORDER BY s.category_id, s.quality_score DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_servers_slug ON servers(slug);
CREATE INDEX IF NOT EXISTS idx_servers_category ON servers(category_id);
CREATE INDEX IF NOT EXISTS idx_servers_subcategory ON servers(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_servers_stars ON servers(stars DESC);
CREATE INDEX IF NOT EXISTS idx_servers_last_updated ON servers(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_servers_featured ON servers(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_servers_tags ON servers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_servers_platforms ON servers USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_servers_tech_stack ON servers USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_servers_search ON servers USING GIN(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description_en, '') || ' ' || COALESCE(full_description, '')));

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_server ON user_favorites(server_id);

CREATE INDEX IF NOT EXISTS idx_comments_server ON server_comments(server_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON server_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON server_comments(parent_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER update_categories_timestamp
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subcategories_timestamp
    BEFORE UPDATE ON subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_servers_timestamp
    BEFORE UPDATE ON servers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_server_readmes_timestamp
    BEFORE UPDATE ON server_readmes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_favorites_timestamp
    BEFORE UPDATE ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_server_comments_timestamp
    BEFORE UPDATE ON server_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create function to update server count in categories
CREATE OR REPLACE FUNCTION update_category_server_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories SET server_count = server_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories SET server_count = server_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        UPDATE categories SET server_count = server_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET server_count = server_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply category server count trigger
CREATE TRIGGER update_category_count
    AFTER INSERT OR DELETE OR UPDATE OF category_id ON servers
    FOR EACH ROW
    EXECUTE FUNCTION update_category_server_count();

-- Create function to update comment reply count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE server_comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE server_comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply comment reply count trigger
CREATE TRIGGER update_reply_count
    AFTER INSERT OR DELETE ON server_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_reply_count();

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Create RLS policies for server_comments
CREATE POLICY "Anyone can view comments" ON server_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON server_comments
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own comments" ON server_comments
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own comments" ON server_comments
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Add comment
COMMENT ON TABLE categories IS 'MCP server categories with internationalization support';
COMMENT ON TABLE subcategories IS 'Subcategories for more specific server classification';
COMMENT ON TABLE servers IS 'Main table containing all MCP server information';
COMMENT ON TABLE server_readmes IS 'Structured README content extracted from repositories';
COMMENT ON TABLE user_favorites IS 'User favorite servers with Clerk authentication';
COMMENT ON TABLE server_comments IS 'User comments on servers with nested replies support';
COMMENT ON VIEW servers_with_details IS 'Comprehensive server information with computed fields';