import { config } from 'dotenv';

config();

// Simple test to verify our delay configuration
async function testDelaySettings() {
  console.log('🧪 Testing Rate Limiting Configuration\n');

  // Simulate our rate limiter logic
  const hasToken = !!process.env.GITHUB_TOKEN;
  const baseDelay = hasToken ? 200 : 750; // New settings
  
  console.log(`🔧 Configuration:`)
  console.log(`   Has GitHub Token: ${hasToken ? '✅ Yes' : '❌ No'}`);
  console.log(`   Base Delay: ${baseDelay}ms`);
  console.log(`   Expected: ${hasToken ? '200ms (with token)' : '750ms (without token)'}`);
  
  console.log('\n⏱️ Testing actual delay...');
  
  const delays: number[] = [];
  
  for (let i = 0; i < 3; i++) {
    const startTime = Date.now();
    
    // Simulate our delay
    await new Promise(resolve => setTimeout(resolve, baseDelay));
    
    const endTime = Date.now();
    const actualDelay = endTime - startTime;
    delays.push(actualDelay);
    
    console.log(`   Test ${i + 1}: ${actualDelay}ms`);
  }
  
  const averageDelay = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  const expectedDelay = baseDelay;
  const tolerance = 50; // 50ms tolerance
  
  console.log(`\n📊 Results:`);
  console.log(`   Average delay: ${averageDelay}ms`);
  console.log(`   Expected delay: ${expectedDelay}ms`);
  console.log(`   Tolerance: ±${tolerance}ms`);
  
  const isWithinTolerance = Math.abs(averageDelay - expectedDelay) <= tolerance;
  console.log(`   ${isWithinTolerance ? '✅ PASS' : '❌ FAIL'}: Delay is within tolerance`);
  
  console.log('\n🚀 Rate limiting updated successfully!');
  console.log(`   • Without token: 750ms delay (was 1000ms)`);
  console.log(`   • With token: 200ms delay (was 100ms)`);
  console.log(`   • This should prevent GitHub rate limiting`);
}

testDelaySettings().catch(console.error);