import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // Optional GitHub token for higher rate limits

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.log('⚠️  No GitHub token provided. Rate limit: 60 requests/hour (750ms delay)');
  console.log('💡 Set GITHUB_TOKEN environment variable for 5,000 requests/hour (200ms delay)');
  console.log('📝 Create token at: https://github.com/settings/tokens/new');
  console.log('🔑 Required scopes: public_repo (for public repositories)\n');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface GitHubRepo {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  subscribers_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
}

interface GitHubStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  lastUpdated: string;
  createdAt: string;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

interface GitHubApiResponse {
  data: GitHubRepo | null;
  rateLimitInfo: RateLimitInfo;
  success: boolean;
  error?: string;
}

// Enhanced rate limiting class
class GitHubRateLimiter {
  private rateLimitInfo: RateLimitInfo | null = null;
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private maxConcurrent = 1; // GitHub recommends sequential requests
  private baseDelay = 2000; // 0.75 second base delay
  private maxRetries = 3;

  constructor(private hasToken: boolean) {
    this.baseDelay = hasToken ? 750 : 2000; // 200ms with token, 750ms without
  }

  // Calculate delay based on remaining rate limit
  private calculateDelay(): number {
    if (!this.rateLimitInfo) {
      return this.baseDelay;
    }

    const { remaining, reset } = this.rateLimitInfo;
    const now = Math.floor(Date.now() / 1000);
    const resetTime = reset;
    const timeUntilReset = Math.max(0, resetTime - now);

    // If we're close to rate limit, calculate optimal delay
    if (remaining < 10) {
      // Spread remaining requests over time until reset
      const optimalDelay = Math.max(this.baseDelay, (timeUntilReset * 1000) / remaining);
      console.log(`⚠️  Low rate limit: ${remaining} requests remaining, using ${Math.round(optimalDelay)}ms delay`);
      return optimalDelay;
    }

    // Normal operation
    return this.baseDelay;
  }

  // Wait for rate limit reset if needed
  private async waitForRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) return;

    const { remaining, reset } = this.rateLimitInfo;
    if (remaining <= 0) {
      const now = Math.floor(Date.now() / 1000);
      const waitTime = Math.max(0, reset - now + 1) * 1000; // Add 1 second buffer
      if (waitTime > 0) {
        console.log(`🕐 Rate limit exceeded. Waiting ${Math.round(waitTime / 1000)}s until reset...`);
        await this.sleep(waitTime);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Update rate limit info from GitHub API headers
  updateRateLimitInfo(headers: Headers): void {
    this.rateLimitInfo = {
      limit: parseInt(headers.get('x-ratelimit-limit') || '0'),
      remaining: parseInt(headers.get('x-ratelimit-remaining') || '0'),
      reset: parseInt(headers.get('x-ratelimit-reset') || '0'),
      used: parseInt(headers.get('x-ratelimit-used') || '0')
    };
  }

  // Get current rate limit status
  getRateLimitStatus(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  // Execute request with rate limiting
  async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    await this.waitForRateLimit();
    const delay = this.calculateDelay();
    await this.sleep(delay);
    return await requestFn();
  }
}

// Global rate limiter instance
const rateLimiter = new GitHubRateLimiter(!!GITHUB_TOKEN);

// Rate limiting helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Parse GitHub URL to extract owner and repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+)/,
    /github\.com\/([^/]+)\/([^/]+)\.git/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
      };
    }
  }
  
  return null;
}

// Exponential backoff retry helper
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
      const totalDelay = delay + jitter;
      
      console.log(`🔄 Retry ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms...`);
      await sleep(totalDelay);
    }
  }
  
  throw lastError!;
}

// Enhanced GitHub API request with rate limiting
async function fetchGitHubStatsWithRateLimit(owner: string, repo: string): Promise<GitHubApiResponse> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MCP-Hub-Stats-Updater'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return await rateLimiter.executeRequest(async () => {
    return await exponentialBackoff(async () => {
      console.log(`📊 Fetching stats for ${owner}/${repo}...`);
      
      const response = await fetch(url, { headers });
      
      // Update rate limit info from headers
      rateLimiter.updateRateLimitInfo(response.headers);
      
      // Log rate limit status
      const rateLimitStatus = rateLimiter.getRateLimitStatus();
      if (rateLimitStatus) {
        console.log(`📊 Rate limit: ${rateLimitStatus.remaining}/${rateLimitStatus.limit} remaining`);
      }
      
      if (response.status === 404) {
        console.warn(`⚠️  Repository ${owner}/${repo} not found (404)`);
        return {
          data: null,
          rateLimitInfo: rateLimitStatus!,
          success: false,
          error: 'Repository not found'
        };
      }
      
      if (response.status === 403) {
        const resetTime = response.headers.get('x-ratelimit-reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : 'unknown';
        console.warn(`⚠️  Rate limited for ${owner}/${repo} (403). Reset at: ${resetDate}`);
        throw new Error('Rate limited');
      }
      
      if (response.status === 401) {
        console.error(`🔒 Authentication failed for ${owner}/${repo}. Check GitHub token.`);
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        console.error(`❌ GitHub API error for ${owner}/${repo}: ${response.status} ${response.statusText}`);
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data: GitHubRepo = await response.json();
      
      return {
        data,
        rateLimitInfo: rateLimitStatus!,
        success: true
      };
    }, 3, 2000); // 3 retries with 2s base delay
  });
}

// Fetch GitHub repository stats (wrapper for backward compatibility)
async function fetchGitHubStats(owner: string, repo: string): Promise<GitHubStats | null> {
  try {
    const response = await fetchGitHubStatsWithRateLimit(owner, repo);
    
    if (!response.success || !response.data) {
      return null;
    }
    
    const data = response.data;
    
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.subscribers_count || 0, // subscribers_count is the actual watchers
      openIssues: data.open_issues_count || 0,
      lastUpdated: data.pushed_at || data.updated_at,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error(`❌ Error fetching stats for ${owner}/${repo}:`, error);
    return null;
  }
}

// Update server stats in database
async function updateServerStats(serverId: string, stats: GitHubStats): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mcp_servers')
      .update({
        stars: stats.stars,
        forks: stats.forks,
        watchers: stats.watchers,
        open_issues: stats.openIssues,
        last_updated: stats.lastUpdated,
        repo_created_at: stats.createdAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', serverId);

    if (error) {
      console.error(`Failed to update stats for server ${serverId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating server ${serverId}:`, error);
    return false;
  }
}

// Main function to update all GitHub stats
async function updateAllGitHubStats() {
  console.log('🚀 Starting GitHub stats update...');
  
  try {
    // Fetch all servers with GitHub URLs (with pagination to avoid 1000 record limit)
    const pageSize = 1000;
    let allServers: Array<{
      id: string;
      name: string;
      github_url: string;
      repository_owner: string;
      repository_name: string;
    }> = [];
    let page = 0;
    let hasMore = true;

    console.log('开始分页获取服务器数据...');

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data: servers, error, count } = await supabase
        .from('mcp_servers')
        .select('id, name, github_url, repository_owner, repository_name', { count: 'exact' })
        .not('github_url', 'is', null)
        .neq('github_url', '')
        .range(from, to);

      if (error) {
        throw new Error(`Failed to fetch servers (page ${page + 1}): ${error.message}`);
      }

      if (servers && servers.length > 0) {
        allServers = [...allServers, ...servers];
        console.log(`获取第 ${page + 1} 页，本页 ${servers.length} 条，累计 ${allServers.length} 条`);
      }

      // 检查是否还有更多数据
      hasMore = servers && servers.length === pageSize && (!count || allServers.length < count);
      page++;
    }

    if (!allServers || allServers.length === 0) {
      console.log('No servers with GitHub URLs found');
      return;
    }

    console.log(`Found ${allServers.length} servers with GitHub URLs`);

    let updated = 0;
    let failed = 0;
    let notFound = 0;
    let processed = 0;

    console.log('\n🎯 Starting enhanced rate-limited processing...\n');

    for (const server of allServers) {
      processed++;
      const progress = `[${processed}/${allServers.length}]`;
      console.log(`\n${progress} Processing: ${server.name}`);
      
      try {
        const repoInfo = parseGitHubUrl(server.github_url);
        
        if (!repoInfo) {
          console.warn(`⚠️  Invalid GitHub URL for server ${server.id}: ${server.github_url}`);
          failed++;
          continue;
        }

        // Show current rate limit status
        const rateLimitStatus = rateLimiter.getRateLimitStatus();
        if (rateLimitStatus && rateLimitStatus.remaining <= 5) {
          console.log(`⚠️  Low rate limit: ${rateLimitStatus.remaining}/${rateLimitStatus.limit} remaining`);
        }

        const stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);
        
        if (!stats) {
          console.log(`🚫 Repository ${repoInfo.owner}/${repoInfo.repo} not found or accessible`);
          notFound++;
          continue;
        }

        const success = await updateServerStats(server.id, stats);
        
        if (success) {
          updated++;
          console.log(`✅ Updated ${server.name}: ⭐${stats.stars} 🍴${stats.forks} 👀${stats.watchers}`);
        } else {
          failed++;
          console.log(`❌ Failed to save stats for ${server.name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing server ${server.id} (${server.name}):`, error);
        failed++;
      }

      // Show progress every 10 servers
      if (processed % 10 === 0) {
        console.log(`\n📊 Progress: ${processed}/${servers.length} processed (${updated} updated, ${failed} failed, ${notFound} not found)`);
        const rateLimitStatus = rateLimiter.getRateLimitStatus();
        if (rateLimitStatus) {
          console.log(`🔄 Rate limit: ${rateLimitStatus.remaining}/${rateLimitStatus.limit} remaining`);
        }
      }
    }

    // Final rate limit status
    const finalRateLimitStatus = rateLimiter.getRateLimitStatus();
    
    console.log('\n🎉 GitHub stats update completed!');
    console.log('\n📊 Results Summary:');
    console.log(`✅ Updated: ${updated} servers`);
    console.log(`❌ Failed: ${failed} servers`);
    console.log(`🚫 Not found: ${notFound} servers`);
    console.log(`📊 Total processed: ${processed} servers`);
    
    if (finalRateLimitStatus) {
      console.log('\n🔄 Final Rate Limit Status:');
      console.log(`   Remaining: ${finalRateLimitStatus.remaining}/${finalRateLimitStatus.limit}`);
      console.log(`   Used: ${finalRateLimitStatus.used}`);
      if (finalRateLimitStatus.reset) {
        const resetTime = new Date(finalRateLimitStatus.reset * 1000).toLocaleTimeString();
        console.log(`   Resets at: ${resetTime}`);
      }
    }
    
    if (!GITHUB_TOKEN) {
      console.log('\n💡 Performance Tips:');
      console.log('   • Set GITHUB_TOKEN for 83x higher rate limits (5,000/hour vs 60/hour)');
      console.log('   • Create token at: https://github.com/settings/tokens/new');
      console.log('   • Required scope: public_repo');
    }
    
    if (updated > 0) {
      console.log('\n🚀 Next steps:');
      console.log('   • View updated stats in your MCP Hub application');
      console.log('   • Consider scheduling regular updates (daily/weekly)');
      console.log('   • Monitor rate limit usage for optimal timing');
    }

  } catch (error) {
    console.error('💥 Update failed:', error);
    process.exit(1);
  }
}

// Add batch processing function for large datasets
async function updateGitHubStatsBatch(batchSize: number = 50, startIndex: number = 0) {
  console.log(`🚀 Starting batch GitHub stats update (batch size: ${batchSize}, starting at: ${startIndex})...`);
  
  try {
    const { data: servers, error } = await supabase
      .from('mcp_servers')
      .select('id, name, github_url, repository_owner, repository_name')
      .not('github_url', 'is', null)
      .neq('github_url', '')
      .range(startIndex, startIndex + batchSize - 1);

    if (error) {
      throw new Error(`Failed to fetch servers: ${error.message}`);
    }

    if (!servers || servers.length === 0) {
      console.log('No more servers to process in this batch');
      return { completed: true, processed: 0 };
    }

    console.log(`Processing batch: ${servers.length} servers (${startIndex + 1} to ${startIndex + servers.length})`);
    
    // Process the batch (reuse existing logic)
    let updated = 0;
    let failed = 0;
    let notFound = 0;

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];
      console.log(`\n[${i + 1}/${servers.length}] Batch processing: ${server.name}`);
      
      try {
        const repoInfo = parseGitHubUrl(server.github_url);
        if (!repoInfo) {
          failed++;
          continue;
        }

        const stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);
        if (!stats) {
          notFound++;
          continue;
        }

        const success = await updateServerStats(server.id, stats);
        if (success) {
          updated++;
          console.log(`✅ Batch updated ${server.name}: ⭐${stats.stars} 🍴${stats.forks} 👀${stats.watchers}`);
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`❌ Batch error for ${server.name}:`, error);
        failed++;
      }
    }

    return {
      completed: servers.length < batchSize,
      processed: servers.length,
      updated,
      failed,
      notFound
    };

  } catch (error) {
    console.error('💥 Batch update failed:', error);
    throw error;
  }
}

// Command line options
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const batchMode = args.includes('--batch');
const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '50');
const specific = args.find(arg => arg.startsWith('--server='))?.split('=')[1];
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log('🚀 GitHub Stats Updater - Enhanced Rate Limited Version\n');
  console.log('Usage: npm run github:update-stats [options]\n');
  console.log('Options:');
  console.log('  --dry-run              Simulate updates without changing database');
  console.log('  --batch                Process in batches (recommended for large datasets)');
  console.log('  --batch-size=N         Set batch size (default: 50)');
  console.log('  --server=<id>          Update specific server only');
  console.log('  --help, -h             Show this help message\n');
  console.log('Environment Variables:');
  console.log('  GITHUB_TOKEN           GitHub Personal Access Token (recommended)');
  console.log('  VITE_SUPABASE_URL      Supabase project URL');
  console.log('  SUPABASE_SERVICE_KEY   Supabase service key\n');
  console.log('Rate Limits:');
  console.log('  Without token: 60 requests/hour (750ms delay)');
  console.log('  With token: 5,000 requests/hour (200ms delay)\n');
  process.exit(0);
}

if (dryRun) {
  console.log('🔍 Dry run mode - will not update database');
}

if (batchMode) {
  console.log(`📦 Batch mode enabled (batch size: ${batchSize})`);
}

if (specific) {
  console.log(`🎯 Updating specific server: ${specific}`);
}

// Export for use as module
export { updateAllGitHubStats, fetchGitHubStats, updateServerStats, parseGitHubUrl, updateGitHubStatsBatch };

// Main execution function
async function main() {
  if (help) {
    return; // Help already shown above
  }

  try {
    if (batchMode) {
      console.log('\n🔄 Starting batch processing mode...');
      let startIndex = 0;
      let totalUpdated = 0;
      let totalFailed = 0;
      let totalNotFound = 0;
      let batchNumber = 1;

      while (true) {
        console.log(`\n📦 Processing batch ${batchNumber}...`);
        const result = await updateGitHubStatsBatch(batchSize, startIndex);
        
        totalUpdated += result.updated || 0;
        totalFailed += result.failed || 0;
        totalNotFound += result.notFound || 0;
        
        console.log(`✅ Batch ${batchNumber} completed: ${result.updated} updated, ${result.failed} failed, ${result.notFound} not found`);
        
        if (result.completed) {
          console.log('\n🏁 All batches completed!');
          break;
        }
        
        startIndex += batchSize;
        batchNumber++;
        
        // Pause between batches to be respectful to API
        console.log('⏸️  Pausing 5 seconds between batches...');
        await sleep(5000);
      }
      
      console.log('\n🎉 Batch processing summary:');
      console.log(`📊 Total updated: ${totalUpdated}`);
      console.log(`❌ Total failed: ${totalFailed}`);
      console.log(`🚫 Total not found: ${totalNotFound}`);
      
    } else if (specific) {
      console.log(`\n🎯 Processing specific server: ${specific}`);
      
      // Find and update specific server
      const { data: servers, error } = await supabase
        .from('mcp_servers')
        .select('id, name, github_url')
        .eq('id', specific)
        .single();
        
      if (error || !servers) {
        console.error(`❌ Server not found: ${specific}`);
        process.exit(1);
      }
      
      const repoInfo = parseGitHubUrl(servers.github_url);
      if (!repoInfo) {
        console.error(`❌ Invalid GitHub URL: ${servers.github_url}`);
        process.exit(1);
      }
      
      const stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);
      if (!stats) {
        console.error(`❌ Could not fetch stats for ${repoInfo.owner}/${repoInfo.repo}`);
        process.exit(1);
      }
      
      if (!dryRun) {
        const success = await updateServerStats(servers.id, stats);
        if (success) {
          console.log(`✅ Updated ${servers.name}: ⭐${stats.stars} 🍴${stats.forks} 👀${stats.watchers}`);
        } else {
          console.error(`❌ Failed to update database for ${servers.name}`);
          process.exit(1);
        }
      } else {
        console.log(`🔍 Would update ${servers.name}: ⭐${stats.stars} 🍴${stats.forks} 👀${stats.watchers}`);
      }
      
    } else {
      // Regular full update mode
      await updateAllGitHubStats();
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}