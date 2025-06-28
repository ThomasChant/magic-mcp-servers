-- Featured Servers Migration Script
-- This script migrates data from featured-servers.json to Supabase database
-- Updates mcp_servers table with featured server information

-- Begin transaction
BEGIN;

-- First, clear any existing featured server data to ensure clean migration
UPDATE mcp_servers SET 
    featured = false,
    featured_icon = NULL,
    featured_rating = NULL,
    featured_badge = NULL,
    featured_badge_color = NULL;

-- Web Network category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'Search',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('addozhangspring-rest-to-mcp', 'agentql', 'arjunkmrmsg-lta-mcp') 
  AND category_id = 'web-network';

-- Development category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'Code',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('0010aormcp-pr-pilot', '4workspacecursor-mcp-test', 'andybrandtmcp-simple-timeserver') 
  AND category_id = 'development';

-- Utilities category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('asirulnikmcp_server_filesystem_01', 'burtthecodermcp-virustotal', 'calculator') 
  AND category_id = 'utilities';

-- Finance & Payments category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('aaronjmarsweb3-research-mcp', 'abdulazeem-tk4vrshardeum-mcp-server', 'basebase-mcp') 
  AND category_id = 'finance-payments';

-- Content & Media category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('34892002bilibili-mcp-js', 'bgg-mcp', 'bigchxmcp_3d_relief') 
  AND category_id = 'content-media';

-- AI & ML category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'Brain',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('302ai302_web_search_mcp', 'bneilmcp-go-colly', 'borgiusjobspy-mcp-server') 
  AND category_id = 'ai-ml';

-- Database category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'Database',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('aiven', 'alekseykapustyanenkonihfixpostgresmcp', 'aliyunalibabacloud-adbpg-mcp-server') 
  AND category_id = 'database';

-- Business & Productivity category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('aircodelabsgrasp', 'akseyhbear-mcp-server', 'apple-notes') 
  AND category_id = 'business-productivity';

-- Cloud & Infrastructure category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug IN ('anandkumarpatelremote-mcp-server', 'arodoidfastlymcp', 'aws-cdk') 
  AND category_id = 'cloud-infrastructure';

-- Communication category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'MessageCircle',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug = 'email' AND category_id = 'communication';

UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'MessageCircle',
    featured_rating = 3.5,
    featured_badge = 'Featured',
    featured_badge_color = 'green'
WHERE slug = 'va99napier-mcp' AND category_id = 'communication';

UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'MessageCircle',
    featured_rating = 3.5,
    featured_badge = 'Popular',
    featured_badge_color = 'orange'
WHERE slug = 'beylessaihiworks-mcp' AND category_id = 'communication';

-- Specialized category servers
UPDATE mcp_servers SET 
    featured = true,
    featured_icon = 'FileText',
    featured_rating = 3.5,
    featured_badge = 'Popular',
    featured_badge_color = 'orange'
WHERE slug IN ('google-admin-mcp', 'mcp-server-hcp-terraform') 
  AND category_id = 'specialized';

-- Verify the migration by counting featured servers per category
SELECT 
    c.id as category_id,
    c.name_en as category_name,
    COUNT(s.id) as featured_count
FROM categories c
LEFT JOIN mcp_servers s ON c.id = s.category_id AND s.featured = true
GROUP BY c.id, c.name_en
ORDER BY featured_count DESC;

-- Commit the transaction
COMMIT;

-- Display final summary
SELECT 
    'Migration completed' as status,
    COUNT(*) as total_featured_servers
FROM mcp_servers 
WHERE featured = true;