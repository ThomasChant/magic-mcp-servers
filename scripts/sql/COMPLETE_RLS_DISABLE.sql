-- 完全禁用server_votes表的RLS
-- 这将立即修复投票功能

-- 1. 完全禁用RLS
ALTER TABLE server_votes DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有可能存在的RLS策略
DROP POLICY IF EXISTS "Enable read access for all users" ON server_votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON server_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON server_votes;
DROP POLICY IF EXISTS "Allow all authenticated users to read votes" ON server_votes;
DROP POLICY IF EXISTS "Allow all authenticated users to insert votes" ON server_votes;
DROP POLICY IF EXISTS "Allow all authenticated users to update votes" ON server_votes;
DROP POLICY IF EXISTS "Allow all authenticated users to delete votes" ON server_votes;

-- 3. 确认RLS已禁用
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED ❌' 
        ELSE 'RLS DISABLED ✅' 
    END as status
FROM pg_tables 
WHERE tablename = 'server_votes';

-- 4. 列出所有现有策略（应该为空）
SELECT policyname, tablename 
FROM pg_policies 
WHERE tablename = 'server_votes';