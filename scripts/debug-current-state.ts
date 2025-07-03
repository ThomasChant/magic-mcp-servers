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

async function debugCurrentState() {
    console.log('🔍 Debugging Current Database State...\n');
    
    try {
        // Test 1: Check if the view exists
        console.log('1. Testing if servers_with_details view exists...');
        const { data: existsData, error: existsError } = await supabase
            .from('servers_with_details')
            .select('count', { count: 'exact', head: true });
        
        if (existsError) {
            console.error('❌ View does not exist or is broken:', existsError.message);
            return;
        }
        
        console.log('✅ View exists with', existsData, 'records');
        
        // Test 2: Try the exact failing query from application
        console.log('\n2. Testing the exact failing query from application...');
        const { data: statsData, error: statsError } = await supabase
            .from('servers_with_details')
            .select('stars, last_updated, featured, verified', { count: 'exact' })
            .limit(5);
        
        if (statsError) {
            console.error('❌ Application query failed:', statsError.message);
            console.log('   This is the exact error the application is seeing!');
            
            // Let's try a simpler query to isolate the issue
            console.log('\n3. Testing individual columns...');
            
            // Test stars column
            const { error: starsError } = await supabase
                .from('servers_with_details')
                .select('stars')
                .limit(1);
            
            if (starsError) {
                console.error('   ❌ stars column fails:', starsError.message);
            } else {
                console.log('   ✅ stars column works');
            }
            
            // Test github_url column specifically
            const { error: githubError } = await supabase
                .from('servers_with_details')
                .select('github_url')
                .limit(1);
            
            if (githubError) {
                console.error('   ❌ github_url column fails:', githubError.message);
            } else {
                console.log('   ✅ github_url column works');
            }
            
            return;
        }
        
        console.log('✅ Application query works!');
        console.log('   Retrieved', statsData?.length, 'records');
        
        // Test 3: Check what columns are actually available
        console.log('\n3. Checking available columns...');
        const { data: sampleData, error: sampleError } = await supabase
            .from('servers_with_details')
            .select('*')
            .limit(1);
        
        if (sampleError) {
            console.error('❌ Sample data query failed:', sampleError.message);
            return;
        }
        
        if (sampleData && sampleData.length > 0) {
            const columns = Object.keys(sampleData[0]);
            console.log('✅ Available columns:', columns.length);
            console.log('   Sample columns:', columns.slice(0, 10).join(', '), '...');
            
            // Check for voting columns specifically
            const votingColumns = ['total_score', 'upvotes', 'downvotes', 'is_monorepo'];
            const hasVotingColumns = votingColumns.filter(col => columns.includes(col));
            
            if (hasVotingColumns.length === votingColumns.length) {
                console.log('✅ All voting columns present:', hasVotingColumns.join(', '));
            } else {
                console.log('❌ Missing voting columns:', votingColumns.filter(col => !columns.includes(col)).join(', '));
            }
        }
        
        console.log('\n🎉 Database state check completed!');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug
debugCurrentState().catch(console.error);