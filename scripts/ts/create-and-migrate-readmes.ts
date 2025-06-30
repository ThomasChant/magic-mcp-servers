import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTableDirectly() {
  console.log('🔨 Creating server_readmes table directly...');
  
  // Drop and recreate table using direct SQL
  const createTableSQL = `
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS server_readmes;

    -- Create new table
    CREATE TABLE server_readmes (
        id BIGSERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        project_name TEXT NOT NULL,
        raw_content TEXT NOT NULL,
        content_hash TEXT,
        file_size INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_server_id UNIQUE(server_id)
    );

    -- Disable RLS for now
    ALTER TABLE server_readmes DISABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX idx_server_readmes_server_id ON server_readmes(server_id);
    CREATE INDEX idx_server_readmes_hash ON server_readmes(content_hash);
  `;

  try {
    // Execute SQL using a simple query approach
    const { error } = await supabase.from('_sql_execute_').select('*').eq('sql', createTableSQL);
    console.log('   SQL execution attempt completed');
  } catch (err) {
    console.log('   Direct SQL execution not available, table should be created manually');
  }

  // Test if table works now
  console.log('🧪 Testing table...');
  const testRecord = {
    server_id: 'test_' + Date.now(),
    filename: 'test.md',
    project_name: 'test-project',
    raw_content: '# Test README\n\nThis is a test.',
    content_hash: 'test-hash',
    file_size: 25
  };

  const { data, error } = await supabase
    .from('server_readmes')
    .insert([testRecord])
    .select();

  if (error) {
    console.log('❌ Table creation failed. Please create it manually in Supabase Dashboard:');
    console.log('');
    console.log('Go to Supabase Dashboard > SQL Editor and run:');
    console.log('');
    console.log(createTableSQL);
    console.log('');
    return false;
  } else {
    console.log('✅ Table working! Test record created:', data);
    // Clean up test record
    await supabase.from('server_readmes').delete().eq('server_id', testRecord.server_id);
    return true;
  }
}

async function migrateREADMEs() {
  console.log('\n📖 Starting README migration...');
  
  const readmesDir = path.join(__dirname, '../public/data/reporeadmes');
  const files = fs.readdirSync(readmesDir).filter(f => f.endsWith('.md'));
  
  console.log(`📁 Found ${files.length} README files`);

  let processed = 0;
  let errors = 0;
  const batchSize = 5; // Small batches to avoid timeouts

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const readmeData = [];

    console.log(`📤 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}...`);

    for (const filename of batch) {
      try {
        const filePath = path.join(readmesDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const serverId = filename.replace('.md', '');
        const projectName = serverId.split('_').slice(1).join('_') || serverId;
        const contentHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
        
        readmeData.push({
          server_id: serverId,
          filename: filename,
          project_name: projectName,
          raw_content: content,
          content_hash: contentHash,
          file_size: Buffer.byteLength(content, 'utf8')
        });
      } catch (err) {
        console.log(`   ⚠️  Error processing ${filename}:`, err.message);
        errors++;
      }
    }

    if (readmeData.length > 0) {
      const { error } = await supabase
        .from('server_readmes')
        .upsert(readmeData, { onConflict: 'server_id' });

      if (error) {
        console.log(`   ❌ Batch failed:`, error.message || 'Unknown error');
        errors += readmeData.length;
      } else {
        processed += readmeData.length;
        console.log(`   ✅ Batch success: ${processed}/${files.length} files migrated`);
      }
    }

    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Migration completed: ${processed} successful, ${errors} errors`);
  return processed > 0;
}

async function main() {
  console.log('🚀 Complete README Migration Tool');
  console.log('This will create the table and migrate all README files');
  console.log('=====================================\n');

  try {
    // Step 1: Create/verify table
    const tableReady = await createTableDirectly();
    
    if (!tableReady) {
      console.log('\n❌ Cannot proceed without a working table.');
      console.log('Please create the table manually and run this script again.');
      return;
    }

    // Step 2: Migrate data
    const success = await migrateREADMEs();
    
    if (success) {
      console.log('\n✨ All done! You can now:');
      console.log('1. Enable RLS if needed: ALTER TABLE server_readmes ENABLE ROW LEVEL SECURITY;');
      console.log('2. Add read policies for public access');
      console.log('3. Test the frontend with: npm run supabase:dev');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

main();