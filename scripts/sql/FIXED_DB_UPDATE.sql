-- FIXED: Update servers_with_details view to include voting data
-- This fixes the "column servers_with_details.total_score does not exist" error
-- Updated to avoid column name conflicts

-- Step 1: Drop all dependent views first (to avoid column conflicts)
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
    ) as tech_stack,
    
    -- Add voting data from server_scores view
    COALESCE(ss.is_monorepo, false) as is_monorepo,
    COALESCE(ss.initial_score, FLOOR(s.stars::DECIMAL / 10)) as initial_score,
    COALESCE(ss.upvotes, 0) as upvotes,
    COALESCE(ss.downvotes, 0) as downvotes,
    COALESCE(ss.vote_score, 0) as vote_score,
    COALESCE(ss.total_score, FLOOR(s.stars::DECIMAL / 10)) as total_score,
    COALESCE(ss.total_votes, 0) as total_votes,
    ss.last_vote_at

FROM mcp_servers s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LEFT JOIN server_tags st ON s.id = st.server_id
LEFT JOIN tags t ON st.tag_id = t.id
LEFT JOIN server_tech_stack ts ON s.id = ts.server_id
LEFT JOIN server_scores ss ON s.id = ss.server_id
GROUP BY s.id, c.name_en, c.name_zh_cn, sc.name_en, sc.name_zh_cn, 
         ss.is_monorepo, ss.initial_score, ss.upvotes, ss.downvotes, 
         ss.vote_score, ss.total_score, ss.total_votes, ss.last_vote_at;

-- Step 3: Recreate all dependent views with fresh definitions

-- Featured servers view
CREATE VIEW featured_servers AS
SELECT * FROM servers_with_details
WHERE featured = true
ORDER BY featured_rating DESC NULLS LAST, quality_score DESC, stars DESC;

-- Popular servers view (sorted by community score)
CREATE VIEW popular_servers AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, stars DESC, quality_score DESC;

-- Recent servers view
CREATE VIEW recent_servers AS
SELECT * FROM servers_with_details
ORDER BY created_at DESC;

-- Featured servers by category view
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

-- Popular servers by score (alias for popular_servers)
CREATE VIEW popular_servers_by_score AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, upvotes DESC, stars DESC;

-- Controversial servers view (from voting system)
CREATE VIEW controversial_servers AS
SELECT * FROM servers_with_details
WHERE total_votes >= 10
ORDER BY total_votes DESC, ABS(vote_score) ASC;

-- Add comments for documentation
COMMENT ON VIEW servers_with_details IS 'Complete server view with voting data, tags, and category information - Updated with voting system';
COMMENT ON VIEW popular_servers IS 'Popular servers sorted by total score and engagement metrics';
COMMENT ON VIEW popular_servers_by_score IS 'Popular servers sorted by community score (same as popular_servers)';
COMMENT ON VIEW controversial_servers IS 'Servers with high vote counts but mixed scores';