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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

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

  // Temporarily disable RLS for easier migration
  console.log('🔓 Temporarily disabling RLS for migration...');
  await supabase.rpc('exec', { 
    sql: 'ALTER TABLE server_readmes DISABLE ROW LEVEL SECURITY;' 
  });

  let processed = 0;
  let errors = 0;
  const batchSize = 10; // Larger batch since RLS is disabled

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
        .upsert(readmeData, { onConflict: 'server_id' });

      if (error) {
        console.error(`❌ Failed to migrate README batch:`, error.message || error);
        errors += readmeData.length;
      } else {
        processed += readmeData.length;
        console.log(`✅ Successfully migrated ${processed}/${files.length} README files`);
      }
    }
    
    // Rate limiting
    await sleep(1000);
  }

  // Re-enable RLS
  console.log('🔒 Re-enabling RLS...');
  await supabase.rpc('exec', { 
    sql: 'ALTER TABLE server_readmes ENABLE ROW LEVEL SECURITY;' 
  });

  console.log('\n🎉 README migration completed!');
  console.log(`📊 Results: ${processed} successful, ${errors} errors`);
  
  if (errors > 0) {
    console.log('⚠️  Some files failed to migrate. Check the error messages above.');
  } else {
    console.log('✨ All README files migrated successfully!');
  }
}

async function main() {
  console.log('🚀 Simple README Migration Tool');
  console.log('This will temporarily disable RLS and migrate README files');
  console.log();
  
  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { error: testError } = await supabase.from('server_readmes').select('id').limit(1);
    
    if (testError) {
      console.error('❌ Failed to connect to Supabase or table does not exist:');
      console.error('Error:', testError.message);
      console.log('\n💡 Please create the server_readmes table first by running schema.sql');
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful');
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