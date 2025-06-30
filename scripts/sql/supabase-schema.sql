-- 评论表结构
-- 在Supabase Dashboard中执行以下SQL来创建表结构

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    server_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS comments_server_id_idx ON comments (server_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments (user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments (created_at DESC);

-- 设置RLS (Row Level Security) 策略
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看评论
CREATE POLICY "Anyone can view comments" 
ON comments FOR SELECT 
USING (true);

-- 只允许登录用户添加评论
CREATE POLICY "Users can insert their own comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- 只允许用户更新自己的评论
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 只允许用户删除自己的评论
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
USING (auth.uid()::text = user_id);

-- 创建触发器来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();