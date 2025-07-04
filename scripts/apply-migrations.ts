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

async function applyMigration(migrationFile: string, description: string) {
    console.log(`\n📄 Applying migration: ${description}`);
    console.log(`   File: ${migrationFile}`);
    
    try {
        const migrationSQL = readFileSync(migrationFile, 'utf8');
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (error) {
            // Try alternative method
            console.log('   Trying alternative execution method...');
            const lines = migrationSQL.split(';').filter(line => line.trim());
            
            for (const [index, sqlLine] of lines.entries()) {
                if (!sqlLine.trim()) continue;
                
                console.log(`   Executing statement ${index + 1}/${lines.length}`);
                const { error: lineError } = await supabase.rpc('exec_sql', { sql: sqlLine.trim() + ';' });
                
                if (lineError) {
                    console.error(`   ❌ Error in statement ${index + 1}:`, lineError.message);
                    throw lineError;
                }
            }
        }
        
        console.log('   ✅ Migration applied successfully');
    } catch (error) {
        console.error(`   ❌ Failed to apply migration:`, error);
        throw error;
    }
}

async function checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    // Check if server_votes table exists
    const { error: votesError } = await supabase
        .from('server_votes')
        .select('id', { count: 'exact', head: true });
    
    if (votesError) {
        console.log('❌ server_votes table not found');
        return false;
    }
    
    console.log('✅ server_votes table exists');
    
    // Check if server_scores view exists
    const { error: scoresError } = await supabase
        .from('server_scores')
        .select('server_id', { count: 'exact', head: true });
    
    if (scoresError) {
        console.log('❌ server_scores view not found');
        return false;
    }
    
    console.log('✅ server_scores view exists');
    
    return true;
}

async function main() {
    console.log('🚀 Applying Database Migrations\n');
    
    try {
        // Check if prerequisites exist
        const prerequisitesOk = await checkPrerequisites();
        
        if (!prerequisitesOk) {
            console.log('\n📥 Applying voting system migration first...');
            await applyMigration(
                'supabase/migrations/create_voting_system.sql',
                'Reddit-style voting system'
            );
            
            console.log('\n📥 Applying anti-cheat system...');
            await applyMigration(
                'supabase/migrations/add_anti_cheat.sql',
                'Anti-cheat rate limiting system'
            );
        }
        
        console.log('\n📥 Updating servers_with_details view...');
        await applyMigration(
            'supabase/migrations/update_servers_with_details_view.sql',
            'Updated view with voting data'
        );
        
        console.log('\n🎉 All migrations applied successfully!');
        console.log('\n🔧 Testing the updated view...');
        
        // Quick test
        const { data: testData, error: testError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, upvotes, downvotes')
            .limit(3);
        
        if (testError) {
            console.error('❌ Test failed:', testError.message);
        } else {
            console.log('✅ View test successful!');
            console.log('   Sample data with voting scores:');
            testData?.forEach((server, index) => {
                console.log(`   ${index + 1}. ${server.name}: score=${server.total_score}, upvotes=${server.upvotes}, downvotes=${server.downvotes}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the main function
main().catch(console.error);