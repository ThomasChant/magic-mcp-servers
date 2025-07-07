import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkWatchersData() {
  console.log('🔍 Checking watchers vs stars data...');
  
  try {
    // Get servers with GitHub URLs and their stats
    const { data: servers, error } = await supabase
      .from('mcp_servers')
      .select('id, name, github_url, stars, watchers, forks')
      .not('github_url', 'is', null)
      .neq('github_url', '')
      .order('stars', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch servers: ${error.message}`);
    }

    if (!servers || servers.length === 0) {
      console.log('No servers found');
      return;
    }

    console.log('\n📊 Top 20 servers by stars:');
    console.log('Name | Stars | Watchers | Forks | Stars==Watchers?');
    console.log('-----|-------|----------|-------|---------------');

    let starsEqualsWatchers = 0;
    const totalServers = servers.length;

    for (const server of servers) {
      const name = server.name.length > 20 ? server.name.substring(0, 17) + '...' : server.name;
      const stars = server.stars || 0;
      const watchers = server.watchers || 0;
      const forks = server.forks || 0;
      const isEqual = stars === watchers;
      
      if (isEqual) {
        starsEqualsWatchers++;
      }
      
      console.log(`${name.padEnd(20)} | ${String(stars).padStart(5)} | ${String(watchers).padStart(8)} | ${String(forks).padStart(5)} | ${isEqual ? 'YES' : 'NO'}`);
    }

    console.log('\n📊 Summary:');
    console.log(`Total servers checked: ${totalServers}`);
    console.log(`Servers with stars == watchers: ${starsEqualsWatchers}`);
    console.log(`Percentage: ${((starsEqualsWatchers / totalServers) * 100).toFixed(1)}%`);
    
    if (starsEqualsWatchers > totalServers * 0.8) {
      console.log('\n⚠️  WARNING: High percentage of servers have identical stars and watchers!');
      console.log('This suggests the GitHub API data might be using the wrong field.');
    }

  } catch (error) {
    console.error('💥 Error checking data:', error);
    process.exit(1);
  }
}

checkWatchersData();