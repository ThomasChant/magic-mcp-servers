-- 修复投票函数错误：INSERT is not allowed in a non-volatile function
-- 问题：can_user_vote 函数被标记为 STABLE 但包含 INSERT 操作

-- 删除旧函数
DROP FUNCTION IF EXISTS can_user_vote(TEXT) CASCADE;

-- 重新创建函数，标记为 VOLATILE（允许修改数据）
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

    -- 获取速率限制记录
    SELECT * INTO rate_record 
    FROM user_vote_rate_limit 
    WHERE user_id = user_id_param;
    
    -- 如果没有记录，允许投票（不在这里创建记录）
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- 检查是否需要重置时间窗口
    IF NOW() >= rate_record.reset_at THEN
        -- 重置记录（但不在这里更新）
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
$$ LANGUAGE plpgsql VOLATILE; -- 改为 VOLATILE

-- 或者创建一个更简单的版本，只检查不修改
CREATE OR REPLACE FUNCTION can_user_vote_simple(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    vote_count INTEGER;
    last_vote_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 简单检查：最近1小时投票次数
    SELECT COUNT(*) INTO vote_count
    FROM server_votes 
    WHERE user_id = user_id_param 
    AND created_at >= NOW() - INTERVAL '1 hour';
    
    -- 如果超过50次，拒绝
    IF vote_count >= 50 THEN
        RETURN FALSE;
    END IF;
    
    -- 检查最近投票时间（10秒冷却）
    SELECT MAX(created_at) INTO last_vote_time
    FROM server_votes 
    WHERE user_id = user_id_param;
    
    IF last_vote_time IS NOT NULL AND 
       NOW() - last_vote_time < INTERVAL '10 seconds' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE; -- 这个可以是 STABLE，因为只读取不修改