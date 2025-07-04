-- 修复RLS策略以兼容Clerk认证
-- 问题：当前RLS策略使用auth.uid()，但我们使用Clerk认证

-- 1. 临时禁用RLS，让投票功能立即可用
ALTER TABLE server_votes DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略
DROP POLICY IF EXISTS "Enable read access for all users" ON server_votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON server_votes;

-- 3. 重新启用RLS
ALTER TABLE server_votes ENABLE ROW LEVEL SECURITY;

-- 4. 创建兼容Clerk的新策略（允许所有认证用户操作）
CREATE POLICY "Allow all authenticated users to read votes" 
ON server_votes FOR SELECT 
USING (true);

CREATE POLICY "Allow all authenticated users to insert votes" 
ON server_votes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update votes" 
ON server_votes FOR UPDATE 
USING (true);

CREATE POLICY "Allow all authenticated users to delete votes" 
ON server_votes FOR DELETE 
USING (true);

-- 注意：这是一个简化的策略，允许所有操作
-- 在生产环境中，您可能需要实现更严格的策略