-- Fix the user_favorite_servers view to avoid column name conflicts
-- This addresses the "column 'id' specified more than once" error

DROP VIEW IF EXISTS public.user_favorite_servers;

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

-- Grant permissions
GRANT SELECT ON public.user_favorite_servers TO authenticated;
GRANT SELECT ON public.user_favorite_servers TO anon;