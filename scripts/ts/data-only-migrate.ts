import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  // Check if mcp_servers table exists
  const { data: servers, error: serversError } = await supabase
    .from('mcp_servers')
    .select('count')
    .limit(1);
  
  if (serversError) {
    console.log('⚠️ mcp_servers table might not exist:', serversError.message);
    return false;
  }
  
  // Check if categories table exists
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('count')
    .limit(1);
  
  if (categoriesError) {
    console.log('⚠️ categories table might not exist:', categoriesError.message);
    return false;
  }
  
  console.log('✅ Tables exist');
  return true;
}

async function migrateServers() {
  console.log('📦 Migrating servers to mcp_servers table...');
  
  const serversPath = path.join(__dirname, '../../src/data/merged_servers.json');
  const serversData = JSON.parse(fs.readFileSync(serversPath, 'utf8'));
  
  console.log(`Found ${serversData.length} servers to migrate`);
  
  const transformedServers = serversData.map((server: any, index: number) => {
    const githubUrl = server.githubUrl || '';
    const parts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = parts[0] || '';
    const repoName = parts[1] || '';
    
    // Create unique slug using index to avoid duplicates
    const baseName = server.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uniqueSlug = `${baseName}-${index + 1}`;
    
    return {
      id: `server-${index + 1}`,
      name: server.name,
      owner: owner,
      slug: uniqueSlug,
      description_en: server.description,
      description_zh_cn: server.description,
      category_id: server.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'general',
      github_url: server.githubUrl,
      repository_owner: owner,
      repository_name: repoName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Insert in batches
  const batchSize = 50;
  let totalInserted = 0;
  
  for (let i = 0; i < transformedServers.length; i += batchSize) {
    const batch = transformedServers.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('mcp_servers')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      console.error('First item in failed batch:', JSON.stringify(batch[0], null, 2));
      return false;
    }
    
    totalInserted += batch.length;
    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transformedServers.length/batchSize)} (${totalInserted}/${transformedServers.length})`);
  }
  
  console.log(`✅ Successfully migrated ${totalInserted} servers`);
  return true;
}

async function migrateCategories() {
  console.log('📦 Creating basic categories...');
  
  // Extract unique categories from servers
  const serversPath = path.join(__dirname, '../../src/data/merged_servers.json');
  const serversData = JSON.parse(fs.readFileSync(serversPath, 'utf8'));
  
  const uniqueCategories = [...new Set(serversData.map((s: any) => s.category))].filter(Boolean);
  
  const transformedCategories = uniqueCategories.map(category => ({
    id: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name_en: category,
    name_zh_cn: category,
    description_en: `MCP servers in the ${category} category`,
    description_zh_cn: `${category}类别的MCP服务器`,
    icon: 'package',
    color: '#3B82F6',
    server_count: serversData.filter((s: any) => s.category === category).length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { error } = await supabase
    .from('categories')
    .upsert(transformedCategories, { onConflict: 'id' });
  
  if (error) {
    console.error('Error inserting categories:', error);
    return false;
  }
  
  console.log(`✅ Successfully created ${transformedCategories.length} categories`);
  return true;
}

async function main() {
  console.log('🚀 Starting data-only Supabase migration...');
  
  const tablesExist = await checkTables();
  if (!tablesExist) {
    console.error('💥 Required tables do not exist. Please run the schema setup first.');
    process.exit(1);
  }
  
  const categoriesMigrated = await migrateCategories();
  if (!categoriesMigrated) {
    console.error('💥 Failed to migrate categories');
    process.exit(1);
  }
  
  const serversMigrated = await migrateServers();
  if (!serversMigrated) {
    console.error('💥 Failed to migrate servers');
    process.exit(1);
  }
  
  console.log('🎉 Data migration completed successfully!');
  console.log('Now the tag system should have data to work with.');
}

main().catch(console.error);