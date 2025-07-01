-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_user_server UNIQUE (user_id, server_id),
    CONSTRAINT fk_server FOREIGN KEY (server_id) REFERENCES public.mcp_servers(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_server_id ON public.user_favorites(server_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view all favorites (for counting purposes)
CREATE POLICY "Anyone can view favorites" ON public.user_favorites
    FOR SELECT USING (true);

-- Create policy for anyone to manage favorites (since we use Clerk user ID)
-- In production, you might want to add additional validation
CREATE POLICY "Anyone can manage favorites" ON public.user_favorites
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for favorite servers with details
CREATE OR REPLACE VIEW public.user_favorite_servers AS
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
GRANT ALL ON public.user_favorites TO authenticated;
GRANT SELECT ON public.user_favorites TO anon;
GRANT SELECT ON public.user_favorite_servers TO authenticated;
GRANT SELECT ON public.user_favorite_servers TO anon;