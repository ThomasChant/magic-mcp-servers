-- Fix server_readmes table permissions for migration
-- Run this in Supabase SQL Editor

-- Add INSERT and UPDATE policies for service role
CREATE POLICY "Enable insert for service role" ON server_readmes 
    FOR INSERT 
    TO service_role 
    USING (true);

CREATE POLICY "Enable update for service role" ON server_readmes 
    FOR UPDATE 
    TO service_role 
    USING (true);

CREATE POLICY "Enable delete for service role" ON server_readmes 
    FOR DELETE 
    TO service_role 
    USING (true);

-- Alternatively, you can temporarily disable RLS for migration:
-- ALTER TABLE server_readmes DISABLE ROW LEVEL SECURITY;
-- (Re-enable after migration: ALTER TABLE server_readmes ENABLE ROW LEVEL SECURITY;)