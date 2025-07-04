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

async function verifyFix() {
    console.log('🔍 Verifying Database Fix...\n');
    
    try {
        // Test 1: Basic view access
        console.log('1. Testing basic view access...');
        const { data: basicData, error: basicError } = await supabase
            .from('servers_with_details')
            .select('id, name, stars')
            .limit(1);
        
        if (basicError) {
            console.error('❌ Basic view access failed:', basicError.message);
            return false;
        }
        
        console.log('✅ Basic view access works');
        
        // Test 2: Voting columns access
        console.log('\n2. Testing voting columns...');
        const { data: votingData, error: votingError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, upvotes, downvotes, is_monorepo')
            .limit(3);
        
        if (votingError) {
            console.error('❌ Voting columns access failed:', votingError.message);
            if (votingError.message.includes('column') && votingError.message.includes('does not exist')) {
                console.log('\n🔧 The view update was not applied correctly.');
                console.log('   Please follow the instructions in MANUAL_DB_UPDATE.md');
            }
            return false;
        }
        
        console.log('✅ Voting columns access works');
        console.log('   Sample data with voting scores:');
        votingData?.forEach((server, index) => {
            const monorepoFlag = server.is_monorepo ? ' 📁' : '';
            console.log(`   ${index + 1}. ${server.name}${monorepoFlag}: score=${server.total_score}, votes=+${server.upvotes}/-${server.downvotes}`);
        });
        
        // Test 3: Sorting by total_score
        console.log('\n3. Testing sorting by total_score...');
        const { data: sortedData, error: sortError } = await supabase
            .from('servers_with_details')
            .select('id, name, total_score, stars')
            .order('total_score', { ascending: false })
            .limit(5);
        
        if (sortError) {
            console.error('❌ Sorting by total_score failed:', sortError.message);
            return false;
        }
        
        console.log('✅ Sorting by total_score works');
        console.log('   Top servers by community score:');
        sortedData?.forEach((server, index) => {
            console.log(`   ${index + 1}. ${server.name}: community_score=${server.total_score}, github_stars=${server.stars}`);
        });
        
        // Test 4: Test dependent views
        console.log('\n4. Testing dependent views...');
        const { data: popularData, error: popularError } = await supabase
            .from('popular_servers')
            .select('id, name, total_score')
            .limit(3);
        
        if (popularError) {
            console.error('❌ popular_servers view failed:', popularError.message);
            console.log('   The dependent views may need to be recreated.');
            return false;
        }
        
        console.log('✅ Dependent views work correctly');
        console.log('   Popular servers:', popularData?.map(s => `${s.name}(${s.total_score})`).join(', '));
        
        // Test 5: Test application compatibility
        console.log('\n5. Testing application compatibility...');
        const { data: appData, error: appError } = await supabase
            .from('servers_with_details')
            .select('*')
            .limit(1);
        
        if (appError) {
            console.error('❌ Application compatibility test failed:', appError.message);
            return false;
        }
        
        // Check if all expected columns exist
        const requiredColumns = ['total_score', 'upvotes', 'downvotes', 'vote_score', 'is_monorepo', 'initial_score'];
        const availableColumns = Object.keys(appData?.[0] || {});
        const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.error('❌ Missing required columns:', missingColumns.join(', '));
            return false;
        }
        
        console.log('✅ All required columns present');
        
        // Success summary
        console.log('\n🎉 Database Fix Verification: SUCCESS!');
        console.log('\n📋 Summary:');
        console.log('✅ servers_with_details view updated successfully');
        console.log('✅ Voting columns (total_score, upvotes, downvotes) are available');
        console.log('✅ Sorting by community score works');
        console.log('✅ Dependent views (popular_servers, etc.) work correctly');
        console.log('✅ Application compatibility confirmed');
        console.log('\n🚀 The application should now work without the "column does not exist" error!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
        return false;
    }
}

async function main() {
    const success = await verifyFix();
    
    if (!success) {
        console.log('\n❌ Fix verification failed');
        console.log('📖 Please follow the manual update instructions in MANUAL_DB_UPDATE.md');
        process.exit(1);
    }
    
    console.log('\n✅ All systems operational! You can now run the application.');
}

// Run the verification
main().catch(console.error);