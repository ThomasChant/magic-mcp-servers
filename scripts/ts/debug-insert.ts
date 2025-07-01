import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testInserts() {
  console.log('🔍 Debug README Insert');
  console.log('====================\n');

  // Test 1: Very simple record
  console.log('1. Testing minimal record...');
  try {
    const { data, error } = await supabase
      .from('server_readmes')
      .insert({
        server_id: 'test_1',
        filename: 'test.md',
        project_name: 'test',
        raw_content: 'test',
        file_size: 4
      })
      .select();
    
    if (error) {
      console.log('   ❌ Failed:', error);
      console.log('   Full error object:', JSON.stringify(error, null, 2));
    } else {
      console.log('   ✅ Success:', data);
      // Clean up
      await supabase.from('server_readmes').delete().eq('server_id', 'test_1');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err);
  }

  // Test 2: Check table schema via raw SQL
  console.log('\n2. Getting table schema...');
  try {
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'server_readmes' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('   ❌ Schema query failed:', error);
    } else {
      console.log('   Table schema:');
      console.table(data);
    }
  } catch (err) {
    console.log('   Alternative schema check...');
    try {
      const { data, error } = await supabase
        .from('server_readmes')
        .select('*')
        .limit(0);
      
      if (error) {
        console.log('   ❌ Table access failed:', error);
      } else {
        console.log('   ✅ Table accessible, columns unknown');
      }
    } catch (err2) {
      console.log('   ❌ Table check failed:', err2);
    }
  }

  // Test 3: Try a real README file (smallest one)
  console.log('\n3. Testing with real README file...');
  const readmesDir = path.join(__dirname, '../public/data/reporeadmes');
  const files = fs.readdirSync(readmesDir).filter(f => f.endsWith('.md'));
  
  if (files.length > 0) {
    // Find the smallest file
    let smallestFile = '';
    let smallestSize = Infinity;
    
    for (const file of files.slice(0, 10)) { // Check first 10 files
      try {
        const filePath = path.join(readmesDir, file);
        const stats = fs.statSync(filePath);
        if (stats.size < smallestSize) {
          smallestSize = stats.size;
          smallestFile = file;
        }
      } catch (err) {
        // Skip this file
      }
    }
    
    if (smallestFile) {
      console.log(`   Testing with: ${smallestFile} (${smallestSize} bytes)`);
      
      try {
        const filePath = path.join(readmesDir, smallestFile);
        const content = fs.readFileSync(filePath, 'utf8');
        const serverId = smallestFile.replace('.md', '');
        const projectName = serverId.split('_').slice(1).join('_') || serverId;
        
        console.log(`   Server ID: ${serverId}`);
        console.log(`   Project: ${projectName}`);
        console.log(`   Content length: ${content.length}`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
        
        const { data, error } = await supabase
          .from('server_readmes')
          .insert({
            server_id: serverId,
            filename: smallestFile,
            project_name: projectName,
            raw_content: content,
            content_hash: 'test-hash',
            file_size: content.length
          })
          .select();
        
        if (error) {
          console.log('   ❌ Real file insert failed:');
          console.log('   Error message:', error.message);
          console.log('   Error code:', error.code);
          console.log('   Error details:', error.details);
          console.log('   Error hint:', error.hint);
          console.log('   Full error:', JSON.stringify(error, null, 2));
          
          // Try with shorter content
          console.log('\n   Trying with truncated content...');
          const shortContent = content.substring(0, 100);
          const { data: data2, error: error2 } = await supabase
            .from('server_readmes')
            .insert({
              server_id: serverId + '_short',
              filename: smallestFile,
              project_name: projectName,
              raw_content: shortContent,
              content_hash: 'test-hash-short',
              file_size: shortContent.length
            })
            .select();
          
          if (error2) {
            console.log('   ❌ Even short content failed:', error2.message);
          } else {
            console.log('   ✅ Short content worked! Issue is with content length/characters');
            await supabase.from('server_readmes').delete().eq('server_id', serverId + '_short');
          }
          
        } else {
          console.log('   ✅ Real file insert succeeded:', data);
          await supabase.from('server_readmes').delete().eq('server_id', serverId);
        }
        
      } catch (err) {
        console.log('   ❌ File processing failed:', err);
      }
    }
  }

  // Test 4: Check RLS status
  console.log('\n4. Checking RLS status...');
  try {
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'server_readmes';
      `
    });
    
    if (error) {
      console.log('   ❌ RLS check failed:', error);
    } else {
      console.log('   RLS status:', data);
    }
  } catch (err) {
    console.log('   ⚠️  RLS check not available');
  }
}

testInserts().catch(console.error);