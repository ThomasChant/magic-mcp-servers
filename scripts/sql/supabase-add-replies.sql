-- 添加评论回复功能的数据库迁移
-- 在Supabase Dashboard的SQL Editor中执行以下SQL

-- 1. 添加parent_id字段到comments表
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. 添加level字段来追踪评论层级（可选，用于限制嵌套深度）
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments (parent_id);

-- 4. 创建一个函数来自动计算评论层级
CREATE OR REPLACE FUNCTION calculate_comment_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.level = 0;
    ELSE
        SELECT level + 1 INTO NEW.level
        FROM comments
        WHERE id = NEW.parent_id;
        
        -- 限制最大嵌套层级为2（主评论 -> 回复 -> 二级回复）
        IF NEW.level > 2 THEN
            NEW.level = 2;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器在插入时自动计算层级
CREATE TRIGGER set_comment_level
    BEFORE INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_comment_level();

-- 6. 创建一个视图来获取评论及其回复数
CREATE OR REPLACE VIEW comments_with_reply_count AS
SELECT 
    c.*,
    COUNT(r.id) AS reply_count
FROM comments c
LEFT JOIN comments r ON r.parent_id = c.id
GROUP BY c.id;

-- 7. 更新现有评论的level字段（如果有历史数据）
UPDATE comments SET level = 0 WHERE parent_id IS NULL;

-- 注意：执行完这些SQL后，现有的评论不会受影响，新的回复功能将可以使用