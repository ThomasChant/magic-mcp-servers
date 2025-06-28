import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Define types for our README data
interface ReadmeData {
  server_id: string;
  filename: string;
  project_name: string;
  raw_content: string;
  content_hash: string;
  file_size: number;
}

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for migration

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateReadmes() {
  console.log('📖 Starting README migration to Supabase...');
  
  const readmesDir = path.join(__dirname, '../public/data/reporeadmes');
  
  if (!fs.existsSync(readmesDir)) {
    console.error('❌ README directory not found:', readmesDir);
    return;
  }

  const files = fs.readdirSync(readmesDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.error('❌ No README files found in:', readmesDir);
    return;
  }

  console.log(`📁 Found ${files.length} README files to migrate`);

  let processed = 0;
  let errors = 0;
  const batchSize = 5; // Small batch size for large content

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const readmeData: ReadmeData[] = [];

    for (const filename of batch) {
      try {
        const filePath = path.join(readmesDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        const serverId = filename.replace('.md', '');
        const contentHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
        const fileSize = Buffer.byteLength(content, 'utf8');
        
        // Extract project name from filename (remove owner prefix)
        const projectName = filename.replace('.md', '').split('_').slice(1).join('_') || filename.replace('.md', '');
        
        readmeData.push({
          server_id: serverId,
          filename: filename,
          project_name: projectName,
          raw_content: content,
          content_hash: contentHash,
          file_size: fileSize,
        });
        
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
        errors++;
      }
    }

    if (readmeData.length > 0) {
      console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} (${readmeData.length} files)...`);
      
      const { error } = await supabase
        .from('server_readmes')
        .upsert(readmeData as any, { onConflict: 'server_id' });

      if (error) {
        console.error(`❌ Failed to migrate README batch:`, JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        errors += readmeData.length;
      } else {
        processed += readmeData.length;
        console.log(`✅ Successfully migrated ${processed}/${files.length} README files`);
      }
    }
    
    // Rate limiting for large content uploads
    await sleep(2000);
  }

  console.log('\n🎉 README migration completed!');
  console.log(`📊 Results: ${processed} successful, ${errors} errors`);
  
  if (errors > 0) {
    console.log('⚠️  Some files failed to migrate. Check the error messages above.');
  } else {
    console.log('✨ All README files migrated successfully!');
  }
}

async function main() {
  console.log('🚀 README Migration Tool');
  console.log('This will migrate all README files from /public/data/reporeadmes to Supabase');
  console.log();
  
  try {
    // Test connection and table structure
    console.log('🔗 Testing Supabase connection...');
    const { error: testError, data: connectionData } = await supabase.from('server_readmes').select('id').limit(1);
    
    if (testError) {
      console.error('❌ Failed to connect to Supabase or table does not exist:');
      console.error('Error details:', {
        message: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint
      });
      console.log('\n💡 The server_readmes table does not exist yet!');
      console.log('\n🛠️  Please run the following SQL in Supabase SQL Editor first:');
      console.log('\n```sql');
      console.log('-- Create server_readmes table');
      console.log('CREATE TABLE server_readmes (');
      console.log('    id SERIAL PRIMARY KEY,');
      console.log('    server_id VARCHAR(50) NOT NULL,');
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
      console.log('\nOr run the complete schema.sql file that includes this table.');
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test insertion with a small sample
    console.log('🧪 Testing table structure with sample data...');
    const testData = {
      server_id: 'test_migration_' + Date.now(),
      filename: 'test.md',
      project_name: 'test-project',
      raw_content: '# Test README\n\nThis is a test.',
      content_hash: 'test-hash-' + Date.now(),
      file_size: 25,
    };
    
    const { error: insertError } = await supabase
      .from('server_readmes')
      .insert([testData]);
    
    if (insertError) {
      console.error('❌ Table structure test failed:');
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      console.log('\n💡 This suggests a table structure or permission issue.');
      process.exit(1);
    }
    
    // Clean up test data
    await supabase.from('server_readmes').delete().eq('server_id', testData.server_id);
    console.log('✅ Table structure test passed');
    console.log();
    
    await migrateReadmes();
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateReadmes };