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

async function testRealVoting() {
    console.log('🧪 Testing Real Voting with Existing Server...\\n');
    
    try {
        // Step 1: Get a real server ID
        console.log('1. Getting a real server ID...');
        const { data: servers, error: serversError } = await supabase
            .from('servers')
            .select('id')
            .limit(1);
        
        if (serversError || !servers || servers.length === 0) {
            console.error('❌ Failed to get servers:', serversError?.message);
            return false;
        }
        
        const serverId = servers[0].id;
        console.log(`✅ Using server ID: ${serverId}`);
        
        // Step 2: Test voting insert
        console.log('\\n2. Testing vote insert...');
        const testUserId = 'test-user-' + Date.now();
        
        const { data: voteData, error: voteError } = await supabase
            .from('server_votes')
            .insert({
                user_id: testUserId,
                server_id: serverId,
                vote_type: 'up'
            })
            .select();
        
        if (voteError) {
            console.error('❌ Vote insert failed:', voteError.message);
            if (voteError.message.includes('policy') || voteError.message.includes('security')) {
                console.log('   🔒 RLS is still blocking - apply COMPLETE_RLS_DISABLE.sql');
            }
            return false;
        }
        
        console.log('✅ Vote insert successful:', voteData?.[0]?.id);
        
        // Step 3: Test reading the vote
        console.log('\\n3. Testing vote read...');
        const { data: readVote, error: readError } = await supabase
            .from('server_votes')
            .select('*')
            .eq('user_id', testUserId)
            .eq('server_id', serverId);
        
        if (readError) {
            console.error('❌ Vote read failed:', readError.message);
            return false;
        }
        
        console.log('✅ Vote read successful:', readVote?.length, 'votes found');
        
        // Step 4: Test vote update
        console.log('\\n4. Testing vote update...');
        const { error: updateError } = await supabase
            .from('server_votes')
            .update({ vote_type: 'down' })
            .eq('user_id', testUserId)
            .eq('server_id', serverId);
        
        if (updateError) {
            console.error('❌ Vote update failed:', updateError.message);
            return false;
        }
        
        console.log('✅ Vote update successful');
        
        // Step 5: Test server_scores view
        console.log('\\n5. Testing server_scores view...');
        const { data: scoresData, error: scoresError } = await supabase
            .from('server_scores')
            .select('*')
            .eq('server_id', serverId);
        
        if (scoresError) {
            console.error('❌ Server scores failed:', scoresError.message);
            return false;
        }
        
        console.log('✅ Server scores work:', scoresData?.[0]?.total_score);
        
        // Step 6: Clean up test vote
        console.log('\\n6. Cleaning up test vote...');
        const { error: deleteError } = await supabase
            .from('server_votes')
            .delete()
            .eq('user_id', testUserId)
            .eq('server_id', serverId);
        
        if (deleteError) {
            console.error('❌ Vote delete failed:', deleteError.message);
            return false;
        }
        
        console.log('✅ Test vote cleaned up');
        
        console.log('\\n🎉 ALL REAL VOTING TESTS PASSED!');
        console.log('\\n🚀 Voting should work in the application now!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

async function main() {
    const success = await testRealVoting();
    
    if (!success) {
        console.log('\\n❌ Real voting test failed');
        console.log('📖 Execute COMPLETE_RLS_DISABLE.sql in Supabase SQL Editor');
        process.exit(1);
    }
}

// Run the test
main().catch(console.error);