import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
const loadJsonFile = (filename: string) => {
  const filePath = path.join(__dirname, '../public/data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const escapeString = (str: string | null | undefined): string => {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
};

const escapeArray = (arr: string[] | null | undefined): string => {
  if (!arr || arr.length === 0) return 'NULL';
  const escapedItems = arr.map(item => escapeString(item)).join(',');
  return `ARRAY[${escapedItems}]`;
};

const formatTimestamp = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'NOW()';
  return escapeString(new Date(timestamp).toISOString());
};

// SQL generation functions
function generateCategoriesSQL(): string {
  console.log('📦 Converting categories to SQL...');
  
  const categories = loadJsonFile('categories.json');
  
  let sql = `-- Categories data\n`;
  sql += `INSERT INTO categories (id, name_zh_cn, name_en, name_zh_tw, name_fr, name_ja, name_ko, name_ru, description_zh_cn, description_en, description_zh_tw, description_fr, description_ja, description_ko, description_ru, icon, color, server_count) VALUES\n`;
  
  const categoryValues = categories.map((cat: Record<string, unknown>) => {
    return `(${escapeString(cat.id as string)}, ${escapeString(cat.name as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.nameEn as string)}, ${escapeString(cat.description as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.descriptionEn as string)}, ${escapeString(cat.icon as string)}, ${escapeString(cat.color as string)}, ${(cat.serverCount as number) || 0})`;
  });
  
  sql += categoryValues.join(',\n');
  sql += `\nON CONFLICT (id) DO UPDATE SET
    name_zh_cn = EXCLUDED.name_zh_cn,
    name_en = EXCLUDED.name_en,
    description_zh_cn = EXCLUDED.description_zh_cn,
    description_en = EXCLUDED.description_en,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    server_count = EXCLUDED.server_count,
    updated_at = NOW();\n\n`;

  // Subcategories
  sql += `-- Subcategories data\n`;
  sql += `INSERT INTO subcategories (id, category_id, name_zh_cn, name_en, name_zh_tw, name_fr, name_ja, name_ko, name_ru, description_zh_cn, description_en, description_zh_tw, description_fr, description_ja, description_ko, description_ru) VALUES\n`;
  
  const subcategoryValues: string[] = [];
  categories.forEach((category: Record<string, unknown>) => {
    if (category.subcategories && Array.isArray(category.subcategories) && category.subcategories.length > 0) {
      category.subcategories.forEach((sub: Record<string, unknown>) => {
        subcategoryValues.push(
          `(${escapeString(sub.id as string)}, ${escapeString(category.id as string)}, ${escapeString(sub.name as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.nameEn as string)}, ${escapeString(sub.description as string)}, ${escapeString(sub.descriptionEn as string)}, ${escapeString(sub.descriptionEn as string)}, ${escapeString(sub.descriptionEn as string)}, ${escapeString(sub.descriptionEn as string)}, ${escapeString(sub.descriptionEn as string)}, ${escapeString(sub.descriptionEn as string)})`
        );
      });
    }
  });
  
  if (subcategoryValues.length > 0) {
    sql += subcategoryValues.join(',\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      name_zh_cn = EXCLUDED.name_zh_cn,
      name_en = EXCLUDED.name_en,
      description_zh_cn = EXCLUDED.description_zh_cn,
      description_en = EXCLUDED.description_en,
      updated_at = NOW();\n\n`;
  } else {
    sql += `-- No subcategories to insert\n\n`;
  }

  console.log(`✅ Generated SQL for ${categories.length} categories and ${subcategoryValues.length} subcategories`);
  return sql;
}

function generateTagsSQL(): string {
  console.log('🏷️ Converting tags to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  // Collect all unique tags
  const allTags = new Set<string>();
  
  coreServers.forEach((server: Record<string, unknown>) => {
    if (server.tags && Array.isArray(server.tags)) {
      server.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  
  Object.values(extendedServers).forEach((server: Record<string, unknown>) => {
    if (server.allTags && Array.isArray(server.allTags)) {
      server.allTags.forEach((tag: string) => allTags.add(tag));
    }
  });

  let sql = `-- Tags data\n`;
  sql += `INSERT INTO tags (name) VALUES\n`;
  
  const tagValues = Array.from(allTags).map(tag => `(${escapeString(tag)})`);
  sql += tagValues.join(',\n');
  sql += `\nON CONFLICT (name) DO NOTHING;\n\n`;

  console.log(`✅ Generated SQL for ${allTags.size} unique tags`);
  return sql;
}

function generateServersSQL(): string {
  console.log('🖥️ Converting servers to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  // Track used slugs to ensure uniqueness
  const usedSlugs = new Set<string>();
  const makeUniqueSlug = (originalSlug: string, serverId: string): string => {
    if (!usedSlugs.has(originalSlug)) {
      usedSlugs.add(originalSlug);
      return originalSlug;
    }
    
    // If slug is taken, try with server id suffix
    const uniqueSlug = `${originalSlug}-${serverId.slice(-4)}`;
    usedSlugs.add(uniqueSlug);
    return uniqueSlug;
  };
  
  let sql = `-- MCP Servers data\n`;
  sql += `INSERT INTO mcp_servers (
    id, name, owner, slug, description_zh_cn, description_en, full_description, icon,
    category_id, subcategory_id, featured, verified, github_url, demo_url, docs_url,
    repository_owner, repository_name, stars, forks, watchers, open_issues,
    last_updated, repo_created_at, quality_score, quality_documentation,
    quality_maintenance, quality_community, quality_performance, complexity,
    maturity, downloads, dependents, weekly_downloads, platforms, node_version,
    python_version, requirements, readme_content, api_reference,
    categorization_confidence, categorization_reason, categorization_keywords
  ) VALUES\n`;
  
  const serverValues = coreServers.map((core: Record<string, unknown>) => {
    const extended = (extendedServers as Record<string, Record<string, unknown>>)[core.id as string] || {};
    
    const coreStats = core.stats as Record<string, unknown> || {};
    const coreLinks = core.links as Record<string, unknown> || {};
    const extendedDoc = extended.documentation as Record<string, unknown> || {};
    const extendedRepo = extended.repository as Record<string, unknown> || {};
    const extendedMeta = extended.metadata as Record<string, unknown> || {};
    const extendedQuality = extended.quality as Record<string, unknown> || {};
    const extendedQualityFactors = extendedQuality.factors as Record<string, unknown> || {};
    const extendedUsage = extended.usage as Record<string, unknown> || {};
    const extendedCompat = extended.compatibility as Record<string, unknown> || {};
    const extendedCat = extended.categorization as Record<string, unknown> || {};

    // Generate unique slug
    const uniqueSlug = makeUniqueSlug(core.slug as string, core.id as string);

    return `(${escapeString(core.id as string)}, ${escapeString(core.name as string)}, ${escapeString(core.owner as string)}, ${escapeString(uniqueSlug)}, ${escapeString(core.description as string)}, ${escapeString(core.description as string)}, ${escapeString((extended.fullDescription as string) || (core.description as string))}, ${escapeString(extended.icon as string)}, ${escapeString(core.category as string)}, ${escapeString(core.subcategory as string)}, ${core.featured || false}, ${core.verified || false}, ${escapeString(coreLinks.github as string)}, NULL, ${escapeString((extendedDoc.api as string) || (coreLinks.docs as string))}, ${escapeString(core.owner as string)}, ${escapeString((core.name as string).split('/')[1] || (core.name as string))}, ${(coreStats.stars as number) || 0}, ${(coreStats.forks as number) || 0}, ${(extendedRepo.watchers as number) || (coreStats.stars as number) || 0}, ${(extendedRepo.openIssues as number) || 0}, ${formatTimestamp(coreStats.lastUpdated as string)}, ${formatTimestamp(extendedMeta.createdAt as string)}, ${(core.qualityScore as number) || 0}, ${(extendedQualityFactors.documentation as number) || 60}, ${(extendedQualityFactors.maintenance as number) || 50}, ${(extendedQualityFactors.community as number) || 40}, ${(extendedQualityFactors.performance as number) || 85}, ${escapeString((extendedMeta.complexity as string) || 'medium')}, ${escapeString((extendedMeta.maturity as string) || 'stable')}, ${(extendedUsage.downloads as number) || ((coreStats.stars as number) * 10) || 0}, ${(extendedUsage.dependents as number) || (coreStats.forks as number) || 0}, ${(extendedUsage.weeklyDownloads as number) || Math.floor(((coreStats.stars as number) || 0) * 2) || 0}, ${escapeArray((extendedCompat.platforms as string[]) || ['web', 'desktop'])}, ${escapeString(extendedCompat.nodeVersion as string)}, ${escapeString(extendedCompat.pythonVersion as string)}, ${escapeArray(extendedCompat.requirements as string[])}, ${escapeString((extended.fullDescription as string) || (core.description as string))}, ${escapeString(extendedDoc.api as string)}, ${(extendedCat.confidence as number) || 0.8}, ${escapeString((extendedCat.reason as string) || 'Automatically categorized')}, ${escapeArray((extendedCat.matched_keywords as string[]) || [])})`;
  });
  
  sql += serverValues.join(',\n');
  sql += `\nON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description_zh_cn = EXCLUDED.description_zh_cn,
    description_en = EXCLUDED.description_en,
    full_description = EXCLUDED.full_description,
    stars = EXCLUDED.stars,
    forks = EXCLUDED.forks,
    last_updated = EXCLUDED.last_updated,
    quality_score = EXCLUDED.quality_score,
    updated_at = NOW();\n\n`;

  console.log(`✅ Generated SQL for ${coreServers.length} servers`);
  return sql;
}

function generateServerTagsSQL(): string {
  console.log('🔗 Converting server-tag relationships to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  let sql = `-- Server Tags relationships\n`;
  sql += `INSERT INTO server_tags (server_id, tag_id) 
  SELECT s.server_id, t.tag_id FROM (VALUES\n`;
  
  const serverTagValues: string[] = [];
  
  coreServers.forEach((core: Record<string, unknown>) => {
    const extended = (extendedServers as Record<string, Record<string, unknown>>)[core.id as string] || {};
    const serverTags = (extended.allTags as string[]) || (core.tags as string[]) || [];
    
    serverTags.forEach((tagName: string) => {
      serverTagValues.push(`(${escapeString(core.id as string)}, ${escapeString(tagName)})`);
    });
  });
  
  if (serverTagValues.length > 0) {
    sql += serverTagValues.join(',\n');
    sql += `\n) AS s(server_id, tag_name)
    JOIN tags t ON t.name = s.tag_name
    ON CONFLICT (server_id, tag_id) DO NOTHING;\n\n`;
  } else {
    sql += `-- No server tags to insert\n\n`;
  }

  console.log(`✅ Generated SQL for ${serverTagValues.length} server-tag relationships`);
  return sql;
}

function generateServerTechStackSQL(): string {
  console.log('⚡ Converting tech stack to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  let sql = `-- Server Tech Stack\n`;
  sql += `INSERT INTO server_tech_stack (server_id, technology) VALUES\n`;
  
  const techStackValues: string[] = [];
  
  coreServers.forEach((core: Record<string, unknown>) => {
    const extended = (extendedServers as Record<string, Record<string, unknown>>)[core.id as string] || {};
    const techStack = (extended.techStack as unknown[]) || [];
    
    techStack.forEach((tech: unknown) => {
      const techName = typeof tech === 'string' ? tech : ((tech as Record<string, unknown>).name || (tech as Record<string, unknown>).label || '');
      if (techName) {
        techStackValues.push(`(${escapeString(core.id as string)}, ${escapeString(techName as string)})`);
      }
    });
  });
  
  if (techStackValues.length > 0) {
    sql += techStackValues.join(',\n');
    sql += `\nON CONFLICT (server_id, technology) DO NOTHING;\n\n`;
  } else {
    sql += `-- No tech stack data to insert\n\n`;
  }

  console.log(`✅ Generated SQL for ${techStackValues.length} tech stack entries`);
  return sql;
}

function generateServerInstallationSQL(): string {
  console.log('📦 Converting installation data to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  let sql = `-- Server Installation\n`;
  sql += `INSERT INTO server_installation (server_id, method, command, instructions) VALUES\n`;
  
  const installationValues: string[] = [];
  
  coreServers.forEach((core: Record<string, unknown>) => {
    const extended = (extendedServers as Record<string, Record<string, unknown>>)[core.id as string] || {};
    const installation = (extended.installation as Record<string, unknown>) || {};
    
    // Handle different installation methods
    Object.entries(installation).forEach(([method, value]) => {
      if (method === 'instructions') {
        if (Array.isArray(value) && value.length > 0) {
          installationValues.push(
            `(${escapeString(core.id as string)}, 'instructions', NULL, ${escapeString(JSON.stringify(value))})`
          );
        }
      } else if (value && typeof value === 'string') {
        installationValues.push(
          `(${escapeString(core.id as string)}, ${escapeString(method)}, ${escapeString(value)}, NULL)`
        );
      }
    });
  });
  
  if (installationValues.length > 0) {
    sql += installationValues.join(',\n');
    sql += `\nON CONFLICT (server_id, method) DO UPDATE SET
      command = EXCLUDED.command,
      instructions = EXCLUDED.instructions;\n\n`;
  } else {
    sql += `-- No installation data to insert\n\n`;
  }

  console.log(`✅ Generated SQL for ${installationValues.length} installation entries`);
  return sql;
}

function generateServerDeploymentSQL(): string {
  console.log('🚀 Converting deployment data to SQL...');
  
  const coreServers = loadJsonFile('servers-core1.json');
  const extendedServers = loadJsonFile('servers-extended.json');
  
  let sql = `-- Server Deployment\n`;
  sql += `INSERT INTO server_deployment (server_id, deployment_type) VALUES\n`;
  
  const deploymentValues: string[] = [];
  
  coreServers.forEach((core: Record<string, unknown>) => {
    const extended = (extendedServers as Record<string, Record<string, unknown>>)[core.id as string] || {};
    const extendedMeta = (extended.metadata as Record<string, unknown>) || {};
    const deployment = (extendedMeta.deployment as string[]) || ['cloud', 'local'];
    
    deployment.forEach((deployType: string) => {
      deploymentValues.push(`(${escapeString(core.id as string)}, ${escapeString(deployType)})`);
    });
  });
  
  if (deploymentValues.length > 0) {
    sql += deploymentValues.join(',\n');
    sql += `\nON CONFLICT (server_id, deployment_type) DO NOTHING;\n\n`;
  } else {
    sql += `-- No deployment data to insert\n\n`;
  }

  console.log(`✅ Generated SQL for ${deploymentValues.length} deployment entries`);
  return sql;
}

function generateCompleteSQL(): string {
  let sql = `-- MCP Hub Database Data Import\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n`;
  sql += `-- This file contains all data converted from JSON files\n\n`;
  
  sql += `-- Disable triggers temporarily for faster import\n`;
  sql += `SET session_replication_role = replica;\n\n`;
  
  sql += generateCategoriesSQL();
  sql += generateTagsSQL();
  sql += generateServersSQL();
  sql += generateServerTagsSQL();
  sql += generateServerTechStackSQL();
  sql += generateServerInstallationSQL();
  sql += generateServerDeploymentSQL();
  
  sql += `-- Re-enable triggers\n`;
  sql += `SET session_replication_role = DEFAULT;\n\n`;
  
  sql += `-- Update server counts in categories\n`;
  sql += `UPDATE categories SET server_count = (
    SELECT COUNT(*) FROM mcp_servers WHERE category_id = categories.id
  );\n\n`;
  
  sql += `-- Refresh materialized views if any\n`;
  sql += `-- REFRESH MATERIALIZED VIEW IF EXISTS server_stats;\n\n`;
  
  sql += `-- Vacuum and analyze for performance\n`;
  sql += `VACUUM ANALYZE;\n\n`;
  
  sql += `-- Migration completed successfully!\n`;
  sql += `SELECT 'Migration completed!' as status,\n`;
  sql += `       (SELECT COUNT(*) FROM categories) as categories_count,\n`;
  sql += `       (SELECT COUNT(*) FROM subcategories) as subcategories_count,\n`;
  sql += `       (SELECT COUNT(*) FROM mcp_servers) as servers_count,\n`;
  sql += `       (SELECT COUNT(*) FROM tags) as tags_count,\n`;
  sql += `       (SELECT COUNT(*) FROM server_tags) as server_tags_count;\n`;
  
  return sql;
}

function main() {
  console.log('🔄 Converting JSON data to SQL...');
  
  try {
    const sql = generateCompleteSQL();
    
    // Write to file
    const outputPath = path.join(__dirname, '../supabase/data-import.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');
    
    console.log(`\n🎉 SQL file generated successfully!`);
    console.log(`📄 Output: ${outputPath}`);
    console.log(`\n📝 To import the data:`);
    console.log(`1. Copy the SQL file content`);
    console.log(`2. Paste into Supabase SQL Editor`);
    console.log(`3. Run the script`);
    console.log(`\n🔍 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('💥 Error generating SQL:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}