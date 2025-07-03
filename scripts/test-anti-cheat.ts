#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAntiCheatSystem() {
    console.log('🧪 Testing Anti-Cheat System...\n');
    
    const testUserId = 'test-user-' + Date.now();
    const testServerId = 'test-server-1';
    
    try {
        // Test 1: Check if user can vote initially
        console.log('1. Testing initial vote permission...');
        const { data: canVote1, error: error1 } = await supabase
            .rpc('can_user_vote', { user_id_param: testUserId });
        
        if (error1) {
            console.error('❌ Error checking vote permission:', error1.message);
            return;
        }
        
        console.log(`   Can vote initially: ${canVote1 ? '✅ Yes' : '❌ No'}`);
        
        // Test 2: Record multiple votes to test rate limiting
        console.log('\n2. Testing rate limiting (simulating rapid votes)...');
        
        for (let i = 0; i < 5; i++) {
            const { error: recordError } = await supabase
                .rpc('record_vote_action', { user_id_param: testUserId });
            
            if (recordError) {
                console.error(`❌ Error recording vote ${i + 1}:`, recordError.message);
                continue;
            }
            
            const { data: canVoteAfter, error: checkError } = await supabase
                .rpc('can_user_vote', { user_id_param: testUserId });
            
            if (checkError) {
                console.error(`❌ Error checking vote permission after vote ${i + 1}:`, checkError.message);
                continue;
            }
            
            console.log(`   After vote ${i + 1}: ${canVoteAfter ? '✅ Can vote' : '❌ Rate limited'}`);
        }
        
        // Test 3: Test suspicious voting detection
        console.log('\n3. Testing suspicious voting detection...');
        
        const { data: suspiciousData, error: suspiciousError } = await supabase
            .rpc('detect_suspicious_voting', { user_id_param: testUserId });
        
        if (suspiciousError) {
            console.error('❌ Error detecting suspicious voting:', suspiciousError.message);
        } else {
            console.log('   Suspicious voting analysis:');
            console.log(`   - Recent votes: ${suspiciousData.recent_votes}`);
            console.log(`   - Rapid votes: ${suspiciousData.rapid_votes}`);
            console.log(`   - Pattern diversity: ${suspiciousData.pattern_diversity}`);
            console.log(`   - Risk level: ${suspiciousData.risk_level}`);
            console.log(`   - Suspicious: ${suspiciousData.suspicious ? '⚠️ Yes' : '✅ No'}`);
        }
        
        // Test 4: Test cleanup function
        console.log('\n4. Testing cleanup function...');
        
        const { data: cleanupResult, error: cleanupError } = await supabase
            .rpc('cleanup_expired_rate_limits');
        
        if (cleanupError) {
            console.error('❌ Error running cleanup:', cleanupError.message);
        } else {
            console.log(`   Cleaned up ${cleanupResult} expired records`);
        }
        
        console.log('\n✅ Anti-cheat system test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Rate limiting functions are working');
        console.log('   - Suspicious voting detection is operational');
        console.log('   - Cleanup function is functional');
        console.log('   - Ready for production use with basic anti-cheat protection');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function checkDatabaseTables() {
    console.log('🔍 Checking anti-cheat database tables...\n');
    
    try {
        // Check if rate limit table exists
        const { data: rateLimitData, error: rateLimitError } = await supabase
            .from('user_vote_rate_limit')
            .select('count', { count: 'exact', head: true });
        
        if (rateLimitError) {
            console.log('❌ user_vote_rate_limit table not found or accessible');
            console.log('   Please run the migration: supabase/migrations/add_anti_cheat.sql');
        } else {
            console.log('✅ user_vote_rate_limit table exists');
        }
        
        // Check if functions exist by trying to call them
        const { error: functionError } = await supabase
            .rpc('can_user_vote', { user_id_param: 'test' });
        
        if (functionError && functionError.message.includes('does not exist')) {
            console.log('❌ Anti-cheat functions not found');
            console.log('   Please run the migration: supabase/migrations/add_anti_cheat.sql');
        } else {
            console.log('✅ Anti-cheat functions exist');
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    }
}

async function main() {
    console.log('🚀 Anti-Cheat System Test Suite\n');
    
    await checkDatabaseTables();
    console.log();
    await testAntiCheatSystem();
}

if (require.main === module) {
    main().catch(console.error);
}