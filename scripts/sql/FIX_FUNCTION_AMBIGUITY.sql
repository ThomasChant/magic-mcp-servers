-- Fix function parameter ambiguity that's breaking all views
-- The issue is in get_monorepo_mcp_count function where parameter name conflicts with column name

-- Fix the get_monorepo_mcp_count function by renaming the parameter
CREATE OR REPLACE FUNCTION get_monorepo_mcp_count(input_github_url TEXT)
RETURNS INTEGER AS $$
DECLARE
    repo_path TEXT;
    mcp_count INTEGER;
BEGIN
    -- 提取仓库路径 (owner/repo)
    repo_path := SPLIT_PART(SPLIT_PART(input_github_url, 'github.com/', 2), '/', 2);
    
    -- 计算该仓库下的MCP服务器数量 (now unambiguous)
    SELECT COUNT(*) INTO mcp_count
    FROM mcp_servers 
    WHERE mcp_servers.github_url LIKE '%github.com/' || SPLIT_PART(input_github_url, 'github.com/', 2) || '%'
    AND is_monorepo(mcp_servers.github_url);
    
    -- 如果计数为0，返回1避免除零错误
    RETURN GREATEST(mcp_count, 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix the is_monorepo function as well to be safe
CREATE OR REPLACE FUNCTION is_monorepo(input_github_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN input_github_url LIKE '%/tree/%' OR input_github_url LIKE '%/blob/%';
END;
$$ LANGUAGE plpgsql IMMUTABLE;