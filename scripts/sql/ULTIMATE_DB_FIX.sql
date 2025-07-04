-- ULTIMATE FIX: Completely eliminate column ambiguity
-- This fixes the persistent "column reference github_url is ambiguous" error
-- Solution: Explicitly list ALL columns from mcp_servers, no s.* wildcard

-- Step 1: Drop all dependent views first
DROP VIEW IF EXISTS popular_servers_by_score CASCADE;
DROP VIEW IF EXISTS featured_servers_by_category CASCADE;
DROP VIEW IF EXISTS recent_servers CASCADE;
DROP VIEW IF EXISTS popular_servers CASCADE;
DROP VIEW IF EXISTS featured_servers CASCADE;
DROP VIEW IF EXISTS controversial_servers CASCADE;

-- Step 2: Drop and recreate the main view
DROP VIEW IF EXISTS servers_with_details CASCADE;

CREATE VIEW servers_with_details AS
SELECT 
    -- Explicitly list ALL columns from mcp_servers (no s.* to avoid ambiguity)
    s.id,
    s.name,
    s.owner,
    s.slug,
    s.description_zh_cn,
    s.description_en,
    s.description_zh_tw,
    s.description_fr,
    s.description_ja,
    s.description_ko,
    s.description_ru,
    s.full_description,
    s.icon,
    s.category_id,
    s.subcategory_id,
    s.featured,
    s.verified,
    s.featured_icon,
    s.featured_rating,
    s.featured_badge,
    s.featured_badge_color,
    s.github_url,           -- Explicitly from mcp_servers table
    s.demo_url,
    s.docs_url,
    s.repository_owner,
    s.repository_name,
    s.stars,                -- Explicitly from mcp_servers table
    s.forks,
    s.watchers,
    s.open_issues,
    s.last_updated,
    s.repo_created_at,
    s.quality_score,
    s.quality_documentation,
    s.quality_maintenance,
    s.quality_community,
    s.quality_performance,
    s.complexity,
    s.maturity,
    s.downloads,
    s.dependents,
    s.weekly_downloads,
    s.platforms,
    s.node_version,
    s.python_version,
    s.requirements,
    s.readme_content,
    s.api_reference,
    s.categorization_confidence,
    s.categorization_reason,
    s.categorization_keywords,
    s.created_at,
    s.updated_at,
    
    -- Category and subcategory names
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh,
    sc.name_en as subcategory_name,
    sc.name_zh_cn as subcategory_name_zh,
    
    -- Aggregated arrays
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tags,
    COALESCE(
        ARRAY_AGG(DISTINCT ts.technology) FILTER (WHERE ts.technology IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tech_stack,
    
    -- Voting data (NO conflicting columns from server_scores)
    COALESCE(vote_data.is_monorepo, false) as is_monorepo,
    COALESCE(vote_data.initial_score, FLOOR(s.stars::DECIMAL / 10)) as initial_score,
    COALESCE(vote_data.upvotes, 0) as upvotes,
    COALESCE(vote_data.downvotes, 0) as downvotes,
    COALESCE(vote_data.vote_score, 0) as vote_score,
    COALESCE(vote_data.total_score, FLOOR(s.stars::DECIMAL / 10)) as total_score,
    COALESCE(vote_data.total_votes, 0) as total_votes,
    vote_data.last_vote_at

FROM mcp_servers s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LEFT JOIN server_tags st ON s.id = st.server_id
LEFT JOIN tags t ON st.tag_id = t.id
LEFT JOIN server_tech_stack ts ON s.id = ts.server_id
-- Use a clean subquery with alias to avoid ANY possibility of column conflicts
LEFT JOIN (
    SELECT 
        server_id,
        is_monorepo,
        initial_score,
        upvotes,
        downvotes,
        vote_score,
        total_score,
        total_votes,
        last_vote_at
    FROM server_scores
) vote_data ON s.id = vote_data.server_id

GROUP BY 
    s.id, s.name, s.owner, s.slug, s.description_zh_cn, s.description_en, 
    s.description_zh_tw, s.description_fr, s.description_ja, s.description_ko, 
    s.description_ru, s.full_description, s.icon, s.category_id, s.subcategory_id, 
    s.featured, s.verified, s.featured_icon, s.featured_rating, s.featured_badge, 
    s.featured_badge_color, s.github_url, s.demo_url, s.docs_url, s.repository_owner, 
    s.repository_name, s.stars, s.forks, s.watchers, s.open_issues, s.last_updated, 
    s.repo_created_at, s.quality_score, s.quality_documentation, s.quality_maintenance, 
    s.quality_community, s.quality_performance, s.complexity, s.maturity, s.downloads, 
    s.dependents, s.weekly_downloads, s.platforms, s.node_version, s.python_version, 
    s.requirements, s.readme_content, s.api_reference, s.categorization_confidence, 
    s.categorization_reason, s.categorization_keywords, s.created_at, s.updated_at,
    c.name_en, c.name_zh_cn, sc.name_en, sc.name_zh_cn, 
    vote_data.is_monorepo, vote_data.initial_score, vote_data.upvotes, vote_data.downvotes, 
    vote_data.vote_score, vote_data.total_score, vote_data.total_votes, vote_data.last_vote_at;

-- Step 3: Recreate all dependent views
CREATE VIEW featured_servers AS
SELECT * FROM servers_with_details
WHERE featured = true
ORDER BY featured_rating DESC NULLS LAST, quality_score DESC, stars DESC;

CREATE VIEW popular_servers AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, stars DESC, quality_score DESC;

CREATE VIEW recent_servers AS
SELECT * FROM servers_with_details
ORDER BY created_at DESC;

CREATE VIEW featured_servers_by_category AS
SELECT 
    s.*,
    c.id as category_id,
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh
FROM servers_with_details s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.featured = true
ORDER BY c.name_en, s.featured_rating DESC NULLS LAST;

CREATE VIEW popular_servers_by_score AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, upvotes DESC, stars DESC;

CREATE VIEW controversial_servers AS
SELECT * FROM servers_with_details
WHERE total_votes >= 10
ORDER BY total_votes DESC, ABS(vote_score) ASC;

-- Add documentation
COMMENT ON VIEW servers_with_details IS 'Complete server view - ULTIMATE FIX: All columns explicitly listed to eliminate ambiguity';
COMMENT ON VIEW popular_servers IS 'Popular servers sorted by community score';
COMMENT ON VIEW popular_servers_by_score IS 'Alias for popular servers by score';
COMMENT ON VIEW controversial_servers IS 'Servers with high engagement but mixed scores';