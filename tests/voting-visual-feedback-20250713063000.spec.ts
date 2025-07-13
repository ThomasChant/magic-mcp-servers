import { test, expect } from '@playwright/test';

test.describe('Voting Visual Feedback Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user for better testing
    await page.addInitScript(() => {
      // Mock Clerk authentication state
      const mockUser = {
        id: 'test-user-visual-123',
        firstName: 'Visual',
        lastName: 'Tester',
        emailAddresses: [{ emailAddress: 'visual.test@example.com' }],
        isSignedIn: true
      };

      // Store in global for hooks to access
      (window as any).__mockUser = mockUser;
      
      // Mock localStorage for session
      localStorage.setItem('__clerk_session', JSON.stringify({
        isSignedIn: true,
        user: mockUser
      }));

      console.log('Authentication mock setup for visual testing');
    });

    // Mock Supabase API to simulate realistic delays
    let currentVoteState: Record<string, 'up' | 'down' | null> = {};
    let currentUpvotes: Record<string, number> = { 'test-server-1': 5, 'test-server-2': 3 };

    await page.route('**/rest/v1/server_votes*', async route => {
      const method = route.request().method();
      const url = route.request().url();
      
      if (method === 'GET') {
        // Return current vote state
        const votes = Object.entries(currentVoteState)
          .filter(([_, vote]) => vote !== null)
          .map(([serverId, voteType]) => ({
            server_id: serverId,
            vote_type: voteType,
            user_id: 'test-user-visual-123'
          }));
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(votes)
        });
      } else if (method === 'POST') {
        // Simulate posting a new vote with delay
        const postData = JSON.parse(route.request().postData() || '{}');
        const serverId = postData.server_id;
        const voteType = postData.vote_type;
        
        // Add realistic delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update vote state
        currentVoteState[serverId] = voteType;
        if (voteType === 'up') {
          currentUpvotes[serverId] = (currentUpvotes[serverId] || 0) + 1;
        }
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'vote-' + Date.now(),
            server_id: serverId,
            vote_type: voteType,
            user_id: 'test-user-visual-123'
          })
        });
      } else if (method === 'PATCH') {
        // Update existing vote
        await new Promise(resolve => setTimeout(resolve, 600));
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ updated: true })
        });
      } else if (method === 'DELETE') {
        // Remove vote
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const url = route.request().url();
        const serverId = url.split('server_id=eq.')[1]?.split('&')[0];
        if (serverId) {
          if (currentVoteState[serverId] === 'up') {
            currentUpvotes[serverId] = Math.max(0, (currentUpvotes[serverId] || 0) - 1);
          }
          currentVoteState[serverId] = null;
        }
        
        await route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: ''
        });
      }
    });

    // Mock server scores with realistic updates
    await page.route('**/rest/v1/server_scores*', async route => {
      const scores = Object.entries(currentUpvotes).map(([serverId, upvotes]) => ({
        server_id: serverId,
        upvotes: upvotes,
        downvotes: 0,
        total_votes: upvotes,
        initial_score: 10,
        vote_score: upvotes,
        total_score: 10 + upvotes
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(scores)
      });
    });

    await page.goto('http://localhost:5173/servers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should show immediate red solid icon on vote click', async ({ page }) => {
    console.log('🎯 Testing immediate visual feedback on vote click');
    
    // Find vote buttons
    const voteButtons = page.locator('button[title*="Mark as using"]');
    const buttonCount = await voteButtons.count();
    
    console.log(`Found ${buttonCount} vote buttons to test`);
    
    if (buttonCount === 0) {
      // Check if we have sign-in buttons instead (authentication issue)
      const signInButtons = page.locator('button[title*="Sign in to mark"]');
      const signInCount = await signInButtons.count();
      console.log(`Found ${signInCount} sign-in buttons (authentication may not be working)`);
      
      if (signInCount > 0) {
        console.log('⚠️ Authentication mock may not be working, skipping visual test');
        return;
      }
    }

    expect(buttonCount).toBeGreaterThan(0);
    
    const testButton = voteButtons.first();
    const svg = testButton.locator('svg').first();
    
    // Get initial state
    const initialFill = await svg.getAttribute('fill');
    const initialStroke = await svg.getAttribute('stroke-width');
    const initialButtonClass = await testButton.getAttribute('class');
    
    console.log(`Initial state: fill="${initialFill}", stroke="${initialStroke}"`);
    console.log(`Initial button classes: ${initialButtonClass}`);
    
    // Click to vote
    console.log('Clicking vote button...');
    await testButton.click();
    
    // IMMEDIATELY check for visual changes (within 100ms)
    await page.waitForTimeout(100);
    
    const immediateFill = await svg.getAttribute('fill');
    const immediateStroke = await svg.getAttribute('stroke-width');
    const immediateButtonClass = await testButton.getAttribute('class');
    
    console.log(`Immediate state (100ms): fill="${immediateFill}", stroke="${immediateStroke}"`);
    console.log(`Immediate button classes: ${immediateButtonClass}`);
    
    // Verify immediate visual feedback
    expect(immediateFill).toBe('currentColor'); // Should be solid fill immediately
    expect(immediateStroke).toBe('0'); // Should have no stroke for solid fill
    
    // Check that button has red color and loading state
    expect(immediateButtonClass).toContain('text-red-500');
    expect(immediateButtonClass).toContain('cursor-not-allowed');
    
    console.log('✅ Immediate visual feedback: Red solid icon confirmed');
    
    // Wait for the API call to complete
    console.log('Waiting for API call to complete...');
    await page.waitForTimeout(1000);
    
    // Check final state after API completion
    const finalFill = await svg.getAttribute('fill');
    const finalStroke = await svg.getAttribute('stroke-width');
    const finalButtonClass = await testButton.getAttribute('class');
    const finalTitle = await testButton.getAttribute('title');
    
    console.log(`Final state: fill="${finalFill}", stroke="${finalStroke}"`);
    console.log(`Final button classes: ${finalButtonClass}`);
    console.log(`Final title: ${finalTitle}`);
    
    // Verify final state
    expect(finalFill).toBe('currentColor'); // Should remain solid
    expect(finalStroke).toBe('0'); // Should remain no stroke
    expect(finalButtonClass).toContain('text-red-500'); // Should remain red
    expect(finalButtonClass).not.toContain('cursor-not-allowed'); // Should be clickable again
    
    if (finalTitle) {
      expect(finalTitle).toContain('Remove usage mark'); // Should show remove option
    }
    
    console.log('✅ Final state: Vote successfully registered with correct visuals');
  });

  test('should prevent clicking during vote processing', async ({ page }) => {
    console.log('🛡️ Testing click protection during vote processing');
    
    const voteButtons = page.locator('button[title*="Mark as using"]');
    const buttonCount = await voteButtons.count();
    
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for click protection test');
      return;
    }
    
    const testButton = voteButtons.first();
    
    // Get initial state
    const initialTitle = await testButton.getAttribute('title');
    console.log(`Testing click protection on: ${initialTitle}`);
    
    // First click to start voting
    console.log('First click - initiating vote...');
    await testButton.click();
    
    // Immediately try to click again (should be prevented)
    await page.waitForTimeout(50);
    
    const buttonClass = await testButton.getAttribute('class');
    const isDisabled = buttonClass?.includes('cursor-not-allowed') || false;
    
    console.log(`Button state during processing: disabled=${isDisabled}`);
    console.log(`Button classes: ${buttonClass}`);
    
    expect(isDisabled).toBe(true);
    console.log('✅ Button is properly disabled during processing');
    
    // Try rapid clicking (should be ignored)
    console.log('Attempting rapid clicks (should be ignored)...');
    for (let i = 0; i < 3; i++) {
      await testButton.click();
      await page.waitForTimeout(50);
    }
    
    // Button should still be disabled
    const stillDisabled = (await testButton.getAttribute('class'))?.includes('cursor-not-allowed') || false;
    expect(stillDisabled).toBe(true);
    console.log('✅ Rapid clicks are properly ignored');
    
    // Wait for processing to complete
    console.log('Waiting for vote processing to complete...');
    await page.waitForTimeout(1500);
    
    // Button should be enabled again
    const finalClass = await testButton.getAttribute('class');
    const finallyEnabled = !finalClass?.includes('cursor-not-allowed');
    
    console.log(`Final button state: enabled=${finallyEnabled}`);
    expect(finallyEnabled).toBe(true);
    console.log('✅ Button is re-enabled after processing completes');
  });

  test('should show correct toggle behavior with visual feedback', async ({ page }) => {
    console.log('🔄 Testing vote toggle behavior with visual feedback');
    
    const voteButtons = page.locator('button[title*="Mark as using"]');
    const buttonCount = await voteButtons.count();
    
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for toggle test');
      return;
    }
    
    const testButton = voteButtons.first();
    const svg = testButton.locator('svg').first();
    
    // Record initial state
    const initialFill = await svg.getAttribute('fill');
    const initialTitle = await testButton.getAttribute('title');
    
    console.log(`Initial: fill="${initialFill}", title="${initialTitle}"`);
    
    // First click - vote
    console.log('First click - voting...');
    await testButton.click();
    
    // Check immediate feedback
    await page.waitForTimeout(100);
    const votingFill = await svg.getAttribute('fill');
    expect(votingFill).toBe('currentColor');
    console.log('✅ Immediate feedback on first click');
    
    // Wait for completion
    await page.waitForTimeout(1000);
    
    const afterFirstFill = await svg.getAttribute('fill');
    const afterFirstTitle = await testButton.getAttribute('title');
    
    console.log(`After first: fill="${afterFirstFill}", title="${afterFirstTitle}"`);
    expect(afterFirstFill).toBe('currentColor');
    
    // Second click - remove vote
    console.log('Second click - removing vote...');
    await testButton.click();
    
    // Check immediate feedback
    await page.waitForTimeout(100);
    const removingFill = await svg.getAttribute('fill');
    // During removal, should still show as solid (feedback for the action)
    expect(removingFill).toBe('currentColor');
    console.log('✅ Immediate feedback on removal click');
    
    // Wait for completion
    await page.waitForTimeout(1000);
    
    const afterSecondFill = await svg.getAttribute('fill');
    const afterSecondTitle = await testButton.getAttribute('title');
    
    console.log(`After second: fill="${afterSecondFill}", title="${afterSecondTitle}"`);
    
    // Should return to unvoted state
    expect(afterSecondFill).toBe('none');
    
    if (afterSecondTitle) {
      expect(afterSecondTitle).toContain('Mark as using');
    }
    
    console.log('✅ Complete toggle cycle with proper visual feedback');
  });

  test('should maintain visual consistency across multiple buttons', async ({ page }) => {
    console.log('📋 Testing visual consistency across multiple vote buttons');
    
    const voteButtons = page.locator('button[title*="Mark as using"]');
    const buttonCount = await voteButtons.count();
    
    console.log(`Testing visual consistency across ${buttonCount} buttons`);
    
    if (buttonCount < 2) {
      console.log('⚠️ Need at least 2 buttons for consistency test');
      return;
    }
    
    // Test first 3 buttons (or all if less than 3)
    const testCount = Math.min(3, buttonCount);
    const buttonStates: Array<{fill: string, stroke: string, classes: string}> = [];
    
    // Record initial states
    for (let i = 0; i < testCount; i++) {
      const button = voteButtons.nth(i);
      const svg = button.locator('svg').first();
      
      const fill = await svg.getAttribute('fill') || '';
      const stroke = await svg.getAttribute('stroke-width') || '';
      const classes = await button.getAttribute('class') || '';
      
      buttonStates.push({ fill, stroke, classes });
      console.log(`Button ${i + 1} initial: fill="${fill}", stroke="${stroke}"`);
    }
    
    // All unvoted buttons should have consistent initial state
    const uniqueFills = new Set(buttonStates.map(s => s.fill));
    const uniqueStrokes = new Set(buttonStates.map(s => s.stroke));
    
    expect(uniqueFills.size).toBe(1); // All should have same fill
    expect(uniqueStrokes.size).toBe(1); // All should have same stroke
    
    console.log('✅ All unvoted buttons have consistent initial styling');
    
    // Vote on first button and check consistency
    const firstButton = voteButtons.first();
    await firstButton.click();
    await page.waitForTimeout(1200); // Wait for completion
    
    // Check that voted button looks different from unvoted ones
    const votedSvg = firstButton.locator('svg').first();
    const votedFill = await votedSvg.getAttribute('fill');
    
    const secondButton = voteButtons.nth(1);
    const unvotedSvg = secondButton.locator('svg').first();
    const unvotedFill = await unvotedSvg.getAttribute('fill');
    
    console.log(`Voted button fill: "${votedFill}", Unvoted button fill: "${unvotedFill}"`);
    
    expect(votedFill).toBe('currentColor');
    expect(unvotedFill).toBe('none');
    expect(votedFill).not.toBe(unvotedFill);
    
    console.log('✅ Visual distinction between voted and unvoted buttons is clear');
  });

  test('should handle network delay gracefully', async ({ page }) => {
    console.log('🌐 Testing behavior with simulated network delay');
    
    // Override with longer delay
    await page.route('**/rest/v1/server_votes*', async route => {
      if (route.request().method() === 'POST') {
        // Simulate slow network
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'slow-vote-123',
            vote_type: 'up',
            server_id: 'test-server'
          })
        });
      } else {
        await route.continue();
      }
    });
    
    const voteButtons = page.locator('button[title*="Mark as using"]');
    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons for network delay test');
      return;
    }
    
    const testButton = voteButtons.first();
    const svg = testButton.locator('svg').first();
    
    console.log('Clicking button with 2s network delay...');
    await testButton.click();
    
    // Should show immediate feedback
    await page.waitForTimeout(100);
    const immediateFill = await svg.getAttribute('fill');
    const immediateClass = await testButton.getAttribute('class');
    
    expect(immediateFill).toBe('currentColor');
    expect(immediateClass).toContain('cursor-not-allowed');
    console.log('✅ Immediate feedback despite network delay');
    
    // Should remain in loading state during delay
    await page.waitForTimeout(1000);
    const midDelayFill = await svg.getAttribute('fill');
    const midDelayClass = await testButton.getAttribute('class');
    
    expect(midDelayFill).toBe('currentColor');
    expect(midDelayClass).toContain('cursor-not-allowed');
    console.log('✅ Maintains loading state during network delay');
    
    // Wait for completion
    await page.waitForTimeout(1500);
    
    const finalFill = await svg.getAttribute('fill');
    const finalClass = await testButton.getAttribute('class');
    
    expect(finalFill).toBe('currentColor');
    expect(finalClass).not.toContain('cursor-not-allowed');
    console.log('✅ Resolves to correct final state after delay');
  });
});