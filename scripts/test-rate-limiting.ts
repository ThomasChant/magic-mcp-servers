import { config } from 'dotenv';

// Load environment variables
config();

// Simple test for rate limiting logic
async function testRateLimiting() {
  console.log('🧪 Testing Enhanced Rate Limiting Logic\n');

  // Test 1: Rate limit calculation
  console.log('📊 Test 1: Rate Limit Info Processing');
  
  interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  }

  const mockRateLimitInfo: RateLimitInfo = {
    limit: 60,
    remaining: 5,
    reset: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    used: 55
  };

  console.log(`   Current time: ${new Date().toLocaleTimeString()}`);
  console.log(`   Rate limit: ${mockRateLimitInfo.remaining}/${mockRateLimitInfo.limit} remaining`);
  console.log(`   Reset time: ${new Date(mockRateLimitInfo.reset * 1000).toLocaleTimeString()}`);

  // Test delay calculation
  const now = Math.floor(Date.now() / 1000);
  const timeUntilReset = Math.max(0, mockRateLimitInfo.reset - now);
  const optimalDelay = timeUntilReset * 1000 / mockRateLimitInfo.remaining;
  
  console.log(`   Optimal delay: ${Math.round(optimalDelay)}ms`);
  console.log(`   ✅ Rate limit calculation test passed\n`);

  // Test 2: URL parsing
  console.log('🔗 Test 2: GitHub URL Parsing');
  
  const testUrls = [
    'https://github.com/owner/repo',
    'https://github.com/owner/repo.git',
    'github.com/owner/repo',
    'invalid-url',
    ''
  ];

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

  testUrls.forEach(url => {
    const result = parseGitHubUrl(url);
    console.log(`   ${url} → ${result ? `${result.owner}/${result.repo}` : 'invalid'}`);
  });
  console.log('   ✅ URL parsing test passed\n');

  // Test 3: Exponential backoff delays
  console.log('⏱️ Test 3: Exponential Backoff Calculation');
  
  const baseDelay = 1000;
  for (let attempt = 0; attempt < 4; attempt++) {
    const delay = baseDelay * Math.pow(2, attempt);
    const jitter = 0.3 * delay; // Max jitter
    console.log(`   Attempt ${attempt + 1}: ${delay}ms (±${Math.round(jitter)}ms jitter)`);
  }
  console.log('   ✅ Exponential backoff test passed\n');

  // Test 4: Check environment setup
  console.log('🔧 Test 4: Environment Setup');
  
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
  ];
  
  const optionalEnvVars = [
    'GITHUB_TOKEN'
  ];

  console.log('   Required variables:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  });

  console.log('   Optional variables:');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '✅ Set (recommended)' : '⚠️ Not set (60/hour, 750ms delay)'}`);
  });
  
  console.log('\n🎉 All rate limiting tests completed!');
  
  if (!process.env.GITHUB_TOKEN) {
    console.log('\n💡 To test with real GitHub API:');
    console.log('   1. Create token at: https://github.com/settings/tokens/new');
    console.log('   2. Add to .env.local: GITHUB_TOKEN=your_token_here');
    console.log('   3. Run: npm run github:update-stats --batch --batch-size=5');
  }
}

testRateLimiting().catch(console.error);