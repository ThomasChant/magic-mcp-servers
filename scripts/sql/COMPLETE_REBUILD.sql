-- 完整重建脚本：删除所有视图和函数，然后重新创建
-- 这将彻底解决所有列冲突和函数参数冲突问题

-- ===================================
-- 第一步：删除所有现有的视图和函数
-- ===================================

-- 删除所有依赖视图
DROP VIEW IF EXISTS popular_servers_by_score CASCADE;
DROP VIEW IF EXISTS featured_servers_by_category CASCADE;
DROP VIEW IF EXISTS recent_servers CASCADE;
DROP VIEW IF EXISTS popular_servers CASCADE;
DROP VIEW IF EXISTS featured_servers CASCADE;
DROP VIEW IF EXISTS controversial_servers CASCADE;
DROP VIEW IF EXISTS servers_with_votes CASCADE;
DROP VIEW IF EXISTS servers_with_details CASCADE;
DROP VIEW IF EXISTS server_scores CASCADE;

-- 删除所有投票相关函数
DROP FUNCTION IF EXISTS refresh_server_score(VARCHAR(50)) CASCADE;
DROP FUNCTION IF EXISTS get_user_vote(TEXT, VARCHAR(50)) CASCADE;
DROP FUNCTION IF EXISTS get_monorepo_mcp_count(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_monorepo(TEXT) CASCADE;
DROP FUNCTION IF EXISTS can_user_vote(TEXT) CASCADE;
DROP FUNCTION IF EXISTS record_vote_action(TEXT) CASCADE;
DROP FUNCTION IF EXISTS detect_suspicious_voting(TEXT) CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_rate_limits() CASCADE;

-- ===================================
-- 第二步：重新创建修复后的函数
-- ===================================

-- 修复后的monorepo检测函数（参数重命名避免冲突）
CREATE OR REPLACE FUNCTION is_monorepo(input_github_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN input_github_url LIKE '%/tree/%' OR input_github_url LIKE '%/blob/%';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 修复后的monorepo MCP计数函数（参数重命名避免冲突）
CREATE OR REPLACE FUNCTION get_monorepo_mcp_count(input_github_url TEXT)
RETURNS INTEGER AS $$
DECLARE
    repo_path TEXT;
    mcp_count INTEGER;
BEGIN
    -- 提取仓库路径 (owner/repo)
    repo_path := SPLIT_PART(SPLIT_PART(input_github_url, 'github.com/', 2), '/', 2);
    
    -- 计算该仓库下的MCP服务器数量（明确指定表名避免冲突）
    SELECT COUNT(*) INTO mcp_count
    FROM mcp_servers 
    WHERE mcp_servers.github_url LIKE '%github.com/' || SPLIT_PART(input_github_url, 'github.com/', 2) || '%'
    AND is_monorepo(mcp_servers.github_url);
    
    -- 如果计数为0，返回1避免除零错误
    RETURN GREATEST(mcp_count, 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- 重新创建投票相关函数
CREATE OR REPLACE FUNCTION get_user_vote(user_id_param TEXT, server_id_param VARCHAR(50))
RETURNS TEXT AS $$
DECLARE
    vote_result TEXT;
BEGIN
    SELECT vote_type INTO vote_result
    FROM server_votes
    WHERE user_id = user_id_param AND server_id = server_id_param;
    
    RETURN vote_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 创建投票统计更新函数
CREATE OR REPLACE FUNCTION refresh_server_score(server_id_param VARCHAR(50))
RETURNS TABLE(
    total_score INTEGER,
    upvotes BIGINT,
    downvotes BIGINT,
    vote_score BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.total_score::INTEGER,
        ss.upvotes,
        ss.downvotes,
        ss.vote_score
    FROM server_scores ss
    WHERE ss.server_id = server_id_param;
END;
$$ LANGUAGE plpgsql STABLE;

-- 防刷票函数（如果需要）
CREATE OR REPLACE FUNCTION can_user_vote(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rate_record RECORD;
    max_votes_per_hour INTEGER := 50;
    cooldown_seconds INTEGER := 10;
    last_vote_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 检查速率限制表是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_vote_rate_limit') THEN
        RETURN TRUE; -- 如果表不存在，允许投票
    END IF;

    -- 获取或创建速率限制记录
    SELECT * INTO rate_record 
    FROM user_vote_rate_limit 
    WHERE user_id = user_id_param;
    
    -- 如果没有记录，创建一个
    IF NOT FOUND THEN
        INSERT INTO user_vote_rate_limit (user_id, vote_count, window_start, reset_at)
        VALUES (user_id_param, 0, NOW(), NOW() + INTERVAL '1 hour');
        RETURN TRUE;
    END IF;
    
    -- 检查是否需要重置时间窗口
    IF NOW() >= rate_record.reset_at THEN
        UPDATE user_vote_rate_limit 
        SET vote_count = 0, 
            window_start = NOW(), 
            reset_at = NOW() + INTERVAL '1 hour'
        WHERE user_id = user_id_param;
        RETURN TRUE;
    END IF;
    
    -- 检查是否超过速率限制
    IF rate_record.vote_count >= max_votes_per_hour THEN
        RETURN FALSE;
    END IF;
    
    -- 检查冷却时间
    SELECT MAX(GREATEST(created_at, updated_at)) INTO last_vote_time
    FROM server_votes 
    WHERE user_id = user_id_param;
    
    IF last_vote_time IS NOT NULL AND 
       NOW() - last_vote_time < INTERVAL '1 second' * cooldown_seconds THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION record_vote_action(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    -- 检查表是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_vote_rate_limit') THEN
        RETURN; -- 如果表不存在，静默返回
    END IF;

    INSERT INTO user_vote_rate_limit (user_id, vote_count, window_start, reset_at)
    VALUES (user_id_param, 1, NOW(), NOW() + INTERVAL '1 hour')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        vote_count = user_vote_rate_limit.vote_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 第三步：重新创建修复后的视图
-- ===================================

-- 服务器分数计算视图（修复后，无列冲突）
CREATE VIEW server_scores AS
SELECT 
    s.id as server_id,
    s.name,
    s.github_url,
    s.stars,
    
    -- 检测是否为monorepo
    is_monorepo(s.github_url) as is_monorepo,
    
    -- 初始分数计算
    CASE 
        WHEN is_monorepo(s.github_url)
        THEN FLOOR(s.stars::DECIMAL / get_monorepo_mcp_count(s.github_url) / 10)
        ELSE FLOOR(s.stars::DECIMAL / 10)
    END as initial_score,
    
    -- 投票统计
    COALESCE(vote_stats.upvotes, 0) as upvotes,
    COALESCE(vote_stats.downvotes, 0) as downvotes,
    COALESCE(vote_stats.vote_score, 0) as vote_score,
    
    -- 总分计算
    CASE 
        WHEN is_monorepo(s.github_url)
        THEN FLOOR(s.stars::DECIMAL / get_monorepo_mcp_count(s.github_url) / 10)
        ELSE FLOOR(s.stars::DECIMAL / 10)
    END + COALESCE(vote_stats.vote_score, 0) as total_score,
    
    -- 投票总数
    COALESCE(vote_stats.total_votes, 0) as total_votes,
    
    -- 最后投票时间
    vote_stats.last_vote_at
    
FROM mcp_servers s
LEFT JOIN (
    SELECT 
        server_id,
        COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as upvotes,
        COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as downvotes,
        COUNT(CASE WHEN vote_type = 'up' THEN 1 END) - COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as vote_score,
        COUNT(*) as total_votes,
        MAX(created_at) as last_vote_at
    FROM server_votes 
    GROUP BY server_id
) vote_stats ON s.id = vote_stats.server_id;

-- 主要的servers_with_details视图（完全重建，无列冲突）
CREATE VIEW servers_with_details AS
SELECT 
    -- 明确列出mcp_servers的所有列
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
    s.github_url,
    s.demo_url,
    s.docs_url,
    s.repository_owner,
    s.repository_name,
    s.stars,
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
    
    -- 分类信息
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh,
    sc.name_en as subcategory_name,
    sc.name_zh_cn as subcategory_name_zh,
    
    -- 聚合数组
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tags,
    COALESCE(
        ARRAY_AGG(DISTINCT ts.technology) FILTER (WHERE ts.technology IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tech_stack,
    
    -- 投票数据（仅选择不冲突的列）
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
-- 使用清洁的子查询，只选择不冲突的列
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

-- ===================================
-- 第四步：重新创建所有依赖视图
-- ===================================

-- 特色服务器视图
CREATE VIEW featured_servers AS
SELECT * FROM servers_with_details
WHERE featured = true
ORDER BY featured_rating DESC NULLS LAST, quality_score DESC, stars DESC;

-- 热门服务器视图（按社区评分排序）
CREATE VIEW popular_servers AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, stars DESC, quality_score DESC;

-- 最近更新服务器视图
CREATE VIEW recent_servers AS
SELECT * FROM servers_with_details
ORDER BY created_at DESC;

-- 按分类的特色服务器视图
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

-- 按评分排序的热门服务器视图
CREATE VIEW popular_servers_by_score AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, upvotes DESC, stars DESC;

-- 争议服务器视图
CREATE VIEW controversial_servers AS
SELECT * FROM servers_with_details
WHERE total_votes >= 10
ORDER BY total_votes DESC, ABS(vote_score) ASC;

-- ===================================
-- 第五步：添加注释和文档
-- ===================================

COMMENT ON VIEW server_scores IS 'Reddit风格投票系统分数计算视图 - 已修复列冲突';
COMMENT ON VIEW servers_with_details IS '完整服务器视图（包含投票数据、标签和分类信息）- 已修复所有列冲突';
COMMENT ON VIEW popular_servers IS '热门服务器（按社区评分排序）';
COMMENT ON VIEW popular_servers_by_score IS '按社区评分排序的热门服务器（同popular_servers）';
COMMENT ON VIEW controversial_servers IS '争议服务器（投票多但分数不高）';
COMMENT ON VIEW featured_servers IS '特色服务器';
COMMENT ON VIEW recent_servers IS '最近更新的服务器';
COMMENT ON VIEW featured_servers_by_category IS '按分类的特色服务器';

-- 添加函数注释
COMMENT ON FUNCTION is_monorepo(TEXT) IS '检测GitHub URL是否为monorepo（修复参数冲突）';
COMMENT ON FUNCTION get_monorepo_mcp_count(TEXT) IS '获取monorepo中MCP服务器数量（修复参数冲突）';
COMMENT ON FUNCTION get_user_vote(TEXT, VARCHAR(50)) IS '获取用户对特定服务器的投票';
COMMENT ON FUNCTION refresh_server_score(VARCHAR(50)) IS '刷新服务器评分统计';
COMMENT ON FUNCTION can_user_vote(TEXT) IS '检查用户是否可以投票（防刷票）';
COMMENT ON FUNCTION record_vote_action(TEXT) IS '记录用户投票行为（防刷票）';