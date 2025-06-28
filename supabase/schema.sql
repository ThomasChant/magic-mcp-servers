-- Supabase Schema for MCP Server Registry
-- This file defines the database schema for the MCP Hub application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name_zh_cn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_zh_tw TEXT,
    name_fr TEXT,
    name_ja TEXT,
    name_ko TEXT,
    name_ru TEXT,
    description_zh_cn TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    server_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    name_zh_cn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_zh_tw TEXT,
    name_fr TEXT,
    name_ja TEXT,
    name_ko TEXT,
    name_ru TEXT,
    description_zh_cn TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCP Servers main table
CREATE TABLE mcp_servers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_zh_cn TEXT,
    description_en TEXT,
    description_zh_tw TEXT,
    description_fr TEXT,
    description_ja TEXT,
    description_ko TEXT,
    description_ru TEXT,
    full_description TEXT,
    icon VARCHAR(500),
    category_id VARCHAR(50) REFERENCES categories(id),
    subcategory_id VARCHAR(50) REFERENCES subcategories(id),
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    -- Featured server specific fields
    featured_icon VARCHAR(100), -- Lucide icon name for featured display
    featured_rating DECIMAL(2,1), -- Rating for featured servers (1.0-5.0)
    featured_badge VARCHAR(20), -- Badge type: 'Official', 'Featured', 'Popular'
    featured_badge_color VARCHAR(20), -- Badge color: 'green', 'blue', 'orange', etc.
    
    -- Repository & Links
    github_url TEXT,
    demo_url TEXT,
    docs_url TEXT,
    repository_owner VARCHAR(255),
    repository_name VARCHAR(255),
    
    -- Statistics
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE,
    repo_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Quality & Metadata
    quality_score INTEGER DEFAULT 0,
    quality_documentation INTEGER DEFAULT 0,
    quality_maintenance INTEGER DEFAULT 0,
    quality_community INTEGER DEFAULT 0,
    quality_performance INTEGER DEFAULT 0,
    
    complexity VARCHAR(20) DEFAULT 'medium',
    maturity VARCHAR(20) DEFAULT 'stable',
    
    -- Usage Statistics
    downloads INTEGER DEFAULT 0,
    dependents INTEGER DEFAULT 0,
    weekly_downloads INTEGER DEFAULT 0,
    
    -- Compatibility
    platforms TEXT[], -- Array of platforms
    node_version VARCHAR(50),
    python_version VARCHAR(50),
    requirements TEXT[],
    
    -- Documentation
    readme_content TEXT,
    api_reference TEXT,
    
    -- Categorization
    categorization_confidence DECIMAL(3,2),
    categorization_reason TEXT,
    categorization_keywords TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table (normalized)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server tags (many-to-many)
CREATE TABLE server_tags (
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (server_id, tag_id)
);

-- Server badges
CREATE TABLE server_badges (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    type VARCHAR(50),
    label VARCHAR(100),
    color VARCHAR(20),
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tech stack
CREATE TABLE server_tech_stack (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, technology)
);

-- Service types
CREATE TABLE server_service_types (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    type VARCHAR(100),
    label VARCHAR(100),
    icon VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Installation instructions
CREATE TABLE server_installation (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    method VARCHAR(20), -- 'npm', 'pip', 'docker', 'manual', 'uv'
    command TEXT,
    instructions JSONB, -- Array of instruction objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, method)
);

-- Deployment options
CREATE TABLE server_deployment (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    deployment_type VARCHAR(50), -- 'cloud', 'local', 'container', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, deployment_type)
);

-- Server README content
CREATE TABLE server_readmes (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(50) REFERENCES mcp_servers(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    raw_content TEXT NOT NULL,
    content_hash VARCHAR(64), -- SHA-256 hash for content deduplication
    file_size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id)
);

-- Create indexes for better performance
CREATE INDEX idx_mcp_servers_category ON mcp_servers(category_id);
CREATE INDEX idx_mcp_servers_subcategory ON mcp_servers(subcategory_id);
CREATE INDEX idx_mcp_servers_featured ON mcp_servers(featured);
CREATE INDEX idx_mcp_servers_verified ON mcp_servers(verified);
CREATE INDEX idx_mcp_servers_quality_score ON mcp_servers(quality_score);
CREATE INDEX idx_mcp_servers_stars ON mcp_servers(stars);
CREATE INDEX idx_mcp_servers_last_updated ON mcp_servers(last_updated);
CREATE INDEX idx_server_tags_server_id ON server_tags(server_id);
CREATE INDEX idx_server_tags_tag_id ON server_tags(tag_id);
CREATE INDEX idx_server_readmes_server_id ON server_readmes(server_id);
CREATE INDEX idx_server_readmes_content_hash ON server_readmes(content_hash);

-- Text search indexes
CREATE INDEX idx_mcp_servers_name_search ON mcp_servers USING gin(to_tsvector('english', name));
CREATE INDEX idx_mcp_servers_description_search ON mcp_servers USING gin(to_tsvector('english', description_en));
CREATE INDEX idx_mcp_servers_full_description_search ON mcp_servers USING gin(to_tsvector('english', full_description));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON mcp_servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_server_readmes_updated_at BEFORE UPDATE ON server_readmes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_installation ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_deployment ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_readmes ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mcp_servers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tags FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_tags FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_badges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_tech_stack FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_service_types FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_installation FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_deployment FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON server_readmes FOR SELECT USING (true);

-- Views for easier querying
CREATE OR REPLACE VIEW servers_with_details AS
SELECT 
    s.*,
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh,
    sc.name_en as subcategory_name,
    sc.name_zh_cn as subcategory_name_zh,
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tags,
    COALESCE(
        ARRAY_AGG(DISTINCT ts.technology) FILTER (WHERE ts.technology IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tech_stack
FROM mcp_servers s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LEFT JOIN server_tags st ON s.id = st.server_id
LEFT JOIN tags t ON st.tag_id = t.id
LEFT JOIN server_tech_stack ts ON s.id = ts.server_id
GROUP BY s.id, c.name_en, c.name_zh_cn, sc.name_en, sc.name_zh_cn;

-- Featured servers view
CREATE OR REPLACE VIEW featured_servers AS
SELECT * FROM servers_with_details
WHERE featured = true
ORDER BY featured_rating DESC NULLS LAST, quality_score DESC, stars DESC;

-- Popular servers view
CREATE OR REPLACE VIEW popular_servers AS
SELECT * FROM servers_with_details
ORDER BY stars DESC, quality_score DESC;

-- Recent servers view
CREATE OR REPLACE VIEW recent_servers AS
SELECT * FROM servers_with_details
ORDER BY created_at DESC;

-- Featured servers by category view
CREATE OR REPLACE VIEW featured_servers_by_category AS
SELECT 
    s.*,
    c.id as category_id,
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh
FROM servers_with_details s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.featured = true 
  AND s.featured_icon IS NOT NULL 
  AND s.featured_rating IS NOT NULL
  AND s.featured_badge IS NOT NULL
ORDER BY s.category_id, s.featured_rating DESC NULLS LAST, s.quality_score DESC;