import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
const escapeString = (str: string | null | undefined): string => {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
};

const generateContentHash = (content: string): string => {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
};

// Extract server ID from filename (format: owner_repo-name.md)
const extractServerIdFromFilename = (filename: string): string => {
  return filename.replace('.md', '');
};

function generateReadmeSQL(): string {
  console.log('📖 Converting README files to SQL...');
  
  const readmesDir = path.join(__dirname, '../public/data/reporeadmes');
  
  if (!fs.existsSync(readmesDir)) {
    console.log('❌ README directory not found:', readmesDir);
    return '-- No README directory found\n';
  }

  let sql = `-- Server README data\n`;
  sql += `INSERT INTO server_readmes (server_id, filename, project_name, raw_content, content_hash, file_size) VALUES\n`;
  
  const files = fs.readdirSync(readmesDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('❌ No README files found in:', readmesDir);
    return '-- No README files found\n';
  }

  const readmeValues: string[] = [];
  let processedCount = 0;
  let errorCount = 0;

  files.forEach((filename) => {
    try {
      const filePath = path.join(readmesDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const serverId = extractServerIdFromFilename(filename);
      const contentHash = generateContentHash(content);
      const fileSize = Buffer.byteLength(content, 'utf8');
      
      // Extract project name from filename (remove owner prefix)
      const projectName = filename.replace('.md', '').split('_').slice(1).join('_') || filename.replace('.md', '');
      
      readmeValues.push(
        `(${escapeString(serverId)}, ${escapeString(filename)}, ${escapeString(projectName)}, ${escapeString(content)}, ${escapeString(contentHash)}, ${fileSize})`
      );
      
      processedCount++;
      
      if (processedCount % 100 === 0) {
        console.log(`📖 Processed ${processedCount}/${files.length} README files...`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);
      errorCount++;
    }
  });

  if (readmeValues.length === 0) {
    console.log('❌ No valid README files to process');
    return '-- No valid README files to process\n';
  }

  sql += readmeValues.join(',\n');
  sql += `\nON CONFLICT (server_id) DO UPDATE SET
    filename = EXCLUDED.filename,
    project_name = EXCLUDED.project_name,
    raw_content = EXCLUDED.raw_content,
    content_hash = EXCLUDED.content_hash,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();\n\n`;

  console.log(`✅ Generated SQL for ${processedCount} README files`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} files had errors and were skipped`);
  }
  
  return sql;
}

// Main execution
async function main() {
  console.log('🔄 Converting README files to SQL...');
  
  try {
    const readmeSQL = generateReadmeSQL();
    
    // Write to SQL file
    const outputPath = path.join(__dirname, '../supabase/readme-import.sql');
    const header = `-- README Import SQL
-- Generated on ${new Date().toISOString()}
-- This file contains README content data for import into Supabase

`;
    
    fs.writeFileSync(outputPath, header + readmeSQL);
    
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('🎉 README SQL file generated successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`🔍 File size: ${fileSizeKB} KB`);
    console.log('');
    console.log('📝 To import the README data:');
    console.log('1. Copy the SQL file content');
    console.log('2. Paste into Supabase SQL Editor');
    console.log('3. Run the script');
    console.log('');
    console.log('💡 Note: This will update existing README entries and add new ones');
    
  } catch (error) {
    console.error('❌ Error generating README SQL:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateReadmeSQL };