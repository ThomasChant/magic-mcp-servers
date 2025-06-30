-- 快速修复：解决 "column 'id' specified more than once" 错误
-- 在Supabase SQL编辑器中直接运行此脚本

-- 删除有问题的视图
DROP VIEW IF EXISTS public.user_favorite_servers;

-- 重新创建视图，避免列名冲突
CREATE VIEW public.user_favorite_servers AS
SELECT 
    uf.id as favorite_id,
    uf.user_id,
    uf.server_id,
    uf.created_at as favorited_at,
    uf.updated_at as favorite_updated_at,
    s.*
FROM public.user_favorites uf
JOIN public.servers_with_details s ON s.id = uf.server_id;

-- 重新授予权限
GRANT SELECT ON public.user_favorite_servers TO authenticated;
GRANT SELECT ON public.user_favorite_servers TO anon;

-- 验证视图创建成功
SELECT 'user_favorite_servers 视图创建成功!' as status;