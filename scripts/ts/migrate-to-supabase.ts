import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for migration

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper functions
const loadJsonFile = (filename: string) => {
  const filePath = path.join(__dirname, '../public/data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Migration functions
async function migrateCategories() {
  console.log('📦 Migrating categories...');
  
  const categories = loadJsonFile('categories.json');
  
  const transformedCategories = categories.map((cat: any) => ({
    id: cat.id,
    name_zh_cn: cat.name,
    name_en: cat.nameEn,
    name_zh_tw: cat.nameEn, // Use English as fallback
    name_fr: cat.nameEn,
    name_ja: cat.nameEn,
    name_ko: cat.nameEn,
    name_ru: cat.nameEn,
    description_zh_cn: cat.description,
    description_en: cat.descriptionEn,
    description_zh_tw: cat.descriptionEn,
    description_fr: cat.descriptionEn,
    description_ja: cat.descriptionEn,
    description_ko: cat.descriptionEn,
    description_ru: cat.descriptionEn,
    icon: cat.icon,
    color: cat.color,
    server_count: cat.serverCount || 0,
  }));

  const { error } = await supabase
    .from('categories')
    .upsert(transformedCategories, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to migrate categories:', error);
    return;
  }

  console.log(`✅ Migrated ${transformedCategories.length} categories`);

  // Migrate subcategories
  for (const category of categories) {
    if (category.subcategories && category.subcategories.length > 0) {
      const transformedSubcategories = category.subcategories.map((sub: any) => ({
        id: sub.id,
        category_id: category.id,
        name_zh_cn: sub.name,
        name_en: sub.nameEn,
        name_zh_tw: sub.nameEn,
        name_fr: sub.nameEn,
        name_ja: sub.nameEn,
        name_ko: sub.nameEn,
        name_ru: sub.nameEn,
        description_zh_cn: sub.description,
        description_en: sub.descriptionEn,
        description_zh_tw: sub.descriptionEn,
        description_fr: sub.descriptionEn,
        description_ja: sub.descriptionEn,
        description_ko: sub.descriptionEn,
        description_ru: sub.descriptionEn,
      }));

      const { error: subError } = await supabase
        .from('subcategories')
        .upsert(transformedSubcategories, { onConflict: 'id' });

      if (subError) {
        console.error(`❌ Failed to migrate subcategories for ${category.id}:`, subError);
      } else {
        console.log(`✅ Migrated ${transformedSubcategories.length} subcategories for ${category.id}`);
      }
    }
  }
}

async function migrateTags() {
  console.log('🏷️ Migrating tags...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  // Collect all unique tags
  const allTags = new Set<string>();
  
  coreServers.forEach((server: any) => {
    if (server.tags) {
      server.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  Object.values(extendedServers).forEach((server: any) => {
    if (server.allTags) {
      server.allTags.forEach((tag: string) => allTags.add(tag));
    }
  });

  const tagsArray = Array.from(allTags).map(tag => ({ name: tag }));

  const { error } = await supabase
    .from('tags')
    .upsert(tagsArray, { onConflict: 'name' });

  if (error) {
    console.error('❌ Failed to migrate tags:', error);
    return;
  }

  console.log(`✅ Migrated ${tagsArray.length} unique tags`);
}

async function migrateServers() {
  console.log('🖥️ Migrating servers...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  // Get all tags for mapping
  const { data: tags } = await supabase.from('tags').select('id, name');
  const tagMap = new Map(tags?.map(tag => [tag.name, tag.id]) || []);
  
  let processed = 0;
  const batchSize = 50;

  for (let i = 0; i < coreServers.length; i += batchSize) {
    const batch = coreServers.slice(i, i + batchSize);
    const transformedServers = [];

    for (const core of batch) {
      const extended = extendedServers[core.id] || {};
      
      const transformedServer = {
        id: core.id,
        name: core.name,
        owner: core.owner,
        slug: core.slug,
        description_zh_cn: core.description,
        description_en: core.description,
        full_description: extended.fullDescription || core.description,
        icon: extended.icon || null,
        category_id: core.category,
        subcategory_id: core.subcategory || null,
        featured: core.featured || false,
        verified: core.verified || false,
        github_url: core.links?.github || null,
        demo_url: null,
        docs_url: extended.documentation?.api || core.links?.docs || null,
        repository_owner: core.owner,
        repository_name: core.name.split('/')[1] || core.name,
        stars: core.stats?.stars || 0,
        forks: core.stats?.forks || 0,
        watchers: extended.repository?.watchers || core.stats?.stars || 0,
        open_issues: extended.repository?.openIssues || 0,
        last_updated: core.stats?.lastUpdated || new Date().toISOString(),
        repo_created_at: extended.metadata?.createdAt || new Date().toISOString(),
        quality_score: core.qualityScore || 0,
        quality_documentation: extended.quality?.factors?.documentation || 60,
        quality_maintenance: extended.quality?.factors?.maintenance || 50,
        quality_community: extended.quality?.factors?.community || 40,
        quality_performance: extended.quality?.factors?.performance || 85,
        complexity: extended.metadata?.complexity || 'medium',
        maturity: extended.metadata?.maturity || 'stable',
        downloads: extended.usage?.downloads || core.stats?.stars * 10 || 0,
        dependents: extended.usage?.dependents || core.stats?.forks || 0,
        weekly_downloads: extended.usage?.weeklyDownloads || Math.floor(core.stats?.stars * 2) || 0,
        platforms: extended.compatibility?.platforms || ['web', 'desktop'],
        node_version: extended.compatibility?.nodeVersion || null,
        python_version: extended.compatibility?.pythonVersion || null,
        requirements: extended.compatibility?.requirements || [],
        readme_content: extended.fullDescription || core.description,
        api_reference: extended.documentation?.api || null,
        categorization_confidence: extended.categorization?.confidence || 0.8,
        categorization_reason: extended.categorization?.reason || 'Automatically categorized',
        categorization_keywords: extended.categorization?.matched_keywords || [],
      };

      transformedServers.push(transformedServer);
    }

    // Insert servers
    const { error } = await supabase
      .from('mcp_servers')
      .upsert(transformedServers, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Failed to migrate server batch ${i}-${i + batchSize}:`, error);
      continue;
    }

    // Insert server tags
    for (const core of batch) {
      const extended = extendedServers[core.id] || {};
      const serverTags = extended.allTags || core.tags || [];
      
      if (serverTags.length > 0) {
        const serverTagRelations = serverTags
          .map((tagName: string) => {
            const tagId = tagMap.get(tagName);
            return tagId ? { server_id: core.id, tag_id: tagId } : null;
          })
          .filter(Boolean);

        if (serverTagRelations.length > 0) {
          const { error: tagError } = await supabase
            .from('server_tags')
            .upsert(serverTagRelations, { onConflict: 'server_id,tag_id' });

          if (tagError) {
            console.error(`❌ Failed to migrate tags for server ${core.id}:`, tagError);
          }
        }
      }

      // Insert tech stack
      const techStack = extended.techStack || [];
      if (techStack.length > 0) {
        const techStackData = techStack.map((tech: any) => ({
          server_id: core.id,
          technology: typeof tech === 'string' ? tech : (tech.name || tech.label || ''),
        }));

        const { error: techError } = await supabase
          .from('server_tech_stack')
          .upsert(techStackData, { onConflict: 'server_id,technology' });

        if (techError) {
          console.error(`❌ Failed to migrate tech stack for server ${core.id}:`, techError);
        }
      }

      // Insert installation methods
      if (extended.installation) {
        const installMethods = [];
        
        Object.entries(extended.installation).forEach(([method, value]) => {
          if (method !== 'instructions' && value) {
            installMethods.push({
              server_id: core.id,
              method,
              command: value,
              instructions: null,
            });
          }
        });

        if (extended.installation.instructions && extended.installation.instructions.length > 0) {
          installMethods.push({
            server_id: core.id,
            method: 'instructions',
            command: null,
            instructions: extended.installation.instructions,
          });
        }

        if (installMethods.length > 0) {
          const { error: installError } = await supabase
            .from('server_installation')
            .upsert(installMethods);

          if (installError) {
            console.error(`❌ Failed to migrate installation for server ${core.id}:`, installError);
          }
        }
      }
    }

    processed += batch.length;
    console.log(`✅ Migrated ${processed}/${coreServers.length} servers`);
    
    // Rate limiting
    await sleep(500);
  }
}

async function migrateReadmes() {
  console.log('📖 Migrating README files...');
  
  const readmesDir = path.join(__dirname, '../public/data/reporeadmes');
  
  if (!fs.existsSync(readmesDir)) {
    console.log('❌ README directory not found:', readmesDir);
    return;
  }

  const files = fs.readdirSync(readmesDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('❌ No README files found');
    return;
  }

  let processed = 0;
  let errors = 0;
  const batchSize = 10; // Smaller batch size for README content

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const readmeData = [];

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
      const { error } = await supabase
        .from('server_readmes')
        .upsert(readmeData, { onConflict: 'server_id' });

      if (error) {
        console.error(`❌ Failed to migrate README batch ${i}-${i + batchSize}:`, error);
        errors += readmeData.length;
      } else {
        processed += readmeData.length;
        console.log(`✅ Migrated ${processed}/${files.length} README files`);
      }
    }
    
    // Rate limiting for large content
    await sleep(1000);
  }

  console.log(`✅ README migration completed: ${processed} successful, ${errors} errors`);
}

async function main() {
  console.log('🚀 Starting Supabase migration...');
  
  try {
    await migrateCategories();
    await migrateTags();
    await migrateServers();
    await migrateReadmes();
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}