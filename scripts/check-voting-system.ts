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

async function checkVotingSystem() {
    console.log('🔍 Checking voting system components...\n');
    
    try {
        // Check server_votes table
        console.log('1. Checking server_votes table...');
        const { error: votesError } = await supabase
            .from('server_votes')
            .select('id', { count: 'exact', head: true });
        
        if (votesError) {
            console.log('❌ server_votes table does not exist');
            console.log('   Error:', votesError.message);
            console.log('   Need to run: supabase/migrations/create_voting_system.sql');
        } else {
            console.log('✅ server_votes table exists');
        }
        
        // Check server_scores view
        console.log('\n2. Checking server_scores view...');
        const { error: scoresError } = await supabase
            .from('server_scores')
            .select('server_id', { count: 'exact', head: true });
        
        if (scoresError) {
            console.log('❌ server_scores view does not exist');
            console.log('   Error:', scoresError.message);
            console.log('   Need to run: supabase/migrations/create_voting_system.sql');
        } else {
            console.log('✅ server_scores view exists');
        }
        
        // Check if voting functions exist
        console.log('\n3. Checking voting functions...');
        const { error: functionError } = await supabase
            .rpc('can_user_vote', { user_id_param: 'test-user' });
        
        if (functionError && functionError.message.includes('does not exist')) {
            console.log('❌ Voting functions do not exist');
            console.log('   Error:', functionError.message);
            console.log('   Need to run: supabase/migrations/create_voting_system.sql');
        } else {
            console.log('✅ Voting functions exist');
        }
        
        // Check anti-cheat system
        console.log('\n4. Checking anti-cheat system...');
        const { error: rateLimitError } = await supabase
            .from('user_vote_rate_limit')
            .select('id', { count: 'exact', head: true });
        
        if (rateLimitError) {
            console.log('❌ Anti-cheat system not installed');
            console.log('   Error:', rateLimitError.message);
            console.log('   Need to run: supabase/migrations/add_anti_cheat.sql');
        } else {
            console.log('✅ Anti-cheat system exists');
        }
        
        console.log('\n📋 Summary:');
        
        if (!votesError && !scoresError && !rateLimitError) {
            console.log('✅ All voting system components are properly installed');
            console.log('✅ Ready to update servers_with_details view');
            
            // Show sample voting data
            console.log('\n🔍 Sample voting data:');
            const { data: sampleScores } = await supabase
                .from('server_scores')
                .select('server_id, name, total_score, upvotes, downvotes')
                .limit(3);
            
            sampleScores?.forEach((server, index) => {
                console.log(`   ${index + 1}. ${server.name}: score=${server.total_score}, votes=+${server.upvotes}/-${server.downvotes}`);
            });
        } else {
            console.log('❌ Some voting system components are missing');
            console.log('❌ Please apply the required migrations first');
        }
        
    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

// Run the check
checkVotingSystem().catch(console.error);