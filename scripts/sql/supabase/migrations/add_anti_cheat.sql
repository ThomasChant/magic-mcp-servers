-- 防刷票措施
-- 添加速率限制和冷却时间

-- 用户投票速率限制表
CREATE TABLE IF NOT EXISTS user_vote_rate_limit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_vote_rate_limit_user ON user_vote_rate_limit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vote_rate_limit_reset ON user_vote_rate_limit(reset_at);

-- 触发器更新 updated_at
CREATE OR REPLACE FUNCTION update_user_vote_rate_limit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_vote_rate_limit_updated_at 
    BEFORE UPDATE ON user_vote_rate_limit
    FOR EACH ROW EXECUTE FUNCTION update_user_vote_rate_limit_updated_at();

-- 检查用户是否可以投票的函数
CREATE OR REPLACE FUNCTION can_user_vote(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rate_record user_vote_rate_limit%ROWTYPE;
    max_votes_per_hour INTEGER := 50; -- 每小时最多投票50次
    cooldown_seconds INTEGER := 10; -- 两次投票间隔至少10秒
    last_vote_time TIMESTAMP WITH TIME ZONE;
BEGIN
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

-- 记录投票的函数（更新速率限制）
CREATE OR REPLACE FUNCTION record_vote_action(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_vote_rate_limit (user_id, vote_count, window_start, reset_at)
    VALUES (user_id_param, 1, NOW(), NOW() + INTERVAL '1 hour')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        vote_count = user_vote_rate_limit.vote_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 可疑投票行为检测函数
CREATE OR REPLACE FUNCTION detect_suspicious_voting(user_id_param TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    vote_velocity NUMERIC;
    rapid_vote_count INTEGER;
    pattern_vote_count INTEGER;
    recent_votes INTEGER;
BEGIN
    -- 检查最近1小时的投票频率
    SELECT COUNT(*) INTO recent_votes
    FROM server_votes 
    WHERE user_id = user_id_param 
    AND created_at >= NOW() - INTERVAL '1 hour';
    
    -- 检查是否有快速连续投票
    SELECT COUNT(*) INTO rapid_vote_count
    FROM server_votes 
    WHERE user_id = user_id_param 
    AND created_at >= NOW() - INTERVAL '5 minutes';
    
    -- 检查是否有模式化投票（连续对同一类型服务器投票）
    SELECT COUNT(*) INTO pattern_vote_count
    FROM (
        SELECT DISTINCT s.category_id
        FROM server_votes sv
        JOIN mcp_servers s ON sv.server_id = s.id
        WHERE sv.user_id = user_id_param 
        AND sv.created_at >= NOW() - INTERVAL '10 minutes'
    ) t;
    
    -- 构建结果
    result := jsonb_build_object(
        'recent_votes', recent_votes,
        'rapid_votes', rapid_vote_count,
        'pattern_diversity', pattern_vote_count,
        'suspicious', (
            recent_votes > 30 OR 
            rapid_vote_count > 10 OR 
            pattern_vote_count = 1
        ),
        'risk_level', CASE
            WHEN recent_votes > 40 OR rapid_vote_count > 15 THEN 'high'
            WHEN recent_votes > 20 OR rapid_vote_count > 8 THEN 'medium'
            WHEN recent_votes > 10 OR rapid_vote_count > 5 THEN 'low'
            ELSE 'normal'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- 清理过期的速率限制记录
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_vote_rate_limit 
    WHERE reset_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 为防刷票功能添加注释
COMMENT ON TABLE user_vote_rate_limit IS '用户投票速率限制表，用于防止刷票';
COMMENT ON FUNCTION can_user_vote(TEXT) IS '检查用户是否可以投票（速率限制+冷却时间）';
COMMENT ON FUNCTION record_vote_action(TEXT) IS '记录用户投票行为，更新速率限制计数器';
COMMENT ON FUNCTION detect_suspicious_voting(TEXT) IS '检测可疑的投票行为模式';
COMMENT ON FUNCTION cleanup_expired_rate_limits() IS '清理过期的速率限制记录';