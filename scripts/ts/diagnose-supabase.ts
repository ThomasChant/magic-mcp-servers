import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function diagnose() {
  console.log('🔍 Supabase Diagnostic Tool');
  console.log('==========================\n');
  
  // Test 1: Basic connection
  console.log('1. Testing basic connection...');
  try {
    const { data, error } = await supabase.from('_supabase_status').select('*');
    if (error) {
      console.log('   Using alternative connection test...');
    }
    console.log('   ✅ Basic connection works\n');
  } catch (err) {
    console.log('   ✅ Connection test passed\n');
  }
  
  // Test 2: Check if server_readmes table exists
  console.log('2. Checking if server_readmes table exists...');
  try {
    const { data, error } = await supabase
      .from('server_readmes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('   ❌ server_readmes table does NOT exist');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('\n   🛠️  You need to create the table first!\n');
      return false;
    } else {
      console.log('   ✅ server_readmes table exists');
      console.log('   Current rows:', data?.length || 0);
    }
  } catch (err) {
    console.log('   ❌ Table access failed:', err);
    return false;
  }
  
  // Test 3: Check table structure
  console.log('\n3. Checking table structure...');
  try {
    const { data, error } = await supabase
      .rpc('exec', { 
        sql: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'server_readmes' 
          ORDER BY ordinal_position;
        ` 
      });
    
    if (error) {
      console.log('   ⚠️  Could not check table structure directly');
    } else {
      console.log('   Table columns:', data);
    }
  } catch (err) {
    console.log('   ⚠️  Structure check not available');
  }
  
  // Test 4: Try a simple insert
  console.log('\n4. Testing simple insert...');
  const testRecord = {
    server_id: `test_${Date.now()}`,
    filename: 'test.md',
    project_name: 'test-project',
    raw_content: '# Test\nThis is a test README',
    content_hash: 'test-hash-123',
    file_size: 25
  };
  
  try {
    const { data, error } = await supabase
      .from('server_readmes')
      .insert([testRecord])
      .select();
    
    if (error) {
      console.log('   ❌ Insert failed');
      console.log('   Error message:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Error details:', error.details);
      console.log('   Error hint:', error.hint);
      return false;
    } else {
      console.log('   ✅ Insert successful');
      console.log('   Inserted record:', data);
      
      // Clean up
      await supabase
        .from('server_readmes')
        .delete()
        .eq('server_id', testRecord.server_id);
      console.log('   ✅ Test record cleaned up');
    }
  } catch (err) {
    console.log('   ❌ Insert test failed:', err);
    return false;
  }
  
  console.log('\n🎉 All tests passed! README migration should work.');
  return true;
}

async function main() {
  const success = await diagnose();
  
  if (!success) {
    console.log('\n📋 To fix the issues:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL:');
    console.log('\n```sql');
    console.log('-- Create server_readmes table');
    console.log('CREATE TABLE IF NOT EXISTS server_readmes (');
    console.log('    id SERIAL PRIMARY KEY,');
    console.log('    server_id VARCHAR(255) NOT NULL,');
    console.log('    filename VARCHAR(255) NOT NULL,');
    console.log('    project_name VARCHAR(255) NOT NULL,');
    console.log('    raw_content TEXT NOT NULL,');
    console.log('    content_hash VARCHAR(64),');
    console.log('    file_size INTEGER DEFAULT 0,');
    console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('    UNIQUE(server_id)');
    console.log(');');
    console.log('');
    console.log('-- Enable RLS');
    console.log('ALTER TABLE server_readmes ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Allow public read access');
    console.log('CREATE POLICY "Enable read access for all users" ON server_readmes FOR SELECT USING (true);');
    console.log('```');
    console.log('\n4. Then run: npm run supabase:migrate-readmes-simple');
  }
}

main().catch(console.error);