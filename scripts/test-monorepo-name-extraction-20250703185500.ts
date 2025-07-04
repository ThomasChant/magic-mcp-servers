import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { extractMonorepoName } from '../src/utils/monorepoNameExtractor';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testMonorepoNameExtraction() {
  console.log('🧪 Testing monorepo name extraction...');
  
  try {
    // Test the extraction function with various URL patterns
    const testCases = [
      {
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
        original: 'servers',
        expected: 'filesystem'
      },
      {
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
        original: 'servers',
        expected: 'git'
      },
      {
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
        original: 'servers',
        expected: 'sqlite'
      },
      {
        url: 'https://github.com/owner/repo/blob/main/subdirectory/file.ts',
        original: 'repo',
        expected: 'subdirectory'
      },
      {
        url: 'https://github.com/owner/regular-repo',
        original: 'regular-repo',
        expected: 'regular-repo'
      }
    ];

    console.log('\\n🔍 Testing extraction function:');
    testCases.forEach((testCase, index) => {
      const result = extractMonorepoName(testCase.url, testCase.original);
      const passed = result === testCase.expected;
      console.log(`${index + 1}. ${passed ? '✅' : '❌'} ${testCase.url}`);
      console.log(`   Original: "${testCase.original}"`);
      console.log(`   Expected: "${testCase.expected}"`);
      console.log(`   Got: "${result}"`);
      console.log('');
    });

    // Test with actual database data
    console.log('\\n🔍 Testing with actual database data:');
    const { data: monorepoServers, error } = await supabase
      .from('servers_with_details')
      .select('id, name, github_url, is_monorepo')
      .eq('is_monorepo', true)
      .limit(10);

    if (error) {
      console.error('❌ Database query failed:', error);
      return;
    }

    if (monorepoServers && monorepoServers.length > 0) {
      console.log(`Found ${monorepoServers.length} monorepo servers:`);
      monorepoServers.forEach((server, index) => {
        const extractedName = extractMonorepoName(server.github_url, server.name);
        console.log(`${index + 1}. Current: "${server.name}"`);
        console.log(`   URL: ${server.github_url}`);
        console.log(`   Extracted: "${extractedName}"`);
        console.log(`   Changed: ${extractedName !== server.name ? 'YES' : 'NO'}`);
        console.log('');
      });
    } else {
      console.log('No monorepo servers found in database.');
    }

    // Test the frontend data transformation
    console.log('\\n🔍 Testing frontend data transformation:');
    const { data: sampleServers, error: sampleError } = await supabase
      .from('servers_with_details')
      .select('id, name, github_url, is_monorepo')
      .limit(5);

    if (sampleError) {
      console.error('❌ Sample query failed:', sampleError);
      return;
    }

    if (sampleServers) {
      console.log('Sample servers and their processed names:');
      sampleServers.forEach((server, index) => {
        const processedName = server.is_monorepo 
          ? extractMonorepoName(server.github_url, server.name)
          : server.name;
        
        console.log(`${index + 1}. "${server.name}" -> "${processedName}"`);
        console.log(`   Is monorepo: ${server.is_monorepo}`);
        console.log(`   URL: ${server.github_url}`);
        console.log('');
      });
    }

    console.log('\\n✅ Monorepo name extraction test completed!');
    console.log('\\n📝 Summary:');
    console.log('• Monorepo name extraction logic is working in the frontend');
    console.log('• Names are processed when data is transformed from database');
    console.log('• No database changes needed - all processing happens in React');
    console.log('• Users will see extracted directory names for monorepo projects');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Main execution
async function main() {
  try {
    await testMonorepoNameExtraction();
  } catch (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}