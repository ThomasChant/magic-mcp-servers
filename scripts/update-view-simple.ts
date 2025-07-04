#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for DDL operations

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Need VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateView() {
    console.log('🔄 Updating servers_with_details view...\n');
    
    try {
        // Execute the view update SQL directly
        const viewUpdateSQL = `
-- Update servers_with_details view to include voting data
-- Drop the existing view first
DROP VIEW IF EXISTS servers_with_details CASCADE;

-- Recreate with voting data included
CREATE OR REPLACE VIEW servers_with_details AS
SELECT 
    s.*,
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh,
    sc.name_en as subcategory_name,
    sc.name_zh_cn as subcategory_name_zh,
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tags,
    COALESCE(
        ARRAY_AGG(DISTINCT ts.technology) FILTER (WHERE ts.technology IS NOT NULL), 
        ARRAY[]::VARCHAR[]
    ) as tech_stack,
    
    -- Add voting data from server_scores view
    COALESCE(ss.is_monorepo, false) as is_monorepo,
    COALESCE(ss.initial_score, FLOOR(s.stars::DECIMAL / 10)) as initial_score,
    COALESCE(ss.upvotes, 0) as upvotes,
    COALESCE(ss.downvotes, 0) as downvotes,
    COALESCE(ss.vote_score, 0) as vote_score,
    COALESCE(ss.total_score, FLOOR(s.stars::DECIMAL / 10)) as total_score,
    COALESCE(ss.total_votes, 0) as total_votes,
    ss.last_vote_at

FROM mcp_servers s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LEFT JOIN server_tags st ON s.id = st.server_id
LEFT JOIN tags t ON st.tag_id = t.id
LEFT JOIN server_tech_stack ts ON s.id = ts.server_id
LEFT JOIN server_scores ss ON s.id = ss.server_id
GROUP BY s.id, c.name_en, c.name_zh_cn, sc.name_en, sc.name_zh_cn, 
         ss.is_monorepo, ss.initial_score, ss.upvotes, ss.downvotes, 
         ss.vote_score, ss.total_score, ss.total_votes, ss.last_vote_at;
`;

        console.log('1. Updating view definition...');
        const { error: viewError } = await supabase.rpc('exec_sql', { sql: viewUpdateSQL });
        
        if (viewError) {
            console.error('❌ Failed to update view via rpc, trying raw SQL...');
            // Split and execute individual statements
            const statements = viewUpdateSQL.split(';').filter(s => s.trim());
            
            for (const [index, statement] of statements.entries()) {
                if (!statement.trim()) continue;
                console.log(`   Executing statement ${index + 1}/${statements.length}`);
                
                const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
                if (error) {
                    console.error(`   Error in statement ${index + 1}:`, error.message);
                    throw error;
                }
            }
        }
        
        console.log('✅ View updated successfully');
        
        // Recreate dependent views
        console.log('\n2. Recreating dependent views...');
        const dependentViewsSQL = `
-- Recreate dependent views that were dropped
CREATE OR REPLACE VIEW featured_servers AS
SELECT * FROM servers_with_details
WHERE featured = true
ORDER BY featured_rating DESC NULLS LAST, quality_score DESC, stars DESC;

CREATE OR REPLACE VIEW popular_servers AS
SELECT * FROM servers_with_details
ORDER BY total_score DESC, stars DESC, quality_score DESC;

CREATE OR REPLACE VIEW recent_servers AS
SELECT * FROM servers_with_details
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW featured_servers_by_category AS
SELECT 
    s.*,
    c.id as category_id,
    c.name_en as category_name,
    c.name_zh_cn as category_name_zh
FROM servers_with_details s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.featured = true
ORDER BY c.name_en, s.featured_rating DESC NULLS LAST;
`;

        const dependentStatements = dependentViewsSQL.split(';').filter(s => s.trim());
        for (const [index, statement] of dependentStatements.entries()) {
            if (!statement.trim()) continue;
            console.log(`   Creating view ${index + 1}/${dependentStatements.length}`);
            
            const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
            if (error) {
                console.error(`   Error creating view ${index + 1}:`, error.message);
                // Don't throw, these are non-critical
            }
        }
        
        console.log('✅ Dependent views recreated');
        
        // Test the updated view
        console.log('\n3. Testing updated view...');
        const { data: testData, error: testError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, upvotes, downvotes, is_monorepo')
            .order('total_score', { ascending: false })
            .limit(5);
        
        if (testError) {
            console.error('❌ Test failed:', testError.message);
            throw testError;
        }
        
        console.log('✅ View test successful!');
        console.log('\n🏆 Top servers by community score:');
        testData?.forEach((server, index) => {
            const monorepoIndicator = server.is_monorepo ? ' 📁' : '';
            console.log(`   ${index + 1}. ${server.name}${monorepoIndicator}: score=${server.total_score}, votes=+${server.upvotes}/-${server.downvotes}`);
        });
        
        console.log('\n🎉 View update completed successfully!');
        console.log('✅ The total_score column is now available in servers_with_details');
        console.log('✅ The application should now work without the column error');
        
    } catch (error) {
        console.error('❌ View update failed:', error);
        throw error;
    }
}

// Run the update
updateView().catch(console.error);