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

async function testRLSFix() {
    console.log('🧪 Testing RLS Fix for Voting...\n');
    
    try {
        // Test 1: Try to read from server_votes table
        console.log('1. Testing read access to server_votes...');
        const { data: readData, error: readError } = await supabase
            .from('server_votes')
            .select('*')
            .limit(1);
        
        if (readError) {
            console.error('❌ Read access failed:', readError.message);
            if (readError.message.includes('policy')) {
                console.log('   RLS policy is still blocking reads');
            }
            return false;
        }
        
        console.log('✅ Read access works');
        console.log(`   Found ${readData?.length || 0} existing votes`);
        
        // Test 2: Try to insert a test vote
        console.log('\n2. Testing write access to server_votes...');
        const testVote = {
            user_id: 'test-user-rls-' + Date.now(),
            server_id: 'test-server-rls',
            vote_type: 'up'
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('server_votes')
            .insert(testVote)
            .select();
        
        if (insertError) {
            console.error('❌ Insert access failed:', insertError.message);
            if (insertError.message.includes('policy') || insertError.message.includes('security')) {
                console.log('   RLS policy is still blocking inserts');
                console.log('   Please apply DISABLE_RLS_EMERGENCY.sql');
            }
            return false;
        }
        
        console.log('✅ Insert access works');
        console.log('   Test vote created:', insertData?.[0]?.id);
        
        // Test 3: Clean up test vote
        console.log('\n3. Testing delete access...');
        if (insertData?.[0]?.id) {
            const { error: deleteError } = await supabase
                .from('server_votes')
                .delete()
                .eq('id', insertData[0].id);
            
            if (deleteError) {
                console.error('❌ Delete access failed:', deleteError.message);
                return false;
            }
            
            console.log('✅ Delete access works (test vote cleaned up)');
        }
        
        // Test 4: Test voting functions
        console.log('\n4. Testing voting functions...');
        const { data: canVoteData, error: canVoteError } = await supabase
            .rpc('can_user_vote', { user_id_param: 'test-user-functions' });
        
        if (canVoteError) {
            console.error('❌ can_user_vote function failed:', canVoteError.message);
            return false;
        }
        
        console.log('✅ can_user_vote function works:', canVoteData);
        
        // Test 5: Test server_scores view
        console.log('\n5. Testing server_scores view...');
        const { data: scoresData, error: scoresError } = await supabase
            .from('server_scores')
            .select('server_id, total_score')
            .limit(3);
        
        if (scoresError) {
            console.error('❌ server_scores view failed:', scoresError.message);
            return false;
        }
        
        console.log('✅ server_scores view works');
        console.log(`   Retrieved ${scoresData?.length || 0} server scores`);
        
        console.log('\n🎉 ALL RLS TESTS PASSED!');
        console.log('\n📋 RLS Fix Summary:');
        console.log('✅ server_votes table is accessible (read/write/delete)');
        console.log('✅ Voting functions work');
        console.log('✅ server_scores view accessible');
        console.log('\n🚀 Voting should now work without RLS errors!');
        
        return true;
        
    } catch (error) {
        console.error('❌ RLS test failed:', error);
        return false;
    }
}

async function main() {
    const success = await testRLSFix();
    
    if (!success) {
        console.log('\n❌ RLS fix verification failed');
        console.log('📖 Please apply DISABLE_RLS_EMERGENCY.sql in Supabase SQL Editor');
        console.log('   This will disable Row Level Security for the server_votes table');
        process.exit(1);
    }
}

// Run the test
main().catch(console.error);