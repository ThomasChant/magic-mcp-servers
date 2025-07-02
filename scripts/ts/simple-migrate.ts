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
  console.error('SUPABASE_URL:', SUPABASE_URL);
  console.error('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTables() {
  console.log('🏗️  Creating tables...');
  
  // Create categories table
  const { error: categoriesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_zh_cn TEXT,
        name_zh_tw TEXT,
        name_fr TEXT,
        name_ja TEXT,
        name_ko TEXT,
        name_ru TEXT,
        description_en TEXT,
        description_zh_cn TEXT,
        description_zh_tw TEXT,
        description_fr TEXT,
        description_ja TEXT,
        description_ko TEXT,
        description_ru TEXT,
        icon TEXT,
        color TEXT,
        server_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (categoriesError) {
    console.error('Error creating categories table:', categoriesError);
    return false;
  }

  // Create servers table
  const { error: serversError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        github_url TEXT,
        category TEXT,
        source_repository TEXT,
        tags TEXT[] DEFAULT '{}',
        repository_stars INTEGER DEFAULT 0,
        repository_forks INTEGER DEFAULT 0,
        repository_watchers INTEGER DEFAULT 0,
        repository_last_updated TIMESTAMPTZ,
        quality_documentation_score INTEGER DEFAULT 0,
        quality_maintenance_score INTEGER DEFAULT 0,
        quality_community_score INTEGER DEFAULT 0,
        installation_npm TEXT,
        installation_pip TEXT,
        installation_docker TEXT,
        installation_manual TEXT,
        author_name TEXT,
        author_url TEXT,
        license TEXT,
        homepage TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (serversError) {
    console.error('Error creating servers table:', serversError);
    return false;
  }

  console.log('✅ Tables created successfully');
  return true;
}

async function migrateServers() {
  console.log('📦 Migrating servers...');
  
  const serversPath = path.join(__dirname, '../../src/data/merged_servers.json');
  const serversData = JSON.parse(fs.readFileSync(serversPath, 'utf8'));
  
  console.log(`Found ${serversData.length} servers to migrate`);
  
  const transformedServers = serversData.map((server: any) => ({
    id: server.githubUrl?.replace('https://github.com/', '') || server.name,
    name: server.name,
    description: server.description,
    github_url: server.githubUrl,
    category: server.category,
    source_repository: server.sourceRepository,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < transformedServers.length; i += batchSize) {
    const batch = transformedServers.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('servers')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      return false;
    }
    
    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transformedServers.length/batchSize)}`);
  }
  
  console.log(`✅ Successfully migrated ${transformedServers.length} servers`);
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
  console.log('🚀 Starting simple Supabase migration...');
  
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('💥 Failed to create tables');
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
  
  console.log('🎉 Migration completed successfully!');
}

main().catch(console.error);