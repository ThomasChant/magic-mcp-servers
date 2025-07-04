import { config } from 'dotenv';

// Load environment variables
config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

async function testGitHubAPI() {
  console.log('🔍 Testing GitHub API response...');
  
  // Test with a popular repository
  const testRepo = 'netdata/netdata';
  const [owner, repo] = testRepo.split('/');
  
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MCP-Hub-Stats-Updater'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    console.log('✅ Using GitHub token');
  } else {
    console.log('⚠️  No GitHub token provided');
  }
  
  try {
    console.log(`📊 Fetching data for ${testRepo}...`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`❌ GitHub API error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📋 GitHub API Response Fields:');
    console.log(`Repository: ${data.full_name}`);
    console.log(`Stars (stargazers_count): ${data.stargazers_count}`);
    console.log(`Watchers (watchers_count): ${data.watchers_count}`);
    console.log(`Subscribers (subscribers_count): ${data.subscribers_count}`);
    console.log(`Forks (forks_count): ${data.forks_count}`);
    console.log(`Open Issues (open_issues_count): ${data.open_issues_count}`);
    
    console.log('\n🔍 Analysis:');
    console.log(`stargazers_count === watchers_count: ${data.stargazers_count === data.watchers_count}`);
    console.log(`subscribers_count (real watchers): ${data.subscribers_count}`);
    
    if (data.stargazers_count === data.watchers_count) {
      console.log('⚠️  GitHub API bug: watchers_count equals stargazers_count');
      console.log('✅ Use subscribers_count for actual watchers');
    }
    
  } catch (error) {
    console.error('💥 Error fetching GitHub data:', error);
  }
}

testGitHubAPI();