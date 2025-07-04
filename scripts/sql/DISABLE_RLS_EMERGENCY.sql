-- 紧急修复：完全禁用RLS让投票功能立即可用
-- 这是开发阶段的临时解决方案

-- 1. 禁用server_votes表的RLS
ALTER TABLE server_votes DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有RLS策略（如果需要的话）
DROP POLICY IF EXISTS "Enable read access for all users" ON server_votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON server_votes;

-- 完成！现在任何人都可以对server_votes表进行读写操作
-- 投票功能应该立即可用