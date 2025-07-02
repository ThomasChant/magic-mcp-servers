import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDBConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test query to get a few servers
    const { data, error } = await supabase
      .from('servers_with_details')
      .select('id, name, slug')
      .limit(5);

    if (error) {
      console.error('❌ Database query failed:', error);
      return;
    }

    console.log('✅ Database connection successful');
    console.log('Available servers:');
    data.forEach(server => {
      console.log(`- ${server.name} (slug: ${server.slug})`);
    });

  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
}

testDBConnection();