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

async function testCompleteRebuild() {
    console.log('🧪 Testing Complete Database Rebuild...\n');
    
    let allTestsPassed = true;
    
    try {
        // Test 1: Check if all views exist
        console.log('1. Testing view existence...');
        const viewsToTest = [
            'servers_with_details',
            'server_scores', 
            'featured_servers',
            'popular_servers',
            'recent_servers',
            'popular_servers_by_score',
            'controversial_servers'
        ];
        
        for (const viewName of viewsToTest) {
            const { error } = await supabase
                .from(viewName)
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error(`   ❌ ${viewName}: ${error.message}`);
                allTestsPassed = false;
            } else {
                console.log(`   ✅ ${viewName}: exists`);
            }
        }
        
        // Test 2: Test the main servers_with_details view
        console.log('\n2. Testing servers_with_details view...');
        const { data: detailsData, error: detailsError } = await supabase
            .from('servers_with_details')
            .select('id, name, github_url, total_score, upvotes, downvotes, is_monorepo')
            .limit(3);
        
        if (detailsError) {
            console.error('   ❌ servers_with_details query failed:', detailsError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ servers_with_details query works');
            console.log('   Sample data:');
            detailsData?.forEach((server, index) => {
                const flag = server.is_monorepo ? ' 📁' : '';
                console.log(`      ${index + 1}. ${server.name}${flag}: score=${server.total_score}, votes=+${server.upvotes}/-${server.downvotes}`);
            });
        }
        
        // Test 3: Test the exact failing application query
        console.log('\n3. Testing application stats query...');
        const { data: statsData, error: statsError } = await supabase
            .from('servers_with_details')
            .select('stars, last_updated, featured, verified', { count: 'exact' })
            .limit(5);
        
        if (statsError) {
            console.error('   ❌ Application stats query failed:', statsError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ Application stats query works');
            console.log(`   Retrieved ${statsData?.length} records for stats calculation`);
        }
        
        // Test 4: Test paginated query
        console.log('\n4. Testing paginated query...');
        const { data: paginatedData, error: paginatedError } = await supabase
            .from('servers_with_details')
            .select('*')
            .order('total_score', { ascending: false })
            .range(0, 11);
        
        if (paginatedError) {
            console.error('   ❌ Paginated query failed:', paginatedError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ Paginated query works');
            console.log(`   Retrieved ${paginatedData?.length} servers`);
        }
        
        // Test 5: Test voting functions
        console.log('\n5. Testing voting functions...');
        const { data: userVoteData, error: userVoteError } = await supabase
            .rpc('get_user_vote', { 
                user_id_param: 'test-user', 
                server_id_param: 'test-server' 
            });
        
        if (userVoteError) {
            console.error('   ❌ get_user_vote function failed:', userVoteError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ get_user_vote function works');
        }
        
        // Test 6: Test anti-cheat function
        console.log('\n6. Testing anti-cheat function...');
        const { data: canVoteData, error: canVoteError } = await supabase
            .rpc('can_user_vote', { user_id_param: 'test-user' });
        
        if (canVoteError) {
            console.error('   ❌ can_user_vote function failed:', canVoteError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ can_user_vote function works');
            console.log(`   User can vote: ${canVoteData}`);
        }
        
        // Test 7: Test sorting by total_score
        console.log('\n7. Testing sorting by community score...');
        const { data: sortedData, error: sortError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, stars')
            .order('total_score', { ascending: false })
            .limit(5);
        
        if (sortError) {
            console.error('   ❌ Sorting by total_score failed:', sortError.message);
            allTestsPassed = false;
        } else {
            console.log('   ✅ Sorting by total_score works');
            console.log('   Top servers by community score:');
            sortedData?.forEach((server, index) => {
                console.log(`      ${index + 1}. ${server.name}: community=${server.total_score}, github=${server.stars}`);
            });
        }
        
        // Summary
        if (allTestsPassed) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('\n📋 Rebuild Success Summary:');
            console.log('✅ All views exist and are queryable');
            console.log('✅ No more column ambiguity errors');
            console.log('✅ Voting columns (total_score, upvotes, downvotes) work');
            console.log('✅ Application stats query works');
            console.log('✅ Paginated queries work');
            console.log('✅ Voting functions work');
            console.log('✅ Anti-cheat functions work');
            console.log('✅ Community score sorting works');
            console.log('\n🚀 The application should now work perfectly!');
            
            return true;
        } else {
            console.log('\n❌ SOME TESTS FAILED');
            console.log('Please check the errors above and apply the COMPLETE_REBUILD.sql script again.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return false;
    }
}

async function main() {
    const success = await testCompleteRebuild();
    
    if (!success) {
        console.log('\n❌ Complete rebuild verification failed');
        console.log('📖 Please apply COMPLETE_REBUILD.sql in Supabase SQL Editor');
        process.exit(1);
    }
}

// Run the test
main().catch(console.error);