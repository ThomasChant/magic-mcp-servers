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

async function testAmbiguity() {
    console.log('🔍 Testing column ambiguity in servers_with_details...\n');
    
    try {
        // Test 1: Try the exact query that's failing
        console.log('1. Testing basic select...');
        const { data: basicData, error: basicError } = await supabase
            .from('servers_with_details')
            .select('id, name')
            .limit(1);
        
        if (basicError) {
            console.error('❌ Basic select failed:', basicError.message);
            return;
        }
        
        console.log('✅ Basic select works');
        
        // Test 2: Try selecting github_url specifically
        console.log('\n2. Testing github_url column...');
        const { data: githubData, error: githubError } = await supabase
            .from('servers_with_details')
            .select('id, name, github_url')
            .limit(1);
        
        if (githubError) {
            console.error('❌ github_url select failed:', githubError.message);
            return;
        }
        
        console.log('✅ github_url select works');
        
        // Test 3: Try the paginated query that's failing
        console.log('\n3. Testing paginated query...');
        const { data: paginatedData, error: paginatedError } = await supabase
            .from('servers_with_details')
            .select('*')
            .order('stars', { ascending: false })
            .range(0, 11);
        
        if (paginatedError) {
            console.error('❌ Paginated query failed:', paginatedError.message);
            console.log('   This is likely the source of the error in the application');
            return;
        }
        
        console.log('✅ Paginated query works');
        console.log('   Returned', paginatedData?.length, 'servers');
        
        // Test 4: Check for duplicate columns
        console.log('\n4. Checking for duplicate columns...');
        if (paginatedData && paginatedData.length > 0) {
            const columns = Object.keys(paginatedData[0]);
            const duplicates = columns.filter((item, index) => columns.indexOf(item) !== index);
            
            if (duplicates.length > 0) {
                console.error('❌ Found duplicate columns:', duplicates);
            } else {
                console.log('✅ No duplicate columns found');
            }
            
            console.log('   Total columns:', columns.length);
            console.log('   Sample columns:', columns.slice(0, 10).join(', '), '...');
        }
        
        // Test 5: Test ordering by total_score
        console.log('\n5. Testing order by total_score...');
        const { data: scoredData, error: scoreError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score')
            .order('total_score', { ascending: false })
            .limit(3);
        
        if (scoreError) {
            console.error('❌ Order by total_score failed:', scoreError.message);
            return;
        }
        
        console.log('✅ Order by total_score works');
        scoredData?.forEach((server, index) => {
            console.log(`   ${index + 1}. ${server.name}: ${server.total_score}`);
        });
        
        console.log('\n🎉 All tests passed! The view seems to be working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testAmbiguity().catch(console.error);