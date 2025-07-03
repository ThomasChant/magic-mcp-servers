-- 紧急修复：移除防刷票检查，让投票功能立即可用
-- 这是一个临时解决方案，可以立即执行

-- 1. 删除有问题的函数
DROP FUNCTION IF EXISTS can_user_vote(TEXT) CASCADE;
DROP FUNCTION IF EXISTS record_vote_action(TEXT) CASCADE;

-- 2. 创建一个总是返回 TRUE 的简单版本
CREATE OR REPLACE FUNCTION can_user_vote(user_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 临时修复：总是允许投票
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. 创建一个空的 record_vote_action 函数
CREATE OR REPLACE FUNCTION record_vote_action(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    -- 临时修复：什么都不做
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 完成！投票功能应该立即可用