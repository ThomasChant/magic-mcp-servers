-- 最简单的修复方案：暂时禁用RLS，依靠前端Clerk验证
-- 在Supabase Dashboard中执行以下SQL

-- 选项1：完全禁用RLS（最简单，适合开发测试）
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 如果你希望保持一些基本安全性，可以使用选项2：
-- 
-- 选项2：保持RLS但使用更宽松的策略
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- 
-- -- 删除所有现有策略
-- DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
-- DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
-- DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
-- DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
-- 
-- -- 创建新的宽松策略
-- CREATE POLICY "Allow all operations" ON comments FOR ALL USING (true) WITH CHECK (true);

-- 推荐：先使用选项1进行测试，确保功能正常后再考虑更严格的安全策略