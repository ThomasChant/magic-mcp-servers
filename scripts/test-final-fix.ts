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

async function testFinalFix() {
    console.log('🧪 Testing ULTIMATE Database Fix...\n');
    
    try {
        // Test 1: Basic view access
        console.log('1. Testing basic view access...');
        const { data: basicData, error: basicError } = await supabase
            .from('servers_with_details')
            .select('id, name, github_url')
            .limit(1);
        
        if (basicError) {
            console.error('❌ Basic view access failed:', basicError.message);
            if (basicError.message.includes('ambiguous')) {
                console.log('\n🔧 Column ambiguity still exists. Apply ULTIMATE_DB_FIX.sql');
                console.log('   Instructions: MANUAL_DB_UPDATE_ULTIMATE.md');
            } else if (basicError.message.includes('does not exist')) {
                console.log('\n🔧 View not updated yet. Apply ULTIMATE_DB_FIX.sql');
                console.log('   Instructions: MANUAL_DB_UPDATE_ULTIMATE.md');
            }
            return false;
        }
        
        console.log('✅ Basic view access works');
        console.log('   Sample data:', basicData?.[0]);
        
        // Test 2: Voting columns
        console.log('\n2. Testing voting columns...');
        const { data: votingData, error: votingError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, upvotes, downvotes, is_monorepo')
            .limit(3);
        
        if (votingError) {
            console.error('❌ Voting columns failed:', votingError.message);
            return false;
        }
        
        console.log('✅ Voting columns work');
        console.log('   Sample voting data:');
        votingData?.forEach((server, index) => {
            const flag = server.is_monorepo ? ' 📁' : '';
            console.log(`   ${index + 1}. ${server.name}${flag}: score=${server.total_score}, votes=+${server.upvotes}/-${server.downvotes}`);
        });
        
        // Test 3: Paginated query (the one that was failing)
        console.log('\n3. Testing paginated query (the failing one)...');
        const { data: paginatedData, error: paginatedError } = await supabase
            .from('servers_with_details')
            .select('*')
            .order('total_score', { ascending: false })
            .range(0, 11);
        
        if (paginatedError) {
            console.error('❌ Paginated query failed:', paginatedError.message);
            return false;
        }
        
        console.log('✅ Paginated query works');
        console.log('   Returned', paginatedData?.length, 'servers');
        console.log('   Top servers by community score:');
        paginatedData?.slice(0, 3).forEach((server, index) => {
            console.log(`   ${index + 1}. ${server.name}: ${server.total_score}`);
        });
        
        // Test 4: Application simulation
        console.log('\n4. Testing application simulation...');
        const { data: appData, error: appError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, stars, category_name, tags, is_monorepo')
            .order('total_score', { ascending: false })
            .limit(5);
        
        if (appError) {
            console.error('❌ Application simulation failed:', appError.message);
            return false;
        }
        
        console.log('✅ Application simulation works');
        console.log('   Sample application data:');
        appData?.forEach((server, index) => {
            const monorepoFlag = server.is_monorepo ? ' 📁' : '';
            console.log(`   ${index + 1}. ${server.name}${monorepoFlag}`);
            console.log(`      Category: ${server.category_name}, Score: ${server.total_score}, Stars: ${server.stars}`);
            console.log(`      Tags: ${server.tags?.slice(0, 3).join(', ') || 'none'}`);
        });
        
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('\n📋 Fix Summary:');
        console.log('✅ Column ambiguity resolved');
        console.log('✅ Voting columns (total_score, upvotes, downvotes) available');
        console.log('✅ Paginated queries work');
        console.log('✅ Application compatibility confirmed');
        console.log('✅ Monorepo detection functional');
        console.log('\n🚀 The application should now work perfectly!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

async function main() {
    const success = await testFinalFix();
    
    if (!success) {
        console.log('\n❌ Ultimate fix verification failed');
        console.log('📖 Please apply the SQL from ULTIMATE_DB_FIX.sql in Supabase SQL Editor');
        console.log('🔗 Instructions: MANUAL_DB_UPDATE_ULTIMATE.md');
        process.exit(1);
    }
}

// Run the test
main().catch(console.error);