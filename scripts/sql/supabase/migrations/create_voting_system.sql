-- Reddit风格投票系统数据库结构
-- 创建投票表和相关视图

-- 用户投票表
CREATE TABLE IF NOT EXISTS server_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,           -- Clerk用户ID
    server_id VARCHAR(50) NOT NULL,  -- 服务器ID
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个用户每个服务器只能投票一次
    UNIQUE(user_id, server_id),
    
    -- 外键约束
    FOREIGN KEY (server_id) REFERENCES mcp_servers(id) ON DELETE CASCADE
);

-- 创建触发器更新 updated_at
CREATE OR REPLACE FUNCTION update_server_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_server_votes_updated_at 
    BEFORE UPDATE ON server_votes
    FOR EACH ROW EXECUTE FUNCTION update_server_votes_updated_at();

-- 投票索引优化
CREATE INDEX IF NOT EXISTS idx_server_votes_user_server ON server_votes(user_id, server_id);
CREATE INDEX IF NOT EXISTS idx_server_votes_server ON server_votes(server_id);
CREATE INDEX IF NOT EXISTS idx_server_votes_type ON server_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_server_votes_created ON server_votes(created_at);

-- RLS 策略
ALTER TABLE server_votes ENABLE ROW LEVEL SECURITY;

-- 公共读取权限 - 所有人可以看到投票统计
CREATE POLICY "Enable read access for all users" ON server_votes FOR SELECT USING (true);

-- 用户只能插入自己的投票
CREATE POLICY "Users can insert their own votes" ON server_votes FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- 用户只能更新自己的投票
CREATE POLICY "Users can update their own votes" ON server_votes FOR UPDATE 
    USING (auth.uid()::text = user_id);

-- 用户只能删除自己的投票
CREATE POLICY "Users can delete their own votes" ON server_votes FOR DELETE 
    USING (auth.uid()::text = user_id);

-- 辅助函数：检测仓库是否为monorepo
CREATE OR REPLACE FUNCTION is_monorepo(github_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN github_url LIKE '%/tree/%' OR github_url LIKE '%/blob/%';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 辅助函数：获取monorepo中的MCP服务器数量
CREATE OR REPLACE FUNCTION get_monorepo_mcp_count(github_url TEXT)
RETURNS INTEGER AS $$
DECLARE
    repo_path TEXT;
    mcp_count INTEGER;
BEGIN
    -- 提取仓库路径 (owner/repo)
    repo_path := SPLIT_PART(SPLIT_PART(github_url, 'github.com/', 2), '/', 2);
    
    -- 计算该仓库下的MCP服务器数量
    SELECT COUNT(*) INTO mcp_count
    FROM mcp_servers 
    WHERE github_url LIKE '%github.com/' || SPLIT_PART(github_url, 'github.com/', 2) || '%'
    AND is_monorepo(github_url);
    
    -- 如果计数为0，返回1避免除零错误
    RETURN GREATEST(mcp_count, 1);
END;
$$ LANGUAGE plpgsql STABLE;
drop view if exists server_scores;
-- 服务器分数计算视图
CREATE OR REPLACE VIEW server_scores AS
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

-- 服务器详细分数视图（包含所有信息）
CREATE OR REPLACE VIEW servers_with_votes AS
SELECT 
    s.*,
    -- 分数信息
    ss.initial_score,
    ss.upvotes,
    ss.downvotes,
    ss.vote_score,
    ss.total_score,
    ss.total_votes,
    ss.last_vote_at,
    ss.is_monorepo,
    
    -- 原有的标签和技术栈信息
    COALESCE(tags_agg.tags, ARRAY[]::VARCHAR[]) as tags,
    COALESCE(tech_agg.tech_stack, ARRAY[]::VARCHAR[]) as tech_stack
    
FROM mcp_servers s
LEFT JOIN server_scores ss ON s.id = ss.server_id
LEFT JOIN (
    SELECT 
        st.server_id,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
    FROM server_tags st
    LEFT JOIN tags t ON st.tag_id = t.id
    GROUP BY st.server_id
) tags_agg ON s.id = tags_agg.server_id
LEFT JOIN (
    SELECT 
        server_id,
        ARRAY_AGG(DISTINCT technology) FILTER (WHERE technology IS NOT NULL) as tech_stack
    FROM server_tech_stack
    GROUP BY server_id
) tech_agg ON s.id = tech_agg.server_id;

-- 热门服务器视图（按总分排序）
CREATE OR REPLACE VIEW popular_servers_by_score AS
SELECT * FROM servers_with_votes
ORDER BY total_score DESC, upvotes DESC, stars DESC;

-- 争议服务器视图（投票数多但分数低）
CREATE OR REPLACE VIEW controversial_servers AS
SELECT * FROM servers_with_votes
WHERE total_votes >= 10
ORDER BY total_votes DESC, ABS(vote_score) ASC;

-- 为新视图添加注释
COMMENT ON VIEW server_scores IS 'Reddit风格投票系统分数计算视图';
COMMENT ON VIEW servers_with_votes IS '包含投票信息的完整服务器视图';
COMMENT ON VIEW popular_servers_by_score IS '按社区评分排序的热门服务器';
COMMENT ON VIEW controversial_servers IS '争议较大的服务器（投票多但分数不高）';

-- 创建用于获取用户投票状态的函数
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

-- 创建投票统计更新函数（用于实时更新）
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