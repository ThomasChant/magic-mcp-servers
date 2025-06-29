import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkStats() {
  // Check servers with updated stats
  const { data: updatedServers } = await supabase
    .from('mcp_servers')
    .select('name, stars, forks, watchers, last_updated')
    .gt('stars', 0)
    .order('stars', { ascending: false })
    .limit(10);

  console.log('Servers with GitHub stats:');
  updatedServers?.forEach((server, index) => {
    console.log(`${index + 1}. ${server.name}: ${server.stars} stars, ${server.forks} forks, ${server.watchers} watchers`);
  });

  // Check total count of servers with/without stats
  const { count: totalServers } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true });

  const { count: serversWithStats } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true })
    .gt('stars', 0);

  console.log(`\nSummary: ${serversWithStats}/${totalServers} servers have GitHub stats`);
}

checkStats().catch(console.error);