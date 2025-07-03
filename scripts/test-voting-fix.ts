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

async function testVotingFix() {
    console.log('🧪 Testing Voting Function Fix...\n');
    
    try {
        // Test 1: Test can_user_vote function
        console.log('1. Testing can_user_vote function...');
        const { data: canVoteResult, error: canVoteError } = await supabase
            .rpc('can_user_vote', { user_id_param: 'test-user-123' });
        
        if (canVoteError) {
            console.error('❌ can_user_vote failed:', canVoteError.message);
            return false;
        }
        
        console.log('✅ can_user_vote works:', canVoteResult);
        
        // Test 2: Test record_vote_action function
        console.log('\n2. Testing record_vote_action function...');
        const { error: recordError } = await supabase
            .rpc('record_vote_action', { user_id_param: 'test-user-123' });
        
        if (recordError) {
            console.error('❌ record_vote_action failed:', recordError.message);
            return false;
        }
        
        console.log('✅ record_vote_action works');
        
        // Test 3: Test server_scores view
        console.log('\n3. Testing server_scores view...');
        const { data: scoresData, error: scoresError } = await supabase
            .from('server_scores')
            .select('server_id, total_score, upvotes, downvotes')
            .limit(3);
        
        if (scoresError) {
            console.error('❌ server_scores view failed:', scoresError.message);
            return false;
        }
        
        console.log('✅ server_scores view works');
        console.log('   Sample scores:');
        scoresData?.forEach((score, index) => {
            console.log(`   ${index + 1}. ${score.server_id}: score=${score.total_score}, +${score.upvotes}/-${score.downvotes}`);
        });
        
        // Test 4: Test voting service query
        console.log('\n4. Testing voting service query...');
        const { data: userVoteData, error: userVoteError } = await supabase
            .rpc('get_user_vote', { 
                user_id_param: 'test-user-123', 
                server_id_param: 'test-server' 
            });
        
        if (userVoteError) {
            console.error('❌ get_user_vote failed:', userVoteError.message);
            return false;
        }
        
        console.log('✅ get_user_vote works:', userVoteData);
        
        console.log('\n🎉 ALL VOTING TESTS PASSED!');
        console.log('\n📋 Voting Fix Summary:');
        console.log('✅ can_user_vote function works (no more INSERT error)');
        console.log('✅ record_vote_action function works');
        console.log('✅ server_scores view accessible');
        console.log('✅ get_user_vote function works');
        console.log('\n🚀 Voting should now work in the application!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Voting test failed:', error);
        return false;
    }
}

async function main() {
    const success = await testVotingFix();
    
    if (!success) {
        console.log('\n❌ Voting fix verification failed');
        console.log('📖 Please apply EMERGENCY_VOTING_FIX.sql in Supabase SQL Editor');
        process.exit(1);
    }
}

// Run the test
main().catch(console.error);