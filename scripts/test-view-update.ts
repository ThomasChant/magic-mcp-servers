#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testViewUpdate() {
    console.log('🔍 Testing servers_with_details view...\n');
    
    try {
        // Test 1: Check if view exists and has basic columns
        console.log('1. Testing basic view access...');
        const { data: testData, error: testError } = await supabase
            .from('servers_with_details')
            .select('id, name, stars')
            .limit(1);
        
        if (testError) {
            console.error('❌ Basic view access failed:', testError.message);
            return;
        }
        
        console.log('✅ Basic view access works');
        console.log('   Sample data:', testData?.[0]);
        
        // Test 2: Check if total_score column exists
        console.log('\n2. Testing total_score column...');
        const { data: scoreData, error: scoreError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, upvotes, downvotes')
            .limit(3);
        
        if (scoreError) {
            console.error('❌ total_score column access failed:', scoreError.message);
            if (scoreError.message.includes('column') && scoreError.message.includes('does not exist')) {
                console.log('\n🔧 This indicates the view needs to be updated with the migration:');
                console.log('   supabase/migrations/update_servers_with_details_view.sql');
            }
            return;
        }
        
        console.log('✅ total_score column access works');
        console.log('   Sample voting data:');
        scoreData?.forEach((server, index) => {
            console.log(`   ${index + 1}. ${server.name}: score=${server.total_score}, upvotes=${server.upvotes}, downvotes=${server.downvotes}`);
        });
        
        // Test 3: Check if server_scores view exists
        console.log('\n3. Testing server_scores view dependency...');
        const { data: scoresData, error: scoresError } = await supabase
            .from('server_scores')
            .select('server_id, total_score')
            .limit(1);
        
        if (scoresError) {
            console.error('❌ server_scores view access failed:', scoresError.message);
            console.log('   This indicates the voting system migration needs to be applied first:');
            console.log('   supabase/migrations/create_voting_system.sql');
            return;
        }
        
        console.log('✅ server_scores view exists and works');
        
        // Test 4: Test sorting by total_score
        console.log('\n4. Testing sorting by total_score...');
        const { data: sortedData, error: sortError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score')
            .order('total_score', { ascending: false })
            .limit(5);
        
        if (sortError) {
            console.error('❌ Sorting by total_score failed:', sortError.message);
            return;
        }
        
        console.log('✅ Sorting by total_score works');
        console.log('   Top servers by community score:');
        sortedData?.forEach((server, index) => {
            console.log(`   ${index + 1}. ${server.name}: ${server.total_score}`);
        });
        
        console.log('\n🎉 All tests passed! The view is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function main() {
    console.log('🧪 Testing servers_with_details View Update\n');
    await testViewUpdate();
}

// Run the main function
main().catch(console.error);